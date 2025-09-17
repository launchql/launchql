import { CLIDeployTestFixture } from '../test-utils';

jest.setTimeout(30000);

afterAll(async () => {
  const { teardownPgPools } = require('pg-cache');
  await teardownPgPools();
});

describe('CLIDeployTestFixture Migrate', () => {
  let fixture: CLIDeployTestFixture;
  let testDb: any;

  beforeAll(async () => {
    fixture = new CLIDeployTestFixture('stage')
    testDb = await fixture.setupTestDatabase()
  });

  afterAll(async () => {
    await fixture.cleanup();
  });


  it('should emulate terminal commands with database operations', async () => {
    const terminalCommands = `
      lql deploy --no-recursive --database ${testDb.name} --yes --no-usePlan --package unique-names
    `;
    
    const results = await fixture.runTerminalCommands(terminalCommands, {
      database: testDb.name
    }, true);
    
    expect(results).toHaveLength(1);
  });

  it('should emulate terminal commands with database operations usePlan', async () => {
    const terminalCommands = `
      lql deploy --no-recursive --database ${testDb.name} --yes --usePlan --package unique-names
    `;
    
    const results = await fixture.runTerminalCommands(terminalCommands, {
      database: testDb.name
    }, true);
    
    expect(results).toHaveLength(1);
  });
});
