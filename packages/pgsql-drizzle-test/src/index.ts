/**
 * pgsql-drizzle-test
 * 
 * Drizzle ORM integration for pgsql-test that maintains context management for RLS testing.
 * 
 * This package solves the problem of using Drizzle with pgsql-test where context
 * (SET LOCAL statements for role and JWT claims) wasn't being applied because Drizzle
 * calls the underlying pg.Client directly, bypassing PgTestClient's ctxQuery() method.
 * 
 * ## Two Approaches Available:
 * 
 * ### Approach 1: Wrapper-based (default export)
 * Uses a DrizzleTestClient wrapper that intercepts queries.
 * 
 * @example
 * ```typescript
 * import { drizzle } from 'pgsql-drizzle-test';
 * import { getConnections } from 'pgsql-test';
 * 
 * const { db, teardown } = await getConnections();
 * const drizzleDb = drizzle(db);
 * 
 * // Set authentication context via helper methods
 * drizzleDb.$auth({ userId: '123' });
 * 
 * // All queries will include the context
 * const users = await drizzleDb.select().from(usersTable);
 * ```
 * 
 * ### Approach 2: Proxy-based (variation2)
 * Patches db.client.query() to work with standard Drizzle pattern.
 * 
 * @example
 * ```typescript
 * import { drizzle } from 'drizzle-orm/node-postgres';
 * import { getConnectionsWithProxy } from 'pgsql-drizzle-test/variation2';
 * 
 * const { db, teardown } = await getConnectionsWithProxy();
 * 
 * // Set context on db directly
 * db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });
 * 
 * // Use standard Drizzle pattern - no wrapper needed!
 * const drizzleDb = drizzle(db.client);
 * const users = await drizzleDb.select().from(usersTable);
 * ```
 */

// Approach 1: Wrapper-based (default)
export { drizzle, type DrizzleTestDatabase } from './drizzle';
export { DrizzleTestClient } from './drizzle-adapter';

// Approach 2: Proxy-based (variation2)
// Import as: import { getConnectionsWithProxy } from 'pgsql-drizzle-test/variation2';
export * as variation2 from './variation2';

// Re-export commonly used types from pgsql-test for convenience
export type { PgTestClient } from 'pgsql-test';
export { getConnections } from 'pgsql-test';
