import { resolve } from 'path';
import { spawn } from 'child_process';

import { errors, LaunchQLOptions } from '@launchql/types';
import { getSpawnEnvWithPg } from 'pg-env';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { deployCommand } from '@launchql/migrate';
import { LaunchQLProject } from '../class/launchql';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('deploy');

export const deploy = async (
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

        if (options?.useSqitch) {
          // Use legacy sqitch
          log.debug(`→ Command: sqitch deploy db:pg:${database}`);
          
          const child = spawn('sqitch', ['deploy', `db:pg:${database}`], {
            cwd: modulePath,
            env: getSpawnEnvWithPg(opts.pg)
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
                log.error(text); // non-warning stderr
              }
            });

            child.stdout.pipe(process.stdout);

            child.on('close', resolve);
            child.on('error', reject);
          });

          if (exitCode !== 0) {
            log.error(`❌ Deployment failed for module ${extension}`);
            throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
          }
        } else {
          // Use new migration system
          log.debug(`→ Command: launchql migrate deploy db:pg:${database}`);
          
          try {
            await deployCommand(opts.pg, database, modulePath);
          } catch (deployError) {
            log.error(`❌ Deployment failed for module ${extension}`);
            throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
          }
        }
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
