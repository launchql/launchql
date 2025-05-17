import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let conn: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ conn, db, teardown } = await getConnections());

  // Setup schema + seed ONCE globally
  await db.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL
    );
  `);

  await db.query(`
    INSERT INTO users (name) VALUES ('Alice'), ('Bob');
    INSERT INTO posts (user_id, content) VALUES
      (1, 'Hello world!'),
      (2, 'Graphile is cool!');
  `);
});

afterAll(async () => {
  await teardown();
});

describe('anonymous', () => {
  beforeEach(async () => {
    await db.beforeEach();  // this starts tx + savepoint
  });

  afterEach(async () => {
    await db.afterEach();   // this rolls back and commits
  });

  it('inserts a user but rollback leaves baseline intact', async () => {
    await db.query(`INSERT INTO users (name) VALUES ('Carol')`);
    const res = await db.query('SELECT COUNT(*) FROM users');
    expect(res.rows[0].count).toBe('3');
  });

  it('should still have 2 users after rollback', async () => {
    const res = await db.query('SELECT COUNT(*) FROM users');
    expect(res.rows[0].count).toBe('2');
  });

  it('runs under anonymous context', async () => {
    const result = await conn.query('SELECT current_setting(\'role\', true) AS role');
    console.log(JSON.stringify({result}, null, 2))
    console.error(JSON.stringify({result}, null, 2))
    // expect(result.rows[0].role).toBe('anonymous');
  });
});

describe('authenticated', () => {
  beforeEach(async () => {
    conn.setContext({
      role: 'authenticated'
    });
    await conn.beforeEach();  // required for rollback later
  });

  afterEach(async () => {
    await conn.afterEach();   // now safe to rollback
  });

  it('runs under authenticated context', async () => {
    const result = await conn.query('SELECT current_setting(\'role\', true) AS role');
    // expect(result.rows[0].role).toBe('authenticated');
    console.error('why no JWT')
  });
});
