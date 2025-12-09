import { readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { GraphQLQueryFnObj } from 'graphile-test';
import { getConnectionsObject, seed, snapshot } from 'graphile-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import PostgisPlugin from 'graphile-postgis';
import ConnectionFilterPlugin from 'graphile-plugin-connection-filter';

import PostgisConnectionFilterPlugin from '../../src';

jest.setTimeout(30000);

type ConnectionContext = {
  db: PgTestClient;
  query: GraphQLQueryFnObj;
  teardown: () => Promise<void>;
};

const SCHEMA = 'p';
const AUTH_ROLE = 'postgres';
const sql = (file: string) => join(__dirname, '../../sql', file);
const queriesDir = join(__dirname, '../fixtures/queries');
const queryFileNames = readdirSync(queriesDir);

let ctx!: ConnectionContext;

beforeAll(async () => {
  const useRoot = true;
  const connections = await getConnectionsObject(
    {
      useRoot,
      schemas: [SCHEMA],
      authRole: AUTH_ROLE,
      graphile: {
        overrideSettings: {
          appendPlugins: [
            PostgisPlugin,
            ConnectionFilterPlugin,
            PostgisConnectionFilterPlugin,
          ],
        },
      },
    },
    [seed.sqlfile([sql('schema.sql'), sql('data.sql')])]
  );

  ctx = {
    db: useRoot ? connections.pg : connections.db,
    query: connections.query,
    teardown: connections.teardown,
  };
});

beforeEach(() => ctx.db.beforeEach());
beforeEach(() => ctx.db.setContext({ role: AUTH_ROLE }));
afterEach(() => ctx.db.afterEach());
afterAll(async () => {
  if (ctx) {
    await ctx.teardown();
  }
});

describe.each(queryFileNames)('%s', (queryFileName) => {
  it('matches snapshot', async () => {
    const query = await readFile(join(queriesDir, queryFileName), 'utf8');

    const result = await ctx.query({
      query,
      variables: {
        point: { type: 'Point', coordinates: [30, 10] },
      },
    });

    expect(snapshot(result)).toMatchSnapshot();
  });
});
