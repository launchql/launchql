/**
 * Physical bucket coordinates: reading the reconciler's recorded name and
 * building an S3 config against that known name.
 *
 * A logical bucket belongs to a tenant; a physical bucket is an S3 name. The
 * mapping is recorded on the bucket row by the storage reconciler, and that
 * value is the only coordinate anything reads — no name is ever recomputed.
 * The connection (endpoint/provider/region) is the storage module's; only the
 * credentials come from the plugin options.
 */

import type { S3Client } from '@aws-sdk/client-s3';
import { createS3Client, type StorageProvider } from '@constructive-io/s3-utils';

import type {
  BucketConfig,
  PresignedUrlPluginOptions,
  S3Config,
  StorageCredentials,
  StorageModuleConfig,
} from './types';

export class StorageBucketNotReconciledError extends Error {
  readonly code = 'STORAGE_BUCKET_NOT_RECONCILED';
  readonly retryable = true;
  readonly extensions = {
    code: 'STORAGE_BUCKET_NOT_RECONCILED',
    retryable: true,
  };

  constructor(bucket: BucketConfig, databaseId: string) {
    super(
      `STORAGE_BUCKET_NOT_RECONCILED: bucket "${bucket.key}" (id=${bucket.id}) ` +
      `for database ${databaseId} has not yet been reconciled; the reconciler has ` +
      'not yet recorded a physical name',
    );
    this.name = 'StorageBucketNotReconciledError';
  }
}

export class StorageConnectionNotConfiguredError extends Error {
  readonly code = 'STORAGE_CONNECTION_NOT_CONFIGURED';
  readonly extensions = { code: 'STORAGE_CONNECTION_NOT_CONFIGURED' };

  constructor(storageConfig: StorageModuleConfig, missing: string[]) {
    super(
      `STORAGE_CONNECTION_NOT_CONFIGURED: storage module ${storageConfig.id} (scope ` +
      `${storageConfig.scope}) has no ${missing.join(', ')}; set them on its ` +
      'storage_module row or on the platform database\'s platform plane',
    );
    this.name = 'StorageConnectionNotConfiguredError';
  }
}

function resolveCredentials(options: PresignedUrlPluginOptions): StorageCredentials {
  if (typeof options.credentials === 'function') {
    options.credentials = options.credentials();
  }
  return options.credentials;
}

/** One S3 client per resolved connection, shared by every bucket on it. */
const clients = new Map<string, S3Client>();

/**
 * Build the S3 config for a *known* physical bucket on the storage module's
 * connection. `physicalName` is required — callers must resolve the coordinate
 * from the stored row value before getting here. No name is ever recomputed.
 */
export function resolveS3ForDatabase(
  options: PresignedUrlPluginOptions,
  storageConfig: StorageModuleConfig,
  physicalName: string,
): S3Config {
  const { endpoint, provider, region, publicUrlPrefix } = storageConfig;
  if (!provider || !region) {
    throw new StorageConnectionNotConfiguredError(storageConfig, [
      ...(provider ? [] : ['provider']),
      ...(region ? [] : ['region']),
    ]);
  }

  const cacheKey = JSON.stringify([provider, endpoint, region]);
  let client = clients.get(cacheKey);
  if (!client) {
    const { accessKeyId, secretAccessKey } = resolveCredentials(options);
    client = createS3Client({
      provider: provider as StorageProvider,
      region,
      accessKeyId,
      secretAccessKey,
      ...(endpoint ? { endpoint } : {}),
    });
    clients.set(cacheKey, client);
  }

  return {
    client,
    bucket: physicalName,
    region,
    ...(endpoint ? { endpoint, forcePathStyle: provider !== 's3' } : {}),
    ...(publicUrlPrefix != null ? { publicUrlPrefix } : {}),
  };
}

/**
 * Return the reconciler's recorded physical name, or fail with a typed,
 * retryable error while reconciliation is still pending.
 */
export function assertBucketReconciled(bucket: BucketConfig, databaseId: string): string {
  if (bucket.physical_name !== null) return bucket.physical_name;

  throw new StorageBucketNotReconciledError(bucket, databaseId);
}
