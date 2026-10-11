import { createServer } from 'http';
import express from 'express';
import { LRUCache } from 'lru-cache';

/**
 * Regression test for double-disposal of PostGraphile instances.
 *
 * The bug: closeAllCaches() manually disposed each entry via disposeEntry(),
 * which tracked disposal by key string in a Set and deleted the key in a
 * `finally` block. Then graphileCache.clear() triggered the LRU dispose
 * callback for the same entries — but the guard key was already gone, so
 * pgl.release() was called a second time on an already-released instance.
 *
 * The fix: track disposal by entry object reference (WeakSet) so the guard
 * persists across the manual-dispose → clear() sequence.
 */

// ── Helpers ──────────────────────────────────────────────────────────

/** Minimal mock that records release() calls and throws on double-release */
function createMockPgl() {
  let released = false;
  return {
    release: jest.fn(async () => {
      if (released) {
        throw new Error('PostGraphile instance has been released');
      }
      released = true;
    }),
    get isReleased() {
      return released;
    }
  };
}

function createMockEntry(key: string) {
  const pgl = createMockPgl();
  const handler = express();
  const httpServer = createServer(handler);

  return {
    entry: {
      pgl: pgl as any,
      serv: {} as any,
      handler,
      httpServer,
      cacheKey: key,
      createdAt: Date.now()
    },
    pgl
  };
}

// ── Tests ────────────────────────────────────────────────────────────

// We import the real module so the WeakSet-based guard is exercised.
// pg-cache is a workspace dependency that may not resolve in isolation,
// so we mock it along with @pgpmjs/logger.
jest.mock('pg-cache', () => ({
  pgCache: {
    registerCleanupCallback: jest.fn(() => jest.fn()),
    close: jest.fn(async () => {})
  }
}));

jest.mock('@pgpmjs/logger', () => ({
  Logger: class {
    info = jest.fn();
    warn = jest.fn();
    error = jest.fn();
    debug = jest.fn();
    success = jest.fn();
  }
}));

import {
  graphileCache,
  closeAllCaches,
  type GraphileCacheEntry
} from '../src/graphile-cache';

describe('graphile-cache', () => {
  afterEach(async () => {
    // Ensure the cache is clean between tests.
    // closeAllCaches resets the singleton promise, so we can call it again.
    graphileCache.clear();
  });

  describe('closeAllCaches – double-disposal regression', () => {
    it('should call pgl.release() exactly once per entry', async () => {
      const { entry: entry1, pgl: pgl1 } = createMockEntry('api-one');
      const { entry: entry2, pgl: pgl2 } = createMockEntry('api-two');

      graphileCache.set('api-one', entry1 as GraphileCacheEntry);
      graphileCache.set('api-two', entry2 as GraphileCacheEntry);

      await closeAllCaches();

      // Each release should be called exactly once — not twice.
      expect(pgl1.release).toHaveBeenCalledTimes(1);
      expect(pgl2.release).toHaveBeenCalledTimes(1);
    });

    it('should not throw when closeAllCaches triggers LRU dispose after manual disposal', async () => {
      const { entry, pgl } = createMockEntry('api-disposable');
      graphileCache.set('api-disposable', entry as GraphileCacheEntry);

      // This should complete without the mock throwing
      // "PostGraphile instance has been released"
      await expect(closeAllCaches()).resolves.toBeUndefined();
      expect(pgl.release).toHaveBeenCalledTimes(1);
    });

    it('should handle empty cache gracefully', async () => {
      await expect(closeAllCaches()).resolves.toBeUndefined();
    });
  });

  describe('LRU eviction – single disposal', () => {
    it('should dispose entry once on LRU eviction', async () => {
      const { entry, pgl } = createMockEntry('api-evict');
      graphileCache.set('api-evict', entry as GraphileCacheEntry);

      // Delete triggers the LRU dispose callback
      graphileCache.delete('api-evict');

      // Give the async fire-and-forget disposal time to complete
      await new Promise((r) => setTimeout(r, 50));

      expect(pgl.release).toHaveBeenCalledTimes(1);
    });
  });
});
