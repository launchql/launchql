/**
 * RealtimeManager — bridges CursorTracker (polling drain_changes) into
 * a generation-local publisher so cursor-tracked events flow through the same
 * subscription plans as NOTIFY events.
 *
 * Architecture:
 *   RealtimeManager converts ChangeLogEntry objects from drain_changes() into
 *   the same NOTIFY payload format ("OP:rowId1,rowId2,...") and publishes them
 *   through an explicit capability. The generation-scoped subscriber keeps
 *   these cursor events local even when PostgreSQL LISTEN is shared.
 *
 *   This provides at-least-once delivery: NOTIFY is instant but best-effort;
 *   cursor polling catches up on anything missed (disconnects, restarts).
 *   Duplicates are expected and acceptable — clients should be idempotent.
 *
 * Lifecycle:
 *   1. start() → registers listener node, begins polling + heartbeat
 *   2. drain_changes() results are converted and sent to the local publisher
 *   3. stop() → cleans up ephemeral subscriptions, removes listener node
 */

import { Logger } from '@pgpmjs/logger';

import { CursorTracker } from './cursor-tracker';
import { createPgSubscriberPublisher } from './generation-subscriber';
import type {
  ChangeLogEntry,
  RealtimeManagerOptions,
  RealtimePublisher,
} from './types';

const log = new Logger('realtime-manager');

type RealtimeManagerState = 'stopped' | 'starting' | 'running' | 'stopping';

export class RealtimeManagerStartAbortedError extends Error {
  readonly code = 'REALTIME_MANAGER_START_ABORTED';

  constructor() {
    super('RealtimeManager was stopped before startup completed');
    this.name = 'RealtimeManagerStartAbortedError';
  }
}

export class RealtimeSubscriberUnavailableError extends Error {
  readonly code = 'REALTIME_SUBSCRIBER_UNAVAILABLE';

  constructor() {
    super('RealtimeManager requires a usable local publisher');
    this.name = 'RealtimeSubscriberUnavailableError';
  }
}

export class RealtimeSourceSchemaViolationError extends Error {
  readonly code = 'REALTIME_SOURCE_SCHEMA_VIOLATION';

  constructor(
    readonly sourceSchema: unknown,
    readonly allowedSourceSchemas: readonly string[]
  ) {
    super(
      `Realtime cursor returned source schema ${JSON.stringify(sourceSchema)} `
      + `outside the allowed Graphile schemas: ${allowedSourceSchemas.join(', ')}`
    );
    this.name = 'RealtimeSourceSchemaViolationError';
  }
}

export class RealtimeSourceSchemaConfigurationError extends Error {
  readonly code = 'REALTIME_SOURCE_SCHEMAS_REQUIRED';

  constructor() {
    super('RealtimeManager requires at least one exact allowed source schema');
    this.name = 'RealtimeSourceSchemaConfigurationError';
  }
}

/**
 * Extract row IDs from a ChangeLogEntry.
 *
 * For INSERT/UPDATE the row ID lives in payload_after.id;
 * for DELETE it lives in payload_before.id.
 * Falls back to the change_log entry's own id if payloads are missing.
 */
function extractRowId(entry: ChangeLogEntry): string | null {
  if (entry.operation === 'DELETE') {
    return (entry.payload_before?.id as string) ?? null;
  }
  return (entry.payload_after?.id as string) ?? null;
}

/**
 * Convert a ChangeLogEntry into the NOTIFY payload format used by emit_change.
 * Format: "OPERATION:rowId" (e.g. "INSERT:550e8400-...")
 */
function entryToNotifyPayload(entry: ChangeLogEntry): string {
  const rowId = extractRowId(entry);
  if (!rowId) {
    return entry.operation;
  }
  return `${entry.operation}:${rowId}`;
}

/**
 * Build the NOTIFY channel name for a change_log entry.
 * Matches the channel format used by emit_change: "realtime:{schema}.{table}"
 */
function entryToChannel(entry: ChangeLogEntry): string {
  return `realtime:${entry.source_schema}.${entry.source_table}`;
}

export class RealtimeManager {
  private readonly cursorTracker: CursorTracker;
  private readonly publisher: RealtimePublisher | null;
  private readonly allowedSourceSchemas: ReadonlySet<string>;
  private readonly allowedSourceSchemaList: readonly string[];
  private readonly requiresSourceSchemaAllowlist: boolean;
  private readonly sourceSchemaConfigurationValid: boolean;
  private readonly onFatalError?: (error: Error) => void;
  private state: RealtimeManagerState = 'stopped';
  private generation = 0;
  private dispatchEnabled = false;
  private fatalError: Error | null = null;
  private startPromise: Promise<void> | null = null;
  private stopPromise: Promise<void> | null = null;

  constructor(options: RealtimeManagerOptions) {
    const {
      publisher,
      pgSubscriber,
      pool,
      allowedSourceSchemas,
      onFatalError,
      ...cursorOpts
    } = options;
    this.publisher = publisher ?? createPgSubscriberPublisher(pgSubscriber);
    this.onFatalError = onFatalError;
    this.requiresSourceSchemaAllowlist = publisher !== undefined
      || allowedSourceSchemas !== undefined;
    this.sourceSchemaConfigurationValid = !this.requiresSourceSchemaAllowlist
      || (
        Array.isArray(allowedSourceSchemas)
        && allowedSourceSchemas.every(
          (schema) => typeof schema === 'string' && schema.length > 0
        )
      );
    this.allowedSourceSchemaList = Object.freeze([
      ...new Set(allowedSourceSchemas ?? [])
    ]);
    this.allowedSourceSchemas = new Set(this.allowedSourceSchemaList);

    this.cursorTracker = new CursorTracker({
      nodeId: cursorOpts.nodeId,
      schema: cursorOpts.schema,
      pollIntervalMs: cursorOpts.pollIntervalMs,
      heartbeatIntervalMs: cursorOpts.heartbeatIntervalMs,
      batchLimit: cursorOpts.batchLimit,
      pool,
      onChanges: (entries) => this.dispatchEntries(entries),
      onError: (error) => {
        // Once readiness has completed, losing either cursor polling or the
        // listener heartbeat means at-least-once delivery can no longer be
        // claimed. Disable dispatch and begin shutdown before invoking the
        // observational callback so a callback cannot leave a stale
        // generation serving traffic by throwing or stopping it itself.
        if (this.state === 'running') this.failDelivery(error);

        try {
          if (cursorOpts.onError) {
            cursorOpts.onError(error);
          } else {
            log.error(`RealtimeManager error: ${error.message}`);
          }
        } catch (callbackError) {
          log.error(
            `RealtimeManager error callback failed: ${String(callbackError)}`
          );
        }
      },
    });
  }

  get nodeId(): string {
    return this.cursorTracker.nodeId;
  }

  get isRunning(): boolean {
    return this.state === 'running' && this.cursorTracker.isRunning;
  }

  start(): Promise<void> {
    if (this.state === 'running') return Promise.resolve();
    if (this.state === 'starting') return this.startPromise!;
    if (this.state === 'stopping') {
      return (this.stopPromise ?? Promise.resolve()).then(() => this.start());
    }

    const generation = ++this.generation;
    this.state = 'starting';
    this.dispatchEnabled = true;
    log.info(`Starting RealtimeManager: node=${this.nodeId}`);
    const pending = this.startInternal(generation);
    this.startPromise = pending;
    void pending.then(
      () => {
        if (this.startPromise === pending) this.startPromise = null;
      },
      () => {
        if (this.startPromise === pending) this.startPromise = null;
      }
    );
    return pending;
  }

  private async startInternal(generation: number): Promise<void> {
    try {
      if (
        this.requiresSourceSchemaAllowlist
        && (
          !this.sourceSchemaConfigurationValid
          || this.allowedSourceSchemas.size === 0
        )
      ) {
        throw new RealtimeSourceSchemaConfigurationError();
      }
      if (!this.publisher || typeof this.publisher.publish !== 'function') {
        throw new RealtimeSubscriberUnavailableError();
      }
      await this.cursorTracker.start();
      if (this.state !== 'starting' || this.generation !== generation) {
        throw new RealtimeManagerStartAbortedError();
      }
      this.state = 'running';
    } catch (error) {
      this.dispatchEnabled = false;
      if (this.state === 'starting') this.state = 'stopped';
      throw error;
    }
  }

  stop(): Promise<void> {
    if (this.state === 'stopping') return this.stopPromise!;

    const startInFlight = this.startPromise;
    ++this.generation;
    this.state = 'stopping';
    this.dispatchEnabled = false;
    log.info(`Stopping RealtimeManager: node=${this.nodeId}`);
    // Even a stopped manager may retain a registration after failed cleanup.
    // The tracker owns that state and makes successful repeated stops a no-op.
    // Start the tracker shutdown synchronously so an in-flight drain is
    // invalidated before it can dispatch after this method is called.
    const trackerStop = this.cursorTracker.stop();
    const pending = this.stopInternal(startInFlight, trackerStop);
    this.stopPromise = pending;
    void pending.then(
      () => {
        if (this.stopPromise === pending) this.stopPromise = null;
      },
      () => {
        if (this.stopPromise === pending) this.stopPromise = null;
      }
    );
    return pending;
  }

  private async stopInternal(
    startInFlight: Promise<void> | null,
    trackerStop: Promise<void>
  ): Promise<void> {
    try {
      if (startInFlight) await Promise.allSettled([startInFlight]);
      await trackerStop;
    } finally {
      this.state = 'stopped';
      this.dispatchEnabled = false;
    }
  }

  /**
   * Convert ChangeLogEntry objects to NOTIFY-format payloads and publish them
   * through the exact generation's explicit local capability.
   */
  private dispatchEntries(entries: ChangeLogEntry[]): void {
    if (!this.dispatchEnabled) return;

    const publisher = this.publisher;
    if (!publisher) {
      const error = new RealtimeSubscriberUnavailableError();
      this.failDelivery(error);
      throw error;
    }

    // Validate the complete batch before emitting the first event. This keeps
    // a mixed valid/foreign batch atomic from the tenant-isolation boundary's
    // perspective: no event is delivered when routing is inconclusive.
    const foreignEntry = this.requiresSourceSchemaAllowlist
      ? entries.find(
        (entry) => !this.allowedSourceSchemas.has(entry.source_schema)
      )
      : undefined;
    if (foreignEntry) {
      const error = new RealtimeSourceSchemaViolationError(
        foreignEntry.source_schema,
        this.allowedSourceSchemaList
      );
      this.failDelivery(error);
      throw error;
    }

    const notifications = entries.map((entry) => ({
      channel: entryToChannel(entry),
      payload: entryToNotifyPayload(entry)
    }));
    try {
      publisher.assertTopics?.(notifications.map(({ channel }) => channel));
      for (const { channel, payload } of notifications) {
        publisher.publish(channel, payload);
      }
    } catch (reason) {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.failDelivery(error);
      throw error;
    }

    log.info(`Dispatched ${entries.length} cursor-tracked event(s)`);
  }

  private failDelivery(error: Error): void {
    this.dispatchEnabled = false;
    const stopping = this.stop();
    if (!this.fatalError) {
      this.fatalError = error;
      try {
        this.onFatalError?.(error);
      } catch (callbackError) {
        log.error(
          `RealtimeManager fatal-error callback failed: ${String(callbackError)}`
        );
      }
    }
    void stopping.catch((stopError) => {
      log.error(
        `RealtimeManager failed to stop after a delivery violation: ${String(stopError)}`
      );
    });
  }
}

export { entryToChannel, entryToNotifyPayload, extractRowId };
