import { BucketProvisionerPreset } from 'graphile-bucket-provisioner-plugin';
import { BulkMutationPreset } from 'graphile-bulk-mutations';
import type { GraphileConfig } from 'graphile-config';
import { ConnectionFilterPreset } from 'graphile-connection-filter';
import { HistoryPreset } from 'graphile-history';
import { I18nPreset } from 'graphile-i18n';
import { GraphileLlmPreset } from 'graphile-llm';
import { createFolderOperatorFactory, GraphileLtreePreset } from 'graphile-ltree';
import { PgAggregatesPreset } from 'graphile-pg-aggregates';
import { createPostgisOperatorFactory,GraphilePostgisPreset } from 'graphile-postgis';
import { PresignedUrlPreset } from 'graphile-presigned-url-plugin';
import { RealtimeSubscriptionsPreset } from 'graphile-realtime-subscriptions';
import { createMatchesOperatorFactory, createTrgmOperatorFactories,UnifiedSearchPreset } from 'graphile-search';
import { UploadPreset } from 'graphile-upload-plugin';

import {
  ConflictDetectorPreset,
  EnableAllFilterColumnsPreset,
  InflectorLoggerPreset,
  InflektPreset,
  ManyToManyOptInPreset,
  MetaSchemaPreset,
  MinimalPreset,
  NoUniqueLookupPreset,
  PgTypeMappingsPreset,
  RequiredInputPreset
} from '../plugins';
import { getStorageCredentials } from '../presigned-url-resolver';
import { constructiveUploadFieldDefinitions } from '../upload-resolver';

/**
 * Feature flags that control which optional Graphile plugins are included
 * in the preset.  Mirrors the `database_settings` / `api_settings` cascade
 * from the services DB.
 *
 * Every flag defaults to the value that matches the current production
 * behavior so that `createConstructivePreset()` (no args) is identical to
 * the previous static `ConstructivePreset`.
 */
export interface ConstructivePresetOptions {
  enableAggregates?: boolean;
  enablePostgis?: boolean;
  enableSearch?: boolean;
  enableDirectUploads?: boolean;
  enablePresignedUploads?: boolean;
  enableManyToMany?: boolean;
  enableConnectionFilter?: boolean;
  enableLtree?: boolean;
  enableLlm?: boolean;
  enableRealtime?: boolean;
  enableBulk?: boolean;
  enableI18n?: boolean;
  enableHistory?: boolean;
}

/**
 * grafast / @dataplan/pg require Node >= 22 (they call Promise.withResolvers()
 * in their execution paths). On older Node versions there is no fail-fast:
 * every connection (list) query fails at runtime with
 * `TypeError: Cannot read properties of undefined (reading 'items')` inside
 * grafast's ConnectionStep while mutations keep working. Guard here so any
 * schema built from the Constructive preset fails loudly instead.
 */
function assertSupportedNodeVersion(): void {
  if (typeof (Promise as { withResolvers?: unknown }).withResolvers !== 'function') {
    throw new Error(
      `graphile-settings requires Node.js >= 22 (found ${process.version}): ` +
        'grafast/@dataplan/pg depend on Promise.withResolvers(). On older Node versions ' +
        "connection (list) queries fail at runtime with \"Cannot read properties of undefined (reading 'items')\"."
    );
  }
}

const DEFAULTS: Required<ConstructivePresetOptions> = {
  enableAggregates: false,
  enablePostgis: true,
  enableSearch: true,
  enableDirectUploads: true,
  enablePresignedUploads: true,
  enableManyToMany: true,
  enableConnectionFilter: true,
  enableLtree: true,
  enableLlm: true,
  enableRealtime: false,
  enableBulk: false,
  enableI18n: false,
  enableHistory: false
};

/**
 * Create a Constructive PostGraphile v5 Preset.
 *
 * Accepts optional feature flags (`ConstructivePresetOptions`) that map 1-to-1
 * with the `database_settings` / `api_settings` tables.  When a flag is `true`
 * its corresponding plugin preset is included; when `false` it is omitted.
 *
 * Calling with no arguments produces the same preset as the previous static
 * `ConstructivePreset` (everything on except aggregates).
 *
 * CORE PRESETS (always included):
 * - MinimalPreset (PostGraphile without Node/Relay)
 * - ConflictDetectorPreset (multi-schema conflict detection)
 * - InflektPreset (custom inflection)
 * - InflectorLoggerPreset (debugging, INFLECTOR_LOG=1)
 * - NoUniqueLookupPreset (primary-key-only lookups)
 * - MetaSchemaPreset (_meta introspection)
 * - PgTypeMappingsPreset (email, url, etc.)
 * - RequiredInputPreset (@requiredInput support)
 *
 * FLAG-CONTROLLED PRESETS:
 * - enableConnectionFilter  -> ConnectionFilterPreset, EnableAllFilterColumnsPreset
 * - enableManyToMany        -> ManyToManyOptInPreset
 * - enableSearch            -> UnifiedSearchPreset (tsvector, BM25, pg_trgm, pgvector)
 * - enablePostgis           -> GraphilePostgisPreset
 * - enableLtree             -> GraphileLtreePreset
 * - enableDirectUploads     -> UploadPreset
 * - enablePresignedUploads  -> PresignedUrlPreset, BucketProvisionerPreset
 * - enableAggregates        -> PgAggregatesPreset (off by default)
 * - enableRealtime          -> RealtimeSubscriptionsPreset (off by default)
 * - enableBulk              -> BulkMutationPreset (off by default)
 * - enableI18n              -> I18nPreset (off by default)
 * - enableHistory           -> HistoryPreset (off by default)
 * - enableLlm               -> GraphileLlmPreset (auto-embed unifiedSearch, vector text fields)
 *
 * RELATION FILTERS (when enableConnectionFilter is true):
 * - Forward: filter child by parent
 * - Backward: filter parent by children
 *
 * USAGE:
 * ```typescript
 * import { createConstructivePreset, makePgService } from 'graphile-settings';
 *
 * // All defaults (same as previous static ConstructivePreset)
 * const preset = {
 *   extends: [createConstructivePreset()],
 *   pgServices: [makePgService({ connectionString, schemas })],
 * };
 *
 * // With database_settings feature flags
 * const preset = {
 *   extends: [createConstructivePreset({ enableAggregates: true, enablePostgis: false })],
 *   pgServices: [makePgService({ connectionString, schemas })],
 * };
 * ```
 */
export function createConstructivePreset(
  options?: ConstructivePresetOptions
): GraphileConfig.Preset {
  assertSupportedNodeVersion();
  const opts = { ...DEFAULTS, ...options };

  // ----- extends array -----
  const presets: GraphileConfig.Preset[] = [
    // Core (always on)
    MinimalPreset,
    ConflictDetectorPreset,
    InflektPreset,
    InflectorLoggerPreset,
    NoUniqueLookupPreset,
    MetaSchemaPreset,
    PgTypeMappingsPreset,
    RequiredInputPreset
  ];

  if (opts.enableConnectionFilter) {
    presets.push(
      ConnectionFilterPreset({ connectionFilterRelations: true }),
      EnableAllFilterColumnsPreset
    );
  }

  if (opts.enableManyToMany) {
    presets.push(ManyToManyOptInPreset);
  }

  if (opts.enableSearch) {
    presets.push(
      UnifiedSearchPreset({ fullTextScalarName: 'FullText', tsConfig: 'english' })
    );
  }

  if (opts.enablePostgis) {
    presets.push(GraphilePostgisPreset);
  }

  if (opts.enableLtree) {
    presets.push(GraphileLtreePreset);
  }

  if (opts.enableDirectUploads) {
    presets.push(
      UploadPreset({
        uploadFieldDefinitions: constructiveUploadFieldDefinitions,
        maxFileSize: 10 * 1024 * 1024 // 10MB
      })
    );
  }

  if (opts.enablePresignedUploads) {
    presets.push(
      PresignedUrlPreset({
        credentials: getStorageCredentials,
      }),
      BucketProvisionerPreset()
    );
  }

  if (opts.enableAggregates) {
    presets.push(PgAggregatesPreset);
  }

  if (opts.enableRealtime) {
    presets.push(RealtimeSubscriptionsPreset());
  }

  if (opts.enableBulk) {
    presets.push(BulkMutationPreset());
  }

  if (opts.enableI18n) {
    presets.push(I18nPreset());
  }

  if (opts.enableHistory) {
    presets.push(HistoryPreset());
  }

  if (opts.enableLlm) {
    presets.push(GraphileLlmPreset());
  }

  // ----- connectionFilterOperatorFactories -----
  // Only include operator factories for features that are actually enabled.
  // graphile-config replaces (not concatenates) arrays when merging presets,
  // so we collect all active factories into a single top-level array.
  const operatorFactories: unknown[] = [];
  if (opts.enableConnectionFilter) {
    if (opts.enableSearch) {
      operatorFactories.push(
        createMatchesOperatorFactory('FullText', 'english'),
        createTrgmOperatorFactories()
      );
    }
    if (opts.enablePostgis) {
      operatorFactories.push(createPostgisOperatorFactory());
    }
    if (opts.enableLtree) {
      operatorFactories.push(createFolderOperatorFactory());
    }
  }

  // ----- disablePlugins -----
  // When connection filter is enabled it replaces the built-in condition arg.
  const disablePlugins: string[] = [];
  if (opts.enableConnectionFilter) {
    disablePlugins.push('PgConditionArgumentPlugin', 'PgConditionCustomFieldsPlugin');
  }

  // ----- schema options -----
  const schema: Record<string, unknown> = {};
  if (opts.enableConnectionFilter) {
    schema.connectionFilterComputedColumns = false;
    schema.connectionFilterSetofFunctions = false;
    schema.connectionFilterLogicalOperators = true;
    schema.connectionFilterArrays = true;
    if (operatorFactories.length > 0) {
      schema.connectionFilterOperatorFactories = operatorFactories;
    }
  }

  const preset: GraphileConfig.Preset = {
    extends: presets
  };

  if (disablePlugins.length > 0) {
    preset.disablePlugins = disablePlugins;
  }

  if (Object.keys(schema).length > 0) {
    preset.schema = schema;
  }

  return preset;
}

/**
 * Default Constructive preset -- everything enabled except aggregates.
 * Backwards-compatible: identical to the previous static ConstructivePreset.
 */
export const ConstructivePreset: GraphileConfig.Preset = createConstructivePreset();

export default ConstructivePreset;
