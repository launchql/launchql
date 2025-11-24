[![Package on npm](https://img.shields.io/npm/v/postgraphile-plugin-fulltext-filter.svg)](https://www.npmjs.com/package/postgraphile-plugin-fulltext-filter)
[![CircleCI](https://circleci.com/gh/mlipscombe/postgraphile-plugin-fulltext-filter/tree/master.svg?style=svg)](https://circleci.com/gh/mlipscombe/postgraphile-plugin-fulltext-filter/tree/master)

# postgraphile-plugin-fulltext-filter
This plugin implements a full text search operator for `tsvector` columns in PostGraphile v4 via @mattbretl's excellent `postgraphile-plugin-connection-filter` plugin.

## Getting Started

### CLI

``` bash
postgraphile --append-plugins postgraphile-plugin-connection-filter,postgraphile-plugin-fulltext-filter
```

See [here](https://www.graphile.org/postgraphile/extending/#loading-additional-plugins) for
more information about loading plugins with PostGraphile.

### Library

``` js
const express = require('express');
const { postgraphile } = require('postgraphile');
const PostGraphileConnectionFilterPlugin = require('postgraphile-plugin-connection-filter');
const PostGraphileFulltextFilterPlugin = require('postgraphile-plugin-fulltext-filter');

const app = express();

app.use(
  postgraphile(pgConfig, schema, {
    appendPlugins: [
      PostGraphileConnectionFilterPlugin,
      PostGraphileFulltextFilterPlugin,
    ],
  })
);

app.listen(5000);
```

## Performance

All `tsvector` columns that aren't @omit'd should have indexes on them:

``` sql
ALTER TABLE posts ADD COLUMN full_text tsvector;
CREATE INDEX full_text_idx ON posts USING gin(full_text);
```

## Operators

This plugin adds the `matches` filter operator to the filter plugin, accepting
a GraphQL String input and using the `@@` operator to perform full-text searches
on `tsvector` columns.

This plugin uses [pg-tsquery](https://github.com/caub/pg-tsquery) to parse the
user input to prevent Postgres throwing on bad user input unnecessarily.

## Fields

For each `tsvector` column, a rank column will be automatically added to the 
GraphQL type for the table by appending `Rank` to the end of the column's name.
For example, a column `full_text` will appear as `fullText` in the GraphQL type,
and a second column, `fullTextRank` will be added to the type as a `Float`.

This rank field can be used for ordering and is automatically added to the orderBy
enum for the table.

## Examples

``` graphql
query {
  allPosts(
    filter: {
      fullText: { matches: 'foo -bar' }
    }
    orderBy: FULL_TEXT_RANK_DESC
  }) {
    ...
    fullTextRank
  }
}
```
