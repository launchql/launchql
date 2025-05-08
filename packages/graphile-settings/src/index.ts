import { env } from './env';
import { NodePlugin, Plugin } from 'graphile-build';
// @ts-ignore
import PgSimpleInflector from 'graphile-simple-inflector';
// @ts-ignore
import PgMetaschema from 'graphile-meta-schema';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
// @ts-ignore
import FulltextFilterPlugin from '@pyramation/postgraphile-plugin-fulltext-filter';
// @ts-ignore
import PostGraphileUploadFieldPlugin from 'postgraphile-derived-upload-field';
import {
  LangPlugin,
  additionalGraphQLContextFromRequest as langAdditional
  // @ts-ignore
} from 'graphile-i18n';
import PgPostgis from '@pyramation/postgis';
// @ts-ignore
import PgPostgisFilter from 'postgraphile-plugin-connection-filter-postgis';
import PgManyToMany from '@graphile-contrib/pg-many-to-many';
// @ts-ignore
import PgSearch from 'graphile-search-plugin';
import LqlTypesPlugin from './plugins/types';
import resolveUpload from './resolvers/upload';
import { PostGraphileOptions } from 'postgraphile';

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
}: GraphileSettingsInput): PostGraphileOptions => {
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
    // @ts-ignore
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
