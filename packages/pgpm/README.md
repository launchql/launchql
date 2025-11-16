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

### Create Your First Project

```bash
# 1. Create a workspace
pgpm init --workspace
cd my-app

# 2. Create your first module
pgpm init

# 3. Add a database change
pgpm add some_change

# 4. Deploy everything
pgpm deploy --createdb
```

## 🛠️ Commands

### Getting Started

- `pgpm init` - Initialize a new module
- `pgpm init --workspace` - Initialize a new workspace

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

## 💡 Common Workflows

### Starting a New Project

```bash
# 1. Create workspace
pgpm init --workspace
cd my-app

# 2. Create your first module
pgpm init

# 3. Add some SQL migrations to sql/ directory
pgpm add some_change

# 4. Deploy to database
pgpm deploy --createdb
```

### Working with Existing Projects

```bash
# 1. Clone and enter project
git clone <repo> && cd <project>

# 2. Install dependencies
pgpm install

# 3. Deploy to local database
pgpm deploy --createdb
```

### Testing a pgpm module in a workspace

```bash
# 1. Install dependencies
pgpm install

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

## 💡 Common Workflows

### Starting a New Project

```bash
# 1. Create workspace
mkdir my-app && cd my-app
pgpm init --workspace

# 2. Create your first module
pgpm init

# 3. Add some SQL migrations to sql/ directory
# 4. Deploy to database
pgpm deploy --createdb

# 5. Start developing
pgpm server
```

### Using Custom Templates

You can use custom templates from GitHub repositories or local paths:

```bash
# Initialize workspace with templates from GitHub
pgpm init --workspace --repo owner/repo

# Initialize workspace with templates from local path
pgpm init --workspace --template-path ./my-custom-templates

# Initialize module with custom templates
pgpm init --template-path ./my-custom-templates

# Use specific branch from GitHub repository
pgpm init --workspace --repo owner/repo --from-branch develop
```

**Template Structure:**
Custom templates should follow the same structure as the default templates:

- For workspace: `boilerplates/workspace/` directory
- For module: `boilerplates/module/` directory
- Or provide direct path to `workspace/` or `module/` directory

### Working with Existing Projects

```bash
# 1. Clone and enter project
git clone <repo> && cd <project>

# 2. Install dependencies
pgpm install

# 3. Deploy to local database
pgpm deploy --createdb

# 4. Start development server
pgpm server
```

### Production Deployment

```bash
# 1. Create deployment plan
pgpm plan

# 2. Package module
pgpm package

# 3. Deploy to production
pgpm deploy --package myapp --to @production

# 4. Verify deployment
pgpm verify --package myapp
```

## ⚙️ Configuration

### Environment Variables

LaunchQL respects standard PostgreSQL environment variables:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=myapp
export PGUSER=postgres
export PGPASSWORD=password
```

## 🆘 Getting Help

### Command Help

```bash
# Global help
pgpm --help

# Command-specific help
pgpm deploy --help
pgpm server -h
```

### Common Options

Most commands support these global options:

- `--help, -h` - Show help information
- `--version, -v` - Show version information
- `--cwd <dir>` - Set working directory

## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/supabase-test](https://github.com/launchql/launchql/tree/main/packages/supabase-test): **🧪 Supabase-native test harness** preconfigured for the local Supabase stack—per-test rollbacks, JWT/role context helpers, and CI/GitHub Actions ready.
* [launchql/graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): **🔐 Authentication mocking** for Graphile-focused test helpers and emulating row-level security contexts.
* [launchql/pg-query-context](https://github.com/launchql/launchql/tree/main/packages/pg-query-context): **🔒 Session context injection** to add session-local context (e.g., `SET LOCAL`) into queries—ideal for setting `role`, `jwt.claims`, and other session settings.

### 🧠 Parsing & AST

* [launchql/pgsql-parser](https://github.com/launchql/pgsql-parser): **🔄 SQL conversion engine** that interprets and converts PostgreSQL syntax.
* [launchql/libpg-query-node](https://github.com/launchql/libpg-query-node): **🌉 Node.js bindings** for `libpg_query`, converting SQL into parse trees.
* [launchql/pg-proto-parser](https://github.com/launchql/pg-proto-parser): **📦 Protobuf parser** for parsing PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.
* [@pgsql/enums](https://github.com/launchql/pgsql-parser/tree/main/packages/enums): **🏷️ TypeScript enums** for PostgreSQL AST for safe and ergonomic parsing logic.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): **📝 Type definitions** for PostgreSQL AST nodes in TypeScript.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): **🛠️ AST utilities** for constructing and transforming PostgreSQL syntax trees.
* [launchql/pg-ast](https://github.com/launchql/launchql/tree/main/packages/pg-ast): **🔍 Low-level AST tools** and transformations for Postgres query structures.

### 🚀 API & Dev Tools

* [launchql/server](https://github.com/launchql/launchql/tree/main/packages/server): **⚡ Express-based API server** powered by PostGraphile to expose a secure, scalable GraphQL API over your Postgres database.
* [launchql/explorer](https://github.com/launchql/launchql/tree/main/packages/explorer): **🔎 Visual API explorer** with GraphiQL for browsing across all databases and schemas—useful for debugging, documentation, and API prototyping.

### 🔁 Streaming & Uploads

* [launchql/s3-streamer](https://github.com/launchql/launchql/tree/main/packages/s3-streamer): **📤 Direct S3 streaming** for large files with support for metadata injection and content validation.
* [launchql/etag-hash](https://github.com/launchql/launchql/tree/main/packages/etag-hash): **🏷️ S3-compatible ETags** created by streaming and hashing file uploads in chunks.
* [launchql/etag-stream](https://github.com/launchql/launchql/tree/main/packages/etag-stream): **🔄 ETag computation** via Node stream transformer during upload or transfer.
* [launchql/uuid-hash](https://github.com/launchql/launchql/tree/main/packages/uuid-hash): **🆔 Deterministic UUIDs** generated from hashed content, great for deduplication and asset referencing.
* [launchql/uuid-stream](https://github.com/launchql/launchql/tree/main/packages/uuid-stream): **🌊 Streaming UUID generation** based on piped file content—ideal for upload pipelines.
* [launchql/upload-names](https://github.com/launchql/launchql/tree/main/packages/upload-names): **📂 Collision-resistant filenames** utility for structured and unique file names for uploads.

### 🧰 CLI & Codegen

* [pgpm](https://github.com/launchql/launchql/tree/main/packages/pgpm): **🖥️ PostgreSQL Package Manager** for modular Postgres development. Works with database workspaces, scaffolding, migrations, seeding, and installing database packages.
* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
