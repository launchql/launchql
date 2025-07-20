import { SeedAdapter, SeedContext } from './types';

export function sqlfile(files: string[]): SeedAdapter {
  return {
    seed(ctx) {
      for (const file of files) {
        ctx.admin.loadSql(file, ctx.config.database);
      }
    }
  };
}

export function fn(
  fn: (ctx: SeedContext) => Promise<void>
): SeedAdapter {
  return {
    seed: fn
  };
}

export function compose(adapters: SeedAdapter[]): SeedAdapter {
  return {
    async seed(ctx) {
      for (const adapter of adapters) {
        await adapter.seed(ctx);
      }
    }
  };
}