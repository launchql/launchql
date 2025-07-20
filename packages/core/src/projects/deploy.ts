import { Logger } from '@launchql/logger';
import { errors, getEnvOptions,LaunchQLOptions } from '@launchql/types';
import {resolve } from 'path';
import * as path from 'path';
import { getPgPool } from 'pg-cache';
import {PgConfig } from 'pg-env';

import { LaunchQLProject } from '../core/class/launchql';
import { LaunchQLMigrate } from '../migrate/client';
import { packageModule } from '../packaging/package';

interface Extensions {
  resolved: string[];
  external: string[];
}

// Cache for fast deployment
const deployFastCache: Record<string, Awaited<ReturnType<typeof packageModule>>> = {};

const getCacheKey = (
  pg: PgConfig,
  name: string,
  database: string
): string => {
  const { host, port, user } = pg ?? {};
  return `${host}:${port}:${user}:${database}:${name}`;
};

const log = new Logger('deploy');

export const deployProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  project: LaunchQLProject,
  toChange?: string
): Promise<Extensions> => {
  const mergedOpts = getEnvOptions(opts);
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
        const modulePath = resolve(project.workspacePath!, modules[extension].path);
        log.info(`📂 Deploying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);

        if (mergedOpts.deployment.fast) {
          // Use fast deployment strategy
          const localProject = new LaunchQLProject(modulePath);
          const cacheKey = getCacheKey(mergedOpts.pg as PgConfig, extension, database);
          
          if (mergedOpts.deployment.cache && deployFastCache[cacheKey]) {
            log.warn(`⚡ Using cached pkg for ${extension}.`);
            await pgPool.query(deployFastCache[cacheKey].sql);
            continue;
          }

          let pkg;
          try {
            pkg = await packageModule(localProject.modulePath, { 
              usePlan: mergedOpts.deployment.usePlan, 
              extension: false 
            });
          } catch (err: any) {
            // Build comprehensive error message
            const errorLines = [];
            errorLines.push(`❌ Failed to package module "${extension}" at path: ${modulePath}`);
            errorLines.push(`   Module Path: ${modulePath}`);
            errorLines.push(`   Workspace Path: ${project.workspacePath}`);
            errorLines.push(`   Error Code: ${err.code || 'N/A'}`);
            errorLines.push(`   Error Message: ${err.message || 'Unknown error'}`);
            
            // Provide debugging hints
            if (err.code === 'ENOENT') {
              errorLines.push('💡 Hint: File or directory not found. Check if the module path is correct.');
            } else if (err.code === 'EACCES') {
              errorLines.push('💡 Hint: Permission denied. Check file permissions.');
            } else if (err.message && err.message.includes('launchql.plan')) {
              errorLines.push('💡 Hint: launchql.plan file issue. Check if the plan file exists and is valid.');
            }
            
            // Log the consolidated error message
            log.error(errorLines.join('\n'));
            
            console.error(err); // Preserve full stack trace
            throw errors.DEPLOYMENT_FAILED({ 
              type: 'Deployment', 
              module: extension
            });
          }

          log.debug(`→ Command: sqitch deploy db:pg:${database}`);
          log.debug(`> ${pkg.sql}`);

          await pgPool.query(pkg.sql);

          if (mergedOpts.deployment.cache) {
            deployFastCache[cacheKey] = pkg;
          }
        } else {
          // Use new migration system
          log.debug(`→ Command: launchql migrate deploy db:pg:${database}`);
          
          try {
            const client = new LaunchQLMigrate(mergedOpts.pg as PgConfig);
            
            const result = await client.deploy({
              modulePath,
              toChange,
              useTransaction: mergedOpts.deployment.useTx,
              logOnly: mergedOpts.deployment.logOnly
            });
            
            if (result.failed) {
              throw new Error(`Deployment failed at change: ${result.failed}`);
            }
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
