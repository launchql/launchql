import { join } from 'path';
import { getConnections, GraphQLQueryFn } from 'graphile-test';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import gql from 'graphql-tag';
import CustomPgTypeMappingsPlugin from '../src';

const SCHEMA = 'public';
const sql = (f: string) => join(__dirname, '../sql', f);

describe('CustomPgTypeMappingsPlugin', () => {
  describe('default type mappings', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      // Suppress PostGIS extension detection warnings during tests
      const connections = await getConnections(
        {
          schemas: [SCHEMA],
          authRole: 'authenticated',
          graphile: {
            overrideSettings: {
              appendPlugins: [
                CustomPgTypeMappingsPlugin
              ]
            }
          }
        },
        [
          seed.sqlfile([
            sql('roles.sql'),
            sql('test.sql')
          ])
        ]
      );

      ({ db, query, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    beforeEach(async () => {
      db.setContext({
        role: 'authenticated'
      });
    });
    afterEach(() => db.afterEach());
    afterAll(async () => {
      await teardown();
    });

    it('should map email type to String', async () => {
      // Verify the type mapping by checking the GraphQL schema
      // Find the TestTable type and verify emailField is mapped to String
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const emailField = fields.find((f: any) => f.name === 'emailField');
      
      expect(emailField).toBeDefined();
      expect(emailField.type.name).toBe('String');
      expect(emailField.type.kind).toBe('SCALAR');
    });

    it('should map hostname type to String', async () => {
      // Verify the type mapping by checking the GraphQL schema
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const hostnameField = fields.find((f: any) => f.name === 'hostnameField');
      
      expect(hostnameField).toBeDefined();
      expect(hostnameField.type.name).toBe('String');
      expect(hostnameField.type.kind).toBe('SCALAR');
    });

    it('should map url type to String', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const urlField = fields.find((f: any) => f.name === 'urlField');
      
      expect(urlField).toBeDefined();
      expect(urlField.type.name).toBe('String');
      expect(urlField.type.kind).toBe('SCALAR');
    });

    it('should map origin type to String', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const originField = fields.find((f: any) => f.name === 'originField');
      
      expect(originField).toBeDefined();
      expect(originField.type.name).toBe('String');
      expect(originField.type.kind).toBe('SCALAR');
    });

    it('should map multiple_select type to JSON', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const multipleSelectField = fields.find((f: any) => f.name === 'multipleSelectField');
      
      expect(multipleSelectField).toBeDefined();
      expect(multipleSelectField.type.name).toBe('JSON');
      expect(multipleSelectField.type.kind).toBe('SCALAR');
    });

    it('should map single_select type to JSON', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const singleSelectField = fields.find((f: any) => f.name === 'singleSelectField');
      
      expect(singleSelectField).toBeDefined();
      expect(singleSelectField.type.name).toBe('JSON');
      expect(singleSelectField.type.kind).toBe('SCALAR');
    });
  });

  describe('custom type mappings', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      // Create shared database environment with all types needed for testing
      const connections = await getConnections(
        {
          schemas: [SCHEMA],
          authRole: 'authenticated',
          graphile: {
            overrideSettings: {
              appendPlugins: [CustomPgTypeMappingsPlugin],
              graphileBuildOptions: {
                customTypeMappings: [
                  // Add a new custom type mapping
                  { name: 'custom_type', namespaceName: 'public', type: 'JSON' },
                  // Override an existing mapping (email -> JSON instead of String)
                  { name: 'email', namespaceName: 'public', type: 'JSON' }
                ]
              }
            }
          }
        },
        [
          seed.sqlfile([
            sql('roles.sql'),
            sql('test.sql'),
            sql('custom-types.sql')
          ])
        ]
      );

      ({ db, query, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    beforeEach(async () => {
      db.setContext({
        role: 'authenticated'
      });
    });
    afterEach(() => db.afterEach());
    afterAll(async () => {
      await teardown();
    });

    it('should map custom_type to JSON when provided in custom mappings', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const customTypeField = fields.find((f: any) => f.name === 'customTypeField');
      
      expect(customTypeField).toBeDefined();
      expect(customTypeField.type.name).toBe('JSON');
      expect(customTypeField.type.kind).toBe('SCALAR');
    });

    it('should override default email mapping to JSON', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const emailField = fields.find((f: any) => f.name === 'emailField');
      
      expect(emailField).toBeDefined();
      // Email should now be JSON instead of String (overridden)
      expect(emailField.type.name).toBe('JSON');
      expect(emailField.type.kind).toBe('SCALAR');
    });

    it('should still map other default types when overriding one', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const urlField = fields.find((f: any) => f.name === 'urlField');
      const hostnameField = fields.find((f: any) => f.name === 'hostnameField');
      
      expect(urlField).toBeDefined();
      expect(hostnameField).toBeDefined();
      expect(urlField.type.name).toBe('String');
      expect(hostnameField.type.name).toBe('String');
    });
  });

  describe('custom type mappings - multiple custom types', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          schemas: [SCHEMA],
          authRole: 'authenticated',
          graphile: {
            overrideSettings: {
              appendPlugins: [CustomPgTypeMappingsPlugin],
              graphileBuildOptions: {
                customTypeMappings: [
                  { name: 'custom_type', namespaceName: 'public', type: 'JSON' },
                  { name: 'currency_type', namespaceName: 'public', type: 'String' },
                  { name: 'metadata_type', namespaceName: 'public', type: 'JSON' }
                ]
              }
            }
          }
        },
        [
          seed.sqlfile([
            sql('roles.sql'),
            sql('test.sql'),
            sql('custom-types-partial.sql')
          ])
        ]
      );

      ({ db, query, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    beforeEach(async () => {
      db.setContext({
        role: 'authenticated'
      });
    });
    afterEach(() => db.afterEach());
    afterAll(async () => {
      await teardown();
    });

    it('should map multiple custom types correctly', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const customTypeField = fields.find((f: any) => f.name === 'customTypeField');
      const currencyField = fields.find((f: any) => f.name === 'currencyField');
      const metadataField = fields.find((f: any) => f.name === 'metadataField');
      
      expect(customTypeField).toBeDefined();
      expect(customTypeField.type.name).toBe('JSON');
      expect(currencyField).toBeDefined();
      expect(currencyField.type.name).toBe('String');
      expect(metadataField).toBeDefined();
      expect(metadataField.type.name).toBe('JSON');
    });
  });

  describe('custom type mappings - override multiple defaults', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          schemas: [SCHEMA],
          authRole: 'authenticated',
          graphile: {
            overrideSettings: {
              appendPlugins: [CustomPgTypeMappingsPlugin],
              graphileBuildOptions: {
                customTypeMappings: [
                  // Override multiple default mappings
                  { name: 'email', namespaceName: 'public', type: 'JSON' },
                  { name: 'url', namespaceName: 'public', type: 'JSON' },
                  { name: 'hostname', namespaceName: 'public', type: 'JSON' }
                ]
              }
            }
          }
        },
        [
          seed.sqlfile([
            sql('roles.sql'),
            sql('test.sql')
          ])
        ]
      );

      ({ db, query, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    beforeEach(async () => {
      db.setContext({
        role: 'authenticated'
      });
    });
    afterEach(() => db.afterEach());
    afterAll(async () => {
      await teardown();
    });

    it('should override multiple default mappings at once', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const emailField = fields.find((f: any) => f.name === 'emailField');
      const urlField = fields.find((f: any) => f.name === 'urlField');
      const hostnameField = fields.find((f: any) => f.name === 'hostnameField');
      
      expect(emailField).toBeDefined();
      expect(emailField.type.name).toBe('JSON');
      expect(urlField).toBeDefined();
      expect(urlField.type.name).toBe('JSON');
      expect(hostnameField).toBeDefined();
      expect(hostnameField.type.name).toBe('JSON');
    });

    it('should still map non-overridden default types', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      // Try different possible field name variations
      const originField = fields.find((f: any) => 
        f.name === 'originField' || 
        f.name === 'origin_field' ||
        f.name.toLowerCase().includes('origin')
      );
      
      // If not found, log all field names for debugging
      if (!originField) {
        const fieldNames = fields.map((f: any) => f.name);
        console.log('Available fields:', fieldNames);
      }
      
      expect(originField).toBeDefined();
      expect(originField.type.name).toBe('String');
    });
  });

  describe('custom type mappings - add and override together', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          schemas: [SCHEMA],
          authRole: 'authenticated',
          graphile: {
            overrideSettings: {
              appendPlugins: [CustomPgTypeMappingsPlugin],
              graphileBuildOptions: {
                customTypeMappings: [
                  // Add new type
                  { name: 'custom_type', namespaceName: 'public', type: 'JSON' },
                  // Override existing type
                  { name: 'email', namespaceName: 'public', type: 'JSON' },
                  // Add another new type
                  { name: 'timestamp_type', namespaceName: 'public', type: 'String' }
                ]
              }
            }
          }
        },
        [
          seed.sqlfile([
            sql('roles.sql'),
            sql('test.sql'),
            sql('timestamp-type.sql')
          ])
        ]
      );

      ({ db, query, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    beforeEach(async () => {
      db.setContext({
        role: 'authenticated'
      });
    });
    afterEach(() => db.afterEach());
    afterAll(async () => {
      await teardown();
    });

    it('should handle both adding new types and overriding defaults', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const customTypeField = fields.find((f: any) => f.name === 'customTypeField');
      const emailField = fields.find((f: any) => f.name === 'emailField');
      const timestampField = fields.find((f: any) => f.name === 'timestampField');
      
      expect(customTypeField).toBeDefined();
      expect(customTypeField.type.name).toBe('JSON');
      expect(emailField).toBeDefined();
      expect(emailField.type.name).toBe('JSON');
      expect(timestampField).toBeDefined();
      expect(timestampField.type.name).toBe('String');
    });
  });

  describe('custom type mappings - empty custom mappings', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          schemas: [SCHEMA],
          authRole: 'authenticated',
          graphile: {
            overrideSettings: {
              appendPlugins: [CustomPgTypeMappingsPlugin],
              graphileBuildOptions: {
                customTypeMappings: []
              }
            }
          }
        },
        [
          seed.sqlfile([
            sql('roles.sql'),
            sql('test.sql')
          ])
        ]
      );

      ({ db, query, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    beforeEach(async () => {
      db.setContext({
        role: 'authenticated'
      });
    });
    afterEach(() => db.afterEach());
    afterAll(async () => {
      await teardown();
    });

    it('should use only default mappings when custom mappings is empty array', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const emailField = fields.find((f: any) => f.name === 'emailField');
      const urlField = fields.find((f: any) => f.name === 'urlField');
      
      expect(emailField).toBeDefined();
      expect(emailField.type.name).toBe('String');
      expect(urlField).toBeDefined();
      expect(urlField.type.name).toBe('String');
    });
  });

  describe('custom type mappings - using plugin factory with options', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      // Create a plugin factory that passes options directly
      const CustomPluginFactory = (builder: any) => {
        return CustomPgTypeMappingsPlugin(builder, {
          customTypeMappings: [
            { name: 'custom_type', namespaceName: 'public', type: 'String' }
          ]
        });
      };

      const connections = await getConnections(
        {
          schemas: [SCHEMA],
          authRole: 'authenticated',
          graphile: {
            overrideSettings: {
              appendPlugins: [CustomPluginFactory]
            }
          }
        },
        [
          seed.sqlfile([
            sql('roles.sql'),
            sql('test.sql')
          ])
        ]
      );

      ({ db, query, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    beforeEach(async () => {
      db.setContext({
        role: 'authenticated'
      });
    });
    afterEach(() => db.afterEach());
    afterAll(async () => {
      await teardown();
    });

    it('should map custom_type when using plugin factory with options', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const customTypeField = fields.find((f: any) => f.name === 'customTypeField');
      
      expect(customTypeField).toBeDefined();
      expect(customTypeField.type.name).toBe('String');
    });

    it('should still include default mappings when using plugin factory', async () => {
      const TYPE_INTROSPECTION_QUERY = gql`
        query {
          __type(name: "TestTable") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;
      
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes.errors).toBeUndefined();
      
      const fields = typeRes.data?.__type?.fields || [];
      const emailField = fields.find((f: any) => f.name === 'emailField');
      const urlField = fields.find((f: any) => f.name === 'urlField');
      
      expect(emailField).toBeDefined();
      expect(emailField.type.name).toBe('String');
      expect(urlField).toBeDefined();
      expect(urlField.type.name).toBe('String');
    });
  });
});

