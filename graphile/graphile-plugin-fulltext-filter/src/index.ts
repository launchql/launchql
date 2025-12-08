import { Tsquery } from 'pg-tsquery';
import { omit } from 'graphile-build-pg';
import type { Plugin } from 'graphile-build';

const tsquery = new Tsquery();

interface QueryBuilder {
  __fts_ranks?: Record<string, [any, string]>;
  getTableAlias?(): any;
  where?(fragment: any): void;
  orderBy?(fragment: any, ascending: boolean): void;
  select?(fragment: any, alias: string): void;
  parentQueryBuilder?: QueryBuilder;
}

const PostGraphileFulltextFilterPlugin: Plugin = (builder) => {
  builder.hook('inflection', (inflection: any, build: any) =>
    build.extend(inflection, {
      fullTextScalarTypeName() {
        return 'FullText';
      },
      pgTsvRank(fieldName: string) {
        return this.camelCase(`${fieldName}-rank`);
      },
      pgTsvOrderByColumnRankEnum(table: any, attr: any, ascending: boolean) {
        const columnName =
          attr.kind === 'procedure'
            ? attr.name.substring(table.name.length + 1)
            : this._columnName(attr, { skipRowId: true }); // eslint-disable-line no-underscore-dangle
        return this.constantCase(
          `${columnName}_rank_${ascending ? 'asc' : 'desc'}`
        );
      },
    })
  );

  builder.hook('build', (build: any) => {
    const {
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      pgRegisterGqlTypeByTypeId: registerGqlTypeByTypeId,
      pgRegisterGqlInputTypeByTypeId: registerGqlInputTypeByTypeId,
      graphql: { GraphQLScalarType },
      inflection,
    } = build;

    const tsvectorType = introspectionResultsByKind.type.find(
      (t: any) => t.name === 'tsvector'
    );
    if (!tsvectorType) {
      throw new Error('Unable to find tsvector type through introspection.');
    }

    const scalarName = inflection.fullTextScalarTypeName();

    const GraphQLFullTextType = new GraphQLScalarType({
      name: scalarName,
      serialize(value: any) {
        return value;
      },
      parseValue(value: any) {
        return value;
      },
      parseLiteral(lit: any) {
        return lit;
      },
    });

    registerGqlTypeByTypeId(tsvectorType.id, () => GraphQLFullTextType);
    registerGqlInputTypeByTypeId(tsvectorType.id, () => GraphQLFullTextType);

    return build.extend(build, {
      pgTsvType: tsvectorType,
    });
  });

  (builder as any).hook('init', (_: any, build: any) => {
    const {
      addConnectionFilterOperator,
      pgSql: sql,
      pgGetGqlInputTypeByTypeIdAndModifier: getGqlInputTypeByTypeIdAndModifier,
      graphql: { GraphQLString },
      pgTsvType,
    } = build;

    if (!pgTsvType) {
      return build;
    }

    if (!(addConnectionFilterOperator instanceof Function)) {
      throw new Error(
        'PostGraphileFulltextFilterPlugin requires PostGraphileConnectionFilterPlugin to be loaded before it.'
      );
    }

    const InputType = getGqlInputTypeByTypeIdAndModifier(pgTsvType.id, null);
    addConnectionFilterOperator(
      InputType.name,
      'matches',
      'Performs a full text search on the field.',
      () => GraphQLString,
      (
        identifier: any,
        val: any,
        input: string,
        fieldName: string,
        queryBuilder: QueryBuilder
      ) => {
        const tsQueryString = `${tsquery.parse(input) || ''}`;
        queryBuilder.__fts_ranks = queryBuilder.__fts_ranks || {};
        queryBuilder.__fts_ranks[fieldName] = [identifier, tsQueryString];
        return sql.query`${identifier} @@ to_tsquery(${sql.value(tsQueryString)})`;
      },
      {
        allowedFieldTypes: [InputType.name],
      }
    );

    return build;
  });

  builder.hook('GraphQLObjectType:fields', (fields: any, build: any, context: any) => {
    const {
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      graphql: { GraphQLFloat },
      pgColumnFilter,
      pg2gql,
      pgSql: sql,
      inflection,
      pgTsvType,
    } = build;

    const {
      scope: { isPgRowType, isPgCompoundType, pgIntrospection: table },
      fieldWithHooks,
    } = context;

    if (
      !(isPgRowType || isPgCompoundType) ||
      !table ||
      table.kind !== 'class' ||
      !pgTsvType
    ) {
      return fields;
    }

    const tableType = introspectionResultsByKind.type.find(
      (type: any) =>
        type.type === 'c' &&
        type.namespaceId === table.namespaceId &&
        type.classId === table.id
    );
    if (!tableType) {
      throw new Error('Could not determine the type of this table.');
    }

    const tsvColumns = table.attributes
      .filter((attr: any) => attr.typeId === pgTsvType.id)
      .filter((attr: any) => pgColumnFilter(attr, build, context))
      .filter((attr: any) => !omit(attr, 'filter'));

    const tsvProcs = introspectionResultsByKind.procedure
      .filter((proc: any) => proc.isStable)
      .filter((proc: any) => proc.namespaceId === table.namespaceId)
      .filter((proc: any) => proc.name.startsWith(`${table.name}_`))
      .filter((proc: any) => proc.argTypeIds.length > 0)
      .filter((proc: any) => proc.argTypeIds[0] === tableType.id)
      .filter((proc: any) => proc.returnTypeId === pgTsvType.id)
      .filter((proc: any) => !omit(proc, 'filter'));

    if (tsvColumns.length === 0 && tsvProcs.length === 0) {
      return fields;
    }

    const newRankField = (baseFieldName: string, rankFieldName: string) =>
      fieldWithHooks(
        rankFieldName,
        ({ addDataGenerator }: any) => {
          addDataGenerator(({ alias }: any) => ({
            pgQuery: (queryBuilder: QueryBuilder) => {
              const { parentQueryBuilder } = queryBuilder;
              if (
                !parentQueryBuilder ||
                !parentQueryBuilder.__fts_ranks ||
                !parentQueryBuilder.__fts_ranks[baseFieldName]
              ) {
                return;
              }
              const [identifier, tsQueryString] =
                parentQueryBuilder.__fts_ranks[baseFieldName];
              queryBuilder.select?.(
                sql.fragment`ts_rank(${identifier}, to_tsquery(${sql.value(tsQueryString)}))`,
                alias
              );
            },
          }));
          return {
            description: `Full-text search ranking when filtered by \`${baseFieldName}\`.`,
            type: GraphQLFloat,
            resolve: (data: any) => pg2gql(data[rankFieldName], GraphQLFloat),
          };
        },
        {
          isPgTSVRankField: true,
        }
      );

    const tsvFields = tsvColumns.reduce((memo: any, attr: any) => {
      const fieldName = inflection.column(attr);
      const rankFieldName = inflection.pgTsvRank(fieldName);
      memo[rankFieldName] = newRankField(fieldName, rankFieldName);

      return memo;
    }, {});

    const tsvProcFields = tsvProcs.reduce((memo: any, proc: any) => {
      const psuedoColumnName = proc.name.substring(table.name.length + 1);
      const fieldName = inflection.computedColumn(psuedoColumnName, proc, table);
      const rankFieldName = inflection.pgTsvRank(fieldName);
      memo[rankFieldName] = newRankField(fieldName, rankFieldName);

      return memo;
    }, {});

    return Object.assign({}, fields, tsvFields, tsvProcFields);
  });

  builder.hook('GraphQLEnumType:values', (values: any, build: any, context: any) => {
    const {
      extend,
      pgSql: sql,
      pgColumnFilter,
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      inflection,
      pgTsvType,
    } = build;

    const {
      scope: { isPgRowSortEnum, pgIntrospection: table },
    } = context;

    if (!isPgRowSortEnum || !table || table.kind !== 'class' || !pgTsvType) {
      return values;
    }

    const tableType = introspectionResultsByKind.type.find(
      (type: any) =>
        type.type === 'c' &&
        type.namespaceId === table.namespaceId &&
        type.classId === table.id
    );
    if (!tableType) {
      throw new Error('Could not determine the type of this table.');
    }

    const tsvColumns = introspectionResultsByKind.attribute
      .filter((attr: any) => attr.classId === table.id)
      .filter((attr: any) => attr.typeId === pgTsvType.id);

    const tsvProcs = introspectionResultsByKind.procedure
      .filter((proc: any) => proc.isStable)
      .filter((proc: any) => proc.namespaceId === table.namespaceId)
      .filter((proc: any) => proc.name.startsWith(`${table.name}_`))
      .filter((proc: any) => proc.argTypeIds.length === 1)
      .filter((proc: any) => proc.argTypeIds[0] === tableType.id)
      .filter((proc: any) => proc.returnTypeId === pgTsvType.id)
      .filter((proc: any) => !omit(proc, 'order'));

    if (tsvColumns.length === 0 && tsvProcs.length === 0) {
      return values;
    }

    return extend(
      values,
      tsvColumns
        .concat(tsvProcs)
        .filter((attr: any) => pgColumnFilter(attr, build, context))
        .filter((attr: any) => !omit(attr, 'order'))
        .reduce((memo: any, attr: any) => {
          const fieldName =
            attr.kind === 'procedure'
              ? inflection.computedColumn(
                  attr.name.substring(table.name.length + 1),
                  attr,
                  table
                )
              : inflection.column(attr);
          const ascFieldName = inflection.pgTsvOrderByColumnRankEnum(
            table,
            attr,
            true
          );
          const descFieldName = inflection.pgTsvOrderByColumnRankEnum(
            table,
            attr,
            false
          );

          const findExpr = ({ queryBuilder }: { queryBuilder: QueryBuilder }) => {
            if (!queryBuilder.__fts_ranks || !queryBuilder.__fts_ranks[fieldName]) {
              return sql.fragment`1`;
            }
            const [identifier, tsQueryString] =
              queryBuilder.__fts_ranks[fieldName];
            return sql.fragment`ts_rank(${identifier}, to_tsquery(${sql.value(tsQueryString)}))`;
          };

          memo[ascFieldName] = {
            value: {
              alias: `${ascFieldName.toLowerCase()}`,
              specs: [[findExpr, true]],
            },
          };
          memo[descFieldName] = {
            value: {
              alias: `${descFieldName.toLowerCase()}`,
              specs: [[findExpr, false]],
            },
          };

          return memo;
        }, {}),
      `Adding TSV rank columns for sorting on table '${table.name}'`
    );
  });
};

export { PostGraphileFulltextFilterPlugin };
export default PostGraphileFulltextFilterPlugin;

