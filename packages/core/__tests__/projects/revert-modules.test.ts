import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';
import { TestDatabase } from '../../test-utils';

describe('Basic Revert with revertModules', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  }, 30000);
  
  afterEach(async () => {
    await fixture.cleanup();
  }, 30000);

  test('reverts deployed module successfully', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    await fixture.revertModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    const schemas = await db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name IN (\'myapp\', \'otherschema\', \'metaschema\') ORDER BY schema_name');
  });

  test('reverts module to specific change using toChange parameter', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    await fixture.revertModule('my-third', db.name, ['sqitch', 'simple-w-tags'], '@v1.0.0');
    
  });

  test('reverts module to specific change using change name', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    await fixture.revertModule('my-third', db.name, ['sqitch', 'simple-w-tags'], 'myapp_schema');
    
  });

  test('handles revert of non-deployed module gracefully', async () => {
    await expect(fixture.revertModule('my-third', db.name, ['sqitch', 'simple-w-tags'])).resolves.not.toThrow();
  });
});
