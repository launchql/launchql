# graphile-postgis

PostGIS helpers for PostGraphile/Graphile. This plugin registers GeoJSON scalars, PostGIS
geometry/geography GraphQL types, and convenience fields for common spatial types.

## Development

Tests run against a real Postgres/PostGIS instance using the `graphile-test` and
`pgsql-test` harnesses. The suite seeds the database from `sql/schema.sql`.

```sh
# from repo root
pnpm --filter graphile-postgis test
```

## Usage

```ts
import PostgisPlugin from 'graphile-postgis';

const options = {
  appendPlugins: [PostgisPlugin]
};
```
