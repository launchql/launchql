export * from './core/class/launchql';
export * from './resolution/deps';
export * from './export/export-meta';
export * from './export/export-migrations';
export * from './extensions/extensions';
export * from './modules/modules';
export * from './packaging/package';
export * from './workspace/paths';
export * from './resolution/resolve';
export * from './packaging/transform';
export * from './workspace/utils';

// New exports for migration API
export * from './migrate/migration';
export { runSqitch } from './utils/sqitch-wrapper';
export { deployModule } from './modules/deploy';
export { revertModule } from './modules/revert';
export { verifyModule } from './modules/verify';

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
