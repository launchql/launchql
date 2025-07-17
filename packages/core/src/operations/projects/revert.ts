import { LaunchQLOptions } from '@launchql/types';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';
import { LaunchQLProject } from '../../class/launchql';
import { executeRevertStrategy, StrategyOptions } from '../strategies';

const log = new Logger('revert');

export const revert = async (
  pg: PgConfig,
  name: string,
  database: string,
  dir: string,
  options?: StrategyOptions
): Promise<void> => {
  const mod = new LaunchQLProject(dir);

  const opts = getEnvOptions({ pg });

  const modules = mod.getModuleMap();
  const project = modules[name];
  
  if (!project) {
    throw new Error(`Project "${name}" not found in modules`);
  }

  const extensions = {
    resolved: [name],
    external: [] as string[]
  };

  log.info(`🔄 Reverting project: ${name}`);
  log.debug(`→ Database: ${database}`);
  log.debug(`→ Directory: ${dir}`);
  log.debug(`→ Extensions to revert: ${extensions.resolved.length}`);

  if (extensions.resolved.length === 0) {
    log.info('ℹ️  No extensions to revert');
    return;
  }

  const reversedExtensions = [...extensions.resolved].reverse();

  for (const extension of reversedExtensions) {
    try {
      if (extensions.external.includes(extension)) {
        log.info(`📦 Skipping external extension: ${extension} (cannot revert)`);
      } else {
        const modulePath = mod.modulePath;
        log.info(`📂 Reverting local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);

        await executeRevertStrategy(opts, database, modulePath, options, extension);
      }
    } catch (err) {
      log.error(`🛑 Error during revert: ${err instanceof Error ? err.message : err}`);
      throw err;
    }
  }

  log.info(`✅ Successfully reverted ${extensions.resolved.length} extension(s)`);
};

export const revertProject = revert;
