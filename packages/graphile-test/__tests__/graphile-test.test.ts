process.env.LOG_SCOPE = 'graphile-test';

import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { snapshot } from '../src';
import { getConnections } from '../src/get-connections';
import type { GraphQLQueryFn } from '../src/types';
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

it('introspection query works', async () => {
  await logDbSessionInfo(db);
  const res = await query(IntrospectionQuery);
  
  // Bare-bones test: just verify introspection works, don't validate plugin-generated fields
  expect(res.data).not.toBeNull();
  expect(res.data).not.toBeUndefined();
  expect(res.errors).toBeUndefined();
  expect(res.data?.__schema).toBeDefined();
  expect(res.data?.__schema?.queryType).toBeDefined();
  
  // Verify we can query the basic table (allUsers is default PostGraphile behavior)
  const queryType = res.data?.__schema?.queryType;
  const types = res.data?.__schema?.types || [];
  const queryTypeDef = types.find((t: any) => t.name === queryType?.name);
  const fields = queryTypeDef?.fields || [];
  
  // Should have allUsers field (default PostGraphile behavior)
  const allUsersField = fields.find((f: any) => f.name === 'allUsers');
  expect(allUsersField).toBeDefined();
});
