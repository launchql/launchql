/**
 * admission — the two in-process bounds that decide whether a request is
 * allowed to start at all.
 *
 * `request-protection` resolves the numbers; this module is what spends them.
 * The three GUCs it hands to PostgreSQL bound how *long* one request may run,
 * which is a different question from how *many* may run at once: fifty legal
 * 20-second queries saturate the pool that serves every other tenant on the
 * replica without any single one of them misbehaving. So there are two bounds
 * here, and they protect different things:
 *
 *   - {@link ConcurrencyLimiter} bounds width per tenant. The resource being
 *     protected is *this process's* PostgreSQL pool, so the counter is
 *     deliberately in-process and `maxConcurrentRequests` is a per-replica
 *     budget. Coordinating it cluster-wide would need shared state on the hot
 *     path to bound something that is not shared.
 *
 *   - {@link RateWindow} bounds one caller's rate. A tenant-wide rate limit
 *     cannot answer abuse on a public API: the tenant's own budget is what an
 *     anonymous flood spends, so exhausting it turns the tenant's site off on
 *     the attacker's behalf. The per-caller bound is therefore keyed on the
 *     only discriminator an anonymous request has, and it fails closed —
 *     unlike a billing quota, which serves and records overage.
 *
 * Neither touches the database. A limiter that needs a row lock to decide
 * whether to admit a request has made the saturation it exists to prevent
 * cheaper to cause.
 */

// ─── Concurrency ────────────────────────────────────────────────────────────

/** Why a request was refused a slot. */
export type AdmissionRefusal =
  /** The queue was already full, or the tenant chose not to wait. */
  | 'queue_full'
  /** The request waited `maxQueueWaitMs` and no slot came free. */
  | 'queue_timeout'
  /** The caller gave up (`signal` aborted) while still waiting for a slot. */
  | 'aborted';

/** The outcome of an {@link ConcurrencyLimiter.acquire} call. */
export interface AdmissionLease {
  /** Whether the request may proceed. */
  readonly granted: boolean;
  /** How long the request waited for a slot, in milliseconds. */
  readonly queuedMs: number;
  /** Set when `granted` is false. */
  readonly refusal?: AdmissionRefusal;
  /**
   * Return the slot. Idempotent, and a no-op on a refused lease, so a caller
   * can release unconditionally in a `finally` and again on client abort
   * without double-counting.
   */
  release(): void;
}

/** What a single {@link ConcurrencyLimiter.acquire} is bounded by. */
export interface AdmissionRequest {
  /** In-flight requests allowed for this key in this process. */
  limit: number;
  /** How long a request may wait for a slot. `0` means never queue. */
  queueWaitMs: number;
  /**
   * How many requests may wait at once. Defaults to `limit`: a queue deeper
   * than the number of slots draining it is latency nobody asked for, and an
   * unbounded queue converts a saturated tenant into a memory leak.
   */
  queueLimit?: number;
  /**
   * Fires when the caller no longer wants the slot — a client that hung up
   * while queued. The waiter leaves the queue at once instead of being handed
   * a slot nobody will release.
   */
  signal?: AbortSignal;
}

interface Waiter {
  /** Resolved with `true` when a slot is handed over, `false` on timeout. */
  settle(granted: boolean): void;
  timer: ReturnType<typeof setTimeout>;
}

interface KeyState {
  active: number;
  queue: Waiter[];
}

const REFUSED = (refusal: AdmissionRefusal, queuedMs: number): AdmissionLease => ({
  granted: false,
  queuedMs,
  refusal,
  release: () => {}
});

/**
 * Per-key in-flight counter with a bounded wait queue.
 *
 * A released slot is handed straight to the longest-waiting request rather
 * than decremented and re-acquired, so a queue drains in arrival order and a
 * burst of new arrivals cannot starve what is already waiting.
 */
export class ConcurrencyLimiter {
  private readonly keys = new Map<string, KeyState>();

  /**
   * Take a slot for `key`, waiting up to `queueWaitMs` for one.
   *
   * Always resolves — a refusal is a value, not a throw, because the caller
   * has to answer the client either way.
   */
  async acquire(key: string, request: AdmissionRequest): Promise<AdmissionLease> {
    const limit = Math.floor(request.limit);
    // A non-positive limit is a misconfiguration, not "unlimited": the bounds
    // in request-protection have a floor of 1, so reaching here with 0 means
    // something bypassed them. Refuse rather than silently admit everything.
    if (!Number.isFinite(limit) || limit <= 0) return REFUSED('queue_full', 0);

    const state = this.keys.get(key) ?? { active: 0, queue: [] };
    if (!this.keys.has(key)) this.keys.set(key, state);

    if (state.active < limit) {
      state.active += 1;
      return this.lease(key, state, 0);
    }

    const queueLimit = Math.max(Math.floor(request.queueLimit ?? limit), 0);
    const queueWaitMs = Math.max(request.queueWaitMs, 0);
    if (queueWaitMs === 0 || state.queue.length >= queueLimit) {
      this.evictIfIdle(key, state);
      return REFUSED('queue_full', 0);
    }

    const signal = request.signal;
    if (signal?.aborted) {
      this.evictIfIdle(key, state);
      return REFUSED('aborted', 0);
    }

    const waitStarted = Date.now();
    const granted = await new Promise<boolean>((resolve) => {
      let settled = false;
      const leave = () => {
        const index = state.queue.indexOf(waiter);
        if (index >= 0) state.queue.splice(index, 1);
        waiter.settle(false);
      };
      const waiter: Waiter = {
        settle: (value: boolean) => {
          if (settled) return;
          settled = true;
          clearTimeout(waiter.timer);
          signal?.removeEventListener('abort', leave);
          resolve(value);
        },
        timer: setTimeout(leave, queueWaitMs)
      };
      signal?.addEventListener('abort', leave, { once: true });
      state.queue.push(waiter);
    });

    const queuedMs = Date.now() - waitStarted;
    if (!granted) {
      this.evictIfIdle(key, state);
      return REFUSED(signal?.aborted ? 'aborted' : 'queue_timeout', queuedMs);
    }
    // The slot was transferred by `release`, which left `active` untouched.
    return this.lease(key, state, queuedMs);
  }

  /** In-flight requests currently holding a slot for `key`. */
  activeFor(key: string): number {
    return this.keys.get(key)?.active ?? 0;
  }

  /** Requests currently waiting for a slot for `key`. */
  queuedFor(key: string): number {
    return this.keys.get(key)?.queue.length ?? 0;
  }

  /** How many keys are being tracked — zero once every tenant goes idle. */
  get trackedKeys(): number {
    return this.keys.size;
  }

  private lease(key: string, state: KeyState, queuedMs: number): AdmissionLease {
    let released = false;
    return {
      granted: true,
      queuedMs,
      release: () => {
        if (released) return;
        released = true;
        const next = state.queue.shift();
        if (next) {
          // Hand the slot over instead of freeing it: `active` is unchanged
          // and the woken request owns what this one held.
          next.settle(true);
          return;
        }
        state.active -= 1;
        this.evictIfIdle(key, state);
      }
    };
  }

  /**
   * Drop a key nobody is using, so the map is bounded by *live* tenants rather
   * than by every tenant this replica has ever served.
   */
  private evictIfIdle(key: string, state: KeyState): void {
    if (state.active <= 0 && state.queue.length === 0) this.keys.delete(key);
  }
}

// ─── Per-caller rate ────────────────────────────────────────────────────────

/**
 * Fixed-window request counter keyed by an arbitrary string.
 *
 * Ported from the sync/static gateways (`compute/services/worker/src/rate-window.ts`
 * in constructive-db) rather than reinvented, so both edges refuse abuse the
 * same way.
 */
export class RateWindow {
  private readonly counts = new Map<string, { windowStart: number; count: number }>();

  constructor(
    private readonly windowMs: number = 60_000,
    private readonly maxKeys: number = 10_000
  ) {}

  /**
   * Count one request against `key`; returns false once it is over `limit`.
   *
   * `limit` is per call rather than per instance because it comes from the
   * tenant's settings, and one process serves many tenants.
   */
  admit(key: string, limit: number, burst = 0): boolean {
    const ceiling = Math.floor(limit) + Math.max(Math.floor(burst), 0);
    if (!Number.isFinite(ceiling) || ceiling <= 0) return false;

    const now = Date.now();
    const entry = this.counts.get(key);
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.counts.set(key, { windowStart: now, count: 1 });
      // Opportunistic sweep: drop stale windows so the map stays bounded.
      if (this.counts.size > this.maxKeys) {
        for (const [k, v] of this.counts) {
          if (now - v.windowStart >= this.windowMs) this.counts.delete(k);
        }
      }
      return true;
    }
    entry.count += 1;
    return entry.count <= ceiling;
  }

  /** Milliseconds until `key`'s window rolls over — the `Retry-After` hint. */
  retryAfterMs(key: string): number {
    const entry = this.counts.get(key);
    if (!entry) return 0;
    return Math.max(this.windowMs - (Date.now() - entry.windowStart), 0);
  }
}

/**
 * The caller's address, read as far back through `X-Forwarded-For` as the
 * deployment's own proxies reach — and no further.
 *
 * The header is caller-writable: whatever the client sends arrives at the left
 * of the chain, and each proxy appends the peer it actually saw. So the
 * rightmost entry is the one this deployment's edge observed and the leftmost
 * is the one an abuser gets to choose. Taking the leftmost entry — the usual
 * shape of this code — hands every attacker a fresh rate-limit key per request
 * by sending a random `X-Forwarded-For`, which is worse than having no limiter
 * at all, because it reads as one.
 *
 * `trustedProxyHops` is how many proxies of our own sit in front of the server:
 * 0 means none (only the socket peer is believed, and the header is ignored
 * outright), 1 means one ingress appended the client's address, and so on.
 * Anything the chain cannot supply — an absent header, or a chain too short to
 * have been written by all of them — falls back to the socket peer, which no
 * caller can forge.
 */
export const clientIpFrom = (
  req: {
    headers: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string };
  },
  trustedProxyHops: number
): string => {
  const socketIp = req.socket?.remoteAddress ?? 'unknown';
  if (trustedProxyHops <= 0) return socketIp;

  const header = req.headers['x-forwarded-for'];
  const raw = Array.isArray(header) ? header.join(',') : header;
  if (!raw) return socketIp;

  const chain = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  // A chain with fewer entries than we own proxies cannot have been written by
  // all of them, so the request did not travel the path this number describes
  // and nothing in the header is attributable. Reading its leftmost entry would
  // return exactly the value a direct caller chose.
  if (chain.length < trustedProxyHops) return socketIp;

  // Otherwise walk in from the right by the number of proxies we own: with one
  // ingress a legitimate chain is `[client]` and a forged one is
  // `[forged, client]`, and both resolve to the entry the ingress appended.
  return chain[chain.length - trustedProxyHops];
};

/**
 * How many proxies of our own sit in front of the server.
 *
 * Defaults to 0 — the socket peer, which cannot be forged. A deployment behind
 * an ingress sets `TRUSTED_PROXY_HOPS` to the number of hops it owns; guessing
 * a higher number here would let a direct caller pick its own limiter key.
 */
export const trustedProxyHops = (): number => {
  const raw = Number(process.env.TRUSTED_PROXY_HOPS ?? '');
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
};
