import {
  corsLoader,
  databaseSettingsLoader,
  type LoaderContext,
  pubkeyLoader,
  requestProtectionLoader,
  rlsLoader,
  webauthnLoader
} from '@constructive-io/express-context';
import { getEnvOptions } from '@constructive-io/graphql-env';
import { generateCreateUserSQL } from '@pgpmjs/core';
import { randomBytes } from 'crypto';
import path from 'path';
import type { Pool } from 'pg';
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
  await pg.query(generateCreateUserSQL(LOGIN, PASSWORD, roles, { bypassRls: false }));
  await pg.query(`
    ALTER TABLE routing_public.domains ENABLE ROW LEVEL SECURITY;
    ALTER TABLE metaschema_public.database ENABLE ROW LEVEL SECURITY;
    -- Production layers member policies over these (routing-security); with
    -- RLS on and no policy, the login sees none of their rows either.
    ALTER TABLE routing_public.rls_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE routing_public.cors_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE routing_public.pubkey_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE routing_public.webauthn_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE routing_public.database_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE routing_public.api_settings ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA routing_public, metaschema_public TO authenticated, anonymous;
    GRANT SELECT ON routing_public.domains, metaschema_public.database TO authenticated, anonymous;
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

it('uses one non-superuser inheriting login without RLS bypass and the pgpm request-role memberships', async () => {
  const { rows } = await pg.query(`
    SELECT rolsuper, rolbypassrls, rolinherit, rolcreatedb, rolcreaterole,
      pg_has_role(rolname, 'anonymous', 'USAGE') AS inherits_anonymous,
      pg_has_role(rolname, 'authenticated', 'USAGE') AS inherits_authenticated
    FROM pg_roles WHERE rolname = $1
  `, [LOGIN]);
  expect(rows[0]).toEqual({
    rolsuper: false, rolbypassrls: false, rolinherit: true,
    rolcreatedb: false, rolcreaterole: false,
    inherits_anonymous: true, inherits_authenticated: true
  });
});

it('sees no member-RLS rows as the login, and reads standing through the login-only reader', async () => {
  const { rows: [database] } = await pg.query(
    `SELECT d.id FROM metaschema_public.database d
     JOIN routing_public.domains dom ON dom.database_id = d.id LIMIT 1`
  );
  await pg.query(`SET LOCAL ROLE "${LOGIN}"`);
  const visible = await pg.query(`SELECT
    (SELECT count(*)::int FROM routing_public.domains) AS domains,
    (SELECT count(*)::int FROM metaschema_public.database) AS databases`);
  expect(visible.rows[0]).toEqual({ domains: 0, databases: 0 });
  const standing = await pg.query(
    'SELECT suspended_at FROM function_resolution.database_standing($1)',
    [database.id]
  );
  expect(standing.rows).toEqual([{ suspended_at: null }]);
});

/** Settings rows for a routed database, then the rest of the transaction runs as the login. */
const routingSettingsAsLogin = async (): Promise<LoaderContext> => {
  const { rows: [target] } = await pg.query(`
    SELECT a.database_id, a.id AS api_id
    FROM routing_public.apis a
    WHERE a.database_id = (SELECT database_id FROM routing_public.domains LIMIT 1)
    LIMIT 1`);
  const { rows: [schema] } = await pg.query(
    'SELECT id FROM metaschema_public.schema WHERE database_id = $1 LIMIT 1',
    [target.database_id]
  );
  const { rows: [fn] } = await pg.query(
    `INSERT INTO metaschema_public.function (database_id, schema_id, name)
     VALUES ($1, $2, 'sign_up_with_key') RETURNING id`,
    [target.database_id, schema.id]
  );
  await pg.query(`
    DELETE FROM routing_public.cors_settings WHERE database_id = $1;
    DELETE FROM routing_public.pubkey_settings WHERE database_id = $1;
    DELETE FROM routing_public.webauthn_settings WHERE database_id = $1;
    DELETE FROM routing_public.api_settings WHERE database_id = $1;
    DELETE FROM routing_public.database_settings WHERE database_id = $1;
  `.replace(/\$1/g, `'${target.database_id}'`));
  await pg.query(
    `INSERT INTO routing_public.cors_settings (database_id, api_id, allowed_origins)
     VALUES ($1, NULL, ARRAY['https://default.test']), ($1, $2, ARRAY['https://api.test'])`,
    [target.database_id, target.api_id]
  );
  await pg.query(
    `INSERT INTO routing_public.pubkey_settings (database_id, schema_id, crypto_network, sign_up_with_key_function_id)
     VALUES ($1, $2, 'cosmos', $3)`,
    [target.database_id, schema.id, fn.id]
  );
  await pg.query(
    `INSERT INTO routing_public.webauthn_settings
       (database_id, schema_id, rp_id, rp_name, origin_allowlist, require_user_verification, challenge_expiry_seconds)
     VALUES ($1, $2, 'tenant.test', 'Tenant', ARRAY['https://tenant.test'], true, 300)`,
    [target.database_id, schema.id]
  );
  await pg.query(
    `INSERT INTO routing_public.database_settings (database_id, enable_search, statement_timeout_ms)
     VALUES ($1, true, 30000)`,
    [target.database_id]
  );
  await pg.query(
    `INSERT INTO routing_public.api_settings (database_id, api_id, enable_search)
     VALUES ($1, $2, false)`,
    [target.database_id, target.api_id]
  );

  // The loaders run their own SQL on this transaction, as the login.
  await pg.query(`SET LOCAL ROLE "${LOGIN}"`);
  const routingPool = { query: (text: string, values?: unknown[]) => pg.query(text, values) } as unknown as Pool;
  const ctx: LoaderContext = {
    routingPool,
    tenantPool: routingPool,
    databaseId: target.database_id,
    apiId: target.api_id,
    dbname: pg.config.database
  };
  for (const loader of ROUTING_LOADERS) loader.invalidate();
  return ctx;
};


const ROUTING_LOADERS = [rlsLoader, corsLoader, pubkeyLoader, webauthnLoader, databaseSettingsLoader, requestProtectionLoader];

it.each([
  ['rls', async (ctx: LoaderContext) => expect(await rlsLoader.resolve(ctx)).toBeDefined()],
  ['cors', async (ctx: LoaderContext) => expect(await corsLoader.resolve(ctx)).toEqual(['https://api.test'])],
  ['pubkey', async (ctx: LoaderContext) => expect(await pubkeyLoader.resolve(ctx)).toMatchObject({ cryptoNetwork: 'cosmos' })],
  ['webauthn', async (ctx: LoaderContext) => expect(await webauthnLoader.resolve(ctx)).toMatchObject({ rpId: 'tenant.test' })],
  ['database-settings', async (ctx: LoaderContext) =>
    expect(await databaseSettingsLoader.resolve(ctx)).toMatchObject({ enableSearch: false })],
  ['request-protection', async (ctx: LoaderContext) =>
    expect((await requestProtectionLoader.resolve(ctx))?.statementTimeoutMs).toBe(30_000)]
])('resolves the %s loader as the login instead of falling back to the defaults RLS hides', async (_name, check) => {
  await check(await routingSettingsAsLogin());
  for (const loader of ROUTING_LOADERS) loader.invalidate();
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
