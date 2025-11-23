import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

import { getConnections, PgTestClient } from '../src';

// Define test schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id')
});

describe('drizzle-orm-test', () => {
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

  describe('standard Drizzle pattern with proxy', () => {
    it('should work with drizzle(db.client) directly', async () => {
      // Set context on db
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      // Use standard Drizzle pattern - no wrapper needed!
      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(users).values({ name: 'Alice', userId: '1' });
      const result = await drizzleDb.select().from(users);
      
      // Should see 2 records: 1 seeded + 1 new
      expect(result).toHaveLength(2);
      expect(result.find(r => r.name === 'Alice')).toBeDefined();
    });

    it('should handle multiple inserts', async () => {
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(users).values([
        { name: 'Alice', userId: '1' },
        { name: 'Alice2', userId: '1' }
      ]);
      
      const result = await drizzleDb.select().from(users);
      // Should see 2 new records plus 1 seeded record for user 1
      expect(result).toHaveLength(3);
    });

    it('should handle updates', async () => {
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(users).values({ name: 'Alice', userId: '1' });
      await drizzleDb.update(users).set({ name: 'Alice Updated' }).where(eq(users.userId, '1'));
      
      const result = await drizzleDb.select().from(users);
      const updated = result.find(r => r.name === 'Alice Updated');
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Alice Updated');
    });

    it('should handle deletes', async () => {
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
      
      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(users).values([
        { name: 'Alice', userId: '1' },
        { name: 'Bob', userId: '1' }
      ]);
      
      let result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(3);
      
      await drizzleDb.delete(users).where(eq(users.name, 'Alice'));
      
      result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(2);
      expect(result.find(r => r.name === 'Alice')).toBeUndefined();
    });
  });

  describe('context management with proxy', () => {
    it('should apply context via db.setContext', async () => {
      db.setContext({ 'app.test_var': 'test_value' });
      
      const drizzleDb = drizzle(db.client);
      
      const result = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('app.test_var', true) as value`
      );
      
      expect(result.rows[0].value).toBe('test_value');
    });

    it('should apply role via db.setContext', async () => {
      db.setContext({ role: 'authenticated' });
      
      const drizzleDb = drizzle(db.client);
      
      const result = await drizzleDb.execute<{ role: string }>(
        `SELECT current_user as role`
      );
      
      expect(result.rows[0].role).toBe('authenticated');
    });

    it('should clear context via db.clearContext', async () => {
      db.setContext({ 'app.test_var': 'test_value' });
      db.clearContext();
      
      const drizzleDb = drizzle(db.client);
      
      const result = await drizzleDb.execute<{ value: string | null }>(
        `SELECT current_setting('app.test_var', true) as value`
      );
      
      expect(result.rows[0].value).toBeFalsy();
    });

    it('should maintain context across multiple queries', async () => {
      db.setContext({ 'app.user_id': '123' });
      
      const drizzleDb = drizzle(db.client);
      
      const result1 = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('app.user_id', true) as value`
      );
      expect(result1.rows[0].value).toBe('123');
      
      const result2 = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('app.user_id', true) as value`
      );
      expect(result2.rows[0].value).toBe('123');
    });
  });

  describe('transaction isolation with proxy', () => {
    it('should isolate changes between tests', async () => {
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '999' 
      });
      
      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(users).values({ name: 'Test User', userId: '999' });
      
      const result = await drizzleDb.select().from(users);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should start with clean state', async () => {
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '999' 
      });
      
      const drizzleDb = drizzle(db.client);
      
      const result = await drizzleDb.select().from(users);
      expect(result).toHaveLength(0);
    });
  });

  describe('RLS with JWT claims (proxy approach)', () => {
    it('should verify JWT claim is set in session', async () => {
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '123'
      });

      const drizzleDb = drizzle(db.client);

      const result = await drizzleDb.execute<{ val: string }>(
        `SELECT current_setting('jwt.claims.user_id', true) AS val`
      );
      
      expect(result.rows[0].val).toBe('123');
    });

    it('user 1 should only see their own rows', async () => {
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1'
      });

      const drizzleDb = drizzle(db.client);
      const rows = await drizzleDb.select().from(users);
      
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('1');
      expect(rows[0].name).toBe('User 1 Record');
    });

    it('user 2 should only see their own rows', async () => {
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '2'
      });

      const drizzleDb = drizzle(db.client);
      const rows = await drizzleDb.select().from(users);
      
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('2');
      expect(rows[0].name).toBe('User 2 Record');
    });

    it('should enforce RLS on inserts', async () => {
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1'
      });

      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(users).values({ name: 'New User 1 Record', userId: '1' });

      const rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(2);
      expect(rows.every(r => r.userId === '1')).toBe(true);
    });

    it('should enforce RLS on updates', async () => {
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1'
      });

      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.update(users)
        .set({ name: 'Updated User 1 Record' })
        .where(eq(users.userId, '1'));

      const rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('Updated User 1 Record');
    });

    it('should enforce RLS on deletes', async () => {
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1'
      });

      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(users).values({ name: 'To Delete', userId: '1' });
      
      let rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(2);

      await drizzleDb.delete(users).where(eq(users.name, 'To Delete'));

      rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('User 1 Record');
    });

    it('switching context should show different data', async () => {
      const drizzleDb = drizzle(db.client);
      
      // First as user 1
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1'
      });

      let rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('1');

      // Now switch to user 2
      db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '2'
      });

      rows = await drizzleDb.select().from(users);
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe('2');
    });
  });

  describe('db.auth() helper with proxy', () => {
    it('should support db.auth helper', async () => {
      db.auth({ userId: '456' });
      
      const drizzleDb = drizzle(db.client);
      
      const result = await drizzleDb.execute<{ value: string }>(
        `SELECT current_setting('jwt.claims.user_id', true) as value`
      );
      
      expect(result.rows[0].value).toBe('456');
    });
  });
});
