/**
 * Handler heap regression (simple-seed-scoped + 2,000 unrelated tables)
 *
 * Every routed API builds its own cached PostGraphile handler. A handler must
 * retain only its API's schemas: introspecting the whole database made each
 * one retain the entire catalog, so a pod ran out of heap after a dozen hosts.
 * An unknown host must 404 before any handler is built.
 *
 * Run tests:
 *   pnpm test -- --testPathPattern=handler-heap.integration
 */

import { graphileCache } from 'graphile-cache';
import path from 'path';
import type supertest from 'supertest';
import { setFlagsFromString } from 'v8';
import { runInNewContext } from 'vm';

import { getConnections, seed } from '../src';

jest.setTimeout(180000);

setFlagsFromString('--expose-gc');
const gc = runInNewContext('gc') as () => void;

const MiB = 1024 * 1024;
// Whole-database introspection of this fixture retains ~51 MiB per handler;
// schema-scoped introspection retains ~6 MiB.
const MAX_HANDLER_HEAP_BYTES = 25 * MiB;

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const shared = (...segments: string[]) =>
  path.join(sharedSeedRoot, ...segments);
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');
const schemas = ['simple-pets-public', 'simple-pets-pets-public'];
const scopedMetaSchemas = [
  'catalog_private',
  'routing_public',
  'apps_public',
  'metaschema_public',
  'metaschema_modules_public'
];

const retainedHeap = (): number => {
  gc();
  gc();
  return process.memoryUsage().heapUsed;
};

describe('simple-seed-scoped: handler heap', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  const postGraphQL = (host: string) =>
    request
      .post('/graphql')
      .set('Host', host)
      .send({ query: '{ __typename }' });

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
      [
        seed.pgpm(pgpmWorkspace),
        seed.sqlfile([
          shared('app-schemas', 'simple-pets', 'schema.sql'),
          shared('scoped', 'test-data.sql'),
          shared('app-schemas', 'simple-pets', 'test-data.sql'),
          path.join(__dirname, '..', '__fixtures__', 'seed', 'handler-heap', 'unrelated-schemas.sql')
        ])
      ]
    ));
  });

  afterAll(async () => {
    await teardown();
  });

  it('returns 404 for an unknown host without building a handler', async () => {
    const res = await postGraphQL('unknown.test.constructive.io');

    expect(res.status).toBe(404);
    expect(graphileCache.size).toBe(0);
  });

  it("retains only the API's own schemas in the cached handler", async () => {
    const before = retainedHeap();
    const res = await postGraphQL('app.test.constructive.io');
    const retained = retainedHeap() - before;

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ __typename: 'Query' });
    expect(graphileCache.size).toBe(1);
    process.stdout.write(
      `handler-heap: first handler retained ${(retained / MiB).toFixed(1)} MiB\n`
    );
    expect(retained).toBeLessThan(MAX_HANDLER_HEAP_BYTES);
  });
});
