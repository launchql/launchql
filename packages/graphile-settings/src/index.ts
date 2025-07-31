import PgManyToMany from '@graphile-contrib/pg-many-to-many';
import { LaunchQLOptions } from '@launchql/types';
import { getEnvOptions } from '@launchql/env';
import PgPostgis from '@pyramation/postgis';
// @ts-ignore
import FulltextFilterPlugin from '@pyramation/postgraphile-plugin-fulltext-filter';
import { NodePlugin, Plugin } from 'graphile-build';
import {
  additionalGraphQLContextFromRequest as langAdditional,
  LangPlugin
  // @ts-ignore
} from 'graphile-i18n';
// @ts-ignore
import PgMetaschema from 'graphile-meta-schema';
// @ts-ignore
import PgSearch from 'graphile-search-plugin';
// @ts-ignore
import PgSimpleInflector from 'graphile-simple-inflector';
import { PostGraphileOptions } from 'postgraphile';
// @ts-ignore
import PostGraphileUploadFieldPlugin from 'postgraphile-derived-upload-field';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
// @ts-ignore
import PgPostgisFilter from 'postgraphile-plugin-connection-filter-postgis';

import LqlTypesPlugin from './plugins/types';
import { Uploader } from './resolvers/upload';

export const getGraphileSettings = (rawOpts: LaunchQLOptions): PostGraphileOptions => {
  const opts = getEnvOptions(rawOpts);

  const {
    server,
    graphile,
    features,
    cdn
  } = opts;

  // Instantiate uploader with merged cdn opts
  const uploader = new Uploader({
    bucketName: cdn.bucketName!,
    awsRegion: cdn.awsRegion!,
    awsAccessKey: cdn.awsAccessKey!,
    awsSecretKey: cdn.awsSecretKey!,
    minioEndpoint: cdn.minioEndpoint
  });

  const resolveUpload = uploader.resolveUpload.bind(uploader);

  const plugins: Plugin[] = [
    ConnectionFilterPlugin,
    FulltextFilterPlugin,
    LqlTypesPlugin,
    PostGraphileUploadFieldPlugin,
    PgMetaschema,
    PgManyToMany,
    PgSearch
  ];

  if (features?.postgis) {
    plugins.push(PgPostgis, PgPostgisFilter);
  }

  if (features?.simpleInflection) {
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
      pgSimplifyOppositeBaseNames: features?.oppositeBaseNames,
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
    port: server?.port,
    host: server?.host,
    schema: graphile?.schema,
    ignoreRBAC: false,
    legacyRelations: 'omit',
    showErrorStack: false,
    // @ts-ignore
    extendedErrors: false,
    disableQueryLog: false,
    includeExtensionResources: true,
    setofFunctionsContainNulls: false,
    retryOnInitFail: async (_error: Error) => {
      return false;
    },
    additionalGraphQLContextFromRequest: (req, res) => ({
      ...langAdditional(req, res),
      req,
      res
    })
  };
};
