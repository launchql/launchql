# drizzle-orm-test

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/launchql/launchql/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/drizzle-orm-test">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fdrizzle-orm-test%2Fpackage.json"/>
  </a>
</p>

`drizzle-orm-test` is a Drizzle ORM-optimized version of [`pgsql-test`](https://www.npmjs.com/package/pgsql-test) designed to work work seamlessly with context management and RLS (Row-Level Security) testing. It provides instant, isolated PostgreSQL databases for testing with automatic transaction rollbacks, context switching, and clean seeding — configured for local-first development environment. It's also great for GitHub Actions and CI/CD testing.

Explore a full working example (including GitHub Actions CI/CD) in the [`drizzle-test-suite`](https://github.com/launchql/drizzle-test-suite) repo.

## Install

```bash
npm install drizzle-orm-test
```

## Features

* 🎯 **Drizzle ORM integration** — automatic context management for Drizzle queries with RLS support
* ⚡ **Instant test DBs** — each one seeded, isolated, and UUID-named
* 🔄 **Per-test rollback** — every test runs in its own transaction or savepoint
* 🛡️ **RLS-friendly** — test with role-based auth via `.setContext()`
* 🌱 **Flexible seeding** — run `.sql` files, programmatic seeds, or even load fixtures
* 🧪 **Compatible with any async runner** — works with `Jest`, `Mocha`, etc.
* 🧹 **Auto teardown** — no residue, no reboots, just clean exits

### Tutorials

📚 **[Learn how to test with Drizzle ORM →](https://launchql.com/learn/drizzle-testing)**


## Usage

### Basic Example

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnections, PgTestClient } from 'drizzle-orm-test';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

// Define your schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id')
});

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
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

describe('Drizzle with RLS', () => {
  it('should respect authentication context', async () => {
    // Set context on db (standard pgsql-test API)
    db.setContext({ 
      role: 'authenticated', 
      'jwt.claims.user_id': '123' 
    });
    
    // Use standard Drizzle pattern - no wrapper needed!
    const drizzleDb = drizzle(db.client);
    
    // All queries will include the context (SET LOCAL statements)
    const result = await drizzleDb.select().from(users);
    expect(result).toBeDefined();
  });
});
```

### Using with Schema

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnections } from 'drizzle-orm-test';
import * as schema from './schema';

const { db, teardown } = await getConnections();

// Set context on db
db.setContext({ 
  role: 'authenticated', 
  'jwt.claims.user_id': '123' 
});

// Use standard Drizzle pattern with schema
const drizzleDb = drizzle(db.client, { schema });

// Now you can use relational queries
const usersWithPosts = await drizzleDb.query.users.findMany({
  with: {
    posts: true
  }
});
```

## API

> **Note:** For seeding documentation, see the [pgsql-test README](https://www.npmjs.com/package/pgsql-test) directly. The seeding API is identical since `drizzle-orm-test` uses the same `getConnections()` function and seed adapters.

### `getConnections(cn?, seedAdapters?)`

Drop-in replacement for `pgsql-test`'s `getConnections` that patches `db.client.query()` to automatically apply context before each query.

**Parameters:**
- `cn?: GetConnectionOpts` - Connection options (same as pgsql-test)
- `seedAdapters?: SeedAdapter[]` - Optional seed adapters for test data

**Returns:** `Promise<{ pg, db, admin, teardown, manager }>`
- `pg: PgTestClient` - Superuser client for schema setup (bypasses RLS)
- `db: PgTestClient` - App-level client with patched `client.query()` for RLS testing
- `admin: DbAdmin` - CLI operations (createdb, dropdb, etc.)
- `teardown: () => Promise<void>` - Cleanup function
- `manager: PgTestConnector` - Connection pool manager

### `PgTestClient`

Re-exported from `pgsql-test` for convenience. See [pgsql-test documentation](https://github.com/launchql/launchql/tree/main/packages/pgsql-test) for full API.

**Key Methods:**
- `setContext(ctx: Record<string, string>)` - Set context variables (role, JWT claims, etc.)
- `auth(options?: AuthOptions)` - Set authentication context (shorthand for common JWT claims)
- `clearContext()` - Clear all context
- `beforeEach()` - Start transaction for test isolation
- `afterEach()` - Rollback transaction
- `publish()` - Commit data to make visible to other connections
- `query<T>(sql, values?)` - Execute query with context applied

## Advanced Usage

### Testing Row-Level Security

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnections } from 'drizzle-orm-test';
import { eq } from 'drizzle-orm';

describe('RLS Policies', () => {
  let db, pg, teardown;

  beforeAll(async () => {
    ({ db, pg, teardown } = await getConnections());
    
    // Setup schema with RLS using pg (superuser)
    await pg.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL
      );
      
      GRANT ALL ON TABLE posts TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE posts_id_seq TO authenticated;
      
      ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY user_posts ON posts
        FOR ALL TO authenticated
        USING (user_id = current_setting('jwt.claims.user_id', true));
      
      -- Seed test data using pg (bypasses RLS)
      INSERT INTO posts (user_id, content)
      VALUES ('1', 'User 1 Post'), ('2', 'User 2 Post');
    `);
  });

  afterAll(() => teardown());

  describe('as user 1', () => {
    beforeEach(async () => {
      await db.beforeEach();
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '1' 
      });
    });

    afterEach(() => db.afterEach());

    it('can only see own posts', async () => {
      const drizzleDb = drizzle(db.client);
      
      // Query with Drizzle - should only see user 1's posts
      const posts = await drizzleDb.select().from(postsTable);
      expect(posts).toHaveLength(1);
      expect(posts[0].content).toBe('User 1 Post');
    });
    
    it('can insert own posts', async () => {
      const drizzleDb = drizzle(db.client);
      
      await drizzleDb.insert(postsTable).values({
        userId: '1',
        content: 'New Post'
      });
      
      const posts = await drizzleDb.select().from(postsTable);
      expect(posts).toHaveLength(2);
    });
  });
  
  describe('as user 2', () => {
    beforeEach(async () => {
      await db.beforeEach();
      db.setContext({ 
        role: 'authenticated', 
        'jwt.claims.user_id': '2' 
      });
    });

    afterEach(() => db.afterEach());

    it('can only see own posts', async () => {
      const drizzleDb = drizzle(db.client);
      
      const posts = await drizzleDb.select().from(postsTable);
      expect(posts).toHaveLength(1);
      expect(posts[0].content).toBe('User 2 Post');
    });
  });
});
```

### Multi-Connection Testing

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnections } from 'drizzle-orm-test';

let db1, db2, teardown;

beforeAll(async () => {
  const conn1 = await getConnections();
  const conn2 = await getConnections();
  
  db1 = conn1.db;
  db2 = conn2.db;
  
  teardown = async () => {
    await conn1.teardown();
    await conn2.teardown();
  };
});

afterAll(() => teardown());

it('can test cross-connection visibility', async () => {
  const drizzle1 = drizzle(db1.client);
  const drizzle2 = drizzle(db2.client);
  
  // Set context for both connections
  db1.setContext({ role: 'authenticated', 'jwt.claims.user_id': '1' });
  db2.setContext({ role: 'authenticated', 'jwt.claims.user_id': '1' });
  
  // Insert in first connection
  await drizzle1.insert(users).values({ name: 'Alice', userId: '1' });
  
  // Not visible to second connection yet (transaction isolation)
  let result = await drizzle2.select().from(users);
  expect(result).toHaveLength(0);
  
  // Publish to make visible
  await db1.publish();
  
  // Now visible to second connection
  result = await drizzle2.select().from(users);
  expect(result).toHaveLength(1);
});
```

### Context Switching

```typescript
it('can switch context between queries', async () => {
  const drizzleDb = drizzle(db.client);
  
  // Query as user 1
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '1' });
  let posts = await drizzleDb.select().from(postsTable);
  expect(posts.every(p => p.userId === '1')).toBe(true);
  
  // Switch to user 2
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '2' });
  posts = await drizzleDb.select().from(postsTable);
  expect(posts.every(p => p.userId === '2')).toBe(true);
});
```

## The Problem

When using Drizzle ORM directly with `pgsql-test`, the context management (SET LOCAL statements for role and JWT claims) doesn't work because Drizzle calls the underlying `pg.Client.query()` directly, bypassing `PgTestClient`'s `ctxQuery()` method that applies the context.

```typescript
// This doesn't work with plain pgsql-test - context is ignored!
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnections } from 'pgsql-test';

const { db } = await getConnections();
db.setContext({ userId: '123' }); // This context is never applied!

const drizzleDb = drizzle(db.client); // Drizzle bypasses PgTestClient
const result = await drizzleDb.select().from(users); // No RLS context applied ❌
```

## The Solution

`drizzle-orm-test` is a drop-in replacement for `pgsql-test` that patches `db.client.query()` to automatically apply context before each query. This allows you to use the standard Drizzle pattern while maintaining full RLS support.

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { getConnections, PgTestClient } from 'drizzle-orm-test';

const { db } = await getConnections();
db.setContext({ userId: '123' }); // Context is applied!

const drizzleDb = drizzle(db.client); // Standard Drizzle pattern
const result = await drizzleDb.select().from(users); // RLS context applied ✓
```

## How It Works

`drizzle-orm-test` patches `db.client.query()` to automatically execute SET LOCAL statements before each query. This ensures that:

1. **Context is applied**: Role and JWT claims are set via `SET LOCAL` before every Drizzle query
2. **RLS policies work**: PostgreSQL Row-Level Security policies can check `current_setting('jwt.claims.*')` 
3. **Transaction isolation**: Changes are isolated between tests via `beforeEach`/`afterEach`
4. **Standard Drizzle pattern**: You can use `drizzle(db.client)` directly without wrappers

The implementation avoids infinite recursion by directly executing the context statements using the original query method, rather than calling `db.ctxQuery()` which would create a circular call.

## Migration from pgsql-test

If you're already using `pgsql-test`, migration is simple:

```typescript
// Before (pgsql-test)
import { getConnections, PgTestClient } from 'pgsql-test';

// After (drizzle-orm-test)
import { getConnections, PgTestClient } from 'drizzle-orm-test';

// Everything else stays the same!
// Now you can also use Drizzle ORM with full RLS support
```
