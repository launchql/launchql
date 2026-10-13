import { createCsrfMiddleware } from '@constructive-io/csrf';
import type { RefusalRecorder } from '@constructive-io/express-context';
import { createContextMiddleware, createDefaultRegistry, requestIdMiddleware } from '@constructive-io/express-context';
import { getEnvOptions } from '@constructive-io/graphql-env';
import type { ConstructiveOptions } from '@constructive-io/graphql-types';
import { middleware as parseDomains } from '@constructive-io/url-domains';
import { Logger } from '@pgpmjs/logger';
import { healthz, poweredBy, svcCache, trustProxy } from '@pgpmjs/server-utils';
import { PgpmOptions } from '@pgpmjs/types';
import cookieParser from 'cookie-parser';
import express, { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { closeAllCaches,graphileCache } from 'graphile-cache';
import graphqlUpload from 'graphql-upload';
import type { Server as HttpServer } from 'http';
import { Pool, PoolClient } from 'pg';
import { getPgPool } from 'pg-cache';
import requestIp from 'request-ip';

import { createAgenticRouter } from './agentic';
import { closeDebugDatabasePools } from './diagnostics/debug-db-snapshot';
import type { DebugSamplerHandle } from './diagnostics/debug-sampler';
import { startDebugSampler } from './diagnostics/debug-sampler';
import {
  isDevelopmentObservabilityMode,
  isGraphqlObservabilityEnabled,
  isGraphqlObservabilityRequested,
  isLoopbackHost
} from './diagnostics/observability';
import { createAdmissionControlMiddleware } from './middleware/admission-control';
import { createApiMiddleware } from './middleware/api';
import { createAuthenticateMiddleware } from './middleware/auth';
// Auth cookie handling is done via AuthCookiePlugin in grafserv
import { createCaptchaMiddleware } from './middleware/captcha';
import { parseCookieValue, SESSION_COOKIE_NAME } from './middleware/cookie';
import { cors } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { favicon } from './middleware/favicon';
import { createFlushMiddleware, flushService } from './middleware/flush';
import { createFnRouter } from './middleware/fn';
import { graphile } from './middleware/graphile';
import { createWebauthnRouter } from './middleware/webauthn';
import { multipartBridge } from './middleware/multipart-bridge';
import { createDebugDatabaseMiddleware } from './middleware/observability/debug-db';
import { debugMemory } from './middleware/observability/debug-memory';
import { localObservabilityOnly } from './middleware/observability/guard';
import { createRequestLogger } from './middleware/observability/request-logger';
import { createRequestProtectionMiddleware } from './middleware/request-protection';
import { getRoutingSchema } from './middleware/routing';
import { createStandingMiddleware } from './middleware/standing';
import { createPlatformRefusalRecorder, installRefusalRecorder } from './refusals/recorder';

const log = new Logger('server');

/**
 * Creates and starts a GraphQL server instance
 *
 * Accepts ConstructiveOptions or PgpmOptions.
 * Options are normalized using normalizeServerOptions to apply defaults.
 *
 * @param rawOpts - Server configuration options
 * @returns void (server runs until shutdown)
 *
 * @example
 * ```typescript
 * // Using ConstructiveOptions (recommended)
 * GraphQLServer({
 *   pg: { database: 'myapp' },
 *   server: { port: 4000 }
 * });
 *
 * // Using PgpmOptions
 * GraphQLServer(pgpmOptions);
 * ```
 */
export const GraphQLServer = (rawOpts: ConstructiveOptions | PgpmOptions = {}) => {
  const opts = getEnvOptions(rawOpts);
  const app = new Server(opts);
  app.addEventListener();
  app.listen();
};

class Server {
  private app: Express;
  private opts: ConstructiveOptions;
  private listenClient: PoolClient | null = null;
  private listenRelease: (() => void) | null = null;
  private shuttingDown = false;
  private closed = false;
  private httpServer: HttpServer | null = null;
  private debugSampler: DebugSamplerHandle | null = null;
  private refusalRecorder: RefusalRecorder | null = null;

  constructor(opts: ConstructiveOptions) {
    this.opts = getEnvOptions(opts);
    const effectiveOpts = this.opts;
    const observabilityRequested = isGraphqlObservabilityRequested();
    const observabilityEnabled = isGraphqlObservabilityEnabled(effectiveOpts.server?.host);

    const app = express();
    const api = createApiMiddleware(effectiveOpts);
    const authenticate = createAuthenticateMiddleware(effectiveOpts);
    const requestLogger = createRequestLogger({ observabilityEnabled });

    // Log startup configuration (non-sensitive values only)
    const apiOpts = (effectiveOpts as any).api || {};
    log.info('[server] Starting with config:', {
      database: effectiveOpts.pg?.database,
      host: effectiveOpts.pg?.host,
      port: effectiveOpts.pg?.port,
      serverHost: effectiveOpts.server?.host,
      serverPort: effectiveOpts.server?.port,
      apiIsPublic: apiOpts.isPublic,
      routingSchema: apiOpts.routingSchema,
      metaSchemas: apiOpts.metaSchemas?.join(',') || 'default',
      observabilityEnabled
    });

    if (observabilityRequested && !observabilityEnabled) {
      const reasons = [];
      if (!isDevelopmentObservabilityMode()) {
        reasons.push('NODE_ENV must be development');
      }
      if (!isLoopbackHost(effectiveOpts.server?.host)) {
        reasons.push('server host must be localhost, 127.0.0.1, or ::1');
      }

      log.warn(
        `GRAPHQL_OBSERVABILITY_ENABLED was requested but observability remains disabled${
          reasons.length > 0 ? `: ${reasons.join('; ')}` : ''
        }`
      );
    }

    healthz(app);
    if (observabilityEnabled) {
      app.get('/debug/memory', localObservabilityOnly, debugMemory);
      app.get('/debug/db', localObservabilityOnly, createDebugDatabaseMiddleware(effectiveOpts));
    } else {
      app.use('/debug', (_req, res) => {
        res.status(404).send('Not found');
      });
    }
    app.use(favicon);
    trustProxy(app, effectiveOpts.server.trustProxy);
    // Warn if a global CORS override is set in production
    const fallbackOrigin = effectiveOpts.server?.origin?.trim();
    if (fallbackOrigin && process.env.NODE_ENV === 'production') {
      if (fallbackOrigin === '*') {
        log.warn(
          'CORS wildcard ("*") is enabled in production; this effectively disables CORS and is not recommended. Prefer per-API CORS via meta schema.'
        );
      } else {
        log.warn(`CORS override origin set to ${fallbackOrigin} in production. Prefer per-API CORS via meta schema.`);
      }
    }

    app.use(poweredBy('constructive'));
    app.use(cookieParser());
    app.use(cors(fallbackOrigin));
    app.use('/graphql', graphqlUpload.graphqlUploadExpress({
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 10
    }));

    // Rewrite Content-Type after graphql-upload so grafserv accepts the request
    app.use('/graphql', multipartBridge);
    app.use(parseDomains() as RequestHandler);
    app.use(requestIp.mw());
    app.use(requestIdMiddleware());
    app.use(requestLogger);
    app.use(api);
    app.use(authenticate);
    app.use(createContextMiddleware({
      pg: effectiveOpts.pg,
      loaders: createDefaultRegistry(),
      routingSchema: getRoutingSchema(effectiveOpts)
    }));
    // A suspended (or unknown) database is refused before anything is spent on
    // the request; billing and platform admins set that state, the loader reads it.
    app.use(createStandingMiddleware());
    // Resolve the tenant's protection bounds before anything can spend budget
    // on the request (and before the GraphQL handler reads them for pgSettings).
    app.use(createRequestProtectionMiddleware());
    // Spend the width and rate bounds the line above resolved, before a
    // request can take a pool connection. Scoped to /graphql rather than
    // mounted globally because a concurrency slot is held for as long as the
    // handler runs: the SSE routes below are long-lived by design and would
    // sit in the budget for the life of the stream. The other lanes need
    // their own bound sized for streaming, not this one.
    app.use('/graphql', createAdmissionControlMiddleware());
    app.use(createCaptchaMiddleware());

    // CSRF protection for cookie-authenticated requests
    // Skip CSRF for Bearer token auth (not vulnerable to CSRF) and anonymous requests
    const csrf = createCsrfMiddleware({
      cookieOptions: {
        httpOnly: false, // SPA clients need to read this via document.cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      }
    });
    const csrfProtect: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
      // Skip CSRF for Bearer token auth
      const auth = req.headers.authorization;
      if (auth?.toLowerCase().startsWith('bearer ')) {
        return next();
      }
      // Skip if no session cookie (anonymous requests)
      const sessionCookie = parseCookieValue(req, SESSION_COOKIE_NAME);
      if (!sessionCookie) {
        return next();
      }
      // Apply CSRF protection for cookie-authenticated requests
      csrf.protect(req as any, res as any, next);
    };
    const csrfSetToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
      csrf.setToken(req as any, res as any, next);
    };
    app.use(csrfSetToken); // Set CSRF token cookie on all requests
    app.use('/graphql', csrfProtect); // Enforce CSRF on GraphQL mutations

    // LLM Agent REST API — mounted before graphile so SSE streaming
    // routes are handled without going through PostGraphile
    app.use(createAgenticRouter());

    // REST function invocation routes (POST /fn/:alias, GET /fn/invocations/:id)
    app.use(createFnRouter());

    // WebAuthn/Passkey REST routes
    app.use(createWebauthnRouter());

    app.use(graphile(effectiveOpts));
    app.use(createFlushMiddleware(effectiveOpts));

    // Error handling - MUST be LAST
    app.use(notFoundHandler); // Catches unmatched routes (404)
    app.use(errorHandler); // Catches all thrown errors

    this.app = app;
    this.debugSampler = observabilityEnabled ? startDebugSampler(effectiveOpts) : null;

    // Refusals are counted in memory by the middleware above and flushed to
    // the platform table on a timer; the request path never touches the pool.
    this.refusalRecorder = createPlatformRefusalRecorder(effectiveOpts);
    installRefusalRecorder(this.refusalRecorder);
    this.refusalRecorder.start();
  }

  listen(): HttpServer {
    const { server } = this.opts;
    const httpServer = this.app.listen(server?.port, server?.host, () =>
      log.info(`listening at http://${server?.host}:${server?.port}`)
    );

    httpServer.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        this.error(`Port ${server?.port ?? 'unknown'} is already in use`, err);
      } else {
        this.error('Server failed to start', err);
      }
      throw err;
    });

    this.httpServer = httpServer;
    return httpServer;
  }

  async flush(databaseId: string): Promise<void> {
    await flushService(this.opts, databaseId);
  }

  getPool(): Pool {
    return getPgPool(this.opts.pg);
  }

  addEventListener(): void {
    if (this.shuttingDown) return;
    const pgPool = this.getPool();
    pgPool.connect(this.listenForChanges.bind(this));
  }

  listenForChanges(err: Error | null, client: PoolClient, release: () => void): void {
    if (err) {
      this.error('Error connecting with notify listener', err);
      if (!this.shuttingDown) {
        setTimeout(() => this.addEventListener(), 5000);
      }
      return;
    }

    if (this.shuttingDown) {
      release();
      return;
    }

    this.listenClient = client;
    this.listenRelease = release;

    // Attached before any query is issued: an 'error' event on a Client with no
    // listener is rethrown by Node and takes the whole process down.
    client.on('error', (e) => {
      this.dropListener(client, 'Error with database notify listener', e);
    });

    client.on('notification', ({ channel, payload }) => {
      if (channel === 'schema:update' && payload) {
        log.info('schema:update', payload);
        this.flush(payload);
      }
    });

    client.query('LISTEN "schema:update"').catch((e) => {
      this.dropListener(client, 'Failed to LISTEN for schema:update', e);
    });

    this.log('connected and listening for changes...');
  }

  private dropListener(client: PoolClient, message: string, err: unknown): void {
    // Another path (shutdown, an earlier failure) already tore this client down.
    if (this.listenClient !== client) return;

    const release = this.listenRelease;
    this.listenClient = null;
    this.listenRelease = null;
    client.removeAllListeners('notification');
    client.removeAllListeners('error');

    if (this.shuttingDown) {
      release?.();
      return;
    }

    this.error(message, err);
    release?.();
    this.addEventListener();
  }

  async removeEventListener(): Promise<void> {
    if (!this.listenClient || !this.listenRelease) {
      return;
    }

    const client = this.listenClient;
    const release = this.listenRelease;
    this.listenClient = null;
    this.listenRelease = null;

    client.removeAllListeners('notification');
    client.removeAllListeners('error');

    try {
      await client.query('UNLISTEN "schema:update"');
    } catch {
      // Ignore listener cleanup errors during shutdown.
    }

    release();
  }

  async close(opts: { closeCaches?: boolean } = {}): Promise<void> {
    const { closeCaches = false } = opts;
    if (this.closed) {
      if (closeCaches) {
        await Server.closeCaches({ closePools: true });
      }
      return;
    }
    this.closed = true;
    this.shuttingDown = true;
    await this.removeEventListener();
    if (this.refusalRecorder) {
      installRefusalRecorder(null);
      await this.refusalRecorder.stop();
      this.refusalRecorder = null;
    }
    if (this.debugSampler) {
      await this.debugSampler.stop();
      this.debugSampler = null;
    }
    if (this.httpServer?.listening) {
      await new Promise<void>((resolve) => this.httpServer!.close(() => resolve()));
    }
    await closeDebugDatabasePools();
    if (closeCaches) {
      await Server.closeCaches({ closePools: true });
    }
  }

  static async closeCaches(opts: { closePools?: boolean } = {}): Promise<void> {
    const { closePools = false } = opts;
    svcCache.clear();
    // Use closeAllCaches to properly await async disposal of PostGraphile instances
    // before closing pg pools - this ensures all connections are released
    if (closePools) {
      await closeAllCaches();
    } else {
      graphileCache.clear();
    }
  }

  log(text: string): void {
    log.info(text);
  }

  error(text: string, err?: unknown): void {
    log.error(text, err);
  }
}

export { Server };
