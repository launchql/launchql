process.env.LOG_SCOPE = 'pgsql-test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { seed } from '../src';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;
let testDir: string;

beforeAll(async () => {
  testDir = join(tmpdir(), `pgsql-test-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });

  ({ pg, db, teardown } = await getConnections({}, [
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE SCHEMA custom;
        CREATE TABLE custom.users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT
        );

        CREATE TABLE custom.posts (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES custom.users(id),
          title TEXT NOT NULL,
          content TEXT
        );

        GRANT USAGE ON SCHEMA custom TO anonymous, authenticated, administrator;
        GRANT ALL ON ALL TABLES IN SCHEMA custom TO anonymous, authenticated, administrator;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA custom TO anonymous, authenticated, administrator;
      `);
    })
  ]));
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

describe('loadJson() method', () => {
  it('should load JSON data with pg client', async () => {
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ]
    });

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load JSON data with db client', async () => {
    await db.loadJson({
      'custom.users': [
        { id: 1, name: 'Charlie', email: 'charlie@example.com' }
      ]
    });

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should handle multiple tables', async () => {
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice', email: 'alice@example.com' }
      ],
      'custom.posts': [
        { id: 1, user_id: 1, title: 'First Post', content: 'Hello world!' }
      ]
    });

    const users = await pg.any('SELECT * FROM custom.users');
    const posts = await pg.any('SELECT * FROM custom.posts');
    
    expect(users).toHaveLength(1);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('First Post');
  });
});

describe('loadCsv() method', () => {
  it('should load CSV data with pg client', async () => {
    const csvPath = join(testDir, 'users.csv');
    writeFileSync(csvPath, 'id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@example.com\n');

    await pg.loadCsv({
      'custom.users': csvPath
    });

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load CSV data with db client', async () => {
    const csvPath = join(testDir, 'users2.csv');
    writeFileSync(csvPath, 'id,name,email\n3,Charlie,charlie@example.com\n');

    await db.loadCsv({
      'custom.users': csvPath
    });

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });
});

describe('loadSql() method', () => {
  it('should load SQL files with pg client', async () => {
    const sqlPath = join(testDir, 'seed.sql');
    writeFileSync(sqlPath, `
      INSERT INTO custom.users (id, name, email) VALUES (1, 'Alice', 'alice@example.com');
      INSERT INTO custom.users (id, name, email) VALUES (2, 'Bob', 'bob@example.com');
    `);

    await pg.loadSql([sqlPath]);

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load SQL files with db client', async () => {
    const sqlPath = join(testDir, 'seed2.sql');
    writeFileSync(sqlPath, `
      INSERT INTO custom.users (id, name, email) VALUES (3, 'Charlie', 'charlie@example.com');
    `);

    await db.loadSql([sqlPath]);

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load multiple SQL files in order', async () => {
    const sql1Path = join(testDir, 'seed3a.sql');
    const sql2Path = join(testDir, 'seed3b.sql');
    
    writeFileSync(sql1Path, `INSERT INTO custom.users (id, name, email) VALUES (1, 'Alice', 'alice@example.com');`);
    writeFileSync(sql2Path, `INSERT INTO custom.posts (id, user_id, title, content) VALUES (1, 1, 'Post', 'Content');`);

    await pg.loadSql([sql1Path, sql2Path]);

    const users = await pg.any('SELECT * FROM custom.users');
    const posts = await pg.any('SELECT * FROM custom.posts');
    
    expect(users).toHaveLength(1);
    expect(posts).toHaveLength(1);
  });
});

describe('cross-connection visibility with publish()', () => {
  it('should make pg data visible to db after publish', async () => {
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice', email: 'alice@example.com' }
      ]
    });

    await pg.publish();

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should make db data visible to pg after publish', async () => {
    await db.loadJson({
      'custom.users': [
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ]
    });

    await db.publish();

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should support multiple publish cycles', async () => {
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice', email: 'alice@example.com' }
      ]
    });
    await pg.publish();

    await db.loadJson({
      'custom.users': [
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ]
    });
    await db.publish();

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });
});
