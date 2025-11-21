process.env.LOG_SCOPE = 'graphile-test';

import gql from 'graphql-tag';
import { join } from 'path';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { getConnections } from '../src/get-connections';
import type { GraphQLQueryFn } from 'graphile-test';
import { IntrospectionQuery } from '../test-utils/queries';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

// Test plugin that adds a custom field to the root query
const TestPlugin = (builder: any) => {
  builder.hook('GraphQLObjectType:fields', (fields: any, build: any, context: any) => {
    const { scope } = context;
    if (scope.isRootQuery) {
      return build.extend(fields, {
        testPluginField: {
          type: build.graphql.GraphQLString,
          resolve: () => 'test-plugin-value'
        }
      });
    }
    return fields;
  });
};

// Another test plugin that adds a different field
const AnotherTestPlugin = (builder: any) => {
  builder.hook('GraphQLObjectType:fields', (fields: any, build: any, context: any) => {
    const { scope } = context;
    if (scope.isRootQuery) {
      return build.extend(fields, {
        anotherTestField: {
          type: build.graphql.GraphQLString,
          resolve: () => 'another-test-value'
        }
      });
    }
    return fields;
  });
};

describe('graphile-test with plugins', () => {
  describe('appendPlugins', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          useRoot: true,
          schemas,
          authRole: 'postgres',
          graphile: {
            appendPlugins: [TestPlugin]
          }
        },
        [
          seed.sqlfile([
            sql('test.sql')
          ])
        ]
      );

      ({ query, db, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    afterEach(() => db.afterEach());
    afterAll(() => teardown());

    it('should add custom field from plugin to root query', async () => {
      const TEST_QUERY = gql`
        query {
          testPluginField
        }
      `;

      const res = await query(TEST_QUERY);
      expect(res.data?.testPluginField).toBe('test-plugin-value');
      expect(res.errors).toBeUndefined();
    });

    it('should include plugin field in introspection', async () => {
      const res = await query(IntrospectionQuery);
      expect(res.data).not.toBeNull();
      expect(res.data).not.toBeUndefined();
      expect(res.errors).toBeUndefined();
      
      const queryTypeName = res.data?.__schema?.queryType?.name;
      expect(queryTypeName).toBe('Query');
      
      // Find the Query type in the types array
      const types = res.data?.__schema?.types || [];
      const queryType = types.find((t: any) => t.name === queryTypeName);
      expect(queryType).not.toBeNull();
      expect(queryType).not.toBeUndefined();
      expect(queryType?.name).toBe('Query');
      expect(Array.isArray(queryType?.fields)).toBe(true);
      
      const fields = queryType?.fields || [];
      const testField = fields.find((f: any) => f.name === 'testPluginField');
      expect(testField).not.toBeNull();
      expect(testField).not.toBeUndefined();
      expect(testField?.name).toBe('testPluginField');
      
      // Handle nested type references
      const typeName = testField.type?.name || 
                      testField.type?.ofType?.name || 
                      testField.type?.ofType?.ofType?.name;
      expect(typeName).toBe('String');
    });
  });

  describe('multiple appendPlugins', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          useRoot: true,
          schemas,
          authRole: 'postgres',
          graphile: {
            appendPlugins: [TestPlugin, AnotherTestPlugin]
          }
        },
        [
          seed.sqlfile([
            sql('test.sql')
          ])
        ]
      );

      ({ query, db, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    afterEach(() => db.afterEach());
    afterAll(() => teardown());

    it('should add multiple custom fields from multiple plugins', async () => {
      const TEST_QUERY = gql`
        query {
          testPluginField
          anotherTestField
        }
      `;

      const res = await query(TEST_QUERY);
      expect(res.data?.testPluginField).toBe('test-plugin-value');
      expect(res.data?.anotherTestField).toBe('another-test-value');
      expect(res.errors).toBeUndefined();
    });
  });

  describe('graphileBuildOptions', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          useRoot: true,
          schemas,
          authRole: 'postgres',
          graphile: {
            appendPlugins: [TestPlugin],
            graphileBuildOptions: {
              // Test that we can pass build options
              pgOmitListSuffix: false
            }
          }
        },
        [
          seed.sqlfile([
            sql('test.sql')
          ])
        ]
      );

      ({ query, db, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    afterEach(() => db.afterEach());
    afterAll(() => teardown());

    it('should work with graphileBuildOptions', async () => {
      const TEST_QUERY = gql`
        query {
          testPluginField
        }
      `;

      const res = await query(TEST_QUERY);
      expect(res.data?.testPluginField).toBe('test-plugin-value');
      expect(res.errors).toBeUndefined();
    });
  });

  describe('overrideSettings', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          useRoot: true,
          schemas,
          authRole: 'postgres',
          graphile: {
            appendPlugins: [TestPlugin],
            overrideSettings: {
              // Test that we can override settings
              // Using a valid PostGraphile option
              classicIds: true
            }
          }
        },
        [
          seed.sqlfile([
            sql('test.sql')
          ])
        ]
      );

      ({ query, db, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    afterEach(() => db.afterEach());
    afterAll(() => teardown());

    it('should work with overrideSettings', async () => {
      const TEST_QUERY = gql`
        query {
          testPluginField
        }
      `;

      const res = await query(TEST_QUERY);
      expect(res.data?.testPluginField).toBe('test-plugin-value');
      expect(res.errors).toBeUndefined();
    });
  });

  describe('combined graphile options', () => {
    let teardown: () => Promise<void>;
    let query: GraphQLQueryFn;
    let db: PgTestClient;

    beforeAll(async () => {
      const connections = await getConnections(
        {
          useRoot: true,
          schemas,
          authRole: 'postgres',
          graphile: {
            appendPlugins: [TestPlugin, AnotherTestPlugin],
            graphileBuildOptions: {
              pgOmitListSuffix: false
            },
            overrideSettings: {
              classicIds: true
            }
          }
        },
        [
          seed.sqlfile([
            sql('test.sql')
          ])
        ]
      );

      ({ query, db, teardown } = connections);
    });

    beforeEach(() => db.beforeEach());
    afterEach(() => db.afterEach());
    afterAll(() => teardown());

    it('should work with all graphile options combined', async () => {
      const TEST_QUERY = gql`
        query {
          testPluginField
          anotherTestField
        }
      `;

      const res = await query(TEST_QUERY);
      expect(res.data?.testPluginField).toBe('test-plugin-value');
      expect(res.data?.anotherTestField).toBe('another-test-value');
      expect(res.errors).toBeUndefined();
    });
  });
});

