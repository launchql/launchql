# QueryBuilder

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

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
