# @pgpm/default-roles

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/default-roles"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fsecurity%2Fdefault-roles%2Fpackage.json"/></a>
</p>

Default PostgreSQL role definitions and permissions.

## Overview

`@pgpm/default-roles` provides a standardized role hierarchy for PostgreSQL applications. This package creates three fundamental roles (anonymous, authenticated, administrator) that form the foundation for role-based access control (RBAC) in your database. These roles are designed to work with JWT-based authentication and row-level security policies.

## Features

- **Three-Tier Role Hierarchy**: anonymous → authenticated → administrator
- **Secure Defaults**: Roles created with minimal privileges
- **RLS Integration**: Administrator role can bypass RLS, others cannot
- **Idempotent Creation**: Safe to run multiple times
- **Standard Permissions**: Consistent role configuration across applications

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/default-roles
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
pgpm install @pgpm/default-roles

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
pgpm install @pgpm/default-roles

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Roles

### anonymous
The most restrictive role for unauthenticated users.

**Permissions:**
- NOCREATEDB: Cannot create databases
- NOCREATEROLE: Cannot create roles
- NOLOGIN: Cannot log in directly
- NOBYPASSRLS: Must respect row-level security

**Use Cases:**
- Public API endpoints
- Unauthenticated read access
- Public data queries

### authenticated
Role for logged-in users with verified identity.

**Permissions:**
- NOCREATEDB: Cannot create databases
- NOCREATEROLE: Cannot create roles
- NOLOGIN: Cannot log in directly (uses JWT)
- NOBYPASSRLS: Must respect row-level security

**Use Cases:**
- Logged-in user operations
- User-specific data access
- Protected endpoints

### administrator
Elevated role with administrative privileges.

**Permissions:**
- NOCREATEDB: Cannot create databases
- NOCREATEROLE: Cannot create roles
- NOLOGIN: Cannot log in directly (uses JWT)
- BYPASSRLS: Can bypass row-level security
- Inherits: anonymous, authenticated

**Use Cases:**
- Administrative operations
- System maintenance
- Data management tasks

## Usage

### Setting Up Roles

The roles are automatically created when you deploy this package:

```bash
pgpm deploy @pgpm/default-roles
```

### Using Roles with JWT

Set the PostgreSQL role based on JWT claims:

```sql
-- In your authentication function
SET LOCAL ROLE anonymous;  -- For unauthenticated requests
SET LOCAL ROLE authenticated;  -- For logged-in users
SET LOCAL ROLE administrator;  -- For admin users
```

### Granting Table Permissions

```sql
-- Grant read access to anonymous users
GRANT SELECT ON my_table TO anonymous;

-- Grant full access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON my_table TO authenticated;

-- Grant all privileges to administrators
GRANT ALL ON my_table TO administrator;
```

### Row-Level Security Policies

```sql
-- Enable RLS on a table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anonymous can only see public profiles
CREATE POLICY anonymous_users ON users
  FOR SELECT
  TO anonymous
  USING (is_public = true);

-- Authenticated users can see their own data
CREATE POLICY authenticated_users ON users
  FOR ALL
  TO authenticated
  USING (id = jwt_public.current_user_id());

-- Administrators bypass RLS automatically (BYPASSRLS privilege)
```

### Role Hierarchy Example

```sql
-- Create a custom role that inherits authenticated
CREATE ROLE moderator;
GRANT authenticated TO moderator;
ALTER USER moderator WITH BYPASSRLS;  -- Moderators can bypass RLS

-- Grant moderator additional permissions
GRANT DELETE ON comments TO moderator;
```

## Integration with Other Packages

### With @pgpm/jwt-claims

```sql
-- Use JWT claims to determine role
CREATE FUNCTION set_user_role() RETURNS void AS $$
DECLARE
  user_role text;
BEGIN
  user_role := current_setting('jwt.claims.role', true);
  
  IF user_role = 'admin' THEN
    SET LOCAL ROLE administrator;
  ELSIF user_role = 'user' THEN
    SET LOCAL ROLE authenticated;
  ELSE
    SET LOCAL ROLE anonymous;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### With @pgpm/jobs

```sql
-- Grant job management to administrators
GRANT SELECT, INSERT, UPDATE, DELETE ON app_jobs.jobs TO administrator;
GRANT EXECUTE ON FUNCTION app_jobs.add_job TO authenticated;
```

## Security Best Practices

1. **Never grant SUPERUSER**: These roles intentionally lack superuser privileges
2. **Use RLS policies**: Combine roles with row-level security for fine-grained access control
3. **Principle of least privilege**: Grant only necessary permissions to each role
4. **Audit role usage**: Monitor which roles are being used in your application
5. **JWT integration**: Always validate JWT claims before setting roles

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
