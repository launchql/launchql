/**
 * Control-role Integration Tests (simple-seed-scoped + compute + auth-cookie fixtures)
 *
 * The server's login role is NOINHERIT and holds no privileges of its own:
 * every control-plane query (route resolution, API lookups, module loaders)
 * runs inside `BEGIN; SET LOCAL ROLE <api.controlRole>; … COMMIT`, and request
 * work runs under `SET LOCAL ROLE anonymous/authenticated`. These tests start
 * a second server that connects as exactly such a login and prove that
 *
 *   - the login, with no role switch, can read nothing on the control plane,
 *   - the server still resolves routes and serves GraphQL and /fn requests.
 *
 * Run tests:
 *   pnpm test -- --testPathPattern=control-role.integration
 */

import { getEnvOptions } from '@constructive-io/graphql-env';
import path from 'path';
import type { PgTestClient } from 'pgsql-test/test-client';
import supertest from 'supertest';

import { createTestServer, getConnections, seed } from '../src';
import type { ServerInfo } from '../src/types';

jest.setTimeout(60000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const shared = (...segments: string[]) =>
  path.join(sharedSeedRoot, ...segments);
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');
const schemas = ['simple-pets-public', 'simple-pets-pets-public'];
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
    shared('compute', 'setup.sql'),
    shared('app-schemas', 'simple-pets', 'schema.sql'),
    shared('scoped', 'test-data.sql'),
    shared('compute', 'test-data.sql'),
    shared('app-schemas', 'simple-pets', 'test-data.sql'),
    path.join(__dirname, '..', '__fixtures__', 'seed', 'auth-cookie', 'schema.sql')
  ])
];

const API_HOST = 'app.test.constructive.io';
const suffix = `${process.pid}_${Date.now().toString(36)}`;
const LOGIN = `control_test_login_${suffix}`;
const CONTROL = `control_test_control_${suffix}`;
const LOGIN_PASSWORD = 'control-test-login';

/**
 * The control role reaches every non-system schema of the test database —
 * the shape of a `<class>_control` role, not of the login that switches to it.
 */
const grantControlRole = `
DO $grant$
DECLARE s text;
BEGIN
  FOR s IN
    SELECT nspname FROM pg_namespace
    WHERE nspname NOT LIKE 'pg\\_%' AND nspname <> 'information_schema'
  LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', s, '${CONTROL}');
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO %I', s, '${CONTROL}');
    EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO %I', s, '${CONTROL}');
  END LOOP;
END
$grant$`;

let pg: PgTestClient;
let teardown: () => Promise<void>;
let strict: ServerInfo;
let request: supertest.Agent;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections(
    {
      schemas,
      authRole: 'anonymous',
      server: { useRouting: true, api: { isPublic: true, metaSchemas } }
    },
    seedAdapters
  ));

  await pg.query(
    `CREATE ROLE "${LOGIN}" LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '${LOGIN_PASSWORD}'`
  );
  await pg.query(
    `CREATE ROLE "${CONTROL}" NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS`
  );
  await pg.query(grantControlRole);
  await pg.query(`GRANT "${CONTROL}" TO "${LOGIN}" WITH INHERIT FALSE, SET TRUE`);
  await pg.query(`GRANT anonymous TO "${LOGIN}" WITH INHERIT FALSE, SET TRUE`);
  await pg.query(`GRANT authenticated TO "${LOGIN}" WITH INHERIT FALSE, SET TRUE`);

  strict = await createTestServer(
    getEnvOptions({
      pg: { ...pg.config, user: LOGIN, password: LOGIN_PASSWORD },
      api: {
        isPublic: true,
        metaSchemas,
        exposedSchemas: schemas,
        anonRole: 'anonymous',
        roleName: 'anonymous',
        controlRole: CONTROL
      }
    })
  );
  request = supertest.agent(strict.httpServer);
});

afterAll(async () => {
  await strict?.stop();
  await pg.query(`DROP OWNED BY "${LOGIN}", "${CONTROL}"`);
  await pg.query(`DROP ROLE IF EXISTS "${LOGIN}"`);
  await pg.query(`DROP ROLE IF EXISTS "${CONTROL}"`);
  await teardown();
});

/** Run `sql` as the bare login: no role switch, the way a leaked connection would. */
const asBareLogin = async (sql: string) => {
  await pg.query('BEGIN');
  try {
    await pg.query(`SET LOCAL ROLE "${LOGIN}"`);
    return await pg.query(sql);
  } finally {
    await pg.query('ROLLBACK');
  }
};

describe('a bare login connection reads nothing', () => {
  it.each([
    ['routing_public.domains', 'SELECT * FROM routing_public.domains'],
    ['metaschema_public.database', 'SELECT * FROM metaschema_public.database'],
    ['resolve_route()', `SELECT * FROM routing_public.resolve_route('${API_HOST}', '/', NULL)`]
  ])('is denied %s', async (_name, sql) => {
    await expect(asBareLogin(sql)).rejects.toMatchObject({ code: '42501' });
  });

  it('holds no privilege through its memberships', async () => {
    const res = await pg.query(
      `SELECT pg_has_role($1, $2, 'USAGE') AS inherits_control,
              pg_has_role($1, 'anonymous', 'USAGE') AS inherits_anonymous,
              has_table_privilege($1, 'routing_public.domains', 'SELECT') AS reads_domains`,
      [LOGIN, CONTROL]
    );
    expect(res.rows[0]).toEqual({
      inherits_control: false,
      inherits_anonymous: false,
      reads_domains: false
    });
  });
});

describe('the server still serves requests as that login', () => {
  it('resolves the route and serves GraphQL', async () => {
    const res = await request
      .post('/graphql')
      .set('Host', API_HOST)
      .send({ query: '{ animals { nodes { name species } } }' });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.animals.nodes.length).toBeGreaterThan(0);
  });

  it('authenticates a Bearer token and serves the request as authenticated', async () => {
    const res = await request
      .post('/graphql')
      .set('Host', API_HOST)
      .set('Authorization', 'Bearer session-token')
      .send({ query: '{ animals { nodes { name } } }' });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.animals.nodes.length).toBeGreaterThan(0);
  });

  it('rejects an unknown Bearer token as UNAUTHENTICATED, not as a failure', async () => {
    const res = await request
      .post('/graphql')
      .set('Host', API_HOST)
      .set('Authorization', 'Bearer not-a-token')
      .send({ query: '{ animals { nodes { name } } }' });

    expect(res.body.errors?.[0]?.extensions?.code ?? res.body.error?.code).toBe('UNAUTHENTICATED');
  });

  it('serves the /fn REST route (module loaders + request role)', async () => {
    const create = await request
      .post('/fn/resize')
      .set('Host', API_HOST)
      .send({ width: 1 });
    expect(create.status).toBe(202);

    const read = await request
      .get(`/fn/invocations/${create.body.invocationId}`)
      .set('Host', API_HOST);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(create.body.invocationId);
  });
});
