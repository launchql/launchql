export * from './error';
export * from './error-factory';
export * from './pgpm';
export * from './jobs';
export * from './update';

// Backward-compatible re-exports with deprecation warnings
/** @deprecated Use PgpmOptions instead */
export { PgpmOptions as LaunchQLOptions } from './pgpm';
/** @deprecated Use PgpmWorkspaceConfig instead */
export { PgpmWorkspaceConfig as LaunchQLWorkspaceConfig } from './pgpm';
/** @deprecated Use PgpmError instead */
export { PgpmError as LaunchQLError } from './error';
