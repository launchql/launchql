export * from './core/class/pgpm';
export * from './export/export-meta';
export * from './export/export-migrations';
export * from './extensions/extensions';
export * from './modules/modules';
export * from './packaging/package';
export * from './packaging/transform';
export * from './resolution/deps';
export * from './resolution/resolve';
export * from './workspace/paths';
export * from './workspace/utils';
export * from './core/template-scaffold';
export * from './core/boilerplate-types';
export * from './core/boilerplate-scanner';

// Export package-files functionality (now integrated into core)
export * from './files';
export { cleanSql } from './migrate/clean';
export { PgpmMigrate } from './migrate/client';
export { PgpmInit } from './init/client';
export { 
  DeployOptions, 
  DeployResult, 
  MigrateChange, 
  MigratePlanFile, 
  RevertOptions, 
  RevertResult, 
  StatusResult,
  VerifyOptions, 
  VerifyResult} from './migrate/types';
export { hashFile, hashString } from './migrate/utils/hash';
export { executeQuery,TransactionContext, TransactionOptions, withTransaction } from './migrate/utils/transaction';
