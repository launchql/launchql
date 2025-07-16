import { LaunchQLMigrate } from '../src/client';
import { MigrateTestFixture, TestDatabase } from '../test-utils';
import { join } from 'path';
import { writeFileSync } from 'fs';

describe('validateDeployment', () => {
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

  test('validates successfully when files match deployed hashes', async () => {
    const basePath = fixture.createPlanFile('test-project', [
      { name: 'create_schema', comment: 'Create test schema' },
      { name: 'create_table', dependencies: ['create_schema'], comment: 'Create test table' }
    ]);
    
    fixture.createScript(basePath, 'deploy', 'create_schema', 'CREATE SCHEMA test_schema;');
    fixture.createScript(basePath, 'deploy', 'create_table', 'CREATE TABLE test_schema.test_table (id SERIAL PRIMARY KEY);');
    
    const planPath = join(basePath, 'launchql.plan');
    
    const deployResult = await client.deploy({
      project: 'test-project',
      targetDatabase: db.name,
      planPath
    });
    
    expect(deployResult.deployed).toEqual(['create_schema', 'create_table']);
    
    const validationResult = await client.validateDeployment(
      db.name,
      planPath,
      'test-project'
    );
    
    expect(validationResult.validated).toEqual(['create_schema', 'create_table']);
    expect(validationResult.failed).toEqual([]);
  });

  test('detects hash mismatch when SQL file is modified after deployment', async () => {
    const basePath = fixture.createPlanFile('test-project', [
      { name: 'create_schema', comment: 'Create test schema' },
      { name: 'create_table', dependencies: ['create_schema'], comment: 'Create test table' }
    ]);
    
    const originalSchemaContent = 'CREATE SCHEMA test_schema;';
    const modifiedSchemaContent = 'CREATE SCHEMA test_schema_modified;';
    
    fixture.createScript(basePath, 'deploy', 'create_schema', originalSchemaContent);
    fixture.createScript(basePath, 'deploy', 'create_table', 'CREATE TABLE test_schema.test_table (id SERIAL PRIMARY KEY);');
    
    const planPath = join(basePath, 'launchql.plan');
    
    const deployResult = await client.deploy({
      project: 'test-project',
      targetDatabase: db.name,
      planPath
    });
    
    expect(deployResult.deployed).toEqual(['create_schema', 'create_table']);
    
    const schemaScriptPath = join(basePath, 'deploy', 'create_schema.sql');
    writeFileSync(schemaScriptPath, modifiedSchemaContent);
    
    const validationResult = await client.validateDeployment(
      db.name,
      planPath,
      'test-project'
    );
    
    expect(validationResult.validated).toEqual(['create_table']);
    expect(validationResult.failed).toHaveLength(1);
    expect(validationResult.failed[0]).toMatchObject({
      changeName: 'create_schema',
      message: expect.stringContaining('Hash mismatch for create_schema')
    });
    expect(validationResult.failed[0].expectedHash).not.toBe(validationResult.failed[0].actualHash);
  });

  test('handles missing local files gracefully', async () => {
    const basePath = fixture.createPlanFile('test-project', [
      { name: 'create_schema', comment: 'Create test schema' }
    ]);
    
    fixture.createScript(basePath, 'deploy', 'create_schema', 'CREATE SCHEMA test_schema;');
    
    const planPath = join(basePath, 'launchql.plan');
    
    const deployResult = await client.deploy({
      project: 'test-project',
      targetDatabase: db.name,
      planPath
    });
    
    expect(deployResult.deployed).toEqual(['create_schema']);
    
    const schemaScriptPath = join(basePath, 'deploy', 'create_schema.sql');
    const fs = require('fs');
    fs.unlinkSync(schemaScriptPath);
    
    const validationResult = await client.validateDeployment(
      db.name,
      planPath,
      'test-project'
    );
    
    expect(validationResult.validated).toEqual([]);
    expect(validationResult.failed).toHaveLength(1);
    expect(validationResult.failed[0]).toMatchObject({
      changeName: 'create_schema',
      actualHash: 'FILE_NOT_FOUND',
      message: expect.stringContaining('Local deploy script not found')
    });
  });

  test('validates only up to specified change when toChange parameter is provided', async () => {
    const basePath = fixture.createPlanFile('test-project', [
      { name: 'create_schema', comment: 'Create test schema' },
      { name: 'create_table', dependencies: ['create_schema'], comment: 'Create test table' },
      { name: 'create_index', dependencies: ['create_table'], comment: 'Create test index' }
    ]);
    
    fixture.createScript(basePath, 'deploy', 'create_schema', 'CREATE SCHEMA test_schema;');
    fixture.createScript(basePath, 'deploy', 'create_table', 'CREATE TABLE test_schema.test_table (id SERIAL PRIMARY KEY);');
    fixture.createScript(basePath, 'deploy', 'create_index', 'CREATE INDEX idx_test ON test_schema.test_table (id);');
    
    const planPath = join(basePath, 'launchql.plan');
    
    const deployResult = await client.deploy({
      project: 'test-project',
      targetDatabase: db.name,
      planPath
    });
    
    expect(deployResult.deployed).toEqual(['create_schema', 'create_table', 'create_index']);
    
    const validationResult = await client.validateDeployment(
      db.name,
      planPath,
      'test-project',
      'create_table'
    );
    
    expect(validationResult.validated).toEqual(['create_schema', 'create_table']);
    expect(validationResult.failed).toEqual([]);
  });

  test('handles database connection errors gracefully', async () => {
    const basePath = fixture.createPlanFile('test-project', [
      { name: 'create_schema', comment: 'Create test schema' }
    ]);
    
    fixture.createScript(basePath, 'deploy', 'create_schema', 'CREATE SCHEMA test_schema;');
    
    const planPath = join(basePath, 'launchql.plan');
    
    const invalidClient = new LaunchQLMigrate({
      host: 'nonexistent-host',
      port: 5432,
      user: 'test',
      password: 'test',
      database: 'test'
    });
    
    await expect(invalidClient.validateDeployment(
      'test',
      planPath,
      'test-project'
    )).rejects.toThrow(/Database connection failed|getaddrinfo|ENOTFOUND|EAI_AGAIN/);
  });
});
