# Scenario C: Recommended Hybrid Strategy

## Overview

This is the **recommended production approach** that combines the best of both worlds:
- **Default to single connection** (`db`) with role switching for 95% of operations
- **Use `pg` sparingly** only when truly needed for superuser operations
- **Never roll back `pg`** - use it only for setup that should persist

This approach gives you the simplicity of Scenario B while still handling the edge cases that require superuser privileges.

## Configuration

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;  // Get it, but rarely use it
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Use pg ONLY for true superuser operations in beforeAll
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  
  // Everything else uses db with role switching
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE SCHEMA IF NOT EXISTS app`);
  await db.query(`CREATE TABLE app.users (...)`);
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();  // ONLY manage db
});

afterEach(async () => {
  await db.afterEach();   // ONLY manage db
});
```

## Key Principles

### 1. Single Connection for Test Data

**Always use `db` for test data** - never use `pg` for data that should be rolled back:

```typescript
it('inserts test data', async () => {
  // ✅ CORRECT: Use db with administrator role
  db.setContext({ role: 'administrator' });
  await db.query(`INSERT INTO users (email) VALUES ('alice@example.com')`);
  
  // ❌ WRONG: Don't use pg for test data
  // await pg.query(`INSERT INTO users ...`); // This won't roll back!
});
```

### 2. Use pg Only for Setup That Should Persist

**Use `pg` only in `beforeAll` for operations that should persist across all tests:**

```typescript
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // ✅ Use pg for extensions (requires SUPERUSER)
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
  // ✅ Use pg for system-level config (if needed)
  await pg.query(`ALTER SYSTEM SET log_statement = 'all'`);
  await pg.query(`SELECT pg_reload_conf()`);
  
  // Everything else uses db
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE users (...)`);
});
```

### 3. Never Roll Back pg

**Don't call `pg.beforeEach()` or `pg.afterEach()`** - if you're using `pg`, its changes should persist:

```typescript
// ✅ CORRECT
beforeEach(async () => {
  await db.beforeEach();  // Only db
});

afterEach(async () => {
  await db.afterEach();   // Only db
});

// ❌ WRONG - Don't do this
beforeEach(async () => {
  await pg.beforeEach();  // Don't manage pg transactions
  await db.beforeEach();
});
```

## When to Use pg vs db

### Use pg (Superuser) For:

1. **CREATE EXTENSION** - Only superusers can create extensions
   ```typescript
   await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
   ```

2. **System configuration changes**
   ```typescript
   await pg.query(`ALTER SYSTEM SET ...`);
   await pg.query(`SELECT pg_reload_conf()`);
   ```

3. **Creating roles/users** (if your test needs this)
   ```typescript
   await pg.query(`CREATE ROLE test_role`);
   ```

4. **Debugging** - Temporarily bypass all restrictions
   ```typescript
   // Only for debugging, not production tests
   const allData = await pg.any('SELECT * FROM sensitive_table');
   console.log('Debug:', allData);
   ```

### Use db (App User with Role Switching) For:

1. **Everything else** - This is 95%+ of your operations:
   - Creating schemas, tables, views, functions
   - Inserting test data
   - Testing RLS policies
   - Testing role-based permissions
   - All queries and business logic

2. **Setup that should roll back**
   ```typescript
   db.setContext({ role: 'administrator' });
   await db.query(`CREATE TABLE test_table (...)`);
   ```

3. **Test data**
   ```typescript
   db.setContext({ role: 'administrator' });
   await db.query(`INSERT INTO users VALUES (...)`);
   ```

4. **RLS testing**
   ```typescript
   db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });
   const products = await db.any('SELECT * FROM products');
   ```

## Complete Example

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Step 1: Use pg ONLY for extensions (true superuser operations)
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  
  // Step 2: Switch to db with administrator role for everything else
  db.setContext({ role: 'administrator' });
  
  // Step 3: Create schema and tables with db
  await db.query(`
    CREATE SCHEMA IF NOT EXISTS app;
    
    CREATE TABLE app.users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      name TEXT
    );
    
    CREATE TABLE app.products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id UUID REFERENCES app.users(id)
    );
  `);
  
  // Step 4: Enable RLS with db
  await db.query(`
    ALTER TABLE app.products ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY user_products ON app.products
      FOR ALL TO authenticated
      USING (owner_id = current_setting('jwt.claims.user_id')::UUID);
  `);
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();  // Only manage db
});

afterEach(async () => {
  await db.afterEach();   // Only manage db
});

describe('RLS Testing', () => {
  it('should insert users and products', async () => {
    // Setup: Insert users as administrator
    db.setContext({ role: 'administrator' });
    
    const user1 = await db.one(
      `INSERT INTO app.users (email, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      ['alice@example.com', 'Alice Johnson']
    );
    
    const user2 = await db.one(
      `INSERT INTO app.users (email, name) 
       VALUES ($1, $2) 
       RETURNING *`,
      ['bob@example.com', 'Bob Smith']
    );
    
    // Test: Insert products as authenticated user (RLS enforced)
    db.setContext({
      role: 'authenticated',
      'jwt.claims.user_id': user1.id
    });
    
    const product1 = await db.one(
      `INSERT INTO app.products (name, owner_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      ['Laptop Pro', user1.id]
    );
    
    // Verify: Can only see own products
    const myProducts = await db.any('SELECT * FROM app.products');
    expect(myProducts.length).toBe(1);
    expect(myProducts[0].id).toBe(product1.id);
    
    // Verify: Can't see other user's products
    db.setContext({
      role: 'authenticated',
      'jwt.claims.user_id': user2.id
    });
    
    const otherProducts = await db.any('SELECT * FROM app.products');
    expect(otherProducts.length).toBe(0); // RLS working!
  });
  
  it('should start clean after rollback', async () => {
    db.setContext({ role: 'administrator' });
    
    const users = await db.any('SELECT * FROM app.users');
    const products = await db.any('SELECT * FROM app.products');
    
    expect(users.length).toBe(0);    // ✅ Rolled back
    expect(products.length).toBe(0); // ✅ Rolled back
  });
});
```

## Why This Works Better Than Scenarios A & B

### vs Scenario A (Dual Connection with Both Rolled Back)

**Scenario A Problems:**
- ❌ Must manage two separate transactions
- ❌ Easy to forget to roll back one connection
- ❌ Data inserted via `pg` won't roll back if you forget `pg.afterEach()`
- ❌ More complex code
- ❌ Slower (two transactions)

**Scenario C Advantages:**
- ✅ Only manage one transaction (`db`)
- ✅ Impossible to forget rollback (only one connection to roll back)
- ✅ `pg` is only used for persistent setup
- ✅ Simpler code
- ✅ Faster (one transaction)

### vs Scenario B (Single Connection Only)

**Scenario B Problems:**
- ❌ Can't create extensions or use true superuser operations
- ❌ Must either skip those operations or manually set up outside tests

**Scenario C Advantages:**
- ✅ Can handle extensions and superuser operations when needed
- ✅ Still keeps the simplicity of single connection for test data

## Understanding the Dual Connection Rollback Problem

This section explains why Scenario A can be problematic and why Scenario C avoids these issues.

### The Visibility and Rollback Confusion

In Scenario A, both connections can see each other's data, but their rollbacks are independent:

```typescript
// Scenario A approach (AVOID THIS)
beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

it('test with mixed connections', async () => {
  // Insert via pg
  await pg.query(`INSERT INTO users (email) VALUES ('alice@example.com')`);
  
  // Insert via db
  await db.query(`INSERT INTO products (name) VALUES ('Widget')`);
  
  // Both can see each other's data!
  const users = await db.any('SELECT * FROM users');    // ✅ Sees alice
  const products = await pg.any('SELECT * FROM products'); // ✅ Sees Widget
});

// After this test:
// - pg.afterEach() rolls back users (alice is gone)
// - db.afterEach() rolls back products (Widget is gone)
// ✅ Works correctly IF you remember both afterEach calls
```

### Common Mistakes with Dual Connection

#### Mistake 1: Forgetting to Roll Back pg

```typescript
// ❌ WRONG: Only rolling back db
beforeEach(async () => {
  await db.beforeEach();  // Missing pg.beforeEach()!
});

afterEach(async () => {
  await db.afterEach();   // Missing pg.afterEach()!
});

it('test 1', async () => {
  await pg.query(`INSERT INTO users (email) VALUES ('alice@example.com')`);
  await db.query(`INSERT INTO products (name) VALUES ('Widget')`);
});

it('test 2: NOT CLEAN!', async () => {
  const users = await pg.any('SELECT * FROM users');
  expect(users.length).toBe(0); // ❌ FAILS - alice still there!
  
  const products = await db.any('SELECT * FROM products');
  expect(products.length).toBe(0); // ✅ PASSES - rolled back
});
```

#### Mistake 2: Mixing Connections Inconsistently

```typescript
beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

it('setup uses pg', async () => {
  // Insert users via pg
  await pg.query(`INSERT INTO users (email) VALUES ('alice@example.com')`);
});

it('test uses db', async () => {
  // Try to query users via db
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(1); // ❌ Might fail or pass depending on timing
});
```

### How Scenario C Avoids These Issues

**Scenario C uses a clear separation:**

```typescript
// ✅ CORRECT: Scenario C approach
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // pg is used ONLY here for extensions (never rolled back)
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
  // db handles everything else
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE users (...)`);
});

beforeEach(async () => {
  await db.beforeEach();  // Only one connection to manage
});

afterEach(async () => {
  await db.afterEach();   // Only one connection to manage
});

it('test 1', async () => {
  db.setContext({ role: 'administrator' });
  await db.query(`INSERT INTO users (email) VALUES ('alice@example.com')`);
});

it('test 2: ALWAYS CLEAN!', async () => {
  db.setContext({ role: 'administrator' });
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(0); // ✅ ALWAYS PASSES - simple and reliable
});
```

**Key differences:**
1. ✅ `pg` is only used in `beforeAll` for persistent setup
2. ✅ `pg` is never rolled back (doesn't need to be)
3. ✅ `db` handles all test data (one connection to manage)
4. ✅ Impossible to mix connections incorrectly
5. ✅ Impossible to forget to roll back the right connection

## Rollback Behavior Summary

| Operation | Connection | Rolled Back? | Notes |
|-----------|------------|--------------|-------|
| CREATE EXTENSION in beforeAll | pg | ❌ No | Persists across all tests (intended) |
| CREATE TABLE in beforeAll | db | ❌ No | Persists across all tests (intended) |
| INSERT in test | db | ✅ Yes | Cleaned up by db.afterEach() |
| Any operation in test | db | ✅ Yes | Cleaned up by db.afterEach() |

**Simple rule:** 
- `pg` in `beforeAll` only → never rolled back (intended)
- `db` everywhere else → rolled back by `db.afterEach()`

## Migration from Other Scenarios

### From Scenario A (Dual with Both Rolled Back)

**Before:**
```typescript
beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

it('test', async () => {
  await pg.query(`INSERT INTO users ...`);
  await db.query(`INSERT INTO products ...`);
});
```

**After:**
```typescript
beforeEach(async () => {
  await db.beforeEach();  // Only db
});

afterEach(async () => {
  await db.afterEach();   // Only db
});

it('test', async () => {
  db.setContext({ role: 'administrator' });
  await db.query(`INSERT INTO users ...`);
  await db.query(`INSERT INTO products ...`);
});
```

### From Scenario B (Single Connection Only)

**Before:**
```typescript
beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  
  // Can't create extensions - skipped or manual setup required
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE users (...)`);
});
```

**After:**
```typescript
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Now can create extensions!
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE users (...)`);
});
```

## Advantages of Scenario C

1. ✅ **Simplest transaction management** - Only one connection to roll back
2. ✅ **Handles all use cases** - Can do extensions when needed
3. ✅ **Least error-prone** - Impossible to forget to roll back pg (it's not rolled back)
4. ✅ **Clear separation** - pg for persistent setup, db for test data
5. ✅ **Fast** - Only one transaction to manage in tests
6. ✅ **Works for RLS** - Administrator role has BYPASSRLS
7. ✅ **Production-ready** - Best practices for real-world testing

## Disadvantages

1. ⚠️ **Slightly more complex than Scenario B** - Need to get both connections even if pg rarely used
2. ⚠️ **Must remember role switching** - Need to call setContext() explicitly

## Summary

**Scenario C is the recommended approach because:**
- Uses `pg` only for true superuser operations in `beforeAll`
- Uses `db` with role switching for everything else
- Only manages one transaction (simple rollback)
- Handles all use cases (extensions + RLS testing)
- Least error-prone (impossible to mix connections incorrectly)

**Use this pattern unless you have a specific reason not to.**

## Quick Reference

```typescript
// ✅ The Scenario C Pattern
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  await pg.query(`CREATE EXTENSION ...`);  // pg for extensions only
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE ...`);      // db for everything else
});

beforeEach(async () => {
  await db.beforeEach();  // Only manage db
});

afterEach(async () => {
  await db.afterEach();   // Only manage db
});

it('test', async () => {
  db.setContext({ role: 'administrator' });
  await db.query(`INSERT INTO ...`);     // All test data via db
  
  db.setContext({ role: 'authenticated', ... });
  const data = await db.any('SELECT ...'); // Test RLS via db
});
```
