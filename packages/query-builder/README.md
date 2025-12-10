# QueryBuilder

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
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
