import { Client } from 'pg';

export type JsonSeedMap = Record<string, Record<string, any>[]>;

function quoteIdentifier(identifier: string): string {
  const parts = identifier.split('.');
  return parts.map(part => `"${part.replace(/"/g, '""')}"`).join('.');
}

export async function insertJson(
  client: Client,
  ctxQuery: () => Promise<void>,
  data: JsonSeedMap
): Promise<void> {
  await ctxQuery();

  for (const [table, rows] of Object.entries(data)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const quotedTable = quoteIdentifier(table);
    const quotedColumns = columns.map(c => `"${c.replace(/"/g, '""')}"`).join(', ');
    const sql = `INSERT INTO ${quotedTable} (${quotedColumns}) VALUES (${placeholders})`;

    for (const row of rows) {
      const values = columns.map((c) => row[c]);
      await client.query(sql, values);
    }
  }
}
