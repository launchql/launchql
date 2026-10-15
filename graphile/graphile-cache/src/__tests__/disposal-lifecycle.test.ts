jest.mock('@pgpmjs/logger', () => ({
  Logger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

import type { GraphileCacheEntry } from '../graphile-cache';
import {
  clearGraphileCache,
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
