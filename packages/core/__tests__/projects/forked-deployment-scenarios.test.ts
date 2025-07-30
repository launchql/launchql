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
    const deployDir = join(packagePath, 'deploy');
    const tableProductsPath = join(deployDir, 'table_products.sql');
    
    const originalTableProducts = readFileSync(tableProductsPath, 'utf8');
    const modifiedTableProducts = originalTableProducts.replace(
      'updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()',
      'updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n  category TEXT DEFAULT \'general\''
    );
    writeFileSync(tableProductsPath, modifiedTableProducts);

    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    const columns = await db.query('SELECT column_name FROM information_schema.columns WHERE table_schema = \'myapp\' AND table_name = \'products\' AND column_name = \'category\'');
    expect(columns.rows).toHaveLength(1);
    expect(columns.rows[0].column_name).toBe('category');

    writeFileSync(tableProductsPath, originalTableProducts);

  });
});

describe('Tag functionality with CoreDeployTestFixture', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('adds tag to package and generates correct plan file', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const planPath = join(packagePath, 'launchql.plan');
    
    const originalPlan = readFileSync(planPath, 'utf8');
    expect(originalPlan).toMatchSnapshot('original-plan-file');
    
    const { LaunchQLPackage } = require('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    
    pkg.addTag('v1.1.0', undefined, 'Test release tag');
    
    const updatedPlan = readFileSync(planPath, 'utf8');
    expect(updatedPlan).toMatchSnapshot('plan-file-with-tag');
    
    expect(updatedPlan).toContain('@v1.1.0');
    expect(updatedPlan).toContain('# Test release tag');
  });

  test('deploys and reverts using tag targets', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    
    const { LaunchQLPackage } = require('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    pkg.addTag('v1.0.0', 'metaschema', 'Initial schema tag');
    
    await fixture.deployModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    await fixture.deployModule('my-first', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    
    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(false);
  });

  test('handles tag with specific change target', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-second');
    const planPath = join(packagePath, 'launchql.plan');
    
    const { LaunchQLPackage } = require('../../src/core/class/launchql');
    const pkg = new LaunchQLPackage(packagePath);
    pkg.addTag('v2.1.0', 'add_customers', 'Customer feature release');
    
    const updatedPlan = readFileSync(planPath, 'utf8');
    expect(updatedPlan).toMatchSnapshot('plan-file-with-specific-change-tag');
    
    expect(updatedPlan).toContain('@v2.1.0');
    expect(updatedPlan).toContain('# Customer feature release');
    
    await fixture.deployModule('my-second:@v2.1.0', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
  });
});
