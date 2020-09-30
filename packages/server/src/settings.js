import env from './env';
import { NodePlugin } from 'graphile-build';
import PublicKeySignature from './plugins/PublicKeySignature';
import PgSimpleInflector from 'graphile-simple-inflector';
import PgMetaschema from 'graphile-meta-schema';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import FulltextFilterPlugin from 'postgraphile-plugin-fulltext-filter';
import PostGraphileUploadFieldPlugin from 'postgraphile-derived-upload-field';
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
  plugins.push(PgMetaschema);

  if (simpleInflection) {
    plugins.push(PgSimpleInflector);
  }
  const { anon_role, role_name, role_key } = svc;
  if (svc.pubkey_challenge?.length == 6) {
    plugins.push(PublicKeySignature(svc));
  }
  return {
    graphileBuildOptions: {
      uploadFieldDefinitions: [
        {
          name: 'upload',
          namespaceName: 'public',
          type: 'String',
          resolve: resolveUpload
        },
        {
          name: 'attachment',
          namespaceName: 'public',
          type: 'JSON',
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
      pgSimplifyOppositeBaseNames: oppositeBaseNames ? true : false,
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
    async retryOnInitFail(error) {
      return false;
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
