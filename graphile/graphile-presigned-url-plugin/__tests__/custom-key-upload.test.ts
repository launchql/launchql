/**
 * Re-uploading changed bytes under a custom key.
 *
 * A versioned module keeps the old row and links the new one to it; a module
 * without versioning has one row per key, so the new upload replaces it. The
 * database is faked at the query boundary and presigning is stubbed, so these pin
 * which statements the resolver issues for each module shape.
 */

import { processSingleFile } from '../src/plugin';
import type { BucketConfig, PresignedUrlPluginOptions, S3Config, StorageModuleConfig } from '../src/types';

jest.mock('../src/s3-signer', () => ({
  ...jest.requireActual('../src/s3-signer'),
  generatePresignedPutUrl: jest.fn().mockResolvedValue('https://s3.example.com/put'),
}));

const BUCKET_ID = '33333333-3333-3333-3333-333333333333';
const OLD_FILE_ID = '44444444-4444-4444-4444-444444444444';
const NEW_FILE_ID = '55555555-5555-5555-5555-555555555555';
const KEY = 'index.html';

function storageConfig(overrides: Partial<StorageModuleConfig> = {}): StorageModuleConfig {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    scope: 'app',
    bucketsQualifiedName: 'storage_public.app_buckets',
    filesQualifiedName: 'storage_public.app_files',
    filesTableName: 'app_files',
    recorderQualifiedName: 'storage_private.app_files_record_file',
    defaultMaxFileSize: 1000,
    maxFilenameLength: 1024,
    uploadUrlExpirySeconds: 900,
    hasPathShares: false,
    hasVersioning: false,
    hasContentHash: false,
    hasConfirmUpload: false,
    ...overrides,
  } as unknown as StorageModuleConfig;
}

const bucket = {
  id: BUCKET_ID,
  key: 'site',
  type: 'public',
  is_public: true,
  owner_id: null,
  allowed_mime_types: null,
  max_file_size: null,
  allow_custom_keys: true,
} as unknown as BucketConfig;

const s3 = { client: { send: jest.fn() }, bucket: 'site-bucket', region: 'us-east-1' } as unknown as S3Config;
const options: PresignedUrlPluginOptions = { credentials: { accessKeyId: 'test', secretAccessKey: 'test' } };

function fakeTx(existingHash: string, deletable = true) {
  const queries: Array<{ text: string; values: unknown[] }> = [];
  const txClient = {
    async query(opts: { text: string; values: unknown[] }) {
      queries.push(opts);
      if (/SELECT id, content_hash/.test(opts.text)) {
        return { rows: [{ id: OLD_FILE_ID, content_hash: existingHash }] };
      }
      if (/^DELETE FROM storage_public\.app_files/.test(opts.text)) {
        return { rows: deletable ? [{ id: OLD_FILE_ID }] : [] };
      }
      if (/record_file\(/.test(opts.text)) return { rows: [{ id: NEW_FILE_ID }] };
      throw new Error(`unexpected query: ${opts.text}`);
    },
  };
  return { txClient, queries };
}

const upload = (storage: StorageModuleConfig, txClient: unknown) =>
  processSingleFile(options, txClient, storage, 'db', bucket, s3, {
    contentHash: 'b'.repeat(64),
    contentType: 'text/html',
    size: 16,
    filename: KEY,
    key: KEY,
  });

describe('custom-key upload of changed bytes', () => {
  it('replaces the row at the key when the module has no versioning', async () => {
    const { txClient, queries } = fakeTx('a'.repeat(64));

    const result = await upload(storageConfig(), txClient);

    expect(result).toMatchObject({
      fileId: NEW_FILE_ID,
      key: KEY,
      deduplicated: false,
      previousVersionId: null,
      uploadUrl: 'https://s3.example.com/put',
    });
    expect(queries.map((q) => q.text.split('(')[0].trim().split(/\s+/)[0])).toEqual(['SELECT', 'DELETE', 'SELECT']);
    expect(queries[1].values).toEqual([OLD_FILE_ID]);
    const record = queries[2];
    expect(record.text).not.toContain('previous_version_id');
    expect(record.values).toContain(KEY);
  });

  it('refuses to replace a row the caller cannot delete', async () => {
    const { txClient, queries } = fakeTx('a'.repeat(64), false);

    await expect(upload(storageConfig(), txClient)).rejects.toThrow(
      `FILE_NOT_REPLACEABLE: file ${OLD_FILE_ID} at key ${KEY}`,
    );
    expect(queries.some((q) => /record_file\(/.test(q.text))).toBe(false);
  });

  it('refuses to replace the key when the module is content-addressed without versioning', async () => {
    const { txClient, queries } = fakeTx('a'.repeat(64));

    await expect(upload(storageConfig({ hasContentHash: true }), txClient)).rejects.toThrow(
      `STORAGE_REPLACE_UNSUPPORTED: key ${KEY} already holds file ${OLD_FILE_ID}`,
    );
    expect(queries).toHaveLength(1);
  });

  it('links the new row to the previous version when the module has versioning', async () => {
    const { txClient, queries } = fakeTx('a'.repeat(64));

    const result = await upload(storageConfig({ hasVersioning: true }), txClient);

    expect(result).toMatchObject({ fileId: NEW_FILE_ID, previousVersionId: OLD_FILE_ID, deduplicated: false });
    expect(queries.some((q) => /^DELETE/.test(q.text))).toBe(false);
    const record = queries.find((q) => /record_file\(/.test(q.text))!;
    expect(record.text).toContain('previous_version_id');
    expect(record.values).toContain(OLD_FILE_ID);
  });

  it('deduplicates identical bytes at the key without touching the row', async () => {
    const { txClient, queries } = fakeTx('b'.repeat(64));

    const result = await upload(storageConfig(), txClient);

    expect(result).toMatchObject({ fileId: OLD_FILE_ID, deduplicated: true, uploadUrl: null });
    expect(queries).toHaveLength(1);
  });
});
