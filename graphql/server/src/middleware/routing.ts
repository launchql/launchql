import { Logger } from '@pgpmjs/logger';
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

/** Published logical name of the database-scope routing plane. */
export const DEFAULT_ROUTING_SCHEMA = 'routing_public';

/** The routing-plane schema in effect: configured override or the published default. */
export const getRoutingSchema = (opts: {
  api?: { routingSchema?: string };
}): string =>
  opts.api?.routingSchema || DEFAULT_ROUTING_SCHEMA;

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
