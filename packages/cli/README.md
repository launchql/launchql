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
lql init workspace
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
lql init workspace

# Create a new module (run inside workspace)
lql init

# Use templates from GitHub repository (defaults to launchql/pgpm-boilerplates.git)
lql init workspace --repo owner/repo
lql init --repo owner/repo --from-branch develop

# Use templates from custom paths
lql init workspace --template-path ./custom-templates
lql init --template-path ./custom-templates/module
```

**Options:**

- `--repo <repo>` - Template repo (default: `https://github.com/constructive-io/pgpm-boilerplates.git`)
- `--template-path <path>` - Template sub-path (defaults to `workspace`/`module`) or local path override
- `--from-branch <branch>` - Branch/tag when cloning the template repo

Templates are cached for one week under the `pgpm` tool namespace. Run `lql cache clean` if you need to refresh the boilerplates.

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

## 🔄 Updates

The CLI performs a lightweight npm version check at most once per week (skipped in CI or when `PGPM_SKIP_UPDATE_CHECK` is set). Use `lql update` to install the latest release (installs `pgpm` by default; pass `--package @launchql/cli` to target the CLI package).

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
lql init workspace

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
lql init workspace --repo owner/repo

# Initialize workspace with templates from local path
lql init workspace --template-path ./my-custom-templates

# Initialize module with custom templates
lql init --template-path ./my-custom-templates

# Use specific branch from GitHub repository
lql init workspace --repo owner/repo --from-branch develop
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

### Get Graphql Schema

Fetch and output your GraphQL schema in SDL.

- Option 1 – Programmatic builder (from database schemas):
  - Write to file:
    - `lql get-graphql-schema --database launchql --schemas myapp,public --out ./schema.graphql`
  - Print to stdout:
    - `lql get-graphql-schema --database launchql --schemas myapp,public`

- Option 2 – Fetch from running server (via endpoint introspection):
  - Write to file:
    - `lql get-graphql-schema --endpoint http://localhost:3000/graphql --headerHost meta8.localhost --out ./schema.graphql`
  - Print to stdout:
    - `lql get-graphql-schema --endpoint http://localhost:3000/graphql --headerHost meta8.localhost`

Options:
- `--database <name>` (Option 1)
- `--schemas <list>` (Option 1; comma-separated)
- `--endpoint <url>` (Option 2)
- `--headerHost <hostname>` (Option 2; optional custom HTTP Host header for vhost-based local setups)
- `--auth <token>` (Option 2; optional; sets Authorization header)
- `--header <name: value>` (Option 2; optional; repeatable; adds request headers, last value wins on duplicates)
- `--out <path>` (optional; if omitted, prints to stdout)

Notes:
- If your local dev server routes by hostname (e.g., `meta8.localhost`), but is reachable at `http://localhost:<port>`, use:
  - `lql get-graphql-schema --endpoint http://localhost:3000/graphql --headerHost meta8.localhost`
- You can repeat `--header` to add multiple headers, e.g.: `--header 'X-Mode: fast' --header 'Authorization: Bearer abc123'`

Tip:
- For Option 1, include only the schemas you need (e.g., `myapp,public`) to avoid type naming conflicts when multiple schemas contain similarly named tables.


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
### Codegen

Generate types, operations, and SDK from a schema or endpoint.

```bash
# From SDL file
lql codegen --schema ./schema.graphql --out ./codegen

# From endpoint with Host override
lql codegen --endpoint http://localhost:3000/graphql --headerHost meta8.localhost --out ./codegen
```

Options:
- `--schema <path>` or `--endpoint <url>`
- `--out <dir>` output root (default: `packages/launchql-gen/dist`)
- `--format <gql|ts>` documents format
- `--convention <dashed|underscore|camelcase|camelUpper>` filenames
- `--headerHost <host>` optional HTTP Host header for endpoint requests
- `--auth <token>` Authorization header value (e.g., `Bearer 123`)
- `--header "Name: Value"` repeatable headers
- `--emitTypes <bool>` `--emitOperations <bool>` `--emitSdk <bool>` `--emitReactQuery <bool>`
- `--config ./config.json` Use customized config file 


Config file (JSON/YAML):

```bash
# Use a JSON config to override defaults
lql codegen --config ./my-options.json
```

Example `my-options.json`:

```json
{
  "input": {
    "schema": "./schema.graphql",
    "headers": { "Host": "meta8.localhost" }
  },
  "output": {
    "root": "packages/launchql-gen/dist/codegen-config",
    "reactQueryFile": "react-query.ts"
  },
  "documents": {
    "format": "gql",
    "convention": "dashed",
    "excludePatterns": [".*Module$", ".*By.+And.+$"]
  },
  "features": {
    "emitTypes": true,
    "emitOperations": true,
    "emitSdk": true,
    "emitReactQuery": true
  },
  "reactQuery": {
    "fetcher": "graphql-request"
  }
}
```
