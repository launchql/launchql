# Scenario A: Dual Connection Strategy (pg + db)

## Overview

This scenario uses **both `pg` and `db` connections** with their default roles:
- `pg`: Superuser (e.g., `postgres`) - bypasses all RLS policies
- `db`: App-level user (e.g., `app_user`) - respects RLS policies

**No special grants are needed** - each connection works with its native privileges.

## Configuration

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // pg has superuser privileges by default
  // db has app_user privileges by default
});

afterAll(async () => {
  await teardown();
});
```

## How Data Sharing Works

### Visibility Between Connections

Both connections can see each other's **uncommitted data** because:
- They connect to the **same database**
- PostgreSQL's default isolation level is **READ COMMITTED**
- Uncommitted data from one connection is visible to the other

```typescript
it('demonstrates data sharing', async () => {
  await pg.begin();
  await db.begin();
  
  // pg inserts data (uncommitted)
  await pg.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);
  
  // db CAN see pg's uncommitted data
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(1); // ✅ Visible!
  
  // db inserts data (uncommitted)
  await db.query('INSERT INTO products (name) VALUES ($1)', ['Widget']);
  
  // pg CAN see db's uncommitted data
  const products = await pg.any('SELECT * FROM products');
  expect(products.length).toBe(1); // ✅ Visible!
});
```

### Key Point: Independent Transactions

**Critical:** Even though they can see each other's data, their **transactions are independent**:
- Rolling back `pg` does NOT roll back `db`
- Rolling back `db` does NOT roll back `pg`
- You must manage each connection's transaction state separately

## Rollback Combinations Table

This table shows what happens to data depending on which `beforeEach`/`afterEach` you call:

| beforeEach Called | afterEach Called | Data via `pg` | Data via `db` | Notes |
|------------------|------------------|---------------|---------------|-------|
| `pg.beforeEach()` + `db.beforeEach()` | `pg.afterEach()` + `db.afterEach()` | ✅ Rolled back | ✅ Rolled back | **RECOMMENDED**: Both connections clean between tests |
| `db.beforeEach()` only | `db.afterEach()` only | ❌ **NOT rolled back** | ✅ Rolled back | **COMMON MISTAKE**: pg data persists! |
| `pg.beforeEach()` only | `pg.afterEach()` only | ✅ Rolled back | ❌ **NOT rolled back** | db data persists! |
| `pg.beforeEach()` + `db.beforeEach()` | `db.afterEach()` only | ❌ **NOT rolled back** | ✅ Rolled back | Forgot to roll back pg! |
| `pg.beforeEach()` + `db.beforeEach()` | `pg.afterEach()` only | ✅ Rolled back | ❌ **NOT rolled back** | Forgot to roll back db! |
| Neither | Neither | ❌ **NOT rolled back** | ❌ **NOT rolled back** | No transaction management |
| `pg.beforeEach()` + `db.beforeEach()` | Neither | ❌ **NOT rolled back** | ❌ **NOT rolled back** | Transactions started but never cleaned up |

### Detailed Scenario Examples

#### ✅ Correct: Roll Back Both Connections

```typescript
beforeEach(async () => {
  await pg.beforeEach();  // BEGIN + SAVEPOINT on pg
  await db.beforeEach();  // BEGIN + SAVEPOINT on db
});

afterEach(async () => {
  await pg.afterEach();   // ROLLBACK + COMMIT on pg
  await db.afterEach();   // ROLLBACK + COMMIT on db
});

it('test 1: inserts data', async () => {
  await pg.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);
  await db.query('INSERT INTO products (name) VALUES ($1)', ['Widget']);
  
  // Both inserts are visible during the test
  const users = await pg.any('SELECT * FROM users');
  const products = await db.any('SELECT * FROM products');
  expect(users.length).toBe(1);
  expect(products.length).toBe(1);
});

it('test 2: starts clean', async () => {
  // Both connections were rolled back
  const users = await pg.any('SELECT * FROM users');
  const products = await db.any('SELECT * FROM products');
  expect(users.length).toBe(0);  // ✅ Clean
  expect(products.length).toBe(0); // ✅ Clean
});
```

#### ❌ Incorrect: Only Roll Back db

```typescript
beforeEach(async () => {
  await db.beforeEach();  // Only db transaction!
});

afterEach(async () => {
  await db.afterEach();   // Only db rollback!
});

it('test 1: inserts data', async () => {
  await pg.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);
  await db.query('INSERT INTO products (name) VALUES ($1)', ['Widget']);
});

it('test 2: NOT CLEAN!', async () => {
  const users = await pg.any('SELECT * FROM users');
  const products = await db.any('SELECT * FROM products');
  expect(users.length).toBe(0);    // ❌ FAILS - alice still there!
  expect(products.length).toBe(0); // ✅ PASSES - products rolled back
});
```

## When to Use Scenario A

### ✅ Use Dual Connection When:

1. **You want strict separation between admin and user operations**
   - Clear distinction between setup (pg) and testing (db)
   - Prevents accidentally mixing privileges

2. **Testing RLS policies without role switching**
   - pg naturally bypasses RLS (superuser)
   - db naturally respects RLS (app user)
   - No need to call `setContext()`

3. **You need superuser operations**
   - Creating extensions (`CREATE EXTENSION`)
   - System-level operations
   - Schema modifications that require superuser

4. **Testing permission differences explicitly**
   - Verify that superuser can do X but app user cannot
   - Test privilege escalation scenarios

### Example: RLS Testing with Dual Connection

```typescript
beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

it('should enforce RLS policies', async () => {
  // Setup as superuser (automatically bypasses RLS)
  await pg.query(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      owner_id INT
    );
    
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY user_products ON products
      FOR ALL TO app_user
      USING (owner_id = current_setting('jwt.claims.user_id')::INT);
  `);
  
  // Insert test data as superuser (bypasses RLS)
  await pg.query(`
    INSERT INTO products (name, owner_id) 
    VALUES ('Product 1', 123), ('Product 2', 456)
  `);
  
  // Test as app user (RLS enforced)
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': '123'
  });
  
  const products = await db.any('SELECT * FROM products');
  
  expect(products.length).toBe(1);        // Only sees own products
  expect(products[0].owner_id).toBe(123); // Due to RLS
});
```

## Advantages

1. **Clear role separation** - No confusion about which connection has which privileges
2. **No role switching needed** - pg and db have their natural roles
3. **Explicit privilege boundaries** - Makes it obvious when you're operating as admin vs user
4. **Safer for production-like testing** - Mimics real-world separation of admin and user

## Disadvantages

1. **More complex rollback management** - Must remember to roll back both connections
2. **Easy to make mistakes** - Forgetting to roll back one connection is a common error
3. **More verbose setup** - Need to manage two connections and their lifecycles
4. **Slightly slower** - Two transactions to manage instead of one

## Summary

**Scenario A is ideal when:**
- You want strict separation between admin and user contexts
- You need superuser operations that can't be done by app users
- You prefer explicit privilege boundaries
- You're willing to manage two independent transactions

**Trade-offs:**
- ✅ Clear separation and explicit privileges
- ✅ No role switching required
- ❌ More complex rollback management
- ❌ Easy to forget to roll back both connections
