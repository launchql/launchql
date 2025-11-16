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

    expect(await db.exists('schema', 'mythirdapp')).toBe(true);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(true);

    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(false);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(false);

    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(true);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(true);

    await fixture.revertModule('my-first:@v1.0.0', db.name, ['sqitch', 'simple-w-tags']);

    expect(await db.exists('schema', 'mythirdapp')).toBe(false);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(false);

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

    expect(await db.exists('schema', 'mythirdapp')).toBe(true);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.products')).toBe(true);
    
    const columns = await db.query('SELECT column_name FROM information_schema.columns WHERE table_schema = \'myfirstapp\' AND table_name = \'products\' AND column_name = \'category\'');
    expect(columns.rows).toHaveLength(1);
    expect(columns.rows[0].column_name).toBe('category');

    writeFileSync(tableProductsPath, originalTableProducts);

  });
});
