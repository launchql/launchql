import { parseUrl } from './urls';
import { Request } from 'express';

export const parseReq = (req: Request) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  return parseUrl(fullUrl);
};
