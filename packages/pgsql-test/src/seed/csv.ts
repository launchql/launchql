import { createReadStream, existsSync } from 'fs';
import { pipeline } from 'node:stream/promises';
import { Client } from 'pg';
import { from as copyFrom, to as copyTo } from 'pg-copy-streams';
import { SeedAdapter, SeedContext } from './types';
import { PgTestClient } from '../test-client';
import { createWriteStream } from 'node:fs';

interface CsvSeedMap {
  [tableName: string]: string;
}

export function csv(tables: CsvSeedMap): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      for (const [table, filePath] of Object.entries(tables)) {
        if (!existsSync(filePath)) {
          throw new Error(`❌ CSV file not found: ${filePath}`);
        }
        console.log(`📥 Seeding "${table}" from ${filePath}`);
        await copyCsvIntoTable(ctx.pg, table, filePath);
      }
    }
  };
}

export async function copyCsvIntoTable(pg: PgTestClient, table: string, filePath: string): Promise<void> {
  const client: Client = pg.client;
  const stream = client.query(copyFrom(`COPY ${table} FROM STDIN WITH CSV HEADER`));
  const source = createReadStream(filePath);

  try {
    await pipeline(source, stream);
    console.log(`✅ Successfully seeded "${table}"`);
  } catch (err) {
    console.error(`❌ COPY failed for "${table}":`, err);
    throw err;
  }
}

export async function exportTableToCsv(pg: PgTestClient, table: string, filePath: string): Promise<void> {
  const client: Client = pg.client;
  const stream = client.query(copyTo(`COPY ${table} TO STDOUT WITH CSV HEADER`));
  const target = createWriteStream(filePath);

  try {
    await pipeline(stream, target);
    console.log(`✅ Exported "${table}" to ${filePath}`);
  } catch (err) {
    console.error(`❌ Failed to export "${table}":`, err);
    throw err;
  }
}