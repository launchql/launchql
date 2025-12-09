import { join } from 'path';
import { Pool } from 'pg';
import {
  createPostGraphileSchema,
  type PostGraphileOptions,
} from 'postgraphile';
import { getConnections, seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import PostgisPlugin from 'graphile-postgis';
import ConnectionFilterPlugin from 'graphile-plugin-connection-filter';

import PostgisConnectionFilterPlugin from '../../../src';
import { printSchemaOrdered } from '../../../test-utils/printSchema';

const SCHEMA = process.env.SCHEMA ?? 'p';
const sql = (file: string) => join(__dirname, '../../../sql', file);

let db!: PgTestClient;
let teardown!: () => Promise<void>;
let pool!: Pool;

const createSchemaSnapshot = async (
  options: PostGraphileOptions
): Promise<string> => {
  const schema = await createPostGraphileSchema(pool, [SCHEMA], options);
  return printSchemaOrdered(schema);
};

beforeAll(async () => {
  const connections = await getConnections({}, [
    seed.sqlfile([sql('schema.sql')]),
  ]);
  ({ pg: db, teardown } = connections);
  pool = new Pool(db.config);
});

beforeEach(() => db.beforeEach());
beforeEach(() => db.setContext({ role: 'authenticated' }));
afterEach(() => db.afterEach());
afterAll(async () => {
  await pool.end();
  await teardown();
});

it(
  'prints a schema with the graphile-plugin-connection-filter-postgis plugin',
  async () => {
    const schema = await createSchemaSnapshot({
      appendPlugins: [
        PostgisPlugin,
        ConnectionFilterPlugin,
        PostgisConnectionFilterPlugin,
      ],
      disableDefaultMutations: true,
      legacyRelations: 'omit',
    });

    expect(schema).toMatchSnapshot();
  }
);
