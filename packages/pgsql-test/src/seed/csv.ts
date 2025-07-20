import { pipeline } from 'node:stream/promises';

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

export async function copyCsvIntoTable(pg: PgTestClient, table: string, filePath: string): Promise<void> {
  const client: Client = pg.client;
  const stream = client.query(copyFrom(`COPY ${table} FROM STDIN WITH CSV HEADER`));
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
