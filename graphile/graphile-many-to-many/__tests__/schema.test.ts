import '../test-utils/env';

import { existsSync } from 'fs';
import { join } from 'path';
import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';
import { lexicographicSortSchema } from 'graphql/utilities';
import { PgConnectionArgCondition } from 'graphile-build-pg';
import type { PostGraphileOptions } from 'postgraphile';
import { getConnections } from 'graphile-test';
import type { GraphQLQueryFn } from 'graphile-test';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import PgManyToManyPlugin from '../src';

type SchemaTestCase = {
  name: string;
  schema: string;
  options: Partial<PostGraphileOptions>;
};

const legacyOptions: Partial<PostGraphileOptions> = {
  disableDefaultMutations: true,
  legacyRelations: 'omit'
};

const schemaTests: SchemaTestCase[] = [
  { name: 'a', schema: 'a', options: { ...legacyOptions, skipPlugins: [PgConnectionArgCondition] } },
  { name: 'b', schema: 'b', options: { ...legacyOptions, skipPlugins: [PgConnectionArgCondition] } },
  { name: 'c', schema: 'c', options: { ...legacyOptions, skipPlugins: [PgConnectionArgCondition] } },
  { name: 'd', schema: 'd', options: { ...legacyOptions, skipPlugins: [PgConnectionArgCondition] } },
  { name: 'e', schema: 'e', options: { disableDefaultMutations: true, setofFunctionsContainNulls: false } },
  { name: 'f', schema: 'f', options: legacyOptions },
  { name: 'g', schema: 'g', options: legacyOptions },
  { name: 'p', schema: 'p', options: legacyOptions },
  { name: 'p.ignoreIndexesFalse', schema: 'p', options: { ...legacyOptions, ignoreIndexes: false } },
  { name: 'p.simpleCollectionsBoth', schema: 'p', options: { ...legacyOptions, simpleCollections: 'both' } },
  { name: 't', schema: 't', options: legacyOptions }
];

jest.setTimeout(20_000);

const grantAuthenticatedAccess = async (pg: PgTestClient, schemaName: string) => {
  const ident = `"${schemaName.replace(/"/g, '""')}"`;
  await pg.query(
    `
      grant usage on schema ${ident} to authenticated;
      grant select on all tables in schema ${ident} to authenticated;
      grant usage on all sequences in schema ${ident} to authenticated;
    `
  );
};

const getSchemaConnections = async (
  schemaName: string,
  overrideSettings: Partial<PostGraphileOptions> = {}
) => {
  const baseDir = join(__dirname, '../sql', schemaName);
  const sqlFiles = [join(baseDir, 'schema.sql'), join(baseDir, 'data.sql')].filter((file) =>
    existsSync(file)
  );

  const connections = await getConnections(
    {
      schemas: [schemaName],
      authRole: 'authenticated',
      graphile: {
        overrideSettings: {
          appendPlugins: [PgManyToManyPlugin],
          ...overrideSettings
        }
      }
    },
    sqlFiles.length ? [seed.sqlfile(sqlFiles)] : []
  );

  const { db, pg, query, teardown } = connections;
  return { db, pg, query, teardown };
};

describe.each(schemaTests)('$name', ({ schema, options }) => {
  let query: GraphQLQueryFn;
  let db: PgTestClient;
  let pg: PgTestClient;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    const connections = await getSchemaConnections(schema, options);
    ({ db, pg, query, teardown } = connections);
    await grantAuthenticatedAccess(pg, schema);
  });

  beforeEach(async () => {
    await db.beforeEach();
    await db.query("set local timezone to '+04:00'");
    db.setContext({ role: 'authenticated' });
  });

  afterEach(() => db.afterEach());

  afterAll(async () => {
    await teardown();
  });

  it('prints schema', async () => {
    const result = await query(getIntrospectionQuery());
    if (result.errors?.length) {
      throw new Error(JSON.stringify(result.errors, null, 2));
    }
    const schemaResult = buildClientSchema(result.data as any);
    const printed = printSchema(lexicographicSortSchema(schemaResult));
    expect(printed).toMatchSnapshot();
  });
});
