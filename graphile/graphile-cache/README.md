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
