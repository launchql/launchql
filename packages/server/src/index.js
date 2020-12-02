import {
  cors,
  healthz,
  poweredBy,
  trustProxy,
  getRootPgPool
} from '@launchql/server-utils';

import env from './env';
import { graphqlUploadExpress } from 'graphql-upload';
import { middleware as parseDomains } from '@pyramation/url-domains';
import express from 'express';
import { authenticate } from './middleware/auth';
import { graphile } from './middleware/graphile';
import { api } from './middleware/api';
import { flush, flushService } from './middleware/flush';

export default ({
  simpleInflection = env.USE_SIMPLE_INFLECTION,
  oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
  port = env.SERVER_PORT,
  postgis = env.USE_POSTGIS,
  origin
} = {}) => {
  const app = new Server({
    simpleInflection,
    oppositeBaseNames,
    port,
    postgis,
    origin
  });
  app.addEventListener();
  app.listen();
};

const middleware = {
  authenticate,
  graphile,
  api
};

class Server {
  constructor({
    simpleInflection = env.USE_SIMPLE_INFLECTION,
    oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
    port = env.SERVER_PORT,
    postgis = env.USE_POSTGIS,
    origin,
    appendPlugins = [],
    overrideSettings = {},
    graphileBuildOptions = {}
  }) {
    this.port = port;

    const app = express();

    healthz(app, origin);
    cors(app, origin);
    trustProxy(app, env);
    app.use(poweredBy('launchql'));
    app.use(graphqlUploadExpress());
    app.use(parseDomains());
    app.use(api);
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
  listen() {
    this.app.listen(this.port, env.SERVER_HOST, () =>
      this.log(`listening at http://${env.SERVER_HOST}:${this.port}`)
    );
  }
  async flush(svcName) {
    await flushService(svcName);
  }
  getPool() {
    return getRootPgPool(env.PGDATABASE);
  }
  addEventListener() {
    const pgPool = this.getPool();
    pgPool.connect(this.listenForChanges.bind(this));
  }
  listenForChanges(err, client, release) {
    if (err) {
      this.error('Error connecting with notify listener', err);
      // Try again in 5 seconds
      setTimeout(this.addEventListener, 5000);
      return;
    }
    client.on('notification', (args) => {
      const { channel, payload } = args;
      if (channel === 'schema:update') {
        this.flush(payload);
      }
    });
    client.query('LISTEN "schema:update"');
    client.on('error', (e) => {
      this.error('Error with database notify listener', e);
      release();
      this.addEventListener();
    });
    this.log(`connected and listening for changes...`);
  }
  log(text) {
    console.log(text);
  }
  error(text) {
    console.error(text);
  }
}

export { middleware, Server };
