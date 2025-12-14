import { Logger } from '@pgpmjs/logger';
import { LRUCache } from 'lru-cache';
import pg from 'pg';
import { pgCache } from 'pg-cache';
import { HttpRequestHandler } from 'postgraphile';

const log = new Logger('graphile-cache');

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR_IN_MS * 24;
const ONE_YEAR = ONE_DAY * 366;

export interface GraphileCache {
  pgPool: pg.Pool;
  pgPoolKey: string;
  handler: HttpRequestHandler;
}

// --- Graphile Cache ---
export const graphileCache = new LRUCache<string, GraphileCache>({
  max: 15,
  ttl: ONE_YEAR,
  updateAgeOnGet: true,
  dispose: (_, key) => {
    log.debug(`Disposing PostGraphile[${key}]`);
  }
});

// Register cleanup callback with pgCache
// When a pg pool is disposed, clean up any graphile instances using it
const unregister = pgCache.registerCleanupCallback((pgPoolKey: string) => {
  graphileCache.forEach((entry, k) => {
    if (entry.pgPoolKey === pgPoolKey) {
      log.debug(`Removing graphileCache[${k}] due to pgPool[${pgPoolKey}]`);
      graphileCache.delete(k);
    }
  });
});

// Enhanced close function that handles all caches
const closePromise: { promise: Promise<void> | null } = { promise: null };

export const closeAllCaches = async (verbose = false): Promise<void> => {
  if (closePromise.promise) return closePromise.promise;

  closePromise.promise = (async () => {
    if (verbose) log.info('Closing all server caches...');
    graphileCache.clear();
    await pgCache.close();
    if (verbose) log.success('All caches disposed.');
  })();

  return closePromise.promise;
};
