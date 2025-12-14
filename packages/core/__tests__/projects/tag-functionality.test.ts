process.env.LAUNCHQL_DEBUG = 'true';

import { TestDatabase } from '../../test-utils';
import { teardownPgPools } from 'pg-cache';
import { readFileSync } from 'fs';
import { PgpmPackage } from '../../src/core/class/pgpm';
import { join } from 'path';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Tag functionality with CoreDeployTestFixture', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple');
    db = await fixture.setupTestDatabase();
  });
  
  afterAll(async () => {
    await teardownPgPools();
  });

  test('adds tag to package and generates correct plan file', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    const planPath = join(packagePath, 'pgpm.plan');
    
    const pkg = new PgpmPackage(packagePath);
    
    pkg.addTag('v1.2.0', undefined, 'Test release tag');
    
    const updatedPlan = readFileSync(planPath, 'utf8');
    
    expect(updatedPlan).toContain('@v1.2.0');
    expect(updatedPlan).toContain('# Test release tag');
  });

  test('deploys and reverts using tag targets', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-first');
    
    const pkg = new PgpmPackage(packagePath);
    pkg.addTag('v1.3.0', 'schema_myfirstapp', 'Initial schema tag');
    
    await fixture.deployModule('my-first:@v1.3.0', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'myfirstapp')).toBe(true);
    
    await fixture.deployModule('my-first', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'myfirstapp')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.products')).toBe(true);
    
    await fixture.revertModule('my-first:@v1.3.0', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'myfirstapp')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.products')).toBe(false);
  });

  test('handles tag with specific change target', async () => {
    const basePath = fixture.tempFixtureDir;
    const packagePath = join(basePath, 'packages', 'my-second');
    
    const pkg = new PgpmPackage(packagePath);
    pkg.addTag('v2.2.0', 'create_table', 'Table creation release');
    
    const updatedPlan = readFileSync(join(packagePath, 'pgpm.plan'), 'utf8');
    
    expect(updatedPlan).toContain('@v2.2.0');
    expect(updatedPlan).toContain('# Table creation release');
    
    await fixture.deployModule('my-second:@v2.2.0', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'mysecondapp')).toBe(true);
  });
});
