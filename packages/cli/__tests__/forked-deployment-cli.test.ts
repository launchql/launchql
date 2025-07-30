import { CLIDeployTestFixture } from '../test-utils';

jest.setTimeout(30000);

describe('CLI Forked Deployment with Tag Syntax', () => {
  let fixture: CLIDeployTestFixture;
  let testDb: any;

  beforeAll(async () => {
    fixture = new CLIDeployTestFixture('sqitch', 'simple-w-tags');
  });

  beforeEach(async () => {
    testDb = await fixture.setupTestDatabase();
  });

  afterEach(async () => {
  });

  afterAll(async () => {
    await fixture.cleanup();
    const { teardownPgPools } = require('pg-cache');
    await teardownPgPools();
  });

  it('handles forked deployment scenario with tag syntax via CLI', async () => {
    const deployCommands = `lql deploy --database ${testDb.name} --package my-third --yes`;
    await fixture.runTerminalCommands(deployCommands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(true);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(true);
    
    const revertCommands = `lql revert --database ${testDb.name} --package my-first --to @v1.0.0 --yes`;
    await fixture.runTerminalCommands(revertCommands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(false);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(false);
    
    const redeployCommands = `lql deploy --database ${testDb.name} --package my-third --yes`;
    await fixture.runTerminalCommands(redeployCommands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(true);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(true);
    
    const revertCommands2 = `lql revert --database ${testDb.name} --package my-first --to @v1.0.0 --yes`;
    await fixture.runTerminalCommands(revertCommands2, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(false);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(false);
    
    const finalDeployCommands = `lql deploy --database ${testDb.name} --package my-third --yes`;
    await fixture.runTerminalCommands(finalDeployCommands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(true);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(true);
  });
});
