import './types'; // for Request type

import { ConstructiveOptions } from '@constructive-io/graphql-types';
import { Logger } from '@pgpmjs/logger';
import { svcCache } from '@pgpmjs/server-utils';
import { createHash, timingSafeEqual } from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { graphileCache } from 'graphile-cache';
import { getPgPool } from 'pg-cache';

import { getRoutingSchema, isValidSchemaName } from './routing';

const log = new Logger('flush');

const bearerToken = (req: Request): string | null => {
  const header = req.get('authorization');
  if (!header) return null;
  const [scheme, ...rest] = header.trim().split(/\s+/);
  if (scheme.toLowerCase() !== 'bearer' || rest.length !== 1) return null;
  return rest[0];
};

// Compare digests rather than the tokens themselves: timingSafeEqual requires
// equal lengths, and digests are equal-length whatever the caller presents.
const tokensMatch = (presented: string, expected: string): boolean =>
  timingSafeEqual(
    createHash('sha256').update(presented).digest(),
    createHash('sha256').update(expected).digest()
  );

/**
 * `/flush` drops the routing and schema caches for the request's service key,
 * so it is a control-plane operation: it needs the flush secret, not a tenant
 * session. Without a configured secret there is no way to authenticate the
 * caller, so the route stays closed.
 */
export const createFlushMiddleware = (
  opts: ConstructiveOptions
): RequestHandler => {
  const expected = opts.api?.flushToken;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (req.url !== '/flush') {
      return next();
    }

    if (!expected) {
      log.warn('[flush] rejected: no api.flushToken configured');
      res.status(404).send('Not Found');
      return;
    }

    const presented = bearerToken(req);
    if (!presented || !tokensMatch(presented, expected)) {
      log.warn('[flush] rejected: invalid or missing bearer token');
      res.status(401).send('Unauthorized');
      return;
    }

    graphileCache.delete((req as any).svc_key);
    svcCache.delete((req as any).svc_key);
    res.status(200).send('OK');
  };
};

export const flushService = async (
  opts: ConstructiveOptions,
  databaseId: string
): Promise<void> => {
  const pgPool = getPgPool(opts.pg);
  log.info('flushing db ' + databaseId);

  const api = new RegExp(`^api:${databaseId}:.*`);
  const schemata = new RegExp(`^schemata:${databaseId}:.*`);
  const meta = new RegExp(`^metaschema:api:${databaseId}`);

  if (!opts.api.isPublic) {
    graphileCache.forEach((_, k: string) => {
      if (api.test(k) || schemata.test(k) || meta.test(k)) {
        graphileCache.delete(k);
        svcCache.delete(k);
      }
    });
  }

  const routingSchema = getRoutingSchema(opts);
  if (!isValidSchemaName(routingSchema)) {
    log.warn(`[flush] invalid routing schema name: ${routingSchema}`);
    return;
  }
  const svc = await pgPool.query(
    `SELECT hostname
     FROM "${routingSchema}".domains
     WHERE database_id = $1`,
    [databaseId]
  );

  if (svc.rowCount === 0) return;

  for (const row of svc.rows) {
    const key: string | undefined = row.hostname || undefined;
    if (key) {
      graphileCache.delete(key);
      svcCache.delete(key);
    }
  }
};
