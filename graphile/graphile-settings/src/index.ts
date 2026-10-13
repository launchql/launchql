/**
 * graphile-settings
 *
 * Shared PostGraphile v5 settings, presets, and plugins for Constructive.
 *
 * This package provides:
 * - Custom plugins for PostGraphile v5
 * - Pre-configured presets combining multiple plugins
 *
 * USAGE:
 *
 * 1. Use the main preset:
 * ```typescript
 * import { ConstructivePreset, makePgService } from 'graphile-settings';
 * import { makeSchema } from 'graphile-build';
 *
 * const preset = {
 *   extends: [ConstructivePreset],
 *   pgServices: [makePgService({ connectionString, schemas })],
 * };
 * const { schema } = await makeSchema(preset);
 * ```
 *
 * 2. Use individual plugins:
 * ```typescript
 * import { MinimalPreset, InflektPreset } from 'graphile-settings/plugins';
 * ```
 */

// Import modules for type augmentation
// These add properties to the GraphileConfig.Preset interface:
// - grafserv: adds 'grafserv' property
// - graphile-build: adds 'schema' property (typed as GraphileBuild.SchemaOptions)
// - postgraphile-plugin-connection-filter: augments SchemaOptions with connectionFilter* options
import 'postgraphile/grafserv';
import 'graphile-build';

import { makePgService } from 'postgraphile/adaptors/pg';

export {
  applyGrafastCacheLimits,
  createGrafastCacheLimitsPlugin,
  createGrafastCacheLimitsPreset
} from './grafast-cache-limits';

// ============================================================================
// Re-export all plugins and presets
// ============================================================================

// Main preset + factory
export type { ConstructivePresetOptions } from './presets/constructive-preset';
export { ConstructivePreset, createConstructivePreset } from './presets/constructive-preset';

// Re-export all plugins for convenience
export * from './plugins/index';

// Re-export presets
export * from './presets/index';

// ============================================================================
// Utilities
// ============================================================================

// Re-export makePgService for convenience
export { makePgService };

// Presigned URL utilities
export { getStorageCredentials } from './presigned-url-resolver';
