/**
 * Client-IP attribution through the full server.
 *
 * The address a request is attributed to — `req.clientIp`, and from there
 * `jwt.claims.ip_address` in the transaction's pgSettings — must be the
 * socket peer, or the `X-Forwarded-For` entry our own proxy appended. A caller
 * writes the leftmost entry itself, so believing it would let any client pick
 * the address every per-IP limit and audit row is keyed on.
 *
 * Run tests:
 *   pnpm test -- --testPathPattern=client-ip.integration
 */

import path from 'path';
import type supertest from 'supertest';

import { getConnections, seed } from '../src';

jest.setTimeout(30000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const localSeedRoot = path.join(__dirname, '..', '__fixtures__', 'seed', 'client-ip');
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
    path.join(sharedSeedRoot, 'app-schemas', 'simple-pets', 'schema.sql'),
    path.join(sharedSeedRoot, 'scoped', 'test-data.sql'),
    path.join(sharedSeedRoot, 'app-schemas', 'simple-pets', 'test-data.sql'),
    path.join(localSeedRoot, 'schema.sql')
  ])
];

const connect = (trustedProxyHops: number) =>
  getConnections(
    {
      schemas,
      authRole: 'anonymous',
      server: {
        useRouting: true,
        trustedProxyHops,
        api: { isPublic: true, metaSchemas }
      }
    },
    seedAdapters
  );

/** The `jwt.claims.ip_address` the database saw for one request. */
const attributedIp = async (
  request: supertest.Agent,
  forwardedFor?: string
): Promise<string | null> => {
  let req = request.post('/graphql').set('Host', 'app.test.constructive.io');
  if (forwardedFor !== undefined) req = req.set('X-Forwarded-For', forwardedFor);
  const res = await req.send({ query: '{ requestClientIp }' });
  expect(res.status).toBe(200);
  expect(res.body.errors).toBeUndefined();
  return res.body.data.requestClientIp;
};

const SOCKET_PEER = '127.0.0.1';

describe('jwt.claims.ip_address behind one trusted proxy hop', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    ({ request, teardown } = await connect(1));
  });

  afterAll(async () => {
    await teardown();
  });

  it('is the address the proxy appended, not the one the caller forged', async () => {
    expect(await attributedIp(request, '1.2.3.4, 203.0.113.7')).toBe('203.0.113.7');
  });

  it('cannot be rotated per request by rewriting the leftmost entry', async () => {
    const seen = new Set<string | null>();
    for (const forged of ['5.5.5.5', '6.6.6.6', '7.7.7.7']) {
      seen.add(await attributedIp(request, `${forged}, 203.0.113.7`));
    }
    expect([...seen]).toEqual(['203.0.113.7']);
  });

  it('falls back to the socket peer when the header is absent', async () => {
    expect(await attributedIp(request)).toBe(SOCKET_PEER);
  });

  it('falls back to the socket peer on a malformed header rather than guessing', async () => {
    expect(await attributedIp(request, ' , ,')).toBe(SOCKET_PEER);
  });
});

describe('jwt.claims.ip_address with no trusted proxy', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    ({ request, teardown } = await connect(0));
  });

  afterAll(async () => {
    await teardown();
  });

  it('is the socket peer and ignores X-Forwarded-For entirely', async () => {
    expect(await attributedIp(request, '1.2.3.4')).toBe(SOCKET_PEER);
    expect(await attributedIp(request, '1.2.3.4, 203.0.113.7')).toBe(SOCKET_PEER);
    expect(await attributedIp(request)).toBe(SOCKET_PEER);
  });
});
