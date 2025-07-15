import { join } from 'path';
import { existsSync } from 'fs';
import { LaunchQLMigrate } from '@launchql/migrate';
import { MigrateConfig } from '@launchql/migrate';
import { Logger } from '@launchql/logger';

const log = new Logger('migrate-revert');

/**
 * Revert command that mimics sqitch revert behavior
 * This is designed to be a drop-in replacement for spawn('sqitch', ['revert', 'db:pg:database'])
 */
export async function revertModule(
  config: Partial<MigrateConfig>,
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
  const fullConfig: MigrateConfig = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  };
  
  const client = new LaunchQLMigrate(fullConfig);
  
  try {
    const result = await client.revert({
      project: '', // Will be read from plan file
      targetDatabase: database,
      planPath,
      toChange: options?.toChange,
      useTransaction: options?.useTransaction
    });
    
    if (result.failed) {
      throw new Error(`Revert failed at change: ${result.failed}`);
    }
    
    log.info(`Reverted ${result.reverted.length} changes`);
    if (result.skipped.length > 0) {
      log.info(`Skipped ${result.skipped.length} not deployed changes`);
    }
  } finally {
    // Pool is managed by PgPoolCacheManager, no need to close
  }
}