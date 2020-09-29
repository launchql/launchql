import { makeExtendSchemaPlugin, gql } from 'graphile-utils';

export const PgMetaschemaPlugin = makeExtendSchemaPlugin(
  (build, schemaOptions) => {
    /** @type {import('graphile-build-pg').PgIntrospectionResultsByKind} */
    const introspection = build.pgIntrospectionResultsByKind;

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
          constraints: [MetaschemaConstraint]
          foreignKeyConstraints: [MetaschemaForeignKeyConstraint]
          primaryKeyConstraints: [MetaschemaPrimaryKeyConstraint]
          uniqueConstraints: [MetaschemaUniqueConstraint]
          checkConstraints: [MetaschemaCheckConstraint]
          exclusionConstraints: [MetaschemaExclusionConstraint]
        }
        union MetaschemaConstraint =
            MetaschemaForeignKeyConstraint
          | MetaschemaUniqueConstraint
          | MetaschemaPrimaryKeyConstraint
          | MetaschemaCheckConstraint
          | MetaschemaExclusionConstraint
        type MetaschemaForeignKeyConstraint {
          name: String!
          fields: [MetaschemaField]
          refTable: MetaschemaTable
          refFields: [MetaschemaField]
        }
        type MetaschemaUniqueConstraint {
          name: String!
          fields: [MetaschemaField]
        }
        type MetaschemaPrimaryKeyConstraint {
          name: String!
          fields: [MetaschemaField]
        }
        type MetaschemaCheckConstraint {
          name: String!
          fields: [MetaschemaField]
        }
        type MetaschemaExclusionConstraint {
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
        // TODO determine why check constraints aren't coming through
        MetaschemaCheckConstraint: {
          /** @param constraint {import('graphile-build-pg').PgConstraint} */
          fields(constraint) {
            return constraint.keyAttributes;
          }
        },
        MetaschemaExclusionConstraint: {
          /** @param constraint {import('graphile-build-pg').PgConstraint} */
          fields(constraint) {
            return constraint.keyAttributes;
          }
        },
        MetaschemaUniqueConstraint: {
          /** @param constraint {import('graphile-build-pg').PgConstraint} */
          fields(constraint) {
            return constraint.keyAttributes;
          }
        },
        MetaschemaPrimaryKeyConstraint: {
          /** @param constraint {import('graphile-build-pg').PgConstraint} */
          fields(constraint) {
            return constraint.keyAttributes;
          }
        },
        MetaschemaForeignKeyConstraint: {
          /** @param constraint {import('graphile-build-pg').PgConstraint} */
          fields(constraint) {
            return constraint.keyAttributes;
          },
          /** @param constraint {import('graphile-build-pg').PgConstraint} */
          refTable(constraint) {
            return constraint.foreignClass;
          },
          /** @param constraint {import('graphile-build-pg').PgConstraint} */
          refFields(constraint) {
            return constraint.foreignKeyAttributes;
          }
        },
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
          },
          /** @param table {import('graphile-build-pg').PgClass} */
          constraints(table) {
            return table.constraints;
          },
          /** @param table {import('graphile-build-pg').PgClass} */
          foreignKeyConstraints(table) {
            return table.constraints.filter(c => c.type === 'f');
          },
          /** @param table {import('graphile-build-pg').PgClass} */
          primaryKeyConstraints(table) {
            return table.constraints.filter(c => c.type === 'p');
          },
          /** @param table {import('graphile-build-pg').PgClass} */
          uniqueConstraints(table) {
            return table.constraints.filter(c => c.type === 'u');
          },
          /** @param table {import('graphile-build-pg').PgClass} */
          checkConstraints(table) {
            return table.constraints.filter(c => c.type === 'c');
          },
          /** @param table {import('graphile-build-pg').PgClass} */
          exclusionConstraints(table) {
            return table.constraints.filter(c => c.type === 'x');
          }
        },
        MetaschemaConstraint: {
          /** @param obj {import('graphile-build-pg').PgConstraint} */
          __resolveType(obj) {
            switch (obj.type) {
              case 'p':
                return 'MetaschemaPrimaryKeyConstraint';
              case 'f':
                return 'MetaschemaForeignKeyConstraint';
              case 'c':
                return 'MetaschemaCheckConstraint';
              case 'u':
                return 'MetaschemaUniqueConstraint';
              case 'x':
                return 'MetaschemaExclusionConstraint';
            }
          }
        },
        Metaschema: {
          tables() {
            return introspection.class.filter(kls => {
              if (!schemas.includes(kls.namespaceName)) return false;
              // r = ordinary table, i = index, S = sequence, t = TOAST table, v = view, m = materialized view, c = composite type, f = foreign table, p = partitioned table, I = partitioned index
              if (kls.classKind !== 'r') return false;
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
  }
);

export default PgMetaschemaPlugin;
