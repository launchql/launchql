import { EventEmitter } from 'events';

import {
  entryToChannel,
  entryToNotifyPayload,
  extractRowId,
  RealtimeManager,
  RealtimeSourceSchemaConfigurationError,
  RealtimeSourceSchemaViolationError,
  RealtimeSubscriberUnavailableError
} from '../src/realtime-manager';
import type { ChangeLogEntry, Queryable } from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(overrides: Partial<ChangeLogEntry> = {}): ChangeLogEntry {
  return {
    id: 'cl-entry-001',
    occurred_at: '2024-01-01T00:00:00Z',
    source_schema: 'public',
    source_table: 'contact',
    operation: 'INSERT',
    payload_after: { id: 'row-uuid-1', name: 'Alice' },
    payload_before: null,
    payload_diff: null,
    subscriber_ids: ['sub-1'],
    ...overrides,
  };
}

function createMockPool(): jest.Mocked<Queryable> {
  return {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  };
}

function createMockPgSubscriber() {
  const eventEmitter = new EventEmitter();
  return { eventEmitter, subscribe: jest.fn() };
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 6; i++) await Promise.resolve();
}

// ---------------------------------------------------------------------------
// Unit tests: helper functions
// ---------------------------------------------------------------------------

describe('extractRowId', () => {
  it('extracts id from payload_after for INSERT', () => {
    const entry = makeEntry({ operation: 'INSERT', payload_after: { id: 'abc-123' } });
    expect(extractRowId(entry)).toBe('abc-123');
  });

  it('extracts id from payload_after for UPDATE', () => {
    const entry = makeEntry({ operation: 'UPDATE', payload_after: { id: 'def-456' } });
    expect(extractRowId(entry)).toBe('def-456');
  });

  it('extracts id from payload_before for DELETE', () => {
    const entry = makeEntry({
      operation: 'DELETE',
      payload_after: null,
      payload_before: { id: 'ghi-789' },
    });
    expect(extractRowId(entry)).toBe('ghi-789');
  });

  it('returns null when payload is missing', () => {
    const entry = makeEntry({ operation: 'INSERT', payload_after: null });
    expect(extractRowId(entry)).toBeNull();
  });

  it('returns null when payload has no id field', () => {
    const entry = makeEntry({ operation: 'INSERT', payload_after: { name: 'Alice' } });
    expect(extractRowId(entry)).toBeNull();
  });
});

describe('entryToNotifyPayload', () => {
  it('formats INSERT with row id', () => {
    const entry = makeEntry({ operation: 'INSERT', payload_after: { id: 'row-1' } });
    expect(entryToNotifyPayload(entry)).toBe('INSERT:row-1');
  });

  it('formats UPDATE with row id', () => {
    const entry = makeEntry({ operation: 'UPDATE', payload_after: { id: 'row-2' } });
    expect(entryToNotifyPayload(entry)).toBe('UPDATE:row-2');
  });

  it('formats DELETE with row id from payload_before', () => {
    const entry = makeEntry({
      operation: 'DELETE',
      payload_after: null,
      payload_before: { id: 'row-3' },
    });
    expect(entryToNotifyPayload(entry)).toBe('DELETE:row-3');
  });

  it('returns operation only when no row id available', () => {
    const entry = makeEntry({ operation: 'INSERT', payload_after: null });
    expect(entryToNotifyPayload(entry)).toBe('INSERT');
  });
});

describe('entryToChannel', () => {
  it('builds channel from source_schema and source_table', () => {
    const entry = makeEntry({ source_schema: 'public', source_table: 'contact' });
    expect(entryToChannel(entry)).toBe('realtime:public.contact');
  });

  it('handles custom schema names', () => {
    const entry = makeEntry({ source_schema: 'tenant_42', source_table: 'invoice' });
    expect(entryToChannel(entry)).toBe('realtime:tenant_42.invoice');
  });
});

// ---------------------------------------------------------------------------
// RealtimeManager lifecycle
// ---------------------------------------------------------------------------

describe('RealtimeManager', () => {
  let mockPool: jest.Mocked<Queryable>;
  let mockSubscriber: ReturnType<typeof createMockPgSubscriber>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockPool = createMockPool();
    mockSubscriber = createMockPgSubscriber();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createManager(overrides: Record<string, unknown> = {}) {
    return new RealtimeManager({
      pgSubscriber: mockSubscriber,
      pool: mockPool,
      allowedSourceSchemas: ['public', 'billing'],
      nodeId: 'test-manager-node',
      pollIntervalMs: 1000,
      heartbeatIntervalMs: 5000,
      ...overrides,
    });
  }

  it('starts and stops without error', async () => {
    const manager = createManager();
    await manager.start();
    expect(manager.isRunning).toBe(true);

    await manager.stop();
    expect(manager.isRunning).toBe(false);
  });

  it('exposes nodeId', () => {
    const manager = createManager({ nodeId: 'my-node-42' });
    expect(manager.nodeId).toBe('my-node-42');
  });

  it('calls touch_listener on start', async () => {
    const manager = createManager();
    await manager.start();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('touch_listener'),
      expect.any(Array),
    );

    await manager.stop();
  });

  it('calls cleanup_ephemeral on stop', async () => {
    const manager = createManager();
    await manager.start();
    mockPool.query.mockClear();

    await manager.stop();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      expect.any(Array),
    );
  });

  it('fails startup before registration when the subscriber emitter is unavailable', async () => {
    const manager = createManager({ pgSubscriber: {} });

    await expect(manager.start()).rejects.toBeInstanceOf(
      RealtimeSubscriberUnavailableError
    );

    expect(manager.isRunning).toBe(false);
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  it('uses an explicit publisher without inspecting PgSubscriber internals', async () => {
    const publish = jest.fn();
    const opaqueSubscriber = Object.defineProperty({}, 'eventEmitter', {
      get() {
        throw new Error('private field accessed');
      }
    });
    mockPool.query.mockImplementation(async (sql: string) => {
      if (sql.includes('drain_changes')) {
        return {
          rows: [{
            drain_changes: makeEntry({ payload_after: { id: 'cursor-row' } })
          }]
        };
      }
      return { rows: [] };
    });
    const manager = createManager({
      publisher: { publish },
      pgSubscriber: opaqueSubscriber
    });

    await manager.start();
    expect(publish).toHaveBeenCalledWith(
      'realtime:public.contact',
      'INSERT:cursor-row'
    );
    await manager.stop();
  });

  it('fails the generation when the explicit publisher rejects delivery', async () => {
    const failure = new Error('generation released');
    const fatalErrors: Error[] = [];
    mockPool.query.mockImplementation(async (sql: string) => {
      if (sql.includes('drain_changes')) {
        return { rows: [{ drain_changes: makeEntry() }] };
      }
      return { rows: [] };
    });
    const manager = createManager({
      publisher: {
        publish() {
          throw failure;
        }
      },
      onFatalError: (error: Error) => fatalErrors.push(error)
    });

    await expect(manager.start()).rejects.toBe(failure);
    expect(fatalErrors).toEqual([failure]);
    expect(manager.isRunning).toBe(false);
  });

  it('preflights every cursor topic before publishing any row in the batch', async () => {
    const publish = jest.fn();
    const topicFailure = new Error('topic outside generation');
    mockPool.query.mockImplementation(async (sql: string) => {
      if (sql.includes('drain_changes')) {
        return {
          rows: [
            { drain_changes: makeEntry({ source_table: 'contact' }) },
            { drain_changes: makeEntry({ source_table: 'private_table' }) }
          ]
        };
      }
      return { rows: [] };
    });
    const manager = createManager({
      publisher: {
        assertTopics(topics: readonly string[]) {
          if (topics.includes('realtime:public.private_table')) throw topicFailure;
        },
        publish
      }
    });

    await expect(manager.start()).rejects.toBe(topicFailure);
    expect(publish).not.toHaveBeenCalled();
  });

  it('fails startup before registration when no source schema is allowed', async () => {
    const manager = createManager({ allowedSourceSchemas: [] });

    await expect(manager.start()).rejects.toBeInstanceOf(
      RealtimeSourceSchemaConfigurationError
    );

    expect(manager.isRunning).toBe(false);
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  it('requires a source-schema allowlist for an explicit publisher', async () => {
    const manager = createManager({
      publisher: { publish: jest.fn() },
      allowedSourceSchemas: undefined
    });

    await expect(manager.start()).rejects.toBeInstanceOf(
      RealtimeSourceSchemaConfigurationError
    );
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  it('preserves the deprecated pgSubscriber path when no allowlist is supplied', async () => {
    const manager = createManager({ allowedSourceSchemas: undefined });

    await expect(manager.start()).resolves.toBeUndefined();
    await manager.stop();
  });

  it('is idempotent for start', async () => {
    const manager = createManager();
    await manager.start();
    await manager.start(); // should be no-op

    await manager.stop();
  });

  it('is idempotent for stop', async () => {
    const manager = createManager();
    await manager.start();
    await manager.stop();
    await manager.stop(); // should be no-op
  });

  it('fails a running generation when periodic cursor polling fails', async () => {
    const failure = new Error('periodic drain failed');
    const errors: Error[] = [];
    const fatalErrors: Error[] = [];
    let rejectDrain = false;
    mockPool.query.mockImplementation(async (sql: string) => {
      if (rejectDrain && sql.includes('drain_changes')) throw failure;
      return { rows: [] };
    });
    const manager = createManager({
      onError: (error: Error) => errors.push(error),
      onFatalError: (error: Error) => fatalErrors.push(error)
    });

    await manager.start();
    rejectDrain = true;
    await jest.advanceTimersByTimeAsync(1000);
    await flushMicrotasks();
    await manager.stop();

    expect(errors).toEqual([failure]);
    expect(fatalErrors).toEqual([failure]);
    expect(manager.isRunning).toBe(false);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      ['test-manager-node']
    );
  });

  it('fails a running generation when its periodic heartbeat fails', async () => {
    const failure = new Error('periodic heartbeat failed');
    const errors: Error[] = [];
    const fatalErrors: Error[] = [];
    let rejectHeartbeat = false;
    mockPool.query.mockImplementation(async (sql: string) => {
      if (rejectHeartbeat && sql.includes('touch_listener')) throw failure;
      return { rows: [] };
    });
    const manager = createManager({
      onError: (error: Error) => errors.push(error),
      onFatalError: (error: Error) => fatalErrors.push(error)
    });

    await manager.start();
    rejectHeartbeat = true;
    await jest.advanceTimersByTimeAsync(5000);
    await flushMicrotasks();
    await manager.stop();

    expect(errors).toEqual([failure]);
    expect(fatalErrors).toEqual([failure]);
    expect(manager.isRunning).toBe(false);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      ['test-manager-node']
    );
  });

  it('does not dispatch a deferred startup drain after stop begins', async () => {
    const entry = makeEntry({ payload_after: { id: 'late-row' } });
    const drain = deferred<{ rows: { drain_changes: ChangeLogEntry }[] }>();
    const emitted: string[] = [];
    mockSubscriber.eventEmitter.on('realtime:public.contact', (payload: string) => {
      emitted.push(payload);
    });
    mockPool.query.mockImplementation((sql: string) => {
      if (sql.includes('drain_changes')) return drain.promise;
      return Promise.resolve({ rows: [] });
    });

    const manager = createManager();
    const starting = manager.start();
    const startResult = expect(starting).rejects.toMatchObject({
      code: 'CURSOR_TRACKER_START_ABORTED',
    });
    await flushMicrotasks();
    expect(mockPool.query.mock.calls.some(([sql]) => sql.includes('drain_changes'))).toBe(true);

    const stopping = manager.stop();
    drain.resolve({ rows: [{ drain_changes: entry }] });

    await startResult;
    await stopping;

    expect(emitted).toEqual([]);
    expect(manager.isRunning).toBe(false);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      ['test-manager-node']
    );
  });

  describe('event dispatching', () => {
    it('rejects a mixed batch atomically when it contains a foreign source schema', async () => {
      const emitted: string[] = [];
      const errors: Error[] = [];
      const fatalErrors: Error[] = [];
      mockSubscriber.eventEmitter.on('realtime:public.contact', (payload: string) => {
        emitted.push(payload);
      });
      const entries = [
        makeEntry({ payload_after: { id: 'allowed-row' } }),
        makeEntry({
          source_schema: 'tenant_b',
          payload_after: { id: 'foreign-row' }
        })
      ];
      mockPool.query.mockImplementation(async (sql: string) => {
        if (sql.includes('drain_changes')) {
          return { rows: entries.map((entry) => ({ drain_changes: entry })) };
        }
        return { rows: [] };
      });

      const manager = createManager({
        allowedSourceSchemas: ['public'],
        onError: (error: Error) => errors.push(error),
        onFatalError: (error: Error) => fatalErrors.push(error)
      });

      await expect(manager.start()).rejects.toBeInstanceOf(
        RealtimeSourceSchemaViolationError
      );
      await manager.stop();

      expect(emitted).toEqual([]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        code: 'REALTIME_SOURCE_SCHEMA_VIOLATION',
        sourceSchema: 'tenant_b',
        allowedSourceSchemas: ['public']
      });
      expect(fatalErrors).toEqual([errors[0]]);
      expect(manager.isRunning).toBe(false);
    });

    it('stops a running manager before a foreign periodic batch can emit', async () => {
      const errors: Error[] = [];
      const fatalErrors: Error[] = [];
      const emitted: string[] = [];
      mockSubscriber.eventEmitter.on('realtime:public.contact', (payload: string) => {
        emitted.push(payload);
      });
      const manager = createManager({
        allowedSourceSchemas: ['public'],
        onError: (error: Error) => errors.push(error),
        onFatalError: (error: Error) => fatalErrors.push(error)
      });
      await manager.start();
      mockPool.query.mockImplementation(async (sql: string) => {
        if (sql.includes('drain_changes')) {
          return {
            rows: [{
              drain_changes: makeEntry({
                source_schema: 'tenant_b',
                payload_after: { id: 'foreign-periodic-row' }
              })
            }]
          };
        }
        return { rows: [] };
      });

      await jest.advanceTimersByTimeAsync(1000);
      await flushMicrotasks();
      await manager.stop();

      expect(emitted).toEqual([]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(RealtimeSourceSchemaViolationError);
      expect(fatalErrors).toEqual([errors[0]]);
      expect(manager.isRunning).toBe(false);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('cleanup_ephemeral'),
        ['test-manager-node']
      );
    });

    it('emits cursor-tracked events on PgSubscriber eventEmitter', async () => {
      const emitted: { channel: string; payload: string }[] = [];
      mockSubscriber.eventEmitter.on('realtime:public.contact', (payload: string) => {
        emitted.push({ channel: 'realtime:public.contact', payload });
      });

      // Mock drain_changes to return entries
      const entries: ChangeLogEntry[] = [
        makeEntry({ operation: 'INSERT', payload_after: { id: 'row-a' } }),
        makeEntry({ operation: 'UPDATE', payload_after: { id: 'row-b' } }),
      ];

      mockPool.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('drain_changes')) {
          return { rows: entries.map((e) => ({ drain_changes: e })) };
        }
        return { rows: [] };
      });

      const manager = createManager();
      await manager.start();

      // The initial drain happens in start() — events should be emitted
      expect(emitted).toHaveLength(2);
      expect(emitted[0].payload).toBe('INSERT:row-a');
      expect(emitted[1].payload).toBe('UPDATE:row-b');

      await manager.stop();
    });

    it('handles DELETE events with payload_before', async () => {
      const emitted: string[] = [];
      mockSubscriber.eventEmitter.on('realtime:public.contact', (payload: string) => {
        emitted.push(payload);
      });

      const entries: ChangeLogEntry[] = [
        makeEntry({
          operation: 'DELETE',
          payload_after: null,
          payload_before: { id: 'deleted-row' },
        }),
      ];

      mockPool.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('drain_changes')) {
          return { rows: entries.map((e) => ({ drain_changes: e })) };
        }
        return { rows: [] };
      });

      const manager = createManager();
      await manager.start();

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toBe('DELETE:deleted-row');

      await manager.stop();
    });

    it('dispatches to correct channels for different tables', async () => {
      const contactEvents: string[] = [];
      const invoiceEvents: string[] = [];
      mockSubscriber.eventEmitter.on('realtime:public.contact', (p: string) => contactEvents.push(p));
      mockSubscriber.eventEmitter.on('realtime:billing.invoice', (p: string) => invoiceEvents.push(p));

      const entries: ChangeLogEntry[] = [
        makeEntry({
          source_schema: 'public',
          source_table: 'contact',
          operation: 'INSERT',
          payload_after: { id: 'contact-1' },
        }),
        makeEntry({
          source_schema: 'billing',
          source_table: 'invoice',
          operation: 'UPDATE',
          payload_after: { id: 'invoice-1' },
        }),
      ];

      mockPool.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('drain_changes')) {
          return { rows: entries.map((e) => ({ drain_changes: e })) };
        }
        return { rows: [] };
      });

      const manager = createManager();
      await manager.start();

      expect(contactEvents).toEqual(['INSERT:contact-1']);
      expect(invoiceEvents).toEqual(['UPDATE:invoice-1']);

      await manager.stop();
    });
  });

  describe('error handling', () => {
    it('retries cleanup after startup and rollback both fail', async () => {
      const drainError = new Error('initial drain failed');
      const cleanupError = new Error('rollback failed');
      let failCleanup = true;
      mockPool.query.mockImplementation(async (sql: string) => {
        if (sql.includes('drain_changes')) throw drainError;
        if (failCleanup && sql.includes('cleanup_ephemeral')) throw cleanupError;
        return { rows: [] };
      });
      const manager = createManager({ onError: jest.fn() });

      await expect(manager.start()).rejects.toMatchObject({
        errors: [drainError, cleanupError]
      });
      expect(manager.isRunning).toBe(false);
      await expect(manager.stop()).rejects.toBe(cleanupError);

      failCleanup = false;
      await manager.stop();
      await manager.stop();
      expect(mockPool.query.mock.calls.filter(([sql]) => sql.includes('cleanup_ephemeral')))
        .toHaveLength(3);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('does not start a new generation until failed shutdown cleanup succeeds', async () => {
      const cleanupError = new Error('cleanup failed');
      let failCleanup = true;
      const operations: string[] = [];
      mockPool.query.mockImplementation(async (sql: string) => {
        const operation = sql.includes('cleanup_ephemeral') ? 'cleanup'
          : sql.includes('touch_listener') ? 'register' : 'drain';
        operations.push(operation);
        if (failCleanup && operation === 'cleanup') throw cleanupError;
        return { rows: [] };
      });
      const manager = createManager({ onError: jest.fn() });
      await manager.start();
      await expect(manager.stop()).rejects.toBe(cleanupError);
      await expect(manager.start()).rejects.toBe(cleanupError);
      expect(operations).toEqual(['register', 'drain', 'cleanup', 'cleanup']);
      expect(manager.isRunning).toBe(false);

      failCleanup = false;
      await manager.start();
      expect(operations.slice(-3)).toEqual(['cleanup', 'register', 'drain']);
      expect(manager.isRunning).toBe(true);
      await manager.stop();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('fails startup and rolls back readiness when the initial drain fails', async () => {
      const errors: Error[] = [];

      mockPool.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('drain_changes')) {
          throw new Error('drain failed');
        }
        return { rows: [] };
      });

      const manager = createManager({ onError: (err: Error) => errors.push(err) });
      await expect(manager.start()).rejects.toThrow('drain failed');

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('drain failed');
      expect(manager.isRunning).toBe(false);
    });

  });
});
