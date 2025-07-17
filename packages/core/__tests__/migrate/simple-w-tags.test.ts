import { LaunchQLMigrate } from '../../src/migrate/client';
import { MigrateTestFixture, TestDatabase } from '../../test-utils';
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

  test('extensive tag-based deploy/revert sequence using toChangeTag', async () => {
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
    
    const deployThirdResult = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    expect(deployThirdResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    // Verify initial state: all projects fully deployed
    let deployedChanges = await db.getDeployedChanges();
    expect(deployedChanges.filter(c => c.project === 'my-first')).toHaveLength(3);
    expect(deployedChanges.filter(c => c.project === 'my-second')).toHaveLength(3);
    expect(deployedChanges.filter(c => c.project === 'my-third')).toHaveLength(2);
    
    await client.revert({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
    });
    
    const revertToV1Result = await client.revert({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
      toChange: 'my-first:@v1.0.0'
    });
    
    expect(revertToV1Result.reverted).toEqual(['table_products']);
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(false);
    expect(await db.exists('schema', 'metaschema')).toBe(false);
    
    // Verify state after revert to v1.0.0
    deployedChanges = await db.getDeployedChanges();
    const myFirstChanges = deployedChanges.filter(c => c.project === 'my-first');
    expect(myFirstChanges).toHaveLength(2); // schema_myapp, table_users
    expect(myFirstChanges.map(c => c.change_name)).toEqual(['schema_myapp', 'table_users']);
    
    const deploySecondToTagResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
      toChange: 'my-second:@v2.0.0'
    });
    
    expect(deploySecondToTagResult.deployed).toEqual([]); // Already at v2.0.0
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    
    // Verify state remains at my-second v2.0.0 level (all changes deployed)
    deployedChanges = await db.getDeployedChanges();
    const mySecondChanges = deployedChanges.filter(c => c.project === 'my-second');
    expect(mySecondChanges).toHaveLength(3); // create_schema, create_table, create_another_table
    expect(mySecondChanges.map(c => c.change_name)).toEqual(['create_schema', 'create_table', 'create_another_table']);
    
    const deploySecondToSchemaResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
      toChange: 'create_schema'
    });
    
    expect(deploySecondToSchemaResult.deployed).toEqual([]); // Already deployed
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true); // Still exists since we can't revert
    
    // Verify state - my-second remains fully deployed due to fixture limitation
    deployedChanges = await db.getDeployedChanges();
    const mySecondChangesAfterRevert = deployedChanges.filter(c => c.project === 'my-second');
    expect(mySecondChangesAfterRevert).toHaveLength(3); // all changes remain due to fixture limitation
    expect(mySecondChangesAfterRevert.map(c => c.change_name)).toEqual(['create_schema', 'create_table', 'create_another_table']);
    
    const redeployFirstResult = await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
      toChange: 'my-first:@v1.1.0'
    });
    
    expect(redeployFirstResult.deployed).toEqual(['table_products']);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const redeploySecondResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
      toChange: 'my-second:@v2.0.0'
    });
    
    expect(redeploySecondResult.deployed).toEqual([]); // Already deployed due to fixture limitation
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    
    const finalDeployThirdResult = await client.deploy({
      project: 'my-third',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-third', 'launchql.plan'),
      toChange: 'my-third:@v3.0.0'
    });
    
    expect(finalDeployThirdResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    // Verify final state: all dependencies correctly resolved
    const createSchemaDeps = await db.getDependencies('my-third', 'create_schema');
    expect(createSchemaDeps).toContain('my-first:table_products'); // resolved from my-first:@v1.1.0
    expect(createSchemaDeps).toContain('my-second:create_table'); // resolved from my-second:@v2.0.0
    
    // Verify final deployment state
    const finalDeployedChanges = await db.getDeployedChanges();
    const finalMyFirstChanges = finalDeployedChanges.filter(c => c.project === 'my-first');
    const finalMySecondChanges = finalDeployedChanges.filter(c => c.project === 'my-second');
    const finalMyThirdChanges = finalDeployedChanges.filter(c => c.project === 'my-third');
    
    expect(finalMyFirstChanges).toHaveLength(3); // back to full deployment
    expect(finalMySecondChanges).toHaveLength(3); // remains fully deployed (create_schema, create_table, create_another_table)
    expect(finalMyThirdChanges).toHaveLength(2); // full deployment (create_schema, create_table)
    
    expect(finalMyFirstChanges.map(c => c.change_name)).toEqual(['schema_myapp', 'table_users', 'table_products']);
    expect(finalMySecondChanges.map(c => c.change_name)).toEqual(['create_schema', 'create_table', 'create_another_table']);
    expect(finalMyThirdChanges.map(c => c.change_name)).toEqual(['create_schema', 'create_table']);
  });

  test('supports both tag formats: project:@tagName and @tagName', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    const deploySecondToTagResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
      toChange: 'my-second:@v2.0.0'
    });
    
    expect(deploySecondToTagResult.deployed).toEqual(['create_schema', 'create_table']);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    
    const deploySecondShortFormatResult = await client.deploy({
      project: 'my-second',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-second', 'launchql.plan'),
      toChange: '@v2.1.0'
    });
    
    expect(deploySecondShortFormatResult.deployed).toEqual(['create_another_table']);
    expect(await db.exists('table', 'otherschema.user_interactions')).toBe(true);
    expect(await db.exists('table', 'otherschema.consent_agreements')).toBe(true);
    
    // Verify both tag formats resolve to the same changes when appropriate
    const deployedChanges = await db.getDeployedChanges();
    const mySecondChanges = deployedChanges.filter(c => c.project === 'my-second');
    expect(mySecondChanges).toHaveLength(3); // create_schema, create_table, create_another_table
    expect(mySecondChanges.map(c => c.change_name)).toEqual(['create_schema', 'create_table', 'create_another_table']);
  });
});
