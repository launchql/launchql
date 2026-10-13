/**
 * Integration Tests -- presigned URL uploads, tenant isolation, and RLS enforcement
 *
 * Exercises the file-centric upload pipeline:
 *   uploadAppFile mutation -> presigned PUT URL -> PUT to S3
 *
 * Uses real RustFS (available in CI as rustfs_cdn service) and reconciled
 * physical bucket fixtures.
 *
 * Three actors (single beforeAll, single server -- stays fast):
 *   Alice  -- baseline tenant, no RLS (wide-open schema)
 *   Bob    -- moderate security: RLS on files (public-bucket SELECT only) and
 *             buckets (public-only visible). No anonymous UPDATE/DELETE.
 *   Mallory -- strictest: RLS on files and buckets, anonymous can only SELECT.
 *             No INSERT/UPDATE/DELETE for anonymous at all.
 *
 * Test categories:
 *   1. Presigned URL uploads (Alice)
 *   2. Feature flag gating via database_settings / api_settings cascade
 *   3. Three-way tenant isolation (Alice, Bob, Mallory)
 *   4. Bucket enumeration attacks (RLS on app_buckets)
 *   5. File mutation attacks -- Supabase-style metadata tampering
 *   6. Bucket mutation attacks
 *   7. Cross-tenant header manipulation attacks
 *   8. RLS enforcement on Bob's schema (public vs private bucket files)
 *
 * Run tests:
 *   pnpm test -- --testPathPattern=upload.integration
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
const sql = (seedDir: string, file: string) =>
  path.join(localSeedRoot, seedDir, file);
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');

// =========================================================================
// Tenant constants
// =========================================================================

// Alice -- baseline tenant (no RLS)
const aliceDatabaseId = '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9';
const aliceSchemas = ['simple-storage-public'];

// Bob -- moderate RLS
const bobDatabaseId = 'a1a1a1a1-b2b2-4c3c-d4d4-e5e5e5e5e5e5';
const bobSchemas = ['bob-storage-public'];
const bobPublicBucketId = 'd2d2d2d2-0000-0000-0000-000000000001';
const bobPrivateBucketId = 'd2d2d2d2-0000-0000-0000-000000000002';
const bobSeededPublicFileId = 'd3d3d3d3-0000-0000-0000-000000000002';

// Mallory -- strictest RLS (anonymous: SELECT only, no mutations)
const malloryDatabaseId = 'fa11fa11-a2a2-4b3b-c4c4-d5d5d5d5d5d5';
const mallorySchemas = ['mallory-storage-public'];
const malloryPublicFileId = 'fa99fa99-0000-0000-0000-000000000001';
const malloryPublicBucketId = 'fa77fa77-0000-0000-0000-000000000001';

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
    sql('simple-seed-storage', 'test-data.sql')
  ])
];

// =========================================================================
// GraphQL operations
// =========================================================================

const UPLOAD_APP_FILE = `
  mutation UploadAppFile($input: UploadAppFileInput!) {
    uploadAppFile(input: $input) {
      uploadUrl
      fileId
      key
      deduplicated
      expiresAt
    }
  }
`;

const PROVISION_BUCKET = `
  mutation ProvisionBucket($input: ProvisionBucketInput!) {
    provisionBucket(input: $input) {
      bucketId
      bucketKey
      physicalName
      jobId
    }
  }
`;

const APP_FILES = `
  query AppFiles {
    appFiles {
      nodes {
        id
        key
        filename
        mimeType
        isPublic
        bucketId
      }
    }
  }
`;

const APP_BUCKETS = `
  query AppBuckets {
    appBuckets {
      nodes {
        id
        key
        type
        isPublic
      }
    }
  }
`;

const INTROSPECT_UPLOAD_MUTATION = `
  query IntrospectUpload {
    __type(name: "Mutation") {
      fields {
        name
      }
    }
  }
`;

const UPDATE_APP_FILE = `
  mutation UpdateAppFile($input: UpdateAppFileInput!) {
    updateAppFile(input: $input) {
      appFile {
        id
        bucketId
        isPublic
        filename
      }
    }
  }
`;

const DELETE_APP_FILE = `
  mutation DeleteAppFile($input: DeleteAppFileInput!) {
    deleteAppFile(input: $input) {
      appFile {
        id
      }
    }
  }
`;

const CREATE_APP_FILE = `
  mutation CreateAppFile($input: CreateAppFileInput!) {
    createAppFile(input: $input) {
      appFile {
        id
        bucketId
        filename
      }
    }
  }
`;

const CREATE_APP_BUCKET = `
  mutation CreateAppBucket($input: CreateAppBucketInput!) {
    createAppBucket(input: $input) {
      appBucket {
        id
        key
      }
    }
  }
`;

const UPDATE_APP_BUCKET = `
  mutation UpdateAppBucket($input: UpdateAppBucketInput!) {
    updateAppBucket(input: $input) {
      appBucket {
        id
        key
        isPublic
      }
    }
  }
`;

const DELETE_APP_BUCKET = `
  mutation DeleteAppBucket($input: DeleteAppBucketInput!) {
    deleteAppBucket(input: $input) {
      appBucket {
        id
      }
    }
  }
`;

// =========================================================================
// Helpers
// =========================================================================

/**
 * Assert that a mutation was denied specifically by RLS (not by some other error).
 *
 * PostgreSQL RLS denials surface in three ways through PostGraphile:
 *   1. An explicit PG error — message contains "permission denied",
 *      "new row violates row-level security", or "No values were".
 *   2. A masked internal error — in production mode PostGraphile masks
 *      PG errors with code INTERNAL_SERVER_ERROR (the raw message is
 *      only logged server-side).
 *   3. The mutation silently affects 0 rows and returns null or an
 *      object with all-null fields (RLS USING clause filtered the row).
 *
 * GraphQL validation errors (GRAPHQL_VALIDATION_FAILED) are explicitly
 * rejected so tests don't accidentally pass for the wrong reason.
 */
function expectRlsDenied(
  res: supertest.Response,
  mutationName: string
): void {
  if (res.body.errors?.length) {
    const err = res.body.errors[0];
    const msg: string = err.message;
    const code: string = err.extensions?.code ?? '';
    // Reject GraphQL validation errors — these indicate a bug in the test
    expect(code).not.toBe('GRAPHQL_VALIDATION_FAILED');
    expect(
      msg.includes('permission denied') ||
        msg.includes('new row violates row-level security') ||
        msg.includes('insufficient_privilege') ||
        msg.includes('No values were') ||
        code === 'INTERNAL_SERVER_ERROR'
    ).toBe(true);
    return;
  }
  if (res.body.data) {
    const result = res.body.data[mutationName];
    if (result === null) return;
    if (typeof result === 'object' && Object.values(result).every((v) => v === null)) return;
    throw new Error(
      `Expected RLS denial but mutation returned data: ${JSON.stringify(result)}`
    );
  }
  throw new Error(
    `Expected RLS denial but got status=${res.status}, body=${JSON.stringify(res.body)}`
  );
}

/** Assert 200 + no GraphQL errors, return the data payload. */
function expectSuccess(res: supertest.Response): Record<string, any> {
  expect(res.status).toBe(200);
  expect(res.body.errors).toBeUndefined();
  return res.body.data;
}

// =========================================================================
// Tests -- single beforeAll, single server instance, all scenarios
// =========================================================================

describe('Integration tests (uploads, tenant isolation, RLS)', () => {
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

  const ensureS3Buckets = async (bucketNames: string[]): Promise<void> => {
    for (const bucketName of bucketNames) {
      const result = await createS3Bucket(s3Client, bucketName, { provider: 'minio' });
      if (!result.success) {
        throw new Error(`Failed to create test S3 bucket "${bucketName}"`);
      }
    }
  };

  const postGraphQL = (payload: {
    query: string;
    variables?: Record<string, unknown>;
  }) => {
    return request
      .post('/graphql')
      .set('X-Database-Id', aliceDatabaseId)
      .set('X-Schemata', aliceSchemas.join(','))
      .send(payload);
  };

  const postGraphQLViaApi = (
    databaseId: string,
    apiName: string,
    payload: {
      query: string;
      variables?: Record<string, unknown>;
    }
  ) => {
    return request
      .post('/graphql')
      .set('X-Database-Id', databaseId)
      .set('X-Api-Name', apiName)
      .send(payload);
  };

  const postGraphQLViaSchemata = (
    databaseId: string,
    schemas: string[],
    payload: {
      query: string;
      variables?: Record<string, unknown>;
    }
  ) => {
    return request
      .post('/graphql')
      .set('X-Database-Id', databaseId)
      .set('X-Schemata', schemas.join(','))
      .send(payload);
  };

  // Single setup: one server, one pool, all three schemas registered
  beforeAll(async () => {
    ({ request, pg, teardown } = await getConnections(
      {
        schemas: [...aliceSchemas, ...bobSchemas, ...mallorySchemas],
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
    await ensureS3Buckets([
      'app-80a2eaaf-public-c7156cb19fe3',
      'app-80a2eaaf-private-cc079c527e7d',
      'app-a1a1a1a1-public-4db6afbff1a2',
      'app-a1a1a1a1-private-a83152dee184',
      'app-fa11fa11-public-c1aac75adc22',
      'app-fa11fa11-private-c8db3baa1b20'
    ]);
  });

  afterAll(async () => {
    if (teardown) await teardown();
    s3Client.destroy();
  });

  // ==========================================================================
  // 1. Presigned URL uploads (Alice, schemata-header mode)
  // ==========================================================================

  describe('Presigned URL uploads (Alice)', () => {
    describe('Public file upload', () => {
      const fileContent = 'Hello, public world!';
      const contentType = 'text/plain';
      let contentHash: string;
      let uploadUrl: string;

      beforeAll(async () => {
        contentHash = await hashContent(fileContent);
      });

      it('should return a presigned PUT URL via uploadAppFile', async () => {
        const res = await postGraphQL({
          query: UPLOAD_APP_FILE,
          variables: {
            input: {
              bucketKey: 'public',
              contentHash,
              contentType,
              size: Buffer.byteLength(fileContent),
              filename: 'hello-public.txt'
            }
          }
        });

        const data = expectSuccess(res);

        const payload = data.uploadAppFile;
        expect(payload.uploadUrl).toBeTruthy();
        expect(new URL(payload.uploadUrl).host).toBe('127.0.0.1:9000');
        expect(payload.fileId).toBeTruthy();
        expect(payload.key).toBe(contentHash);
        expect(payload.deduplicated).toBe(false);
        expect(payload.expiresAt).toBeTruthy();

        uploadUrl = payload.uploadUrl;
      });

      it('should accept a PUT to the presigned URL', async () => {
        const putRes = await putToPresignedUrl(uploadUrl, fileContent, contentType);
        expect(putRes.ok).toBe(true);
      });
    });

    describe('Private file upload', () => {
      const fileContent = 'Hello, private world!';
      const contentType = 'text/plain';
      let contentHash: string;
      let uploadUrl: string;

      beforeAll(async () => {
        contentHash = await hashContent(fileContent);
      });

      it('should return a presigned PUT URL via uploadAppFile', async () => {
        const res = await postGraphQL({
          query: UPLOAD_APP_FILE,
          variables: {
            input: {
              bucketKey: 'private',
              contentHash,
              contentType,
              size: Buffer.byteLength(fileContent),
              filename: 'hello-private.txt'
            }
          }
        });

        const data = expectSuccess(res);

        const payload = data.uploadAppFile;
        expect(payload.uploadUrl).toBeTruthy();
        expect(payload.fileId).toBeTruthy();
        expect(payload.key).toBe(contentHash);
        expect(payload.deduplicated).toBe(false);
        expect(payload.expiresAt).toBeTruthy();

        uploadUrl = payload.uploadUrl;
      });

      it('should accept a PUT to the presigned URL', async () => {
        const putRes = await putToPresignedUrl(uploadUrl, fileContent, contentType);
        expect(putRes.ok).toBe(true);
      });
    });

    describe('Deduplication', () => {
      it('should return deduplicated=true for an existing content hash', async () => {
        const fileContent = 'Hello, public world!';
        const contentHash = await hashContent(fileContent);

        const res = await postGraphQL({
          query: UPLOAD_APP_FILE,
          variables: {
            input: {
              bucketKey: 'public',
              contentHash,
              contentType: 'text/plain',
              size: Buffer.byteLength(fileContent),
              filename: 'hello-public-copy.txt'
            }
          }
        });

        const data = expectSuccess(res);

        const payload = data.uploadAppFile;
        expect(payload.deduplicated).toBe(true);
        expect(payload.uploadUrl).toBeNull();
        expect(payload.expiresAt).toBeNull();
        expect(payload.fileId).toBeTruthy();
      });
    });
  });

  // ==========================================================================
  // 1b. physical_name persistence (Alice)
  //
  // The reconciler records the exact physical S3 bucket name on the source
  // bucket row; every later read uses that stored coordinate instead of
  // recomputing it from a prefix convention.
  // ==========================================================================

  describe('recorded physical_name usage (Alice)', () => {
    const aliceBucketsTable = `"${aliceSchemas[0]}".app_buckets`;

    const physicalNameFor = async (key: string): Promise<string | null> => {
      const res = await pg.query(
        `SELECT physical_name FROM ${aliceBucketsTable} WHERE key = $1`,
        [key]
      );
      return res.rows[0]?.physical_name ?? null;
    };

    // RustFS uses path-style URLs: http://host:9000/<bucket>/<key>?...
    const bucketFromPresignedUrl = (url: string): string =>
      new URL(url).pathname.replace(/^\/+/, '').split('/')[0];

    it('uses the reconciler-recorded physical_name for the presigned URL bucket', async () => {
      const fileContent = 'physical-name coordinate check';
      const contentHash = await hashContent(fileContent);

      const res = await postGraphQL({
        query: UPLOAD_APP_FILE,
        variables: {
          input: {
            bucketKey: 'public',
            contentHash,
            contentType: 'text/plain',
            size: Buffer.byteLength(fileContent),
            filename: 'physical-name-check.txt'
          }
        }
      });
      const payload = expectSuccess(res).uploadAppFile;
      expect(payload.uploadUrl).toBeTruthy();

      const stored = await physicalNameFor('public');
      expect(stored).toBeTruthy();
      expect(stored).toBe('app-80a2eaaf-public-c7156cb19fe3');
      expect(stored).toContain('public');
      expect(stored!.length).toBeLessThanOrEqual(63);
      // ...and is exactly the bucket the presigned PUT targets.
      expect(bucketFromPresignedUrl(payload.uploadUrl)).toBe(stored);
    });

    it('does not clobber physical_name on subsequent uploads', async () => {
      const before = await physicalNameFor('public');
      expect(before).toBeTruthy();

      const fileContent = 'second upload, same bucket';
      const contentHash = await hashContent(fileContent);
      const res = await postGraphQL({
        query: UPLOAD_APP_FILE,
        variables: {
          input: {
            bucketKey: 'public',
            contentHash,
            contentType: 'text/plain',
            size: Buffer.byteLength(fileContent),
            filename: 'second-upload.txt'
          }
        }
      });
      expectSuccess(res);

      expect(await physicalNameFor('public')).toBe(before);
    });

    it('honors a preexisting custom physical_name verbatim (resolver never consulted)', async () => {
      const customPhysical = 'preexisting-custom-cdn-bucket';
      await ensureS3Buckets([customPhysical]);
      await pg.query(
        `INSERT INTO ${aliceBucketsTable} (key, type, is_public, physical_name)
         VALUES ($1, 'public', true, $2)`,
        ['custom-cdn', customPhysical]
      );

      const fileContent = 'custom physical bucket check';
      const contentHash = await hashContent(fileContent);
      const res = await postGraphQL({
        query: UPLOAD_APP_FILE,
        variables: {
          input: {
            bucketKey: 'custom-cdn',
            contentHash,
            contentType: 'text/plain',
            size: Buffer.byteLength(fileContent),
            filename: 'custom-cdn.txt'
          }
        }
      });
      const payload = expectSuccess(res).uploadAppFile;

      // The presigned URL targets the stored custom bucket, not a resolver-minted name.
      expect(bucketFromPresignedUrl(payload.uploadUrl)).toBe(customPhysical);
      // ...and the stored coordinate is left untouched.
      expect(await physicalNameFor('custom-cdn')).toBe(customPhysical);
    });
  });

  // ==========================================================================
  // 1c. Reconciliation enqueue via the provisionBucket mutation (Alice)
  // ==========================================================================

  describe('Reconciliation enqueue via provisionBucket (Alice)', () => {
    const aliceBucketsTable = `"${aliceSchemas[0]}".app_buckets`;

    const physicalNameFor = async (key: string): Promise<string | null> => {
      const res = await pg.query(
        `SELECT physical_name FROM ${aliceBucketsTable} WHERE key = $1`,
        [key]
      );
      return res.rows[0]?.physical_name ?? null;
    };

    // Seed a fresh, never-provisioned bucket row (physical_name IS NULL).
    const seedBucket = async (key: string): Promise<void> => {
      await pg.query(
        `INSERT INTO ${aliceBucketsTable} (key, type, is_public) VALUES ($1, 'public', true)`,
        [key]
      );
    };

    it('enqueues reconciliation and leaves the physical name untouched', async () => {
      const key = 'reconcile-now';
      await seedBucket(key);

      const provRes = await postGraphQL({
        query: PROVISION_BUCKET,
        variables: { input: { bucketKey: key } }
      });
      const payload = expectSuccess(provRes).provisionBucket;
      expect(payload.bucketKey).toBe(key);
      expect(payload.bucketId).toBeTruthy();
      expect(payload.physicalName).toBeNull();
      expect(payload.jobId).toBeTruthy();
      expect(await physicalNameFor(key)).toBeNull();
    });

    it('can enqueue reconciliation repeatedly without changing the recorded name', async () => {
      const key = 'reconcile-idem';
      await seedBucket(key);

      const firstRes = await postGraphQL({
        query: PROVISION_BUCKET,
        variables: { input: { bucketKey: key } }
      });
      const firstPayload = expectSuccess(firstRes).provisionBucket;
      expect(firstPayload.physicalName).toBeNull();
      expect(firstPayload.jobId).toBeTruthy();

      const secondRes = await postGraphQL({
        query: PROVISION_BUCKET,
        variables: { input: { bucketKey: key } }
      });
      const secondPayload = expectSuccess(secondRes).provisionBucket;
      expect(secondPayload.physicalName).toBeNull();
      expect(secondPayload.jobId).toBeTruthy();
      expect(secondPayload.jobId).not.toBe(firstPayload.jobId);
      expect(await physicalNameFor(key)).toBeNull();
    });
  });

  // ==========================================================================
  // 1d. Uploads require reconciliation (Alice)
  // ==========================================================================

  describe('Auto-provision on bucket create is disabled (Alice)', () => {
    const aliceBucketsTable = `"${aliceSchemas[0]}".app_buckets`;

    const physicalNameFor = async (key: string): Promise<string | null> => {
      const res = await pg.query(
        `SELECT physical_name FROM ${aliceBucketsTable} WHERE key = $1`,
        [key]
      );
      return res.rows[0]?.physical_name ?? null;
    };

    it('createAppBucket records an unreconciled row and uploads reject it', async () => {
      const key = 'no-eager';

      // Create the bucket ROW via the GraphQL mutation.
      const createRes = await postGraphQL({
        query: CREATE_APP_BUCKET,
        variables: {
          input: { appBucket: { key, type: 'public', isPublic: true } }
        }
      });
      const created = expectSuccess(createRes).createAppBucket.appBucket;
      expect(created.key).toBe(key);

      // The logical row remains unreconciled until the job runs.
      expect(await physicalNameFor(key)).toBeNull();

      // Uploads fail while reconciliation has not recorded a physical name.
      const uploadRes = await postGraphQL({
        query: UPLOAD_APP_FILE,
        variables: {
          input: {
            bucketKey: key,
            contentHash: await hashContent('no-eager-probe'),
            contentType: 'text/plain',
            size: 14,
            filename: 'no-eager.txt'
          }
        }
      });
      expect(uploadRes.body.errors?.[0]?.message).toContain('STORAGE_BUCKET_NOT_RECONCILED');
      expect(await physicalNameFor(key)).toBeNull();
    });
  });

  // ==========================================================================
  // 2. Feature flag gating via database_settings / api_settings
  // ==========================================================================

  describe('Feature flag gating via database_settings / api_settings', () => {
    it('Alice: uploadAppFile exposed (presigned uploads enabled)', async () => {
      const res = await postGraphQLViaApi(aliceDatabaseId, 'app', {
        query: INTROSPECT_UPLOAD_MUTATION
      });
      const data = expectSuccess(res);
      const names = (data.__type?.fields ?? []).map(
        (f: { name: string }) => f.name
      );
      expect(names).toContain('uploadAppFile');
    });

    it('Bob primary API: uploadAppFile exposed (enabled by default)', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: INTROSPECT_UPLOAD_MUTATION
      });
      const data = expectSuccess(res);
      const names = (data.__type?.fields ?? []).map(
        (f: { name: string }) => f.name
      );
      expect(names).toContain('uploadAppFile');
    });

    it('Bob restricted API: uploadAppFile NOT exposed (api_settings override)', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-restricted', {
        query: INTROSPECT_UPLOAD_MUTATION
      });
      const data = expectSuccess(res);
      const names = (data.__type?.fields ?? []).map(
        (f: { name: string }) => f.name
      );
      expect(names).not.toContain('uploadAppFile');
    });

    it('Mallory: uploadAppFile exposed (enabled by default)', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', {
        query: INTROSPECT_UPLOAD_MUTATION
      });
      const data = expectSuccess(res);
      const names = (data.__type?.fields ?? []).map(
        (f: { name: string }) => f.name
      );
      expect(names).toContain('uploadAppFile');
    });
  });

  // ==========================================================================
  // 3. Three-way tenant isolation
  // ==========================================================================

  describe('Three-way tenant isolation (Alice, Bob, Mallory)', () => {
    it('Bob uploads a file via his primary API', async () => {
      const fileContent = 'Bob secret data';
      const contentHash = await hashContent(fileContent);

      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: UPLOAD_APP_FILE,
        variables: {
          input: {
            bucketKey: 'public',
            contentHash,
            contentType: 'text/plain',
            size: Buffer.byteLength(fileContent),
            filename: 'bob-file.txt'
          }
        }
      });

      const data = expectSuccess(res);
      const payload = data.uploadAppFile;
      expect(payload.fileId).toBeTruthy();
      expect(payload.uploadUrl).toBeTruthy();

      const putRes = await putToPresignedUrl(payload.uploadUrl, fileContent, 'text/plain');
      expect(putRes.ok).toBe(true);
    });

    it('Bob sees his own files', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', { query: APP_FILES });
      const data = expectSuccess(res);
      const files = data.appFiles.nodes;
      expect(files.length).toBeGreaterThanOrEqual(1);
      expect(files.some((f: { filename: string }) => f.filename === 'bob-file.txt')).toBe(true);
    });

    it('Mallory sees her own pre-seeded files', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', { query: APP_FILES });
      const data = expectSuccess(res);
      const files: { filename: string }[] = data.appFiles.nodes;
      expect(files.some((f) => f.filename === 'mallory-public.txt')).toBe(true);
      expect(files.some((f) => f.filename === 'mallory-private.txt')).toBe(true);
    });

    it('Alice API does NOT leak Bob or Mallory files', async () => {
      const res = await postGraphQLViaApi(aliceDatabaseId, 'app', { query: APP_FILES });
      const data = expectSuccess(res);
      const names = data.appFiles.nodes.map((f: { filename: string }) => f.filename);
      expect(names).not.toContain('bob-file.txt');
      expect(names).not.toContain('mallory-public.txt');
      expect(names).not.toContain('mallory-private.txt');
    });

    it('Bob API does NOT leak Alice or Mallory files', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', { query: APP_FILES });
      const data = expectSuccess(res);
      const names = data.appFiles.nodes.map((f: { filename: string }) => f.filename);
      expect(names).not.toContain('hello-public.txt');
      expect(names).not.toContain('hello-private.txt');
      expect(names).not.toContain('mallory-public.txt');
      expect(names).not.toContain('mallory-private.txt');
    });

    it('Mallory API does NOT leak Alice or Bob files', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', { query: APP_FILES });
      const data = expectSuccess(res);
      const names = data.appFiles.nodes.map((f: { filename: string }) => f.filename);
      expect(names).not.toContain('hello-public.txt');
      expect(names).not.toContain('hello-private.txt');
      expect(names).not.toContain('bob-file.txt');
      expect(names).not.toContain('bob-seeded-public.txt');
    });
  });

  // ==========================================================================
  // 4. Bucket enumeration attacks (RLS on app_buckets)
  // ==========================================================================

  describe('Bucket enumeration attacks', () => {
    it('Alice sees all buckets (no RLS on her schema)', async () => {
      const res = await postGraphQLViaApi(aliceDatabaseId, 'app', { query: APP_BUCKETS });
      const data = expectSuccess(res);
      const keys = data.appBuckets.nodes.map((b: { key: string }) => b.key);
      expect(keys).toContain('public');
      expect(keys).toContain('private');
    });

    it('Bob anonymous only sees public buckets (RLS hides private)', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', { query: APP_BUCKETS });
      const data = expectSuccess(res);
      const buckets: { isPublic: boolean }[] = data.appBuckets.nodes;
      expect(buckets.length).toBeGreaterThanOrEqual(1);
      expect(buckets.every((b) => b.isPublic)).toBe(true);
    });

    it('Mallory anonymous sees all buckets (her RLS policy allows all SELECT)', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', { query: APP_BUCKETS });
      const data = expectSuccess(res);
      const keys = data.appBuckets.nodes.map((b: { key: string }) => b.key);
      expect(keys).toContain('public');
      expect(keys).toContain('private');
    });
  });

  // ==========================================================================
  // 5. File mutation attacks — metadata tampering
  // ==========================================================================

  describe('File mutation attacks', () => {
    it('Bob: anonymous cannot update file bucket_id (move between buckets)', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: UPDATE_APP_FILE,
        variables: {
          input: { id: bobSeededPublicFileId, appFilePatch: { bucketId: bobPrivateBucketId } }
        }
      });
      expectRlsDenied(res, 'updateAppFile');
    });

    it('Bob: anonymous cannot flip is_public flag on a file', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: UPDATE_APP_FILE,
        variables: {
          input: { id: bobSeededPublicFileId, appFilePatch: { isPublic: false } }
        }
      });
      expectRlsDenied(res, 'updateAppFile');
    });

    it('Bob: anonymous cannot delete a file', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: DELETE_APP_FILE,
        variables: { input: { id: bobSeededPublicFileId } }
      });
      expectRlsDenied(res, 'deleteAppFile');
    });

    it('Mallory: anonymous cannot create a file directly (bypassing presigned URL)', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', {
        query: CREATE_APP_FILE,
        variables: {
          input: {
            appFile: {
              bucketId: malloryPublicBucketId,
              key: 'injected-hash',
              contentHash: 'injected-hash',
              mimeType: 'text/plain',
              size: 100,
              filename: 'injected-file.txt'
            }
          }
        }
      });
      expectRlsDenied(res, 'createAppFile');
    });

    it('Mallory: anonymous cannot update a file', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', {
        query: UPDATE_APP_FILE,
        variables: {
          input: { id: malloryPublicFileId, appFilePatch: { filename: 'hacked.txt' } }
        }
      });
      expectRlsDenied(res, 'updateAppFile');
    });

    it('Mallory: anonymous cannot delete a file', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', {
        query: DELETE_APP_FILE,
        variables: { input: { id: malloryPublicFileId } }
      });
      expectRlsDenied(res, 'deleteAppFile');
    });

    it('Bob seeded public file still exists after all attack attempts', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', { query: APP_FILES });
      const data = expectSuccess(res);
      const ids = data.appFiles.nodes.map((f: { id: string }) => f.id);
      expect(ids).toContain(bobSeededPublicFileId);
    });
  });

  // ==========================================================================
  // 6. Bucket mutation attacks
  // ==========================================================================

  describe('Bucket mutation attacks', () => {
    it('Bob: anonymous cannot create a bucket', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: CREATE_APP_BUCKET,
        variables: {
          input: { appBucket: { key: 'evil-bucket', type: 'public', isPublic: true } }
        }
      });
      expectRlsDenied(res, 'createAppBucket');
    });

    it('Bob: anonymous cannot update a bucket (flip public to private)', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: UPDATE_APP_BUCKET,
        variables: {
          input: { id: bobPublicBucketId, appBucketPatch: { isPublic: false } }
        }
      });
      expectRlsDenied(res, 'updateAppBucket');
    });

    it('Bob: anonymous cannot delete a bucket', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', {
        query: DELETE_APP_BUCKET,
        variables: { input: { id: bobPublicBucketId } }
      });
      expectRlsDenied(res, 'deleteAppBucket');
    });

    it('Mallory: anonymous cannot create a bucket', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'mallory-app', {
        query: CREATE_APP_BUCKET,
        variables: {
          input: { appBucket: { key: 'evil-bucket', type: 'public', isPublic: true } }
        }
      });
      expectRlsDenied(res, 'createAppBucket');
    });
  });

  // ==========================================================================
  // 7. Cross-tenant header manipulation attacks
  // ==========================================================================

  describe('Cross-tenant header manipulation attacks', () => {
    it('404 when sending Bob database_id with Alice API name', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'app', { query: APP_FILES });
      expect(res.status).toBe(404);
    });

    it('404 when sending Alice database_id with Bob API name', async () => {
      const res = await postGraphQLViaApi(aliceDatabaseId, 'bob-app', { query: APP_FILES });
      expect(res.status).toBe(404);
    });

    it('404 when sending Mallory database_id with Alice API name', async () => {
      const res = await postGraphQLViaApi(malloryDatabaseId, 'app', { query: APP_FILES });
      expect(res.status).toBe(404);
    });

    it('404 when sending Alice database_id with Mallory API name', async () => {
      const res = await postGraphQLViaApi(aliceDatabaseId, 'mallory-app', { query: APP_FILES });
      expect(res.status).toBe(404);
    });

    it('404 when sending a nonexistent database_id', async () => {
      const res = await postGraphQLViaApi(
        'deadbeef-dead-4ead-beef-deadbeefbeef',
        'app',
        { query: APP_FILES }
      );
      expect(res.status).toBe(404);
    });

    it('X-Schemata with Bob schema + Alice database_id does NOT leak Alice data', async () => {
      const res = await postGraphQLViaSchemata(aliceDatabaseId, bobSchemas, { query: APP_FILES });
      if (res.status === 200 && res.body.data) {
        const names = (res.body.data.appFiles?.nodes ?? []).map(
          (f: { filename: string }) => f.filename
        );
        expect(names).not.toContain('hello-public.txt');
        expect(names).not.toContain('hello-private.txt');
      }
    });

    it('X-Schemata with Mallory schema + Bob database_id does NOT leak Bob data', async () => {
      const res = await postGraphQLViaSchemata(bobDatabaseId, mallorySchemas, { query: APP_FILES });
      if (res.status === 200 && res.body.data) {
        const names = (res.body.data.appFiles?.nodes ?? []).map(
          (f: { filename: string }) => f.filename
        );
        expect(names).not.toContain('bob-file.txt');
        expect(names).not.toContain('bob-seeded-public.txt');
        expect(names).not.toContain('bob-seeded-private.txt');
      }
    });
  });

  // ==========================================================================
  // 8. RLS enforcement on Bob's schema (public vs private bucket files)
  // ==========================================================================

  describe('RLS enforcement on Bob schema', () => {
    it('anonymous only sees public-bucket files', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', { query: APP_FILES });
      const data = expectSuccess(res);

      const files: { bucketId: string }[] = data.appFiles.nodes;
      const publicFiles = files.filter((f) => f.bucketId === bobPublicBucketId);
      const privateFiles = files.filter((f) => f.bucketId === bobPrivateBucketId);

      expect(publicFiles.length).toBeGreaterThanOrEqual(1);
      expect(privateFiles).toHaveLength(0);
    });

    it('pre-seeded private file is NOT visible to anonymous', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', { query: APP_FILES });
      const data = expectSuccess(res);
      const names = data.appFiles.nodes.map((f: { filename: string }) => f.filename);
      expect(names).not.toContain('bob-seeded-private.txt');
    });

    it('pre-seeded public file IS visible to anonymous', async () => {
      const res = await postGraphQLViaApi(bobDatabaseId, 'bob-app', { query: APP_FILES });
      const data = expectSuccess(res);
      const names = data.appFiles.nodes.map((f: { filename: string }) => f.filename);
      expect(names).toContain('bob-seeded-public.txt');
    });
  });
});
