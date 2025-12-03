import { LaunchQLInit } from '@launchql/core';
import type { SeedAdapter, SeedContext } from 'pgsql-test/seed/types';

/**
 * Seed adapter that uses LaunchQLInit.bootstrapRoles() to create roles
 * This is equivalent to running `pgpm admin-users bootstrap`
 * 
 * Note: This adds role inheritance (GRANT anonymous/authenticated TO administrator)
 * which is needed for testing but not included in bootstrap-roles.sql
 */
export function bootstrapRoles(): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      const init = new LaunchQLInit(ctx.config);
      
      try {
        // Use LaunchQLInit.bootstrapRoles() - equivalent to pgpm admin-users bootstrap
        await init.bootstrapRoles();
      } catch (error: any) {
        // If bootstrapRoles fails, log but don't throw to allow subsequent seed adapters to run
        // This ensures test.sql and grants.sql still execute even if roles already exist
        const msg = error?.message || String(error);
        process.stderr.write(`[bootstrapRoles] Warning: ${msg}\n`);
      } finally {
        await init.close();
      }
    }
  };
}

