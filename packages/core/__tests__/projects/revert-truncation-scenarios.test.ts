process.env.LAUNCHQL_DEBUG = 'true';

import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Revert Truncation Scenarios', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterAll(async () => {
    await fixture.cleanup();
  });

  test('deploys my-third and reverts to my-first with toChange - should revert all dependent modules', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'myfirstapp')).toBe(true);        // my-first
    expect(await db.exists('table', 'myfirstapp.products')).toBe(true); // my-first @v1.1.0
    expect(await db.exists('schema', 'mysecondapp')).toBe(true);   // my-second
    expect(await db.exists('table', 'mysecondapp.users')).toBe(true); // my-second @v2.0.0
    expect(await db.exists('schema', 'mythirdapp')).toBe(true);    // my-third
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(true); // my-third

    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(false);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(false);
    expect(await db.exists('schema', 'mysecondapp')).toBe(false);
    expect(await db.exists('table', 'mysecondapp.users')).toBe(false);

    expect(await db.exists('schema', 'myfirstapp')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.users')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.products')).toBe(false); // @v1.1.0 change reverted
  });

  test('deploys my-third and reverts my-second without toChange - should use module-specific resolution', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(true);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(true);
    expect(await db.exists('schema', 'mysecondapp')).toBe(true);
    expect(await db.exists('table', 'mysecondapp.users')).toBe(true);

    await fixture.revertModule('my-second', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mysecondapp')).toBe(false);
    expect(await db.exists('table', 'mysecondapp.users')).toBe(false);

    expect(await db.exists('schema', 'myfirstapp')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.products')).toBe(true);

    expect(await db.exists('schema', 'mythirdapp')).toBe(false);
  });

  test('null name with cwd inside my-second calling revert - should revert all modules', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(true);
    expect(await db.exists('schema', 'mysecondapp')).toBe(true);
    expect(await db.exists('schema', 'myfirstapp')).toBe(true);

    await fixture.revertModule(undefined as any, db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(false);
    expect(await db.exists('schema', 'mysecondapp')).toBe(false);
    expect(await db.exists('schema', 'myfirstapp')).toBe(false);
  });

  test('verifies workspace-wide resolution with toChange ensures proper dependency handling', async () => {
    
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'myfirstapp')).toBe(true);        // my-first
    expect(await db.exists('schema', 'mysecondapp')).toBe(true);   // my-second  
    expect(await db.exists('schema', 'mythirdapp')).toBe(true);    // my-third

    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(false);
    expect(await db.exists('schema', 'mysecondapp')).toBe(false);

    expect(await db.exists('schema', 'myfirstapp')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.users')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.products')).toBe(false); // @v1.1.0 change reverted
  });
});
