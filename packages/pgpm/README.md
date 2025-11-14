# pgpm

> PostgreSQL Package Manager - Database migration and package management CLI

`pgpm` is a focused command-line tool for PostgreSQL database migrations and package management. It provides the core functionality for managing database schemas, migrations, and module dependencies without the overhead of server or explorer components.

## ✨ Features

- 📦 **Module System** - Reusable database modules with dependency management
- 🔄 **Smart Migrations** - Automated migration generation and deployment
- 🏗️ **Production Ready** - Deployment plans, versioning, and rollback support
- 🚀 **Database-First Development** - Design your database with SQL migrations

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

## 🛠️ Commands

### Getting Started

- `pgpm init` - Initialize a new workspace or module
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
mkdir my-app && cd my-app
pgpm init --workspace

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

pgpm respects standard PostgreSQL environment variables:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=myapp
export PGUSER=postgres
export PGPASSWORD=password
```

## 🆘 Getting Help

```bash
# Global help
pgpm --help

# Command-specific help
pgpm deploy --help
```

## Related Tools

For a full-featured CLI with GraphQL server and explorer, see [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli).

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
