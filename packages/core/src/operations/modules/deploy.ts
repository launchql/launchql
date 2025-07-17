import { PgConfig } from 'pg-env';
import { LaunchQLMigrate } from '../../migrate/client';
import { Logger } from '@launchql/logger';

const log = new Logger('deploy');

export interface DeployModuleOptions {
  useTransaction?: boolean;
  toChange?: string;
}

export const deploy = async (
  pg: PgConfig,
  database: string,
  modulePath: string,
  options: DeployModuleOptions = {}
): Promise<void> => {
  log.info(`🚀 Deploying module at: ${modulePath}`);
  log.debug(`→ Database: ${database}`);
  log.debug(`→ Options: ${JSON.stringify(options)}`);

  const migrate = new LaunchQLMigrate({
    pg,
    database,
    modulePath
  });

  try {
    const result = await migrate.deploy({
      project: 'module',
      targetDatabase: database,
      planPath: `${modulePath}/launchql.plan`,
      useTransaction: options.useTransaction,
      toChange: options.toChange
    });

    if (result.deployed.length > 0) {
      log.info(`✅ Successfully deployed ${result.deployed.length} change(s)`);
      result.deployed.forEach(change => {
        log.debug(`   → ${change}`);
      });
    } else {
      log.info('ℹ️  No changes to deploy');
    }

    if (result.skipped.length > 0) {
      log.info(`⏭️  Skipped ${result.skipped.length} change(s) (already deployed)`);
      result.skipped.forEach(change => {
        log.debug(`   → ${change}`);
      });
    }
  } catch (error) {
    log.error(`❌ Deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export const deployModule = deploy;
