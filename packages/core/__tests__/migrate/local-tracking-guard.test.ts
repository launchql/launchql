import { PgpmMigrate } from '../../src/migrate/client';
import { MigrateTestFixture, teardownAllPools, TestDatabase } from '../../test-utils';

describe('local tracking guard for deployed/skipped', () => {
  let fixture: MigrateTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new MigrateTestFixture();
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  afterAll(async () => {
    await teardownAllPools();
  });

  it('normalizes same-package qualified names to unqualified in deployed', async () => {
    const tempDir = fixture.createPlanFile('test-local-tracking', [
      { name: 'change1' }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'change1', 'SELECT 1;');

    const client = new PgpmMigrate(db.config);

    const result = await client.deploy({
      modulePath: tempDir,
      logOnly: true,
    });

    expect(result.deployed).toContain('change1');
    expect(result.deployed.every((n: string) => !n.includes(':'))).toBe(true);
  });

  it('throws error on cross-package qualified names', async () => {
    const tempDir = fixture.createPlanFile('test-local-tracking', [
      { name: 'change1' }
    ]);
    
    fixture.createScript(tempDir, 'deploy', 'change1', 'SELECT 1;');

    const client = new PgpmMigrate(db.config);

    expect(() => {
      (client as any).toUnqualifiedLocal('pkgA', 'pkgB:change1');
    }).toThrow('Cross-package change encountered in local tracking: pkgB:change1 (current package: pkgA)');
  });
});
