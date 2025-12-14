import type { Plugin } from 'graphile-build';
import { PostGraphileOptions } from 'postgraphile';

/**
 * PostGraphile/Graphile configuration
 */
export interface GraphileOptions {
  /** Database schema(s) to expose through GraphQL */
  schema?: string | string[];
  /** Additional Graphile plugins to load */
  appendPlugins?: Plugin[];
  /** Build options for Graphile */
  graphileBuildOptions?: PostGraphileOptions['graphileBuildOptions'];
  /** Override settings for PostGraphile */
  overrideSettings?: Partial<PostGraphileOptions>;
}

/**
 * Feature flags and toggles for GraphQL/Graphile
 */
export interface GraphileFeatureOptions {
  /** Use simple inflection for GraphQL field names */
  simpleInflection?: boolean;
  /** Use opposite base names for relationships */
  oppositeBaseNames?: boolean;
  /** Enable PostGIS spatial database support */
  postgis?: boolean;
}

/**
 * Configuration options for the LaunchQL API
 */
export interface ApiOptions {
  /** Whether to enable the meta API endpoints */
  enableMetaApi?: boolean;
  /** Database schemas to expose through the API */
  exposedSchemas?: string[];
  /** Anonymous role name for unauthenticated requests */
  anonRole?: string;
  /** Default role name for authenticated requests */
  roleName?: string;
  /** Default database identifier to use */
  defaultDatabaseId?: string;
  /** Whether the API is publicly accessible */
  isPublic?: boolean;
  /** Schemas containing metadata tables */
  metaSchemas?: string[];
}

/**
 * Default GraphQL/Graphile configuration values
 */
export const graphileDefaults: GraphileOptions = {
  schema: [],
  appendPlugins: [],
  overrideSettings: {},
  graphileBuildOptions: {},
};

/**
 * Default feature options for GraphQL/Graphile
 */
export const graphileFeatureDefaults: GraphileFeatureOptions = {
  simpleInflection: true,
  oppositeBaseNames: true,
  postgis: true
};

/**
 * Default API configuration values
 */
export const apiDefaults: ApiOptions = {
  enableMetaApi: true,
  exposedSchemas: [],
  anonRole: 'administrator',
  roleName: 'administrator',
  defaultDatabaseId: 'hard-coded',
  isPublic: true,
  metaSchemas: ['collections_public', 'meta_public']
};
