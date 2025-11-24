# graphile-simple-inflector

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

The included SQL under `sql/` matches the original package’s fixtures.
