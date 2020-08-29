import env from './env';
import { NodePlugin } from 'graphile-build';
import PgSimplifyInflectorPlugin from './plugins/PgSimplifyInflectorPlugin';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import FulltextFilterPlugin from 'postgraphile-plugin-fulltext-filter';
import PostGraphileUploadFieldPlugin from '@pyramation/postgraphile-upload-field';
import resolveUpload from './resolvers/uploads';

export const getGraphileSettings = ({
  connection,
  host,
  port,
  schema,
  simpleInflection,
  oppositeBaseNames
}) => {
  const plugins = [ConnectionFilterPlugin, FulltextFilterPlugin];

  plugins.push(PostGraphileUploadFieldPlugin);

  if (simpleInflection) {
    plugins.push(PgSimplifyInflectorPlugin);
  }

  return {
    graphileBuildOptions: {
      uploadFieldDefinitions: [
        {
          match: (args) => {
            return (
              args.tags.upload ||
              ['upload', 'image', 'attachment'].includes(args.type.name)
            );
          },
          resolve: resolveUpload
        }
      ],
      pgSimplifyOppositeBaseNames: oppositeBaseNames ? true : false,
      // connectionFilterAllowedOperators: [
      //   "isNull",
      //   "equalTo",
      //   "notEqualTo",
      //   "distinctFrom",
      //   "notDistinctFrom",
      //   "lessThan",
      //   "lessThanOrEqualTo",
      //   "greaterThan",
      //   "greaterThanOrEqualTo",
      //   "in",
      //   "notIn",
      // ],
      connectionFilterComputedColumns: false
    },
    appendPlugins: plugins.length > 0 ? plugins : undefined,
    skipPlugins: [NodePlugin],
    dynamicJson: true,
    disableGraphiql: false,
    enhanceGraphiql: true,
    graphiql: true,
    watch: false,
    connection,
    port,
    host,
    schema,
    ignoreRBAC: false,
    showErrorStack: false,
    extendedErrors: false,
    disableQueryLog: false,
    includeExtensionResources: true,
    setofFunctionsContainNulls: false,
    // https://github.com/graphile/postgraphile/issues/1073
    retryOnInitFail: false,
    handleSeriousError(error) {
      throw error;
    },
    additionalGraphQLContextFromRequest(req, res) {
      return { req, res, env };
    },
    async pgSettings(req) {
      // TODO use real roles
      return { role: 'postgres' };
    }
  };
};
