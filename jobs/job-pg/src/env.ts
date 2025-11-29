import { getEnvOptions } from '@launchql/env';
import { defaultPgConfig, getPgEnvVars, PgConfig } from 'pg-env';

// Resolve job PG config with precedence:
// defaults -> opts.pg -> opts.jobs.pg -> env(PG*)
export const getJobPgConfig = (): PgConfig => {
  const opts = getEnvOptions();
  const envOnly = getPgEnvVars(); // only values from env, no defaults
  const merged: PgConfig = {
    ...defaultPgConfig,
    ...(opts.pg ?? {}),
    ...(opts.jobs?.pg ?? {}),
    ...envOnly
  } as PgConfig;
  return merged;
};

// Eagerly compute for convenience; callers can also call getJobPgConfig()
export const pgConfig: PgConfig = getJobPgConfig();

export default pgConfig;
