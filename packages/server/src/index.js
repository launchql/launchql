import { cors, healthz, poweredBy, trustProxy } from '@launchql/server-utils';
import env from './env';
import { graphqlUploadExpress } from 'graphql-upload';
import { middleware as parseDomains } from '@pyramation/url-domains';
import express from 'express';
import { authenticate } from './middleware/auth';
import { graphile, getGraphileInstanceObj } from './middleware/graphile';
import { service } from './middleware/service';
import { flush } from './middleware/flush';

export default ({
  simpleInflection = env.USE_SIMPLE_INFLECTION,
  oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
  port = env.SERVER_PORT,
  postgis = env.USE_POSTGIS,
  origin
} = {}) => {
  const app = express();

  const getGraphile = getGraphileInstanceObj({
    simpleInflection,
    oppositeBaseNames,
    port,
    postgis
  });

  healthz(app, origin);
  cors(app, origin);
  trustProxy(app, env);
  app.use(parseDomains());
  app.use(poweredBy('launchql'));
  app.use(graphqlUploadExpress());

  app.use(service);
  app.use(authenticate);
  app.use(graphile(getGraphile));
  app.use(flush);

  app.listen(port, env.SERVER_HOST, () =>
    console.log(`app listening at http://${env.SERVER_HOST}:${port}`)
  );
};
