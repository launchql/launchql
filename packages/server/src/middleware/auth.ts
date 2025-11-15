import { LaunchQLOptions } from '@launchql/types';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { getPgPool } from 'pg-cache';
import pgQueryContext from 'pg-query-context';

import { ApiStructure } from '../types';

type AuthRequest = Request & {
  api?: ApiStructure;
  clientIp?: string;
  token?: {
    id: string;
    user_id: string;
    [key: string]: any;
  };
};

export const createAuthenticateMiddleware = (
  opts: LaunchQLOptions
): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authRequest = req as AuthRequest;
    const api = authRequest.api;
    if (!api) {
      res.status(500).send('Missing API info');
      return;
    }

    const pool = getPgPool({
      ...opts.pg,
      database: api.dbname,
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
          'jwt.claims.ip_address': authRequest.clientIp,
        };

        if (authRequest.get('origin')) {
          context['jwt.claims.origin'] = authRequest.get('origin');
        }
        if (authRequest.get('User-Agent')) {
          context['jwt.claims.user_agent'] = authRequest.get('User-Agent');
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

      authRequest.token = token;
    }

    next();
  };
};
