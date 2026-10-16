/**
 * RLS Module Loader
 *
 * Resolves RLS authentication function names and schema references for
 * a given database from the scoped routing plane via the typed rls_settings
 * table.
 */

import type { RlsModule } from '../types';
import { createModuleLoader } from './create-loader';
import type { LoaderContext, ModuleLoader } from './types';

// ─── SQL ────────────────────────────────────────────────────────────────────

// The serving login is NOBYPASSRLS and routing_public sits behind member RLS,
// so the login reads through the platform's login-only reader.
const rlsSettingsSql = `
  SELECT
    authenticate_schema,
    role_schema,
    authenticate_function AS authenticate,
    authenticate_strict_function AS authenticate_strict,
    current_role_function AS current_role,
    current_role_id_function AS current_role_id,
    current_user_agent_function AS current_user_agent,
    current_ip_address_function AS current_ip_address
  FROM function_resolution.tenant_auth_entry($1)
`;

// ─── Row Types ──────────────────────────────────────────────────────────────

interface RlsSettingsRow {
  authenticate: string;
  authenticate_strict: string;
  authenticate_schema: string;
  role_schema: string;
  current_role: string;
  current_role_id: string;
  current_ip_address: string;
  current_user_agent: string;
}

// ─── Transforms ─────────────────────────────────────────────────────────────

function fromSettings(row: RlsSettingsRow | null): RlsModule | undefined {
  if (!row) return undefined;
  if (!row.authenticate || !row.authenticate_schema) return undefined;
  return {
    authenticate: row.authenticate,
    authenticateStrict: row.authenticate_strict,
    privateSchema: { schemaName: row.authenticate_schema },
    publicSchema: { schemaName: row.role_schema },
    currentRole: row.current_role,
    currentRoleId: row.current_role_id,
    currentIpAddress: row.current_ip_address,
    currentUserAgent: row.current_user_agent
  };
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export const rlsLoader: ModuleLoader<RlsModule> = createModuleLoader<RlsModule>({
  name: 'rlsModule',
  ttlMs: 5 * 60_000,
  async resolve(ctx: LoaderContext) {
    const { routingPool, databaseId } = ctx;
    const result = await routingPool.query<RlsSettingsRow>(rlsSettingsSql, [databaseId]);
    return fromSettings(result.rows[0] ?? null);
  }
});
