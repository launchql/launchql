import { pipeline } from 'node:stream/promises';

import { Logger } from '@launchql/logger';
import { parse } from 'csv-parse';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { Client } from 'pg';
import { from as copyFrom, to as copyTo } from 'pg-copy-streams';

const log = new Logger('csv');

export type CsvSeedMap = Record<string, string>;

export async function loadCsvMap(
  client: Client,
  ctxQuery: () => Promise<void>,
  tables: CsvSeedMap
): Promise<void> {
  for (const [table, filePath] of Object.entries(tables)) {
    if (!existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }
    log.info(`📥 Seeding "${table}" from ${filePath}`);
    await copyCsvIntoTable(client, ctxQuery, table, filePath);
  }
}

async function parseCsvHeader(filePath: string): Promise<string[]> {
  const file = createReadStream(filePath);
  const parser = parse({
    bom: true,
    to_line: 1,
    skip_empty_lines: true,
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
      
      if (row.length === 0) {
        cleanup(new Error('CSV header has no columns'));
        return;
      }
      
      cleanup();
      resolve(row);
    });

    parser.on('error', cleanup);
    file.on('error', cleanup);

    file.pipe(parser);
  });
}

function quoteIdentifier(identifier: string): string {
  const parts = identifier.split('.');
  return parts.map(part => `"${part.replace(/"/g, '""')}"`).join('.');
}

export async function copyCsvIntoTable(
  client: Client,
  ctxQuery: () => Promise<void>,
  table: string,
  filePath: string
): Promise<void> {
  await ctxQuery();
  
  const columns = await parseCsvHeader(filePath);
  
  const quotedTable = quoteIdentifier(table);
  const quotedColumns = columns.map(col => `"${col.replace(/"/g, '""')}"`);
  const columnList = quotedColumns.join(', ');
  const copyCommand = `COPY ${quotedTable} (${columnList}) FROM STDIN WITH CSV HEADER`;
  
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

export async function exportTableToCsv(
  client: Client,
  table: string,
  filePath: string
): Promise<void> {
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
