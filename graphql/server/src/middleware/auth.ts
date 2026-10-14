import './types'; // for Request type

import { errors } from '@constructive-io/errors';
import { getNodeEnv } from '@pgpmjs/env';
import { Logger } from '@pgpmjs/logger';
import { PgpmOptions } from '@pgpmjs/types';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { getPgPool } from 'pg-cache';
import pgQueryContext from 'pg-query-context';

import { respondWithGraphQLError } from '../errors/graphql-response';

const log = new Logger('auth');
const isDev = () => getNodeEnv() === 'development';

/** Default cookie name for session tokens. */
const SESSION_COOKIE_NAME = 'constructive_session';

/** Cookie name for trusted device tracking. */
const DEVICE_TOKEN_COOKIE_NAME = 'constructive_device_token';

/**
 * Extract a named cookie value from the raw Cookie header.
 * Avoids pulling in cookie-parser as a dependency.
 */
const parseCookieToken = (req: Request, cookieName: string): string | undefined => {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const match = header.split(';').find((c) => c.trim().startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.split('=')[1].trim()) : undefined;
};

export const createAuthenticateMiddleware = (
  opts: PgpmOptions
): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const api = req.api;
    log.info(`[auth] middleware called, api=${api ? 'present' : 'missing'}`);
    if (!api) {
      res.status(500).send('Missing API info');
      return;
    }

    const pool = getPgPool({
      ...opts.pg,
      database: api.dbname,
    });
    const rlsModule = api.rlsModule;

    log.info(
      `[auth] rlsModule=${rlsModule ? 'present' : 'missing'}, ` +
        `authenticate=${rlsModule?.authenticate ?? 'none'}, ` +
        `authenticateStrict=${rlsModule?.authenticateStrict ?? 'none'}, ` +
        `privateSchema=${rlsModule?.privateSchema?.schemaName ?? 'none'}`
    );

    if (!rlsModule) {
      log.info('[auth] No RLS module configured, skipping auth');
      return next();
    }

    const authFn = opts.server?.strictAuth
      ? rlsModule.authenticateStrict
      : rlsModule.authenticate;

    log.info(
      `[auth] strictAuth=${opts.server?.strictAuth ?? false}, authFn=${authFn ?? 'none'}`
    );

    if (authFn && rlsModule.privateSchema.schemaName) {
      const { authorization = '' } = req.headers;
      const [authType, authToken] = authorization.split(' ');
      let token: any = {};

      log.info(
        `[auth] authorization header present=${!!authorization}, ` +
          `authType=${authType ?? 'none'}, hasToken=${!!authToken}`
      );

      // Resolve the credential: prefer Bearer header, fall back to session cookie
      const cookieToken = parseCookieToken(req, SESSION_COOKIE_NAME);
      const effectiveToken = (authType?.toLowerCase() === 'bearer' && authToken)
        ? authToken
        : cookieToken;
      const tokenSource = (authType?.toLowerCase() === 'bearer' && authToken) ? 'bearer' : (cookieToken ? 'cookie' : 'none');

      if (effectiveToken) {
        log.info(`[auth] Processing ${tokenSource} authentication`);
        const context: Record<string, any> = {
          'jwt.claims.ip_address': req.clientIp,
        };

        if (req.get('origin')) {
          context['jwt.claims.origin'] = req.get('origin');
        }
        if (req.get('User-Agent')) {
          context['jwt.claims.user_agent'] = req.get('User-Agent');
        }

        const authQuery = `SELECT * FROM "${rlsModule.privateSchema.schemaName}"."${authFn}"($1)`;
        log.info(`[auth] Executing auth query: ${authQuery}`);

        try {
          const result = await pgQueryContext({
            client: pool,
            context,
            query: authQuery,
            variables: [effectiveToken],
          });

          log.info(`[auth] Query result: rowCount=${result?.rowCount}`);

          if (result?.rowCount === 0) {
            log.info('[auth] No rows returned, returning UNAUTHENTICATED');
            respondWithGraphQLError(res, errors.UNAUTHENTICATED());
            return;
          }

          token = result.rows[0];
          log.info(`[auth] Auth success: role=${token.role}, user_id=${token.user_id}`);
        } catch (e: any) {
          log.error('[auth] Auth error:', e.message);
          respondWithGraphQLError(
            res,
            errors.INTERNAL_FAILURE({
              details: isDev() ? e.message : 'authentication failed',
            })
          );
          return;
        }
      } else {
        log.info('[auth] No credential provided (no bearer token or session cookie), using anonymous auth');
      }

      req.token = token;
    } else {
      log.info(
        `[auth] Skipping auth: authFn=${authFn ?? 'none'}, ` +
          `privateSchema=${rlsModule.privateSchema?.schemaName ?? 'none'}`
      );
    }

    // Read device token cookie for trusted device tracking
    const deviceToken = parseCookieToken(req, DEVICE_TOKEN_COOKIE_NAME);
    if (deviceToken) {
      req.deviceToken = deviceToken;
      log.info('[auth] Device token cookie present');
    }

    next();
  };
};
