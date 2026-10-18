/**
 * Realtime Subscriptions Plugin for PostGraphile v5
 *
 * Adds per-table GraphQL subscription fields to tables tagged with @realtime.
 * Uses PostgreSQL LISTEN/NOTIFY for efficient event delivery with automatic
 * RLS enforcement on re-queries.
 *
 * @example
 * ```typescript
 * import { RealtimeSubscriptionsPreset } from 'graphile-realtime-subscriptions';
 *
 * const preset = {
 *   extends: [
 *     RealtimeSubscriptionsPreset(),
 *   ],
 * };
 * ```
 */

export { CursorTracker, CursorTrackerStartAbortedError } from './cursor-tracker';
export type { GenerationScopedRealtimeSubscriberOptions } from './generation-subscriber';
export {
  ActivatableGenerationScopedRealtimeSubscriber,
  createPgSubscriberPublisher,
  GENERATION_SUBSCRIBER_QUEUE_CAPACITY,
  GenerationScopedRealtimeSubscriber,
  REALTIME_GENERATION_ALREADY_ACTIVE_ERROR_CODE,
  REALTIME_GENERATION_NOT_ACTIVE_ERROR_CODE,
  REALTIME_GENERATION_OVERFLOW_ERROR_CODE,
  REALTIME_GENERATION_RELEASED_ERROR_CODE,
  REALTIME_GENERATION_SOURCE_ENDED_ERROR_CODE,
  REALTIME_GENERATION_TOPIC_ERROR_CODE,
  RealtimeGenerationAlreadyActiveError,
  RealtimeGenerationNotActiveError,
  RealtimeGenerationOverflowError,
  RealtimeGenerationReleasedError,
  RealtimeGenerationSourceEndedError,
  RealtimeGenerationTopicError
} from './generation-subscriber';
export { createRealtimeSubscriptionsPlugin, RealtimeSubscriptionsPlugin } from './plugin';
export { RealtimeSubscriptionsPreset } from './preset';
export {
  RealtimeManager,
  RealtimeManagerStartAbortedError,
  RealtimeSourceSchemaConfigurationError,
  RealtimeSourceSchemaViolationError,
  RealtimeSubscriberUnavailableError
} from './realtime-manager';
export {
  REALTIME_TOPIC_DISCOVERY_CHANGED_ERROR_CODE,
  REALTIME_TOPIC_DISCOVERY_EMPTY_ERROR_CODE,
  REALTIME_TOPIC_DISCOVERY_FOREIGN_ERROR_CODE,
  REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE,
  REALTIME_TOPIC_DISCOVERY_MISSING_ERROR_CODE,
  RealtimeTopicCollector,
  RealtimeTopicDiscoveryError
} from './topic-collector';
export type {
  RealtimeSubscriptionsPluginOptions,
  RealtimeTopicDescriptor
} from './types';
export type {
  ChangeLogEntry,
  CursorTrackerOptions,
  Queryable,
  RealtimeManagerOptions,
  RealtimePublisher,
} from './types';
