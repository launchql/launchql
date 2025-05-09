import corsPlugin from 'cors';
import { parseUrl } from '@pyramation/url-domains';

const getUrlsFromDomains = (domains) => {
  return domains.reduce((m, { subdomain, domain }) => {
    let hostname;
    if (subdomain) {
      hostname = [subdomain, domain].join('.');
    } else {
      hostname = domain;
    }

    // TODO add only if in development
    const protocol = domain === 'localhost' ? 'http://' : 'https://';

    return [...m, protocol + hostname];
  }, []);
};

const getSiteUrls = (sites) => {
  let siteUrls = [];
  if (sites.nodes) {
    siteUrls = sites.nodes.reduce((m, site) => {
      if (site.domains.nodes && site.domains.nodes.length) {
        return [...m, ...getUrlsFromDomains(site.domains.nodes)];
      }
      return m;
    }, []);
  }
  return siteUrls;
};

export const cors = async (req, res, next) => {
  const api = req.apiInfo.data.api;
  const corsModules = api.apiModules.nodes.filter((mod) => mod.name === 'cors');

  let corsOptions = { origin: false }; // disable CORS for this request
  if (!api.database?.sites) {
    return corsPlugin({
      ...corsOptions,
      credentials: true,
      optionsSuccessStatus: 200
    })(req, res, next);
  }

  const sites = api.database.sites;
  const siteUrls = getSiteUrls(sites);

  const listOfDomains = corsModules.reduce((m, mod) => {
    return [...mod.data.urls, ...m];
  }, siteUrls);

  const origin = req.get('origin');
  if (origin) {
    if (listOfDomains.indexOf(origin) !== -1) {
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    }

    // TODO add only if in development
    const url = new URL(origin);
    const parsed = parseUrl(url);
    if (parsed.domain === 'localhost') {
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    }
  }

  return corsPlugin({
    ...corsOptions,
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })(req, res, next);
};
