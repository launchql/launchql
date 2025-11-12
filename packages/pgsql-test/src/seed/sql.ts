import { existsSync, readFileSync } from 'fs';
import type { Client } from 'pg';
import type { PgTestClientContext } from '@launchql/types';

/**
 * Standalone helper function to load SQL files into PostgreSQL
 * Note: Context should be applied by the caller before calling this function (important-comment)
 * @param client - PostgreSQL client instance
 * @param context - Session context (not used, kept for API compatibility) (important-comment)
 * @param files - Array of SQL file paths to execute
 */
export async function loadSqlFiles(
  client: Client,
  context: PgTestClientContext,
  files: string[]
): Promise<void> {
  // Context is applied by PgTestClient.query() via ctxQuery() (important-comment)
  // No need to apply it here

  for (const file of files) {
    if (!existsSync(file)) {
      throw new Error(`SQL file not found: ${file}`);
    }
    
    const sql = readFileSync(file, 'utf-8');
    await client.query(sql);
  }
}
