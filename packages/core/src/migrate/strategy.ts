import { PgConfig } from 'pg-env';
import { LaunchQLOptions } from '@launchql/types';
import { deployModule } from './deploy-module';
import { revertModule } from './revert-module';
import { verifyModule } from './verify-module';
import { runSqitch } from '../utils/sqitch-wrapper';
import { packageModule } from '../package';
import { LaunchQLProject } from '../class/launchql';
import { getPgPool } from 'pg-cache';
import { Logger } from '@launchql/logger';
import { errors } from '@launchql/types';

const log = new Logger('migration-strategy');

export interface StrategyOptions {
  useSqitch?: boolean;
  useTransaction?: boolean;
  fast?: boolean;
  usePlan?: boolean;
  cache?: boolean;
  planFile?: string;
  toChange?: string;
}

const deployFastCache: Record<string, Awaited<ReturnType<typeof packageModule>>> = {};

const getCacheKey = (
  pg: PgConfig,
  name: string,
  database: string
): string => {
  const { host, port, user } = pg ?? {};
  return `${host}:${port}:${user}:${database}:${name}`;
};

async function executeFastDeploy(
  opts: LaunchQLOptions,
  database: string,
  modulePath: string,
  options: StrategyOptions,
  extensionName?: string
): Promise<void> {
  const pgPool = getPgPool({ ...opts.pg, database });
  
  const cacheKey = extensionName ? getCacheKey(opts.pg as PgConfig, extensionName, database) : '';
  
  if (options.cache && cacheKey && deployFastCache[cacheKey]) {
    log.warn(`⚡ Using cached pkg for ${extensionName}.`);
    await pgPool.query(deployFastCache[cacheKey].sql);
    return;
  }

  let pkg;
  try {
    pkg = await packageModule(modulePath, { 
      usePlan: options.usePlan ?? true, 
      extension: false 
    });
  } catch (err) {
    log.error(`❌ Failed to package module at path: ${modulePath}`);
    log.error(`   Error: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }

  log.debug(`→ Command: sqitch deploy db:pg:${database}`);
  log.debug(`> ${pkg.sql}`);

  await pgPool.query(pkg.sql);

  if (options.cache && cacheKey) {
    deployFastCache[cacheKey] = pkg;
  }
}

export async function executeDeployStrategy(
  opts: LaunchQLOptions | PgConfig,
  database: string,
  modulePath: string,
  options: StrategyOptions = {},
  extensionName?: string
): Promise<void> {
  if (options.fast ?? true) {
    await executeFastDeploy(opts as LaunchQLOptions, database, modulePath, options, extensionName);
  } else if (options.useSqitch) {
    const planFile = options.planFile || 'launchql.plan';
    const sqitchArgs = options.toChange ? [options.toChange] : [];
    log.debug(`→ Command: sqitch deploy --plan-file ${planFile} db:pg:${database}${sqitchArgs.length ? ' ' + sqitchArgs.join(' ') : ''}`);
    
    try {
      const exitCode = await runSqitch('deploy', database, modulePath, opts as PgConfig, {
        planFile,
        args: sqitchArgs
      });
      
      if (exitCode !== 0) {
        log.error(`❌ Deployment failed for module ${extensionName || 'unknown'}`);
        throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extensionName || 'unknown' });
      }
    } catch (err) {
      log.error(`❌ Deployment failed for module ${extensionName || 'unknown'}`);
      throw err;
    }
  } else {
    log.debug(`→ Command: launchql migrate deploy db:pg:${database}`);
    
    try {
      await deployModule(opts as PgConfig, database, modulePath, { 
        useTransaction: options.useTransaction,
        toChange: options.toChange
      });
    } catch (deployError) {
      log.error(`❌ Deployment failed for module ${extensionName || 'unknown'}`);
      throw deployError;
    }
  }
}

export async function executeRevertStrategy(
  opts: LaunchQLOptions | PgConfig,
  database: string,
  modulePath: string,
  options: StrategyOptions = {},
  extensionName?: string
): Promise<void> {
  if (options.useSqitch) {
    const planFile = options.planFile || 'launchql.plan';
    const sqitchArgs = options.toChange ? [options.toChange] : [];
    log.debug(`→ Command: sqitch revert --plan-file ${planFile} db:pg:${database} -y${sqitchArgs.length ? ' ' + sqitchArgs.join(' ') : ''}`);

    try {
      const exitCode = await runSqitch('revert', database, modulePath, opts as PgConfig, {
        planFile,
        confirm: true,
        args: sqitchArgs
      });
      
      if (exitCode !== 0) {
        log.error(`❌ Revert failed for module ${extensionName || 'unknown'}`);
        throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extensionName || 'unknown' });
      }
    } catch (err) {
      log.error(`❌ Revert failed for module ${extensionName || 'unknown'}`);
      throw err;
    }
  } else {
    log.debug(`→ Command: launchql migrate revert db:pg:${database}`);
    
    try {
      await revertModule(opts as PgConfig, database, modulePath, { 
        useTransaction: options.useTransaction,
        toChange: options.toChange
      });
    } catch (revertError) {
      log.error(`❌ Revert failed for module ${extensionName || 'unknown'}`);
      throw revertError;
    }
  }
}

export async function executeVerifyStrategy(
  opts: LaunchQLOptions | PgConfig,
  database: string,
  modulePath: string,
  options: StrategyOptions = {},
  extensionName?: string
): Promise<void> {
  if (options.useSqitch) {
    const planFile = options.planFile || 'launchql.plan';
    log.debug(`→ Command: sqitch verify --plan-file ${planFile} db:pg:${database}`);
    
    try {
      const exitCode = await runSqitch('verify', database, modulePath, opts as PgConfig, {
        planFile
      });
      
      if (exitCode !== 0) {
        throw new Error(`sqitch verify exited with code ${exitCode}`);
      }
    } catch (err) {
      throw new Error(`Verification failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    await verifyModule(opts as PgConfig, database, modulePath);
  }
}
