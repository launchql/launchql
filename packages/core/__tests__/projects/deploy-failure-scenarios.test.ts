import { LaunchQLMigrate } from '../../src/migrate/client';
import { MigrateTestFixture, teardownAllPools, TestDatabase } from '../../test-utils';

describe('Deploy Failure Scenarios', () => {
  let fixture: MigrateTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new MigrateTestFixture();
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  afterAll(async () => {
    await teardownAllPools();
  });
  
  test('constraint violation with transaction - automatic rollback', async () => {
    const tempDir = fixture.createPlanFile('test-constraint-fail', [
      { name: 'create_table' },
      { name: 'add_constraint', dependencies: ['create_table'] },
      { name: 'violate_constraint', dependencies: ['add_constraint'] }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'create_table', 
      'CREATE TABLE test_users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE);'
    );
    
    fixture.createScript(tempDir, 'deploy', 'add_constraint', 
      "INSERT INTO test_users (email) VALUES ('test@example.com');"
    );
    
    fixture.createScript(tempDir, 'deploy', 'violate_constraint', 
      "INSERT INTO test_users (email) VALUES ('test@example.com');"
    );
    
    const client = new LaunchQLMigrate(db.config);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: true
    })).rejects.toThrow(/duplicate key value violates unique constraint/);
    
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(0);
    
    expect(await db.exists('table', 'test_users')).toBe(false);
  });
  
  test('constraint violation without transaction - partial deployment', async () => {
    const tempDir = fixture.createPlanFile('test-constraint-partial', [
      { name: 'create_table' },
      { name: 'add_record', dependencies: ['create_table'] },
      { name: 'violate_constraint', dependencies: ['add_record'] },
      { name: 'final_change', dependencies: ['add_record'] }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'create_table', 
      'CREATE TABLE test_products (id SERIAL PRIMARY KEY, sku VARCHAR(50) UNIQUE);'
    );
    
    fixture.createScript(tempDir, 'deploy', 'add_record', 
      "INSERT INTO test_products (sku) VALUES ('PROD-001');"
    );
    
    fixture.createScript(tempDir, 'deploy', 'violate_constraint', 
      "INSERT INTO test_products (sku) VALUES ('PROD-001');"
    );
    
    fixture.createScript(tempDir, 'deploy', 'final_change', 
      "INSERT INTO test_products (sku) VALUES ('PROD-002');"
    );
    
    const client = new LaunchQLMigrate(db.config);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: false
    })).rejects.toThrow(/duplicate key value violates unique constraint/);
    
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(2);
    expect(deployed.map(d => d.change_name)).toEqual(['create_table', 'add_record']);
    
    expect(await db.exists('table', 'test_products')).toBe(true);
    const records = await db.query('SELECT * FROM test_products');
    expect(records.rows).toHaveLength(1);
    expect(records.rows[0].sku).toBe('PROD-001');
    
    const finalRecord = await db.query("SELECT * FROM test_products WHERE sku = 'PROD-002'");
    expect(finalRecord.rows).toHaveLength(0);
  });
  
  test('verify database state after constraint failure', async () => {
    const tempDir = fixture.createPlanFile('test-state-check', [
      { name: 'setup_schema' },
      { name: 'create_constraint_table', dependencies: ['setup_schema'] },
      { name: 'fail_on_constraint', dependencies: ['create_constraint_table'] }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'setup_schema', 
      'CREATE SCHEMA test_schema;'
    );
    
    fixture.createScript(tempDir, 'deploy', 'create_constraint_table', 
      'CREATE TABLE test_schema.orders (id SERIAL PRIMARY KEY, amount DECIMAL(10,2) CHECK (amount > 0));'
    );
    
    fixture.createScript(tempDir, 'deploy', 'fail_on_constraint', 
      'INSERT INTO test_schema.orders (amount) VALUES (-100.00);'
    );
    
    const client = new LaunchQLMigrate(db.config);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: true
    })).rejects.toThrow(/violates check constraint/);
    
    expect(await db.exists('schema', 'test_schema')).toBe(false);
    expect(await db.getDeployedChanges()).toHaveLength(0);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: false
    })).rejects.toThrow(/violates check constraint/);
    
    expect(await db.exists('schema', 'test_schema')).toBe(true);
    expect(await db.exists('table', 'test_schema.orders')).toBe(true);
    
    const records = await db.query('SELECT * FROM test_schema.orders');
    expect(records.rows).toHaveLength(0);
    
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(2);
    expect(deployed.map(d => d.change_name)).toEqual(['setup_schema', 'create_constraint_table']);
  });
});
