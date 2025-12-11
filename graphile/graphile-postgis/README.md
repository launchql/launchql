# graphile-postgis

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
  <a href="https://www.npmjs.com/package/graphile-postgis">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-postgis%2Fpackage.json"/>
  </a>
</p>

**`graphile-postgis`** registers GeoJSON scalars, PostGIS geometry/geography GraphQL types, and convenience fields for common spatial columns in PostGraphile/Graphile schemas.

## 🚀 Installation

```sh
pnpm add graphile-postgis
```

## ✨ Features

- Registers GeoJSON scalars and PostGIS `geometry` / `geography` GraphQL types
- Convenience fields for common spatial column types
- Works with PostGraphile CLI or library usage

## 📦 Usage

### CLI

```sh
postgraphile --append-plugins graphile-postgis
```

Make sure your database has the `postgis` extension enabled so the plugin can expose the spatial types.

### Library

```ts
import PostgisPlugin from 'graphile-postgis';

const options = {
  appendPlugins: [PostgisPlugin]
};
```

## 🧪 Testing

```sh
# requires a local Postgres with PostGIS available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-postgis test
```
