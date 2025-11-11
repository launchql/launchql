import { pipeline } from 'node:stream/promises';

import { Logger } from '@launchql/logger';
import { parse } from 'csv-parse';
import { createReadStream, createWriteStream,existsSync } from 'fs';
import { Client } from 'pg';
import { from as copyFrom, to as copyTo } from 'pg-copy-streams';

import { PgTestClient } from '../test-client';
import { SeedAdapter, SeedContext } from './types';

const log = new Logger('csv');

const VALID_IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

interface CsvSeedMap {
  [tableName: string]: string;
}

export function csv(tables: CsvSeedMap): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      for (const [table, filePath] of Object.entries(tables)) {
        if (!existsSync(filePath)) {
          throw new Error(`CSV file not found: ${filePath}`);
        }
        log.info(`📥 Seeding "${table}" from ${filePath}`);
        await copyCsvIntoTable(ctx.pg, table, filePath);
      }
    }
  };
}

async function parseCsvHeader(filePath: string): Promise<string[]> {
  const file = createReadStream(filePath);
  const parser = parse({
    bom: true,
    to_line: 1,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  });

  return new Promise<string[]>((resolve, reject) => {
    const cleanup = (err?: unknown) => {
      parser.destroy();
      file.destroy();
      if (err) reject(err);
    };

    parser.on('readable', () => {
      const row = parser.read() as string[] | null;
      if (!row) return;
      try {
        const cols = row.map((c) => {
          const cleaned = c.trim().replace(/\s+/g, '_').toLowerCase();
          if (!VALID_IDENTIFIER.test(cleaned)) {
            throw new Error(
              `Invalid column "${c}" → "${cleaned}". Must match /^[a-z_][a-z0-9_]*$/.`
            );
          }
          return cleaned;
        });
        
        if (cols.length === 0) {
          throw new Error('CSV header has no columns');
        }
        
        cleanup();
        resolve(cols);
      } catch (e) {
        cleanup(e);
      }
    });

    parser.on('error', cleanup);
    file.on('error', cleanup);

    file.pipe(parser);
  });
}

export async function copyCsvIntoTable(pg: PgTestClient, table: string, filePath: string): Promise<void> {
  const client: Client = pg.client;
  
  const columns = await parseCsvHeader(filePath);
  
  const columnList = columns.join(', ');
  const copyCommand = `COPY ${table} (${columnList}) FROM STDIN WITH CSV HEADER`;
  
  log.info(`Using columns: ${columnList}`);
  
  const stream = client.query(copyFrom(copyCommand));
  const source = createReadStream(filePath);

  try {
    await pipeline(source, stream);
    log.success(`✅ Successfully seeded "${table}"`);
  } catch (err) {
    log.error(`❌ COPY failed for "${table}": ${(err as Error).message}`);
    throw err;
  }
}

export async function exportTableToCsv(pg: PgTestClient, table: string, filePath: string): Promise<void> {
  const client: Client = pg.client;
  const stream = client.query(copyTo(`COPY ${table} TO STDOUT WITH CSV HEADER`));
  const target = createWriteStream(filePath);

  try {
    await pipeline(stream, target);
    log.success(`✅ Exported "${table}" to ${filePath}`);
  } catch (err) {
    log.error(`❌ Failed to export "${table}": ${(err as Error).message}`);
    throw err;
  }
}
