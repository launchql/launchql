/**
 * CORS Origins Loader
 *
 * Resolves allowed CORS origins for a database+API combination from the
 * scoped routing plane. Checks per-API settings first, falls back to the
 * database-level default.
 */

import { createModuleLoader } from './create-loader';
import type { LoaderContext, ModuleLoader } from './types';

// ─── SQL ────────────────────────────────────────────────────────────────────

const corsSettingsSql = `
  SELECT allowed_origins
  FROM routing_public.cors_settings
  WHERE database_id = $1 AND api_id = $2
  LIMIT 1
`;

const corsSettingsDbDefaultSql = `
  SELECT allowed_origins
  FROM routing_public.cors_settings
  WHERE database_id = $1 AND api_id IS NULL
  LIMIT 1
`;

// ─── Row Types ──────────────────────────────────────────────────────────────

interface CorsSettingsRow {
  allowed_origins: string[];
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export const corsLoader: ModuleLoader<string[]> = createModuleLoader<string[]>({
  name: 'corsOrigins',
  ttlMs: 5 * 60_000,
  async resolve(ctx: LoaderContext) {
    const { routingPool, databaseId, apiId } = ctx;

    if (apiId) {
      const perApi = await routingPool.query<CorsSettingsRow>(corsSettingsSql, [databaseId, apiId]);
      if (perApi.rows[0]) return perApi.rows[0].allowed_origins;
    }
    const dbDefault = await routingPool.query<CorsSettingsRow>(corsSettingsDbDefaultSql, [databaseId]);
    if (dbDefault.rows[0]) return dbDefault.rows[0].allowed_origins;

    return undefined;
  }
});
