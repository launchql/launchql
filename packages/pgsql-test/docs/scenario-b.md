# Scenario B: Single Connection Strategy (db only)

## Overview

This scenario uses **only the `db` connection** and relies on `setContext()` to switch roles:
- **Setup/Admin operations**: Use `setContext({ role: 'administrator' })` to bypass RLS
- **Testing operations**: Use `setContext({ role: 'authenticated', ... })` to test with RLS enforced

The `administrator` role has the `BYPASSRLS` privilege, allowing it to bypass Row Level Security policies for setup operations.

## Configuration

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  
  // db has app_user privileges by default
  // Can switch to 'administrator' role via setContext()
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();  // Single connection
});

afterEach(async () => {
  await db.afterEach();   // Single connection
});
```

## How Data Sharing Works

### No Multiple Connections = No Sharing Complexity

Since there's only **one connection**, data sharing is not an issue:
- All operations happen on the same connection
- All data is part of the same transaction
- No confusion about which connection inserted what
- Everything rolls back together

```typescript
it('all data in one transaction', async () => {
  // Setup as administrator
  db.setContext({ role: 'administrator' });
  await db.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);
  
  // Insert more data (still as administrator)
  await db.query('INSERT INTO products (name) VALUES ($1)', ['Widget']);
  
  // Switch to authenticated user
  db.setContext({ role: 'authenticated' });
  
  // All data is in the same transaction
  const users = await db.any('SELECT * FROM users');
  const products = await db.any('SELECT * FROM products');
  
  expect(users.length).toBe(1);
  expect(products.length).toBe(1);
  
  // After afterEach(), everything rolls back together
});
```

## Rollback Combinations Table

Since there's only one connection, rollback management is simpler:

| beforeEach Called | afterEach Called | Data via `db` | Notes |
|------------------|------------------|---------------|-------|
| `db.beforeEach()` | `db.afterEach()` | ✅ Rolled back | **RECOMMENDED**: Clean between tests |
| `db.beforeEach()` | Nothing | ❌ **NOT rolled back** | Transaction started but never rolled back |
| Nothing | `db.afterEach()` | ⚠️ Error or undefined | Can't roll back without starting transaction |
| Nothing | Nothing | ❌ **NOT rolled back** | No transaction management |

### Role Context Does NOT Affect Rollback

**Important:** The role you're using (`administrator` vs `authenticated`) does **NOT** affect what gets rolled back:

```typescript
beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

it('all data rolls back regardless of role', async () => {
  // Insert as administrator
  db.setContext({ role: 'administrator' });
  await db.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);
  
  // Insert as authenticated user
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });
  await db.query('INSERT INTO products (owner_id) VALUES ($1)', [123]);
  
  // Both inserts are in the same transaction
});

it('everything is rolled back', async () => {
  db.setContext({ role: 'administrator' });
  
  const users = await db.any('SELECT * FROM users');
  const products = await db.any('SELECT * FROM products');
  
  expect(users.length).toBe(0);    // ✅ Rolled back
  expect(products.length).toBe(0); // ✅ Rolled back
});
```

## When to Use Scenario B

### ✅ Use Single Connection When:

1. **Testing RLS policies** (most common use case)
   - Use `administrator` role for setup (bypasses RLS)
   - Use `authenticated` role for testing (RLS enforced)
   - Simpler than managing two connections

2. **You don't need true superuser operations**
   - If you don't need `CREATE EXTENSION` or similar
   - Most operations (tables, schemas, RLS) work fine with `administrator`

3. **You want simpler test setup**
   - One connection to manage
   - One transaction to roll back
   - Less room for error

4. **Faster test execution**
   - One transaction instead of two
   - Less overhead

### Example: RLS Testing with Single Connection

```typescript
beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

it('should enforce RLS policies', async () => {
  // Setup as administrator (bypasses RLS due to BYPASSRLS privilege)
  db.setContext({ role: 'administrator' });
  
  await db.query(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      owner_id INT
    );
    
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY user_products ON products
      FOR ALL TO authenticated
      USING (owner_id = current_setting('jwt.claims.user_id')::INT);
  `);
  
  // Insert test data as administrator (bypasses RLS)
  await db.query(`
    INSERT INTO products (name, owner_id) 
    VALUES ('Product 1', 123), ('Product 2', 456)
  `);
  
  // Test as authenticated user (RLS enforced)
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': '123'
  });
  
  const products = await db.any('SELECT * FROM products');
  
  expect(products.length).toBe(1);        // Only sees own products
  expect(products[0].owner_id).toBe(123); // Due to RLS
  
  // Everything rolls back together at the end
});
```

## Role Switching Details

### How setContext() Works

`setContext()` uses PostgreSQL's `SET LOCAL` to temporarily change settings:

```typescript
// Internally calls:
// SET LOCAL ROLE administrator;
db.setContext({ role: 'administrator' });

// Internally calls:
// SET LOCAL ROLE authenticated;
// SET LOCAL jwt.claims.user_id = '123';
db.setContext({
  role: 'authenticated',
  'jwt.claims.user_id': '123'
});
```

**Key points:**
- `SET LOCAL` changes persist only for the current transaction
- Perfect for `beforeEach`/`afterEach` pattern
- Automatically resets when transaction ends

### Common Role Patterns

```typescript
// 1. Setup phase - bypass all restrictions
db.setContext({ role: 'administrator' });
await db.query('CREATE TABLE...');
await db.query('INSERT INTO...');

// 2. Test as authenticated user with specific claims
db.setContext({
  role: 'authenticated',
  'jwt.claims.user_id': '123',
  'jwt.claims.email': 'alice@example.com'
});
const data = await db.any('SELECT * FROM products');

// 3. Test as anonymous user
db.setContext({ role: 'anonymous' });
const publicData = await db.any('SELECT * FROM public_products');

// 4. Test with service role (elevated but not superuser)
db.setContext({ role: 'service_role' });
const serviceData = await db.any('SELECT * FROM internal_tables');
```

## Advantages

1. **Simpler rollback management** - Only one connection to roll back
2. **Faster execution** - One transaction instead of two
3. **Less error-prone** - Can't forget to roll back a second connection
4. **Cleaner test code** - Less boilerplate
5. **Works for RLS testing** - `administrator` role has `BYPASSRLS`

## Disadvantages

1. **Must remember to call setContext()** - Need to explicitly switch roles
2. **Less explicit privilege boundaries** - Same connection has different privileges at different times
3. **Cannot do true superuser operations** - `CREATE EXTENSION` still requires superuser
4. **Slightly less "realistic"** - In production, admin and user are truly separate connections

## When You Need pg (Dual Connection)

You still need `pg` in these scenarios:

```typescript
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Use pg ONLY for true superuser operations
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  
  // Everything else can use db with role switching
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE users (...)`);
});

beforeEach(async () => {
  await db.beforeEach();  // Only manage db
});

afterEach(async () => {
  await db.afterEach();   // Only manage db
});
```

## Summary

**Scenario B is ideal when:**
- You're testing RLS policies (most common case)
- You don't need true superuser operations
- You want simpler test setup and faster execution
- You're comfortable with role switching via `setContext()`

**Trade-offs:**
- ✅ Simpler rollback management (one connection)
- ✅ Faster (one transaction)
- ✅ Less error-prone
- ✅ Works for RLS testing (administrator has BYPASSRLS)
- ⚠️ Must remember to call setContext()
- ❌ Cannot do CREATE EXTENSION (still need pg for that)
- ❌ Less explicit separation between admin and user contexts
