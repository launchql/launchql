import { CLIDeployTestFixture } from '../test-utils';

jest.setTimeout(30000);

describe('CLI Deploy Command', () => {
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

  it('should deploy single schema via CLI', async () => {
    const commands = `lql deploy --database ${testDb.name} --package my-first --to schema_myfirstapp --yes`;
    
    await fixture.runTerminalCommands(commands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'myfirstapp')).toBe(true);
    
    const deployedChanges = await testDb.getDeployedChanges();
    expect(deployedChanges.find((change: any) => change.package === 'my-first' && change.change_name === 'schema_myfirstapp')).toBeTruthy();
    expect(deployedChanges.find((change: any) => change.package === 'my-second')).toBeFalsy();
    expect(deployedChanges.find((change: any) => change.package === 'my-third')).toBeFalsy();
  });

  it('should deploy full project with tables via CLI', async () => {
    const commands = `lql deploy --database ${testDb.name} --package my-first --yes`;
    
    await fixture.runTerminalCommands(commands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'myfirstapp')).toBe(true);
    expect(await testDb.exists('table', 'myfirstapp.users')).toBe(true);
    expect(await testDb.exists('table', 'myfirstapp.products')).toBe(true);
    
    const deployedChanges = await testDb.getDeployedChanges();
    expect(deployedChanges.some((change: any) => change.package === 'my-first')).toBe(true);
    expect(deployedChanges.find((change: any) => change.package === 'my-second')).toBeFalsy();
    expect(deployedChanges.find((change: any) => change.package === 'my-third')).toBeFalsy();
  });

  it('should deploy multiple packages via CLI', async () => {
    const commands = `
      cd packages/
      lql deploy --database ${testDb.name} --package my-first --yes
      lql deploy --database ${testDb.name} --package my-second --yes
      lql deploy --database ${testDb.name} --package my-third --yes
    `;
    
    await fixture.runTerminalCommands(commands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'myfirstapp')).toBe(true);
    expect(await testDb.exists('schema', 'mysecondapp')).toBe(true);
    expect(await testDb.exists('schema', 'mythirdapp')).toBe(true);
    expect(await testDb.exists('table', 'myfirstapp.users')).toBe(true);
    expect(await testDb.exists('table', 'mysecondapp.users')).toBe(true);
    expect(await testDb.exists('table', 'mythirdapp.customers')).toBe(true);
    
    const deployedChanges = await testDb.getDeployedChanges();
    expect(deployedChanges.some((change: any) => change.package === 'my-first')).toBe(true);
    expect(deployedChanges.some((change: any) => change.package === 'my-second')).toBe(true);
    expect(deployedChanges.some((change: any) => change.package === 'my-third')).toBe(true);
  });

  it('should revert changes via CLI', async () => {
    const deployCommands = `lql deploy --database ${testDb.name} --package my-first --yes`;
    await fixture.runTerminalCommands(deployCommands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'myfirstapp')).toBe(true);
    expect(await testDb.exists('table', 'myfirstapp.users')).toBe(true);
    expect(await testDb.exists('table', 'myfirstapp.products')).toBe(true);
    
    const revertCommands = `lql revert --database $database  --package my-first --yes`;
    await fixture.runTerminalCommands(revertCommands, {
      database: testDb.name
    }, true);
    
    expect(await testDb.exists('schema', 'myfirstapp')).toBe(false);
    expect(await testDb.exists('table', 'myfirstapp.users')).toBe(false);
    expect(await testDb.exists('table', 'myfirstapp.products')).toBe(false);
  });
});
