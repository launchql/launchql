import PgManyToMany from '@graphile-contrib/pg-many-to-many';
import { getEnvOptions } from '@launchql/env';
import { LaunchQLOptions } from '@launchql/types';
import PgPostgis from 'graphile-postgis';
import FulltextFilterPlugin from 'graphile-plugin-fulltext-filter';
import { NodePlugin, Plugin } from 'graphile-build';
import {
  additionalGraphQLContextFromRequest as langAdditional,
  LangPlugin
} from 'graphile-i18n';
import PgMetaschema from 'graphile-meta-schema';
import PgSearch from 'graphile-search-plugin';
import PgSimpleInflector from 'graphile-simple-inflector';
import { PostGraphileOptions } from 'postgraphile';
import ConnectionFilterPlugin from 'graphile-plugin-connection-filter';
import PgPostgisFilter from 'graphile-plugin-connection-filter-postgis';

import CustomPgTypeMappingsPlugin from 'graphile-pg-type-mappings';
import UploadPostGraphilePlugin, { Uploader } from 'graphile-upload-plugin';

export const getGraphileSettings = (
  rawOpts: LaunchQLOptions
): PostGraphileOptions => {
  const opts = getEnvOptions(rawOpts);

  const { server, graphile, features, cdn } = opts;

  // Instantiate uploader with merged cdn opts
  const uploader = new Uploader({
    bucketName: cdn.bucketName!,
    awsRegion: cdn.awsRegion!,
    awsAccessKey: cdn.awsAccessKey!,
    awsSecretKey: cdn.awsSecretKey!,
    minioEndpoint: cdn.minioEndpoint,
  });

  const resolveUpload = uploader.resolveUpload.bind(uploader);

  const plugins: Plugin[] = [
    ConnectionFilterPlugin,
    FulltextFilterPlugin,
    CustomPgTypeMappingsPlugin,
    UploadPostGraphilePlugin,
    PgMetaschema,
    PgManyToMany,
    PgSearch,
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
          resolve: resolveUpload,
        },
        {
          name: 'attachment',
          namespaceName: 'public',
          type: 'String',
          resolve: resolveUpload,
        },
        {
          name: 'image',
          namespaceName: 'public',
          type: 'JSON',
          resolve: resolveUpload,
        },
        {
          tag: 'upload',
          resolve: resolveUpload,
        },
      ],
      pgSimplifyOppositeBaseNames: features?.oppositeBaseNames,
      connectionFilterComputedColumns: false,
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
    additionalGraphQLContextFromRequest: async (req, res) => {
      const langContext = await langAdditional(req, res);
      return {
        ...langContext,
        req,
        res,
      };
    },
  };
};
