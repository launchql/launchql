import { getEnvOptions } from '@constructive-io/graphql-env';
import { generateCreateUserSQL } from '@pgpmjs/core';
import { randomBytes } from 'crypto';
import path from 'path';
import { pgCache } from 'pg-cache';
import { getConnections } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import supertest from 'supertest';

import { createTestServer, seed } from '../src';
import type { ServerInfo } from '../src/types';

jest.setTimeout(60000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const shared = (...segments: string[]) => path.join(sharedSeedRoot, ...segments);
const API_HOST = 'app.test.constructive.io';
const LOGIN = `server_test_login_${randomBytes(8).toString('hex')}`;
const PASSWORD = randomBytes(24).toString('base64url');

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;
let server: ServerInfo;
let request: supertest.Agent;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections({}, [
    seed.pgpm(path.join(sharedSeedRoot, '..', '..')),
    seed.sqlfile([
      shared('compute', 'setup.sql'),
      shared('app-schemas', 'simple-pets', 'schema.sql'),
      shared('scoped', 'test-data.sql'),
      shared('compute', 'test-data.sql'),
      shared('app-schemas', 'simple-pets', 'test-data.sql'),
      path.join(__dirname, '..', '__fixtures__', 'seed', 'auth-cookie', 'schema.sql')
    ])
  ]));
  // The seed's pg-cache entry must not supply the server an admin connection.
  pgCache.delete(pg.config.database);
  await pgCache.waitForDisposals();

  const roles = { anonymous: 'anonymous', authenticated: 'authenticated' };
  await pg.query(generateCreateUserSQL(LOGIN, randomBytes(24).toString('hex'), roles));
  await pg.query(generateCreateUserSQL(LOGIN, PASSWORD, roles));
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
      exposedSchemas: ['simple-pets-public', 'simple-pets-pets-public'],
      anonRole: 'anonymous',
      roleName: 'anonymous'
    }
  }));
  request = supertest.agent(server.httpServer);
});

afterAll(async () => {
  await server?.stop();
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

it('uses one ordinary inheriting login with the pgpm request-role memberships', async () => {
  const { rows } = await pg.query(`
    SELECT rolsuper, rolbypassrls, rolinherit,
      pg_has_role(rolname, 'anonymous', 'USAGE') AS inherits_anonymous,
      pg_has_role(rolname, 'authenticated', 'USAGE') AS inherits_authenticated
    FROM pg_roles WHERE rolname = $1
  `, [LOGIN]);
  expect(rows[0]).toEqual({
    rolsuper: false, rolbypassrls: false, rolinherit: true,
    inherits_anonymous: true, inherits_authenticated: true
  });
});

it('resolves routes and serves GraphQL using the reconciled password', async () => {
  const res = await request.post('/graphql').set('Host', API_HOST)
    .send({ query: '{ animals { nodes { name species } } }' });
  expect(res.status).toBe(200);
  expect(res.body.errors).toBeUndefined();
  expect(res.body.data.animals.nodes.length).toBeGreaterThan(0);

  const { rows } = await pg.query(
    'SELECT count(*)::int AS n FROM pg_stat_activity WHERE usename = $1 AND datname = current_database()',
    [LOGIN]
  );
  expect(rows[0].n).toBeGreaterThan(0);
});

it('authenticates a Bearer token and serves the request as authenticated', async () => {
  const res = await request.post('/graphql').set('Host', API_HOST)
    .set('Authorization', 'Bearer session-token')
    .send({ query: '{ animals { nodes { name } } }' });
  expect(res.status).toBe(200);
  expect(res.body.errors).toBeUndefined();
  expect(res.body.data.animals.nodes.length).toBeGreaterThan(0);
});

it('rejects an unknown Bearer token as UNAUTHENTICATED', async () => {
  const res = await request.post('/graphql').set('Host', API_HOST)
    .set('Authorization', 'Bearer not-a-token')
    .send({ query: '{ animals { nodes { name } } }' });
  expect(res.body.errors?.[0]?.extensions?.code ?? res.body.error?.code).toBe('UNAUTHENTICATED');
});

it('serves the function REST route with request-role isolation', async () => {
  const create = await request.post('/fn/resize').set('Host', API_HOST).send({ width: 1 });
  expect(create.status).toBe(202);
  const read = await request.get(`/fn/invocations/${create.body.invocationId}`).set('Host', API_HOST);
  expect(read.status).toBe(200);
  expect(read.body.id).toBe(create.body.invocationId);
});
