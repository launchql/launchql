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

## Education and Tutorials

 1. 🚀 [Quickstart: Getting Up and Running](https://launchql.com/learn/quickstart)
Get started with modular databases in minutes. Install prerequisites and deploy your first module.

 2. 📦 [Modular PostgreSQL Development with Database Packages](https://launchql.com/learn/modular-postgres)
Learn to organize PostgreSQL projects with pgpm workspaces and reusable database modules.

 3. ✏️ [Authoring Database Changes](https://launchql.com/learn/authoring-database-changes)
Master the workflow for adding, organizing, and managing database changes with pgpm.

 4. 🧪 [End-to-End PostgreSQL Testing with TypeScript](https://launchql.com/learn/e2e-postgres-testing)
Master end-to-end PostgreSQL testing with ephemeral databases, RLS testing, and CI/CD automation.

 5. ⚡ [Supabase Testing](https://launchql.com/learn/supabase)
Use TypeScript-first tools to test Supabase projects with realistic RLS, policies, and auth contexts.

 6. 💧 [Drizzle ORM Testing](https://launchql.com/learn/drizzle-testing)
Run full-stack tests with Drizzle ORM, including database setup, teardown, and RLS enforcement.

 7. 🔧 [Troubleshooting](https://launchql.com/learn/troubleshooting)
Common issues and solutions for pgpm, PostgreSQL, and testing.

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

* [pgpm](https://github.com/launchql/launchql/tree/main/packages/pgpm): **🖥️ PostgreSQL Package Manager** for modular Postgres development. Works with database workspaces, scaffolding, migrations, seeding, and installing database packages.
* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Credits

🛠 Built by LaunchQL — if you like our tools, please checkout and contribute to [our github ⚛️](https://github.com/launchql)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

