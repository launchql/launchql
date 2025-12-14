import { PgpmPackage } from '@pgpmjs/core';
import { getEnvOptions } from '@pgpmjs/env';
import type { PgConfig } from 'pg-env';

import { SeedAdapter, SeedContext } from './types';

/**
 * Standalone helper function to deploy LaunchQL package
 * @param config - PostgreSQL configuration
 * @param cwd - Current working directory (defaults to process.cwd())
 * @param cache - Whether to enable caching (defaults to false)
 */
export async function deployLaunchql(
  config: PgConfig,
  cwd?: string,
  cache: boolean = false
): Promise<void> {
  const proj = new PgpmPackage(cwd ?? process.cwd());
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
      await deployLaunchql(ctx.config, cwd ?? ctx.connect.cwd, cache);
    }
  };
}
