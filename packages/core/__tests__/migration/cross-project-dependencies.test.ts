import { join } from 'path';

import { PgpmMigrate } from '../../src/migrate/client';
import { MigrateTestFixture, teardownAllPools,TestDatabase } from '../../test-utils';

describe('Cross-Project Dependencies', () => {
  let fixture: MigrateTestFixture;
  let db: TestDatabase;
  let client: PgpmMigrate;
  
  beforeEach(async () => {
    fixture = new MigrateTestFixture();
    db = await fixture.setupTestDatabase();
    client = new PgpmMigrate(db.config);
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  afterAll(async () => {
    await teardownAllPools();
  });
  
  test('deploys cross-project dependencies', async () => {
    const basePath = fixture.setupFixture(['migrate', 'cross-project']);
    
    // First deploy project-a
    const resultA = await client.deploy({
      modulePath: join(basePath, 'project-a'),
    });
    
    expect(resultA.deployed).toEqual(['base_schema', 'base_types']);
    expect(await db.exists('schema', 'base')).toBe(true);
    
    // Then deploy project-b which depends on project-a
    const resultB = await client.deploy({
      modulePath: join(basePath, 'project-b'),
    });
    
    expect(resultB.deployed).toEqual(['app_schema', 'app_tables']);
    expect(await db.exists('schema', 'app')).toBe(true);
    expect(await db.exists('table', 'app.items')).toBe(true);
    
    // Verify cross-project dependencies were recorded
    const appSchemaDeps = await db.getDependencies('project-b', 'app_schema');
    expect(appSchemaDeps).toContain('project-a:base_schema');
    
    const appTablesDeps = await db.getDependencies('project-b', 'app_tables');
    expect(appTablesDeps).toContain('project-a:base_types');
  });
  
  test('fails deployment when cross-project dependency missing', async () => {
    const basePath = fixture.setupFixture(['migrate', 'cross-project']);
    
    // Try to deploy project-b without project-a
    await expect(client.deploy({
      modulePath: join(basePath, 'project-b'),
    })).rejects.toThrow(/project-a:base_schema/);
    
    // Verify nothing was deployed
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(0);
  });
  
  test('prevents revert of changes with cross-project dependents', async () => {
    const basePath = fixture.setupFixture(['migrate', 'cross-project']);
    
    // Deploy both projects
    await client.deploy({
      modulePath: join(basePath, 'project-a'),
    });
    
    await client.deploy({
      modulePath: join(basePath, 'project-b'),
    });
    
    // Try to revert project-a:base_types which project-b depends on
    // Note: toChange means "revert TO this change", so to revert base_types we revert to base_schema
    await expect(client.revert({
      modulePath: join(basePath, 'project-a'),
      toChange: 'base_schema'
    })).rejects.toThrow(/Cannot revert base_types: required by project-b:app_tables/);
    
    // Verify nothing was reverted
    expect(await db.exists('schema', 'base')).toBe(true);
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(4); // All 4 changes still deployed
  });
  
  test('lists cross-project dependents correctly', async () => {
    const basePath = fixture.setupFixture(['migrate', 'cross-project']);
    
    // Deploy both projects
    await client.deploy({
      modulePath: join(basePath, 'project-a'),
    });
    
    await client.deploy({
      modulePath: join(basePath, 'project-b'),
    });
    
    // Query dependents using the SQL function
    const result = await db.query(
      `SELECT * FROM pgpm_migrate.get_dependents($1, $2)`,
      ['project-a', 'base_schema']
    );
    
    expect(result.rows).toContainEqual({
      package: 'project-b',
      change_name: 'app_schema',
      dependency: 'project-a:base_schema'
    });
  });
  
  test('handles complex cross-project dependency chains', async () => {
    // Create a more complex scenario
    const projectA = fixture.createPlanFile('complex-a', [
      { name: 'base' },
      { name: 'utils', dependencies: ['base'] }
    ]);
    
    const projectB = fixture.createPlanFile('complex-b', [
      { name: 'schema', dependencies: ['complex-a:base'] },
      { name: 'types', dependencies: ['schema', 'complex-a:utils'] }
    ]);
    
    const projectC = fixture.createPlanFile('complex-c', [
      { name: 'app', dependencies: ['complex-b:schema'] },
      { name: 'tables', dependencies: ['app', 'complex-b:types', 'complex-a:utils'] }
    ]);
    
    // Create minimal deploy and revert scripts
    ['base', 'utils'].forEach(name => {
      fixture.createScript(projectA, 'deploy', name, `SELECT 1; -- ${name}`);
      fixture.createScript(projectA, 'revert', name, `SELECT 1; -- revert ${name}`);
    });
    ['schema', 'types'].forEach(name => {
      fixture.createScript(projectB, 'deploy', name, `SELECT 1; -- ${name}`);
      fixture.createScript(projectB, 'revert', name, `SELECT 1; -- revert ${name}`);
    });
    ['app', 'tables'].forEach(name => {
      fixture.createScript(projectC, 'deploy', name, `SELECT 1; -- ${name}`);
      fixture.createScript(projectC, 'revert', name, `SELECT 1; -- revert ${name}`);
    });
    
    // Deploy in order
    await client.deploy({
      modulePath: projectA,
    });
    
    await client.deploy({
      modulePath: projectB,
    });
    
    await client.deploy({
      modulePath: projectC,
    });
    
    // Verify all deployed
    const deployed = await db.getDeployedChanges();
    expect(deployed).toHaveLength(6);
    
    // Try to revert a change that many depend on
    // Note: to revert 'utils', we revert TO 'base' (which keeps base but reverts utils)
    await expect(client.revert({
      modulePath: projectA,
      toChange: 'base'
    })).rejects.toThrow(/Cannot revert utils: required by/);
  });
});
