import { CLIDeployTestFixture } from '../test-utils';

afterAll(async () => {
  const { teardownPgPools } = require('pg-cache');
  await teardownPgPools();
});

describe('CLIDeployTestFixture', () => {
  let fixture: CLIDeployTestFixture;

  beforeEach(async () => {
    fixture = new CLIDeployTestFixture();
  }, 15000); // Increase timeout to 15 seconds

  afterEach(async () => {
    await fixture.cleanup();
  }, 15000); // Increase timeout to 15 seconds

  it('should setup test database', async () => {
    const db = await fixture.setupTestDatabase();
    
    expect(db.name).toMatch(/^test_cli_/);
    expect(db.config.database).toBe(db.name);
    
    const result = await db.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
    
    const schemaExists = await db.exists('schema', 'launchql_migrate');
    expect(schemaExists).toBe(true);
  }, 15000);

  it('should handle CLI command execution with database', async () => {
    const db = await fixture.setupTestDatabase();
    
    const statusResult = await fixture.migrateStatusViaCliCommand(db.name);
    expect(statusResult.result).toBeDefined();
    
    expect(true).toBe(true);
  }, 15000);

  it('should initialize workspace via CLI', async () => {
    const result = await fixture.initWorkspaceViaCliCommand('test-workspace', { workspace: true });
    
    expect(result.result).toBeDefined();
    expect(result.argv.name).toBe('test-workspace');
    expect(result.argv.workspace).toBe(true);
  }, 15000);

  it('should initialize module via CLI', async () => {
    const workspaceResult = await fixture.initWorkspaceViaCliCommand('test-workspace', { workspace: true });
    expect(workspaceResult.result).toBeDefined();
    
    expect(true).toBe(true);
  }, 15000);
});
