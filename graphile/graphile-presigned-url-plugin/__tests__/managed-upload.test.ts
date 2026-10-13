/**
 * The managed upload lifecycle: bucket resolution, bucket rules, and the
 * staged-object → files row + projection promotion.
 *
 * The database is faked at the query boundary (each test answers only the
 * statements its path issues) so these cover the decisions this module makes —
 * which bucket, whether to dedup, what the document ends up containing —
 * without a server or S3.
 */

const mockS3Send = jest.fn();
jest.mock('@constructive-io/s3-utils', () => ({
  createS3Client: jest.fn(() => ({ send: mockS3Send })),
}));

import { clearFileRefFieldCache } from '../src/file-ref-registry';
import { clearBucketCache, clearStorageModuleCache } from '../src/storage-module-cache';
import type { BucketConfig, PresignedUrlPluginOptions, S3Config, StorageModuleConfig } from '../src/types';

const DATABASE_ID = '00000000-0000-0000-0000-0000000000db';
const APP_MODULE_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_MODULE_ID = '22222222-2222-2222-2222-222222222222';
const BUCKET_ID = '33333333-3333-3333-3333-333333333333';
const FILE_ID = '44444444-4444-4444-4444-444444444444';
const FIELD = { schemaName: 'app_public', tableName: 'posts', columnName: 'image' };

interface QueryHandler {
  match: RegExp;
  rows: (values: unknown[]) => unknown[];
}

interface FakeDb {
  withPgClient: any;
  queries: Array<{ text: string; values?: unknown[] }>;
}

/**
 * A withPgClient whose statements are answered by the first matching handler.
 *
 * Unmatched statements throw rather than returning zero rows: a resolver that
 * silently proceeds on an unanswered query is exactly the bug these tests exist
 * to catch.
 */
function fakeDb(handlers: QueryHandler[]): FakeDb {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client = {
    async query(opts: { text: string; values?: unknown[] }) {
      queries.push(opts);
      const handler = handlers.find((h) => h.match.test(opts.text));
      if (!handler) throw new Error(`unexpected query: ${opts.text}`);
      return { rows: handler.rows(opts.values ?? []) };
    },
    withTransaction: (cb: any) => cb(client),
  };
  return {
    withPgClient: (_settings: any, cb: any) => cb(client),
    queries,
  };
}

const SET_CONFIG: QueryHandler = { match: /set_config/, rows: () => [] };

function storageModuleRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: APP_MODULE_ID,
    scope: 'app',
    entity_table_id: null,
    buckets_schema: 'storage_public',
    buckets_table: 'app_buckets',
    files_schema: 'storage_public',
    files_table: 'app_files',
    private_schema: 'storage_private',
    endpoint: 'http://localhost:9000',
    public_url_prefix: 'https://cdn.example.com',
    provider: 'minio',
    region: 'us-east-1',
    connection_overrides: [],
    allowed_origins: null,
    upload_url_expiry_seconds: null,
    download_url_expiry_seconds: null,
    default_max_file_size: 1000,
    max_filename_length: null,
    cache_ttl_seconds: null,
    max_bulk_files: null,
    max_bulk_total_size: null,
    has_path_shares: false,
    has_versioning: false,
    has_content_hash: false,
    entity_schema: null,
    entity_table: null,
    ...overrides,
  };
}

function bucketRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: BUCKET_ID,
    key: 'default-public',
    type: 'public',
    is_public: true,
    owner_id: null,
    allowed_mime_types: null,
    max_file_size: null,
    allow_custom_keys: false,
    physical_name: 'myapp-default-public-db',
    ...overrides,
  };
}

const STORAGE_MODULES: QueryHandler = {
  match: /FROM metaschema_modules_public\.storage_module/,
  rows: () => [storageModuleRow()],
};

const NO_REGISTRY_ROW: QueryHandler = {
  match: /file_ref_field/,
  rows: () => [],
};

function options(): PresignedUrlPluginOptions {
  return { credentials: { accessKeyId: 'test', secretAccessKey: 'test' } };
}

function storageConfig(): StorageModuleConfig {
  return {
    id: APP_MODULE_ID,
    scope: 'app',
    bucketsQualifiedName: 'storage_public.app_buckets',
    filesQualifiedName: 'storage_public.app_files',
    filesTableName: 'app_files',
    recorderQualifiedName: 'storage_private.app_files_record_file',
    defaultMaxFileSize: 1000,
    hasPathShares: false,
    allowedOrigins: null,
  } as unknown as StorageModuleConfig;
}

// Every lookup on this path is cached for the life of the process; each test
// states its own database, so the caches start empty.
beforeEach(() => {
  clearStorageModuleCache();
  clearBucketCache();
  clearFileRefFieldCache();
});

describe('buildFileProjection', () => {
  it('names the files row in `id` so a document reference is countable', async () => {
    const { buildFileProjection } = await import('../src/managed-upload');

    const projection = buildFileProjection(
      { id: FILE_ID, key: 'abc123', bucketId: BUCKET_ID, mime: 'image/png', size: 42, filename: 'hero.png' },
      { is_public: true },
      { publicUrlPrefix: 'https://cdn.example.com/' } as S3Config,
    );

    expect(projection).toEqual({
      id: FILE_ID,
      key: 'abc123',
      bucket_id: BUCKET_ID,
      mime: 'image/png',
      size: 42,
      filename: 'hero.png',
      url: 'https://cdn.example.com/abc123',
    });
  });

  it('omits `url` for a private bucket rather than storing an expiring one', async () => {
    const { buildFileProjection } = await import('../src/managed-upload');

    const projection = buildFileProjection(
      { id: FILE_ID, key: 'abc123', bucketId: BUCKET_ID, mime: 'image/png', size: 42 },
      { is_public: false },
      { publicUrlPrefix: 'https://cdn.example.com' } as S3Config,
    );

    expect(projection.url).toBeUndefined();
    expect(projection.id).toBe(FILE_ID);
  });
});

describe('resolveManagedUploadTarget', () => {
  it('resolves the default tag for an unregistered column, never an env bucket', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      NO_REGISTRY_ROW,
      STORAGE_MODULES,
      { match: /resolve_default_bucket/, rows: () => [{ bucket_id: BUCKET_ID, resolved_key: 'default-public', bucket_type: 'public', physical_name: 'myapp-default-public-db' }] },
      { match: /FROM storage_public\.app_buckets/, rows: () => [bucketRow()] },
    ]);

    const target = await resolveManagedUploadTarget({
      options: options(),
      withPgClient: db.withPgClient,
      pgSettings: { 'jwt.claims.database_id': DATABASE_ID },
      databaseId: DATABASE_ID,
      field: FIELD,
      defaultPublicAccess: true,
    });

    expect(target.binding).toBeNull();
    expect(target.physicalName).toBe('myapp-default-public-db');
    expect(target.s3.bucket).toBe('myapp-default-public-db');
    expect(target.s3.endpoint).toBe('http://localhost:9000');
    expect(target.s3.region).toBe('us-east-1');

    const resolveCall = db.queries.find((q) => /resolve_default_bucket/.test(q.text));
    // scope, entity, public_access, and no explicit key: the reserved default tag.
    expect(resolveCall?.values).toEqual([DATABASE_ID, 'app', null, true, null]);
  });

  it('passes a registered field\'s declared bucket key and publicness through', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      {
        match: /file_ref_field/,
        rows: () => [{
          id: 'ref-1',
          storage_module_id: APP_MODULE_ID,
          bucket_key: 'avatars',
          bucket_tags: null,
          is_public: false,
          enforce_fk: true,
        }],
      },
      STORAGE_MODULES,
      { match: /resolve_default_bucket/, rows: () => [{ bucket_id: BUCKET_ID, resolved_key: 'avatars', bucket_type: 'private', physical_name: 'myapp-avatars-db' }] },
      { match: /FROM storage_public\.app_buckets/, rows: () => [bucketRow({ key: 'avatars', type: 'private', is_public: false, physical_name: 'myapp-avatars-db' })] },
    ]);

    const target = await resolveManagedUploadTarget({
      options: options(),
      withPgClient: db.withPgClient,
      pgSettings: null,
      databaseId: DATABASE_ID,
      field: FIELD,
      defaultPublicAccess: true,
    });

    const resolveCall = db.queries.find((q) => /resolve_default_bucket/.test(q.text));
    expect(resolveCall?.values).toEqual([DATABASE_ID, 'app', null, false, 'avatars']);
    expect(target.bucket.key).toBe('avatars');
  });

  it('refuses a path-keyed bucket, whose keys are chosen by its publisher', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    // A static site's bucket: public, custom keys allowed, addressed by path.
    const db = fakeDb([
      SET_CONFIG,
      NO_REGISTRY_ROW,
      STORAGE_MODULES,
      { match: /resolve_default_bucket/, rows: () => [{ bucket_id: BUCKET_ID, resolved_key: 'site', bucket_type: 'public', physical_name: 'myapp-site-db' }] },
      { match: /FROM storage_public\.app_buckets/, rows: () => [bucketRow({ key: 'site', allow_custom_keys: true, physical_name: 'myapp-site-db' })] },
    ]);

    await expect(
      resolveManagedUploadTarget({
        options: options(),
        withPgClient: db.withPgClient,
        pgSettings: null,
        databaseId: DATABASE_ID,
        field: FIELD,
        defaultPublicAccess: true,
      }),
    ).rejects.toThrow('BUCKET_PATH_KEYED');
  });

  it('rejects an unreconciled bucket without calling S3 or provisioning', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    mockS3Send.mockClear();
    const db = fakeDb([
      SET_CONFIG,
      NO_REGISTRY_ROW,
      STORAGE_MODULES,
      { match: /resolve_default_bucket/, rows: () => [{ bucket_id: BUCKET_ID, resolved_key: 'default-public', bucket_type: 'public', physical_name: null }] },
      { match: /SELECT id, key, type/, rows: () => [bucketRow({ physical_name: null })] },
    ]);

    await expect(resolveManagedUploadTarget({
      options: options(),
      withPgClient: db.withPgClient,
      pgSettings: null,
      databaseId: DATABASE_ID,
      field: FIELD,
      defaultPublicAccess: true,
    })).rejects.toThrow('STORAGE_BUCKET_NOT_RECONCILED');

    expect(mockS3Send).not.toHaveBeenCalled();
    expect(db.queries.some((q) => /UPDATE/.test(q.text))).toBe(false);
  });

  it('raises when the database has no storage module to default to', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      NO_REGISTRY_ROW,
      { match: /FROM metaschema_modules_public\.storage_module/, rows: () => [] },
    ]);

    await expect(
      resolveManagedUploadTarget({
        options: options(),
        withPgClient: db.withPgClient,
        pgSettings: null,
        databaseId: DATABASE_ID,
        field: FIELD,
        defaultPublicAccess: true,
      }),
    ).rejects.toThrow('STORAGE_MODULE_NOT_FOUND');
  });

  // The fallback for an unregistered column selects the database's single
  // global plane by shape (no entity key), not by the name its scope happens to
  // carry: a database-scope plane registers as 'database', and matching 'app'
  // sent every one of them to STORAGE_MODULE_NOT_FOUND.
  it('defaults an unregistered column to a database-scope plane', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      NO_REGISTRY_ROW,
      {
        match: /FROM metaschema_modules_public\.storage_module/,
        rows: () => [storageModuleRow({
          scope: 'database',
          buckets_table: 'buckets',
          files_table: 'files',
        })],
      },
      { match: /resolve_default_bucket/, rows: () => [{ bucket_id: BUCKET_ID, resolved_key: 'default-public', bucket_type: 'public', physical_name: 'myapp-default-public-db' }] },
      { match: /FROM storage_public\.buckets/, rows: () => [bucketRow()] },
    ]);

    const target = await resolveManagedUploadTarget({
      options: options(),
      withPgClient: db.withPgClient,
      pgSettings: null,
      databaseId: DATABASE_ID,
      field: FIELD,
      defaultPublicAccess: true,
    });

    expect(target.storageConfig.scope).toBe('database');
    expect(target.physicalName).toBe('myapp-default-public-db');
    const resolveCall = db.queries.find((q) => /resolve_default_bucket/.test(q.text));
    expect(resolveCall?.values).toEqual([DATABASE_ID, 'database', null, true, null]);
  });

  it('refuses to guess between two global planes for an unregistered column', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      NO_REGISTRY_ROW,
      {
        match: /FROM metaschema_modules_public\.storage_module/,
        rows: () => [
          storageModuleRow({ scope: 'database', buckets_table: 'buckets', files_table: 'files' }),
          storageModuleRow({ id: OTHER_MODULE_ID, scope: 'platform', buckets_table: 'platform_buckets', files_table: 'platform_files' }),
        ],
      },
    ]);

    await expect(
      resolveManagedUploadTarget({
        options: options(),
        withPgClient: db.withPgClient,
        pgSettings: null,
        databaseId: DATABASE_ID,
        field: FIELD,
        defaultPublicAccess: true,
      }),
    ).rejects.toThrow('STORAGE_MODULE_AMBIGUOUS');
  });

  it('raises when the registry names a module the database does not have', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      {
        match: /file_ref_field/,
        rows: () => [{ id: 'ref-1', storage_module_id: OTHER_MODULE_ID, bucket_key: null, bucket_tags: null, is_public: null, enforce_fk: false }],
      },
      STORAGE_MODULES,
    ]);

    await expect(
      resolveManagedUploadTarget({
        options: options(),
        withPgClient: db.withPgClient,
        pgSettings: null,
        databaseId: DATABASE_ID,
        field: FIELD,
        defaultPublicAccess: true,
      }),
    ).rejects.toThrow(OTHER_MODULE_ID);
  });

  it('refuses an entity-scoped module, whose bucket depends on an owner row', async () => {
    const { resolveManagedUploadTarget } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      {
        match: /file_ref_field/,
        rows: () => [{ id: 'ref-1', storage_module_id: OTHER_MODULE_ID, bucket_key: null, bucket_tags: null, is_public: null, enforce_fk: false }],
      },
      {
        match: /FROM metaschema_modules_public\.storage_module/,
        rows: () => [storageModuleRow({
          id: OTHER_MODULE_ID,
          scope: 'data_room',
          entity_table_id: 'et-1',
          entity_schema: 'app_public',
          entity_table: 'data_rooms',
          buckets_table: 'data_room_buckets',
          files_table: 'data_room_files',
        })],
      },
    ]);

    await expect(
      resolveManagedUploadTarget({
        options: options(),
        withPgClient: db.withPgClient,
        pgSettings: null,
        databaseId: DATABASE_ID,
        field: FIELD,
        defaultPublicAccess: true,
      }),
    ).rejects.toThrow('STORAGE_SCOPE_UNSUPPORTED');
  });
});

describe('assertUploadAllowedByBucket', () => {
  function target(bucket: Partial<BucketConfig>): any {
    return { bucket: { ...bucketRow(), ...bucket }, storageConfig: storageConfig() };
  }

  it('enforces the bucket mime allowlist on the streaming transport too', async () => {
    const { assertUploadAllowedByBucket } = await import('../src/managed-upload');
    expect(() =>
      assertUploadAllowedByBucket(target({ allowed_mime_types: ['image/*'] }), 'application/pdf', 10),
    ).toThrow('CONTENT_TYPE_NOT_ALLOWED');
    expect(() =>
      assertUploadAllowedByBucket(target({ allowed_mime_types: ['image/*'] }), 'image/png', 10),
    ).not.toThrow();
  });

  it('enforces the size cap, falling back to the module default', async () => {
    const { assertUploadAllowedByBucket } = await import('../src/managed-upload');
    expect(() => assertUploadAllowedByBucket(target({ max_file_size: 5 }), 'image/png', 6)).toThrow('FILE_TOO_LARGE');
    expect(() => assertUploadAllowedByBucket(target({ max_file_size: null }), 'image/png', 1001)).toThrow('FILE_TOO_LARGE');
    expect(() => assertUploadAllowedByBucket(target({}), 'image/png', 0)).toThrow('INVALID_FILE_SIZE');
  });
});

describe('finalizeStagedUpload', () => {
  const s3 = {
    client: { send: jest.fn().mockResolvedValue({}) },
    bucket: 'myapp-default-public-db',
    region: 'us-east-1',
    publicUrlPrefix: 'https://cdn.example.com',
  } as unknown as S3Config;

  const target: any = {
    databaseId: DATABASE_ID,
    storageConfig: storageConfig(),
    bucket: bucketRow(),
    physicalName: 'myapp-default-public-db',
    s3,
    binding: null,
  };

  const staged = {
    stagingKey: '.staging/tmp-1',
    contentHash: 'a'.repeat(64),
    contentType: 'image/png',
    size: 16,
    filename: 'hero.png',
  };

  beforeEach(() => {
    (s3.client.send as jest.Mock).mockClear();
  });

  it('promotes the staged object to its content key and inserts the files row', async () => {
    const { finalizeStagedUpload } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      { match: /SELECT id, key, mime_type/, rows: () => [] },
      { match: /SELECT id FROM storage_private\.app_files_record_file/, rows: () => [{ id: FILE_ID }] },
    ]);

    const { projection, deduplicated } = await finalizeStagedUpload({
      target, withPgClient: db.withPgClient, pgSettings: null, staged,
    });

    expect(deduplicated).toBe(false);
    expect(projection).toEqual({
      id: FILE_ID,
      key: staged.contentHash,
      bucket_id: BUCKET_ID,
      mime: 'image/png',
      size: 16,
      filename: 'hero.png',
      url: `https://cdn.example.com/${staged.contentHash}`,
    });

    const recorder = db.queries.find((q) => /record_file/.test(q.text));
    expect(recorder?.text).toContain('bucket_id :=');
    expect(recorder?.text).toContain('upload :=');
    expect(recorder?.text).not.toContain('owner_id');
    expect(recorder?.text).not.toContain('is_public');
    expect(recorder?.values).toEqual([
      BUCKET_ID, staged.contentHash, staged.contentHash, 'image/png', 16, 'hero.png', null,
    ]);
    // Copy to the content key, then drop the staged object.
    expect(s3.client.send).toHaveBeenCalledTimes(2);
  });

  it('reuses the existing row and drops the staged bytes on a hash collision', async () => {
    const { finalizeStagedUpload } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      {
        match: /SELECT id, key, mime_type/,
        rows: () => [{ id: FILE_ID, key: staged.contentHash, mime_type: 'image/png', size: 16, filename: 'original.png' }],
      },
    ]);

    const { projection, deduplicated } = await finalizeStagedUpload({
      target, withPgClient: db.withPgClient, pgSettings: null, staged,
    });

    expect(deduplicated).toBe(true);
    expect(projection.id).toBe(FILE_ID);
    expect(projection.filename).toBe('original.png');
    expect(db.queries.some((q) => /INSERT/.test(q.text))).toBe(false);
    // Only the staged object is deleted; nothing is copied.
    expect(s3.client.send).toHaveBeenCalledTimes(1);
  });

  // With the confirm-upload lifecycle, a row is a claim on bytes rather than
  // proof of them, so only a confirmed row may absorb an upload.
  describe('with the confirm-upload lifecycle', () => {
    const lifecycleTarget = {
      ...target,
      storageConfig: { ...storageConfig(), hasConfirmUpload: true } as StorageModuleConfig,
    };

    const existingRow = (status: string) => ({
      id: FILE_ID,
      key: staged.contentHash,
      mime_type: 'image/png',
      size: 16,
      filename: 'original.png',
      status,
    });

    it.each(['uploaded', 'processed'])('deduplicates against a %s row', async (status) => {
      const { finalizeStagedUpload } = await import('../src/managed-upload');
      const db = fakeDb([
        SET_CONFIG,
        { match: /SELECT id, key, mime_type/, rows: () => [existingRow(status)] },
      ]);

      const { projection, deduplicated } = await finalizeStagedUpload({
        target: lifecycleTarget, withPgClient: db.withPgClient, pgSettings: null, staged,
      });

      expect(deduplicated).toBe(true);
      expect(projection.id).toBe(FILE_ID);
      expect(db.queries.some((q) => /INSERT|DELETE/.test(q.text))).toBe(false);
    });

    it.each(['requested', 'rejected', 'expired'])(
      'drops the %s row and uploads afresh instead of reporting a dedup hit',
      async (status) => {
        const { finalizeStagedUpload } = await import('../src/managed-upload');
        const NEW_FILE_ID = '55555555-5555-5555-5555-555555555555';
        const db = fakeDb([
          SET_CONFIG,
          { match: /SELECT id, key, mime_type/, rows: () => [existingRow(status)] },
          { match: /DELETE FROM storage_public\.app_files/, rows: () => [] },
          { match: /SELECT id FROM storage_private\.app_files_record_file/, rows: () => [{ id: NEW_FILE_ID }] },
        ]);

        const { projection, deduplicated } = await finalizeStagedUpload({
          target: lifecycleTarget, withPgClient: db.withPgClient, pgSettings: null, staged,
        });

        expect(deduplicated).toBe(false);
        // The caller is handed the row that actually names the promoted bytes.
        expect(projection.id).toBe(NEW_FILE_ID);
        const del = db.queries.find((q) => /DELETE/.test(q.text));
        expect(del?.values).toEqual([FILE_ID]);
        // Promote to the content key, then drop the staged object.
        expect(s3.client.send).toHaveBeenCalledTimes(2);
      },
    );

    it('asks for the status column only when the module has one', async () => {
      const { finalizeStagedUpload } = await import('../src/managed-upload');
      const withLifecycle = fakeDb([
        SET_CONFIG,
        { match: /SELECT id, key, mime_type/, rows: () => [existingRow('uploaded')] },
      ]);
      await finalizeStagedUpload({
        target: lifecycleTarget, withPgClient: withLifecycle.withPgClient, pgSettings: null, staged,
      });
      expect(withLifecycle.queries.find((q) => /SELECT id, key/.test(q.text))!.text).toContain('status');

      const without = fakeDb([
        SET_CONFIG,
        {
          match: /SELECT id, key, mime_type/,
          rows: () => [{ id: FILE_ID, key: staged.contentHash, mime_type: 'image/png', size: 16, filename: null }],
        },
      ]);
      await finalizeStagedUpload({
        target, withPgClient: without.withPgClient, pgSettings: null, staged,
      });
      expect(without.queries.find((q) => /SELECT id, key/.test(q.text))!.text).not.toContain('status');
    });
  });

  it('abandons both keys when the files row cannot be inserted', async () => {
    const { finalizeStagedUpload } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      { match: /SELECT id, key, mime_type/, rows: () => [] },
      { match: /SELECT id FROM storage_private\.app_files_record_file/, rows: () => { throw new Error('insert boom'); } },
    ]);

    await expect(
      finalizeStagedUpload({ target, withPgClient: db.withPgClient, pgSettings: null, staged }),
    ).rejects.toThrow('insert boom');

    // Copy + delete promoted + delete staged: bytes no row names are bytes GC
    // can never reach, so they do not outlive the failed call.
    expect(s3.client.send).toHaveBeenCalledTimes(3);
  });

  it('fails loudly when the storage module has no generated recorder', async () => {
    const { finalizeStagedUpload } = await import('../src/managed-upload');
    const db = fakeDb([
      SET_CONFIG,
      { match: /SELECT id, key, mime_type/, rows: () => [] },
    ]);

    await expect(
      finalizeStagedUpload({
        target: {
          ...target,
          storageConfig: { ...storageConfig(), recorderQualifiedName: null },
        },
        withPgClient: db.withPgClient,
        pgSettings: null,
        staged,
      }),
    ).rejects.toThrow(
      `STORAGE_RECORDER_MISSING: storage module ${APP_MODULE_ID} (app_files)`,
    );
    expect(db.queries.some((q) => /INSERT INTO/.test(q.text))).toBe(false);
  });

  it('rejects bytes the bucket does not allow before writing anything', async () => {
    const { finalizeStagedUpload } = await import('../src/managed-upload');
    const db = fakeDb([SET_CONFIG]);

    await expect(
      finalizeStagedUpload({
        target: { ...target, bucket: { ...bucketRow(), allowed_mime_types: ['image/jpeg'] } },
        withPgClient: db.withPgClient,
        pgSettings: null,
        staged,
      }),
    ).rejects.toThrow('CONTENT_TYPE_NOT_ALLOWED');

    expect(db.queries).toHaveLength(0);
    expect(s3.client.send).not.toHaveBeenCalled();
  });
});
