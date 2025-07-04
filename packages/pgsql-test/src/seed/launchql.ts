import { SeedAdapter, SeedContext } from './types';
import { getEnvOptions } from '@launchql/types';
import { LaunchQLProject, deployProject } from '@launchql/core';

export function launchql(cwd?: string, cache: boolean = false): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      const proj = new LaunchQLProject(cwd ?? ctx.connect.cwd);
      if (!proj.isInModule()) return;

      const opts = getEnvOptions({ pg: ctx.config });

      await deployProject(opts, proj.getModuleName(), ctx.config.database, proj.modulePath, {
        fast: true,
        usePlan: true,
        cache
      });
    }
  };
}
