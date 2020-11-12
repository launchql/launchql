import { cache, svcCache } from '@launchql/server-utils';

export const flush = async (req, res, next) => {
  if (req.url === '/flush') {
    // TODO check bearer for a flush?
    cache.del(req.svc_key);
    svcCache.del(req.svc_key);
    return res.status(200).send('OK');
  }
  return next();
};
