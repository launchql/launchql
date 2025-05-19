process.env.LOG_SCOPE='graphile-test';

import { getConnections } from '../src/connect';
import { snapshot } from '../src';
import { seed } from 'pgsql-test';
import { join } from 'path';
import gql from 'graphql-tag';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let graphQL: (fn: (query: (q: string, vars?: Record<string, any>) => Promise<any>) => Promise<void>) => Promise<void>;

beforeAll(async () => {
  ({ graphQL, teardown } = await getConnections({
    schemas,
    authRole: 'postgres'
  }, [
    seed.sqlfile([
      sql('test.sql')
    ])
  ]));
});

afterAll(async () => {
  await teardown();
});

it('creates a user and fetches it', async () => {
  await graphQL(async query => {
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

    // Run the mutation
    const newUsername = 'testuser1';
    // @ts-ignore
    const createRes = await query(CREATE_USER, {
      input: {
        user: {
          username: newUsername
        }
      }
    });

    expect(snapshot(createRes)).toMatchSnapshot('createUser');

    // Run the follow-up query
    // @ts-ignore
    const fetchRes = await query(GET_USERS);
    expect(fetchRes.data.users.nodes.some((u: any) => u.username === newUsername)).toBe(true);
  });
});
