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

function resolvePgTypeName(codec: any): string {
  if (codec === TYPES.uuid) return 'uuid';
  if (codec === TYPES.int) return 'int4';
  if (codec === TYPES.bigint) return 'int8';
  if (codec === TYPES.text) return 'text';
  if (codec === TYPES.varchar) return 'text';
  return codec?.name ?? 'text';
}

function resolveAttrPgType(codec: any): string {
  if (codec === TYPES.text) return 'text';
  if (codec === TYPES.varchar) return 'text';
  if (codec?.name === 'citext') return 'citext';
  return codec?.name ?? 'text';
}

interface I18nBuildState {
  registry: WeakMap<PgCodecWithAttributes, I18nTableInfo>;
  localeTypeCache: Map<string, any>;
}

// ─── Plugin Factory ──────────────────────────────────────────────────────────

export function createI18nPlugin(options: I18nPluginOptions = {}): GraphileConfig.Plugin {
  const {
    langCodeColumn = 'lang_code',
    langCodeGqlField = 'langCode',
    allowedTypes = ['text', 'citext'],
    defaultLanguages = ['en'],
  } = options;

  // A preset/plugin instance may be reused for multiple schema builds. Keep
  // discovery and GraphQL type state owned by the exact build that created it.
  const stateByBuild = new WeakMap<object, I18nBuildState>();

  return {
    name: 'I18nPlugin',
    version: '1.0.0',

    schema: {
      hooks: {
        init: {
          callback(_, build) {
            const state: I18nBuildState = {
              registry: new WeakMap(),
              localeTypeCache: new Map()
            };
            stateByBuild.set(build, state);

            for (const [, codec] of Object.entries(build.input.pgRegistry.pgCodecs)) {
              const c = codec as PgCodecWithAttributes;
              if (!c.attributes) continue;

              const translationTableName = hasI18nTag(c);
              if (!translationTableName) continue;

              // Get schema name from the codec's pg extensions
              let schemaName = (c.extensions as any)?.pg?.schemaName ?? 'public';
              let pkColumn: string | null = null;
              let pkType = 'text';
              for (const [, resource] of Object.entries(build.input.pgRegistry.pgResources)) {
                const r = resource as any;
                if (r.codec === c) {
                  // Try multiple sources for schema name
                  const rSchema = r.extensions?.pg?.schemaName ?? r.schemaName;
                  if (rSchema) schemaName = rSchema;
                  // Extract PK from the resource's uniques array
                  const uniques = r.uniques as Array<{ attributes: string[]; isPrimary?: boolean }> | undefined;
                  if (uniques) {
                    const pk = uniques.find((u: any) => u.isPrimary);
                    if (pk && pk.attributes.length === 1) {
                      pkColumn = pk.attributes[0];
                      const pkAttr = c.attributes[pkColumn];
                      if (pkAttr) {
                        pkType = resolvePgTypeName((pkAttr as any).codec);
                      }
                    }
                  }
                  break;
                }
              }
              if (!pkColumn) continue;

              // Find the translation codec. The @i18n tag value is the SQL table name
              // (e.g. 'posts_translations'), but PostGraphile inflects codec names
              // to camelCase (e.g. 'postsTranslations'). Match via resource name.
              let translationCodec: PgCodecWithAttributes | null = null;
              for (const [, resource] of Object.entries(build.input.pgRegistry.pgResources)) {
                const r = resource as any;
                if (!r.codec?.attributes) continue;
                // Match by the resource's SQL name (which preserves snake_case)
                const sqlName = r.codec?.extensions?.pg?.name ?? r.name;
                if (sqlName === translationTableName) {
                  translationCodec = r.codec as PgCodecWithAttributes;
                  break;
                }
              }
              // Fallback: try matching the inflected codec name directly
              if (!translationCodec) {
                const inflectedName = build.inflection.camelCase(translationTableName);
                for (const [, tCodec] of Object.entries(build.input.pgRegistry.pgCodecs)) {
                  const tc = tCodec as any;
                  if (!tc.attributes) continue;
                  if (tc.name === translationTableName || tc.name === inflectedName) {
                    translationCodec = tc;
                    break;
                  }
                }
              }

              if (!translationCodec) continue;

              // Find FK column on translation table — convention first, then type match
              let fkColumn: string | null = null;
              const conventionalFk = `${c.name}_id`;
              if (translationCodec.attributes[conventionalFk]) {
                fkColumn = conventionalFk;
              }
              if (!fkColumn) {
                // Fallback: find a column with the same type as the PK, excluding
                // common non-FK columns (id, lang_code)
                for (const [attrName, attr] of Object.entries(translationCodec.attributes)) {
                  if (attrName === 'id' || attrName === langCodeColumn) continue;
                  const a = attr as any;
                  if (a.codec === (c.attributes[pkColumn] as any).codec) {
                    fkColumn = attrName;
                    break;
                  }
                }
              }
              if (!fkColumn) continue;

              // Discover translatable fields
              const fields: Record<string, TranslatableField> = {};
              for (const [attrName, attr] of Object.entries(translationCodec.attributes)) {
                if (attrName === langCodeColumn || attrName === fkColumn) continue;
                if (attrName === 'id' || attrName === 'created_at' || attrName === 'updated_at') continue;

                const pgType = resolveAttrPgType((attr as any).codec);
                if (!allowedTypes.includes(pgType)) continue;

                const gqlName = build.inflection.camelCase(attrName);
                fields[gqlName] = {
                  column: attrName,
                  type: pgType,
                  isNotNull: !!(attr as any).notNull,
                };
              }

              if (Object.keys(fields).length === 0) continue;

              state.registry.set(c, {
                baseTable: c.name,
                translationTable: translationTableName,
                schemaName,
                fkColumn,
                pkColumn,
                pkType,
                fields,
              });
            }

            return _;
          },
        },

        GraphQLObjectType_fields(fields, build, context) {
          const { graphql: { GraphQLString, GraphQLObjectType, GraphQLNonNull } } = build;
          const { scope } = context;

          if (!scope.pgCodec || !scope.isPgClassType) return fields;

          const state = stateByBuild.get(build);
          if (!state) return fields;
          const codec = scope.pgCodec as PgCodecWithAttributes;
          const info = state.registry.get(codec);
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
          if (!state.localeTypeCache.has(localeTypeName)) {
            state.localeTypeCache.set(localeTypeName, new GraphQLObjectType({
              name: localeTypeName,
              fields: localeFieldsConfig,
            }));
          }
          const localeType = state.localeTypeCache.get(localeTypeName);

          const { schemaName, baseTable, translationTable, fkColumn, pkColumn, pkType, fields: i18nFields } = info;

          const coalescedCols = Object.values(i18nFields)
            .map(f => `coalesce(v."${f.column}", b."${f.column}") as "${f.column}"`)
            .join(', ');

          // Build the SQL query template
          const sqlQuery = `SELECT v."${langCodeColumn}" AS "lang_code", ${coalescedCols}
             FROM "${schemaName}"."${baseTable}" b
             LEFT JOIN "${schemaName}"."${translationTable}" v
               ON v."${fkColumn}" = b."${pkColumn}"
               AND array_position($2::text[], v."${langCodeColumn}") IS NOT NULL
             WHERE b."${pkColumn}" = $1::${pkType}
             ORDER BY array_position($2::text[], v."${langCodeColumn}") ASC NULLS LAST
             LIMIT 1`;

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
