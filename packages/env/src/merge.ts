import deepmerge from 'deepmerge';
import { pgpmDefaults, PgpmOptions, PgTestConnectionOptions, DeploymentOptions } from '@pgpmjs/types';
import { loadConfigSync } from './config';
import { getEnvVars, EnvOptions } from './env';

/**
 * Default values for GraphQL/Graphile-related options.
 * These are kept separate from pgpmDefaults to avoid coupling @pgpmjs/types to GraphQL dependencies.
 * Note: These are plain objects with no graphile imports - just default values.
 */
const envGraphqlDefaults: Partial<EnvOptions> = {
  graphile: {
    schema: [],
  },
  features: {
    simpleInflection: true,
    oppositeBaseNames: true,
    postgis: true
  },
  api: {
    enableMetaApi: true,
    exposedSchemas: [],
    anonRole: 'administrator',
    roleName: 'administrator',
    defaultDatabaseId: 'hard-coded',
    isPublic: true,
    metaSchemas: ['collections_public', 'meta_public']
  }
};

export const getEnvOptions = (overrides: EnvOptions = {}, cwd: string = process.cwd()): EnvOptions => {
  const configOptions = loadConfigSync(cwd);
  const envOptions = getEnvVars();
  
  // Merge in order: pgpmDefaults (core) -> envGraphqlDefaults (graphql) -> config -> env -> overrides
  return deepmerge.all([pgpmDefaults, envGraphqlDefaults, configOptions, envOptions, overrides]);
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
