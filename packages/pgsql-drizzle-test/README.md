# pgsql-drizzle-test

Drizzle ORM integration for `pgsql-test` that maintains context management for RLS (Row-Level Security) testing.

## The Problem

When using Drizzle ORM directly with `pgsql-test`, the context management (SET LOCAL statements for role and JWT claims) doesn't work because Drizzle calls the underlying `pg.Client` directly, bypassing `PgTestClient`'s `ctxQuery()` method that applies the context.

```typescript
// This doesn't work - context is ignored!
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnections } from 'pgsql-test';

const { db } = await getConnections();
db.auth({ userId: '123' }); // This context is never applied!

const drizzleDb = drizzle(db.client); // Drizzle bypasses PgTestClient
const result = await drizzleDb.select().from(users); // No RLS context applied
```

## Two Solutions Available

This package provides **two approaches** to solve this problem. Choose the one that best fits your needs:

### Approach 1: Wrapper-Based (Recommended)

Uses a `DrizzleTestClient` wrapper that intercepts queries and provides helper methods:

```typescript
import { drizzle } from 'pgsql-drizzle-test';
import { getConnections } from 'pgsql-test';

const { db } = await getConnections();
const drizzleDb = drizzle(db);

// Set context via helper methods
drizzleDb.$auth({ userId: '123' });
const result = await drizzleDb.select().from(users); // RLS context applied ✓
```

**Pros:**
- Clean API with helper methods (`$auth`, `$setContext`, etc.)
- Explicit about using the wrapper
- Type-safe helper methods

**Cons:**
- Different import pattern than standard Drizzle
- Requires using wrapper-specific API

### Approach 2: Proxy-Based (Standard Drizzle Pattern)

Patches `db.client.query()` to work with the standard Drizzle pattern:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnectionsWithProxy } from 'pgsql-drizzle-test/variation2';

const { db } = await getConnectionsWithProxy();

// Set context on db directly (standard pgsql-test API)
db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });

// Use standard Drizzle pattern - no wrapper needed!
const drizzleDb = drizzle(db.client);
const result = await drizzleDb.select().from(users); // RLS context applied ✓
```

**Pros:**
- Uses standard Drizzle import and pattern
- Familiar API for users of other ORMs
- Works with `db.setContext()` and `db.auth()` directly

**Cons:**
- Patches `db.client.query()` internally (monkey-patching)
- May run SET LOCAL statements multiple times if mixing `db.query()` and `db.client.query()`

## Installation

```bash
npm install pgsql-drizzle-test drizzle-orm pg
```

## Installation

```bash
npm install pgsql-drizzle-test drizzle-orm pg
```

## Usage

### Approach 1: Wrapper-Based (Default)

#### Basic Example

```typescript
import { drizzle } from 'pgsql-drizzle-test';
import { getConnections } from 'pgsql-test';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

// Define your schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id')
});

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

describe('Drizzle with RLS', () => {
  it('should respect authentication context', async () => {
    // Create Drizzle instance
    const drizzleDb = drizzle(db);
    
    // Set authentication context
    drizzleDb.$auth({ userId: '123' });
    
    // All queries will include the context (SET LOCAL statements)
    const result = await drizzleDb.select().from(users);
    expect(result).toBeDefined();
  });
});
```

#### Using with Schema

```typescript
import { drizzle } from 'pgsql-drizzle-test';
import { getConnections } from 'pgsql-test';
import * as schema from './schema';

const { db, teardown } = await getConnections();
const drizzleDb = drizzle(db, { schema });

// Now you can use relational queries
const usersWithPosts = await drizzleDb.query.users.findMany({
  with: {
    posts: true
  }
});
```

### Approach 2: Proxy-Based (Standard Pattern)

#### Basic Example

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnectionsWithProxy } from 'pgsql-drizzle-test/variation2';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

// Define your schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id')
});

let db, pg, teardown;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnectionsWithProxy());
  
  // Setup schema using pg (superuser)
  await pg.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      user_id TEXT NOT NULL
    );
    
    GRANT ALL ON TABLE users TO authenticated;
    GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO authenticated;
    
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY users_policy ON users
      FOR ALL TO authenticated
      USING (user_id = current_setting('jwt.claims.user_id', true));
  `);
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

describe('Drizzle with RLS (proxy approach)', () => {
  it('should respect authentication context', async () => {
    // Set context on db (standard pgsql-test API)
    db.setContext({ 
      role: 'authenticated', 
      'jwt.claims.user_id': '123' 
    });
    
    // Use standard Drizzle pattern
    const drizzleDb = drizzle(db.client);
    
    // All queries will include the context (SET LOCAL statements)
    const result = await drizzleDb.select().from(users);
    expect(result).toBeDefined();
  });
});
```

#### Using with Schema

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnectionsWithProxy } from 'pgsql-drizzle-test/variation2';
import * as schema from './schema';

const { db, teardown } = await getConnectionsWithProxy();

// Set context on db
db.auth({ userId: '123', role: 'authenticated' });

// Use standard Drizzle pattern with schema
const drizzleDb = drizzle(db.client, { schema });

// Now you can use relational queries
const usersWithPosts = await drizzleDb.query.users.findMany({
  with: {
    posts: true
  }
});
```

### Helper Methods

The `drizzle()` function returns a Drizzle instance with additional helper methods:

#### `$auth(options)`

Set authentication context (shorthand for `testClient.auth()`):

```typescript
drizzleDb.$auth({ userId: '123', role: 'authenticated' });
```

#### `$setContext(ctx)`

Set custom context variables (shorthand for `testClient.setContext()`):

```typescript
drizzleDb.$setContext({ 
  'jwt.claims.org_id': 'acme',
  'jwt.claims.role': 'admin'
});
```

#### `$clearContext()`

Clear all context:

```typescript
drizzleDb.$clearContext();
```

#### `$publish()`

Commit current transaction to make data visible to other connections, then start a fresh transaction:

```typescript
// Insert data and make it visible to other connections
await drizzleDb.insert(users).values({ name: 'Alice' });
await drizzleDb.$publish();

// Now other connections can see the data
```

#### `$testClient`

Access the underlying `PgTestClient` for advanced operations:

```typescript
const testClient = drizzleDb.$testClient;
await testClient.query('SELECT 1');
```

## Advanced Usage

### Testing Row-Level Security

```typescript
import { drizzle } from 'pgsql-drizzle-test';
import { getConnections } from 'pgsql-test';

describe('RLS Policies', () => {
  let db, teardown;

  beforeAll(async () => {
    ({ db, teardown } = await getConnections());
    
    // Setup schema with RLS
    await db.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL
      );
      
      ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY user_posts ON posts
        FOR ALL TO authenticated
        USING (user_id = current_setting('jwt.claims.user_id', true));
    `);
  });

  afterAll(() => teardown());

  describe('as user 1', () => {
    let drizzleDb;

    beforeEach(async () => {
      await db.beforeEach();
      drizzleDb = drizzle(db);
      drizzleDb.$auth({ userId: '1', role: 'authenticated' });
    });

    afterEach(() => db.afterEach());

    it('can only see own posts', async () => {
      // Insert posts for different users
      await db.query(`
        INSERT INTO posts (user_id, content) 
        VALUES ('1', 'My post'), ('2', 'Other post')
      `);

      // Query with Drizzle - should only see user 1's posts
      const posts = await drizzleDb.select().from(postsTable);
      expect(posts).toHaveLength(1);
      expect(posts[0].content).toBe('My post');
    });
  });
});
```

### Multi-Connection Testing

```typescript
import { drizzle } from 'pgsql-drizzle-test';
import { getConnections } from 'pgsql-test';

let db1, db2, teardown;

beforeAll(async () => {
  const conn1 = await getConnections();
  const conn2 = await getConnections();
  
  db1 = drizzle(conn1.db);
  db2 = drizzle(conn2.db);
  
  teardown = async () => {
    await conn1.teardown();
    await conn2.teardown();
  };
});

afterAll(() => teardown());

it('can test cross-connection visibility', async () => {
  // Insert in first connection
  await db1.insert(users).values({ name: 'Alice' });
  
  // Not visible to second connection yet
  let result = await db2.select().from(users);
  expect(result).toHaveLength(0);
  
  // Publish to make visible
  await db1.$publish();
  
  // Now visible to second connection
  result = await db2.select().from(users);
  expect(result).toHaveLength(1);
});
```

## How It Works

The package provides two main components:

1. **`DrizzleTestClient`**: A wrapper around `PgTestClient` that implements the `pg.Client` query interface. It intercepts all query calls and ensures `ctxQuery()` is called first to apply SET LOCAL statements.

2. **`drizzle()`**: A factory function that creates a Drizzle instance using the wrapped client and attaches helper methods for easy access to test client functionality.

The key insight is that `PgTestClient.query()` calls `ctxQuery()` before executing queries, but Drizzle bypasses this by calling `client.query()` directly on the underlying `pg.Client`. The `DrizzleTestClient` wrapper ensures that `ctxQuery()` is always called before any query execution.

## API Reference

### `drizzle<TSchema>(testClient, config?)`

Create a Drizzle database instance from a PgTestClient.

**Parameters:**
- `testClient: PgTestClient` - The PgTestClient instance from `getConnections()`
- `config?: DrizzleConfig<TSchema>` - Optional Drizzle configuration (schema, logger, etc.)

**Returns:** `DrizzleTestDatabase<TSchema>` - A Drizzle instance with helper methods

### `DrizzleTestClient`

A wrapper class that implements the pg.Client interface while maintaining PgTestClient's context management.

**Constructor:**
- `new DrizzleTestClient(testClient: PgTestClient)`

**Methods:**
- `query<T>(sql, values?)` - Execute a query with context applied
- `begin()`, `commit()`, `rollback()`, `savepoint()` - Transaction management
- `beforeEach()`, `afterEach()` - Test isolation
- `setContext(ctx)`, `auth(options)`, `clearContext()` - Context management
- `publish()` - Make data visible to other connections
- `getTestClient()` - Get the underlying PgTestClient

## License

MIT

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/launchql/launchql) for contribution guidelines.
