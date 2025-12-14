import deepmerge from 'deepmerge';
import { pgpmDefaults, PgpmOptions, PgTestConnectionOptions, DeploymentOptions } from '@pgpmjs/types';
import { loadConfigSync } from './config';
import { getEnvVars } from './env';

/**
 * Get core PGPM environment options by merging:
 * 1. PGPM defaults
 * 2. Config file options
 * 3. Environment variables
 * 4. Runtime overrides
 * 
 * For LaunchQL applications that need GraphQL options, use @launchql/env instead.
 */
export const getEnvOptions = (overrides: PgpmOptions = {}, cwd: string = process.cwd()): PgpmOptions => {
  const configOptions = loadConfigSync(cwd);
  const envOptions = getEnvVars();
  
  return deepmerge.all([pgpmDefaults, configOptions, envOptions, overrides]);
};

export const getConnEnvOptions = (overrides: Partial<PgTestConnectionOptions> = {}, cwd: string = process.cwd()): PgTestConnectionOptions => {
  const opts = getEnvOptions({
    db: overrides
  }, cwd);
  return opts.db;
};

export const getDeploymentEnvOptions = (overrides: Partial<DeploymentOptions> = {}, cwd: string = process.cwd()): DeploymentOptions => {
  const opts = getEnvOptions({
    deployment: overrides
  }, cwd);
  return opts.deployment;
};
