# supabase-test

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/launchql/launchql/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
</p>

`supabase-test` is a Supabase-optimized version of `pgsql-test` with Supabase defaults baked in. It provides instant, isolated PostgreSQL databases for testing with automatic transaction rollbacks, context switching, and clean seeding — configured for Supabase's local development environment.

## Install

```sh
npm install supabase-test
```

## Features

* ⚡ **Instant test DBs** — each one seeded, isolated, and UUID-named
* 🔄 **Per-test rollback** — every test runs in its own transaction or savepoint
* 🛡️ **RLS-friendly** — test with role-based auth via `.setContext()`
* 🌱 **Flexible seeding** — run `.sql` files, programmatic seeds, or even load fixtures
* 🧪 **Compatible with any async runner** — works with `Jest`, `Mocha`, etc.
* 🧹 **Auto teardown** — no residue, no reboots, just clean exits
* 🎯 **Supabase defaults** — pre-configured for Supabase local development (port 54322, `supabase_admin` user)

## Supabase Defaults

This package automatically uses Supabase's local development defaults:

* **Port:** `54322` (Supabase's default PostgreSQL port)
* **User:** `supabase_admin`
* **Password:** `postgres`

These defaults are applied automatically, but can be overridden by passing options to `getConnections()`.

## Quick Start

```ts
import { getConnections } from 'supabase-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  await db.query(`SELECT 1`); // ✅ Ready to run queries
});

afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());
```

## Usage

### Basic Setup

```ts
import { getConnections } from 'supabase-test';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  
  // Setup schema
  await db.query(`
    CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);
    INSERT INTO users (name) VALUES ('Alice'), ('Bob');
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

### Overriding Supabase Defaults

You can override the Supabase defaults by passing options:

```ts
import { getConnections } from 'supabase-test';

const { db, teardown } = await getConnections({
  pg: {
    port: 5432,  // Override port
    host: 'custom-host'
  },
  db: {
    connection: {
      user: 'custom_user',
      password: 'custom_password'
    }
  }
});
```

### LaunchQL Seeding

By default, `getConnections()` uses LaunchQL seeding from the current directory:

```ts
import { getConnections } from 'supabase-test';

const { db, teardown } = await getConnections();
// Automatically deploys LaunchQL module from current directory
```

### Custom Seeding

You can use any of the seeding strategies from `pgsql-test`:

```ts
import { getConnections, seed } from 'supabase-test';
import path from 'path';

const sql = (f: string) => path.join(__dirname, 'sql', f);

const { db, teardown } = await getConnections({}, [
  seed.sqlfile([
    sql('schema.sql'),
    sql('fixtures.sql')
  ])
]);
```

## API

This package re-exports everything from `pgsql-test`, so all the same APIs are available:

* `getConnections()` - Main entry point (with Supabase defaults)
* `PgTestClient` - Database client with test utilities
* `seed` - Seeding adapters (sqlfile, csv, json, launchql, sqitch, etc.)
* `DbAdmin` - Database administration utilities

See the [pgsql-test documentation](https://github.com/launchql/launchql/tree/main/packages/pgsql-test) for complete API details.

## Differences from pgsql-test

The only difference is that `getConnections()` has Supabase defaults pre-configured:

* Port defaults to `54322` instead of `5432`
* User defaults to `supabase_admin` instead of `postgres`
* Password defaults to `postgres` instead of `password`

All other functionality is identical to `pgsql-test`.


## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): **🔐 Authentication mocking** for Graphile-focused test helpers and emulating row-level security contexts.
* [launchql/pg-query-context](https://github.com/launchql/launchql/tree/main/packages/pg-query-context): **🔒 Session context injection** to add session-local context (e.g., `SET LOCAL`) into queries—ideal for setting `role`, `jwt.claims`, and other session settings.

### 🧠 Parsing & AST

* [launchql/pgsql-parser](https://github.com/launchql/pgsql-parser): **🔄 SQL conversion engine** that interprets and converts PostgreSQL syntax.
* [launchql/libpg-query-node](https://github.com/launchql/libpg-query-node): **🌉 Node.js bindings** for `libpg_query`, converting SQL into parse trees.
* [launchql/pg-proto-parser](https://github.com/launchql/pg-proto-parser): **📦 Protobuf parser** for parsing PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.
* [@pgsql/enums](https://github.com/launchql/pgsql-parser/tree/main/packages/enums): **🏷️ TypeScript enums** for PostgreSQL AST for safe and ergonomic parsing logic.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): **📝 Type definitions** for PostgreSQL AST nodes in TypeScript.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): **🛠️ AST utilities** for constructing and transforming PostgreSQL syntax trees.
* [launchql/pg-ast](https://github.com/launchql/launchql/tree/main/packages/pg-ast): **🔍 Low-level AST tools** and transformations for Postgres query structures.

### 🚀 API & Dev Tools

* [launchql/server](https://github.com/launchql/launchql/tree/main/packages/server): **⚡ Express-based API server** powered by PostGraphile to expose a secure, scalable GraphQL API over your Postgres database.
* [launchql/explorer](https://github.com/launchql/launchql/tree/main/packages/explorer): **🔎 Visual API explorer** with GraphiQL for browsing across all databases and schemas—useful for debugging, documentation, and API prototyping.

### 🔁 Streaming & Uploads

* [launchql/s3-streamer](https://github.com/launchql/launchql/tree/main/packages/s3-streamer): **📤 Direct S3 streaming** for large files with support for metadata injection and content validation.
* [launchql/etag-hash](https://github.com/launchql/launchql/tree/main/packages/etag-hash): **🏷️ S3-compatible ETags** created by streaming and hashing file uploads in chunks.
* [launchql/etag-stream](https://github.com/launchql/launchql/tree/main/packages/etag-stream): **🔄 ETag computation** via Node stream transformer during upload or transfer.
* [launchql/uuid-hash](https://github.com/launchql/launchql/tree/main/packages/uuid-hash): **🆔 Deterministic UUIDs** generated from hashed content, great for deduplication and asset referencing.
* [launchql/uuid-stream](https://github.com/launchql/launchql/tree/main/packages/uuid-stream): **🌊 Streaming UUID generation** based on piped file content—ideal for upload pipelines.
* [launchql/upload-names](https://github.com/launchql/launchql/tree/main/packages/upload-names): **📂 Collision-resistant filenames** utility for structured and unique file names for uploads.

### 🧰 CLI & Codegen

* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.