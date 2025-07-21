process.env.LAUNCHQL_DEBUG = 'true';

import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Deployment Scenarios with Undefined Targets', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('handles undefined target scenarios for deploy, revert, and verify operations', async () => {
    await fixture.deployModule(undefined as any, db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);

    await expect(
      fixture.verifyModule(undefined as any, db.name, ['sqitch', 'simple-w-tags'])
    ).resolves.not.toThrow();

    await fixture.revertModule(undefined as any, db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(false);
    expect(await db.exists('table', 'metaschema.customers')).toBe(false);

    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);

    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(false);
    expect(await db.exists('table', 'metaschema.customers')).toBe(false);

    await fixture.deployModule(undefined as any, db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);

    await fixture.verifyModule(undefined as any, db.name, ['sqitch', 'simple-w-tags']);
  });
});
