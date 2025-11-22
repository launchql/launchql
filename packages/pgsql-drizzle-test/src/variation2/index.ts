import { getConnections as originalGetConnections, GetConnectionOpts, SeedAdapter } from 'pgsql-test';
import { proxyClientQuery } from './proxy-client';

/**
 * Enhanced version of getConnections that patches db.client.query to automatically
 * apply context before each query. This allows ORMs like Drizzle to work with the
 * standard pattern: drizzle(db.client) while still respecting context management.
 * 
 * This is "variation 2" - an alternative approach to the wrapper-based method.
 * 
 * @param cn - Connection options
 * @param seedAdapters - Optional seed adapters for test data
 * @returns Connection objects with patched db.client
 * 
 * @example
 * ```typescript
 * import { drizzle } from 'drizzle-orm/node-postgres';
 * import { getConnectionsWithProxy } from 'pgsql-drizzle-test/variation2';
 * 
 * let db: PgTestClient;
 * let pg: PgTestClient;
 * let teardown: () => Promise<void>;
 * 
 * beforeAll(async () => {
 *   ({ pg, db, teardown } = await getConnectionsWithProxy());
 * });
 * 
 * afterAll(async () => {
 *   await teardown();
 * });
 * 
 * beforeEach(async () => {
 *   await db.beforeEach();
 * });
 * 
 * afterEach(async () => {
 *   await db.afterEach();
 * });
 * 
 * describe('your tests', () => {
 *   it('should work with standard Drizzle pattern', async () => {
 *     // Set context on db
 *     db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '1' });
 *     
 *     // Use standard Drizzle pattern - no wrapper needed!
 *     const drizzleDb = drizzle(db.client);
 *     const result = await drizzleDb.select().from(users);
 *     
 *     // Context is automatically applied before each query
 *     expect(result).toBeDefined();
 *   });
 * });
 * ```
 */
export async function getConnectionsWithProxy(
  cn?: GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
) {
  // Get the original connections
  const connections = await originalGetConnections(cn, seedAdapters);
  
  // Patch db.client.query to automatically call ctxQuery()
  proxyClientQuery(connections.db);
  
  // Note: We only patch db.client, not pg.client
  // pg is for superuser/seeding operations and should bypass RLS
  
  return connections;
}

// Re-export the proxy function for advanced use cases
export { proxyClientQuery } from './proxy-client';

// Re-export types from pgsql-test for convenience
export type { PgTestClient, GetConnectionOpts, SeedAdapter } from 'pgsql-test';
