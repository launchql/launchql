// Main exports from graphile-cache package
export {
  // Cache configuration
  CacheConfig,
  // Event emitter for cache events
  CacheEventEmitter,
  cacheEvents,
  CacheEvictionEvent,
  cacheGraphileInstance,
  // Cache stats
  CacheStats,
  // Clear matching entries
  clearMatchingEntries,
  closeAllCaches,
  // Eviction tracking
  EvictionReason,
  FIVE_MINUTES_MS,
  getCacheConfig,
  getCacheStats,
  // Cache instance and entry type
  graphileCache,
  GraphileCacheBudgetError,
  GraphileCacheEntry,
  MIN_ENTRY_HEAP_BYTES,
  // Time constants
  ONE_HOUR_MS} from './graphile-cache';

// Factory for creating PostGraphile v5 instances
export { createGraphileInstance } from './create-instance';

// Generic module config cache for plugin lookups
export { ModuleConfigCache, ModuleConfigCacheOptions } from './module-config-cache';
