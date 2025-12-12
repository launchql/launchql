import type { Build } from 'graphile-build';
import type { PgClass } from 'graphile-build-pg';
import type {
  GraphQLFieldConfigMap,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLNamedType,
  GraphQLNullableType,
  GraphQLType
} from 'graphql';

import type { ManyToManyRelationship, PgManyToManyOptions } from './types';

type PgConnectionBuild = Build & {
  newWithHooks: any;
  inflection: any;
  graphql: typeof import('graphql');
  getTypeByName: (name: string) => GraphQLType | undefined;
  pgGetGqlTypeByTypeIdAndModifier: (typeId: string | number, modifier: number | null) => GraphQLType;
  pgField: any;
  getSafeAliasFromResolveInfo: (info: GraphQLResolveInfo) => string;
  describePgEntity: (entity: any) => string;
};

const hasNonNullKey = (row: Record<string, any>): boolean => {
  if (Array.isArray(row.__identifiers) && row.__identifiers.every((identifier: any) => identifier != null)) {
    return true;
  }
  for (const key in row) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      if ((key[0] !== '_' || key[1] !== '_') && row[key] !== null) {
        return true;
      }
    }
  }
  return false;
};

const base64 = (value: string): string => Buffer.from(String(value)).toString('base64');

const createManyToManyConnectionType = (
  relationship: ManyToManyRelationship,
  build: PgConnectionBuild,
  options: PgManyToManyOptions,
  leftTable: PgClass
): GraphQLObjectType => {
  const {
    leftKeyAttributes,
    junctionLeftKeyAttributes,
    junctionRightKeyAttributes,
    rightKeyAttributes,
    junctionTable,
    rightTable,
    junctionLeftConstraint,
    junctionRightConstraint
  } = relationship;
  const {
    newWithHooks,
    inflection,
    graphql: { GraphQLObjectType, GraphQLNonNull, GraphQLList },
    getTypeByName,
    pgGetGqlTypeByTypeIdAndModifier,
    pgField,
    getSafeAliasFromResolveInfo,
    describePgEntity
  } = build;
  const { pgForbidSetofFunctionsToReturnNull = false } = options;
  const nullableIf = <T extends GraphQLNullableType>(condition: boolean, Type: T): GraphQLType =>
    condition ? Type : new GraphQLNonNull(Type);
  const Cursor = getTypeByName('Cursor');
  const handleNullRow = pgForbidSetofFunctionsToReturnNull
    ? (row: any) => row
    : (row: any, identifiers: any[]) => {
        if ((identifiers && hasNonNullKey(identifiers)) || hasNonNullKey(row)) {
          return row;
        }
        return null;
      };

  const LeftTableType = pgGetGqlTypeByTypeIdAndModifier(
    leftTable.type.id,
    null
  ) as GraphQLNamedType | null;
  if (!LeftTableType) {
    throw new Error(`Could not determine type for table with id ${leftTable.type.id}`);
  }

  const TableType = pgGetGqlTypeByTypeIdAndModifier(
    rightTable.type.id,
    null
  ) as GraphQLNamedType | null;
  if (!TableType) {
    throw new Error(`Could not determine type for table with id ${rightTable.type.id}`);
  }

  const rightPrimaryKeyConstraint = rightTable.primaryKeyConstraint;
  const rightPrimaryKeyAttributes =
    rightPrimaryKeyConstraint && rightPrimaryKeyConstraint.keyAttributes;

  const junctionTypeName = inflection.tableType(junctionTable);

  const EdgeType = newWithHooks(
    GraphQLObjectType,
    {
      description: `A \`${TableType.name}\` edge in the connection, with data from \`${junctionTypeName}\`.`,
      name: inflection.manyToManyRelationEdge(
        leftKeyAttributes,
        junctionLeftKeyAttributes,
        junctionRightKeyAttributes,
        rightKeyAttributes,
        junctionTable,
        rightTable,
        junctionLeftConstraint,
        junctionRightConstraint,
        LeftTableType.name
      ),
      fields: ({ fieldWithHooks }: { fieldWithHooks: any }): GraphQLFieldConfigMap<any, any> => {
        return {
          cursor: fieldWithHooks(
            'cursor',
            ({ addDataGenerator }: { addDataGenerator: any }) => {
              addDataGenerator(() => ({
                usesCursor: [true],
                pgQuery: (queryBuilder: any) => {
                  if (rightPrimaryKeyAttributes) {
                    queryBuilder.selectIdentifiers(rightTable);
                  }
                }
              }));
              return {
                description: 'A cursor for use in pagination.',
                type: Cursor,
                resolve(data: any) {
                  return data.__cursor && base64(JSON.stringify(data.__cursor));
                }
              };
            },
            {
              isCursorField: true
            }
          ),
          node: pgField(
            build,
            fieldWithHooks,
            'node',
            {
              description: `The \`${TableType.name}\` at the end of the edge.`,
              type: nullableIf(!pgForbidSetofFunctionsToReturnNull, TableType),
              resolve(data: any, _args: any, _context: any, resolveInfo: GraphQLResolveInfo) {
                const safeAlias = getSafeAliasFromResolveInfo(resolveInfo);
                const record = handleNullRow(data[safeAlias], data.__identifiers);
                return record;
              }
            },
            {},
            false,
            {}
          )
        };
      }
    },
    {
      __origin: `Adding many-to-many edge type from ${describePgEntity(leftTable)} to ${describePgEntity(
        rightTable
      )} via ${describePgEntity(junctionTable)}.`,
      isEdgeType: true,
      isPgRowEdgeType: true,
      isPgManyToManyEdgeType: true,
      nodeType: TableType,
      pgManyToManyRelationship: relationship
    }
  );
  const PageInfo = getTypeByName(inflection.builtin('PageInfo'));

  return newWithHooks(
    GraphQLObjectType,
    {
      description: `A connection to a list of \`${TableType.name}\` values, with data from \`${junctionTypeName}\`.`,
      name: inflection.manyToManyRelationConnection(
        leftKeyAttributes,
        junctionLeftKeyAttributes,
        junctionRightKeyAttributes,
        rightKeyAttributes,
        junctionTable,
        rightTable,
        junctionLeftConstraint,
        junctionRightConstraint,
        LeftTableType.name
      ),
      fields: ({
        recurseDataGeneratorsForField,
        fieldWithHooks
      }: {
        recurseDataGeneratorsForField: (fieldName: string, recurse?: boolean) => void;
        fieldWithHooks: any;
      }): GraphQLFieldConfigMap<any, any> => {
        recurseDataGeneratorsForField('pageInfo', true);
        return {
          nodes: pgField(
            build,
            fieldWithHooks,
            'nodes',
            {
              description: `A list of \`${TableType.name}\` objects.`,
              type: new GraphQLNonNull(
                new GraphQLList(nullableIf(!pgForbidSetofFunctionsToReturnNull, TableType))
              ),
              resolve(data: any, _args: any, _context: any, resolveInfo: GraphQLResolveInfo) {
                const safeAlias = getSafeAliasFromResolveInfo(resolveInfo);
                return data.data.map((entry: any) => {
                  const record = handleNullRow(entry[safeAlias], entry[safeAlias].__identifiers);
                  return record;
                });
              }
            },
            {},
            false,
            {}
          ),
          edges: pgField(
            build,
            fieldWithHooks,
            'edges',
            {
              description: `A list of edges which contains the \`${TableType.name}\`, info from the \`${junctionTypeName}\`, and the cursor to aid in pagination.`,
              type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EdgeType))),
              resolve(data: any, _args: any, _context: any, resolveInfo: GraphQLResolveInfo) {
                const safeAlias = getSafeAliasFromResolveInfo(resolveInfo);
                return data.data.map((entry: any) => ({
                  ...entry,
                  ...entry[safeAlias]
                }));
              }
            },
            {},
            false,
            {
              hoistCursor: true
            }
          ),
          pageInfo: PageInfo && {
            description: 'Information to aid in pagination.',
            type: new GraphQLNonNull(PageInfo),
            resolve(data: any) {
              return data;
            }
          }
        };
      }
    },
    {
      __origin: `Adding many-to-many connection type from ${describePgEntity(leftTable)} to ${describePgEntity(
        rightTable
      )} via ${describePgEntity(junctionTable)}.`,
      isConnectionType: true,
      isPgRowConnectionType: true,
      edgeType: EdgeType,
      nodeType: TableType,
      pgIntrospection: rightTable
    }
  );
};

export default createManyToManyConnectionType;
