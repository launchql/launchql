/**
 * PostGraphile v5 Plugins
 *
 * This module exports all custom plugins (consolidated from graphile-misc-plugins).
 */

// Minimal preset - PostGraphile without Node/Relay features
export { MinimalPreset } from './minimal-preset';

// Custom inflector using inflekt library
export {
  InflektPlugin,
  InflektPreset,
} from './custom-inflector';

// Conflict detector for multi-schema setups
export {
  ConflictDetectorPlugin,
  ConflictDetectorPreset,
} from './conflict-detector';

// Inflector logger for debugging
export {
  InflectorLoggerPlugin,
  InflectorLoggerPreset,
} from './inflector-logger';

// Enable filtering on all columns (not just indexed)
export {
  EnableAllFilterColumnsPlugin,
  EnableAllFilterColumnsPreset,
} from './enable-all-filter-columns';

// Many-to-many with opt-in behavior
export {
  ManyToManyOptInPlugin,
  ManyToManyOptInPreset,
} from './many-to-many-preset';

// Primary key only lookups (disable non-PK unique constraints)
export type { UniqueLookupOptions } from './primary-key-only';
export {
  createUniqueLookupPlugin,
  NoUniqueLookupPlugin,
  NoUniqueLookupPreset,
  PrimaryKeyOnlyPlugin,
  PrimaryKeyOnlyPreset,
} from './primary-key-only';

// Meta schema plugin for introspection (tables, fields, indexes, constraints)
export {
  getTablesMetaForSchema,
  MetaSchemaPlugin,
  MetaSchemaPreset,
} from './meta-schema';
export type {
  BelongsToRelation,
  ConstraintsMeta,
  FieldMeta,
  ForeignKeyConstraintMeta,
  HasRelation,
  IndexMeta,
  InflectionMeta,
  ManyToManyRelation,
  PrimaryKeyConstraintMeta,
  QueryMeta,
  RelationsMeta,
  TableMeta,
  TypeMeta,
  UniqueConstraintMeta,
} from 'graphile-meta';

// PG type mappings for custom PostgreSQL types (email, url, etc.)
export type { TypeMapping } from './pg-type-mappings';
export {
  PgTypeMappingsPlugin,
  PgTypeMappingsPreset,
} from './pg-type-mappings';

// Public key signature plugin for crypto authentication
export type { PublicKeyChallengeConfig } from './PublicKeySignature';
export { PublicKeySignature } from './PublicKeySignature';

// Internal exports for testing
export { _buildFieldMeta,_pgTypeToGqlType } from './meta-schema';

// Required input plugin - makes @requiredInput tagged fields non-nullable in mutation inputs
export {
  RequiredInputPlugin,
  RequiredInputPreset,
} from './required-input-plugin';

// Unified search — tsvector + BM25 + pg_trgm + pgvector behind a single adapter architecture
export type {
  Bm25AdapterOptions,
  Bm25IndexInfo,
  PgvectorAdapterOptions,
  SearchableColumn,
  SearchAdapter,
  TrgmAdapterOptions,
  TsvectorAdapterOptions,
  TsvectorCodecPluginOptions,
  UnifiedSearchOptions,
  UnifiedSearchPresetOptions,
} from 'graphile-search';
export {
  Bm25CodecPlugin,
  Bm25CodecPreset,
  bm25IndexStore,
  createBm25Adapter,
  // Operator factories for connection filter integration
  createMatchesOperatorFactory,
  createPgvectorAdapter,
  createTrgmAdapter,
  createTrgmOperatorFactories,
  // Adapters
  createTsvectorAdapter,
  createTsvectorCodecPlugin,
  // Core plugin + preset
  createUnifiedSearchPlugin,
  // Codec plugins (tree-shakable)
  TsvectorCodecPlugin,
  TsvectorCodecPreset,
  UnifiedSearchPreset,
  VectorCodecPlugin,
  VectorCodecPreset,
} from 'graphile-search';
