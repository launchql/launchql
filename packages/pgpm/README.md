# pgpm

> PostgreSQL Package Manager - Database migration and package management CLI

`pgpm` is a focused command-line tool for PostgreSQL database migrations and package management. It provides the core functionality for managing database schemas, migrations, and module dependencies without the overhead of server or explorer components.

## ✨ Features

- 🚀 **Rapid Development Setup** - Initialize production-ready workspaces with boilerplates including Docker Compose, GitHub Actions CI/CD, e2e testing framework (pgsql-test), and complete TypeScript/ESLint configuration
- 🏗️ **Module-Native PostgreSQL** - Build your database as composable packages in a workspace monorepo, each with its own plan, dependencies, and version tags
- 📊 **Dependency-Graph Migrations** - Automatic dependency resolution from plan files or SQL headers, with cross-module references and circular dependency detection
- 🏷️ **Tag-Aware Versioning** - Deploy to @tags, resolve tags to changes, and reference tags across modules for coordinated releases
- ✅ **Reproducible Deployments** - Script hashing (content or AST-based), event log that survives rollbacks, and verify/revert commands
- ⚡ **Flexible Deployment Modes** - Transactional or non-transactional, fast bundled execution, log-only dry runs, and plan-driven or SQL-header-driven resolution

## 🚀 Quick Start

### Installation

```bash
npm install -g pgpm
```

### Create Your First Project

```bash
# Initialize a new workspace
pgpm init --workspace
cd my-project

# Create your first module
pgpm init

# Deploy to your database
pgpm deploy --createdb
```

## 🎯 Rapid Development Environment

`pgpm init` provides production-ready boilerplates that set up a complete development environment in seconds—like `npm init` but more polished and opinionated for PostgreSQL development.

### What You Get with `pgpm init --workspace`

**Infrastructure:**
- 🐳 **Docker Compose** - Pre-configured PostgreSQL (pyramation/pgvector) and MinIO services
- 📦 **pnpm Workspace** - Monorepo setup with workspace configuration
- 🔧 **TypeScript Configuration** - Dual-build setup (CommonJS + ESM)

**Testing & Quality:**
- 🧪 **E2E Testing Framework** - Pre-configured `pgsql-test` with transaction-based test isolation
- ✅ **GitHub Actions CI/CD** - Complete workflow with PostgreSQL and MinIO services
- 🎨 **ESLint & Prettier** - Code quality and formatting pre-configured
- 📝 **Jest Configuration** - Ready-to-use test runner with TypeScript support

**Development Tools:**
- 🚀 **VS Code Settings** - Optimized editor configuration
- 📋 **Makefile** - Common development tasks automated
- 📄 **README Template** - Documentation structure with LaunchQL branding

### What You Get with `pgpm init` (Module)

**Module Structure:**
- 📦 **Package Configuration** - Complete package.json with test scripts
- 🧪 **Test Template** - Working test file using `pgsql-test` with beforeEach/afterEach hooks
- 🎯 **Jest Setup** - Module-specific test configuration
- 📝 **README Template** - Module documentation structure

### Example Test Setup (Included)

The boilerplate includes a complete e2e test setup using `pgsql-test`:

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach(); // Transaction-based isolation
});

afterEach(async () => {
  await db.afterEach(); // Automatic rollback
});
```

This setup provides:
- **Isolated test databases** - Each test runs in its own transaction
- **Automatic rollback** - No test pollution between runs
- **Fast execution** - No need to recreate databases between tests
- **RLS simulation** - Test row-level security policies

### Custom Templates

You can use custom templates from GitHub repositories or local paths:

```bash
# From GitHub repository
pgpm init --workspace --repo owner/repo

# From local path
pgpm init --workspace --template-path ./my-templates

# Specific branch
pgpm init --workspace --repo owner/repo --from-branch develop
```

## 🛠️ Commands

### Getting Started

- `pgpm init` - Initialize a new module
- `pgpm init --workspace` - Initialize a new workspace

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

Install database modules as dependencies. Fetches packages from npm and extracts them to your workspace's `extensions/` directory, then updates your module's `.control` file with the dependencies.

```bash
# Install single package from npm
pgpm install @launchql/auth

# Install multiple packages
pgpm install @launchql/auth @launchql/utils
```

**Note:** This installs npm packages that contain database modules and adds them to your local workspace, not a remote registry.

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

## 🔍 How pgpm Differs from Other Migration Tools

### vs Flyway / Liquibase

**Workspace-First Architecture:** pgpm organizes multiple database modules in a single workspace with automatic discovery, while Flyway and Liquibase typically manage a single migration chain per project.

**Cross-Module Dependencies:** pgpm allows modules to reference changes from other modules (e.g., `auth:users` or `auth:@v1.0.0`), enabling true modular database development. Traditional tools require manual coordination between projects.

**Dependency Graph Resolution:** pgpm builds a dependency graph from plan files or SQL headers and performs topological sorting to determine deployment order. Flyway and Liquibase rely on sequential numbering or timestamps.

### vs Sqitch

**Tag-Aware System:** While Sqitch has tags, pgpm makes them first-class with cross-module tag references and multiple resolution modes (preserve, resolve, internal).

**Module Packaging:** pgpm modules can be packaged and distributed via npm, then installed into other workspaces. Sqitch doesn't have a built-in packaging system.

**Flexible Resolution:** pgpm supports both plan-driven (use plan file order) and SQL-header-driven (parse `-- requires:` comments) dependency resolution, while Sqitch primarily uses plan files.

**Script Hashing:** pgpm offers both content-based and AST-based hashing for detecting changes, while Sqitch uses content hashing only.

### Key Advantages

- **Rapid development setup** with production-ready boilerplates (Docker, CI/CD, e2e testing)
- **Module-native development** with workspace monorepo support
- **Graph-resolved migrations** with automatic dependency ordering
- **Cross-module references** for coordinated multi-module deployments
- **Tag-aware versioning** with cross-module tag resolution
- **Reproducible deployments** with script hashing and event logging
- **Flexible deployment modes** (transactional, fast, log-only, plan-driven)

## 🆘 Getting Help

### Command Help

```bash
# Global help
pgpm --help

# Command-specific help
pgpm deploy --help
pgpm verify --help
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
