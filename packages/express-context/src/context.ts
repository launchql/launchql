/**
 * context — Builds `req.constructive` from resolved API + auth token
 *
 * This middleware runs AFTER the API resolver and auth middleware have
 * populated `req.api` and `req.token`. It composes:
 *
 *   - pgSettings (role, claims, request_id, database_id)
 *   - Tenant database pool (via pg-cache)
 *   - withPgClient (transaction-scoped RLS helper)
 *   - Convenience fields (userId, databaseId, requestId)
 *   - useModule (lazy, on-demand per-database module resolution)
 *
 * The result is a single `req.constructive` object that any downstream
 * route handler can use for tenant-scoped database operations.
 */

import type { PgpmOptions } from '@pgpmjs/types';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Pool } from 'pg';
import { getPgPool } from 'pg-cache';

import type { BillingClient } from './billing-client';
import { createBillingClient } from './billing-client';
import type { LoaderRegistry } from './loaders/registry';
import type { LoaderContext } from './loaders/types';
import { withPgClient as withPgClientFn } from './pg-client';
import { buildPgSettings } from './pg-settings';
import type { BillingConfig, BuiltinModuleMap, ConstructiveContext, InferenceLogConfig, LlmConfig } from './types';

export interface ContextMiddlewareOptions {
  /** Base PG options for pool creation (host, port, user, password) */
  pg?: PgpmOptions['pg'];
  /** Module loader registry for per-database cached lookups */
  loaders?: LoaderRegistry;
  /** Routing-plane schema loaders query (defaults to routing_public) */
  routingSchema?: string;
}

/**
 * Create a `useModule` function bound to the given loader context.
 *
 * Calling `useModule('rlsModule')` lazily resolves the RLS loader,
 * hitting the DB only on cache miss. The function is a no-op (returns
 * undefined) when no registry is configured.
 */
function createUseModule(
  registry: LoaderRegistry | undefined,
  loaderCtx: LoaderContext | null
): ConstructiveContext['useModule'] {
  return (async <K extends keyof BuiltinModuleMap>(name: K | string) => {
    if (!registry || !loaderCtx) return undefined;
    return registry.resolve(name as string, loaderCtx);
  }) as ConstructiveContext['useModule'];
}

/**
 * Build the ConstructiveContext from the current request state.
 *
 * Requires `req.api` and `req.requestId` to be set by upstream middleware.
 * `req.token` is optional (anonymous requests get null).
 *
 * Module loaders are NOT resolved eagerly. Instead, `ctx.useModule(name)`
 * resolves them on demand — only the modules that middleware actually
 * needs will fire SQL queries.
 */
export function buildContext(
  req: Request,
  opts: ContextMiddlewareOptions = {}
): ConstructiveContext | null {
  const api = req.api;
  if (!api) return null;

  const token = req.token ?? null;
  const requestId = req.requestId || '';

  const pgSettings = buildPgSettings({
    api,
    token,
    requestId,
    clientIp: req.clientIp
  });

  const tenantPool: Pool = getPgPool({
    ...opts.pg,
    database: api.dbname
  });

  // Build loader context (if registry provided and databaseId known)
  let loaderCtx: LoaderContext | null = null;
  if (opts.loaders && api.databaseId) {
    const routingPool: Pool = getPgPool(opts.pg);
    loaderCtx = {
      routingPool,
      routingSchema: opts.routingSchema,
      tenantPool,
      databaseId: api.databaseId,
      apiId: api.apiId,
      dbname: api.dbname
    };
  }

  const withPgClient = <T>(fn: (client: any) => Promise<T>) =>
    withPgClientFn(tenantPool, pgSettings, fn);
  const useModule = createUseModule(opts.loaders, loaderCtx);

  // Lazy-initialized billing client (cached per request)
  let billingClient: BillingClient | null | undefined;
  // Lazy-initialized LLM config (cached per request)
  let llmConfig: LlmConfig | null | undefined;

  return {
    api,
    token,
    pgSettings,
    databaseId: api.databaseId ?? null,
    userId: token?.user_id ?? null,
    requestId,
    pool: tenantPool,
    withPgClient,
    useModule,
    async useBilling() {
      if (billingClient !== undefined) return billingClient;

      const entityId = token?.entity_id as string | undefined;
      if (!entityId) {
        billingClient = null;
        return null;
      }

      const [billing, inferenceLog] = await Promise.all([
        useModule('billing') as Promise<BillingConfig | undefined>,
        useModule('inferenceLog') as Promise<InferenceLogConfig | undefined>
      ]);

      if (!billing) {
        billingClient = null;
        return null;
      }

      billingClient = createBillingClient(
        withPgClient,
        entityId,
        billing,
        inferenceLog ?? null
      );
      return billingClient;
    },
    async useLlm() {
      if (llmConfig !== undefined) return llmConfig;
      const resolved = await useModule('llm') as LlmConfig | undefined;
      llmConfig = resolved ?? null;
      return llmConfig;
    }
  };
}

/**
 * Express middleware that builds `req.constructive` from the resolved
 * API config and auth token.
 *
 * Mount AFTER the API resolver and auth middleware:
 *
 * ```typescript
 * import { createContextMiddleware, createDefaultRegistry } from '@constructive-io/express-context';
 *
 * const loaders = createDefaultRegistry();
 *
 * app.use(apiMiddleware);       // sets req.api
 * app.use(authMiddleware);      // sets req.token
 * app.use(createContextMiddleware({ loaders }));
 *
 * // Downstream middleware/routes call useModule on demand:
 * app.post('/v1/chat', async (req, res) => {
 *   const ctx = req.constructive;
 *   const rls = await ctx.useModule('rlsModule');       // only fires if not cached
 *   const auth = await ctx.useModule('authSettings');    // only fires if not cached
 *   // webauthnSettings loader never fires if nobody asks for it
 * });
 * ```
 */
export function createContextMiddleware(
  opts: ContextMiddlewareOptions = {}
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const ctx = buildContext(req, opts);
    if (ctx) {
      req.constructive = ctx;
    }
    next();
  };
}
