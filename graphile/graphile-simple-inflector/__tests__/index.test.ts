import '../test-utils/env';
import { GraphQLQueryFn, getConnections, seed, snapshot } from 'graphile-test';
import { join } from 'path';
import type { PgTestClient } from 'pgsql-test/test-client';

import { PgSimpleInflector } from '../src';
import { IntrospectionQuery } from '../test-utils/queries';

const SCHEMA = 'app_public';
const sql = (file: string) => join(__dirname, '../sql', file);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;
let db: PgTestClient;

beforeAll(async () => {
  const connections = await getConnections(
    {
      schemas: [SCHEMA],
      authRole: 'authenticated',
      graphile: {
        overrideSettings: {
          appendPlugins: [PgSimpleInflector]
        }
      }
    },
    [
      seed.sqlfile([
        sql('test.sql')
      ])
    ]
  );

  ({ db, query, teardown } = connections);
});

beforeEach(() => db.beforeEach());
beforeEach(async () => {
  db.setContext({ role: 'authenticated' });
});
afterEach(() => db.afterEach());
afterAll(async () => {
  await teardown();
});

it('applies simple inflection', async () => {
  const data = await query(IntrospectionQuery);
  expect(snapshot(data)).toMatchSnapshot();
});
