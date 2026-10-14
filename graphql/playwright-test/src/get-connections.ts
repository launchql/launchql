import { getEnvOptions } from '@constructive-io/graphql-env';
import {
  type GraphQLQueryOptions,
  type GraphQLResponse,
  GraphQLTest} from '@constructive-io/graphql-test';
import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import { getConnections as getPgConnections } from 'pgsql-test';
import type { SeedAdapter } from 'pgsql-test/seed/types';

import { createScopedTestServer, createTestServer } from './server';
import type {
  GetConnectionsWithServerInput,
  GetConnectionsWithServerObjectResult,
  GetConnectionsWithServerResult} from './types';

/**
 * Core unwrapping utility - throws on GraphQL errors
 */
const unwrap = <T>(res: GraphQLResponse<T>): T => {
  if (res.errors?.length) {
    throw new Error(JSON.stringify(res.errors, null, 2));
  }
  if (!res.data) {
    throw new Error('No data returned from GraphQL query');
  }
  return res.data;
};

/**
 * Base connection setup with HTTP server - shared across all variants
 */
const createConnectionsWithServerBase = async (
  input: GetConnectionsWithServerInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
) => {
  // Get database connections using pgsql-test
  const conn: GetConnectionResult = await getPgConnections(input, seedAdapters);
  const { pg, db, teardown: dbTeardown } = conn;

  // Set up GraphQL test context for direct queries
  const gqlContext = GraphQLTest(input, conn);
  await gqlContext.setup();

  // Build options for the HTTP server. Merge any user-provided server.api
  // options (used by the production scoped server) with the convenience
  // properties (schemas, authRole).
  const serverOpts = getEnvOptions({
    pg: pg.config,
    api: {
      ...input.server?.api,
      exposedSchemas: input.schemas,
      ...(input.authRole && { anonRole: input.authRole, roleName: input.authRole })
    }
  });

  // Start the HTTP server. Suites default to the single-tenant dev server;
  // suites exercising the real routing plane opt into the production
  // scoped-routing server with `server.useRouting: true`.
  const useRouting = input.server?.useRouting ?? false;
  const server = useRouting
    ? await createScopedTestServer(serverOpts, input.server)
    : await createTestServer(serverOpts, input.server);

  // Combined teardown function
  const teardown = async () => {
    await server.stop();
    await gqlContext.teardown();
    await dbTeardown();
  };

  // Query functions
  const baseQuery = (opts: GraphQLQueryOptions) => gqlContext.query(opts);
  const baseQueryPositional = (query: any, variables?: any, commit?: boolean, reqOptions?: any) =>
    gqlContext.query({ query, variables, commit, reqOptions });

  return {
    pg,
    db,
    server,
    teardown,
    baseQuery,
    baseQueryPositional
  };
};

/**
 * Creates connections with an HTTP server for Playwright testing (positional API)
 * 
 * This is the main entry point for Playwright tests. It:
 * 1. Creates an isolated test database
 * 2. Starts an HTTP server with the GraphQL API
 * 3. Returns the server URL for Playwright to connect to
 * 4. Provides a teardown function to clean up everything
 * 
 * @example
 * ```typescript
 * const { server, teardown } = await getConnectionsWithServer({
 *   schemas: ['public', 'app_public'],
 *   authRole: 'anonymous'
 * });
 * 
 * // Use server.graphqlUrl in Playwright tests
 * await page.goto(server.url);
 * 
 * // Clean up after tests
 * await teardown();
 * ```
 */
export const getConnectionsWithServer = async (
  input: GetConnectionsWithServerInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<GetConnectionsWithServerResult> => {
  const { pg, db, server, teardown, baseQueryPositional } = 
    await createConnectionsWithServerBase(input, seedAdapters);

  return {
    pg,
    db,
    server,
    teardown,
    query: baseQueryPositional
  };
};

/**
 * Creates connections with an HTTP server for Playwright testing (object API)
 * 
 * Same as getConnectionsWithServer but uses object-based query API.
 */
export const getConnectionsWithServerObject = async (
  input: GetConnectionsWithServerInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<GetConnectionsWithServerObjectResult> => {
  const { pg, db, server, teardown, baseQuery } = 
    await createConnectionsWithServerBase(input, seedAdapters);

  return {
    pg,
    db,
    server,
    teardown,
    query: baseQuery
  };
};

/**
 * Creates connections with an HTTP server and unwrapped query responses
 * 
 * Same as getConnectionsWithServer but throws on GraphQL errors instead of
 * returning them in the response.
 */
export const getConnectionsWithServerUnwrapped = async (
  input: GetConnectionsWithServerInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<Omit<GetConnectionsWithServerResult, 'query'> & { query: (query: any, variables?: any, commit?: boolean, reqOptions?: any) => Promise<any> }> => {
  const { pg, db, server, teardown, baseQueryPositional } = 
    await createConnectionsWithServerBase(input, seedAdapters);

  const query = async (query: any, variables?: any, commit?: boolean, reqOptions?: any) =>
    unwrap(await baseQueryPositional(query, variables, commit, reqOptions));

  return {
    pg,
    db,
    server,
    teardown,
    query
  };
};
