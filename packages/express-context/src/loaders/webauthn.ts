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

const webauthnSettingsSql = `
  SELECT
    s.schema_name AS schema,
    cred_s.schema_name AS credentials_schema,
    sess_s.schema_name AS sessions_schema,
    sec_s.schema_name AS session_secrets_schema,
    ws.rp_id,
    ws.rp_name,
    ws.origin_allowlist,
    ws.attestation_type,
    ws.require_user_verification,
    ws.resident_key,
    ws.challenge_expiry_seconds
  FROM routing_public.webauthn_settings ws
  LEFT JOIN metaschema_public.schema s ON ws.schema_id = s.id
  LEFT JOIN metaschema_public.schema cred_s ON ws.credentials_schema_id = cred_s.id
  LEFT JOIN metaschema_public.schema sess_s ON ws.sessions_schema_id = sess_s.id
  LEFT JOIN metaschema_public.schema sec_s ON ws.session_secrets_schema_id = sec_s.id
  WHERE ws.database_id = $1
  LIMIT 1
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
