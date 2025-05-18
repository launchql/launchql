import { SeedAdapter, SeedContext } from './types';
import { getEnvOptions } from '@launchql/types';
import { LaunchQLProject, deploy } from '@launchql/migrate';

export function sqitch(cwd?: string): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
        const proj = new LaunchQLProject(cwd ?? ctx.connect.cwd);
      if (!proj.isInModule()) return;
      const opts = getEnvOptions({ pg: ctx.config });
      await deploy(opts, proj.getModuleName(), ctx.config.database, proj.modulePath);
    }
  };
}
