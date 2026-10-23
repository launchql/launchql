# Constructive Agent Navigation Guide

This guide helps AI agents quickly navigate the Constructive monorepo. Constructive provides tooling for building secure, role-aware GraphQL APIs backed by PostgreSQL.

## Quick Start

**Most important packages to know first:**
1. **`pgpm/core`** – PGPM engine: migrations, packaging, dependency resolution ([guide](pgpm/core/AGENTS.md))
2. **`pgpm/pgpm`** – PGPM CLI: database/workspace commands (init/add/deploy/verify/etc)
3. **`packages/cli`** – Constructive CLI (`constructive` / `cnc`), delegates PGPM commands and adds GraphQL workflows ([guide](packages/cli/AGENTS.md))
4. **`postgres/pgsql-test`** – PostgreSQL test harness and seed adapters ([guide](postgres/pgsql-test/AGENTS.md))
5. **`graphql/server`** – Constructive GraphQL server (Express + PostGraphile)
6. **`graphql/codegen`** – GraphQL code generation (types/ops/sdk)

**Key classes and entry points:**
- **`PgpmPackage`** – `pgpm/core/src/core/class/pgpm.ts`
- **`PgpmMigrate`** – `pgpm/core/src/migrate/client.ts`
- **`GraphQLServer`** – `graphql/server/src/server.ts`

## Monorepo Layout

- **`packages/*`** – Constructive CLI + misc packages (`client`, `orm`, `query-builder`, `url-domains`, `server-utils`, etc.)
- **`pgpm/*`** – PGPM engine + CLI + shared types/logger/env
- **`graphql/*`** – GraphQL server, explorer, codegen, types/env, and query utilities
- **`postgres/*`** – PostgreSQL tooling and tests (`pg-ast`, `pg-codegen`, `introspectron`, `pgsql-test`, etc.)
- **`streaming/*`** – S3 helpers and stream hashing utilities
- **`extensions/*`** – PGPM extension modules (Postgres extensions packaged as PGPM modules)
- **`graphile/*`** – Graphile/PostGraphile plugins (kept under their own namespace)

## Entry Points

### PGPM CLI (`pgpm`)

- **Router:** `pgpm/pgpm/src/commands.ts`
- **Executable:** `pgpm/pgpm/src/index.ts`
- **Command implementations:** `pgpm/pgpm/src/commands/*`

### Constructive CLI (`constructive` / `cnc`)

- **Router:** `packages/cli/src/commands.ts`
- **Local GraphQL commands:** `packages/cli/src/commands/*`
- **Delegated PGPM commands:** sourced from `pgpm/pgpm`

### GraphQL Server

- **Entry:** `graphql/server/src/index.ts`
- **Server implementation:** `graphql/server/src/server.ts`
- **Schema wiring:** `graphql/server/src/schema.ts`

## Common Workflows (via CLI)

**Database Operations (pgpm):**
- Initialize workspace/module: `pgpm init workspace`, `pgpm init`
- Create a change: `pgpm add <change>`
- Deploy/verify/revert: `pgpm deploy`, `pgpm verify`, `pgpm revert`
- Install PGPM modules: `pgpm install <pkg@version>`

**GraphQL Operations (cnc/constructive):**
- Start GraphQL server: `cnc server`
- Launch GraphiQL explorer: `cnc explorer`
- Generate types/SDK: `cnc codegen`
- Export schema SDL: `cnc get-graphql-schema`

## Bundled Deploy (fast, ledger-preserving migrations)

Every module can ship a content-addressed **bundle artifact** alongside its packaged SQL, and deploys can run from it in one shot — same speed as the old fast path, but it still writes the `pgpm_migrate` ledger. It's all driven by two CLI commands.

**Emit the artifact (packaging):**

```bash
pgpm package            # writes sql/<name>--<version>.sql AND sql/<name>--<version>.bundle.tar.gz (default)
pgpm package --no-bundle # skip the bundle artifact
```

The `.bundle.tar.gz` is a gzipped tarball of the module's JSON migration bundle (plan + per-change deploy/revert/verify SQL + a sha256 digest). **Commit it** beside the `.sql`.

**Deploy from it (fast path):**

```bash
pgpm deploy --fast      # one-shot execute + bulk pgpm_migrate ledger
pgpm deploy --bundled   # alias for --fast
```

`--fast` prefers each module's committed `sql/<name>--<version>.bundle.tar.gz`: it verifies the sha256 digest, checks the artifact still matches `deploy/`, executes the module in a single round-trip, and bulk-inserts one `pgpm_migrate` row (name + hash) per change. If the artifact is missing, stale, or fails verification it **falls back** to building the bundle from `deploy/` — no behavior change, never a hard failure. Re-deploys skip changes already recorded by hash.

Programmatic API (only if you can't use the CLI): `writeBundleArtifact` / `readBundleArtifact` / `buildExecutableBundle` in `pgpm/core/src/bundle/artifact.ts`; see the `pgpm-migration-bundle` skill for the artifact/AST internals.

## Best Practices

### Environment Configuration

Always use the unified environment configuration system — never read `process.env` directly for config values.

- **PGPM packages** (`pgpm/*`): `import { getEnvOptions } from '@pgpmjs/env'`
- **GraphQL/Constructive packages** (`graphql/*`, `packages/cli`): `import { getEnvOptions } from '@constructive-io/graphql-env'`
- **PostgreSQL tools** (`postgres/*`): `import { getPgEnvOptions } from 'pg-env'` or `@pgpmjs/env`

The system provides typed defaults, config file discovery (`pgpm.json`), env var parsing, and a clean merge hierarchy: **defaults → config file → env vars → runtime overrides**.

```typescript
// GOOD
import { getEnvOptions } from '@pgpmjs/env';
const opts = getEnvOptions({ pg: { database: 'mydb' } });

// BAD — scattered, untyped, no defaults
const host = process.env.PGHOST || 'localhost';
const port = parseInt(process.env.PGPORT || '5432');
```

### Testing

Constructive provides a layered testing framework stack. **Always use the appropriate framework** — never manually create `pg.Pool` or `pg.Client` instances in tests.

#### Which Framework to Use

| Scenario | Framework | Import |
|----------|-----------|--------|
| Raw SQL, RLS policies, database functions | `pgsql-test` | `import { getConnections } from 'pgsql-test'` |
| PostGraphile schema, basic GraphQL queries | `graphile-test` | `import { getConnections } from 'graphile-test'` |
| GraphQL with Constructive plugins (search, pgvector, etc.) | `@constructive-io/graphql-test` | `import { getConnections } from '@constructive-io/graphql-test'` |
| HTTP endpoints, auth headers, middleware | `@constructive-io/graphql-server-test` | `import { getConnections } from '@constructive-io/graphql-server-test'` |

Each layer builds on `pgsql-test` underneath — they all create isolated test databases with proper teardown.

#### Required Test Hooks

Always include `beforeEach`/`afterEach` hooks to ensure test isolation via savepoints:

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
  await pg.afterEach();
});
```

#### Anti-Patterns to Avoid

- **Never** create `new pg.Pool()` or `new pg.Client()` in tests — use `getConnections()` from the appropriate framework
- **Never** use `getPgPool()` from `pg-cache` in tests — that's for production connection pooling
- **Never** manually create/drop databases in tests — `pgsql-test` handles this automatically
- **Never** skip `beforeEach`/`afterEach` hooks — tests will leak state to each other
- **Never** hand-roll `SAVEPOINT` / `ROLLBACK TO SAVEPOINT` (or a local `expectRejects` helper) around a statement that should fail — use `await db.expectError(() => db.query(...), /pattern/)`, which keeps the test transaction usable afterwards
- **Never** construct connection strings manually — use the env configuration system

## Tooling Skills

The `.agents/skills/` directory contains tooling-focused skills for this monorepo:

| Skill | Description | When to Use |
|-------|-------------|-------------|
| `pgpm` | PostgreSQL Package Manager — migrations, CLI, Docker, CI/CD, project scaffolding, table creation rules, DB export | Database migrations, workspace/module creation, `pgpm init`, deploy/revert |
| `pgpm-migration-bundle` | The portable, content-addressed migration bundle artifact and the pgpm module AST it is built from (`pgpm/core/src/bundle/*`, `pgpm/core/src/ast/*`) | Exporting/shipping a migration between databases, transpiling into a new namespace, verifying an artifact, reading/writing a module as an AST |
| `constructive-starter-kits` | Project scaffolding router — `pgpm init` templates, Next.js app boilerplate, custom template repos, boilerplate authoring (routes to the `pgpm` skill's scaffolding references) | Creating a new project, scaffolding a workspace/module, starting a boilerplate, setting up a Next.js app, authoring templates |
| `constructive-pnpm` | PNPM workspace management — monorepo config, dist-folder publishing with makage/lerna, dependency management | Configuring pnpm workspaces, publishing packages, managing monorepo dependencies |
| `constructive-setup` | Monorepo setup — install dependencies, start PostgreSQL, bootstrap users, build, run tests, local email services | Setting up the development environment, local dev, full pipeline |
| `constructive-testing` | PostgreSQL testing frameworks — pgsql-test, drizzle-orm-test, supabase-test | Writing database tests, testing RLS policies, seeding test data |
| `constructive-cli` | Generated CLI commands — how the CLI is generated from GraphQL schemas, codegen options, multi-target CLI | Generating CLI tools, running generated CLI, understanding codegen pipeline |
| `graphile-search` | Unified PostGraphile v5 search plugin — tsvector, BM25, pg_trgm, pgvector adapters, composite searchScore | Adding search to GraphQL, configuring search adapters, querying search via SDK |

## Tips

1. Start with `pgpm/core/AGENTS.md` to understand the migration and plan model.
2. Use `packages/cli/AGENTS.md` to understand Constructive's command routing.
3. Use `postgres/pgsql-test/AGENTS.md` for patterns around isolated test DBs and seeding.
