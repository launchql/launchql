export const healthz = (app) => {
  app.get('/healthz', (req, res) => {
    // could be checking db, etc..
    res.send('ok');
  });
};

export const poweredBy = (name) => async (req, res, next) => {
  res.set({
    'X-Powered-By': name
  });
  return next();
};

export const trustProxy = (app, env) => {
  if (env.TRUST_PROXY) {
    app.set('trust proxy', (ip) => {
      return true;
    });
  }
};
