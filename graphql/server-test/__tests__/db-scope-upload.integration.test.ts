/**
 * Integration tests — the database-scope upload surface.
 *
 * A storage plane is marked by its `@storageBuckets`/`@storageFiles` tags, not by
 * what its tables are called: an app-scope plane's tables carry the module prefix
 * (`app_buckets`/`app_files`) and a database-scope plane's do not
 * (`buckets`/`files`), because the plane *is* that database's storage. Both must
 * produce an upload surface, so this pins the two together: one schema build over
 * both planes has to expose `uploadAppFile` AND `uploadFile`, and the unprefixed
 * one has to work end to end — presigned PUT to RustFS, and a physical bucket
 * recorded on the tenant's own bucket row.
 *
 * Uses real RustFS (the `rustfs_cdn` service in CI, localhost:9000 locally).
 *
 *   pnpm test -- --testPathPattern=db-scope-upload
 */

import { createS3Bucket, createS3Client } from '@constructive-io/s3-utils';
import { hashContent, putToPresignedUrl } from '@constructive-io/upload-client';
import path from 'path';
import type { PgTestClient } from 'pgsql-test';
import type supertest from 'supertest';

import { getConnections, seed } from '../src';

jest.setTimeout(120000);

const localSeedRoot = path.join(__dirname, '..', '__fixtures__', 'seed');
const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const sql = (seedDir: string, file: string) => path.join(localSeedRoot, seedDir, file);
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');

// Alice — the app-scope plane, prefixed tables (`app_buckets`/`app_files`).
const aliceSchema = 'simple-storage-public';

// Tess — the database-scope plane, unprefixed tables (`buckets`/`files`).
const tessDatabaseId = 'ce551000-0000-4000-8000-000000000001';
const tessSchema = 'tess-storage-public';

const metaSchemas = [
  'catalog_private',
  'routing_public',
  'apps_public',
  'metaschema_public',
  'metaschema_modules_public'
];

const seedAdapters = [
  seed.pgpm(pgpmWorkspace),
  seed.sqlfile([
    sql('simple-seed-storage', 'schema.sql'),
    sql('simple-seed-storage', 'test-data.sql'),
    sql('db-scope-storage', 'schema.sql'),
    sql('db-scope-storage', 'test-data.sql')
  ])
];

const INTROSPECT_MUTATIONS = `
  query IntrospectMutations {
    __type(name: "Mutation") {
      fields {
        name
      }
    }
  }
`;

const UPLOAD_FILE = `
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      uploadUrl
      fileId
      key
      deduplicated
      expiresAt
    }
  }
`;

const BUCKETS = `
  query Buckets {
    buckets {
      nodes {
        id
        key
        isPublic
      }
    }
  }
`;

function expectSuccess(res: supertest.Response): Record<string, any> {
  expect(res.status).toBe(200);
  expect(res.body.errors).toBeUndefined();
  return res.body.data;
}

describe('database-scope upload surface', () => {
  let request: supertest.Agent;
  let pg: PgTestClient;
  let teardown: () => Promise<void>;
  const s3Client = createS3Client({
    provider: 'minio',
    region: 'us-east-1',
    endpoint: 'http://localhost:9000',
    accessKeyId: 'constructive',
    secretAccessKey: 'constructive-dev-secret'
  });

  const post = (
    databaseId: string,
    schemas: string[],
    payload: { query: string; variables?: Record<string, unknown> }
  ) =>
    request
      .post('/graphql')
      .set('X-Database-Id', databaseId)
      .set('X-Schemata', schemas.join(','))
      .send(payload);

  beforeAll(async () => {
    ({ request, pg, teardown } = await getConnections(
      {
        schemas: [aliceSchema, tessSchema],
        authRole: 'anonymous',
        server: {
          useRouting: true,
          api: {
            isPublic: false,
            metaSchemas
          }
        }
      },
      seedAdapters
    ));
    const result = await createS3Bucket(
      s3Client,
      'database-ce551000-public-d12a972ce5d3',
      { provider: 'minio' }
    );
    if (!result.success) {
      throw new Error('Failed to create test S3 bucket "database-ce551000-public-d12a972ce5d3"');
    }
  });

  afterAll(async () => {
    if (teardown) await teardown();
    s3Client.destroy();
  });

  describe('mutation generation', () => {
    it('emits an upload surface for the prefixed AND the unprefixed plane', async () => {
      const res = await post(tessDatabaseId, [aliceSchema, tessSchema], {
        query: INTROSPECT_MUTATIONS
      });
      const names: string[] = expectSuccess(res).__type.fields.map((f: { name: string }) => f.name);

      // app scope: `app_files` -> AppFile
      expect(names).toContain('uploadAppFile');
      expect(names).toContain('uploadAppFiles');
      // database scope: `files` -> File. Naming carries no meaning; the tags do.
      expect(names).toContain('uploadFile');
      expect(names).toContain('uploadFiles');
    });
  });

  describe('presigned upload against the database-scope plane', () => {
    const fileContent = 'tenant static site index';
    const contentType = 'text/plain';
    let contentHash: string;
    let uploadUrl: string;

    // RustFS uses path-style URLs: http://host:9000/<bucket>/<key>?...
    const bucketFromPresignedUrl = (url: string): string =>
      new URL(url).pathname.replace(/^\/+/, '').split('/')[0];

    beforeAll(async () => {
      contentHash = await hashContent(fileContent);
    });

    it('returns a presigned PUT URL via uploadFile', async () => {
      const res = await post(tessDatabaseId, [tessSchema], {
        query: UPLOAD_FILE,
        variables: {
          input: {
            bucketKey: 'public',
            contentHash,
            contentType,
            size: Buffer.byteLength(fileContent),
            filename: 'index.html'
          }
        }
      });

      const payload = expectSuccess(res).uploadFile;
      expect(payload.uploadUrl).toBeTruthy();
      // The tenant row names no endpoint: it inherits the platform row's, never an env default.
      expect(new URL(payload.uploadUrl).host).toBe('127.0.0.1:9000');
      expect(payload.fileId).toBeTruthy();
      expect(payload.key).toBe(contentHash);
      expect(payload.deduplicated).toBe(false);

      uploadUrl = payload.uploadUrl;
    });

    it('accepts the PUT, into a physical bucket recorded on the tenant row', async () => {
      const putRes = await putToPresignedUrl(uploadUrl, fileContent, contentType);
      expect(putRes.ok).toBe(true);

      const stored = await pg.query(
        `SELECT physical_name FROM "${tessSchema}".buckets WHERE key = 'public'`
      );
      const physicalName: string | null = stored.rows[0]?.physical_name ?? null;
      expect(physicalName).toBeTruthy();
      expect(physicalName).toBe('database-ce551000-public-d12a972ce5d3');
      expect(bucketFromPresignedUrl(uploadUrl)).toBe(physicalName);
    });

    it('records the file row against the tenant plane, not the app-scope one', async () => {
      const tess = await pg.query(
        `SELECT content_hash FROM "${tessSchema}".files WHERE content_hash = $1`,
        [contentHash]
      );
      expect(tess.rows).toHaveLength(1);

      const alice = await pg.query(
        `SELECT content_hash FROM "${aliceSchema}".app_files WHERE content_hash = $1`,
        [contentHash]
      );
      expect(alice.rows).toHaveLength(0);
    });

    it('serves the tenant its own buckets under the unprefixed plane', async () => {
      const res = await post(tessDatabaseId, [tessSchema], { query: BUCKETS });
      const keys = expectSuccess(res).buckets.nodes.map((n: { key: string }) => n.key);
      expect(keys.sort()).toEqual(['private', 'public']);
    });
  });

  describe('tenant isolation across the two planes', () => {
    it('does not expose the app-scope tenant’s buckets to the database-scope tenant', async () => {
      const res = await post(tessDatabaseId, [tessSchema], { query: BUCKETS });
      const nodes = expectSuccess(res).buckets.nodes as { id: string }[];
      const aliceBucketIds = (
        await pg.query(`SELECT id FROM "${aliceSchema}".app_buckets`)
      ).rows.map((r: { id: string }) => r.id);

      for (const node of nodes) {
        expect(aliceBucketIds).not.toContain(node.id);
      }
    });
  });
});
