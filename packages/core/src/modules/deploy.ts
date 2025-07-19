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
  config: PgConfig,
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
  
  const client = new LaunchQLMigrate(config);
  
  try {
    const result = await client.deploy({
      project: '', // Will be read from plan file
      targetDatabase: config.database,
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
