# Analysis of the RLS Demo Test Code

## The Test Code

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
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

describe('RLS Demo - Data Insertion', () => {
  it('should insert users and products', async () => {
    // Insert users via pg
    const user1 = await pg.one(
      `INSERT INTO rls_test.users (email, name) 
       VALUES ($1, $2) 
       RETURNING id, email, name`,
      ['alice@example.com', 'Alice Johnson']
    );

    const user2 = await pg.one(
      `INSERT INTO rls_test.users (email, name) 
       VALUES ($1, $2) 
       RETURNING id, email, name`,
      ['bob@example.com', 'Bob Smith']
    );

    // Insert products via db
    db.setContext({
      role: 'authenticated',
      'jwt.claims.user_id': user1.id
    });

    const product1 = await db.one(
      `INSERT INTO rls_test.products (name, description, price, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, price, owner_id`,
      ['Laptop Pro', 'High-performance laptop', 1299.99, user1.id]
    );

    db.setContext({
      role: 'authenticated',
      'jwt.claims.user_id': user2.id
    });

    const product2 = await db.one(
      `INSERT INTO rls_test.products (name, description, price, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, price, owner_id`,
      ['Wireless Mouse', 'Ergonomic mouse', 49.99, user2.id]
    );

    expect(user1.email).toBe('alice@example.com');
    expect(product1.name).toBe('Laptop Pro');
    expect(product1.owner_id).toEqual(user1.id);
    expect(product2.owner_id).toEqual(user2.id);
    expect(product2.name).toBe('Wireless Mouse');
  });

  it('should rollback to initial state', async () => {
    db.setContext({
      role: 'service_role'
    });

    const result = await db.any(
      `SELECT u.name, p.name as product_name, p.price
       FROM rls_test.users u
       JOIN rls_test.products p ON u.id = p.owner_id
       ORDER BY u.name, p.name`
    );
    expect(result.length).toEqual(0);
  });
});
```

## Problem Analysis

### ❌ The Test Is INCORRECTLY Set Up

**The Issue:** The test expects everything to roll back, but it won't because:

1. **Users are inserted via `pg`** (lines with `pg.one(...)`)
2. **Products are inserted via `db`** (lines with `db.one(...)`)
3. **Only `db` is rolled back** (in `afterEach()`)
4. **`pg` is never rolled back**

### What Actually Happens

#### First Test: "should insert users and products"
```typescript
// These inserts happen on the pg connection (superuser)
const user1 = await pg.one('INSERT INTO rls_test.users ...');
const user2 = await pg.one('INSERT INTO rls_test.users ...');

// These inserts happen on the db connection (app user)
const product1 = await db.one('INSERT INTO rls_test.products ...');
const product2 = await db.one('INSERT INTO rls_test.products ...');
```

When this test completes:
- `afterEach()` is called
- `db.afterEach()` rolls back the `db` connection
- **Products are deleted** (they were inserted via `db`)
- **Users remain in the database** (they were inserted via `pg`, which was never rolled back)

#### Second Test: "should rollback to initial state"
```typescript
const result = await db.any(
  `SELECT u.name, p.name as product_name, p.price
   FROM rls_test.users u
   JOIN rls_test.products p ON u.id = p.owner_id
   ORDER BY u.name, p.name`
);
expect(result.length).toEqual(0);  // ❌ This expectation is misleading!
```

This test **passes**, but not for the reason you might think:
- The **users still exist** in the database (Alice and Bob)
- The **products were rolled back** (they were inserted via `db`)
- The JOIN returns 0 rows because there are no products, **not because there are no users**

**This is why the test passes**, but it's testing the wrong thing! It's not actually verifying that "everything rolled back to initial state" – it's only verifying that the products rolled back.

## How to Fix

### Option 1: Use Only `db` for All Operations ✅ RECOMMENDED

```typescript
beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

describe('RLS Demo - Data Insertion', () => {
  it('should insert users and products', async () => {
    // Use db for EVERYTHING - it will all be rolled back
    const user1 = await db.one(
      `INSERT INTO rls_test.users (email, name) 
       VALUES ($1, $2) 
       RETURNING id, email, name`,
      ['alice@example.com', 'Alice Johnson']
    );

    const user2 = await db.one(
      `INSERT INTO rls_test.users (email, name) 
       VALUES ($1, $2) 
       RETURNING id, email, name`,
      ['bob@example.com', 'Bob Smith']
    );

    db.setContext({
      role: 'authenticated',
      'jwt.claims.user_id': user1.id
    });

    const product1 = await db.one(
      `INSERT INTO rls_test.products (name, description, price, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, price, owner_id`,
      ['Laptop Pro', 'High-performance laptop', 1299.99, user1.id]
    );

    // ... rest of test
  });

  it('should rollback to initial state', async () => {
    db.setContext({
      role: 'service_role'
    });

    // Now this correctly tests that EVERYTHING rolled back
    const users = await db.any('SELECT * FROM rls_test.users');
    const products = await db.any('SELECT * FROM rls_test.products');
    
    expect(users.length).toEqual(0);      // ✅ Actually tests users
    expect(products.length).toEqual(0);   // ✅ Tests products
  });
});
```

**Why this is better:**
- Everything is inserted via `db`
- Everything is rolled back by `db.afterEach()`
- The second test actually verifies that **both** users and products rolled back
- Clearer and more correct test behavior

### Option 2: Roll Back Both Connections

```typescript
beforeEach(async () => {
  await pg.beforeEach();  // Roll back pg too
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();   // Roll back pg too
  await db.afterEach();
});

describe('RLS Demo - Data Insertion', () => {
  it('should insert users and products', async () => {
    // Now you CAN use both connections
    const user1 = await pg.one(
      `INSERT INTO rls_test.users (email, name) 
       VALUES ($1, $2) 
       RETURNING id, email, name`,
      ['alice@example.com', 'Alice Johnson']
    );
    
    // ... rest of test with both pg and db
  });

  it('should rollback to initial state', async () => {
    // Both pg and db were rolled back
    const users = await db.any('SELECT * FROM rls_test.users');
    const products = await db.any('SELECT * FROM rls_test.products');
    
    expect(users.length).toEqual(0);
    expect(products.length).toEqual(0);
  });
});
```

**When to use this:**
- When you specifically need `pg`'s superuser privileges for test data
- When you're testing admin operations alongside user operations
- When you want explicit control over both connections

### Option 3: Use pg for Setup Only (Not Rolled Back)

```typescript
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Use pg for permanent setup (schema, reference data, etc.)
  await pg.query(`
    CREATE TABLE IF NOT EXISTS rls_test.users (
      id SERIAL PRIMARY KEY,
      email TEXT,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS rls_test.products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      description TEXT,
      price NUMERIC,
      owner_id INT REFERENCES rls_test.users(id)
    );
  `);
});

beforeEach(async () => {
  await db.beforeEach();  // Only roll back db
});

afterEach(async () => {
  await db.afterEach();   // Only roll back db
});

describe('RLS Demo - Data Insertion', () => {
  it('should insert users and products', async () => {
    // Use db for ALL test data
    const user1 = await db.one(
      `INSERT INTO rls_test.users (email, name) 
       VALUES ($1, $2) 
       RETURNING id, email, name`,
      ['alice@example.com', 'Alice Johnson']
    );
    
    // ... rest with db only
  });
});
```

**When to use this:**
- When you need `pg` only for one-time schema setup
- When all test data should be rolled back
- Clearest separation of concerns

## Summary

### The Original Test

**Status:** ❌ **Incorrect** (but appears to pass)

**Why it's wrong:**
- Mixes `pg` and `db` operations
- Only rolls back `db`
- Users remain in database after each test
- Second test passes for wrong reason (products gone, but users still there)

**The second test SHOULD fail if it were correctly testing full rollback:**
```typescript
it('should rollback to initial state', async () => {
  // This would reveal the bug:
  const users = await db.any('SELECT * FROM rls_test.users');
  expect(users.length).toEqual(0);  // ❌ FAILS - users are still there!
});
```

### Recommended Fix

**Use Option 1:** Change all `pg.one()` calls to `db.one()` calls. This ensures everything is rolled back correctly and the second test actually verifies what it claims to verify.

### Key Lesson

When using `pgsql-test`:
1. **Understand that `pg` and `db` are separate connections**
2. **Choose one connection for test data** (usually `db`)
3. **Roll back the connections you're using for test data**
4. **Test what you think you're testing** - verify both users and products rolled back, not just one
