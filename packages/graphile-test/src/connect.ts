import { getConnections as getPgConnections } from 'pgsql-test';
import { GraphQLTest } from './graphile-test';
import type { GetConnectionResult } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { SeedAdapter } from 'pgsql-test/seed/types';

export interface GraphQLQueryFn {
  (query: string, variables?: Record<string, any>): Promise<any>;
}

export interface GraphQLTestContext {
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
  graphQL: (fn: (query: GraphQLQueryFn) => Promise<void>) => Promise<void>;
  graphQLQuery: (...args: any[]) => Promise<any>;
}

export interface GraphQLTestOptions {
  dbname: string;
  schemas: string[];
  authRole?: string;
}

export interface GetConnectionsInput {
  schemas: string[];
  authRole?: string;
}

/**
 * Combines PostgreSQL test setup with GraphQL test context
 */
export const getConnections = async (
  input: GetConnectionsInput,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  graphQL: GraphQLTestContext['graphQL'];
  graphQLQuery: GraphQLTestContext['graphQLQuery'];
}> => {
  const {
    pg,
    db,
    teardown: dbTeardown
  }: GetConnectionResult = await getPgConnections({}, seedAdapters);

  const gqlContext: GraphQLTestContext = GraphQLTest({
    dbname: db.client.database,
    schemas: input.schemas,
    authRole: input.authRole
  });

  await gqlContext.setup();

  const teardown = async () => {
    await gqlContext.teardown();
    await dbTeardown();
  };

  return {
    pg,
    db,
    teardown,
    graphQL: gqlContext.graphQL,
    graphQLQuery: gqlContext.graphQLQuery
  };
};

/**
 * Provides only the GraphQL testing utilities with setup/teardown
 */
export const getQuery = async (
  input: GraphQLTestOptions
): Promise<{
  teardown: () => Promise<void>;
  graphQL: GraphQLTestContext['graphQL'];
  graphQLQuery: GraphQLTestContext['graphQLQuery'];
}> => {
  const gqlContext: GraphQLTestContext = GraphQLTest(input);
  await gqlContext.setup();

  return {
    teardown: gqlContext.teardown,
    graphQL: gqlContext.graphQL,
    graphQLQuery: gqlContext.graphQLQuery
  };
};
