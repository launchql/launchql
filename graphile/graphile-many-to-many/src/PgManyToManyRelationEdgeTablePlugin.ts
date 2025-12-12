import type { Build, Plugin } from 'graphile-build';
import type { PgClass } from 'graphile-build-pg';
import type {
  GraphQLFieldConfigMap,
  GraphQLNamedType,
  GraphQLResolveInfo,
  GraphQLType
} from 'graphql';

import type { PgManyToManyOptions, SimpleCollectionSetting } from './types';

type PgEdgeTableBuild = Build & {
  extend: <TSource extends Record<string, any>, TExtension extends Record<string, any>>(
    source: TSource,
    extra: TExtension,
    hint?: string
  ) => TSource & TExtension;
  getTypeByName: (name: string) => GraphQLType | undefined;
  pgGetGqlTypeByTypeIdAndModifier: (typeId: string | number, modifier: number | null) => GraphQLType | null;
  graphql: typeof import('graphql');
  inflection: any;
  getSafeAliasFromResolveInfo: (info: GraphQLResolveInfo) => string;
  getSafeAliasFromAlias: (alias: any) => string;
  pgQueryFromResolveData: any;
  pgAddStartEndCursor: (connection: any) => any;
  pgSql: any;
  describePgEntity: (entity: any) => string;
};

type PgEdgeTableContext = {
  scope: {
    isPgManyToManyEdgeType?: boolean;
    pgManyToManyRelationship?: {
      leftKeyAttributes: any[];
      junctionLeftKeyAttributes: any[];
      rightTable: PgClass;
      rightKeyAttributes: any[];
      junctionRightKeyAttributes: any[];
      junctionTable: PgClass;
      junctionRightConstraint: any;
      allowsMultipleEdgesToNode: boolean;
    };
  };
  fieldWithHooks: any;
  Self: {
    name: string;
  };
};

const PgManyToManyRelationEdgeTablePlugin: Plugin = (builder, { pgSimpleCollections }: PgManyToManyOptions) => {
  (builder as any).hook(
    'GraphQLObjectType:fields',
    (fields: GraphQLFieldConfigMap<any, any>, build: PgEdgeTableBuild, context: PgEdgeTableContext) => {
      const {
        extend,
        getTypeByName,
        pgGetGqlTypeByTypeIdAndModifier,
        graphql: { GraphQLNonNull, GraphQLList },
        inflection,
        getSafeAliasFromResolveInfo,
        getSafeAliasFromAlias,
        pgQueryFromResolveData: queryFromResolveData,
        pgAddStartEndCursor: addStartEndCursor,
        pgSql: sql,
        describePgEntity
      } = build;
      const {
        scope: { isPgManyToManyEdgeType, pgManyToManyRelationship },
        fieldWithHooks,
        Self
      } = context;
      if (!isPgManyToManyEdgeType || !pgManyToManyRelationship) {
        return fields;
      }

      const {
        leftKeyAttributes,
        junctionLeftKeyAttributes,
        rightTable,
        rightKeyAttributes,
        junctionRightKeyAttributes,
        junctionTable,
        junctionRightConstraint,
        allowsMultipleEdgesToNode
      } = pgManyToManyRelationship;

      if (!allowsMultipleEdgesToNode) {
        return fields;
      }

  const JunctionTableType = pgGetGqlTypeByTypeIdAndModifier(
    junctionTable.type.id,
    null
  ) as GraphQLNamedType | null;
      if (!JunctionTableType) {
        throw new Error(`Could not determine type for table with id ${junctionTable.type.id}`);
      }
      const JunctionTableConnectionType = getTypeByName(
        inflection.connection(JunctionTableType.name)
      );

      const buildFields = (isConnection: boolean): GraphQLFieldConfigMap<any, any> | undefined => {
        const fieldName = isConnection
          ? inflection.manyRelationByKeys(junctionRightKeyAttributes, junctionTable, rightTable, junctionRightConstraint)
          : inflection.manyRelationByKeysSimple(
              junctionRightKeyAttributes,
              junctionTable,
              rightTable,
              junctionRightConstraint
            );
        const Type = isConnection ? JunctionTableConnectionType : JunctionTableType;
        if (!Type) {
          return undefined;
        }

        return {
          [fieldName]: fieldWithHooks(
            fieldName,
            ({ getDataFromParsedResolveInfoFragment, addDataGenerator }: { getDataFromParsedResolveInfoFragment: any; addDataGenerator: any }) => {
              const sqlFrom = sql.identifier(junctionTable.namespace.name, junctionTable.name);
              const queryOptions = {
                useAsterisk: junctionTable.canUseAsterisk,
                withPagination: isConnection,
                withPaginationAsFields: false,
                asJsonAggregate: !isConnection
              };
              addDataGenerator((parsedResolveInfoFragment: any) => {
                return {
                  pgQuery: (queryBuilder: any) => {
                    queryBuilder.select(() => {
                      const resolveData = getDataFromParsedResolveInfoFragment(parsedResolveInfoFragment, Type);
                      const junctionTableAlias = sql.identifier(Symbol());
                      const rightTableAlias = queryBuilder.getTableAlias();
                      const leftTableAlias =
                        queryBuilder.parentQueryBuilder.parentQueryBuilder.getTableAlias();
                      const query = queryFromResolveData(
                        sqlFrom,
                        junctionTableAlias,
                        resolveData,
                        queryOptions,
                        (innerQueryBuilder: any) => {
                          innerQueryBuilder.parentQueryBuilder = queryBuilder;
                          const junctionPrimaryKeyConstraint = junctionTable.primaryKeyConstraint;
                          const junctionPrimaryKeyAttributes =
                            junctionPrimaryKeyConstraint && junctionPrimaryKeyConstraint.keyAttributes;
                          if (junctionPrimaryKeyAttributes) {
                            innerQueryBuilder.beforeLock('orderBy', () => {
                              // append order by primary key to the list of orders
                              if (!innerQueryBuilder.isOrderUnique(false)) {
                                innerQueryBuilder.data.cursorPrefix = ['primary_key_asc'];
                                junctionPrimaryKeyAttributes.forEach((attr: any) => {
                                  innerQueryBuilder.orderBy(
                                    sql.fragment`${innerQueryBuilder.getTableAlias()}.${sql.identifier(attr.name)}`,
                                    true
                                  );
                                });
                                innerQueryBuilder.setOrderIsUnique();
                              }
                            });
                          }

                          junctionRightKeyAttributes.forEach((attr: any, i: number) => {
                            innerQueryBuilder.where(
                              sql.fragment`${junctionTableAlias}.${sql.identifier(attr.name)} = ${rightTableAlias}.${sql.identifier(
                                rightKeyAttributes[i].name
                              )}`
                            );
                          });

                          junctionLeftKeyAttributes.forEach((attr: any, i: number) => {
                            innerQueryBuilder.where(
                              sql.fragment`${junctionTableAlias}.${sql.identifier(attr.name)} = ${leftTableAlias}.${sql.identifier(
                                leftKeyAttributes[i].name
                              )}`
                            );
                          });
                        },
                        queryBuilder.context,
                        queryBuilder.rootValue
                      );
                      return sql.fragment`(${query})`;
                    }, getSafeAliasFromAlias(parsedResolveInfoFragment.alias));
                  }
                };
              });

              return {
                description: `Reads and enables pagination through a set of \`${JunctionTableType.name}\`.`,
                type: isConnection
                  ? new GraphQLNonNull(JunctionTableConnectionType as any)
                  : new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(JunctionTableType as any))),
                args: {},
                resolve: (data: any, _args: any, _context: any, resolveInfo: GraphQLResolveInfo) => {
                  const safeAlias = getSafeAliasFromResolveInfo(resolveInfo);
                  if (isConnection) {
                    return addStartEndCursor(data[safeAlias]);
                  }
                  return data[safeAlias];
                }
              };
            },
            {
              isPgFieldConnection: isConnection,
              isPgFieldSimpleCollection: !isConnection,
              isPgManyToManyRelationEdgeTableField: true,
              pgFieldIntrospection: junctionTable
            }
          )
        };
      };

      const simpleCollections: SimpleCollectionSetting =
        junctionRightConstraint.tags.simpleCollections ||
        junctionTable.tags.simpleCollections ||
        pgSimpleCollections;
      const hasConnections = simpleCollections !== 'only';
      const hasSimpleCollections = simpleCollections === 'only' || simpleCollections === 'both';

      const connectionFields = hasConnections ? buildFields(true) : undefined;
      const simpleCollectionFields = hasSimpleCollections ? buildFields(false) : undefined;

      return extend(
        fields,
        {
          ...(connectionFields || {}),
          ...(simpleCollectionFields || {})
        },
        `Many-to-many relation edge table (${hasConnections ? 'connection' : 'simple collection'}) on ${
          Self.name
        } type for ${describePgEntity(junctionRightConstraint)}.`
      );
    }
  );
};

export default PgManyToManyRelationEdgeTablePlugin;
