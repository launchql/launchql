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
}

/**
 * Get cache configuration from environment variables
 *
 * Supports:
 * - GRAPHILE_CACHE_MAX: Maximum number of entries (default: 50)
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

  return { max, ttl };
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
 */
export interface GraphileCacheEntry {
  pgl: PostGraphileInstance;
  serv: GrafservBase;
  handler: Express;
  httpServer: HttpServer;
  cacheKey: string;
  createdAt: number;
  /** Idempotent release for pgServices owned by this exact preset generation. */
  releasePresetServices?: () => Promise<void>;
  /** Optional RealtimeManager for cursor-tracked subscription delivery */
  realtimeManager?: { stop(): Promise<void> } | null;
}

const disposalPromises = new WeakMap<GraphileCacheEntry, Promise<void>>();
const activeDisposals = new Set<Promise<void>>();
// Retain failed generations until a bulk drain observes them. Successful work
// is removed immediately; exact-entry outcomes remain in the WeakMap above.
const disposalRecords = new Map<number, Promise<void>>();
let disposalSequence = 0;

// Track keys that are being manually evicted for accurate eviction reason
const manualEvictionKeys = new Set<string>();

/**
 * Dispose a PostGraphile v5 cache entry
 *
 * Properly releases resources by:
 * 1. Closing the HTTP server if listening
 * 2. Stopping the realtime manager
 * 3. Releasing PostGraphile/Grafserv and preset services
 */
const releaseEntry = async (
  entry: GraphileCacheEntry,
  key: string
): Promise<void> => {
  log.debug(`Disposing PostGraphile[${key}]`);
  const failures: unknown[] = [];
  try {
    if (entry.httpServer?.listening) {
      await new Promise<void>((resolve, reject) => {
        entry.httpServer.close((error) => error ? reject(error) : resolve());
      });
    }
  } catch (error) {
    failures.push(error);
  }
  try {
    if (entry.realtimeManager) {
      await entry.realtimeManager.stop();
    }
  } catch (error) {
    failures.push(error);
  }
  try {
    await entry.pgl.release();
  } catch (error) {
    failures.push(error);
  }
  try {
    await entry.releasePresetServices?.();
  } catch (error) {
    failures.push(error);
  }
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1) throw new AggregateError(failures, 'Graphile resource cleanup failed');
};

/**
 * Coalesce teardown by exact entry identity, not by its reusable cache key.
 */
const scheduleDisposal = (
  entry: GraphileCacheEntry,
  key: string
): Promise<void> => {
  const existing = disposalPromises.get(entry);
  if (existing) return existing;

  const pending = releaseEntry(entry, key);

  disposalPromises.set(entry, pending);
  activeDisposals.add(pending);
  const sequence = ++disposalSequence;
  disposalRecords.set(sequence, pending);
  void pending
    .then(() => { disposalRecords.delete(sequence); }, () => {
      // The original rejection remains observable through the owner APIs.
      log.error('Graphile resource cleanup failed', { generation: sequence });
    })
    .finally(() => activeDisposals.delete(pending));
  return pending;
};

/** Dispose a generation that was built but never published in the cache. */
export const disposeUncachedEntry = (
  entry: GraphileCacheEntry,
  key = entry.cacheKey
): Promise<void> => scheduleDisposal(entry, key);

/** Await disposal calls, not background connection cleanup inside upstream. */
export const waitForEntryDisposal = (
  entry: GraphileCacheEntry
): Promise<void> => disposalPromises.get(entry) ?? Promise.resolve();

/**
 * Await disposals scheduled before this call, including failures that already
 * settled. Later generations belong to the next drain. Concurrent callers hold
 * their own snapshot, so acknowledging a failure cannot hide it from a peer.
 */
export const waitForActiveDisposals = async (): Promise<void> => {
  const records = [...disposalRecords];
  const outcomes = await Promise.allSettled(records.map(([, pending]) => pending));
  const failures: unknown[] = [];
  outcomes.forEach((outcome, index) => {
    disposalRecords.delete(records[index][0]);
    if (outcome.status === 'rejected') failures.push(outcome.reason);
  });
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1) throw new AggregateError(failures, 'Graphile disposal drain failed');
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
  updateAgeOnGet: true,
  dispose: (entry, key) => {
    // Determine eviction reason before disposal
    const reason = getEvictionReason(key, entry);

    // Emit eviction event
    cacheEvents.emitEviction({ key, reason, entry });

    log.debug(`Evicting PostGraphile[${key}] (reason: ${reason})`);

    scheduleDisposal(entry, key);
  }
});

// --- Cache Stats ---
export interface CacheStats {
  size: number;
  max: number;
  ttl: number;
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

/** Clear all resident entries and await every exact-generation disposal. */
export const clearGraphileCache = async (): Promise<void> => {
  for (const key of graphileCache.keys()) {
    manualEvictionKeys.add(key);
  }
  graphileCache.clear();
  try {
    await waitForActiveDisposals();
  } finally {
    manualEvictionKeys.clear();
  }
};

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

      const failures: unknown[] = [];
      try {
        await clearGraphileCache();
      } catch (error) {
        failures.push(error);
      }
      // Attempt pool cleanup even when a generation's release rejected.
      try {
        await pgCache.close();
      } catch (error) {
        failures.push(error);
      }
      if (failures.length === 1) throw failures[0];
      if (failures.length > 1) throw new AggregateError(failures, 'Server cache cleanup failed');

      if (verbose) log.success('All caches disposed.');
    } finally {
      closePromise.promise = null;
    }
  })();

  return closePromise.promise;
};
