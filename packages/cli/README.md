# LaunchQL CLI

> Build secure, role-aware GraphQL backends powered by PostgreSQL with database-first development

LaunchQL CLI is a comprehensive command-line tool that transforms your PostgreSQL database into a powerful GraphQL API. With automated schema generation, sophisticated migration management, and robust deployment capabilities, you can focus on building great applications instead of boilerplate code.

## ✨ Features

- 🚀 **Database-First Development** - Design your database, get your GraphQL API automatically
- 🔐 **Built-in Security** - Role-based access control and security policies
- 📦 **Module System** - Reusable database modules with dependency management
- 🛠️ **Developer Experience** - Hot-reload development server with GraphiQL explorer
- 🏗️ **Production Ready** - Deployment plans, versioning, and rollback support

## 🚀 Quick Start

### Installation

```bash
npm install -g @launchql/cli
```

### Create Your First Project

```bash
# Initialize a new workspace
lql init --workspace
cd my-project

# Create your first module
lql init

# Deploy to your database
lql deploy --createdb

# Start the development server
lql server
```

Visit `http://localhost:5555` to explore your GraphQL API!

## 📖 Core Concepts

### Workspaces and Modules

- **Workspace**: A collection of related database modules
- **Module**: A self-contained database package with migrations, functions, and types
- **Dependencies**: Modules can depend on other modules, creating reusable building blocks

### Database-First Workflow

1. **Design** your database schema using SQL migrations
2. **Deploy** changes with `lql deploy`
3. **Develop** against the auto-generated GraphQL API
4. **Version** and **package** your modules for distribution

## 🛠️ Commands

### Getting Started

#### `lql init`

Initialize a new LaunchQL workspace or module.

```bash
# Create a new workspace
lql init --workspace

# Create a new module (run inside workspace)
lql init

# Use templates from GitHub repository
lql init --workspace --repo owner/repo
lql init --repo owner/repo --from-branch develop

# Use templates from local path
lql init --workspace --template-path ./custom-templates
lql init --template-path ./custom-templates/module
```

**Options:**

- `--workspace` - Initialize workspace instead of module
- `--repo <repo>` - Use templates from GitHub repository (e.g., `owner/repo`)
- `--template-path <path>` - Use templates from local path
- `--from-branch <branch>` - Specify branch when using `--repo` (default: `main`)

### Development

#### `lql server`

Start the GraphQL development server with hot-reload.

```bash
# Start with defaults (port 5555)
lql server

# Custom port and options
lql server --port 8080 --no-postgis
```

#### `lql explorer`

Launch GraphiQL explorer for your API.

```bash
# Launch explorer
lql explorer

# With custom CORS origin
lql explorer --origin http://localhost:3000
```

### Database Operations

#### `lql deploy`

Deploy your database changes and migrations.

```bash
# Deploy to selected database
lql deploy

# Create database if it doesn't exist
lql deploy --createdb

# Deploy specific package to a tag
lql deploy --package mypackage --to @v1.0.0

# Fast deployment without transactions
lql deploy --fast --no-tx
```

#### `lql verify`

Verify your database state matches expected migrations.

```bash
# Verify current state
lql verify

# Verify specific package
lql verify --package mypackage
```

#### `lql revert`

Safely revert database changes.

```bash
# Revert latest changes
lql revert

# Revert to specific tag
lql revert --to @v1.0.0
```

### Migration Management

#### `lql migrate`

Comprehensive migration management.

```bash
# Initialize migration tracking
lql migrate init

# Check migration status
lql migrate status

# List all changes
lql migrate list

# Show change dependencies
lql migrate deps
```

### Module Management

#### `lql install`

Install LaunchQL modules as dependencies.

```bash
# Install single package
lql install @launchql/auth

# Install multiple packages
lql install @launchql/auth @launchql/utils
```

#### `lql extension`

Interactively manage module dependencies.

```bash
lql extension
```

#### `lql tag`

Version your changes with tags.

```bash
# Tag latest change
lql tag v1.0.0

# Tag with comment
lql tag v1.0.0 --comment "Initial release"

# Tag specific change
lql tag v1.1.0 --package mypackage --changeName my-change
```

### Packaging and Distribution

#### `lql plan`

Generate deployment plans for your modules.

```bash
lql plan
```

#### `lql package`

Package your module for distribution.

```bash
# Package with defaults
lql package

# Package without deployment plan
lql package --no-plan
```

### Utilities

#### `lql export`

Export migrations from existing databases.

```bash
lql export
```

#### `lql kill`

Clean up database connections and optionally drop databases.

```bash
# Kill connections and drop databases
lql kill

# Only kill connections
lql kill --no-drop
```

## 💡 Common Workflows

### Starting a New Project

```bash
# 1. Create workspace
mkdir my-app && cd my-app
lql init --workspace

# 2. Create your first module
lql init

# 3. Add some SQL migrations to sql/ directory
# 4. Deploy to database
lql deploy --createdb

# 5. Start developing
lql server
```

### Using Custom Templates

You can use custom templates from GitHub repositories or local paths:

```bash
# Initialize workspace with templates from GitHub
lql init --workspace --repo owner/repo

# Initialize workspace with templates from local path
lql init --workspace --template-path ./my-custom-templates

# Initialize module with custom templates
lql init --template-path ./my-custom-templates

# Use specific branch from GitHub repository
lql init --workspace --repo owner/repo --from-branch develop
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
lql install

# 3. Deploy to local database
lql deploy --createdb

# 4. Start development server
lql server
```

### Production Deployment

```bash
# 1. Create deployment plan
lql plan

# 2. Package module
lql package

# 3. Deploy to production
lql deploy --package myapp --to @production

# 4. Verify deployment
lql verify --package myapp
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
lql --help

# Command-specific help
lql deploy --help
lql server -h
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
