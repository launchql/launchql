import { PgConfig } from "@launchql/types";
import { DbAdmin } from "./admin";
import { PgTestClient } from "./test-client";

interface SeedContext {
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
}

export interface SeedAdapter {
  seed(ctx: SeedContext): Promise<void> | void;
}

function sqlfile(files: string[]): SeedAdapter {
  return {
    seed(ctx) {
      for (const file of files) {
        ctx.admin.loadSql(file, ctx.config.database);
      }
    }
  };
}

function fn(
  fn: (ctx: SeedContext) => Promise<void>
): SeedAdapter {
  return {
    seed: fn
  };
}

function csv(
  fn: (ctx: SeedContext) => Promise<void>
): SeedAdapter {
  throw new Error('not yet implemented');
  return {
    seed: fn
  };
}

function compose(adapters: SeedAdapter[]): SeedAdapter {
  return {
    async seed(ctx) {
      for (const adapter of adapters) {
        await adapter.seed(ctx);
      }
    }
  };
}

export const seed = {
  compose,
  fn,
  csv,
  sqlfile
};