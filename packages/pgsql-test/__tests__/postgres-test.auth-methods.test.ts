process.env.LOG_SCOPE = 'pgsql-test';

import { getConnections } from '../src/connect';
import { getRoleName } from '../src/roles';
import { PgTestClient } from '../src/test-client';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  await pg.query(`
    CREATE TABLE IF NOT EXISTS test_users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT
    )
  `);
  
  // Grant permissions to authenticated role
  await pg.query(`GRANT ALL ON test_users TO authenticated`);
  await pg.query(`GRANT ALL ON SEQUENCE test_users_id_seq TO authenticated`);
});

afterAll(async () => {
  await pg.query(`DROP TABLE IF EXISTS test_users`);
  await teardown();
});

describe('auth() method', () => {
  beforeEach(async () => {
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
  });

  it('sets role and userId', async () => {
    const authRole = getRoleName('authenticated');
    db.auth({ role: authRole, userId: '12345' });

    const role = await db.query('SELECT current_setting(\'role\', true) AS role');
    expect(role.rows[0].role).toBe(authRole);

    const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('12345');
  });

  it('sets role with custom userIdKey', async () => {
    const authRole = getRoleName('authenticated');
    db.auth({ 
      role: authRole, 
      userId: 'custom-123',
      userIdKey: 'app.user.id'
    });

    const role = await db.query('SELECT current_setting(\'role\', true) AS role');
    expect(role.rows[0].role).toBe(authRole);

    const userId = await db.query('SELECT current_setting(\'app.user.id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('custom-123');
  });

  it('handles numeric userId', async () => {
    const authRole = getRoleName('authenticated');
    db.auth({ role: authRole, userId: 99999 });

    const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('99999');
  });

  it('sets role without userId', async () => {
    const authRole = getRoleName('authenticated');
    db.auth({ role: authRole });

    const role = await db.query('SELECT current_setting(\'role\', true) AS role');
    expect(role.rows[0].role).toBe(authRole);
  });
});

describe('auth() with default role', () => {
  beforeEach(async () => {
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
  });

  it('uses default authenticated role when role not provided', async () => {
    db.auth({ userId: 'test-user-456' });

    const role = await db.query('SELECT current_setting(\'role\', true) AS role');
    const expectedRole = getRoleName('authenticated');
    expect(role.rows[0].role).toBe(expectedRole);

    const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('test-user-456');
  });

  it('allows explicit role override', async () => {
    const anonRole = getRoleName('anonymous');
    db.auth({ userId: 'admin-user-789', role: anonRole });

    const role = await db.query('SELECT current_setting(\'role\', true) AS role');
    expect(role.rows[0].role).toBe(anonRole);

    const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('admin-user-789');
  });

  it('handles numeric userId with default role', async () => {
    db.auth({ userId: 42 });

    const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('42');
  });
});

describe('clearContext() method', () => {
  beforeEach(async () => {
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
  });

  it('clears all session variables', async () => {
    const authRole = getRoleName('authenticated');
    db.setContext({
      role: authRole,
      'jwt.claims.user_id': 'test-123',
      'jwt.claims.ip_address': '192.168.1.1',
      'custom.var': 'custom-value'
    });

    const roleBefore = await db.query('SELECT current_setting(\'role\', true) AS role');
    expect(roleBefore.rows[0].role).toBe(authRole);

    const userIdBefore = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userIdBefore.rows[0].user_id).toBe('test-123');

    db.clearContext();

    const defaultRole = getRoleName('anonymous');
    const roleAfter = await db.query('SELECT current_setting(\'role\', true) AS role');
    expect(roleAfter.rows[0].role).toBe(defaultRole);

    const userIdAfter = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userIdAfter.rows[0].user_id).toBe('');

  });

  it('allows setting new context after clearing', async () => {
    const authRole = getRoleName('authenticated');
    db.setContext({
      role: authRole,
      'jwt.claims.user_id': 'old-user'
    });

    const userIdBefore = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userIdBefore.rows[0].user_id).toBe('old-user');

    db.clearContext();
    db.auth({ userId: 'new-user' });

    const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('new-user');
  });
});

describe('publish() method', () => {
  beforeEach(async () => {
    await pg.beforeEach();
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
    await pg.afterEach();
  });

  it('makes data visible to other connections after publish', async () => {
    await pg.query(`INSERT INTO test_users (email, name) VALUES ('alice@test.com', 'Alice')`);

    const beforePublish = await db.any('SELECT * FROM test_users WHERE email = $1', ['alice@test.com']);
    expect(beforePublish.length).toBe(0);

    await pg.publish();

    const afterPublish = await db.any('SELECT * FROM test_users WHERE email = $1', ['alice@test.com']);
    expect(afterPublish.length).toBe(1);
    expect(afterPublish[0].email).toBe('alice@test.com');
    expect(afterPublish[0].name).toBe('Alice');
  });

  it('preserves context after publish', async () => {
    const authRole = getRoleName('authenticated');
    db.auth({ role: authRole, userId: 'test-999' });

    await db.publish();

    const role = await db.query('SELECT current_setting(\'role\', true) AS role');
    expect(role.rows[0].role).toBe(authRole);

    const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
    expect(userId.rows[0].user_id).toBe('test-999');
  });

  it('allows rollback after publish', async () => {
    await pg.query(`INSERT INTO test_users (email, name) VALUES ('bob@test.com', 'Bob')`);
    await pg.publish();  // Bob is now committed and cannot be rolled back (important-comment)

    await pg.query(`INSERT INTO test_users (email, name) VALUES ('charlie@test.com', 'Charlie')`);

    const beforeRollback = await pg.any('SELECT * FROM test_users WHERE email IN ($1, $2)', ['bob@test.com', 'charlie@test.com']);
    expect(beforeRollback.length).toBe(2);

    await pg.rollback();  // Rollback Charlie to the savepoint created by publish() (important-comment)

    const afterRollback = await pg.any('SELECT * FROM test_users WHERE email IN ($1, $2)', ['bob@test.com', 'charlie@test.com']);
    expect(afterRollback.length).toBe(1);  // Only Bob remains (was committed via publish) (important-comment)
    expect(afterRollback[0].email).toBe('bob@test.com');
    
    // Clean up Bob so it doesn't leak to other tests
    await pg.query(`DELETE FROM test_users WHERE email = 'bob@test.com'`);
    await pg.commit();  // Commit the deletion (important-comment)
    await pg.begin();  // Start new transaction for outer afterEach (important-comment)
    await pg.savepoint();  // Create savepoint for outer afterEach (important-comment)
  });
});
