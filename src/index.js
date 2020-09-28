import express from 'express';
import { postgraphile } from 'postgraphile';
import { NodePlugin } from 'graphile-build';
// import { MutationPlugin } from 'graphile-build';
import PgMetaSchemaPlugin from './plugins/PgMetaSchemaPlugin';
import PgSimplifyInflectorPlugin from './plugins/PgSimplifyInflectorPlugin';
const app = express();

app.use(
  postgraphile('postgres://localhost:5432/mutation_example', 'public', {
    graphiql: true,
    enhanceGraphiql: true,
    enableCors: true,
    // skipPlugins: [NodePlugin],
    dynamicJson: true,
    appendPlugins: [PgSimplifyInflectorPlugin, PgMetaSchemaPlugin],
    graphileBuildOptions: {}
  })
);

export default app;
