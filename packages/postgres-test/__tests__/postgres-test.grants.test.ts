import { getPgEnvOptions, PgConfig } from '@launchql/types';

import {
  getConnection,
  Connection,
} from '../src';
import { randomUUID } from 'crypto';
import { PgTestClient } from '../src/test-client';
import { DbAdmin } from '../src/admin';
import { resolve } from 'path';

const sql = (file: string) => resolve(__dirname, '../sql', file);

const TEST_DB_BASE = `postgres_test_${randomUUID()}`; 

function setupBaseDB(config: PgConfig): void {
  const admin = new DbAdmin(config);
  admin.create(config.database)
  admin.loadSql(sql('test.sql'), config.database);
  admin.loadSql(sql('roles.sql'), config.database);
  admin.drop(config.database);
}

const config = getPgEnvOptions({
    database: TEST_DB_BASE
});

beforeAll(() => {
  setupBaseDB(config);
});

afterAll(() => {
  Connection.getManager().closeAll();
});


describe('Postgres Test Framework', () => {
  let db: PgTestClient;

  afterEach(() => {
    // if (db) closeConnection(db);
  });

  it('creates a test DB with hot mode (FAST_TEST)', () => {
    db = getConnection({ hot: true, extensions: ['uuid-ossp'] });
    expect(db).toBeDefined();
  });

  it('creates a test DB from scratch (default)', () => {
    db = getConnection({});
    expect(db).toBeDefined();
  });
});
