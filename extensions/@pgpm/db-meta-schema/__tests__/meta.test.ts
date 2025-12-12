import { getConnections, PgTestClient } from 'pgsql-test';
import { snapshot } from 'graphile-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

describe('db_meta functionality', () => {
  beforeAll(async () => {
    ({ pg, teardown } = await getConnections());
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await pg.beforeEach();
    // Grant execute permissions for functions
    await pg.any(`GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO public`);
  });

  afterEach(async () => {
    await pg.afterEach();
  });

  it('should handle complete meta workflow', async () => {
    const objs: Record<string, any> = {
      tables: {},
      domains: {},
      apis: {},
      sites: {}
    };

    const owner_id = '07281002-1699-4762-57e3-ab1b92243120';

    // Helper function for snapshots
    const snap = (obj: any) => {
      expect(snapshot(obj)).toMatchSnapshot();
    };

    // Helper function for snapshots with dbname normalization
    const snapWithNormalizedDbname = (obj: any) => {
      const normalized = {
        ...obj,
        dbname: 'test-database' // Replace dynamic dbname with static value
      };
      expect(snapshot(normalized)).toMatchSnapshot();
    };

    // Step 1: Create database
    const [database] = await pg.any(
      `INSERT INTO collections_public.database (owner_id, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [owner_id, 'my-meta-db']
    );
    objs.db = database;
    const database_id = database.id;
    expect(snapshot(database)).toMatchSnapshot();

    // Step 2: Create APIs first (since domains reference them)
    const [publicApi] = await pg.any(
      `INSERT INTO meta_public.apis (database_id, name, role_name, anon_role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [database_id, 'public', 'authenticated', 'anonymous']
    );
    objs.apis.public = publicApi;
    snapWithNormalizedDbname(publicApi);

    const [adminApi] = await pg.any(
      `INSERT INTO meta_public.apis (database_id, name, role_name, anon_role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [database_id, 'admin', 'administrator', 'administrator']
    );
    objs.apis.admin = adminApi;
    snapWithNormalizedDbname(adminApi);

    // Step 3: Create sites
    const [appSite] = await pg.any(
      `INSERT INTO meta_public.sites (database_id, title, description) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [database_id, 'Website Title', 'Website Description']
    );
    objs.sites.app = appSite;
    snapWithNormalizedDbname(appSite);

    // Step 4: Register domains (linking to APIs and sites)
    const [apiDomain] = await pg.any(
      `INSERT INTO meta_public.domains (database_id, api_id, domain, subdomain) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [database_id, objs.apis.public.id, 'pgpm.io', 'api']
    );
    objs.domains.api = apiDomain;
    expect(snapshot(apiDomain)).toMatchSnapshot();

    const [appDomain] = await pg.any(
      `INSERT INTO meta_public.domains (database_id, site_id, domain, subdomain) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [database_id, objs.sites.app.id, 'pgpm.io', 'app']
    );
    objs.domains.app = appDomain;
    expect(snapshot(appDomain)).toMatchSnapshot();

    const [adminDomain] = await pg.any(
      `INSERT INTO meta_public.domains (database_id, api_id, domain, subdomain) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [database_id, objs.apis.admin.id, 'pgpm.io', 'admin']
    );
    objs.domains.admin = adminDomain;
    expect(snapshot(adminDomain)).toMatchSnapshot();

    const [baseDomain] = await pg.any(
      `INSERT INTO meta_public.domains (database_id, domain) 
       VALUES ($1, $2) 
       RETURNING *`,
      [database_id, 'pgpm.io']
    );
    objs.domains.base = baseDomain;

    // Step 5: Register modules
    const [siteModule1] = await pg.any(
      `INSERT INTO meta_public.site_modules (database_id, site_id, name, data) 
       VALUES ($1, $2, $3, $4::jsonb) 
       RETURNING *`,
      [database_id, objs.sites.app.id, 'legal-emails', JSON.stringify({
        supportEmail: 'support@interweb.co'
      })]
    );
    expect(snapshot(siteModule1)).toMatchSnapshot();

    const [apiModule] = await pg.any(
      `INSERT INTO meta_public.api_modules (database_id, api_id, name, data) 
       VALUES ($1, $2, $3, $4::jsonb) 
       RETURNING *`,
      [database_id, objs.apis.public.id, 'rls_module', JSON.stringify({
        authenticate_schema: 'meta_private',
        authenticate: 'authenticate'
      })]
    );
    expect(snapshot(apiModule)).toMatchSnapshot();

    const [siteModule2] = await pg.any(
      `INSERT INTO meta_public.site_modules (database_id, site_id, name, data) 
       VALUES ($1, $2, $3, $4::jsonb) 
       RETURNING *`,
      [database_id, objs.sites.app.id, 'user_auth_module', JSON.stringify({
        auth_schema: 'meta_public',
        sign_in: 'login',
        sign_up: 'register',
        set_password: 'set_password',
        reset_password: 'reset_password',
        forgot_password: 'forgot_password',
        send_verification_email: 'send_verification_email',
        verify_email: 'verify_email'
      })]
    );
    expect(snapshot(siteModule2)).toMatchSnapshot();

    // Step 6: Schema associations
    const [schema] = await pg.any(
      `INSERT INTO collections_public.schema (database_id, schema_name, name) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [database_id, 'brand-public', 'public']
    );

    const [publicAssoc] = await pg.any(
      `INSERT INTO meta_public.api_schemata (database_id, schema_id, api_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [database_id, schema.id, objs.apis.public.id]
    );
    
    const [adminAssoc] = await pg.any(
      `INSERT INTO meta_public.api_schemata (database_id, schema_id, api_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [database_id, schema.id, objs.apis.admin.id]
    );
    
    snap(publicAssoc);
    snap(adminAssoc);
  });

  // Individual component tests
  it('should create database independently', async () => {
    const owner_id = '07281002-1699-4762-57e3-ab1b92243120';
    
    const [database] = await pg.any(
      `INSERT INTO collections_public.database (owner_id, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [owner_id, 'test-db']
    );
    
    expect(database.owner_id).toBe(owner_id);
    expect(database.name).toBe('test-db');
    expect(database.id).toBeDefined();
  });

  it('should register domain independently', async () => {
    const owner_id = '07281002-1699-4762-57e3-ab1b92243120';
    
    // Create database first
    const [database] = await pg.any(
      `INSERT INTO collections_public.database (owner_id, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [owner_id, 'test-db-for-domain']
    );
    
    // Then create domain
    const [domain] = await pg.any(
      `INSERT INTO meta_public.domains (database_id, domain, subdomain) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [database.id, 'example.com', 'api']
    );
    
    expect(domain.database_id).toBe(database.id);
    expect(domain.domain).toBe('example.com');
    expect(domain.subdomain).toBe('api');
  });
});
