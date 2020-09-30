import corsPlugin from 'cors';

export const cors = (app, origin) => {
  const corsOptions =
    origin && origin.trim() !== '*'
      ? {
          origin,
          credentials: true,
          optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        }
      : undefined;

  if (corsOptions) {
    app.use(corsPlugin(corsOptions));
  } else {
    // Chrome was too strict, and * didn't work?
    // so just setting all origins to OK
    app.use(async (req, res, next) => {
      const opts = {
        origin: req.get('origin'),
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
      };
      return corsPlugin(opts)(req, res, next);
    });
  }
};
