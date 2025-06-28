import { join } from 'path';
import { existsSync } from 'fs';
import { LaunchQLMigrate } from '../client';
import { MigrateConfig } from '../types';
import { Logger } from '@launchql/server-utils';

const log = new Logger('migrate-verify');

/**
 * Verify command that mimics sqitch verify behavior
 * This is designed to be a drop-in replacement for spawn('sqitch', ['verify', 'db:pg:database'])
 */
export async function verifyCommand(
  config: Partial<MigrateConfig>,
  database: string,
  cwd: string
): Promise<void> {
  const planPath = join(cwd, 'sqitch.plan');
  
  if (!existsSync(planPath)) {
    throw new Error(`No sqitch.plan found in ${cwd}`);
  }
  
  const verifyPath = join(cwd, 'verify');
  if (!existsSync(verifyPath)) {
    log.warn('No verify directory found, nothing to verify');
    return;
  }
  
  // Provide defaults for missing config values
  const fullConfig: MigrateConfig = {
    host: config.host || 'localhost',
    port: config.port || 5432,
    user: config.user || 'postgres',
    password: config.password || '',
    database: config.database || 'postgres'
  };
  
  const client = new LaunchQLMigrate(fullConfig);
  
  try {
    const result = await client.verify({
      project: '', // Will be read from plan file
      targetDatabase: database,
      planPath,
      verifyPath: 'verify'
    });
    
    if (result.failed.length > 0) {
      throw new Error(`Verification failed for ${result.failed.length} changes: ${result.failed.join(', ')}`);
    }
    
    log.info(`Verified ${result.verified.length} changes`);
  } finally {
    // Pool is managed by PgPoolCacheManager, no need to close
  }
}