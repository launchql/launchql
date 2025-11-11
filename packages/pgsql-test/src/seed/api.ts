import { PgTestConnectionOptions } from '@launchql/types';
import { PgConfig } from 'pg-env';

import { DbAdmin } from '../admin';
import { PgTestClient } from '../test-client';
import { seed } from './index';
import { CsvSeedMap, JsonSeedMap, SeedContext, SeedOptions } from './types';

export interface SeedRuntime {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
  db?: PgTestClient;
  currentClient: PgTestClient;
}

export interface PgTestClientSeed {
  csv(map: CsvSeedMap, opts?: SeedOptions): Promise<void>;
  json(map: JsonSeedMap, opts?: SeedOptions): Promise<void>;
  sqlfile(files: string[]): Promise<void>;
  launchql(cwd?: string, cache?: boolean): Promise<void>;
}

export function attachSeedAPI(
  client: PgTestClient,
  runtime: SeedRuntime
): void {
  const seedAPI: PgTestClientSeed = {
    async csv(map: CsvSeedMap, opts: SeedOptions = {}): Promise<void> {
      const targetClient = resolveClient(runtime, opts.client);
      await targetClient.ctxQuery();
      
      const ctx = buildContext(runtime, targetClient);
      await seed.csv(map).seed(ctx);
      
      if (opts.publish) {
        await targetClient.publish();
      }
    },

    async json(map: JsonSeedMap, opts: SeedOptions = {}): Promise<void> {
      const targetClient = resolveClient(runtime, opts.client);
      await targetClient.ctxQuery();
      
      const ctx = buildContext(runtime, targetClient);
      await seed.json(map).seed(ctx);
      
      if (opts.publish) {
        await targetClient.publish();
      }
    },

    async sqlfile(files: string[]): Promise<void> {
      const ctx = buildContext(runtime, runtime.currentClient);
      await seed.sqlfile(files).seed(ctx);
    },

    async launchql(cwd?: string, cache: boolean = false): Promise<void> {
      const ctx = buildContext(runtime, runtime.currentClient);
      await seed.launchql(cwd, cache).seed(ctx);
    }
  };

  (client as any).seed = seedAPI;
}

function buildContext(runtime: SeedRuntime, targetClient: PgTestClient): SeedContext {
  return {
    connect: runtime.connect,
    admin: runtime.admin,
    config: runtime.config,
    pg: targetClient,
    db: runtime.db
  };
}

function resolveClient(runtime: SeedRuntime, clientOption?: 'pg' | 'db'): PgTestClient {
  if (clientOption === 'pg') return runtime.pg;
  if (clientOption === 'db') {
    if (!runtime.db) {
      throw new Error('db client not available in this context');
    }
    return runtime.db;
  }
  return runtime.currentClient;
}
