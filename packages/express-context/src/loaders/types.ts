/**
 * Module Loader Types
 *
 * A ModuleLoader is a cached lookup that resolves config from the routing DB
 * or tenant DB. Each loader owns an independent, bounded LRU keyed by
 * databaseId and optional apiId.
 *
 * Loaders are registered in a LoaderRegistry and resolved in parallel
 * during context building. The result is a typed modules map on
 * `req.constructive.modules`.
 */

import type { Pool } from 'pg';

/** Published logical name of the scoped routing plane. */
export const DEFAULT_ROUTING_SCHEMA = 'routing_public';

/**
 * The routing-plane schema a loader should query: the context override or
 * the published default. Throws on names unsafe to interpolate as an
 * identifier.
 */
export const routingSchemaOf = (
  ctx: Pick<LoaderContext, 'routingSchema'>
): string => {
  const schema = ctx.routingSchema ?? DEFAULT_ROUTING_SCHEMA;
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
    throw new Error(`invalid routing schema name: ${schema}`);
  }
  return schema;
};

/**
 * Assert a loader was handed the tenant it is resolving for.
 *
 * Every tenant-DB discovery query keys on `database_id`, because one serving
 * database holds several tenants' schemas: without the key the query returns an
 * arbitrary tenant's row, which is a cross-tenant config read rather than a
 * crash. A context with no `databaseId` is therefore a wiring fault, and must
 * fail here rather than degrade into an unkeyed query.
 */
export function requireDatabaseId(
  databaseId: string | undefined,
  loaderName: string
): asserts databaseId is string {
  if (!databaseId) {
    throw new Error(`loader ${loaderName}: context carries no databaseId`);
  }
}

/**
 * Context passed to every loader's resolve function.
 * Provides both pool references so the loader can query whichever
 * database tier it needs.
 */
export interface LoaderContext {
  /** Routing/configuration database pool (for routing-plane lookups) */
  routingPool: Pool;
  /** Routing-plane schema to query (defaults to the published routing_public) */
  routingSchema?: string;
  /** Tenant database pool (for metaschema_modules_public.* lookups) */
  tenantPool: Pool;
  /** UUID of the database being resolved */
  databaseId: string;
  /** UUID of the API (if resolved from domain/api-name lookup) */
  apiId?: string;
  /** Tenant database name */
  dbname: string;
}

/**
 * A single module loader. Encapsulates the SQL query, type transform, and
 * per-database/API LRU cache for one piece of per-database config.
 */
export interface ModuleLoader<T = unknown> {
  /** Unique name (used in log prefix and as the key in the modules map) */
  readonly name: string;
  /** Resolve the module config for a given database. Returns undefined if not provisioned. */
  resolve(ctx: LoaderContext): Promise<T | undefined>;
  /**
   * Invalidate one logical database, including all of its API entries.
   * Omitting the database ID clears everything.
   */
  invalidate(databaseId?: string): void;
  /** Current number of cached entries */
  readonly cacheSize: number;
}
