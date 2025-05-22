import { getConnections as getPgConnections } from 'pgsql-test';
import { GraphQLTest } from './graphile-test';

import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { SeedAdapter } from 'pgsql-test/seed/types';
import type {
  GraphQLQueryOptions,
  GraphQLQueryUnwrappedFn,
  GraphQLQueryUnwrappedFnPos,
  GraphQLResponse
} from './types';

export interface GetConnectionsInput {
  useRoot?: boolean;
  schemas: string[];
  authRole?: string;
}

const unwrap = <T>(res: GraphQLResponse<T>): T => {
  if (res.errors?.length) {
    throw new Error(JSON.stringify(res.errors, null, 2));
  }
  if (!res.data) {
    throw new Error('No data returned from GraphQL query');
  }
  return res.data;
};

export const getConnectionsUnwrapped = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryUnwrappedFn;
  queryPositional: GraphQLQueryUnwrappedFnPos;
}> => {
  const conn: GetConnectionResult = await getPgConnections(input, seedAdapters);
  const { pg, db, teardown: dbTeardown } = conn;

  const gqlContext = GraphQLTest(input, conn);
  await gqlContext.setup();

  const teardown = async () => {
    await gqlContext.teardown();
    await dbTeardown();
  };

  const query: GraphQLQueryUnwrappedFn = async (opts) => unwrap(await gqlContext.query(opts));

  const queryPositional: GraphQLQueryUnwrappedFnPos = async (query, variables, commit, reqOptions) =>
    unwrap(await gqlContext.query({ query, variables, commit, reqOptions }));

  return {
    pg,
    db,
    teardown,
    query,
    queryPositional
  };
};
