import { getConnections, PgTestClient } from 'pgsql-test';
import { snapshot } from 'graphile-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

describe('db_meta_modules', () => {
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

  it('should have all expected module tables', async () => {
    const expectedModules = [
      'connected_accounts_module',
      'crypto_addresses_module', 
      'crypto_auth_module',
      'default_ids_module',
      'emails_module',
      'encrypted_secrets_module',
      'field_module',
      'invites_module',
      'levels_module',
      'limits_module',
      'membership_types_module',
      'memberships_module',
      'permissions_module',
      'phone_numbers_module',
      'rls_module',
      'secrets_module',
      'tokens_module',
      'user_auth_module',
      'users_module',
      'uuid_module'
    ];

    // Query for all module tables in meta_public schema
    const moduleTables = await pg.any(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'meta_public' 
      AND table_name LIKE '%_module'
      ORDER BY table_name
    `);

    const actualModuleNames = moduleTables.map(t => t.table_name);
    
    // Check that we have all expected modules
    for (const expectedModule of expectedModules) {
      expect(actualModuleNames).toContain(expectedModule);
    }

    expect(snapshot({ moduleNames: actualModuleNames })).toMatchSnapshot();
  });

  it('should verify users_module table structure', async () => {
    const columns = await pg.any(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'meta_public' 
      AND table_name = 'users_module'
      ORDER BY ordinal_position
    `);

    // Check that key columns exist
    const columnNames = columns.map(c => c.column_name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('database_id');
    expect(columnNames).toContain('schema_id');
    expect(columnNames).toContain('table_id');
    expect(columnNames).toContain('table_name');
    expect(columnNames).toContain('type_table_name');

    expect(snapshot({ columns })).toMatchSnapshot();
  });

  it('should verify tokens_module table structure', async () => {
    const columns = await pg.any(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'meta_public' 
      AND table_name = 'tokens_module'
      ORDER BY ordinal_position
    `);

    // Check that key columns exist
    const columnNames = columns.map(c => c.column_name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('database_id');
    expect(columnNames).toContain('schema_id');
    expect(columnNames).toContain('table_id');
    expect(columnNames).toContain('tokens_table');
    expect(columnNames).toContain('tokens_default_expiration');

    expect(snapshot({ columns })).toMatchSnapshot();
  });

  it('should verify emails_module table structure', async () => {
    const columns = await pg.any(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'meta_public' 
      AND table_name = 'emails_module'
      ORDER BY ordinal_position
    `);

    // Check that key columns exist
    const columnNames = columns.map(c => c.column_name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('database_id');
    expect(columnNames).toContain('schema_id');
    expect(columnNames).toContain('private_schema_id');
    expect(columnNames).toContain('table_id');
    expect(columnNames).toContain('table_name');

    expect(snapshot({ columns })).toMatchSnapshot();
  });

  it('should verify module table structures have database_id foreign keys', async () => {
    // Check that all module tables have proper foreign key constraints to database
    const constraints = await pg.any(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'meta_public'
        AND tc.table_name LIKE '%_module'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'database_id'
        AND ccu.table_name = 'database'
      ORDER BY tc.table_name
    `);

    // Should have at least several module tables with database_id foreign keys
    expect(constraints.length).toBeGreaterThan(10);
    
    // All should reference collections_public.database.id
    for (const constraint of constraints) {
      expect(constraint.column_name).toBe('database_id');
      expect(constraint.foreign_table_name).toBe('database');
      expect(constraint.foreign_column_name).toBe('id');
    }

    expect(snapshot({ constraintCount: constraints.length })).toMatchSnapshot();
  });

  it('should verify all module tables exist in meta_public schema', async () => {
    const tables = await pg.any(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'meta_public'
      ORDER BY table_name
    `);

    const moduleTablesOnly = tables.filter(t => t.table_name.endsWith('_module'));
    
    expect(moduleTablesOnly.length).toBeGreaterThan(15);
    expect(snapshot({ 
      totalTables: tables.length,
      moduleTablesCount: moduleTablesOnly.length 
    })).toMatchSnapshot();
  });

  it('should verify module tables have proper foreign key relationships', async () => {
    // Get all foreign key constraints for module tables
    const fkConstraints = await pg.any(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'meta_public'
        AND tc.table_name LIKE '%_module'
        AND tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `);

    // Should have many foreign key relationships
    expect(fkConstraints.length).toBeGreaterThan(20);

    // Group by foreign table to see what they reference
    const foreignTables = [...new Set(fkConstraints.map(fk => fk.foreign_table_name))];
    expect(foreignTables).toContain('database');
    expect(foreignTables).toContain('schema');
    expect(foreignTables).toContain('table');

    expect(snapshot({ 
      constraintCount: fkConstraints.length,
      foreignTables: foreignTables.sort()
    })).toMatchSnapshot();
  });

  it('should verify specific module table column defaults', async () => {
    // Check that modules have sensible defaults
    const tokensDefaults = await pg.any(`
      SELECT column_name, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'meta_public' 
      AND table_name = 'tokens_module'
      AND column_default IS NOT NULL
      ORDER BY column_name
    `);

    const usersDefaults = await pg.any(`
      SELECT column_name, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'meta_public' 
      AND table_name = 'users_module'
      AND column_default IS NOT NULL
      ORDER BY column_name
    `);

    // Should have some default values set
    expect(tokensDefaults.length).toBeGreaterThan(3);
    expect(usersDefaults.length).toBeGreaterThan(3);

    expect(snapshot({ 
      tokensDefaults,
      usersDefaults
    })).toMatchSnapshot();
  });
}); 