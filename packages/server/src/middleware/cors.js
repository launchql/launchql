import corsPlugin from 'cors';

export const cors = async (req, res, next) => {
  const api = req.apiInfo.data.api;
  const corsModules = api.apiModules.nodes.filter((mod) => mod.name === 'cors');

  const listOfDomains = corsModules.reduce((m, mod) => {
    return [...mod.data.urls, ...m];
  }, []);

  let corsOptions = { origin: false }; // disable CORS for this request
  const origin = req.get('origin');
  if (origin) {
    if (listOfDomains.indexOf(req.get('origin')) !== -1) {
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    }

    // TODO add only if in development
    const url = new URL(origin);
    const parts = url.hostname.split('.');
    const last = parts[parts.length - 1];
    if (last === 'localhost') {
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    }
  }

  const opts = {
    ...corsOptions,
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  return corsPlugin(opts)(req, res, next);
};
