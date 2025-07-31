import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

/**
 * LOG-ONLY DEPLOYMENT USE CASE & SETUP
 * 
 * Log-only deployment is used when you have an existing database that already contains
 * schema changes, but you want to start using LaunchQL for future migrations.
 * 
 * What it does:
 * - Records deployment metadata in the migration tracking tables
 * - Does NOT actually execute the SQL scripts
 * - Marks changes as "deployed" without running them
 * 
 * When to use:
 * - Converting an existing database to use LaunchQL
 * - The database already has schema objects that match your migration scripts
 * - You need to "catch up" the migration history without re-creating existing objects
 * 
 * Setup process for existing database:
 * 1. Install launchql and setup launchql directory structure
 * 2. Dump your existing schema into initial migration files
 * 3. Create and tag your migrations (e.g., as v1)
 * 4. Run your FIRST deployment with --log-only flag against existing database
 *    - This records the migrations as deployed without executing them
 * 5. Future deployments can run normally (without --log-only)
 */

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
    // Deploy in log-only mode - this simulates deploying to an existing database
    // where the schema objects already exist and we just want to record the
    // migration history without actually running the SQL scripts
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags'], true);
    
    // Verify that the actual schema objects were NOT created
    // (because log-only mode doesn't execute the scripts)
    expect(await db.exists('schema', 'myfirstapp')).toBe(false);
    
    // Verify that the migration metadata WAS recorded
    // This shows the changes were logged as deployed in the tracking tables
    const deploymentRecords = await db.query(`
      SELECT change_name, package 
        FROM launchql_migrate.changes 
    `);

    // All 8 changes from the test fixture should be recorded as deployed
    expect(deploymentRecords.rows.length).toBe(8);
  });
});
