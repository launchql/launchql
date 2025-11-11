process.env.LOG_SCOPE = 'pgsql-test';

import { seed } from '../src';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections({}, [
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE SCHEMA custom;
        GRANT USAGE ON SCHEMA custom TO PUBLIC;
        GRANT ALL ON SCHEMA custom TO PUBLIC;
        
        CREATE TABLE custom.users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT
        );
        
        GRANT ALL ON TABLE custom.users TO PUBLIC;
        GRANT ALL ON SEQUENCE custom.users_id_seq TO PUBLIC;
      `);
    })
  ]));
});

afterAll(async () => {
  await teardown();
});

describe('Instance seed.json()', () => {
  describe('basic functionality', () => {
    beforeEach(async () => {
      await db.beforeEach();
    });

    afterEach(async () => {
      await db.afterEach();
    });

    it('seeds data and rolls back', async () => {
      await db.seed.json({
        'custom.users': [
          { id: 1, name: 'Alice', email: 'alice@example.com' },
          { id: 2, name: 'Bob', email: 'bob@example.com' }
        ]
      });

      const users = await db.any('SELECT * FROM custom.users ORDER BY id');
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('Alice');
      expect(users[1].name).toBe('Bob');
    });

    it('rolls back seeded data after test', async () => {
      const usersBefore = await db.any('SELECT * FROM custom.users');
      expect(usersBefore).toHaveLength(0);
    });

    it('handles multiple tables', async () => {
      await pg.query(`
        CREATE TABLE IF NOT EXISTS custom.posts (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES custom.users(id),
          content TEXT NOT NULL
        );
        GRANT ALL ON TABLE custom.posts TO PUBLIC;
        GRANT ALL ON SEQUENCE custom.posts_id_seq TO PUBLIC;
      `);

      await db.seed.json({
        'custom.users': [{ id: 1, name: 'Alice' }],
        'custom.posts': [{ id: 1, user_id: 1, content: 'Hello world!' }]
      });

      const users = await db.any('SELECT * FROM custom.users');
      const posts = await db.any('SELECT * FROM custom.posts');
      
      expect(users).toHaveLength(1);
      expect(posts).toHaveLength(1);
      expect(posts[0].content).toBe('Hello world!');
    });
  });

  describe('with publish option', () => {
    beforeEach(async () => {
      await pg.beforeEach();
      await db.beforeEach();
    });

    afterEach(async () => {
      await db.afterEach();
      await pg.afterEach();
    });

    it('makes data visible to other connections', async () => {
      await pg.seed.json(
        {
          'custom.users': [
            { id: 1, name: 'Alice', email: 'alice@example.com' }
          ]
        },
        { publish: true }
      );

      const users = await db.any('SELECT * FROM custom.users');
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Alice');
    });
  });

  describe('with client option', () => {
    beforeEach(async () => {
      await pg.beforeEach();
      await pg.query('TRUNCATE TABLE custom.users RESTART IDENTITY CASCADE');
      await db.beforeEach();
    });

    afterEach(async () => {
      await db.afterEach();
      await pg.afterEach();
    });

    it('seeds via pg when client: pg specified', async () => {
      await db.seed.json(
        {
          'custom.users': [{ id: 1, name: 'Admin User' }]
        },
        { client: 'pg' }
      );

      const users = await pg.any('SELECT * FROM custom.users');
      expect(users).toHaveLength(1);
    });
  });

  describe('identifier quoting', () => {
    beforeEach(async () => {
      await db.beforeEach();
      await db.query('TRUNCATE TABLE custom.users RESTART IDENTITY CASCADE');
    });

    afterEach(async () => {
      await db.afterEach();
    });

    it('handles schema-qualified table names', async () => {
      await db.seed.json({
        'custom.users': [{ id: 1, name: 'Test' }]
      });

      const users = await db.any('SELECT * FROM custom.users');
      expect(users).toHaveLength(1);
    });
  });
});
