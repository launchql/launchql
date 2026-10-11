import { pgCache } from 'pg-cache';

import {
  clearGraphileCache,
  closeAllCaches,
  disposeUncachedEntry,
  graphileCache,
  type GraphileCacheEntry,
  waitForActiveDisposals,
  waitForEntryDisposal} from '../graphile-cache';

const entry = (key: string, release: () => Promise<void>): GraphileCacheEntry => ({
  cacheKey: key, createdAt: Date.now(), pgl: { release },
  serv: {}, handler: {}, httpServer: { listening: false }
} as unknown as GraphileCacheEntry);

afterEach(async () => {
  jest.restoreAllMocks();
  await clearGraphileCache();
});

it('reports already-settled failures to concurrent drains without repeating acknowledged failures', async () => {
  const failure = new Error('release failed');
  const failed = entry('failed', async () => { throw failure; });
  await expect(disposeUncachedEntry(failed)).rejects.toBe(failure);
  const drains = [waitForActiveDisposals(), waitForActiveDisposals()];
  await Promise.all(drains.map(drain => expect(drain).rejects.toBe(failure)));
  await expect(waitForActiveDisposals()).resolves.toBeUndefined();
  await expect(disposeUncachedEntry(failed)).rejects.toBe(failure);
  await expect(waitForEntryDisposal(failed)).rejects.toBe(failure);
  await expect(waitForActiveDisposals()).resolves.toBeUndefined();
});

it('reports multiple generations in scheduling order and attempts every resource', async () => {
  const stopFailure = new Error('stop failed');
  const releaseFailure = new Error('release failed');
  const laterFailure = new Error('later failed');
  const first = entry('first', async () => { throw releaseFailure; });
  first.realtimeManager = { stop: async () => { throw stopFailure; } };
  first.releasePresetServices = jest.fn().mockResolvedValue(undefined);
  const firstDisposal = disposeUncachedEntry(first);
  const later = disposeUncachedEntry(entry('later', async () => { throw laterFailure; }));
  await expect(firstDisposal).rejects.toMatchObject({ errors: [stopFailure, releaseFailure] });
  await expect(later).rejects.toBe(laterFailure);
  await expect(waitForActiveDisposals()).rejects.toMatchObject({
    errors: [expect.objectContaining({ errors: [stopFailure, releaseFailure] }), laterFailure]
  });
  expect(first.releasePresetServices).toHaveBeenCalledTimes(1);
});

it('leaves work scheduled after the drain boundary for the next caller', async () => {
  let finishFirst!: () => void;
  let finishLater!: () => void;
  const first = disposeUncachedEntry(entry('first', () => new Promise(resolve => { finishFirst = resolve; })));
  const drain = waitForActiveDisposals();
  const later = disposeUncachedEntry(entry('later', () => new Promise(resolve => { finishLater = resolve; })));
  finishFirst();
  await drain;
  await first;
  let laterDrained = false;
  const next = waitForActiveDisposals().then(() => { laterDrained = true; });
  await new Promise(resolve => setImmediate(resolve));
  expect(laterDrained).toBe(false);
  finishLater();
  await Promise.all([next, later]);
});

it('still closes pools when cache cleanup fails', async () => {
  const failure = new Error('generation failed');
  const poolFailure = new Error('pool failed');
  graphileCache.set('failed', entry('failed', async () => { throw failure; }));
  const close = jest.spyOn(pgCache, 'close').mockRejectedValue(poolFailure);
  await expect(closeAllCaches()).rejects.toMatchObject({ errors: [failure, poolFailure] });
  expect(close).toHaveBeenCalledTimes(1);
});

it('includes synchronous reentrant disposal scheduled while clearing residents', async () => {
  const failure = new Error('nested release failed');
  const nested = entry('nested', async () => { throw failure; });
  graphileCache.set('outer', entry('outer', () => disposeUncachedEntry(nested)));
  await expect(clearGraphileCache()).rejects.toMatchObject({ errors: [failure, failure] });
});

it('preserves a close callback error and still releases the remaining resources', async () => {
  const failure = new Error('server close failed');
  const release = jest.fn().mockResolvedValue(undefined);
  const resident = entry('server', release);
  resident.httpServer = { listening: true, close: (callback: (error: Error) => void) => callback(failure) } as any;
  await expect(disposeUncachedEntry(resident)).rejects.toBe(failure);
  expect(release).toHaveBeenCalledTimes(1);
  await expect(waitForActiveDisposals()).rejects.toBe(failure);
});

it('aggregates all resource failures in release order, including synchronous throws', async () => {
  const failures = ['http', 'realtime', 'postgraphile', 'services'].map(name => new Error(name));
  const events: string[] = [];
  const resident = entry('all-fail', () => { events.push('postgraphile'); throw failures[2]; });
  resident.httpServer = {
    listening: true, close: () => { events.push('http'); throw failures[0]; },
  } as any;
  resident.realtimeManager = { stop: () => { events.push('realtime'); return Promise.reject(failures[1]); } };
  resident.releasePresetServices = () => { events.push('services'); throw failures[3]; };
  const pending = disposeUncachedEntry(resident);
  await expect(pending).rejects.toMatchObject({ errors: failures });
  expect(events).toEqual(['http', 'realtime', 'postgraphile', 'services']);
  expect(disposeUncachedEntry(resident)).toBe(pending);
  await expect(waitForActiveDisposals()).rejects.toMatchObject({ errors: failures });
});

it('keeps later settled failures for the next drain and shares pending failures with concurrent drains', async () => {
  let failFirst!: (error: unknown) => void;
  const firstFailure = new Error('first');
  const laterFailure = new Error('later');
  const first = disposeUncachedEntry(entry('first', () => new Promise((_, reject) => { failFirst = reject; })));
  const drain = waitForActiveDisposals();
  const peer = waitForActiveDisposals();
  const later = disposeUncachedEntry(entry('later', () => Promise.reject(laterFailure)));
  await expect(later).rejects.toBe(laterFailure);
  failFirst(firstFailure);
  await Promise.all([first, drain, peer].map(pending => expect(pending).rejects.toBe(firstFailure)));
  await expect(waitForActiveDisposals()).rejects.toBe(laterFailure);
  await expect(waitForActiveDisposals()).resolves.toBeUndefined();
});

it('shares a close promise, waits for evicted and resident entries before pools, and allows a later close', async () => {
  let finish!: () => void;
  const evicted = entry('evicted', () => new Promise(resolve => { finish = resolve; }));
  graphileCache.set(evicted.cacheKey, evicted);
  graphileCache.delete(evicted.cacheKey);
  const release = jest.fn().mockResolvedValue(undefined);
  const resident = entry('resident', release);
  graphileCache.set(resident.cacheKey, resident);
  const close = jest.spyOn(pgCache, 'close').mockResolvedValue(undefined);
  const pending = closeAllCaches();
  expect(closeAllCaches()).toBe(pending);
  await new Promise(resolve => setImmediate(resolve));
  expect(close).not.toHaveBeenCalled();
  finish();
  await pending;
  expect(close).toHaveBeenCalledTimes(1);
  expect(release).toHaveBeenCalledTimes(1);
  await closeAllCaches();
  expect(close).toHaveBeenCalledTimes(2);
  expect(release).toHaveBeenCalledTimes(1);
});

it('preserves a single generation failure after attempting successful pool cleanup', async () => {
  const failure = new Error('release');
  graphileCache.set('failed', entry('failed', () => Promise.reject(failure)));
  const close = jest.spyOn(pgCache, 'close').mockResolvedValue(undefined);
  await expect(closeAllCaches()).rejects.toBe(failure);
  expect(close).toHaveBeenCalledTimes(1);
  await expect(closeAllCaches()).resolves.toBeUndefined();
});

it('preserves an undefined rejection reason in a drain', async () => {
  await expect(disposeUncachedEntry(entry('undefined', () => Promise.reject(undefined)))).rejects.toBeUndefined();
  await expect(waitForActiveDisposals()).rejects.toBeUndefined();
});
