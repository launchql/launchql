# QueryBuilder

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/query-builder"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fquery-builder%2Fpackage.json"/></a>
</p>

A robust TypeScript-based SQL query builder that supports dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure/function calls. Designed with flexibility and ease of use in mind, it handles advanced SQL features like `JOIN`, `GROUP BY`, `ORDER BY`, and schema-qualified queries.

## Features

- Build SQL queries dynamically for:
  - **SELECT**
  - **INSERT**
  - **UPDATE**
  - **DELETE**
  - **Stored procedure calls**
- Support for:
  - **Dynamic WHERE clauses**
  - **JOINs** with schema handling
  - **GROUP BY**, **ORDER BY**, and **LIMIT**
  - **Schema-qualified entities**
  - **Positional and named parameters** for procedure calls
- SQL-safe identifier and value escaping.
- Type-safe value formatting based on `string`, `number`, `boolean`, or `null`.

## Installation

Install via npm:

```sh
npm install @launchql/query-builder
```

## Getting Started

### Import the Library

```ts
import { QueryBuilder } from '@launchql/query-builder';
```

## Usage

### SELECT Query

```ts
const query = new QueryBuilder()
  .table('users')
  .select(['id', 'name', 'email'])
  .where('age', '>', 18)
  .limit(10)
  .build();

console.log(query);
// Output: SELECT id, name, email FROM users WHERE age > 18 LIMIT 10;
```

---

### INSERT Query

```ts
const query = new QueryBuilder()
  .table('users')
  .insert({ name: 'John', email: 'john@example.com', age: 30 })
  .build();

console.log(query);
// Output: INSERT INTO users (name, email, age) VALUES ('John', 'john@example.com', 30);
```

---

### UPDATE Query

```ts
const query = new QueryBuilder()
  .table('users')
  .update({ name: 'John Doe' })
  .where('id', '=', '1')
  .build();

console.log(query);
// Output: UPDATE users SET name = 'John Doe' WHERE id = '1';
```

---

### DELETE Query

```ts
const query = new QueryBuilder()
  .table('users')
  .delete()
  .where('id', '=', '1')
  .build();

console.log(query);
// Output: DELETE FROM users WHERE id = '1';
```

---

### Procedure Call (Positional Parameters)

```ts
const query = new QueryBuilder()
  .call('my_procedure', [1, 'test', true])
  .build();

console.log(query);
// Output: SELECT my_procedure(1, 'test', true);
```

---

### Procedure Call (Named Parameters)

```ts
const query = new QueryBuilder()
  .call('my_procedure', { id: 42, status: 'active', is_admin: true })
  .build();

console.log(query);
// Output: SELECT my_procedure(id := 42, status := 'active', is_admin := true);
```

### Procedure Call with Schema

```ts
const query = new QueryBuilder()
  .schema('public')
  .call('my_procedure', { id: 42, is_active: true })
  .build();

console.log(query);
// Output: SELECT public.my_procedure(id := 42, is_active := true);
```

### JOIN Query

```ts
const query = new QueryBuilder()
  .table('orders')
  .select(['orders.id', 'customers.name'])
  .join('INNER', 'customers', 'orders.customer_id = customers.id')
  .build();

console.log(query);
// Output: SELECT orders.id, customers.name FROM orders INNER JOIN customers ON orders.customer_id = customers.id;
```

### GROUP BY Query

```ts
const query = new QueryBuilder()
  .table('orders')
  .select(['customer_id', 'SUM(total) AS total_sum'])
  .groupBy(['customer_id'])
  .build();

console.log(query);
// Output: SELECT customer_id, SUM(total) AS total_sum FROM orders GROUP BY customer_id;
```

### ORDER BY Query

```ts
const query = new QueryBuilder()
  .table('products')
  .select(['id', 'name', 'price'])
  .orderBy('price', 'DESC')
  .orderBy('name', 'ASC')
  .build();

console.log(query);
// Output: SELECT id, name, price FROM products ORDER BY price DESC, name ASC;
```

## Error Handling

### No Table or Procedure Specified

If no table or procedure is specified, `build()` will throw an error:

```ts
const query = new QueryBuilder();
query.select(['id']).build(); // Throws Error

// Error: Table name or procedure name is not specified.
```

## Running Tests

Tests are written in Jest. Run the test suite with:

```sh
npm test:watch
```

## Related

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): Provides isolated PostgreSQL testing environments with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): Graphile-focused test helpers for mocking authentication and emulating row-level security contexts.

### 🧠 Parsing & AST

* [launchql/pgsql-parser](https://github.com/launchql/pgsql-parser): A Node.js PostgreSQL parser/deparser that interprets and converts PostgreSQL syntax.
* [launchql/libpg-query-node](https://github.com/launchql/libpg-query-node): Node.js bindings for `libpg_query`, converting SQL into parse trees.
* [@pgsql/enums](https://github.com/launchql/pgsql-parser/tree/main/packages/enums): PostgreSQL AST enums in TypeScript for safe and ergonomic parsing logic.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): TypeScript definitions for PostgreSQL AST nodes.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): AST utility functions for constructing and transforming PostgreSQL syntax trees.
* [launchql/pg-ast](https://github.com/launchql/launchql/tree/main/packages/pg-ast): Low-level AST tools and transformations for Postgres query structures.
* [launchql/pg-query-context](https://github.com/launchql/launchql/tree/main/packages/pg-query-context): Lightweight wrapper to inject session-local context (e.g., `SET LOCAL`) into queries—ideal for setting `role`, `jwt.claims`, and other session settings.

### 🚀 API & Dev Tools

* [launchql/server](https://github.com/launchql/launchql/tree/main/packages/server): Express-based server powered by PostGraphile to expose a secure, scalable GraphQL API over your Postgres database.
* [launchql/explorer](https://github.com/launchql/launchql/tree/main/packages/explorer): Visual GraphiQL explorer for browsing across all databases and schemas—useful for debugging, documentation, and API prototyping.

### 🔁 Streaming & Uploads

* [launchql/s3-streamer](https://github.com/launchql/launchql/tree/main/packages/s3-streamer): Stream large files directly to S3 with support for metadata injection and content validation.
* [launchql/etag-hash](https://github.com/launchql/launchql/tree/main/packages/etag-hash): Create S3-compatible ETags by streaming and hashing file uploads in chunks.
* [launchql/etag-stream](https://github.com/launchql/launchql/tree/main/packages/etag-stream): Node stream transformer that computes ETags during upload or transfer.
* [launchql/uuid-hash](https://github.com/launchql/launchql/tree/main/packages/uuid-hash): Generate UUIDs deterministically from hashed content, great for deduplication and asset referencing.
* [launchql/uuid-stream](https://github.com/launchql/launchql/tree/main/packages/uuid-stream): Streaming UUID generation based on piped file content—ideal for upload pipelines.
* [launchql/upload-names](https://github.com/launchql/launchql/tree/main/packages/upload-names): Utility for generating structured and collision-resistant file names for uploads.

### 🧰 CLI & Codegen

* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): Command-line tool for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): Generate GraphQL mutations and queries dynamically from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): A robust TypeScript-based SQL query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): Fluent GraphQL query and mutation builder for PostGraphile schemas. ⚡ Schema-aware via introspection, ✅ prevents common syntax issues, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

