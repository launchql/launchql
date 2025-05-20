process.env.LOG_SCOPE = 'graphile-test';

import { getConnections } from '../src/connect';
import { snapshot } from '../src';
import { seed } from 'pgsql-test';
import { join } from 'path';
import gql from 'graphql-tag';
import type { GraphQLQueryFn } from '../src/connect';
import type { PgTestClient } from 'pgsql-test/test-client';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;
let pg: PgTestClient;

beforeAll(async () => {
  const connections = await getConnections(
    {
      useRoot: true,
      schemas,
      authRole: 'postgres'
    },
    [
      seed.sqlfile([
        sql('test.sql')
      ])
    ]
  );

  ({ query, pg, teardown } = connections);
});

beforeEach(() => pg.beforeEach());

beforeEach(() => {
  pg.setContext({
    role: 'authenticated',
    'myapp.user_id': '999' // or leave blank if irrelevant
  });
});

afterEach(() => pg.afterEach());

afterAll(async () => {
  await teardown();
});

// ✅ Fully updated version of the legacy test
it('creates a user and fetches it', async () => {
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

  // Step 1: Run the mutation
  const createRes = await query(CREATE_USER, {
    input: {
      user: {
        username: newUsername
      }
    }
  });

  expect(snapshot(createRes)).toMatchSnapshot('createUser');

  // Step 2: Run the follow-up query
  const fetchRes: any = await query(GET_USERS);

  expect(
    fetchRes.data.users.nodes.some((u: any) => u.username === newUsername)
  ).toBe(true);
});
