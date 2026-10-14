import { getEnvOptions } from '@constructive-io/graphql-env';
import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import { getConnections as getPgConnections } from 'pgsql-test';
import type { SeedAdapter } from 'pgsql-test/seed/types';

import { createDevTestServer, createTestServer } from './server';
import { createQueryFn,createSuperTestAgent } from './supertest';
import type { GetConnectionsInput, GetConnectionsResult } from './types';

/**
 * Creates connections with an HTTP server for SuperTest testing
 * 
 * This is the main entry point for SuperTest-based GraphQL tests. It:
 * 1. Creates an isolated test database using pgsql-test
 * 2. Starts a real HTTP server using @constructive-io/graphql-server
 * 3. Returns a SuperTest agent and query function for making HTTP requests
 * 4. Provides a teardown function to clean up everything
 * 
 * @example
 * ```typescript
 * const { db, server, query, request, teardown } = await getConnections({
 *   schemas: ['public', 'app_public'],
 *   authRole: 'anonymous'
 * });
 * 
 * // Use the query function for GraphQL requests
 * const res = await query(`query { allUsers { nodes { id } } }`);
 * 
 * // Or use SuperTest directly for more control
 * const res = await request
 *   .post('/graphql')
 *   .set('Authorization', 'Bearer token')
 *   .send({ query: '{ currentUser { id } }' });
 * 
 * // Clean up after tests
 * await teardown();
 * ```
 */
export const getConnections = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<GetConnectionsResult> => {
  // Get database connections using pgsql-test
  const conn: GetConnectionResult = await getPgConnections(input, seedAdapters);
  const { pg, db, teardown: dbTeardown } = conn;

  // Build options for the HTTP server
  // Merge user-provided server.api options with convenience properties (schemas, authRole)
  const serverOpts = getEnvOptions({
    pg: pg.config,
    api: {
      // Start with user-provided api options from server.api
      ...input.server?.api,
      // Apply convenience properties (these take precedence)
      exposedSchemas: input.schemas,
      ...(input.authRole && { anonRole: input.authRole, roleName: input.authRole })
    },
    graphile: input.graphile
  });

  // Start the HTTP server. Suites default to the production scoped-routing
  // server; static/single-tenant suites opt into the dev server with
  // `server.useRouting: false`.
  const useRouting = input.server?.useRouting ?? true;
  const server = useRouting
    ? await createTestServer(serverOpts, input.server)
    : await createDevTestServer(serverOpts, input.server);

  // Create SuperTest agent
  const request = createSuperTestAgent(server);

  // Combined teardown function
  const teardown = async () => {
    await server.stop();
    await dbTeardown();
  };

  return {
    pg,
    db,
    server,
    request,
    query: createQueryFn(request),
    teardown
  };
};
