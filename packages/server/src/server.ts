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
import { flush, flushService } from './middleware/flush';
import requestIp from 'request-ip';
import { Pool, PoolClient } from 'pg';

import { LaunchQLOptions, getEnvOptions } from '@launchql/types';

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
    const api = createApiMiddleware(opts);
    const authenticate = createAuthenticateMiddleware(opts);

    healthz(app);
    trustProxy(app, opts.server.trustProxy);
    app.use(poweredBy('launchql'));
    app.use(graphqlUploadExpress());
    app.use(parseDomains() as RequestHandler);
    app.use(requestIp.mw());
    app.use(api);
    app.use(cors as any);
    app.use(authenticate);
    app.use(graphile(opts));
    app.use(flush);

    this.app = app;
  }

  listen(): void {
    const { server } = this.opts;
    this.app.listen(server?.port, server?.host, () =>
      this.log(`listening at http://${server?.host}:${server?.port}`)
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
        console.log('schema:update', payload);
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
    console.log(text);
  }

  error(text: string, err?: unknown): void {
    console.error(text, err);
  }
}

export { Server };
