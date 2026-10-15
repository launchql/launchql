/**
 * Database Settings Loader
 *
 * Resolves per-database feature flags (aggregates, postgis, search,
 * uploads, many-to-many, connection filters, ltree, llm, realtime, bulk).
 * Merges database-level defaults with optional per-API overrides.
 */

import type { DatabaseSettings } from '../types';
import { createModuleLoader } from './create-loader';
import type { LoaderContext, ModuleLoader } from './types';

// ─── SQL ────────────────────────────────────────────────────────────────────

// The serving login is NOBYPASSRLS and routing_public sits behind member RLS,
// so the login reads through the platform's login-only reader.
const databaseSettingsSql = `
  SELECT
    enable_aggregates AS resolved_enable_aggregates,
    enable_postgis AS resolved_enable_postgis,
    enable_search AS resolved_enable_search,
    enable_direct_uploads AS resolved_enable_direct_uploads,
    enable_presigned_uploads AS resolved_enable_presigned_uploads,
    enable_many_to_many AS resolved_enable_many_to_many,
    enable_connection_filter AS resolved_enable_connection_filter,
    enable_ltree AS resolved_enable_ltree,
    enable_llm AS resolved_enable_llm,
    enable_realtime AS resolved_enable_realtime,
    enable_bulk AS resolved_enable_bulk,
    enable_i18n AS resolved_enable_i18n
  FROM function_resolution.database_features($1, $2)
`;

// ─── Row Types ──────────────────────────────────────────────────────────────

interface DatabaseSettingsRow {
  resolved_enable_aggregates: boolean;
  resolved_enable_postgis: boolean;
  resolved_enable_search: boolean;
  resolved_enable_direct_uploads: boolean;
  resolved_enable_presigned_uploads: boolean;
  resolved_enable_many_to_many: boolean;
  resolved_enable_connection_filter: boolean;
  resolved_enable_ltree: boolean;
  resolved_enable_llm: boolean;
  resolved_enable_realtime: boolean;
  resolved_enable_bulk: boolean;
  resolved_enable_i18n: boolean;
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export const databaseSettingsLoader: ModuleLoader<DatabaseSettings> = createModuleLoader<DatabaseSettings>({
  name: 'databaseSettings',
  ttlMs: 5 * 60_000,
  async resolve(ctx: LoaderContext) {
    const { routingPool, databaseId, apiId } = ctx;

    const result = await routingPool.query<DatabaseSettingsRow>(
      databaseSettingsSql,
      [databaseId, apiId ?? null]
    );
    const row = result.rows[0];
    if (!row) return undefined;

    return {
      enableAggregates: row.resolved_enable_aggregates,
      enablePostgis: row.resolved_enable_postgis,
      enableSearch: row.resolved_enable_search,
      enableDirectUploads: row.resolved_enable_direct_uploads,
      enablePresignedUploads: row.resolved_enable_presigned_uploads,
      enableManyToMany: row.resolved_enable_many_to_many,
      enableConnectionFilter: row.resolved_enable_connection_filter,
      enableLtree: row.resolved_enable_ltree,
      enableLlm: row.resolved_enable_llm,
      enableRealtime: row.resolved_enable_realtime,
      enableBulk: row.resolved_enable_bulk,
      enableI18n: row.resolved_enable_i18n
    };
  }
});
