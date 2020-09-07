import express from 'express';
import bodyParser from 'body-parser';
import poolManager from '@launchql/job-pg';
import { getGraphileSettings } from './graphile';
import { postgraphile } from '@pyramation/postgraphile';
import env from './env';

export default (pgPool = poolManager.getPool()) => {
  const app = express();
  app.use(bodyParser.json());

  const graphileOpts = {
    ...getGraphileSettings({
      schema: env.JOBS_SCHEMA
    }),
    graphqlRoute: '/graphql',
    graphiqlRoute: '/graphiql'
  };

  app.use(postgraphile(pgPool, graphileOpts.schema, graphileOpts));

  app.use((error, req, res, next) => {
    // TODO check headers for jobId and call fail?
    res.status(500).json({ error });
  });

  return app;
};
