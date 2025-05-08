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

export const middleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.urlDomains = parseReq(req);
    next();
  };
};
