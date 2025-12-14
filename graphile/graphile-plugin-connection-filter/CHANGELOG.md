# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.4.4](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.4.3...graphile-plugin-connection-filter@2.4.4) (2025-12-14)

**Note:** Version bump only for package graphile-plugin-connection-filter

## [2.4.3](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.4.2...graphile-plugin-connection-filter@2.4.3) (2025-12-13)

### Bug Fixes

- pass \_\_dirname to findAndRequirePackageJson for correct package.json resolution ([8fc4a97](https://github.com/constructive-io/constructive/commit/8fc4a9796bede5b556e42df9f82a627d008e1d20))

## [2.4.2](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.4.1...graphile-plugin-connection-filter@2.4.2) (2025-12-12)

**Note:** Version bump only for package graphile-plugin-connection-filter

## [2.4.1](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.4.0...graphile-plugin-connection-filter@2.4.1) (2025-12-11)

**Note:** Version bump only for package graphile-plugin-connection-filter

# [2.4.0](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.3.5...graphile-plugin-connection-filter@2.4.0) (2025-12-11)

**Note:** Version bump only for package graphile-plugin-connection-filter

## [2.3.5](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.3.4...graphile-plugin-connection-filter@2.3.5) (2025-12-11)

**Note:** Version bump only for package graphile-plugin-connection-filter

## [2.3.4](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.3.3...graphile-plugin-connection-filter@2.3.4) (2025-12-10)

**Note:** Version bump only for package graphile-plugin-connection-filter

## [2.3.3](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.3.2...graphile-plugin-connection-filter@2.3.3) (2025-12-06)

**Note:** Version bump only for package graphile-plugin-connection-filter

## [2.3.2](https://github.com/constructive-io/constructive/compare/graphile-plugin-connection-filter@2.3.1...graphile-plugin-connection-filter@2.3.2) (2025-12-04)

**Note:** Version bump only for package graphile-plugin-connection-filter

## 2.3.1 (2025-11-28)

**Note:** Version bump only for package graphile-plugin-connection-filter

## 2.3.0 - 2022-04-03

- Added `connectionFilterUseListInflectors` option to use list inflectors (#177)

## 2.2.2 - 2021-08-01

- Added `tslib` dependency to support installing globally (#156)

## 2.2.1 - 2021-04-25

- Fixed handling of `@omit filter` on constraints and foreign tables (#155)

## 2.2.0 - 2021-04-10

- Converted to TypeScript (#149)

## 2.1.1 - 2020-11-19

- Added index.d.ts to published package

## 2.1.0 - 2020-10-21

- Added minimal TypeScript declaration file

## 2.0.0 - 2020-04-28

- **BREAKING CHANGE:** Bump the minimum supported PostGraphile version to 4.5.0.
- **BREAKING CHANGE:** Simplify `addConnectionFilterOperator` function signature.
- **BREAKING CHANGE:** Rename `connectionFilterLists` option to `connectionFilterArrays`.
- **BREAKING CHANGE:** Remove `similarTo` and `notSimilarTo` operators.
- **BREAKING CHANGE:** Remove `connectionFilterAdditionalInsensitiveOperators` option; the operators are now included by default.
- Allow filtering on `cidr` (#112) and `macaddr`/`macaddr8` (#108) columns
- Allow filtering on composite type columns (#114)

## 1.1.3 - 2019-09-10

- Fixed detection of computed column functions with required arguments, which should not be used for filtering (#111)

## 1.1.2 - 2019-07-29

- Fixed SQL for one-to-many (every/some/none) relation fields (#107)

## 1.1.1 - 2019-06-21

- Fixed missing `filter` argument for setof functions when source table is commented as `@omit all`

## 1.1.0 - 2019-05-31

- Added ability to filter on `citext` columns (#98)
- Added `connectionFilterAdditionalInsensitiveOperators` option (#98)

## 1.0.1 - 2019-04-17

- Fixed missing quotes around identifier when resolving SQL for empty array input (#96)

## 1.0.0 - 2019-04-04

- Initial stable release
