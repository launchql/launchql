import { getConnections, PgTestClient } from 'pgsql-test';
import { snapshot } from 'graphile-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

describe('ext-verify utilities', () => {
  beforeAll(async () => {
    ({ pg, teardown } = await getConnections());
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await pg.beforeEach();
  });

  afterEach(async () => {
    await pg.afterEach();
  });

  describe('helper functions', () => {
    it('get_entity_from_str should extract entity name', async () => {
      const tests = [
        ['public.users', 'users'],
        ['users', 'users'],
        ['schema.table_name', 'table_name'],
        ['my_function', 'my_function']
      ];

      for (const [input, expected] of tests) {
        const [result] = await pg.any(
          `SELECT get_entity_from_str($1) as entity`,
          [input]
        );
        expect(result.entity).toBe(expected);
      }
    });

    it('get_schema_from_str should extract schema name', async () => {
      const tests = [
        ['public.users', 'public'],
        ['users', 'public'],
        ['my_schema.table_name', 'my_schema'],
        ['function_name', 'public']
      ];

      for (const [input, expected] of tests) {
        const [result] = await pg.any(
          `SELECT get_schema_from_str($1) as schema_name`,
          [input]
        );
        expect(result.schema_name).toBe(expected);
      }
    });
  });

  describe('schema verification', () => {
    it('verify_schema should return true for existing schema', async () => {
      const [result] = await pg.any(
        `SELECT verify_schema('public') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_schema should throw for non-existent schema', async () => {
      await expect(
        pg.any(`SELECT verify_schema('nonexistent_schema')`)
      ).rejects.toThrow('Nonexistent schema');
    });
  });

  describe('table verification', () => {
    beforeEach(async () => {
      // Create a test table
      await pg.any(`
        CREATE TABLE test_table (
          id serial PRIMARY KEY,
          name text NOT NULL,
          email text UNIQUE
        )
      `);
    });

    it('verify_table should return true for existing table', async () => {
      const [result] = await pg.any(
        `SELECT verify_table('test_table') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_table should work with schema-qualified names', async () => {
      const [result] = await pg.any(
        `SELECT verify_table('public.test_table') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_table should throw for non-existent table', async () => {
      await expect(
        pg.any(`SELECT verify_table('nonexistent_table')`)
      ).rejects.toThrow('Nonexistent table');
    });
  });

  describe('constraint verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TABLE test_constraints (
          id serial PRIMARY KEY,
          name text NOT NULL,
          email text UNIQUE,
          age integer CHECK (age > 0)
        )
      `);
    });

    it('verify_constraint should return true for existing constraint', async () => {
      // Get the actual constraint name (PostgreSQL generates names)
      const [constraint] = await pg.any(`
        SELECT conname 
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'test_constraints' AND contype = 'u'
        LIMIT 1
      `);

      if (constraint) {
        const [result] = await pg.any(
          `SELECT verify_constraint('test_constraints', $1) as verified`,
          [constraint.conname]
        );
        expect(result.verified).toBe(true);
      }
    });

    it('verify_constraint should throw for non-existent constraint', async () => {
      await expect(
        pg.any(`SELECT verify_constraint('test_constraints', 'nonexistent_constraint')`)
      ).rejects.toThrow('Nonexistent constraint');
    });
  });

  describe('function verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE OR REPLACE FUNCTION test_function(x integer)
        RETURNS integer AS $$
        BEGIN
          RETURN x * 2;
        END;
        $$ LANGUAGE plpgsql;
      `);
    });

    it('verify_function should return true for existing function', async () => {
      const [result] = await pg.any(
        `SELECT verify_function('test_function') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_function should work with schema-qualified names', async () => {
      const [result] = await pg.any(
        `SELECT verify_function('public.test_function') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_function should throw for non-existent function', async () => {
      await expect(
        pg.any(`SELECT verify_function('nonexistent_function')`)
      ).rejects.toThrow('Nonexistent function');
    });
  });

  describe('view verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TABLE test_view_base (
          id serial PRIMARY KEY,
          name text
        )
      `);
      
      await pg.any(`
        CREATE VIEW test_view AS 
        SELECT id, name FROM test_view_base WHERE name IS NOT NULL
      `);
    });

    it('verify_view should return true for existing view', async () => {
      const [result] = await pg.any(
        `SELECT verify_view('test_view') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_view should work with schema-qualified names', async () => {
      const [result] = await pg.any(
        `SELECT verify_view('public.test_view') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_view should throw for non-existent view', async () => {
      await expect(
        pg.any(`SELECT verify_view('nonexistent_view')`)
      ).rejects.toThrow('Nonexistent view');
    });
  });

  describe('index verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TABLE test_index_table (
          id serial PRIMARY KEY,
          name text,
          email text
        )
      `);
      
      await pg.any(`
        CREATE INDEX test_custom_index ON test_index_table (name)
      `);
    });

    it('verify_index should return true for existing index', async () => {
      const [result] = await pg.any(
        `SELECT verify_index('test_index_table', 'test_custom_index') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_index should throw for non-existent index', async () => {
      await expect(
        pg.any(`SELECT verify_index('test_index_table', 'nonexistent_index')`)
      ).rejects.toThrow('Nonexistent index');
    });

    it('list_indexes should return index information', async () => {
      const results = await pg.any(
        `SELECT * FROM list_indexes('test_index_table', 'test_custom_index')`
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].schema_name).toBe('public');
      expect(results[0].table_name).toBe('test_index_table');
      expect(results[0].index_name).toBe('test_custom_index');
    });
  });

  describe('trigger verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TABLE test_trigger_table (
          id serial PRIMARY KEY,
          name text,
          updated_at timestamp DEFAULT now()
        )
      `);
      
      await pg.any(`
        CREATE OR REPLACE FUNCTION update_timestamp()
        RETURNS trigger AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      await pg.any(`
        CREATE TRIGGER test_update_trigger
        BEFORE UPDATE ON test_trigger_table
        FOR EACH ROW EXECUTE FUNCTION update_timestamp()
      `);
    });

    it('verify_trigger should return true for existing trigger', async () => {
      const [result] = await pg.any(
        `SELECT verify_trigger('test_update_trigger') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_trigger should throw for non-existent trigger', async () => {
      await expect(
        pg.any(`SELECT verify_trigger('nonexistent_trigger')`)
      ).rejects.toThrow('Nonexistent trigger');
    });
  });

  describe('type verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TYPE test_enum AS ENUM ('active', 'inactive', 'pending')
      `);
      
      await pg.any(`
        CREATE TYPE test_composite AS (
          name text,
          value integer
        )
      `);
    });

    it('verify_type should return true for existing enum type', async () => {
      const [result] = await pg.any(
        `SELECT verify_type('test_enum') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_type should return true for existing composite type', async () => {
      const [result] = await pg.any(
        `SELECT verify_type('test_composite') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_type should throw for non-existent type', async () => {
      await expect(
        pg.any(`SELECT verify_type('nonexistent_type')`)
      ).rejects.toThrow('Nonexistent type');
    });
  });

  describe('domain verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE DOMAIN test_domain AS text CHECK (length(value) > 0)
      `);
    });

    it('verify_domain should return true for existing domain', async () => {
      const [result] = await pg.any(
        `SELECT verify_domain('test_domain') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_domain should throw for non-existent domain', async () => {
      await expect(
        pg.any(`SELECT verify_domain('nonexistent_domain')`)
      ).rejects.toThrow('Nonexistent type');
    });
  });

  describe('role and membership verification', () => {
    it('verify_role should return true for current user', async () => {
      // Get current user
      const [currentUser] = await pg.any(`SELECT current_user as username`);
      
      const [result] = await pg.any(
        `SELECT verify_role($1) as verified`,
        [currentUser.username]
      );
      expect(result.verified).toBe(true);
    });

    it('verify_role should throw for non-existent role', async () => {
      await expect(
        pg.any(`SELECT verify_role('nonexistent_user_12345')`)
      ).rejects.toThrow('Nonexistent user');
    });

    it('list_memberships should return role memberships', async () => {
      const [currentUser] = await pg.any(`SELECT current_user as username`);
      
      const results = await pg.any(
        `SELECT * FROM list_memberships($1)`,
        [currentUser.username]
      );
      
      // Should at least include the user themselves
      expect(results.length).toBeGreaterThan(0);
      const usernames = results.map(r => r.rolname);
      expect(usernames).toContain(currentUser.username);
    });
  });

  describe('grant verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TABLE test_grants_table (
          id serial PRIMARY KEY,
          data text
        )
      `);
    });

    it('verify_table_grant should work for existing grants', async () => {
      // Grant SELECT to current user (if not already granted)
      const [currentUser] = await pg.any(`SELECT current_user as username`);
      
      // The table owner should have all privileges
      const [result] = await pg.any(
        `SELECT verify_table_grant('test_grants_table', 'INSERT', $1) as verified`,
        [currentUser.username]
      );
      expect(result.verified).toBe(true);
    });
  });

  describe('extension verification', () => {
    it('verify_extension should return true for available extensions', async () => {
      // Most PostgreSQL installations have the plpgsql extension available
      const availableExtensions = await pg.any(`
        SELECT name FROM pg_available_extensions 
        WHERE name IN ('plpgsql', 'uuid-ossp', 'pgcrypto')
        LIMIT 1
      `);
      
      if (availableExtensions.length > 0) {
        const [result] = await pg.any(
          `SELECT verify_extension($1) as verified`,
          [availableExtensions[0].name]
        );
        expect(result.verified).toBe(true);
      } else {
        // Skip this test if no common extensions are available
        expect(true).toBe(true);
      }
    });

    it('verify_extension should throw for non-existent extension', async () => {
      await expect(
        pg.any(`SELECT verify_extension('definitely_nonexistent_extension_12345')`)
      ).rejects.toThrow('Nonexistent extension');
    });
  });

  describe('security verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TABLE test_security_table (
          id serial PRIMARY KEY,
          user_id text,
          data text
        )
      `);
      
      // Enable row level security
      await pg.any(`ALTER TABLE test_security_table ENABLE ROW LEVEL SECURITY`);
    });

    it('verify_security should return true for tables with RLS enabled', async () => {
      const [result] = await pg.any(
        `SELECT verify_security('test_security_table') as verified`
      );
      expect(result.verified).toBe(true);
    });
  });

  describe('policy verification', () => {
    beforeEach(async () => {
      await pg.any(`
        CREATE TABLE test_policy_table (
          id serial PRIMARY KEY,
          user_id text,
          data text
        )
      `);
      
      await pg.any(`ALTER TABLE test_policy_table ENABLE ROW LEVEL SECURITY`);
      
      await pg.any(`
        CREATE POLICY test_policy ON test_policy_table
        FOR SELECT
        USING (user_id = current_user)
      `);
    });

    it('verify_policy should return true for existing policy', async () => {
      const [result] = await pg.any(
        `SELECT verify_policy('test_policy', 'test_policy_table') as verified`
      );
      expect(result.verified).toBe(true);
    });

    it('verify_policy should throw for non-existent policy', async () => {
      await expect(
        pg.any(`SELECT verify_policy('nonexistent_policy', 'test_policy_table')`)
      ).rejects.toThrow('Nonexistent policy');
    });
  });
}); 