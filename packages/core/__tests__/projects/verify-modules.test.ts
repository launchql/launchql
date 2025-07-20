import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';
import { TestDatabase } from '../../test-utils';

describe('Basic Verification with verifyModules', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  }, 30000);
  
  afterEach(async () => {
    await fixture.cleanup();
  }, 30000);

  test('verifies deployed module successfully', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    await expect(fixture.verifyModule('my-third', db.name, ['sqitch', 'simple-w-tags'])).resolves.not.toThrow();
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
  });

  test('verifies module up to specific change using toChange parameter', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    await expect(fixture.verifyModule('my-third', db.name, ['sqitch', 'simple-w-tags'], '@v1.0.0')).resolves.not.toThrow();
    
    await expect(fixture.verifyModule('my-third', db.name, ['sqitch', 'simple-w-tags'], 'myapp_schema')).resolves.not.toThrow();
  });

  test('handles verification of non-deployed module gracefully', async () => {
    await expect(fixture.verifyModule('my-third', db.name, ['sqitch', 'simple-w-tags'])).resolves.not.toThrow();
  });
});
