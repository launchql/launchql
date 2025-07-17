import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';

describe('Forked Deployment', () => {
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

  test('handles forked deployment scenario with revert and redeploy', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const planPath = join(basePath, 'packages', 'my-first', 'launchql.plan');
    const deployDir = join(basePath, 'packages', 'my-first', 'deploy');
    const revertDir = join(basePath, 'packages', 'my-first', 'revert');
    const verifyDir = join(basePath, 'packages', 'my-first', 'verify');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    const changeAPlan = originalPlan.trimEnd() + '\ntable_orders [table_products] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add table_orders\n';
    writeFileSync(planPath, changeAPlan);
    
    writeFileSync(join(deployDir, 'table_orders.sql'), `-- Deploy my-first:table_orders to pg

-- requires: my-first:table_products

BEGIN;

CREATE TABLE myapp.orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES myapp.users(id),
  product_id INTEGER REFERENCES myapp.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

COMMIT;
`);
    
    writeFileSync(join(revertDir, 'table_orders.sql'), `-- Revert my-first:table_orders from pg

BEGIN;

DROP TABLE myapp.orders;

COMMIT;
`);
    
    writeFileSync(join(verifyDir, 'table_orders.sql'), `-- Verify my-first:table_orders on pg

SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = 'myapp' AND table_name = 'orders';
`);
    
    const deployAResult = await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: planPath,
    });
    expect(deployAResult.deployed).toEqual(['table_orders']);
    expect(await db.exists('table', 'myapp.orders')).toBe(true);
    
    const revertAResult = await client.revert({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: planPath,
      toChange: 'table_products'
    });
    
    expect(revertAResult.reverted).toEqual(['table_orders']);
    expect(await db.exists('table', 'myapp.orders')).toBe(false);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    writeFileSync(planPath, originalPlan);
    unlinkSync(join(deployDir, 'table_orders.sql'));
    unlinkSync(join(revertDir, 'table_orders.sql'));
    unlinkSync(join(verifyDir, 'table_orders.sql'));
    
    const changeBPlan = originalPlan.trimEnd() + '\ntable_categories [table_products] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add table_categories\n';
    writeFileSync(planPath, changeBPlan);
    
    writeFileSync(join(deployDir, 'table_categories.sql'), `-- Deploy my-first:table_categories to pg

-- requires: my-first:table_products

BEGIN;

CREATE TABLE myapp.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

COMMIT;
`);
    
    writeFileSync(join(revertDir, 'table_categories.sql'), `-- Revert my-first:table_categories from pg

BEGIN;

DROP TABLE myapp.categories;

COMMIT;
`);
    
    writeFileSync(join(verifyDir, 'table_categories.sql'), `-- Verify my-first:table_categories on pg

SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = 'myapp' AND table_name = 'categories';
`);
    
    const deployBResult = await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: planPath,
    });
    
    expect(deployBResult.deployed).toEqual(['table_categories']);
    expect(await db.exists('table', 'myapp.categories')).toBe(true);
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    expect(await db.exists('table', 'myapp.categories')).toBe(true);
    expect(await db.exists('table', 'myapp.orders')).toBe(false);
    
    const deployedChanges = await db.getDeployedChanges();
    const myFirstChanges = deployedChanges.filter(c => c.project === 'my-first');
    expect(myFirstChanges).toHaveLength(4);
    expect(myFirstChanges.map(c => c.change_name)).toEqual(['schema_myapp', 'table_users', 'table_products', 'table_categories']);
    
    expect(myFirstChanges.find(c => c.change_name === 'table_orders')).toBeUndefined();
  });
});
