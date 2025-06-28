// Main exports from pg-cache package
export { 
  pgCache, 
  PgPoolCacheManager, 
  close,
  teardownPgPools
} from './lru';

export {
  getRootPgPool
} from './pg';

// Re-export types
export type { PoolCleanupCallback } from './lru';