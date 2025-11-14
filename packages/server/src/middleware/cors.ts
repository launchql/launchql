import { parseUrl } from '@launchql/url-domains';
import corsPlugin from 'cors';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

import { CorsModuleData } from '../types';

/**
 * Unified CORS middleware for LaunchQL API
 *
 * Feature parity + compatibility:
 *  - Respects a global fallback origin (e.g. from env/CLI) for quick overrides.
 *  - Preserves multi-tenant, per-API CORS via meta schema ('cors' module + domains).
 *  - Always allows localhost to ease development.
 *
 * Usage:
 *  app.use(cors(fallbackOrigin));
 */
export const cors = (fallbackOrigin?: string): RequestHandler => {
  // Use the cors library's dynamic origin function to decide per request
  const dynamicOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void, req: Request) => {
    // 1) Global fallback (fast path)
    if (fallbackOrigin && fallbackOrigin.trim().length) {
      if (fallbackOrigin.trim() === '*') {
        // Reflect whatever Origin the caller sent
        return callback(null, true);
      }
      if (origin && origin.trim() === fallbackOrigin.trim()) {
        return callback(null, true);
      }
      // If a strict fallback origin is provided and does not match,
      // continue to per-API checks below (do not immediately deny).
    }

    // 2) Per-API allowlist sourced from req.api (if available)
    //    createApiMiddleware runs before this in server.ts, so req.api should be set
    const api = (req as any).api as { apiModules?: any[]; domains?: string[] } | undefined;
    if (api) {
      const corsModules = (api.apiModules || []).filter((m: any) => m.name === 'cors') as { name: 'cors'; data: CorsModuleData }[];
      const siteUrls = api.domains || [];
      const listOfDomains = corsModules.reduce<string[]>((m, mod) => [...mod.data.urls, ...m], siteUrls);

      if (origin && listOfDomains.includes(origin)) {
        return callback(null, true);
      }
    }

    // 3) Localhost is always allowed
    if (origin) {
      try {
        const parsed = parseUrl(new URL(origin));
        if (parsed.domain === 'localhost') {
          return callback(null, true);
        }
      } catch {
        // ignore invalid origin
      }
    }

    // Default: not allowed
    return callback(null, false);
  };

  // Wrap in the cors plugin with our dynamic origin resolver
  const handler: RequestHandler = (req, res, next) =>
    corsPlugin({
      origin: (reqOrigin, cb) => dynamicOrigin(reqOrigin, cb as any, req),
      credentials: true,
      optionsSuccessStatus: 200,
    })(req, res, next);

  return handler;
};
