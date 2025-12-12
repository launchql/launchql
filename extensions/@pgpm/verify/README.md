# @pgpm/verify

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/verify"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Futils%2Fverify%2Fpackage.json"/></a>
</p>

Verification utilities for PostgreSQL extensions

## Overview

`@pgpm/verify` is the foundational verification package used by all LaunchQL extensions. It provides SQL functions to verify the existence and correctness of database objects during deployment, testing, and migrations. This package is essential for the deploy/verify/revert pattern, ensuring that database changes are applied correctly and can be validated programmatically.

## Features

- **Comprehensive Verification**: Verify tables, functions, schemas, indexes, triggers, views, domains, and roles
- **Universal Dependency**: Required by all 22 LaunchQL extension packages
- **Deploy/Verify/Revert Pattern**: Core component of safe database migrations
- **Testing Support**: Essential for integration and unit tests
- **Error Detection**: Catch deployment issues early with clear error messages
- **Pure plpgsql**: No external dependencies required

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/verify
pgpm deploy
```

This is a quick way to get started. The sections below provide more detailed installation options.

### Prerequisites

```bash
# Install pgpm CLI
npm install -g pgpm

# Start local Postgres (via Docker) and export env vars
pgpm docker start
eval "$(pgpm env)"
```

> **Tip:** Already running Postgres? Skip the Docker step and just export your `PG*` environment variables.

### **Add to an Existing Package**

```bash
# 1. Install the package
pgpm install @pgpm/verify

# 2. Deploy locally
pgpm deploy
```

### **Add to a New Project**

```bash
# 1. Create a workspace
pgpm init --workspace

# 2. Create your first module
cd my-workspace
pgpm init

# 3. Install a package
cd packages/my-module
pgpm install @pgpm/verify

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Functions

### verify.verify_table(schema_name, table_name)

Verify that a table exists in the specified schema.

**Signature:**
```sql
verify.verify_table(schema_name text, table_name text) RETURNS void
```

**Usage:**
```sql
-- Verify users table exists
SELECT verify.verify_table('public', 'users');

-- Verify in verify script
-- verify/schemas/public/tables/users/table.sql
SELECT verify.verify_table('public', 'users');
```

### verify.verify_function(function_name)

Verify that a function exists.

**Signature:**
```sql
verify.verify_function(function_name text) RETURNS void
```

**Usage:**
```sql
-- Verify function exists
SELECT verify.verify_function('public.calculate_total');

-- Verify with schema prefix
SELECT verify.verify_function('utils.throw');
```

### verify.verify_schema(schema_name)

Verify that a schema exists.

**Signature:**
```sql
verify.verify_schema(schema_name text) RETURNS void
```

**Usage:**
```sql
-- Verify schema exists
SELECT verify.verify_schema('public');
SELECT verify.verify_schema('app_jobs');
SELECT verify.verify_schema('status_public');
```

### verify.verify_index(schema_name, index_name)

Verify that an index exists in the specified schema.

**Signature:**
```sql
verify.verify_index(schema_name text, index_name text) RETURNS void
```

**Usage:**
```sql
-- Verify index exists
SELECT verify.verify_index('public', 'users_email_idx');
SELECT verify.verify_index('app_jobs', 'jobs_priority_run_at_id_idx');
```

### verify.verify_trigger(trigger_name)

Verify that a trigger exists.

**Signature:**
```sql
verify.verify_trigger(trigger_name text) RETURNS void
```

**Usage:**
```sql
-- Verify trigger exists
SELECT verify.verify_trigger('update_updated_at_trigger');
SELECT verify.verify_trigger('notify_worker');
```

### verify.verify_view(schema_name, view_name)

Verify that a view exists in the specified schema.

**Signature:**
```sql
verify.verify_view(schema_name text, view_name text) RETURNS void
```

**Usage:**
```sql
-- Verify view exists
SELECT verify.verify_view('public', 'user_profiles_view');
SELECT verify.verify_view('status_public', 'achievements_summary');
```

### verify.verify_domain(schema_name, domain_name)

Verify that a domain type exists in the specified schema.

**Signature:**
```sql
verify.verify_domain(schema_name text, domain_name text) RETURNS void
```

**Usage:**
```sql
-- Verify domain exists
SELECT verify.verify_domain('public', 'email');
SELECT verify.verify_domain('public', 'hostname');
SELECT verify.verify_domain('public', 'url');
```

### verify.verify_role(role_name)

Verify that a PostgreSQL role exists.

**Signature:**
```sql
verify.verify_role(role_name text) RETURNS void
```

**Usage:**
```sql
-- Verify role exists
SELECT verify.verify_role('authenticated');
SELECT verify.verify_role('anonymous');
SELECT verify.verify_role('administrator');
```

## Usage in Deploy/Verify/Revert Pattern

### Verify Scripts

Every deploy script should have a corresponding verify script:

```
packages/example/
├── deploy/
│   └── schemas/public/tables/users/table.sql
├── verify/
│   └── schemas/public/tables/users/table.sql
└── revert/
    └── schemas/public/tables/users/table.sql
```

**deploy/schemas/public/tables/users/table.sql:**
```sql
BEGIN;

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

COMMIT;
```

**verify/schemas/public/tables/users/table.sql:**
```sql
SELECT verify.verify_table('public', 'users');
```

**revert/schemas/public/tables/users/table.sql:**
```sql
BEGIN;
DROP TABLE IF EXISTS public.users;
COMMIT;
```

### Complex Verification

Verify multiple related objects:

**verify/schemas/app_jobs/tables/jobs/table.sql:**
```sql
-- Verify table exists
SELECT verify.verify_table('app_jobs', 'jobs');

-- Verify indexes exist
SELECT verify.verify_index('app_jobs', 'jobs_priority_run_at_id_idx');
SELECT verify.verify_index('app_jobs', 'jobs_locked_by_idx');

-- Verify triggers exist
SELECT verify.verify_trigger('update_timestamps');
SELECT verify.verify_trigger('notify_worker');
```

## Usage in Testing

### Integration Tests

Use verify functions in test setup and assertions:

```javascript
describe('User Table', () => {
  it('should create users table', async () => {
    await pg.query(`
      CREATE TABLE public.users (
        id uuid PRIMARY KEY,
        email text NOT NULL
      )
    `);

    // Verify table was created
    await pg.query(`SELECT verify.verify_table('public', 'users')`);
  });

  it('should create email index', async () => {
    await pg.query(`
      CREATE INDEX users_email_idx ON public.users(email)
    `);

    // Verify index was created
    await pg.query(`SELECT verify.verify_index('public', 'users_email_idx')`);
  });
});
```

### Verification in Migrations

Ensure migrations are applied correctly:

```sql
-- Migration script
DO $$
BEGIN
  -- Create schema
  CREATE SCHEMA IF NOT EXISTS app_jobs;

  -- Verify schema was created
  PERFORM verify.verify_schema('app_jobs');

  -- Create table
  CREATE TABLE app_jobs.jobs (
    id serial PRIMARY KEY,
    task_identifier text NOT NULL
  );

  -- Verify table was created
  PERFORM verify.verify_table('app_jobs', 'jobs');

  RAISE NOTICE 'Migration completed successfully';
END $$;
```

## Integration Examples

### With All LaunchQL Extensions

Every LaunchQL extension depends on `@pgpm/verify`:

**package.json:**
```json
{
  "dependencies": {
    "@pgpm/verify": "workspace:*"
  }
}
```

**Verification in extensions:**
```sql
-- @pgpm/types verifies domains
SELECT verify.verify_domain('public', 'email');
SELECT verify.verify_domain('public', 'hostname');

-- @pgpm/jobs verifies tables and functions
SELECT verify.verify_table('app_jobs', 'jobs');
SELECT verify.verify_function('app_jobs.add_job');

-- @pgpm/achievements verifies schemas and triggers
SELECT verify.verify_schema('status_public');
SELECT verify.verify_trigger('achievement_trigger');
```

### With CI/CD Pipeline

Verify deployments in CI:

```bash
#!/bin/bash
# scripts/verify-deployment.sh

# Deploy changes
pgpm deploy test_db --yes --recursive --createdb

# Run verification
pgpm verify test_db --yes --recursive

# If verification fails, revert
if [ $? -ne 0 ]; then
  echo "Verification failed, reverting..."
  pgpm revert test_db --yes --recursive
  exit 1
fi

echo "Deployment verified successfully"
```

## Error Handling

Verification functions throw clear errors when objects don't exist:

```sql
-- Table doesn't exist
SELECT verify.verify_table('public', 'nonexistent_table');
-- ERROR: Table public.nonexistent_table does not exist

-- Function doesn't exist
SELECT verify.verify_function('public.nonexistent_function');
-- ERROR: Function public.nonexistent_function does not exist

-- Schema doesn't exist
SELECT verify.verify_schema('nonexistent_schema');
-- ERROR: Schema nonexistent_schema does not exist
```

## Best Practices

1. **Always Create Verify Scripts**: Every deploy script should have a matching verify script
2. **Verify Immediately**: Run verification right after deployment
3. **Verify Dependencies**: Check that required objects exist before creating dependent objects
4. **Use in Tests**: Incorporate verification in integration tests
5. **CI Integration**: Make verification part of your CI/CD pipeline
6. **Clear Naming**: Use descriptive names that match your deploy scripts

## Use Cases

- **Safe Migrations**: Ensure database changes are applied correctly
- **Deployment Validation**: Verify production deployments
- **Testing**: Validate test database setup
- **CI/CD**: Automated verification in continuous integration
- **Rollback Safety**: Confirm revert scripts work correctly
- **Documentation**: Self-documenting database structure
- **Debugging**: Quickly identify missing database objects

## Testing

```bash
pnpm test
```

## Dependencies

None - this is the foundational package that all other packages depend on.

## Related Tooling

* [pgpm](https://github.com/launchql/launchql/tree/main/packages/pgpm): **🖥️ PostgreSQL Package Manager** for modular Postgres development. Works with database workspaces, scaffolding, migrations, seeding, and installing database packages.
* [pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [supabase-test](https://github.com/launchql/launchql/tree/main/packages/supabase-test): **🧪 Supabase-native test harness** preconfigured for the local Supabase stack—per-test rollbacks, JWT/role context helpers, and CI/GitHub Actions ready.
* [graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): **🔐 Authentication mocking** for Graphile-focused test helpers and emulating row-level security contexts.
* [pgsql-parser](https://github.com/launchql/pgsql-parser): **🔄 SQL conversion engine** that interprets and converts PostgreSQL syntax.
* [libpg-query-node](https://github.com/launchql/libpg-query-node): **🌉 Node.js bindings** for `libpg_query`, converting SQL into parse trees.
* [pg-proto-parser](https://github.com/launchql/pg-proto-parser): **📦 Protobuf parser** for parsing PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.