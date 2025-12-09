process.env.LOG_SCOPE = 'graphile-test';

import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { snapshot } from '../src/utils';
import { getConnectionsUnwrapped } from '../src/get-connections';
import type { GraphQLQueryUnwrappedFn } from 'graphile-test';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryUnwrappedFn;
let db: PgTestClient;

beforeAll(async () => {
  const connections = await getConnectionsUnwrapped(
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

  ({ query, db, teardown } = connections);
});

beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());
afterAll(() => teardown());

it('creates a user and returns typed result', async () => {
  db.setContext({
    role: 'authenticated'
  });
    interface CreateUserVariables {
        input: {
            user: {
                username: string;
            };
        };
    }

    interface CreateUserResult {
        createUser: {
            user: {
                id: number;
                username: string;
            };
        };
    }

    const createUserMutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            user {
              id
              username
            }
          }
        }
    `;

    const variables: CreateUserVariables = {
      input: {
        user: {
          username: 'alice'
        }
      }
    };

    // Using positional API: query, variables, commit, reqOptions
    const result = await query<CreateUserResult, CreateUserVariables>(createUserMutation, variables);

    // Assertions - much cleaner since result is already unwrapped!
    expect(result).toBeDefined();
    expect(result.createUser).toBeDefined();
    expect(result.createUser.user.username).toBe('alice');
    expect(typeof result.createUser.user.id).toBe('number');

    // Optional snapshot for structure
    expect(snapshot(result)).toMatchSnapshot('create-user');
});

it('throws error when trying to create duplicate users due to unwrapped nature', async () => {
  db.setContext({
    role: 'authenticated'
  });

    interface CreateUserVariables {
        input: {
            user: {
                username: string;
            };
        };
    }

    interface CreateUserResult {
        createUser: {
            user: {
                id: number;
                username: string;
            };
        };
    }

    const createUserMutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            user {
              id
              username
            }
          }
        }
    `;

    const bobVariables: CreateUserVariables = {
      input: {
        user: {
          username: 'bob'
        }
      }
    };

    // First user creation should succeed - using positional API
    const firstResult = await query<CreateUserResult>(createUserMutation, bobVariables);

    expect(firstResult.createUser.user.username).toBe('bob');

    // Second user creation with same username should throw due to unwrapped nature
    // (assuming username has a unique constraint)
    await expect(
      query<CreateUserResult>(createUserMutation, bobVariables) // Same variables - should cause constraint violation
    ).rejects.toThrow(); // The unwrapped function will throw the GraphQL error as an exception
});