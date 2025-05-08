import { Request, Response, NextFunction } from 'express';
import { parseReq } from './requests';

interface UrlDomains {
  [key: string]: string | string[];
}

declare global {
  namespace Express {
    interface Request {
      urlDomains?: UrlDomains;
    }
  }
}

export const middleware = ({
  hostname = 'hostname',
  subdomains = 'subdomains',
  domain = 'domain'
} = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parsed = parseReq(req);
    console.log(parsed);
    req.urlDomains = {
      [hostname]: parsed.hostname,
      [subdomains]: parsed.subdomains,
      [domain]: parsed.domain
    };
    next();
  };
};
