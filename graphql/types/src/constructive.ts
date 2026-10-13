import {
  DeploymentOptions,
  MigrationOptions,
  pgpmDefaults,
  PgpmOptions,
  PgTestConnectionOptions,
  ServerOptions,
  StorageCredentialOptions} from '@pgpmjs/types';
import deepmerge from 'deepmerge';
import { PgConfig } from 'pg-env';

import {
  apiDefaults,
  ApiOptions,
  graphileDefaults,
  graphileFeatureDefaults,
  GraphileFeatureOptions,
  GraphileOptions} from './graphile';
import { LlmOptions } from './llm';
import { SmsOptions } from './sms';

/**
 * GraphQL-specific options for Constructive
 */
export interface ConstructiveGraphQLOptions {
  /** PostGraphile/Graphile configuration */
  graphile?: GraphileOptions;
  /** Feature flags and toggles for GraphQL */
  features?: GraphileFeatureOptions;
  /** API configuration options */
  api?: ApiOptions;
}

/**
 * Full Constructive configuration options
 * Extends PgpmOptions with GraphQL/Graphile configuration
 */
export interface ConstructiveOptions extends PgpmOptions, ConstructiveGraphQLOptions {
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
  /** Object-store credentials (coordinates live in storage_module) */
  storage?: StorageCredentialOptions;
  /** Module deployment configuration */
  deployment?: DeploymentOptions;
  /** Migration and code generation options */
  migrations?: MigrationOptions;
  /** LLM provider configuration (embeddings, chat, RAG) */
  llm?: LlmOptions;
  /** SMS provider configuration */
  sms?: SmsOptions;
}

/**
 * Default GraphQL-specific configuration values
 */
export const constructiveGraphqlDefaults: ConstructiveGraphQLOptions = {
  graphile: graphileDefaults,
  features: graphileFeatureDefaults,
  api: apiDefaults
};

/**
 * Full default configuration values for Constructive framework
 * Combines PGPM core defaults with GraphQL/Graphile defaults
 */
export const constructiveDefaults: ConstructiveOptions = deepmerge.all([
  pgpmDefaults,
  constructiveGraphqlDefaults
]) as ConstructiveOptions;
