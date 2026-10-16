/**
 * Server Integration Tests using graphql-server-test
 *
 * All host routing resolves through the scoped routing plane
 * (routing_public.resolve_route); there is no legacy fallback.
 * The single-tenant scenario runs against the dev server
 * (server.useRouting: false), which exposes the configured schemas
 * directly with no route resolution.
 *
 * Run tests:
 *   pnpm test -- --testPathPattern=server.integration
 */

import path from 'path';
import type supertest from 'supertest';

import { getConnections, seed } from '../src';
import type { ServerInfo } from '../src/types';

jest.setTimeout(60000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const shared = (...segments: string[]) =>
  path.join(sharedSeedRoot, ...segments);
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');
const schemas = ['simple-pets-public', 'simple-pets-pets-public'];
const scopedDatabaseId = '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9';
const scopedMetaSchemas = [
  'catalog_private',
  'routing_public',
  'apps_public',
  'metaschema_public',
  'metaschema_modules_public'
];
// Collision-free metadata plane for the X-Meta-Schema admin surface: the
// catalog and routing planes both define `apis`/`domains`/`sites`, so they
// cannot be exposed together in one PostGraphile schema. Expose the
// authoritative routing plane plus the metaschema tables.
const metaApiSchemas = [
  'routing_public',
  'metaschema_public',
  'metaschema_modules_public'
];
const teardowns: Array<() => Promise<void>> = [];

type Scenario = {
  name: string;
  seedDir: 'simple-seed' | 'simple-seed-scoped';
  useRouting: boolean;
  api: {
    isPublic: boolean;
    metaSchemas?: string[];
  };
  headers?: Record<string, string>;
};

const scenarios: Scenario[] = [
  {
    name: 'static single-tenant (dev server)',
    seedDir: 'simple-seed',
    useRouting: false,
    api: { isPublic: false }
  },
  {
    name: 'scoped public via domain',
    seedDir: 'simple-seed-scoped',
    useRouting: true,
    api: { isPublic: true, metaSchemas: scopedMetaSchemas },
    headers: {
      Host: 'app.test.constructive.io'
    }
  },
  {
    name: 'scoped private via domain',
    seedDir: 'simple-seed-scoped',
    useRouting: true,
    api: { isPublic: false, metaSchemas: scopedMetaSchemas },
    headers: {
      Host: 'private.test.constructive.io'
    }
  },
  {
    name: 'scoped private via X-Api-Name',
    seedDir: 'simple-seed-scoped',
    useRouting: true,
    api: { isPublic: false, metaSchemas: scopedMetaSchemas },
    headers: {
      'X-Database-Id': scopedDatabaseId,
      'X-Api-Name': 'private'
    }
  },
  {
    name: 'scoped private via X-Schemata',
    seedDir: 'simple-seed-scoped',
    useRouting: true,
    api: { isPublic: false, metaSchemas: scopedMetaSchemas },
    headers: {
      'X-Database-Id': scopedDatabaseId,
      'X-Schemata': schemas.join(',')
    }
  }
];

const seedAdaptersFor = (seedDir: Scenario['seedDir']) => {
  if (seedDir === 'simple-seed-scoped') {
    // Real metaschema + scoped catalog/routing/apps DDL and the published
    // resolve_route() / binding-sync trigger module (installed via
    // `pnpm fixtures:install`), then app schema + data.
    return [
      seed.pgpm(pgpmWorkspace),
      seed.sqlfile([
        shared('app-schemas', 'simple-pets', 'schema.sql'),
        shared('scoped', 'test-data.sql'),
        shared('app-schemas', 'simple-pets', 'test-data.sql')
      ])
    ];
  }
  // simple-seed: base setup + shared app-schemas (no routing plane)
  return [
    seed.sqlfile([
      shared('base', 'setup.sql'),
      shared('app-schemas', 'simple-pets', 'schema.sql'),
      shared('app-schemas', 'simple-pets', 'test-data.sql')
    ])
  ];
};

const buildSeedAdapters = (scenario: Scenario) => seedAdaptersFor(scenario.seedDir);

describe.each(scenarios)('$name', (scenario) => {
  let server: ServerInfo;
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  const postGraphQL = (payload: { query: string; variables?: Record<string, unknown> }) => {
    let req = request.post('/graphql');
    if (scenario.headers) {
      for (const [header, value] of Object.entries(scenario.headers)) {
        req = req.set(header, value);
      }
    }
    return req.send(payload);
  };

  beforeAll(async () => {
    ({ server, request, teardown } = await getConnections(
      {
        schemas,
        authRole: 'anonymous',
        server: {
          useRouting: scenario.useRouting,
          api: scenario.api
        }
      },
      buildSeedAdapters(scenario)
    ));
    teardowns.push(teardown);
  });

  describe('Query Tests', () => {
    it('should query all animals', async () => {
      const res = await postGraphQL({
        query: '{ animals { nodes { name species } } }'
      });

      expect(res.status).toBe(200);
      expect(res.body.data.animals.nodes).toHaveLength(5);
    });

    it('should query animals with filter', async () => {
      const res = await postGraphQL({
        query: `{ animals { nodes { name species } } }`
      });

      expect(res.status).toBe(200);
      const dogs = res.body.data.animals.nodes.filter(
        (n: { species: string }) => n.species === 'Dog'
      );
      expect(dogs).toHaveLength(2);
    });

    it('should query with variables', async () => {
      const res = await postGraphQL({
        query: `query GetAnimals($first: Int!) {
          animals(first: $first) { nodes { name species } }
        }`,
        variables: { first: 3 }
      });

      expect(res.status).toBe(200);
      expect(res.body.data.animals.nodes).toHaveLength(3);
    });
  });

  describe('Mutation Tests', () => {
    it('should create and delete an animal', async () => {
      const createRes = await postGraphQL({
        query: `mutation($input: CreateAnimalInput!) {
          createAnimal(input: $input) { animal { id name species } }
        }`,
        variables: { input: { animal: { name: 'TestHamster', species: 'Hamster' } } }
      });

      expect(createRes.status).toBe(200);
      expect(createRes.body.data.createAnimal.animal.name).toBe('TestHamster');

      const deleteRes = await postGraphQL({
        query: `mutation($input: DeleteAnimalInput!) {
          deleteAnimal(input: $input) { animal { id } }
        }`,
        variables: { input: { id: createRes.body.data.createAnimal.animal.id } }
      });

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.deleteAnimal.animal.id).toBeDefined();
    });

    it('should create and update an animal', async () => {
      const createRes = await postGraphQL({
        query: `mutation($input: CreateAnimalInput!) {
          createAnimal(input: $input) { animal { id name } }
        }`,
        variables: { input: { animal: { name: 'UpdateMe', species: 'Cat' } } }
      });

      expect(createRes.status).toBe(200);
      const animal = createRes.body.data.createAnimal.animal;

      const updateRes = await postGraphQL({
        query: `mutation($input: UpdateAnimalInput!) {
          updateAnimal(input: $input) { animal { id name } }
        }`,
        variables: { input: { id: animal.id, animalPatch: { name: 'Updated' } } }
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.updateAnimal.animal.name).toBe('Updated');

      await postGraphQL({
        query: `mutation($input: DeleteAnimalInput!) {
          deleteAnimal(input: $input) { animal { id } }
        }`,
        variables: { input: { id: animal.id } }
      });
    });
  });
});

/**
 * X-Meta-Schema test
 *
 * scoped routing, isPublic: false
 * Headers: X-Database-Id + X-Meta-Schema: true
 * Queries target meta-schema tables (databases, schemas, tables, apis).
 */
describe('scoped private via X-Meta-Schema', () => {
  let server: ServerInfo;
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  const postGraphQL = (
    payload: { query: string; variables?: Record<string, unknown> },
    extraHeaders?: Record<string, string>
  ) => {
    let req = request.post('/graphql');
    const headers: Record<string, string> = {
      'X-Database-Id': scopedDatabaseId,
      'X-Meta-Schema': 'true',
      ...extraHeaders
    };
    for (const [header, value] of Object.entries(headers)) {
      req = req.set(header, value);
    }
    return req.send(payload);
  };

  beforeAll(async () => {
    ({ server, request, teardown } = await getConnections(
      {
        schemas: metaApiSchemas,
        authRole: 'anonymous',
        server: {
          useRouting: true,
          api: {
            isPublic: false,
            metaSchemas: metaApiSchemas
          }
        }
      },
      seedAdaptersFor('simple-seed-scoped')
    ));
    teardowns.push(teardown);
  });

  // The meta schema serves as the request's own role, under RLS: nothing
  // switches to administrator. A caller without a session is `anonymous`,
  // which holds no grant on the metaschema tables.
  it.each([
    ['databases', '{ databases { nodes { name } } }'],
    ['schemas', '{ schemas { nodes { name schemaName isPublic } } }'],
    ['tables', '{ tables { nodes { name } } }'],
    ['apis', '{ apis { nodes { name isPublished databaseId } } }']
  ])('reads %s as anonymous under its own grants, never as administrator', async (field, query) => {
    const res = await postGraphQL({ query });

    expect(res.status).toBe(200);
    expect(res.body.data?.[field] ?? null).toBeNull();
    expect(res.body.errors?.map((e: { message: string }) => e.message)).toEqual([
      expect.stringMatching(/^permission denied for (table|schema) /)
    ]);
  });

  it('resolves the meta-schema surface (single-record __typename)', async () => {
    const res = await postGraphQL({ query: '{ __typename }' });
    expect(res.status).toBe(200);
    expect(res.body.data.__typename).toBeDefined();
  });
});

/**
 * Error path tests
 *
 * Exercise the api middleware error conditions under scoped routing:
 * - Invalid X-Schemata (ApiError with errorHtml → 404)
 * - Host that resolves to no route (→ 404, no legacy fallback)
 * - NO_VALID_SCHEMAS (configured metaSchemas absent → 404)
 */
describe('Error paths', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    ({ request, teardown } = await getConnections(
      {
        schemas,
        authRole: 'anonymous',
        server: {
          useRouting: true,
          api: {
            isPublic: false,
            metaSchemas: scopedMetaSchemas
          }
        }
      },
      seedAdaptersFor('simple-seed-scoped')
    ));
    teardowns.push(teardown);
  });

  describe('Invalid X-Schemata (returns 404)', () => {
    it('should return 404 when X-Schemata contains schemas not in the DB', async () => {
      const res = await request
        .post('/graphql')
        .set('X-Database-Id', scopedDatabaseId)
        .set('X-Schemata', 'nonexistent_schema_abc,another_fake_schema')
        .send({ query: '{ __typename }' });

      expect(res.status).toBe(404);
      expect(res.text).toContain('No valid schemas found for the supplied X-Schemata header');
    });
  });

  describe('Unresolved host (returns 404, no fallback)', () => {
    it('should return 404 when Host header does not resolve to any route', async () => {
      const res = await request
        .post('/graphql')
        .set('Host', 'unknown.nowhere.com')
        .send({ query: '{ __typename }' });

      expect(res.status).toBe(404);
      expect(res.text).toContain('Not Found');
    });
  });

  describe('NO_VALID_SCHEMAS error', () => {
    let noSchemasRequest: supertest.Agent;
    let noSchemasTeardown: () => Promise<void>;

    beforeAll(async () => {
      // simple-seed does NOT install the configured metaSchemas, so schema
      // validation finds none and NO_VALID_SCHEMAS is raised.
      ({ request: noSchemasRequest, teardown: noSchemasTeardown } = await getConnections(
        {
          schemas,
          authRole: 'anonymous',
          server: {
            useRouting: true,
            api: {
              isPublic: false,
              metaSchemas: scopedMetaSchemas
            }
          }
        },
        seedAdaptersFor('simple-seed')
      ));
      teardowns.push(noSchemasTeardown);
    });

    it('should return 404 when configured metaSchemas do not exist in the DB', async () => {
      const res = await noSchemasRequest
        .post('/graphql')
        .set('X-Database-Id', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
        .set('X-Meta-Schema', 'true')
        .send({ query: '{ __typename }' });

      expect(res.status).toBe(404);
      expect(res.text).toContain('No valid schemas found');
    });
  });

  describe('Public host no-match (returns 404)', () => {
    let publicRequest: supertest.Agent;
    let publicTeardown: () => Promise<void>;

    beforeAll(async () => {
      ({ request: publicRequest, teardown: publicTeardown } = await getConnections(
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
        seedAdaptersFor('simple-seed-scoped')
      ));
      teardowns.push(publicTeardown);
    });

    it('should return 404 when the host resolves to no route for a public API', async () => {
      const res = await publicRequest
        .post('/graphql')
        .set('Host', 'unknown.nowhere.com')
        .send({ query: '{ __typename }' });

      expect(res.status).toBe(404);
      expect(res.text).toContain('Not Found');
      expect(res.text).toContain('API service not found');
    });
  });
});

describe('Cookie-authenticated GraphQL CSRF flow', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  const host = 'app.test.constructive.io';
  const query = { query: '{ __typename }' };

  const getCsrfCookie = async () => {
    const res = await request.get('/graphql').set('Host', host);
    const setCookie = res.headers['set-cookie'];
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    const csrfCookie = cookies
      .filter((cookie): cookie is string => typeof cookie === 'string')
      .map((cookie) => cookie.split(';')[0])
      .find((cookie) => cookie.startsWith('csrf_token='));

    expect(csrfCookie).toBeDefined();
    return csrfCookie!;
  };

  const postWithSession = async (csrfCookie?: string, csrfToken?: string) => {
    const cookies = [
      csrfCookie,
      'constructive_session=test-session'
    ].filter((cookie): cookie is string => Boolean(cookie));
    let req = request
      .post('/graphql')
      .set('Host', host)
      .set('Cookie', cookies.join('; '));

    if (csrfToken) {
      req = req.set('X-CSRF-Token', csrfToken);
    }

    return req.send(query);
  };

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
      seedAdaptersFor('simple-seed-scoped')
    ));
    teardowns.push(teardown);
  });

  it('allows the documented token, session cookie, and header flow', async () => {
    const csrfCookie = await getCsrfCookie();
    const csrfToken = csrfCookie.slice('csrf_token='.length);

    const res = await postWithSession(csrfCookie, csrfToken);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { __typename: 'Query' } });
  });

  it('returns a JSON CSRF error when the submitted token is missing', async () => {
    const csrfCookie = await getCsrfCookie();

    const res = await postWithSession(csrfCookie);

    expect(res.status).toBe(403);
    expect(res.headers['content-type']).toMatch(/^application\/json/);
    expect(res.body).toEqual({
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token validation failed',
        requestId: expect.any(String)
      }
    });
  });

  it('returns a JSON CSRF error when the CSRF cookie is missing', async () => {
    const res = await postWithSession();

    expect(res.status).toBe(403);
    expect(res.headers['content-type']).toMatch(/^application\/json/);
    expect(res.body).toEqual({
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token missing from cookie',
        requestId: expect.any(String)
      }
    });
  });

  it('returns the same JSON CSRF error when the submitted token is wrong', async () => {
    const csrfCookie = await getCsrfCookie();

    const res = await postWithSession(csrfCookie, 'wrong-token');

    expect(res.status).toBe(403);
    expect(res.headers['content-type']).toMatch(/^application\/json/);
    expect(res.body).toEqual({
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token validation failed',
        requestId: expect.any(String)
      }
    });
  });

  it('keeps genuinely unknown routes on the HTML 404 path', async () => {
    const res = await request
      .get('/this-route-does-not-exist')
      .set('Host', host);

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.text).toContain('<title>Not Found</title>');
    expect(res.text).toContain('The requested page was not found');
  });
});

afterAll(async () => {
  for (const teardown of teardowns) {
    await teardown();
  }
});
