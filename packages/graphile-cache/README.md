# graphile-cache

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-cache"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fgraphile-cache%2Fpackage.json"/></a>
</p>


PostGraphile instance LRU cache with automatic cleanup when PostgreSQL pools are disposed.

## Installation

```bash
npm install graphile-cache pg-cache
```

Note: This package depends on `pg-cache` for the PostgreSQL pool management.

## Features

- LRU cache for PostGraphile instances
- Automatic cleanup when associated PostgreSQL pools are disposed
- Integrates seamlessly with `pg-cache`
- Service cache re-exported for convenience
- TypeScript support

## How It Works

When you import this package, it automatically registers a cleanup callback with `pg-cache`. When a PostgreSQL pool is disposed, any PostGraphile instances using that pool are automatically removed from the cache.

## Usage

### Basic Usage

```typescript
import { graphileCache, GraphileCache } from 'graphile-cache';
import { getPgPool } from 'pg-cache';
import { postgraphile } from 'postgraphile';

// Create a PostGraphile instance
const pgPool = getPgPool({ database: 'mydb' });
const handler = postgraphile(pgPool, 'public', {
  // PostGraphile options
});

// Cache it
const cacheEntry: GraphileCache = {
  pgPool,
  pgPoolKey: 'mydb',
  handler
};

graphileCache.set('mydb.public', cacheEntry);

// Retrieve it later
const cached = graphileCache.get('mydb.public');
if (cached) {
  // Use cached.handler
}
```

### Automatic Cleanup

The cleanup happens automatically:

```typescript
import { pgCache } from 'pg-cache';
import { graphileCache } from 'graphile-cache';

// Add entries
graphileCache.set('mydb.public', { pgPoolKey: 'mydb', ... });
graphileCache.set('mydb.private', { pgPoolKey: 'mydb', ... });

// When the pool is removed...
pgCache.delete('mydb');

// Both graphile entries are automatically cleaned up!
console.log(graphileCache.has('mydb.public')); // false
console.log(graphileCache.has('mydb.private')); // false
```

### Complete Example

```typescript
import { graphileCache, GraphileCache } from 'graphile-cache';
import { getPgPool } from 'pg-cache';
import { postgraphile } from 'postgraphile';

function getGraphileInstance(database: string, schema: string): GraphileCache {
  const key = `${database}.${schema}`;
  
  // Check cache first
  const cached = graphileCache.get(key);
  if (cached) {
    return cached;
  }
  
  // Create new instance
  const pgPool = getPgPool({ database });
  const handler = postgraphile(pgPool, schema, {
    graphqlRoute: '/graphql',
    graphiqlRoute: '/graphiql',
    // other options...
  });
  
  const entry: GraphileCache = {
    pgPool,
    pgPoolKey: database,
    handler
  };
  
  // Cache it
  graphileCache.set(key, entry);
  return entry;
}

// Use in Express
app.use((req, res, next) => {
  const { handler } = getGraphileInstance('mydb', 'public');
  handler(req, res, next);
});
```

### Graceful Shutdown

```typescript
import { closeAllCaches } from 'graphile-cache';

// This closes all caches including pg pools
process.on('SIGTERM', async () => {
  await closeAllCaches();
  process.exit(0);
});
```

## API Reference

### graphileCache

The main PostGraphile instance cache.

- `get(key: string): GraphileCache | undefined` - Get a cached instance
- `set(key: string, value: GraphileCache): void` - Cache an instance
- `has(key: string): boolean` - Check if an instance is cached
- `delete(key: string): void` - Remove an instance
- `clear(): void` - Remove all instances

### GraphileCache Interface

```typescript
interface GraphileCache {
  pgPool: pg.Pool;
  pgPoolKey: string;
  handler: HttpRequestHandler;
}
```

### closeAllCaches()

Closes all caches including the service cache, graphile cache, and all PostgreSQL pools.

### svcCache

Re-exported from `pg-cache` for convenience.

## Integration Details

The integration with `pg-cache` happens automatically when this module is imported. The cleanup callback is registered immediately, ensuring that PostGraphile instances are cleaned up whenever their associated PostgreSQL pools are disposed.

This design ensures:
- No memory leaks from orphaned PostGraphile instances
- Automatic cleanup without manual intervention
- Loose coupling between packages

## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/supabase-test](https://github.com/launchql/launchql/tree/main/packages/supabase-test): **🧪 Supabase-native test harness** preconfigured for the local Supabase stack—per-test rollbacks, JWT/role context helpers, and CI/GitHub Actions ready.
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

