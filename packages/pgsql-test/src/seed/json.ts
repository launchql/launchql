import type { Client } from 'pg';
import { SeedAdapter, SeedContext } from './types';
export interface JsonSeedMap {
  [table: string]: Record<string, any>[];
}

/**
 * Standalone helper function to insert JSON data into PostgreSQL tables
 * @param client - PostgreSQL client instance
 * @param data - Map of table names to arrays of row objects
 */
export async function insertJson(
  client: Client,
  data: JsonSeedMap
): Promise<void> {

  for (const [table, rows] of Object.entries(data)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    for (const row of rows) {
      const values = columns.map((c) => row[c]);
      await client.query(sql, values);
    }
  }
}

export function json(data: JsonSeedMap): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      const { pg } = ctx;

      for (const [table, rows] of Object.entries(data)) {
        if (!Array.isArray(rows) || rows.length === 0) continue;

        const columns = Object.keys(rows[0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

        for (const row of rows) {
          const values = columns.map((c) => row[c]);
          await pg.query(sql, values);
        }
      }
    }
  };
}
