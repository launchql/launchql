import { parseUrl } from '@launchql/url-domains';
import corsPlugin from 'cors';
import { NextFunction,Request, Response } from 'express';

import { CorsModuleData } from '../types';

export const cors = async (req: Request, res: Response, next: NextFunction) => {
  const api = req.api;
  const corsModules = api.apiModules.filter((mod) => mod.name === 'cors') as { name: 'cors'; data: CorsModuleData }[];

  let corsOptions = { origin: false as boolean | string | RegExp | (string | RegExp)[] }; // default: disabled
  if (!api.domains || api.domains.length === 0) {
    return corsPlugin({
      ...corsOptions,
      credentials: true,
      optionsSuccessStatus: 200
    })(req, res, next);
  }

  const siteUrls = api.domains;

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
