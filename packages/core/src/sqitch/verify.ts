import { resolve } from 'path';
import { spawn } from 'child_process';
import pg from 'pg';

import { errors, getSpawnEnvWithPg, LaunchQLOptions } from '@launchql/types';
import { LaunchQLProject } from '../class/launchql';
import { getRootPgPool, Logger } from '@launchql/server-utils';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('verify');

export const verify = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string
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

  const pgPool = getRootPgPool({
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
        log.debug(`→ Command: sqitch verify db:pg:${database}`);

        const child = spawn('sqitch', ['verify', `db:pg:${database}`], {
          cwd: modulePath,
          env: getSpawnEnvWithPg(opts.pg),
        });

        const exitCode: number = await new Promise((resolve, reject) => {
          child.stdout.setEncoding('utf-8');
          child.stderr.setEncoding('utf-8');

          child.stderr.on('data', (chunk: Buffer | string) => {
            const text = chunk.toString();
            if (/error/i.test(text)) {
              log.error(text);
            } else if (/warning/i.test(text)) {
              log.warn(text);
            } else {
              log.error(text); // stderr fallback
            }
          });

          child.stdout.pipe(process.stdout);
          child.on('close', resolve);
          child.on('error', reject);
        });

        if (exitCode !== 0) {
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
