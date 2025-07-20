import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';
import { TestDatabase } from '../../test-utils';

describe('Log-Only Deployment', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('logOnly mode records deployment metadata without executing scripts', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags'], true);
    
    expect(await db.exists('schema', 'myapp')).toBe(false);
    expect(await db.exists('schema', 'otherschema')).toBe(false);
    expect(await db.exists('schema', 'metaschema')).toBe(false);
    
    expect(await db.exists('table', 'myapp.users')).toBe(false);
    expect(await db.exists('table', 'myapp.products')).toBe(false);
    expect(await db.exists('table', 'otherschema.users')).toBe(false);
    
    const deploymentRecords = await db.query(`
      SELECT change_name, project 
      FROM launchql_migrate.changes 
      WHERE project LIKE '%my-third%' 
      ORDER BY change_name
    `);
    
    expect(deploymentRecords.rows.length).toBeGreaterThan(0);
    
    const changeNames = deploymentRecords.rows.map((r: any) => r.change_name);
    expect(changeNames).toContain('create_myapp_schema');
    expect(changeNames).toContain('create_users_table');
    expect(changeNames).toContain('create_products_table');
  });

  test('normal deployment after logOnly skips already logged changes', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags'], true);
    
    expect(await db.exists('schema', 'myapp')).toBe(false);
    
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags'], false);
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const deploymentRecords = await db.query(`
      SELECT change_name, COUNT(*) as count
      FROM launchql_migrate.changes 
      WHERE project LIKE '%my-third%' 
      GROUP BY change_name
      HAVING COUNT(*) > 1
    `);
    
    expect(deploymentRecords.rows.length).toBe(0);
  });

  test('logOnly mode with partial deployment records correct subset', async () => {
    await fixture.deployModule('my-first', db.name, ['sqitch', 'simple-w-tags'], true);
    
    const deploymentRecords = await db.query(`
      SELECT change_name, project 
      FROM launchql_migrate.changes 
      WHERE project LIKE '%my-first%'
      ORDER BY change_name
    `);
    
    expect(deploymentRecords.rows.length).toBeGreaterThan(0);
    
    const otherRecords = await db.query(`
      SELECT change_name, project 
      FROM launchql_migrate.changes 
      WHERE project LIKE '%my-third%'
    `);
    
    expect(otherRecords.rows.length).toBe(0);
  });
});
