import corsPlugin from 'cors';
import type { Express } from 'express';

/**
 * App-wide CORS helper (used by Explorer and optionally by API)
 *
 * - If an explicit origin string is provided (and not "*"), enable CORS for that
 *   exact origin and set credentials=true.
 * - If origin is omitted or "*", install a small wrapper that reflects the
 *   request's Origin header (permissive mode). This is convenient for
 *   development or single-tenant setups but should be scoped in production.
 */
export const cors = (app: Express, origin?: string) => {
  const corsOptions =
    origin && origin.trim() !== '*'
      ? {
          origin,
          credentials: true,
          optionsSuccessStatus: 200,
        }
      : undefined;

  if (corsOptions) {
    app.use(corsPlugin(corsOptions));
  } else {
    // Wildcard/permissive mode: reflect the caller's Origin header
    app.use((req, res, next) => {
      const opts = {
        origin: req.get('origin'),
        credentials: true,
        optionsSuccessStatus: 200,
      };
      return corsPlugin(opts)(req, res, next);
    });
  }
};
