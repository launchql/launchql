import { getPgEnvOptions, PgConfig } from '@launchql/types';

import {
  getConnection,
  closeConnection,
  Connection
} from '../src';
import { randomUUID } from 'crypto';
import { PgTestClient } from '../src/client';

const TEST_DB_BASE = `postgres_test_${randomUUID()}`; 

const config = getPgEnvOptions({
    database: TEST_DB_BASE
});

afterAll(() => {
  Connection.getManager().closeAll();
});

describe('Postgres Test Framework', () => {
  let db: PgTestClient;

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
