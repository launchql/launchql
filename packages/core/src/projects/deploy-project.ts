import { resolve } from 'path';

import { errors, LaunchQLOptions } from '@launchql/types';
import { PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { LaunchQLProject } from '../class/launchql';
import { executeDeployStrategy, StrategyOptions } from '../migrate/strategy';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('deploy');

export const deployProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string,
  options?: StrategyOptions
): Promise<Extensions> => {
  const mod = new LaunchQLProject(dir);

  log.info(`🔍 Gathering modules from ${dir}...`);
  const modules = mod.getModuleMap();

  if (!modules[name]) {
    log.error(`❌ Module "${name}" not found in modules list.`);
    throw new Error(`Module "${name}" does not exist.`);
  }

  log.info(`📦 Resolving dependencies for ${name}...`);
  const extensions: Extensions = mod.getModuleExtensions();

  const pgPool = getPgPool({ ...opts.pg, database });

  log.success(`🚀 Starting deployment to database ${database}...`);

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
        log.info(`📥 Installing external extension: ${extension}`);
        log.debug(`> ${msg}`);
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        log.info(`📂 Deploying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);

        await executeDeployStrategy(opts, database, modulePath, options, extension);
      }
    } catch (err) {
      log.error(`🛑 Error during deployment: ${err instanceof Error ? err.message : err}`);
      console.error(err); // Keep raw error output for stack traces
      throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
    }
  }

  log.success(`✅ Deployment complete for ${name}.`);
  return extensions;
};
