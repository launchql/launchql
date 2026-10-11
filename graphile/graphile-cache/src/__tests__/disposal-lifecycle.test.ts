jest.mock('@pgpmjs/logger', () => ({
  Logger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

import type { GraphileCacheEntry } from '../graphile-cache';
import {
  cacheEvents,
  clearGraphileCache,
  clearMatchingEntries,
  disposeUncachedEntry,
  graphileCache,
  waitForEntryDisposal,
} from '../graphile-cache';

interface Deferred<T> {
  promise: Promise<T>;
  resolve(value: T): void;
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

const makeEntry = (
  cacheKey: string,
  release = jest.fn().mockResolvedValue(undefined),
  releasePresetServices = jest.fn().mockResolvedValue(undefined)
): GraphileCacheEntry =>
  ({
    pgl: { release },
    serv: {},
    handler: {},
    httpServer: { listening: false },
    cacheKey,
    createdAt: Date.now(),
    releasePresetServices,
  }) as unknown as GraphileCacheEntry;

describe('Graphile cache disposal lifecycle', () => {
  afterEach(async () => {
    await clearGraphileCache();
  });

  it('coalesces concurrent disposal of one exact entry', async () => {
    const release = jest.fn().mockResolvedValue(undefined);
    const releasePresetServices = jest.fn().mockResolvedValue(undefined);
    const entry = makeEntry('same-entry', release, releasePresetServices);

    const first = disposeUncachedEntry(entry);
    const second = disposeUncachedEntry(entry);

    expect(second).toBe(first);
    await Promise.all([first, second]);
    expect(release).toHaveBeenCalledTimes(1);
    expect(releasePresetServices).toHaveBeenCalledTimes(1);
    expect(disposeUncachedEntry(entry)).toBe(first);
    expect(waitForEntryDisposal(entry)).toBe(first);
  });

  it('returns a resolved void promise without scheduling an un-disposed entry', async () => {
    const release = jest.fn();
    const entry = makeEntry('not-scheduled', release);
    const waiting: Promise<void> = waitForEntryDisposal(entry);
    await expect(waiting).resolves.toBeUndefined();
    expect(release).not.toHaveBeenCalled();
  });

  it('publishes the same disposal promise before synchronous resource callbacks run', async () => {
    let reentrant: Promise<void> | undefined;
    const release = jest.fn(() => { reentrant = disposeUncachedEntry(entry); });
    const entry = makeEntry('reentrant', release);
    const pending = disposeUncachedEntry(entry);
    expect(reentrant).toBe(pending);
    await pending;
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('releases same-key cache replacements while the old generation is still pending', async () => {
    const oldRelease = deferred<void>();
    const old = makeEntry('replacement', jest.fn(() => oldRelease.promise));
    const current = makeEntry('replacement');
    graphileCache.set(old.cacheKey, old);
    graphileCache.set(current.cacheKey, current);
    const first = waitForEntryDisposal(old);
    expect(old.pgl.release).toHaveBeenCalledTimes(1);
    expect(current.pgl.release).not.toHaveBeenCalled();
    graphileCache.delete(current.cacheKey);
    const second = waitForEntryDisposal(current);
    expect(second).not.toBe(first);
    await second;
    expect(current.pgl.release).toHaveBeenCalledTimes(1);
    oldRelease.resolve();
    await first;
  });

  it('routes LRU eviction and manual matching deletion through tracked cleanup', async () => {
    const evicted = makeEntry('capacity:first');
    const events: string[] = [];
    const onEviction = jest.fn(event => { events.push(event.reason); });
    cacheEvents.onEviction(onEviction);
    try {
      graphileCache.set(evicted.cacheKey, evicted);
      for (let i = 0; i < graphileCache.max; i++) {
        const entry = makeEntry(`capacity:${i}`);
        graphileCache.set(entry.cacheKey, entry);
      }
      await waitForEntryDisposal(evicted);
      expect(evicted.pgl.release).toHaveBeenCalledTimes(1);
      expect(events).toEqual(['lru']);
      expect(clearMatchingEntries(/^capacity:/)).toBe(graphileCache.max);
      await clearGraphileCache();
      expect(events.slice(1)).toEqual(Array(graphileCache.max).fill('manual'));
    } finally {
      cacheEvents.removeListener('eviction', onEviction);
    }
  });

  it('disposes distinct generations that reuse the same cache key', async () => {
    const firstRelease = jest.fn().mockResolvedValue(undefined);
    const secondRelease = jest.fn().mockResolvedValue(undefined);
    const first = makeEntry('shared-key', firstRelease);
    const second = makeEntry('shared-key', secondRelease);

    await Promise.all([
      disposeUncachedEntry(first),
      disposeUncachedEntry(second),
    ]);

    expect(firstRelease).toHaveBeenCalledTimes(1);
    expect(secondRelease).toHaveBeenCalledTimes(1);
  });

  it('continues cleanup and exposes the first disposal failure', async () => {
    const failure = new Error('realtime stop failed');
    const release = jest.fn().mockResolvedValue(undefined);
    const releasePresetServices = jest.fn().mockResolvedValue(undefined);
    const entry = makeEntry('failed-cleanup', release, releasePresetServices);
    entry.realtimeManager = { stop: jest.fn().mockRejectedValue(failure) };

    await expect(disposeUncachedEntry(entry)).rejects.toBe(failure);
    expect(release).toHaveBeenCalledTimes(1);
    expect(releasePresetServices).toHaveBeenCalledTimes(1);
    await expect(clearGraphileCache()).rejects.toBe(failure);
  });

  it('lets callers await an eviction through the exact entry', async () => {
    const release = deferred<void>();
    const releasePresetServices = jest.fn().mockResolvedValue(undefined);
    const entry = makeEntry(
      'evicted-entry',
      jest.fn(() => release.promise),
      releasePresetServices
    );
    graphileCache.set(entry.cacheKey, entry);
    graphileCache.delete(entry.cacheKey);

    let disposed = false;
    const waiting = waitForEntryDisposal(entry).then(() => {
      disposed = true;
    });
    await flushPromises();
    expect(disposed).toBe(false);

    release.resolve(undefined);
    await waiting;
    expect(disposed).toBe(true);
    expect(releasePresetServices).toHaveBeenCalledTimes(1);
  });

  it('does not resolve a cache clear before resident disposal completes', async () => {
    const release = deferred<void>();
    const entry = makeEntry(
      'clear-entry',
      jest.fn(() => release.promise)
    );
    graphileCache.set(entry.cacheKey, entry);

    let cleared = false;
    const clearing = clearGraphileCache().then(() => {
      cleared = true;
    });
    await flushPromises();
    expect(graphileCache.size).toBe(0);
    expect(cleared).toBe(false);

    release.resolve(undefined);
    await clearing;
    expect(cleared).toBe(true);
  });

  it('leaves a same-key replacement published after clear for the next clear', async () => {
    const gate = deferred<void>();
    const old = makeEntry('during-clear', jest.fn(() => gate.promise));
    const replacement = makeEntry(old.cacheKey);
    graphileCache.set(old.cacheKey, old);
    const clearing = clearGraphileCache();
    graphileCache.set(replacement.cacheKey, replacement);
    gate.resolve();
    await clearing;
    expect(graphileCache.get(replacement.cacheKey)).toBe(replacement);
    expect(replacement.pgl.release).not.toHaveBeenCalled();
    await clearGraphileCache();
    expect(replacement.pgl.release).toHaveBeenCalledTimes(1);
  });

  it('does not complete entry disposal before preset services are released', async () => {
    const releasePresetServices = deferred<void>();
    const entry = makeEntry(
      'delayed-preset-service',
      jest.fn().mockResolvedValue(undefined),
      jest.fn(() => releasePresetServices.promise)
    );
    graphileCache.set(entry.cacheKey, entry);

    graphileCache.delete(entry.cacheKey);
    const disposal = waitForEntryDisposal(entry);
    let disposed = false;
    void disposal.then(() => {
      disposed = true;
    });

    await flushPromises();
    expect(disposed).toBe(false);

    releasePresetServices.resolve(undefined);
    await disposal;
    expect(disposed).toBe(true);
  });

  it('disposes a new generation after an older same-key generation fails', async () => {
    const firstFailure = new Error('first generation release failed');
    const firstRelease = jest.fn().mockRejectedValue(firstFailure);
    const secondRelease = jest.fn().mockResolvedValue(undefined);
    const first = makeEntry('retry-by-generation', firstRelease);
    const second = makeEntry('retry-by-generation', secondRelease);

    await expect(disposeUncachedEntry(first)).rejects.toBe(firstFailure);
    await expect(disposeUncachedEntry(second)).resolves.toBeUndefined();

    expect(firstRelease).toHaveBeenCalledTimes(1);
    expect(secondRelease).toHaveBeenCalledTimes(1);
    await expect(clearGraphileCache()).rejects.toBe(firstFailure);
  });
});
