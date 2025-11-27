process.env.LOG_SCOPE = 'graphile-test';

import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { snapshot } from '../src/utils';
import { getConnectionsObjectUnwrapped } from '../src/get-connections';
import type { GraphQLQueryUnwrappedFnObj } from 'graphile-test';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryUnwrappedFnObj;
let db: PgTestClient;

beforeAll(async () => {
  const connections = await getConnectionsObjectUnwrapped(
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

    const result = await query<CreateUserResult, CreateUserVariables>({
      query: `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            user {
              id
              username
            }
          }
        }
      `,
      variables: {
        input: {
          user: {
            username: 'alice'
          }
        }
      }
    });

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

    // First user creation should succeed
    const firstResult = await query<CreateUserResult, CreateUserVariables>({
      query: createUserMutation,
      variables: {
        input: {
          user: {
            username: 'bob'
          }
        }
      }
    });

    expect(firstResult.createUser.user.username).toBe('bob');

    // Second user creation with same username should throw due to unwrapped nature
    // (assuming username has a unique constraint)
    await expect(
      query<CreateUserResult, CreateUserVariables>({
        query: createUserMutation,
        variables: {
          input: {
            user: {
              username: 'bob' // Same username - should cause constraint violation
            }
          }
        }
      })
    ).rejects.toThrow(); // The unwrapped function will throw the GraphQL error as an exception
});