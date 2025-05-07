import express, { Express } from 'express';
// import { graphqlUploadExpress } from 'graphql-upload';
import { middleware as parseDomains } from './for-npm/url-domains'
import requestIp from 'request-ip';

import { env } from './env';
// import { authenticate } from './middleware/auth';
import { graphile } from './middleware/graphile';
import { cors } from './middleware/cors';
// import { api } from './middleware/api';
// import { flush, flushService } from './middleware/flush';

import {
  getRootPgPool
} from './utils/pg';

import {
  healthz,
} from './middleware/healthz';

import {
  poweredBy,
  trustProxy,
} from './middleware/headers';

// const middleware = {
//   authenticate,
//   graphile,
//   api
// };

interface ServerOptions {
  simpleInflection?: boolean;
  oppositeBaseNames?: boolean;
  port?: number;
  postgis?: boolean;
  appendPlugins?: any[];
  overrideSettings?: Record<string, any>;
  graphileBuildOptions?: Record<string, any>;
}

export class Server {
  app: Express;
  port: number;

  constructor({
    simpleInflection = env.USE_SIMPLE_INFLECTION,
    oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
    port = env.SERVER_PORT,
    postgis = env.USE_POSTGIS,
    appendPlugins = [],
    overrideSettings = {},
    graphileBuildOptions = {}
  }: ServerOptions = {}) {
    this.port = port;
    const app = express();

    // Base middleware
    healthz(app);
    // @ts-ignore
    trustProxy(app, env);
    app.use(poweredBy('launchql'));
    // app.use(graphqlUploadExpress());
    app.use(parseDomains());
    app.use(requestIp.mw());
    
    // App-specific middleware
    // app.use(api);
    // @ts-ignore
    // app.use(cors);
    // app.use(authenticate);
    app.use(
      // @ts-ignore
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
    // app.use(flush);

    this.app = app;
  }

  listen(): void {
    this.app.listen(this.port, env.SERVER_HOST, () => {
      this.log(`✅ Listening at http://${env.SERVER_HOST}:${this.port}`);
    });
  }

  async flush(databaseId: string): Promise<void> {
    try {
      // await flushService(databaseId);
    } catch (err) {
      this.error(`Failed to flush for DB ${databaseId}:`, err);
    }
  }

  getPool() {
    return getRootPgPool(env.PGDATABASE);
  }

  addEventListener(): void {
    const pgPool = this.getPool();
    pgPool.connect(this.listenForChanges.bind(this));
  }

  listenForChanges(err: Error | null, client: any, release: () => void): void {
    if (err) {
      this.error('❌ Error connecting to pg_notify listener:', err);
      setTimeout(() => this.addEventListener(), 5000);
      return;
    }

    client.on('notification', (msg: { channel: string; payload?: string }) => {
      const { channel, payload } = msg;
      if (channel === 'schema:update' && payload) {
        this.log(`🔁 schema:update → ${payload}`);
        this.flush(payload);
      }
    });

    client.query('LISTEN "schema:update"');

    client.on('error', (e: Error) => {
      this.error('❌ pg_notify client error:', e);
      release();
      this.addEventListener();
    });

    this.log('🔊 Listening for schema:update events...');
  }

  log(...args: any[]): void {
    console.log('[Server]', ...args);
  }

  error(...args: any[]): void {
    console.error('[Server Error]', ...args);
  }
}

export default (options?: ServerOptions) => {
  const app = new Server(options);
  app.addEventListener();
  app.listen();
};

// export { middleware };
