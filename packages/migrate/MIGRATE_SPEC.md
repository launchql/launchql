# @launchql/migrate: Simplified Database Change Management System

## Overview

@launchql/migrate is a simplified database schema change management system inspired by Sqitch, designed specifically for PostgreSQL. It uses the same file format as Sqitch but eliminates the Perl dependency by leveraging TypeScript and PostgreSQL stored procedures. It tracks database changes, manages dependencies, and enables safe deployment and rollback of schema modifications.

### Core Philosophy

- **Just track what's deployed** - No excessive metadata like committer info or tags
- **Simple dependency management** - Only track what's required for safe deployment
- **Minimal tables** - Only what's needed for core functionality (4 tables)
- **No bloat** - If Git can track it, we don't duplicate it in the database
- **Sqitch-compatible** - Uses the same plan file format, but implemented in TypeScript

### Key Concepts

1. **Projects**: Logical groupings of related database changes (e.g., 'user-service', 'blog-service')
2. **Changes**: Individual schema modifications with unique names within a project
3. **Dependencies**: Requirements that must be deployed before a change can be applied
4. **Events**: Minimal audit log of deployment actions (deploy, revert, fail)

## Database Schema

The system uses a dedicated schema (`launchql_migrate`) with just 4 tables:

```sql
-- Create schema
CREATE SCHEMA IF NOT EXISTS launchql_migrate;

-- 1. Projects (minimal - just name and timestamp)
CREATE TABLE launchql_migrate.projects (
    project         TEXT        PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Deployed changes (what's currently deployed)
CREATE TABLE launchql_migrate.changes (
    change_id       TEXT        PRIMARY KEY,
    change_name     TEXT        NOT NULL,
    project         TEXT        NOT NULL REFERENCES launchql_migrate.projects(project),
    script_hash     TEXT        NOT NULL,
    deployed_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(project, change_name),
    UNIQUE(project, script_hash)
);

-- 3. Dependencies (what depends on what)
CREATE TABLE launchql_migrate.dependencies (
    change_id       TEXT        NOT NULL REFERENCES launchql_migrate.changes(change_id) ON DELETE CASCADE,
    requires        TEXT        NOT NULL,
    PRIMARY KEY (change_id, requires)
);

-- 4. Event log (minimal history for rollback)
CREATE TABLE launchql_migrate.events (
    event_id        SERIAL      PRIMARY KEY,
    event_type      TEXT        NOT NULL CHECK (event_type IN ('deploy', 'revert', 'fail')),
    change_name     TEXT        NOT NULL,
    project         TEXT        NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
```

## How It Works

### Deployment Flow

1. **Call deploy** with project, change name, dependencies, and SQL
2. **Validate preconditions**:
   - Project is registered (auto-creates if needed)
   - Change isn't already deployed
   - All required dependencies are deployed
3. **Execute deployment**:
   - Run the deploy SQL script
   - Run the verify SQL script (if provided)
4. **Record success**:
   - Insert change record
   - Insert dependency records
   - Log deploy event

### Dependency Management

Dependencies are:
- **Declared** when calling deploy (not parsed from SQL)
- **Checked** before deployment (all must exist)
- **Inserted** after successful deployment
- **Enforced** during revert (can't revert if others depend on it)

Example:
```sql
CALL launchql_migrate.deploy(
    'myapp',                          -- project
    'create_posts',                   -- change name
    'hash123',                        -- script hash
    ARRAY['create_users', 'create_categories'],  -- dependencies
    'CREATE TABLE posts (...)'        -- deploy script
);
```

This records that 'create_posts' requires both 'create_users' and 'create_categories' to be deployed first.

### Revert Flow

1. **Call revert** with project, change name, and revert SQL
2. **Validate**:
   - Change is currently deployed
   - No other changes depend on it
3. **Execute revert** SQL script
4. **Clean up**:
   - Remove change record (dependencies cascade delete)
   - Log revert event

## Usage Examples

### Basic Deployment

```sql
-- Deploy a series of changes
BEGIN;
    -- Create schema
    CALL launchql_migrate.deploy(
        'myapp',
        'create_schema',
        'aaa111',
        NULL,  -- no dependencies
        'CREATE SCHEMA myapp;'
    );
    
    -- Create users table
    CALL launchql_migrate.deploy(
        'myapp',
        'create_users',
        'bbb222',
        ARRAY['create_schema'],  -- depends on schema
        'CREATE TABLE myapp.users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL
        );'
    );
    
    -- Create posts table
    CALL launchql_migrate.deploy(
        'myapp',
        'create_posts',
        'ccc333',
        ARRAY['create_users'],  -- depends on users
        'CREATE TABLE myapp.posts (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES myapp.users(id),
            title TEXT NOT NULL
        );'
    );
COMMIT;
```

### Check Status

```sql
-- What's deployed?
SELECT * FROM launchql_migrate.deployed_changes('myapp');

-- Get summary
SELECT * FROM launchql_migrate.status('myapp');

-- Check specific change
SELECT launchql_migrate.is_deployed('myapp', 'create_users');
```

### Revert Changes

```sql
-- Revert most recent change
CALL launchql_migrate.revert(
    'myapp',
    'create_posts',
    'DROP TABLE myapp.posts;'
);
```

## Key Design Decisions

### What We Keep
- **Projects** - For namespacing and organization
- **Dependencies** - For safe deployment ordering
- **Script hashes** - To detect changed scripts
- **Event log** - Minimal audit trail
- **Sqitch file format** - For compatibility and migration

### What We Don't Track
- **Committer information** - Git tracks this
- **Tags** - Use Git tags instead
- **Change descriptions** - Keep in migration files
- **Planner information** - Not needed
- **Complex metadata** - Avoid bloat

### Why Projects Matter
Projects provide:
- **Namespace isolation** - Multiple projects can have a "create_users" change
- **Logical grouping** - Deploy/revert all changes for a project
- **Multi-tenant support** - Different projects in same database
- **Compatibility** - Matches Sqitch's model

## Database Setup

@launchql/migrate installs INTO your existing application database:

```
Your PostgreSQL Database
├── public schema (or your app schemas)
│   ├── users (your table)
│   ├── posts (your table)
│   └── ... (your other tables)
│
└── launchql_migrate schema
    ├── projects
    ├── changes
    ├── dependencies
    └── events
```

## Summary

@launchql/migrate provides a TypeScript-based alternative to Sqitch that:
- Uses the same plan file format for easy migration
- Eliminates the Perl dependency
- Provides safe schema change deployment with dependency tracking
- Offers easy rollback capabilities
- Maintains minimal overhead (just 4 tables)
- Exposes a clean API through PostgreSQL stored procedures
- Avoids metadata bloat

Perfect for teams already using TypeScript who want reliable database change management without adding Perl to their stack.
