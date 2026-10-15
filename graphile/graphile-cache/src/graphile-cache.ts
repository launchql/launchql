import { getHeapStatistics } from 'node:v8';

import { Logger } from '@pgpmjs/logger';
import { parseEnvNumber } from '12factor-env';
import { EventEmitter } from 'events';
import type { Express } from 'express';
import type { GrafservBase } from 'grafserv';
import type { Server as HttpServer } from 'http';
import { LRUCache } from 'lru-cache';
import { pgCache } from 'pg-cache';
import type { PostGraphileInstance } from 'postgraphile';

const log = new Logger('graphile-cache');

// --- Time Constants ---
export const ONE_HOUR_MS = 1000 * 60 * 60;
export const FIVE_MINUTES_MS = 1000 * 60 * 5;
const ONE_DAY = ONE_HOUR_MS * 24;
const ONE_YEAR = ONE_DAY * 366;

// --- Eviction Types ---
export type EvictionReason = 'lru' | 'ttl' | 'manual';

// --- Cache Event Emitter ---
export interface CacheEvictionEvent {
  key: string;
  reason: EvictionReason;
  entry: GraphileCacheEntry;
}

export class CacheEventEmitter extends EventEmitter {
  emitEviction(event: CacheEvictionEvent): void {
    this.emit('eviction', event);
  }

  onEviction(handler: (event: CacheEvictionEvent) => void): void {
    this.on('eviction', handler);
  }
}

export const cacheEvents = new CacheEventEmitter();

// --- Cache Configuration ---
export interface CacheConfig {
  max: number;
  ttl: number;
  /** Total measured heap the cached handlers may retain, in bytes. */
  maxHeapBytes: number;
}

/** Floor for an entry's measured heap so a GC during its build cannot make it free. */
export const MIN_ENTRY_HEAP_BYTES = 1024 * 1024;

const defaultMaxHeapBytes = (): number =>
  Math.floor(getHeapStatistics().heap_size_limit / 2);

/**
 * Get cache configuration from environment variables
 *
 * Supports:
 * - GRAPHILE_CACHE_MAX: Maximum number of entries (default: 50)
 * - GRAPHILE_CACHE_MAX_HEAP_BYTES: Total measured heap the cached handlers may
 *   retain (default: half of V8's heap limit, so the cache cannot fill the heap)
 * - GRAPHILE_CACHE_TTL_MS: TTL in milliseconds
 *   - Production default: ONE_YEAR
 *   - Development default: FIVE_MINUTES_MS
 *
 * NOTE: This value should be <= PG_CACHE_MAX (also default: 50) so that
 * every cached PostGraphile instance has a live pool backing it.
 */
export function getCacheConfig(): CacheConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const max = parseEnvNumber(process.env.GRAPHILE_CACHE_MAX) ?? 50;

  const ttl =
    parseEnvNumber(process.env.GRAPHILE_CACHE_TTL_MS) ??
    (isDevelopment ? FIVE_MINUTES_MS : ONE_YEAR);

  const maxHeapBytes =
    parseEnvNumber(process.env.GRAPHILE_CACHE_MAX_HEAP_BYTES) ?? defaultMaxHeapBytes();

  return { max, ttl, maxHeapBytes };
}

/**
 * Cache entry for PostGraphile v5 instances
 *
 * Each entry contains:
 * - pgl: The PostGraphile instance (manages schema, plugins, etc.)
 * - serv: The Grafserv server instance (handles HTTP/WS)
 * - handler: Express app for routing requests
 * - httpServer: Node HTTP server (required by grafserv)
 * - cacheKey: Unique identifier for this entry
 * - createdAt: Timestamp when this entry was created
 * - heapBytes: Heap retained by building this entry; the cache's size unit
 */
export interface GraphileCacheEntry {
  pgl: PostGraphileInstance;
  serv: GrafservBase;
  handler: Express;
  httpServer: HttpServer;
  cacheKey: string;
  createdAt: number;
  heapBytes: number;
  /** Optional RealtimeManager for cursor-tracked subscription delivery */
  realtimeManager?: { stop(): Promise<void> } | null;
}

// Track keys that are being manually evicted for accurate eviction reason
const manualEvictionKeys = new Set<string>();

// One disposal per entry: closeAllCaches() and the LRU dispose callback both
// dispose the same entry, and PostGraphile throws if released twice.
const disposals = new WeakMap<GraphileCacheEntry, Promise<void>>();

/**
 * Dispose a PostGraphile v5 cache entry
 *
 * Properly releases resources by:
 * 1. Closing the HTTP server if listening
 * 2. Releasing the PostGraphile instance (which internally releases grafserv)
 */
const releaseEntry = async (entry: GraphileCacheEntry, key: string): Promise<void> => {
  log.debug(`Disposing PostGraphile[${key}]`);
  try {
    // Close HTTP server if it's listening
    if (entry.httpServer?.listening) {
      await new Promise<void>((resolve) => {
        entry.httpServer.close(() => resolve());
      });
    }
    // Stop RealtimeManager if present (before releasing PostGraphile)
    if (entry.realtimeManager) {
      try {
        await entry.realtimeManager.stop();
      } catch (err) {
        log.error(`Error stopping RealtimeManager for PostGraphile[${key}]:`, err);
      }
    }
    // Release PostGraphile instance (this also releases grafserv internally)
    if (entry.pgl) {
      await entry.pgl.release();
    }
  } catch (err) {
    log.error(`Error disposing PostGraphile[${key}]:`, err);
  }
};

const disposeEntry = (entry: GraphileCacheEntry, key: string): Promise<void> => {
  let disposal = disposals.get(entry);
  if (!disposal) {
    disposal = releaseEntry(entry, key);
    disposals.set(entry, disposal);
  }
  return disposal;
};

/**
 * Determine the eviction reason for a cache entry
 */
const getEvictionReason = (key: string, entry: GraphileCacheEntry): EvictionReason => {
  if (manualEvictionKeys.has(key)) {
    manualEvictionKeys.delete(key);
    return 'manual';
  }

  // Check if TTL expired
  const age = Date.now() - entry.createdAt;
  const config = getCacheConfig();
  if (age >= config.ttl) {
    return 'ttl';
  }

  return 'lru';
};

// Get initial cache configuration
const initialConfig = getCacheConfig();

// --- Graphile Cache ---
export const graphileCache = new LRUCache<string, GraphileCacheEntry>({
  max: initialConfig.max,
  ttl: initialConfig.ttl,
  maxSize: initialConfig.maxHeapBytes,
  sizeCalculation: (entry) => entry.heapBytes,
  updateAgeOnGet: true,
  dispose: (entry, key) => {
    // Determine eviction reason before disposal
    const reason = getEvictionReason(key, entry);

    // Emit eviction event
    cacheEvents.emitEviction({ key, reason, entry });

    log.debug(`Evicting PostGraphile[${key}] (reason: ${reason})`);

    // LRU dispose is synchronous, but v5 disposal is async
    // Fire and forget the async cleanup
    disposeEntry(entry, key).catch((err) => {
      log.error(`Failed to dispose PostGraphile[${key}]:`, err);
    });
  }
});

export class GraphileCacheBudgetError extends Error {
  constructor(
    readonly cacheKey: string,
    readonly heapBytes: number,
    readonly maxHeapBytes: number
  ) {
    super(
      `PostGraphile[${cacheKey}] retains ${heapBytes} heap bytes, more than the ${maxHeapBytes}-byte graphile cache budget`
    );
    this.name = 'GraphileCacheBudgetError';
  }
}

/**
 * Cache a newly built handler, evicting least-recently-used handlers until the
 * measured heap of all cached handlers fits the budget. A handler that alone
 * exceeds the budget is released and rejected instead of being served uncached.
 */
export async function cacheGraphileInstance(
  key: string,
  entry: GraphileCacheEntry
): Promise<void> {
  if (entry.heapBytes > graphileCache.maxEntrySize) {
    await disposeEntry(entry, key);
    throw new GraphileCacheBudgetError(key, entry.heapBytes, graphileCache.maxEntrySize);
  }
  graphileCache.set(key, entry);
}

// --- Cache Stats ---
export interface CacheStats {
  size: number;
  max: number;
  ttl: number;
  heapBytes: number;
  maxHeapBytes: number;
  keys: string[];
}

/**
 * Get current cache statistics
 */
export function getCacheStats(): CacheStats {
  const config = getCacheConfig();
  return {
    size: graphileCache.size,
    max: config.max,
    ttl: config.ttl,
    heapBytes: graphileCache.calculatedSize,
    maxHeapBytes: graphileCache.maxSize,
    keys: [...graphileCache.keys()]
  };
}

// --- Clear Matching Entries ---
/**
 * Clear cache entries matching a regex pattern
 *
 * @param pattern - RegExp to match against cache keys
 * @returns Number of entries cleared
 */
export function clearMatchingEntries(pattern: RegExp): number {
  let cleared = 0;

  for (const key of graphileCache.keys()) {
    if (pattern.test(key)) {
      // Mark as manual eviction before deleting
      manualEvictionKeys.add(key);
      graphileCache.delete(key);
      cleared++;
    }
  }

  return cleared;
}

// Register cleanup callback with pgCache
// When a pg pool is disposed, clean up any graphile instances using it
const unregister = pgCache.registerCleanupCallback((pgPoolKey: string) => {
  log.debug(`pgPool[${pgPoolKey}] disposed - checking graphile entries`);

  // Remove graphile entries that reference this pool key
  graphileCache.forEach((entry, k) => {
    if (entry.cacheKey.includes(pgPoolKey)) {
      log.debug(`Removing graphileCache[${k}] due to pgPool[${pgPoolKey}] disposal`);
      manualEvictionKeys.add(k);
      graphileCache.delete(k);
    }
  });
});

// Enhanced close function that handles all caches
const closePromise: { promise: Promise<void> | null } = { promise: null };

/**
 * Close all caches and release resources
 *
 * This function:
 * 1. Disposes all PostGraphile v5 instances (async)
 * 2. Clears the graphile cache
 * 3. Closes all pg pools via pgCache
 *
 * The function is idempotent - calling it multiple times
 * returns the same promise.
 */
export const closeAllCaches = async (verbose = false): Promise<void> => {
  if (closePromise.promise) return closePromise.promise;

  closePromise.promise = (async () => {
    try {
      if (verbose) log.info('Closing all server caches...');

      const entries = [...graphileCache.entries()];

      // Mark all as manual evictions
      for (const [key] of entries) {
        manualEvictionKeys.add(key);
      }

      // clear() starts each entry's disposal; wait for those same disposals.
      graphileCache.clear();
      await Promise.allSettled(
        entries.map(([key, entry]) => disposeEntry(entry, key))
      );
      manualEvictionKeys.clear();

      // Close pg pools
      await pgCache.close();

      if (verbose) log.success('All caches disposed.');
    } finally {
      closePromise.promise = null;
    }
  })();

  return closePromise.promise;
};
