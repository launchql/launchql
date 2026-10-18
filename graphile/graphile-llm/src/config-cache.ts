/**
 * config-cache — Per-database LLM billing configuration cache
 *
 * Caches resolved billing function names per owner and database_id.
 * Uses an LRU cache with TTL so config changes propagate within a bounded window
 * without requiring a server restart.
 *
 * Resolution flow:
 *   Billing config from `metaschema_modules_public.billing_module`
 *   (schema name + function names for record_usage, check_billing_quota)
 *
 * All queries run through the Graphile `withPgClient` callback, which gives us
 * a client connected to the tenant database with proper role settings.
 *
 * The LLM module config (provider, model, etc.) is already resolved by the
 * LlmModulePlugin at schema-build time. This cache handles the runtime-only
 * billing piece.
 */

import { ModuleConfigCache } from 'graphile-cache';

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Generic pg client interface matching what Graphile's withPgClient provides.
 * Avoids a hard dependency on the `pg` package.
 */
export interface PgClient {
  query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

/**
 * Billing function metadata resolved from the billing_module metaschema table.
 */
export interface BillingConfig {
  /** Private schema containing the billing functions */
  privateSchema: string;
  /** Name of the record_usage function */
  recordUsageFunction: string;
  /** Name of the check_billing_quota function */
  checkBillingQuotaFunction: string;
  /** Public schema containing meters table */
  publicSchema: string;
}

/**
 * Inference log table metadata resolved from the inference_log_module.
 */
export interface InferenceLogConfig {
  /** Schema containing the usage_log_inference table */
  schema: string;
  /** Name of the inference log table */
  tableName: string;
}

/**
 * Per-database cached configuration for the LLM billing integration.
 */
export interface LlmBillingCacheEntry {
  /** Billing function references (null if billing_module not provisioned) */
  billing: BillingConfig | null;
  /** Inference log table references (null if inference_log_module not provisioned) */
  inferenceLog: InferenceLogConfig | null;
}

// ─── SQL Queries ────────────────────────────────────────────────────────────

/**
 * Check if the billing_module table exists before querying it.
 * This prevents hard errors on databases that don't have the billing
 * module provisioned (the metaschema_modules_public schema or the
 * billing_module table might not exist at all).
 */
const BILLING_MODULE_SQL = `
  SELECT
    s.schema_name AS public_schema,
    ps.schema_name AS private_schema,
    bm.record_usage_function
  FROM metaschema_modules_public.billing_module bm
  JOIN metaschema_public.schema s ON bm.schema_id = s.id
  JOIN metaschema_public.schema ps ON bm.private_schema_id = ps.id
  WHERE bm.database_id = $1
  LIMIT 1
`;

/**
 * Resolve the inference log module's schema and table name.
 */
const INFERENCE_LOG_MODULE_SQL = `
  SELECT
    s.schema_name AS schema,
    ilm.inference_log_table_name AS table_name
  FROM metaschema_modules_public.inference_log_module ilm
  JOIN metaschema_public.schema s ON ilm.schema_id = s.id
  WHERE ilm.database_id = $1
  LIMIT 1
`;
// ─── Cache ──────────────────────────────────────────────────────────────────

const BILLING_CACHE_MAX = 50;
let billingCachesByScope = new WeakMap<
  object,
  ModuleConfigCache<LlmBillingCacheEntry>
>();

function assertValidCacheScope(cacheScope: unknown): asserts cacheScope is object {
  if (
    (typeof cacheScope !== 'object' && typeof cacheScope !== 'function') ||
    cacheScope === null
  ) {
    throw new Error('LLM_CONFIG_CACHE_SCOPE_UNAVAILABLE');
  }
}

function getBillingCache(
  cacheScope: object
): ModuleConfigCache<LlmBillingCacheEntry> {
  assertValidCacheScope(cacheScope);
  let cache = billingCachesByScope.get(cacheScope);
  if (!cache) {
    cache = new ModuleConfigCache<LlmBillingCacheEntry>({
      name: 'billing-config',
      ttlMs: 5 * 60 * 1000, // 5 minutes
      max: BILLING_CACHE_MAX
    });
    billingCachesByScope.set(cacheScope, cache);
  }
  return cache;
}

// ─── Resolution Functions ───────────────────────────────────────────────────

/**
 * SQL to check if a schema exists. Used as a guard before querying
 * metaschema tables that may not be provisioned.
 */
const SCHEMA_EXISTS_SQL = `
  SELECT 1 FROM information_schema.schemata WHERE schema_name = $1 LIMIT 1
`;

/**
 * The module table is absent on a database that never provisioned it; only
 * that undefined_table probe result means "not configured". Anything else
 * (permissions, connectivity, bad SQL) is a real failure and propagates.
 */
const isModuleTableMissing = (err: unknown): boolean =>
  (err as { code?: string } | null)?.code === '42P01';

async function resolveInferenceLogConfig(
  pgClient: PgClient,
  databaseId: string
): Promise<InferenceLogConfig | null> {
  try {
    const schemaCheck = await pgClient.query(SCHEMA_EXISTS_SQL, ['metaschema_modules_public']);
    if (schemaCheck.rows.length === 0) return null;

    const result = await pgClient.query(INFERENCE_LOG_MODULE_SQL, [databaseId]);
    const row = result.rows[0];
    if (!row?.schema || !row?.table_name) return null;

    return {
      schema: row.schema as string,
      tableName: row.table_name as string
    };
  } catch (err) {
    if (isModuleTableMissing(err)) return null;
    throw err;
  }
}

async function resolveBillingConfig(
  pgClient: PgClient,
  databaseId: string
): Promise<BillingConfig | null> {
  try {
    // Guard: check if the metaschema_modules_public schema exists.
    // If the database doesn't have the billing module provisioned,
    // this schema (or the billing_module table) won't exist.
    const schemaCheck = await pgClient.query(SCHEMA_EXISTS_SQL, ['metaschema_modules_public']);
    if (schemaCheck.rows.length === 0) return null;

    const result = await pgClient.query(BILLING_MODULE_SQL, [databaseId]);
    const row = result.rows[0];
    if (!row?.record_usage_function) return null;

    return {
      publicSchema: row.public_schema as string,
      privateSchema: row.private_schema as string,
      recordUsageFunction: row.record_usage_function as string,
      // The check_billing_quota function name follows the inflection pattern
      checkBillingQuotaFunction: 'check_billing_quota'
    };
  } catch (err) {
    if (isModuleTableMissing(err)) return null;
    throw err;
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Resolve billing config for a database.
 * Results are cached per owner and database_id with a 5-minute TTL.
 *
 * @param pgClient - A client connected to the tenant database (from withPgClient)
 * @param databaseId - The database UUID
 * @param cacheScope - The exact owner of the cached result. Defaults to the
 *   client for compatibility with the original two-argument API.
 */
export async function getLlmBillingConfig(
  pgClient: PgClient,
  databaseId: string,
  cacheScope: object = pgClient
): Promise<LlmBillingCacheEntry> {
  const billingCache = getBillingCache(cacheScope);
  const cached = billingCache.get(databaseId);
  if (cached) return cached;

  const [billing, inferenceLog] = await Promise.all([
    resolveBillingConfig(pgClient, databaseId),
    resolveInferenceLogConfig(pgClient, databaseId)
  ]);

  const entry: LlmBillingCacheEntry = { billing, inferenceLog };
  billingCache.set(databaseId, entry);
  return entry;
}

/**
 * Invalidate cached config for one exact owner. Omitting the owner resets all
 * weakly owned caches without retaining their build identities.
 */
export function invalidateLlmBillingConfig(
  databaseId?: string,
  cacheScope?: object
): void {
  if (cacheScope === undefined) {
    billingCachesByScope = new WeakMap();
    return;
  }
  assertValidCacheScope(cacheScope);
  const billingCache = billingCachesByScope.get(cacheScope);
  if (!billingCache) return;
  if (databaseId) {
    billingCache.delete(databaseId);
  } else {
    billingCache.clear();
  }
}

/**
 * Get cache stats for an exact owner without retaining other build identities.
 */
export function getLlmBillingCacheStats(cacheScope: object): { size: number; max: number } {
  assertValidCacheScope(cacheScope);
  return {
    size: billingCachesByScope.get(cacheScope)?.size ?? 0,
    max: BILLING_CACHE_MAX
  };
}
