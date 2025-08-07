import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Staging Fixture Deployment Tests', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('stage');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('deploys unique-names package successfully', async () => {
    await fixture.deployModule('unique-names', db.name, ['stage']);
    
    expect(await db.exists('schema', 'unique_names')).toBe(true);
    expect(await db.exists('table', 'unique_names.words')).toBe(true);
    
    const deployedChanges = await db.getDeployedChanges();
    expect(deployedChanges.some(change => change.package === 'unique-names')).toBe(true);
  });

  test('deploys extension modules with dependencies', async () => {
    await fixture.deployModule('launchql-uuid', db.name, ['stage']);
    
    expect(await db.exists('schema', 'uuids')).toBe(true);
    
    const deployedChanges = await db.getDeployedChanges();
    expect(deployedChanges.some(change => change.package === 'launchql-uuid')).toBe(true);
  });

  test('handles module dependencies correctly', async () => {
    await fixture.deployModule('unique-names', db.name, ['stage']);
    
    const deployedChanges = await db.getDeployedChanges();
    const packageNames = deployedChanges.map(change => change.package);
    
    expect(packageNames).toContain('unique-names');
    expect(packageNames.some(name => name.includes('launchql-ext-default-roles'))).toBe(true);
  });

  test('verifies deployed modules successfully', async () => {
    await fixture.deployModule('unique-names', db.name, ['stage']);
    
    await expect(fixture.verifyModule('unique-names', db.name, ['stage'])).resolves.not.toThrow();
  });

  test('reverts deployed modules successfully', async () => {
    await fixture.deployModule('unique-names', db.name, ['stage']);
    
    expect(await db.exists('schema', 'unique_names')).toBe(true);
    
    await fixture.revertModule('unique-names', db.name, ['stage']);
    
    expect(await db.exists('schema', 'unique_names')).toBe(false);
  });

  test('tracks migration state correctly', async () => {
    await fixture.deployModule('unique-names', db.name, ['stage']);
    
    const migrationState = await db.getMigrationState();
    expect(migrationState.changeCount).toBeGreaterThan(0);
    expect(migrationState.eventCount).toBeGreaterThan(0);
    
    const uniqueNamesChanges = migrationState.changes.filter(
      change => change.package === 'unique-names'
    );
    expect(uniqueNamesChanges.length).toBeGreaterThan(0);
  });

  test('deploys multiple extension modules', async () => {
    await fixture.deployModule('launchql-uuid', db.name, ['stage']);
    await fixture.deployModule('launchql-base32', db.name, ['stage']);
    
    expect(await db.exists('schema', 'uuids')).toBe(true);
    expect(await db.exists('schema', 'base32')).toBe(true);
    
    const deployedChanges = await db.getDeployedChanges();
    const packageNames = deployedChanges.map(change => change.package);
    expect(packageNames).toContain('launchql-uuid');
    expect(packageNames).toContain('launchql-base32');
  });
});
