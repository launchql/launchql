/**
 * CSRF on the REST routes that sit next to /graphql: POST /fn/:alias and the
 * agentic router (/v1/*). They accept the session cookie through the shared
 * authenticate middleware, so a cookie-carrying request needs the same
 * double-submit CSRF token /graphql asks for. Bearer callers are untouched.
 *
 * "Cross-site" requests here are the shapes a page on another origin can send
 * without a CORS preflight: text/plain and form-encoded simple POSTs.
 */

import path from 'path';
import type supertest from 'supertest';

import { getConnections, seed } from '../src';

jest.setTimeout(60000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const shared = (...segments: string[]) => path.join(sharedSeedRoot, ...segments);
const local = (...segments: string[]) =>
  path.join(__dirname, '..', '__fixtures__', 'seed', ...segments);
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');
const schemas = ['simple-pets-public', 'simple-pets-pets-public'];
const metaSchemas = [
  'catalog_private',
  'routing_public',
  'apps_public',
  'metaschema_public',
  'metaschema_modules_public'
];

const HOST = 'app.test.constructive.io';
const ATTACKER_ORIGIN = 'https://attacker.example';
const SESSION_COOKIE = 'constructive_session=session-token';
const USER_ID = 'bbbbbbbb-0000-4000-8000-000000000002';
const CSRF_TOKEN = 'a'.repeat(64);

type Body = { type: string; body: string };
const SIMPLE_BODIES: Record<string, Body> = {
  'text/plain': { type: 'text/plain', body: '{"width":1}' },
  'form-encoded': { type: 'application/x-www-form-urlencoded', body: 'width=1' }
};

let request: supertest.Agent;
let pg: any;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ request, pg, teardown } = await getConnections(
    {
      schemas,
      authRole: 'anonymous',
      server: { useRouting: true, api: { isPublic: true, metaSchemas } }
    },
    [
      seed.pgpm(pgpmWorkspace),
      seed.sqlfile([
        shared('compute', 'setup.sql'),
        shared('app-schemas', 'simple-pets', 'schema.sql'),
        shared('scoped', 'test-data.sql'),
        shared('compute', 'test-data.sql'),
        shared('app-schemas', 'simple-pets', 'test-data.sql'),
        local('auth-cookie', 'schema.sql'),
        local('csrf-rest-routes', 'schema.sql')
      ])
    ]
  ));
});

afterAll(async () => {
  await teardown();
});

const post = (url: string, headers: Record<string, string>, { type, body }: Body) => {
  let req = request.post(url).set('Host', HOST).set('Content-Type', type);
  for (const [name, value] of Object.entries(headers)) {
    req = req.set(name, value);
  }
  return req.send(body);
};

const crossSite = { Origin: ATTACKER_ORIGIN, Cookie: SESSION_COOKIE, Accept: 'application/json' };

const userRows = async (): Promise<number> => {
  const { rows } = await pg.query(
    `SELECT (SELECT count(*) FROM compute_public.function_invocations WHERE actor_id = $1)
          + (SELECT count(*) FROM "simple-pets-agent-public".threads WHERE owner_id = $1) AS n`,
    [USER_ID]
  );
  return Number(rows[0].n);
};

const invocationActor = async (id: string): Promise<string | null> => {
  const { rows } = await pg.query(
    'SELECT actor_id FROM compute_public.function_invocations WHERE id = $1',
    [id]
  );
  return rows[0]?.actor_id ?? null;
};

const threadOwner = async (id: string): Promise<string | null> => {
  const { rows } = await pg.query(
    'SELECT owner_id FROM "simple-pets-agent-public".threads WHERE id = $1',
    [id]
  );
  return rows[0]?.owner_id ?? null;
};

describe.each(Object.entries(SIMPLE_BODIES))('cross-site %s POST with the session cookie', (_name, body) => {
  let before: number;

  beforeEach(async () => {
    before = await userRows();
  });

  afterEach(async () => {
    // Refused before the handler: nothing was created as the user.
    expect(await userRows()).toBe(before);
  });

  it('is refused on /fn/:alias without a CSRF token', async () => {
    const res = await post('/fn/resize', crossSite, body);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('is refused on /v1/threads without a CSRF token', async () => {
    const res = await post('/v1/threads', crossSite, body);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('is refused on /fn/:alias when the CSRF cookie has no matching header', async () => {
    const res = await post(
      '/fn/resize',
      { ...crossSite, Cookie: `${SESSION_COOKIE}; csrf_token=${CSRF_TOKEN}` },
      body
    );

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_TOKEN_INVALID');
  });
});

describe('session cookie with a Bearer header authenticate ignores', () => {
  let before: number;

  beforeEach(async () => {
    before = await userRows();
  });

  afterEach(async () => {
    expect(await userRows()).toBe(before);
  });

  // authenticate falls back to the cookie for these, so CSRF must still apply.
  it.each([
    ['an empty `Bearer `', 'Bearer '],
    ['an empty token before the real one', 'Bearer  session-token']
  ])('is refused without a CSRF token for %s', async (_name, authorization) => {
    const res = await post(
      '/fn/resize',
      { ...crossSite, Authorization: authorization },
      SIMPLE_BODIES['text/plain']
    );

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });
});

describe('cookie-authenticated request with a valid CSRF token', () => {
  const withToken = {
    Cookie: `${SESSION_COOKIE}; csrf_token=${CSRF_TOKEN}`,
    'X-CSRF-Token': CSRF_TOKEN
  };
  const json = { type: 'application/json', body: '{"width":1}' };

  it('invokes /fn/:alias as the signed-in user', async () => {
    const res = await post('/fn/resize', withToken, json);

    expect(res.status).toBe(202);
    expect(await invocationActor(res.body.invocationId)).toBe(USER_ID);
  });

  it('creates a /v1/threads thread as the signed-in user', async () => {
    const res = await post('/v1/threads', withToken, json);

    expect(res.status).toBe(201);
    expect(await threadOwner(res.body.id)).toBe(USER_ID);
  });
});

describe('Bearer request with no Origin and no CSRF cookie', () => {
  const bearer = { Authorization: 'Bearer session-token' };
  const json = { type: 'application/json', body: '{"width":1}' };

  it('invokes /fn/:alias as the token user', async () => {
    const res = await post('/fn/resize', bearer, json);

    expect(res.status).toBe(202);
    expect(await invocationActor(res.body.invocationId)).toBe(USER_ID);
  });

  it('creates a /v1/threads thread as the token user', async () => {
    const res = await post('/v1/threads', bearer, json);

    expect(res.status).toBe(201);
    expect(await threadOwner(res.body.id)).toBe(USER_ID);
  });

  it('is not CSRF-checked even when it also carries the session cookie', async () => {
    const res = await post('/fn/resize', { ...bearer, Cookie: SESSION_COOKIE }, json);

    expect(res.status).toBe(202);
  });
});

describe('anonymous request (no credentials)', () => {
  it('reaches /fn/:alias without a CSRF token, as before', async () => {
    const res = await post('/fn/resize', {}, { type: 'application/json', body: '{}' });

    expect(res.status).toBe(202);
    expect(await invocationActor(res.body.invocationId)).toBeNull();
  });
});
