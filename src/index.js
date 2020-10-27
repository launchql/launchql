export const PgSearchPlugin = (builder, { pgSearchPrefix = 'tsv' }) => {
  builder.hook('GraphQLInputObjectType:fields', function addConditionInputField(
    fields,
    build,
    context
  ) {
    const { inflection } = build;
    const {
      scope: { isPgCondition, pgIntrospection: table },
      fieldWithHooks
    } = context;
    if (!isPgCondition || !table || table.kind !== 'class') {
      return fields;
    }

    const tsvs = table.attributes.filter(
      (attr) => attr.type.name === 'tsvector'
    );
    if (!tsvs.length) return fields;

    return build.extend(
      fields,
      tsvs.reduce((m, v) => {
        const key = inflection.camelCase(`${pgSearchPrefix}_${v.name}`);
        m[key] = fieldWithHooks(
          key,
          {
            type: build.graphql.GraphQLString
          },
          {}
        );
        return m;
      }, {})
    );
  });
  builder.hook(
    'GraphQLObjectType:fields:field:args',
    function addSqlWhereClause(args, build, context) {
      const { pgSql: sql, inflection } = build;
      const {
        scope: {
          isPgFieldConnection,
          isPgFieldSimpleCollection,
          pgFieldIntrospection: procOrTable,
          pgFieldIntrospectionTable: tableIfProc
        },
        addArgDataGenerator
      } = context;
      const table = tableIfProc || procOrTable;
      if (
        (!isPgFieldConnection && !isPgFieldSimpleCollection) ||
        !table ||
        table.kind !== 'class'
      ) {
        return args;
      }

      const tsvs = table.attributes.filter(
        (attr) => attr.type.name === 'tsvector'
      );
      if (!tsvs.length) return args;

      for (const tsv of tsvs) {
        const conditionFieldName = inflection.camelCase(
          pgSearchPrefix + '_' + tsv.name
        );

        const conditionGenerator = (
          value,
          { queryBuilder, sql, sqlTableAlias }
        ) => {
          if (value == null) {
            return;
          }

          const tsquery = sql.fragment`websearch_to_tsquery('english', ${sql.value(
            value
          )})`;

          queryBuilder.orderBy(
            sql.fragment`ts_rank ( ${sqlTableAlias}.${sql.identifier(
              tsv.name
            )}, ${tsquery} )`,
            false,
            false
          );

          return sql.fragment`${sqlTableAlias}.${sql.identifier(
            tsv.name
          )} @@ ${tsquery}`;
        };

        addArgDataGenerator(function conditionSQLBuilder({ condition }) {
          if (!condition || !(conditionFieldName in condition)) {
            return {};
          }
          const { [conditionFieldName]: conditionValue } = condition;
          return {
            pgQuery: (queryBuilder) => {
              const sqlCondition = conditionGenerator(
                conditionValue,
                {
                  queryBuilder,
                  sql,
                  sqlTableAlias: queryBuilder.getTableAlias()
                },
                build
              );
              if (sqlCondition) {
                queryBuilder.where(sqlCondition);
              }
            }
          };
        });
      }

      return args;
    },
    [],
    // Make sure we're loaded before PgConnectionArgOrderBy, otherwise
    // ordering added by conditions will be overridden by the default
    // ordering.
    ['PgConnectionArgOrderBy'],
    []
  );
};

export default PgSearchPlugin;
