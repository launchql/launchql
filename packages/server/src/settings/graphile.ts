// @ts-nocheck
import { env } from '../env';
import { NodePlugin, Plugin } from 'graphile-build';
import PgSimpleInflector from 'graphile-simple-inflector';
import PgMetaschema from 'graphile-meta-schema';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import FulltextFilterPlugin from '@pyramation/postgraphile-plugin-fulltext-filter';
import PostGraphileUploadFieldPlugin from 'postgraphile-derived-upload-field';
import {
  LangPlugin,
  additionalGraphQLContextFromRequest as langAdditional
} from 'graphile-i18n';
import PgPostgis from '@pyramation/postgis';
import PgPostgisFilter from 'postgraphile-plugin-connection-filter-postgis';
import PgManyToMany from '@graphile-contrib/pg-many-to-many';
import PgSearch from 'graphile-search-plugin';
import LqlTypesPlugin from '../plugins/types';
// import resolveUpload from './resolvers/uploads';

interface GraphileSettingsInput {
  host?: string;
  port?: number;
  schema: string | string[];
  simpleInflection?: boolean;
  oppositeBaseNames?: boolean;
  postgis?: boolean;
}

export const getGraphileSettings = ({
  host,
  port,
  schema,
  simpleInflection = true,
  oppositeBaseNames = false,
  postgis = true
}: GraphileSettingsInput) => {
  const plugins: Plugin[] = [
    ConnectionFilterPlugin,
    FulltextFilterPlugin,
    LqlTypesPlugin,
    PostGraphileUploadFieldPlugin,
    PgMetaschema,
    PgManyToMany,
    PgSearch
  ];

  if (postgis) {
    plugins.push(PgPostgis, PgPostgisFilter);
  }

  if (simpleInflection) {
    plugins.push(PgSimpleInflector);
  }

  plugins.push(LangPlugin);

  return {
    graphileBuildOptions: {
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
      pgSimplifyOppositeBaseNames: oppositeBaseNames,
      connectionFilterComputedColumns: false
    },
    appendPlugins: plugins,
    skipPlugins: [NodePlugin],
    dynamicJson: true,
    disableGraphiql: false,
    enhanceGraphiql: true,
    enableQueryBatching: true,
    graphiql: true,
    watch: false,
    port,
    host,
    schema,
    ignoreRBAC: false,
    legacyRelations: 'omit',
    showErrorStack: false,
    extendedErrors: false,
    disableQueryLog: false,
    includeExtensionResources: true,
    setofFunctionsContainNulls: false,
    retryOnInitFail: async (error: Error) => {
      return false;
    },
    additionalGraphQLContextFromRequest: (req, res) => ({
      ...langAdditional(req, res),
      req,
      res,
      env
    })
  };
};
