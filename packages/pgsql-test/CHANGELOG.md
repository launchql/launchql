# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.11.13](https://github.com/launchql/launchql/compare/pgsql-test@2.11.12...pgsql-test@2.11.13) (2025-11-12)

**Note:** Version bump only for package pgsql-test

## [2.11.12](https://github.com/launchql/launchql/compare/pgsql-test@2.11.11...pgsql-test@2.11.12) (2025-11-12)

### Bug Fixes

- add explicit tsconfig.json path to build:dev script ([309dba1](https://github.com/launchql/launchql/commit/309dba1abd2c461803ffe2015cf82d1d3b1e6ee7))
- add missing dependencies and remove resolutions for pnpm ([8c4a3cd](https://github.com/launchql/launchql/commit/8c4a3cd836dbffc5e86466a95ca086c9e8a5d351))
- **pgsql-test:** add index re-exports for module resolution ([f0559fb](https://github.com/launchql/launchql/commit/f0559fb79b0bd60b0b90f8548a331367fdafe176))
- **pgsql-test:** add missing csv-parse dependency ([5456ed9](https://github.com/launchql/launchql/commit/5456ed9ce3454d397a463d483c2a3f3911d604a9))
- **pgsql-test:** add moduleNameMapper for Jest to resolve workspace dependencies ([3d9e90f](https://github.com/launchql/launchql/commit/3d9e90fb9ebd4092c4e275dfbfec45233c285bd6))

## [2.11.11](https://github.com/launchql/launchql/compare/pgsql-test@2.11.10...pgsql-test@2.11.11) (2025-11-11)

**Note:** Version bump only for package pgsql-test

## [2.11.10](https://github.com/launchql/launchql/compare/pgsql-test@2.11.9...pgsql-test@2.11.10) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.9](https://github.com/launchql/launchql/compare/pgsql-test@2.11.8...pgsql-test@2.11.9) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.8](https://github.com/launchql/launchql/compare/pgsql-test@2.11.7...pgsql-test@2.11.8) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.7](https://github.com/launchql/launchql/compare/pgsql-test@2.11.6...pgsql-test@2.11.7) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.6](https://github.com/launchql/launchql/compare/pgsql-test@2.11.5...pgsql-test@2.11.6) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.5](https://github.com/launchql/launchql/compare/pgsql-test@2.11.4...pgsql-test@2.11.5) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.4](https://github.com/launchql/launchql/compare/pgsql-test@2.11.3...pgsql-test@2.11.4) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.3](https://github.com/launchql/launchql/compare/pgsql-test@2.11.2...pgsql-test@2.11.3) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.2](https://github.com/launchql/launchql/compare/pgsql-test@2.11.1...pgsql-test@2.11.2) (2025-11-07)

**Note:** Version bump only for package pgsql-test

## [2.11.1](https://github.com/launchql/launchql/compare/pgsql-test@2.11.0...pgsql-test@2.11.1) (2025-10-18)

**Note:** Version bump only for package pgsql-test

# [2.11.0](https://github.com/launchql/launchql/compare/pgsql-test@2.10.0...pgsql-test@2.11.0) (2025-10-18)

### Bug Fixes

- **pgsql-test:** correct publish rollback test expectations ([15e55dc](https://github.com/launchql/launchql/commit/15e55dc99b152560831b7e8d716ff376e267942e))
- **pgsql-test:** fix auth method tests - permissions and clearContext ([002ad69](https://github.com/launchql/launchql/commit/002ad6934376bc34ac349164d941302f52c9f755))
- **pgsql-test:** fix clearContext() to properly clear all session variables ([f17a6f3](https://github.com/launchql/launchql/commit/f17a6f351817ee022432fb770ba7ad7f837de696))

### Features

- **pgsql-test:** add auth() method to PgTestClient with default auth options ([bbe09a0](https://github.com/launchql/launchql/commit/bbe09a05165de4113c3b067bb7f2fb224cb3ad88))
- **pgsql-test:** add authUser() and clearContext() convenience methods ([d7d2c0a](https://github.com/launchql/launchql/commit/d7d2c0a312db620f97e2b19cb60236529e7a31cc))
- **pgsql-test:** add publish() method for dual-connection data sharing ([8763931](https://github.com/launchql/launchql/commit/87639313624846405bf5d987bd725f69479eb657))

# [2.10.0](https://github.com/launchql/launchql/compare/pgsql-test@2.9.0...pgsql-test@2.10.0) (2025-10-04)

**Note:** Version bump only for package pgsql-test

# [2.9.0](https://github.com/launchql/launchql/compare/pgsql-test@2.8.0...pgsql-test@2.9.0) (2025-09-17)

**Note:** Version bump only for package pgsql-test

# [2.8.0](https://github.com/launchql/launchql/compare/pgsql-test@2.7.0...pgsql-test@2.8.0) (2025-09-04)

**Note:** Version bump only for package pgsql-test

# [2.7.0](https://github.com/launchql/launchql/compare/pgsql-test@2.6.3...pgsql-test@2.7.0) (2025-08-20)

### Bug Fixes

- ensure teardown is always available in getConnections() ([b51c05c](https://github.com/launchql/launchql/commit/b51c05cb22f6f710ff1abcd9691a48d7e39e8486))

## [2.6.3](https://github.com/launchql/launchql/compare/pgsql-test@2.6.2...pgsql-test@2.6.3) (2025-08-19)

**Note:** Version bump only for package pgsql-test

## [2.6.2](https://github.com/launchql/launchql/compare/pgsql-test@2.6.1...pgsql-test@2.6.2) (2025-08-08)

**Note:** Version bump only for package pgsql-test

## [2.6.1](https://github.com/launchql/launchql/compare/pgsql-test@2.6.0...pgsql-test@2.6.1) (2025-08-08)

**Note:** Version bump only for package pgsql-test

# [2.6.0](https://github.com/launchql/launchql/compare/pgsql-test@2.5.0...pgsql-test@2.6.0) (2025-07-31)

### Bug Fixes

- replace workspace:\* with specific version ^2.1.13 for @launchql/env dependencies ([2fb68f2](https://github.com/launchql/launchql/commit/2fb68f247fd2aa9d966bafe19986db016c2be3c3))

### Features

- create @launchql/env package for consolidated environment management ([004c78e](https://github.com/launchql/launchql/commit/004c78e87ceddfc2d0a3f74e79affe13c8a628d1))

# [2.5.0](https://github.com/launchql/launchql/compare/pgsql-test@2.4.0...pgsql-test@2.5.0) (2025-07-15)

**Note:** Version bump only for package pgsql-test

# [2.4.0](https://github.com/launchql/launchql/compare/pgsql-test@2.3.1...pgsql-test@2.4.0) (2025-06-30)

**Note:** Version bump only for package pgsql-test

## [2.3.1](https://github.com/launchql/launchql/compare/pgsql-test@2.3.0...pgsql-test@2.3.1) (2025-06-28)

**Note:** Version bump only for package pgsql-test

# [2.3.0](https://github.com/launchql/launchql/compare/pgsql-test@2.2.0...pgsql-test@2.3.0) (2025-06-27)

**Note:** Version bump only for package pgsql-test

# [2.2.0](https://github.com/launchql/launchql/compare/pgsql-test@2.1.21...pgsql-test@2.2.0) (2025-06-25)

**Note:** Version bump only for package pgsql-test

## [2.1.21](https://github.com/launchql/launchql/compare/pgsql-test@2.1.20...pgsql-test@2.1.21) (2025-05-30)

**Note:** Version bump only for package pgsql-test

## [2.1.20](https://github.com/launchql/launchql/compare/pgsql-test@2.1.19...pgsql-test@2.1.20) (2025-05-30)

**Note:** Version bump only for package pgsql-test

## [2.1.19](https://github.com/launchql/launchql/compare/pgsql-test@2.1.18...pgsql-test@2.1.19) (2025-05-29)

**Note:** Version bump only for package pgsql-test

## [2.1.18](https://github.com/launchql/launchql/compare/pgsql-test@2.1.17...pgsql-test@2.1.18) (2025-05-27)

**Note:** Version bump only for package pgsql-test

## [2.1.17](https://github.com/launchql/launchql/compare/pgsql-test@2.1.16...pgsql-test@2.1.17) (2025-05-25)

**Note:** Version bump only for package pgsql-test

## [2.1.16](https://github.com/launchql/launchql/compare/pgsql-test@2.1.15...pgsql-test@2.1.16) (2025-05-24)

**Note:** Version bump only for package pgsql-test

## [2.1.15](https://github.com/launchql/launchql/compare/pgsql-test@2.1.14...pgsql-test@2.1.15) (2025-05-24)

**Note:** Version bump only for package pgsql-test

## [2.1.14](https://github.com/launchql/launchql/compare/pgsql-test@2.1.13...pgsql-test@2.1.14) (2025-05-20)

**Note:** Version bump only for package pgsql-test

## [2.1.13](https://github.com/launchql/launchql/compare/pgsql-test@2.1.12...pgsql-test@2.1.13) (2025-05-20)

**Note:** Version bump only for package pgsql-test

## [2.1.12](https://github.com/launchql/launchql/compare/pgsql-test@2.1.11...pgsql-test@2.1.12) (2025-05-19)

**Note:** Version bump only for package pgsql-test

## [2.1.11](https://github.com/launchql/launchql/compare/pgsql-test@2.1.10...pgsql-test@2.1.11) (2025-05-19)

**Note:** Version bump only for package pgsql-test

## [2.1.10](https://github.com/launchql/launchql/compare/pgsql-test@2.1.9...pgsql-test@2.1.10) (2025-05-19)

**Note:** Version bump only for package pgsql-test

## [2.1.9](https://github.com/launchql/launchql/compare/pgsql-test@2.1.8...pgsql-test@2.1.9) (2025-05-19)

**Note:** Version bump only for package pgsql-test

## [2.1.8](https://github.com/launchql/launchql/compare/pgsql-test@2.1.7...pgsql-test@2.1.8) (2025-05-19)

**Note:** Version bump only for package pgsql-test

## [2.1.7](https://github.com/launchql/launchql/compare/pgsql-test@2.1.6...pgsql-test@2.1.7) (2025-05-19)

**Note:** Version bump only for package pgsql-test

## [2.1.6](https://github.com/launchql/launchql/compare/pgsql-test@2.1.5...pgsql-test@2.1.6) (2025-05-19)

**Note:** Version bump only for package pgsql-test

## [2.1.5](https://github.com/launchql/launchql/compare/pgsql-test@2.1.4...pgsql-test@2.1.5) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.1.4](https://github.com/launchql/launchql/compare/pgsql-test@2.1.3...pgsql-test@2.1.4) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.1.3](https://github.com/launchql/launchql/compare/pgsql-test@2.1.2...pgsql-test@2.1.3) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.1.2](https://github.com/launchql/launchql/compare/pgsql-test@2.1.1...pgsql-test@2.1.2) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.1.1](https://github.com/launchql/launchql/compare/pgsql-test@2.1.0...pgsql-test@2.1.1) (2025-05-18)

**Note:** Version bump only for package pgsql-test

# [2.1.0](https://github.com/launchql/launchql/compare/pgsql-test@2.0.8...pgsql-test@2.1.0) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.0.8](https://github.com/launchql/launchql/compare/pgsql-test@2.0.7...pgsql-test@2.0.8) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.0.7](https://github.com/launchql/launchql/compare/pgsql-test@2.0.6...pgsql-test@2.0.7) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.0.6](https://github.com/launchql/launchql/compare/pgsql-test@2.0.5...pgsql-test@2.0.6) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.0.5](https://github.com/launchql/launchql/compare/pgsql-test@2.0.4...pgsql-test@2.0.5) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.0.4](https://github.com/launchql/launchql/compare/pgsql-test@2.0.3...pgsql-test@2.0.4) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.0.3](https://github.com/launchql/launchql/compare/pgsql-test@2.0.2...pgsql-test@2.0.3) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## [2.0.2](https://github.com/launchql/launchql/compare/pgsql-test@2.0.1...pgsql-test@2.0.2) (2025-05-18)

**Note:** Version bump only for package pgsql-test

## 2.0.1 (2025-05-18)

**Note:** Version bump only for package pgsql-test
