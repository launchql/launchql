import type { Plugin } from 'graphile-build';
import type { PgClass } from 'graphile-build-pg';
import type {
  GraphQLFieldConfigMap,
  GraphQLNamedType,
  GraphQLResolveInfo
} from 'graphql';

import createManyToManyConnectionType from './createManyToManyConnectionType';
import manyToManyRelationships from './manyToManyRelationships';
import type { PgManyToManyOptions } from './types';

const PgManyToManyRelationPlugin: Plugin = (builder, options: PgManyToManyOptions = {}) => {
  const { pgSimpleCollections } = options;

  (builder as any).hook(
    'GraphQLObjectType:fields',
    (fields: GraphQLFieldConfigMap<any, any>, build: any, context: any) => {
      const {
        extend,
        pgGetGqlTypeByTypeIdAndModifier,
        pgSql: sql,
        getSafeAliasFromResolveInfo,
        getSafeAliasFromAlias,
        graphql: { GraphQLNonNull, GraphQLList },
        inflection,
        pgQueryFromResolveData: queryFromResolveData,
        pgAddStartEndCursor: addStartEndCursor,
        describePgEntity
      } = build;
      const {
        scope: { isPgRowType, pgIntrospection: leftTable },
        fieldWithHooks,
        Self
      } = context;
      if (!isPgRowType || !leftTable || leftTable.kind !== 'class') {
        return fields;
      }

      const relationships = manyToManyRelationships(leftTable, build);
      const relatedFields = relationships.reduce<GraphQLFieldConfigMap<any, any>>(
        (memo, relationship) => {
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
          const RightTableType = pgGetGqlTypeByTypeIdAndModifier(
            rightTable.type.id,
            null
          ) as GraphQLNamedType | null;
          if (!RightTableType) {
            throw new Error(`Could not determine type for table with id ${rightTable.type.id}`);
          }
          const RightTableConnectionType = createManyToManyConnectionType(
            relationship,
            build,
            options,
            leftTable
          );

          // Since we're ignoring multi-column keys, we can simplify here
          const leftKeyAttribute = leftKeyAttributes[0];
          const junctionLeftKeyAttribute = junctionLeftKeyAttributes[0];
          const junctionRightKeyAttribute = junctionRightKeyAttributes[0];
          const rightKeyAttribute = rightKeyAttributes[0];

          let memoWithRelations = memo;

          const makeFields = (isConnection: boolean) => {
            const manyRelationFieldName = isConnection
              ? inflection.manyToManyRelationByKeys(
                  leftKeyAttributes,
                  junctionLeftKeyAttributes,
                  junctionRightKeyAttributes,
                  rightKeyAttributes,
                  junctionTable,
                  rightTable,
                  junctionLeftConstraint,
                  junctionRightConstraint
                )
              : inflection.manyToManyRelationByKeysSimple(
                  leftKeyAttributes,
                  junctionLeftKeyAttributes,
                  junctionRightKeyAttributes,
                  rightKeyAttributes,
                  junctionTable,
                  rightTable,
                  junctionLeftConstraint,
                  junctionRightConstraint
                );

            memoWithRelations = extend(
              memoWithRelations,
              {
                [manyRelationFieldName]: fieldWithHooks(
                  manyRelationFieldName,
                  ({
                    getDataFromParsedResolveInfoFragment,
                    addDataGenerator
                  }: {
                    getDataFromParsedResolveInfoFragment: any;
                    addDataGenerator: any;
                  }) => {
                    const sqlFrom = sql.identifier(rightTable.namespace.name, rightTable.name);
                    const queryOptions = {
                      useAsterisk: rightTable.canUseAsterisk,
                      withPagination: isConnection,
                      withPaginationAsFields: false,
                      asJsonAggregate: !isConnection
                    };
                    addDataGenerator((parsedResolveInfoFragment: any) => {
                      return {
                        pgQuery: (queryBuilder: any) => {
                          queryBuilder.select(() => {
                            const resolveData = getDataFromParsedResolveInfoFragment(
                              parsedResolveInfoFragment,
                              isConnection ? RightTableConnectionType : RightTableType
                            );
                            const rightTableAlias = sql.identifier(Symbol());
                            const leftTableAlias = queryBuilder.getTableAlias();
                            const query = queryFromResolveData(
                              sqlFrom,
                              rightTableAlias,
                              resolveData,
                              queryOptions,
                              (innerQueryBuilder: any) => {
                                innerQueryBuilder.parentQueryBuilder = queryBuilder;
                                const rightPrimaryKeyConstraint = rightTable.primaryKeyConstraint;
                                const rightPrimaryKeyAttributes =
                                  rightPrimaryKeyConstraint && rightPrimaryKeyConstraint.keyAttributes;
                                if (rightPrimaryKeyAttributes) {
                                  innerQueryBuilder.beforeLock('orderBy', () => {
                                    // append order by primary key to the list of orders
                                    if (!innerQueryBuilder.isOrderUnique(false)) {
                                      innerQueryBuilder.data.cursorPrefix = ['primary_key_asc'];
                                      rightPrimaryKeyAttributes.forEach((attr: any) => {
                                        innerQueryBuilder.orderBy(
                                          sql.fragment`${innerQueryBuilder.getTableAlias()}.${sql.identifier(
                                            attr.name
                                          )}`,
                                          true
                                        );
                                      });
                                      innerQueryBuilder.setOrderIsUnique();
                                    }
                                  });
                                }

                                const subqueryName = inflection.manyToManyRelationSubqueryName(
                                  leftKeyAttributes,
                                  junctionLeftKeyAttributes,
                                  junctionRightKeyAttributes,
                                  rightKeyAttributes,
                                  junctionTable,
                                  rightTable,
                                  junctionLeftConstraint,
                                  junctionRightConstraint
                                );
                                const subqueryBuilder = innerQueryBuilder.buildNamedChildSelecting(
                                  subqueryName,
                                  sql.identifier(junctionTable.namespace.name, junctionTable.name),
                                  sql.identifier(junctionRightKeyAttribute.name)
                                );
                                subqueryBuilder.where(
                                  sql.fragment`${sql.identifier(
                                    junctionLeftKeyAttribute.name
                                  )} = ${leftTableAlias}.${sql.identifier(leftKeyAttribute.name)}`
                                );

                                innerQueryBuilder.where(
                                  () =>
                                    sql.fragment`${rightTableAlias}.${sql.identifier(
                                      rightKeyAttribute.name
                                    )} in (${subqueryBuilder.build()})`
                                );
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
                      description: `Reads and enables pagination through a set of \`${RightTableType.name}\`.`,
                      type: isConnection
                        ? new GraphQLNonNull(RightTableConnectionType)
                        : new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RightTableType))),
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
                    isPgManyToManyRelationField: true,
                    pgFieldIntrospection: rightTable
                  }
                )
              },

              `Many-to-many relation field (${isConnection ? 'connection' : 'simple collection'}) on ${
                Self.name
              } type for ${describePgEntity(junctionLeftConstraint)} and ${describePgEntity(
                junctionRightConstraint
              )}.`
            );
          };

          const simpleCollections =
            junctionRightConstraint.tags.simpleCollections ||
            rightTable.tags.simpleCollections ||
            pgSimpleCollections;
          const hasConnections = simpleCollections !== 'only';
          const hasSimpleCollections = simpleCollections === 'only' || simpleCollections === 'both';
          if (hasConnections) {
            makeFields(true);
          }
          if (hasSimpleCollections) {
            makeFields(false);
          }
          return memoWithRelations;
        },
        {}
      );

      return extend(
        fields,
        relatedFields,
        `Adding many-to-many relations for ${Self.name}`
      );
    }
  );
};

export default PgManyToManyRelationPlugin;
