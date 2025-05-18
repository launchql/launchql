# pgsql-test

<p align="center" width="100%">
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/pgsql-test">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fpgsql-test%2Fpackage.json"/>
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

### LaunchQL migrations

Part of the [LaunchQL](https://github.com/launchql) ecosystem, `pgsql-test` is built to pair seamlessly with our TypeScript-based [Sqitch](https://sqitch.org/) engine rewrite:

* 🚀 **Lightning-fast migrations** — powered by LaunchQL’s native deployer (10x faster than legacy Sqitch)
* 🔧 **Composable test scaffolds** — integrate with full LaunchQL stacks or use standalone


## Table of Contents

1. [Install](#install)
2. [Features](#features)
3. [Quick Start](#-quick-start)
4. [`getConnections()` Overview](#getconnections-overview)
5. [PgTestClient API Overview](#pgtestclient-api-overview)
6. [Usage Examples](#usage-examples)
   * [Basic Setup](#-basic-setup)
   * [Role-Based Context](#-role-based-context)
   * [SQL File Seeding](#-sql-file-seeding)
   * [Programmatic Seeding](#-programmatic-seeding)
   * [CSV Seeding](#️-csv-seeding)
   * [JSON Seeding](#️-json-seeding)
   * [Sqitch Seeding](#️-sqitch-seeding)
   * [LaunchQL Seeding](#-launchql-seeding)
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

This applies the settings using `SET LOCAL` statements, ensuring they persist only for the current transaction and maintain proper isolation between tests.

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

### 🔌 SQL File Seeding

Use `.sql` files to set up your database state before tests:

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const sql = (f: string) => path.join(__dirname, 'sql', f);

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, seed.sqlfile([
    sql('schema.sql'),
    sql('fixtures.sql')
  ])));
});

afterAll(async () => {
  await teardown();
});
```

### 🧠 Programmatic Seeding

Use JavaScript functions to insert seed data:

```ts
import { getConnections, seed } from 'pgsql-test';

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, seed.fn(async ({ pg }) => {
    await pg.query(`
      INSERT INTO users (name) VALUES ('Seeded User');
    `);
  })));
});
```

## 🗃️ CSV Seeding

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

## 🗃️ JSON Seeding

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

## 🏗️ Sqitch Seeding

*Note: While compatible with Sqitch syntax, LaunchQL uses its own high-performance [TypeScript-based deploy engine.](#-launchql-seeding) that we encourage using for sqitch projects*

You can seed your test database using a Sqitch project but with significantly improved performance by leveraging LaunchQL's TypeScript deployment engine:

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const cwd = path.resolve(__dirname, '../path/to/sqitch');

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
    seed.sqitch(cwd)
  ]));
});

it('runs a schema query', async () => {
  const res = await db.query('SELECT COUNT(*) FROM myapp.users');
  expect(+res.rows[0].count).toBeGreaterThanOrEqual(0);
});
```

This works for any Sqitch-compatible module, now accelerated by LaunchQL's deployment tooling.

## 🚀 LaunchQL Seeding

For LaunchQL modules with precompiled `sqitch.plan`, use `seed.launchql(cwd)` to apply a schema quickly with `deployFast()`:
For maximum performance with precompiled LaunchQL modules, use `seed.launchql(cwd)` to apply a schema at lightning speed with our TypeScript-powered `deployFast()`:

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const cwd = path.resolve(__dirname, '../path/to/launchql');

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
    seed.launchql(cwd) // uses deployFast() - up to 10x faster than traditional Sqitch!
  ]));
});

it('creates user records', async () => {
  await db.query(`INSERT INTO myapp.users (username, email) VALUES ('testuser', 'test@example.com')`);
  const res = await db.query(`SELECT COUNT(*) FROM myapp.users`);
  expect(+res.rows[0].count).toBeGreaterThan(0);
});
```

This is the fastest way to bring up a ready-to-query schema from a compiled LaunchQL module - perfect for both development and CI environments.

## Why LaunchQL's Approach?

LaunchQL provides the best of both worlds:

1. **Sqitch Compatibility**: Keep your familiar Sqitch syntax and migration approach
2. **TypeScript Performance**: Our TS-rewritten deployment engine delivers up to 10x faster schema deployments
3. **Developer Experience**: Tight feedback loops with near-instant schema setup for tests
4. **CI Optimization**: Dramatically reduced test suite run times with optimized deployment

By maintaining Sqitch compatibility while supercharging performance, LaunchQL enables you to keep your existing migration patterns while enjoying the speed benefits of our TypeScript engine.

## `getConnections` Options

This table documents the available options for the `getConnections` function. The options are passed as a combination of `pg` and `db` configuration objects.

### `db` Options (PgTestConnectionOptions)

| Option                   | Type       | Default          | Description                                                                 |
| ------------------------ | ---------- | ---------------- | --------------------------------------------------------------------------- |
| `db.extensions`          | `string[]` | `[]`             | Array of PostgreSQL extensions to include in the test database              |
| `db.cwd`                 | `string`   | `process.cwd()`  | Working directory used for LaunchQL/Sqitch projects                         |
| `db.connection.user`     | `string`   | `'app_user'`     | User for simulating RLS via `setContext()`                                  |
| `db.connection.password` | `string`   | `'app_password'` | Password for RLS test user                                                  |
| `db.connection.role`     | `string`   | `'anonymous'`    | Default role used during `setContext()`                                     |
| `db.template`            | `string`   | `undefined`      | Template database used for faster test DB creation                          |
| `db.rootDb`              | `string`   | `'postgres'`     | Root database used for administrative operations (e.g., creating databases) |
| `db.prefix`              | `string`   | `'db-'`          | Prefix used when generating test database names                             |

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

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
