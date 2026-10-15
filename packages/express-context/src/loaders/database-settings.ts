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

const databaseSettingsSql = `
  SELECT
    COALESCE(aps.enable_aggregates, ds.enable_aggregates) AS resolved_enable_aggregates,
    COALESCE(aps.enable_postgis, ds.enable_postgis) AS resolved_enable_postgis,
    COALESCE(aps.enable_search, ds.enable_search) AS resolved_enable_search,
    COALESCE(aps.enable_direct_uploads, ds.enable_direct_uploads) AS resolved_enable_direct_uploads,
    COALESCE(aps.enable_presigned_uploads, ds.enable_presigned_uploads) AS resolved_enable_presigned_uploads,
    COALESCE(aps.enable_many_to_many, ds.enable_many_to_many) AS resolved_enable_many_to_many,
    COALESCE(aps.enable_connection_filter, ds.enable_connection_filter) AS resolved_enable_connection_filter,
    COALESCE(aps.enable_ltree, ds.enable_ltree) AS resolved_enable_ltree,
    COALESCE(aps.enable_llm, ds.enable_llm) AS resolved_enable_llm,
    COALESCE(aps.enable_realtime, ds.enable_realtime) AS resolved_enable_realtime,
    COALESCE(aps.enable_bulk, ds.enable_bulk) AS resolved_enable_bulk,
    COALESCE(aps.enable_i18n, ds.enable_i18n) AS resolved_enable_i18n
  FROM routing_public.database_settings ds
  LEFT JOIN routing_public.api_settings aps ON ds.database_id = aps.database_id AND aps.api_id = $2
  WHERE ds.database_id = $1
  LIMIT 1
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
