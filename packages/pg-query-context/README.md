# pg-query-context

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/pg-query-context"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fpg-query-context%2Fpackage.json"/></a>
</p>

# pg-query-context

A small utility for executing PostgreSQL queries within a session context using [`pg`](https://www.npmjs.com/package/pg). It allows you to temporarily set PostgreSQL session variables (`set_config`) for RLS (Row-Level Security) and other scoped operations.

## Installation

```bash
npm install pg-query-context
```

## Features

* Sets session-level context (e.g., role, user ID) using `set_config`.
* Automatically wraps execution in a transaction (`BEGIN`/`COMMIT`).
* Automatically rolls back on error.
* Supports both `Pool` and `Client` from `pg`.

## Usage

```ts
import pgQueryContext from 'pg-query-context';
import { Pool } from 'pg';

const pool = new Pool();

const result = await pgQueryContext({
  client: pool,
  context: {
    'role': 'authenticated',
    'myapp.user_id': '123e4567-e89b-12d3-a456-426614174000'
  },
  query: 'SELECT * FROM app_private.do_something_secure($1)',
  variables: ['input-value']
});

console.log(result.rows);
```

## API

### `pgQueryContext(options: ExecOptions): Promise<QueryResult>`

#### Options

| Name        | Type                     | Required | Description                                            |
| ----------- | ------------------------ | -------- | ------------------------------------------------------ |
| `client`    | `Pool` or `ClientBase`   | ✅        | The PostgreSQL client or pool to use                   |
| `context`   | `Record<string, string>` | ❌        | Key-value session variables to be set via `set_config` |
| `query`     | `string`                 | ✅        | SQL query to run                                       |
| `variables` | `any[]`                  | ❌        | Parameterized query variables                          |

## Example with `express`

```ts
app.post('/secure-endpoint', async (req, res) => {
  const authToken = req.headers.authorization;

  const result = await pgQueryContext({
    client: pool,
    context: {
      'role': 'authenticated',
      'myapp.token': authToken,
    },
    query: 'SELECT * FROM app_private.verify_token($1)',
    variables: [authToken],
  });

  if (!result.rows.length) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({ user: result.rows[0] });
});
```
