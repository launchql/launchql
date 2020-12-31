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

export const flushService = async (databaseId) => {
  const pgPool = getRootPgPool(env.PGDATABASE);
  console.log('flushing db ' + databaseId);
  const api = new RegExp(`^api:${databaseId}:.*`)
  const schemata = new RegExp(`^schemata:${databaseId}:.*`)
  const meta = new RegExp(`^metaschema:api:${databaseId}`)

  // for private svcs, check cache
  if (!env.IS_PUBLIC) {
    graphileCache.forEach((obj, k) => {
      if (api.test(k) || schemata.test(k) || meta.test(k)) {
        graphileCache.del(k);
        svcCache.del(k);
      } 
    });
  }

  let svc = await pgPool.query(
    `SELECT *
      FROM meta_public.domains
      WHERE database_id=$1`,
    [databaseId]
  );

  if (svc.rowCount === 0) {
    return;
  } else {
    for (const row of svc.rows) {
      let key;
      if (row.domain && !row.subdomain) {
        key = row.domain;
      } else if (row.domain && row.subdomain) {
        key = [row.subdomain, row.domain].join('.');
      }
      if (key) {
        graphileCache.del(key);
        svcCache.del(key);
      }
    }
  }
};
