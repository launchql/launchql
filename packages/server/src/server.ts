import {
  healthz,
  poweredBy,
  trustProxy,
  getRootPgPool
} from '@launchql/server-utils';

import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { middleware as parseDomains } from '@launchql/url-domains';
import express, { Express, RequestHandler } from 'express';
import { createAuthenticateMiddleware } from './middleware/auth';
import { graphile } from './middleware/graphile';
import { cors } from './middleware/cors';
import { createApiMiddleware } from './middleware/api';
import { createDirectSchemaMiddleware } from './middleware/directSchema';
import { flush, flushService } from './middleware/flush';
import requestIp from 'request-ip';
import { Pool, PoolClient } from 'pg';

import { LaunchQLOptions, getEnvOptions } from '@launchql/types';
import { Logger } from '@launchql/server-utils';

const log = new Logger('server');

export const LaunchQLServer = (rawOpts: LaunchQLOptions = {}) => {
  const app = new Server(getEnvOptions(rawOpts));
  app.addEventListener();
  app.listen();
};

class Server {
  private app: Express;
  private opts: LaunchQLOptions;

  constructor(opts: LaunchQLOptions) {
    this.opts = opts;
    
    const app = express();
    
    healthz(app);
    trustProxy(app, opts.server?.trustProxy);
    app.use(poweredBy('launchql'));
    app.use(graphqlUploadExpress());
    app.use(parseDomains() as RequestHandler);
    app.use(requestIp.mw());
    
    this.registerMiddleware(app);
    
    this.app = app;
  }
  
  private registerMiddleware(app: Express): void {
    const middlewareOpts = this.opts.server?.middleware || {};

    if (middlewareOpts.useMetaApi !== false) {
      const api = createApiMiddleware(this.opts);
      app.use(api);
    } else {
      const directSchema = createDirectSchemaMiddleware(this.opts);
      app.use(directSchema);
    }
    
    if (middlewareOpts.useCors !== false) {
      app.use(cors as any);
    }
    
    if (middlewareOpts.useAuth !== false) {
      const authenticate = createAuthenticateMiddleware(this.opts);
      app.use(authenticate);
    }
    
    if (middlewareOpts.useGraphile !== false) {
      const graphileMiddleware = graphile(this.opts);
      app.use(graphileMiddleware);
    }
    
    if (middlewareOpts.useFlush !== false) {
      app.use(flush);
    }
    
    if (Array.isArray(middlewareOpts.customMiddleware)) {
      middlewareOpts.customMiddleware.forEach((middleware, index) => {
        app.use(middleware);
      });
    }
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
    return getRootPgPool(this.opts.pg);
  }

  addEventListener(): void {
    const pgPool = this.getPool();
    pgPool.connect(this.listenForChanges.bind(this));
  }

  listenForChanges(err: Error | null, client: PoolClient, release: () => void): void {
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
