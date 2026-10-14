import './types';

import {
  createDefaultRegistry,
  LoaderContext,
  LoaderRegistry
} from '@constructive-io/express-context';
import { parseUrl } from '@constructive-io/url-domains';
import { Logger } from '@pgpmjs/logger';
import { svcCache } from '@pgpmjs/server-utils';
import { NextFunction, Request, Response } from 'express';
import { Pool } from 'pg';
import { getPgPool } from 'pg-cache';

import errorPage50x from '../errors/50x';
import errorPage404Message from '../errors/404-message';
import { ApiConfigResult, ApiError, ApiOptions, ApiStructure, AuthSettings, DatabaseSettings, PubkeyChallengeSettings, RlsModule, WebauthnSettings } from '../types';
import { getRoutingSchema, isValidSchemaName, requireApiRole, resolveRoute, routeToApiStructure } from './routing';

const log = new Logger('api');

// =============================================================================
// Module Loader Registry (replaces inline SQL queries for per-db config)
// =============================================================================

const defaultRegistry: LoaderRegistry = createDefaultRegistry();

// =============================================================================
// SQL Queries (API resolution only — module queries now live in loaders)
// =============================================================================

// Private-header X-Api-Name lookup against the scoped routing plane.
// X-Api-Name is a trusted internal selector (only honored when the server
// runs with isPublic=false): it addresses a database's API surface by name.
// `is_published` governs cross-scope route visibility, not internal
// addressability, so it does not filter this lookup.
const scopedApiNameLookupSql = (routingSchema: string): string => `
  SELECT 
    a.id as api_id,
    a.database_id,
    a.dbname,
    a.role_name,
    a.anon_role,
    a.is_published as is_public,
    COALESCE(array_agg(s.schema_name) FILTER (WHERE s.schema_name IS NOT NULL), '{}') as schemas
  FROM "${routingSchema}".apis a
  LEFT JOIN "${routingSchema}".api_schemas aps ON a.id = aps.api_id
  LEFT JOIN metaschema_public.schema s ON aps.schema_id = s.id
  WHERE a.database_id = $1 
    AND a.name = $2
  GROUP BY a.id, a.database_id, a.dbname, a.role_name, a.anon_role, a.is_published
  LIMIT 1
`;

// =============================================================================
// Types (API resolution only — module types now in express-context)
// =============================================================================

interface ApiRow {
  api_id: string;
  database_id: string;
  dbname: string;
  role_name: string;
  anon_role: string;
  is_public: boolean;
  schemas: string[];
}

interface ResolveContext {
  opts: ApiOptions;
  pool: Pool;
  domain: string;
  subdomain: string | null;
  cacheKey: string;
  headers: RoutingHeaders;
  host: string;
}

type ResolutionMode = 
  | 'schemata-header'
  | 'api-name-header'
  | 'meta-schema-header'
  | 'scoped-route';

type PrivateHeaderMode = Exclude<ResolutionMode, 'scoped-route'>;

interface RoutingHeaders {
  schemata?: string;
  apiName?: string;
  metaSchema?: string;
  databaseId?: string;
}

// =============================================================================
// Module Resolution (via loader registry)
// =============================================================================

interface ResolvedModuleSettings {
  rlsModule?: RlsModule;
  authSettings?: AuthSettings;
  corsOrigins?: string[];
  databaseSettings?: DatabaseSettings;
  pubkeyChallengeSettings?: PubkeyChallengeSettings;
  webauthnSettings?: WebauthnSettings;
}

/**
 * Build a LoaderContext from the API row and options.
 * This is used to resolve per-database module settings via the loader registry.
 */
const buildLoaderContext = (
  routingPool: Pool,
  opts: ApiOptions,
  row: ApiRow
): LoaderContext => {
  // Scoped APIs leave dbname NULL when their schemas live in the serving
  // database (pooled tenants); fall back to the server's own database.
  const dbname = row.dbname || opts.pg?.database || '';
  return {
    routingPool,
    routingSchema: getRoutingSchema(opts),
    tenantPool: getPgPool({ ...opts.pg, database: dbname }),
    databaseId: row.database_id,
    apiId: row.api_id,
    dbname
  };
};

/**
 * Resolve all per-database module settings in parallel via the loader registry.
 * Each loader independently caches by databaseId — repeated calls are cheap.
 */
const resolveModuleSettings = async (
  registry: LoaderRegistry,
  ctx: LoaderContext
): Promise<ResolvedModuleSettings> => {
  const [
    rlsModule,
    authSettings,
    corsOrigins,
    databaseSettings,
    pubkeyChallengeSettings,
    webauthnSettings
  ] = await Promise.all([
    registry.resolve<RlsModule>('rlsModule', ctx),
    registry.resolve<AuthSettings>('authSettings', ctx),
    registry.resolve<string[]>('corsOrigins', ctx),
    registry.resolve<DatabaseSettings>('databaseSettings', ctx),
    registry.resolve<PubkeyChallengeSettings>('pubkeyChallengeSettings', ctx),
    registry.resolve<WebauthnSettings>('webauthnSettings', ctx)
  ]);

  return {
    rlsModule,
    authSettings,
    corsOrigins,
    databaseSettings,
    pubkeyChallengeSettings,
    webauthnSettings
  };
};

// =============================================================================
// Helpers
// =============================================================================

const isApiError = (result: ApiConfigResult): result is ApiError =>
  !!result && typeof (result as ApiError).errorHtml === 'string';

/**
 * Every resolved API surface must carry a database id — there is no default
 * database. A resolved structure without one is a misconfiguration; fail loud
 * rather than silently proceeding with an undefined tenant.
 */
const assertDatabaseId = (result: ApiStructure): void => {
  if (!result.databaseId) {
    const error = new Error(
      'No database id resolved for this request. A database id is required; there is no default database.'
    ) as Error & { code?: string };
    error.code = 'NO_DATABASE_ID';
    throw error;
  }
};

const parseCommaSeparatedHeader = (value: string): string[] =>
  value.split(',').map((s) => s.trim()).filter(Boolean);

const getPrivateHeaderMode = (headers: RoutingHeaders): PrivateHeaderMode | null => {
  if (headers.apiName) return 'api-name-header';
  if (headers.schemata) return 'schemata-header';
  if (headers.metaSchema) return 'meta-schema-header';
  return null;
};

const getRoutingHeaders = (req: Request): RoutingHeaders => ({
  schemata: req.get('X-Schemata'),
  apiName: req.get('X-Api-Name'),
  metaSchema: req.get('X-Meta-Schema'),
  databaseId: req.get('X-Database-Id')
});

const getUrlDomains = (req: Request): { domain: string; subdomains: string[] } => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const parsed = parseUrl(fullUrl);
  return {
    domain: parsed.domain ?? '',
    subdomains: parsed.subdomains ?? []
  };
};

export const getSubdomain = (subdomains: string[]): string | null => {
  const filtered = subdomains.filter((name) => name !== 'www');
  return filtered.length ? filtered.join('.') : null;
};

export const getSvcKey = (opts: ApiOptions, req: Request): string => {
  const { domain, subdomains } = getUrlDomains(req);
  const baseKey = subdomains.filter((n) => n !== 'www').concat(domain).join('.');

  if (opts.api?.isPublic === false) {
    const headers = getRoutingHeaders(req);
    const mode = getPrivateHeaderMode(headers);
    if (mode === 'api-name-header') {
      return `api:${headers.databaseId}:${headers.apiName}`;
    }
    if (mode === 'schemata-header') {
      return `schemata:${headers.databaseId}:${headers.schemata}`;
    }
    if (mode === 'meta-schema-header') {
      return `metaschema:api:${headers.databaseId}`;
    }
  }
  return baseKey;
};

const toApiStructure = (row: ApiRow, opts: ApiOptions, settings: ResolvedModuleSettings = {}): ApiStructure => ({
  apiId: row.api_id,
  dbname: row.dbname || opts.pg?.database || '',
  anonRole: requireApiRole('anon_role', row.anon_role, row.api_id),
  roleName: requireApiRole('role_name', row.role_name, row.api_id),
  schema: row.schemas || [],
  rlsModule: settings.rlsModule,
  domains: [],
  databaseId: row.database_id,
  isPublic: row.is_public,
  authSettings: settings.authSettings,
  corsOrigins: settings.corsOrigins,
  databaseSettings: settings.databaseSettings,
  pubkeyChallengeSettings: settings.pubkeyChallengeSettings,
  webauthnSettings: settings.webauthnSettings
});

const createAdminStructure = (
  opts: ApiOptions,
  schemas: string[],
  databaseId?: string
): ApiStructure => ({
  dbname: opts.pg?.database ?? '',
  anonRole: 'administrator',
  roleName: 'administrator',
  schema: schemas,
  domains: [],
  databaseId,
  isPublic: false
});

// =============================================================================
// Database Queries (API resolution only)
// =============================================================================

const validateSchemata = async (pool: Pool, schemas: string[]): Promise<string[]> => {
  const result = await pool.query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name = ANY($1::text[])`,
    [schemas]
  );
  return result.rows.map((row: { schema_name: string }) => row.schema_name);
};

const queryByApiName = async (
  pool: Pool,
  opts: ApiOptions,
  databaseId: string,
  name: string
): Promise<ApiRow | null> => {
  const routingSchema = getRoutingSchema(opts);
  if (!isValidSchemaName(routingSchema)) {
    log.warn(`[api-name-lookup] invalid routing schema name: ${routingSchema}`);
    return null;
  }
  const result = await pool.query<ApiRow>(scopedApiNameLookupSql(routingSchema), [databaseId, name]);
  return result.rows[0] ?? null;
};

// =============================================================================
// Resolution Logic
// =============================================================================

const determineMode = (ctx: ResolveContext): ResolutionMode => {
  const { opts, headers } = ctx;

  if (opts.api?.isPublic === false) {
    return getPrivateHeaderMode(headers) ?? 'scoped-route';
  }
  return 'scoped-route';
};

const resolveSchemataHeader = async (
  ctx: ResolveContext,
  validatedSchemas: string[]
): Promise<ApiConfigResult> => {
  const { opts, headers } = ctx;
  const headerSchemas = parseCommaSeparatedHeader(headers.schemata!);
  const validSet = new Set(validatedSchemas);
  const validHeaderSchemas = headerSchemas.filter((s) => validSet.has(s));

  if (validHeaderSchemas.length === 0) {
    return { errorHtml: 'No valid schemas found for the supplied X-Schemata header.' };
  }

  return createAdminStructure(opts, validHeaderSchemas, headers.databaseId);
};

const resolveApiNameHeader = async (ctx: ResolveContext): Promise<ApiStructure | null> => {
  const { opts, pool, headers } = ctx;
  if (!headers.databaseId) return null;

  const row = await queryByApiName(pool, opts, headers.databaseId, headers.apiName!);
  
  if (!row) {
    log.debug(`[api-name-lookup] No API found for databaseId=${headers.databaseId} name=${headers.apiName}`);
    return null;
  }

  const loaderCtx = buildLoaderContext(pool, opts, row);
  const settings = await resolveModuleSettings(defaultRegistry, loaderCtx);
  log.debug(`[api-name-lookup] resolved schemas: [${row.schemas?.join(', ')}], rlsModule: ${settings.rlsModule ? 'found' : 'none'}, authSettings: ${settings.authSettings ? 'found' : 'none'}`);
  return toApiStructure(row, opts, settings);
};

const resolveMetaSchemaHeader = (
  ctx: ResolveContext,
  validatedSchemas: string[]
): ApiStructure => {
  return createAdminStructure(ctx.opts, validatedSchemas, ctx.headers.databaseId);
};

/**
 * Scoped routing plane resolution (host-only): one indexed resolve_route()
 * call against the compiled hostname/route bindings. Path/method routing
 * belongs to Traefik/Ingress — the server only maps host → tenant/api/db/role.
 * This is the sole host resolver. Returns null (→ 404) when disabled,
 * unmatched, the resolver is not installed, or the target is not an api
 * surface. There is no legacy fallback.
 */
const resolveScopedRoute = async (ctx: ResolveContext): Promise<ApiStructure | null> => {
  const { opts, pool, host } = ctx;

  const schema = getRoutingSchema(opts);
  const route = await resolveRoute(pool, schema, host);
  if (!route) return null;

  const structure = routeToApiStructure(route, opts);
  if (!structure) return null;

  log.debug(`[scoped-routing] resolved host=${host} → api=${structure.apiId} db=${structure.dbname}`);

  if (!structure.databaseId || !structure.apiId) return structure;

  const loaderCtx = buildLoaderContext(pool, opts, {
    api_id: structure.apiId,
    database_id: structure.databaseId,
    dbname: structure.dbname,
    role_name: structure.roleName,
    anon_role: structure.anonRole,
    is_public: structure.isPublic ?? false,
    schemas: structure.schema
  });
  const settings = await resolveModuleSettings(defaultRegistry, loaderCtx);
  return {
    ...structure,
    rlsModule: settings.rlsModule,
    authSettings: settings.authSettings,
    corsOrigins: settings.corsOrigins,
    databaseSettings: settings.databaseSettings,
    pubkeyChallengeSettings: settings.pubkeyChallengeSettings,
    webauthnSettings: settings.webauthnSettings
  };
};

// =============================================================================
// Main Resolution Function
// =============================================================================

export const getApiConfig = async (
  opts: ApiOptions,
  req: Request
): Promise<ApiConfigResult> => {
  const pool = getPgPool(opts.pg);
  const { domain, subdomains } = getUrlDomains(req);
  const subdomain = getSubdomain(subdomains);
  const cacheKey = getSvcKey(opts, req);

  req.svc_key = cacheKey;

  // Check cache first
  if (svcCache.has(cacheKey)) {
    log.debug(`Cache HIT for key=${cacheKey}`);
    return svcCache.get(cacheKey) as ApiStructure;
  }

  log.debug(`Cache MISS for key=${cacheKey}, resolving API`);

  const ctx: ResolveContext = {
    opts,
    pool,
    domain,
    subdomain,
    cacheKey,
    headers: getRoutingHeaders(req),
    host: req.get('host') || ''
  };

  // Validate schemas upfront for modes that need them
  const apiOpts = opts.api || {};
  const headerSchemas = ctx.headers.schemata ? parseCommaSeparatedHeader(ctx.headers.schemata) : [];
  const candidateSchemas =
    apiOpts.isPublic === false && headerSchemas.length
      ? [...new Set([...(apiOpts.metaSchemas || []), ...headerSchemas])]
      : apiOpts.metaSchemas || [];
  
  const validatedSchemas = await validateSchemata(pool, candidateSchemas);

  if (validatedSchemas.length === 0) {
    const source = headerSchemas.length ? headerSchemas : apiOpts.metaSchemas || [];
    const label = headerSchemas.length ? 'X-Schemata' : 'metaSchemas';
    const error = new Error(`No valid schemas found. Configured ${label}: [${source.join(', ')}]`) as Error & { code?: string };
    error.code = 'NO_VALID_SCHEMAS';
    throw error;
  }

  // Route to appropriate resolver based on mode
  const mode = determineMode(ctx);
  let result: ApiConfigResult;

  switch (mode) {
  case 'schemata-header':
    result = await resolveSchemataHeader(ctx, validatedSchemas);
    break;

  case 'api-name-header':
    result = await resolveApiNameHeader(ctx);
    break;

  case 'meta-schema-header':
    result = resolveMetaSchemaHeader(ctx, validatedSchemas);
    break;

  case 'scoped-route':
    result = await resolveScopedRoute(ctx);
    break;
  }

  // Cache successful results
  if (result && !isApiError(result)) {
    assertDatabaseId(result);
    svcCache.set(cacheKey, result);
  }

  return result;
};

// =============================================================================
// Express Middleware
// =============================================================================

export const createApiMiddleware = (opts: ApiOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    log.debug(`[api-middleware] ${req.method} ${req.path}`);

    try {
      const apiConfig = await getApiConfig(opts, req);

      if (isApiError(apiConfig)) {
        res.status(404).send(errorPage404Message('API not found', apiConfig.errorHtml));
        return;
      }

      if (!apiConfig) {
        res.status(404).send(errorPage404Message('API service not found for the given domain/subdomain.'));
        return;
      }

      req.api = apiConfig;
      req.databaseId = apiConfig.databaseId;
      log.debug(`Resolved API: db=${apiConfig.dbname}, schemas=[${apiConfig.schema?.join(', ')}]`);
      next();
    } catch (error: unknown) {
      const err = error as Error & { code?: string };

      if (err.code === 'NO_VALID_SCHEMAS') {
        res.status(404).send(errorPage404Message(err.message));
        return;
      }

      if (err.code === 'MISSING_API_ROLE') {
        log.error('[api-middleware] resolved API row has no served role:', err.message);
        res.status(500).send(errorPage50x);
        return;
      }

      if (err.code === 'NO_DATABASE_ID') {
        log.error('[api-middleware] no database id resolved:', err.message);
        res.status(500).send(errorPage50x);
        return;
      }

      if (err.message?.includes('does not exist')) {
        res.status(404).send(errorPage404Message("The resource you're looking for does not exist."));
        return;
      }

      log.error('API middleware error:', err);
      res.status(500).send(errorPage50x);
    }
  };
};
