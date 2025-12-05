import '../test-utils/env';
import PgManyToMany from '@graphile-contrib/pg-many-to-many';
import { join } from 'path';
import { getConnections, snapshot, seed, type GraphQLQueryFn } from 'graphile-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import {
  GetBelongsToRelations,
  GetHasManyRelations,
  GetHasOneRelations,
  GetManyToManyRelations,
  GetMetaInflection,
  GetMetaSchema,
  GetMetaSchemaUnion
} from '../test-utils/queries';
import { PgMetaschemaPlugin } from '../src';

const SCHEMA = process.env.SCHEMA ?? 'app_meta';
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
          appendPlugins: [PgManyToMany, PgMetaschemaPlugin],
          dynamicJson: true,
          graphqlRoute: '/graphql'
        }
      }
    },
    [
      seed.sqlfile([sql('test.sql'), sql('types.sql')])
    ]
  );

  ({ db, query, teardown } = connections);
});

beforeEach(() => db.beforeEach());
beforeEach(async () => {
  db.setContext({
    role: 'authenticated'
  });
});
afterEach(() => db.afterEach());
afterAll(async () => {
  await teardown();
});

const expectNoErrors = (result: unknown): void => {
  const data = result as { errors?: unknown };
  expect(data.errors).toBeUndefined();
};

it('GetMetaSchema', async () => {
  const data = await query(GetMetaSchema);
  expectNoErrors(data);
  expect(snapshot(data)).toMatchSnapshot();
});

it('GetMetaSchemaUnion', async () => {
  const data = await query(GetMetaSchemaUnion);
  expectNoErrors(data);
  expect(snapshot(data)).toMatchSnapshot();
});

it('GetMetaInflection', async () => {
  const data = await query(GetMetaInflection);
  expectNoErrors(data);
  expect(snapshot(data)).toMatchSnapshot();
});

it('GetHasOneRelations', async () => {
  const data = await query(GetHasOneRelations);
  expectNoErrors(data);
  expect(snapshot(data)).toMatchSnapshot();
});

it('GetHasManyRelations', async () => {
  const data = await query(GetHasManyRelations);
  expectNoErrors(data);
  expect(snapshot(data)).toMatchSnapshot();
});

it('GetBelongsToRelations', async () => {
  const data = await query(GetBelongsToRelations);
  expectNoErrors(data);
  expect(snapshot(data)).toMatchSnapshot();
});

it('GetManyToManyRelations', async () => {
  const data = await query(GetManyToManyRelations);
  expectNoErrors(data);
  expect(snapshot(data)).toMatchSnapshot();
});
