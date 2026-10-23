---
name: pgsql-test
description: PostgreSQL integration testing with pgsql-test — RLS policies, seeding, exceptions, snapshots, helpers, JWT context, and complex scenario setup. Use when asked to "test RLS", "test permissions", "seed test data", "snapshot test", "test database", "write integration tests", "test user access", "handle aborted transactions", or when writing any PostgreSQL test with pgsql-test.
compatibility: pgsql-test, Jest/Vitest, PostgreSQL, Node.js 18+
metadata:
  author: constructive-io
  version: "2.0.0"
---

# pgsql-test (PostgreSQL Integration Testing)

pgsql-test provides a complete testing toolkit for PostgreSQL — from RLS policy verification and test seeding to snapshot utilities and complex multi-client scenario management. All tests run in transactions with savepoint-based isolation.

## When to Apply

Use this skill when:
- **Testing RLS policies:** Verifying user isolation, role-based access, multi-tenant security
- **Seeding test data:** Loading fixtures with loadJson, loadSql, loadCsv
- **Testing exceptions:** Handling aborted transactions when operations should fail
- **Snapshot testing:** Deterministic assertions with pruneIds, pruneDates, etc.
- **Building helpers:** Reusable test functions, constants, assertion utilities
- **JWT context:** Simulating authenticated users with claims for RLS
- **Complex scenarios:** Multi-client patterns, transaction management, cross-connection visibility

## Quick Start

```bash
pnpm add -D pgsql-test
```

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;  // Superuser (bypasses RLS)
let db: PgTestClient;  // App-level (enforces RLS)
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
  await pg.afterEach();
});
```

## Core Concepts

### Two Database Clients

| Client | Purpose |
|--------|---------|
| `pg` | Superuser — setup/teardown, bypasses RLS |
| `db` | App-level — testing with RLS enforcement |

### Test Isolation

Each test runs in a transaction with savepoints:
- `beforeEach()` starts a savepoint
- `afterEach()` rolls back to savepoint
- Tests are completely isolated

## Testing RLS Policies

```typescript
// Set user context
db.setContext({
  role: 'authenticated',
  'request.jwt.claim.sub': userId
});

// Users only see their own records
const result = await db.query('SELECT * FROM app.posts');
expect(result.rows).toHaveLength(1);
```

## Handling Expected Failures (Savepoint Pattern)

When testing operations that should fail, use `db.expectError()` to avoid "current transaction is aborted" errors (see [pgsql-test-exceptions.md](./pgsql-test-exceptions.md)):

```typescript
it('rejects unauthorized access', async () => {
  db.setContext({ role: 'anonymous' });

  await db.expectError(
    () => db.query('INSERT INTO app.private_data (secret) VALUES ($1)', ['hack']),
    /permission denied/
  );

  // Connection still works
  const result = await db.query('SELECT 1 as ok');
  expect(result.rows[0].ok).toBe(1);
});
```

## Seeding Test Data

```typescript
// Inline JSON (best for small datasets)
await pg.loadJson({
  'app.users': [
    { id: 'user-1', email: 'alice@example.com', name: 'Alice' }
  ]
});

// SQL files (best for complex data)
await pg.loadSql([path.join(__dirname, 'fixtures/seed.sql')]);

// CSV files (best for large datasets, uses COPY)
await pg.loadCsv({
  'app.categories': path.join(__dirname, 'fixtures/categories.csv')
});
```

## Snapshot Testing

```typescript
import { snapshot, IdHash } from 'pgsql-test/utils';

const result = await db.query('SELECT * FROM users ORDER BY email');
expect(snapshot(result.rows)).toMatchSnapshot();

// With ID tracking
const idHash: IdHash = {};
result.rows.forEach((row, i) => { idHash[row.id] = i + 1; });
expect(snapshot(result.rows, idHash)).toMatchSnapshot();
```

Default pruners: `pruneTokens`, `prunePeoplestamps`, `pruneDates`, `pruneIdArrays`, `pruneUUIDs`, `pruneHashes`, `pruneIds`.

## JWT Context for RLS

```typescript
// Authenticated user
db.setContext({
  role: 'authenticated',
  'jwt.claims.user_id': userId
});

// Organization context
db.setContext({
  role: 'authenticated',
  'jwt.claims.user_id': userId,
  'jwt.claims.org_id': orgId
});

// Anonymous
db.setContext({ role: 'anonymous' });

// Clear context
db.clearContext();
```

## Reusable Test Helpers

```typescript
export const TEST_USER_IDS = {
  USER_1: '00000000-0000-0000-0000-000000000001',
  USER_2: '00000000-0000-0000-0000-000000000002',
  ADMIN: '00000000-0000-0000-0000-000000000099',
} as const;

export function setAuthContext(db: PgTestClient, userId: string): void {
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': userId,
  });
}
```

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| "current transaction is aborted" | Use savepoint pattern before expected failures |
| Data persists between tests | Ensure `beforeEach`/`afterEach` hooks are set up |
| RLS blocking test inserts | Use `pg` (superuser) for seeding, `db` for testing |
| Foreign key violations in seeding | Load parent tables before child tables |
| Tests interfere with each other | Every test file needs `beforeEach`/`afterEach` hooks |

## Reference Guide

Consult these reference files for detailed documentation on specific topics:

| Reference | Topic | Consult When |
|-----------|-------|--------------|
| [references/rls.md](references/rls.md) | Testing RLS policies | SELECT/INSERT/UPDATE/DELETE policies, multi-user isolation, anonymous access |
| [references/seeding.md](references/seeding.md) | Seeding test databases | loadJson, loadSql, loadCsv, RLS-aware seeding, fixture organization |
| [references/exceptions.md](references/exceptions.md) | Handling aborted transactions | Savepoint pattern for expected failures, constraint violations, permission errors |
| [references/snapshot.md](references/snapshot.md) | Snapshot testing utilities | pruneIds, pruneDates, IdHash tracking, custom pruners, error formatting |
| [references/helpers.md](references/helpers.md) | Reusable test helpers | Constants, typed helpers, assertion utilities, test-utils organization |
| [references/jwt-context.md](references/jwt-context.md) | JWT claims and role context | setContext API, auth() helper, reading claims in SQL, context timing |
| [references/scenario-setup.md](references/scenario-setup.md) | Complex test scenarios | Two-client pattern, transaction management, publish(), per-describe setup |

## Cross-References

Related skills (separate from this skill):
- **`constructive-testing`** — Framework selection guide: which testing framework to use (pgsql-test vs graphile-test vs graphql-test vs server-test) and anti-patterns to avoid
- `pgpm` (`references/testing.md`) — General pgpm test setup and seed adapters
- `drizzle-orm-test` — Testing with Drizzle ORM (uses pgsql-test utilities)
- `constructive-security` — Constructive Authz authorization policies that RLS tests validate
