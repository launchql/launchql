# graphql-server-test

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
  <a href="https://www.npmjs.com/package/graphql-server-test">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphql%2Fserver-test%2Fpackage.json"/>
  </a>
</p>

`graphql-server-test` provides a testing framework that spins up a real HTTP server using `@constructive-io/graphql-server` and tests it using SuperTest. Unlike `@constructive-io/graphql-test` which uses direct PostGraphile execution, this package makes actual HTTP requests to test the full middleware stack.

## Install

```sh
npm install graphql-server-test
```

## Features

- Real HTTP server testing with SuperTest
- Uses `@constructive-io/graphql-server` directly for the full middleware stack
- Per-test database isolation with transaction rollback
- Built on top of `pgsql-test` for database management
- Compatible with Jest and other test runners

## Usage

### Basic Usage

```typescript
import { getConnections, seed } from 'graphql-server-test';

let db, pg, server, query, request, teardown;

beforeAll(async () => {
  ({ db, pg, server, query, request, teardown } = await getConnections({
    schemas: ['app_public'],
    authRole: 'anonymous'
  }, [
    seed.sqlfile(['./sql/test.sql'])
  ]));
});

beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());
afterAll(() => teardown());

it('queries users via HTTP', async () => {
  const res = await query(`
    query {
      allUsers {
        nodes { id username }
      }
    }
  `);

  expect(res.data.allUsers.nodes).toHaveLength(2);
});
```

### Using SuperTest Directly

For more control over HTTP requests, use the `request` agent directly:

```typescript
it('tests authentication headers', async () => {
  const res = await request
    .post('/graphql')
    .set('Authorization', 'Bearer test-token')
    .set('Content-Type', 'application/json')
    .send({ query: '{ currentUser { id } }' });

  expect(res.status).toBe(200);
  expect(res.body.data.currentUser).toBeDefined();
});

it('tests error responses', async () => {
  const res = await request
    .post('/graphql')
    .send({ query: '{ invalidField }' });

  expect(res.body.errors).toBeDefined();
});
```

### Server Information

The `server` object provides information about the running HTTP server:

```typescript
const { server } = await getConnections({ schemas: ['app_public'] });

console.log(server.url);        // http://localhost:5555
console.log(server.graphqlUrl); // http://localhost:5555/graphql
console.log(server.port);       // 5555
console.log(server.host);       // localhost

// Stop the server manually (usually handled by teardown)
await server.stop();
```

### Database Operations

Direct database access is available through `pg` (superuser) and `db` (app-level) clients:

```typescript
const { pg, db } = await getConnections({ schemas: ['app_public'] });

// Superuser operations (bypasses RLS)
await pg.query('INSERT INTO app_public.users (username) VALUES ($1)', ['admin']);

// App-level operations (respects RLS)
await db.query('SELECT * FROM app_public.users');
```

### Seeding

Use the `seed` utilities from `pgsql-test`:

```typescript
import { getConnections, seed } from 'graphql-server-test';

const { db, query, teardown } = await getConnections(
  { schemas: ['app_public'] },
  [
    seed.sqlfile(['./sql/schema.sql', './sql/data.sql']),
    seed.fn(async (client) => {
      await client.query('INSERT INTO users (name) VALUES ($1)', ['Test User']);
    })
  ]
);
```

### Snapshots

Use the `snapshot` utility for snapshot testing:

```typescript
import { getConnections, snapshot } from 'graphql-server-test';

it('matches snapshot', async () => {
  const res = await query('{ allUsers { nodes { username } } }');
  expect(snapshot(res.data)).toMatchSnapshot();
});
```

## Configuration Options

### GetConnectionsInput

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schemas` | `string[]` | required | PostgreSQL schemas to expose in GraphQL |
| `authRole` | `string` | - | Default role for anonymous requests |
| `useRoot` | `boolean` | `false` | Use root/superuser for queries (bypasses RLS) |
| `graphile` | `GraphileOptions` | - | Graphile/PostGraphile configuration |
| `server` | `ServerOptions` | - | Server configuration (port, host, and API options) |

### ServerOptions

All server configuration lives under the `server` key:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `server.port` | `number` | random | Port to run the server on |
| `server.host` | `string` | `localhost` | Host to bind the server to |
| `server.api` | `Partial<ApiOptions>` | - | API configuration options (see below) |

### API Options

The `server.api` option provides full control over the GraphQL server configuration. It accepts a partial `ApiOptions` object from `@constructive-io/graphql-types`:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `exposedSchemas` | `string[]` | from `schemas` | Database schemas to expose (overridden by `schemas`) |
| `anonRole` | `string` | from `authRole` | Anonymous role name (overridden by `authRole`) |
| `roleName` | `string` | from `authRole` | Default role name (overridden by `authRole`) |
| `isPublic` | `boolean` | package default | Whether the API is publicly accessible |
| `metaSchemas` | `string[]` | package default | Schemas containing metadata tables |

The convenience properties (`schemas`, `authRole`) take precedence over corresponding values in `server.api`.

### Choosing the server (`server.useRouting`)

The harness runs suites against one of two servers:

- `server.useRouting: true` (default) — the production `@constructive-io/graphql-server`. Every request resolves through the scoped-routing plane, so the suite must seed real routing/database records and use a real database id.
- `server.useRouting: false` — the single-tenant `@constructive-io/graphql-dev-server` (pure PostGraphile, no routing, no database id). It exposes the configured schemas directly and is for local/static suites only.

```typescript
// Basic usage with convenience properties
const { query } = await getConnections({
  schemas: ['app_public'],
  authRole: 'anonymous'
});

// Static single-tenant mode for testing (runs the dev server, no routing)
const { query } = await getConnections({
  schemas: ['app_public'],
  server: {
    useRouting: false
  }
});

// Full server configuration (production scoped-routing server)
const { query } = await getConnections({
  schemas: ['app_public'],
  authRole: 'authenticated',
  server: {
    port: 5555,
    host: 'localhost',
    useRouting: true,
    api: {
      isPublic: false,
      metaSchemas: ['constructive_routing_public', 'metaschema_public']
    }
  }
});
```

## Comparison with Other Test Packages

| Package | Server | Query Method |
|---------|--------|--------------|
| `graphile-test` | None | Direct PostGraphile execution |
| `@constructive-io/graphql-test` | None | Direct PostGraphile execution |
| `@constructive-io/playwright-test` | Real HTTP | Direct PostGraphile execution |
| **`graphql-server-test`** | Real HTTP | **SuperTest HTTP requests** |
