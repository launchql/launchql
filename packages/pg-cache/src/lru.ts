import { Logger } from '@pgpmjs/logger';
import { LRUCache } from 'lru-cache';
import pg from 'pg';

const log = new Logger('pg-cache');

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR_IN_MS * 24;
const ONE_YEAR = ONE_DAY * 366;

// Kubernetes sends only SIGTERM on pod shutdown
const SYS_EVENTS = ['SIGTERM'];

type PgPoolKey = string;

// Cleanup callback type - called when a pg pool is disposed
export type PoolCleanupCallback = (pgPoolKey: string) => void;

class ManagedPgPool {
  public isDisposed = false;
  private disposePromise: Promise<void> | null = null;

  constructor(public readonly pool: pg.Pool, public readonly key: string) {}

  async dispose(): Promise<void> {
    if (this.isDisposed) return this.disposePromise;

    this.isDisposed = true;
    this.disposePromise = (async () => {
      try {
        if (!this.pool.ended) {
          await this.pool.end();
          log.success(`pg.Pool ${this.key} ended.`);
        } else {
          log.info(`pg.Pool ${this.key} already ended.`);
        }
      } catch (err) {
        log.error(`Error ending pg.Pool ${this.key}: ${(err as Error).message}`);
        throw err;
      }
    })();

    return this.disposePromise;
  }
}

export class PgPoolCacheManager {
  private cleanupTasks: Promise<void>[] = [];
  private closed = false;
  private cleanupCallbacks: Set<PoolCleanupCallback> = new Set();

  private readonly pgCache = new LRUCache<PgPoolKey, ManagedPgPool>({
    max: 10,
    ttl: ONE_YEAR,
    updateAgeOnGet: true,
    dispose: (managedPool, key, reason) => {
      log.debug(`Disposing pg pool [${key}] (${reason})`);
      this.notifyCleanup(key);
      this.disposePool(managedPool);
    }
  });

  // Register a cleanup callback to be called when pools are disposed
  registerCleanupCallback(callback: PoolCleanupCallback): () => void {
    this.cleanupCallbacks.add(callback);
    // Return unregister function
    return () => {
      this.cleanupCallbacks.delete(callback);
    };
  }

  get(key: PgPoolKey): pg.Pool | undefined {
    return this.pgCache.get(key)?.pool;
  }

  has(key: PgPoolKey): boolean {
    return this.pgCache.has(key);
  }

  set(key: PgPoolKey, pool: pg.Pool): void {
    if (this.closed) throw new Error(`Cannot add to cache after it has been closed (key: ${key})`);
    this.pgCache.set(key, new ManagedPgPool(pool, key));
  }

  delete(key: PgPoolKey): void {
    const managedPool = this.pgCache.get(key);
    const existed = this.pgCache.delete(key);
    if (!existed && managedPool) {
      this.notifyCleanup(key);
      this.disposePool(managedPool);
    }
  }

  clear(): void {
    const entries = [...this.pgCache.entries()];
    this.pgCache.clear();
    for (const [key, managedPool] of entries) {
      this.notifyCleanup(key);
      this.disposePool(managedPool);
    }
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.clear();
    await this.waitForDisposals();
  }

  async waitForDisposals(): Promise<void> {
    if (this.cleanupTasks.length === 0) return;
    const tasks = [...this.cleanupTasks];
    this.cleanupTasks = [];
    await Promise.allSettled(tasks);
  }

  private notifyCleanup(pgPoolKey: string): void {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback(pgPoolKey);
      } catch (err) {
        log.error(`Error in cleanup callback for pool ${pgPoolKey}: ${(err as Error).message}`);
      }
    });
  }

  private disposePool(managedPool: ManagedPgPool): void {
    if (managedPool.isDisposed) return;
    const task = managedPool.dispose();
    this.cleanupTasks.push(task);
  }
}

// Create the singleton instance
export const pgCache = new PgPoolCacheManager();

// --- Graceful Shutdown ---
const closePromise: { promise: Promise<void> | null } = { promise: null };

export const close = async (verbose = false): Promise<void> => {
  if (closePromise.promise) return closePromise.promise;

  closePromise.promise = (async () => {
    if (verbose) log.info('Closing pg cache...');
    await pgCache.close();
    if (verbose) log.success('PG cache disposed.');
  })();

  return closePromise.promise;
};

SYS_EVENTS.forEach(event => {
  process.on(event, () => {
    log.info(`Received ${event}`);
    close();
  });
});

export const teardownPgPools = async (verbose = false): Promise<void> => {
  return close(verbose);
};