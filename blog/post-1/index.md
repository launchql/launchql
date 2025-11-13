---
imageSrc: '/public/posts/11-11-2025-pgsql-test/launchql.jpg'
publishedDate: '2025-11-11'
authorGithubId: pyramation
title: 'How pgsql-test Makes Postgres Feel Like Jest'
description: 'Introducing pgsql-test: TypeScript-native database testing that feels as natural as testing your frontend code.'
---

Postgres is the world's most-loved database for good reason. It's powerful, reliable, and scales with your ambitions. But when it comes to testing, developers often find themselves caught between two worlds: the database-centric approach of tools like pgTap, and the fast, isolated testing patterns they use everywhere else in their stack. We built pgsql-test to bridge that gap—not because testing "hasn't caught up," but because we wanted to create the best possible developer experience for testing Postgres applications.

## The Developer Experience We Wanted

Great developer experience is about fast iterations and clear feedback. When you're building features, you want to write a test, run it, see the results, and iterate—all in seconds, not minutes. This tight feedback loop is what makes frontend development feel productive: you change some code, your tests run, and you know immediately if something broke.

We wanted that same experience for Postgres. Not mocked databases or in-memory substitutes, but real Postgres—with real schemas, real constraints, real triggers, and real Row-Level Security policies. The kind of testing that gives you confidence to ship.

## How It Works: Ephemeral Databases for Every Test

At the heart of pgsql-test is a simple idea: every test gets its own isolated database environment. When you call `getConnections()`, the framework spins up a fresh, UUID-named database, seeds it with your schema and data, and hands you a client ready to run queries. When your tests finish, everything tears down cleanly—no residue, no conflicts, no manual cleanup.

```typescript
import { getConnections } from 'pgsql-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
});

afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());

test('user operations work correctly', async () => {
  await db.query(`INSERT INTO users (name) VALUES ('Alice')`);
  const result = await db.query('SELECT COUNT(*) FROM users');
  expect(result.rows[0].count).toBe('1');
});
```

Each test runs inside its own transaction with savepoint-based rollback. The `beforeEach()` hook starts a transaction and sets a savepoint, while `afterEach()` rolls back to that savepoint. This means every test starts with a clean slate, but you're testing against a real database with all its constraints and behaviors intact.

In our own test suite, we've measured this isolation overhead at just milliseconds per test. One of our benchmark suites running three tests with full schema deployment and rollback completes in under 100ms total. That's the kind of feedback loop that keeps you in flow.

## Modular Migrations: Build Once, Compose Everywhere

One of the most powerful aspects of pgsql-test is how it integrates with LaunchQL's migration framework. LaunchQL treats database schemas as composable modules—each with its own migration plan, dependencies, and version tags. This modular approach means you can build reusable database components that work across multiple projects.

Here's a real example from our test fixtures. We have three modules: `my-first`, `my-second`, and `my-third`. Each declares its dependencies in a `.control` file:

```
# my-first.control
requires = 'citext,plpgsql,pgcrypto'

# my-second.control  
requires = 'citext,plpgsql,pgcrypto,my-first'

# my-third.control
requires = 'citext,plpgsql,pgcrypto,my-second'
```

The dependency chain is clear: `my-third` depends on `my-second`, which depends on `my-first`. But dependencies aren't just at the module level—individual migration scripts can declare fine-grained dependencies too:

```sql
-- Deploy my-third:create_schema to pg
-- requires: my-second:create_table

BEGIN;
CREATE SCHEMA mythirdapp;
COMMIT;
```

This cross-module dependency resolution happens automatically. When you deploy `my-third`, LaunchQL's migration engine resolves the entire dependency graph, deploys modules in the correct order, and tracks what's been applied. In tests, this means you can seed a complex multi-module schema with a single line:

```typescript
const { db, teardown } = await getConnections({}, [
  seed.launchql('/path/to/my-third')
]);
```

The framework discovers `my-third`'s dependencies, deploys `my-first`, then `my-second`, then `my-third`—all in milliseconds. You get a fully functioning database with schemas, tables, functions, and policies, ready to test against.

For LaunchQL projects, this is even simpler. If you're already in a LaunchQL module directory, `getConnections()` with no arguments automatically deploys your module:

```typescript
// Zero configuration - just works
const { db, teardown } = await getConnections();
```

This composability extends to your entire workspace. In a pnpm monorepo with multiple database modules, each module can be developed and tested independently, then composed together in integration tests. The migration framework handles the orchestration, and pgsql-test gives you the isolated environments to test it all.

## Testing Row-Level Security Like a Real User

Row-Level Security is one of Postgres's most powerful features, but it's also one of the hardest to test. You need to simulate different users, different roles, different JWT claims—all while ensuring your policies actually work as intended.

pgsql-test makes this straightforward with role-switching helpers. The `auth()` method lets you simulate any user context:

```typescript
describe('RLS policies', () => {
  beforeEach(async () => {
    await db.auth({ 
      role: 'authenticated',
      userId: '123'
    });
    await db.beforeEach();
  });

  afterEach(() => db.afterEach());

  it('users can only see their own posts', async () => {
    // Insert posts for different users
    await db.query(`
      INSERT INTO posts (user_id, content) 
      VALUES ('123', 'My post'), ('456', 'Other post')
    `);
    
    // Query as user 123
    const result = await db.query('SELECT * FROM posts');
    
    // Should only see own post due to RLS policy
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].content).toBe('My post');
  });
});
```

Behind the scenes, `auth()` uses PostgreSQL's `SET LOCAL` to configure session variables like `role` and `jwt.claims.user_id`. These settings persist for the transaction, giving you realistic RLS behavior without complex setup. You can test authenticated users, anonymous users, admin bypasses, organization-scoped access—any pattern your application uses.

Here's a real example from our test suite showing how context switching works:

```typescript
it('sets role and userId', async () => {
  db.auth({ role: 'authenticated', userId: '12345' });

  const role = await db.query('SELECT current_setting(\'role\', true) AS role');
  expect(role.rows[0].role).toBe('authenticated');

  const userId = await db.query('SELECT current_setting(\'jwt.claims.user_id\', true) AS user_id');
  expect(userId.rows[0].user_id).toBe('12345');
});
```

The context is scoped to your transaction, so different tests can simulate different users without interfering with each other. This isolation is what makes RLS testing reliable—you're not fighting shared state or worrying about cleanup between tests.

## Flexible Seeding: Meet Developers Where They Are

Not every project uses LaunchQL migrations. Some teams have SQL files, others use ORMs, and some prefer programmatic seeding. pgsql-test supports all of these approaches through composable seed adapters.

**SQL Files:** If you have existing schema files, load them directly:

```typescript
const { db, teardown } = await getConnections({}, [
  seed.sqlfile(['schema.sql', 'fixtures.sql'])
]);
```

**Programmatic Seeding:** For dynamic data or complex setup logic:

```typescript
const { db, teardown } = await getConnections({}, [
  seed.fn(async ({ pg }) => {
    await pg.query(`
      CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);
      INSERT INTO users (name) VALUES ('Alice'), ('Bob');
    `);
  })
]);
```

**JSON Data:** For inline fixtures that live with your tests:

```typescript
const { db, teardown } = await getConnections({}, [
  seed.json({
    'users': [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  })
]);
```

**CSV Files:** For larger datasets or data exported from production:

```typescript
const { db, teardown } = await getConnections({}, [
  seed.csv({
    'users': '/path/to/users.csv',
    'posts': '/path/to/posts.csv'
  })
]);
```

You can compose multiple strategies together. A common pattern is to use LaunchQL for schema deployment, then add test-specific fixtures:

```typescript
const { db, teardown } = await getConnections({}, [
  seed.launchql('./my-module'),           // Deploy schema
  seed.json({                             // Add test data
    'users': [{ id: 1, name: 'Test User' }]
  }),
  seed.fn(async ({ pg }) => {             // Custom setup
    await pg.query(`SELECT setval('users_id_seq', 1000)`);
  })
]);
```

This flexibility means pgsql-test works whether you're building a greenfield LaunchQL project or adding tests to an existing codebase.

## Advanced Control: Publish and Rollback

Sometimes you need more control over transaction boundaries. The `publish()` method lets you commit data within a test while maintaining the test harness:

```typescript
it('makes data visible across connections', async () => {
  // Insert data
  await pg.query(`INSERT INTO users (email) VALUES ('alice@test.com')`);
  
  // Data not visible to other connections yet
  const before = await db.query('SELECT * FROM users WHERE email = $1', ['alice@test.com']);
  expect(before.rows).toHaveLength(0);
  
  // Commit the data
  await pg.publish();
  
  // Now visible to other connections
  const after = await db.query('SELECT * FROM users WHERE email = $1', ['alice@test.com']);
  expect(after.rows).toHaveLength(1);
});
```

After calling `publish()`, the data is committed to the database and visible to other connections. But the test harness remains active—you can continue making changes, and `afterEach()` will still clean up properly.

You can also use `rollback()` to return to a savepoint without ending the test:

```typescript
it('allows selective rollback', async () => {
  await pg.query(`INSERT INTO users (email) VALUES ('bob@test.com')`);
  await pg.publish();  // Bob is committed
  
  await pg.query(`INSERT INTO users (email) VALUES ('charlie@test.com')`);
  
  // Rollback Charlie, keep Bob
  await pg.rollback();
  
  const result = await pg.query('SELECT * FROM users');
  expect(result.rows).toHaveLength(1);  // Only Bob remains
  expect(result.rows[0].email).toBe('bob@test.com');
});
```

These primitives give you fine-grained control over data visibility and transaction boundaries, which is essential for testing complex multi-connection scenarios or simulating race conditions.

## Test Framework Agnostic by Design

pgsql-test doesn't lock you into a specific test runner. It's built on standard async/await patterns and works with any test framework that supports asynchronous tests. We use Jest in our examples because it's popular, but the same code works in Mocha, Vitest, or any other runner:

```typescript
// Jest
beforeAll(async () => { /* setup */ });
afterAll(async () => { /* teardown */ });

// Mocha
before(async () => { /* setup */ });
after(async () => { /* teardown */ });

// Vitest
beforeAll(async () => { /* setup */ });
afterAll(async () => { /* teardown */ });
```

Under the hood, pgsql-test is just a wrapper around the standard `pg` library with some smart transaction management. There's no magic, no custom test runner, no framework-specific hooks. This simplicity means it integrates cleanly into existing test suites and CI pipelines.

## Real-World Performance

Speed matters when you're iterating on features. We've optimized pgsql-test for the tight feedback loops that keep developers productive. Here's what that looks like in practice:

Our rollback test suite runs three tests with full transaction isolation—inserting data, verifying isolation, and checking cleanup. The entire suite completes in under 100ms, with individual tests averaging around 20-30ms each. That includes starting transactions, running queries, and rolling back.

For LaunchQL module deployment, we use a fast-path deployment strategy that bundles migrations into a single transaction. In our benchmarks, deploying a multi-table schema with foreign keys and indexes takes just milliseconds. This is significantly faster than traditional migration tools that deploy changes one at a time.

The secret is in the architecture. By using PostgreSQL's native transaction and savepoint features, we avoid the overhead of creating and destroying databases between tests. The database stays running, and we just manage transaction boundaries. Combined with LaunchQL's TypeScript-based migration engine (which is up to 10x faster than legacy Perl-based tools), you get a testing experience that feels instant.

## Closing the Feedback Loop

The real value of pgsql-test isn't in any single feature—it's in how all these pieces work together to create a development experience that feels effortless. You write a test, it runs in milliseconds, and you get clear feedback about what works and what doesn't. No waiting for Docker containers to start, no manual database cleanup, no wondering if your test environment matches production.

This tight feedback loop changes how you work. Instead of treating database testing as a chore that happens at the end of development, it becomes part of your flow. You write tests as you build features, refactor with confidence, and catch bugs before they reach production. You spend less time being a QA engineer manually testing edge cases, and more time being a real engineer building features that matter.

## The Broader Ecosystem

pgsql-test is part of a larger ecosystem of tools we've built for Postgres development. If you're using Supabase, check out [supabase-test](https://www.npmjs.com/package/supabase-test), which builds on pgsql-test with Supabase-specific defaults and helpers. For GraphQL APIs, [graphile-test](https://www.npmjs.com/package/graphile-test) provides authentication mocking and PostGraphile-specific utilities.

We've been building open-source tooling for the Postgres community since 2020, and our goal has always been the same: make database development feel as productive and enjoyable as frontend development. pgsql-test is a big step toward that vision.

## Getting Started

Install pgsql-test from npm:

```bash
npm install pgsql-test
```

Then write your first test:

```typescript
import { getConnections } from 'pgsql-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  
  await db.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
});

afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());

test('can insert and query users', async () => {
  await db.query(`INSERT INTO users (name) VALUES ('Alice')`);
  const result = await db.query('SELECT * FROM users');
  expect(result.rows).toHaveLength(1);
  expect(result.rows[0].name).toBe('Alice');
});

test('starts clean', async () => {
  const result = await db.query('SELECT * FROM users');
  expect(result.rows).toHaveLength(0);
});
```

That's it. Real Postgres, real isolation, real confidence.

Check out the [full documentation](https://github.com/launchql/launchql/tree/main/packages/pgsql-test) to learn more about seeding strategies, RLS testing, and advanced features. And if you're building with LaunchQL, remember that `getConnections()` with no arguments just works—zero configuration required.

We're excited to see what you build with it.
