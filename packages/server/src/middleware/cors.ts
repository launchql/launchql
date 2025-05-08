import corsPlugin from 'cors';
import { parseUrl } from '@launchql/url-domains';
import { Request, Response, NextFunction } from 'express';

interface Domain {
  subdomain?: string;
  domain: string;
}

interface SiteDomainNode {
  nodes: Domain[];
}

interface Site {
  domains: SiteDomainNode;
}

interface Sites {
  nodes?: Site[];
}

interface ApiModule {
  name: string;
  data: {
    urls: string[];
  };
}

interface ApiInfo {
  data: {
    api: {
      apiModules: {
        nodes: ApiModule[];
      };
      database?: {
        sites: Sites;
      };
    };
  };
}

const getUrlsFromDomains = (domains: Domain[]): string[] => {
  return domains.reduce<string[]>((m, { subdomain, domain }) => {
    const hostname = subdomain ? `${subdomain}.${domain}` : domain;
    const protocol = domain === 'localhost' ? 'http://' : 'https://';
    return [...m, protocol + hostname];
  }, []);
};

const getSiteUrls = (sites: Sites): string[] => {
  let siteUrls: string[] = [];
  if (sites.nodes) {
    siteUrls = sites.nodes.reduce<string[]>((m, site) => {
      if (site.domains.nodes && site.domains.nodes.length) {
        return [...m, ...getUrlsFromDomains(site.domains.nodes)];
      }
      return m;
    }, []);
  }
  return siteUrls;
};

export const cors = async (req: Request & { apiInfo: ApiInfo }, res: Response, next: NextFunction) => {
  const api = req.apiInfo.data.api;
  const corsModules = api.apiModules.nodes.filter((mod) => mod.name === 'cors');

  let corsOptions = { origin: false as boolean | string | RegExp | (string | RegExp)[] }; // default: disabled
  if (!api.database?.sites) {
    return corsPlugin({
      ...corsOptions,
      credentials: true,
      optionsSuccessStatus: 200
    })(req, res, next);
  }

  const sites = api.database.sites;
  const siteUrls = getSiteUrls(sites);

  const listOfDomains = corsModules.reduce<string[]>((m, mod) => {
    return [...mod.data.urls, ...m];
  }, siteUrls);

  const origin = req.get('origin');
  if (origin) {
    if (listOfDomains.includes(origin)) {
      corsOptions = { origin: true };
    }

    try {
      const url = new URL(origin);
      const parsed = parseUrl(url);
      if (parsed.domain === 'localhost') {
        corsOptions = { origin: true };
      }
    } catch {
      // ignore invalid URL
    }
  }

  return corsPlugin({
    ...corsOptions,
    credentials: true,
    optionsSuccessStatus: 200
  })(req, res, next);
};
