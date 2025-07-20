import { SeedAdapter, SeedContext } from './types';

interface JsonSeedMap {
  [table: string]: Record<string, any>[];
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
