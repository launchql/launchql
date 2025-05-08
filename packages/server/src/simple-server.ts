import express from 'express';
import { postgraphile } from 'postgraphile';
import { NodePlugin, Plugin } from 'graphile-build';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import PgPostgis from '@pyramation/postgis';
import PgManyToMany from '@graphile-contrib/pg-many-to-many';

// @ts-ignore
import PgSimpleInflector from 'graphile-simple-inflector';
// @ts-ignore
import PgMetaschema from 'graphile-meta-schema';
// @ts-ignore
import FulltextFilterPlugin from '@pyramation/postgraphile-plugin-fulltext-filter';
// @ts-ignore
import PostGraphileUploadFieldPlugin from 'postgraphile-derived-upload-field';
// @ts-ignore
import { LangPlugin, additionalGraphQLContextFromRequest as langAdditional } from 'graphile-i18n';
// @ts-ignore
import PgPostgisFilter from 'postgraphile-plugin-connection-filter-postgis';
// @ts-ignore
import PgSearch from 'graphile-search-plugin';

import dotenv from 'dotenv';

import type { Request, Response } from 'express';

const additionalGraphQLContextFromRequest = (
    req: Request,
    res: Response
  ) => ({
    ...langAdditional(req, res),
    req,
    res,
    env: process.env
  });

dotenv.config();

// Inline resolver for uploads
const resolveUpload = async (input: any) => {
  // Implement your actual file handling logic here.
  return { success: true, input };
};

const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/dashboard';

const schema = ['dashboard_public'];
const simpleInflection = true;
const oppositeBaseNames = false;
const postgis = true;

const plugins: Plugin[] = [
  ConnectionFilterPlugin,
  FulltextFilterPlugin,
  PostGraphileUploadFieldPlugin,
  PgMetaschema,
  PgManyToMany,
  PgSearch
];

const options: any = {
    appendPlugins: plugins,
    skipPlugins: [NodePlugin],
    dynamicJson: true,
    disableGraphiql: false,
    enhanceGraphiql: true,
    enableQueryBatching: true,
    graphiql: true,
    watch: false,
    schema,
    legacyRelations: 'omit',
    showErrorStack: false,
    extendedErrors: false,
    disableQueryLog: false,
    includeExtensionResources: true,
    setofFunctionsContainNulls: false,
    pgSimplifyOppositeBaseNames: oppositeBaseNames,
    connectionFilterComputedColumns: false,
    uploadFieldDefinitions: [
      {
        name: 'upload',
        namespaceName: 'public',
        type: 'JSON',
        resolve: resolveUpload
      },
      {
        name: 'attachment',
        namespaceName: 'public',
        type: 'String',
        resolve: resolveUpload
      },
      {
        name: 'image',
        namespaceName: 'public',
        type: 'JSON',
        resolve: resolveUpload
      },
      {
        tag: 'upload',
        resolve: resolveUpload
      }
    ],
    retryOnInitFail: async (error: Error) => {
      return false;
    },
    additionalGraphQLContextFromRequest
  };

if (postgis) {
  plugins.push(PgPostgis, PgPostgisFilter);
}

if (simpleInflection) {
  plugins.push(PgSimpleInflector);
}

plugins.push(LangPlugin);

app.use(
  postgraphile(DATABASE_URL, schema, {
    graphiql: true,
    enhanceGraphiql: true
  })
);

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphiql`);
});

console.log(process.env.PGUSER);
console.log(process.env.PGHOST);
console.log(process.env.PGPORT);
console.log(process.env.PGPASSORD);
console.log(process.env.DATABASE_URL);