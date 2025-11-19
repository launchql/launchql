# graphile-search-plugin [![Build Status](https://travis-ci.org/pyramation/graphile-search-plugin.svg?branch=master)](https://travis-ci.org/pyramation/graphile-search-plugin)

```sh
npm install graphile-search-plugin 
```

This [PostGraphile](http://postgraphile.org/) schema plugin was built to enable ordering via `ts_rank` of full-text search on all `tsvector` fields, providing auto-generated queries within PostGraphile.

## Usage

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

## Examples

Look in the tests ;)

## Testing

```sh
createdb test_database
psql test_database < sql/roles.sql
psql test_database < sql/test.sql
yarn test
```

