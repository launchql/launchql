# graphile-realtime-subscriptions

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

Realtime subscription plugin for PostGraphile v5 — per-table GraphQL subscriptions via LISTEN/NOTIFY.

## Overview

Discovers tables tagged with `@realtime` and generates per-table GraphQL subscription fields (`onXxxChanged`) that use PostgreSQL LISTEN/NOTIFY for real-time event delivery with automatic RLS enforcement.

## Usage

```typescript
import { RealtimeSubscriptionsPreset } from 'graphile-realtime-subscriptions';

const preset = {
  extends: [
    RealtimeSubscriptionsPreset(),
  ],
};
```

## How It Works

1. A row is inserted/updated/deleted on a `@realtime`-tagged table
2. The `emit_change` trigger fires `pg_notify('realtime:{schema}.{table}', TG_OP)`
3. PostGraphile's `pgSubscriber` receives the NOTIFY
4. The subscription re-queries the source table with RLS enforced
5. The client receives `{ event, row }` where `row` reflects the current state

## Generation-Scoped Delivery

`GenerationScopedRealtimeSubscriber` wraps a shared Grafast notification
source with an exact topic allowlist. Database notifications still fan out to
every generation that leased that topic, while `publish()` sends cursor
catch-up events only to subscriptions owned by that one Graphile generation.
The facade uses fixed bounded queues, fails a slow subscription on overflow,
and awaits its source iterators and source lease during `release()`.

`RealtimeManager` accepts this explicit publisher capability. A transitional
`createPgSubscriberPublisher()` adapter retains compatibility with the current
`@dataplan/pg` subscriber, keeping its private emitter access out of the
manager. New shared-listener integrations should use the generation-scoped
facade and provide `allowedSourceSchemas` so cursor events cannot cross
generation boundaries. Omitting the schema allowlist is supported only by the
deprecated `pgSubscriber` adapter for existing callers.

`RealtimeTopicCollector` receives the plugin's physical schema/table
descriptors during build and rejects missing, empty, changed, malformed, or
foreign topic sets. `ActivatableGenerationScopedRealtimeSubscriber` gives
PostGraphile a stable subscriber identity before schema construction, but
fails every subscribe/publish call until the validated exact-topic source is
installed. This two-phase boundary prevents an instance from serving while its
shared listener is incomplete.

## Subscription Modes

### Phase 3a (current)

- **Single record**: `onXxxChanged(id: UUID!)` — subscribe to changes on one row
- **Full collection**: `onXxxChanged` (no args) — subscribe to any change on the table
