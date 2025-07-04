export * from './class/launchql';
export * from './deploy-fast';
export * from './deps';
export * from './export-meta';
export * from './export-migrations';
export * from './extensions';
export * from './modules';
export * from './package';
export * from './paths';
export * from './resolve';
export * from './sqitch/deploy';
export * from './sqitch/revert';
export * from './sqitch/verify';
export * from './transform';
export * from './utils';

// New exports for migration API
export * from './api/migration';
export { runSqitch } from './utils/sqitch-wrapper';
export { deployCommand } from './migrate/deploy-command';
export { revertCommand } from './migrate/revert-command';
export { verifyCommand } from './migrate/verify-command';