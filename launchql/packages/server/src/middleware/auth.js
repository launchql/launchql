import { getRootPgPool } from '@launchql/server-utils';
import env from '../env';
import pgQueryContext from '@pyramation/pg-query-context';

const strictAuth = env.STRICT_AUTH;

export const authenticate = async (req, res, next) => {
  const api = req.apiInfo.data.api;
  const pool = getRootPgPool(api.dbname);

  const rlsModule = api.rlsModule;

  if (!rlsModule) return next();

  const authFn = strictAuth
    ? rlsModule.authenticateStrict
    : rlsModule.authenticate;

  if (authFn && rlsModule.privateSchema.schemaName) {
    const { authorization = '' } = req.headers;
    const [authType, authToken] = authorization.split(' ');
    let token = {};
    if (authType.toLowerCase() === 'bearer' && authToken) {
      let result = null;

      const context = {
        [`jwt.claims.ip_address`]: req.clientIp
      };

      // MARKED AS NOT DRY (look at middleware/graphile.js)
      // NOTE: ONLY set if it's not null
      if (req.get('origin')) {
        context['jwt.claims.origin'] = req.get('origin');
      }
      if (req.get('User-Agent')) {
        context['jwt.claims.user_agent'] = req.get('User-Agent');
      }
      try {
        result = await pgQueryContext({
          client: pool,
          context,
          query: `SELECT * FROM "${rlsModule.privateSchema.schemaName}"."${authFn}"($1)`,
          variables: [authToken]
        });
      } catch (e) {
        return res.status(200).end(
          JSON.stringify({
            errors: [
              {
                extensions: {
                  code: 'BAD_TOKEN_DEFINITION',
                  message: e.message
                }
              }
            ]
          })
        );
      }

      if (result.rowCount === 0) {
        return res.status(200).end(
          JSON.stringify({
            errors: [{ extensions: { code: 'UNAUTHENTICATED' } }]
          })
        );
      } else {
        token = result.rows[0];
      }
    }
    req.token = token;
  }
  return next();
};
