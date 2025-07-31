import { TestDatabase } from '../../test-utils';
import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';

describe('Basic Verification with verifyModules', () => {
  let fixture: CoreDeployTestFixture;
  let db: TestDatabase;
  
  beforeEach(async () => {
    fixture = new CoreDeployTestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });
  
  afterEach(async () => {
    await fixture.cleanup();
  });

  test('verifies my-third with tag dependencies in single command', async () => {
    await fixture.deployModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    await fixture.verifyModule('my-third', db.name, ['sqitch', 'simple-w-tags']);
    
    expect(await db.exists('schema', 'myfirstapp')).toBe(true);
    expect(await db.exists('schema', 'mysecondapp')).toBe(true);
    expect(await db.exists('schema', 'mythirdapp')).toBe(true);
    
    expect(await db.exists('table', 'myfirstapp.users')).toBe(true);
    expect(await db.exists('table', 'myfirstapp.products')).toBe(true);
    expect(await db.exists('table', 'mysecondapp.users')).toBe(true);
    expect(await db.exists('table', 'mysecondapp.user_interactions')).toBe(true);
    expect(await db.exists('table', 'mysecondapp.consent_agreements')).toBe(true);
    expect(await db.exists('table', 'mythirdapp.customers')).toBe(true);
    
    const schemas = await db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name IN (\'myfirstapp\', \'mysecondapp\', \'mythirdapp\') ORDER BY schema_name');
    expect(schemas.rows).toHaveLength(3);
    expect(schemas.rows.map((r: any) => r.schema_name)).toEqual(['myfirstapp', 'mysecondapp', 'mythirdapp']);
    
    const tables = await db.query('SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN (\'myfirstapp\', \'mysecondapp\', \'mythirdapp\') ORDER BY table_schema, table_name');
    expect(tables.rows).toHaveLength(6);
    
    const myfirstappTables = tables.rows.filter((r: any) => r.table_schema === 'myfirstapp').map((r: any) => r.table_name);
    expect(myfirstappTables.sort()).toEqual(['products', 'users']);
    
    const mysecondappTables = tables.rows.filter((r: any) => r.table_schema === 'mysecondapp').map((r: any) => r.table_name);
    expect(mysecondappTables.sort()).toEqual(['consent_agreements', 'user_interactions', 'users']);
    
    const mythirdappTables = tables.rows.filter((r: any) => r.table_schema === 'mythirdapp').map((r: any) => r.table_name);
    expect(mythirdappTables).toEqual(['customers']);
  });
});
