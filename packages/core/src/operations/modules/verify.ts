import { join } from 'path';
import { existsSync } from 'fs';
import { LaunchQLMigrate } from '../../migrate/client';
import { MigrateConfig } from '../../migrate/types';
import { Logger } from '@launchql/logger';

const log = new Logger('migrate-verify');

/**
 * Verify command that mimics sqitch verify behavior
 * This is designed to be a drop-in replacement for spawn('sqitch', ['verify', 'db:pg:database'])
 */
export async function verifyModule(
  config: any,
  database: string,
  cwd: string
): Promise<void> {
  const planPath = join(cwd, 'launchql.plan');
  
  if (!existsSync(planPath)) {
    throw new Error(`No launchql.plan found in ${cwd}`);
  }
  
  // The verify method will handle missing verify scripts per change
  
  const fullConfig: MigrateConfig = {
    pg: config,
    database: database,
    modulePath: cwd
  };
  
  const client = new LaunchQLMigrate(fullConfig);
  
  try {
    const result = await client.verify({
      project: '', // Will be read from plan file
      targetDatabase: database,
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
