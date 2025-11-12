import { existsSync, readFileSync } from 'fs';
import type { Client } from 'pg';

/**
 * Standalone helper function to load SQL files into PostgreSQL
 * @param client - PostgreSQL client instance
 * @param files - Array of SQL file paths to execute
 */
export async function loadSqlFiles(
  client: Client,
  files: string[]
): Promise<void> {
  for (const file of files) {
    if (!existsSync(file)) {
      throw new Error(`SQL file not found: ${file}`);
    }
    
    const sql = readFileSync(file, 'utf-8');
    await client.query(sql);
  }
}
