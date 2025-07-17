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
    
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    const schemas = await db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = \'metaschema\'');
    expect(schemas.rows).toHaveLength(1);
    expect(schemas.rows[0].schema_name).toBe('metaschema');
    
    const tables = await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'metaschema\' ORDER BY table_name');
    expect(tables.rows).toHaveLength(1);
    expect(tables.rows.map((r: any) => r.table_name)).toEqual(['customers']);
    
    await fixture.revertModule('my-third', db.name, ['sqitch', 'simple-w-tags'], 'my-first:@v1.0.0');

    expect(await db.exists('schema', 'metaschema')).toBe(false);
    expect(await db.exists('table', 'metaschema.customers')).toBe(false);

  });
});
