process.env.LOG_SCOPE = 'graphile-test';

import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { snapshot } from '../src/utils';
import { getConnections } from '../src/get-connections';
import type { GraphQLQueryFn } from 'graphile-test';

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
    const result = await query<CreateUserResult>(createUserMutation, variables);

    // Assertions - need to check .data since this is NOT unwrapped
    expect(result).toBeDefined();
    expect(result.errors).toBeUndefined(); // Check no errors
    expect(result.data).toBeDefined();
    expect(result.data!.createUser).toBeDefined();
    expect(result.data!.createUser.user.username).toBe('alice');
    expect(typeof result.data!.createUser.user.id).toBe('number');

    // Optional snapshot for structure
    expect(snapshot(result.data)).toMatchSnapshot('create-user');
});

it('handles errors gracefully with raw GraphQL responses', async () => {
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

    expect(firstResult.errors).toBeUndefined();
    expect(firstResult.data).toBeDefined();
    expect(firstResult.data!.createUser.user.username).toBe('bob');

    // Second user creation with same username should return errors (not throw)
    // (assuming username has a unique constraint)
    const secondResult = await query<CreateUserResult>(createUserMutation, bobVariables);

    // With raw responses, we get errors in the response instead of exceptions
    expect(secondResult.errors).toBeDefined();
    expect(secondResult.errors!.length).toBeGreaterThan(0);
    
    // Data might be partial (with null fields) rather than completely null
    expect(secondResult.data).toBeDefined();
    expect(secondResult.data!.createUser).toBeNull(); // The mutation result should be null
    
    // We can inspect the actual error message
    expect(secondResult.errors![0].message).toContain('duplicate'); // or whatever your constraint error says
});