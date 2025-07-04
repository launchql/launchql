export * from './class/launchql';
export * from './deps';
export * from './export-meta';
export * from './export-migrations';
export * from './extensions';
export * from './modules';
export * from './package';
export * from './paths';
export * from './resolve';
export * from './projects/deploy-project';
export * from './projects/revert-project';
export * from './projects/verify-project';
export * from './transform';
export * from './utils';

// New exports for migration API
export * from './migrate/migration';
export { runSqitch } from './utils/sqitch-wrapper';
export { deployModule } from './migrate/deploy-module';
export { revertModule } from './migrate/revert-module';
export { verifyModule } from './migrate/verify-module';