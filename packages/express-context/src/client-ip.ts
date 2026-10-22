/**
 * client-ip — the one trusted client address per request.
 *
 * Every consumer of "where did this request come from" (rate limiting, the
 * refusal ledger, `jwt.claims.ip_address` in pgSettings, logs) reads
 * `req.clientIp`, which this middleware resolves exactly once with
 * {@link clientIpFrom}: the socket peer when no proxy is trusted, otherwise
 * the `X-Forwarded-For` entry the deployment's own ingress appended. The
 * caller-written leftmost entry is never used.
 */

import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { clientIpFrom } from './admission';

/**
 * Sets `req.clientIp` from the socket peer and the first `trustedProxyHops`
 * entries of `X-Forwarded-For` counted from the right. Mount before anything
 * that reads the address.
 */
export const clientIpMiddleware = (trustedProxyHops: number): RequestHandler => {
  const hops = Number.isFinite(trustedProxyHops) && trustedProxyHops > 0 ? Math.floor(trustedProxyHops) : 0;
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.clientIp = clientIpFrom(req, hops);
    next();
  };
};

/**
 * The address a request is attributed to: `req.clientIp` once the middleware
 * has run, else the socket peer — never a forwarded header the middleware did
 * not vet.
 */
export const clientIpOf = (req: Request): string => req.clientIp ?? clientIpFrom(req, 0);
