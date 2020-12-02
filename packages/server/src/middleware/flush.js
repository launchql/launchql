import { graphileCache, svcCache, getRootPgPool } from '@launchql/server-utils';
import env from '../env';

export const flush = async (req, res, next) => {
  if (req.url === '/flush') {
    // TODO check bearer for a flush?
    graphileCache.del(req.svc_key);
    svcCache.del(req.svc_key);
    return res.status(200).send('OK');
  }
  return next();
};

// TODO
// - [ ] create a unique svc key that is easy to create from domains/subdomains or service name or other db info
// - [ ] "localhost" is hardcoded into one of the cases below
// - [ ] trigger select pg_notify('schema:update', 'serviceName');

export const flushService = async (serviceName) => {
  const pgPool = getRootPgPool(env.PGDATABASE);

  console.log('implement flushing svc ' + serviceName);

  // // currently uses service.name for flushing
  // let svc = await pgPool.query(
  //   `SELECT * FROM "${env.META_SCHEMA}"."${env.SERVICE_TABLE}"
  //           WHERE name=$1`,
  //   [serviceName]
  // );

  // if (svc.rowCount === 0) {
  //   return;
  // } else {
  //   svc = svc.rows[0];
  //   let key;
  //   if (!svc.domain && svc.subdomain) {
  //     key = [svc.subdomain, 'localhost'].join('.'); // TODO need to set host or create a better key
  //   } else if (svc.domain && !svc.subdomain) {
  //     key = [svc.domain].join('.');
  //   } else if (svc.domain && svc.subdomain) {
  //     key = [svc.subdomain, svc.domain].join('.');
  //   }
  //   if (key) {
  //     graphileCache.del(key);
  //     svcCache.del(key);
  //   }
  // }
};
