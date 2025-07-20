import { LaunchQLProject } from '@launchql/core';
import { getEnvOptions } from '@launchql/types';

import { SeedAdapter, SeedContext } from './types';

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
