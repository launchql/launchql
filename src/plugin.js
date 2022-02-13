const escapeIdentifier = (str) => `"${str.replace(/"/g, '""')}"`;
export const LangPlugin = (builder, options) => {
  const {
    langPluginLanguageCodeColumn = 'lang_code',
    langPluginLanguageCodeGqlField = 'langCode',
    langPluginAllowedTypes = ['citext', 'text'],
    langPluginDefaultLanguages = ['en']
  } = options;

  builder.hook('build', (build) => {
    const { pgSql: sql } = build;
    /** @type {import('graphile-build-pg').PgIntrospectionResultsByKind} */
    const introspection = build.pgIntrospectionResultsByKind;
    const inflection = build.inflection;

    const tablesWithLanguageTables = introspection.class.filter((table) =>
      table.tags.hasOwnProperty('i18n')
    );
    const tablesWithLanguageTablesIdInfo = introspection.class
      .filter((table) => table.tags.hasOwnProperty('i18n'))
      .map((table) => {
        return {
          identifier: table.primaryKeyConstraint.keyAttributes[0].name,
          idType: table.primaryKeyConstraint.keyAttributes[0].type.name
        };
      });
    const languageVariationTables = tablesWithLanguageTables.map((table) =>
      introspection.class.find(
        (t) =>
          t.name === table.tags.i18n && t.namespaceName === table.namespaceName
      )
    );

    const i18nTables = {};
    const tables = {};
    tablesWithLanguageTables.forEach((table, i) => {
      i18nTables[table.tags.i18n] = {
        table: table.name,
        key: null, // action_id
        connection: inflection.connection(inflection.tableType(table)),
        attrs: {},
        fields: {},
        keyInfo: tablesWithLanguageTablesIdInfo[i]
      };
      tables[table.name] = table.tags.i18n;
    });

    languageVariationTables.forEach((table) => {
      const foreignConstraintsThatMatter = table.constraints
        .filter((c) => c.type === 'f')
        .filter((c) => c.foreignClass.name === i18nTables[table.name].table);

      if (foreignConstraintsThatMatter.length !== 1)
        throw new Error(
          'lang table only supports one foreign key to parent table'
        );

      if (foreignConstraintsThatMatter[0].keyAttributes.length !== 1)
        throw new Error(
          'lang table only supports one non compound foreign key to parent table'
        );

      i18nTables[table.name].key =
        foreignConstraintsThatMatter[0].keyAttributes[0].name;

      const { identifier, idType } = i18nTables[table.name].keyInfo;

      table.attributes.forEach((attr) => {
        if ([langPluginLanguageCodeColumn, identifier].includes(attr.name))
          return;
        if (langPluginAllowedTypes.includes(attr.type.name)) {
          i18nTables[table.name].fields[inflection.column(attr)] = {
            type: attr.type.name,
            attr: attr.name,
            isNotNull: attr.isNotNull,
            column: inflection.column(attr)
          };
          i18nTables[table.name].attrs[attr.name] = {
            type: attr.type.name,
            attr: attr.name,
            column: inflection.column(attr)
          };
        }
      });
    });
    return build.extend(build, { i18n: { i18nTables, tables } });
  });

  builder.hook('GraphQLObjectType:fields', (fields, build, context) => {
    const {
      graphql: { GraphQLString, GraphQLObjectType, GraphQLNonNull },
      i18n: { i18nTables, tables },
      pgSql: sql
    } = build;
    const {
      scope: { pgIntrospection: table, isPgRowType },
      fieldWithHooks
    } = context;
    if (!isPgRowType || !table || table.kind !== 'class') {
      return fields;
    }

    const variationsTableName = tables[table.name];
    if (!variationsTableName) {
      return fields;
    }

    const i18nTable = i18nTables[variationsTableName];
    const { identifier, idType } = i18nTable.keyInfo;

    const { key, connection, attrs, fields: i18nFields } = i18nTable;

    const localeFieldName = 'localeStrings';
    const localeFieldsType = new GraphQLObjectType({
      name: `${context.Self.name}LocaleStrings`,
      description: `Locales for ${context.Self.name}`,
      fields: Object.keys(i18nFields).reduce(
        (memo, field) => {
          memo[field] = {
            type: i18nFields[field].isNotNull
              ? new GraphQLNonNull(GraphQLString)
              : GraphQLString,
            description: `Locale for ${field}`
          };
          return memo;
        },
        {
          langCode: {
            type: GraphQLString // MUST BE NULLABLE
          }
        }
      )
    });

    return build.extend(fields, {
      [localeFieldName]: fieldWithHooks(
        localeFieldName,
        (fieldContext) => {
          const { addDataGenerator } = fieldContext;
          addDataGenerator((parsedResolveInfoFragment) => {
            return {
              pgQuery: (queryBuilder) => {
                queryBuilder.select(
                  sql.fragment`${queryBuilder.getTableAlias()}.${sql.identifier(
                    identifier
                  )}`,
                  identifier
                );
              }
            };
          });
          const coalescedFields = Object.keys(i18nFields).map((field) => {
            const columnName = i18nFields[field].attr;
            const escColumnName = escapeIdentifier(columnName);
            const escFieldName = escapeIdentifier(field);
            return `coalesce(v.${escColumnName}, b.${escColumnName}) as ${escFieldName}`;
          });
          const props = {
            table,
            coalescedFields,
            variationsTableName,
            key
          };
          return {
            description: `Locales for ${context.Self.name}`,
            type: new GraphQLNonNull(localeFieldsType),
            async resolve({ id }, args, context) {
              const languageCodes =
                context.langCodes ?? langPluginDefaultLanguages;
              const dataloader = context.getLanguageDataLoader(
                props,
                context.pgClient,
                languageCodes,
                identifier,
                idType,
                langPluginLanguageCodeColumn,
                langPluginLanguageCodeGqlField
              );
              return dataloader.load(id);
            }
          };
        },
        'Adding the language code field from the lang plugin'
      )
    });
  });
};
