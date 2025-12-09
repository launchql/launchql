import { join } from 'path';
import { getConnections, GraphQLQueryFn } from 'graphile-test';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import gql from 'graphql-tag';
import CustomPgTypeMappingsPlugin from '../src';

const SCHEMA = 'public';
const sql = (f: string) => join(__dirname, '../sql', f);

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

    it('should map default types correctly', async () => {
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes).toMatchSnapshot();
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

    it('should handle custom type mappings', async () => {
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes).toMatchSnapshot();
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
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes).toMatchSnapshot();
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

    it('should override multiple default mappings', async () => {
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes).toMatchSnapshot();
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
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes).toMatchSnapshot();
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
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes).toMatchSnapshot();
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

    it('should handle plugin factory with options', async () => {
      const typeRes = await query(TYPE_INTROSPECTION_QUERY);
      expect(typeRes).toMatchSnapshot();
    });
  });
});
