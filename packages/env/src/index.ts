export { getEnvOptions, getConnEnvOptions, getDeploymentEnvOptions } from './merge';
export { loadConfigSync, loadConfigSyncFromDir, loadConfigFileSync, resolvePgpmPath } from './config';
export { getEnvVars, getNodeEnv } from './env';
export { walkUp } from './utils';

export type { PgpmOptions, PgTestConnectionOptions, DeploymentOptions } from '@pgpmjs/types';

// Backward-compatible re-exports with deprecation warnings
/** @deprecated Use resolvePgpmPath instead */
export { resolvePgpmPath as resolveLaunchqlPath } from './config';
/** @deprecated Use PgpmOptions instead */
export type { PgpmOptions as LaunchQLOptions } from '@pgpmjs/types';
