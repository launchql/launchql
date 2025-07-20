// Main exports from pg-cache package
export { 
  close,
  pgCache, 
  PgPoolCacheManager, 
  teardownPgPools
} from './lru';
export {
  getPgPool
} from './pg';

// Re-export types
export type { PoolCleanupCallback } from './lru';