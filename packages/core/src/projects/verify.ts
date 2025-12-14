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

const log = new Logger('verify');

export const verifyProject = async (
  opts: PgpmOptions,
  name: string,
  database: string,
  pkg: PgpmPackage,
  options?: { 
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

  log.success(`🔎 Verifying deployment of ${name} on database ${database}...`);

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const query = `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`;
        log.info(`🔍 Verifying external extension: ${extension}`);
        log.debug(`> ${query}`);
        await pgPool.query(query, [extension]);
      } else {
        const modulePath = resolve(pkg.workspacePath!, modules[extension].path);
        log.info(`📂 Verifying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);
        log.debug(`→ Command: launchql migrate verify db:pg:${database}`);

        try {
          const client = new PgpmMigrate(opts.pg as PgConfig);
          
          const result = await client.verify({
            modulePath
          });
          
          if (result.failed.length > 0) {
            throw errors.OPERATION_FAILED({ operation: 'Verification', reason: `${result.failed.length} changes: ${result.failed.join(', ')}` });
          }
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
