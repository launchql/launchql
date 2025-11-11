import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';

import { Logger } from '@launchql/logger';
import { createReadStream, createWriteStream,existsSync } from 'fs';
import { Client } from 'pg';
import { from as copyFrom, to as copyTo } from 'pg-copy-streams';

import { PgTestClient } from '../test-client';
import { SeedAdapter, SeedContext } from './types';

const log = new Logger('csv');

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

/**
 * Parse and validate CSV header columns
 */
async function parseCsvHeader(filePath: string): Promise<string[]> {
  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let headerLine: string | null = null;
  
  for await (const line of rl) {
    headerLine = line;
    break; // Only read the first line
  }

  rl.close();
  fileStream.destroy();

  if (!headerLine) {
    throw new Error('CSV file is empty or has no header');
  }

  if (headerLine.charCodeAt(0) === 0xFEFF) {
    headerLine = headerLine.slice(1);
  }

  const columns = headerLine.split(',').map(col => {
    let cleaned = col.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned.toLowerCase();
  });

  const validIdentifier = /^[a-z_][a-z0-9_]*$/;
  for (const col of columns) {
    if (!validIdentifier.test(col)) {
      throw new Error(`Invalid column name in CSV header: "${col}". Column names must be valid SQL identifiers.`);
    }
  }

  if (columns.length === 0) {
    throw new Error('CSV header has no columns');
  }

  return columns;
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
