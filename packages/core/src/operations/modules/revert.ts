import { PgConfig } from 'pg-env';
import { LaunchQLMigrate } from '../../migrate/client';
import { Logger } from '@launchql/logger';

const log = new Logger('revert');

export interface RevertModuleOptions {
  useTransaction?: boolean;
  toChange?: string;
}

export const revert = async (
  pg: PgConfig,
  database: string,
  modulePath: string,
  options: RevertModuleOptions = {}
): Promise<void> => {
  log.info(`🔄 Reverting module at: ${modulePath}`);
  log.debug(`→ Database: ${database}`);
  log.debug(`→ Options: ${JSON.stringify(options)}`);

  const migrate = new LaunchQLMigrate({
    pg,
    database,
    modulePath
  });

  try {
    const result = await migrate.revert({
      project: 'module',
      targetDatabase: database,
      planPath: `${modulePath}/launchql.plan`,
      useTransaction: options.useTransaction,
      toChange: options.toChange
    });

    if (result.reverted.length > 0) {
      log.info(`✅ Successfully reverted ${result.reverted.length} change(s)`);
      result.reverted.forEach(change => {
        log.debug(`   → ${change}`);
      });
    } else {
      log.info('ℹ️  No changes to revert');
    }

    if (result.skipped.length > 0) {
      log.info(`⏭️  Skipped ${result.skipped.length} change(s) (not deployed)`);
      result.skipped.forEach(change => {
        log.debug(`   → ${change}`);
      });
    }
  } catch (error) {
    log.error(`❌ Revert failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export const revertModule = revert;
