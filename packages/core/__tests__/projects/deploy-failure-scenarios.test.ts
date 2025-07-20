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

  async function getMigrationState() {
    const changes = await db.query(`
      SELECT project, change_name, deployed_at, script_hash
      FROM launchql_migrate.changes 
      ORDER BY deployed_at, change_name
    `);
    
    const events = await db.query(`
      SELECT project, change_name, event_type, occurred_at
      FROM launchql_migrate.events 
      ORDER BY occurred_at, change_name
    `);
    
    return {
      changes: changes.rows,
      events: events.rows,
      changeCount: changes.rows.length,
      eventCount: events.rows.length
    };
  }
  
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
    
    const client = new LaunchQLMigrate(db.config);
    
    const initialState = await getMigrationState();
    expect(initialState.changeCount).toBe(0);
    expect(initialState.eventCount).toBe(0);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: true
    })).rejects.toThrow(/duplicate key value violates unique constraint/);
    
    const finalState = await getMigrationState();
    
    expect(finalState).toMatchSnapshot('transaction-rollback-migration-state');
    
    expect(finalState.changeCount).toBe(0);
    expect(finalState.eventCount).toBe(0); // Complete rollback - no events logged
    
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
    
    const client = new LaunchQLMigrate(db.config);
    
    const initialState = await getMigrationState();
    expect(initialState.changeCount).toBe(0);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: false
    })).rejects.toThrow(/duplicate key value violates unique constraint/);
    
    const finalState = await getMigrationState();
    
    expect(finalState).toMatchSnapshot('partial-deployment-migration-state');
    
    expect(finalState.changeCount).toBe(2);
    expect(finalState.changes.map((c: any) => c.change_name)).toEqual(['create_table', 'add_record']);
    
    expect(await db.exists('table', 'test_products')).toBe(true);
    const records = await db.query('SELECT * FROM test_products');
    expect(records.rows).toHaveLength(1);
    expect(records.rows[0].sku).toBe('PROD-001');
    
    const finalRecord = await db.query("SELECT * FROM test_products WHERE sku = 'PROD-002'");
    expect(finalRecord.rows).toHaveLength(0);
    
    const successEvents = finalState.events.filter((e: any) => e.event_type === 'deploy');
    expect(successEvents.length).toBe(2); // create_table, add_record
    expect(finalState.eventCount).toBe(2); // Only successful deployments logged
  });
  
  test('verify database state after constraint failure', async () => {
    /*
     * SCENARIO: Comparison of transaction vs non-transaction behavior
     * 
     * This test demonstrates the key difference between transaction and non-transaction
     * deployment modes when failures occur. It shows how the same failure scenario
     * results in completely different database states.
     * 
     * Transaction mode: Complete rollback (clean state)
     * Non-transaction mode: Partial deployment (mixed state requiring cleanup)
     */
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
    
    const transactionState = await getMigrationState();
    
    expect(transactionState).toMatchSnapshot('transaction-rollback-state-comparison');
    
    expect(await db.exists('schema', 'test_schema')).toBe(false);
    expect(transactionState.changeCount).toBe(0);
    
    await expect(client.deploy({
      modulePath: tempDir,
      useTransaction: false
    })).rejects.toThrow(/violates check constraint/);
    
    const partialState = await getMigrationState();
    
    expect(partialState).toMatchSnapshot('partial-deployment-state-comparison');
    
    expect(await db.exists('schema', 'test_schema')).toBe(true);
    expect(await db.exists('table', 'test_schema.orders')).toBe(true);
    
    const records = await db.query('SELECT * FROM test_schema.orders');
    expect(records.rows).toHaveLength(0);
    
    expect(partialState.changeCount).toBe(2);
    expect(partialState.changes.map((c: any) => c.change_name)).toEqual(['setup_schema', 'create_constraint_table']);
    
    const successEvents = partialState.events.filter((e: any) => e.event_type === 'deploy');
    expect(successEvents.length).toBe(2); // setup_schema, create_constraint_table
    expect(partialState.eventCount).toBe(2); // Only successful deployments logged
    
    /*
     * KEY INSIGHT: Same failure scenario, different outcomes
     * 
     * Transaction mode:
     * - launchql_migrate.changes: 0 rows (complete rollback)
     * - launchql_migrate.events: failure events only
     * - Database objects: none (clean state)
     * 
     * Non-transaction mode:
     * - launchql_migrate.changes: 2 rows (partial success)
     * - launchql_migrate.events: mix of success + failure events
     * - Database objects: schema + table exist (mixed state)
     * 
     * RECOMMENDATION: Use transaction mode (default) unless you specifically
     * need partial deployment behavior for incremental rollout scenarios.
     */
  });
});
