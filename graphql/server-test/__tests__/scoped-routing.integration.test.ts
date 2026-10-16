/**
 * Scoped Routing Integration Tests (simple-seed-scoped)
 *
 * Exercises the new schema-only pgpm modules
 *   @constructive-db/catalog → catalog_private
 *   @constructive-db/routing → routing_public
 *   @constructive-db/apps    → apps_public
 * seeded from `__fixtures__/seed/scoped/*` for the same "simple-pets" tenant
 * that the retired legacy fixture used to model.
 *
 * Run tests:
 *   pnpm test -- --testPathPattern=scoped-routing.integration
 */

import path from 'path';
import type { PgTestClient } from 'pgsql-test/test-client';
import type supertest from 'supertest';

import { getConnections, seed } from '../src';

jest.setTimeout(60000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const shared = (...segments: string[]) =>
  path.join(sharedSeedRoot, ...segments);
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');
const schemas = ['simple-pets-public', 'simple-pets-pets-public'];
const scopedDatabaseId = '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9';
const appApiId = '6c9997a4-591b-4cb3-9313-4ef45d6f134e';
const privateApiId = 'e257c53d-6ba6-40de-b679-61b37188a316';
const scopedMetaSchemas = [
  'catalog_private',
  'routing_public',
  'apps_public',
  'metaschema_public',
  'metaschema_modules_public'
];

/** Row shape returned by routing_public.resolve_route(). */
interface ResolvedRouteRow {
  route_binding_id: string | null;
  hostname: string | null;
  matched_wildcard: boolean | null;
  matched_path: string | null;
  target_module: string | null;
  target_source_id: string | null;
  target_owner_scope: string | null;
  target_owner_key: string | null;
  resolved_config: Record<string, unknown> | null;
  verification_status: string | null;
  tls_status: string | null;
}

const scopedSeedAdapters = () => [
  seed.pgpm(pgpmWorkspace),
  seed.sqlfile([
    shared('app-schemas', 'simple-pets', 'schema.sql'),
    shared('scoped', 'test-data.sql'),
    shared('app-schemas', 'simple-pets', 'test-data.sql')
  ])
];

describe('simple-seed-scoped: resolve_route (SQL level)', () => {
  let pg: PgTestClient;
  let teardown: () => Promise<void>;

  const resolveRoute = (host: string) =>
    pg.oneOrNone<ResolvedRouteRow>(
      `SELECT * FROM routing_public.resolve_route($1, '/', NULL)`,
      [host]
    );

  beforeAll(async () => {
    ({ pg, teardown } = await getConnections(
      {
        schemas,
        authRole: 'anonymous',
        server: { useRouting: false, api: { isPublic: false } }
      },
      scopedSeedAdapters()
    ));
  });

  afterAll(async () => {
    await teardown();
  });

  it('deploys the scoped catalog/routing/apps schemas', async () => {
    const rows = await pg.any<{ nspname: string }>(
      `SELECT nspname FROM pg_namespace
       WHERE nspname IN ('apps_public', 'catalog_private', 'routing_public', 'routing_private')
       ORDER BY nspname`
    );
    expect(rows.map((r) => r.nspname)).toEqual([
      'apps_public',
      'catalog_private',
      'routing_private',
      'routing_public'
    ]);
  });

  it('resolves the public app host to the app api surface', async () => {
    const route = await resolveRoute('app.test.constructive.io');

    expect(route).not.toBeNull();
    expect(route!.route_binding_id).not.toBeNull();
    expect(route!.hostname).toBe('app.test.constructive.io');
    expect(route!.matched_wildcard).toBe(false);
    expect(route!.matched_path).toBe('/');
    expect(route!.target_module).toBe('api');
    expect(route!.target_source_id).toBe(appApiId);
    expect(route!.target_owner_scope).toBe('database');
    expect(route!.target_owner_key).toBe(scopedDatabaseId);
    expect(route!.verification_status).toBe('verified');
    expect(route!.tls_status).toBe('ready');
    expect(route!.resolved_config).toMatchObject({
      name: 'app',
      api_id: appApiId,
      database_id: scopedDatabaseId,
      is_public: true,
      role_name: 'authenticated',
      anon_role: 'anonymous',
      schemas
    });
    // The server needs dbname + schemas to build an ApiStructure.
    expect(typeof route!.resolved_config!.dbname).toBe('string');
  });

  it('resolves the private host to the private api surface', async () => {
    const route = await resolveRoute('private.test.constructive.io');

    expect(route).not.toBeNull();
    expect(route!.target_source_id).toBe(privateApiId);
    expect(route!.resolved_config).toMatchObject({
      name: 'private',
      is_public: false,
      role_name: 'authenticated',
      anon_role: 'anonymous',
      schemas: [
        'simple-pets-public',
        'simple-pets-private',
        'simple-pets-pets-public'
      ]
    });
  });

  it('returns a null binding for an unknown host', async () => {
    const route = await resolveRoute('nope.test.constructive.io');
    expect(route!.route_binding_id).toBeNull();
  });

  it('ignores port suffixes on the request host', async () => {
    const route = await resolveRoute('app.test.constructive.io:5678');
    expect(route!.target_source_id).toBe(appApiId);
  });
});

/**
 * End-to-end scoped plane: the request is resolved solely by
 * routing_public.resolve_route(). There is
 * no legacy fallback, so a successful request proves the scoped path.
 */
describe('simple-seed-scoped: GraphQL over scoped routing (e2e)', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  const postGraphQL = (payload: { query: string }) =>
    request
      .post('/graphql')
      .set('Host', 'app.test.constructive.io')
      .send(payload);

  beforeAll(async () => {
    ({ request, teardown } = await getConnections(
      {
        schemas,
        authRole: 'anonymous',
        server: {
          useRouting: true,
          api: {
            isPublic: true,
            metaSchemas: scopedMetaSchemas
          }
        }
      },
      scopedSeedAdapters()
    ));
  });

  afterAll(async () => {
    await teardown();
  });

  it('resolves the host through the scoped plane and mutates', async () => {
    const createRes = await postGraphQL({
      query: `mutation {
        createAnimal(input: { animal: { name: "ScopedHamster", species: "Hamster" } }) {
          animal { id name species }
        }
      }`
    });

    expect(createRes.status).toBe(200);
    expect(createRes.body.data.createAnimal.animal.name).toBe('ScopedHamster');
  });

  it('should query all animals', async () => {
    const res = await postGraphQL({
      query: '{ animals { nodes { name species } } }'
    });

    expect(res.status).toBe(200);
    // The 5 seeded animals must resolve through the scoped plane. (The
    // mutation test above adds ScopedHamster to the same database, so assert
    // the seeded set is present rather than an exact count.)
    const names = res.body.data.animals.nodes.map(
      (n: { name: string }) => n.name
    );
    expect(names).toEqual(
      expect.arrayContaining(['Buddy', 'Max', 'Whiskers', 'Mittens', 'Tweety'])
    );
  });
});
