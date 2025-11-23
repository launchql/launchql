// plugins/PgSearchPlugin.ts

import type { Plugin } from 'graphile-build';

export interface PgSearchPluginOptions {
  /** Prefix for tsvector fields, default is 'tsv' */
  pgSearchPrefix?: string;
}

/**
 * PgSearchPlugin - Generates search conditions for tsvector columns
 */
const PgSearchPlugin = (builder: any, options: PgSearchPluginOptions = {}) => {
  const { pgSearchPrefix = 'tsv' } = options;

  builder.hook('GraphQLInputObjectType:fields', (fields: any, build: any, context: any) => {
    const { inflection } = build;
    const { scope: { isPgCondition, pgIntrospection: table }, fieldWithHooks } = context;

    if (!isPgCondition || !table || table.kind !== 'class') return fields;

    const tsvs = table.attributes.filter((attr: any) => attr.type.name === 'tsvector');
    if (!tsvs.length) return fields;

    return build.extend(
      fields,
      tsvs.reduce((memo: any, attr: any) => {
        const fieldName = inflection.camelCase(`${pgSearchPrefix}_${attr.name}`);
        memo[fieldName] = fieldWithHooks(
          fieldName,
          { type: build.graphql.GraphQLString },
          {}
        );
        return memo;
      }, {})
    );
  });

  builder.hook(
    'GraphQLObjectType:fields:field:args',
    (args: any, build: any, context: any) => {
      const { pgSql: sql, inflection } = build;
      const {
        scope: {
          isPgFieldConnection,
          isPgFieldSimpleCollection,
          pgFieldIntrospection: procOrTable,
          pgFieldIntrospectionTable: tableIfProc,
        },
        addArgDataGenerator,
      } = context;

      const table = tableIfProc || procOrTable;
      if (
        (!isPgFieldConnection && !isPgFieldSimpleCollection) ||
        !table ||
        table.kind !== 'class'
      ) {
        return args;
      }

      const tsvs = table.attributes.filter((attr: any) => attr.type.name === 'tsvector');
      if (!tsvs.length) return args;

      tsvs.forEach((tsv: any) => {
        const conditionFieldName = inflection.camelCase(`${pgSearchPrefix}_${tsv.name}`);

        addArgDataGenerator(function addSearchCondition({ condition }: any) {
          if (!condition || !(conditionFieldName in condition)) return {};

          const value = condition[conditionFieldName];
          if (value == null) return {};

          return {
            pgQuery: (queryBuilder: any) => {
              const tsquery = sql.fragment`websearch_to_tsquery('english', ${sql.value(value)})`;
              const tableAlias = queryBuilder.getTableAlias();

              // WHERE condition
              queryBuilder.where(
                sql.fragment`${tableAlias}.${sql.identifier(tsv.name)} @@ ${tsquery}`
              );

              // Automatically add ordering by relevance (descending)
              queryBuilder.orderBy(
                sql.fragment`ts_rank(${tableAlias}.${sql.identifier(tsv.name)}, ${tsquery})`,
                false
              );
            },
          };
        });
      });

      return args;
    },
    [],
    ['PgConnectionArgOrderBy']
  );
};

export { PgSearchPlugin };

export default PgSearchPlugin;