import corsPlugin from 'cors';
import type { Express } from 'express';

export const cors = (app: Express, origin?: string) => {
  const corsOptions =
    origin && origin.trim() !== '*'
      ? {
        origin,
        credentials: true,
        optionsSuccessStatus: 200, // legacy browser support
      }
      : undefined;

  if (corsOptions) {
    app.use(corsPlugin(corsOptions));
  } else {
    // Wildcard fallback for development or lax environments
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
