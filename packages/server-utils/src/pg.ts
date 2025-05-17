import pg from 'pg';
import { pgCache } from './lru';

import { PgConfig } from '@launchql/types';

export const getDbString = (
  user: string,
  password: string,
  host: string,
  port: string | number,
  database: string
): string =>
  `postgres://${user}:${password}@${host}:${port}/${database}`;

export const getRootPgPool = ({
  user,
  password,
  host,
  port,
  database,
}: PgConfig): pg.Pool => {
  if (pgCache.has(database)) {
    const cached = pgCache.get(database);
    if (cached) return cached;
  }

  const connectionString = getDbString(user, password, host, port, database);
  const pgPool = new pg.Pool({ connectionString });

  pgCache.set(database, pgPool);
  return pgPool;
};
