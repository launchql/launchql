/**
 * Codec Plugin Exports
 *
 * These plugins teach PostGraphile v5 how to handle custom PostgreSQL types
 * used by the search adapters. They run during the gather phase to discover
 * types and indexes before the schema build phase.
 */

export type { Bm25IndexInfo } from './bm25-codec';
export {
  Bm25CodecPlugin,
  Bm25CodecPreset,
  bm25IndexStore,
} from './bm25-codec';
export type { TsvectorCodecPluginOptions } from './tsvector-codec';
export {
  createTsvectorCodecPlugin,
  TsvectorCodecPlugin,
  TsvectorCodecPreset,
} from './tsvector-codec';
export {
  VectorCodecPlugin,
  VectorCodecPreset,
} from './vector-codec';
