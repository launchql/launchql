/**
 * Object-store credentials for the presigned URL plugin.
 *
 * Credentials are the only storage input read from the environment
 * (`STORAGE_ACCESS_KEY_ID` / `STORAGE_SECRET_ACCESS_KEY`). Endpoint, provider,
 * region, bucket and public URL prefix are resolved per request from the
 * tenant's `storage_module` row by the plugin itself.
 */

import { getEnvOptions } from '@constructive-io/graphql-env';
import type { StorageCredentials } from 'graphile-presigned-url-plugin';

export function getStorageCredentials(): StorageCredentials {
  const { accessKeyId, secretAccessKey } = getEnvOptions().storage ?? {};
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'STORAGE_CREDENTIALS_MISSING: object storage requires STORAGE_ACCESS_KEY_ID and ' +
      'STORAGE_SECRET_ACCESS_KEY',
    );
  }
  return { accessKeyId, secretAccessKey };
}
