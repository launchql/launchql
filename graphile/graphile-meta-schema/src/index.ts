import type { Build, Options, Plugin } from 'graphile-build';
import { gql, makeExtendSchemaPlugin } from 'graphile-utils';
import { getNamedType, type GraphQLType } from 'graphql';

import belongsTo from './belongs-to';
import has from './has';
import manyToMany from './many-to-many';
import type {
  BelongsToRelation,
  HasRelation,
  ManyToManyRelation,
  PgAttribute,
  PgBuild,
  PgClass,
  PgConstraint,
  PgType,
  SchemaOptions
} from './types';

const GIS_TYPES = [
  'Geometry',
  'Point',
  'LineString',
  'Polygon',
  'MultiPoint',
  'MultiLineString',
  'MultiPolygon',
  'GeometryCollection'
];

const TYPE_ALIASES: Record<string, string> = {
  int8: 'bigint',
  bool: 'boolean',
  bpchar: 'char',
  float8: 'float',
  float4: 'real',
  int4: 'int',
  int2: 'smallint'
};

const aliasTypes = (typeName: string): string => TYPE_ALIASES[typeName] ?? typeName;

const getTypeName = (graphQLType: GraphQLType): string => getNamedType(graphQLType).name;

const PgMetaschemaPlugin: Plugin = makeExtendSchemaPlugin(
  (build: Build, schemaOptions: Options) => {
    const pgBuild = build as PgBuild;
    const pgSchemaOptions = schemaOptions as SchemaOptions;

    const introspection = pgBuild.pgIntrospectionResultsByKind;
    const inflection = pgBuild.inflection;

    const schemas = pgSchemaOptions.pgSchemas ?? [];
    const pgGetGqlTypeByTypeIdAndModifier = pgBuild.pgGetGqlTypeByTypeIdAndModifier;

    return {
      typeDefs: gql`
        type MetaschemaType {
          pgAlias: String!
          pgType: String!
          gqlType: String!
          subtype: String
          modifier: Int
          typmod: JSON
          isArray: Boolean!
        }
        type MetaschemaField {
          name: String!
          type: MetaschemaType!
        }
        type MetaschemaTableInflection {
          # https://github.com/graphile/graphile-engine/blob/v4/packages/graphile-build-pg/src/plugins/PgBasicsPlugin.js
          allRows: String!
          allRowsSimple: String!
          tableFieldName: String!
          tableType: String!
          createPayloadType: String!
          orderByType: String!
          filterType: String
          inputType: String!
          patchType: String
          conditionType: String!
          patchField: String!
          edge: String!
          edgeField: String!
          connection: String!
          typeName: String!
          enumType: String!

          updatePayloadType: String
          deletePayloadType: String!
          deleteByPrimaryKey: String
          updateByPrimaryKey: String

          createField: String!
          createInputType: String!
        }
        type MetaschemaTableQuery {
          all: String!
          one: String!
          create: String!
          update: String
          delete: String
        }
        type MetaschemaTableManyToManyRelation {
          fieldName: String
          type: String
          leftKeyAttributes: [MetaschemaField]!
          rightKeyAttributes: [MetaschemaField]!
          junctionLeftKeyAttributes: [MetaschemaField]!
          junctionRightKeyAttributes: [MetaschemaField]!
          junctionTable: MetaschemaTable!
          rightTable: MetaschemaTable!
          junctionLeftConstraint: MetaschemaForeignKeyConstraint!
          junctionRightConstraint: MetaschemaForeignKeyConstraint!
        }
        type MetaschemaTableHasRelation {
          fieldName: String
          type: String
          referencedBy: MetaschemaTable!
          isUnique: Boolean!
          keys: [MetaschemaField]
        }
        type MetaschemaTableBelongsToRelation {
          fieldName: String
          type: String
          references: MetaschemaTable!
          isUnique: Boolean!
          keys: [MetaschemaField]
        }
        type MetaschemaTableRelation {
          hasOne: [MetaschemaTableHasRelation]
          hasMany: [MetaschemaTableHasRelation]
          has: [MetaschemaTableHasRelation]
          belongsTo: [MetaschemaTableBelongsToRelation]
          manyToMany: [MetaschemaTableManyToManyRelation]
        }

        type MetaschemaTable {
          name: String!
          query: MetaschemaTableQuery!
          inflection: MetaschemaTableInflection!
          relations: MetaschemaTableRelation
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
        MetaschemaCheckConstraint: {
          fields(constraint: PgConstraint): PgAttribute[] {
            return constraint.keyAttributes;
          }
        },
        MetaschemaExclusionConstraint: {
          fields(constraint: PgConstraint): PgAttribute[] {
            return constraint.keyAttributes;
          }
        },
        MetaschemaUniqueConstraint: {
          fields(constraint: PgConstraint): PgAttribute[] {
            return constraint.keyAttributes;
          }
        },
        MetaschemaPrimaryKeyConstraint: {
          fields(constraint: PgConstraint): PgAttribute[] {
            return constraint.keyAttributes;
          }
        },
        MetaschemaForeignKeyConstraint: {
          fields(constraint: PgConstraint): PgAttribute[] {
            return constraint.keyAttributes;
          },
          refTable(constraint: PgConstraint): PgClass | undefined {
            return constraint.foreignClass;
          },
          refFields(constraint: PgConstraint): PgAttribute[] {
            return constraint.foreignKeyAttributes;
          }
        },
        MetaschemaType: {
          pgType(type: PgType): string {
            if (type.isPgArray && type.arrayItemType?.name) {
              return type.arrayItemType.name;
            }
            return type.name;
          },
          pgAlias(type: PgType): string {
            if (type.isPgArray && type.arrayItemType?.name) {
              return aliasTypes(type.arrayItemType.name);
            }
            return aliasTypes(type.name);
          },
          gqlType(type: PgType): string {
            const gqlType = pgGetGqlTypeByTypeIdAndModifier(type.id, type.attrTypeModifier ?? null);
            const typeName = getTypeName(gqlType);
            switch (typeName) {
              case 'GeometryInterface':
              case 'GeometryPoint':
              case 'GeometryPolygon':
                return 'GeoJSON';
              default:
                return typeName;
            }
          },
          subtype(type: PgType): string | null {
            const gqlType = pgGetGqlTypeByTypeIdAndModifier(type.id, type.attrTypeModifier ?? null);
            const typeName = getTypeName(gqlType);
            switch (typeName) {
              case 'GeometryInterface':
              case 'GeometryPoint':
              case 'GeometryPolygon':
                return typeName;
              default:
                return null;
            }
          },
          typmod(type: PgType): Record<string, number | string | boolean> | null {
            const modifier = type.attrTypeModifier;
            if (!modifier) return null;

            if (type.name === 'geography' || type.name === 'geometry') {
              const srid = ((modifier & 0x0fffff00) - (modifier & 0x10000000)) >> 8;
              const subtype = (modifier & 0x000000fc) >> 2;
              const hasZ = ((modifier & 0x00000002) >> 1) === 1;
              const hasM = (modifier & 0x00000001) === 1;
              if (subtype < GIS_TYPES.length) {
                return {
                  srid,
                  subtype,
                  hasZ,
                  hasM,
                  gisType: GIS_TYPES[subtype]
                };
              }
            }
            return { modifier };
          },
          modifier(type: PgType): number | null | undefined {
            return type.attrTypeModifier;
          },
          isArray(type: PgType): boolean {
            return type.isPgArray;
          }
        },
        MetaschemaField: {
          name(attr: PgAttribute): string {
            return inflection.column(attr);
          },
          type(attr: PgAttribute): PgType {
            if (attr.typeModifier > 0) {
              return {
                ...attr.type,
                attrTypeModifier: attr.typeModifier
              };
            }
            return attr.type;
          }
        },
        MetaschemaTableInflection: {
          deleteByPrimaryKey(table: PgClass): string | null {
            if (!table.primaryKeyConstraint?.keyAttributes?.length) return null;
            return inflection.deleteByKeys(
              table.primaryKeyConstraint.keyAttributes,
              table,
              table.primaryKeyConstraint
            );
          },
          updateByPrimaryKey(table: PgClass): string | null {
            if (!table.primaryKeyConstraint?.keyAttributes?.length) return null;
            return inflection.updateByKeys(
              table.primaryKeyConstraint.keyAttributes,
              table,
              table.primaryKeyConstraint
            );
          },
          createField(table: PgClass): string {
            return inflection.createField(table);
          },
          createInputType(table: PgClass): string {
            return inflection.createInputType(table);
          },
          allRows(table: PgClass): string {
            return inflection.allRows(table);
          },
          allRowsSimple(table: PgClass): string {
            return inflection.allRowsSimple(table);
          },
          tableFieldName(table: PgClass): string {
            return inflection.tableFieldName(table);
          },
          tableType(table: PgClass): string {
            return inflection.tableType(table);
          },
          orderByType(table: PgClass): string {
            return inflection.orderByType(inflection.tableType(table));
          },
          filterType(table: PgClass): string | null {
            if (typeof inflection.filterType === 'function') {
              return inflection.filterType(inflection.tableType(table)) ?? null;
            }
            return null;
          },
          inputType(table: PgClass): string {
            return inflection.inputType(inflection.tableType(table));
          },
          patchType(table: PgClass): string {
            return inflection.patchType(inflection.tableType(table));
          },
          conditionType(table: PgClass): string {
            return inflection.conditionType(inflection.tableType(table));
          },
          patchField(table: PgClass): string {
            return inflection.patchField(inflection.tableType(table));
          },
          edge(table: PgClass): string {
            return inflection.edge(inflection.tableType(table));
          },
          edgeField(table: PgClass): string {
            return inflection.edgeField(table);
          },
          connection(table: PgClass): string {
            return inflection.connection(inflection.tableType(table));
          },
          typeName(table: PgClass): string {
            return inflection._typeName(table);
          },
          enumType(table: PgClass): string {
            return inflection.enumType(table);
          },
          createPayloadType(table: PgClass): string {
            return inflection.createPayloadType(table);
          },
          updatePayloadType(table: PgClass): string {
            return inflection.updatePayloadType(table);
          },
          deletePayloadType(table: PgClass): string {
            return inflection.deletePayloadType(table);
          }
        },
        MetaschemaTableQuery: {
          delete(table: PgClass): string | null {
            if (!table.primaryKeyConstraint?.keyAttributes?.length) return null;
            return inflection.deleteByKeys(
              table.primaryKeyConstraint.keyAttributes,
              table,
              table.primaryKeyConstraint
            );
          },
          update(table: PgClass): string | null {
            if (!table.primaryKeyConstraint?.keyAttributes?.length) return null;
            return inflection.updateByKeys(
              table.primaryKeyConstraint.keyAttributes,
              table,
              table.primaryKeyConstraint
            );
          },
          create(table: PgClass): string {
            return inflection.createField(table);
          },
          all(table: PgClass): string {
            return inflection.allRows(table);
          },
          one(table: PgClass): string {
            return inflection.tableFieldName(table);
          }
        },
        MetaschemaTableRelation: {
          hasOne(table: PgClass): HasRelation[] {
            return has(table, pgBuild).filter((relation) => relation.type === 'hasOne');
          },
          hasMany(table: PgClass): HasRelation[] {
            return has(table, pgBuild).filter((relation) => relation.type === 'hasMany');
          },
          belongsTo(table: PgClass): BelongsToRelation[] {
            return belongsTo(table, pgBuild);
          },
          has(table: PgClass): HasRelation[] {
            return has(table, pgBuild);
          },
          manyToMany(table: PgClass): ManyToManyRelation[] {
            return manyToMany(table, pgBuild);
          }
        },
        MetaschemaTableBelongsToRelation: {
          type(): string {
            return 'BelongsTo';
          }
        },
        MetaschemaTableManyToManyRelation: {
          type(): string {
            return 'ManyToMany';
          },
          leftKeyAttributes(relation: ManyToManyRelation): PgAttribute[] {
            return relation.leftKeyAttributes;
          },
          junctionLeftKeyAttributes(relation: ManyToManyRelation): PgAttribute[] {
            return relation.junctionLeftKeyAttributes;
          },
          junctionRightKeyAttributes(relation: ManyToManyRelation): PgAttribute[] {
            return relation.junctionRightKeyAttributes;
          },
          rightKeyAttributes(relation: ManyToManyRelation): PgAttribute[] {
            return relation.rightKeyAttributes;
          },
          junctionTable(relation: ManyToManyRelation): PgClass {
            return relation.junctionTable;
          },
          rightTable(relation: ManyToManyRelation): PgClass {
            return relation.rightTable;
          },
          junctionLeftConstraint(relation: ManyToManyRelation): PgConstraint {
            return relation.junctionLeftConstraint;
          },
          junctionRightConstraint(relation: ManyToManyRelation): PgConstraint {
            return relation.junctionRightConstraint;
          },
          fieldName(relation: ManyToManyRelation): string | null {
            if (!inflection.manyToManyRelationByKeys) {
              return null;
            }

            const {
              leftKeyAttributes,
              junctionLeftKeyAttributes,
              junctionRightKeyAttributes,
              rightKeyAttributes,
              junctionTable,
              rightTable,
              junctionLeftConstraint,
              junctionRightConstraint
            } = relation;
            return inflection.manyToManyRelationByKeys(
              leftKeyAttributes,
              junctionLeftKeyAttributes,
              junctionRightKeyAttributes,
              rightKeyAttributes,
              junctionTable,
              rightTable,
              junctionLeftConstraint,
              junctionRightConstraint
            );
          }
        },
        MetaschemaTable: {
          relations(table: PgClass): PgClass {
            return table;
          },
          name(table: PgClass): string {
            return inflection.tableType(table);
          },
          fields(table: PgClass): PgAttribute[] {
            return table.attributes.filter((attr) => attr.num >= 1);
          },
          inflection(table: PgClass): PgClass {
            return table;
          },
          query(table: PgClass): PgClass {
            return table;
          },
          constraints(table: PgClass): PgConstraint[] {
            return table.constraints;
          },
          foreignKeyConstraints(table: PgClass): PgConstraint[] {
            return table.constraints.filter((constraint) => constraint.type === 'f');
          },
          primaryKeyConstraints(table: PgClass): PgConstraint[] {
            return table.constraints.filter((constraint) => constraint.type === 'p');
          },
          uniqueConstraints(table: PgClass): PgConstraint[] {
            return table.constraints.filter((constraint) => constraint.type === 'u');
          },
          checkConstraints(table: PgClass): PgConstraint[] {
            return table.constraints.filter((constraint) => constraint.type === 'c');
          },
          exclusionConstraints(table: PgClass): PgConstraint[] {
            return table.constraints.filter((constraint) => constraint.type === 'x');
          }
        },
        MetaschemaConstraint: {
          __resolveType(obj: PgConstraint): string | null {
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
              default:
                return null;
            }
          }
        },
        Metaschema: {
          tables(): PgClass[] {
            return introspection.class.filter((table) => {
              if (!schemas.includes(table.namespaceName)) return false;
              if (table.classKind !== 'r') return false;
              return true;
            });
          }
        },
        Query: {
          _meta(): Record<string, never> {
            return {};
          }
        }
      }
    };
  }
);

export { PgMetaschemaPlugin };

export default PgMetaschemaPlugin;
