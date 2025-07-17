import { LaunchQLOptions } from '@launchql/types';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { LaunchQLProject } from '../../class/launchql';
import { executeDeployStrategy, StrategyOptions } from '../strategies';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('deploy');

export const deploy = async (
  pg: PgConfig,
  name: string,
  database: string,
  dir: string,
  options?: StrategyOptions
): Promise<Extensions> => {
  const mod = new LaunchQLProject(dir);

  const opts = getEnvOptions({ pg });
  const pgPool = getPgPool({ ...opts.pg, database });

  const modules = mod.getModuleMap();
  const project = modules[name];
  
  if (!project) {
    throw new Error(`Project "${name}" not found in modules`);
  }

  const extensions = {
    resolved: [name],
    external: [] as string[]
  };

  log.info(`🚀 Deploying project: ${name}`);
  log.debug(`→ Database: ${database}`);
  log.debug(`→ Directory: ${dir}`);
  log.debug(`→ Extensions to deploy: ${extensions.resolved.length}`);

  if (extensions.resolved.length === 0) {
    log.info('ℹ️  No extensions to deploy');
    return extensions;
  }

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        log.info(`📦 Deploying external extension: ${extension}`);
        await pgPool.query(`CREATE EXTENSION IF NOT EXISTS "${extension}"`);
      } else {
        const modulePath = mod.modulePath;
        log.info(`📂 Deploying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);

        await executeDeployStrategy(opts, database, modulePath, options, extension);
      }
    } catch (err) {
      log.error(`🛑 Error during deployment: ${err instanceof Error ? err.message : err}`);
      throw err;
    }
  }

  log.info(`✅ Successfully deployed ${extensions.resolved.length} extension(s)`);
  return extensions;
};

export const deployProject = deploy;
