/**
 * Realtime Subscriptions Plugin for PostGraphile v5
 *
 * Discovers tables tagged with @realtime and generates per-table
 * subscription fields (onXxxChanged) that use PostgreSQL LISTEN/NOTIFY
 * for real-time event delivery.
 *
 * Subscription modes:
 *   - Specific rows: onXxxChanged(ids: [UUID!]) — subscribe to changes on specific rows
 *   - Full collection: onXxxChanged (no args) — subscribe to any change on the table
 *
 * NOTIFY payload format (from emit_change trigger):
 *   - Normal: "INSERT:uuid1,uuid2,..."  or "UPDATE:uuid1" or "DELETE:uuid1"
 *   - Overflow: "INVALIDATE" (when a single statement affects > 50 rows)
 *
 * Event flow:
 *   1. A row is inserted/updated/deleted
 *   2. The emit_change trigger fires pg_notify with TG_OP:row_ids or INVALIDATE
 *   3. PostGraphile's pgSubscriber receives the NOTIFY
 *   4. The gate (see event-gate.ts) parses, throttles and filters it — a
 *      payload this subscription should not see never becomes an event
 *   5. The plugin fetches the changed row(s)
 *   6. The client receives { event, row, rowId, overflow }
 *
 * Cursor tracking (at-least-once delivery):
 *   The CursorTracker class provides a complementary polling-based delivery
 *   path via drain_changes(). It manages the listener_node lifecycle:
 *   - start() registers the node via touch_listener()
 *   - Periodic polling via drain_changes() fetches change_log entries
 *   - Periodic heartbeat via touch_listener() keeps the node alive
 *   - stop() calls cleanup_ephemeral() to remove ephemeral subscriptions
 *   This enables at-least-once semantics by tracking cursor position.
 *
 * Overflow protection:
 *   - Database-side: statements affecting > 50 rows send INVALIDATE
 *   - Plugin-side: per-subscription throttle (default 50 events/second/table)
 *     drops individual events and sends a single INVALIDATE when exceeded
 *
 * Security / RLS enforcement:
 *   - Row data is always fetched via resource.get() which runs through the
 *     authenticated user's connection with their JWT role and pgSettings applied.
 *   - For INSERT/UPDATE events, if RLS denies access (resource.get returns null),
 *     the rowId is masked (set to null) to prevent metadata leaks.
 *   - For DELETE events, row is naturally null (the row no longer exists).
 *   - For INVALIDATE (overflow), the client should refetch via a normal query
 *     which is also RLS-gated.
 *   - When ids are provided, only events for those specific rows are delivered,
 *     preventing cross-tenant event leaks.
 */

import { Logger } from '@pgpmjs/logger';
import { constant, context as grafastContext, lambda,listen, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { extendSchema } from 'graphile-utils';

import type { ParsedPayload } from './event-gate';
import { createGatedSubscriber } from './event-gate';
import type {
  RealtimeSubscriptionsPluginOptions,
  RealtimeTopicDescriptor,
} from './types';

const log = new Logger('graphile-realtime-subscriptions');

/** Default overflow threshold: events per second per table per subscriber */
const DEFAULT_OVERFLOW_THRESHOLD = 50;

interface RealtimeTableInfo {
  resource: any;
  typeName: string;
  fieldName: string;
  payloadTypeName: string;
  rowFieldName: string;
  notifyChannel: string;
  pgSchema: string;
  pgTable: string;
}

function discoverRealtimeTables(build: any): RealtimeTableInfo[] {
  const { pgRegistry } = build.input;
  const resources = pgRegistry.pgResources;
  const result: RealtimeTableInfo[] = [];

  for (const [, resource] of Object.entries(resources)) {
    const r = resource as any;
    const codec = r.codec;
    if (!codec?.attributes) continue;

    const tags = codec.extensions?.tags;
    if (!tags?.realtime) continue;

    const typeName = build.inflection.tableType(codec);
    const fieldName = `on${typeName}Changed`;
    const payloadTypeName = `${typeName}SubscriptionPayload`;
    const rowFieldName = typeName.charAt(0).toLowerCase() + typeName.slice(1);

    const pgSchema = codec.extensions?.pg?.schemaName ?? 'public';
    const pgTable = codec.extensions?.pg?.name ?? codec.name;
    const notifyChannel = `realtime:${pgSchema}.${pgTable}`;

    result.push({
      resource: r,
      typeName,
      fieldName,
      payloadTypeName,
      rowFieldName,
      notifyChannel,
      pgSchema,
      pgTable,
    });

    log.info(`Discovered realtime table: ${pgSchema}.${pgTable} -> ${fieldName}`);
  }

  return result;
}

function buildTypeDefs(tables: RealtimeTableInfo[]): string {
  const subscriptionFields = tables
    .map(({ fieldName, payloadTypeName }) =>
      `  """Subscribe to changes on this table. Pass ids to watch specific rows, or no args for the full collection."""\n  ${fieldName}(ids: [UUID!]): ${payloadTypeName}`
    )
    .join('\n');

  const payloadTypes = tables
    .map(({ payloadTypeName, typeName, rowFieldName }) =>
      `"""Payload delivered when a ${typeName} row changes."""\n` +
      `type ${payloadTypeName} {\n` +
      `  """The DML operation: INSERT, UPDATE, DELETE, or INVALIDATE."""\n` +
      `  event: String!\n` +
      `  """The current state of the row (null for DELETE, INVALIDATE, or if RLS denies access)."""\n` +
      `  ${rowFieldName}: ${typeName}\n` +
      `  """The ID of the changed row (null for INVALIDATE, or masked when RLS denies access)."""\n` +
      `  rowId: UUID\n` +
      `  """True when too many changes occurred and the client should refetch."""\n` +
      `  overflow: Boolean!\n` +
      `}`
    )
    .join('\n\n');

  return `extend type Subscription {\n${subscriptionFields}\n}\n\n${payloadTypes}`;
}

/**
 * The gate never emits a null payload, so one here means the plan graph was
 * rewired wrongly — fail rather than invent an event for the client.
 */
function requirePayload(payload: unknown): ParsedPayload {
  if (payload === null || payload === undefined) {
    throw new Error(
      'Realtime subscription payload is missing: the gated subscriber only ever ' +
        'yields parsed payloads, so this event bypassed createGatedSubscriber.',
    );
  }
  return payload as ParsedPayload;
}

/**
 * The row this event reports. `rowIds` is already narrowed to the
 * subscription's `ids`, so the first entry is the one to surface; INVALIDATE
 * carries none, which is a genuine absence rather than a suppressed error.
 */
function reportedRowId(payload: ParsedPayload): string | null {
  if (payload.overflow) return null;
  return payload.rowIds[0] ?? null;
}

function buildPlans(
  tables: RealtimeTableInfo[],
  overflowThreshold: number,
): Record<string, any> {
  const subscriptionPlans: Record<string, any> = {};
  const allPlans: Record<string, any> = {};

  for (const { resource, fieldName, payloadTypeName, rowFieldName, notifyChannel } of tables) {
    subscriptionPlans[fieldName] = {
      subscribePlan(_$root: any, args: any) {
        const $pgSubscriber = (grafastContext() as any).get('pgSubscriber');
        const $topic = constant(notifyChannel);
        const $ids = args.getRaw('ids');

        // Parsing, throttling and sparse-set filtering all happen in the gate,
        // built once per subscription, so the stream below yields only events
        // that should reach this client — every step after it is total.
        const $subscriber = lambda([$pgSubscriber, $ids], (pair: unknown) => {
          const [pgSubscriber, ids] = pair as readonly [any, string[] | null | undefined];
          return createGatedSubscriber(pgSubscriber, { ids, threshold: overflowThreshold });
        });

        return listen($subscriber, $topic, ($payload: any) => object({ parsed: $payload }));
      },
      plan($event: any) {
        return $event;
      },
    };

    allPlans[payloadTypeName] = {
      event($parent: any) {
        return lambda($parent.get('parsed'), (p: unknown) => requirePayload(p).event);
      },
      rowId($parent: any) {
        return lambda($parent.get('parsed'), (p: unknown) => reportedRowId(requirePayload(p)));
      },
      overflow($parent: any) {
        return lambda($parent.get('parsed'), (p: unknown) => requirePayload(p).overflow);
      },
      [rowFieldName]($parent: any) {
        const $rowId = lambda($parent.get('parsed'), (p: unknown) =>
          reportedRowId(requirePayload(p)),
        );

        return resource.get({ id: $rowId });
      },
    };
  }

  allPlans['Subscription'] = subscriptionPlans;
  return allPlans;
}

export function createRealtimeSubscriptionsPlugin(
  options: RealtimeSubscriptionsPluginOptions = {},
): GraphileConfig.Plugin {
  const overflowThreshold = options.overflowThreshold ?? DEFAULT_OVERFLOW_THRESHOLD;

  return extendSchema(
    (build) => {
      const tables = discoverRealtimeTables(build);
      const discoveredTopics: readonly RealtimeTopicDescriptor[] = Object.freeze(
        tables
          .map(({ notifyChannel, pgSchema, pgTable }) => Object.freeze({
            topic: notifyChannel,
            schema: pgSchema,
            table: pgTable,
          }))
          .sort((left, right) => (
            left.topic < right.topic ? -1 : left.topic > right.topic ? 1 : 0
          )),
      );
      options.onTopicsDiscovered?.(discoveredTopics);

      if (tables.length === 0) {
        log.info('No tables with @realtime tag found — skipping subscription generation');
        return { typeDefs: '', plans: {} };
      }

      log.info(`Generating subscription fields for ${tables.length} realtime table(s)`);
      log.info(`Overflow threshold: ${overflowThreshold} events/second/table`);

      const typeDefs = buildTypeDefs(tables);
      const plans = buildPlans(tables, overflowThreshold);

      return { typeDefs, plans };
    },
    'RealtimeSubscriptionsPlugin',
  );
}

export { createRealtimeSubscriptionsPlugin as RealtimeSubscriptionsPlugin };

// Re-export CursorTracker and RealtimeManager for convenience
export { CursorTracker } from './cursor-tracker';
export type { ParsedPayload } from './event-gate';
export {
  createGatedSubscriber,
  EventThrottle,
  MalformedNotifyPayloadError,
  parseNotifyPayload,
} from './event-gate';
export { RealtimeManager } from './realtime-manager';
export type { ChangeLogEntry, CursorTrackerOptions, Queryable, RealtimeManagerOptions } from './types';
export { DEFAULT_OVERFLOW_THRESHOLD };
