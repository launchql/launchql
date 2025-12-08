process.env.LOG_SCOPE = 'pgsql-test';
import { randomUUID } from 'crypto';
import { resolve } from 'path';
import { PgConfig } from 'pg-env';

import { DbAdmin } from '../src/admin';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

const TEST_DB_NAME = `postgres_test_${randomUUID()}`;
const sqlPath = (file: string) => resolve(__dirname, '../sql', file);

/**
 * Optionally load seed SQL into the base template before forking connections.
 */
function setupBaseDatabase(config: PgConfig) {
  const admin = new DbAdmin(config);
  admin.loadSql(sqlPath('test.sql'), config.database);
}

beforeAll(async () => {
  // Create test DB and clients
  ({ db, pg, teardown } = await getConnections({
    pg: {
      database: TEST_DB_NAME
    }
  }));

  // Optionally preload schema/data before tests
  setupBaseDatabase(pg.config);
});

afterAll(async () => {
  await teardown(); // closes manager and drops DB if needed
});

describe('Database Setup', () => {
  it('has valid connection (pg)', async () => {
    const result = await pg.query('SELECT 1 AS ok');
    expect(result.rows[0].ok).toBe(1);
  });

  it('has valid connection (db)', async () => {
    const result = await db.query('SELECT 2 AS ok');
    expect(result.rows[0].ok).toBe(2);
  });
});
