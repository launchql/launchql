import { PgTestConnectionOptions } from '@launchql/types';
import { PgConfig } from 'pg-env';

import { DbAdmin } from '../admin';
import { PgTestClient } from '../test-client';

export interface SeedContext {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
  db?: PgTestClient;  // Optional app user client (available at runtime)
}

export interface SeedAdapter {
  seed(ctx: SeedContext): Promise<void> | void;
}

export type CsvSeedMap = Record<string, string>;  // table -> csvPath
export type JsonSeedMap = Record<string, Record<string, any>[]>;  // table -> rows

export interface SeedOptions {
  client?: 'pg' | 'db';  // Which client to use for execution
  publish?: boolean;  // Whether to commit data for visibility to other connections
}
