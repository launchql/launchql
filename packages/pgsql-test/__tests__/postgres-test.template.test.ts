import path from 'path';
import { randomUUID } from 'crypto';
import { getPgEnvOptions, PgConfig } from '@launchql/types';

import { PgTestClient } from '../src/test-client';
import { DbAdmin } from '../src/admin';
import { getConnections } from '../src/connect';

const sql = (file: string) => path.resolve(__dirname, '../sql', file);

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

const TEMPLATE_NAME = 'test_template';
const SEED_DB_TO_CREATE_TEMPLATE = `postgres_test_${randomUUID()}`;

/**
 * Load SQL and create a reusable template database.
 */
function setupTemplateDatabase(): void {
  const templateConfig = getPgEnvOptions({
    database: SEED_DB_TO_CREATE_TEMPLATE
  });

  const admin = new DbAdmin(templateConfig);
  try {
    admin.drop(SEED_DB_TO_CREATE_TEMPLATE);
  } catch { }
  admin.create(SEED_DB_TO_CREATE_TEMPLATE);

  // Load schema/data into base DB
  admin.loadSql(sql('test.sql'), SEED_DB_TO_CREATE_TEMPLATE);
  admin.loadSql(sql('roles.sql'), SEED_DB_TO_CREATE_TEMPLATE);
  admin.cleanupTemplate(TEMPLATE_NAME);
  admin.createTemplateFromBase(SEED_DB_TO_CREATE_TEMPLATE, TEMPLATE_NAME);
  admin.drop(SEED_DB_TO_CREATE_TEMPLATE);
}

beforeAll(async () => {
  // Step 1: Spin up a base DB client to set up the template
  setupTemplateDatabase();

  // // Step 2: Spin up a new DB from that template for test use
  ({ db, pg, teardown } = await getConnections({}, {
    template: TEMPLATE_NAME
  }));

});

afterAll(async () => {
  await teardown(); // Cleans up all connections via PgTestConnector
});

describe('Template Database Test', () => {
  it('uses a database created from the template', async () => {
    const res = await db.query('SELECT 1 AS ok');
    expect(res.rows[0].ok).toBe(1);
  });
});
