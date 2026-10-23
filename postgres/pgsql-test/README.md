# pgsql-test

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
  <a href="https://www.npmjs.com/package/pgsql-test">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=postgres%2Fpgsql-test%2Fpackage.json"/>
  </a>
</p>

`pgsql-test` gives you instant, isolated PostgreSQL databases for each test — with automatic transaction rollbacks, context switching, and clean seeding. Forget flaky tests and brittle environments. Write real SQL. Get real coverage. Stay fast.

## Install

```sh
npm install pgsql-test
```

## Features

* ⚡ **Instant test DBs** — each one seeded, isolated, and UUID-named
* 🔄 **Per-test rollback** — every test runs in its own transaction or savepoint
* 🛡️ **RLS-friendly** — test with role-based auth via `.setContext()`
* 🌱 **Flexible seeding** — run `.sql` files, programmatic seeds, or even load fixtures
* 🧪 **Compatible with any async runner** — works with `Jest`, `Mocha`, etc.
* 🧹 **Auto teardown** — no residue, no reboots, just clean exits

### Tutorials

📚 **[Learn how to test PG with pgsql-test →](https://constructive.io/learn/e2e-postgres-testing)**

### Using with Supabase

If you're writing tests for Supabase, check out [`supabase-test`](https://www.npmjs.com/package/supabase-test) for Supabase-optimized defaults.

### pgpm migrations

Part of the [pgpm](https://pgpm.io) ecosystem, `pgsql-test` is built to pair seamlessly with our TypeScript-based package manager and migration tool. `pgpm` gives you modular Postgres packages, deterministic plans, and tag-aware releases—perfect for authoring the migrations that `pgsql-test` runs.

## Table of Contents

1. [Install](#install)
2. [Features](#features)
3. [Quick Start](#-quick-start)
4. [`getConnections()` Overview](#getconnections-overview)
5. [PgTestClient API Overview](#pgtestclient-api-overview)
6. [Usage Examples](#usage-examples)
   * [Basic Setup](#-basic-setup)
   * [Role-Based Context](#-role-based-context)
   * [Seeding System](#-seeding-system)
   * [SQL File Seeding](#-sql-file-seeding)
   * [Programmatic Seeding](#-programmatic-seeding)
   * [CSV Seeding](#️-csv-seeding)
   * [JSON Seeding](#️-json-seeding)
   * [pgpm Seeding](#-pgpm-seeding)
7. [`getConnections() Options` ](#getconnections-options)
8. [Disclaimer](#disclaimer)


## ✨ Quick Start

```ts
import { getConnections } from 'pgsql-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  await db.query(`SELECT 1`); // ✅ Ready to run queries
});

afterAll(() => teardown());
```

## `getConnections()` Overview

```ts
import { getConnections } from 'pgsql-test';

// Complete object destructuring
const { pg, db, admin, teardown, manager } = await getConnections();

// Most common pattern
const { db, teardown } = await getConnections();
```

The `getConnections()` helper sets up a fresh PostgreSQL test database and returns a structured object with:

* `pg`: a `PgTestClient` connected as the root or superuser — useful for administrative setup or introspection
* `db`: a `PgTestClient` connected as the app-level user — used for running tests with RLS and granted permissions
* `admin`: a `DbAdmin` utility for managing database state, extensions, roles, and templates
* `teardown()`: a function that shuts down the test environment and database pool
* `manager`: a shared connection pool manager (`PgTestConnector`) behind both clients

Together, these allow fast, isolated, role-aware test environments with per-test rollback and full control over setup and teardown.

The `PgTestClient` returned by `getConnections()` is a fully-featured wrapper around `pg.Pool`. It provides:

* Automatic transaction and savepoint management for test isolation
* Easy switching of role-based contexts for RLS testing
* A clean, high-level API for integration testing PostgreSQL systems

## `PgTestClient` API Overview

```ts
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

beforeEach(() => pg.beforeEach());
afterEach(() => pg.afterEach());
afterAll(() => teardown());
```

The `PgTestClient` returned by `getConnections()` wraps a `pg.Client` and provides convenient helpers for query execution, test isolation, and context switching.

### Common Methods

* `query(sql, values?)` – Run a raw SQL query and get the `QueryResult`
* `beforeEach()` – Begins a transaction and sets a savepoint (called at the start of each test)
* `afterEach()` – Rolls back to the savepoint and commits the outer transaction (cleans up test state)
* `setContext({ key: value })` – Sets PostgreSQL config variables (like `role`) to simulate RLS contexts
* `expectError(run, expected?)` – Asserts `run` fails (message substring/RegExp, or `{ code, message }`) inside a savepoint, so the transaction stays usable afterwards; resolves to the caught error (see [Expected failures](#expected-failures))
* `checkConstraints()` – Runs the commit-time checks for any pending deferred constraints now, without committing (see [Deferred constraints](#deferred-constraints-under-rollback-isolation))
* `any`, `one`, `oneOrNone`, `many`, `manyOrNone`, `none`, `result` – Typed query helpers for specific result expectations

These methods make it easier to build expressive and isolated integration tests with strong typing and error handling.

The `PgTestClient` returned by `getConnections()` is a fully-featured wrapper around `pg.Pool`. It provides:

* Automatic transaction and savepoint management for test isolation
* Easy switching of role-based contexts for RLS testing
* A clean, high-level API for integration testing PostgreSQL systems

## Usage Examples

### ⚡ Basic Setup

```ts
import { getConnections } from 'pgsql-test';

let db; // A fully wrapped PgTestClient using pg.Pool with savepoint-based rollback per test
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());

  await db.query(`
    CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);
    CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), content TEXT);

    INSERT INTO users (name) VALUES ('Alice'), ('Bob');
    INSERT INTO posts (user_id, content) VALUES (1, 'Hello world!'), (2, 'Graphile is cool!');
  `);
});

afterAll(() => teardown());

beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());

test('user count starts at 2', async () => {
  const res = await db.query('SELECT COUNT(*) FROM users');
  expect(res.rows[0].count).toBe('2');
});
```

### 🔐 Role-Based Context


The `pgsql-test` framework provides powerful tools to simulate authentication contexts during tests, which is particularly useful when testing Row-Level Security (RLS) policies.

#### Setting Test Context

Use `setContext()` to simulate different user roles and JWT claims:

```ts
db.setContext({
  role: 'authenticated',
  'jwt.claims.user_id': '123',
  'jwt.claims.org_id': 'acme'
});
```

This applies the settings using `SET LOCAL` and `set_config(..., true)` statements, ensuring they persist only for the current transaction and maintain proper isolation between tests.

> **⚠️ Important:** `set_config(..., true)` is **transaction-local**. Inside test bodies (`it()` blocks), `beforeEach()` has already started a transaction, so context persists across queries automatically. However, in `beforeAll()` there is no active transaction — each query runs in auto-commit mode and context is lost between calls. If you need context-aware operations in `beforeAll()`, wrap them in explicit `db.begin()` / `db.commit()`:
>
> ```ts
> beforeAll(async () => {
>   ({ db, teardown } = await getConnections());
>   await db.begin();
>   db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });
>   await db.query('SELECT current_user_id()'); // context persists within transaction
>   await db.commit();
> });
> ```

#### Testing Role-Based Access

```ts
describe('authenticated role', () => {
  beforeEach(async () => {
    db.setContext({ role: 'authenticated' });
    await db.beforeEach();
  });

  afterEach(() => db.afterEach());

  it('runs as authenticated', async () => {
    const res = await db.query(`SELECT current_setting('role', true) AS role`);
    expect(res.rows[0].role).toBe('authenticated');
  });
});
```

#### Database Connection Options

For non-superuser testing, use the connection options described in the [options](#getconnections-options) section. The `db.connection` property allows you to customize the non-privileged user account for your tests.

Use `setContext()` to simulate Role-Based Access Control (RBAC) during tests. This is useful when testing Row-Level Security (RLS) policies. Your actual server should manage role/user claims via secure tokens (e.g., setting `current_setting('jwt.claims.user_id')`), but this interface helps emulate those behaviors in test environments.

#### Common Testing Scenarios

This approach enables testing various access patterns:
- Authenticated vs. anonymous user access
- Per-user data filtering
- Admin privilege bypass behavior
- Custom claim-based restrictions (organization membership, admin status)

> **Note:** While this interface helps simulate RBAC for testing, your production server should manage user/role claims via secure authentication tokens, typically by setting values like `current_setting('jwt.claims.user_id')` through proper authentication middleware.

### 🌱 Seeding System

The second argument to `getConnections()` is an optional array of `SeedAdapter` objects:

```ts
const { db, teardown } = await getConnections(getConnectionOptions, seedAdapters);
```

This array lets you fully customize how your test database is seeded. You can compose multiple strategies:

* [`seed.sqlfile()`](#-sql-file-seeding) – Execute raw `.sql` files from disk
* [`seed.fn()`](#-programmatic-seeding) – Run JavaScript/TypeScript logic to programmatically insert data
* [`seed.csv()`](#️-csv-seeding) – Load tabular data from CSV files
* [`seed.json()`](#️-json-seeding) – Use in-memory objects as seed data
* [`seed.loadPgpm()`](#-pgpm-seeding) – Apply a pgpm project or set of packages (compatible with sqitch)

> ✨ **Default Behavior:** If no `SeedAdapter[]` is passed, pgpm seeding is assumed. This makes `pgsql-test` zero-config for pgpm-based projects.

This composable system allows you to mix-and-match data setup strategies for flexible, realistic, and fast database tests.

#### Two Seeding Patterns

You can seed data using either approach:

**1. Adapter Pattern** (setup phase via `getConnections`)
```ts
const { db, teardown } = await getConnections({}, [
  seed.json({ 'users': [{ id: 1, name: 'Alice' }] })
]);
```

**2. Direct Load Methods** (runtime via `PgTestClient`)
```ts
await db.loadJson({ 'users': [{ id: 1, name: 'Alice' }] });
await db.loadCsv({ 'users': '/path/to/users.csv' });
await db.loadSql(['/path/to/schema.sql']);
```

> **Note:** `loadCsv()` and `loadPgpm()` do not apply RLS context (PostgreSQL limitation). Use `loadJson()` or `loadSql()` for RLS-aware seeding.

### 🔌 SQL File Seeding

**Adapter Pattern:**
```ts
const { db, teardown } = await getConnections({}, [
  seed.sqlfile(['schema.sql', 'fixtures.sql'])
]);
```

**Direct Load Method:**
```ts
await db.loadSql(['schema.sql', 'fixtures.sql']);
```

<details>
<summary>Full example</summary>

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const sql = (f: string) => path.join(__dirname, 'sql', f);

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
      seed.sqlfile([
        sql('schema.sql'),
        sql('fixtures.sql')
      ])
  ]));
});

afterAll(async () => {
  await teardown();
});
```

</details>

### 🧠 Programmatic Seeding

**Adapter Pattern:**
```ts
const { db, teardown } = await getConnections({}, [
  seed.fn(async ({ pg }) => {
    await pg.query(`INSERT INTO users (name) VALUES ('Seeded User')`);
  })
]);
```

**Direct Load Method:**
```ts
// Use any PgTestClient method directly
await db.query(`INSERT INTO users (name) VALUES ('Seeded User')`);
```

<details>
<summary>Full example</summary>

```ts
import { getConnections, seed } from 'pgsql-test';

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
    seed.fn(async ({ pg }) => {
      await pg.query(`
        INSERT INTO users (name) VALUES ('Seeded User');
      `);
    })
  ]));
});
```

</details>

## 🗃️ CSV Seeding

**Adapter Pattern:**
```ts
const { db, teardown } = await getConnections({}, [
  seed.csv({
    'users': '/path/to/users.csv',
    'posts': '/path/to/posts.csv'
  })
]);
```

**Direct Load Method:**
```ts
await db.loadCsv({
  'users': '/path/to/users.csv',
  'posts': '/path/to/posts.csv'
});
```

> **Note:** CSV loading uses PostgreSQL COPY which does not support RLS context.

<details>
<summary>Full example</summary>

You can load tables from CSV files using `seed.csv({ ... })`. CSV headers must match the table column names exactly. This is useful for loading stable fixture data for integration tests or CI environments.

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const csv = (file: string) => path.resolve(__dirname, '../csv', file);

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
    // Create schema
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id),
          content TEXT NOT NULL
        );
      `);
    }),
    // Load from CSV
    seed.csv({
      users: csv('users.csv'),
      posts: csv('posts.csv')
    }),
    // Adjust SERIAL sequences to avoid conflicts
    seed.fn(async ({ pg }) => {
      await pg.query(`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));`);
      await pg.query(`SELECT setval(pg_get_serial_sequence('posts', 'id'), (SELECT MAX(id) FROM posts));`);
    })
  ]));
});

afterAll(() => teardown());

it('has loaded rows', async () => {
  const res = await db.query('SELECT COUNT(*) FROM users');
  expect(+res.rows[0].count).toBeGreaterThan(0);
});
```

</details>

## 🗃️ JSON Seeding

**Adapter Pattern:**
```ts
const { db, teardown } = await getConnections({}, [
  seed.json({
    'custom.users': [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  })
]);
```

**Direct Load Method:**
```ts
await db.loadJson({
  'custom.users': [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
});
```

<details>
<summary>Full example</summary>

You can seed tables using in-memory JSON objects. This is useful when you want fast, inline fixtures without managing external files.

```ts
import { getConnections, seed } from 'pgsql-test';

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
    // Create schema
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE SCHEMA custom;
        CREATE TABLE custom.users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE custom.posts (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES custom.users(id),
          content TEXT NOT NULL
        );
      `);
    }),
    // Seed with in-memory JSON
    seed.json({
      'custom.users': [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ],
      'custom.posts': [
        { id: 1, user_id: 1, content: 'Hello world!' },
        { id: 2, user_id: 2, content: 'Graphile is cool!' }
      ]
    }),
    // Fix SERIAL sequences
    seed.fn(async ({ pg }) => {
      await pg.query(`SELECT setval(pg_get_serial_sequence('custom.users', 'id'), (SELECT MAX(id) FROM custom.users));`);
      await pg.query(`SELECT setval(pg_get_serial_sequence('custom.posts', 'id'), (SELECT MAX(id) FROM custom.posts));`);
    })
  ]));
});

afterAll(() => teardown());

it('has loaded rows', async () => {
  const res = await db.query('SELECT COUNT(*) FROM custom.users');
  expect(+res.rows[0].count).toBeGreaterThan(0);
});
```

</details>

## 🚀 pgpm Seeding

**Zero Configuration (Default):**
```ts
// pgpm migrate is used automatically
const { db, teardown } = await getConnections();
```

**Adapter Pattern (Custom Path):**
```ts
const { db, teardown } = await getConnections({}, [
  seed.loadPgpm('/path/to/pgpm-workspace', true) // with cache
]);
```

**Direct Load Method:**
```ts
await db.loadPpgm('/path/to/pgpm-workspace', true); // with cache
```

> **Note:** pgpm deployment has its own client handling and does not apply RLS context.

<details>
<summary>Full example</summary>

If your project uses pgpm modules with a precompiled `pgpm.plan`, you can use `pgsql-test` with **zero configuration**. Just call `getConnections()` — and it *just works*:

```ts
import { getConnections } from 'pgsql-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections()); // pgpm module is deployed automatically
});
```

pgpm uses Sqitch-compatible syntax with a TypeScript-based migration engine. By default, `pgsql-test` automatically deploys any pgpm module found in the current working directory (`process.cwd()`).

To specify a custom path to your pgpm module, use `seed.loadPgpm()` explicitly:

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const cwd = path.resolve(__dirname, '../path/to/pgpm-workspace');

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
    seed.loadPgpm(cwd)
  ]));
});
```

</details>

## Why pgpm's Approach?

pgpm provides the best of both worlds:

1. **Sqitch Compatibility**: Keep your familiar Sqitch syntax and migration approach
2. **TypeScript Performance**: Our TS-rewritten deployment engine delivers up to 10x faster schema deployments
3. **Developer Experience**: Tight feedback loops with near-instant schema setup for tests
4. **CI Optimization**: Dramatically reduced test suite run times with optimized deployment

By maintaining Sqitch compatibility while supercharging performance, pgpm enables you to keep your existing migration patterns while enjoying the speed benefits of our TypeScript engine.

## `getConnections` Options

This table documents the available options for the `getConnections` function. The options are passed as a combination of `pg` and `db` configuration objects.

### `db` Options (PgTestConnectionOptions)

| Option                   | Type       | Default          | Description                                                                 |
| ------------------------ | ---------- | ---------------- | --------------------------------------------------------------------------- |
| `db.extensions`          | `string[]` | `[]`             | Array of PostgreSQL extensions to include in the test database              |
| `db.cwd`                 | `string`   | `process.cwd()`  | Working directory used for pgpm or Sqitch projects                         |
| `db.connection.user`     | `string`   | `'app_user'`     | User for simulating RLS via `setContext()`                                  |
| `db.connection.password` | `string`   | `'app_password'` | Password for RLS test user                                                  |
| `db.connection.role`     | `string`   | `'anonymous'`    | Default role used during `setContext()`                                     |
| `db.template`            | `string`   | `undefined`      | Template database used for faster test DB creation                          |
| `db.rootDb`              | `string`   | `'postgres'`     | Root database used for administrative operations (e.g., creating databases) |
| `db.prefix`              | `string`   | `'db-'`          | Prefix used when generating test database names                             |
| `db.deferredConstraints` | `'off' \| 'check' \| 'immediate'` | `'off'` | How `DEFERRABLE INITIALLY DEFERRED` constraints are handled under rollback isolation (env: `DB_DEFERRED_CONSTRAINTS`). See below. |

### Expected failures

A failed statement aborts the surrounding transaction, so after a plain `expect(...).rejects` every later query in the test fails with `current transaction is aborted`. Use `expectError()` instead — it wraps the call in a savepoint, always rolls back to it, and throws if the call succeeds or fails differently:

```ts
it('anonymous users cannot write', async () => {
  db.setContext({ role: 'anonymous' });
  await db.expectError(() => db.query(`INSERT INTO app.posts (title) VALUES ('x')`), /permission denied/);
  await db.expectError(() => db.query(`DELETE FROM app.posts`), { code: '42501' });

  const err = await db.expectError(() => db.query(`SELECT app.transfer(-5)`));
  expect(err.message).toMatch(/^INVALID_AMOUNT/);

  // still usable
  expect((await db.one(`SELECT count(*) FROM app.posts`)).count).toBe('1');
});
```

`expected` is a message substring, a `RegExp`, or `{ code?: string; message?: string | RegExp }` (`code` is the SQLSTATE). Run the statement on the same client you call `expectError` on.

### Deferred constraints under rollback isolation

`beforeEach()`/`afterEach()` isolate tests by rolling back instead of committing. Anything Postgres only does **at COMMIT** therefore never happens inside a test. The one that bites is `DEFERRABLE INITIALLY DEFERRED` constraints (FK / UNIQUE / EXCLUDE / `CONSTRAINT TRIGGER`): a test can leave a dangling deferred foreign key and still pass, because the check that would have failed the commit is discarded with the rollback. This is inherent to every rollback-based test harness, not specific to pgsql-test.

`db.deferredConstraints` controls what to do about it:

| Mode          | What happens                                                                                                                                                                                              | Trade-off                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'off'`       | Nothing (default, previous behaviour).                                                                                                                                                                    | Deferred violations pass silently.                                                                                                                                     |
| `'check'`     | `afterEach()` runs `SET CONSTRAINTS ALL IMMEDIATE` as the last statement before rolling back. Postgres defines this as running exactly the checks COMMIT would have run, so deferral still works *inside* the test and a pending violation fails the test. | The failure surfaces in `afterEach`, not on the offending line (the message names the constraint and table). If the test body already raised a Postgres error, the check is skipped so the original error is not masked. |
| `'immediate'` | `beforeEach()` runs `SET CONSTRAINTS ALL IMMEDIATE`, so every deferred constraint is checked per statement and a violation fails on the exact line.                                                        | Changes semantics: code that legitimately relies on deferral (insert child before parent, swap two values under a deferred UNIQUE) fails in tests but works in production. |

```ts
const { db, teardown } = await getConnections({ db: { deferredConstraints: 'check' } });
```

A test that wants to *assert* that a deferred constraint is enforced can call `checkConstraints()` itself; once it has thrown, the pending events are consumed and `afterEach()` is clean:

```ts
it('rejects orphan children at commit', async () => {
  await db.query(`INSERT INTO children (parent_id) VALUES (999)`);
  await expect(db.checkConstraints()).rejects.toThrow(/children_parent_id_fkey/);
});
```

Other commit-only effects — `NOTIFY` delivery and visibility to other sessions — are not covered by any mode; use `publish()` (which really commits) when a test needs them.

### `pg` Options (PgConfig)

Environment variables will override these options when available:

* `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

| Option        | Type     | Default       | Description                                     |
| ------------- | -------- | ------------- | ----------------------------------------------- |
| `pg.user`     | `string` | `'postgres'`  | Superuser for PostgreSQL                        |
| `pg.password` | `string` | `'password'`  | Password for the PostgreSQL superuser           |
| `pg.host`     | `string` | `'localhost'` | Hostname for PostgreSQL                         |
| `pg.port`     | `number` | `5423`        | Port for PostgreSQL                             |
| `pg.database` | `string` | `'postgres'`  | Default database used when connecting initially |

### Usage

```ts
const { conn, db, teardown } = await getConnections({
  pg: { user: 'postgres', password: 'secret' },
  db: {
    extensions: ['uuid-ossp'],
    cwd: '/path/to/project',
    connection: { user: 'test_user', password: 'secret', role: 'authenticated' },
    template: 'test_template',
    prefix: 'test_',
    rootDb: 'postgres'
  }
});
```

## Snapshot Utilities

The `pgsql-test/utils` module provides utilities for sanitizing database query results for snapshot testing. These helpers replace dynamic values (IDs, UUIDs, dates, hashes) with stable placeholders, making snapshots deterministic.

```ts
import { snapshot } from 'pgsql-test/utils';

const result = await db.any('SELECT * FROM users');
expect(snapshot(result)).toMatchSnapshot();
```

### Available Functions

| Function | Description |
|----------|-------------|
| `snapshot(obj)` | Recursively prunes all dynamic values from an object or array |
| `prune(obj)` | Applies all prune functions to a single object |
| `pruneDates(obj)` | Replaces `Date` objects and date strings (fields ending in `_at` or `At`) with `[DATE]` |
| `pruneIds(obj)` | Replaces `id` and `*_id` fields with `[ID]` |
| `pruneIdArrays(obj)` | Replaces `*_ids` array fields with `[UUIDs-N]` |
| `pruneUUIDs(obj)` | Replaces UUID strings in `uuid` and `queue_name` fields with `[UUID]` |
| `pruneHashes(obj)` | Replaces `*_hash` fields starting with `$` with `[hash]` |

### Example

```ts
import { snapshot, pruneIds, pruneDates } from 'pgsql-test/utils';

// Full sanitization
const users = await db.any('SELECT * FROM users');
expect(snapshot(users)).toMatchSnapshot();

// Selective sanitization
const row = await db.one('SELECT id, name, created_at FROM users WHERE id = $1', [1]);
const sanitized = pruneDates(pruneIds(row));
// { id: '[ID]', name: 'Alice', created_at: '[DATE]' }
```
