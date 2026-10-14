import {
  clearStorageModuleCache,
  getBucketConfig,
  loadAllStorageModules,
  resolveStorageConfigFromCodec,
} from '../src/storage-module-cache';
import type { StorageModuleConfig } from '../src/types';

const DATABASE = '00000000-0000-0000-0000-000000000001';
const OTHER_DATABASE = '00000000-0000-0000-0000-000000000002';

function moduleRow(scope: string) {
  return {
    id: `${scope}-module`,
    scope,
    buckets_schema: 'storage_public',
    buckets_table: `${scope}_buckets`,
    files_schema: 'storage_public',
    files_table: `${scope}_files`,
    entity_table_id: scope === 'app' ? null : 'data-room-table',
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => clearStorageModuleCache());
afterEach(() => clearStorageModuleCache());

it('reloads added and removed modules for only the invalidated database', async () => {
  let rows = [moduleRow('app')];
  const client = { query: jest.fn(async () => ({ rows })) };
  const other = {
    query: jest.fn(async () => ({ rows: [moduleRow('other')] })),
  };
  await loadAllStorageModules(client, DATABASE);
  const otherModules = await loadAllStorageModules(other, OTHER_DATABASE);

  rows = [moduleRow('data_room')];
  clearStorageModuleCache(DATABASE);
  const modules = await loadAllStorageModules(client, DATABASE);
  const codec = {
    name: 'data_room_files',
    extensions: { pg: { schemaName: 'storage_public' } },
  };
  expect(resolveStorageConfigFromCodec(codec, modules)?.id).toBe(
    'data_room-module'
  );
  expect(modules.some((module) => module.id === 'app-module')).toBe(false);
  expect(
    resolveStorageConfigFromCodec({ ...codec, name: 'absent_files' }, modules)
  ).toBeNull();
  expect(await loadAllStorageModules(other, OTHER_DATABASE)).toBe(otherModules);
  expect(other.query).toHaveBeenCalledTimes(1);
});

it.each([DATABASE, undefined])(
  'fences an old module query after invalidation of %s',
  async (databaseId) => {
    const old = deferred<{ rows: ReturnType<typeof moduleRow>[] }>();
    const client = {
      query: jest
        .fn()
        .mockReturnValueOnce(old.promise)
        .mockResolvedValue({ rows: [moduleRow('data_room')] }),
    };
    const pending = loadAllStorageModules(client, DATABASE);
    clearStorageModuleCache(databaseId);
    const fresh = await loadAllStorageModules(client, DATABASE);
    old.resolve({ rows: [moduleRow('app')] });
    await pending;

    expect(await loadAllStorageModules(client, DATABASE)).toBe(fresh);
    expect(client.query).toHaveBeenCalledTimes(2);
  }
);

it('does not invalidate a different database query that is still in flight', async () => {
  const old = deferred<{ rows: ReturnType<typeof moduleRow>[] }>();
  const client = { query: jest.fn(() => old.promise) };
  const pending = loadAllStorageModules(client, OTHER_DATABASE);
  clearStorageModuleCache(DATABASE);
  old.resolve({ rows: [moduleRow('other')] });
  const modules = await pending;
  expect(await loadAllStorageModules(client, OTHER_DATABASE)).toBe(modules);
  expect(client.query).toHaveBeenCalledTimes(1);
});

it('propagates failed queries and permits a fresh load afterwards', async () => {
  const client = {
    query: jest
      .fn()
      .mockRejectedValueOnce(new Error('metadata unavailable'))
      .mockResolvedValue({ rows: [moduleRow('app')] }),
  };
  await expect(loadAllStorageModules(client, DATABASE)).rejects.toThrow(
    'metadata unavailable'
  );
  clearStorageModuleCache(DATABASE);
  expect(await loadAllStorageModules(client, DATABASE)).toHaveLength(1);
});

it('clears bucket metadata and fences an in-flight bucket read with its schema', async () => {
  const config = {
    id: 'module',
    entityTableId: null,
    bucketsQualifiedName: 'storage_public.app_buckets',
  } as StorageModuleConfig;
  const old = deferred<{ rows: object[] }>();
  const freshRow = { id: 'new-bucket', physical_name: 'new-physical-bucket' };
  const client = {
    query: jest
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockResolvedValue({ rows: [freshRow] }),
  };
  const pending = getBucketConfig(client, config, DATABASE, 'documents');
  clearStorageModuleCache(DATABASE);
  const fresh = await getBucketConfig(client, config, DATABASE, 'documents');
  old.resolve({
    rows: [{ id: 'old-bucket', physical_name: 'old-physical-bucket' }],
  });
  await pending;
  expect(await getBucketConfig(client, config, DATABASE, 'documents')).toBe(
    fresh
  );

  clearStorageModuleCache(DATABASE);
  await getBucketConfig(client, config, DATABASE, 'documents');
  expect(client.query).toHaveBeenCalledTimes(3);
});
