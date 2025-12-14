import 'dotenv/config';

import { getEnvOptions } from '@launchql/env';
import { Logger } from '@pgpmjs/logger';
import { healthz, poweredBy, trustProxy } from '@pgpmjs/server-utils';
import { PgpmOptions } from '@pgpmjs/types';
import { middleware as parseDomains } from '@launchql/url-domains';
import express, { Express, RequestHandler } from 'express';
// @ts-ignore
import graphqlUpload from 'graphql-upload';
import { Pool, PoolClient } from 'pg';
import { getPgPool } from 'pg-cache';
import requestIp from 'request-ip';

import { createApiMiddleware } from './middleware/api';
import { createAuthenticateMiddleware } from './middleware/auth';
import { cors } from './middleware/cors';
import { flush, flushService } from './middleware/flush';
import { graphile } from './middleware/graphile';

const log = new Logger('server');

export const LaunchQLServer = (rawOpts: PgpmOptions = {}) => {
  const launchqlEnvOptions = getEnvOptions(rawOpts);
  const app = new Server(launchqlEnvOptions);
  app.addEventListener();
  app.listen();
};

class Server {
  private app: Express;
  private opts: PgpmOptions;

  constructor(opts: PgpmOptions) {
    this.opts = getEnvOptions(opts);

    const app = express();
    const api = createApiMiddleware(opts);
    const authenticate = createAuthenticateMiddleware(opts);

    healthz(app);
    trustProxy(app, opts.server.trustProxy);
    // Warn if a global CORS override is set in production
    const fallbackOrigin = opts.server?.origin?.trim();
    if (fallbackOrigin && process.env.NODE_ENV === 'production') {
      if (fallbackOrigin === '*') {
        log.warn('CORS wildcard ("*") is enabled in production; this effectively disables CORS and is not recommended. Prefer per-API CORS via meta schema.');
      } else {
        log.warn(`CORS override origin set to ${fallbackOrigin} in production. Prefer per-API CORS via meta schema.`);
      }
    }
    
    app.use(poweredBy('launchql'));
    app.use(cors(fallbackOrigin));
    app.use(graphqlUpload.graphqlUploadExpress());
    app.use(parseDomains() as RequestHandler);
    app.use(requestIp.mw());
    app.use(api);
    app.use(authenticate);
    app.use(graphile(opts));
    app.use(flush);

    this.app = app;
  }

  listen(): void {
    const { server } = this.opts;
    this.app.listen(server?.port, server?.host, () =>
      log.info(`listening at http://${server?.host}:${server?.port}`)
    );
  }

  async flush(databaseId: string): Promise<void> {
    await flushService(this.opts, databaseId);
  }

  getPool(): Pool {
    return getPgPool(this.opts.pg);
  }

  addEventListener(): void {
    const pgPool = this.getPool();
    pgPool.connect(this.listenForChanges.bind(this));
  }

  listenForChanges(
    err: Error | null,
    client: PoolClient,
    release: () => void
  ): void {
    if (err) {
      this.error('Error connecting with notify listener', err);
      setTimeout(() => this.addEventListener(), 5000);
      return;
    }

    client.on('notification', ({ channel, payload }) => {
      if (channel === 'schema:update' && payload) {
        log.info('schema:update', payload);
        this.flush(payload);
      }
    });

    client.query('LISTEN "schema:update"');

    client.on('error', (e) => {
      this.error('Error with database notify listener', e);
      release();
      this.addEventListener();
    });

    this.log('connected and listening for changes...');
  }

  log(text: string): void {
    log.info(text);
  }

  error(text: string, err?: unknown): void {
    log.error(text, err);
  }
}

export { Server };
