# **pgpm — a Postgres Package Manager**

**A modern CLI for modular PostgreSQL development.**

`pgpm` is a focused command-line tool for PostgreSQL database migrations and package management. It provides the core functionality for managing database schemas, migrations, and module dependencies.

## ✨ Features

- 📦 **Postgres Module System** — Reusable, composable database packages with dependency management, per-module plans, and versioned releases
- 🔄 **Deterministic Migration Engine** — Version-controlled, plan-driven deployments with rollback support and idempotent execution enforced by dependency and validation safeguards.
- 📊 **Recursive Module Resolution** — Recursively resolves database package dependencies (just like npm) from plan files or SQL headers, producing a reproducible cross-module migration graph.
- 🏷️ **Tag-Aware Versioning** - Deploy to @tags, resolve tags to changes, and reference tags across modules for coordinated releases
- 🐘 **Portable Postgres Development** — Rely on standard SQL migrations for a workflow that runs anywhere Postgres does.
- 🚀 **Turnkey Module-First Workspaces** — `pgpm init` delivers a ready-to-code Postgres workspace with CI/CD, Docker, end-to-end testing, and modern TS tooling.

## 🚀 Quick Start

### Install & Setup

```bash
# Install pgpm globally
npm install -g pgpm

# Start local Postgres (via Docker) and export env vars
pgpm docker start
eval "$(pgpm env)"
```

> **Tip:** Already running Postgres? Skip the Docker step and just export your PG* vars.

---

### Create a Workspace and Install a Package

```bash
# 1. Create a workspace
pgpm init workspace
cd my-app

# 2. Create your first module
pgpm init
cd packages/your-module

# 3. Install a package 
pgpm install @pgpm/faker

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
psql -d mydb1 -c "SELECT faker.city('MI');"
>  Ann Arbor
```

## 🛠️ Commands

### Getting Started

- `pgpm init` - Initialize a new module
- `pgpm init workspace` - Initialize a new workspace

### Development Setup

- `pgpm docker start` - Start PostgreSQL container (via Docker)
- `pgpm docker stop` - Stop PostgreSQL container
- `pgpm env` - Print PostgreSQL environment variables for shell export

### Database Operations

- `pgpm deploy` - Deploy database changes and migrations
- `pgpm verify` - Verify database state matches expected migrations
- `pgpm revert` - Safely revert database changes

### Migration Management

- `pgpm migrate` - Comprehensive migration management
- `pgpm migrate init` - Initialize migration tracking
- `pgpm migrate status` - Check migration status
- `pgpm migrate list` - List all changes
- `pgpm migrate deps` - Show change dependencies

### Module Management

- `pgpm install` - Install database modules as dependencies
- `pgpm extension` - Interactively manage module dependencies
- `pgpm tag` - Version your changes with tags

### Packaging and Distribution

- `pgpm plan` - Generate deployment plans for your modules
- `pgpm package` - Package your module for distribution

### Utilities

- `pgpm add` - Add a new database change
- `pgpm remove` - Remove a database change
- `pgpm export` - Export migrations from existing databases
- `pgpm clear` - Clear database state
- `pgpm kill` - Clean up database connections
- `pgpm analyze` - Analyze database structure
- `pgpm rename` - Rename database changes
- `pgpm admin-users` - Manage admin users
- `pgpm cache clean` - Clear cached template repos used by `pgpm init`
- `pgpm update` - Install the latest pgpm version from npm

## 💡 Common Workflows

### Starting a New Project and Adding a Change

```bash
# 1. Create workspace
pgpm init workspace
cd my-app

# 2. Create your first module
pgpm init
cd packages/new-module

# 3. Add some SQL migrations to sql/ directory
pgpm add some_change

# 4. Deploy to database
pgpm deploy --createdb
```

## 🧰 Templates, Caching, and Updates

- `pgpm init` now scaffolds workspaces/modules from `https://github.com/constructive-io/pgpm-boilerplates.git` using `create-gen-app` with a one-week cache (stored under `~/.pgpm/cache/repos`). Override with `--repo`, `--from-branch`, and `--template-path`, or use a local template path.
- Run `pgpm cache clean` to wipe the cached boilerplates if you need a fresh pull.
- The CLI performs a lightweight npm version check at most once per week (skipped in CI or when `PGPM_SKIP_UPDATE_CHECK` is set). Use `pgpm update` to upgrade to the latest release.

### Working with Existing Projects

```bash
# 1. Navigate to your module
cd packages/your-module

# 2. Install a package 
pgpm install @pgpm/faker

# 3. Deploy all installed modules
pgpm deploy --createdb --database mydb1
psql -d mydb1 -c "SELECT faker.city('MI');"
>  Ann Arbor
```

### Testing a pgpm module in a workspace

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Enter the packages/<yourmodule>
cd packages/yourmodule

# 3. Test the module in watch mode
pnpm test:watch
```

### Database Operations

#### `pgpm deploy`

Deploy your database changes and migrations.

```bash
# Deploy to selected database
pgpm deploy

# Create database if it doesn't exist
pgpm deploy --createdb

# Deploy specific package to a tag
pgpm deploy --package mypackage --to @v1.0.0

# Fast deployment without transactions
pgpm deploy --fast --no-tx
```

#### `pgpm verify`

Verify your database state matches expected migrations.

```bash
# Verify current state
pgpm verify

# Verify specific package
pgpm verify --package mypackage
```

#### `pgpm revert`

Safely revert database changes.

```bash
# Revert latest changes
pgpm revert

# Revert to specific tag
pgpm revert --to @v1.0.0
```

### Migration Management

#### `pgpm migrate`

Comprehensive migration management.

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

#### `pgpm install`

Install pgpm modules as dependencies.

```bash
# Install single package
pgpm install @pgpm/base32

# Install multiple packages
pgpm install @pgpm/base32 @pgpm/faker
```

#### `pgpm extension`

Interactively manage module dependencies.

```bash
pgpm extension
```

#### `pgpm tag`

Version your changes with tags.

```bash
# Tag latest change
pgpm tag v1.0.0

# Tag with comment
pgpm tag v1.0.0 --comment "Initial release"

# Tag specific change
pgpm tag v1.1.0 --package mypackage --changeName my-change
```

### Packaging and Distribution

#### `pgpm plan`

Generate deployment plans for your modules.

```bash
pgpm plan
```

#### `pgpm package`

Package your module for distribution.

```bash
# Package with defaults
pgpm package

# Package without deployment plan
pgpm package --no-plan
```

### Utilities

#### `pgpm export`

Export migrations from existing databases.

```bash
pgpm export
```

#### `pgpm kill`

Clean up database connections and optionally drop databases.

```bash
# Kill connections and drop databases
pgpm kill

# Only kill connections
pgpm kill --no-drop
```

## ⚙️ Configuration

### Environment Variables

`pgpm` uses standard PostgreSQL environment variables (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`). 

**Quick setup** (recommended):
```bash
eval "$(pgpm env)"
```

**Manual setup** (if you prefer):
```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=myapp
export PGUSER=postgres
export PGPASSWORD=password
```

**Supabase local development:**
```bash
eval "$(pgpm env --supabase)"
```

## Getting Help

### Command Help

```bash
# Global help
pgpm --help

# Command-specific help
pgpm deploy --help
pgpm tag -h
```

### Common Options

Most commands support these global options:

- `--help, -h` - Show help information
- `--version, -v` - Show version information
- `--cwd <dir>` - Set working directory
