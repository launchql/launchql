# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm build:dev        # Build all packages (dev mode - faster, no optimizations)
pnpm lint             # Lint all packages (auto-fix enabled)
pnpm clean            # Clean build artifacts
pnpm deps             # Update dependencies interactively (pnpm up -r -i -L)
```

### Per-Package Commands

From any package directory (e.g., `cd pgpm/cli`):

```bash
pnpm build        # Build the package (uses makage)
pnpm lint         # Lint with auto-fix
pnpm test         # Run tests (Jest)
pnpm test:watch   # Run tests in watch mode
pnpm dev          # Run in development mode (where available)
```

### Running a Single Test File

```bash
cd packages/cli
pnpm test -- path/to/test.test.ts
pnpm test -- --testNamePattern="test name pattern"
```

### Publishing

Lerna with independent versioning and conventional commits. Publishing only from `main` branch:

```bash
npx lerna version    # Bump versions
npx lerna publish    # Publish to npm
```

## Project Architecture

A **pnpm monorepo** with Lerna for versioning. PostgreSQL-first framework: design your database schema, manage it with pgpm, and get a production-ready GraphQL API automatically via PostGraphile.

### Data Flow

```
PostgreSQL (schema + RLS policies, managed by pgpm migrations)
    ↓
PostGraphile (graphql/server + graphile/* plugins)
    ↓
GraphQL Schema (auto-generated from database)
    ↓
graphql/codegen (--react-query mode OR --orm mode)
    ↓
React Query Hooks or Prisma-like ORM Client
```

### Workspace Groups

| Directory | Purpose |
|-----------|---------|
| `pgpm/` | PostgreSQL Package Manager - CLI (`pgpm`), core engine, types, env, logger |
| `graphql/` | GraphQL layer - server, codegen, query builder, explorer, AST utilities |
| `graphile/` | PostGraphile plugins - filters, i18n, meta-schema, PostGIS, search, uploads, settings |
| `postgres/` | PostgreSQL utilities - introspection, testing (pgsql-test), seeding, AST, query context |
| `packages/` | Shared utilities - CLI (`cnc`), ORM base, query builder, server utils, client |
| `uploads/` | File streaming - RustFS (or any S3-compatible store), ETags, content-type detection, UUID hashing |

### Key Packages & CLIs

**`pgpm` CLI** (`pgpm/cli`) - PostgreSQL Package Manager. Commands: `init`, `add`, `deploy`, `revert`, `verify`, `plan`, `install`, `export`, `docker`, `dump`, `tag`. Manages SQL migrations in Sqitch-compatible format with dependency resolution.

**`cnc` CLI** (`packages/cli`, binary: `cnc` or `constructive`) - Full dev toolkit. Commands: `server` (start PostGraphile), `explorer` (GraphiQL UI), `codegen` (generate SDK), `get-graphql-schema`, `context`, `auth`, `execute`.

**`graphql/codegen`** - Generates type-safe clients from GraphQL schema or endpoint:
- `--react-query` mode: TanStack Query v5 hooks with query key factories
- `--orm` mode: Prisma-like fluent API with `InferSelectResult<T, S>` type inference, discriminated union error handling (`.unwrap()`, `.unwrapOr()`)
- Sources: GraphQL endpoint URL, .graphql schema file, or direct database introspection

**`graphql/server`** - Express + PostGraphile. Supports multi-endpoint routing via subdomain/host detection (schema builder with app-public/auth/admin sub-endpoints). Uses `LISTEN/NOTIFY` for schema cache invalidation.

**`graphile/graphile-settings`** - Centralizes all PostGraphile plugin config: connection filters, full-text search, PostGIS, i18n, meta-schema, many-to-many, search, upload plugin. Single `getGraphileSettings(opts)` entry point.

**`packages/query-builder`** - Fluent SQL query builder for SELECT/INSERT/UPDATE/DELETE with JOINs, WHERE, GROUP BY. Schema-qualified tables.

### Testing Infrastructure

**`postgres/pgsql-test`** - Isolated PostgreSQL test environments with per-test transaction rollback:

```typescript
import { getConnections } from 'pgsql-test';
let db, teardown;
beforeAll(async () => ({ db, teardown } = await getConnections()));
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());
afterAll(() => teardown());

test('example', async () => {
  db.setContext({ role: 'authenticated', 'jwt.claims.user_id': '123' });
  const result = await db.query('SELECT current_user_id()');
  expect(result.rows[0].current_user_id).toBe('123');
});
```

**`graphile/graphile-test`** - GraphQL testing with PostGraphile snapshot support.

### Database Configuration

Tests require PostgreSQL. Standard PG env vars:
- `PGHOST` (default: localhost), `PGPORT` (default: 5432)
- `PGUSER` (default: postgres), `PGPASSWORD` (default: password)

For S3/RustFS tests: `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` (endpoint/provider/region are `storage_module` rows, not env)

## Build System

- **makage** compiles TypeScript to both CJS and ESM, outputs to `dist/`
- `makage build --dev` for faster dev builds
- Some packages use `copyfiles` for non-TS assets (SQL files, templates)
- Jest with `ts-jest` preset per-package (`jest.config.js` in each package)

## Code Conventions

- TypeScript with `strict: true` but `strictNullChecks: false`
- Target: ES2022, Module: CommonJS, ModuleResolution: node
- 2-space indent, single quotes, semicolons required, no trailing commas
- Imports auto-sorted by `simple-import-sort`, unused imports auto-removed
- `@typescript-eslint/no-explicit-any`: allowed (turned off)
- Unused var pattern: prefix with `_` (e.g., `_unused`)
- Workspace dependencies use `workspace:^` protocol
- Packages publish from `dist/` directory
- GraphQL pinned to `15.10.1` via overrides
