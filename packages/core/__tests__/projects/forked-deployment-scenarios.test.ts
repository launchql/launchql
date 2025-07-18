process.env.LAUNCHQL_DEBUG = 'true';

import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';
import { TestDatabase } from '../../test-utils';

describe('Forked Deployment with deployModules - my-third', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('handles modified deployment scenario for my-third', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);

    await fixture.revertModule('my-third', db.name, ['sqitch', 'simple-w-tags'], 'my-first:@v1.0.0');

    expect(await db.exists('schema', 'metaschema')).toBe(false);
    expect(await db.exists('table', 'metaschema.customers')).toBe(false);

    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);

  });
});
