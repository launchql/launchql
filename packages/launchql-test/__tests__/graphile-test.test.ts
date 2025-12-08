process.env.LOG_SCOPE = 'graphile-test';

import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { snapshot } from '../src/utils';
import { getConnections } from '../src/get-connections';
import type { GraphQLQueryFn } from 'graphile-test';
import { IntrospectionQuery } from '../test-utils/queries';
import { logDbSessionInfo } from '../test-utils/utils';

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
afterAll(() => teardown());

it('introspection query snapshot', async () => {
  await logDbSessionInfo(db);
  const res = await query(IntrospectionQuery);
  expect(snapshot(res)).toMatchSnapshot('introspection');
});
