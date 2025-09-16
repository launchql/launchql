# LaunchQL pgsql-test Package - Agent Guide

The `pgsql-test` package provides instant, isolated PostgreSQL databases for testing with automatic transaction rollbacks, context switching, and flexible seeding strategies. This guide helps agents understand the testing infrastructure.

## 🎯 Overview

**Main Purpose:** Isolated testing environments with per-test transaction rollbacks, ideal for integration tests, complex migrations, and RLS simulation.

**Key Features:**
- ⚡ Instant test databases (UUID-named, seeded, isolated)
- 🔄 Per-test rollback (transaction/savepoint-based)
- 🛡️ RLS-friendly testing with role-based auth
- 🌱 Flexible seeding (SQL files, programmatic, CSV, JSON)
- 🧪 Compatible with any async test runner
- 🧹 Automatic teardown

## 🏗️ Core Architecture

### Main Entry Point
**Function:** `getConnections()`

**Basic Usage:**
```typescript
import { getConnections } from 'pgsql-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
});

afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());
```

**Complete Object Destructuring:**
```typescript
const { pg, db, admin, teardown, manager } = await getConnections();
```

**Returned Objects:**
- `pg` - `PgTestClient` connected as superuser (administrative setup)
- `db` - `PgTestClient` connected as app-level user (main testing)
- `admin` - `DbAdmin` utility for managing database state
- `teardown()` - Function to shut down test environment
- `manager` - Shared connection pool manager (`PgTestConnector`)

## 🎮 PgTestClient API

**Location:** `src/test-client.ts`
**Purpose:** Enhanced PostgreSQL client wrapper with test-specific features

### Core Methods

**Query Execution:**
- `query(sql, values?)` - Run raw SQL query, get `QueryResult`
- `any(sql, values?)` - Expect any number of rows
- `one(sql, values?)` - Expect exactly one row
- `oneOrNone(sql, values?)` - Expect zero or one row
- `many(sql, values?)` - Expect one or more rows
- `manyOrNone(sql, values?)` - Expect zero or more rows
- `none(sql, values?)` - Expect no rows
- `result(sql, values?)` - Get full QueryResult object

**Test Isolation:**
- `beforeEach()` - Begin transaction and set savepoint
- `afterEach()` - Rollback to savepoint and commit outer transaction

**Context Management:**
- `setContext({ key: value })` - Set PostgreSQL config variables for RLS testing

### Context Switching for RLS Testing

**Setting Authentication Context:**
```typescript
// Simulate authenticated user
await db.setContext({
  role: 'authenticated',
  'jwt.claims.user_id': '123',
  'jwt.claims.org_id': 'acme'
});
```

**Role-Based Testing Pattern:**
```typescript
describe('authenticated role', () => {
  beforeEach(async () => {
    await db.setContext({ role: 'authenticated' });
    await db.beforeEach();
  });

  afterEach(() => db.afterEach());

  it('runs as authenticated user', async () => {
    const res = await db.query(`SELECT current_setting('role', true) AS role`);
    expect(res.rows[0].role).toBe('authenticated');
  });
});
```

## 🌱 Seeding System

### Seeding Architecture
**Function Signature:**
```typescript
const { db, teardown } = await getConnections(connectionOptions?, seedAdapters?);
```

**Default Behavior:** If no `seedAdapters` provided, LaunchQL seeding is used automatically.

### Available Seed Adapters

#### 1. SQL File Seeding
**Purpose:** Execute raw `.sql` files from disk

```typescript
import { getConnections, seed } from 'pgsql-test';
import path from 'path';

const sql = (f: string) => path.join(__dirname, 'sql', f);

const { db, teardown } = await getConnections({}, [
  seed.sqlfile([
    sql('schema.sql'),
    sql('fixtures.sql')
  ])
]);
```

#### 2. Programmatic Seeding
**Purpose:** Run JavaScript/TypeScript logic for data insertion

```typescript
const { db, teardown } = await getConnections({}, [
  seed.fn(async ({ pg }) => {
    await pg.query(`
      INSERT INTO users (name) VALUES ('Seeded User');
    `);
  })
]);
```

#### 3. CSV Seeding
**Purpose:** Load tabular data from CSV files

```typescript
const csv = (file: string) => path.resolve(__dirname, '../csv', file);

const { db, teardown } = await getConnections({}, [
  // Create schema first
  seed.fn(async ({ pg }) => {
    await pg.query(`
      CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT NOT NULL);
      CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), content TEXT NOT NULL);
    `);
  }),
  // Load from CSV (headers must match column names)
  seed.csv({
    users: csv('users.csv'),
    posts: csv('posts.csv')
  }),
  // Fix SERIAL sequences
  seed.fn(async ({ pg }) => {
    await pg.query(`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));`);
  })
]);
```

#### 4. JSON Seeding
**Purpose:** Use in-memory objects as seed data

```typescript
const { db, teardown } = await getConnections({}, [
  seed.fn(async ({ pg }) => {
    await pg.query(`
      CREATE SCHEMA custom;
      CREATE TABLE custom.users (id SERIAL PRIMARY KEY, name TEXT NOT NULL);
    `);
  }),
  seed.json({
    'custom.users': [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  })
]);
```

#### 5. Sqitch Seeding
**Purpose:** Deploy Sqitch-compatible projects with LaunchQL's high-performance engine

```typescript
const cwd = path.resolve(__dirname, '../path/to/sqitch');

const { db, teardown } = await getConnections({}, [
  seed.sqitch(cwd)  // Uses LaunchQL's TypeScript engine (up to 10x faster)
]);
```

#### 6. LaunchQL Seeding (Default)
**Purpose:** Apply LaunchQL modules using `deployFast()`

```typescript
// Zero configuration - uses current working directory
const { db, teardown } = await getConnections();

// Or specify custom path
const cwd = path.resolve(__dirname, '../path/to/launchql');
const { db, teardown } = await getConnections({}, [
  seed.launchql(cwd)  // Uses deployFast() - up to 10x faster than traditional Sqitch
]);
```

### Composable Seeding
**Multiple Strategies:** You can combine different seeding approaches:

```typescript
const { db, teardown } = await getConnections({}, [
  seed.launchql('./my-module'),           // Deploy LaunchQL module
  seed.sqlfile(['./fixtures/data.sql']),  // Add fixture data
  seed.fn(async ({ pg }) => {             // Programmatic setup
    await pg.query(`SELECT setval('users_id_seq', 1000);`);
  }),
  seed.csv({ users: './test-data.csv' })  // Load test data
]);
```

## ⚙️ Configuration Options

### Connection Options
**Interface:** `PgTestConnectionOptions`

```typescript
interface PgTestConnectionOptions {
  extensions?: string[];        // PostgreSQL extensions to include
  cwd?: string;                // Working directory for LaunchQL/Sqitch projects
  // ... additional pg connection options
}
```

**Usage:**
```typescript
const { db, teardown } = await getConnections({
  extensions: ['uuid-ossp', 'postgis'],
  cwd: '/path/to/project'
});
```

### Database Connection Options
**Standard PostgreSQL options supported:**
- `host`, `port`, `database`, `user`, `password`
- `ssl`, `connectionTimeoutMillis`, `idleTimeoutMillis`
- All standard `pg` client options

## 🎯 Common Testing Patterns

### 1. Basic Integration Test
```typescript
import { getConnections } from 'pgsql-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  
  // Setup schema
  await db.query(`
    CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);
    INSERT INTO users (name) VALUES ('Alice'), ('Bob');
  `);
});

afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());

test('user count starts at 2', async () => {
  const res = await db.query('SELECT COUNT(*) FROM users');
  expect(res.rows[0].count).toBe('2');
});

test('can insert user', async () => {
  await db.query(`INSERT INTO users (name) VALUES ('Charlie')`);
  const res = await db.query('SELECT COUNT(*) FROM users');
  expect(res.rows[0].count).toBe('3'); // Isolated from previous test
});
```

### 2. RLS Testing Pattern
```typescript
describe('Row Level Security', () => {
  let db, teardown;

  beforeAll(async () => {
    ({ db, teardown } = await getConnections());
    
    await db.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id INT,
        content TEXT
      );
      
      ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY user_posts ON posts
        FOR ALL TO authenticated
        USING (user_id = current_setting('jwt.claims.user_id')::INT);
    `);
  });

  afterAll(() => teardown());

  describe('as user 1', () => {
    beforeEach(async () => {
      await db.setContext({
        role: 'authenticated',
        'jwt.claims.user_id': '1'
      });
      await db.beforeEach();
    });

    afterEach(() => db.afterEach());

    it('can only see own posts', async () => {
      await db.query(`INSERT INTO posts (user_id, content) VALUES (1, 'My post'), (2, 'Other post')`);
      const res = await db.query('SELECT * FROM posts');
      expect(res.rows).toHaveLength(1);
      expect(res.rows[0].content).toBe('My post');
    });
  });
});
```

### 3. LaunchQL Module Testing
```typescript
import { getConnections } from 'pgsql-test';

let db, teardown;

beforeAll(async () => {
  // Automatically deploys LaunchQL module from current directory
  ({ db, teardown } = await getConnections());
});

afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());

test('module functions work', async () => {
  const result = await db.one('SELECT my_module_function($1) as result', ['test']);
  expect(result.result).toBe('expected_value');
});
```

### 4. Multi-Database Testing
```typescript
let userDb, adminDb, teardown;

beforeAll(async () => {
  ({ db: userDb, pg: adminDb, teardown } = await getConnections());
});

afterAll(() => teardown());

beforeEach(async () => {
  await userDb.beforeEach();
  await adminDb.beforeEach();
});

afterEach(async () => {
  await userDb.afterEach();
  await adminDb.afterEach();
});

test('admin can see all data', async () => {
  // Setup as admin
  await adminDb.query(`INSERT INTO sensitive_data (value) VALUES ('secret')`);
  
  // Test as regular user
  await userDb.setContext({ role: 'authenticated' });
  const userResult = await userDb.query('SELECT * FROM sensitive_data');
  expect(userResult.rows).toHaveLength(0);
  
  // Test as admin
  const adminResult = await adminDb.query('SELECT * FROM sensitive_data');
  expect(adminResult.rows).toHaveLength(1);
});
```

## 🔧 Advanced Features

### SeedAdapter Interface
**Location:** `src/seed/types.ts`

```typescript
interface SeedAdapter {
  seed(context: SeedContext): Promise<void>;
}

interface SeedContext {
  pg: PgTestClient;     // Superuser client
  db: PgTestClient;     // App-level client
  admin: DbAdmin;       // Database admin utilities
}
```

### Custom Seed Adapters
```typescript
const customSeed: SeedAdapter = {
  async seed({ pg, db, admin }) {
    // Custom seeding logic
    await pg.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await db.query('INSERT INTO custom_table VALUES (uuid_generate_v4())');
  }
};

const { db, teardown } = await getConnections({}, [customSeed]);
```

### DbAdmin Utilities
**Purpose:** Database administration and introspection

**Key Methods:**
- Database state management
- Extension installation
- Role management
- Template operations

## 🎯 Performance Considerations

### LaunchQL vs Traditional Sqitch
**LaunchQL Advantages:**
- **10x faster** schema deployments via TypeScript engine
- **Sqitch compatibility** - keep existing migration syntax
- **Optimized for CI** - dramatically reduced test suite run times
- **Developer experience** - near-instant schema setup for tests

### Test Isolation Strategy
**Transaction-based Isolation:**
- Each test runs in its own transaction
- `beforeEach()` starts transaction and sets savepoint
- `afterEach()` rolls back to savepoint
- No data persists between tests
- Fast and reliable isolation

## 📁 Key Files to Understand

1. **`src/test-client.ts`** - PgTestClient implementation
2. **`src/seed/types.ts`** - Seeding interfaces and types
3. **`src/seed/adapters/`** - Built-in seed adapter implementations
4. **`src/connections.ts`** - Main getConnections() function
5. **`src/admin.ts`** - DbAdmin utilities
6. **`__tests__/`** - Example usage patterns

## 🎯 Agent Tips

1. **Default Seeding:** `getConnections()` with no arguments uses LaunchQL seeding automatically
2. **Test Isolation:** Always use `beforeEach()/afterEach()` pattern for proper isolation
3. **RLS Testing:** Use `setContext()` to simulate different user roles and JWT claims
4. **Seeding Composition:** Combine multiple seed adapters for complex test scenarios
5. **Performance:** LaunchQL seeding is significantly faster than traditional Sqitch
6. **Error Handling:** Test database errors are isolated and don't affect other tests
7. **Connection Management:** `teardown()` handles all cleanup automatically

This testing infrastructure is designed to make PostgreSQL integration testing fast, reliable, and easy to set up. The combination of transaction-based isolation and flexible seeding makes it ideal for testing complex database-driven applications.
