process.env.LOG_SCOPE = 'pgsql-test';

import path from 'path';

import { getConnections } from '../src/connect';
import { seed } from '../src/seed';
import { PgTestClient } from '../src/test-client';

const sql = (file: string) => path.resolve(__dirname, '../sql', file);

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  // Get a transactional connection and seed the schema
  ({ pg, teardown } = await getConnections({}, [
    seed.sqlfile([
      sql('test.sql'),
    ])
  ]));

  // Start a wrapping transaction for the whole test suite
  await pg.begin();

  // Set a savepoint so we can roll back all tests in one shot in afterAll
  await pg.savepoint('suite');
});

afterAll(async () => {
  // Roll back all test-created data to this clean savepoint
  await pg.rollback('suite');
  await pg.commit(); // end transaction cleanly
  await teardown();  // close DB connection
});

beforeEach(async () => {
  // Each test gets its own savepoint so we can roll back *just that test*
  await pg.savepoint('test');
});

afterEach(async () => {
  // Ensure test leaves no trace
  await pg.rollback('test');
});

describe('Manual rollback using app_public.users', () => {
  it('inserts a user and verifies insert', async () => {
    await pg.query(`
      INSERT INTO app_public.users (username) VALUES ('zara')
    `);

    const res = await pg.query(`
      SELECT * FROM app_public.users WHERE username = 'zara'
    `);

    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].username).toBe('zara');
  });

  it('fails to insert duplicate username', async () => {
    await pg.query(`
      INSERT INTO app_public.users (username) VALUES ('zara')
    `);

    await expect(pg.query(`
      INSERT INTO app_public.users (username) VALUES ('zara')
    `)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });

  it('verifies that rollback worked — no leftover zaras', async () => {
    const res = await pg.query(`
      SELECT * FROM app_public.users WHERE username = 'zara'
    `);
    expect(res.rows).toHaveLength(0); // proves rollback works
  });

  it('inserts user and nested JSON in settings', async () => {
    const { rows } = await pg.query(`
      INSERT INTO app_public.users (username) VALUES ('neo') RETURNING id
    `);
    const userId = rows[0].id;

    await pg.query(`
      INSERT INTO app_public.user_settings (user_id, setting)
      VALUES ($1, '{"appearance": {"mode": "dark"}}')
    `, [userId]);

    const res = await pg.query(`
      SELECT setting::json->'appearance'->>'mode' AS mode
      FROM app_public.user_settings
      WHERE user_id = $1
    `, [userId]);

    expect(res.rows[0].mode).toBe('dark');
  });

  it('fails to insert settings without a valid user', async () => {
    await expect(pg.query(`
      INSERT INTO app_public.user_settings (user_id, setting)
      VALUES (99999999, '{"x":true}')
    `)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('rolls back midway and inserts alternate user', async () => {
    // Insert a user that we’ll intentionally roll back
    await pg.query(`INSERT INTO app_public.users (username) VALUES ('temp_user')`);
    const beforeRollback = await pg.query(`SELECT * FROM app_public.users WHERE username = 'temp_user'`);
    expect(beforeRollback.rows).toHaveLength(1);

    // Midway rollback (manual!)
    await pg.rollback('test'); // rollback to the `test` savepoint

    // ✅ Important: re-create the savepoint for afterEach()
    // because afterEach() will call rollback('test')
    await pg.savepoint('test');

    // Now insert another user instead
    await pg.query(`INSERT INTO app_public.users (username) VALUES ('persistent_user')`);
    const afterRollback = await pg.query(`SELECT * FROM app_public.users WHERE username = 'persistent_user'`);
    expect(afterRollback.rows).toHaveLength(1);
  });

  it('proves cleanup still happens if test throws unexpectedly', async () => {
    // First insert should succeed
    await pg.query(`INSERT INTO app_public.users (username) VALUES ('duplicate_user')`);

    // Second insert with the same username should fail
    await expect(
      pg.query(`INSERT INTO app_public.users (username) VALUES ('duplicate_user')`)
    ).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });

  it('verifies crash_test user was cleaned up after failure', async () => {
    const res = await pg.query(`SELECT * FROM app_public.users WHERE username = 'crash_test'`);
    expect(res.rows).toHaveLength(0); // proves rollback on failed test worked
  });
});
