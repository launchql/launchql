import deepmerge from 'deepmerge';
import { LaunchQLOptions, launchqlGraphqlDefaults } from '@launchql/types';
import { getEnvOptions as getPgpmEnvOptions, loadConfigSync } from '@pgpmjs/env';
import { getGraphQLEnvVars } from './env';

/**
 * Get LaunchQL environment options by merging:
 * 1. Core PGPM defaults (from @pgpmjs/env)
 * 2. GraphQL defaults (from @launchql/types)
 * 3. Config file options (including GraphQL options)
 * 4. Environment variables (both core and GraphQL)
 * 5. Runtime overrides
 * 
 * This is the main entry point for LaunchQL packages that need
 * both core PGPM options and GraphQL/Graphile options.
 */
export const getEnvOptions = (
  overrides: Partial<LaunchQLOptions> = {}, 
  cwd: string = process.cwd()
): LaunchQLOptions => {
  // Get core PGPM options (includes pgpmDefaults + config + core env vars)
  const coreOptions = getPgpmEnvOptions({}, cwd);
  
  // Get GraphQL-specific env vars
  const graphqlEnvOptions = getGraphQLEnvVars();
  
  // Load config again to get any GraphQL-specific config
  // Config files can contain LaunchQL options (graphile, features, api)
  // even though loadConfigSync returns PgpmOptions type
  const configOptions = loadConfigSync(cwd) as Partial<LaunchQLOptions>;
  
  // Merge in order: core -> graphql defaults -> config (for graphql keys) -> graphql env -> overrides
  return deepmerge.all([
    coreOptions,
    launchqlGraphqlDefaults,
    // Only merge graphql-related keys from config (if present)
    {
      ...(configOptions.graphile && { graphile: configOptions.graphile }),
      ...(configOptions.features && { features: configOptions.features }),
      ...(configOptions.api && { api: configOptions.api }),
    },
    graphqlEnvOptions,
    overrides
  ]) as LaunchQLOptions;
};

/**
 * Alias for backward compatibility - same as getEnvOptions
 */
export const getLaunchQLEnvOptions = getEnvOptions;
