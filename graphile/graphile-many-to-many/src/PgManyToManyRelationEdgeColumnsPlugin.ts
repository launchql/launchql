import type { Build, Plugin } from 'graphile-build';
import type { PgAttribute } from 'graphile-build-pg';
import type { GraphQLFieldConfigMap, GraphQLNullableType, GraphQLType } from 'graphql';

import type { ManyToManyRelationship } from './types';

type PgEdgeColumnsBuild = Build & {
  extend: <TSource extends Record<string, any>, TExtension extends Record<string, any>>(
    source: TSource,
    extra: TExtension,
    hint?: string
  ) => TSource & TExtension;
  pgGetGqlTypeByTypeIdAndModifier: (typeId: string | number, modifier: number | null) => GraphQLType | null;
  pgSql: any;
  pg2gql: (value: any, type: any) => any;
  graphql: typeof import('graphql');
  pgColumnFilter: (attr: PgAttribute, build: Build, context: any) => boolean;
  inflection: any;
  pgOmit: (entity: any, action: string) => boolean;
  pgGetSelectValueForFieldAndTypeAndModifier: any;
  describePgEntity: (entity: any) => string;
};

type PgEdgeColumnsContext = {
  scope: {
    isPgManyToManyEdgeType?: boolean;
    pgManyToManyRelationship?: ManyToManyRelationship;
  };
  fieldWithHooks: any;
};

const PgManyToManyRelationEdgeColumnsPlugin: Plugin = (builder) => {
  (builder as any).hook(
    'GraphQLObjectType:fields',
    (
      fields: GraphQLFieldConfigMap<any, any>,
      build: PgEdgeColumnsBuild,
      context: PgEdgeColumnsContext
    ) => {
      const {
        extend,
        pgGetGqlTypeByTypeIdAndModifier,
        pgSql: sql,
        pg2gql,
        graphql: { GraphQLString, GraphQLNonNull },
        pgColumnFilter,
        inflection,
        pgOmit: omit,
        pgGetSelectValueForFieldAndTypeAndModifier: getSelectValueForFieldAndTypeAndModifier,
        describePgEntity
      } = build;
      const {
        scope: { isPgManyToManyEdgeType, pgManyToManyRelationship },
        fieldWithHooks
      } = context;
      const nullableIf = <T extends GraphQLNullableType>(condition: boolean, Type: T): GraphQLType =>
        condition ? Type : new GraphQLNonNull(Type);

      if (!isPgManyToManyEdgeType || !pgManyToManyRelationship) {
        return fields;
      }

      const {
        leftKeyAttributes,
        junctionTable,
        junctionLeftKeyAttributes,
        junctionRightKeyAttributes,
        rightKeyAttributes,
        allowsMultipleEdgesToNode
      } = pgManyToManyRelationship;

      if (allowsMultipleEdgesToNode) {
        return fields;
      }

      return extend(
        fields,
        junctionTable.attributes.reduce<GraphQLFieldConfigMap<any, any>>((memo, attr) => {
          if (!pgColumnFilter(attr, build, context)) return memo;
          if (omit(attr, 'read')) return memo;

          // Skip left and right key attributes
          if (junctionLeftKeyAttributes.map((a) => a.name).includes(attr.name)) return memo;
          if (junctionRightKeyAttributes.map((a) => a.name).includes(attr.name)) return memo;

          const fieldName = inflection.column(attr);
          const ReturnType =
            pgGetGqlTypeByTypeIdAndModifier(attr.typeId, attr.typeModifier) || GraphQLString;

          // Since we're ignoring multi-column keys, we can simplify here
          const leftKeyAttribute = leftKeyAttributes[0];
          const junctionLeftKeyAttribute = junctionLeftKeyAttributes[0];
          const junctionRightKeyAttribute = junctionRightKeyAttributes[0];
          const rightKeyAttribute = rightKeyAttributes[0];

          const sqlSelectFrom = sql.fragment`select ${sql.identifier(attr.name)} from ${sql.identifier(
            junctionTable.namespace.name,
            junctionTable.name
          )}`;

          const fieldConfig = fieldWithHooks(
            fieldName,
            (fieldContext: { addDataGenerator: any; getDataFromParsedResolveInfoFragment: any }) => {
              const { type, typeModifier } = attr;
              const { addDataGenerator } = fieldContext;

              addDataGenerator((parsedResolveInfoFragment: any) => {
                return {
                  pgQuery: (queryBuilder: any) => {
                    queryBuilder.select(
                      getSelectValueForFieldAndTypeAndModifier(
                        ReturnType,
                        fieldContext,
                        parsedResolveInfoFragment,
                        sql.fragment`(${sqlSelectFrom} where ${sql.identifier(
                          junctionRightKeyAttribute.name
                        )} = ${queryBuilder.getTableAlias()}.${sql.identifier(
                          rightKeyAttribute.name
                        )} and ${sql.identifier(
                          junctionLeftKeyAttribute.name
                        )} = ${queryBuilder.parentQueryBuilder.parentQueryBuilder.getTableAlias()}.${sql.identifier(
                          leftKeyAttribute.name
                        )})`,
                        type,
                        typeModifier
                      ),
                      fieldName
                    );
                  }
                };
              });
              return {
                description: attr.description,
                type: nullableIf(
                  !attr.isNotNull && !attr.type.domainIsNotNull && !attr.tags.notNull,
                  ReturnType
                ),
                resolve: (data: any) => {
                  return pg2gql(data[fieldName], attr.type);
                }
              };
            },
            {
              isPgManyToManyRelationEdgeColumnField: true,
              pgFieldIntrospection: attr
            }
          );

          return extend(
            memo,
            {
              [fieldName]: fieldConfig
            },
            `Adding field for ${describePgEntity(attr)}.`
          );
        }, {}),
        `Adding columns to '${describePgEntity(junctionTable)}'`
      );
    },
    ['PgManyToManyRelationEdgeColumns']
  );
};

export default PgManyToManyRelationEdgeColumnsPlugin;
