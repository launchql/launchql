import pg from 'pg';
import { getPgEnvOptions, PgConfig } from 'pg-env';

import { pgCache } from './lru';

const getDbString = (
  user: string,
  password: string,
  host: string,
  port: string | number,
  database: string
): string =>
  `postgres://${user}:${password}@${host}:${port}/${database}`;

export const getPgPool = (pgConfig: Partial<PgConfig>): pg.Pool => {
  const config = getPgEnvOptions(pgConfig);
  const { user, password, host, port, database, } = config;
  if (pgCache.has(database)) {
    const cached = pgCache.get(database);
    if (cached) return cached;
  }
  const connectionString = getDbString(user, password, host, port, database);
  const pgPool = new pg.Pool({ connectionString });
  pgCache.set(database, pgPool);
  return pgPool;
};