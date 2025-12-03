# graphile-simple-inflector

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/launchql/launchql/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-simple-inflector">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-simple-inflector%2Fpackage.json"/>
  </a>
</p>

**`graphile-simple-inflector`** simplifies Graphile/PostGraphile naming by shortening common fields (e.g. `tableByNodeId` → `table`) and keeping pluralization predictable for numeric suffixes.

## 🚀 Installation

```sh
pnpm add graphile-simple-inflector
```

## ✨ Features

- Shorter, predictable field names (`tableByNodeId` → `table`)
- Smarter pluralization for numeric suffixes
- Designed to pair with PostGraphile simplify options

## 📦 Usage

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

## 🧪 Testing

Tests expect a running PostgreSQL instance (see `utils/env.ts` for defaults). Seed the test database with the provided fixtures or let the test harness create them automatically:

```sh
psql -U postgres -f sql/roles.sql postgres
pnpm test --filter graphile-simple-inflector
```

The included SQL under `sql/` matches the original package's fixtures.
