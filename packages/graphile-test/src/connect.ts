import { getConnections as getPgConnections } from 'pgsql-test';
import { GraphQLTest } from './graphile-test';

import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { SeedAdapter } from 'pgsql-test/seed/types';
import type { DocumentNode, GraphQLError } from 'graphql';

export interface GetConnectionsInput {
  useRoot?: boolean;
  schemas: string[];
  authRole?: string;
}

export interface GraphQLQueryOptions<TVariables = Record<string, any>> {
  query: string | DocumentNode;
  variables?: TVariables;
  commit?: boolean;
  reqOptions?: Record<string, any>;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: readonly GraphQLError[];
}

export type GraphQLQueryFn = <TResult = any, TVariables = Record<string, any>>(
  opts: GraphQLQueryOptions<TVariables>
) => Promise<GraphQLResponse<TResult>>;

export type GraphQLQueryFnPos = <TResult = any, TVariables = Record<string, any>>(
  query: string | DocumentNode,
  variables?: TVariables,
  commit?: boolean,
  reqOptions?: Record<string, any>
) => Promise<GraphQLResponse<TResult>>;

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
  queryPositional: GraphQLQueryFnPos;
}> => {
  const conn: GetConnectionResult = await getPgConnections(input, seedAdapters);
  const { pg, db, teardown: dbTeardown } = conn;

  const gqlContext = GraphQLTest(input, conn);

  await gqlContext.setup();

  const teardown = async () => {
    await gqlContext.teardown();
    await dbTeardown();
  };

  const query: GraphQLQueryFn = (opts) => gqlContext.query(opts);

  const queryPositional: GraphQLQueryFnPos = (query, variables, commit, reqOptions) =>
    gqlContext.query({
      query,
      variables,
      commit,
      reqOptions
    });

  return {
    pg,
    db,
    teardown,
    query,
    queryPositional
  };
};
