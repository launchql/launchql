# graphile-simple-inflector

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
</p>

Simplified naming inflector for Graphile/PostGraphile. It shortens common field names (e.g. `tableByNodeId` → `table`) and makes pluralization behave more predictably for numeric suffixes.

## Install

```sh
pnpm add graphile-simple-inflector
```

When using PostGraphile:

```ts
import PgSimpleInflector from 'graphile-simple-inflector';

createPostGraphileSchema(pool, ['app_public'], {
  appendPlugins: [PgSimpleInflector],
  graphileBuildOptions: {
    pgSimplifyPatch: true,
    pgSimplifyAllRows: true
  }
});
```

## Testing

Tests expect a running PostgreSQL instance (see `utils/env.ts` for defaults). Seed the test database with the provided fixtures or let the test harness create them automatically:

```sh
psql -U postgres -f sql/roles.sql postgres
pnpm test --filter graphile-simple-inflector
```

The included SQL under `sql/` matches the original package's fixtures.
