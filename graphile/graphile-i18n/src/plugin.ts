/**
 * PostGraphile v5 i18n Plugin
 *
 * Discovers tables tagged with @i18n and adds a `localeStrings` field to the
 * base type. The field resolves the best-matching translation row based on
 * language codes provided in the GraphQL context, falling back to the base
 * table's own values when no translation exists.
 *
 * Smart tag format:
 *   COMMENT ON TABLE app_public.posts IS E'@i18n posts_translations';
 *
 * The value of @i18n is the name of the translation table in the same schema.
 * The translation table must have:
 *   - A FK column referencing the base table's PK
 *   - A lang_code column (configurable)
 *   - UNIQUE(fk_column, lang_code)
 *   - One or more text/citext columns matching the base table's columns
 */

import 'graphile-build';
import 'graphile-build-pg';

import type { PgCodecWithAttributes } from '@dataplan/pg';
import { TYPES } from '@dataplan/pg';
import { QuoteUtils } from '@pgsql/quotes';
import { context as grafastContext, lambda, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { withRequestPgClient } from 'graphile-plugin-utils';

import type { I18nPluginOptions, I18nTableInfo, TranslatableField } from './types';

// ─── Namespace Augmentations ─────────────────────────────────────────────────

declare global {
  namespace GraphileConfig {
    interface Plugins {
      I18nPlugin: true;
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasI18nTag(codec: PgCodecWithAttributes): string | false {
  const tags = (codec.extensions as any)?.tags;
  if (!tags) return false;
  const val = tags.i18n;
  if (typeof val === 'string' && val.length > 0) return val;
  return false;
}

function resolveAttrPgType(codec: any): string {
  if (codec === TYPES.text) return 'text';
  if (codec === TYPES.varchar) return 'text';
  if (codec?.name === 'citext') return 'citext';
  return codec?.name ?? 'text';
}

function resourceIdentity(resource: any, label: string): {
  serviceName: string;
  schemaName: string;
  name: string;
} {
  const pg = resource?.codec?.extensions?.pg ?? resource?.extensions?.pg;
  if (!pg?.serviceName || !pg?.schemaName || !pg?.name) {
    throw new Error(`[graphile-i18n] ${label} is missing exact service/schema/table metadata`);
  }
  return pg;
}

function compilePgType(build: any, codec: any, label: string): string {
  if (!codec?.sqlType || typeof build?.sql?.compile !== 'function') {
    throw new Error(`[graphile-i18n] ${label} has no compilable PostgreSQL type`);
  }
  const compiled = build.sql.compile(codec.sqlType);
  if (!compiled?.text || (compiled.values?.length ?? 0) !== 0) {
    throw new Error(`[graphile-i18n] ${label} PostgreSQL type did not compile to a static identifier`);
  }
  return compiled.text;
}

/** Resolve one @i18n tag exclusively against this exact build registry. */
export function resolveI18nTableInfo(
  build: any,
  codec: PgCodecWithAttributes,
  langCodeColumn: string,
  allowedTypes: readonly string[]
): I18nTableInfo | null {
  const translationTableName = hasI18nTag(codec);
  if (!translationTableName) return null;

  const resources = Object.values(build.input?.pgRegistry?.pgResources ?? {}) as any[];
  const baseMatches = resources.filter(
    (resource) => !resource?.parameters && resource?.codec === codec
  );
  if (baseMatches.length !== 1) {
    throw new Error(
      `[graphile-i18n] @i18n codec '${codec.name}' must resolve exactly one base resource ` +
      `(matches=${baseMatches.length})`
    );
  }
  const baseResource = baseMatches[0];
  const base = resourceIdentity(baseResource, 'base resource');

  const primaryKeys = (baseResource.uniques as Array<{
    attributes: string[];
    isPrimary?: boolean;
  }> | undefined)?.filter((unique) => unique.isPrimary) ?? [];
  if (primaryKeys.length !== 1 || primaryKeys[0].attributes.length !== 1) {
    throw new Error(
      `[graphile-i18n] @i18n base '${base.schemaName}.${base.name}' requires one ` +
      'single-column primary key'
    );
  }
  const pkColumn = primaryKeys[0].attributes[0];
  const pkAttr = codec.attributes?.[pkColumn] as any;
  if (!pkAttr) {
    throw new Error(
      `[graphile-i18n] Primary key '${pkColumn}' is missing from ` +
      `'${base.schemaName}.${base.name}'`
    );
  }
  const pkType = compilePgType(build, pkAttr.codec, `${base.schemaName}.${base.name}.${pkColumn}`);

  const translationMatches = resources.filter((resource) => {
    if (resource?.parameters || !resource?.codec?.attributes) return false;
    const pg = resource.codec.extensions?.pg ?? resource.extensions?.pg;
    return pg?.serviceName === base.serviceName &&
      pg?.schemaName === base.schemaName &&
      pg?.name === translationTableName;
  });
  if (translationMatches.length !== 1) {
    throw new Error(
      `[graphile-i18n] @i18n on '${base.schemaName}.${base.name}' must resolve exactly ` +
      `one same-service, same-schema '${translationTableName}' resource ` +
      `(matches=${translationMatches.length})`
    );
  }

  const translationResource = translationMatches[0];
  const translation = resourceIdentity(translationResource, 'translation resource');
  const translationCodec = translationResource.codec as PgCodecWithAttributes;
  if (!translationCodec.attributes?.[langCodeColumn]) {
    throw new Error(
      `[graphile-i18n] Translation table '${translation.schemaName}.${translation.name}' ` +
      `is missing language column '${langCodeColumn}'`
    );
  }

  const conventionalFk = `${base.name}_id`;
  const matchingFkColumns = Object.entries(translationCodec.attributes)
    .filter(([attrName, attr]) =>
      attrName !== 'id' &&
      attrName !== langCodeColumn &&
      (attr as any).codec === pkAttr.codec
    )
    .map(([attrName]) => attrName);
  const fkColumn = matchingFkColumns.includes(conventionalFk)
    ? conventionalFk
    : matchingFkColumns.length === 1
      ? matchingFkColumns[0]
      : null;
  if (!fkColumn) {
    throw new Error(
      `[graphile-i18n] Translation table '${translation.schemaName}.${translation.name}' ` +
      `has ambiguous or missing FK metadata for '${base.schemaName}.${base.name}'`
    );
  }

  const fields: Record<string, TranslatableField> = {};
  for (const [attrName, attr] of Object.entries(translationCodec.attributes)) {
    if (attrName === langCodeColumn || attrName === fkColumn) continue;
    if (attrName === 'id' || attrName === 'created_at' || attrName === 'updated_at') continue;

    const pgType = resolveAttrPgType((attr as any).codec);
    if (!allowedTypes.includes(pgType)) continue;
    if (!codec.attributes?.[attrName]) {
      throw new Error(
        `[graphile-i18n] Translation field '${translation.schemaName}.${translation.name}.` +
        `${attrName}' has no matching base field on '${base.schemaName}.${base.name}'`
      );
    }

    const gqlName = build.inflection.camelCase(attrName);
    fields[gqlName] = {
      column: attrName,
      type: pgType,
      isNotNull: !!(attr as any).notNull,
    };
  }
  if (Object.keys(fields).length === 0) {
    throw new Error(
      `[graphile-i18n] Translation table '${translation.schemaName}.${translation.name}' ` +
      'has no eligible translatable fields'
    );
  }

  return {
    baseTable: base.name,
    translationTable: translation.name,
    schemaName: base.schemaName,
    fkColumn,
    pkColumn,
    pkType,
    fields,
  };
}

export function buildI18nLookupSql(
  info: I18nTableInfo,
  langCodeColumn: string
): string {
  const {
    schemaName,
    baseTable,
    translationTable,
    fkColumn,
    pkColumn,
    pkType,
    fields,
  } = info;
  const qi = (name: string): string => QuoteUtils.quoteIdentifier(name);
  const coalescedCols = Object.values(fields)
    .map((field) => `coalesce(v.${qi(field.column)}, b.${qi(field.column)}) as ${qi(field.column)}`)
    .join(', ');
  const baseTableRef = QuoteUtils.quoteQualifiedIdentifier(schemaName, baseTable);
  const translationTableRef = QuoteUtils.quoteQualifiedIdentifier(schemaName, translationTable);

  return `SELECT v.${qi(langCodeColumn)} AS "lang_code", ${coalescedCols}
             FROM ${baseTableRef} b
             LEFT JOIN ${translationTableRef} v
               ON v.${qi(fkColumn)} = b.${qi(pkColumn)}
               AND array_position($2::text[], v.${qi(langCodeColumn)}) IS NOT NULL
             WHERE b.${qi(pkColumn)} = $1::${pkType}
             ORDER BY array_position($2::text[], v.${qi(langCodeColumn)}) ASC NULLS LAST
             LIMIT 1`;
}

// ─── Plugin Factory ──────────────────────────────────────────────────────────

export function createI18nPlugin(options: I18nPluginOptions = {}): GraphileConfig.Plugin {
  const {
    langCodeColumn = 'lang_code',
    langCodeGqlField = 'langCode',
    allowedTypes = ['text', 'citext'],
    defaultLanguages = ['en'],
  } = options;

  // Closure-scoped state shared between init and field hooks
  let i18nRegistry: Record<string, I18nTableInfo> = {};
  const localeTypeCache: Record<string, any> = {};

  return {
    name: 'I18nPlugin',
    version: '1.0.0',

    schema: {
      hooks: {
        init: {
          callback(_, build) {
            i18nRegistry = {};

            for (const [, codec] of Object.entries(build.input.pgRegistry.pgCodecs)) {
              const c = codec as PgCodecWithAttributes;
              if (!c.attributes) continue;

              if (!hasI18nTag(c)) continue;
              const info = resolveI18nTableInfo(build, c, langCodeColumn, allowedTypes);
              if (info) i18nRegistry[c.name] = info;
            }

            return _;
          },
        },

        GraphQLObjectType_fields(fields, build, context) {
          const { graphql: { GraphQLString, GraphQLObjectType, GraphQLNonNull } } = build;
          const { scope } = context;

          if (!scope.pgCodec || !scope.isPgClassType) return fields;

          const codec = scope.pgCodec as PgCodecWithAttributes;
          const info = i18nRegistry[codec.name];
          if (!info) return fields;

          const localeFieldsConfig: Record<string, any> = {
            [langCodeGqlField]: { type: GraphQLString },
          };

          for (const [gqlName, field] of Object.entries(info.fields)) {
            localeFieldsConfig[gqlName] = {
              type: field.isNotNull ? new GraphQLNonNull(GraphQLString) : GraphQLString,
            };
          }

          const localeTypeName = `${build.inflection.tableType(codec)}LocaleStrings`;
          if (!localeTypeCache[localeTypeName]) {
            localeTypeCache[localeTypeName] = new GraphQLObjectType({
              name: localeTypeName,
              fields: localeFieldsConfig,
            });
          }
          const localeType = localeTypeCache[localeTypeName];

          const { pkColumn, fields: i18nFields } = info;
          const sqlQuery = buildI18nLookupSql(info, langCodeColumn);

          // Build column names list for mapping base values
          const baseColNames = Object.entries(i18nFields).map(([gqlName, f]) => ({
            gqlName,
            column: f.column,
          }));

          return build.extend(fields, {
            localeStrings: {
              type: new GraphQLNonNull(localeType),
              plan($parent: any) {
                // Extract PK and all base translatable columns from the parent row
                const $id = $parent.get(pkColumn);
                const $baseCols: Record<string, any> = {};
                for (const { column } of baseColNames) {
                  $baseCols[column] = $parent.get(column);
                }
                const $withPgClient = (grafastContext() as any).get('withPgClient');
                const $pgSettings = (grafastContext() as any).get('pgSettings');
                const $langCodes = (grafastContext() as any).get('langCodes');

                // Combine all inputs into a single step
                const $input = object({
                  id: $id,
                  withPgClient: $withPgClient,
                  pgSettings: $pgSettings,
                  langCodes: $langCodes,
                  ...$baseCols,
                });

                return lambda($input, async (input: any) => {
                  const { id, withPgClient, pgSettings, langCodes: ctxLangCodes, ...baseCols } = input;
                  const langs: string[] = ctxLangCodes ?? defaultLanguages;

                  if (!withPgClient || !id) {
                    const result: Record<string, any> = { [langCodeGqlField]: null };
                    for (const { gqlName, column } of baseColNames) {
                      result[gqlName] = baseCols[column] ?? null;
                    }
                    return result;
                  }

                  // Translations are the tenant's own rows: read them as the
                  // request's role, under its jwt claims and RLS.
                  const row = await withRequestPgClient(withPgClient, pgSettings, async (client) => {
                    const { rows } = await client.query({ text: sqlQuery, values: [id, langs] });
                    return rows[0] ?? null;
                  });

                  if (!row) {
                    const result: Record<string, any> = { [langCodeGqlField]: null };
                    for (const { gqlName, column } of baseColNames) {
                      result[gqlName] = baseCols[column] ?? null;
                    }
                    return result;
                  }

                  const result: Record<string, any> = { [langCodeGqlField]: row.lang_code };
                  for (const { gqlName, column } of baseColNames) {
                    result[gqlName] = row[column] ?? null;
                  }
                  return result;
                });
              },
            },
          } as any, 'Adding i18n localeStrings field');
        },
      },
    },
  };
}

export const I18nPlugin = createI18nPlugin();
