/**
 * Integration tests — a tenant's storage API host, served as production serves
 * it: one non-superuser login with RLS bypass and only the pgpm request-role
 * memberships (`authenticated`, `anonymous`), never `administrator`.
 *
 * - uploadFile through the tenant's storage host returns an upload URL. Its
 *   server-owned storage-module reads run as the login itself; switching to a
 *   role the login is not a member of fails the mutation (planning#2258).
 * - A hostname on a tenant's own database-scope routing plane resolves, after
 *   the server's configured plane: each `route_module` plane in order, first
 *   match owns the host (planning#2259).
 * - A host resolves only to the database whose plane owns it: a later plane
 *   cannot claim an earlier plane's host, and a plane that routes into another
 *   database fails loud instead of serving it.
 *
 * Uses real RustFS (the `rustfs_cdn` service in CI, localhost:9000 locally).
 *
 *   pnpm test -- --testPathPattern=tenant-storage-host
 */

import { getEnvOptions } from '@constructive-io/graphql-env';
import { createS3Bucket, createS3Client } from '@constructive-io/s3-utils';
import { hashContent } from '@constructive-io/upload-client';
import { generateCreateUserSQL } from '@pgpmjs/core';
import { randomBytes } from 'crypto';
import path from 'path';
import { pgCache } from 'pg-cache';
import { getConnections } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import supertest from 'supertest';

import { createTestServer, seed } from '../src';
import type { ServerInfo } from '../src/types';

jest.setTimeout(120000);

const localSeedRoot = path.join(__dirname, '..', '__fixtures__', 'seed');
const sql = (seedDir: string, file: string) => path.join(localSeedRoot, seedDir, file);
const pgpmWorkspace = path.join(__dirname, '..', '..', '..');

const TESS_DATABASE_ID = 'ce551000-0000-4000-8000-000000000001';
const SHARED_PLANE_HOST = 'storage.tess.test.constructive.io';
const TENANT_PLANE_HOST = `storage-${TESS_DATABASE_ID}.test.constructive.io`;
const CROSS_DATABASE_HOST = 'storage.mallory.test.constructive.io';
const LOGIN = `server_test_login_${randomBytes(8).toString('hex')}`;
const PASSWORD = randomBytes(24).toString('base64url');

const UPLOAD_FILE = `
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      uploadUrl
      fileId
      key
    }
  }
`;

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;
let server: ServerInfo;
let request: supertest.Agent;

const s3Client = createS3Client({
  provider: 'minio',
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  accessKeyId: 'constructive',
  secretAccessKey: 'constructive-dev-secret'
});

const upload = async (host: string, content: string) =>
  request
    .post('/graphql')
    .set('Host', host)
    .send({
      query: UPLOAD_FILE,
      variables: {
        input: {
          bucketKey: 'public',
          contentHash: await hashContent(content),
          contentType: 'text/html',
          size: Buffer.byteLength(content),
          filename: 'index.html'
        }
      }
    });

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections({}, [
    seed.pgpm(pgpmWorkspace),
    seed.sqlfile([
      sql('db-scope-storage', 'schema.sql'),
      sql('db-scope-storage', 'test-data.sql'),
      sql('tenant-routing-planes', 'test-data.sql')
    ])
  ]));
  // The seed's pg-cache entry must not supply the server an admin connection.
  pgCache.delete(pg.config.database);
  await pgCache.waitForDisposals();

  const roles = { anonymous: 'anonymous', authenticated: 'authenticated' };
  await pg.query(generateCreateUserSQL(LOGIN, PASSWORD, roles, { bypassRls: true }));
  await pg.query(`
    GRANT CONNECT ON DATABASE "${pg.config.database}" TO "${LOGIN}";
    DO $grant$
    DECLARE s text;
    BEGIN
      FOR s IN
        SELECT nspname FROM pg_namespace
        WHERE nspname NOT LIKE 'pg\\_%' AND nspname <> 'information_schema'
      LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', s, '${LOGIN}');
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO %I', s, '${LOGIN}');
        EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO %I', s, '${LOGIN}');
      END LOOP;
    END
    $grant$;
  `);

  server = await createTestServer(getEnvOptions({
    pg: { ...pg.config, user: LOGIN, password: PASSWORD },
    api: {
      isPublic: true,
      metaSchemas: ['catalog_private', 'routing_public', 'apps_public', 'metaschema_public', 'metaschema_modules_public'],
      anonRole: 'anonymous',
      roleName: 'anonymous'
    }
  }));
  request = supertest.agent(server.httpServer);

  const bucket = await createS3Bucket(s3Client, 'database-ce551000-public-d12a972ce5d3', { provider: 'minio' });
  if (!bucket.success) {
    throw new Error('Failed to create test S3 bucket "database-ce551000-public-d12a972ce5d3"');
  }
});

afterAll(async () => {
  await server?.stop();
  s3Client.destroy();
  if (pg) {
    await pg.query(`DROP OWNED BY "${LOGIN}"; DROP ROLE "${LOGIN}"`);
  }
  await teardown?.();
});

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
  await pg.afterEach();
});

it('serves with a login that is not a member of administrator', async () => {
  const { rows } = await pg.query(
    `SELECT pg_has_role($1, 'administrator', 'MEMBER') AS member`,
    [LOGIN]
  );
  expect(rows[0].member).toBe(false);
});

it('returns an upload URL from uploadFile on the tenant storage host', async () => {
  const res = await upload(SHARED_PLANE_HOST, '<h1>shared plane</h1>');
  expect(res.body.errors).toBeUndefined();
  expect(res.status).toBe(200);
  const payload = res.body.data.uploadFile;
  expect(new URL(payload.uploadUrl).host).toBe('127.0.0.1:9000');
  expect(payload.fileId).toBeTruthy();
});

it('resolves a hostname on the tenant database-scope routing plane', async () => {
  const res = await upload(TENANT_PLANE_HOST, '<h1>tenant plane</h1>');
  expect(res.body.errors).toBeUndefined();
  expect(res.status).toBe(200);
  expect(res.body.data.uploadFile.uploadUrl).toBeTruthy();

  const { rows } = await pg.query(
    `SELECT count(*)::int AS n FROM "tess-storage-public".files WHERE content_hash = $1`,
    [await hashContent('<h1>tenant plane</h1>')]
  );
  expect(rows[0].n).toBe(1);
});

it('keeps a host on the first plane that owns it; a later tenant plane cannot claim it', async () => {
  // Mallory's plane also answers for SHARED_PLANE_HOST, naming its own database.
  // The shared plane owns the host, so Tess's API serves and Mallory's is never consulted.
  const res = await upload(SHARED_PLANE_HOST, '<h1>still tess</h1>');
  expect(res.body.errors).toBeUndefined();
  const { rows } = await pg.query(
    `SELECT count(*)::int AS n FROM "tess-storage-public".files WHERE content_hash = $1`,
    [await hashContent('<h1>still tess</h1>')]
  );
  expect(rows[0].n).toBe(1);
});

it('refuses a tenant plane route into another database', async () => {
  const res = await upload(CROSS_DATABASE_HOST, '<h1>cross tenant</h1>');
  expect(res.status).toBe(500);
  const { rows } = await pg.query(
    `SELECT count(*)::int AS n FROM "tess-storage-public".files WHERE content_hash = $1`,
    [await hashContent('<h1>cross tenant</h1>')]
  );
  expect(rows[0].n).toBe(0);
});

it('answers 404 for a hostname no plane owns', async () => {
  const res = await request.post('/graphql').set('Host', 'nobody.test.constructive.io').send({ query: '{ __typename }' });
  expect(res.status).toBe(404);
});
