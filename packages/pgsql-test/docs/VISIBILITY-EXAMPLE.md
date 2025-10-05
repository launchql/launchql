# Visibility Between pg and db Connections

## Can pg and db Read Each Other's Data?

**YES** - `pg` and `db` can read each other's uncommitted changes during a test because they're separate connections to the **same database**. PostgreSQL's default isolation level (READ COMMITTED) allows connections to see each other's uncommitted data.

## Practical Example

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Setup schema (using pg since it has superuser privileges)
  await pg.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT
    );
  `);
});

afterAll(async () => {
  await teardown();
});

// Roll back BOTH connections
beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

describe('Visibility Between Connections', () => {
  it('db can see data inserted by pg (uncommitted)', async () => {
    // Insert via pg (uncommitted - still in transaction)
    await pg.query(`
      INSERT INTO users (email, name) 
      VALUES ('alice@example.com', 'Alice')
    `);
    
    // Query via db - can it see pg's uncommitted insert?
    const users = await db.any('SELECT * FROM users');
    
    expect(users.length).toBe(1);           // ✅ YES - db can see it!
    expect(users[0].email).toBe('alice@example.com');
  });
  
  it('pg can see data inserted by db (uncommitted)', async () => {
    // Insert via db (uncommitted)
    await db.query(`
      INSERT INTO users (email, name) 
      VALUES ('bob@example.com', 'Bob')
    `);
    
    // Query via pg - can it see db's uncommitted insert?
    const users = await pg.any('SELECT * FROM users');
    
    expect(users.length).toBe(1);           // ✅ YES - pg can see it!
    expect(users[0].email).toBe('bob@example.com');
  });
  
  it('both connections can read data from both sources', async () => {
    // Insert via pg
    await pg.query(`
      INSERT INTO users (email, name) 
      VALUES ('alice@example.com', 'Alice')
    `);
    
    // Insert via db
    await db.query(`
      INSERT INTO users (email, name) 
      VALUES ('bob@example.com', 'Bob')
    `);
    
    // Both connections can see both inserts
    const usersViaPg = await pg.any('SELECT * FROM users ORDER BY email');
    const usersViaDb = await db.any('SELECT * FROM users ORDER BY email');
    
    expect(usersViaPg.length).toBe(2);
    expect(usersViaDb.length).toBe(2);
    expect(usersViaPg[0].email).toBe('alice@example.com');
    expect(usersViaPg[1].email).toBe('bob@example.com');
    expect(usersViaDb[0].email).toBe('alice@example.com');
    expect(usersViaDb[1].email).toBe('bob@example.com');
  });
  
  it('both connections start clean after rollback', async () => {
    // Previous test inserted data, but afterEach rolled back both connections
    const usersViaPg = await pg.any('SELECT * FROM users');
    const usersViaDb = await db.any('SELECT * FROM users');
    
    expect(usersViaPg.length).toBe(0);  // ✅ Clean
    expect(usersViaDb.length).toBe(0);  // ✅ Clean
  });
});
```

## Why This Matters

### PostgreSQL Isolation Levels

PostgreSQL's default isolation level is **READ COMMITTED**, which means:
- Connections can see committed data from other connections
- Connections can also see uncommitted data from their own transaction
- In pgsql-test, since both connections are in active transactions, they can see each other's uncommitted changes

### Implications for Testing

**If you roll back both connections:**
```typescript
beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});
```

Then during the test:
- ✅ `pg` can insert data and `db` can read it
- ✅ `db` can insert data and `pg` can read it
- ✅ Both connections see the same database state
- ✅ Everything gets rolled back at the end

## So Why Have Both Connections?

### Updated Answer: You Usually Don't Need Both!

**For RLS testing, you can use a single `db` connection** by switching roles with `setContext()`:

```typescript
it('should enforce RLS policies with single connection', async () => {
  // Setup as administrator - bypasses RLS (administrator role has BYPASSRLS)
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
  
  // Test as authenticated user - RLS is enforced!
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': '123'
  });
  
  const products = await db.any('SELECT * FROM products');
  
  expect(products.length).toBe(1);        // Only sees own products
  expect(products[0].owner_id).toBe(123); // Due to RLS policy
});
```

**Why this works:**
- The `administrator` role has `BYPASSRLS` privilege
- `setContext()` uses `SET LOCAL` to change roles temporarily within the transaction
- Everything stays in one connection and gets rolled back together
- Simpler, cleaner, and faster than managing two connections

### When You Actually Need Both Connections

✅ **Only use both `pg` and `db` when you need true superuser privileges:**

1. **Creating extensions** - requires SUPERUSER
   ```typescript
   await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
   ```

2. **System-level operations** that fail even with `administrator` role

3. **Testing the specific difference between superuser and non-superuser behavior**

## Recommended Approach: Single Connection

### For Most Scenarios (Including RLS Testing)

Use a single `db` connection and switch roles with `setContext()`:

```typescript
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
});

beforeEach(async () => {
  await db.beforeEach();  // Single connection
});

afterEach(async () => {
  await db.afterEach();   // Single connection
});

it('can do everything with single connection', async () => {
  // Setup as administrator (has BYPASSRLS)
  db.setContext({ role: 'administrator' });
  
  await db.query(`
    CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT);
    INSERT INTO users (email) VALUES ('admin@example.com');
  `);
  
  // Test as different role if needed
  db.setContext({ role: 'authenticated' });
  
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(1);
});

it('starts clean after rollback', async () => {
  db.setContext({ role: 'administrator' });
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(0); // Rolled back
});
```

### When You Need pg for Superuser Operations

Only get `pg` if you need true superuser privileges:

```typescript
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Use pg only for superuser operations
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
  // Everything else can use db with role switching
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE users (...)`);
});
```

## Summary

| Question | Answer |
|----------|--------|
| Can `pg` and `db` read each other's data? | ✅ YES - they're separate connections to the same database |
| If I roll back both, can they see each other's changes? | ✅ YES - during the test, before rollback |
| Can I test RLS with single connection? | ✅ YES - use `setContext({ role: 'administrator' })` for setup, then switch to `authenticated` for testing |
| When do I need both connections? | ⚠️ Only for true superuser operations like `CREATE EXTENSION` |
| Should I use a single connection? | ✅ YES - recommended for most scenarios, including RLS testing |

### Decision Tree

```
Do you need SUPERUSER privileges (e.g., CREATE EXTENSION)?
├─ YES → Use both pg and db
│         - pg for superuser-only operations (in beforeAll)
│         - db for everything else (with setContext role switching)
│         - Roll back only db in beforeEach/afterEach
│
└─ NO  → Use only db (RECOMMENDED)
          - Use setContext({ role: 'administrator' }) to bypass RLS for setup
          - Use setContext({ role: 'authenticated', ... }) to test with RLS
          - Roll back only db in beforeEach/afterEach
          - Simpler, faster, and cleaner
```

### Best Practice

**Recommended: Single connection with role switching (works for RLS testing too!)**
```typescript
beforeAll(async () => {
  ({ db, teardown } = await getConnections());
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

it('tests RLS with single connection', async () => {
  // Setup as administrator (bypasses RLS)
  db.setContext({ role: 'administrator' });
  await db.query(`
    CREATE TABLE products (id SERIAL, owner_id INT);
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    CREATE POLICY user_products ON products
      FOR ALL TO authenticated
      USING (owner_id = current_setting('jwt.claims.user_id')::INT);
  `);
  await db.query(`INSERT INTO products (owner_id) VALUES (123), (456)`);
  
  // Test as authenticated user (RLS enforced)
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });
  const products = await db.any('SELECT * FROM products');
  expect(products.length).toBe(1); // RLS working!
});
```

**Only use pg if you need superuser operations:**
```typescript
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  
  // Use pg ONLY for superuser operations
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
  // Use db for everything else
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE ...`);
});

beforeEach(async () => {
  await db.beforeEach();  // Only roll back db
});

afterEach(async () => {
  await db.afterEach();   // Only roll back db
});
```
