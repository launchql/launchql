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