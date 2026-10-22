import './types'; // for Request type

import { errors } from '@constructive-io/errors';
import type { AdmissionLease, RequestProtection } from '@constructive-io/express-context';
import {
  clientIpOf,
  ConcurrencyLimiter,
  DEFAULT_REQUEST_PROTECTION,
  RateWindow
} from '@constructive-io/express-context';
import { Logger } from '@pgpmjs/logger';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { respondWithGraphQLError } from '../errors/graphql-response';
import { recordRefusal } from '../refusals/recorder';

const log = new Logger('admission');

/**
 * admission-control — the gate that decides whether a GraphQL request starts.
 *
 * The document gate rejects a *shape* and the timeout GUCs bound a *duration*;
 * neither refuses a request that is individually reasonable. This does, on two
 * axes:
 *
 *   1. **Concurrency**, per database. The thing being protected is this
 *      process's PostgreSQL pool, so the counter is in-process and
 *      `maxConcurrentRequests` is a per-replica budget — a cluster-wide number
 *      would need shared state on the hot path to bound something that is not
 *      shared. Over budget, a request waits up to `maxQueueWaitMs` for a slot
 *      and is then refused; it never queues unbounded, because a queue that
 *      outgrows the timeout is just latency with a memory cost.
 *
 *   2. **Rate**, per caller per route. Keyed on the client address rather than
 *      the tenant, because a tenant-wide limit is spent *by* an anonymous
 *      flood: exhausting it takes the tenant's own API down on the attacker's
 *      behalf. This is abuse protection and fails closed, which is the opposite
 *      of a billing quota (that serves and records overage) — the two must not
 *      be conflated, and neither is a database write on the request path.
 *
 * @module middleware/admission-control
 */

/** Window the per-caller rate is counted over — `rateLimitRpm` is per minute. */
const RATE_WINDOW_MS = 60_000;

/** What a request is keyed by when it carries no resolved database. */
const UNKNOWN_DATABASE = 'unknown';

const protectionOf = (req: Request): RequestProtection =>
  req.requestProtection ?? DEFAULT_REQUEST_PROTECTION;

/**
 * The route half of the rate key.
 *
 * Per-route rather than per-request-line so a caller cannot spread a flood
 * across query strings, and so a cheap route's traffic does not spend the
 * budget an expensive one needs.
 */
const routeOf = (req: Request): string => `${req.method} ${req.baseUrl}${req.path}`;

/** Seconds for a `Retry-After` header — the smallest honest whole number. */
const retryAfterSeconds = (ms: number): string => String(Math.max(Math.ceil(ms / 1000), 1));

/**
 * Rate-limit callers per route, then admit at most `maxConcurrentRequests` of
 * them per database into the handler chain.
 *
 * Mount after `createRequestProtectionMiddleware` (which resolves the bounds
 * this reads) and before the GraphQL handler. Order within the middleware
 * matters: the rate check is O(1) and runs first, so a flood is refused
 * without ever occupying a concurrency slot or waiting in its queue.
 */
export const createAdmissionControlMiddleware = (): RequestHandler => {
  const concurrency = new ConcurrencyLimiter();
  const rate = new RateWindow(RATE_WINDOW_MS);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const protection = protectionOf(req);
    const databaseId = req.databaseId ?? UNKNOWN_DATABASE;

    // ─── Per-caller rate ────────────────────────────────────────────────────
    const ip = clientIpOf(req);
    const rateKey = `${databaseId}\u0000${ip}\u0000${routeOf(req)}`;
    if (!rate.admit(rateKey, protection.rateLimitRpm, protection.rateLimitBurst)) {
      log.warn(`[admission] rate limit: database=${databaseId} ip=${ip} route=${routeOf(req)}`);
      recordRefusal(req, 'rate_limited', { sourceIp: ip });
      respondWithGraphQLError(res, errors.RATE_LIMITED(), {
        status: 429,
        headers: { 'Retry-After': retryAfterSeconds(rate.retryAfterMs(rateKey)) }
      });
      return;
    }

    // ─── Per-database concurrency ───────────────────────────────────────────
    let lease: AdmissionLease;
    try {
      lease = await concurrency.acquire(databaseId, {
        limit: protection.maxConcurrentRequests,
        queueWaitMs: protection.maxQueueWaitMs
      });
    } catch (e) {
      next(e);
      return;
    }

    if (!lease.granted) {
      log.warn(
        `[admission] concurrency refused: database=${databaseId} ` +
          `limit=${protection.maxConcurrentRequests} reason=${lease.refusal} waited=${lease.queuedMs}ms`
      );
      recordRefusal(req, lease.refusal === 'queue_timeout' ? 'queue_timeout' : 'concurrency_saturated', {
        sourceIp: ip
      });
      respondWithGraphQLError(
        res,
        errors.CONCURRENCY_LIMIT_REACHED({
          limit: protection.maxConcurrentRequests,
          waitedMs: lease.queuedMs
        }),
        {
          status: 429,
          // The queue is the honest wait estimate: a slot freed sooner than
          // this and the request would already have been admitted.
          headers: { 'Retry-After': retryAfterSeconds(protection.maxQueueWaitMs) }
        }
      );
      return;
    }

    // Release exactly once, whichever ends first. `close` covers the client
    // that hangs up mid-flight — without it an aborted request holds its slot
    // until the process restarts, and a client that retries on abort would
    // drain the tenant's budget one leaked slot at a time. `release` is
    // idempotent, so both listeners can fire.
    res.on('close', () => lease.release());
    res.on('finish', () => lease.release());
    next();
  };
};
