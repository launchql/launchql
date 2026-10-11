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
  /** Optional RealtimeManager for cursor-tracked subscription delivery */
  realtimeManager?: { stop(): Promise<void> } | null;
}

// Track disposed entries by reference to prevent double-disposal.
// Using a WeakSet keyed on the entry object (rather than the string key)
// avoids the race where closeAllCaches() manually disposes an entry,
// the guard key is cleaned up, and then graphileCache.clear() triggers
// the LRU dispose callback which attempts to release the same
// PostGraphile instance a second time.
const disposedEntries = new WeakSet<GraphileCacheEntry>();

// Track keys that are being manually evicted for accurate eviction reason
const manualEvictionKeys = new Set<string>();

/**
 * Dispose a PostGraphile v5 cache entry
 *
 * Properly releases resources by:
 * 1. Closing the HTTP server if listening
 * 2. Releasing the PostGraphile instance (which internally releases grafserv)
 *
 * Uses disposedEntries WeakSet to prevent double-disposal when closeAllCaches()
 * explicitly disposes entries and then clear() triggers the dispose callback.
 */
const disposeEntry = async (entry: GraphileCacheEntry, key: string): Promise<void> => {
  // Prevent double-disposal (tracked by object reference, not key string)
  if (disposedEntries.has(entry)) {
    return;
  }
  disposedEntries.add(entry);

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

    // LRU dispose is synchronous, but v5 disposal is async
    // Fire and forget the async cleanup
    disposeEntry(entry, key).catch((err) => {
      log.error(`Failed to dispose PostGraphile[${key}]:`, err);
    });
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

      // Collect all entries and dispose them properly
      const entries = [...graphileCache.entries()];

      // Mark all as manual evictions
      for (const [key] of entries) {
        manualEvictionKeys.add(key);
      }

      const disposePromises = entries.map(([key, entry]) =>
        disposeEntry(entry, key)
      );

      // Wait for all disposals to complete
      await Promise.allSettled(disposePromises);

      // Clear the cache after disposal (dispose callback will no-op due to disposedEntries)
      graphileCache.clear();

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
