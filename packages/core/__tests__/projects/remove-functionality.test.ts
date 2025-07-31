import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Remove Functionality', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('removes all changes from plan when no --to parameter is provided', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const planPath = join(packagePath, 'launchql.plan');
    const deployDir = join(packagePath, 'deploy');
    const revertDir = join(packagePath, 'revert');
    const verifyDir = join(packagePath, 'verify');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    expect(originalPlan).toContain('schema_myfirstapp');
    expect(originalPlan).toContain('table_users');
    expect(originalPlan).toContain('table_products');
    expect(originalPlan).toContain('@v1.0.0');
    expect(originalPlan).toContain('@v1.1.0');
    
    expect(existsSync(join(deployDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(existsSync(join(deployDir, 'table_users.sql'))).toBe(true);
    expect(existsSync(join(deployDir, 'table_products.sql'))).toBe(true);
    expect(existsSync(join(revertDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(existsSync(join(revertDir, 'table_users.sql'))).toBe(true);
    expect(existsSync(join(revertDir, 'table_products.sql'))).toBe(true);
    expect(existsSync(join(verifyDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(existsSync(join(verifyDir, 'table_users.sql'))).toBe(true);
    expect(existsSync(join(verifyDir, 'table_products.sql'))).toBe(true);
    
    const { LaunchQLPackage } = await import('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    
    await pkg.removeFromPlan();
    
    const updatedPlan = readFileSync(planPath, 'utf8');
    expect(updatedPlan).toContain('%syntax-version=1.0.0');
    expect(updatedPlan).toContain('%project=my-first');
    expect(updatedPlan).toContain('%uri=my-first');
    expect(updatedPlan).not.toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
    expect(updatedPlan).not.toContain('@v1.0.0');
    expect(updatedPlan).not.toContain('@v1.1.0');
    
    expect(existsSync(join(deployDir, 'schema_myfirstapp.sql'))).toBe(false);
    expect(existsSync(join(deployDir, 'table_users.sql'))).toBe(false);
    expect(existsSync(join(deployDir, 'table_products.sql'))).toBe(false);
    expect(existsSync(join(revertDir, 'schema_myfirstapp.sql'))).toBe(false);
    expect(existsSync(join(revertDir, 'table_users.sql'))).toBe(false);
    expect(existsSync(join(revertDir, 'table_products.sql'))).toBe(false);
    expect(existsSync(join(verifyDir, 'schema_myfirstapp.sql'))).toBe(false);
    expect(existsSync(join(verifyDir, 'table_users.sql'))).toBe(false);
    expect(existsSync(join(verifyDir, 'table_products.sql'))).toBe(false);
  });

  test('removes changes from specified change to end when --to parameter is provided', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const planPath = join(packagePath, 'launchql.plan');
    const deployDir = join(packagePath, 'deploy');
    const revertDir = join(packagePath, 'revert');
    const verifyDir = join(packagePath, 'verify');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    expect(originalPlan).toContain('schema_myfirstapp');
    expect(originalPlan).toContain('table_users');
    expect(originalPlan).toContain('table_products');
    
    const { LaunchQLPackage } = await import('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    
    await pkg.removeFromPlan('table_users');
    
    const updatedPlan = readFileSync(planPath, 'utf8');
    expect(updatedPlan).toContain('%syntax-version=1.0.0');
    expect(updatedPlan).toContain('%project=my-first');
    expect(updatedPlan).toContain('schema_myfirstapp');
    expect(updatedPlan).not.toContain('table_users');
    expect(updatedPlan).not.toContain('table_products');
    expect(updatedPlan).not.toContain('@v1.0.0');
    expect(updatedPlan).not.toContain('@v1.1.0');
    
    expect(existsSync(join(deployDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(existsSync(join(deployDir, 'table_users.sql'))).toBe(false);
    expect(existsSync(join(deployDir, 'table_products.sql'))).toBe(false);
    expect(existsSync(join(revertDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(existsSync(join(revertDir, 'table_users.sql'))).toBe(false);
    expect(existsSync(join(revertDir, 'table_products.sql'))).toBe(false);
    expect(existsSync(join(verifyDir, 'schema_myfirstapp.sql'))).toBe(true);
    expect(existsSync(join(verifyDir, 'table_users.sql'))).toBe(false);
    expect(existsSync(join(verifyDir, 'table_products.sql'))).toBe(false);
  });

  test('throws error when specified change does not exist', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    
    const { LaunchQLPackage } = await import('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    
    await expect(pkg.removeFromPlan('nonexistent_change')).rejects.toThrow(
      "Change 'nonexistent_change' not found in plan"
    );
  });

  test('handles empty plan gracefully', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const planPath = join(packagePath, 'launchql.plan');
    
    const emptyPlan = `%syntax-version=1.0.0
%project=my-first
%uri=my-first

`;
    writeFileSync(planPath, emptyPlan);
    
    const { LaunchQLPackage } = await import('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    
    await pkg.removeFromPlan();
    
    const updatedPlan = readFileSync(planPath, 'utf8');
    expect(updatedPlan).toBe(emptyPlan);
  });

  test('removes associated tags when removing changes', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const planPath = join(packagePath, 'launchql.plan');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    const modifiedPlan = originalPlan.trimEnd() + '\ntable_orders [table_products] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add table_orders\n@v1.2.0 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # Added orders feature\n';
    writeFileSync(planPath, modifiedPlan);
    
    const deployDir = join(packagePath, 'deploy');
    const revertDir = join(packagePath, 'revert');
    const verifyDir = join(packagePath, 'verify');
    
    writeFileSync(join(deployDir, 'table_orders.sql'), `-- Deploy my-first:table_orders to pg

-- requires: my-first:table_products

BEGIN;

CREATE TABLE myfirstapp.orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES myfirstapp.users(id),
  product_id INTEGER REFERENCES myfirstapp.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

COMMIT;
`);
    
    writeFileSync(join(revertDir, 'table_orders.sql'), `-- Revert my-first:table_orders from pg

BEGIN;

DROP TABLE myfirstapp.orders;

COMMIT;
`);
    
    writeFileSync(join(verifyDir, 'table_orders.sql'), `-- Verify my-first:table_orders on pg

SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = 'myfirstapp' AND table_name = 'orders';
`);
    
    const { LaunchQLPackage } = await import('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    
    await pkg.removeFromPlan('table_products');
    
    const updatedPlan = readFileSync(planPath, 'utf8');
    expect(updatedPlan).toContain('schema_myfirstapp');
    expect(updatedPlan).toContain('table_users');
    expect(updatedPlan).toContain('@v1.0.0'); // This tag is associated with table_users, should remain
    expect(updatedPlan).not.toContain('table_products');
    expect(updatedPlan).not.toContain('table_orders');
    expect(updatedPlan).not.toContain('@v1.1.0'); // This tag is associated with table_products, should be removed
    expect(updatedPlan).not.toContain('@v1.2.0'); // This tag is associated with table_orders, should be removed
    
    expect(existsSync(join(deployDir, 'table_orders.sql'))).toBe(false);
    expect(existsSync(join(revertDir, 'table_orders.sql'))).toBe(false);
    expect(existsSync(join(verifyDir, 'table_orders.sql'))).toBe(false);
  });

  test('handles missing SQL files gracefully', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const deployDir = join(packagePath, 'deploy');
    
    const tablePath = join(deployDir, 'table_users.sql');
    if (existsSync(tablePath)) {
      require('fs').unlinkSync(tablePath);
    }
    
    const { LaunchQLPackage } = await import('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    
    await expect(pkg.removeFromPlan('table_users')).resolves.not.toThrow();
  });
});
