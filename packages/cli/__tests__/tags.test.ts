import { CLIDeployTestFixture } from '../test-utils';

jest.setTimeout(30000);

describe('CLI Tag Command', () => {
  let fixture: CLIDeployTestFixture;
  let testDb: any;
  let exec: (commands: string) => Promise<any[]>;

  beforeAll(async () => {
    fixture = new CLIDeployTestFixture('sqitch', 'simple');
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

  it('adds tag to latest change in current package', async () => {
    await exec(`lql deploy --database $database --package my-first --yes`);
    
    await exec(`lql tag v1.2.0 --package my-first --yes`);
    
    await exec(`lql deploy --database $database --package my-first --to @v1.2.0 --yes`);
    
    expect(await testDb.exists('schema', 'myfirstapp')).toBe(true);
  });

  it('adds tag to specific change in package', async () => {
    await exec(`lql deploy --database $database --package my-second --yes`);
    
    await exec(`lql tag v2.2.0 --package my-second --changeName create_table --yes`);
    
    await exec(`lql revert --database $database --package my-second --to @v2.2.0 --yes`);
    
    expect(await testDb.exists('schema', 'mysecondapp')).toBe(true);
  });

  it('handles tag with comment', async () => {
    await exec(`lql deploy --database $database --package my-first --yes`);
    
    await exec(`lql tag v1.3.0 --package my-first --comment "Release with bug fixes" --yes`);
    
    await exec(`lql deploy --database $database --package my-first --to @v1.3.0 --yes`);
    
    expect(await testDb.exists('schema', 'myfirstapp')).toBe(true);
  });

  it('prevents duplicate tag names', async () => {
    await exec(`lql deploy --database $database --package my-first --yes`);
    
    await exec(`lql tag v1.4.0 --package my-first --yes`);
    
    try {
      await exec(`lql tag v1.4.0 --package my-first --yes`);
      fail('Expected duplicate tag to throw error');
    } catch (error) {
      expect((error as Error).message).toContain('already exists');
    }
  });

  it('validates tag names', async () => {
    await exec(`lql deploy --database $database --package my-first --yes`);
    
    try {
      await exec(`lql tag v1.5/invalid --package my-first --yes`);
      fail('Expected invalid tag name to throw error');
    } catch (error) {
      expect((error as Error).message).toContain('Invalid tag name');
    }
    
    try {
      await exec(`lql tag @v1.5.0 --package my-first --yes`);
      fail('Expected invalid tag name to throw error');
    } catch (error) {
      expect((error as Error).message).toContain('Invalid tag name');
    }
  });

  it('requires existing change for tag target', async () => {
    await exec(`lql deploy --database $database --package my-first --yes`);
    
    try {
      await exec(`lql tag v1.6.0 --package my-first --changeName nonexistent_change --yes`);
      fail('Expected non-existent change to throw error');
    } catch (error) {
      expect((error as Error).message).toContain('not found in plan');
    }
  });
});
