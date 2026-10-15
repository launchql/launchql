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

// The serving login is NOBYPASSRLS and routing_public sits behind member RLS,
// so the login reads through the platform's login-only reader, which
// answers the API row first and the database default otherwise.
const corsOriginsSql = `
  SELECT allowed_origins
  FROM function_resolution.cors_origins($1, $2)
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

    const result = await routingPool.query<CorsSettingsRow>(corsOriginsSql, [databaseId, apiId ?? null]);
    return result.rows[0]?.allowed_origins;
  }
});
