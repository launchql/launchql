process.env.LOG_SCOPE = 'graphile-test';
;
import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { getConnections } from '../src/get-connections';
import { logDbSessionInfo } from '../test-utils/utils';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let pg: PgTestClient;
let db: PgTestClient;

beforeAll(async () => {
  const connections = await getConnections(
    {
      schemas,
      authRole: 'authenticated'
    },
    [
      seed.sqlfile([
        sql('test.sql'),
        sql('grants.sql')
      ])
    ]
  );

  ({ pg, db, teardown } = connections);
});

// 🔒 These are commented out intentionally for this test.
// Normally we use savepoints per test for isolation like this:


// beforeEach(async () => {
//     await pg.begin();
//     await pg.savepoint('db');
// });
// afterEach(async () => {
//     await db.rollback('db');
//     await db.commit();
// });


// But to test *true* transaction-aborted behavior, we avoid savepoints,
// because savepoints *recover* from errors and mask the abort state.
// afterEach/rollback would hide the failure we're testing for.

afterAll(async () => {
  await teardown();
});

it('aborts transaction when inserting duplicate usernames', async () => {
  await logDbSessionInfo(db);
  // 🧠 Begin a top-level transaction manually.
  // This lets us test actual Postgres transaction aborts.
  await pg.client.query('BEGIN');

  try {
    // ✅ Insert the same username twice to trigger a UNIQUE violation.
    // This is a guaranteed, low-level Postgres error.
    await pg.client.query(`insert into app_public.users (username) values ('dupeuser')`);
    await pg.client.query(`insert into app_public.users (username) values ('dupeuser')`);
  } catch (err) {
    // ✅ Confirm we catch the expected unique constraint violation
    const pgErr = err as any;

    console.log('Expected error:', pgErr.message);
    expect(pgErr.message).toEqual(
      'duplicate key value violates unique constraint "users_username_key"'
    );

    // 🔎 Useful metadata for debugging and diagnostics
    console.log('Message:', pgErr.message);       // Human-readable error
    console.log('Detail:', pgErr.detail);         // Explains conflict source
    console.log('Hint:', pgErr.hint);             // Usually null
    console.log('Code:', pgErr.code);             // '23505' = unique_violation
    console.log('Constraint:', pgErr.constraint); // "users_username_key"
  }

  try {
    // ❌ After a failed statement, the transaction is now "aborted"
    // Any query run before rollback/commit will throw:
    // "current transaction is aborted, commands ignored until end of transaction block"
    const res = await pg.client.query(`select * from app_public.users`);
    console.log('After failed tx:', res.rows); // Should not be reached!
  } catch (err) {
    const txErr = err as Error;

    console.log('Expected error:', txErr.message);

    // ✅ Confirm we're in the classic "aborted transaction" state
    expect(txErr.message).toEqual(
      'current transaction is aborted, commands ignored until end of transaction block'
    );
  }

  // 🧼 Clean up to make sure we don't leak the open transaction
  await pg.client.query('ROLLBACK');
});
