import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';

describe('Complex Cross-Project Revert', () => {
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

  test('handles complex cross-project revert and redeploy with modified dependencies', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    const deployFirstResult = await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    expect(deployFirstResult.deployed).toEqual(['schema_myapp', 'table_users', 'table_products']);
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const deploySecondResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
    });
    
    expect(deploySecondResult.deployed).toEqual(['create_schema', 'create_table', 'create_another_table']);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    expect(await db.exists('table', 'otherschema.user_interactions')).toBe(true);
    expect(await db.exists('table', 'otherschema.consent_agreements')).toBe(true);
    
    const deployThirdResult = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(deployThirdResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    const revertThirdResult = await client.revert({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(revertThirdResult.reverted).toEqual(['create_table', 'create_schema']);
    expect(await db.exists('schema', 'metaschema')).toBe(false);
    expect(await db.exists('table', 'metaschema.customers')).toBe(false);
    
    const revertSecondResult = await client.revert({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
    });
    
    expect(revertSecondResult.reverted).toEqual(['create_another_table', 'create_table', 'create_schema']);
    expect(await db.exists('schema', 'otherschema')).toBe(false);
    expect(await db.exists('table', 'otherschema.users')).toBe(false);
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const deployedAfterRevert = await db.getDeployedChanges();
    const myFirstChanges = deployedAfterRevert.filter(c => c.project === 'my-first');
    expect(myFirstChanges).toHaveLength(3);
    expect(deployedAfterRevert.filter(c => c.project === 'my-second')).toHaveLength(0);
    expect(deployedAfterRevert.filter(c => c.project === 'my-third')).toHaveLength(0);
    
    const planPath = join(basePath, 'packages', 'my-second', 'launchql.plan');
    const deployDir = join(basePath, 'packages', 'my-second', 'deploy');
    const revertDir = join(basePath, 'packages', 'my-second', 'revert');
    const verifyDir = join(basePath, 'packages', 'my-second', 'verify');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    const modifiedPlan = originalPlan.replace(
      'create_another_table [create_table] 2025-05-16T05:53:58Z Hyperweb <pyramation@Hyperwebs-MacBook-Pro.local> # sdf',
      'create_analytics_table [create_table] 2025-05-16T05:53:58Z Hyperweb <pyramation@Hyperwebs-MacBook-Pro.local> # analytics tables'
    );
    writeFileSync(planPath, modifiedPlan);
    
    writeFileSync(join(deployDir, 'create_analytics_table.sql'), `-- Deploy my-second:create_analytics_table to pg

-- requires: my-second:create_table

BEGIN;

-- Analytics Table 1: Page Views
CREATE TABLE otherschema.page_views (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES otherschema.users(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics Table 2: Conversion Events
CREATE TABLE otherschema.conversion_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES otherschema.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'purchase', 'subscription', 'download')),
  event_value DECIMAL(10,2),
  metadata JSONB,
  occurred_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
`);
    
    writeFileSync(join(revertDir, 'create_analytics_table.sql'), `-- Revert my-second:create_analytics_table from pg

BEGIN;

DROP TABLE otherschema.conversion_events;
DROP TABLE otherschema.page_views;

COMMIT;
`);
    
    writeFileSync(join(verifyDir, 'create_analytics_table.sql'), `-- Verify my-second:create_analytics_table on pg

SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = 'otherschema' AND table_name = 'page_views';
SELECT 1/count(*) FROM information_schema.tables WHERE table_schema = 'otherschema' AND table_name = 'conversion_events';
`);
    
    const redeploySecondResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: planPath,
    });
    
    expect(redeploySecondResult.deployed).toEqual(['create_schema', 'create_table', 'create_analytics_table']);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    expect(await db.exists('table', 'otherschema.page_views')).toBe(true);
    expect(await db.exists('table', 'otherschema.conversion_events')).toBe(true);
    
    expect(await db.exists('table', 'otherschema.user_interactions')).toBe(false);
    expect(await db.exists('table', 'otherschema.consent_agreements')).toBe(false);
    
    const redeployThirdResult = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(redeployThirdResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    expect(await db.exists('table', 'otherschema.page_views')).toBe(true);
    expect(await db.exists('table', 'otherschema.conversion_events')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    expect(await db.exists('table', 'otherschema.user_interactions')).toBe(false);
    expect(await db.exists('table', 'otherschema.consent_agreements')).toBe(false);
    
    // Verify cross-project dependencies
    const thirdSchemaDeps = await db.getDependencies('my-third', 'create_schema');
    expect(thirdSchemaDeps).toContain('my-first:table_products'); // resolved from my-first:@v1.1.0
    expect(thirdSchemaDeps).toContain('my-second:create_table'); // resolved from my-second:@v2.0.0
    
    const finalDeployedChanges = await db.getDeployedChanges();
    expect(finalDeployedChanges).toHaveLength(8); // 3 my-first + 3 my-second + 2 my-third
    
    const myFirstFinal = finalDeployedChanges.filter(c => c.project === 'my-first');
    expect(myFirstFinal.map(c => c.change_name)).toEqual(['schema_myapp', 'table_users', 'table_products']);
    
    const mySecondFinal = finalDeployedChanges.filter(c => c.project === 'my-second');
    expect(mySecondFinal.map(c => c.change_name)).toEqual(['create_schema', 'create_table', 'create_analytics_table']);
    expect(mySecondFinal.find(c => c.change_name === 'create_another_table')).toBeUndefined();
    
    const myThirdFinal = finalDeployedChanges.filter(c => c.project === 'my-third');
    expect(myThirdFinal.map(c => c.change_name)).toEqual(['create_schema', 'create_table']);
    
    writeFileSync(planPath, originalPlan);
    unlinkSync(join(deployDir, 'create_analytics_table.sql'));
    unlinkSync(join(revertDir, 'create_analytics_table.sql'));
    unlinkSync(join(verifyDir, 'create_analytics_table.sql'));
  });
});
