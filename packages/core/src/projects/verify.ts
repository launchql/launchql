import { resolve } from 'path';
import * as path from 'path';

import { errors, LaunchQLOptions } from '@launchql/types';
import { PgConfig, getPgEnvOptions } from 'pg-env';
import { LaunchQLProject } from '../core/class/launchql';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { verifyModule } from '../modules/verify';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('verify');

export const verifyProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  project: LaunchQLProject,
  options?: { 
  }
): Promise<Extensions> => {
  log.info(`🔍 Gathering modules from ${project.workspacePath}...`);
  const modules = project.getModuleMap();

  if (!modules[name]) {
    log.error(`❌ Module "${name}" not found in modules list.`);
    throw new Error(`Module "${name}" does not exist.`);
  }

  const modulePath = path.resolve(project.workspacePath!, modules[name].path);
  const moduleProject = new LaunchQLProject(modulePath);

  log.info(`📦 Resolving dependencies for ${name}...`);
  const extensions: Extensions = moduleProject.getModuleExtensions();

  const pgPool = getPgPool({
    ...opts.pg,
    database
  });

  log.success(`🔎 Verifying deployment of ${name} on database ${database}...`);

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const query = `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`;
        log.info(`🔍 Verifying external extension: ${extension}`);
        log.debug(`> ${query}`);
        await pgPool.query(query, [extension]);
      } else {
        const modulePath = resolve(project.workspacePath!, modules[extension].path);
        log.info(`📂 Verifying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);
        log.debug(`→ Command: launchql migrate verify db:pg:${database}`);

        try {
          // Use new migration system
          await verifyModule(getPgEnvOptions(opts.pg), modulePath);
        } catch (verifyError) {
          log.error(`❌ Verification failed for module ${extension}`);
          throw errors.DEPLOYMENT_FAILED({ type: 'Verify', module: extension });
        }
      }
    } catch (e) {
      log.error(`🛑 Error during verification: ${e instanceof Error ? e.message : e}`);
      console.error(e);
      throw errors.DEPLOYMENT_FAILED({ type: 'Verify', module: extension });
    }
  }

  log.success(`✅ Verification complete for ${name}.`);
  return extensions;
};
