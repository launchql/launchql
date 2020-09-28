import { makeExtendSchemaPlugin, gql } from 'graphile-utils';

export default makeExtendSchemaPlugin((build, schemaOptions) => {
  /** @type {import('graphile-build-pg').PgIntrospectionResultsByKind} */
  const introspection = build.pgIntrospectionResultsByKind;

  // console.log(schemaOptions.pgSchemas);

  /** @type {string[]} */
  const schemas = schemaOptions.pgSchemas;

  return {
    typeDefs: gql`
      type MetaschemaType {
        name: String!
      }
      type MetaschemaField {
        name: String!
        type: MetaschemaType!
      }
      type MetaschemaTable {
        name: String!
        fields: [MetaschemaField]
      }
      type Metaschema {
        tables: [MetaschemaTable]
      }
      extend type Query {
        _meta: Metaschema
      }
    `,
    resolvers: {
      MetaschemaField: {
        /** @param attr {import('graphile-build-pg').PgAttribute} */
        type(attr) {
          return attr.type;
        }
      },
      MetaschemaTable: {
        /** @param table {import('graphile-build-pg').PgClass} */
        fields(table) {
          return table.attributes.filter(attr => {
            if (attr.num < 1) return false; // low-level props
            return true;
          });
        }
      },
      Metaschema: {
        tables() {
          return introspection.class.filter(kls => {
            if (!schemas.includes(kls.namespaceName)) return false;
            if (kls.classKind !== 'r') return false; // relation (tables)
            return true;
          });
        }
      },
      Query: {
        _meta() {
          // just placeholder
          return {};
        }
      }
    }
  };
});
