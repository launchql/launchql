import { join } from 'path';
import { existsSync } from 'fs';
import { LaunchQLMigrate } from '../migrate/client';
import { PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';

const log = new Logger('migrate-verify');

/**
 * Verify command that mimics sqitch verify behavior
 * This is designed to be a drop-in replacement for spawn('sqitch', ['verify', 'db:pg:database'])
 */
export async function verifyModule(
  config: PgConfig,
  cwd: string
): Promise<void> {
  const planPath = join(cwd, 'launchql.plan');
  
  if (!existsSync(planPath)) {
    throw new Error(`No launchql.plan found in ${cwd}`);
  }
  
  // The verify method will handle missing verify scripts per change
  
  const client = new LaunchQLMigrate(config);
  
  try {
    const result = await client.verify({
      project: '', // Will be read from plan file
      targetDatabase: config.database,
      planPath
    });
    
    if (result.failed.length > 0) {
      throw new Error(`Verification failed for ${result.failed.length} changes: ${result.failed.join(', ')}`);
    }
    
    log.info(`Verified ${result.verified.length} changes`);
  } finally {
    // Pool is managed by PgPoolCacheManager, no need to close
  }
}
