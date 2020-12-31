import env from './env';
import pg from 'pg';
import { pgCache } from './lru';

export const getDbString = (db) =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

export const getRootPgPool = (dbname) => {
  let pgPool;
  if (pgCache.has(dbname)) {
    pgPool = pgCache.get(dbname);
  } else {
    pgPool = new pg.Pool({
      connectionString: getDbString(dbname)
    });
    pgCache.set(dbname, pgPool);
  }
  return pgPool;
};
