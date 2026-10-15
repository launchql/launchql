# @constructive-io/playwright-test

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@constructive-io/playwright-test"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphql%2Fplaywright-test%2Fpackage.json"/></a>
</p>

Constructive Playwright Testing with HTTP server support for end-to-end testing.

This package extends `@constructive-io/graphql-test` to provide an actual HTTP server for Playwright and other E2E testing frameworks. It creates isolated test databases and starts a GraphQL server for your suite to hit over HTTP.

It can run either server, selected per-suite with `server.useRouting`:

- `server.useRouting: false` (default) — the single-tenant `@constructive-io/graphql-dev-server` (pure PostGraphile). No host route resolution and no database id; the configured schemas are exposed directly. Best for UI/local suites.
- `server.useRouting: true` — the production `@constructive-io/graphql-server`. Every request is resolved through the scoped-routing plane (`constructive_routing_public.resolve_route()`), so the suite must seed real routing/database records and reach the api surface via its seeded host (`Host` header).

## Installation

```bash
npm install @constructive-io/playwright-test
```

## Usage

### Basic Usage

```typescript
import { getConnectionsWithServer, seed } from '@constructive-io/playwright-test';

describe('E2E Tests', () => {
  let teardown: () => Promise<void>;
  let serverUrl: string;

  beforeAll(async () => {
    const connections = await getConnectionsWithServer({
      schemas: ['public', 'app_public'],
      authRole: 'anonymous'
    }, [seed.pgpm({ extensions: ['my-extension'] })]);

    teardown = connections.teardown;
    serverUrl = connections.server.graphqlUrl;
  });

  afterAll(async () => {
    await teardown();
  });

  it('should work with Playwright', async () => {
    // Use serverUrl in your Playwright tests
    // e.g., await page.goto(serverUrl);
  });
});
```

### Against the real (scoped-routing) server

Set `server.useRouting: true` to run the production `@constructive-io/graphql-server`. Seed real routing/database records and address the api surface by its seeded host:

```typescript
import { test, expect } from '@playwright/test';
import { getConnectionsWithServer, seed } from '@constructive-io/playwright-test';

test('resolves through the scoped routing plane', async ({ request }) => {
  const { server, teardown } = await getConnectionsWithServer(
    {
      schemas: ['simple-pets-public'],
      authRole: 'anonymous',
      server: {
        useRouting: true,
        api: {
          isPublic: true,
          metaSchemas: ['constructive_routing_public', 'metaschema_public']
        }
      }
    },
    [seed.pgpm(pgpmWorkspace), seed.sqlfile([/* app schema + routing records */])]
  );

  try {
    const res = await request.post(server.graphqlUrl, {
      headers: { 'Content-Type': 'application/json', Host: 'app.test.constructive.io' },
      data: { query: '{ animals { nodes { name } } }' }
    });
    expect(res.ok()).toBeTruthy();
  } finally {
    await teardown();
  }
});
```

### With Playwright

```typescript
import { test, expect } from '@playwright/test';
import { getConnectionsWithServer } from '@constructive-io/playwright-test';

let connections: Awaited<ReturnType<typeof getConnectionsWithServer>>;

test.beforeAll(async () => {
  connections = await getConnectionsWithServer({
    schemas: ['app_public'],
    authRole: 'anonymous',
    server: {
      port: 5555,
      host: 'localhost'
    }
  });
});

test.afterAll(async () => {
  await connections.teardown();
});

test('GraphQL API is accessible', async ({ page }) => {
  const response = await page.request.post(connections.server.graphqlUrl, {
    data: {
      query: '{ __typename }'
    }
  });
  expect(response.ok()).toBeTruthy();
});
```

### Direct Query Access

You can also execute GraphQL queries directly without going through HTTP:

```typescript
const { query, server, teardown } = await getConnectionsWithServer({
  schemas: ['public'],
  authRole: 'anonymous'
});

// Direct query (bypasses HTTP)
const result = await query(`
  query {
    allUsers {
      nodes {
        id
        name
      }
    }
  }
`);

// HTTP endpoint for Playwright
console.log(server.graphqlUrl); // http://localhost:5555/graphql
```

## API

### getConnectionsWithServer(input, seedAdapters?)

Creates database connections and starts an HTTP server for testing.

**Parameters:**
- `input.schemas` - Array of PostgreSQL schemas to expose
- `input.authRole` - Default authentication role (e.g., 'anonymous', 'authenticated')
- `input.server.port` - Port to run the server on (defaults to random available port)
- `input.server.host` - Host to bind to (defaults to 'localhost')
- `input.server.useRouting` - `false` (default) runs the dev server; `true` runs the production scoped-routing server
- `input.server.api` - API options forwarded to the production scoped server (e.g. `metaSchemas`, `isPublic`); only used when `useRouting` is `true`
- `input.graphile` - Optional Graphile configuration overrides
- `seedAdapters` - Optional array of seed adapters for database setup

**Returns:**
- `pg` - PostgreSQL client for direct database access
- `db` - Database client for test operations
- `server` - Server info including `url`, `graphqlUrl`, `port`, `host`, and `stop()`
- `query` - GraphQL query function (positional API)
- `teardown` - Cleanup function to stop server and drop test database

### getConnectionsWithServerObject(input, seedAdapters?)

Same as `getConnectionsWithServer` but uses object-based query API.

### getConnectionsWithServerUnwrapped(input, seedAdapters?)

Same as `getConnectionsWithServer` but throws on GraphQL errors instead of returning them.

### createTestServer(opts, serverOpts?)

Low-level function to create just the single-tenant dev HTTP server without database setup.

### createScopedTestServer(opts, serverOpts?)

Low-level function to create just the production `@constructive-io/graphql-server` (scoped routing) HTTP server without database setup.

## How It Works

1. Creates an isolated test database using `pgsql-test`
2. Starts either the dev server or the production scoped-routing server (see `server.useRouting`)
3. Exposes the GraphQL endpoint for your suite to hit over HTTP
4. Returns the server URL for Playwright to connect to
5. Provides a teardown function that stops the server and cleans up the database

## Configuration

By default (`useRouting: false`) the server runs `@constructive-io/graphql-dev-server`, which means:
- No host route resolution (`resolve_route()`) is required and no database id is needed
- Schemas are exposed directly based on the `schemas` parameter
- Perfect for isolated testing without complex domain setup

With `useRouting: true` the server runs the production `@constructive-io/graphql-server`:
- Every request is resolved through `constructive_routing_public.resolve_route()`
- The suite must seed real routing/database records and address the api surface by its seeded host
