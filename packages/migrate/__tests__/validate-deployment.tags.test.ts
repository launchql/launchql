import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';
import { writeFileSync } from 'fs';

describe('validateDeployment with tags', () => {
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

  test('validates up to same-project tag @v1.0.0', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    const validationResult = await client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-first', 'launchql.plan'),
      'my-first',
      '@v1.0.0'
    );
    
    expect(validationResult.validated).toEqual(['schema_myapp', 'table_users']);
    expect(validationResult.failed).toEqual([]);
  });

  test('validates up to same-project tag @v1.1.0', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    const validationResult = await client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-first', 'launchql.plan'),
      'my-first',
      '@v1.1.0'
    );
    
    expect(validationResult.validated).toEqual(['schema_myapp', 'table_users', 'table_products']);
    expect(validationResult.failed).toEqual([]);
  });

  test('validates cross-project tag dependency my-first:@v1.0.0', async () => {
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
    
    const validationResult = await client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-second', 'launchql.plan'),
      'my-second',
      'my-first:@v1.0.0'
    );
    
    expect(validationResult.validated).toEqual([]);
    expect(validationResult.failed).toEqual([]);
  });

  test('validates up to cross-project tag my-second:@v2.0.0 from my-third project', async () => {
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
    
    const validationResult = await client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-third', 'launchql.plan'),
      'my-third',
      'my-second:@v2.0.0'
    );
    
    expect(validationResult.validated).toEqual([]);
    expect(validationResult.failed).toEqual([]);
  });

  test('detects hash mismatch when validating up to tag', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    const productsScriptPath = join(basePath, 'packages', 'my-first', 'deploy', 'table_products.sql');
    const originalContent = require('fs').readFileSync(productsScriptPath, 'utf-8');
    writeFileSync(productsScriptPath, originalContent + '\n-- modified for test');
    
    const validationResult = await client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-first', 'launchql.plan'),
      'my-first',
      '@v1.1.0'
    );
    
    expect(validationResult.validated).toEqual(['schema_myapp', 'table_users']);
    expect(validationResult.failed).toHaveLength(1);
    expect(validationResult.failed[0].changeName).toBe('table_products');
    expect(validationResult.failed[0].message).toContain('Hash mismatch');
  });

  test('throws error for non-existent tag', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await expect(client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-first', 'launchql.plan'),
      'my-first',
      '@v99.0.0'
    )).rejects.toThrow(/Tag not found: v99.0.0/);
  });

  test('throws error for invalid tag format', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await expect(client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-first', 'launchql.plan'),
      'my-first',
      'invalid-tag-format'
    )).rejects.toThrow(/Invalid toChange reference/);
  });

  test('validates with regular change name (non-tag)', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    const validationResult = await client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-first', 'launchql.plan'),
      'my-first',
      'table_users'
    );
    
    expect(validationResult.validated).toEqual(['schema_myapp', 'table_users']);
    expect(validationResult.failed).toEqual([]);
  });

  test('handles empty toChange parameter (validates all deployed changes)', async () => {
    const basePath = fixture.setupFixture(['sqitch', 'simple-w-tags']);
    
    await client.deploy({
      project: 'my-first',
      targetDatabase: db.name,
      planPath: join(basePath, 'packages', 'my-first', 'launchql.plan'),
    });
    
    const validationResult = await client.validateDeployment(
      db.name,
      join(basePath, 'packages', 'my-first', 'launchql.plan'),
      'my-first'
    );
    
    expect(validationResult.validated).toEqual(['schema_myapp', 'table_users', 'table_products']);
    expect(validationResult.failed).toEqual([]);
  });
});
