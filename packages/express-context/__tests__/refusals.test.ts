import type { RefusalKey, RefusalRow } from '../src/refusals';
import {
  createRecordRefusalsSink,
  OVERFLOW_ROUTE,
  OVERFLOW_SOURCE,
  REFUSAL_REASONS,
  refusalKeyOf,
  refusalOverflowKey,
  RefusalRecorder,
  refusalRows,
  sourceBucket,
  UNKNOWN_SOURCE
} from '../src/refusals';

// ─── Source anonymisation ───────────────────────────────────────────────────

describe('sourceBucket', () => {
  it('truncates IPv4 to a /24', () => {
    expect(sourceBucket('203.0.113.77')).toBe('203.0.113.0/24');
    expect(sourceBucket('10.1.2.3')).toBe('10.1.2.0/24');
  });

  it('truncates IPv6 to a /48', () => {
    expect(sourceBucket('2001:db8:abcd:1234:5678:9abc:def0:1')).toBe('2001:db8:abcd::/48');
    expect(sourceBucket('2001:0db8::1')).toBe('2001:db8:0::/48');
    expect(sourceBucket('::1')).toBe('0:0:0::/48');
    expect(sourceBucket('fe80::1%eth0')).toBe('fe80:0:0::/48');
    expect(sourceBucket('[2001:db8::2]')).toBe('2001:db8:0::/48');
  });

  it('unwraps IPv4-mapped IPv6 to the IPv4 /24', () => {
    expect(sourceBucket('::ffff:192.0.2.9')).toBe('192.0.2.0/24');
  });

  it('never returns the raw address', () => {
    for (const ip of ['203.0.113.77', '2001:db8::1', '::ffff:192.0.2.9']) {
      expect(sourceBucket(ip)).not.toBe(ip);
      expect(sourceBucket(ip)).not.toContain(ip);
    }
  });

  it('is unknown for anything unparseable', () => {
    for (const ip of [null, undefined, '', 'unknown', '999.1.1.1', 'not-an-ip', '1:::2', '[::1', 'gggg::1']) {
      expect(sourceBucket(ip)).toBe(UNKNOWN_SOURCE);
    }
  });
});

// ─── Keys / rows ────────────────────────────────────────────────────────────

const key = (over: Partial<RefusalKey> = {}): RefusalKey => ({
  minuteBucket: Date.UTC(2026, 8, 3, 0, 15),
  databaseId: 'db-1',
  lane: 'graphql',
  reason: 'rate_limited',
  routeKey: 'POST /graphql',
  sourceBucket: '203.0.113.0/24',
  ...over
});

describe('refusal keys', () => {
  it('serialises every field, with null database distinct from a value', () => {
    expect(refusalKeyOf(key())).toBe(refusalKeyOf(key()));
    expect(refusalKeyOf(key({ databaseId: null }))).not.toBe(refusalKeyOf(key()));
    expect(refusalKeyOf(key({ sourceBucket: '198.51.100.0/24' }))).not.toBe(refusalKeyOf(key()));
    expect(refusalKeyOf(key({ reason: 'queue_timeout' }))).not.toBe(refusalKeyOf(key()));
  });

  it('overflow collapses route and source and keeps tenant, lane, reason, minute', () => {
    expect(refusalOverflowKey(key())).toEqual(
      key({ routeKey: OVERFLOW_ROUTE, sourceBucket: OVERFLOW_SOURCE })
    );
  });

  it('shapes rows for record_refusals(jsonb)', () => {
    const rows = refusalRows([
      { key: key(), count: 4, firstAt: Date.UTC(2026, 8, 3, 0, 15, 2), lastAt: Date.UTC(2026, 8, 3, 0, 15, 40) }
    ]);
    expect(rows).toEqual<RefusalRow[]>([
      {
        minute_bucket: '2026-09-03T00:15:00.000Z',
        database_id: 'db-1',
        lane: 'graphql',
        reason: 'rate_limited',
        route_key: 'POST /graphql',
        source_bucket: '203.0.113.0/24',
        count: 4,
        first_seen_at: '2026-09-03T00:15:02.000Z',
        last_seen_at: '2026-09-03T00:15:40.000Z'
      }
    ]);
  });

  it('the taxonomy is the documented one', () => {
    expect([...REFUSAL_REASONS].sort()).toEqual(
      [
        'rate_limited',
        'concurrency_saturated',
        'queue_timeout',
        'request_too_large',
        'query_too_deep',
        'query_too_costly',
        'page_size_too_large',
        'anonymous_not_callable',
        'route_rate_limited'
      ].sort()
    );
  });
});

// ─── RefusalRecorder ────────────────────────────────────────────────────────

describe('RefusalRecorder', () => {
  const at = Date.UTC(2026, 8, 3, 0, 15, 30);

  it('record() is synchronous and aggregates by minute/tenant/reason/route/source', async () => {
    const sink = jest.fn(async (_rows: RefusalRow[]): Promise<void> => undefined);
    const recorder = new RefusalRecorder({ sink, intervalMs: 60_000, jitterMs: 0 });

    const result = recorder.record({
      databaseId: 'db-1',
      lane: 'graphql',
      reason: 'rate_limited',
      routeKey: 'POST /graphql',
      sourceIp: '203.0.113.7',
      at
    });
    expect(result).toBeUndefined();
    recorder.record({
      databaseId: 'db-1',
      lane: 'graphql',
      reason: 'rate_limited',
      routeKey: 'POST /graphql',
      sourceIp: '203.0.113.200',
      at: at + 10_000
    });
    recorder.record({
      databaseId: null,
      lane: 'graphql',
      reason: 'request_too_large',
      routeKey: 'POST /graphql',
      sourceIp: undefined,
      at
    });
    expect(recorder.stats().keys).toBe(2);

    await recorder.flush();
    expect(sink).toHaveBeenCalledTimes(1);
    const rows: RefusalRow[] = sink.mock.calls[0][0];
    expect(rows).toHaveLength(2);
    expect(rows).toContainEqual(
      expect.objectContaining({
        minute_bucket: '2026-09-03T00:15:00.000Z',
        database_id: 'db-1',
        reason: 'rate_limited',
        source_bucket: '203.0.113.0/24',
        count: 2,
        first_seen_at: '2026-09-03T00:15:30.000Z',
        last_seen_at: '2026-09-03T00:15:40.000Z'
      })
    );
    expect(rows).toContainEqual(
      expect.objectContaining({ database_id: null, reason: 'request_too_large', source_bucket: UNKNOWN_SOURCE, count: 1 })
    );
    expect(recorder.stats().keys).toBe(0);
  });

  it('a flood of distinct sources folds into an overflow row per tenant/reason', async () => {
    const sink = jest.fn(async (_rows: RefusalRow[]): Promise<void> => undefined);
    const recorder = new RefusalRecorder({ sink, intervalMs: 60_000, jitterMs: 0, maxKeys: 100 });
    for (let i = 0; i < 10_000; i++) {
      recorder.record({
        databaseId: 'db-1',
        lane: 'graphql',
        reason: 'rate_limited',
        routeKey: 'POST /graphql',
        sourceIp: `10.${(i >> 8) & 255}.${i & 255}.1`,
        at
      });
    }
    expect(recorder.stats().keys).toBe(101);
    expect(recorder.stats().overflowed).toBe(9_900);

    await recorder.flush();
    const rows: RefusalRow[] = sink.mock.calls[0][0];
    expect(rows).toHaveLength(101);
    const overflow = rows.find((r) => r.source_bucket === OVERFLOW_SOURCE);
    expect(overflow).toMatchObject({ database_id: 'db-1', reason: 'rate_limited', route_key: OVERFLOW_ROUTE, count: 9_900 });
    expect(rows.reduce((sum, r) => sum + r.count, 0)).toBe(10_000);
  });

  it('a broken sink is reported, the batch dropped, and record() keeps working', async () => {
    const sink = jest.fn(async () => {
      throw new Error('record_refusals: no identity');
    });
    const onError = jest.fn();
    const recorder = new RefusalRecorder({ sink, intervalMs: 60_000, jitterMs: 0, onError });
    const refusal = {
      databaseId: 'db-1',
      lane: 'graphql' as const,
      reason: 'concurrency_saturated' as const,
      routeKey: 'POST /graphql',
      sourceIp: '203.0.113.7',
      at
    };

    recorder.record(refusal);
    await expect(recorder.flush()).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(recorder.stats().flusher).toMatchObject({ consecutiveFailures: 1, droppedEntries: 1 });

    expect(() => recorder.record(refusal)).not.toThrow();
    expect(recorder.stats().keys).toBe(1);
    await recorder.flush();
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('start()/stop() flush on shutdown', async () => {
    const sink = jest.fn(async (_rows: RefusalRow[]): Promise<void> => undefined);
    const recorder = new RefusalRecorder({ sink, intervalMs: 60_000, jitterMs: 0 });
    recorder.start();
    recorder.record({ databaseId: 'db-1', lane: 'sync', reason: 'route_rate_limited', routeKey: 'rb-1', sourceIp: null, at });
    await recorder.stop();
    expect(sink).toHaveBeenCalledTimes(1);
    expect(recorder.stats().flusher.running).toBe(false);
  });
});

// ─── record_refusals sink ───────────────────────────────────────────────────

describe('createRecordRefusalsSink', () => {
  const fakePool = () => {
    const queries: { text: string; values?: unknown[] }[] = [];
    const client = {
      query: jest.fn(async (text: string, values?: unknown[]) => {
        queries.push({ text, values });
        return { rows: [{ recorded: 1 }], rowCount: 1 };
      }),
      release: jest.fn()
    };
    const pool = { connect: jest.fn(async () => client) };
    return { pool, client, queries };
  };

  it('writes one record_refusals call per batch inside a transaction carrying the claims', async () => {
    const { pool, client, queries } = fakePool();
    const claims = jest.fn(async () => ({
      'jwt.claims.user_id': 'u-platform',
      'jwt.claims.database_id': 'db-platform'
    }));
    const sink = createRecordRefusalsSink({ pool: pool as any, claims });
    const rows = refusalRows([{ key: key(), count: 2, firstAt: 1, lastAt: 2 }]);

    await sink(rows);

    const texts = queries.map((q) => q.text);
    expect(texts[0]).toBe('BEGIN');
    expect(texts.slice(1, 3)).toEqual(['SELECT set_config($1, $2, true)', 'SELECT set_config($1, $2, true)']);
    expect(queries[1].values).toEqual(['jwt.claims.user_id', 'u-platform']);
    expect(queries[2].values).toEqual(['jwt.claims.database_id', 'db-platform']);
    expect(texts[3]).toBe('SELECT "constructive_usage_private"."record_refusals"($1::jsonb) AS recorded');
    expect(JSON.parse(queries[3].values![0] as string)).toEqual(rows);
    expect(texts[4]).toBe('COMMIT');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('does nothing for an empty batch and rejects a bad function name', async () => {
    const { pool, claims } = { ...fakePool(), claims: jest.fn(async () => ({})) };
    await createRecordRefusalsSink({ pool: pool as any, claims })([]);
    expect(pool.connect).not.toHaveBeenCalled();
    expect(claims).not.toHaveBeenCalled();
    expect(() =>
      createRecordRefusalsSink({ pool: pool as any, claims, functionName: 'x; drop table y' })
    ).toThrow(/invalid function name/);
  });

  it('propagates a failed write so the flusher can report it', async () => {
    const { pool, client } = fakePool();
    client.query.mockImplementation(async (text: string) => {
      if (text.startsWith('SELECT "')) throw new Error('claim missing');
      return { rows: [], rowCount: 0 };
    });
    const sink = createRecordRefusalsSink({ pool: pool as any, claims: async () => ({}) });
    await expect(sink(refusalRows([{ key: key(), count: 1, firstAt: 1, lastAt: 1 }]))).rejects.toThrow('claim missing');
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});
