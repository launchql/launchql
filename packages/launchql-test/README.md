# launchql-test

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/launchql-test">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Flaunchql-test%2Fpackage.json"/>
  </a>
</p>

`launchql-test` builds on top of [`pgsql-test`](https://www.npmjs.com/package/pgsql-test) to provide robust GraphQL testing utilities for PostGraphile-based projects **with all LaunchQL plugins pre-configured**.

It provides a seamless setup for isolated, seeded, role-aware Postgres databases and injects GraphQL helpers for snapshot testing, role context, and mutation/query assertions. This package includes all the default plugins from `graphile-settings` (connection filters, full-text search, PostGIS, uploads, i18n, etc.) for a batteries-included testing experience.

## 🚀 Features

* 🔁 **Per-test rollback** via savepoints for isolation
* 🔐 **RLS-aware context injection** (`setContext`)
* 🧪 **GraphQL integration testing** with `query()` and snapshot support
* 📦 **Seed support** for `.sql`, JSON, CSV, LaunchQL, or Sqitch
* 📊 **Introspection query snapshotting**
* 🔧 **Raw SQL fallback** via `pg.client.query`

## 📦 Install

```bash
npm install launchql-test
```

## ✨ Quick Start

```ts
import { getConnections, seed } from 'launchql-test';

let db, query, teardown;

beforeAll(async () => {
  ({ db, query, teardown } = await getConnections({
    schemas: ['app_public'],
    authRole: 'authenticated'
  }, [
    seed.sqlfile(['../sql/test.sql', '../sql/grants.sql'])
  ]));
});

beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());
afterAll(() => teardown());

it('runs a GraphQL mutation', async () => {
  const res = await query(`mutation { ... }`, { input: { ... } });
  expect(res.data.createUser.username).toBe('alice');
});
```

## 📘 API

### `getConnections(options, seeders)`

Returns an object with:

* `query(gqlString, variables?)` – A GraphQL executor function with positional arguments
* `db`, `pg` – `PgTestClient` instances
* `teardown()` – Clean up temp DBs

**Basic Usage:**
```ts
const result = await query(`mutation { ... }`, { input: { ... } });
expect(result.data.createUser.username).toBe('alice');
```

### `PgTestClient`

Supports:

* `query`, `any`, `one`, etc. (via `pg-promise`-like helpers)
* `beforeEach()` / `afterEach()` – for savepoint transaction handling
* `setContext({...})` – sets Postgres config (e.g., `role`, `myapp.user_id`)

**See full `PgTestClient` API docs**: [pgsql-test → PgTestClient API Overview](https://www.npmjs.com/package/pgsql-test#pgtestclient-api-overview)

## 🧪 Example Tests

### GraphQL mutation + snapshot

```ts
const res = await query(`mutation { ... }`, { input: { ... } });
expect(snapshot(res.data)).toMatchSnapshot();
```

### RLS testing with role switch

```ts
db.setContext({ role: 'anonymous' });
const res = await query(`query { ... }`);
expect(res.errors[0].message).toMatch(/permission denied/);
```

### Typed queries for better safety

```ts
interface CreateUserVariables {
  input: {
    user: {
      username: string;
    };
  };
}

interface CreateUserResult {
  createUser: {
    user: {
      id: number;
      username: string;
    };
  };
}

const res = await query<CreateUserResult, CreateUserVariables>(`
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        user {
          id
          username
        }
      }
    }
  `,
  { input: { user: { username: 'alice' } } }
);

expect(res.data?.createUser.user.username).toBe('alice');
```

## 🔧 Advanced Connection Options

For specific testing needs, additional connection functions are available:

### Error Handling Variants
- `getConnectionsUnwrapped()` – Automatically throws on GraphQL errors, returns data directly

### Debugging Variants  
- `getConnectionsWithLogging()` – Logs all queries and responses
- `getConnectionsWithTiming()` – Times query execution

### Object-Based API
- `getConnectionsObject()` – Uses `query({ query: "...", variables: {} })` syntax
- `getConnectionsObjectUnwrapped()` – Object-based with automatic error throwing

**Unwrapped Example (cleaner assertions):**
```ts
import { getConnectionsUnwrapped } from 'graphile-test';

const { query } = await getConnectionsUnwrapped(config);

// Throws automatically on GraphQL errors, returns data directly
const result = await query(`mutation { ... }`, { input: { ... } });
expect(result.createUser.username).toBe('alice'); // No .data needed!
```

**Object-Based Example:**
```ts
import { getConnectionsObject } from 'graphile-test';

const { query } = await getConnectionsObject(config);

const result = await query({ 
  query: `mutation { ... }`, 
  variables: { input: { ... } } 
});
expect(result.data.createUser.username).toBe('alice');
```

## 🧱 Under the Hood

`graphile-test` wraps and extends `pgsql-test` with GraphQL helpers like `query()` and introspection snapshot tools. You can drop into raw SQL testing anytime via `pg.client.query()` (superuser) or `db.client.query()` (RLS user).

## ✅ Best Practices

* Use `db.setContext({ role, user_id })` to simulate authentication.
* Always wrap tests with `beforeEach` / `afterEach`.
* Use `snapshot()` to track GraphQL result changes.
* Use `useRoot: true` to test schema visibility without RLS.
* Start with `getConnections()` for most use cases.
* Consider `getConnectionsUnwrapped()` for cleaner test assertions.

## Snapshot Utilities

The `launchql-test/utils` module provides utilities for sanitizing query results for snapshot testing. These helpers replace dynamic values (IDs, UUIDs, dates, hashes) with stable placeholders, making snapshots deterministic.

```ts
import { snapshot } from 'launchql-test/utils';

const res = await query(`query { allUsers { nodes { id name createdAt } } }`);
expect(snapshot(res.data)).toMatchSnapshot();
```

See [`pgsql-test` Snapshot Utilities](https://www.npmjs.com/package/pgsql-test#snapshot-utilities) for the full API reference.
