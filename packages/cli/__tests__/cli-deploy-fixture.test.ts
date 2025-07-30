import { CLIDeployTestFixture } from '../test-utils';

jest.setTimeout(30000);

afterAll(async () => {
  const { teardownPgPools } = require('pg-cache');
  await teardownPgPools();
});

describe('CLIDeployTestFixture', () => {
  let fixture: CLIDeployTestFixture;
  let testDb: any;

  beforeAll(async () => {
    fixture = new CLIDeployTestFixture();
    testDb = await fixture.setupTestDatabase();
  });

  afterAll(async () => {
    await fixture.cleanup();
  });

  it('should setup test database', async () => {
    expect(testDb.name).toMatch(/^test_cli_/);
    expect(testDb.config.database).toBe(testDb.name);
    
    const result = await testDb.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
    
    const schemaExists = await testDb.exists('schema', 'launchql_migrate');
    expect(schemaExists).toBe(true);
  });

  it('should handle CLI command execution with database', async () => {
    const commands = `lql migrate status --database ${testDb.name}`;
    const results = await fixture.runTerminalCommands(commands, { database: testDb.name }, false);
    
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('cli');
    expect(results[0].result.argv._).toContain('migrate');
    expect(results[0].result.argv._).toContain('status');
    expect(results[0].result.argv.database).toBe(testDb.name);
  });

  it('should initialize workspace via CLI', async () => {
    const commands = `lql init test-workspace --workspace`;
    const results = await fixture.runTerminalCommands(commands, {}, false);
    
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('cli');
    expect(results[0].result.argv._).toContain('init');
    expect(results[0].result.argv._).toContain('test-workspace');
    expect(results[0].result.argv.workspace).toBe(true);
  });

  it('should initialize module via CLI', async () => {
    const commands = `lql init test-module`;
    const results = await fixture.runTerminalCommands(commands, {}, false);
    
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('cli');
    expect(results[0].result.argv._).toContain('init');
    expect(results[0].result.argv._).toContain('test-module');
  });

  it('should emulate terminal commands with database operations', async () => {
    const terminalCommands = `
      cd packages/
      lql deploy --recursive --database ${testDb.name} --yes --project my-first
      lql revert --recursive --database ${testDb.name} --yes --project my-first
    `;
    
    const results = await fixture.runTerminalCommands(terminalCommands, {
      database: testDb.name
    }, false);
    
    expect(results).toHaveLength(3);
    
    expect(results[0].type).toBe('cd');
    expect(results[0].result.cwd).toContain('packages');
    
    expect(results[1].type).toBe('cli');
    expect(results[1].result.argv._).toContain('deploy');
    expect(results[1].result.argv.database).toBe(testDb.name);
    expect(results[1].result.argv.recursive).toBe(true);
    expect(results[1].result.argv.yes).toBe(true);
    expect(results[1].result.argv.project).toBe('my-first');
    
    expect(results[2].type).toBe('cli');
    expect(results[2].result.argv._).toContain('revert');
    expect(results[2].result.argv.database).toBe(testDb.name);
    expect(results[2].result.argv.recursive).toBe(true);
    expect(results[2].result.argv.yes).toBe(true);
    expect(results[2].result.argv.project).toBe('my-first');
  });

  it('should work with fixture directories like sqitch-w-tags', async () => {
    const commands = `
      cd packages/
      lql deploy --recursive --database test_db --createdb --yes --project my-first
    `;
    
    const results = await fixture.runTerminalCommands(commands, {
      database: 'test_db'
    }, false);
    
    expect(results).toHaveLength(2);
    
    expect(results[0].type).toBe('cd');
    expect(results[0].result.cwd).toContain('packages');
    
    expect(results[1].type).toBe('cli');
    expect(results[1].result.argv._).toContain('deploy');
    expect(results[1].result.argv.database).toBe('test_db');
    expect(results[1].result.argv.recursive).toBe(true);
    expect(results[1].result.argv.yes).toBe(true);
    expect(results[1].result.argv.project).toBe('my-first');
  });
});
