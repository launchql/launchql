import { getRootPgPool } from '@launchql/server-utils';

export const authenticate = async (req, res, next) => {
  const api = req.apiInfo.data.api;
  const pool = getRootPgPool(api.dbname);
  const rls_module = api.apiModules.nodes.find(
    (mod) => mod.name === 'rls_module'
  );

  if (!rls_module || !rls_module.data) return next();

  const { authenticate, authenticate_schema } = rls_module.data;

  if (authenticate && authenticate_schema) {
    const { authorization = '' } = req.headers;
    const [authType, authToken] = authorization.split(' ');
    let token = {};
    if (authType.toLowerCase() === 'bearer' && authToken) {
      let result = null;
      try {
        result = await pool.query(
          `SELECT * FROM "${authenticate_schema}"."${authenticate}"($1)`,
          [authToken]
        );
      } catch (e) {
        return res.status(200).end(
          JSON.stringify({
            errors: [
              {
                extensions: {
                  code: 'BAD_TOKEN_DEFINITION',
                  message:
                    process.env.NODE_ENV === 'production' ? '' : e.message
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
