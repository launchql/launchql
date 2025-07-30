import { CLIDeployTestFixture } from '../test-utils';

jest.setTimeout(30000);

describe('CLI Forked Deployment with Tag Syntax', () => {
  let fixture: CLIDeployTestFixture;
  let testDb: any;
  let exec: (commands: string) => Promise<any[]>;

  beforeAll(async () => {
    fixture = new CLIDeployTestFixture('sqitch', 'simple-w-tags');
  });

  beforeEach(async () => {
    testDb = await fixture.setupTestDatabase();
    
    exec = (commands: string) => fixture.exec(commands, {
      database: testDb.name
    });
  });

  afterEach(async () => {
  });

  afterAll(async () => {
    await fixture.cleanup();
    const { teardownPgPools } = require('pg-cache');
    await teardownPgPools();
  });

  it('handles forked deployment scenario with tag syntax via CLI', async () => {
    await exec(`lql deploy --database $database --package my-third --yes`);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(true);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(true);
    
    await exec(`lql revert --database $database --package my-first --to @v1.0.0 --yes`);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(false);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(false);
    
    await exec(`lql deploy --database $database --package my-third --yes`);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(true);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(true);
    
    await exec(`lql revert --database $database --package my-first --to @v1.0.0 --yes`);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(false);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(false);
    
    await exec(`lql deploy --database $database --package my-third --yes`);
    
    expect(await testDb.exists('schema', 'metaschema')).toBe(true);
    expect(await testDb.exists('table', 'metaschema.customers')).toBe(true);
  });
});
