import { Logger } from '@pgpmjs/logger';
import { QuoteUtils } from '@pgsql/quotes';
import { Pool } from 'pg';

import { ApiOptions, ApiStructure } from '../types';

const log = new Logger('routing');

// =============================================================================
// Scoped routing plane (resolve_route contract)
// =============================================================================
//
// One indexed call resolves an incoming request across scopes. The server's
// projection is HOST-ONLY: Traefik/Ingress owns L7 path/method routing, so
// the server always calls the frozen contract with the root path and no
// method:
//
//   SELECT * FROM <schema>.resolve_route(request_host, '/', NULL)
//
// Contract (constructive-db docs/architecture/scoped-domain-routing.md):
// a single row is always returned; no match → route_binding_id IS NULL.

/**
 * The role an API row names is the role the server will SET ROLE to; a row
 * that leaves one blank is a broken surface, not a request for a default.
 * Throws (code MISSING_API_ROLE) rather than substituting a role.
 */
export const requireApiRole = (
  column: 'role_name' | 'anon_role',
  value: string | null | undefined,
  apiId: string | undefined
): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    const error = new Error(
      `API ${apiId ?? '<unknown>'} has no ${column}; a served role is required and there is no default.`
    ) as Error & { code?: string; column?: string; apiId?: string };
    error.code = 'MISSING_API_ROLE';
    error.column = column;
    error.apiId = apiId;
    throw error;
  }
  // administrator bypasses RLS; an API never serves as it.
  if (value === 'administrator') {
    const error = new Error(
      `API ${apiId ?? '<unknown>'} ${column} is administrator; APIs serve as request roles under RLS.`
    ) as Error & { code?: string; column?: string; apiId?: string };
    error.code = 'API_ROLE_FORBIDDEN';
    error.column = column;
    error.apiId = apiId;
    throw error;
  }
  return value;
};

/** Row shape returned by <schema>.resolve_route() — frozen DB↔server contract. */
export interface ResolvedRoute {
  route_binding_id: string | null;
  hostname: string | null;
  matched_wildcard: boolean | null;
  matched_path: string | null;
  method: string | null;
  priority: number | null;
  domain_id: string | null;
  target_catalog_id: string | null;
  target_module: string | null;
  target_source_id: string | null;
  target_owner_scope: string | null;
  target_owner_key: string | null;
  resolved_config: Record<string, unknown> | null;
  verification_status: string | null;
  tls_status: string | null;
  tls_secret_name: string | null;
}

const RESOLVER_FUNCTION = 'resolve_route';

/** API schema of the routing plane the server resolves hosts on first. */
export const ROUTING_SCHEMA = 'routing_public';

export const isValidSchemaName = (name: string): boolean =>
  /^[a-z_][a-z0-9_]*$/.test(name);

/**
 * Resolve a hostname through the compiled scoped-routing plane (host-only:
 * path/method routing belongs to Traefik/Ingress, not the server).
 * Returns null when there is no match (route_binding_id IS NULL) or when the
 * resolver is not installed in the target database — in both cases the caller
 * treats it as a hard no-match (→ 404); there is no legacy fallback.
 */
export const resolveRoute = async (
  pool: Pool,
  schema: string,
  host: string
): Promise<ResolvedRoute | null> => {
  if (!isValidSchemaName(schema)) {
    log.warn(`[resolve-route] invalid routing schema name: ${schema}`);
    return null;
  }

  try {
    const result = await pool.query<ResolvedRoute>(
      `SELECT * FROM "${schema}".${RESOLVER_FUNCTION}($1, '/', NULL)`,
      [host]
    );
    const row = result.rows[0];
    if (!row || row.route_binding_id === null) {
      log.debug(`[resolve-route] no match for host=${host}`);
      return null;
    }
    return row;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // 42883 undefined_function / 3F000 invalid_schema_name: resolver not
    // installed in this database — treat as a hard no-match.
    if (err.code === '42883' || err.code === '3F000') {
      log.debug(`[resolve-route] resolver not installed (${err.code}); no match`);
      return null;
    }
    throw error;
  }
};

/**
 * Config keys the scoped api surface folds into `config` (and route
 * `resolved_config`) that the server maps onto ApiStructure.
 */
/**
 * A database-scope routing plane: one `route_module` row whose resolver keeps
 * the resolve_route contract. `schema` is the plane's API schema (it names the
 * server's own plane); `resolverSchema` is where its resolver lives.
 */
export interface DatabaseRoutingPlane {
  databaseId: string;
  schema: string;
  resolverSchema: string;
  resolver: string;
}

/**
 * Every database-scope routing plane, in the static gateway's order (by
 * database id). The list spans every tenant, so it comes from a SECURITY
 * DEFINER reader granted to the platform login alone, on the login's own
 * connection: no role switch, no RLS bypass. A plane whose registration names
 * no schema or resolver is an incomplete install and fails loud.
 */
export const loadRoutingPlanes = async (
  pool: Pool
): Promise<DatabaseRoutingPlane[]> => {
  const { rows } = await pool.query<{
    database_id: string;
    schema_name: string | null;
    resolver_schema_name: string | null;
    resolver_function_name: string | null;
  }>(
    `SELECT database_id, schema_name, resolver_schema_name, resolver_function_name
       FROM function_resolution.routing_planes()`
  );
  return rows.map((row) => {
    const missing = !row.schema_name
      ? 'public schema'
      : !row.resolver_schema_name
        ? 'resolver schema'
        : !row.resolver_function_name
          ? 'resolver function'
          : null;
    if (missing) {
      const error = new Error(
        `route_module for database ${row.database_id} names no ${missing}`
      ) as Error & { code?: string; databaseId?: string };
      error.code = 'ROUTING_PLANE_INCOMPLETE';
      error.databaseId = row.database_id;
      throw error;
    }
    return {
      databaseId: row.database_id,
      schema: row.schema_name,
      resolverSchema: row.resolver_schema_name,
      resolver: row.resolver_function_name
    };
  });
};

const resolveOnPlane = async (
  pool: Pool,
  plane: DatabaseRoutingPlane,
  host: string
): Promise<ResolvedRoute | null> => {
  const resolver = QuoteUtils.quoteQualifiedIdentifier(plane.resolverSchema, plane.resolver);
  const result = await pool.query<ResolvedRoute>(
    `SELECT * FROM ${resolver}($1, '/', NULL)`,
    [host]
  );
  const row = result.rows[0];
  return row && row.route_binding_id !== null ? row : null;
};

export interface PlaneRouteMatch {
  route: ResolvedRoute;
  /** Database whose own plane owns the host; null for `routing_public`. */
  planeDatabaseId: string | null;
}

/**
 * Resolve a host across routing planes: the server's own `routing_public`
 * plane first, then each tenant database-scope plane. The first plane that
 * matches owns the host; later planes are not consulted.
 */
export const resolveRouteAcrossPlanes = async (
  pool: Pool,
  host: string
): Promise<PlaneRouteMatch | null> => {
  const planes = await loadRoutingPlanes(pool);
  const own = planes.find((plane) => plane.schema === ROUTING_SCHEMA);
  if (own) {
    const route = await resolveRoute(pool, own.resolverSchema, host);
    if (route) return { route, planeDatabaseId: null };
  }

  for (const plane of planes) {
    if (plane === own) continue;
    const planeRoute = await resolveOnPlane(pool, plane, host);
    if (planeRoute) {
      log.debug(`[resolve-route] host=${host} owned by database plane ${plane.schema} (db=${plane.databaseId})`);
      return { route: planeRoute, planeDatabaseId: plane.databaseId };
    }
  }
  log.debug(`[resolve-route] no plane owns host=${host}`);
  return null;
};

interface ApiSurfaceConfig {
  api_id?: string;
  database_id?: string;
  dbname?: string;
  role_name?: string;
  anon_role?: string;
  is_public?: boolean;
  schemas?: string[];
}

/**
 * Map a resolved api-target route onto the ApiStructure shape consumed by the
 * rest of the middleware chain. Returns null when the route target is not an
 * api surface or its resolved_config lacks the api essentials (→ 404).
 */
export const routeToApiStructure = (
  route: ResolvedRoute,
  opts: ApiOptions
): ApiStructure | null => {
  if (route.target_module !== 'apis' && route.target_module !== 'api') {
    return null;
  }

  const config = (route.resolved_config ?? {}) as ApiSurfaceConfig;
  if (!config.schemas?.length) {
    log.debug('[resolve-route] api target missing schemas in resolved_config; no match');
    return null;
  }

  const apiId = config.api_id ?? route.target_source_id ?? undefined;

  return {
    apiId,
    // Scoped APIs leave dbname NULL when their schemas live in the serving
    // database; fall back to the server's own database in that case.
    dbname: config.dbname || opts.pg?.database || '',
    anonRole: requireApiRole('anon_role', config.anon_role, apiId),
    roleName: requireApiRole('role_name', config.role_name, apiId),
    schema: config.schemas,
    domains: [],
    databaseId: config.database_id,
    isPublic: config.is_public ?? (opts.api?.isPublic ?? false)
  };
};
