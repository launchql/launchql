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
  let pg: PgTestClient;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    ({ pg, db, teardown } = await getConnections());

    // Setup schema using pg (superuser) with proper grants and RLS
    await pg.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL
      );

      GRANT ALL ON TABLE users TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO authenticated;

      -- Enable RLS on users table
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;

      -- Create policy that checks JWT claims
      CREATE POLICY users_owner_policy ON users
        FOR ALL
        TO authenticated
        USING (user_id = current_setting('jwt.claims.user_id', true));

      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL
      );

      GRANT ALL ON TABLE posts TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE posts_id_seq TO authenticated;

      -- Seed test data using pg (bypasses RLS)
      INSERT INTO users (name, user_id)
      VALUES ('User 1 Record', '1'), ('User 2 Record', '2'), ('User 3 Record', '3');
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
    it('should execute simple queries with proper context', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context before operations (required for RLS)
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      await drizzleDb.insert(users).values({ name: 'Alice', userId: '1' });
      const result = await drizzleDb.select().from(users);
      
      // Should see 2 records: 1 seeded + 1 new
      expect(result).toHaveLength(2);
      expect(result.find(r => r.name === 'Alice')).toBeDefined();
    });

    it('should handle multiple inserts with proper context', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context for user 1
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      await drizzleDb.insert(users).values([
        { name: 'Alice', userId: '1' },
        { name: 'Alice2', userId: '1' }
      ]);
      
      const result = await drizzleDb.select().from(users);
      // Should see 2 new records plus 1 seeded record for user 1
      expect(result).toHaveLength(3);
    });

    it('should handle updates with proper context', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context for user 1
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      await drizzleDb.insert(users).values({ name: 'Alice', userId: '1' });
      await drizzleDb.update(users).set({ name: 'Alice Updated' }).where(eq(users.userId, '1'));
      
      const result = await drizzleDb.select().from(users);
      // Find the updated record
      const updated = result.find(r => r.name === 'Alice Updated');
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Alice Updated');
    });

    it('should handle deletes with proper context', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context for user 1
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      await drizzleDb.insert(users).values([
        { name: 'Alice', userId: '1' },
        { name: 'Bob', userId: '1' }
      ]);
      
      // Should see 3 records (2 new + 1 seeded)
      let result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(3);
      
      await drizzleDb.delete(users).where(eq(users.name, 'Alice'));
      
      result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(2);
      expect(result.find(r => r.name === 'Alice')).toBeUndefined();
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
      
      // Set authenticated role (can't use postgres as non-superuser)
      drizzleDb.$setContext({ role: 'authenticated' });
      
      const result = await drizzleDb.execute<{ role: string }>(
        `SELECT current_user as role`
      );
      
      expect(result.rows[0].role).toBe('authenticated');
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
      
      // Set context before operations (required for RLS)
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '999' 
      });
      
      await drizzleDb.insert(users).values({ name: 'Test User', userId: '999' });
      
      const result = await drizzleDb.select().from(users);
      expect(result.length).toBeGreaterThan(0);
      
      // Changes will be rolled back in afterEach
    });

    it('should start with clean state', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context to see if there's any data
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '999' 
      });
      
      // This test should not see data from previous test (different user_id)
      const result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(0);
    });
  });

  describe('publish functionality', () => {
    it('should make data visible after $publish', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context before operations (required for RLS)
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '777' 
      });
      
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
      
      // Set context for user 1
      drizzleDb.$setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      await drizzleDb.insert(users).values({ name: 'Schema User', userId: '1' });
      
      const result = await drizzleDb.select().from(users);
      expect(result.length).toBeGreaterThan(0);
      expect(result.find(r => r.name === 'Schema User')).toBeDefined();
    });
  });

  describe('RLS with JWT claims', () => {
    it('should verify JWT claim is set in session', async () => {
      const drizzleDb = drizzle(db);
      
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '123',
      });

      const result = await drizzleDb.execute<{ val: string }>(
        `SELECT current_setting('jwt.claims.user_id', true) AS val`
      );
      
      expect(result.rows[0].val).toBe('123');
    });

    it('user 1 should only see their own rows', async () => {
      const drizzleDb = drizzle(db);
      
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1',
      });

      const rows = await drizzleDb.select().from(users);
      
      // Should only see user 1's seeded record
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('1');
      expect(rows[0].name).toBe('User 1 Record');
    });

    it('user 2 should only see their own rows', async () => {
      const drizzleDb = drizzle(db);
      
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '2',
      });

      const rows = await drizzleDb.select().from(users);
      
      // Should only see user 2's seeded record
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('2');
      expect(rows[0].name).toBe('User 2 Record');
    });

    it('user 3 should only see their own rows', async () => {
      const drizzleDb = drizzle(db);
      
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '3',
      });

      const rows = await drizzleDb.select().from(users);
      
      // Should only see user 3's seeded record
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('3');
      expect(rows[0].name).toBe('User 3 Record');
    });

    it('should enforce RLS on inserts', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context for user 1
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1',
      });

      // Insert a record for user 1
      await drizzleDb.insert(users).values({ name: 'New User 1 Record', userId: '1' });

      // Should see 2 records now (1 seeded + 1 new)
      const rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(2);
      expect(rows.every(r => r.userId === '1')).toBe(true);
    });

    it('should enforce RLS on updates', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context for user 1
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1',
      });

      // Try to update user 1's record
      await drizzleDb.update(users)
        .set({ name: 'Updated User 1 Record' })
        .where(eq(users.userId, '1'));

      // Should see the updated record
      const rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('Updated User 1 Record');
    });

    it('should enforce RLS on deletes', async () => {
      const drizzleDb = drizzle(db);
      
      // Set context for user 1
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1',
      });

      // Insert a record to delete
      await drizzleDb.insert(users).values({ name: 'To Delete', userId: '1' });
      
      // Verify it exists
      let rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(2);

      // Delete it
      await drizzleDb.delete(users).where(eq(users.name, 'To Delete'));

      // Should only see the seeded record now
      rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('User 1 Record');
    });

    it('switching context should show different data', async () => {
      const drizzleDb = drizzle(db);
      
      // First as user 1
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1',
      });

      let rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('1');

      // Now switch to user 2
      drizzleDb.$setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '2',
      });

      rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('2');
    });
  });
});
