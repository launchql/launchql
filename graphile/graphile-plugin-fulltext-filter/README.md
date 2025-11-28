# graphile-plugin-fulltext-filter

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-plugin-fulltext-filter"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-plugin-fulltext-filter%2Fpackage.json"/></a>
</p>

Full text searching on `tsvector` fields for use with `graphile-plugin-connection-filter`. This plugin implements a full text search operator for `tsvector` columns in PostGraphile v4.

## Install

```sh
pnpm add graphile-plugin-fulltext-filter
```

## Usage

### CLI

```bash
postgraphile --append-plugins graphile-plugin-connection-filter,graphile-plugin-fulltext-filter
```

See [here](https://www.graphile.org/postgraphile/extending/#loading-additional-plugins) for more information about loading plugins with PostGraphile.

### Library

```js
const express = require('express');
const { postgraphile } = require('postgraphile');
const PostGraphileConnectionFilterPlugin = require('graphile-plugin-connection-filter');
const FulltextFilterPlugin = require('graphile-plugin-fulltext-filter');

const app = express();

app.use(
  postgraphile(pgConfig, schema, {
    appendPlugins: [
      PostGraphileConnectionFilterPlugin,
      FulltextFilterPlugin,
    ],
  })
);

app.listen(5000);
```

## Performance

All `tsvector` columns that aren't `@omit`'d should have indexes on them:

```sql
ALTER TABLE posts ADD COLUMN full_text tsvector;
CREATE INDEX full_text_idx ON posts USING gin(full_text);
```

## Operators

This plugin adds the `matches` filter operator to the filter plugin, accepting a GraphQL String input and using the `@@` operator to perform full-text searches on `tsvector` columns.

This plugin uses [pg-tsquery](https://github.com/caub/pg-tsquery) to parse the user input to prevent Postgres throwing on bad user input unnecessarily.

## Fields

For each `tsvector` column, a rank column will be automatically added to the GraphQL type for the table by appending `Rank` to the end of the column's name. For example, a column `full_text` will appear as `fullText` in the GraphQL type, and a second column, `fullTextRank` will be added to the type as a `Float`.

This rank field can be used for ordering and is automatically added to the orderBy enum for the table.

## Examples

```graphql
query {
  allPosts(
    filter: {
      fullText: { matches: 'foo -bar' }
    }
    orderBy: FULL_TEXT_RANK_DESC
  ) {
    ...
    fullTextRank
  }
}
```

## Testing

```sh
pnpm test
```

Tests expect a running PostgreSQL instance. See test configuration for database connection details.
