import { SeedAdapter, SeedContext } from './types';
import { getEnvOptions } from '@launchql/types';
import { LaunchQLProject } from '@launchql/core';

export function sqitch(cwd?: string): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      const proj = new LaunchQLProject(cwd ?? ctx.connect.cwd);
      if (!proj.isInModule()) return;
      await proj.deploy(
        getEnvOptions({ 
          pg: ctx.config,
          deployment: {
            fast: false
          }
        }),
        proj.getModuleName(),
        ctx.config.database
      );
    }
  };
}
