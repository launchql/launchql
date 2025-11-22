/**
 * pgsql-drizzle-test
 * 
 * Drizzle ORM integration for pgsql-test that maintains context management for RLS testing.
 * 
 * This package solves the problem of using Drizzle with pgsql-test where context
 * (SET LOCAL statements for role and JWT claims) wasn't being applied because Drizzle
 * calls the underlying pg.Client directly, bypassing PgTestClient's ctxQuery() method.
 * 
 * @example
 * ```typescript
 * import { drizzle } from 'pgsql-drizzle-test';
 * import { getConnections } from 'pgsql-test';
 * 
 * const { db, teardown } = await getConnections();
 * const drizzleDb = drizzle(db);
 * 
 * // Set authentication context
 * drizzleDb.$auth({ userId: '123' });
 * 
 * // All queries will include the context
 * const users = await drizzleDb.select().from(usersTable);
 * ```
 */

export { drizzle, type DrizzleTestDatabase } from './drizzle';
export { DrizzleTestClient } from './drizzle-adapter';

// Re-export commonly used types from pgsql-test for convenience
export type { PgTestClient } from 'pgsql-test';
export { getConnections } from 'pgsql-test';
