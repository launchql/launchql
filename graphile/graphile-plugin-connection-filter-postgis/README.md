# graphile-plugin-connection-filter-postgis

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
  <a href="https://www.npmjs.com/package/graphile-plugin-connection-filter-postgis">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-plugin-connection-filter-postgis%2Fpackage.json"/>
  </a>
</p>

**`graphile-plugin-connection-filter-postgis`** exposes PostGIS-aware operators on the `filter` argument for PostGraphile connections.

## 🚀 Installation

```bash
npm install graphile-plugin-connection-filter-postgis
```

## ✨ Features

- Adds PostGIS functions and operators to `graphile-plugin-connection-filter`
- Supports both `geometry` and `geography` columns
- Works with PostGraphile v4 filter inputs

## 📦 Usage

Requires `postgraphile@^4.5.0` and the following plugins appended prior to this plugin:

- `graphile-postgis@^0.1.3`
- `graphile-plugin-connection-filter@^2.0.0`

```ts
import PostGISFilterPlugin from 'graphile-plugin-connection-filter-postgis';
import PostGISPlugin from 'graphile-postgis';
import ConnectionFilterPlugin from 'graphile-plugin-connection-filter';

app.use(
  postgraphile(pgConfig, schemas, {
    appendPlugins: [
      PostGISPlugin,
      ConnectionFilterPlugin,
      PostGISFilterPlugin
    ]
  })
);
```

## 🔎 Operators

| PostGIS function | Types | GraphQL field name |
| --- | --- | --- |
| ST_3DIntersects | geometry | intersects3D |
| ST_Contains | geometry | contains |
| ST_ContainsProperly | geometry | containsProperly |
| ST_CoveredBy | geometry, geography | coveredBy |
| ST_Covers | geometry, geography | covers |
| ST_Crosses | geometry | crosses |
| ST_Disjoint | geometry | disjoint |
| ST_Equals | geometry | equals |
| ST_Intersects | geometry, geography | intersects |
| ST_OrderingEquals | geometry | orderingEquals |
| ST_Overlaps | geometry | overlaps |
| ST_Touches | geometry | touches |
| ST_Within | geometry | within |

| PostGIS operator | Types | GraphQL field name |
| --- | --- | --- |
| = | geometry, geography | exactlyEquals |
| && | geometry, geography | bboxIntersects2D |
| &&& | geometry | bboxIntersectsND |
| &< | geometry | bboxOverlapsOrLeftOf |
| &<\| | geometry | bboxOverlapsOrBelow |
| &> | geometry | bboxOverlapsOrRightOf |
| \|&> | geometry | bboxOverlapsOrAbove |
| << | geometry | bboxLeftOf |
| <<\| | geometry | bboxBelow |
| >> | geometry | bboxRightOf |
| \|>> | geometry | bboxAbove |
| ~ | geometry | bboxContains |
| ~= | geometry | bboxEquals |

## 🧑‍💻 Development

## 🧪 Testing

```sh
# requires a local Postgres with PostGIS available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-plugin-connection-filter-postgis test
```
