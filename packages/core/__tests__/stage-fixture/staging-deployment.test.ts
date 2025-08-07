import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Staging Fixture Deployment Tests', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeAll(async () => {
    fixture = new CoreDeployTestFixture('stage');
  });
  
  afterAll(async () => {
    await fixture.cleanup();
  });
  
  beforeEach(async () => {
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
  });

  test('deploys unique-names package successfully', async () => {
    await fixture.deployModule('unique-names', db.name, ['stage']);
    
    expect(await db.exists('schema', 'unique_names')).toBe(true);
    expect(await db.exists('table', 'unique_names.words')).toBe(true);
    
    const deployedChanges = await db.getDeployedChanges();
    expect(deployedChanges.some(change => change.package === 'unique-names')).toBe(true);
  });
});
