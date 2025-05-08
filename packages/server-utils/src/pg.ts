import { env } from './env';
import pg from 'pg';
import { pgCache } from './lru';

export const getDbString = (db: string): string =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

export const getRootPgPool = (dbname: string): pg.Pool => {
  if (pgCache.has(dbname)) {
    const cached = pgCache.get(dbname);
    if (cached) return cached as pg.Pool;
  }

  const pgPool = new pg.Pool({
    connectionString: getDbString(dbname),
  });

  pgCache.set(dbname, pgPool);
  return pgPool;
};
