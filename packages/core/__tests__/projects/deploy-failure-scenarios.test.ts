import { PgpmMigrate } from '../../src/migrate/client';
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
    /*
     * SCENARIO: Transaction-based deployment with constraint violation
     * 
     * This test demonstrates LaunchQL's automatic rollback behavior when useTransaction: true (default).
     * When ANY change fails during deployment, ALL changes are automatically rolled back.
     * 
     * Expected behavior:
     * - All 3 changes attempted in single transaction
     * - Constraint violation on 3rd change triggers complete rollback
     * - Database state: clean (as if deployment never happened)
     * - Migration tracking: zero deployed changes, failure events logged
     */
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
    
    const client = new PgpmMigrate(db.config);
    
    const initialState = await db.getMigrationState();
    expect(initialState.changeCount).toBe(0);
    expect(initialState.eventCount).toBe(0);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: true
    })).rejects.toThrow(/duplicate key value violates unique constraint/);
    
    const finalState = await db.getMigrationState();
    
    expect(finalState).toMatchSnapshot('transaction-rollback-migration-state');
    
    expect(finalState.changeCount).toBe(0);
    expect(finalState.eventCount).toBe(1); // Now expect deploy failure event to be logged
    expect(finalState.events[0].event_type).toBe('deploy');
    expect(finalState.events[0].error_message).toContain('duplicate key value violates unique constraint');
    
    expect(await db.exists('table', 'test_users')).toBe(false);
  });
  
  test('constraint violation without transaction - partial deployment', async () => {
    /*
     * SCENARIO: Non-transaction deployment with constraint violation
     * 
     * This test demonstrates LaunchQL's behavior when useTransaction: false.
     * Each change is deployed individually - successful changes remain deployed
     * even when later changes fail. Manual cleanup is required.
     * 
     * Expected behavior:
     * - Changes deployed one-by-one (no transaction wrapper)
     * - First 2 changes succeed and remain deployed
     * - 3rd change fails on constraint violation, deployment stops
     * - 4th change never attempted (deployment stops at first failure)
     * - Database state: partial (successful changes persist)
     * - Migration tracking: shows successful deployments + failure events
     */
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
    
    const client = new PgpmMigrate(db.config);
    
    const initialState = await db.getMigrationState();
    expect(initialState.changeCount).toBe(0);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: false
    })).rejects.toThrow(/duplicate key value violates unique constraint/);
    
    const finalState = await db.getMigrationState();
    
    expect(finalState).toMatchSnapshot('partial-deployment-migration-state');
    
    expect(finalState.changeCount).toBe(2);
    expect(finalState.changes.map((c: any) => c.change_name)).toEqual(['create_table', 'add_record']);
    
    expect(await db.exists('table', 'test_products')).toBe(true);
    const records = await db.query('SELECT * FROM test_products');
    expect(records.rows).toHaveLength(1);
    expect(records.rows[0].sku).toBe('PROD-001');
    
    const finalRecord = await db.query("SELECT * FROM test_products WHERE sku = 'PROD-002'");
    expect(finalRecord.rows).toHaveLength(0);
    
    const successEvents = finalState.events.filter((e: any) => e.event_type === 'deploy' && !e.error_message);
    expect(successEvents.length).toBe(2); // create_table, add_record
    const failEvents = finalState.events.filter((e: any) => e.event_type === 'deploy' && e.error_message);
    expect(failEvents.length).toBe(1); // violate_constraint failure logged
    expect(finalState.eventCount).toBe(3); // 2 successful deployments + 1 failure
  });
  
  test('transaction mode - complete rollback on constraint failure', async () => {
    /*
     * SCENARIO: Transaction-based deployment with constraint failure
     * 
     * This test demonstrates LaunchQL's complete rollback behavior when useTransaction: true (default).
     * When ANY change fails during deployment, ALL changes are automatically rolled back.
     * 
     * Expected behavior:
     * - All 3 changes attempted in single transaction
     * - Constraint violation on 3rd change triggers complete rollback
     * - Database state: clean (as if deployment never happened)
     * - Migration tracking: zero deployed changes, failure event logged outside transaction
     */
    const tempDir = fixture.createPlanFile('test-transaction-rollback', [
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
    
    const client = new PgpmMigrate(db.config);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: true
    })).rejects.toThrow(/violates check constraint/);
    
    const finalState = await db.getMigrationState();
    
    expect(finalState).toMatchSnapshot('transaction-mode-constraint-failure');
    
    expect(await db.exists('schema', 'test_schema')).toBe(false);
    expect(finalState.changeCount).toBe(0);
    expect(finalState.eventCount).toBe(1); // Deploy failure event logged outside transaction
    expect(finalState.events[0].event_type).toBe('deploy');
    expect(finalState.events[0].error_message).toContain('violates check constraint');
    
    /*
     * KEY INSIGHT: Transaction mode provides complete rollback
     * 
     * - pgpm_migrate.changes: 0 rows (complete rollback)
     * - pgpm_migrate.events: 1 failure event (logged outside transaction)
     * - Database objects: none (clean state)
     * 
     * RECOMMENDATION: Use transaction mode (default) for atomic deployments
     * where you want all-or-nothing behavior.
     */
  });

  test('non-transaction mode - partial deployment on constraint failure', async () => {
    /*
     * SCENARIO: Non-transaction deployment with constraint failure
     * 
     * This test demonstrates LaunchQL's partial deployment behavior when useTransaction: false.
     * Each change is deployed individually - successful changes remain deployed
     * even when later changes fail. Deployment stops at first failure.
     * 
     * Expected behavior:
     * - Changes deployed one-by-one (no transaction wrapper)
     * - First 2 changes succeed and remain deployed
     * - 3rd change fails on constraint violation, deployment stops
     * - Database state: partial (successful changes persist)
     * - Migration tracking: shows successful deployments + failure event
     */
    const tempDir = fixture.createPlanFile('test-nontransaction-partial', [
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
    
    const client = new PgpmMigrate(db.config);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: false
    })).rejects.toThrow(/violates check constraint/);
    
    const finalState = await db.getMigrationState();
    
    expect(finalState).toMatchSnapshot('non-transaction-mode-constraint-failure');
    
    expect(await db.exists('schema', 'test_schema')).toBe(true);
    expect(await db.exists('table', 'test_schema.orders')).toBe(true);
    
    const records = await db.query('SELECT * FROM test_schema.orders');
    expect(records.rows).toHaveLength(0);
    
    expect(finalState.changeCount).toBe(2);
    expect(finalState.changes.map((c: any) => c.change_name)).toEqual(['setup_schema', 'create_constraint_table']);
    
    const successEvents = finalState.events.filter((e: any) => e.event_type === 'deploy' && !e.error_message);
    expect(successEvents.length).toBe(2); // setup_schema, create_constraint_table
    const failEvents = finalState.events.filter((e: any) => e.event_type === 'deploy' && e.error_message);
    expect(failEvents.length).toBe(1); // fail_on_constraint failure logged
    expect(finalState.eventCount).toBe(3); // 2 successful deployments + 1 failure
    
    /*
     * KEY INSIGHT: Non-transaction mode provides partial deployment
     * 
     * - pgpm_migrate.changes: 2 rows (partial success)
     * - pgpm_migrate.events: 2 success + 1 failure event
     * - Database objects: schema + table exist (mixed state)
     * 
     * IMPORTANT: Deployment stops immediately at first failure, just like transaction mode.
     * The difference is in state persistence, not error handling behavior.
     * 
     * RECOMMENDATION: Use non-transaction mode only when you specifically
     * need partial deployment behavior for incremental rollout scenarios.
     */
  });

  test('verify failure - non-existent table reference', async () => {
    /*
     * SCENARIO: Verify script references a table that doesn't exist
     * 
     * This test demonstrates LaunchQL's verify failure behavior when a verify script
     * tries to check a table that was never created or was dropped.
     * 
     * Expected behavior:
     * - Deploy succeeds (creates a simple table)
     * - Verify fails because script references non-existent table
     * - Failure event logged with detailed error information
     */
    const tempDir = fixture.createPlanFile('test-verify-fail', [
      { name: 'create_simple_table' }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'create_simple_table', 
      'CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));'
    );
    
    fixture.createScript(tempDir, 'verify', 'create_simple_table', 
      'SELECT 1 FROM non_existent_table LIMIT 1;'
    );
    
    const client = new PgpmMigrate(db.config);
    
    await client.deploy({
      modulePath: tempDir,
      useTransaction: true
    });
    
    const deployState = await db.getMigrationState();
    expect(deployState.changeCount).toBe(1);
    expect(await db.exists('table', 'users')).toBe(true);
    
    await expect(client.verify({
      modulePath: tempDir
    })).rejects.toThrow('Verification failed: 1 change(s): create_simple_table');
    
    const finalState = await db.getMigrationState();
    
    expect(finalState).toMatchSnapshot('verify-failure-non-existent-table');
    
    // Should have deploy success event + verify failure event
    const verifyEvents = finalState.events.filter((e: any) => e.event_type === 'verify');
    expect(verifyEvents.length).toBe(1);
    expect(verifyEvents[0].error_message).toBe('Verification failed for create_simple_table');
    expect(verifyEvents[0].error_code).toBe('VERIFICATION_FAILED');
  });
});
