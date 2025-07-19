import { SeedAdapter, SeedContext } from './types';
import { getEnvOptions } from '@launchql/types';
import { LaunchQLProject } from '@launchql/core';

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
