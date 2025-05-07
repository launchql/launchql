import express from 'express';
import { postgraphile } from 'postgraphile';
import { env } from './env';

const app = express();

const schemas = env.SCHEMAS.split(',').map(s => s.trim());

app.use(
  postgraphile(env.DATABASE_URL, schemas, {
    watchPg: env.isDev,
    graphiql: env.isDev,
    enhanceGraphiql: true,
    dynamicJson: true,
  })
);

export default app;
