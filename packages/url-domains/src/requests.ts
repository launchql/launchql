import { Request } from 'express';

import { parseUrl } from './urls';

export const parseReq = (req: Request) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  return parseUrl(fullUrl);
};
