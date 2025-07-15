import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';

describe('Cross-Project-B Dependencies', () => {
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
  
  test('deploys cross-project-b dependencies', async () => {
    const basePath = fixture.setupFixture('cross-project-b');
    
    // Deploy project-x
    const resultX = await client.deploy({
      project: 'project-x',
      targetDatabase: db.name,
      planPath: join(basePath, 'project-x', 'launchql.plan'),
    });
    
    expect(resultX.deployed).toBeDefined();
    
    // Deploy project-y
    const resultY = await client.deploy({
      project: 'project-y', 
      targetDatabase: db.name,
      planPath: join(basePath, 'project-y', 'launchql.plan'),
    });
    
    expect(resultY.deployed).toBeDefined();
    
    // Deploy project-z
    const resultZ = await client.deploy({
      project: 'project-z',
      targetDatabase: db.name,
      planPath: join(basePath, 'project-z', 'launchql.plan'),
    });
    
    expect(resultZ.deployed).toBeDefined();
  });
});