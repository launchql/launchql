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

// ✅ Basic mutation and query test
it('creates a user and fetches it', async () => {
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

  const newUsername = 'testuser1';

  const createRes = await query(CREATE_USER, {
    input: {
      user: {
        username: newUsername
      }
    }
  });

  expect(snapshot(createRes)).toMatchSnapshot('createUser');


  const fetchRes: any = await query(GET_USERS);

  expect(
    fetchRes.data.users.nodes.some((u: any) => u.username === newUsername)
  ).toBe(true);
});

