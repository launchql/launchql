process.env.LAUNCHQL_DEBUG = 'true';

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

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

    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(false);
    expect(await db.exists('table', 'metaschema.customers')).toBe(false);

    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);

    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(false);
    expect(await db.exists('table', 'metaschema.customers')).toBe(false);

    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const planPath = join(packagePath, 'launchql.plan');
    const deployDir = join(packagePath, 'deploy');
    const revertDir = join(packagePath, 'revert');
    const verifyDir = join(packagePath, 'verify');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    const modifiedPlan = originalPlan.trimEnd() + '\ntable_orders [table_products] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add table_orders\n';
    writeFileSync(planPath, modifiedPlan);
    
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

    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    expect(await db.exists('table', 'myapp.orders')).toBe(true);

    writeFileSync(planPath, originalPlan);

  });
});
