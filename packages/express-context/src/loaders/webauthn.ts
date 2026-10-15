/**
 * WebAuthn Settings Loader
 *
 * Resolves WebAuthn/passkey configuration for a database — RP identity,
 * schema references, attestation policy, and challenge expiry.
 */

import type { WebauthnSettings } from '../types';
import { createModuleLoader } from './create-loader';
import type { LoaderContext, ModuleLoader } from './types';

// ─── SQL ────────────────────────────────────────────────────────────────────

// The serving login is NOBYPASSRLS and routing_public sits behind member RLS,
// so the login reads through the platform's login-only reader.
const webauthnSettingsSql = `
  SELECT
    schema_name AS schema,
    credentials_schema,
    sessions_schema,
    session_secrets_schema,
    rp_id,
    rp_name,
    origin_allowlist,
    attestation_type,
    require_user_verification,
    resident_key,
    challenge_expiry_seconds
  FROM function_resolution.webauthn_entry($1)
`;

// ─── Row Types ──────────────────────────────────────────────────────────────

interface WebauthnSettingsRow {
  schema: string;
  credentials_schema: string;
  sessions_schema: string;
  session_secrets_schema: string;
  rp_id: string;
  rp_name: string;
  origin_allowlist: string[];
  attestation_type: string;
  require_user_verification: boolean;
  resident_key: string;
  challenge_expiry_seconds: number;
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export const webauthnLoader: ModuleLoader<WebauthnSettings> = createModuleLoader<WebauthnSettings>({
  name: 'webauthnSettings',
  ttlMs: 5 * 60_000,
  async resolve(ctx: LoaderContext) {
    const { routingPool, databaseId } = ctx;

    const result = await routingPool.query<WebauthnSettingsRow>(webauthnSettingsSql, [databaseId]);
    const row = result.rows[0];
    if (!row?.schema) return undefined;

    return {
      schema: row.schema,
      credentialsSchema: row.credentials_schema,
      sessionsSchema: row.sessions_schema,
      sessionSecretsSchema: row.session_secrets_schema,
      rpId: row.rp_id,
      rpName: row.rp_name,
      originAllowlist: row.origin_allowlist,
      attestationType: row.attestation_type,
      requireUserVerification: row.require_user_verification,
      residentKey: row.resident_key,
      challengeExpirySeconds: row.challenge_expiry_seconds
    };
  }
});
