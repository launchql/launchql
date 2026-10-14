/**
 * ModuleConfigCache — generic LRU cache for module config lookups
 *
 * Provides a bounded, TTL-based cache for runtime config discovery
 * (billing config, agent discovery, inference log info, etc.).
 *
 * Wraps lru-cache with:
 * - LRU eviction (bounded memory)
 * - TTL-based expiry
 * - Named logging for debugging
 * - clear() hook for future LISTEN/NOTIFY invalidation
 */

import { Logger } from '@pgpmjs/logger';
import { LRUCache } from 'lru-cache';

export interface ModuleConfigCacheOptions {
  /** Cache name (used in log prefix) */
  name: string;
  /** Max entries before LRU eviction (default: 100) */
  max?: number;
  /** TTL in milliseconds (default: 60_000) */
  ttlMs?: number;
}

export class ModuleConfigCache<T> {
  private cache: LRUCache<string, T>;
  private log: Logger;
  readonly name: string;

  constructor(opts: ModuleConfigCacheOptions) {
    this.name = opts.name;
    this.log = new Logger(`cache:${opts.name}`);
    this.cache = new LRUCache<string, T>({
      max: opts.max ?? 100,
      ttl: opts.ttlMs ?? 60_000,
      updateAgeOnGet: true,
    });
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.log.debug(`Clearing all entries (size=${this.cache.size})`);
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}
