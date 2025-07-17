export * from './class/launchql';
export * from './deps';
export * from './export-meta';
export * from './export-migrations';
export * from './extensions';
export * from './modules';
export * from './package';
export * from './paths';
export * from './resolve';
export * from './operations/projects/deploy';
export * from './operations/projects/revert';
export * from './operations/projects/verify';
export * from './transform';
export * from './utils';

// New exports for migration API
export * from './operations';
export { runSqitch } from './utils/sqitch-wrapper';
export { deployModule } from './operations/modules/deploy';
export { revertModule } from './operations/modules/revert';
export { verifyModule } from './operations/modules/verify';

// Export project-files functionality (now integrated into core)
export * from './files';

export { LaunchQLMigrate } from './migrate/client';
export { 
  MigrateChange, 
  MigratePlanFile, 
  DeployOptions, 
  RevertOptions, 
  VerifyOptions, 
  DeployResult, 
  RevertResult, 
  VerifyResult, 
  StatusResult, 
  MigrateConfig 
} from './migrate/types';
export { hashFile, hashString } from './migrate/utils/hash';
export { withTransaction, TransactionContext, TransactionOptions, executeQuery } from './migrate/utils/transaction';
export { cleanSql } from './migrate/clean';
