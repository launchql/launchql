/**
 * PostGraphile v5 Presigned URL Preset
 *
 * Provides a convenient preset for including presigned URL upload support
 * in PostGraphile. Combines the main mutation plugin (requestUploadUrl)
 * with the downloadUrl computed field plugin.
 */

import type { GraphileConfig } from 'graphile-config';

import { createDownloadUrlPlugin } from './download-url-field';
import { createPresignedUrlPlugin } from './plugin';
import type { PresignedUrlPluginOptions } from './types';

/**
 * Creates a preset that includes the presigned URL plugins with the given options.
 *
 * @example
 * ```typescript
 * import { PresignedUrlPreset } from 'graphile-presigned-url-plugin';
 * const preset = {
 *   extends: [
 *     PresignedUrlPreset({
 *       credentials: () => ({
 *         accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
 *         secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
 *       }),
 *     }),
 *   ],
 * };
 * ```
 */
export function PresignedUrlPreset(
  options: PresignedUrlPluginOptions,
): GraphileConfig.Preset {
  return {
    plugins: [
      createPresignedUrlPlugin(options),
      createDownloadUrlPlugin(options),
    ],
  };
}

export default PresignedUrlPreset;
