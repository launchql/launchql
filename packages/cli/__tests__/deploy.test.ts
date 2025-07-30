import { CLIDeployTestFixture } from '../test-utils';

jest.setTimeout(30000);

describe('CLI Deploy Command', () => {
  let fixture: CLIDeployTestFixture;

  beforeEach(async () => {
    fixture = new CLIDeployTestFixture('sqitch', 'simple');
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  afterAll(async () => {
    const { teardownPgPools } = require('pg-cache');
    await teardownPgPools();
  });

  it('should execute deploy command with correct arguments', async () => {
    const testDb = await fixture.setupTestDatabase();
    const commands = `lql deploy --database ${testDb.name} --project my-first --to schema_myapp --yes`;
    
    const results = await fixture.runTerminalCommands(commands, {
      database: testDb.name
    }, false);
    
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('cli');
    expect(results[0].result.argv._).toContain('deploy');
    expect(results[0].result.argv.database).toBe(testDb.name);
    expect(results[0].result.argv.project).toBe('my-first');
    expect(results[0].result.argv.to).toBe('schema_myapp');
    expect(results[0].result.argv.yes).toBe(true);
  });

  it('should execute deploy command for all changes', async () => {
    const testDb = await fixture.setupTestDatabase();
    const commands = `lql deploy --database ${testDb.name} --project my-first --yes`;
    
    const results = await fixture.runTerminalCommands(commands, {
      database: testDb.name
    }, false);
    
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('cli');
    expect(results[0].result.argv._).toContain('deploy');
    expect(results[0].result.argv.database).toBe(testDb.name);
    expect(results[0].result.argv.project).toBe('my-first');
    expect(results[0].result.argv.yes).toBe(true);
  });

  it('should execute recursive deploy command', async () => {
    const testDb = await fixture.setupTestDatabase();
    const commands = `
      cd packages/
      lql deploy --recursive --database ${testDb.name} --yes
    `;
    
    const results = await fixture.runTerminalCommands(commands, {
      database: testDb.name
    }, false);
    
    expect(results).toHaveLength(2);
    expect(results[0].type).toBe('cd');
    expect(results[0].result.cwd).toContain('packages');
    
    expect(results[1].type).toBe('cli');
    expect(results[1].result.argv._).toContain('deploy');
    expect(results[1].result.argv.database).toBe(testDb.name);
    expect(results[1].result.argv.recursive).toBe(true);
    expect(results[1].result.argv.yes).toBe(true);
  });

  it('should execute revert command', async () => {
    const testDb = await fixture.setupTestDatabase();
    const revertCommands = `lql revert --database ${testDb.name} --project my-first --yes`;
    
    const results = await fixture.runTerminalCommands(revertCommands, {
      database: testDb.name
    }, false);
    
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('cli');
    expect(results[0].result.argv._).toContain('revert');
    expect(results[0].result.argv.database).toBe(testDb.name);
    expect(results[0].result.argv.project).toBe('my-first');
    expect(results[0].result.argv.yes).toBe(true);
  });

  it('should handle terminal command sequences correctly', async () => {
    const testDb = await fixture.setupTestDatabase();
    const terminalCommands = `
      cd packages/
      lql deploy --recursive --database ${testDb.name} --createdb --yes --project my-first
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
});
