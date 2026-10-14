/**
 * The bucket config cache in front of getBucketConfig.
 *
 * A bucket row is written by the tenant and completed later by the reconciler
 * (`physical_name`), so the cache must never pin the row's pre-reconcile
 * shape, and an entry must expire on its TTL even while it is being read.
 */

import type { StorageModuleConfig } from '../src/types';

const DATABASE_ID = '00000000-0000-0000-0000-0000000000db';
const MODULE_ID = '11111111-1111-1111-1111-111111111111';
const BUCKET_ID = '33333333-3333-3333-3333-333333333333';

function storageConfig(): StorageModuleConfig {
  return {
    id: MODULE_ID,
    scope: 'app',
    entityTableId: null,
    bucketsQualifiedName: 'storage_public.app_buckets',
  } as unknown as StorageModuleConfig;
}

/** A pg client answering the bucket lookup with whatever the row is now. */
function bucketTable(row: Record<string, unknown>) {
  const client = {
    reads: 0,
    row,
    async query() {
      client.reads += 1;
      return { rows: [{ ...client.row }] };
    },
  };
  return client;
}

function bucketRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: BUCKET_ID,
    key: 'documents',
    type: 'private',
    is_public: false,
    owner_id: null,
    allowed_mime_types: null,
    max_file_size: null,
    allow_custom_keys: false,
    physical_name: null,
    ...overrides,
  };
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetModules();
});

it('sees the physical name the reconciler records after a pre-reconcile read', async () => {
  const { clearBucketCache, getBucketConfig } = await import('../src/storage-module-cache');
  clearBucketCache();
  const table = bucketTable(bucketRow({ physical_name: null }));

  const before = await getBucketConfig(table, storageConfig(), DATABASE_ID, 'documents');
  expect(before?.physical_name).toBeNull();

  table.row = bucketRow({ physical_name: 'cnst-app-documents-0001' });
  const after = await getBucketConfig(table, storageConfig(), DATABASE_ID, 'documents');

  expect(after?.physical_name).toBe('cnst-app-documents-0001');
  expect(table.reads).toBe(2);
});

it('serves a reconciled bucket from the cache', async () => {
  const { clearBucketCache, getBucketConfig } = await import('../src/storage-module-cache');
  clearBucketCache();
  const table = bucketTable(bucketRow({ physical_name: 'cnst-app-documents-0001' }));

  await getBucketConfig(table, storageConfig(), DATABASE_ID, 'documents');
  await getBucketConfig(table, storageConfig(), DATABASE_ID, 'documents');

  expect(table.reads).toBe(1);
});

it('re-reads a changed bucket row once its TTL passes, even under steady traffic', async () => {
  // lru-cache measures age with performance.now(); drive that clock directly.
  let now = performance.now();
  jest.spyOn(performance, 'now').mockImplementation(() => now);
  // lru-cache memoizes now() for 1ms of real time; step past that memo.
  const tick = (ms: number) => new Promise((resolve) => setTimeout(() => {
    now += ms;
    resolve(undefined);
  }, 5));

  const { clearBucketCache, getBucketConfig } = await import('../src/storage-module-cache');
  clearBucketCache();
  const table = bucketTable(bucketRow({ physical_name: 'cnst-app-documents-0001', max_file_size: 100 }));

  await getBucketConfig(table, storageConfig(), DATABASE_ID, 'documents');
  table.row = bucketRow({ physical_name: 'cnst-app-documents-0001', max_file_size: 200 });

  // A read every 10 minutes for 2 hours: well past the 1h production TTL.
  let latest;
  for (let minute = 10; minute <= 120; minute += 10) {
    await tick(10 * 60 * 1000);
    latest = await getBucketConfig(table, storageConfig(), DATABASE_ID, 'documents');
  }

  expect(latest?.max_file_size).toBe(200);
});
