import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Partial Verification with toChange parameter', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('verifies partial deployment with toChange parameter', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    await fixture.verifyModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    const verifyScriptPath = fixture.fixturePath('packages', 'my-third', 'verify', 'create_table.sql');
    const fs = require('fs');
    const originalContent = fs.readFileSync(verifyScriptPath, 'utf8');
    
    const brokenContent = originalContent.replace(
      "table_name = 'customers'",
      "table_name = 'nonexistent_table'"
    );
    fs.writeFileSync(verifyScriptPath, brokenContent);
    
    await fixture.verifyModule('my-third:create_schema', db.name, ['sqitch', 'simple-w-tags']);
    
    await expect(
      fixture.verifyModule('my-third', db.name, ['sqitch', 'simple-w-tags'])
    ).rejects.toThrow();
    
    fs.writeFileSync(verifyScriptPath, originalContent);
  });
});
