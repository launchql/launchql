# graphile-plugin-connection-filter

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-plugin-connection-filter">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-plugin-connection-filter%2Fpackage.json"/>
  </a>
</p>

**`graphile-plugin-connection-filter`** adds a powerful suite of filtering capabilities to PostGraphile schemas.

> **Warning:** Use of this plugin with the default options may make it **astoundingly trivial** for a malicious actor (or a well-intentioned application that generates complex GraphQL queries) to overwhelm your database with expensive queries. See the [Performance and Security](https://github.com/graphile-contrib/graphile-plugin-connection-filter#performance-and-security) section below for details.

## 🚀 Installation

Requires PostGraphile v4.5.0 or higher.

Install with:

```
pnpm add postgraphile graphile-plugin-connection-filter
```

## ✨ Features

This plugin supports filtering on almost all PostgreSQL types, including complex types such as domains, ranges, arrays, and composite types. For details on the specific operators supported for each type, see [docs/operators.md](https://github.com/graphile-contrib/graphile-plugin-connection-filter/blob/master/docs/operators.md).

See also:

- [@graphile/pg-aggregates](https://github.com/graphile/pg-aggregates) - integrates with this plugin to enable powerful aggregate filtering
- [graphile-plugin-connection-filter-postgis](https://github.com/constructive-io/constructive/tree/main/graphile/graphile-plugin-connection-filter-postgis) - adds PostGIS functions and operators for filtering on `geography`/`geometry` columns
- [postgraphile-plugin-fulltext-filter](https://github.com/mlipscombe/postgraphile-plugin-fulltext-filter) - adds a full text search operator for filtering on `tsvector` columns
- [postgraphile-plugin-unaccented-text-search-filter](https://github.com/spacefill/postgraphile-plugin-unaccented-text-search-filter) - adds unaccent text search operators

## 📦 Usage

### CLI usage via `--append-plugins`:

```
postgraphile --append-plugins graphile-plugin-connection-filter -c postgres://localhost/my_db ...
```

### Library usage via `appendPlugins`:

```ts
import ConnectionFilterPlugin from "graphile-plugin-connection-filter";
// or: const ConnectionFilterPlugin = require("graphile-plugin-connection-filter");

const middleware = postgraphile(DATABASE_URL, SCHEMAS, {
  appendPlugins: [ConnectionFilterPlugin],
});
```

## ⚠️ Performance and Security

By default, this plugin:

- Exposes a large number of filter operators, including some that can perform expensive pattern matching.
- Allows filtering on [computed columns](https://www.graphile.org/postgraphile/computed-columns/), which can result in expensive operations.
- Allows filtering on functions that return `setof`, which can result in expensive operations.
- Allows filtering on List fields (Postgres arrays), which can result in expensive operations.

To protect your server, you can:

- Use the `connectionFilterAllowedFieldTypes` and `connectionFilterAllowedOperators` options to limit the filterable fields and operators exposed through GraphQL.
- Set `connectionFilterComputedColumns: false` to prevent filtering on [computed columns](https://www.graphile.org/postgraphile/computed-columns/).
- Set `connectionFilterSetofFunctions: false` to prevent filtering on functions that return `setof`.
- Set `connectionFilterArrays: false` to prevent filtering on List fields (Postgres arrays).

Also see the [Production Considerations](https://www.graphile.org/postgraphile/production) page of the official PostGraphile docs, which discusses query whitelisting.

## 🚦 Handling `null` and empty objects

By default, this plugin will throw an error when `null` literals or empty objects (`{}`) are included in `filter` input objects. This prevents queries with ambiguous semantics such as `filter: { field: null }` and `filter: { field: { equalTo: null } }` from returning unexpected results. For background on this decision, see https://github.com/graphile-contrib/graphile-plugin-connection-filter/issues/58.

To allow `null` and `{}` in inputs, use the `connectionFilterAllowNullInput` and `connectionFilterAllowEmptyObjectInput` options documented under [Plugin Options](https://github.com/graphile-contrib/graphile-plugin-connection-filter#plugin-options). Please note that even with `connectionFilterAllowNullInput` enabled, `null` is never interpreted as a SQL `NULL`; fields with `null` values are simply ignored when resolving the query.

## 🔧 Plugin Options

When using PostGraphile as a library, the following plugin options can be passed via `graphileBuildOptions`:

#### connectionFilterAllowedOperators

Restrict filtering to specific operators:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterAllowedOperators: [
      "isNull",
      "equalTo",
      "notEqualTo",
      "distinctFrom",
      "notDistinctFrom",
      "lessThan",
      "lessThanOrEqualTo",
      "greaterThan",
      "greaterThanOrEqualTo",
      "in",
      "notIn",
    ],
  },
});
```

#### connectionFilterAllowedFieldTypes

Restrict filtering to specific field types:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterAllowedFieldTypes: ["String", "Int"],
  },
});
```

The available field types will depend on your database schema.

#### connectionFilterArrays

Enable/disable filtering on PostgreSQL arrays:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterArrays: false, // default: true
  },
});
```

#### connectionFilterComputedColumns

Enable/disable filtering by computed columns:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterComputedColumns: false, // default: true
  },
});
```

Consider setting this to `false` and using `@filterable` [smart comments](https://www.graphile.org/postgraphile/smart-comments/) to selectively enable filtering:

```sql
create function app_public.foo_computed(foo app_public.foo)
  returns ... as $$ ... $$ language sql stable;

comment on function app_public.foo_computed(foo app_public.foo) is E'@filterable';
```

#### connectionFilterOperatorNames

Use alternative names (e.g. `eq`, `ne`) for operators:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterOperatorNames: {
      equalTo: "eq",
      notEqualTo: "ne",
    },
  },
});
```

#### connectionFilterRelations

Enable/disable filtering on related fields:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterRelations: true, // default: false
  },
});
```

#### connectionFilterSetofFunctions

Enable/disable filtering on functions that return `setof`:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterSetofFunctions: false, // default: true
  },
});
```

Consider setting this to `false` and using `@filterable` [smart comments](https://www.graphile.org/postgraphile/smart-comments/) to selectively enable filtering:

```sql
create function app_public.some_foos()
  returns setof ... as $$ ... $$ language sql stable;

comment on function app_public.some_foos() is E'@filterable';
```

#### connectionFilterLogicalOperators

Enable/disable filtering with logical operators (`and`/`or`/`not`):

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterLogicalOperators: false, // default: true
  },
});
```

#### connectionFilterAllowNullInput

Allow/forbid `null` literals in input:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterAllowNullInput: true, // default: false
  },
});
```

When `false`, passing `null` as a field value will throw an error.
When `true`, passing `null` as a field value is equivalent to omitting the field.

#### connectionFilterAllowEmptyObjectInput

Allow/forbid empty objects (`{}`) in input:

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterAllowEmptyObjectInput: true, // default: false
  },
});
```

When `false`, passing `{}` as a field value will throw an error.
When `true`, passing `{}` as a field value is equivalent to omitting the field.

#### connectionFilterUseListInflectors

When building the "many" relationship filters, if this option is set `true`
then we will use the "list" field names rather than the "connection" field
names when naming the fields in the filter input. This would be desired if you
have `simpleCollection` set to `"only"` or `"both"` and you've simplified your
inflection to omit the `-list` suffix, e.g. using
`@graphile-contrib/pg-simplify-inflector`'s `pgOmitListSuffix` option. Use this
if you see `Connection` added to your filter field names.

```js
postgraphile(pgConfig, schema, {
  graphileBuildOptions: {
    connectionFilterUseListInflectors: true, // default: false
  },
});
```

## 🧪 Examples

```graphql
query {
  allPosts(filter: {
    createdAt: { greaterThan: "2021-01-01" }
  }) {
    ...
  }
}
```

For an extensive set of examples, see [docs/examples.md](https://github.com/graphile-contrib/graphile-plugin-connection-filter/blob/master/docs/examples.md).

## 🧪 Testing

```sh
# requires a local Postgres available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-plugin-connection-filter test
```
