/**
 * pg-settings — Build pgSettings from resolved API + auth token
 *
 * pgSettings are key-value pairs passed to PostgreSQL via SET LOCAL
 * within each transaction. They carry the JWT claims, role, database_id,
 * and request_id so that RLS policies and SQL functions can reference
 * the current user context via `current_setting('jwt.claims.user_id')`.
 *
 * This module extracts the pgSettings construction so it's reusable
 * across the PostGraphile server, LLM sidecar, or any Express service.
 */

import type { ApiStructure, ConstructiveAPIToken } from './types';

export interface PgSettingsInput {
  /** Resolved API config (provides role names, database_id) */
  api: ApiStructure;
  /** Authenticated token (null for anonymous) */
  token: ConstructiveAPIToken | null;
  /** Per-request correlation ID */
  requestId: string;
  /** Client IP address (`req.clientIp`, resolved by `clientIpMiddleware`) */
  clientIp?: string;
}

/**
 * Build pgSettings from the resolved API + auth token.
 *
 * These settings are applied via SET LOCAL in each transaction,
 * making them available to RLS policies and SQL functions.
 */
export function buildPgSettings(input: PgSettingsInput): Record<string, string> {
  const { api, token, requestId, clientIp } = input;
  const settings: Record<string, string> = {};

  // Role: from token (authenticated) or api (anonymous fallback)
  if (token?.user_id) {
    settings['role'] = api.roleName || 'authenticated';
    settings['jwt.claims.user_id'] = token.user_id;
  } else {
    settings['role'] = api.anonRole || 'anonymous';
  }

  // Session claims
  if (token?.session_id) {
    settings['jwt.claims.session_id'] = token.session_id;
  }

  // Session lineage (token exchange chains)
  if (token?.root_session_id) {
    settings['jwt.claims.root_session_id'] = token.root_session_id;
  }
  if (token?.parent_session_id) {
    settings['jwt.claims.parent_session_id'] = token.parent_session_id;
  }

  // Declared purpose of the credential
  if (token?.intent) {
    settings['jwt.claims.intent'] = token.intent;
  }

  // Principal identity (service accounts / bots)
  if (token?.principal_id) {
    settings['jwt.claims.principal_id'] = token.principal_id;
  }

  // Database context
  if (api.databaseId) {
    settings['jwt.claims.database_id'] = api.databaseId;
  }

  // API provenance — which API surface this request arrived through.
  // Derived server-side by resolving the hostname through the scoped routing
  // plane (resolve_route -> api_id); never taken from client-supplied headers,
  // body, or token payload.
  if (api.apiId) {
    settings['jwt.claims.api_id'] = api.apiId;
  }

  // Distributed tracing
  settings['request.id'] = requestId;

  // Client metadata (for audit functions)
  if (clientIp) {
    settings['jwt.claims.ip_address'] = clientIp;
  }

  return settings;
}
