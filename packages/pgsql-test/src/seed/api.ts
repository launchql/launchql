import { PgTestConnectionOptions } from '@launchql/types';
import { PgConfig } from 'pg-env';

import { DbAdmin } from '../admin';
import { PgTestClient } from '../test-client';
import { seed } from './index';
import { CsvSeedMap, JsonSeedMap, SeedContext } from './types';

export interface SeedRuntime {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
  db?: PgTestClient;
  currentClient: PgTestClient;
}

export interface PgTestClientSeed {
  csv(map: CsvSeedMap): Promise<void>;
  json(map: JsonSeedMap): Promise<void>;
  sqlfile(files: string[]): Promise<void>;
  launchql(cwd?: string, cache?: boolean): Promise<void>;
}

export function attachSeedAPI(
  client: PgTestClient,
  runtime: SeedRuntime
): void {
  const seedAPI: PgTestClientSeed = {
    async csv(map: CsvSeedMap): Promise<void> {
      await runtime.currentClient.ctxQuery();
      const ctx = buildContext(runtime);
      await seed.csv(map).seed(ctx);
    },

    async json(map: JsonSeedMap): Promise<void> {
      await runtime.currentClient.ctxQuery();
      const ctx = buildContext(runtime);
      await seed.json(map).seed(ctx);
    },

    async sqlfile(files: string[]): Promise<void> {
      const ctx = buildContext(runtime);
      await seed.sqlfile(files).seed(ctx);
    },

    async launchql(cwd?: string, cache: boolean = false): Promise<void> {
      const ctx = buildContext(runtime);
      await seed.launchql(cwd, cache).seed(ctx);
    }
  };

  (client as any).seed = seedAPI;
}

function buildContext(runtime: SeedRuntime): SeedContext {
  return {
    connect: runtime.connect,
    admin: runtime.admin,
    config: runtime.config,
    pg: runtime.currentClient,
    db: runtime.db
  };
}
