import '../test-utils/env';
import type { GraphQLQueryFn } from 'graphile-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { createConnectionsForSchema, getSchemaSnapshot } from '../test-utils/helpers';

const SCHEMAS = [
  'graphile_postgis',
  'graphile_postgis_minimal_unconstrained',
  'graphile_postgis_minimal_dimensional',
  'graphile_postgis_minimal_type',
  'graphile_postgis_minimal_type_and_srid'
] as const;

describe.each(SCHEMAS)('%s schema snapshot', (schemaName) => {
  let teardown: () => Promise<void>;
  let query: GraphQLQueryFn;
  let db: PgTestClient;

  beforeAll(async () => {
    const connections = await createConnectionsForSchema(schemaName);
    ({ query, teardown, db } = connections);
  });

  beforeEach(async () => {
    await db.beforeEach();
    db.setContext({ role: 'authenticated' });
  });
  afterEach(() => db.afterEach());
  afterAll(async () => {
    await teardown();
  });

  it('prints a schema with this plugin', async () => {
    const printedSchema = await getSchemaSnapshot(query);
    expect(printedSchema).toMatchSnapshot();
  });
});
