process.env.LOG_SCOPE = 'pgsql-test';

import { getConnections } from '../src/connect';
import { getRoleName } from '../src/roles';
import { PgTestClient } from '../src/test-client';

let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

describe('anonymous', () => {
  beforeEach(async () => {
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
  });

  it('runs under anonymous context', async () => {
    const result = await db.query('SELECT current_setting(\'role\', true) AS role');
    const expectedRole = getRoleName('anonymous');
    expect(result.rows[0].role).toBe(expectedRole);
  });
});

describe('authenticated', () => {
  beforeEach(async () => {
    const authRole = getRoleName('authenticated');
    db.setContext({
      role: authRole,
      'jwt.claims.user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      'jwt.claims.ip_address': '127.0.0.1',
      'jwt.claims.database_id': 'jwt.database_id',
      'jwt.claims.user_id': 'jwt.user_id'
    });
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
  });

  it('runs under authenticated context', async () => {
    const role = await db.query('SELECT current_setting(\'role\', true) AS role');
    const expectedRole = getRoleName('authenticated');
    expect(role.rows[0].role).toBe(expectedRole);
    const ip = await db.query('SELECT current_setting(\'jwt.claims.ip_address\', true) AS role');
    expect(ip.rows[0].role).toBe('127.0.0.1');
  });
});
