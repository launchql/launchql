import { PgTestClient } from 'pgsql-test';

/**
 * Patches the db.client.query method to automatically apply context before each query.
 * This allows ORMs like Drizzle to work with the standard pattern: drizzle(db.client)
 * while still respecting PgTestClient's context management (setContext, auth).
 * 
 * Note: This implementation intentionally does NOT call db.ctxQuery() to avoid infinite
 * recursion (since ctxQuery() itself calls client.query()). Instead, we directly execute
 * the ctxStmts using the original query method, which achieves the same result.
 * 
 * @param db - The PgTestClient instance to patch
 * 
 * @example
 * ```typescript
 * const { db, pg, teardown } = await getConnections();
 * proxyClientQuery(db);
 * 
 * // Now you can use standard Drizzle pattern
 * db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '1' });
 * const drizzleDb = drizzle(db.client);
 * await drizzleDb.select().from(users);  // Context is automatically applied
 * ```
 */
export function proxyClientQuery(db: PgTestClient): void {
  const clientAny = db.client as any;
  
  // Capture the original query method with proper binding
  const originalQuery = clientAny.query.bind(clientAny);
  
  // Replace with a version that applies context before each query
  clientAny.query = async (...args: any[]) => {
    // Execute SET LOCAL statements directly using originalQuery
    // We access ctxStmts directly to avoid infinite recursion
    // (calling db.ctxQuery() would call client.query() which would call this function again)
    const ctxStmts = (db as any).ctxStmts as string | undefined;
    if (ctxStmts) {
      await originalQuery(ctxStmts);
    }
    
    // Execute the actual query
    return originalQuery(...args);
  };
}
