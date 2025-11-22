import type { AuthOptions } from '@launchql/types';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import type { PgTestClient } from 'pgsql-test';

import { DrizzleTestClient } from './drizzle-adapter';

/**
 * Type for the Drizzle database instance with test helper methods
 */
export type DrizzleTestDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = 
  NodePgDatabase<TSchema> & {
    $testClient: PgTestClient;
    $auth: (options?: AuthOptions) => void;
    $setContext: (ctx: Record<string, string | null>) => void;
    $clearContext: () => void;
    $publish: () => Promise<void>;
  };

/**
 * Create a Drizzle database instance from a PgTestClient.
 * This ensures all queries go through PgTestClient's context management (setContext, auth, etc.)
 *
 * @example
 * ```typescript
 * import { drizzle } from 'pgsql-drizzle-test';
 * import { getConnections } from 'pgsql-test';
 *
 * let db: PgTestClient;
 * let teardown: () => Promise<void>;
 *
 * beforeAll(async () => {
 *   ({ db, teardown } = await getConnections());
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
 *   it('should work with context', async () => {
 *     // Set authentication context
 *     db.auth({ userId: '123' });
 *
 *     // Create drizzle instance
 *     const drizzleDb = drizzle(db);
 *
 *     // All queries will include the context (SET LOCAL statements)
 *     const users = await drizzleDb.select().from(usersTable);
 *     expect(users).toBeDefined();
 *   });
 * });
 * ```
 *
 * @param testClient - The PgTestClient instance
 * @param config - Optional Drizzle configuration
 * @returns A Drizzle database instance that respects PgTestClient's context
 */
export function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(
  testClient: PgTestClient,
  config?: Parameters<typeof drizzleNodePg<TSchema>>[1]
): DrizzleTestDatabase<TSchema> {
  // Wrap the PgTestClient to make it compatible with Drizzle's expectations
  const adapter = new DrizzleTestClient(testClient);

  // Create the Drizzle instance using the wrapped client
  // We cast to 'any' because DrizzleTestClient implements the necessary query interface
  // but doesn't extend the full pg.Client class hierarchy
  const db = drizzleNodePg<TSchema>(adapter as any, config);

  // Attach helper methods for easy access to test client functionality
  return Object.assign(db, {
    /**
     * Get the underlying PgTestClient for advanced test operations
     */
    $testClient: testClient,

    /**
     * Set authentication context (shorthand for testClient.auth())
     * @example
     * drizzleDb.$auth({ userId: '123', role: 'authenticated' })
     */
    $auth: testClient.auth.bind(testClient),

    /**
     * Set custom context variables (shorthand for testClient.setContext())
     * @example
     * drizzleDb.$setContext({ 'jwt.claims.org_id': 'acme' })
     */
    $setContext: testClient.setContext.bind(testClient),

    /**
     * Clear all context (shorthand for testClient.clearContext())
     */
    $clearContext: testClient.clearContext.bind(testClient),

    /**
     * Publish changes to other connections (shorthand for testClient.publish())
     * Commits current transaction, making data visible to other connections,
     * then starts a fresh transaction.
     */
    $publish: testClient.publish.bind(testClient)
  }) as DrizzleTestDatabase<TSchema>;
}
