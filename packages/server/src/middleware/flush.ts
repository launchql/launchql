import { Request, Response, NextFunction } from 'express';
import { graphileCache, svcCache, getRootPgPool } from '@launchql/server-utils';
import { env } from '../env';

export const flush = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.url === '/flush') {
    // TODO: check bearer for a flush / special key
    graphileCache.delete((req as any).svc_key);
    svcCache.delete((req as any).svc_key);
    res.status(200).send('OK');
    return;
  }
  return next();
};

export const flushService = async (databaseId: string): Promise<void> => {
  const pgPool = getRootPgPool(env.PGDATABASE);
  console.log('flushing db ' + databaseId);

  const api = new RegExp(`^api:${databaseId}:.*`);
  const schemata = new RegExp(`^schemata:${databaseId}:.*`);
  const meta = new RegExp(`^metaschema:api:${databaseId}`);

  if (!env.IS_PUBLIC) {
    graphileCache.forEach((_, k: string) => {
      if (api.test(k) || schemata.test(k) || meta.test(k)) {
        graphileCache.delete(k);
        svcCache.delete(k);
      }
    });
  }

  const svc = await pgPool.query(
    `SELECT *
     FROM meta_public.domains
     WHERE database_id = $1`,
    [databaseId]
  );

  if (svc.rowCount === 0) return;

  for (const row of svc.rows) {
    let key: string | undefined;
    if (row.domain && !row.subdomain) {
      key = row.domain;
    } else if (row.domain && row.subdomain) {
      key = `${row.subdomain}.${row.domain}`;
    }
    if (key) {
      graphileCache.delete(key);
      svcCache.delete(key);
    }
  }
};
