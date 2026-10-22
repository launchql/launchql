/**
 * @constructive-io/express-context
 *
 * Extractable Express middleware for Constructive tenant context.
 *
 * Provides:
 *   - Shared types (ApiStructure, RlsModule, AuthSettings, etc.)
 *   - pgSettings builder (role, JWT claims, request_id, database_id)
 *   - withPgClient (tenant-scoped RLS transaction helper)
 *   - requestId middleware (UUID correlation ID)
 *   - Context middleware (composes all of the above into req.constructive)
 *   - Module loaders (pluggable per-database cached lookups)
 *
 * @example
 * ```typescript
 * import {
 *   createContextMiddleware,
 *   requestIdMiddleware,
 *   createDefaultRegistry,
 * } from '@constructive-io/express-context';
 *
 * const loaders = createDefaultRegistry();
 *
 * app.use(requestIdMiddleware());
 * app.use(apiMiddleware);        // sets req.api (your domain resolver)
 * app.use(authMiddleware);       // sets req.token (your JWT verifier)
 * app.use(createContextMiddleware({ loaders })); // builds req.constructive
 *
 * app.post('/v1/chat', async (req, res) => {
 *   const ctx = req.constructive;
 *   const rls = await ctx.useModule('rlsModule');       // only fires if not cached
 *   const auth = await ctx.useModule('authSettings');    // only fires if not cached
 *   // webauthnSettings loader never fires if nobody asks for it
 * });
 * ```
 */

// Types
export type {
  AgentChatConfig,
  ApiConfigResult,
  ApiError,
  ApiStructure,
  AuthSettings,
  AuthSurface,
  BillingConfig,
  BuiltinModuleMap,
  ComputeConfig,
  ComputeModuleConfig,
  ConstructiveAPIToken,
  ConstructiveContext,
  DatabaseSettings,
  DatabaseStanding,
  EventsConfig,
  IdentityProviderConfig,
  IdentityProvidersModule,
  InferenceLogConfig,
  LlmConfig,
  PubkeyChallengeSettings,
  RlsModule,
  WebauthnSettings,
  WithPgClient,
} from './types';

// Billing client
export type { BillingClient, InferenceLogEntry } from './billing-client';
export { createBillingClient } from './billing-client';

// pgSettings builder
export type { PgSettingsInput } from './pg-settings';
export { buildPgSettings } from './pg-settings';

// withPgClient helper
export { withPgClient } from './pg-client';

// Request protection (platform bounds + resolver)
export type {
  NumericProtectionKey,
  ProtectionBound,
  RequestProtection,
  RequestProtectionInput,
} from './request-protection';
export {
  ASSUMED_PAGE_SIZE,
  DEFAULT_REQUEST_PROTECTION,
  INTROSPECTION_BOUND,
  PROTECTION_BOUNDS,
  protectionPgSettings,
  resolveRequestProtection,
} from './request-protection';

// Admission control (in-process concurrency + per-caller rate)
export type { AdmissionLease, AdmissionRefusal, AdmissionRequest } from './admission';
export { clientIpFrom, ConcurrencyLimiter, RateWindow } from './admission';

// Client address (resolved once per request from the trusted proxy hops)
export { clientIpMiddleware, clientIpOf } from './client-ip';

// Shared in-memory counter + batch flush (refusal observability, page/request metering)
export type {
  RecordRefusalsSinkOptions,
  Refusal,
  RefusalKey,
  RefusalLane,
  RefusalReason,
  RefusalRecorderOptions,
  RefusalRecorderStats,
  RefusalRow,
  RefusalSink
} from './refusals';
export {
  createRecordRefusalsSink,
  DEFAULT_REFUSAL_FLUSH_INTERVAL_MS,
  DEFAULT_REFUSAL_FLUSH_JITTER_MS,
  DEFAULT_REFUSAL_MAX_KEYS,
  OVERFLOW_ROUTE,
  OVERFLOW_SOURCE,
  REFUSAL_REASONS,
  refusalKeyOf,
  refusalOverflowKey,
  RefusalRecorder,
  refusalRows,
  sourceBucket,
  UNKNOWN_SOURCE
} from './refusals';
export type {
  BoundedCounterOptions,
  CounterEntry,
  CounterFlusherOptions,
  CounterFlusherStats,
  CounterSink
} from './usage-counter';
export { BoundedCounter, CounterFlusher } from './usage-counter';

// Request ID middleware
export { requestIdMiddleware } from './request-id';

// Context middleware
export type { ContextMiddlewareOptions } from './context';
export { buildContext, createContextMiddleware } from './context';

// Module loaders
export type {
  CreateLoaderOptions,
  LoaderContext,
  LoaderRegistry,
  ModuleLoader,
} from './loaders';
export {
  agentChatLoader,
  authSettingsLoader,
  authSurfaceLoader,
  billingLoader,
  computeLoader,
  corsLoader,
  createDefaultRegistry,
  createLoaderRegistry,
  createModuleLoader,
  DATABASE_STANDING_SQL,
  DATABASE_STANDING_TTL_MS,
  databaseSettingsLoader,
  eventsLoader,
  identityProvidersLoader,
  inferenceLogLoader,
  llmLoader,
  pubkeyLoader,
  requestProtectionLoader,
  requireDatabaseId,
  requireIdentityProvider,
  rlsLoader,
  standingLoader,
  webauthnLoader,
} from './loaders';

// Side-effect: Express type augmentation
import './types';
