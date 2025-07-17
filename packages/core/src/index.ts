export * from './class/launchql';
export * from './deps';
export * from './export-meta';
export * from './export-migrations';
export * from './extensions';
export * from './modules';
export * from './package';
export * from './paths';
export * from './resolve';
export { deploy as deployProject } from './operations/projects/deploy';
export { revert as revertProject } from './operations/projects/revert';
export { verify as verifyProject } from './operations/projects/verify';
export * from './transform';
export * from './utils';

// New exports for migration API
export * from './operations';
export * from './operations/strategies';
export { runSqitch } from './utils/sqitch-wrapper';
export { deploy as deployModule } from './operations/modules/deploy';
export { revert as revertModule } from './operations/modules/revert';
export { verify as verifyModule } from './operations/modules/verify';

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
