process.env.LOG_SCOPE = 'pgsql-test';

import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections({}, false));
  
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
});

afterAll(async () => {
  await teardown();
});

describe('Instance seed.json()', () => {
  describe('db client seeding', () => {
    beforeEach(async () => {
      await db.beforeEach();
    });

    afterEach(async () => {
      await db.afterEach();
    });

    it('seeds data and rolls back', async () => {
      await db.loadJson({
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

    it('verifies rollback after test', async () => {
      const users = await db.any('SELECT * FROM custom.users');
      expect(users).toHaveLength(0);
    });

    it('handles schema-qualified table names', async () => {
      await db.loadJson({
        'custom.users': [{ id: 1, name: 'Test' }]
      });

      const users = await db.any('SELECT * FROM custom.users');
      expect(users).toHaveLength(1);
    });
  });

  describe('pg client seeding', () => {
    beforeEach(async () => {
      await pg.beforeEach();
    });

    afterEach(async () => {
      await pg.afterEach();
    });

    it('seeds data via pg client', async () => {
      await pg.loadJson({
        'custom.users': [{ id: 1, name: 'Admin User' }]
      });

      const users = await pg.any('SELECT * FROM custom.users');
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Admin User');
    });
  });

  describe('visibility across connections', () => {
    beforeEach(async () => {
      await pg.beforeEach();
      await pg.query('TRUNCATE TABLE custom.users RESTART IDENTITY CASCADE');
      await pg.loadJson({
        'custom.users': [
          { id: 1, name: 'Alice', email: 'alice@example.com' }
        ]
      });
      await pg.publish();
      await db.beforeEach();
    });

    afterEach(async () => {
      await db.afterEach();
      await pg.afterEach();
    });

    it('makes data visible to other connections', async () => {
      const users = await db.any('SELECT * FROM custom.users');
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Alice');
    });
  });
});
