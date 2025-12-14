
import { PgpmMigrate } from '../../src/migrate/client';
import { MigrateTestFixture, teardownAllPools,TestDatabase } from '../../test-utils';

describe('Deploy Command', () => {
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
  
  test('deploys single change', async () => {
    const fixturePath = fixture.setupFixture(['migrate', 'simple']);
    const client = new PgpmMigrate(db.config);
    
    // Deploy only the schema change
    const result = await client.deploy({
      modulePath: fixturePath,
      toChange: 'schema'
    });
    
    expect(result.deployed).toContain('schema');
    expect(result.deployed).toHaveLength(1);
    expect(await db.exists('schema', 'test_app')).toBe(true);
    
    // Verify it was recorded
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(1);
    expect(deployed[0]).toMatchObject({
      package: 'test-simple',
      change_name: 'schema'
    });
  });
  
  test('deploys changes in dependency order', async () => {
    const fixturePath = fixture.setupFixture(['migrate', 'simple']);
    const client = new PgpmMigrate(db.config);
    
    // Deploy all changes
    const result = await client.deploy({
      modulePath: fixturePath,
    });
    
    expect(result.deployed).toEqual(['schema', 'table', 'index']);
    
    // Verify all objects exist
    expect(await db.exists('schema', 'test_app')).toBe(true);
    expect(await db.exists('table', 'test_app.users')).toBe(true);
    
    // Verify dependencies were recorded
    const tableDeps = await db.getDependencies('test-simple', 'table');
    expect(tableDeps).toContain('test-simple:schema');
    
    const indexDeps = await db.getDependencies('test-simple', 'index');
    expect(indexDeps).toContain('test-simple:table');
  });
  
  test('skips already deployed changes', async () => {
    const fixturePath = fixture.setupFixture(['migrate', 'simple']);
    const client = new PgpmMigrate(db.config);
    
    // First deployment
    const result1 = await client.deploy({
      modulePath: fixturePath,
      toChange: 'table'
    });
    
    expect(result1.deployed).toEqual(['schema', 'table']);
    
    // Second deployment - should skip already deployed
    const result2 = await client.deploy({
      modulePath: fixturePath,
    });
    
    expect(result2.deployed).toEqual(['index']);
    expect(result2.skipped).toEqual(['schema', 'table']);
  });
  
  test('rolls back on failure with transaction', async () => {
    const tempDir = fixture.createPlanFile('test-fail', [
      { name: 'good_change' },
      { name: 'bad_change', dependencies: ['good_change'] }
    ]);
    
    // Create good deploy script
    fixture.createScript(tempDir, 'deploy', 'good_change', 
      'CREATE TABLE test_table (id INT);'
    );
    
    // Create bad deploy script with syntax error
    fixture.createScript(tempDir, 'deploy', 'bad_change', 
      'CREATE TABLE bad_table (id INT; -- syntax error'
    );
    
    const client = new PgpmMigrate(db.config);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: true // default
    })).rejects.toThrow();
    
    // Verify nothing was deployed due to rollback
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(0);
    
    // Verify table doesn't exist
    expect(await db.exists('table', 'test_table')).toBe(false);
  });
  
  test('continues on failure without transaction', async () => {
    const tempDir = fixture.createPlanFile('test-fail', [
      { name: 'good_change' },
      { name: 'bad_change', dependencies: ['good_change'] },
      { name: 'another_good', dependencies: ['good_change'] }
    ]);
    
    // Create scripts
    fixture.createScript(tempDir, 'deploy', 'good_change', 
      'CREATE TABLE test_table (id INT);'
    );
    fixture.createScript(tempDir, 'deploy', 'bad_change', 
      'CREATE TABLE bad_table (id INT; -- syntax error'
    );
    fixture.createScript(tempDir, 'deploy', 'another_good', 
      'CREATE TABLE another_table (id INT);'
    );
    
    const client = new PgpmMigrate(db.config);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: false
    })).rejects.toThrow();
    
    // Verify first change was deployed
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(1);
    expect(deployed[0].change_name).toBe('good_change');
    
    // Verify first table exists
    expect(await db.exists('table', 'test_table')).toBe(true);
    
    // Verify third change was not attempted (stopped at error)
    expect(await db.exists('table', 'another_table')).toBe(false);
  });
});
