import { clientIpFrom, ConcurrencyLimiter, RateWindow } from '../src/admission';

// ─── Concurrency ────────────────────────────────────────────────────────────

describe('ConcurrencyLimiter', () => {
  it('admits up to the limit without queueing', async () => {
    const limiter = new ConcurrencyLimiter();
    const first = await limiter.acquire('db', { limit: 2, queueWaitMs: 1_000 });
    const second = await limiter.acquire('db', { limit: 2, queueWaitMs: 1_000 });

    expect(first.granted).toBe(true);
    expect(second.granted).toBe(true);
    expect(first.queuedMs).toBe(0);
    expect(limiter.activeFor('db')).toBe(2);
  });

  it('hands a released slot to the waiting request', async () => {
    const limiter = new ConcurrencyLimiter();
    const held = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000 });

    const queued = limiter.acquire('db', { limit: 1, queueWaitMs: 1_000 });
    await Promise.resolve();
    expect(limiter.queuedFor('db')).toBe(1);

    held.release();
    const lease = await queued;
    expect(lease.granted).toBe(true);
    // The slot was transferred, not freed and re-taken.
    expect(limiter.activeFor('db')).toBe(1);
  });

  it('drains the queue in arrival order', async () => {
    const limiter = new ConcurrencyLimiter();
    const held = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000, queueLimit: 4 });

    const order: number[] = [];
    const waiters = [1, 2, 3].map(async (n) => {
      const lease = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000, queueLimit: 4 });
      order.push(n);
      lease.release();
    });
    await Promise.resolve();

    held.release();
    await Promise.all(waiters);
    expect(order).toEqual([1, 2, 3]);
  });

  it('refuses immediately when the tenant chose not to wait', async () => {
    const limiter = new ConcurrencyLimiter();
    await limiter.acquire('db', { limit: 1, queueWaitMs: 0 });

    const refused = await limiter.acquire('db', { limit: 1, queueWaitMs: 0 });
    expect(refused.granted).toBe(false);
    expect(refused.refusal).toBe('queue_full');
    expect(refused.queuedMs).toBe(0);
  });

  it('refuses immediately when the queue is full rather than growing it', async () => {
    const limiter = new ConcurrencyLimiter();
    const request = { limit: 1, queueWaitMs: 1_000, queueLimit: 1 };
    const held = await limiter.acquire('db', request);
    const queued = limiter.acquire('db', request);
    await Promise.resolve();

    const refused = await limiter.acquire('db', request);
    expect(refused.granted).toBe(false);
    expect(refused.refusal).toBe('queue_full');
    expect(limiter.queuedFor('db')).toBe(1);

    held.release();
    (await queued).release();
  });

  it('refuses a request that waited out maxQueueWaitMs', async () => {
    const limiter = new ConcurrencyLimiter();
    const held = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000 });

    const refused = await limiter.acquire('db', { limit: 1, queueWaitMs: 20 });
    expect(refused.granted).toBe(false);
    expect(refused.refusal).toBe('queue_timeout');
    expect(refused.queuedMs).toBeGreaterThanOrEqual(15);
    // The abandoned waiter left the queue rather than lingering to claim a
    // slot nobody is waiting on any more.
    expect(limiter.queuedFor('db')).toBe(0);

    held.release();
  });

  it('does not hand a slot to a waiter that already timed out', async () => {
    const limiter = new ConcurrencyLimiter();
    const held = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000 });

    const refused = await limiter.acquire('db', { limit: 1, queueWaitMs: 10 });
    expect(refused.granted).toBe(false);

    held.release();
    expect(limiter.activeFor('db')).toBe(0);

    // The next arrival gets the slot straight away.
    const lease = await limiter.acquire('db', { limit: 1, queueWaitMs: 0 });
    expect(lease.granted).toBe(true);
  });

  it('drops a waiter whose caller gave up, and never hands it the slot', async () => {
    const limiter = new ConcurrencyLimiter();
    const held = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000 });

    const gone = new AbortController();
    const waiting = limiter.acquire('db', { limit: 1, queueWaitMs: 1_000, signal: gone.signal });
    expect(limiter.queuedFor('db')).toBe(1);

    gone.abort();
    const refused = await waiting;
    expect(refused.granted).toBe(false);
    expect(refused.refusal).toBe('aborted');
    expect(limiter.queuedFor('db')).toBe(0);

    held.release();
    expect(limiter.activeFor('db')).toBe(0);

    const lease = await limiter.acquire('db', { limit: 1, queueWaitMs: 0 });
    expect(lease.granted).toBe(true);
  });

  it('refuses at once when the caller had already given up', async () => {
    const limiter = new ConcurrencyLimiter();
    const held = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000 });

    const gone = new AbortController();
    gone.abort();
    const refused = await limiter.acquire('db', { limit: 1, queueWaitMs: 1_000, signal: gone.signal });
    expect(refused.granted).toBe(false);
    expect(refused.refusal).toBe('aborted');
    expect(limiter.queuedFor('db')).toBe(0);

    held.release();
  });

  it('counts each database separately', async () => {
    const limiter = new ConcurrencyLimiter();
    const a = await limiter.acquire('a', { limit: 1, queueWaitMs: 0 });
    const b = await limiter.acquire('b', { limit: 1, queueWaitMs: 0 });

    expect(a.granted).toBe(true);
    expect(b.granted).toBe(true);
    expect((await limiter.acquire('a', { limit: 1, queueWaitMs: 0 })).granted).toBe(false);
    expect(limiter.activeFor('b')).toBe(1);
  });

  it('release is idempotent, so a double release cannot free a slot twice', async () => {
    const limiter = new ConcurrencyLimiter();
    const first = await limiter.acquire('db', { limit: 2, queueWaitMs: 0 });
    await limiter.acquire('db', { limit: 2, queueWaitMs: 0 });

    first.release();
    first.release();
    expect(limiter.activeFor('db')).toBe(1);
  });

  it('forgets a database once it goes idle', async () => {
    const limiter = new ConcurrencyLimiter();
    const lease = await limiter.acquire('db', { limit: 1, queueWaitMs: 0 });
    expect(limiter.trackedKeys).toBe(1);

    lease.release();
    expect(limiter.trackedKeys).toBe(0);
  });

  it('forgets a database whose only arrivals were refused', async () => {
    const limiter = new ConcurrencyLimiter();
    const lease = await limiter.acquire('db', { limit: 1, queueWaitMs: 0 });
    await limiter.acquire('db', { limit: 1, queueWaitMs: 0 });
    lease.release();

    expect(limiter.trackedKeys).toBe(0);
  });

  it('refuses rather than admitting everything when the limit is unusable', async () => {
    const limiter = new ConcurrencyLimiter();
    expect((await limiter.acquire('db', { limit: 0, queueWaitMs: 0 })).granted).toBe(false);
    expect((await limiter.acquire('db', { limit: NaN, queueWaitMs: 0 })).granted).toBe(false);
    expect(limiter.trackedKeys).toBe(0);
  });
});

// ─── Rate ───────────────────────────────────────────────────────────────────

describe('RateWindow', () => {
  it('admits up to limit + burst and refuses past it', () => {
    const window = new RateWindow(60_000);
    for (let i = 0; i < 12; i++) {
      expect(window.admit('caller', 10, 2)).toBe(true);
    }
    expect(window.admit('caller', 10, 2)).toBe(false);
  });

  it('counts each key separately', () => {
    const window = new RateWindow(60_000);
    expect(window.admit('a', 1, 0)).toBe(true);
    expect(window.admit('a', 1, 0)).toBe(false);
    expect(window.admit('b', 1, 0)).toBe(true);
  });

  it('starts a fresh window once the old one elapses', async () => {
    const window = new RateWindow(20);
    expect(window.admit('caller', 1, 0)).toBe(true);
    expect(window.admit('caller', 1, 0)).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(window.admit('caller', 1, 0)).toBe(true);
  });

  it('fails closed on an unusable limit', () => {
    const window = new RateWindow(60_000);
    expect(window.admit('caller', 0, 0)).toBe(false);
    expect(window.admit('caller', NaN, 0)).toBe(false);
  });

  it('reports the remaining window as the retry hint', () => {
    const window = new RateWindow(60_000);
    expect(window.retryAfterMs('caller')).toBe(0);
    window.admit('caller', 1, 0);
    expect(window.retryAfterMs('caller')).toBeGreaterThan(50_000);
  });

  it('sweeps stale windows instead of growing without bound', () => {
    const window = new RateWindow(0, 2);
    window.admit('a', 5, 0);
    window.admit('b', 5, 0);
    window.admit('c', 5, 0);
    // Every window is already stale at windowMs=0, so the sweep clears the
    // map down to the key that triggered it.
    expect(window.retryAfterMs('a')).toBe(0);
  });
});

// ─── Client address ─────────────────────────────────────────────────────────

describe('clientIpFrom', () => {
  const req = (xff?: string | string[], remoteAddress = '10.0.0.1') => ({
    headers: xff === undefined ? {} : { 'x-forwarded-for': xff },
    socket: { remoteAddress }
  });

  it('ignores the header entirely when no proxy is trusted', () => {
    expect(clientIpFrom(req('1.2.3.4'), 0)).toBe('10.0.0.1');
  });

  it('reads the entry our own proxy appended, not the one the caller sent', () => {
    // The caller forged '9.9.9.9'; our single ingress appended '1.2.3.4'.
    expect(clientIpFrom(req('9.9.9.9, 1.2.3.4'), 1)).toBe('1.2.3.4');
  });

  it('walks back one entry per trusted hop', () => {
    expect(clientIpFrom(req('9.9.9.9, 1.2.3.4, 172.16.0.1'), 2)).toBe('1.2.3.4');
  });

  it('falls back to the socket peer when the header is absent or empty', () => {
    expect(clientIpFrom(req(undefined), 1)).toBe('10.0.0.1');
    expect(clientIpFrom(req('  ,  '), 1)).toBe('10.0.0.1');
  });

  it('believes a chain exactly as long as the hop count', () => {
    // One ingress, nothing forged: the chain is the single entry it appended.
    expect(clientIpFrom(req('1.2.3.4'), 1)).toBe('1.2.3.4');
  });

  it('ignores a chain shorter than the hop count rather than reading its head', () => {
    // Fewer proxies wrote this than we own, so no entry is attributable and the
    // leftmost one is whatever a direct caller chose to send.
    expect(clientIpFrom(req('1.2.3.4'), 3)).toBe('10.0.0.1');
  });

  it('joins a repeated header before splitting it', () => {
    expect(clientIpFrom(req(['9.9.9.9', '1.2.3.4']), 1)).toBe('1.2.3.4');
  });

  it('reports an unknown peer rather than throwing', () => {
    expect(clientIpFrom({ headers: {}, socket: {} }, 0)).toBe('unknown');
  });
});
