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


`pgsql-test` provides an isolated PostgreSQL testing environment with per-test transaction rollback, ideal for integration tests involving SQL, roles, simulations, and complex migrations. With automatic rollbacks and isolated contexts, it eliminates test interference while delivering tight feedback loops for happier developers. We made database testing simple so you can focus on writing good tests instead of fighting your environment.

## Install

```sh
npm install pgsql-test
```

## Features

* ⚡ Quick-start setup with `getConnections()`
* 🧹 Easy teardown and cleanup
* 🔄 Per-test isolation using transactions and savepoints
* 🛡️ Role-based context for RLS testing
* 🌱 Flexible seed support via `.sql` files and programmatic functions
* 🧪 Auto-generated test databases with `UUID` suffix
* 📦 Built for tools like `sqitch`, supporting full schema initialization workflows
* 🧰 Designed for `Jest`, `Mocha`, or any async test runner


## Table of Contents

1. [Install](#install)
2. [Features](#features)
3. [Quick Start](#-quick-start)
4. [getConnections() Overview](#getconnections-overview)
5. [PgTestClient API Overview](#pgtestclient-api-overview)
6. [Usage Examples](#usage-examples)
   * [Basic Setup](#-basic-setup)
   * [Role-Based Context](#-role-based-context)
   * [SQL File Seeding](#-sql-file-seeding)
   * [Programmatic Seeding](#-programmatic-seeding)
   * [Composed Seeding](#-composed-seeding)
   * [CSV Seeding](#️-csv-seeding)
   * [JSON Seeding](#️-json-seeding)
7. [Environment Overrides](#environment-overrides)
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

### 🧬 Composed Seeding

Combine multiple seeders with `seed.compose()`:

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const sql = (f: string) => path.join(__dirname, 'sql', f);

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, seed.compose([
    seed.sqlfile([
      sql('schema.sql'),
      sql('roles.sql')
    ]),
    seed.fn(async ({ pg }) => {
      await pg.query(`INSERT INTO users (name) VALUES ('Composed');`);
    })
  ])));
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
  ({ db, teardown } = await getConnections({}, seed.compose([
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
  ])));
});

afterAll(() => teardown());

it('has loaded rows', async () => {
  const res = await db.query('SELECT COUNT(*) FROM users');
  expect(+res.rows[0].count).toBeGreaterThan(0);
});
```

## 🗃️ JSON Seeding

You can seed tables using in-memory JSON objects. This is useful when you want fast, inline fixtures without managing external files.

````ts
import { getConnections, seed } from 'pgsql-test';

let db;
let teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, seed.compose([
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
  ])));
});

afterAll(() => teardown());

it('has loaded rows', async () => {
  const res = await db.query('SELECT COUNT(*) FROM custom.users');
  expect(+res.rows[0].count).toBeGreaterThan(0);
});
```


## 🏗️ Sqitch Seeding

You can seed your test database using a local Sqitch project (e.g., containing `sqitch.conf`) by passing a custom working directory:

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const cwd = path.resolve(__dirname, '../path/to/sqitch');

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, seed.compose([
    seed.sqitch(cwd) // deploys the module at provided cwd
  ])));
});

it('runs a schema query', async () => {
  const res = await db.query('SELECT COUNT(*) FROM myapp.users');
  expect(+res.rows[0].count).toBeGreaterThanOrEqual(0);
});
```

This works for any Sqitch-compatible module using LaunchQL’s deployment tooling.

## 🚀 LaunchQL Seeding

For LaunchQL modules with precompiled `sqitch.plan`, use `seed.launchql(cwd)` to apply a schema quickly with `deployFast()`:

```ts
import path from 'path';
import { getConnections, seed } from 'pgsql-test';

const cwd = path.resolve(__dirname, '../path/to/launchql');

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, seed.compose([
    seed.launchql(cwd) // uses deployFast() under the hood
  ])));
});

it('creates user records', async () => {
  await db.query(`INSERT INTO myapp.users (username, email) VALUES ('testuser', 'test@example.com')`);
  const res = await db.query(`SELECT COUNT(*) FROM myapp.users`);
  expect(+res.rows[0].count).toBeGreaterThan(0);
});
```

This is the fastest way to bring up a ready-to-query schema from a compiled LaunchQL module.


## Environment Overrides

`pgsql-test` respects the following env vars for DB connectivity:

* `PGHOST`
* `PGPORT`
* `PGUSER`
* `PGPASSWORD`

Override them in your test runner or CI config:

```yaml
env:
  PGHOST: localhost
  PGPORT: 5432
  PGUSER: postgres
  PGPASSWORD: password
```

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
