# graphile-test

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
  <a href="https://www.npmjs.com/package/graphile-test">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fgraphile-test%2Fpackage.json"/>
  </a>
</p>

`graphile-test` builds on top of [`pgsql-test`](https://github.com/launchql/launchql/tree/main/packages/pgsql-test) to provide robust GraphQL testing utilities for PostGraphile-based projects.

It provides a seamless setup for isolated, seeded, role-aware Postgres databases and injects GraphQL helpers for snapshot testing, role context, and mutation/query assertions.

**Note:** This is a bare-bones package with no defaults or settings applied. For a batteries-included version with all LaunchQL plugins pre-configured, use [`launchql-test`](https://github.com/launchql/launchql/tree/main/packages/launchql-test) instead.

## 🚀 Features

* 🔁 **Per-test rollback** via savepoints for isolation
* 🔐 **RLS-aware context injection** (`setContext`)
* 🧪 **GraphQL integration testing** with `query()` and snapshot support
* 📦 **Seed support** for `.sql`, JSON, CSV, LaunchQL, or Sqitch
* 📊 **Introspection query snapshotting**
* 🔧 **Raw SQL fallback** via `pg.client.query`

## 📦 Install

```bash
npm install graphile-test
```

## ✨ Quick Start

```ts
import { getConnections, seed } from 'graphile-test';

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

## Education and Tutorials

 1. 🚀 [Quickstart: Getting Up and Running](https://launchql.com/learn/quickstart)
Get started with modular databases in minutes. Install prerequisites and deploy your first module.

 2. 📦 [Modular PostgreSQL Development with Database Packages](https://launchql.com/learn/modular-postgres)
Learn to organize PostgreSQL projects with pgpm workspaces and reusable database modules.

 3. ✏️ [Authoring Database Changes](https://launchql.com/learn/authoring-database-changes)
Master the workflow for adding, organizing, and managing database changes with pgpm.

 4. 🧪 [End-to-End PostgreSQL Testing with TypeScript](https://launchql.com/learn/e2e-postgres-testing)
Master end-to-end PostgreSQL testing with ephemeral databases, RLS testing, and CI/CD automation.

 5. ⚡ [Supabase Testing](https://launchql.com/learn/supabase)
Use TypeScript-first tools to test Supabase projects with realistic RLS, policies, and auth contexts.

 6. ⚡ [Drizzle ORM Testing](https://launchql.com/learn/drizzle-testing)
Run full-stack tests with Drizzle ORM, including database setup, teardown, and RLS enforcement.

 7. 🔧 [Troubleshooting](https://launchql.com/learn/troubleshooting)
Common issues and solutions for pgpm, PostgreSQL, and testing.

## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/supabase-test](https://github.com/launchql/launchql/tree/main/packages/supabase-test): **🧪 Supabase-native test harness** preconfigured for the local Supabase stack—per-test rollbacks, JWT/role context helpers, and CI/GitHub Actions ready.
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

* [pgpm](https://github.com/launchql/launchql/tree/main/packages/pgpm): **🖥️ PostgreSQL Package Manager** for modular Postgres development. Works with database workspaces, scaffolding, migrations, seeding, and installing database packages.
* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Credits

🛠 Built by LaunchQL — if you like our tools, please checkout and contribute to [our github ⚛️](https://github.com/launchql)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

