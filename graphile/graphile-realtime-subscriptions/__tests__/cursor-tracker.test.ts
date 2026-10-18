/**
 * Tests for the CursorTracker class.
 *
 * Covers:
 * - Lifecycle: start, stop, heartbeat, cleanup
 * - drain_changes() polling and result delivery
 * - Error handling for database failures
 * - Guard against concurrent drains
 * - Configuration defaults and overrides
 * - Proper SQL generation with schema quoting
 */

jest.mock('@pgpmjs/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

import {
  CursorTracker,
  CursorTrackerStartAbortedError,
  DEFAULT_BATCH_LIMIT,
  DEFAULT_HEARTBEAT_INTERVAL_MS,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_SCHEMA,
} from '../src/cursor-tracker';
import type { ChangeLogEntry,Queryable } from '../src/types';

// --- Test helpers ---

function createMockPool(queryResult: { rows: any[] } = { rows: [] }): jest.Mocked<Queryable> {
  return {
    query: jest.fn().mockResolvedValue(queryResult),
  };
}

function createChangeLogEntry(overrides: Partial<ChangeLogEntry> = {}): ChangeLogEntry {
  return {
    id: 'change-1',
    occurred_at: '2025-01-01T00:00:00Z',
    source_schema: 'app_public',
    source_table: 'projects',
    operation: 'INSERT',
    payload_after: { id: 'row-1', name: 'Test' },
    payload_before: null,
    payload_diff: null,
    subscriber_ids: ['sub-1'],
    ...overrides,
  };
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

// --- Tests ---

describe('CursorTracker defaults', () => {
  it('exports expected default constants', () => {
    expect(DEFAULT_POLL_INTERVAL_MS).toBe(5000);
    expect(DEFAULT_HEARTBEAT_INTERVAL_MS).toBe(30000);
    expect(DEFAULT_BATCH_LIMIT).toBe(500);
    expect(DEFAULT_SCHEMA).toBe('realtime_public');
  });

  it('generates a nodeId when not provided', () => {
    const tracker = new CursorTracker({
      pool: createMockPool(),
    });

    expect(tracker.nodeId).toBeDefined();
    expect(typeof tracker.nodeId).toBe('string');
    expect(tracker.nodeId.length).toBeGreaterThan(0);
  });

  it('uses provided nodeId', () => {
    const tracker = new CursorTracker({
      nodeId: 'my-node-42',
      pool: createMockPool(),
    });

    expect(tracker.nodeId).toBe('my-node-42');
  });
});

describe('CursorTracker.start()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls touch_listener on start', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'test-node',
      pool: mockPool,
    });

    await tracker.start();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('touch_listener'),
      ['test-node'],
    );

    await tracker.stop();
  });

  it('calls drain_changes immediately after start', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'test-node',
      pool: mockPool,
    });

    await tracker.start();

    const calls = (mockPool.query as jest.Mock).mock.calls;
    const drainCalls = calls.filter((c: any[]) => c[0].includes('drain_changes'));
    expect(drainCalls.length).toBeGreaterThanOrEqual(1);

    await tracker.stop();
  });

  it('sets isRunning to true', async () => {
    const tracker = new CursorTracker({
      pool: createMockPool(),
    });

    expect(tracker.isRunning).toBe(false);
    await tracker.start();
    expect(tracker.isRunning).toBe(true);

    await tracker.stop();
  });

  it('is idempotent (calling start twice does not double-register)', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'test-node',
      pool: mockPool,
    });

    await tracker.start();
    const callCountAfterFirst = (mockPool.query as jest.Mock).mock.calls.length;

    await tracker.start();
    const callCountAfterSecond = (mockPool.query as jest.Mock).mock.calls.length;

    expect(callCountAfterSecond).toBe(callCountAfterFirst);

    await tracker.stop();
  });

  it('fails readiness and rolls back when listener registration fails', async () => {
    const error = new Error('touch denied');
    const pool: Queryable = { query: jest.fn().mockRejectedValue(error) };
    const onError = jest.fn();
    const tracker = new CursorTracker({ pool, onError });

    await expect(tracker.start()).rejects.toBe(error);

    expect(tracker.isRunning).toBe(false);
    expect(onError).toHaveBeenCalledWith(error);
    expect((pool.query as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('fails readiness and cleans up when the initial drain fails', async () => {
    const error = new Error('drain denied');
    const pool: Queryable = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (sql.includes('drain_changes')) throw error;
        return { rows: [] };
      })
    };
    const tracker = new CursorTracker({ nodeId: 'strict-node', pool });

    await expect(tracker.start()).rejects.toBe(error);

    expect(tracker.isRunning).toBe(false);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      ['strict-node']
    );
  });

  it('preserves startup and rollback failures when both operations fail', async () => {
    const drainError = new Error('drain denied');
    const cleanupError = new Error('cleanup denied');
    const pool: Queryable = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (sql.includes('drain_changes')) throw drainError;
        if (sql.includes('cleanup_ephemeral')) throw cleanupError;
        return { rows: [] };
      })
    };
    const tracker = new CursorTracker({ nodeId: 'rollback-node', pool });

    const starting = tracker.start();
    await expect(starting).rejects.toBeInstanceOf(AggregateError);
    await expect(starting).rejects.toMatchObject({
      errors: [drainError, cleanupError]
    });
    expect(tracker.isRunning).toBe(false);
  });
});

describe('CursorTracker.stop()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls cleanup_ephemeral on stop', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'test-node',
      pool: mockPool,
    });

    await tracker.start();
    (mockPool.query as jest.Mock).mockClear();

    await tracker.stop();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      ['test-node'],
    );
  });

  it('sets isRunning to false', async () => {
    const tracker = new CursorTracker({
      pool: createMockPool(),
    });

    await tracker.start();
    await tracker.stop();
    expect(tracker.isRunning).toBe(false);
  });

  it('surfaces cleanup failure and permits an explicit retry', async () => {
    const cleanupError = new Error('cleanup failed');
    let failCleanup = true;
    const pool = createMockPool();
    pool.query.mockImplementation(async (sql: string) => {
      if (failCleanup && sql.includes('cleanup_ephemeral')) throw cleanupError;
      return { rows: [] };
    });
    const onError = jest.fn();
    const tracker = new CursorTracker({ pool, onError });
    await tracker.start();

    await expect(tracker.stop()).rejects.toBe(cleanupError);
    expect(tracker.isRunning).toBe(false);
    expect(onError).toHaveBeenCalledWith(cleanupError);

    failCleanup = false;
    await expect(tracker.stop()).resolves.toBeUndefined();
    expect(pool.query.mock.calls.filter(([sql]) => sql.includes('cleanup_ephemeral')))
      .toHaveLength(2);
  });

  it('is idempotent (calling stop twice does not double-cleanup)', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'test-node',
      pool: mockPool,
    });

    await tracker.start();
    (mockPool.query as jest.Mock).mockClear();

    await tracker.stop();
    const callCountAfterFirst = (mockPool.query as jest.Mock).mock.calls.length;

    await tracker.stop();
    const callCountAfterSecond = (mockPool.query as jest.Mock).mock.calls.length;

    expect(callCountAfterSecond).toBe(callCountAfterFirst);
  });

  it('clears poll and heartbeat timers', async () => {
    const clearSpy = jest.spyOn(global, 'clearInterval');

    const tracker = new CursorTracker({
      pool: createMockPool(),
    });

    await tracker.start();
    await tracker.stop();

    expect(clearSpy).toHaveBeenCalledTimes(2);
    clearSpy.mockRestore();
  });

  it('waits for an active poll and suppresses its dispatch after stop begins', async () => {
    const pool = createMockPool();
    const onChanges = jest.fn();
    const tracker = new CursorTracker({
      nodeId: 'poll-stop-node',
      pool,
      onChanges,
    });
    await tracker.start();

    const poll = deferred<{ rows: { drain_changes: ChangeLogEntry }[] }>();
    pool.query.mockImplementation((sql: string) => {
      if (sql.includes('drain_changes')) return poll.promise;
      return Promise.resolve({ rows: [] });
    });
    pool.query.mockClear();

    const activeDrain = tracker.drain();
    const stopping = tracker.stop();
    let stopped = false;
    void stopping.then(() => {
      stopped = true;
    });
    await Promise.resolve();

    expect(stopped).toBe(false);
    expect(pool.query.mock.calls.some(([sql]) => sql.includes('cleanup_ephemeral'))).toBe(false);

    const entry = createChangeLogEntry();
    poll.resolve({ rows: [{ drain_changes: entry }] });
    await expect(activeDrain).resolves.toEqual([entry]);
    await stopping;

    expect(onChanges).not.toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      ['poll-stop-node']
    );
  });

  it('waits for an active heartbeat before cleaning up the listener', async () => {
    const pool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'heartbeat-stop-node',
      pool,
    });
    await tracker.start();

    const heartbeat = deferred<{ rows: never[] }>();
    pool.query.mockImplementation((sql: string) => {
      if (sql.includes('touch_listener')) return heartbeat.promise;
      return Promise.resolve({ rows: [] });
    });
    pool.query.mockClear();

    const activeHeartbeat = tracker.touchListener();
    const stopping = tracker.stop();
    let stopped = false;
    void stopping.then(() => {
      stopped = true;
    });
    await Promise.resolve();

    expect(stopped).toBe(false);
    expect(pool.query.mock.calls.some(([sql]) => sql.includes('cleanup_ephemeral'))).toBe(false);

    heartbeat.resolve({ rows: [] });
    await activeHeartbeat;
    await stopping;

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('cleanup_ephemeral'),
      ['heartbeat-stop-node']
    );
  });

  it('aborts startup deterministically when stop wins the registration race', async () => {
    const registration = deferred<{ rows: never[] }>();
    const pool: jest.Mocked<Queryable> = {
      query: jest.fn().mockImplementation((sql: string) => {
        if (sql.includes('touch_listener')) return registration.promise;
        return Promise.resolve({ rows: [] });
      }),
    };
    const tracker = new CursorTracker({
      nodeId: 'start-stop-node',
      pool,
    });

    const starting = tracker.start();
    const startResult = expect(starting).rejects.toBeInstanceOf(CursorTrackerStartAbortedError);
    await Promise.resolve();
    await Promise.resolve();
    expect(pool.query.mock.calls.some(([sql]) => sql.includes('touch_listener'))).toBe(true);

    const stopping = tracker.stop();
    registration.resolve({ rows: [] });

    await startResult;
    await stopping;

    expect(tracker.isRunning).toBe(false);
    expect(pool.query.mock.calls.some(([sql]) => sql.includes('drain_changes'))).toBe(false);
    expect(pool.query.mock.calls.filter(([sql]) => sql.includes('cleanup_ephemeral'))).toHaveLength(1);
  });
});

describe('CursorTracker.drain()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls drain_changes with nodeId and batchLimit', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'drain-node',
      batchLimit: 100,
      pool: mockPool,
    });

    await tracker.drain();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('drain_changes'),
      ['drain-node', 100],
    );
  });

  it('returns parsed change_log entries', async () => {
    const entry = createChangeLogEntry();
    const mockPool = createMockPool({
      rows: [{ drain_changes: entry }],
    });

    const tracker = new CursorTracker({
      pool: mockPool,
    });

    const result = await tracker.drain();
    expect(result).toEqual([entry]);
  });

  it('calls onChanges callback with entries', async () => {
    const entry = createChangeLogEntry();
    const mockPool = createMockPool({
      rows: [{ drain_changes: entry }],
    });
    const onChanges = jest.fn();

    const tracker = new CursorTracker({
      pool: mockPool,
      onChanges,
    });

    await tracker.drain();
    expect(onChanges).toHaveBeenCalledWith([entry]);
  });

  it('does not call onChanges when no entries', async () => {
    const onChanges = jest.fn();

    const tracker = new CursorTracker({
      pool: createMockPool(),
      onChanges,
    });

    await tracker.drain();
    expect(onChanges).not.toHaveBeenCalled();
  });

  it('returns empty array on error and calls onError', async () => {
    const failingPool: Queryable = {
      query: jest.fn().mockRejectedValue(new Error('connection lost')),
    };
    const onError = jest.fn();

    const tracker = new CursorTracker({
      pool: failingPool,
      onError,
    });

    const result = await tracker.drain();

    expect(result).toEqual([]);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'connection lost',
    }));
  });

  it('prevents concurrent drains', async () => {
    let resolveQuery: (() => void) | null = null;
    const slowPool: Queryable = {
      query: jest.fn().mockImplementation(() => {
        return new Promise<{ rows: any[] }>((resolve) => {
          resolveQuery = () => resolve({ rows: [] });
        });
      }),
    };

    const tracker = new CursorTracker({
      pool: slowPool,
    });

    const drain1 = tracker.drain();
    const drain2Promise = tracker.drain();

    const result2 = await drain2Promise;
    expect(result2).toEqual([]);

    resolveQuery!();
    await drain1;
  });
});

describe('CursorTracker periodic polling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('polls drain_changes at configured interval', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'poll-node',
      pollIntervalMs: 2000,
      pool: mockPool,
    });

    await tracker.start();
    (mockPool.query as jest.Mock).mockClear();

    jest.advanceTimersByTime(2000);
    // Allow async callbacks
    await Promise.resolve();

    const drainCalls = (mockPool.query as jest.Mock).mock.calls
      .filter((c: any[]) => c[0].includes('drain_changes'));
    expect(drainCalls.length).toBeGreaterThanOrEqual(1);

    await tracker.stop();
  });

  it('heartbeats at configured interval', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'hb-node',
      heartbeatIntervalMs: 5000,
      pool: mockPool,
    });

    await tracker.start();
    (mockPool.query as jest.Mock).mockClear();

    jest.advanceTimersByTime(5000);
    await Promise.resolve();

    const touchCalls = (mockPool.query as jest.Mock).mock.calls
      .filter((c: any[]) => c[0].includes('touch_listener'));
    expect(touchCalls.length).toBeGreaterThanOrEqual(1);

    await tracker.stop();
  });
});

describe('CursorTracker schema quoting', () => {
  it('includes schema name in SQL queries', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'schema-node',
      schema: 'my_realtime_public',
      pool: mockPool,
    });

    await tracker.drain();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('my_realtime_public'),
      expect.any(Array),
    );
  });

  it('uses default schema when not specified', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'default-schema-node',
      pool: mockPool,
    });

    await tracker.drain();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('realtime_public'),
      expect.any(Array),
    );
  });

  it('quotes schema names that need quoting', async () => {
    const mockPool = createMockPool();
    const tracker = new CursorTracker({
      nodeId: 'special-schema-node',
      schema: 'my schema',
      pool: mockPool,
    });

    await tracker.drain();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('"my schema"'),
      expect.any(Array),
    );
  });
});

describe('CursorTracker error handling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('touch_listener error calls onError without throwing', async () => {
    const failingPool: Queryable = {
      query: jest.fn().mockRejectedValue(new Error('touch failed')),
    };
    const onError = jest.fn();

    const tracker = new CursorTracker({
      pool: failingPool,
      onError,
    });

    await tracker.touchListener();

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'touch failed',
    }));
  });

  it('cleanup_ephemeral error calls onError and rejects', async () => {
    const failingPool: Queryable = {
      query: jest.fn().mockRejectedValue(new Error('cleanup failed')),
    };
    const onError = jest.fn();

    const tracker = new CursorTracker({
      pool: failingPool,
      onError,
    });

    await expect(tracker.cleanupEphemeral()).rejects.toThrow('cleanup failed');

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'cleanup failed',
    }));
  });

  it('wraps non-Error objects in Error', async () => {
    const failingPool: Queryable = {
      query: jest.fn().mockRejectedValue('string error'),
    };
    const onError = jest.fn();

    const tracker = new CursorTracker({
      pool: failingPool,
      onError,
    });

    await tracker.drain();

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toBe('string error');
  });
});
