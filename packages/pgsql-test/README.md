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

## Install

```sh
npm install pgsql-test
```
---

## Features

* 🧪 Auto-generated test databases with `UUID` suffix
* 🔄 Per-test isolation using transactions and savepoints
* 🛡️ Role-based context for RLS testing
* 🧹 Easy teardown and cleanup
* 🧰 Designed for `Jest`, `Mocha`, or any async test runner

---

## How to Use

`pgsql-test` provides an isolated PostgreSQL testing environment with per-test transaction rollback, ideal for integration tests involving SQL, roles, or GraphQL (e.g., with PostGraphile).

### Basic Example

```ts
import { getConnections } from 'pgsql-test';
import { PgTestClient } from 'pgsql-test/client';

let conn: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ conn, db, teardown } = await getConnections());

  await db.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL
    );
  `);

  await db.query(`
    INSERT INTO users (name) VALUES ('Alice'), ('Bob');
    INSERT INTO posts (user_id, content) VALUES
      (1, 'Hello world!'),
      (2, 'Graphile is cool!');
  `);
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach(); // Starts transaction + SAVEPOINT
});

afterEach(async () => {
  await db.afterEach(); // Rolls back to SAVEPOINT
});

test('user count starts at 2', async () => {
  const res = await db.query('SELECT COUNT(*) FROM users');
  expect(res.rows[0].count).toBe('2');
});
```

---

## Role-Based Contexts

You can simulate different PostgreSQL roles for RLS and permission testing.

```ts
describe('authenticated role', () => {
  beforeEach(async () => {
    conn.setContext({ role: 'authenticated' });
    await conn.beforeEach();
  });

  afterEach(async () => {
    await conn.afterEach();
  });

  it('runs as authenticated', async () => {
    const result = await conn.query(`SELECT current_setting('role', true) AS role`);
    expect(result.rows[0].role).toBe('authenticated');
  });
});
```

---

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
