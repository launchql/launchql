import { join } from 'path';
import { existsSync } from 'fs';
import { LaunchQLMigrate } from '../migrate/client';
import { PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';

const log = new Logger('migrate-deploy');

/**
 * Deploy command that mimics sqitch deploy behavior
 * This is designed to be a drop-in replacement for spawn('sqitch', ['deploy', 'db:pg:database'])
 */
export async function deployModule(
  config: Partial<PgConfig>,
  database: string,
  cwd: string,
  options?: {
    toChange?: string;
    useTransaction?: boolean;
  }
): Promise<void> {
  const planPath = join(cwd, 'launchql.plan');
  
  if (!existsSync(planPath)) {
    throw new Error(`No launchql.plan found in ${cwd}`);
  }
  
  // Provide defaults for missing config values
  const fullConfig: PgConfig = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    // check on this.... WHY so we pass in targetDatabase if it's not used?
    // initialize takes no arguments, and uses this database, while targetDatabase is used for deploy
    // this is a little confusing
    database: database
  };
  
  const client = new LaunchQLMigrate(fullConfig);
  
  try {
    const result = await client.deploy({
      project: '', // Will be read from plan file
      targetDatabase: database,
      planPath,
      toChange: options?.toChange,
      useTransaction: options?.useTransaction
    });
    
    if (result.failed) {
      throw new Error(`Deployment failed at change: ${result.failed}`);
    }
    
    log.info(`Deployed ${result.deployed.length} changes`);
    if (result.skipped.length > 0) {
      log.info(`Skipped ${result.skipped.length} already deployed changes`);
    }
  } finally {
    // Pool is managed by PgPoolCacheManager, no need to close
  }
}
