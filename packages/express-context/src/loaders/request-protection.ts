/**
 * Request Protection Loader
 *
 * Reads the per-database bounds and the per-API overrides raw, then resolves
 * them through the platform's own defaults and ceilings.
 *
 * Unlike the feature-flag loader next door this cannot `COALESCE` in SQL: an
 * API override is lower-only, so the two scopes are combined with `LEAST` and
 * then clamped in code, where the platform constants live.
 *
 * The serving login is NOBYPASSRLS and routing_public sits behind member RLS,
 * so both scopes come back side by side from the platform's login-only reader.
 */

import type { RequestProtection, RequestProtectionInput } from '../request-protection';
import { resolveRequestProtection } from '../request-protection';
import { createModuleLoader } from './create-loader';
import type { LoaderContext, ModuleLoader } from './types';

// ─── SQL ────────────────────────────────────────────────────────────────────

type ProtectionColumn =
  | 'statement_timeout_ms'
  | 'idle_in_transaction_timeout_ms'
  | 'lock_timeout_ms'
  | 'max_concurrent_requests'
  | 'max_queue_wait_ms'
  | 'rate_limit_rpm'
  | 'rate_limit_burst'
  | 'max_query_depth'
  | 'max_query_cost'
  | 'max_page_size'
  | 'max_request_bytes'
  | 'enable_introspection';

const requestProtectionSql = `
  SELECT *
  FROM function_resolution.request_protection($1, $2)
`;

// ─── Row Types ──────────────────────────────────────────────────────────────

type RequestProtectionRow = Partial<
  Record<`db_${ProtectionColumn}` | `api_${ProtectionColumn}`, unknown>
>;

/**
 * `bigint` columns arrive as strings from node-postgres (pg returns int8 as
 * text to avoid the 2^53 cliff), so every numeric bound is normalized here
 * rather than trusted to already be a number.
 */
const num = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const bool = (value: unknown): boolean | null =>
  value === null || value === undefined ? null : Boolean(value);

const scopeOf = (row: RequestProtectionRow, prefix: 'db' | 'api'): RequestProtectionInput => ({
  statementTimeoutMs: num(row[`${prefix}_statement_timeout_ms`]),
  idleInTransactionTimeoutMs: num(row[`${prefix}_idle_in_transaction_timeout_ms`]),
  lockTimeoutMs: num(row[`${prefix}_lock_timeout_ms`]),
  maxConcurrentRequests: num(row[`${prefix}_max_concurrent_requests`]),
  maxQueueWaitMs: num(row[`${prefix}_max_queue_wait_ms`]),
  rateLimitRpm: num(row[`${prefix}_rate_limit_rpm`]),
  rateLimitBurst: num(row[`${prefix}_rate_limit_burst`]),
  maxQueryDepth: num(row[`${prefix}_max_query_depth`]),
  maxQueryCost: num(row[`${prefix}_max_query_cost`]),
  maxPageSize: num(row[`${prefix}_max_page_size`]),
  maxRequestBytes: num(row[`${prefix}_max_request_bytes`]),
  enableIntrospection: bool(row[`${prefix}_enable_introspection`])
});

// ─── Loader ─────────────────────────────────────────────────────────────────

export const requestProtectionLoader: ModuleLoader<RequestProtection> =
  createModuleLoader<RequestProtection>({
    name: 'requestProtection',
    ttlMs: 5 * 60_000,
    async resolve(ctx: LoaderContext) {
      const { routingPool, databaseId, apiId } = ctx;
      const result = await routingPool.query<RequestProtectionRow>(requestProtectionSql, [
        databaseId,
        apiId ?? null
      ]);
      const row = result.rows[0];
      if (!row) return undefined;

      return resolveRequestProtection(scopeOf(row, 'db'), scopeOf(row, 'api'));
    }
  });
