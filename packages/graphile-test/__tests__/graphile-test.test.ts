// ✅ Set env variables before anything else
process.env.LOG_SCOPE = 'graphile-test';

import { getConnections } from '../src/connect';
import { snapshot } from '../src';
import { IntrospectionQuery } from '../test-utils/queries';
import type { GraphQLQueryFn } from '../src/connect';
import type { PgTestClient } from 'pgsql-test/test-client';
import { seed } from 'pgsql-test';
import { join } from 'path';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;
let db: PgTestClient;

beforeAll(async () => {
  const connections = await getConnections({
    useRoot: true,
    schemas,
    authRole: 'postgres'
  },
    [
      seed.sqlfile([
        sql('test.sql')
      ])
    ]);

  ({ query, db, teardown } = connections);
});

beforeEach(() => db.beforeEach());

afterEach(() => db.afterEach());

afterAll(async () => {
  await teardown();
});

it('introspection query snapshot', async () => {
  const res = await query(IntrospectionQuery);
  expect(snapshot(res)).toMatchSnapshot('introspection');
});
