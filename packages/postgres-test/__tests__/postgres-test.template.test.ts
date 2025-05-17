import { getPgEnvOptions, PgConfig } from '@launchql/types';
import path from 'path';

import {
  getConnection,
  closeConnection,
  Connection
} from '../src';
import { PgTestClient } from '../src/client';
import { DbAdmin } from '../src/admin';

const sql = (file: string) => path.resolve(__dirname, '../sql', file);

const TEMPLATE_NAME = 'test_template';
const TEST_DB_BASE = 'postgres_test_db_template';

function setupTemplateDB(config: PgConfig, template: string): void {
  const admin = new DbAdmin(config);
  try {
    admin.drop(config.database);
  } catch {}
  admin.create(config.database);
  admin.loadSql(sql('test.sql'), config.database);
  admin.loadSql(sql('roles.sql'), config.database);
  admin.cleanupTemplate(template);
  admin.createTemplateFromBase(config.database, template);
  admin.drop(config.database);
}

const config = getPgEnvOptions({
    database: TEST_DB_BASE
});

beforeAll(() => {
  setupTemplateDB(config, TEMPLATE_NAME);
});

afterAll(() => {
  Connection.getManager().closeAll();
});

describe('Template Database Test', () => {
  let db: PgTestClient;

  afterEach(() => {
    if (db) closeConnection(db);
  });

  it('creates a test DB from a template', () => {
    db = getConnection({ template: TEMPLATE_NAME });
    expect(db).toBeDefined();
  });
});
