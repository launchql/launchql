import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';

describe('Revert Command', () => {
  let fixture: MigrateTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new MigrateTestFixture();
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });
  
  test('reverts single change', async () => {
    const fixturePath = fixture.setupFixture('simple');
    const client = new LaunchQLMigrate(db.config);
    
    await client.deploy({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
    });
    
    expect(await db.exists('schema', 'test_app')).toBe(true);
    expect(await db.exists('table', 'test_app.users')).toBe(true);
    
    const result = await client.revert({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
      toChange: 'table'
    });
    
    expect(result.reverted).toContain('index');
    expect(result.reverted).toHaveLength(1);
    
    expect(await db.exists('schema', 'test_app')).toBe(true);
    expect(await db.exists('table', 'test_app.users')).toBe(true);
    
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(2);
    expect(deployed.map(d => d.change_name)).toEqual(['schema', 'table']);
  });
  
  test('reverts multiple changes to specified point', async () => {
    const fixturePath = fixture.setupFixture('simple');
    const client = new LaunchQLMigrate(db.config);
    
    await client.deploy({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
    });
    
    expect(await db.exists('schema', 'test_app')).toBe(true);
    expect(await db.exists('table', 'test_app.users')).toBe(true);
    
    const result = await client.revert({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
      toChange: 'schema'
    });
    
    expect(result.reverted).toEqual(['index', 'table']);
    expect(result.reverted).toHaveLength(2);
    
    expect(await db.exists('schema', 'test_app')).toBe(true);
    expect(await db.exists('table', 'test_app.users')).toBe(false);
    
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(1);
    expect(deployed[0].change_name).toBe('schema');
  });
  
  test('reverts all changes when no toChange specified', async () => {
    const fixturePath = fixture.setupFixture('simple');
    const client = new LaunchQLMigrate(db.config);
    
    await client.deploy({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
    });
    
    const result = await client.revert({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
    });
    
    expect(result.reverted).toEqual(['index', 'table', 'schema']);
    
    expect(await db.exists('schema', 'test_app')).toBe(false);
    expect(await db.exists('table', 'test_app.users')).toBe(false);
    
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(0);
  });
  
  test('skips not deployed changes', async () => {
    const fixturePath = fixture.setupFixture('simple');
    const client = new LaunchQLMigrate(db.config);
    
    await client.deploy({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
      toChange: 'table'
    });
    
    const result = await client.revert({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
    });
    
    expect(result.reverted).toEqual(['table', 'schema']);
    expect(result.skipped).toContain('index');
  });
  
  test('handles revert to change that is not deployed', async () => {
    const fixturePath = fixture.setupFixture('simple');
    const client = new LaunchQLMigrate(db.config);
    
    await client.deploy({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
      toChange: 'schema'
    });
    
    const result = await client.revert({
      project: 'test-simple',
      targetDatabase: db.name,
      planPath: join(fixturePath, 'launchql.plan'),
      toChange: 'table'
    });
    
    expect(result.reverted).toHaveLength(0);
    expect(result.skipped).toContain('index');
    
    expect(await db.exists('schema', 'test_app')).toBe(true);
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(1);
    expect(deployed[0].change_name).toBe('schema');
  });
  
  test('rolls back on failure with transaction', async () => {
    const tempDir = fixture.createPlanFile('test-fail', [
      { name: 'good_change' },
      { name: 'bad_change', dependencies: ['good_change'] }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'good_change', 
      'CREATE TABLE test_table (id INT);'
    );
    fixture.createScript(tempDir, 'revert', 'good_change', 
      'DROP TABLE test_table;'
    );
    
    fixture.createScript(tempDir, 'deploy', 'bad_change', 
      'CREATE TABLE bad_table (id INT);'
    );
    fixture.createScript(tempDir, 'revert', 'bad_change', 
      'DROP TABLE bad_table; INVALID SQL SYNTAX HERE;'
    );
    
    const client = new LaunchQLMigrate(db.config);
    
    await client.deploy({
      project: 'test-fail',
      targetDatabase: db.name,
      planPath: join(tempDir, 'launchql.plan'),
    });
    
    await expect(client.revert({
      project: 'test-fail',
      targetDatabase: db.name,
      planPath: join(tempDir, 'launchql.plan'),
      useTransaction: true
    })).rejects.toThrow();
    
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(2);
    
    expect(await db.exists('table', 'test_table')).toBe(true);
    expect(await db.exists('table', 'bad_table')).toBe(true);
  });
  
  test('recursive revert scenario with dependencies', async () => {
    const tempDir = fixture.createPlanFile('test-recursive', [
      { name: 'base_schema' },
      { name: 'base_types', dependencies: ['base_schema'] },
      { name: 'app_schema', dependencies: ['base_schema'] },
      { name: 'app_tables', dependencies: ['app_schema', 'base_types'] },
      { name: 'app_indexes', dependencies: ['app_tables'] }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'base_schema', 'CREATE SCHEMA base;');
    fixture.createScript(tempDir, 'revert', 'base_schema', 'DROP SCHEMA base;');
    
    fixture.createScript(tempDir, 'deploy', 'base_types', 'CREATE TYPE base.status AS ENUM (\'active\', \'inactive\');');
    fixture.createScript(tempDir, 'revert', 'base_types', 'DROP TYPE base.status;');
    
    fixture.createScript(tempDir, 'deploy', 'app_schema', 'CREATE SCHEMA app;');
    fixture.createScript(tempDir, 'revert', 'app_schema', 'DROP SCHEMA app;');
    
    fixture.createScript(tempDir, 'deploy', 'app_tables', 'CREATE TABLE app.users (id INT, status base.status);');
    fixture.createScript(tempDir, 'revert', 'app_tables', 'DROP TABLE app.users;');
    
    fixture.createScript(tempDir, 'deploy', 'app_indexes', 'CREATE INDEX idx_users_status ON app.users(status);');
    fixture.createScript(tempDir, 'revert', 'app_indexes', 'DROP INDEX app.idx_users_status;');
    
    const client = new LaunchQLMigrate(db.config);
    
    // Deploy all changes
    await client.deploy({
      project: 'test-recursive',
      targetDatabase: db.name,
      planPath: join(tempDir, 'launchql.plan'),
    });
    
    const allDeployed = await db.getDeployedChanges();
    expect(allDeployed).toHaveLength(5);
    
    const result = await client.revert({
      project: 'test-recursive',
      targetDatabase: db.name,
      planPath: join(tempDir, 'launchql.plan'),
      toChange: 'base_types'
    });
    
    expect(result.reverted).toEqual(['app_indexes', 'app_tables', 'app_schema']);
    
    const remainingDeployed = await db.getDeployedChanges();
    expect(remainingDeployed).toHaveLength(2);
    expect(remainingDeployed.map(d => d.change_name)).toEqual(['base_schema', 'base_types']);
    
    expect(await db.exists('schema', 'base')).toBe(true);
    expect(await db.exists('schema', 'app')).toBe(false);
  });
});
