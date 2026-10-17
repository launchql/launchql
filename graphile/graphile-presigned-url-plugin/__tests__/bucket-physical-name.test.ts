import { readBucketPhysicalName } from '../src/storage-module-cache';
import type { StorageModuleConfig } from '../src/types';

function storageConfig(
  overrides: Partial<StorageModuleConfig> = {},
): StorageModuleConfig {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    bucketsQualifiedName: 'storage_public.app_buckets',
    filesQualifiedName: 'storage_public.app_files',
    schemaName: 'storage_public',
    bucketsTableName: 'app_buckets',
    filesTableName: 'app_files',
    recorderQualifiedName: 'storage_private.app_files_record_file',
    bucketPhysicalNameQualifiedName: 'storage_private.app_buckets_physical_name',
    scope: 'app',
    entityTableId: null,
    entityQualifiedName: null,
    endpoint: null,
    publicUrlPrefix: null,
    provider: 'minio',
    region: 'us-east-1',
    connectionOverrides: [],
    allowedOrigins: null,
    uploadUrlExpirySeconds: 900,
    downloadUrlExpirySeconds: 3600,
    defaultMaxFileSize: 1000,
    maxFilenameLength: 1024,
    cacheTtlSeconds: 300,
    hasPathShares: false,
    hasVersioning: false,
    hasContentHash: false,
    hasConfirmUpload: false,
    maxBulkFiles: 100,
    maxBulkTotalSize: 1000,
    ...overrides,
  };
}

const BUCKET_ID = '22222222-2222-2222-2222-222222222222';

function client(rows: Array<Record<string, unknown>>) {
  return { query: jest.fn().mockResolvedValue({ rows }) };
}

describe('readBucketPhysicalName', () => {
  it('reads the coordinate through the generated physical-name reader, not the bucket table', async () => {
    const pgClient = client([{ physical_name: 'app-a1b2-public' }]);

    await expect(readBucketPhysicalName(pgClient, storageConfig(), BUCKET_ID)).resolves.toBe('app-a1b2-public');

    expect(pgClient.query).toHaveBeenCalledTimes(1);
    const [{ text, values }] = pgClient.query.mock.calls[0];
    expect(text).toBe('SELECT storage_private.app_buckets_physical_name($1) AS physical_name');
    expect(text).not.toContain('storage_public.app_buckets');
    expect(values).toEqual([BUCKET_ID]);
  });

  it('returns null when no physical bucket was recorded', async () => {
    const pgClient = client([{ physical_name: null }]);

    await expect(readBucketPhysicalName(pgClient, storageConfig(), BUCKET_ID)).resolves.toBeNull();
  });

  it('throws when the storage module has no private schema to read from', async () => {
    const pgClient = client([]);

    await expect(
      readBucketPhysicalName(pgClient, storageConfig({ bucketPhysicalNameQualifiedName: null }), BUCKET_ID),
    ).rejects.toThrow('STORAGE_BUCKET_READER_MISSING');
    expect(pgClient.query).not.toHaveBeenCalled();
  });
});
