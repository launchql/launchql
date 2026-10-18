/**
 * CursorTracker — manages the listener_node lifecycle and periodic
 * drain_changes() polling for at-least-once event delivery.
 *
 * Lifecycle:
 *   1. start() → calls touch_listener() to register/heartbeat the node
 *   2. Periodically polls drain_changes() for new change_log entries
 *   3. Periodically heartbeats via touch_listener()
 *   4. stop() → calls cleanup_ephemeral() to remove ephemeral subscriptions
 *              and delete the listener_node row
 *
 * The caller provides a Queryable (typically a pg.Pool from pg-cache)
 * and this class calls pool.query() directly for each operation.
 */

import { Logger } from '@pgpmjs/logger';
import { QuoteUtils } from '@pgsql/quotes';
import { randomUUID } from 'crypto';

import type {
  ChangeLogEntry,
  CursorTrackerOptions,
  Queryable,
} from './types';

const log = new Logger('cursor-tracker');

const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_HEARTBEAT_INTERVAL_MS = 30000;
const DEFAULT_BATCH_LIMIT = 500;
const DEFAULT_SCHEMA = 'realtime_public';

type CursorTrackerState = 'stopped' | 'starting' | 'running' | 'stopping';

export class CursorTrackerStartAbortedError extends Error {
  readonly code = 'CURSOR_TRACKER_START_ABORTED';

  constructor() {
    super('CursorTracker was stopped before startup completed');
    this.name = 'CursorTrackerStartAbortedError';
  }
}

export class CursorTracker {
  readonly nodeId: string;

  private readonly schema: string;
  private readonly pollIntervalMs: number;
  private readonly heartbeatIntervalMs: number;
  private readonly batchLimit: number;
  private readonly pool: Queryable;
  private readonly onChanges: (entries: ChangeLogEntry[]) => void;
  private readonly onError: (error: Error) => void;

  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private state: CursorTrackerState = 'stopped';
  private generation = 0;
  private registered = false;
  private startPromise: Promise<void> | null = null;
  private stopPromise: Promise<void> | null = null;
  private activeDrain: Promise<ChangeLogEntry[]> | null = null;
  private activeHeartbeat: Promise<void> | null = null;

  constructor(options: CursorTrackerOptions) {
    this.nodeId = options.nodeId ?? randomUUID();
    this.schema = options.schema ?? DEFAULT_SCHEMA;
    this.pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS;
    this.batchLimit = options.batchLimit ?? DEFAULT_BATCH_LIMIT;
    this.pool = options.pool;
    this.onChanges = options.onChanges ?? (() => {});
    this.onError = options.onError ?? ((err) => {
      log.error(`CursorTracker error: ${err.message}`);
    });
  }

  start(): Promise<void> {
    if (this.state === 'running') return Promise.resolve();
    if (this.state === 'starting') return this.startPromise!;
    if (this.state === 'stopping') {
      return (this.stopPromise ?? Promise.resolve()).then(() => this.start());
    }

    const generation = ++this.generation;
    this.state = 'starting';
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
    log.info(`Starting cursor tracker: node=${this.nodeId}, schema=${this.schema}`);
    let registeredDuringStart = false;
    try {
      // A manual operation may have started while the tracker was stopped.
      // Readiness must execute its own strict registration and drain rather
      // than coalescing onto a non-strict operation.
      await this.waitForActiveWork();
      this.assertStartCurrent(generation);

      // A failed rollback or stop must be cleaned up before this node can
      // register another generation. Keep the flag set if cleanup fails.
      if (this.registered) {
        await this.cleanupEphemeralInternal(true);
        this.registered = false;
        this.assertStartCurrent(generation);
      }

      // Startup is a readiness boundary: the instance must not become resident
      // when the runtime role cannot register or drain the configured schema.
      await this.touchListenerInternal(true);
      this.registered = true;
      registeredDuringStart = true;
      this.assertStartCurrent(generation);

      // A caller can request a manual drain while registration is in flight.
      // Let it settle, then run the strict readiness drain ourselves so a
      // best-effort call can never satisfy the startup boundary.
      await this.waitForActiveWork();
      this.assertStartCurrent(generation);
      await this.drainInternal(true, generation);
      this.assertStartCurrent(generation);

      this.state = 'running';

      this.pollTimer = setInterval(() => {
        void this.drain();
      }, this.pollIntervalMs);
      this.pollTimer.unref?.();

      this.heartbeatTimer = setInterval(() => {
        void this.touchListener();
      }, this.heartbeatIntervalMs);
      this.heartbeatTimer.unref?.();
    } catch (reason) {
      this.clearTimers();
      const error = this.toError(reason);
      let cleanupError: Error | null = null;
      if (this.registered && registeredDuringStart) {
        try {
          await this.cleanupEphemeralInternal(true);
          this.registered = false;
        } catch (cleanupReason) {
          cleanupError = this.toError(cleanupReason);
        }
      }
      if (this.state === 'starting') this.state = 'stopped';
      if (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          'CursorTracker startup and rollback both failed'
        );
      }
      throw error;
    }
  }

  stop(): Promise<void> {
    if (this.state === 'stopped' && !this.registered) return Promise.resolve();
    if (this.state === 'stopping') return this.stopPromise!;

    const startInFlight = this.startPromise;
    ++this.generation;
    this.state = 'stopping';
    this.clearTimers();

    log.info(`Stopping cursor tracker: node=${this.nodeId}`);
    const pending = this.stopInternal(startInFlight);
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

  private async stopInternal(startInFlight: Promise<void> | null): Promise<void> {
    try {
      if (startInFlight) await Promise.allSettled([startInFlight]);
      await this.waitForActiveWork();
      if (this.registered) {
        await this.cleanupEphemeralInternal(true);
        this.registered = false;
      }
    } finally {
      this.state = 'stopped';
    }
  }

  private clearTimers(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  drain(): Promise<ChangeLogEntry[]> {
    if (this.state === 'stopping') return Promise.resolve([]);
    const dispatchGeneration = this.state === 'starting' || this.state === 'running'
      ? this.generation
      : undefined;
    return this.drainInternal(false, dispatchGeneration);
  }

  private drainInternal(
    throwOnError: boolean,
    dispatchGeneration?: number
  ): Promise<ChangeLogEntry[]> {
    if (this.activeDrain) return Promise.resolve([]);

    const pending = this.executeDrain(throwOnError, dispatchGeneration);
    this.activeDrain = pending;
    void pending.then(
      () => {
        if (this.activeDrain === pending) this.activeDrain = null;
      },
      () => {
        if (this.activeDrain === pending) this.activeDrain = null;
      }
    );
    return pending;
  }

  private async executeDrain(
    throwOnError: boolean,
    dispatchGeneration?: number
  ): Promise<ChangeLogEntry[]> {
    try {
      const sql = `SELECT * FROM ${this.quoteIdent(this.schema)}.drain_changes($1, $2)`;
      const result = await this.pool.query<{ drain_changes: ChangeLogEntry }>(
        sql,
        [this.nodeId, this.batchLimit],
      );
      const entries = result.rows.map((row) => row.drain_changes);

      if (entries.length > 0 && this.mayDispatch(dispatchGeneration)) {
        log.info(`Drained ${entries.length} change(s) for node=${this.nodeId}`);
        this.onChanges(entries);
      }

      return entries;
    } catch (reason) {
      const error = this.toError(reason);
      this.reportError(error);
      if (throwOnError) throw error;
      return [];
    }
  }

  touchListener(): Promise<void> {
    if (this.state === 'stopping') return Promise.resolve();
    return this.touchListenerInternal(false);
  }

  private touchListenerInternal(throwOnError: boolean): Promise<void> {
    if (this.activeHeartbeat) return this.activeHeartbeat;
    const pending = this.executeTouchListener(throwOnError);
    this.activeHeartbeat = pending;
    void pending.then(
      () => {
        if (this.activeHeartbeat === pending) this.activeHeartbeat = null;
      },
      () => {
        if (this.activeHeartbeat === pending) this.activeHeartbeat = null;
      }
    );
    return pending;
  }

  private async executeTouchListener(throwOnError: boolean): Promise<void> {
    try {
      const sql = `SELECT ${this.quoteIdent(this.schema)}.touch_listener($1)`;
      await this.pool.query(sql, [this.nodeId]);
    } catch (reason) {
      const error = this.toError(reason);
      this.reportError(error);
      if (throwOnError) throw error;
    }
  }

  async cleanupEphemeral(): Promise<void> {
    await this.cleanupEphemeralInternal(true);
  }

  private async cleanupEphemeralInternal(throwOnError: boolean): Promise<void> {
    try {
      const sql = `SELECT ${this.quoteIdent(this.schema)}.cleanup_ephemeral($1)`;
      await this.pool.query(sql, [this.nodeId]);
      log.info(`Cleaned up ephemeral subscriptions for node=${this.nodeId}`);
    } catch (reason) {
      const error = this.toError(reason);
      this.reportError(error);
      if (throwOnError) throw error;
    }
  }

  get isRunning(): boolean {
    return this.state === 'running';
  }

  private assertStartCurrent(generation: number): void {
    if (this.state !== 'starting' || this.generation !== generation) {
      throw new CursorTrackerStartAbortedError();
    }
  }

  private mayDispatch(generation: number | undefined): boolean {
    if (generation === undefined) return this.state !== 'stopping';
    return this.generation === generation
      && (this.state === 'starting' || this.state === 'running');
  }

  private async waitForActiveWork(): Promise<void> {
    const active: Promise<unknown>[] = [];
    if (this.activeDrain) active.push(this.activeDrain);
    if (this.activeHeartbeat) active.push(this.activeHeartbeat);
    if (active.length > 0) await Promise.allSettled(active);
  }

  private reportError(error: Error): void {
    try {
      this.onError(error);
    } catch (callbackError) {
      log.error(`CursorTracker error callback failed: ${String(callbackError)}`);
    }
  }

  private toError(reason: unknown): Error {
    return reason instanceof Error ? reason : new Error(String(reason));
  }

  private quoteIdent(identifier: string): string {
    return QuoteUtils.quoteIdentifier(identifier);
  }
}

export {
  DEFAULT_BATCH_LIMIT,
  DEFAULT_HEARTBEAT_INTERVAL_MS,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_SCHEMA,
};
