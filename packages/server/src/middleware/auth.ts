import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getRootPgPool } from '@launchql/server-utils';
import pgQueryContext from 'pg-query-context';
import { LaunchQLOptions } from '@launchql/types';

export const createAuthenticateMiddleware = (opts: LaunchQLOptions): RequestHandler => {

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const api = req.apiInfo?.data?.api;
    if (!api) {
      res.status(500).send('Missing API info');
      return;
    }

    const pool = getRootPgPool({
      ...opts.pg,
      database: api.dbname
    });
    const rlsModule = api.rlsModule;

    if (!rlsModule) return next();

    const authFn = opts.server.strictAuth
      ? rlsModule.authenticateStrict
      : rlsModule.authenticate;

    if (authFn && rlsModule.privateSchema.schemaName) {
      const { authorization = '' } = req.headers;
      const [authType, authToken] = authorization.split(' ');
      let token: any = {};

      if (authType?.toLowerCase() === 'bearer' && authToken) {
        const context: Record<string, any> = {
          'jwt.claims.ip_address': req.clientIp,
        };

        if (req.get('origin')) {
          context['jwt.claims.origin'] = req.get('origin');
        }
        if (req.get('User-Agent')) {
          context['jwt.claims.user_agent'] = req.get('User-Agent');
        }

        try {
          const result = await pgQueryContext({
            client: pool,
            context,
            query: `SELECT * FROM "${rlsModule.privateSchema.schemaName}"."${authFn}"($1)`,
            variables: [authToken],
          });

          if (result?.rowCount === 0) {
            res.status(200).json({
              errors: [{ extensions: { code: 'UNAUTHENTICATED' } }],
            });
            return;
          }

          token = result.rows[0];
        } catch (e: any) {
          res.status(200).json({
            errors: [
              {
                extensions: {
                  code: 'BAD_TOKEN_DEFINITION',
                  message: e.message,
                },
              },
            ],
          });
          return;
        }
      }

      // @ts-ignore - augment req with `token`
      req.token = token;
    }

    next();
  };
};
