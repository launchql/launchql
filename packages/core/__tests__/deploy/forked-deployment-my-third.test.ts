import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';
import { TestDatabase } from '../../../migrate/test-utils';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

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
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-third');
    const planPath = join(packagePath, 'launchql.plan');
    const deployDir = join(packagePath, 'deploy');
    const revertDir = join(packagePath, 'revert');
    const verifyDir = join(packagePath, 'verify');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    const modifiedPlan = originalPlan.trimEnd() + '\ntable_orders [create_table] 2017-08-11T08:11:51Z launchql <launchql@5b0c196eeb62> # add table_orders\n';
    writeFileSync(planPath, modifiedPlan);
    
    writeFileSync(join(deployDir, 'table_orders.sql'), `-- Deploy my-third:table_orders to pg

-- requires: my-third:create_table

BEGIN;

CREATE TABLE metaschema.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES metaschema.customers(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
`);
    
    writeFileSync(join(revertDir, 'table_orders.sql'), `-- Revert my-third:table_orders from pg

BEGIN;

DROP TABLE metaschema.orders;

COMMIT;
`);
    
    writeFileSync(join(verifyDir, 'table_orders.sql'), `-- Verify my-third:table_orders on pg

SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = 'metaschema' AND table_name = 'orders';
`);
    
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    expect(await db.exists('table', 'metaschema.orders')).toBe(true);
    
    const schemas = await db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = \'metaschema\'');
    expect(schemas.rows).toHaveLength(1);
    expect(schemas.rows[0].schema_name).toBe('metaschema');
    
    const tables = await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'metaschema\' ORDER BY table_name');
    expect(tables.rows).toHaveLength(2);
    expect(tables.rows.map((r: any) => r.table_name)).toEqual(['customers', 'orders']);
    
    writeFileSync(planPath, originalPlan);
  });
});
