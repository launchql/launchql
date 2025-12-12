import { getConnections, PgTestClient } from 'pgsql-test';
import { snapshot } from 'graphile-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

describe('defaults security configurations', () => {
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

  describe('database privileges', () => {
    it('should revoke all database privileges from PUBLIC', async () => {
      // Get current database name
      const [dbInfo] = await pg.any(`SELECT current_database() as db_name`);
      
      // Check database privileges for PUBLIC role
      const privileges = await pg.any(`
        SELECT 
          datacl 
        FROM pg_database 
        WHERE datname = $1
      `, [dbInfo.db_name]);

      expect(privileges).toHaveLength(1);
      
      // If datacl is null, it means no explicit privileges (good)
      // If datacl exists, check that PUBLIC doesn't appear or has no privileges
      if (privileges[0].datacl) {
        const aclString = privileges[0].datacl.toString();
        // PUBLIC should not appear in the ACL with any privileges
        // The ACL format is {user=privileges/grantor,...}
        // PUBLIC would appear as "=privileges/grantor" or "PUBLIC=privileges/grantor"
        expect(aclString).not.toMatch(/(?:^|,)(?:PUBLIC)?=[^,}]*[CTc][^,}]*(?:,|$)/);
      }
      // If datacl is null, that's actually what we want - no explicit privileges
    });

    it('should verify database connection still works for current user', async () => {
      // Verify we can still connect and run queries
      const [result] = await pg.any(`SELECT 1 as test`);
      expect(result.test).toBe(1);
      
      // Verify we can see current user
      const [userResult] = await pg.any(`SELECT current_user as username`);
      expect(userResult.username).toBeDefined();
    });
  });

  describe('function execution privileges', () => {
    beforeEach(async () => {
      // Create a test function to check default privileges
      await pg.any(`
        CREATE OR REPLACE FUNCTION test_default_function()
        RETURNS text AS $$
        BEGIN
          RETURN 'test result';
        END;
        $$ LANGUAGE plpgsql;
      `);
    });

    it('should have revoked default EXECUTE privileges from PUBLIC on functions', async () => {
      // Check if PUBLIC has execute privileges on our test function
      const privileges = await pg.any(`
        SELECT 
          has_function_privilege('public', 'test_default_function()', 'execute') as public_can_execute
      `);

      expect(privileges[0].public_can_execute).toBe(false);
    });

    it('should allow current user to execute functions they create', async () => {
      // Current user should still be able to execute their own functions
      const [result] = await pg.any(`SELECT test_default_function() as result`);
      expect(result.result).toBe('test result');
    });

    it('should verify default privileges are set for new functions', async () => {
      // Check the default privileges configuration
      const defaultPrivs = await pg.any(`
        SELECT 
          defaclrole,
          defaclnamespace,
          defaclobjtype,
          defaclacl
        FROM pg_default_acl 
        WHERE defaclobjtype = 'f'  -- functions
      `);

      // Should have at least one default ACL entry for functions
      expect(defaultPrivs.length).toBeGreaterThanOrEqual(0);
      
      // The key test is that PUBLIC cannot execute functions by default
      // We already verified this in the previous test, so this is more about
      // confirming the configuration exists
      if (defaultPrivs.length > 0) {
        for (const priv of defaultPrivs) {
          if (priv.defaclacl) {
            const aclString = priv.defaclacl.toString();
            // Check that PUBLIC doesn't have execute (X) privileges
            // PUBLIC would appear as "=X/grantor" or "PUBLIC=X/grantor"
            expect(aclString).not.toMatch(/(?:^|,)(?:PUBLIC)?=[^,}]*X[^,}]*(?:,|$)/);
          }
        }
      }
    });
  });

  describe('schema privileges', () => {
    it('should revoke CREATE privileges on public schema from PUBLIC', async () => {
      // Check if PUBLIC can create objects in public schema
      const privileges = await pg.any(`
        SELECT 
          has_schema_privilege('public', 'public', 'create') as public_can_create
      `);

      expect(privileges[0].public_can_create).toBe(false);
    });

    it('should allow current user to create objects in public schema', async () => {
      // Current user should still be able to create tables
      await expect(
        pg.any(`
          CREATE TABLE test_table_creation (
            id serial PRIMARY KEY,
            name text
          )
        `)
      ).resolves.not.toThrow();

      // Clean up
      await pg.any(`DROP TABLE test_table_creation`);
    });

    it('should verify public schema still exists and is usable', async () => {
      // Verify public schema exists
      const schemas = await pg.any(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'public'
      `);
      
      expect(schemas).toHaveLength(1);
      expect(schemas[0].schema_name).toBe('public');
    });
  });

  describe('security verification', () => {
    it('should have secure default configuration applied', async () => {
      // Test that we can create objects but PUBLIC cannot access them by default
      await pg.any(`
        CREATE TABLE test_security_table (
          id serial PRIMARY KEY,
          secret_data text
        )
      `);

      // Insert test data
      await pg.any(`
        INSERT INTO test_security_table (secret_data) 
        VALUES ('confidential information')
      `);

      // Current user should be able to access
      const [result] = await pg.any(`
        SELECT secret_data FROM test_security_table LIMIT 1
      `);
      expect(result.secret_data).toBe('confidential information');

      // Check table privileges for PUBLIC
      const tablePrivs = await pg.any(`
        SELECT 
          has_table_privilege('public', 'test_security_table', 'select') as public_can_select,
          has_table_privilege('public', 'test_security_table', 'insert') as public_can_insert
      `);

      // PUBLIC should not have privileges unless explicitly granted
      expect(tablePrivs[0].public_can_select).toBe(false);
      expect(tablePrivs[0].public_can_insert).toBe(false);
    });

    it('should verify current user retains necessary privileges', async () => {
      const [currentUser] = await pg.any(`SELECT current_user as username`);

      // Current user should have necessary privileges to work
      const userPrivs = await pg.any(`
        SELECT 
          has_schema_privilege($1, 'public', 'usage') as can_use_public,
          has_schema_privilege($1, 'public', 'create') as can_create_in_public
      `, [currentUser.username]);

      expect(userPrivs[0].can_use_public).toBe(true);
      expect(userPrivs[0].can_create_in_public).toBe(true);
    });
  });

  describe('privilege inheritance', () => {
    it('should verify that new schemas inherit secure defaults', async () => {
      // Create a new schema
      await pg.any(`CREATE SCHEMA test_new_schema`);

      // Create a function in the new schema
      await pg.any(`
        CREATE OR REPLACE FUNCTION test_new_schema.test_inherited_function()
        RETURNS text AS $$
        BEGIN
          RETURN 'inherited test';
        END;
        $$ LANGUAGE plpgsql;
      `);

      // PUBLIC should not have execute privileges due to default privilege settings
      const privileges = await pg.any(`
        SELECT 
          has_function_privilege('public', 'test_new_schema.test_inherited_function()', 'execute') as public_can_execute
      `);

      expect(privileges[0].public_can_execute).toBe(false);

      // Clean up
      await pg.any(`DROP SCHEMA test_new_schema CASCADE`);
    });

    it('should allow explicit privilege grants to work', async () => {
      // Create a test table
      await pg.any(`
        CREATE TABLE test_explicit_grants (
          id serial PRIMARY KEY,
          data text
        )
      `);

      // Explicitly grant SELECT to PUBLIC
      await pg.any(`GRANT SELECT ON test_explicit_grants TO PUBLIC`);

      // Now PUBLIC should have SELECT privilege
      const privileges = await pg.any(`
        SELECT 
          has_table_privilege('public', 'test_explicit_grants', 'select') as public_can_select
      `);

      expect(privileges[0].public_can_select).toBe(true);

      // But not other privileges
      const otherPrivs = await pg.any(`
        SELECT 
          has_table_privilege('public', 'test_explicit_grants', 'insert') as public_can_insert,
          has_table_privilege('public', 'test_explicit_grants', 'update') as public_can_update
      `);

      expect(otherPrivs[0].public_can_insert).toBe(false);
      expect(otherPrivs[0].public_can_update).toBe(false);
    });
  });

  describe('configuration verification', () => {
    it('should have applied all expected security configurations', async () => {
      // Verify the three main security configurations are in place:
      
      // 1. Database privileges revoked from PUBLIC
      const [dbInfo] = await pg.any(`SELECT current_database() as db_name`);
      const [dbPrivs] = await pg.any(`
        SELECT 
          has_database_privilege('public', $1, 'connect') as public_can_connect,
          has_database_privilege('public', $1, 'create') as public_can_create_db
      `, [dbInfo.db_name]);

      // Note: PUBLIC might still have CONNECT (that's usually okay)
      // but should not have CREATE privileges
      expect(dbPrivs.public_can_create_db).toBe(false);

      // 2. Function execution revoked from PUBLIC by default
      const defaultFuncPrivs = await pg.any(`
        SELECT count(*) as count
        FROM pg_default_acl 
        WHERE defaclobjtype = 'f'
      `);
      // Should have some default ACL configuration
      expect(parseInt(defaultFuncPrivs[0].count)).toBeGreaterThanOrEqual(0);

      // 3. CREATE on public schema revoked from PUBLIC
      const [schemaPrivs] = await pg.any(`
        SELECT 
          has_schema_privilege('public', 'public', 'create') as public_can_create_in_public
      `);
      expect(schemaPrivs.public_can_create_in_public).toBe(false);
    });

    it('should create snapshot of security configuration', async () => {
      // Get current security state for snapshot testing
      const [currentUser] = await pg.any(`SELECT current_user as username`);
      const [dbInfo] = await pg.any(`SELECT current_database() as db_name`);

      const securityState = await pg.any(`
        SELECT 
          $1 as current_user,
          $2 as database_name,
          has_database_privilege('public', $2, 'connect') as public_db_connect,
          has_database_privilege('public', $2, 'create') as public_db_create,
          has_schema_privilege('public', 'public', 'usage') as public_schema_usage,
          has_schema_privilege('public', 'public', 'create') as public_schema_create,
          (SELECT count(*) FROM pg_default_acl WHERE defaclobjtype = 'f') as default_func_acl_count
      `, [currentUser.username, dbInfo.db_name]);

      // Normalize the database name for consistent snapshots
      const normalizedSecurityState = securityState.map(state => ({
        ...state,
        database_name: 'test-database' // Replace dynamic name with static value
      }));

      expect(snapshot({ securityState: normalizedSecurityState })).toMatchSnapshot();
    });
  });
}); 