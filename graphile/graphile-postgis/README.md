# graphile-postgis

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
</p>

PostGIS helpers for PostGraphile/Graphile. This plugin registers GeoJSON scalars, PostGIS
geometry/geography GraphQL types, and convenience fields for common spatial types.

## Install

```sh
pnpm add graphile-postgis
```

## Usage

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

## Testing

Tests run against a real Postgres/PostGIS instance using the `graphile-test` and
`pgsql-test` harnesses. The suite seeds the database from `sql/schema.sql`.

```sh
psql -U postgres -f sql/schema.sql postgres
pnpm test --filter graphile-postgis
```
