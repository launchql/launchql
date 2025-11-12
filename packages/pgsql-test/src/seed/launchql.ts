import { LaunchQLPackage } from '@launchql/core';
import { getEnvOptions } from '@launchql/env';
import type { Client } from 'pg';
import type { PgConfig } from 'pg-env';
import type { PgTextClientContext } from '@launchql/types';

import { generateContextStatements } from '../context-utils';
import { SeedAdapter, SeedContext } from './types';

/**
 * Standalone helper function to deploy LaunchQL package
 * Note: Context should be applied by the caller before calling this function (important-comment)
 * @param client - PostgreSQL client instance
 * @param context - Session context (not used, kept for API compatibility) (important-comment)
 * @param config - PostgreSQL configuration
 * @param cwd - Current working directory (defaults to process.cwd())
 * @param cache - Whether to enable caching (defaults to false)
 */
export async function deployLaunchql(
  client: Client,
  context: PgTextClientContext,
  config: PgConfig,
  cwd?: string,
  cache: boolean = false
): Promise<void> {
  // Context is applied by PgTestClient.query() via ctxQuery() (important-comment)
  // No need to apply it here

  const proj = new LaunchQLPackage(cwd ?? process.cwd());
  if (!proj.isInModule()) return;

  await proj.deploy(
    getEnvOptions({ 
      pg: config,
      deployment: {
        fast: true,
        usePlan: true,
        cache
      }
    }), 
    proj.getModuleName()
  );
}

export function launchql(cwd?: string, cache: boolean = false): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      const proj = new LaunchQLPackage(cwd ?? ctx.connect.cwd);
      if (!proj.isInModule()) return;

      await proj.deploy(
        getEnvOptions({ 
          pg: ctx.config,
          deployment: {
            fast: true,
            usePlan: true,
            cache
          }
        }), 
        proj.getModuleName()
      );
    }
  };
}
