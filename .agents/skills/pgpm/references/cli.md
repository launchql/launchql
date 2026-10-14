
# pgpm CLI Reference

Complete reference for the pgpm (PostgreSQL Package Manager) command-line interface. pgpm provides deterministic, plan-driven database migrations with dependency management.

## When to Apply

Use this skill when:
- Deploying database changes
- Managing database migrations
- Installing or upgrading pgpm modules
- Testing pgpm packages in CI/CD
- Setting up local PostgreSQL development

## Quick Start

```bash
# Install pgpm globally
npm install -g pgpm

# Ensure PostgreSQL is running and env vars are loaded
# See references/docker.md and references/env.md for setup

# Create workspace and module
pgpm init workspace
cd my-app
pgpm init
cd packages/your-module

# Deploy to database
pgpm deploy --createdb --database mydb
```

## Core Commands

### Database Operations

**pgpm deploy** — Deploy database changes and migrations

```bash
# Deploy to current database (from PGDATABASE)
pgpm deploy

# Create database if missing
pgpm deploy --createdb

# Deploy to specific database
pgpm deploy --database mydb

# Deploy specific package to a tag
pgpm deploy --package mypackage --to @v1.0.0
```

> **⚠️ WARNING: `--fast` flag (use with extreme caution)**
>
> ```bash
> pgpm deploy --fast --no-tx
> ```
>
> `--fast` is **NOT idempotent** — it is meant to be run **once only** for
> quick testing on a fresh database. It skips dependency-tracking checks, so
> if your package shares dependencies with anything already deployed (e.g.
> `pgpm-verify`), it will blindly attempt to re-deploy them, causing errors.
>
> **Only use `--fast` on a throwaway database that has nothing else deployed.**
> For all other cases, use the standard `pgpm deploy` command.

**pgpm verify** — Verify database state matches expected migrations

```bash
pgpm verify
pgpm verify --package mypackage
```

**pgpm revert** — Safely revert database changes

```bash
pgpm revert
pgpm revert --to @v1.0.0
```

### Migration Management

**pgpm migrate** — Comprehensive migration management

```bash
# Initialize migration tracking
pgpm migrate init

# Check migration status
pgpm migrate status

# List all changes
pgpm migrate list

# Show change dependencies
pgpm migrate deps
```

### Module Management

**pgpm install** — Install pgpm modules as dependencies

```bash
# Install single package
pgpm install @pgpm/faker

# Install multiple packages
pgpm install @pgpm/base32 @pgpm/faker
```

**pgpm upgrade-modules** — Upgrade installed modules to latest versions

```bash
# Interactive selection
pgpm upgrade-modules

# Upgrade all without prompting
pgpm upgrade-modules --all

# Preview without changes
pgpm upgrade-modules --dry-run

# Upgrade specific modules
pgpm upgrade-modules --modules @pgpm/base32,@pgpm/faker

# Upgrade across entire workspace
pgpm upgrade-modules --workspace --all
```

**pgpm extension** — Manage a module's dependencies (the `.control` `requires` line)

```bash
# Non-interactive (edits only the requires line; preserves other .control fields)
pgpm extension --add pgcrypto,citext   # add one or more
pgpm extension --remove pgcrypto       # remove one or more
pgpm extension --set pgpm-base32       # replace the whole set

# Interactive picker (no flags)
pgpm extension
```

### Workspace Initialization

**pgpm init** — Initialize new module or workspace

```bash
# Create new workspace
pgpm init workspace

# Create new module (inside workspace) — scaffolds with NO extensions by default
pgpm init

# Pre-select extensions non-interactively, or open the interactive picker
pgpm init --extensions plpgsql,pgcrypto
pgpm init --with-extensions

# Use full template path (recommended)
pgpm init --template pnpm/module
pgpm init -t pgpm/workspace

# Create workspace + module in one command
pgpm init -w
pgpm init --template pnpm/module -w

# Use custom template repository
pgpm init --repo https://github.com/org/templates.git --template my-template

# Refresh a stale cached template repository
pgpm init --refresh
```

Non-interactive init requires every question to be answered by flags; see
[starter-kits.md](starter-kits.md)'s non-interactive flag table for
`--name --fullName --email --username --repoName --license`, plus module
`--moduleName --packageIdentifier --moduleDesc --access`.

When a module is created, `pgpm init` also adds its workspace-relative path to
each `jobs.<job>.strategy.matrix.package` list in the workspace's
`.github/workflows/*.yml` (sorted, in place). The workflow is parsed with `yaml`
to address that path, and only the matrix list's own byte range is rewritten, so
comments and formatting survive where they can be preserved. A matrix whose
comments cannot be preserved is left untouched. The list stays a plain YAML
array you can hand-edit; workflows without such a matrix — or whose matrix isn't
a plain list of strings — or that can't be read or written — are left alone
silently; the update is best-effort and never warns.

### Workspace Inspection

**pgpm ls** — List the pgpm modules in the current workspace

```bash
# Human-readable listing
pgpm ls

# Names or workspace-relative paths, one per line
pgpm ls --names
pgpm ls --paths

# JSON output for scripts and CI
pgpm ls --json
pgpm ls --paths --json
```

For CI package matrices, use the workspace-relative paths directly:

```yaml
- id: list
  run: echo "packages=$(pnpm exec pgpm ls --paths --json)" >> "$GITHUB_OUTPUT"
```

### Change Management

**pgpm add** — Add a new database change

```bash
pgpm add my_change
```

This creates three files in `sql/`:
- `deploy/my_change.sql` — Deploy script
- `revert/my_change.sql` — Revert script
- `verify/my_change.sql` — Verify script

**pgpm remove** — Remove a database change

```bash
pgpm remove my_change
```

**pgpm rename** — Rename a database change

```bash
pgpm rename old_name new_name
```

### Tagging and Versioning

**pgpm tag** — Version your changes with tags

```bash
# Tag latest change
pgpm tag v1.0.0

# Tag with comment
pgpm tag v1.0.0 --comment "Initial release"

# Tag specific change
pgpm tag v1.1.0 --package mypackage --changeName my-change
```

### Packaging and Distribution

**pgpm plan** — Generate deployment plans

```bash
pgpm plan
```

**pgpm package** — Package module for distribution

Emits two artifacts into `sql/`: the consolidated `sql/<name>--<version>.sql`
and the content-addressed `sql/<name>--<version>.bundle.tar.gz` (consumed by
`pgpm deploy --fast`/`--bundled`).

```bash
pgpm package
pgpm package --no-plan
```

**pgpm package --check** — Verify committed artifacts are in sync (no writes, no DB)

Fails fast when a module's committed `sql/<name>--<version>.bundle.tar.gz` no
longer matches its `deploy/`. By default only the modules that changed (via
git) are checked. See `references/package-check.md`.

```bash
pgpm package --check                      # changed modules (auto base)
pgpm package --check --since origin/main  # diff HEAD vs a branch/ref/tag
pgpm package --check --all                # every workspace module
pgpm package --check --no-fail-fast       # list all drift instead of stopping
```

### Testing

**pgpm test-packages** — Run integration tests on the workspace's modules

Defaults to the minimal covering set: the modules nothing else in the workspace
requires. Testing one deploys its whole dependency closure, so every module is
still exercised — once per covering module rather than once per module.
`--force-all` restores a database per module, which is the only way to assert a
module's own `requires` is complete rather than satisfied by a sibling.

```bash
# Deploy only, minimal covering set
pgpm test-packages

# Every module in its own database
pgpm test-packages --force-all

# Full deploy/verify/revert/deploy cycle
pgpm test-packages --full-cycle

# Continue after failures
pgpm test-packages --continue-on-fail

# Exclude specific modules
pgpm test-packages --exclude legacy-module

# Combine options
pgpm test-packages --full-cycle --continue-on-fail --exclude broken-module
```

### Docker and Environment

**pgpm docker** — Manage local PostgreSQL container

```bash
pgpm docker start
pgpm docker stop
```

**pgpm env** — Print PostgreSQL environment variables

```bash
# Standard PostgreSQL
eval "$(pgpm env)"

# Supabase local development
eval "$(pgpm env --supabase)"
```

### Admin Users

**pgpm admin-users** — Manage database admin users

```bash
# Bootstrap admin users from pgpm.json roles config
pgpm admin-users bootstrap

# Add specific user
pgpm admin-users add --username myuser --password "$PGPASSWORD" --yes

# Opt-in RLS bypass for a platform service login (never for a request role)
pgpm admin-users add --username platform_service --password "$PGPASSWORD" --bypassrls --yes

# Remove user
pgpm admin-users remove myuser
```

User provisioning reconciles LOGIN, INHERIT, NOSUPERUSER, NOCREATEDB,
NOCREATEROLE, NOREPLICATION and the supplied password on every run. RLS bypass
is off unless `--bypassrls` is passed. Platform components use one such login
via `PGUSER`/`PGPASSWORD`; requests still switch to `authenticated`/`anonymous`,
whose current-role attributes enforce RLS. No role environment variable is needed.

### Utilities

**pgpm dump** — Dump database to SQL file

```bash
# Dump to timestamped file
pgpm dump --database mydb

# Dump to specific file
pgpm dump --database mydb --out ./backup.sql

# Dump with pruning (for test fixtures)
pgpm dump --database mydb --database-id <uuid>
```

**pgpm kill** — Clean up database connections

```bash
# Kill connections and drop databases
pgpm kill

# Only kill connections
pgpm kill --no-drop
```

**pgpm clear** — Clear database state

```bash
pgpm clear
```

**pgpm export** — Export migrations from existing databases

```bash
pgpm export
```

**pgpm analyze** — Analyze database structure

```bash
pgpm analyze
```

### Cache and Updates

**pgpm cache clean** — Clear cached template repos

```bash
pgpm cache clean
```

**pgpm update** — Install latest pgpm version

```bash
pgpm update
```

## Environment Variables

pgpm uses standard PostgreSQL environment variables:

| Variable | Description |
|----------|-------------|
| `PGHOST` | Database host |
| `PGPORT` | Database port |
| `PGDATABASE` | Database name |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |

Quick setup with `eval "$(pgpm env)"` or manual export.

## Global Options

Most commands support:

| Option | Description |
|--------|-------------|
| `--help, -h` | Show help |
| `--version, -v` | Show version |
| `--cwd <dir>` | Set working directory |

## Common Workflows

### Starting a New Project

```bash
pgpm init workspace
cd my-app
pgpm init
cd packages/new-module
pgpm add some_change
# Edit sql/deploy/some_change.sql
pgpm deploy --createdb
```

### Installing and Using a Module

```bash
cd packages/your-module
pgpm install @pgpm/faker
pgpm deploy --createdb --database mydb
psql -d mydb -c "SELECT faker.city('MI');"
```

### CI/CD Testing

```bash
# Bootstrap admin users
pgpm admin-users bootstrap

# Test all packages
pgpm test-packages --full-cycle --continue-on-fail
```

## References

- Related reference: `references/workspace.md` for workspace structure
- Related reference: `references/changes.md` for authoring changes
- Related reference: `references/dependencies.md` for module dependencies
- Related skill: `github-workflows-pgpm` for CI/CD workflows
