import { LRUCache } from 'lru-cache';
import pg from 'pg';
import { HttpRequestHandler } from 'postgraphile';

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR_IN_MS * 24;
const ONE_YEAR = ONE_DAY * 366;

// Kubernetes sends only SIGTERM on pod shutdown
const SYS_EVENTS = ['SIGTERM'];

type PgPoolKey = string;

export interface GraphileCache {
  pgPool: pg.Pool;
  pgPoolKey: string;
  handler: HttpRequestHandler;
}

//
// --- Service Cache ---
//
export const svcCache = new LRUCache<string, any>({
  max: 25,
  ttl: ONE_YEAR,
  updateAgeOnGet: true,
  dispose: (svc, key) => {
    console.log(`🗑️ Disposing service[${key}]`);
  }
});

//
// --- Graphile Cache ---
//
export const graphileCache = new LRUCache<string, GraphileCache>({
  max: 15,
  ttl: ONE_YEAR,
  updateAgeOnGet: true,
  dispose: (obj, key) => {
    console.log(`🗑️ Disposing PostGraphile[${key}]`);
  }
});

//
// --- PgPoolCacheManager ---
//
export class PgPoolCacheManager {
  private cleanupTasks: Promise<void>[] = [];

  private readonly pgCache = new LRUCache<PgPoolKey, pg.Pool>({
    max: 10,
    ttl: ONE_YEAR,
    updateAgeOnGet: true,
    dispose: (pool, key, reason) => {
      console.log(`🧹 Disposing pg pool [${key}] (${reason})`);
      this.cleanGraphileDependencies(key);
      this.deferDispose(pool, key);
    },
  });

  constructor(private readonly graphileCache: LRUCache<string, GraphileCache>) {}

  get(key: PgPoolKey): pg.Pool | undefined {
    return this.pgCache.get(key);
  }

  has(key: PgPoolKey): pg.Pool | boolean {
    return this.pgCache.has(key);
  }

  set(key: PgPoolKey, pool: pg.Pool): void {
    this.pgCache.set(key, pool);
  }

  delete(key: PgPoolKey): void {
    const pool = this.pgCache.get(key);
    const existed = this.pgCache.delete(key);
    if (!existed && pool) {
      this.cleanGraphileDependencies(key);
      this.deferDispose(pool, key);
    }
  }

  clear(): void {
    const entries = [...this.pgCache.entries()];
    this.pgCache.clear();
    for (const [key, pool] of entries) {
      this.cleanGraphileDependencies(key);
      this.deferDispose(pool, key);
    }
  }

  async waitForDisposals(): Promise<void> {
    await Promise.allSettled(this.cleanupTasks);
  }

  private cleanGraphileDependencies(pgPoolKey: string): void {
    this.graphileCache.forEach((entry, k) => {
      if (entry.pgPoolKey === pgPoolKey) {
        console.log(`🧽 Removing graphileCache[${k}] due to pgPool[${pgPoolKey}]`);
        this.graphileCache.delete(k);
      }
    });
  }

  private deferDispose(pool: pg.Pool, key: string): void {
    setImmediate(() => {
      const task = (async () => {
        try {
          if (!pool.ended && !pool.ending) {
            await pool.end();
            console.log(`✅ pg.Pool ${key} ended.`);
          }
        } catch (err) {
          console.error(`❌ Error ending pg.Pool ${key}:`, err);
        }
      })();
      this.cleanupTasks.push(task);
    });
  }
}

//
// --- Instantiate the pgCache manager ---
//
export const pgCache = new PgPoolCacheManager(graphileCache);

//
// --- Graceful Shutdown ---
//
const once = <T extends (...args: any[]) => any>(fn: T): T => {
  let called = false;
  let result: ReturnType<T>;
  return ((...args: Parameters<T>) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
};

const close = once(async () => {
  console.log('🛑 Closing all server caches...');
  svcCache.clear();
  graphileCache.clear();
  pgCache.clear();
  await pgCache.waitForDisposals();
  console.log('✅ All caches disposed.');
});

SYS_EVENTS.forEach((event) => {
  process.on(event, () => {
    console.log(`📦 Received ${event}`);
    close();
  });
});

export const teardownPgPools = async () => {
  await close();
}