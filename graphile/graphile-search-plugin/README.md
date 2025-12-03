# graphile-search-plugin

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
  <a href="https://www.npmjs.com/package/graphile-search-plugin">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-search-plugin%2Fpackage.json"/>
  </a>
</p>

**`graphile-search-plugin`** enables `ts_rank` ordering and auto-generated full-text search helpers for all `tsvector` fields in PostGraphile schemas.

## 🚀 Installation

```sh
npm install graphile-search-plugin
```

## ✨ Features

- Adds full-text search helpers for `tsvector` columns
- Enables ordering via `ts_rank` on generated search fields
- Works with PostGraphile append plugin pipeline

## 📦 Usage

1. Append the new plugins!
2. Query `search<YourTsvectorColumn>` in the `conditions` field
3. Enjoy!

```js

import PgSearchPlugin from 'graphile-search-plugin';

app.use(
  postgraphile(connectionStr, schemas, {
    appendPlugins: [
        PgSearchPlugin
    ]
  })
);
```

## 🧪 Examples

Look in the tests ;)

## 🧪 Testing

```sh
createdb test_database
psql test_database < sql/roles.sql
psql test_database < sql/test.sql
pnpm test
```
