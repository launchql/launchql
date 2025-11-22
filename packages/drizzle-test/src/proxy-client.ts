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
  // Note: This is NOT async to preserve synchronous stream return for pg-copy-streams
  clientAny.query = (...args: any[]) => {
    const [first] = args;
    
    // Detect pg-copy-streams usage (COPY FROM/TO operations)
    // These need to return a stream synchronously, not a Promise
    const isCopyStream =
      first &&
      typeof first === 'object' &&
      typeof (first as any).submit === 'function' &&
      // Check for stream internals (pg-copy-streams objects have these)
      ((first as any)._readableState || (first as any)._writableState);
    
    if (isCopyStream) {
      // For COPY operations, return the stream synchronously without touching context
      // This is necessary for pg-copy-streams to work with pipeline()
      return originalQuery(...args);
    }
    
    // Detect transaction control commands (BEGIN, COMMIT, ROLLBACK, SAVEPOINT)
    // These should not have context injected to avoid "current transaction is aborted" errors
    if (typeof first === 'string') {
      const sql = first.trim().toUpperCase();
      
      const isTxCommand =
        sql === 'BEGIN' ||
        sql === 'BEGIN;' ||
        sql === 'COMMIT' ||
        sql === 'COMMIT;' ||
        sql === 'ROLLBACK' ||
        sql === 'ROLLBACK;' ||
        sql.startsWith('ROLLBACK TO SAVEPOINT') ||
        sql.startsWith('SAVEPOINT') ||
        sql.startsWith('RELEASE SAVEPOINT');
      
      if (isTxCommand) {
        // For transaction control, execute without context injection
        return originalQuery(...args);
      }
    }
    
    // For normal queries (Drizzle ORM), apply context before executing
    const ctxStmts = (db as any).ctxStmts as string | undefined;
    if (!ctxStmts) {
      // No context to apply, just delegate
      return originalQuery(...args);
    }
    
    // Execute SET LOCAL statements first, then the actual query
    // Return a Promise for Drizzle's async query pattern
    const runWithContext = async () => {
      await originalQuery(ctxStmts);
      return originalQuery(...args);
    };
    
    return runWithContext();
  };
}
