process.env.LOG_SCOPE = 'graphile-test';

import { getConnections } from '../src/get-connections';
import { snapshot } from '../src';
import { seed } from 'pgsql-test';
import { join, resolve } from 'path';
import gql from 'graphql-tag';
import type { GraphQLQueryFn, GraphQLQueryFnPos } from '../src/types';
import type { PgTestClient } from 'pgsql-test/test-client';
import { logDbSessionInfo } from '../test-utils/utils';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFnPos;
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
    ],
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

