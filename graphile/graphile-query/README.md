# graphile-query

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
  <a href="https://www.npmjs.com/package/graphile-query">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-query%2Fpackage.json"/>
  </a>
</p>

**`graphile-query`** provides utilities to execute GraphQL queries against a PostGraphile-generated schema using PostgreSQL connection pooling and contextual role-based settings.

It includes two main classes:

* `GraphileQuery`: A flexible query runner that supports `pgSettings`, role-based access control, and custom request context.
* `GraphileQuerySimple`: A minimal wrapper for GraphQL execution without advanced role or settings logic.

## 🚀 Installation

```bash
npm install graphile-query
```

## ✨ Features

* Built-in support for PostGraphile context and role-based `pgSettings`
* Works with pre-built PostGraphile schemas
* Supports raw string queries or parsed `DocumentNode`s
* Integrates with PostgreSQL via `pg.Pool`

## 📦 Usage

Use as a particular role, skipping any auth logic:

```ts
const results = await client.query({
  role: 'postgres',
  query,
  variables
});
```

Or pass a request object to be evaluated based on logic:

```ts
const results = await client.query({
  req: { something: { special: 'e90829ef-1da4-448d-3e44-b3d275702b86' } },
  query: MyGraphQLQuery,
  variables
});
```


### 1. Create a GraphQL Schema

```ts
import { Pool } from 'pg';
import { getSchema } from 'graphile-query';

const pool = new Pool();
const schema = await getSchema(pool, {
  schema: ['app_public'],
  pgSettings: req => ({ 'myapp.user_id': req.user?.id }),
});
```

### 2. Execute Queries with `GraphileQuery`

```ts
import { GraphileQuery } from 'graphile-query';

const client = new GraphileQuery({ schema, pool, settings });

const result = await client.query({
  query: `
    query GetUsers {
      allUsers {
        nodes {
          id
          username
        }
      }
    }
  `,
  role: 'authenticated', // optional
  req: { user: { id: 123 } }, // optional
});
```

### 3. Use `GraphileQuerySimple` for Lightweight Execution

```ts
import { GraphileQuerySimple } from 'graphile-query';

const client = new GraphileQuerySimple({ schema, pool });

const result = await client.query(`
  query {
    currentUser {
      id
      email
    }
  }
`);
```

## 📘 API

### `getSchema(pool, settings)`

* Builds a PostGraphile schema using the given database pool and settings.

### `GraphileQuery`

* `constructor({ schema, pool, settings })`
* `query({ query, variables?, role?, req? })`

Supports full context, roles, and settings for advanced scenarios.

### `GraphileQuerySimple`

* `constructor({ schema, pool })`
* `query(query, variables?)`

Lightweight version with no role or settings support.
