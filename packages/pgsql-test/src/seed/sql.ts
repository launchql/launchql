import { existsSync, readFileSync } from 'fs';
import type { Client } from 'pg';
import type { PgTextClientContext } from '@launchql/types';

import { generateContextStatements } from '../context-utils';

/**
 * Standalone helper function to load SQL files into PostgreSQL
 * @param client - PostgreSQL client instance
 * @param context - Session context to apply before loading
 * @param files - Array of SQL file paths to execute
 */
export async function loadSqlFiles(
  client: Client,
  context: PgTextClientContext,
  files: string[]
): Promise<void> {
  const ctxStmts = generateContextStatements(context);
  
  if (ctxStmts) {
    await client.query(ctxStmts);
  }

  for (const file of files) {
    if (!existsSync(file)) {
      throw new Error(`SQL file not found: ${file}`);
    }
    
    const sql = readFileSync(file, 'utf-8');
    await client.query(sql);
  }
}
