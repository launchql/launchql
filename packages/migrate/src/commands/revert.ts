import { join } from 'path';
import { existsSync } from 'fs';
import { LaunchQLMigrate } from '../client';
import { MigrateConfig } from '../types';
import { Logger } from '@launchql/server-utils';

const log = new Logger('migrate-revert');

/**
 * Revert command that mimics sqitch revert behavior
 * This is designed to be a drop-in replacement for spawn('sqitch', ['revert', 'db:pg:database'])
 */
export async function revertCommand(
  config: MigrateConfig,
  database: string,
  cwd: string,
  options?: {
    toChange?: string;
  }
): Promise<void> {
  const planPath = join(cwd, 'sqitch.plan');
  
  if (!existsSync(planPath)) {
    throw new Error(`No sqitch.plan found in ${cwd}`);
  }
  
  const client = new LaunchQLMigrate(config);
  
  try {
    const result = await client.revert({
      project: '', // Will be read from plan file
      targetDatabase: database,
      planPath,
      revertPath: 'revert',
      toChange: options?.toChange
    });
    
    if (result.failed) {
      throw new Error(`Revert failed at change: ${result.failed}`);
    }
    
    log.info(`Reverted ${result.reverted.length} changes`);
    if (result.skipped.length > 0) {
      log.info(`Skipped ${result.skipped.length} not deployed changes`);
    }
  } finally {
    await client.close();
  }
}