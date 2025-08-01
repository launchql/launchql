import { getConnections } from 'graphile-test';
import { gql } from 'graphql-tag';
import { seed } from 'pgsql-test';
import { join } from 'path';

const sql = (f: string) => join(__dirname, f);

const ApiQuery = gql`
  query ApiRoot($domain: String!, $subdomain: String) {
    domains(condition: { domain: $domain, subdomain: $subdomain }) {
      nodes {
        api {
          databaseId
          dbname
          roleName
          anonRole
          isPublic
          schemaNamesFromExt: apiExtensions {
            nodes {
              schemaName
            }
          }
          schemaNames: schemataByApiSchemaApiIdAndSchemaId {
            nodes {
              schemaName
            }
          }
          apiModules {
            nodes {
              name
              data
            }
          }
          database {
            id
            name
          }
        }
        siteId
      }
    }
  }
`;

const ApiByNameQuery = gql`
  query ApiByName($name: String!, $databaseId: UUID!) {
    api: apiByDatabaseIdAndName(name: $name, databaseId: $databaseId) {
      databaseId
      dbname
      roleName
      anonRole
      isPublic
      schemaNamesFromExt: apiExtensions {
        nodes {
          schemaName
        }
      }
      schemaNames: schemataByApiSchemaApiIdAndSchemaId {
        nodes {
          schemaName
        }
      }
      apiModules {
        nodes {
          name
          data
        }
      }
      database {
        id
        name
      }
    }
  }
`;

const metaSchemaFixtures = [
  seed.sqlfile([
    sql('fixtures/meta-schema-test.sql')
  ])
];

describe('Meta Schema GraphQL Type Generation', () => {
  let db: any, query: any, teardown: any;

  beforeAll(async () => {
    ({ db, query, teardown } = await getConnections({
      schemas: ['collections_public', 'meta_public'],
      authRole: 'authenticated'
    }, metaSchemaFixtures));
  });

  afterAll(async () => {
    if (teardown) await teardown();
  });

  test('should generate Api type with correct fields from meta_public.apis table', async () => {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      }
    `;
    
    const result = await query(introspectionQuery);
    expect(result.errors).toBeUndefined();
    
    const apiType = result.data.__schema.types.find((type: any) => type.name === 'Api');
    expect(apiType).toBeDefined();
    
    const fieldNames = apiType.fields.map((field: any) => field.name);
    expect(fieldNames).toContain('databaseId');
    expect(fieldNames).toContain('isPublic');
    expect(fieldNames).toContain('apiExtensions');
    expect(fieldNames).toContain('database');
  });

  test('should execute ApiQuery without GraphQL validation errors', async () => {
    const result = await query(ApiQuery, {
      domain: 'localhost',
      subdomain: 'test'
    });
    
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.domains).toBeDefined();
    expect(result.data.domains.nodes).toHaveLength(1);
    
    const api = result.data.domains.nodes[0].api;
    expect(api).toBeDefined();
    expect(api.databaseId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(api.isPublic).toBe(true);
    expect(api.dbname).toBe('test_db');
    expect(api.roleName).toBe('authenticated');
    expect(api.anonRole).toBe('anonymous');
    
    const siteId = result.data.domains.nodes[0].siteId;
    expect(siteId).toBe('550e8400-e29b-41d4-a716-446655440007');
  });

  test('should execute ApiByNameQuery without GraphQL validation errors', async () => {
    const result = await query(ApiByNameQuery, {
      name: 'test-api',
      databaseId: '550e8400-e29b-41d4-a716-446655440000'
    });
    
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.api).toBeDefined();
    
    const api = result.data.api;
    expect(api.databaseId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(api.isPublic).toBe(true);
    expect(api.dbname).toBe('test_db');
    expect(api.roleName).toBe('authenticated');
    expect(api.anonRole).toBe('anonymous');
    
    expect(api.apiModules.nodes).toHaveLength(1);
    expect(api.apiModules.nodes[0].name).toBe('rls');
  });

  test('should verify field name mapping from snake_case to camelCase', async () => {
    const fieldMappingQuery = `
      query FieldMappingTest {
        apis {
          nodes {
            databaseId
            isPublic
            roleName
            anonRole
          }
        }
      }
    `;
    
    const result = await query(fieldMappingQuery);
    expect(result.errors).toBeUndefined();
    expect(result.data.apis.nodes).toHaveLength(1);
    
    const api = result.data.apis.nodes[0];
    expect(api.databaseId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(api.isPublic).toBe(true);
    expect(api.roleName).toBe('authenticated');
    expect(api.anonRole).toBe('anonymous');
  });
});
