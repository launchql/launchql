process.env.LOG_SCOPE='pg-codegen';

import { join } from 'path';
import { getConnections, seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { generateCodeTree } from '../src/codegen/codegen';
import getIntrospectionRows from '../src/introspect';
import type { DatabaseObject } from '../src/types';

const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let pg: PgTestClient;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections({},
    [
      seed.sqlfile([sql('test.sql')])
    ]
  ));
});

afterAll(() => teardown());

it('fetches introspection rows from test schema', async () => {
  const rows: DatabaseObject[] = await getIntrospectionRows({
    client: pg.client,
    introspectionOptions: {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true
    },
    namespacesToIntrospect: ['codegen_test'],
    includeExtensions: false
  });

  expect(rows.length).toBeGreaterThan(0);
  expect(rows.find(r => r.kind === 'class' && r.name === 'users')).toBeTruthy();
  expect(rows.find(r => r.kind === 'class' && r.name === 'posts')).toBeTruthy();
});

it('generates _common.ts with UUID and Timestamp types', async () => {
  const rows = await getIntrospectionRows({
    client: pg.client,
    introspectionOptions: {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true
    },
    namespacesToIntrospect: ['codegen_test'],
    includeExtensions: false
  });

  const output = generateCodeTree(rows, {
    includeTimestamps: true,
    includeUUID: true
  });

  const common = output['schemas/_common.ts'];
  expect(common).toMatchSnapshot();
});

it('generates interfaces and classes for tables', async () => {
  const rows = await getIntrospectionRows({
    client: pg.client,
    introspectionOptions: {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true
    },
    namespacesToIntrospect: ['codegen_test'],
    includeExtensions: false
  });

  const output = generateCodeTree(rows, {
    includeTimestamps: true,
    includeUUID: true
  });

  const schema = output['schemas/codegen_test.ts'];
  expect(schema).toMatchSnapshot();
});

it('imports UUID and Timestamp when used in schema', async () => {
  const rows = await getIntrospectionRows({
    client: pg.client,
    introspectionOptions: {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true
    },
    namespacesToIntrospect: ['codegen_test'],
    includeExtensions: false
  });

  const output = generateCodeTree(rows, {
    includeTimestamps: true,
    includeUUID: true
  });

  const schema = output['schemas/codegen_test.ts'];
  expect(schema).toMatch(/import\s+\{\s*UUID,\s*Timestamp\s*\}\s+from ["']\.\/_common["']/);
});

it('generates an index.ts that exports schema namespace', async () => {
  const rows = await getIntrospectionRows({
    client: pg.client,
    introspectionOptions: {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true
    },
    namespacesToIntrospect: ['codegen_test'],
    includeExtensions: false
  });

  const output = generateCodeTree(rows, {
    includeTimestamps: true,
    includeUUID: true
  });

  const index = output['index.ts'];
  expect(index).toMatchSnapshot();
});
