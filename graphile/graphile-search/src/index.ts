/**
 * graphile-search — Unified PostGraphile v5 Search Plugin
 *
 * Abstracts tsvector, BM25, pg_trgm, and pgvector behind a single
 * adapter-based architecture with a composite `searchScore` field.
 *
 * @example
 * ```typescript
 * import { UnifiedSearchPreset } from 'graphile-search';
 *
 * // Use all 4 adapters with defaults:
 * const preset = {
 *   extends: [
 *     UnifiedSearchPreset(),
 *   ],
 * };
 *
 * // Or customize per-adapter:
 * const preset = {
 *   extends: [
 *     UnifiedSearchPreset({
 *       tsvector: { filterPrefix: 'fullText', tsConfig: 'english' },
 *       bm25: true,
 *       trgm: { defaultThreshold: 0.2 },
 *       pgvector: { defaultMetric: 'L2' },
 *       searchScoreWeights: { bm25: 0.5, trgm: 0.3, tsv: 0.2 },
 *     }),
 *   ],
 * };
 * ```
 */

export type { SearchExtensionSchemas } from './extension-metadata';
export {
  collectSearchExtensionSchemas,
  requireBuildExtensionSchema,
  resolveBuildExtensionSchema,
} from './extension-metadata';

// Core plugin
export { createUnifiedSearchPlugin } from './plugin';

// Preset
export type { UnifiedSearchPresetOptions } from './preset';
export { UnifiedSearchPreset } from './preset';

// Types
export type {
  FilterApplyResult,
  ScoreSemantics,
  SearchableColumn,
  SearchAdapter,
  UnifiedSearchOptions,
} from './types';

// Adapters
export type {
  Bm25AdapterOptions,
  PgvectorAdapterOptions,
  TrgmAdapterOptions,
  TsvectorAdapterOptions,
} from './adapters';
export {
  createBm25Adapter,
  createPgvectorAdapter,
  createTrgmAdapter,
  createTsvectorAdapter,
} from './adapters';

// Codec plugins (tree-shakable — import only the codecs you need)
export type {
  Bm25IndexInfo,
  TsvectorCodecPluginOptions,
} from './codecs';
export {
  Bm25CodecPlugin,
  Bm25CodecPreset,
  bm25IndexStore,
  createTsvectorCodecPlugin,
  TsvectorCodecPlugin,
  TsvectorCodecPreset,
  VectorCodecPlugin,
  VectorCodecPreset,
} from './codecs';

// Operator factories for connection filter integration
export {
  createMatchesOperatorFactory,
  createTrgmOperatorFactories,
} from './codecs/operator-factories';
