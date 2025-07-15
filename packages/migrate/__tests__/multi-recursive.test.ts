import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';

describe('Multi-Recursive Dependencies', () => {
  let fixture: MigrateTestFixture;
  let db: TestDatabase;
  let client: LaunchQLMigrate;
  
  beforeEach(async () => {
    fixture = new MigrateTestFixture();
    db = await fixture.setupTestDatabase();
    client = new LaunchQLMigrate(db.config);
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });
  
  test('deploys multi-recursive dependencies', async () => {
    const basePath = fixture.setupFixture('multi-recursive');
    
    // Deploy module-a
    const resultA = await client.deploy({
      project: 'module-a',
      targetDatabase: db.name,
      planPath: join(basePath, 'module-a', 'launchql.plan'),
    });
    
    expect(resultA.deployed).toBeDefined();
    
    // Deploy module-b
    const resultB = await client.deploy({
      project: 'module-b',
      targetDatabase: db.name,
      planPath: join(basePath, 'module-b', 'launchql.plan'),
    });
    
    expect(resultB.deployed).toBeDefined();
  });
});