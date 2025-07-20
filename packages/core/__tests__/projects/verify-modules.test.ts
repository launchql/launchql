import { CoreDeployTestFixture } from '../../test-utils/CoreDeployTestFixture';
import { TestDatabase } from '../../test-utils';

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
    
    expect(await db.exists('schema', 'myapp')).toBe(true);
    expect(await db.exists('schema', 'otherschema')).toBe(true);
    expect(await db.exists('schema', 'metaschema')).toBe(true);
    
    expect(await db.exists('table', 'myapp.users')).toBe(true);
    expect(await db.exists('table', 'myapp.products')).toBe(true);
    expect(await db.exists('table', 'otherschema.users')).toBe(true);
    expect(await db.exists('table', 'otherschema.user_interactions')).toBe(true);
    expect(await db.exists('table', 'otherschema.consent_agreements')).toBe(true);
    expect(await db.exists('table', 'metaschema.customers')).toBe(true);
    
    const schemas = await db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name IN (\'myapp\', \'otherschema\', \'metaschema\') ORDER BY schema_name');
    expect(schemas.rows).toHaveLength(3);
    expect(schemas.rows.map((r: any) => r.schema_name)).toEqual(['metaschema', 'myapp', 'otherschema']);
    
    const tables = await db.query('SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN (\'myapp\', \'otherschema\', \'metaschema\') ORDER BY table_schema, table_name');
    expect(tables.rows).toHaveLength(6);
    
    const myappTables = tables.rows.filter((r: any) => r.table_schema === 'myapp').map((r: any) => r.table_name);
    expect(myappTables.sort()).toEqual(['products', 'users']);
    
    const otherschemaTables = tables.rows.filter((r: any) => r.table_schema === 'otherschema').map((r: any) => r.table_name);
    expect(otherschemaTables.sort()).toEqual(['consent_agreements', 'user_interactions', 'users']);
    
    const metaschemaTables = tables.rows.filter((r: any) => r.table_schema === 'metaschema').map((r: any) => r.table_name);
    expect(metaschemaTables).toEqual(['customers']);
  });
});
