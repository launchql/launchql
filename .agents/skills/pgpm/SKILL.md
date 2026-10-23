---
name: pgpm
description: PostgreSQL Package Manager — deterministic, plan-driven database migrations with dependency management. Use when asked to "deploy database", "run migrations", "manage pgpm modules", "add a table", "create a function", "add a migration", "write database changes", "create a workspace", "set up pgpm", "manage dependencies", "revert a migration", "verify deployments", "tag a release", "start postgres", "run database locally", "set up database environment", "load env vars", "add an extension", "install a module", "publish pgpm module", "test database", "write integration tests", "troubleshoot pgpm", or when working with PostgreSQL package management, .control files, pgpm.plan, or SQL migration scripts.
compatibility: pgpm CLI, PostgreSQL 14+, Node.js 22+, Docker
metadata:
  author: constructive-io
  version: "2.0.0"
---

# pgpm (PostgreSQL Package Manager)

pgpm provides deterministic, plan-driven database migrations with dependency management and modular packaging. It brings npm-style modularity to PostgreSQL database development — every change is deployed exactly once and reverted exactly once.

## When to Apply

Use this skill when:
- **Creating projects:** Setting up workspaces, initializing modules
- **Writing changes:** Adding tables, functions, triggers, indexes, RLS policies
- **Managing dependencies:** Within-module and cross-module references, .control files
- **Deploying:** Running deploy/verify/revert, tagging releases, checking status
- **Testing:** Writing PostgreSQL integration tests with pgsql-test
- **Configuring:** Docker setup, environment variables, connection config
- **Managing extensions:** Adding PostgreSQL extensions or pgpm modules
- **Publishing:** Bundling and publishing @pgpm/* modules to npm
- **Troubleshooting:** Connection issues, deployment failures, testing problems

## Quick Start

```bash
# 1. Install pgpm
npm install -g pgpm

# 2. Get a PostgreSQL to work against.
#    Already running one (e.g. `pg_isready -h localhost -p 5432` answers)? Use it:
#    export PGHOST/PGPORT/PGUSER/PGPASSWORD for a superuser and skip this whole step
#    (including `pgpm env`). Do not stop the developer's server or start Docker on top of it.
#    Otherwise, start the pgpm container and load its connection vars:
pgpm docker start
eval "$(pgpm env)"

# 3. Create a workspace
pgpm init workspace
# Enter workspace name when prompted
cd my-database-project
pnpm install

# 4. Create a module (scaffolds with no extensions by default)
pgpm init
# Enter module name (e.g., "pets"). Add extensions later with `pgpm extension`,
# or up front with `pgpm init --extensions a,b`

# 5. Add a change
cd packages/pets
pgpm add schemas/pets
pgpm add schemas/pets/tables/pets --requires schemas/pets

# 6. Write your SQL (see "Three-File Pattern" below)

# 7. Deploy
pgpm deploy --createdb --database mydb
```

## Core Concepts

### Three-File Pattern

Every database change consists of three files:

| File | Purpose | Header |
|------|---------|--------|
| `deploy/<change>.sql` | Creates the object | `-- Deploy <change> to pg` |
| `revert/<change>.sql` | Removes the object | `-- Revert <change> from pg` |
| `verify/<change>.sql` | Confirms deployment | `-- Verify <change> on pg` |

### pgpm.plan

The plan file controls deployment order. Each line:
```
change_name [dep1 dep2] 2026-01-25T00:00:00Z author <email@example.org>
```

Dependencies `[...]` must come immediately after the change name, before the timestamp.

### .control File

Each module has a `.control` file declaring its name and PostgreSQL extension dependencies. A freshly-scaffolded module has **no** `requires` line (zero extensions by default); it appears once you add a dependency:
```
comment = 'My database module'
default_version = '0.0.1'
requires = 'pgcrypto,pgpm-base32'
```

The `requires` field uses **control file names** (e.g., `pgpm-base32`), NOT npm names (e.g., `@pgpm/base32`). See [references/module-naming.md](references/module-naming.md) for details.

### Workspace vs Module

- **Workspace** = pnpm monorepo containing one or more modules (`pgpm init workspace`)
- **Module** = individual database package with its own .control, pgpm.plan, and deploy/revert/verify directories (`pgpm init`)

## Critical Rules

### 1. NEVER Use CREATE OR REPLACE

pgpm is deterministic. Each change deploys exactly once. To modify an existing object, create a new change that drops and recreates it.

```sql
-- CORRECT
CREATE FUNCTION app.my_function() ...

-- WRONG
CREATE OR REPLACE FUNCTION app.my_function() ...
```

### 2. NO Transaction Wrapping

Do NOT add `BEGIN`/`COMMIT` to SQL files. pgpm handles transactions automatically.

```sql
-- CORRECT — just the raw SQL
CREATE TABLE app.users ( ... );

-- WRONG
BEGIN;
CREATE TABLE app.users ( ... );
COMMIT;
```

### 3. NEVER Run CREATE EXTENSION Directly

pgpm handles extension creation during deploy. Declare extensions in your `.control` file's `requires` field instead.

## Key Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `pgpm init workspace` | Create a new pnpm monorepo workspace |
| `pgpm init` | Create a new module in a workspace |
| `pgpm add <path> --requires <dep>` | Add a new change (creates deploy/revert/verify files) |
| `pgpm deploy` | Deploy changes to database |
| `pgpm deploy --createdb --database <name>` | Create database and deploy |
| `pgpm verify` | Run verification scripts |
| `pgpm revert --to <change>` | Revert changes back to a specific point |
| `pgpm tag <version>` | Tag current state for targeted deploys |
| `pgpm install <module>` | Install a pgpm module dependency |
| `pgpm extension [--add/--remove/--set a,b]` | Manage module dependencies (flags are non-interactive; no flags = interactive picker) |
| `pgpm test-packages` | Test the minimal covering set (`--force-all` for every module) |
| `pgpm test-packages --full-cycle` | Test deploy → verify → revert → redeploy |
| `pgpm docker start` | Start PostgreSQL container |
| `pgpm docker stop` | Stop PostgreSQL container |
| `pgpm env` | Print environment variable exports |
| `pgpm migrate status` | Show deployed vs pending changes |
| `pgpm plan` | Generate plan from SQL `-- requires:` comments |
| `pgpm package` | Bundle module for publishing |
| `pgpm package --check` | Verify committed bundle artifacts are in sync with `deploy/` (CI gate) |

## Essential Development Workflow

```bash
# Start PostgreSQL and load environment (skip both if PG* already point at your own server)
pgpm docker start
eval "$(pgpm env)"

# Bootstrap admin users (first time)
pgpm admin-users bootstrap --yes
pgpm admin-users add --test --yes

# Add a new change
pgpm add schemas/app/tables/orders --requires schemas/app

# Edit deploy/revert/verify SQL files

# Deploy and verify
pgpm deploy --createdb --database mydb
pgpm verify

# Run tests
pnpm test

# Tag a release
pgpm tag v1.0.0
```

## Common Workflows

### Adding a Table

```bash
# Add the change
pgpm add schemas/app/tables/users --requires schemas/app
```

```sql
-- deploy/schemas/app/tables/users.sql
-- Deploy schemas/app/tables/users to pg
-- requires: schemas/app

CREATE TABLE app.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

```sql
-- revert/schemas/app/tables/users.sql
-- Revert schemas/app/tables/users from pg

DROP TABLE IF EXISTS app.users;
```

```sql
-- verify/schemas/app/tables/users.sql
-- Verify schemas/app/tables/users on pg

DO $$
BEGIN
  ASSERT (SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'app' AND table_name = 'users'
  )), 'Table app.users does not exist';
END $$;
```

### Writing Tests (with pgsql-test)

```typescript
import { getConnections } from 'pgsql-test';
import * as seed from 'pgsql-test/seed';

let db, teardown;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({}, [
    seed.pgpm({ database: 'mydb' })
  ]));
});
afterAll(() => teardown());
beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());

it('creates a user', async () => {
  const result = await db.query(`
    INSERT INTO app.users (email, name)
    VALUES ('test@example.com', 'Test User')
    RETURNING *
  `);
  expect(result.rows[0].email).toBe('test@example.com');
});
```

### CI/CD Full-Cycle Validation

```bash
pgpm test-packages --full-cycle
```

This proves: deploy → verify → revert → redeploy works for every module.

### Fixing a Broken Deploy

```bash
# Check status
pgpm migrate status

# Revert the bad change
pgpm revert --to <last-good-change>

# Fix the SQL, then redeploy
pgpm deploy
```

## Non-Interactive / CI Usage

pgpm uses `inquirerer` for interactive prompts. When stdin is a TTY but no human is present (agents, PTY-allocated CI, Docker with `-t`), prompts **hang indefinitely**.

### How noTty detection works

The `inquirerer` library enters non-interactive mode (`noTty`) when any of these are true:
- `--no-tty` flag is passed
- `process.env.CI === 'true'`
- The caller explicitly sets `noTty: true`

In `noTty` mode, `inquirerer` uses defaults where available and throws with the full list of required arguments if any are missing. This is the correct mode for all automated usage.

### Rules for automated environments

1. **Pass `--yes` for confirmation prompts** — this provides the `yes` argument so the confirm prompt is skipped:
   ```bash
   pgpm deploy --yes --database mydb
   pgpm admin-users bootstrap --yes
   pgpm admin-users add --test --yes
   pgpm revert --yes --database mydb
   ```

2. **Pass `--no-tty` for fully non-interactive mode** — this tells inquirerer to never wait for input and use defaults or throw:
   ```bash
   pgpm deploy --no-tty --yes --database mydb --createdb
   ```

3. **In CI (`CI=true`)** — noTty is auto-detected. You still need `--yes` for confirm questions since they have no implicit default:
   ```bash
   # GitHub Actions — CI=true is set automatically
   pgpm deploy --yes --database $DB_NAME
   ```

4. **Provide ALL required args on the command line** — in noTty mode, any missing required argument throws. Pre-supply everything:
   ```bash
   pgpm deploy --database mydb --package my-module --yes --recursive
   ```

5. **`pgpm init` and `pgpm extension` support non-interactive use.**
   - `pgpm init --moduleName <module> --extensions a,b` scaffolds without prompting (no `--extensions` means zero extensions). Only the module name would otherwise prompt, so pass `--moduleName` (`pgpm init workspace` uses `--name`).
   - `pgpm extension --add <a,b>` / `--remove <a,b>` / `--set <a,b>` change a module's `requires` without a prompt.
   Running either with no args is interactive.

6. **`pgpm test-packages` does NOT prompt** — safe to run without any flags.

7. **If a command hangs** with no output, it's waiting for a prompt. Kill it and re-run with `--yes` and `--no-tty`.

### Quick reference

| Command | Interactive flags needed | Notes |
|---------|------------------------|-------|
| `pgpm deploy` | `--yes --database <name>` | Confirms before applying; database is required |
| `pgpm admin-users bootstrap` | `--yes` | Confirms role creation |
| `pgpm admin-users add` | `--yes --test` | Confirms user creation |
| `pgpm revert` | `--yes --database <name>` | Confirms before reverting |
| `pgpm test-packages` | None | Non-interactive by default |
| `pgpm verify` | None | Non-interactive |
| `pgpm init` | `--moduleName <module> [--extensions a,b]` | Non-interactive with `--moduleName`; no `--extensions` = zero extensions |
| `pgpm extension` | `--add/--remove/--set a,b` | Non-interactive with a flag; no flag = interactive picker |

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Can't connect to database | `pg_isready -h $PGHOST -p $PGPORT`; if nothing is listening, `pgpm docker start && eval "$(pgpm env)"` |
| `PGHOST` not set | `eval "$(pgpm env)"` — must use `eval`, not run in subshell |
| Developer already runs Postgres on 5432 | Use it: `export PGHOST=localhost PGPORT=5432 PGUSER=<superuser> PGPASSWORD=...` then `pgpm admin-users bootstrap --yes`. No Docker needed |
| `current transaction is aborted` after an expected failure | Wrap the failing call: `await db.expectError(() => db.query(...), /pattern/)` — never hand-roll `SAVEPOINT`/`ROLLBACK TO` |
| Tests interfere with each other | Ensure every test file has `beforeEach`/`afterEach` hooks |
| Module not found during deploy | Verify `.control` file exists and workspace structure is correct |
| Dependency not found | Check `.control` `requires` uses control names, not npm names |
| Port 5432 already in use | If it's a Postgres, use it (row above) — never stop a developer's server. Want the pgpm container anyway? `pgpm docker start --port 5433` and `export PGPORT=5433` |
| `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` | Add the package to `pnpm-policy.yaml` (`allowBuilds` with a reason, or `false`) and `pnpm run policy`. Don't run `pnpm approve-builds` |
| `Invalid line format` in pgpm.plan | Dependencies `[...]` must come right after change name, before timestamp |
| `CREATE OR REPLACE` error | Remove `OR REPLACE` — pgpm is deterministic |
| Container won't start | `pgpm docker start --recreate` for a fresh container |
| Command hangs with no output | It's waiting for a TTY prompt — kill and re-run with `--yes` |

See [references/troubleshooting.md](references/troubleshooting.md) for detailed solutions.

## Reference Guide

Consult these reference files for detailed documentation on specific topics:

| Reference | Topic | Consult When |
|-----------|-------|--------------|
| [references/cli.md](references/cli.md) | Complete CLI command reference | Looking up command flags, options, or less common commands |
| [references/workspace.md](references/workspace.md) | Creating and managing workspaces | Setting up a new project, understanding workspace structure |
| [references/changes.md](references/changes.md) | Authoring database changes | Writing deploy/revert/verify scripts, using `pgpm add` |
| [references/sql-conventions.md](references/sql-conventions.md) | SQL file format and conventions | Writing SQL files, naming conventions, header format |
| [references/dependencies.md](references/dependencies.md) | Managing module dependencies | Within-module or cross-module dependency references |
| [references/deploy-lifecycle.md](references/deploy-lifecycle.md) | Deploy/verify/revert lifecycle | Understanding deployment process, tagging, status checking |
| [references/engines.md](references/engines.md) | Migration backends (`--engine`, drivers) | Deploying into PGlite without a server, configuring `engine`/`engines`, writing a driver plugin |
| [references/docker.md](references/docker.md) | Docker container management | Starting/stopping PostgreSQL, custom container options |
| [references/env.md](references/env.md) | Environment variable management | Loading env vars, profiles, Supabase local development |
| [references/environment-configuration.md](references/environment-configuration.md) | @pgpmjs/env library API | Programmatic configuration, config hierarchy, utility functions |
| [references/extensions.md](references/extensions.md) | PostgreSQL extensions & pgpm modules | Adding extensions, installing @pgpm/* modules, .control requires |
| [references/routing-profile.md](references/routing-profile.md) | Routing profile & module self-description | `extensions.json` provides/consumes, `pgpm.apply.json`, workspace `portability` in `pgpm.json`, routing precedence |
| [references/module-naming.md](references/module-naming.md) | npm names vs control file names | Confused about which identifier to use where |
| [references/plan-format.md](references/plan-format.md) | pgpm.plan file format | Fixing `Invalid line format` errors, editing plan files manually |
| [references/package-separation.md](references/package-separation.md) | Package separation & restructuring | Splitting a database into multiple pgpm packages, cherry-picking objects into a package, change granularity, derived paths and requires |
| [references/publishing.md](references/publishing.md) | Publishing modules to npm | Bundling, versioning with lerna, publishing @pgpm/* packages |
| [references/package-check.md](references/package-check.md) | `pgpm package --check` artifact drift gate | Verifying committed bundle artifacts match `deploy/`, wiring a CI check for changed modules |
| [references/testing.md](references/testing.md) | PostgreSQL integration tests | Setting up pgsql-test, seed adapters, test patterns |
| [references/troubleshooting.md](references/troubleshooting.md) | Common issues and solutions | Debugging connection, deployment, testing, or Docker problems |
| [references/ci-cd.md](references/ci-cd.md) | GitHub Actions CI/CD workflows | Setting up CI for pgpm projects, PostgreSQL service containers, test sharding |

### Project Scaffolding

| Reference | Topic | Consult When |
|-----------|-------|--------------|
| [references/starter-kits.md](references/starter-kits.md) | `pgpm init` templates and scaffolding | Creating new workspaces, modules, or Next.js apps |
| [references/template-authoring.md](references/template-authoring.md) | Custom boilerplate authoring | Creating `.boilerplate.json`, placeholder system, question config |
| [references/nextjs-app.md](references/nextjs-app.md) | Constructive Next.js app boilerplate | Setting up frontend app, project structure, auth flows, SDK generation |

### Database Operations (from constructive-db)

| Reference | Topic | Consult When |
|-----------|-------|--------------|
| [references/pgpm-tables.md](references/pgpm-tables.md) | Table creation rules | Creating tables in metaschema, deterministic ID triggers |
| [references/pgpm-export.md](references/pgpm-export.md) | DB export to pgpm packages | Exporting a live database to pgpm for deterministic migrations |

## Cross-References

Related skills:
- `constructive-starter-kits` — Project scaffolding router (`pgpm init` templates, Next.js boilerplate, template authoring); surfaces the Project Scaffolding references above under starter-kit/boilerplate trigger phrases
- `constructive-testing` — PostgreSQL testing patterns (RLS, seeding, snapshots, JWT context)
- `constructive-setup` — Monorepo setup and local development environment
- `constructive-cli` — Generated CLI commands and scaffolding
