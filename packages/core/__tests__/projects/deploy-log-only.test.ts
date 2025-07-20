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
    
    const deploymentRecords = await db.query(`
      SELECT change_name, project 
      FROM launchql_migrate.changes 
      WHERE project LIKE '%my-third%' 
      ORDER BY change_name
    `);
    
    expect(deploymentRecords.rows.length).toBeGreaterThan(0);
  });
});
