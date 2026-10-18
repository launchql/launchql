/**
 * Configuration options for the Realtime Subscriptions Plugin.
 */
export interface RealtimeSubscriptionsPluginOptions {
  /**
   * Maximum number of events per table per second before switching to
   * overflow (INVALIDATE) mode. When exceeded, the subscription sends
   * a single { event: 'INVALIDATE', overflow: true } instead of
   * individual row events, signaling the client to refetch.
   *
   * Default: 50
   */
  overflowThreshold?: number;

  /**
   * Receives the exact physical PostgreSQL notification topics compiled into
   * this schema. The callback runs during schema construction, including with
   * an empty list when no @realtime table was discovered.
   *
   * This is a build-time integration seam. It must not retain Graphile build
   * objects or database resources; descriptors contain strings only.
   */
  onTopicsDiscovered?: (
    topics: readonly RealtimeTopicDescriptor[]
  ) => void;
}

/** Credential-free description of one compiled @realtime channel. */
export interface RealtimeTopicDescriptor {
  readonly topic: string;
  readonly schema: string;
  readonly table: string;
}

/**
 * A minimal query-capable interface — satisfied by pg.Pool, pg.Client,
 * pg.PoolClient, or any object with a compatible `query` method.
 *
 * CursorTracker and RealtimeManager use only one-shot queries, so
 * `pool.query()` (which internally borrows a client, runs the query,
 * and releases the client) is all that's needed — no callback wrapper.
 */
export interface Queryable {
  query<R = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: R[] }>;
}

/** Explicit local delivery capability used by cursor catch-up. */
export interface RealtimePublisher {
  /** Optional batch preflight used to keep routing violations fail-closed. */
  assertTopics?(topics: readonly string[]): void;
  publish(topic: string, payload: string): void;
}

/**
 * A single entry from drain_changes(), representing a change_log row
 * matched against subscriber tables.
 */
export interface ChangeLogEntry {
  id: string;
  occurred_at: string;
  source_schema: string;
  source_table: string;
  operation: string;
  payload_after: Record<string, unknown> | null;
  payload_before: Record<string, unknown> | null;
  payload_diff: Record<string, unknown> | null;
  subscriber_ids: string[];
}

/**
 * Configuration for the CursorTracker background poller.
 */
export interface CursorTrackerOptions {
  /**
   * Unique identifier for this listener node.
   * Should be stable across restarts if you want cursor continuity.
   * If not provided, a random ID is generated (ephemeral mode).
   */
  nodeId?: string;

  /**
   * The realtime_public schema name where drain_changes(),
   * touch_listener(), and cleanup_ephemeral() live.
   *
   * Default: 'realtime_public'
   */
  schema?: string;

  /**
   * How often to poll drain_changes() for new events (milliseconds).
   *
   * Default: 5000 (5 seconds)
   */
  pollIntervalMs?: number;

  /**
   * How often to send a heartbeat via touch_listener() (milliseconds).
   *
   * Default: 30000 (30 seconds)
   */
  heartbeatIntervalMs?: number;

  /**
   * Maximum number of change_log rows to fetch per drain_changes() call.
   *
   * Default: 500
   */
  batchLimit?: number;

  /**
   * A query-capable object (typically a pg.Pool from pg-cache) used to
   * run drain_changes(), touch_listener(), and cleanup_ephemeral() queries.
   * pool.query() internally borrows a connection and releases it after
   * each call — no manual connection management needed.
   */
  pool: Queryable;

  /**
   * Called when drain_changes() returns new change_log entries.
   * The entries include subscriber_ids for fan-out routing.
   */
  onChanges?: (entries: ChangeLogEntry[]) => void;

  /**
   * Called when an error occurs during polling, heartbeat, or cleanup.
   * If not provided, errors are logged to the console.
   */
  onError?: (error: Error) => void;
}

/**
 * Configuration for the RealtimeManager, which bridges CursorTracker
 * events into PostGraphile's PgSubscriber for at-least-once delivery.
 */
export interface RealtimeManagerOptions {
  /**
   * Generation-local publisher used for cursor catch-up delivery. New callers
   * should always provide this capability explicitly.
   */
  publisher?: RealtimePublisher;

  /**
   * Transitional compatibility input for the current @dataplan/pg
   * PgSubscriber. Its private emitter is adapted outside RealtimeManager.
   * @deprecated Provide publisher instead.
   */
  pgSubscriber?: unknown;

  /**
   * Exact physical schemas this Graphile instance exposes. Cursor rows naming
   * any other source schema stop delivery and surface an error before any row
   * in that batch is emitted. Required for the explicit publisher path.
   *
   * The field remains optional only for the deprecated pgSubscriber adapter,
   * whose callers predate generation-scoped routing.
   */
  allowedSourceSchemas?: readonly string[];

  /**
   * Called once when delivery can no longer be trusted, after new dispatch is
   * disabled and manager shutdown has begun. Callers should synchronously
   * remove the owning Graphile generation from service.
   */
  onFatalError?: (error: Error) => void;

  /**
   * A query-capable object (typically a pg.Pool from pg-cache) used by
   * the underlying CursorTracker for drain_changes() polling.
   */
  pool: Queryable;

  /**
   * Unique identifier for this listener node.
   * Should be stable across restarts if you want cursor continuity.
   * If not provided, a random ID is generated (ephemeral mode).
   */
  nodeId?: string;

  /**
   * The realtime_public schema name where drain_changes(),
   * touch_listener(), and cleanup_ephemeral() live.
   *
   * Default: 'realtime_public'
   */
  schema?: string;

  /**
   * How often to poll drain_changes() for new events (milliseconds).
   *
   * Default: 5000 (5 seconds)
   */
  pollIntervalMs?: number;

  /**
   * How often to send a heartbeat via touch_listener() (milliseconds).
   *
   * Default: 30000 (30 seconds)
   */
  heartbeatIntervalMs?: number;

  /**
   * Maximum number of change_log rows to fetch per drain_changes() call.
   *
   * Default: 500
   */
  batchLimit?: number;

  /**
   * Observes polling, heartbeat, or cleanup errors. A polling or heartbeat
   * error after startup is independently treated as fatal and delivered to
   * onFatalError because cursor recovery can no longer be guaranteed.
   * If omitted, the error is logged via @pgpmjs/logger.
   */
  onError?: (error: Error) => void;
}
