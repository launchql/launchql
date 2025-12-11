# graphile-search-plugin

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
  <a href="https://www.npmjs.com/package/graphile-search-plugin">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-search-plugin%2Fpackage.json"/>
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
# requires a local Postgres available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-search-plugin test
```
