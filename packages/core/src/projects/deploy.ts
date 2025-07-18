import { resolve } from 'path';

import { errors, LaunchQLOptions } from '@launchql/types';
import { PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';
import { getPgPool } from 'pg-cache';
import { deployModule } from '../modules/deploy';
import { LaunchQLProject } from '../core/class/launchql';
import { packageModule } from '../packaging/package';
import { runSqitch } from '../utils/sqitch-wrapper';

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
  dir: string,
  options?: { 
    useSqitch?: boolean;
    useTransaction?: boolean;
    /**
     * If true, use the fast deployment strategy
     * This will skip the sqitch deployment and new migration system and simply deploy the packaged sql
     * Defaults to true for launchql
     */
    fast?: boolean;
    /**
     * if fast is true, you can choose to use the plan file or simply leverage the dependencies
     */
    usePlan?: boolean;
    /**
     * if fast is true, you can choose to cache the packaged module
     */
    cache?: boolean;
    /**
     * The plan file to use for sqitch operations
     * Defaults to 'launchql.plan'
     */
    planFile?: string;
    /**
     * Deploy up to a specific change (inclusive)
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

        if (options?.fast ?? true) {
          // Use fast deployment strategy
          const localProject = new LaunchQLProject(modulePath);
          const cacheKey = getCacheKey(opts.pg as PgConfig, extension, database);
          
          if (options?.cache && deployFastCache[cacheKey]) {
            log.warn(`⚡ Using cached pkg for ${extension}.`);
            await pgPool.query(deployFastCache[cacheKey].sql);
            continue;
          }

          let pkg;
          try {
            pkg = await packageModule(localProject.modulePath, { 
              usePlan: options?.usePlan ?? true, 
              extension: false 
            });
          } catch (err: any) {
            const isDebugMode = process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
            
            log.error(`❌ Failed to package module "${extension}" at path: ${modulePath}`);
            log.error(`   Error: ${err instanceof Error ? err.message : String(err)}`);
            
            if (isDebugMode) {
              log.error(`   Module path: ${modulePath}`);
              log.error(`   Extension: ${extension}`);
              if (err.code) {
                log.error(`   Error code: ${err.code}`);
              }
              if (err.stack) {
                log.error(`   Stack trace: ${err.stack}`);
              }
              console.error('Full packaging error context:', err);
            } else {
              console.error(err); // Preserve full stack trace
            }
            
            throw errors.DEPLOYMENT_FAILED({ 
              type: 'Deployment', 
              module: extension,
              ...(isDebugMode && { originalError: err })
            });
          }

          log.debug(`→ Command: sqitch deploy db:pg:${database}`);
          log.debug(`> ${pkg.sql}`);

          await pgPool.query(pkg.sql);

          if (options?.cache) {
            deployFastCache[cacheKey] = pkg;
          }
        } else if (options?.useSqitch) {
          // Use legacy sqitch
          const planFile = options.planFile || 'launchql.plan';
          const sqitchArgs = options?.toChange ? [options.toChange] : [];
          log.debug(`→ Command: sqitch deploy --plan-file ${planFile} db:pg:${database}${sqitchArgs.length ? ' ' + sqitchArgs.join(' ') : ''}`);
          
          try {
            const exitCode = await runSqitch('deploy', database, modulePath, opts.pg as PgConfig, {
              planFile,
              args: sqitchArgs
            });
            
            if (exitCode !== 0) {
              log.error(`❌ Deployment failed for module ${extension}`);
              throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
            }
          } catch (err: any) {
            const isDebugMode = process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
            
            log.error(`❌ Deployment failed for module ${extension}`);
            
            if (isDebugMode) {
              log.error(`   Module path: ${modulePath}`);
              log.error(`   Error: ${err instanceof Error ? err.message : String(err)}`);
              if (err.code) {
                log.error(`   Error code: ${err.code}`);
              }
              if (err.changeName) {
                log.error(`   Failed change: ${err.changeName}`);
              }
              console.error('Full sqitch deployment error context:', err);
            }
            
            throw errors.DEPLOYMENT_FAILED({ 
              type: 'Deployment', 
              module: extension,
              ...(isDebugMode && { originalError: err })
            });
          }
        } else {
          // Use new migration system
          log.debug(`→ Command: launchql migrate deploy db:pg:${database}`);
          
          try {
            await deployModule(opts.pg, database, modulePath, { 
              useTransaction: options?.useTransaction,
              toChange: options?.toChange
            });
          } catch (deployError: any) {
            const isDebugMode = process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
            
            log.error(`❌ Deployment failed for module ${extension}`);
            
            if (isDebugMode) {
              log.error(`   Module path: ${modulePath}`);
              log.error(`   Error: ${deployError instanceof Error ? deployError.message : String(deployError)}`);
              if (deployError.code) {
                log.error(`   Error code: ${deployError.code}`);
              }
              if (deployError.changeName) {
                log.error(`   Failed change: ${deployError.changeName}`);
              }
              if (deployError.projectName) {
                log.error(`   Project: ${deployError.projectName}`);
              }
              if (deployError.sqlQuery) {
                log.error(`   SQL Query: ${deployError.sqlQuery}`);
              }
              if (deployError.sqlParams) {
                log.error(`   SQL Params: ${JSON.stringify(deployError.sqlParams)}`);
              }
              console.error('Full migration deployment error context:', deployError);
            }
            
            throw errors.DEPLOYMENT_FAILED({ 
              type: 'Deployment', 
              module: extension,
              ...(isDebugMode && { originalError: deployError })
            });
          }
        }
      }
    } catch (err: any) {
      const isDebugMode = process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
      
      log.error(`🛑 Error during deployment: ${err instanceof Error ? err.message : err}`);
      
      if (isDebugMode) {
        log.error(`   Module: ${extension}`);
        if (err.code) {
          log.error(`   Error code: ${err.code}`);
        }
        if (err.changeName) {
          log.error(`   Failed change: ${err.changeName}`);
        }
        if (err.projectName) {
          log.error(`   Project: ${err.projectName}`);
        }
        console.error('Full deployment error context:', err);
      } else {
        console.error(err); // Keep raw error output for stack traces
      }
      
      throw errors.DEPLOYMENT_FAILED({ 
        type: 'Deployment', 
        module: extension,
        ...(isDebugMode && { originalError: err })
      });
    }
  }

  log.success(`✅ Deployment complete for ${name}.`);
  return extensions;
};
