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
 * The columns are also selected by feature detection rather than by name
 * alone. A serving cluster runs routing planes of several ages — the plane is
 * a published package a tenant upgrades on its own schedule — and a plane that
 * predates these columns must resolve to the platform defaults, not fail every
 * request against it with `column ds.… does not exist`.
 */

import type { Pool } from 'pg';

import type { RequestProtection, RequestProtectionInput } from '../request-protection';
import { resolveRequestProtection } from '../request-protection';
import { createModuleLoader } from './create-loader';
import type { LoaderContext, ModuleLoader } from './types';
import { routingSchemaOf } from './types';

// ─── SQL ────────────────────────────────────────────────────────────────────

const PROTECTION_COLUMNS = [
  'statement_timeout_ms',
  'idle_in_transaction_timeout_ms',
  'lock_timeout_ms',
  'max_concurrent_requests',
  'max_queue_wait_ms',
  'rate_limit_rpm',
  'rate_limit_burst',
  'max_query_depth',
  'max_query_cost',
  'max_page_size',
  'max_request_bytes',
  'enable_introspection'
] as const;

type ProtectionColumn = (typeof PROTECTION_COLUMNS)[number];

/** Which of the protection columns a given routing plane actually carries. */
interface AvailableColumns {
  database: Set<string>;
  api: Set<string>;
}

const availableColumnsSql = `
  SELECT table_name, column_name
  FROM information_schema.columns
  WHERE table_schema = $1
    AND table_name IN ('database_settings', 'api_settings')
    AND column_name = ANY($2::text[])
`;

const requestProtectionSql = (schema: string, columns: AvailableColumns): string => {
  const select = PROTECTION_COLUMNS.flatMap((column) => [
    columns.database.has(column) ? `ds.${column} AS db_${column}` : null,
    columns.api.has(column) ? `aps.${column} AS api_${column}` : null
  ])
    .filter((expr): expr is string => expr !== null)
    .join(',\n    ');

  // The join is dropped when the plane carries no API-scope column, so a plane
  // without an `api_settings` table at all is still readable.
  const join = columns.api.size
    ? `\n  LEFT JOIN "${schema}".api_settings aps ON ds.database_id = aps.database_id AND aps.api_id = $2`
    : '';

  return `
  SELECT
    ds.database_id${select ? `,\n    ${select}` : ''}
  FROM "${schema}".database_settings ds${join}
  WHERE ds.database_id = $1
  LIMIT 1
`;
};

/**
 * The routing plane's shape changes only when it is redeployed, so it is read
 * once per pool+schema. Keyed by the pool object so a test pool and a serving
 * pool never share an answer.
 */
const columnCache = new WeakMap<Pool, Map<string, Promise<AvailableColumns>>>();

const availableColumns = (pool: Pool, schema: string): Promise<AvailableColumns> => {
  let bySchema = columnCache.get(pool);
  if (!bySchema) {
    bySchema = new Map();
    columnCache.set(pool, bySchema);
  }

  const cached = bySchema.get(schema);
  if (cached) return cached;

  const pending = pool
    .query<{ table_name: string; column_name: string }>(availableColumnsSql, [
      schema,
      [...PROTECTION_COLUMNS]
    ])
    .then((result) => {
      const columns: AvailableColumns = { database: new Set(), api: new Set() };
      for (const { table_name, column_name } of result.rows) {
        if (table_name === 'database_settings') columns.database.add(column_name);
        else columns.api.add(column_name);
      }
      return columns;
    })
    .catch((e) => {
      // A failed probe is not an answer: drop it so the next request retries
      // rather than caching "this plane has no protection columns" forever.
      bySchema.delete(schema);
      throw e;
    });

  bySchema.set(schema, pending);
  return pending;
};

/** Test seam: forget what a pool's routing plane looked like. */
export const forgetProtectionColumns = (pool: Pool): void => {
  columnCache.delete(pool);
};

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
      const schema = routingSchemaOf(ctx);
      const columns = await availableColumns(routingPool, schema);

      const params: unknown[] = columns.api.size ? [databaseId, apiId ?? null] : [databaseId];
      const result = await routingPool.query<RequestProtectionRow>(
        requestProtectionSql(schema, columns),
        params
      );
      const row = result.rows[0];
      if (!row) return undefined;

      return resolveRequestProtection(scopeOf(row, 'db'), scopeOf(row, 'api'));
    }
  });
