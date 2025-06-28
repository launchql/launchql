# pg-cache

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/server-utils"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fserver-utils%2Fpackage.json"/></a>
</p>

PostgreSQL connection pool LRU cache manager with zero PostGraphile dependencies.

## Installation

```bash
npm install pg-cache
```

## Features

- LRU cache for PostgreSQL connection pools
- Automatic pool cleanup and disposal
- Extensible cleanup callback system
- Service cache for general use
- Graceful shutdown handling
- TypeScript support

## Usage

### Basic Pool Management

```typescript
import { pgCache, getPgPool } from 'pg-cache';

// Get or create a cached pool
const pool = getPgPool({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: 'password'
});

// Use the pool
const result = await pool.query('SELECT NOW()');

// Pool is automatically cached and reused
const samePool = getPgPool({ database: 'mydb' }); // Returns cached pool
```

### Direct Cache Access

```typescript
import { pgCache } from 'pg-cache';
import { Pool } from 'pg';

// Create and cache a pool manually
const pool = new Pool({ connectionString: 'postgres://...' });
pgCache.set('my-pool-key', pool);

// Retrieve it later
const cachedPool = pgCache.get('my-pool-key');

// Remove from cache (also disposes the pool)
pgCache.delete('my-pool-key');
```

### Cleanup Callbacks

Register callbacks to be notified when pools are disposed:

```typescript
import { pgCache } from 'pg-cache';

// Register a cleanup callback
const unregister = pgCache.registerCleanupCallback((poolKey: string) => {
  console.log(`Pool ${poolKey} was disposed`);
  // Clean up any resources associated with this pool
});

// Later, unregister if needed
unregister();
```

### Service Cache

A general-purpose cache is also provided:

```typescript
import { svcCache } from 'pg-cache';

// Cache any service or object
svcCache.set('my-service', myServiceInstance);
const service = svcCache.get('my-service');
```

### Graceful Shutdown

```typescript
import { close, teardownPgPools } from 'pg-cache';

// In your shutdown handler
process.on('SIGTERM', async () => {
  await close(); // or teardownPgPools()
  process.exit(0);
});
```

## API Reference

### pgCache

The main PostgreSQL pool cache instance.

- `get(key: string): Pool | undefined` - Get a cached pool
- `set(key: string, pool: Pool): void` - Cache a pool
- `has(key: string): boolean` - Check if a pool is cached
- `delete(key: string): void` - Remove and dispose a pool
- `clear(): void` - Remove and dispose all pools
- `registerCleanupCallback(callback: (key: string) => void): () => void` - Register a cleanup callback

### getPgPool(config: Partial<PgConfig>): Pool

Get or create a cached PostgreSQL pool using the provided configuration.

### svcCache

A general-purpose LRU cache for services and objects.

### close() / teardownPgPools()

Gracefully close all cached pools and wait for disposal.

## Integration with Other Packages

This package is designed to be extended. For example, `@launchql/graphile-cache` uses the cleanup callback system to automatically clean up PostGraphile instances when their associated pools are disposed.


## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): **🔐 Authentication mocking** for Graphile-focused test helpers and emulating row-level security contexts.
* [launchql/pg-query-context](https://github.com/launchql/launchql/tree/main/packages/pg-query-context): **🔒 Session context injection** to add session-local context (e.g., `SET LOCAL`) into queries—ideal for setting `role`, `jwt.claims`, and other session settings.

### 🧠 Parsing & AST

* [launchql/pgsql-parser](https://github.com/launchql/pgsql-parser): **🔄 SQL conversion engine** that interprets and converts PostgreSQL syntax.
* [launchql/libpg-query-node](https://github.com/launchql/libpg-query-node): **🌉 Node.js bindings** for `libpg_query`, converting SQL into parse trees.
* [launchql/pg-proto-parser](https://github.com/launchql/pg-proto-parser): **📦 Protobuf parser** for parsing PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.
* [@pgsql/enums](https://github.com/launchql/pgsql-parser/tree/main/packages/enums): **🏷️ TypeScript enums** for PostgreSQL AST for safe and ergonomic parsing logic.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): **📝 Type definitions** for PostgreSQL AST nodes in TypeScript.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): **🛠️ AST utilities** for constructing and transforming PostgreSQL syntax trees.
* [launchql/pg-ast](https://github.com/launchql/launchql/tree/main/packages/pg-ast): **🔍 Low-level AST tools** and transformations for Postgres query structures.

### 🚀 API & Dev Tools

* [launchql/server](https://github.com/launchql/launchql/tree/main/packages/server): **⚡ Express-based API server** powered by PostGraphile to expose a secure, scalable GraphQL API over your Postgres database.
* [launchql/explorer](https://github.com/launchql/launchql/tree/main/packages/explorer): **🔎 Visual API explorer** with GraphiQL for browsing across all databases and schemas—useful for debugging, documentation, and API prototyping.

### 🔁 Streaming & Uploads

* [launchql/s3-streamer](https://github.com/launchql/launchql/tree/main/packages/s3-streamer): **📤 Direct S3 streaming** for large files with support for metadata injection and content validation.
* [launchql/etag-hash](https://github.com/launchql/launchql/tree/main/packages/etag-hash): **🏷️ S3-compatible ETags** created by streaming and hashing file uploads in chunks.
* [launchql/etag-stream](https://github.com/launchql/launchql/tree/main/packages/etag-stream): **🔄 ETag computation** via Node stream transformer during upload or transfer.
* [launchql/uuid-hash](https://github.com/launchql/launchql/tree/main/packages/uuid-hash): **🆔 Deterministic UUIDs** generated from hashed content, great for deduplication and asset referencing.
* [launchql/uuid-stream](https://github.com/launchql/launchql/tree/main/packages/uuid-stream): **🌊 Streaming UUID generation** based on piped file content—ideal for upload pipelines.
* [launchql/upload-names](https://github.com/launchql/launchql/tree/main/packages/upload-names): **📂 Collision-resistant filenames** utility for structured and unique file names for uploads.

### 🧰 CLI & Codegen

* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

