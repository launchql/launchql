# PostgreSQL Pool Lifecycle Management

How PostgreSQL connection pools are created, cached, borrowed, and disposed
across the constructive server, GraphQL middleware, and test infrastructure.

---

## Ownership Model

**pg-cache** is the single owner of all `pg.Pool` instances in the server
process. Every other layer borrows pools from pg-cache and returns connections
when finished. No other code calls `pool.end()`.

```
pg-cache          — owns pools (create, cache, dispose)
graphile-cache    — owns PostGraphile instances, borrows pools via preset
server / middleware — resolve tenant config, borrow pools via getPgPool()
PostGraphile      — borrows pool for query execution, never ends it
pgsql-test        — manages its own pools independently (test-only)
```

---

## pg-cache

**Package:** `postgres/pg-cache/src/`

### Pool Creation (`pg.ts`)

`getPgPool(pgConfig)` is the only entry point for obtaining a pool at runtime:

1. Resolve config via `getPgEnvOptions(pgConfig)`.
2. Check cache by database name — return cached pool if present.
3. Create `new pg.Pool({ connectionString })`.
4. Attach a pool-level `error` handler for idle-connection errors
   (e.g. `57P01 admin_shutdown` during database teardown).
5. Store in cache, keyed by database name.

Pools are created with default `pg.Pool` settings (max 10 connections).

### Pool Storage (`lru.ts`)

`PgPoolCacheManager` wraps each pool in a `ManagedPgPool` object and stores
them in an LRU cache:

| Setting           | Value      |
|-------------------|------------|
| `max`             | 10         |
| `ttl`             | ~1 year    |
| `updateAgeOnGet`  | true       |

When an entry is evicted (LRU pressure, TTL expiry, or manual deletion):

1. `notifyCleanup(key)` — fires registered cleanup callbacks so downstream
   caches (graphile-cache) can react.
2. `disposePool(managedPool)` — calls `pool.end()` to close all connections.

### Cleanup Callbacks

`pgCache.registerCleanupCallback(fn)` lets downstream caches subscribe to
pool disposal events. graphile-cache uses this to evict PostGraphile instances
whose underlying pool has been disposed.

### Shutdown

`pgCache.close()`:

1. `clear()` — evicts all entries, triggering cleanup callbacks and
   `pool.end()` for each.
2. `waitForDisposals()` — awaits all pending `pool.end()` promises.

A SIGTERM handler calls `close()` automatically for graceful pod shutdown.

`teardownPgPools()` is an alias for `close()`.

---

## graphile-cache

**Package:** `graphile/graphile-cache/src/`

### Instance Cache (`graphile-cache.ts`)

`graphileCache` is an LRU cache of `GraphileCacheEntry` objects (PostGraphile
instance + grafserv handler + HTTP server):

| Setting           | Default (prod) | Default (dev)  |
|-------------------|-----------------|----------------|
| `max`             | 50              | 50             |
| `maxSize`         | half the V8 heap limit (bytes) | half the V8 heap limit (bytes) |
| `ttl`             | ~1 year         | 5 minutes      |
| `updateAgeOnGet`  | true            | true           |

Each entry's size is the heap growth measured while building it, so the cache
evicts least-recently-used handlers before their combined size reaches the
heap budget. A handler that alone exceeds the budget is released and its
request fails instead of being served uncached.

Configurable via `GRAPHILE_CACHE_MAX`, `GRAPHILE_CACHE_MAX_HEAP_BYTES` and
`GRAPHILE_CACHE_TTL_MS` env vars.

### Instance Disposal

When a cache entry is evicted, `disposeEntry(entry, key)` runs asynchronously:

1. Close the entry's HTTP server (if listening).
2. Call `pgl.release()` on the PostGraphile instance.

`pgl.release()` triggers PostGraphile's internal cleanup chain:

- Each pgService calls `service.release()`.
- `service.release()` releases the `PgSubscriber` (frees the dedicated
  LISTEN/NOTIFY connection back to the pool).
- **The pool itself is NOT ended** — `makePgService` only adds `pool.end()`
  to its releasers when it created the pool internally. Since we pass an
  external pool from pg-cache, the pool survives instance disposal.

A `disposedKeys` set prevents double-disposal when multiple paths trigger
cleanup for the same entry.

### Cascade from pg-cache

graphile-cache registers a cleanup callback with pg-cache:

```
pgCache pool disposed → cleanup callback fires →
  graphile-cache evicts any entries whose cacheKey contains the pool key →
    disposeEntry() releases PostGraphile instance
```

This ensures PostGraphile instances don't outlive their underlying pool.

### `closeAllCaches()`

Called during server shutdown:

1. Dispose all graphile entries (await all).
2. Clear graphile cache.
3. Call `pgCache.close()` — ends all pools.

---

## PostGraphile / @dataplan/pg Internals

### `makePgService({ pool, schemas })`

When an external pool is passed:

- Stores it in `adaptorSettings.pool` (accessible on the resolved preset).
- Creates a `PgSubscriber(pool)` for LISTEN/NOTIFY — acquires one dedicated
  connection from the pool.
- `service.release()` releases the PgSubscriber but does **not** call
  `pool.end()`.

When no pool is passed (connection string only):

- Creates an internal pool via `new pg.Pool(...)`.
- `service.release()` calls `pool.end()` on the internally-created pool.

### `PgSubscriber`

Holds one dedicated connection from the pool for aggregated LISTEN/NOTIFY.
On `release()`: UNLISTENs all topics, releases the client back to the pool.

### Query Execution

For each GraphQL request, PostGraphile's `withPgClient`:

1. `pool.connect()` — borrow a connection.
2. Optionally set `pgSettings` via `set_config(...)` in a transaction.
3. Execute the query plan.
4. `pgClient.release()` — return connection to the pool.

---

## Server (graphql/server/src/server.ts)

### Startup

1. Create Express app with middleware pipeline.
2. `addEventListener()` — `getPgPool(opts.pg)` → `pool.connect()` → hold
   a dedicated client for `LISTEN "schema:update"`.
3. `listen()` — start HTTP server.

### Schema Update Notifications

The dedicated LISTEN client receives `schema:update` notifications (fired
when a tenant's schema changes). On notification:

1. `flushService(databaseId)` — deletes matching entries from `graphileCache`
   and `svcCache`.
2. Cache eviction triggers `disposeEntry()` → `pgl.release()`.
3. Next request for that tenant rebuilds the PostGraphile instance.

### Shutdown (`close()`)

1. `removeEventListener()` — UNLISTEN, release dedicated client.
2. Close HTTP server.
3. `closeAllCaches()`:
   - Dispose all graphile entries (releases PgSubscribers).
   - Clear graphile cache.
   - `pgCache.close()` — end all pools.

Resources are released before pools are ended.

---

## Middleware Connection Patterns

### api.ts — Tenant Resolution

Uses `getPgPool(config)` and `pool.query(SQL)` directly for metadata queries
(domain lookup, RLS settings, CORS, auth settings, database settings, etc.).

`pool.query()` is a convenience method that internally does
`pool.connect()` → query → `client.release()`. This is the correct pattern
for simple one-shot SELECT queries that don't need transaction management
or pgSettings injection.

These queries run as the pool's default user (the connection string user),
which is intentional for metadata/service queries.

### graphile.ts — PostGraphile Instance Creation

1. `getPgPool(pgConfig)` — obtain/create cached pool for the tenant database.
2. `buildPreset(pool, schemas, ...)` — embed pool via
   `makePgService({ pool, schemas })`.
3. `createGraphileInstance({ preset, cacheKey })` — create PostGraphile
   instance, grafserv handler, HTTP server.
4. Store in `graphileCache`.

The pool flows from pg-cache → preset → PostGraphile. PostGraphile borrows
connections from the pool for each GraphQL request and releases them when
the request completes.

### flush.ts — Cache Invalidation

`/flush` endpoint and `flushService()` delete entries from `graphileCache`
and `svcCache`. Deletion triggers the LRU dispose callback which runs
`disposeEntry()` asynchronously.

`flushService()` also calls `getPgPool()` to query the `domains` table
for additional cache keys to invalidate.

---

## Explorer (graphql/explorer/src/server.ts)

Same pattern as the main server:

1. `getPgPool(config)` for the tenant database.
2. `makePgService({ pool, schemas })` → preset.
3. `createGraphileInstance({ preset, cacheKey })`.
4. Also uses `getPgPool()` directly for schema listing and connectivity
   checks.

No explicit shutdown handler — relies on pg-cache's SIGTERM handler.

---

## Test Infrastructure (postgres/pgsql-test/)

Test infrastructure manages its own pools independently of pg-cache.

### PgTestConnector (`manager.ts`)

- Singleton per test run.
- Creates pools via `new Pool(config)` directly (not `getPgPool()`).
- Tracks pools in its own `Map<string, Pool>`.
- `closeAll()`: close test clients → `pool.end()` for each pool → drop
  test databases.

### getConnections (`connect.ts`)

- Creates a temporary test database.
- Returns test clients and a `teardown()` function.
- `teardown()`:
  1. `manager.beginTeardown()` — prevents new client creation.
  2. `teardownPgPools()` — flushes any pg-cache pools that may exist in
     the test process.
  3. `manager.closeAll()` — closes test pools and drops the database.

---

## Connection Accounting (per tenant)

Each active tenant consumes these connections from its pool:

| Consumer                     | Connections | Lifetime              |
|------------------------------|------------:|-----------------------|
| PgSubscriber (LISTEN/NOTIFY) | 1           | PostGraphile instance |
| Server LISTEN client         | 1           | Server process*       |
| GraphQL query execution      | 1 per req   | Request duration      |
| api.ts metadata queries      | 1 per query | Query duration        |

\* The server LISTEN client uses the services database pool, not tenant pools.

With the default pool size of 10, each tenant pool has ~9 connections
available for concurrent queries (1 held by PgSubscriber).

---

## Disposal Sequence Diagram

```
Server shutdown
  │
  ├─ removeEventListener()
  │    └─ UNLISTEN "schema:update"
  │    └─ client.release() → connection returned to pool
  │
  ├─ httpServer.close()
  │
  └─ closeAllCaches()
       │
       ├─ For each graphile entry:
       │    disposeEntry()
       │      ├─ httpServer.close()
       │      └─ pgl.release()
       │           └─ service.release()
       │                └─ PgSubscriber.release()
       │                     ├─ UNLISTEN all topics
       │                     └─ client.release() → connection returned to pool
       │
       ├─ graphileCache.clear()
       │
       └─ pgCache.close()
            │
            ├─ For each pool:
            │    notifyCleanup(key) → graphile-cache callback (no-op, already cleared)
            │    pool.end() → closes all connections
            │
            └─ await all pool.end() promises
```
