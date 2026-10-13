/**
 * The multipart upload lane, end to end minus the network.
 *
 * S3 is mocked at the streamer/client boundary and the database at the query
 * boundary, so these assert what the lane decides: that the bytes go to the
 * tenant's resolved bucket rather than an environment one, that a files row is
 * created, and that the value stored in the column names that row while keeping
 * the `url` its existing readers depend on.
 */

import { Readable } from 'stream';

const DATABASE_ID = '00000000-0000-0000-0000-0000000000db';
const MODULE_ID = '11111111-1111-1111-1111-111111111111';
const BUCKET_ID = '33333333-3333-3333-3333-333333333333';
const FILE_ID = '44444444-4444-4444-4444-444444444444';

const FIELD = { schemaName: 'app_public', tableName: 'posts', columnName: 'image' };

interface QueryHandler {
  match: RegExp;
  rows: () => unknown[];
}

function storageModuleRow(): Record<string, unknown> {
  return {
    id: MODULE_ID,
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
    allowed_origins: null,
    upload_url_expiry_seconds: null,
    download_url_expiry_seconds: null,
    default_max_file_size: 1048576,
    max_filename_length: null,
    cache_ttl_seconds: null,
    max_bulk_files: null,
    max_bulk_total_size: null,
    has_path_shares: false,
    has_versioning: false,
    has_confirm_upload: false,
    entity_schema: null,
    entity_table: null,
  };
}

function bucketRow(isPublic: boolean): Record<string, unknown> {
  return {
    id: BUCKET_ID,
    key: isPublic ? 'default-public' : 'default',
    type: isPublic ? 'public' : 'private',
    is_public: isPublic,
    owner_id: null,
    allowed_mime_types: null,
    max_file_size: null,
    allow_custom_keys: false,
    physical_name: 'myapp-default-public-db',
  };
}

/** A withPgClient answering exactly the statements this lane issues. */
function fakeContext(opts: { isPublic?: boolean; existingFile?: boolean; failInsert?: boolean } = {}) {
  const isPublic = opts.isPublic ?? true;
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const handlers: QueryHandler[] = [
    { match: /set_config/, rows: () => [] },
    { match: /current_database_id/, rows: () => [{ id: DATABASE_ID }] },
    { match: /file_ref_field/, rows: () => [] },
    { match: /FROM metaschema_modules_public\.storage_module/, rows: () => [storageModuleRow()] },
    {
      match: /resolve_default_bucket/,
      rows: () => [{
        bucket_id: BUCKET_ID,
        resolved_key: isPublic ? 'default-public' : 'default',
        bucket_type: isPublic ? 'public' : 'private',
        physical_name: 'myapp-default-public-db',
      }],
    },
    { match: /SELECT id, key, type/, rows: () => [bucketRow(isPublic)] },
    {
      match: /SELECT id, key, mime_type/,
      rows: () => opts.existingFile
        ? [{ id: FILE_ID, key: 'existing-key', mime_type: 'image/png', size: 16, filename: 'first.png' }]
        : [],
    },
    {
      match: /app_files_record_file/,
      rows: () => {
        if (opts.failInsert) throw new Error('insert boom');
        return [{ id: FILE_ID }];
      },
    },
  ];

  const client = {
    async query(o: { text: string; values?: unknown[] }) {
      queries.push(o);
      const handler = handlers.find((h) => h.match.test(o.text));
      if (!handler) throw new Error(`unexpected query: ${o.text}`);
      return { rows: handler.rows() };
    },
    withTransaction: (cb: any) => cb(client),
  };

  return {
    context: {
      withPgClient: (_settings: any, cb: any) => cb(client),
      pgSettings: { 'jwt.claims.database_id': DATABASE_ID },
    },
    queries,
  };
}

async function loadUploadResolverModule(opts: { detectedContentType: string }) {
  jest.resetModules();

  const mockDetectContentType = jest.fn().mockResolvedValue({
    stream: Readable.from([Buffer.alloc(16)]),
    magic: { type: opts.detectedContentType, charset: 'binary' },
    contentType: opts.detectedContentType,
  });

  const mockUploadWithContentType = jest.fn().mockImplementation(async ({ readStream }: any) => {
    // Drain the stream so the hashing pass-through sees every byte, exactly as
    // a real multipart upload to S3 would.
    for await (const _chunk of readStream) { /* consumed */ }
    return {
      upload: { Location: 'https://cdn.example.com/uploaded-file' },
      contentType: opts.detectedContentType,
    };
  });

  jest.doMock('@constructive-io/graphql-env', () => ({
    getEnvOptions: jest.fn(() => ({
      storage: { accessKeyId: 'test', secretAccessKey: 'test' },
    })),
  }));

  jest.doMock('@constructive-io/s3-streamer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      uploadWithContentType: mockUploadWithContentType,
      detectContentType: mockDetectContentType,
    })),
  }));

  const s3Send = jest.fn().mockResolvedValue({});
  jest.doMock('@constructive-io/s3-utils', () => ({
    createS3Client: jest.fn(() => ({ send: s3Send })),
  }));

  const mod = await import('../src/upload-resolver');
  const { clearBucketCache, clearStorageModuleCache, clearFileRefFieldCache } =
    await import('graphile-presigned-url-plugin');
  clearBucketCache();
  clearStorageModuleCache();
  clearFileRefFieldCache();

  return { ...mod, mockDetectContentType, mockUploadWithContentType, s3Send };
}

function definitionFor(defs: any[], name: string) {
  const def = defs.find((d) => 'name' in d && d.name === name);
  if (!def) throw new Error(`Missing ${name} upload field definition`);
  return def;
}

function makeFakeUpload(filename: string) {
  return {
    filename,
    createReadStream: jest.fn(() => Readable.from([Buffer.alloc(16)])),
  };
}

describe('multipart upload resolver', () => {
  it('rejects a disallowed MIME before anything is written', async () => {
    const { constructiveUploadFieldDefinitions, mockDetectContentType, mockUploadWithContentType } =
      await loadUploadResolverModule({ detectedContentType: 'application/pdf' });
    const { context } = fakeContext();

    await expect(
      definitionFor(constructiveUploadFieldDefinitions, 'image').resolve(
        makeFakeUpload('document.pdf') as any,
        {},
        context,
        { uploadPlugin: { tags: {}, type: 'image', field: FIELD } },
      ),
    ).rejects.toThrow('UPLOAD_MIMETYPE');

    expect(mockDetectContentType).toHaveBeenCalledTimes(1);
    expect(mockUploadWithContentType).not.toHaveBeenCalled();
  });

  it('stores a projection that names the files row, keeping url/filename/mime', async () => {
    const { constructiveUploadFieldDefinitions, mockUploadWithContentType } =
      await loadUploadResolverModule({ detectedContentType: 'image/png' });
    const { context, queries } = fakeContext();

    const result: any = await definitionFor(constructiveUploadFieldDefinitions, 'image').resolve(
      makeFakeUpload('photo.png') as any,
      {},
      context,
      { uploadPlugin: { tags: {}, type: 'image', field: FIELD } },
    );

    // The load-bearing new field: GC counts document references by files-row id.
    expect(result.id).toBe(FILE_ID);
    expect(result.bucket_id).toBe(BUCKET_ID);
    expect(result.size).toBe(16);
    // The content hash of 16 zero bytes — the key is derived from the bytes, not
    // from a random string.
    expect(result.key).toBe('374708fff7719dd5979ec875d56cd2286f6d3cf7ec317a3b25632aab28ec37bb');
    // Retained for existing readers of the pre-managed shape.
    expect(result.filename).toBe('photo.png');
    expect(result.mime).toBe('image/png');
    expect(result.url).toBe('https://cdn.example.com/374708fff7719dd5979ec875d56cd2286f6d3cf7ec317a3b25632aab28ec37bb');

    // The bytes went to the tenant's bucket, and to a staging key first.
    const call = mockUploadWithContentType.mock.calls[0][0];
    expect(call.bucket).toBe('myapp-default-public-db');
    expect(call.key).toMatch(/^\.staging\//);

    const recorder = queries.find((q) => /app_files_record_file/.test(q.text));
    expect(recorder).toBeDefined();
    expect(recorder?.text).not.toContain('INSERT INTO');
  });

  it('deduplicates against an existing row rather than inserting a second one', async () => {
    const { constructiveUploadFieldDefinitions } =
      await loadUploadResolverModule({ detectedContentType: 'image/png' });
    const { context, queries } = fakeContext({ existingFile: true });

    const result: any = await definitionFor(constructiveUploadFieldDefinitions, 'upload').resolve(
      makeFakeUpload('photo.png') as any,
      {},
      context,
      { uploadPlugin: { tags: {}, type: 'upload', field: FIELD } },
    );

    expect(result.id).toBe(FILE_ID);
    expect(result.key).toBe('existing-key');
    expect(queries.some((q) => /INSERT/.test(q.text))).toBe(false);
  });

  it('returns a bare URL for an attachment column, whose type cannot hold a document', async () => {
    const { constructiveUploadFieldDefinitions } =
      await loadUploadResolverModule({ detectedContentType: 'application/pdf' });
    const { context } = fakeContext();

    const result = await definitionFor(constructiveUploadFieldDefinitions, 'attachment').resolve(
      makeFakeUpload('doc.pdf') as any,
      {},
      context,
      { uploadPlugin: { tags: {}, type: 'attachment', field: { ...FIELD, columnName: 'doc' } } },
    );

    expect(typeof result).toBe('string');
    expect(result).toMatch(/^https:\/\/cdn\.example\.com\//);
  });

  it('refuses to put an expiring URL in an attachment column on a private bucket', async () => {
    const { constructiveUploadFieldDefinitions } =
      await loadUploadResolverModule({ detectedContentType: 'application/pdf' });
    const { context } = fakeContext({ isPublic: false });

    await expect(
      definitionFor(constructiveUploadFieldDefinitions, 'attachment').resolve(
        makeFakeUpload('doc.pdf') as any,
        {},
        context,
        { uploadPlugin: { tags: {}, type: 'attachment', field: { ...FIELD, columnName: 'doc' } } },
      ),
    ).rejects.toThrow('ATTACHMENT_BUCKET_NOT_PUBLIC');
  });

  it('leaves nothing in S3 when the files row cannot be created', async () => {
    const { constructiveUploadFieldDefinitions, s3Send } =
      await loadUploadResolverModule({ detectedContentType: 'image/png' });
    // The insert is the last step, so it fails with the bytes already staged.
    const { context } = fakeContext({ failInsert: true });

    await expect(
      definitionFor(constructiveUploadFieldDefinitions, 'image').resolve(
        makeFakeUpload('photo.png') as any,
        {},
        context,
        { uploadPlugin: { tags: {}, type: 'image', field: FIELD } },
      ),
    ).rejects.toThrow('insert boom');

    // Copy to the content key, then both the promoted and the staged object are
    // removed: no files row names either, so GC could never reach them.
    expect(s3Send).toHaveBeenCalledTimes(3);
  });

  it('refuses to upload when the plugin cannot say which column is being written', async () => {
    const { constructiveUploadFieldDefinitions } =
      await loadUploadResolverModule({ detectedContentType: 'image/png' });
    const { context } = fakeContext();

    await expect(
      definitionFor(constructiveUploadFieldDefinitions, 'image').resolve(
        makeFakeUpload('photo.png') as any,
        {},
        context,
        { uploadPlugin: { tags: {}, type: 'image' } },
      ),
    ).rejects.toThrow('UPLOAD_FIELD_UNKNOWN');
  });

  it('rejects an extension that disagrees with the bytes, before anything is written', async () => {
    // The html-as-jpg attack: a browser fetching this as an image would execute
    // the script in it.
    const { constructiveUploadFieldDefinitions, mockUploadWithContentType } =
      await loadUploadResolverModule({ detectedContentType: 'text/html' });
    const { context, queries } = fakeContext();

    await expect(
      definitionFor(constructiveUploadFieldDefinitions, 'image').resolve(
        makeFakeUpload('avatar.jpg') as any,
        {},
        context,
        { uploadPlugin: { tags: {}, type: 'image', field: FIELD } },
      ),
    ).rejects.toThrow('UPLOAD_TYPE_MISMATCH');

    expect(mockUploadWithContentType).not.toHaveBeenCalled();
    expect(queries.some((q) => /INSERT/.test(q.text))).toBe(false);
  });

  it('rejects a declared MIME type that disagrees with the bytes', async () => {
    const { constructiveUploadFieldDefinitions, mockUploadWithContentType } =
      await loadUploadResolverModule({ detectedContentType: 'application/pdf' });
    const { context } = fakeContext();

    await expect(
      definitionFor(constructiveUploadFieldDefinitions, 'upload').resolve(
        { ...makeFakeUpload('report.pdf'), mimetype: 'image/png' } as any,
        {},
        context,
        { uploadPlugin: { tags: {}, type: 'upload', field: FIELD } },
      ),
    ).rejects.toThrow('UPLOAD_TYPE_MISMATCH');

    expect(mockUploadWithContentType).not.toHaveBeenCalled();
  });

  it('accepts a text file whose extension the bytes cannot confirm in detail', async () => {
    // Leading bytes can tell text from binary, not CSV from plain text; treating
    // that as a mismatch would reject every legitimate text upload.
    const { constructiveUploadFieldDefinitions } =
      await loadUploadResolverModule({ detectedContentType: 'text/plain' });
    const { context } = fakeContext();

    const result: any = await definitionFor(constructiveUploadFieldDefinitions, 'upload').resolve(
      { ...makeFakeUpload('rows.csv'), mimetype: 'text/csv' } as any,
      {},
      context,
      { uploadPlugin: { tags: {}, type: 'upload', field: FIELD } },
    );

    expect(result.id).toBe(FILE_ID);
  });
});
