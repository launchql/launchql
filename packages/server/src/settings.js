import env from './env';
import { NodePlugin } from 'graphile-build';
import PgSimplifyInflectorPlugin from './plugins/PgSimplifyInflectorPlugin';
import PublicKeySignature from './plugins/PublicKeySignature';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import FulltextFilterPlugin from 'postgraphile-plugin-fulltext-filter';
import PostGraphileUploadFieldPlugin from './plugins/PgUploadField';
// import PostGraphileUploadFieldPlugin from 'postgraphile-plugin-upload-field';
import resolveUpload from './resolvers/uploads';

export const getGraphileSettings = ({
  connection,
  host,
  port,
  schema,
  simpleInflection,
  oppositeBaseNames,
  svc
}) => {
  const plugins = [ConnectionFilterPlugin, FulltextFilterPlugin];

  plugins.push(PostGraphileUploadFieldPlugin);

  if (simpleInflection) {
    plugins.push(PgSimplifyInflectorPlugin);
  }
  const { anon_role, role_name, role_key } = svc;
  if (svc.pubkey_challenge?.length == 6) {
    plugins.push(PublicKeySignature(svc));
  }
  return {
    graphileBuildOptions: {
      uploadFieldDefinitions: [
        {
          match: (args) => {
            return args.tags.upload;
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
    additionalGraphQLContextFromRequest(req, res) {
      return { req, res, env };
    },
    // https://github.com/graphile/postgraphile/issues/1073
    retryOnInitFail: false,
    handleSeriousError(error) {
      throw error;
    },
    async pgSettings(req) {
      // TODO both role_ids and role_id
      if (req?.token?.user_id) {
        return {
          role: role_name,
          [`jwt.claims.${role_key}`]: req.token.user_id,
          [`jwt.claims.role_ids`]: '{' + req.token.user_id + '}'
        };
      }
      return { role: anon_role };
    }
  };
};
