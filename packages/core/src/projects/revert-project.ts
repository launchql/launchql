import { resolve } from 'path';

import { LaunchQLProject } from '../class/launchql';
import { errors, LaunchQLOptions } from '@launchql/types';
import { PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { revertModule } from '../migrate/revert-module';
import { runSqitch } from '../utils/sqitch-wrapper';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('revert');

export const revertProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string,
  options?: { 
    useSqitch?: boolean; 
    useTransaction?: boolean;
    /**
     * The plan file to use for sqitch operations
     * Defaults to 'launchql.plan'
     */
    planFile?: string;
    /**
     * Revert to a specific change (exclusive - this change will NOT be reverted)
     * Can be a change name or a tag reference (e.g., '@v1.0.0')
     */
    toChange?: string;
  }
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

  const pgPool = getPgPool({
    ...opts.pg,
    database
  });

  log.success(`🧹 Starting revert process on database ${database}...`);

  const reversedExtensions = [...extensions.resolved].reverse();

  for (const extension of reversedExtensions) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `DROP EXTENSION IF EXISTS "${extension}" CASCADE;`;
        log.warn(`⚠️ Dropping external extension: ${extension}`);
        log.debug(`> ${msg}`);
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        log.info(`📂 Reverting local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);

        if (options?.useSqitch) {
          // Use legacy sqitch
          const planFile = options.planFile || 'launchql.plan';
          const sqitchArgs = options?.toChange ? [options.toChange] : [];
          log.debug(`→ Command: sqitch revert --plan-file ${planFile} db:pg:${database} -y${sqitchArgs.length ? ' ' + sqitchArgs.join(' ') : ''}`);

          try {
            const exitCode = await runSqitch('revert', database, modulePath, opts.pg as PgConfig, {
              planFile,
              confirm: true,
              args: sqitchArgs
            });
            
            if (exitCode !== 0) {
              log.error(`❌ Revert failed for module ${extension}`);
              throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
            }
          } catch (err) {
            log.error(`❌ Revert failed for module ${extension}`);
            throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
          }
        } else {
          // Use new migration system
          log.debug(`→ Command: launchql migrate revert db:pg:${database}`);
          
          try {
            await revertModule(opts.pg, database, modulePath, { 
              useTransaction: options?.useTransaction,
              toChange: options?.toChange
            });
          } catch (revertError) {
            log.error(`❌ Revert failed for module ${extension}`);
            throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
          }
        }
      }
    } catch (e) {
      log.error(`🛑 Error during revert: ${e instanceof Error ? e.message : e}`);
      console.error(e); // optional raw stack trace
      throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
    }
  }

  log.success(`✅ Revert complete for ${name}.`);
  return extensions;
};
