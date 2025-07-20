import { Logger } from '@launchql/logger';
import { errors, LaunchQLOptions } from '@launchql/types';
import {resolve } from 'path';
import * as path from 'path';
import { getPgPool } from 'pg-cache';
import {PgConfig } from 'pg-env';

import { LaunchQLProject } from '../core/class/launchql';
import { LaunchQLMigrate } from '../migrate/client';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('revert');

export const revertProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  project: LaunchQLProject,
  options?: { 
    useTransaction?: boolean;
    /**
     * Revert to a specific change (exclusive - this change will NOT be reverted)
     * Can be a change name or a tag reference (e.g., '@v1.0.0')
     */
    toChange?: string;
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

  log.success(`🧹 Starting revert process on database ${database}...`);

  const reversedExtensions = [...extensions.resolved].reverse();

  for (const extension of reversedExtensions) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `DROP EXTENSION IF EXISTS "${extension}" RESTRICT;`;
        log.warn(`⚠️ Dropping external extension: ${extension}`);
        log.debug(`> ${msg}`);
        try {
          await pgPool.query(msg);
        } catch (err: any) {
          if (err.code === '2BP01') { // dependent_objects_still_exist
            log.warn(`⚠️ Cannot drop extension ${extension} due to dependencies, skipping`);
          } else {
            throw err;
          }
        }
      } else {
        const modulePath = resolve(project.workspacePath!, modules[extension].path);
        log.info(`📂 Reverting local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);

        // Use new migration system
        log.debug(`→ Command: launchql migrate revert db:pg:${database}`);
        
        try {
          const client = new LaunchQLMigrate(opts.pg as PgConfig);
          
          const result = await client.revert({
            modulePath,
            toChange: options?.toChange,
            useTransaction: options?.useTransaction
          });
          
          if (result.failed) {
            throw new Error(`Revert failed at change: ${result.failed}`);
          }
        } catch (revertError) {
          log.error(`❌ Revert failed for module ${extension}`);
          throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
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
