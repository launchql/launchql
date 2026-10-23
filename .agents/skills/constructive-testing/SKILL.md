---
name: constructive-testing
description: "PostgreSQL testing frameworks — pgsql-test (RLS, seeding, snapshots, JWT context, scenario setup), drizzle-orm-test (type-safe Drizzle testing), supabase-test (Supabase RLS testing). Use when writing database tests, testing RLS policies, seeding test data, or testing with any Constructive test framework."
compatibility: pgsql-test, drizzle-orm-test, supabase-test, Jest/Vitest, PostgreSQL
  triggers: "user, model"
metadata:
  author: constructive-io
  version: "2.0.0"
---

# Constructive Testing

All database testing frameworks for Constructive. Each framework builds on `pgsql-test` underneath — they all create isolated test databases with proper teardown.

## When to Apply

Use this skill when:
- Writing PostgreSQL integration tests
- Testing RLS policies, permissions, multi-tenant security
- Seeding test data (fixtures, JSON, SQL, CSV)
- Testing with Drizzle ORM or Supabase

## Which Framework to Use

| Scenario | Framework | Reference |
|----------|-----------|-----------|
| Raw SQL, RLS policies, database functions | `pgsql-test` | [pgsql-test.md](./references/pgsql-test.md) |
| PostGraphile schema, basic GraphQL queries | `graphile-test` | (part of constructive monorepo) |
| GraphQL with Constructive plugins (search, pgvector, etc.) | `@constructive-io/graphql-test` | (part of constructive monorepo) |
| Dynamic codegen + ORM in tests | `@constructive-io/graphql-test` (`runCodegenAndLoad`) | (part of constructive monorepo) |
| HTTP endpoints, auth headers, middleware | `@constructive-io/graphql-server-test` | (part of constructive monorepo) |
| Type-safe Drizzle ORM tests | `drizzle-orm-test` | [drizzle-orm-test.md](./references/drizzle-orm-test.md) |
| Supabase applications, auth.users | `supabase-test` | [supabase-test.md](./references/supabase-test.md) |

## Quick Start (pgsql-test)

```typescript
import { getConnections } from 'pgsql-test';

let db, teardown;
beforeAll(async () => ({ db, teardown } = await getConnections()));
afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());

test('example', async () => {
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });
  const result = await db.query('SELECT current_user_id()');
  expect(result.rows[0].current_user_id).toBe('123');
});
```

## The Testing Framework Hierarchy

Choose the **highest-level framework** that fits your test scenario:

```
┌─────────────────────────────────────────────────────┐
│  @constructive-io/graphql-server-test               │  HTTP-level
│  SuperTest against real Express + PostGraphile       │  (full stack)
├─────────────────────────────────────────────────────┤
│  @constructive-io/graphql-test                      │  GraphQL + Constructive
│  GraphQL queries with all Constructive plugins      │  plugins loaded
├─────────────────────────────────────────────────────┤
│  graphile-test                                      │  GraphQL schema-level
│  GraphQL queries against PostGraphile schema        │  (no HTTP)
├─────────────────────────────────────────────────────┤
│  pgsql-test                                         │  SQL-level
│  Raw SQL queries, RLS, seeding, snapshots           │  (database only)
└─────────────────────────────────────────────────────┘
```

## Critical Rules

1. **Always include `beforeEach`/`afterEach` hooks** — savepoint-based isolation prevents test state leakage
2. **Never create `new pg.Pool()` or `new pg.Client()` in tests** — use `getConnections()`
3. **Never manually create/drop databases** — the framework handles this
4. **Never skip hooks** — tests will leak state
5. **Assert expected failures with `db.expectError(() => db.query(...), /pattern/)`** — it wraps the statement in a savepoint so the transaction stays usable. Never write a local `expectRejects`-style helper or raw `SAVEPOINT` / `ROLLBACK TO SAVEPOINT` SQL ([pgsql-test-exceptions.md](./references/pgsql-test-exceptions.md))

## Reference Guide

### Core Test Framework (pgsql-test)

| Reference | Topic | Consult When |
|-----------|-------|--------------|
| [pgsql-test.md](./references/pgsql-test.md) | pgsql-test overview and setup | Getting started with PostgreSQL testing |
| [pgsql-test-rls.md](./references/pgsql-test-rls.md) | RLS policy testing | Testing row-level security, user isolation |
| [pgsql-test-seeding.md](./references/pgsql-test-seeding.md) | Test data seeding | loadJson, loadSql, loadCsv fixtures |
| [pgsql-test-exceptions.md](./references/pgsql-test-exceptions.md) | `db.expectError()` | Testing operations that should fail (RLS denials, constraint/permission errors, raised errors) |
| [pgsql-test-snapshot.md](./references/pgsql-test-snapshot.md) | Snapshot testing | pruneIds, pruneDates, deterministic assertions |
| [pgsql-test-helpers.md](./references/pgsql-test-helpers.md) | Helper utilities | Common test helper functions |
| [pgsql-test-jwt-context.md](./references/pgsql-test-jwt-context.md) | JWT context testing | Setting JWT claims, testing authenticated queries |
| [pgsql-test-transactions.md](./references/pgsql-test-transactions.md) | Transaction-local context & roles | `beforeAll` context gotcha, three roles (superuser/administrator/authenticated), `pg` vs `db` |
| [pgsql-test-scenario-setup.md](./references/pgsql-test-scenario-setup.md) | Complex scenario setup | Multi-client scenarios, complex test arrangements |

### Additional Frameworks

| Reference | Topic | Consult When |
|-----------|-------|--------------|
| [drizzle-orm-test.md](./references/drizzle-orm-test.md) | Drizzle ORM testing | Type-safe database tests with Drizzle |
| [supabase-test.md](./references/supabase-test.md) | Supabase testing | Testing Supabase apps, auth.users, anon/authenticated roles |

## Cross-References

- `pgpm` — Database migrations (deploy before testing)
- `constructive-setup` — Monorepo setup and local development environment
