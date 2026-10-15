import { getEnvOptions } from '@constructive-io/graphql-env';
import { randomBytes } from 'crypto';
import { pgCache } from 'pg-cache';
import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import { getConnections as getPgConnections } from 'pgsql-test';
import type { SeedAdapter } from 'pgsql-test/seed/types';
import type { PgTestClient } from 'pgsql-test/test-client';

import { createDevTestServer, createTestServer } from './server';
import { createQueryFn,createSuperTestAgent } from './supertest';
import type { GetConnectionsInput, GetConnectionsResult } from './types';


/**
 * The server connects as its own login, as in production: NOBYPASSRLS, a
 * member of the request roles only, never of administrator. It holds the
 * table/function privileges the seeded schemas grant it, so whatever RLS hides
 * from it stays hidden and a read that silently relied on BYPASSRLS fails here.
 */
const createServerLogin = async (pg: PgTestClient): Promise<{ user: string; password: string }> => {
  const user = `server_test_${randomBytes(6).toString('hex')}`;
  const password = randomBytes(18).toString('hex');
  await pg.query(`
    CREATE ROLE "${user}" LOGIN NOSUPERUSER NOBYPASSRLS PASSWORD '${password}' IN ROLE anonymous, authenticated;
    GRANT CONNECT ON DATABASE "${pg.config.database}" TO "${user}";
    DO $grant$
    DECLARE s text;
    BEGIN
      FOR s IN
        SELECT nspname FROM pg_namespace
        WHERE nspname NOT LIKE 'pg\\_%' AND nspname <> 'information_schema'
      LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', s, '${user}');
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO %I', s, '${user}');
        EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO %I', s, '${user}');
      END LOOP;
    END
    $grant$;
  `);
  // The seed's pg-cache entry must not hand the server the seeding connection.
  pgCache.delete(pg.config.database);
  await pgCache.waitForDisposals();
  return { user, password };
};

interface LiveSuite {
  server: { stop: () => Promise<void> };
  pg: GetConnectionResult['pg'];
  user: string;
}

const liveSuites = new Set<LiveSuite>();

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
  const login = await createServerLogin(pg);

  // Build options for the HTTP server
  // Merge user-provided server.api options with convenience properties (schemas, authRole)
  const serverOpts = getEnvOptions({
    pg: { ...pg.config, user: login.user, password: login.password },
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

  const suite: LiveSuite = { server, pg, user: login.user };
  liveSuites.add(suite);

  // pgsql-test's teardown closes every database this process opened, so the
  // first teardown also releases every other live suite's server and login.
  const teardown = async () => {
    for (const live of [...liveSuites]) {
      liveSuites.delete(live);
      await live.server.stop();
      await live.pg.query(`DROP OWNED BY "${live.user}"; DROP ROLE "${live.user}"`);
    }
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
