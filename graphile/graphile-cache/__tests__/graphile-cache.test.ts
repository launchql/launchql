const MiB = 1024 * 1024;
process.env.GRAPHILE_CACHE_MAX_HEAP_BYTES = String(10 * MiB);

import type { GraphileCacheEntry } from '../src';
import {
  cacheGraphileInstance,
  closeAllCaches,
  getCacheStats,
  graphileCache,
  GraphileCacheBudgetError} from '../src';

const entry = (cacheKey: string, heapBytes: number) => {
  const release = jest.fn(async (): Promise<void> => undefined);
  return {
    release,
    entry: {
      cacheKey,
      heapBytes,
      createdAt: Date.now(),
      pgl: { release },
      httpServer: { listening: false }
    } as unknown as GraphileCacheEntry
  };
};

const settle = () => new Promise((resolve) => setImmediate(resolve));

afterEach(async () => {
  await closeAllCaches();
});

describe('graphile cache heap budget', () => {
  it('evicts least-recently-used handlers before their heap exceeds the budget', async () => {
    const handlers = ['a', 'b', 'c'].map((key) => entry(key, 4 * MiB));
    for (const { entry: e } of handlers) {
      await cacheGraphileInstance(e.cacheKey, e);
    }
    await settle();

    expect([...graphileCache.keys()].sort()).toEqual(['b', 'c']);
    expect(getCacheStats()).toMatchObject({
      heapBytes: 8 * MiB,
      maxHeapBytes: 10 * MiB
    });
    expect(handlers[0].release).toHaveBeenCalledTimes(1);
    expect(handlers[1].release).not.toHaveBeenCalled();
  });

  it('releases and rejects a handler that alone exceeds the budget', async () => {
    const small = entry('small', 2 * MiB);
    await cacheGraphileInstance('small', small.entry);
    const huge = entry('huge', 11 * MiB);

    await expect(cacheGraphileInstance('huge', huge.entry)).rejects.toThrow(
      GraphileCacheBudgetError
    );

    expect(huge.release).toHaveBeenCalledTimes(1);
    expect(graphileCache.has('huge')).toBe(false);
    expect(graphileCache.has('small')).toBe(true);
  });

  it('releases each handler exactly once when closing all caches', async () => {
    const handlers = ['x', 'y'].map((key) => entry(key, MiB));
    for (const { entry: e } of handlers) {
      await cacheGraphileInstance(e.cacheKey, e);
    }

    await closeAllCaches();

    expect(graphileCache.size).toBe(0);
    for (const { release } of handlers) {
      expect(release).toHaveBeenCalledTimes(1);
    }
  });
});
