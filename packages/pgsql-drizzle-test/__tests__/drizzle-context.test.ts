import { eq } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { getConnections, PgTestClient } from 'pgsql-test';

import { drizzle } from '../src';

// Define test schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id')
});

const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull()
});

describe('pgsql-drizzle-test', () => {
  let db: PgTestClient;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    ({ db, teardown } = await getConnections());

    // Setup schema
    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        user_id TEXT
      );

      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL
      );
    `);
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
  });

  describe('basic functionality', () => {
    it('should execute simple queries', async () => {
      const drizzleDb = drizzle(db);
      
      await drizzleDb.insert(users).values({ name: 'Alice', userId: '1' });
      const result = await drizzleDb.select().from(users);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    it('should handle multiple inserts', async () => {
      const drizzleDb = drizzle(db);
      
      await drizzleDb.insert(users).values([
        { name: 'Alice', userId: '1' },
        { name: 'Bob', userId: '2' },
        { name: 'Charlie', userId: '3' }
      ]);
      
      const result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(3);
    });

    it('should handle updates', async () => {
      const drizzleDb = drizzle(db);
      
      await drizzleDb.insert(users).values({ name: 'Alice', userId: '1' });
      await drizzleDb.update(users).set({ name: 'Alice Updated' }).where(eq(users.userId, '1'));
      
      const result = await drizzleDb.select().from(users);
      expect(result[0].name).toBe('Alice Updated');
    });

    it('should handle deletes', async () => {
      const drizzleDb = drizzle(db);
      
      await drizzleDb.insert(users).values([
        { name: 'Alice', userId: '1' },
        { name: 'Bob', userId: '2' }
      ]);
      
      await drizzleDb.delete(users).where(eq(users.userId, '1'));
      
      const result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });
  });

  describe('context management', () => {
    it('should apply context via $setContext', async () => {
      const drizzleDb = drizzle(db);
      
      drizzleDb.$setContext({ 'app.test_var': 'test_value' });
      
      const result = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('app.test_var', true) as value`
      );
      
      expect(result.rows[0].value).toBe('test_value');
    });

    it('should apply role via $setContext', async () => {
      const drizzleDb = drizzle(db);
      
      // Set a role (using postgres default role)
      drizzleDb.$setContext({ role: 'postgres' });
      
      const result = await drizzleDb.execute<{ role: string }>(
        `SELECT current_user as role`
      );
      
      expect(result.rows[0].role).toBe('postgres');
    });

    it('should clear context via $clearContext', async () => {
      const drizzleDb = drizzle(db);
      
      drizzleDb.$setContext({ 'app.test_var': 'test_value' });
      drizzleDb.$clearContext();
      
      const result = await drizzleDb.execute<{ value: string | null }>(
        `SELECT current_setting('app.test_var', true) as value`
      );
      
      // After clearing, the setting should be null or empty
      expect(result.rows[0].value).toBeFalsy();
    });

    it('should maintain context across multiple queries', async () => {
      const drizzleDb = drizzle(db);
      
      drizzleDb.$setContext({ 'app.user_id': '123' });
      
      // First query
      const result1 = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('app.user_id', true) as value`
      );
      expect(result1.rows[0].value).toBe('123');
      
      // Second query - context should still be applied
      const result2 = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('app.user_id', true) as value`
      );
      expect(result2.rows[0].value).toBe('123');
    });
  });

  describe('helper methods', () => {
    it('should provide access to $testClient', async () => {
      const drizzleDb = drizzle(db);
      
      expect(drizzleDb.$testClient).toBe(db);
      
      // Should be able to use PgTestClient methods
      const result = await drizzleDb.$testClient.query('SELECT 1 as num');
      expect(result.rows[0].num).toBe(1);
    });

    it('should support $auth helper', async () => {
      const drizzleDb = drizzle(db);
      
      // $auth should set context
      drizzleDb.$auth({ userId: '456' });
      
      const result = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('jwt.claims.user_id', true) as value`
      );
      
      expect(result.rows[0].value).toBe('456');
    });
  });

  describe('transaction isolation', () => {
    it('should isolate changes between tests', async () => {
      const drizzleDb = drizzle(db);
      
      await drizzleDb.insert(users).values({ name: 'Test User', userId: '999' });
      
      const result = await drizzleDb.select().from(users);
      expect(result.length).toBeGreaterThan(0);
      
      // Changes will be rolled back in afterEach
    });

    it('should start with clean state', async () => {
      const drizzleDb = drizzle(db);
      
      // This test should not see data from previous test
      const result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(0);
    });
  });

  describe('publish functionality', () => {
    it('should make data visible after $publish', async () => {
      const drizzleDb = drizzle(db);
      
      // Insert data
      await drizzleDb.insert(users).values({ name: 'Published User', userId: '777' });
      
      // Publish to commit the transaction
      await drizzleDb.$publish();
      
      // Data should still be visible in the new transaction
      const result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Published User');
    });
  });

  describe('with schema', () => {
    it('should work with schema configuration', async () => {
      const schema = { users, posts };
      const drizzleDb = drizzle(db, { schema });
      
      await drizzleDb.insert(users).values({ name: 'Schema User', userId: '888' });
      
      const result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Schema User');
    });
  });
});
