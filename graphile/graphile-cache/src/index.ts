// Main exports from graphile-cache package
export {
  // Cache configuration
  CacheConfig,
  // Event emitter for cache events
  CacheEventEmitter,
  cacheEvents,
  CacheEvictionEvent,
  // Cache stats
  CacheStats,
  clearGraphileCache,
  // Clear matching entries
  clearMatchingEntries,
  closeAllCaches,
  disposeUncachedEntry,
  // Eviction tracking
  EvictionReason,
  FIVE_MINUTES_MS,
  getCacheConfig,
  getCacheStats,
  // Cache instance and entry type
  graphileCache,
  GraphileCacheEntry,
  // Time constants
  ONE_HOUR_MS,
  waitForActiveDisposals,
  waitForEntryDisposal} from './graphile-cache';

// Factory for creating PostGraphile v5 instances
export { createGraphileInstance } from './create-instance';

// Generic module config cache for plugin lookups
export { ModuleConfigCache, ModuleConfigCacheOptions } from './module-config-cache';
