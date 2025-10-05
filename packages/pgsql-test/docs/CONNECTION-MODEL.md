# pgsql-test Connection Model: pg vs db

## Overview

When you call `getConnections()`, you receive two separate `PgTestClient` instances: `pg` and `db`. **These are completely independent database connections with their own transaction states.** Understanding this distinction is crucial for writing correct tests.

## Connection Independence

### Separate Client Instances

```typescript
const { pg, db, teardown } = await getConnections();
```

**Key Facts:**
- `pg` and `db` are **separate `pg.Client` instances** (not from a pool)
- They connect to the **same database** but with **different user credentials**
- They have **independent transaction states**
- Changes made on one connection are **not automatically rolled back** when the other connection rolls back

### Implementation Details

From `src/connect.ts`:
```typescript
// Line 83: pg client created with superuser credentials
const pg = manager.getClient(config);

// Lines 105-109: db client created with app-level user credentials
const db = manager.getClient({
  ...config,
  user: connOpts.connection.user,      // Different user!
  password: connOpts.connection.password
});
```

From `src/test-client.ts`:
```typescript
// Each PgTestClient creates its own Client instance
constructor(config: PgConfig, opts: PgTestClientOpts = {}) {
  this.config = config;
  this.client = new Client({    // ← New independent connection
    host: this.config.host,
    port: this.config.port,
    database: this.config.database,
    user: this.config.user,      // ← Different user credentials
    password: this.config.password
  });
  // ...
}
```

## When to Use pg vs db

### Use `pg` (Superuser Connection) For:

✅ **Superuser-only operations** that require true superuser privileges
- Creating extensions (`CREATE EXTENSION`)
- Certain system-level schema operations
- Operations that fail even with `administrator` role

```typescript
beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
  
  // Use pg only for superuser-only operations
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
});
```

**Note:** Most operations (including creating tables, schemas, and setting up RLS) can be done with the `administrator` role via `db.setContext()`, so `pg` is rarely needed.

### Use `db` (App-Level User) For:

✅ **Almost everything** - including RLS testing and role-based operations
- Testing RLS policies by switching roles with `setContext()`
- Creating schemas, tables, and RLS policies (as `administrator` role)
- Inserting test data (as `administrator` role to bypass RLS)
- Testing as different roles (authenticated, anonymous, etc.)
- Simulating real user interactions

```typescript
it('should test RLS with single connection', async () => {
  // Setup as administrator (bypasses RLS)
  db.setContext({ role: 'administrator' });
  await db.query(`
    CREATE TABLE products (id SERIAL PRIMARY KEY, owner_id INT);
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    CREATE POLICY user_products ON products
      FOR ALL TO authenticated
      USING (owner_id = current_setting('jwt.claims.user_id')::INT);
  `);
  await db.query(`INSERT INTO products (owner_id) VALUES (123), (456)`);
  
  // Test as authenticated user (RLS enforced)
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': '123'
  });
  
  const products = await db.any('SELECT * FROM products');
  expect(products.length).toBe(1); // Only sees own products due to RLS
});
```

## Transaction Isolation Behavior

### Independent Transactions

Each connection manages its own transaction independently:

```typescript
beforeEach(async () => {
  await pg.beforeEach();  // BEGIN + SAVEPOINT on pg connection
  await db.beforeEach();  // BEGIN + SAVEPOINT on db connection (independent!)
});

afterEach(async () => {
  await pg.afterEach();   // ROLLBACK + COMMIT on pg connection
  await db.afterEach();   // ROLLBACK + COMMIT on db connection (independent!)
});
```

### What beforeEach/afterEach Actually Do

From `src/test-client.ts`:

```typescript
async beforeEach(): Promise<void> {
  await this.begin();      // BEGIN transaction
  await this.savepoint();  // SAVEPOINT "lqlsavepoint"
}

async afterEach(): Promise<void> {
  await this.rollback();   // ROLLBACK TO SAVEPOINT "lqlsavepoint"
  await this.commit();     // COMMIT (ends the transaction)
}
```

**This means:**
- Changes made on `pg` are **NOT rolled back** if you only call `db.afterEach()`
- Changes made on `db` are **NOT rolled back** if you only call `pg.afterEach()`
- You must roll back **each connection independently**

## Common Pitfall: Mixed Connection Usage

### ❌ INCORRECT Pattern

```typescript
beforeEach(async () => {
  await db.beforeEach();  // Only rolling back db!
});

afterEach(async () => {
  await db.afterEach();   // Only rolling back db!
});

it('should insert data', async () => {
  // Insert via pg - this will NOT be rolled back!
  await pg.one('INSERT INTO users (email) VALUES ($1) RETURNING *', ['alice@example.com']);
  
  // Insert via db - this WILL be rolled back
  await db.one('INSERT INTO products (name) VALUES ($1) RETURNING *', ['Widget']);
});

it('should start clean', async () => {
  // This test will FAIL!
  // The user from pg.one() is still there because pg was never rolled back
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(0);  // ❌ FAILS - user is still there!
});
```

### ✅ CORRECT Pattern 1: Use Only One Connection

If you want automatic rollback, use **only one connection** for data manipulation:

```typescript
beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

it('should insert data', async () => {
  // Use ONLY db for all data operations
  await db.one('INSERT INTO users (email) VALUES ($1) RETURNING *', ['alice@example.com']);
  await db.one('INSERT INTO products (name) VALUES ($1) RETURNING *', ['Widget']);
});

it('should start clean', async () => {
  // ✅ PASSES - everything was inserted via db and rolled back
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(0);
});
```

### ✅ CORRECT Pattern 2: Roll Back Both Connections

If you need to use both connections, roll back **both**:

```typescript
beforeEach(async () => {
  await pg.beforeEach();  // Roll back pg
  await db.beforeEach();  // Roll back db
});

afterEach(async () => {
  await pg.afterEach();   // Roll back pg
  await db.afterEach();   // Roll back db
});

it('should insert data', async () => {
  // Insert via pg
  await pg.one('INSERT INTO users (email) VALUES ($1) RETURNING *', ['alice@example.com']);
  
  // Insert via db
  await db.one('INSERT INTO products (name) VALUES ($1) RETURNING *', ['Widget']);
});

it('should start clean', async () => {
  // ✅ PASSES - both connections were rolled back
  const users = await pg.any('SELECT * FROM users');
  const products = await db.any('SELECT * FROM products');
  expect(users.length).toBe(0);
  expect(products.length).toBe(0);
});
```

### ✅ CORRECT Pattern 3: Setup vs Test Separation

Use `pg` for permanent setup and `db` for test operations:

```typescript
beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
  
  // Use pg for permanent setup (not rolled back)
  await pg.query(`
    CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT);
    CREATE TABLE products (id SERIAL PRIMARY KEY, name TEXT, owner_id INT);
  `);
});

beforeEach(async () => {
  await db.beforeEach();  // Only roll back db
});

afterEach(async () => {
  await db.afterEach();   // Only roll back db
});

it('should insert and rollback', async () => {
  // Use db for test data - will be rolled back
  const user = await db.one('INSERT INTO users (email) VALUES ($1) RETURNING *', ['alice@example.com']);
  const product = await db.one('INSERT INTO products (name, owner_id) VALUES ($1, $2) RETURNING *', ['Widget', user.id]);
  
  expect(product.owner_id).toBe(user.id);
});

it('should start clean', async () => {
  // ✅ PASSES - all test data was inserted via db and rolled back
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(0);
});
```

## Visibility Between Connections

### Uncommitted Changes Are Visible

Even though `pg` and `db` are separate connections, they can see each other's **uncommitted** changes within their transactions:

```typescript
it('demonstrates visibility', async () => {
  await pg.begin();
  await db.begin();
  
  // Insert via pg (uncommitted)
  await pg.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);
  
  // db CAN see pg's uncommitted change
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(1);  // ✅ Can see it!
  
  // But if pg rolls back, it's gone
  await pg.rollback();
  
  const usersAfter = await db.any('SELECT * FROM users');
  expect(usersAfter.length).toBe(0);  // ✅ Gone after pg rollback
});
```

This is standard PostgreSQL behavior: connections can see uncommitted changes from other connections unless isolation levels prevent it (default is READ COMMITTED).

## RLS Testing with setContext()

The `db` connection supports `setContext()` for simulating different roles and JWT claims:

```typescript
it('should filter by RLS policy', async () => {
  // Setup: insert some data as superuser
  const user1 = await pg.one('INSERT INTO users (email) VALUES ($1) RETURNING id', ['alice@example.com']);
  const user2 = await pg.one('INSERT INTO users (email) VALUES ($1) RETURNING id', ['bob@example.com']);
  
  await pg.query('INSERT INTO products (name, owner_id) VALUES ($1, $2)', ['Laptop', user1.id]);
  await pg.query('INSERT INTO products (name, owner_id) VALUES ($1, $2)', ['Mouse', user2.id]);
  
  // Test: query as user1
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': user1.id
  });
  
  const products = await db.any('SELECT * FROM products');
  expect(products.length).toBe(1);  // Only sees own products
  expect(products[0].name).toBe('Laptop');
});
```

**Important:** `setContext()` uses `SET LOCAL` internally, which applies settings for the current transaction. This is why it works well with `beforeEach()`/`afterEach()` patterns.

## Single Connection vs Dual Connection Strategy

### Recommended: Use Only db (Single Connection)

✅ **Use single connection (db only) for most scenarios:**
- Testing RLS policies (use `setContext()` to switch roles)
- Testing role-based permissions and access control
- Standard database operations (tables, schemas, RLS setup)
- Simpler test setup and faster execution

**Why this works for RLS testing:**
- `administrator` role has `BYPASSRLS` privilege
- Use `setContext({ role: 'administrator' })` to bypass RLS for setup
- Use `setContext({ role: 'authenticated', ... })` to test with RLS enforced
- All within a single connection that gets rolled back

```typescript
beforeAll(async () => {
  ({ db, teardown } = await getConnections());
});

beforeEach(async () => {
  await db.beforeEach();  // Single connection rollback
});

afterEach(async () => {
  await db.afterEach();   // Single connection rollback
});

it('should test RLS with single connection', async () => {
  // Setup as administrator (bypasses RLS)
  db.setContext({ role: 'administrator' });
  await db.query(`
    CREATE TABLE products (id SERIAL PRIMARY KEY, owner_id INT);
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    CREATE POLICY user_products ON products
      FOR ALL TO authenticated
      USING (owner_id = current_setting('jwt.claims.user_id')::INT);
  `);
  await db.query(`INSERT INTO products (owner_id) VALUES (123), (456)`);
  
  // Test as authenticated user (RLS enforced)
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': '123'
  });
  
  const products = await db.any('SELECT * FROM products');
  expect(products.length).toBe(1); // Only sees own products
});
```

### When to Use Both pg and db (Dual Connection)

✅ **Only use both connections when you need true superuser privileges:**
- Creating extensions (`CREATE EXTENSION`)
- System-level operations that fail even with `administrator` role
- When you specifically want to test the difference between superuser and non-superuser behavior

```typescript
beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
  
  // Only use pg for superuser-only operations
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
});

beforeEach(async () => {
  await db.beforeEach();  // Usually only need to roll back db
});

afterEach(async () => {
  await db.afterEach();   // Usually only need to roll back db
});
```

See [VISIBILITY-EXAMPLE.md](./VISIBILITY-EXAMPLE.md) for detailed examples.

## Summary

### Key Takeaways

1. **`pg` and `db` are separate, independent connections** with their own transaction states
2. **Rolling back one does NOT roll back the other** - you must explicitly manage both
3. **`pg` and `db` CAN read each other's data** - they're separate connections to the same database
4. **Use `db` for almost everything** - including RLS testing via `setContext()` role switching
5. **Use `pg` only for true superuser operations** like `CREATE EXTENSION`
6. **For RLS testing with single connection:**
   - Use `db.setContext({ role: 'administrator' })` to bypass RLS for setup
   - Use `db.setContext({ role: 'authenticated', ... })` to test with RLS enforced
   - Roll back only `db` in beforeEach/afterEach
7. **Single connection approach is simpler, faster, and sufficient for most scenarios**

### Quick Reference

```typescript
// ❌ WRONG: Mixed usage without proper rollback
await pg.query('INSERT ...');  // Won't be rolled back!
await db.beforeEach();
await db.afterEach();

// ✅ RIGHT: Use only db
await db.query('INSERT ...');  // Will be rolled back
await db.beforeEach();
await db.afterEach();

// ✅ RIGHT: Roll back both
await pg.query('INSERT ...');  // Will be rolled back
await db.query('INSERT ...');  // Will be rolled back
await pg.beforeEach();
await db.beforeEach();
await pg.afterEach();
await db.afterEach();
```
