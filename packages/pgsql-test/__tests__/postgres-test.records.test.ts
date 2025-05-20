process.env.LOG_SCOPE = 'pgsql-test';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let pg: PgTestClient;
let teardown: () => Promise<void>;

const setupSchemaSQL = `
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL
  );
`;

const seedDataSQL = `
  INSERT INTO users (name) VALUES ('Alice'), ('Bob');
  INSERT INTO posts (user_id, content) VALUES
    (1, 'Hello world!'),
    (2, 'Graphile is cool!');
`;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
  // create schema + seed *once*
  await pg.query(setupSchemaSQL);
  await pg.query(seedDataSQL);
});

afterAll(async () => {
  await teardown();
});

describe('Postgres Test Framework', () => {
  beforeEach(async () => {
    await pg.beforeEach();  // BEGIN + SAVEPOINT
  });

  afterEach(async () => {
    await pg.afterEach();   // ROLLBACK TO SAVEPOINT + COMMIT
  });

  it('should have 2 users initially', async () => {
    const { rows } = await pg.query('SELECT COUNT(*) FROM users');
    expect(rows[0].count).toBe('2');
  });

  it('inserts a user but rollback leaves baseline intact', async () => {
    await pg.query(`INSERT INTO users (name) VALUES ('Carol')`);
    let res = await pg.query('SELECT COUNT(*) FROM users');
    expect(res.rows[0].count).toBe('3');   // inside this tx
    // after rollback... the next test, we’ll still see 2
  });

  it('still sees 2 users after previous insert test', async () => {
    const { rows } = await pg.query('SELECT COUNT(*) FROM users');
    expect(rows[0].count).toBe('2');
  });

});
