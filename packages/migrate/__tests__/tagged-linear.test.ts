import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';

describe('Tagged Dependencies', () => {
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
  
  it('deploys tagged dependencies', async () => {
    const basePath = fixture.setupFixture('tagged-linear');
    
    const result = await client.deploy({
      project: 'tagged-linear',
      targetDatabase: db.name,
      planPath: join(basePath, 'launchql.plan'),
    });
    
    expect(result.deployed).toBeDefined();
  });
});