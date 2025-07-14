import { resolve } from 'path';
import { spawn } from 'child_process';

import { errors, LaunchQLOptions } from '@launchql/types';
import { getSpawnEnvWithPg } from 'pg-env';
import { LaunchQLProject } from '../class/launchql';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { verifyModule } from '../migrate/verify-module';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('verify');

export const verifyProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string,
  options?: { useSqitch?: boolean }
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

  log.success(`🔎 Verifying deployment of ${name} on database ${database}...`);

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const query = `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`;
        log.info(`🔍 Verifying external extension: ${extension}`);
        log.debug(`> ${query}`);
        await pgPool.query(query, [extension]);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        log.info(`📂 Verifying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);
        log.debug(`→ Command: launchql migrate verify db:pg:${database}`);

        try {
          if (options?.useSqitch) {
            // Use legacy sqitch
            const env = getSpawnEnvWithPg(opts.pg);
            await new Promise<void>((resolve, reject) => {
              const child = spawn('sqitch', ['verify', '--plan-file', 'launchql.plan', `db:pg:${database}`], {
                cwd: modulePath,
                env
              });
              
              child.stdout.on('data', (data) => {
                log.debug(data.toString().trim());
              });
              
              child.stderr.on('data', (data) => {
                log.error(data.toString().trim());
              });
              
              child.on('close', (code) => {
                if (code === 0) {
                  resolve();
                } else {
                  reject(new Error(`sqitch verify exited with code ${code}`));
                }
              });
            });
          } else {
            // Use new migration system
            await verifyModule(opts.pg, database, modulePath);
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
