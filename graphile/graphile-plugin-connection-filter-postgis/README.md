# graphile-plugin-connection-filter-postgis

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
  <a href="https://www.npmjs.com/package/graphile-plugin-connection-filter-postgis">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-plugin-connection-filter-postgis%2Fpackage.json"/>
  </a>
</p>

This plugin exposes additional PostGIS-related fields on the `filter` argument of Connections.

## Usage

Requires `postgraphile@^4.5.0` and the following plugins appended prior to this plugin:

- `@graphile/postgis@0.1.0`
- `graphile-plugin-connection-filter@^2.0.0`

## Operators

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

## Development

To establish a test environment, create an empty PostgreSQL database and set a `TEST_DATABASE_URL` environment variable with your database connection string.

```bash
createdb graphile_test
export TEST_DATABASE_URL=postgres://localhost:5432/graphile_test
yarn
yarn test
```
