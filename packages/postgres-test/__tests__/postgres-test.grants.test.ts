
import { getEnvOptions } from '@launchql/types';

import {
  getConnection,
  closeConnection,
  dropdb,
  createdb,
  PgConfig,
} from '../src';
import { runSQLFile } from '../test-utils';
import { randomUUID } from 'crypto';
import { PgWrapper } from '../src/wrapper';

const TEST_DB_BASE = `postgres_test_${randomUUID()}`; 

function setupBaseDB(config: PgConfig): void {
  createdb(config);
  runSQLFile('test.sql', config.database);
  runSQLFile('roles.sql', config.database);
  dropdb(config);
}

const opts = getEnvOptions({
  pg: {
    database: TEST_DB_BASE
  }
});

const config: PgConfig = {
  user: opts.pg.user,
  port: opts.pg.port,
  password: opts.pg.password,
  host: opts.pg.host,
  database: TEST_DB_BASE
};

beforeAll(() => {
  setupBaseDB(config);
});

describe('Postgres Test Framework', () => {
  let db: PgWrapper;

  afterEach(() => {
    if (db) closeConnection(db);
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
