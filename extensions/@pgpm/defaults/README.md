# @pgpm/defaults

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/defaults"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fsecurity%2Fdefaults%2Fpackage.json"/></a>
</p>

Security defaults and baseline configurations.

## Overview

`@pgpm/defaults` establishes a secure baseline configuration for PostgreSQL databases by revoking default public access. This package implements the principle of least privilege by removing PostgreSQL's default permissive settings and requiring explicit permission grants.

## Features

- **Revoke Public Database Access**: Removes default PUBLIC access to databases
- **Restrict Function Execution**: Prevents PUBLIC from executing functions by default
- **Lock Down Public Schema**: Removes CREATE privilege on public schema from PUBLIC
- **Secure by Default**: Forces explicit permission grants
- **One-Time Setup**: Applies baseline security configuration

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/defaults
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
pgpm install @pgpm/defaults

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
pgpm install @pgpm/defaults

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## What It Does

This package executes three critical security operations:

### 1. Revoke Database Access from PUBLIC

```sql
REVOKE ALL ON DATABASE current_database FROM PUBLIC;
```

Removes all default privileges that PUBLIC role has on the database, preventing unauthorized access.

### 2. Revoke Function Execution from PUBLIC

```sql
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
```

Prevents PUBLIC from executing any functions by default. Functions must be explicitly granted to roles.

### 3. Revoke Schema Creation from PUBLIC

```sql
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

Prevents PUBLIC from creating objects in the public schema, requiring explicit permissions.

## Usage

### Deploying Security Defaults

This is typically one of the first packages you deploy to establish a secure baseline.

#### From Package Directory

```bash
cd packages/security/defaults
pgpm deploy --createdb
```

#### From Workspace Root

```bash
pgpm install
pgpm deploy mydb1 --yes --createdb
```

### After Deployment

After deploying this package, you must explicitly grant permissions:

```sql
-- Grant database connection to specific roles
GRANT CONNECT ON DATABASE mydb TO authenticated;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table access
GRANT SELECT, INSERT, UPDATE, DELETE ON my_table TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION my_function() TO authenticated;
```

## Security Model

### Before @pgpm/defaults

PostgreSQL's default configuration is permissive:
- PUBLIC can connect to databases
- PUBLIC can execute functions
- PUBLIC can create objects in public schema

This is convenient for development but insecure for production.

### After @pgpm/defaults

All access must be explicitly granted:
- Roles need CONNECT privilege to access database
- Roles need USAGE privilege on schemas
- Roles need specific privileges on tables/functions
- No implicit permissions exist

## Integration with Other Packages

### With @pgpm/default-roles

```bash
# Deploy both packages from their directories
cd packages/security/defaults && pgpm deploy --createdb
cd packages/security/default-roles && pgpm deploy --createdb
```

Then grant permissions to roles:

```sql
-- Grant permissions to roles
GRANT CONNECT ON DATABASE mydb TO anonymous, authenticated, administrator;
GRANT USAGE ON SCHEMA public TO anonymous, authenticated, administrator;
```

### With Application Tables

```sql
-- Create table
CREATE TABLE users (id uuid PRIMARY KEY, email text);

-- Explicitly grant access (nothing is granted by default)
GRANT SELECT ON users TO anonymous;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT ALL ON users TO administrator;
```

## Best Practices

1. **Deploy Early**: Apply this package before creating application objects
2. **Explicit Grants**: Always explicitly grant required permissions
3. **Least Privilege**: Grant only the minimum permissions needed
4. **Document Grants**: Keep track of what permissions each role has
5. **Test Thoroughly**: Verify that your application works with restricted permissions

## Common Patterns

### Public Read, Authenticated Write

```sql
-- Public data that anyone can read
GRANT SELECT ON public_data TO anonymous;
GRANT SELECT, INSERT, UPDATE, DELETE ON public_data TO authenticated;
```

### Private User Data

```sql
-- Enable RLS for user isolation
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can access their own data
GRANT SELECT, INSERT, UPDATE, DELETE ON user_data TO authenticated;

CREATE POLICY user_data_policy ON user_data
  FOR ALL TO authenticated
  USING (user_id = jwt_public.current_user_id());
```

### Admin-Only Tables

```sql
-- Only administrators can access
GRANT ALL ON admin_config TO administrator;
```

## Troubleshooting

### "Permission Denied" Errors

If you see permission denied errors after deploying this package:

1. Check which role is being used: `SELECT current_role;`
2. Verify role has CONNECT: `SELECT has_database_privilege('rolename', 'mydb', 'CONNECT');`
3. Verify schema USAGE: `SELECT has_schema_privilege('rolename', 'public', 'USAGE');`
4. Grant missing permissions explicitly

### Functions Not Executable

If functions can't be executed:

```sql
-- Grant execute on specific function
GRANT EXECUTE ON FUNCTION my_function() TO authenticated;

-- Or grant execute on all functions in schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

## Dependencies

- `@pgpm/verify`: Verification utilities

## Testing

```bash
pnpm test
```

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
