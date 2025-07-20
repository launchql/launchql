import { LaunchQLProject } from '@launchql/core';
import { getEnvOptions } from '@launchql/env';

import { SeedAdapter, SeedContext } from './types';

export function launchql(cwd?: string, cache: boolean = false): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      const proj = new LaunchQLProject(cwd ?? ctx.connect.cwd);
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
