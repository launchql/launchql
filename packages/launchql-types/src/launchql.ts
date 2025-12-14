import deepmerge from 'deepmerge';
import { PgConfig } from 'pg-env';
import {
  PgpmOptions,
  pgpmDefaults,
  PgTestConnectionOptions,
  DeploymentOptions,
  ServerOptions,
  CDNOptions,
  MigrationOptions,
  JobsConfig
} from '@pgpmjs/types';
import {
  GraphileOptions,
  GraphileFeatureOptions,
  ApiOptions,
  graphileDefaults,
  graphileFeatureDefaults,
  apiDefaults
} from './graphile';

/**
 * GraphQL-specific options for LaunchQL
 */
export interface LaunchQLGraphQLOptions {
  /** PostGraphile/Graphile configuration */
  graphile?: GraphileOptions;
  /** Feature flags and toggles for GraphQL */
  features?: GraphileFeatureOptions;
  /** API configuration options */
  api?: ApiOptions;
}

/**
 * Full LaunchQL configuration options
 * Extends PgpmOptions with GraphQL/Graphile configuration
 */
export interface LaunchQLOptions extends PgpmOptions, LaunchQLGraphQLOptions {
  /** Test database configuration options */
  db?: Partial<PgTestConnectionOptions>;
  /** PostgreSQL connection configuration */
  pg?: Partial<PgConfig>;
  /** PostGraphile/Graphile configuration */
  graphile?: GraphileOptions;
  /** HTTP server configuration */
  server?: ServerOptions;
  /** Feature flags and toggles for GraphQL */
  features?: GraphileFeatureOptions;
  /** API configuration options */
  api?: ApiOptions;
  /** CDN and file storage configuration */
  cdn?: CDNOptions;
  /** Module deployment configuration */
  deployment?: DeploymentOptions;
  /** Migration and code generation options */
  migrations?: MigrationOptions;
  /** Job system configuration */
  jobs?: JobsConfig;
}

/**
 * Default GraphQL-specific configuration values
 */
export const launchqlGraphqlDefaults: LaunchQLGraphQLOptions = {
  graphile: graphileDefaults,
  features: graphileFeatureDefaults,
  api: apiDefaults
};

/**
 * Full default configuration values for LaunchQL framework
 * Combines PGPM core defaults with GraphQL/Graphile defaults
 */
export const launchqlDefaults: LaunchQLOptions = deepmerge.all([
  pgpmDefaults,
  launchqlGraphqlDefaults
]) as LaunchQLOptions;
