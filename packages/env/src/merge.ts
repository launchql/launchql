import deepmerge from 'deepmerge';
import { launchqlDefaults, LaunchQLOptions, PgTestConnectionOptions, DeploymentOptions } from '@launchql/types';
import { loadConfigSync } from './config';
import { getEnvVars } from './env';

export const getEnvOptions = (overrides: LaunchQLOptions = {}, cwd: string = process.cwd()): LaunchQLOptions => {
  const defaults = launchqlDefaults;
  const configOptions = loadConfigSync(cwd);
  const envOptions = getEnvVars();
  
  return deepmerge.all([defaults, configOptions, envOptions, overrides]);
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
