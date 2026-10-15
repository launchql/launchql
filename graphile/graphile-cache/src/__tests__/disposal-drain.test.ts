import { pgCache } from 'pg-cache';

import {
  clearGraphileCache,
  closeAllCaches,
  disposeUncachedEntry,
  graphileCache,
  waitForActiveDisposals,
  type GraphileCacheEntry
} from '../graphile-cache';

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
