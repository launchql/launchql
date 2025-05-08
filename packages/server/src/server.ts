import {
  healthz,
  poweredBy,
  trustProxy,
  getRootPgPool
} from '@launchql/server-utils';

import { env } from './env';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { middleware as parseDomains } from '@launchql/url-domains';
import express, { Express, RequestHandler } from 'express';
import { authenticate } from './middleware/auth';
import { graphile } from './middleware/graphile';
import { cors } from './middleware/cors';
import { api } from './middleware/api';
import { flush, flushService } from './middleware/flush';
import requestIp from 'request-ip';
import { Pool, PoolClient } from 'pg';

interface ServerOptions {
  simpleInflection?: boolean;
  oppositeBaseNames?: boolean;
  port?: number;
  postgis?: boolean;
  appendPlugins?: any[];
  overrideSettings?: Record<string, any>;
  graphileBuildOptions?: Record<string, any>;
}

export default ({
  simpleInflection = env.USE_SIMPLE_INFLECTION,
  oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
  port = env.SERVER_PORT,
  postgis = env.USE_POSTGIS
}: ServerOptions = {}) => {
  const app = new Server({
    simpleInflection,
    oppositeBaseNames,
    port,
    postgis
  });
  app.addEventListener();
  app.listen();
};

// const middleware = {
//   authenticate,
//   graphile,
//   api
// };

class Server {
  private app: Express;
  private port: number;

  constructor({
    simpleInflection = env.USE_SIMPLE_INFLECTION,
    oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
    port = env.SERVER_PORT,
    postgis = env.USE_POSTGIS,
    appendPlugins = [],
    overrideSettings = {},
    graphileBuildOptions = {}
  }: ServerOptions = {}) {
    this.port = port!;

    const app = express();

    healthz(app);
    // @ts-ignore
    trustProxy(app, env);
    app.use(poweredBy('launchql'));
    app.use(graphqlUploadExpress());

    // app.use(parseDomains() as RequestHandler);
    
    app.use((req, res, next) => {
      // TypeScript will complain, so you can either cast req to any...
      (req as any).urlDomains = {
        hostname: 'localhost',
        subdomains: ['api'],
        domain: 'localhost'
      };
    
      next();
    });
    
    app.use(requestIp.mw());
    
    app.use(api);
    // @ts-ignore
    app.use(cors);
    app.use(authenticate);
    app.use(
      graphile({
        simpleInflection,
        oppositeBaseNames,
        port,
        postgis,
        appendPlugins,
        overrideSettings,
        graphileBuildOptions
      })
    );
    app.use(flush);
    this.app = app;
  }

  listen(): void {
    this.app.listen(this.port, env.SERVER_HOST, () =>
      this.log(`listening at http://${env.SERVER_HOST}:${this.port}`)
    );
  }

  async flush(databaseId: string): Promise<void> {
    await flushService(databaseId);
  }

  getPool(): Pool {
    return getRootPgPool(env.PGDATABASE);
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

    client.on('notification', (args: { channel: string; payload?: string }) => {
      const { channel, payload } = args;
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

// export { middleware, Server };
export { Server };
