/**
 * refusals — the refusal-observability instantiation of `usage-counter`.
 *
 * Every refusal the platform issues (a 429 from admission control, a 413 for an
 * oversized body, a document-gate rejection, a gateway's route or IP window)
 * is one `RefusalRecorder.record(...)` call at the point the response is
 * written. That call is an in-memory increment and nothing else — no promise,
 * no pool, no allocation beyond the key — so a flood costs a counter bump and
 * refusing traffic keeps working when the recorder's store is down.
 *
 * Counts are keyed by `(minute, database, lane, reason, route, source /24)`,
 * which is exactly the set of questions the platform table answers: which
 * tenant, why, on which route, from which network, since when. Raw addresses
 * are never part of the key; `sourceBucket` truncates to a /24 (v4) or /48
 * (v6) before anything is counted.
 *
 * The flush writes the drained batch as one `record_refusals(jsonb)` call —
 * one statement per window regardless of how many keys it holds.
 *
 * @module refusals
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool, PoolClient } from 'pg';
import { withPgClient } from 'pg-query-context';

import type { CounterEntry, CounterFlusherStats } from './usage-counter';
import { BoundedCounter, CounterFlusher } from './usage-counter';

const log = new Logger('refusals');

/** Which platform surface refused the request. */
export type RefusalLane = 'graphql' | 'sync' | 'static';

/**
 * Why a request was refused. Text in the table rather than an enum, so a new
 * reason is a code change and not a migration; this union is the one list.
 */
export type RefusalReason =
  | 'rate_limited'
  | 'concurrency_saturated'
  | 'queue_timeout'
  | 'request_too_large'
  | 'query_too_deep'
  | 'query_too_costly'
  | 'page_size_too_large'
  | 'anonymous_not_callable'
  | 'route_rate_limited';

export const REFUSAL_REASONS: readonly RefusalReason[] = [
  'rate_limited',
  'concurrency_saturated',
  'queue_timeout',
  'request_too_large',
  'query_too_deep',
  'query_too_costly',
  'page_size_too_large',
  'anonymous_not_callable',
  'route_rate_limited'
];

/** One refused request, as the emitter sees it. */
export interface Refusal {
  /** The tenant refused, or null when the request never resolved one. */
  databaseId: string | null;
  lane: RefusalLane;
  reason: RefusalReason;
  /** `"POST /graphql"`, a route binding id, `host+path` — what the lane keys on. */
  routeKey: string;
  /** The client address as the lane resolved it. Bucketed before it is counted. */
  sourceIp: string | null | undefined;
  /** Epoch ms; defaults to now. */
  at?: number;
}

/** The aggregation key — one `refusal_log` row per distinct value per window. */
export interface RefusalKey {
  /** Epoch ms, truncated to the minute. */
  minuteBucket: number;
  databaseId: string | null;
  lane: RefusalLane;
  reason: RefusalReason;
  routeKey: string;
  sourceBucket: string;
}

/** `source_bucket` when the lane could not resolve an address. */
export const UNKNOWN_SOURCE = 'unknown';
/** `source_bucket` / `route_key` of the fold-down entry once the counter is full. */
export const OVERFLOW_SOURCE = 'overflow';
export const OVERFLOW_ROUTE = '*';

/** A row as `constructive_usage_private.record_refusals(jsonb)` reads it. */
export interface RefusalRow {
  minute_bucket: string;
  database_id: string | null;
  lane: RefusalLane;
  reason: RefusalReason;
  route_key: string;
  source_bucket: string;
  count: number;
  first_seen_at: string;
  last_seen_at: string;
}

export type RefusalSink = (rows: RefusalRow[]) => Promise<void>;

const MINUTE_MS = 60_000;

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/**
 * Reduce a client address to a network prefix: `/24` for IPv4, `/48` for IPv6.
 * Enough to tell "one network hammering an anonymous route" from "the tenant's
 * own users"; not enough to be a person. Anything unparseable is `unknown`.
 */
export const sourceBucket = (ip: string | null | undefined): string => {
  if (!ip) return UNKNOWN_SOURCE;
  let addr = ip.trim();
  if (addr.startsWith('[')) {
    const end = addr.indexOf(']');
    if (end === -1) return UNKNOWN_SOURCE;
    addr = addr.slice(1, end);
  }
  const zone = addr.indexOf('%');
  if (zone !== -1) addr = addr.slice(0, zone);
  if (addr.toLowerCase().startsWith('::ffff:')) {
    const mapped = addr.slice('::ffff:'.length);
    if (IPV4.test(mapped)) addr = mapped;
  }

  const v4 = IPV4.exec(addr);
  if (v4) {
    const octets = v4.slice(1, 5).map(Number);
    if (octets.some((o) => o > 255)) return UNKNOWN_SOURCE;
    return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
  }

  const groups = expandIpv6(addr);
  if (!groups) return UNKNOWN_SOURCE;
  return `${groups[0]}:${groups[1]}:${groups[2]}::/48`;
};

/** The eight hextets of an IPv6 address, or null when it does not parse. */
const expandIpv6 = (addr: string): string[] | null => {
  if (!/^[0-9a-fA-F:]+$/.test(addr) || addr.indexOf(':::') !== -1) return null;
  const halves = addr.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const groups = [...head, ...Array<string>(missing).fill('0'), ...tail];
  if (groups.some((g) => g.length === 0 || g.length > 4)) return null;
  return groups.map((g) => parseInt(g, 16).toString(16));
};

const minuteOf = (at: number): number => Math.floor(at / MINUTE_MS) * MINUTE_MS;

export const refusalKeyOf = (key: RefusalKey): string =>
  `${key.minuteBucket}\u0000${key.databaseId ?? ''}\u0000${key.lane}\u0000${key.reason}\u0000${key.routeKey}\u0000${key.sourceBucket}`;

/**
 * Where a key folds to once the counter is full: same minute, tenant, lane and
 * reason; route and source collapsed. A source-spraying flood therefore costs
 * `maxKeys` entries plus one per `(database, lane, reason)`, the tenant/reason
 * attribution is never lost, and the presence of an `overflow` row is itself
 * the signal that a spray happened.
 */
export const refusalOverflowKey = (key: RefusalKey): RefusalKey => ({
  ...key,
  routeKey: OVERFLOW_ROUTE,
  sourceBucket: OVERFLOW_SOURCE
});

/** Shape a drained batch for `record_refusals(jsonb)`. */
export const refusalRows = (entries: CounterEntry<RefusalKey>[]): RefusalRow[] =>
  entries.map(({ key, count, firstAt, lastAt }) => ({
    minute_bucket: new Date(key.minuteBucket).toISOString(),
    database_id: key.databaseId,
    lane: key.lane,
    reason: key.reason,
    route_key: key.routeKey,
    source_bucket: key.sourceBucket,
    count,
    first_seen_at: new Date(firstAt).toISOString(),
    last_seen_at: new Date(lastAt).toISOString()
  }));

export interface RefusalRecorderOptions {
  /** Where a drained batch goes. See `createRecordRefusalsSink`. */
  sink: RefusalSink;
  /** Base flush interval. Default 10 s. */
  intervalMs?: number;
  /** Jitter added to each interval. Default 2 s. */
  jitterMs?: number;
  /** Distinct keys held per window before folding. Default 2,000. */
  maxKeys?: number;
  /**
   * Failure reporter. Defaults to an error log naming the SQL error and how
   * many refusals were dropped; every failed flush is reported.
   */
  onError?: (err: unknown, dropped: CounterEntry<RefusalKey>[]) => void;
}

export const DEFAULT_REFUSAL_FLUSH_INTERVAL_MS = 10_000;
export const DEFAULT_REFUSAL_FLUSH_JITTER_MS = 2_000;
export const DEFAULT_REFUSAL_MAX_KEYS = 2_000;

const defaultOnError = (err: unknown, dropped: CounterEntry<RefusalKey>[]): void => {
  const refusals = dropped.reduce((sum, e) => sum + e.count, 0);
  const message = err instanceof Error ? err.message : String(err);
  log.error(
    `[refusals] flush failed; dropped ${refusals} refusals across ${dropped.length} keys: ${message}`
  );
};

export interface RefusalRecorderStats {
  keys: number;
  overflowed: number;
  recordFailures: number;
  flusher: CounterFlusherStats;
}

/**
 * `BoundedCounter<RefusalKey>` + `CounterFlusher` + a `record_refusals` sink.
 * Construct one per process, `start()` it, `record()` from every refusal site,
 * `stop()` on shutdown.
 */
export class RefusalRecorder {
  private readonly counter: BoundedCounter<RefusalKey>;
  private readonly flusher: CounterFlusher<RefusalKey>;
  private recordFailures = 0;

  constructor(opts: RefusalRecorderOptions) {
    this.counter = new BoundedCounter<RefusalKey>({
      maxKeys: opts.maxKeys ?? DEFAULT_REFUSAL_MAX_KEYS,
      keyOf: refusalKeyOf,
      overflowKey: refusalOverflowKey
    });
    this.flusher = new CounterFlusher<RefusalKey>(
      this.counter,
      (entries) => opts.sink(refusalRows(entries)),
      {
        intervalMs: opts.intervalMs ?? DEFAULT_REFUSAL_FLUSH_INTERVAL_MS,
        jitterMs: opts.jitterMs ?? DEFAULT_REFUSAL_FLUSH_JITTER_MS,
        onError: opts.onError ?? defaultOnError
      }
    );
  }

  /**
   * Count one refusal. Synchronous and never throws: the request that is
   * being refused must finish being refused whatever state the recorder is in.
   */
  record(refusal: Refusal): void {
    try {
      const at = refusal.at ?? Date.now();
      this.counter.increment(
        {
          minuteBucket: minuteOf(at),
          databaseId: refusal.databaseId,
          lane: refusal.lane,
          reason: refusal.reason,
          routeKey: refusal.routeKey,
          sourceBucket: sourceBucket(refusal.sourceIp)
        },
        1,
        at
      );
    } catch (err) {
      this.recordFailures += 1;
      const message = err instanceof Error ? err.message : String(err);
      log.error(`[refusals] record failed (refusal still served): ${message}`);
    }
  }

  start(): void {
    this.flusher.start();
  }

  /** Final flush, then stop. */
  stop(): Promise<void> {
    return this.flusher.stop();
  }

  /** Drain and write now; a sink failure is reported, never thrown. */
  flush(): Promise<void> {
    return this.flusher.flush();
  }

  stats(): RefusalRecorderStats {
    return {
      keys: this.counter.size,
      overflowed: this.counter.overflowed,
      recordFailures: this.recordFailures,
      flusher: this.flusher.stats()
    };
  }
}

export interface RecordRefusalsSinkOptions {
  /** The platform database's pool. */
  pool: Pool;
  /**
   * The transaction-local claims the flush runs under, resolved by the caller
   * (a service principal plus the platform database id). The function raises
   * if `jwt.claims.user_id` is absent, so a resolver that returns nothing
   * useful fails loudly at the first flush rather than writing unattributed.
   */
  claims: () => Promise<Record<string, string>>;
  /** Default `constructive_usage_private.record_refusals`. */
  functionName?: string;
}

const FUNCTION_NAME = /^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*$/;

/**
 * A sink that writes a batch as one `record_refusals(jsonb)` call inside a
 * transaction carrying the caller's claims. Claims are resolved per flush so a
 * pool that was unreachable at startup does not leave the recorder wedged.
 */
export const createRecordRefusalsSink = (opts: RecordRefusalsSinkOptions): RefusalSink => {
  const fn = opts.functionName ?? 'constructive_usage_private.record_refusals';
  if (!FUNCTION_NAME.test(fn)) {
    throw new Error(`createRecordRefusalsSink: invalid function name ${JSON.stringify(fn)}`);
  }
  const [schema, name] = fn.split('.');
  const sql = `SELECT "${schema}"."${name}"($1::jsonb) AS recorded`;

  return async (rows) => {
    if (rows.length === 0) return;
    const claims = await opts.claims();
    await withPgClient(opts.pool, claims, async (client: PoolClient) => {
      await client.query(sql, [JSON.stringify(rows)]);
    });
  };
};
