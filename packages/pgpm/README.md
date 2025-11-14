# pgpm

PostgreSQL Package Manager - Database migration and package management CLI for LaunchQL.

## Overview

`pgpm` is a focused CLI tool for managing PostgreSQL database migrations and packages. It provides core functionality for database schema version control, migration tracking, and deployment automation without the server/explorer components.

## Installation

```bash
npm install -g pgpm
```

## Features

- **Database Migration Management**: Deploy, revert, and verify database changes
- **Package Management**: Initialize, install, and manage LaunchQL modules
- **Version Control**: Tag changes and track deployment history
- **Dependency Resolution**: Automatic dependency resolution for database changes
- **User Management**: Bootstrap and manage database users and roles

## Commands

### Core Database Operations

- `pgpm add` - Add database changes to plans and create SQL files
- `pgpm deploy` - Deploy database changes and migrations
- `pgpm verify` - Verify database state and migrations
- `pgpm revert` - Revert database changes and migrations

### Project Management

- `pgpm init` - Initialize LaunchQL workspace or module
- `pgpm extension` - Manage module dependencies
- `pgpm plan` - Generate module deployment plans
- `pgpm package` - Package module for distribution

### Database Administration

- `pgpm install` - Install LaunchQL modules
- `pgpm tag` - Add tags to changes for versioning
- `pgpm clear` - Clear all changes from the plan
- `pgpm admin-users` - Manage database users and roles

### Migration Tools

- `pgpm migrate init` - Initialize migration tracking
- `pgpm migrate status` - Show migration status
- `pgpm migrate list` - List all changes
- `pgpm migrate deps` - Show change dependencies

### Other Commands

- `pgpm export` - Export database migrations from existing databases
- `pgpm analyze` - Analyze module dependencies
- `pgpm rename` - Rename changes in the plan
- `pgpm remove` - Remove changes from the plan

## Usage Examples

```bash
# Initialize a new workspace
pgpm init --workspace

# Add a new database change
pgpm add schema/tables/users

# Deploy changes to database
pgpm deploy

# Tag a version
pgpm tag v1.0.0

# Show migration status
pgpm migrate status
```

## Relationship to @launchql/cli

`pgpm` is a subset of the full `@launchql/cli` (lql) package. While `lql` includes server and explorer functionality for running GraphQL APIs, `pgpm` focuses exclusively on package and deployment operations.

If you need the full LaunchQL development experience including the GraphQL server and explorer, use `@launchql/cli` instead.

## License

SEE LICENSE IN LICENSE

## Repository

https://github.com/launchql/launchql
