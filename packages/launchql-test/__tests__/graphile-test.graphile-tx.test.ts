process.env.LOG_SCOPE = 'graphile-test';

import gql from 'graphql-tag';
import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { snapshot } from '../src/utils';
import { getConnections } from '../src/get-connections';
import type { GraphQLQueryFn } from 'graphile-test';
import { logDbSessionInfo } from '../test-utils/utils';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;
let pg: PgTestClient;
let db: PgTestClient;

beforeAll(async () => {
  const connections = await getConnections(
    {
      schemas,
      authRole: 'authenticated'
    },
    [
      seed.sqlfile([
        sql('test.sql'),
        sql('grants.sql')
      ])
    ]
  );

  ({ pg, db, query, teardown } = connections);
});

// ✅ Each test runs in a SAVEPOINT'd transaction (pgsql-test handles this)
beforeEach(() => db.beforeEach());

// ✅ Set Postgres settings for RLS/context visibility
beforeEach(() => {
  db.setContext({
    role: 'authenticated',
    'myapp.user_id': '123'
  });
});

afterEach(() => db.afterEach());

afterAll(async () => {
  await teardown();
});

it('handles duplicate insert via internal PostGraphile savepoint', async () => {
  await logDbSessionInfo(db);
  const CREATE_USER = gql`
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        user {
          id
          username
        }
      }
    }
  `;

  const GET_USERS = gql`
    query {
      users {
        nodes {
          id
          username
        }
      }
    }
  `;

  const input = {
    input: {
      user: { username: 'dupeuser' }
    }
  };

  // ✅ Step 1: Insert should succeed
  const first = await query(CREATE_USER, input);
  expect(snapshot(first)).toMatchSnapshot('firstInsert');
  expect(first.errors).toBeUndefined();
  expect(first.data?.createUser?.user?.username).toBe('dupeuser');

  // ✅ Step 2: Second insert triggers UNIQUE constraint violation
  // However: PostGraphile *wraps each mutation in a SAVEPOINT*.
  // So this error will be caught and rolled back to that SAVEPOINT.
  // The transaction remains clean and usable.
  const second = await query(CREATE_USER, input);
  expect(snapshot(second)).toMatchSnapshot('duplicateInsert');
  expect(second.errors?.[0]?.message).toMatch(/duplicate key value/i);
  expect(second.data?.createUser).toBeNull();

  // ✅ Step 3: Query still works — transaction was not aborted
  const followup = await query(GET_USERS);
  expect(snapshot(followup)).toMatchSnapshot('queryAfterDuplicateInsert');
  expect(followup.errors).toBeUndefined();
  expect(followup.data?.users?.nodes.some((u: any) => u.username === 'dupeuser')).toBe(true);
});
