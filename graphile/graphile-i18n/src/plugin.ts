import type { Build, Plugin } from 'graphile-build';
import type {
  PgAttribute,
  PgClass,
  PgConstraint,
  PgIntrospectionResultsByKind
} from 'graphile-build-pg';
import type QueryBuilder from 'graphile-build-pg/node8plus/QueryBuilder';
import type { GraphQLFieldConfigMap } from 'graphql';

import {
  additionalGraphQLContextFromRequest,
  makeLanguageDataLoaderForTable
} from './middleware';

const defaultLanguageLoaderFactory = makeLanguageDataLoaderForTable();

export interface LangPluginOptions {
  langPluginLanguageCodeColumn?: string;
  langPluginLanguageCodeGqlField?: string;
  langPluginAllowedTypes?: string[];
  langPluginDefaultLanguages?: string[];
}

interface KeyInfo {
  identifier?: string;
  idType?: string;
}

interface I18nField {
  type: string;
  attr: string;
  isNotNull?: boolean;
  column: string;
}

interface I18nTable {
  table: string;
  key: string | null;
  connection: string;
  attrs: Record<string, I18nField>;
  fields: Record<string, I18nField>;
  keyInfo: KeyInfo;
}

interface I18nBuild extends Build {
  i18n: {
    i18nTables: Record<string, I18nTable>;
    tables: Record<string, string>;
  };
  pgIntrospectionResultsByKind: PgIntrospectionResultsByKind;
}

const escapeIdentifier = (str: string): string => `"${str.replace(/"/g, '""')}"`;

const hasI18nTag = (table: PgClass): boolean =>
  Object.prototype.hasOwnProperty.call(table.tags, 'i18n');

const getPrimaryKeyInfo = (table: PgClass): KeyInfo => {
  const identifier = table.primaryKeyConstraint?.keyAttributes?.[0]?.name;
  const idType = table.primaryKeyConstraint?.keyAttributes?.[0]?.type?.name;
  return { identifier, idType };
};

export const LangPlugin: Plugin = (builder, options) => {
  const {
    langPluginLanguageCodeColumn = 'lang_code',
    langPluginLanguageCodeGqlField = 'langCode',
    langPluginAllowedTypes = ['citext', 'text'],
    langPluginDefaultLanguages = ['en']
  } = options as LangPluginOptions;

  builder.hook('build', (build) => {
    const introspection: PgIntrospectionResultsByKind =
      (build as I18nBuild).pgIntrospectionResultsByKind;
    const inflection = build.inflection;

    const tablesWithLanguageTables = introspection.class.filter(hasI18nTag);
    const tablesWithLanguageTablesIdInfo = tablesWithLanguageTables.reduce<Record<string, KeyInfo>>(
      (memo: Record<string, KeyInfo>, table: PgClass) => {
        const keyInfo = getPrimaryKeyInfo(table);
        if (table.tags.i18n) {
          memo[table.tags.i18n as string] = keyInfo;
        }
        return memo;
      },
      {}
    );

    const languageVariationTables: Array<PgClass | undefined> = tablesWithLanguageTables.map(
      (table: PgClass) =>
        introspection.class.find(
          (candidate: PgClass) =>
            candidate.name === table.tags.i18n &&
            candidate.namespaceName === table.namespaceName
        )
    );

    const i18nTables: Record<string, I18nTable> = {};
    const tables: Record<string, string> = {};

    tablesWithLanguageTables.forEach((table: PgClass) => {
      const i18nTableName = table.tags.i18n as string;
      i18nTables[i18nTableName] = {
        table: table.name,
        key: null,
        connection: inflection.connection(inflection.tableType(table)),
        attrs: {},
        fields: {},
        keyInfo: tablesWithLanguageTablesIdInfo[i18nTableName] ?? {}
      };
      tables[table.name] = i18nTableName;
    });

    languageVariationTables.forEach((table) => {
      if (!table) return;

      const foreignConstraintsThatMatter = table.constraints
        .filter((constraint: PgConstraint) => constraint.type === 'f')
        .filter(
          (constraint: PgConstraint) =>
            constraint.foreignClass.name === i18nTables[table.name].table
        );

      if (foreignConstraintsThatMatter.length !== 1) {
        return;
      }

      const foreignKeyConstraint: PgConstraint | undefined =
        foreignConstraintsThatMatter[0];
      if (!foreignKeyConstraint || foreignKeyConstraint.keyAttributes.length !== 1) {
        return;
      }

      i18nTables[table.name].key = foreignKeyConstraint.keyAttributes[0].name;
      const { identifier } = i18nTables[table.name].keyInfo;

      if (!identifier) return;

      table.attributes.forEach((attr: PgAttribute) => {
        if ([langPluginLanguageCodeColumn, identifier].includes(attr.name)) return;
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

  builder.hook(
    'GraphQLObjectType:fields',
    (
      fields: GraphQLFieldConfigMap<any, any>,
      build,
      context
    ): GraphQLFieldConfigMap<any, any> => {
      const {
        graphql: { GraphQLString, GraphQLObjectType, GraphQLNonNull },
        i18n: { i18nTables, tables }
      } = build as I18nBuild;

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

      if (!identifier || !idType) {
        return fields;
      }

      const { key, fields: i18nFields } = i18nTable;

      const localeFieldName = 'localeStrings';
      const localeFieldsConfig = Object.keys(i18nFields).reduce<
        Record<string, { type: any; description?: string }>
      >(
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
            type: GraphQLString
          }
        }
      );

      const localeFieldsType = new GraphQLObjectType({
        name: `${context.Self.name}LocaleStrings`,
        description: `Locales for ${context.Self.name}`,
        fields: localeFieldsConfig
      });

      return build.extend(fields, {
        [localeFieldName]: fieldWithHooks(
          localeFieldName,
          (fieldContext: any) => {
            const { addDataGenerator } = fieldContext as {
              addDataGenerator: (generator: () => { pgQuery: (queryBuilder: QueryBuilder) => void }) => void;
            };
            addDataGenerator(() => ({
              pgQuery: (queryBuilder: QueryBuilder) => {
                queryBuilder.select(
                  build.pgSql.fragment`${queryBuilder.getTableAlias()}.${build.pgSql.identifier(
                    identifier
                  )}`,
                  identifier
                );
              }
            }));

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
              async resolve(
                source: { id: string | number },
                _args: unknown,
                gqlContext: any
              ) {
                const languageCodes =
                  gqlContext.langCodes ?? langPluginDefaultLanguages;

                const getLoader =
                  gqlContext.getLanguageDataLoader ??
                  defaultLanguageLoaderFactory;

                const dataloader = getLoader(
                  props,
                  gqlContext.pgClient,
                  languageCodes,
                  identifier,
                  idType,
                  langPluginLanguageCodeColumn,
                  langPluginLanguageCodeGqlField
                );

                return dataloader.load(source.id);
              }
            };
          },
          'Adding the language code field from the lang plugin'
        )
      });
    }
  );
};

export {
  additionalGraphQLContextFromRequest,
  makeLanguageDataLoaderForTable
} from './middleware';

export default LangPlugin;
