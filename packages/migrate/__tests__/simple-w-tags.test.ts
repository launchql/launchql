import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase, deployWithTags, revertWithTags } from '../test-utils';
import { join } from 'path';

describe('Simple with Tags Migration', () => {
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

  test('deploys my-third module with tag dependencies', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    const resultFirst = await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    expect(resultFirst.deployed).toEqual(['schema_myapp', 'table_users', 'table_products']);
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const resultSecond = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
    });
    
    expect(resultSecond.deployed).toEqual(['create_schema', 'create_table', 'create_another_table']);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    
    const resultThird = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(resultThird.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    const createSchemaDeps = await db.getDependencies('my-third', 'create_schema');
    expect(createSchemaDeps).toContain('my-first:table_products'); // resolved from my-first:@v1.1.0
    expect(createSchemaDeps).toContain('my-second:create_table'); // resolved from my-second:@v2.0.0
    
    const createTableDeps = await db.getDependencies('my-third', 'create_table');
    expect(createTableDeps).toContain('my-third:create_schema');
    
    const deployedChanges = await db.getDeployedChanges();
    expect(deployedChanges).toContainEqual(expect.objectContaining({
      project: 'my-first',
      change_name: 'schema_myapp'
    }));
    expect(deployedChanges).toContainEqual(expect.objectContaining({
      project: 'my-first',
      change_name: 'table_products'
    }));
    expect(deployedChanges).toContainEqual(expect.objectContaining({
      project: 'my-second',
      change_name: 'create_schema'
    }));
    expect(deployedChanges).toContainEqual(expect.objectContaining({
      project: 'my-second',
      change_name: 'create_table'
    }));
    expect(deployedChanges).toContainEqual(expect.objectContaining({
      project: 'my-third',
      change_name: 'create_schema'
    }));
    expect(deployedChanges).toContainEqual(expect.objectContaining({
      project: 'my-third',
      change_name: 'create_table'
    }));
  });

  test('handles revert and redeploy with tag dependencies', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
    });
    
    await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    const revertResult = await client.revert({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(revertResult.reverted).toEqual(['create_table', 'create_schema']);
    expect(await db.exists('schema', 'metaschema')).toBe(false);
    
    const redeployResult = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(redeployResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    const createSchemaDeps = await db.getDependencies('my-third', 'create_schema');
    expect(createSchemaDeps).toContain('my-first:table_products'); // resolved from my-first:@v1.1.0
    expect(createSchemaDeps).toContain('my-second:create_table'); // resolved from my-second:@v2.0.0
  });

  test('prevents revert of changes with tag-dependent modules', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
    });
    
    await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    // Try to revert my-first:table_products which my-third depends on via tag my-first:@v1.1.0
    // Note: toChange means "revert TO this change", so to revert table_products we revert to table_users
    await expect(client.revert({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
      toChange: 'table_users'
    })).rejects.toThrow(/Cannot revert table_products: required by my-third:create_schema/);
    
    // Verify nothing was reverted
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    // Try to revert my-second:create_another_table which my-third depends on via tag my-second:@v2.1.0
    await expect(client.revert({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
      toChange: 'create_schema'
    })).rejects.toThrow(/Cannot revert create_another_table: required by my-third:create_table/);
    
    // Verify nothing was reverted
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
  });

  test('complex deploy/revert sequence with tag dependencies', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
    });
    
    const deployResult = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(deployResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    const revertThirdResult = await client.revert({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(revertThirdResult.reverted).toEqual(['create_table', 'create_schema']);
    expect(await db.exists('schema', 'metaschema')).toBe(false);
    
    const revertFirstResult = await client.revert({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
      toChange: 'table_users'
    });
    
    expect(revertFirstResult.reverted).toEqual(['table_products']);
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(false);
    expect(await db.exists('schema', 'metaschema')).toBe(false);
    
    const redeployFirstResult = await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    expect(redeployFirstResult.deployed).toEqual(['table_products']);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const deploySecondResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
    });
    
    expect(deploySecondResult.deployed).toEqual([]);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    
    const redeployThirdResult = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(redeployThirdResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    // Verify final state: my-third dependencies should still be resolved correctly after the complex sequence
    const createSchemaDeps = await db.getDependencies('my-third', 'create_schema');
    expect(createSchemaDeps).toContain('my-first:table_products'); // resolved from my-first:@v1.1.0
    expect(createSchemaDeps).toContain('my-second:create_table'); // resolved from my-second:@v2.0.0
    
    // Verify that all projects are back to their fully deployed state
    const deployedChanges = await db.getDeployedChanges();
    const myFirstChanges = deployedChanges.filter(c => c.project === 'my-first');
    const mySecondChanges = deployedChanges.filter(c => c.project === 'my-second');
    const myThirdChanges = deployedChanges.filter(c => c.project === 'my-third');
    
    expect(myFirstChanges).toHaveLength(3);
    expect(mySecondChanges).toHaveLength(3);
    expect(myThirdChanges).toHaveLength(2);
    expect(myThirdChanges.map(c => c.change_name)).toEqual(['create_schema', 'create_table']);
  });
});
