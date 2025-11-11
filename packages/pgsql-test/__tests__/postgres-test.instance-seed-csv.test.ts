process.env.LOG_SCOPE = 'pgsql-test';

import path from 'path';

import { seed } from '../src';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

const csv = (file: string) => path.resolve(__dirname, '../csv', file);

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
          email TEXT,
          bio TEXT
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

describe('Instance seed.csv()', () => {
  describe('basic functionality', () => {
    beforeEach(async () => {
      await pg.beforeEach();
    });

    afterEach(async () => {
      await pg.afterEach();
    });

    it('seeds data from CSV file', async () => {
      await pg.seed.csv({
        'custom.users': csv('users.csv')
      });

      const users = await pg.any('SELECT * FROM custom.users ORDER BY id');
      expect(users.length).toBeGreaterThan(0);
      expect(users[0].name).toBeDefined();
    });

    it('rolls back seeded data after test', async () => {
      const usersBefore = await pg.any('SELECT * FROM custom.users');
      expect(usersBefore).toHaveLength(0);
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
      await pg.seed.csv(
        {
          'custom.users': csv('users.csv')
        },
        { publish: true }
      );

      const users = await db.any('SELECT * FROM custom.users');
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('identifier quoting', () => {
    beforeEach(async () => {
      await pg.beforeEach();
      await pg.query('TRUNCATE TABLE custom.users RESTART IDENTITY CASCADE');
    });

    afterEach(async () => {
      await pg.afterEach();
    });

    it('handles schema-qualified table names', async () => {
      await pg.seed.csv({
        'custom.users': csv('users.csv')
      });

      const users = await pg.any('SELECT * FROM custom.users');
      expect(users.length).toBeGreaterThan(0);
    });
  });
});
