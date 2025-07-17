import { PgConfig } from 'pg-env';
import { LaunchQLMigrate } from '../../migrate/client';
import { Logger } from '@launchql/logger';

const log = new Logger('verify');

export const verify = async (
  pg: PgConfig,
  database: string,
  modulePath: string
): Promise<void> => {
  log.info(`🔍 Verifying module at: ${modulePath}`);
  log.debug(`→ Database: ${database}`);

  const migrate = new LaunchQLMigrate({
    pg,
    database,
    modulePath
  });

  try {
    const result = await migrate.verify({
      project: 'module',
      targetDatabase: database,
      planPath: `${modulePath}/launchql.plan`
    });

    if (result.verified.length > 0) {
      log.info(`✅ Successfully verified ${result.verified.length} change(s)`);
      result.verified.forEach(change => {
        log.debug(`   → ${change}`);
      });
    } else {
      log.info('ℹ️  No changes to verify');
    }

    if (result.failed.length > 0) {
      log.error(`❌ Failed to verify ${result.failed.length} change(s)`);
      result.failed.forEach(change => {
        log.error(`   → ${change}`);
      });
      throw new Error(`Verification failed for ${result.failed.length} change(s)`);
    }
  } catch (error) {
    log.error(`❌ Verification failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export const verifyModule = verify;
