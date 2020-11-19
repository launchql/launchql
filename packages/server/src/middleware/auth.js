import { getRootPgPool } from '@launchql/server-utils';

export const authenticate = async (req, res, next) => {
  const svc = req.svc;
  const pool = getRootPgPool(svc.dbname);

  const { rls_module } = svc.data;

  if (rls_module && rls_module.authenticate_schema && rls_module.authenticate) {
    const { authorization = '' } = req.headers;
    const [authType, authToken] = authorization.split(' ');
    let token = {};
    if (authType.toLowerCase() === 'bearer' && authToken) {
      let result = null;
      try {
        result = await pool.query(
          `SELECT * FROM "${rls_module.authenticate_schema}"."${rls_module.authenticate}"($1)`,
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
