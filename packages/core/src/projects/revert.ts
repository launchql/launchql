import { Logger } from '@pgpmjs/logger';
import { errors, PgpmOptions } from '@pgpmjs/types';
import {resolve } from 'path';
import * as path from 'path';
import { getPgPool } from 'pg-cache';
import {PgConfig } from 'pg-env';

import { PgpmPackage } from '../core/class/pgpm';
import { PgpmMigrate } from '../migrate/client';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('revert');

export const revertProject = async (
  opts: PgpmOptions,
  name: string,
  database: string,
  pkg: PgpmPackage,
  options?: { 
    useTransaction?: boolean;
    /**
     * Revert to a specific change (exclusive - this change will NOT be reverted)
     * Can be a change name or a tag reference (e.g., '@v1.0.0')
     */
    toChange?: string;
  }
): Promise<Extensions> => {
  log.info(`🔍 Gathering modules from ${pkg.workspacePath}...`);
  const modules = pkg.getModuleMap();

  if (!modules[name]) {
    log.error(`❌ Module "${name}" not found in modules list.`);
    throw errors.MODULE_NOT_FOUND({ name });
  }

  const modulePath = path.resolve(pkg.workspacePath!, modules[name].path);
  const moduleProject = new PgpmPackage(modulePath);

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
        const modulePath = resolve(pkg.workspacePath!, modules[extension].path);
        log.info(`📂 Reverting local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);

        // Use new migration system
        log.debug(`→ Command: launchql migrate revert db:pg:${database}`);
        
        try {
          const client = new PgpmMigrate(opts.pg as PgConfig);
          
          const result = await client.revert({
            modulePath,
            toChange: options?.toChange,
            useTransaction: options?.useTransaction
          });
          
          if (result.failed) {
            throw errors.OPERATION_FAILED({ operation: 'Revert', target: result.failed });
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
