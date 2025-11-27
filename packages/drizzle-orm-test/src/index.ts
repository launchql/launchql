/**
 * drizzle-orm-test
 * 
 * Drop-in replacement for pgsql-test that enables Drizzle ORM to work seamlessly
 * with context management and RLS testing.
 * 
 * This package patches db.client.query() to automatically apply context (SET LOCAL
 * statements for role and JWT claims) before each query, allowing you to use the
 * standard Drizzle pattern: drizzle(db.client) while maintaining full RLS support.
 * 
 * @example
 * ```typescript
 * import { drizzle } from 'drizzle-orm/node-postgres';
 * import { getConnections, PgTestClient } from 'drizzle-orm-test';
 * 
 * let db: PgTestClient;
 * let pg: PgTestClient;
 * let teardown: () => Promise<void>;
 * 
 * beforeAll(async () => {
 *   ({ pg, db, teardown } = await getConnections());
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
 *     // Set context on db (standard pgsql-test API)
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

import { GetConnectionOpts, getConnections as originalGetConnections, SeedAdapter } from 'pgsql-test';

import { proxyClientQuery } from './proxy-client';

/**
 * Drop-in replacement for pgsql-test's getConnections that patches db.client.query
 * to automatically apply context before each query. This allows ORMs like Drizzle
 * to work with the standard pattern: drizzle(db.client) while still respecting
 * context management (setContext, auth).
 * 
 * @param cn - Connection options
 * @param seedAdapters - Optional seed adapters for test data
 * @returns Connection objects with patched db.client
 */
export async function getConnections(
  cn?: GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
) {
  // Get the original connections from pgsql-test
  const connections = await originalGetConnections(cn, seedAdapters);
  
  // Patch db.client.query to automatically call ctxQuery()
  proxyClientQuery(connections.db);
  
  // Note: We only patch db.client, not pg.client
  // pg is for superuser/seeding operations and should bypass RLS
  
  return connections;
}

// Re-export PgTestClient and other types from pgsql-test for convenience
export type { GetConnectionOpts, SeedAdapter } from 'pgsql-test';
export { PgTestClient, snapshot } from 'pgsql-test';

// Re-export the proxy function for advanced use cases
export { proxyClientQuery } from './proxy-client';
