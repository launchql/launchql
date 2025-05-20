import { getConnections as getPgConnections } from 'pgsql-test';
import { GraphQLTest } from './graphile-test';
import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { SeedAdapter } from 'pgsql-test/seed/types';
import type { DocumentNode, ExecutionResult } from 'graphql';

export type GraphQLQueryFn<T = ExecutionResult> = (
  query: string | DocumentNode,
  variables?: Record<string, any>,
  commit?: boolean,
  reqOptions?: Record<string, any>
) => Promise<T>;
export interface GetConnectionsInput {
  useRoot?: boolean;
  schemas: string[];
  authRole?: string;
}

/**
 * Combines PostgreSQL test setup with GraphQL test context
 */
export const getConnections = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFn;
}> => {
  
  const conn: GetConnectionResult = await getPgConnections(input, seedAdapters);
  const { pg, db, teardown: dbTeardown } = conn;

  const gqlContext = GraphQLTest(input, conn);
  
  await gqlContext.setup();

  const teardown = async () => {
    await gqlContext.teardown();
    await dbTeardown();
  };

  const query: GraphQLQueryFn = (query, variables, commit, reqOptions) =>
    gqlContext.query({ query, variables, commit, reqOptions });

  return {
    pg,
    db,
    teardown,
    query
  };
};
