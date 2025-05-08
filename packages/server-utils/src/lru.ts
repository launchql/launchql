import { LRUCache } from 'lru-cache';

import pg from 'pg';
import { HttpRequestHandler } from 'postgraphile';

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR_IN_MS * 24;
const ONE_YEAR = ONE_DAY * 366;

// Kubernetes sends only SIGTERM on pod shutdown
const SYS_EVENTS = ['SIGTERM'];

const end = (pool: any) => {
  try {
    if (pool.ended || pool.ending) {
      console.error(
        'Avoid calling end() — pool is already ended or ending.'
      );
      return;
    }
    pool.end();
  } catch (e) {
    process.stderr.write(String(e));
  }
};

export interface GraphileCache {
  pgPool: pg.Pool;
  pgPoolKey: string;
  handler: HttpRequestHandler;
}

// --- Graphile Cache ---
export const graphileCache = new LRUCache<string, GraphileCache>({
  max: 15,
  dispose: (obj: GraphileCache, key: string) => {
    console.log(`disposing PostGraphile[${key}]`);
  },
  updateAgeOnGet: true,
  ttl: ONE_YEAR,
});

// --- Postgres Pool Cache ---
export const pgCache = new LRUCache<string, pg.Pool>({
  max: 10,
  dispose: (pgPool: pg.Pool, key: string) => {
    console.log(`disposing pg ${key}`);
    graphileCache.forEach((obj: GraphileCache, k: string) => {
      if (obj.pgPoolKey === key) {
        graphileCache.delete(k);
      }
    });
    end(pgPool);
  },
  updateAgeOnGet: true,
  ttl: ONE_YEAR,
});

// --- Generic Service Cache ---
export const svcCache = new LRUCache({
  max: 25,
  dispose: (svc: any, key: any) => {
    console.log(`disposing service[${key}]`);
  },
  updateAgeOnGet: true,
  ttl: ONE_YEAR,
});

// --- Graceful Shutdown ---
const once = <T extends (...args: any[]) => any>(fn: T, context?: any) => {
  let result: ReturnType<T>;
  return function (...args: Parameters<T>) {
    if (fn) {
      // @ts-ignore
      result = fn.apply(context || this, args);
      fn = null!;
    }
    return result;
  };
};

const close = once(() => {
  console.log('closing server utils...');
  graphileCache.clear();
  pgCache.clear();
  svcCache.clear();
});

SYS_EVENTS.forEach((event) => {
  process.on(event, close);
});
