process.env.LAUNCHQL_DEBUG = 'true';

import { readFileSync } from 'fs';
import { join } from 'path';
import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

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
