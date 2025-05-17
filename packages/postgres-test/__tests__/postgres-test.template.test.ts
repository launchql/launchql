import { getEnvOptions } from '@launchql/types';
import path from 'path';
import fs from 'fs';

import {
  getConnection,
  closeConnection,
  dropdb,
  PgConfig,
  run,
  createTemplateFromBase,
  cleanupTemplateDatabase
} from '../src';
import { PgWrapper } from '../src/wrapper';

const TEMPLATE_NAME = 'test_template';
const TEST_DB_BASE = 'postgres_test_db_template';

function runSQLFile(file: string, database: string): void {
  const filePath = path.resolve(__dirname, '../sql', file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing SQL file: ${filePath}`);
  }
  run(`psql -f ${filePath} ${database}`);
}

function setupTemplateDB(config: PgConfig, template: string): void {
  try {
    dropdb(config);
  } catch {}
  run(`createdb ${config.database}`);
  runSQLFile('test.sql', config.database);
  runSQLFile('roles.sql', config.database);
  cleanupTemplateDatabase(config, template);
  createTemplateFromBase(config, config.database, template);
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
  setupTemplateDB({
    user: opts.pg.user,
    port: opts.pg.port,
    password: opts.pg.password,
    host: opts.pg.host,
    database: TEST_DB_BASE
  }, TEMPLATE_NAME);
});

describe('Template Database Test', () => {
  let db: PgWrapper;

  afterEach(() => {
    if (db) closeConnection(db);
  });

  it('creates a test DB from a template', () => {
    db = getConnection({ template: TEMPLATE_NAME });
    expect(db).toBeDefined();
  });
});
