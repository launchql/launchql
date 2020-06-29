const env = require('./env');
const { NodePlugin } = require('graphile-build');
import PgSimplifyInflectorPlugin from './plugins/PgSimplifyInflectorPlugin';
import PublicKeySignature from './plugins/PublicKeySignature';

export const getGraphileSettings = ({
  connection,
  host,
  port,
  schema,
  simpleInflection,
  oppositeBaseNames,
  svc
}) => {
  const plugins = [];
  if (simpleInflection) {
    plugins.push(PgSimplifyInflectorPlugin);
  }
  const { anon_role, role_name, role_key } = svc;
  if (svc.pubkey_challenge?.length == 6) {
    plugins.push(PublicKeySignature(svc));
  }
  return {
    graphileBuildOptions: {
      pgSimplifyOppositeBaseNames: oppositeBaseNames ? true : false
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
      if (req?.token?.role_id) {
        return {
          role: role_name,
          [`jwt.claims.${role_key}`]: req.token.role_id,
          [`jwt.claims.role_ids`]: '{' + req.token.role_id + '}'
        };
      }
      return { role: anon_role };
    }
  };
};
