import '../test-utils/env';

import { existsSync, promises as fs, readdirSync } from 'fs';
import { join } from 'path';
import { getConnections } from 'graphile-test';
import type { GraphQLQueryFn } from 'graphile-test';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import PgManyToManyPlugin from '../src';

const SCHEMA_DIR = join(__dirname, '../sql');

jest.setTimeout(20_000);

type FixtureSet = {
  schema: string;
  fixtures: string[];
};

const getFixtureSets = (): FixtureSet[] => {
  const schemas = readdirSync(SCHEMA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return schemas
    .map((schema) => {
      const fixtureDir = join(SCHEMA_DIR, schema, 'fixtures/queries');
      try {
        const fixtures = readdirSync(fixtureDir).filter((file) => file.endsWith('.graphql'));
        return fixtures.length ? { schema, fixtures } : null;
      } catch {
        return null;
      }
    })
    .filter((value): value is FixtureSet => Boolean(value));
};

const fixtureSets = getFixtureSets();

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

const getSchemaConnections = async (schemaName: string) => {
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
          appendPlugins: [PgManyToManyPlugin]
        }
      }
    },
    sqlFiles.length ? [seed.sqlfile(sqlFiles)] : []
  );

  const { db, pg, query, teardown } = connections;
  return { db, pg, query, teardown };
};

describe.each(fixtureSets.map(({ schema, fixtures }) => [schema, fixtures] as const))(
  'schema=%s',
  (schema, fixtures) => {
  let query: GraphQLQueryFn;
  let db: PgTestClient;
  let pg: PgTestClient;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    const connections = await getSchemaConnections(schema);
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

  test.each(fixtures)('query=%s', async (fixture) => {
    const queryText = await fs.readFile(join(SCHEMA_DIR, schema, 'fixtures/queries', fixture), 'utf8');
    const result = await query(queryText);
    const normalizedResult = JSON.parse(JSON.stringify(result));
    if (normalizedResult.errors) {
      // surface underlying errors in case snapshots hide details
      /* eslint-disable no-console */
      console.log(normalizedResult.errors.map((error: any) => error.originalError ?? error));
      /* eslint-enable no-console */
    }
    expect(normalizedResult).toMatchSnapshot();
  });
});
