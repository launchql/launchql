# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.1](https://github.com/launchql/launchql/compare/drizzle-orm-test@0.2.0...drizzle-orm-test@0.2.1) (2025-11-22)

**Note:** Version bump only for package drizzle-orm-test





# 0.2.0 (2025-11-22)

### Bug Fixes

- handle pg-copy-streams and transaction control in proxy ([ceac9fe](https://github.com/launchql/launchql/commit/ceac9fe464488fe2a65d76a3bfc259889c481564))

### Code Refactoring

- rename to drizzle-test and simplify to single proxy-based approach ([f667059](https://github.com/launchql/launchql/commit/f667059f89fc80b87746a7b7c028e9b7f867c20b))

### BREAKING CHANGES

- Package renamed from pgsql-drizzle-test to drizzle-test

Major changes:

- Renamed package from pgsql-drizzle-test to drizzle-test
- Removed variation1 (wrapper-based approach) entirely
- Kept only variation2 (proxy-based approach) as the main API
- Renamed getConnectionsWithProxy to getConnections for drop-in replacement
- Re-export PgTestClient and types from pgsql-test for convenience
- Completely rewrote README to focus on proxy approach

API changes:

- import { getConnections, PgTestClient } from 'drizzle-test'
- Drop-in replacement for pgsql-test with Drizzle ORM support
- Use standard Drizzle pattern: drizzle(db.client)
- Context management via db.setContext() and db.auth()

Benefits:

- Cleaner API that matches pgsql-test conventions
- Standard Drizzle import pattern (drizzle-orm/node-postgres)
- No wrapper-specific helper methods needed
- Familiar for users of other ORMs

All 18 tests passing with the new structure

Co-Authored-By: Dan Lynch <pyramation@gmail.com>

# 0.1.0 (2025-11-22)

### Bug Fixes

- handle pg-copy-streams and transaction control in proxy ([ceac9fe](https://github.com/launchql/launchql/commit/ceac9fe464488fe2a65d76a3bfc259889c481564))

### Code Refactoring

- rename to drizzle-orm-test and simplify to single proxy-based approach ([f667059](https://github.com/launchql/launchql/commit/f667059f89fc80b87746a7b7c028e9b7f867c20b))

### BREAKING CHANGES

- Package renamed from pgsql-drizzle-orm-test to drizzle-orm-test

Major changes:

- Renamed package from pgsql-drizzle-orm-test to drizzle-orm-test
- Removed variation1 (wrapper-based approach) entirely
- Kept only variation2 (proxy-based approach) as the main API
- Renamed getConnectionsWithProxy to getConnections for drop-in replacement
- Re-export PgTestClient and types from pgsql-test for convenience
- Completely rewrote README to focus on proxy approach

API changes:

- import { getConnections, PgTestClient } from 'drizzle-orm-test'
- Drop-in replacement for pgsql-test with Drizzle ORM support
- Use standard Drizzle pattern: drizzle(db.client)
- Context management via db.setContext() and db.auth()

Benefits:

- Cleaner API that matches pgsql-test conventions
- Standard Drizzle import pattern (drizzle-orm/node-postgres)
- No wrapper-specific helper methods needed
- Familiar for users of other ORMs

All 18 tests passing with the new structure

Co-Authored-By: Dan Lynch <pyramation@gmail.com>
