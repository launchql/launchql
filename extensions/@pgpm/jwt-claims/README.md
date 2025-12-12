# @pgpm/jwt-claims

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/jwt-claims"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fsecurity%2Fjwt-claims%2Fpackage.json"/></a>
</p>

JWT claim handling and validation functions.

## Overview

`@pgpm/jwt-claims` provides PostgreSQL functions for extracting and working with JWT (JSON Web Token) claims stored in PostgreSQL session variables. This package enables seamless integration between JWT-based authentication systems and PostgreSQL, allowing database functions to access user context, group memberships, IP addresses, and other JWT payload data.

## Features

- **User Context Functions**: Extract user ID from JWT claims
- **Group Membership**: Access user's group IDs
- **Request Metadata**: Get IP address and user agent from requests
- **Database Context**: Access database ID from JWT claims
- **Type-Safe Extraction**: Proper error handling for invalid claim values
- **Session Variables**: Uses PostgreSQL's `current_setting()` for claim storage

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/jwt-claims
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
pgpm install @pgpm/jwt-claims

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
pgpm install @pgpm/jwt-claims

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Functions

### jwt_public.current_user_id()
Extracts the user ID from JWT claims.

**Returns:** `uuid` - The current user's ID, or NULL if not set

**Usage:**
```sql
SELECT jwt_public.current_user_id();
```

**JWT Claim:** `jwt.claims.user_id`

### jwt_public.current_group_ids()
Extracts the user's group IDs from JWT claims.

**Returns:** `uuid[]` - Array of group IDs, or empty array if not set

**Usage:**
```sql
SELECT jwt_public.current_group_ids();
```

**JWT Claim:** `jwt.claims.group_ids`

### jwt_public.current_ip_address()
Extracts the client's IP address from JWT claims.

**Returns:** `text` - The client's IP address, or NULL if not set

**Usage:**
```sql
SELECT jwt_public.current_ip_address();
```

**JWT Claim:** `jwt.claims.ip_address`

### jwt_public.current_user_agent()
Extracts the client's user agent from JWT claims.

**Returns:** `text` - The client's user agent string, or NULL if not set

**Usage:**
```sql
SELECT jwt_public.current_user_agent();
```

**JWT Claim:** `jwt.claims.user_agent`

### jwt_private.current_database_id()
Extracts the database ID from JWT claims (private function).

**Returns:** `uuid` - The database ID, or NULL if not set

**Usage:**
```sql
SELECT jwt_private.current_database_id();
```

**JWT Claim:** `jwt.claims.database_id`

## Usage

### Setting JWT Claims

JWT claims are set as PostgreSQL session variables, typically by your authentication middleware:

```sql
-- Set user ID claim
SELECT set_config('jwt.claims.user_id', 'user-uuid-here', false);

-- Set group IDs claim
SELECT set_config('jwt.claims.group_ids', '{uuid1,uuid2,uuid3}', false);

-- Set IP address claim
SELECT set_config('jwt.claims.ip_address', '192.168.1.1', false);

-- Set user agent claim
SELECT set_config('jwt.claims.user_agent', 'Mozilla/5.0...', false);

-- Set database ID claim
SELECT set_config('jwt.claims.database_id', 'database-uuid-here', false);
```

### Using Claims in Row-Level Security

```sql
-- Enable RLS on a table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own posts
CREATE POLICY user_posts ON posts
  FOR ALL
  TO authenticated
  USING (user_id = jwt_public.current_user_id());

-- Users can see posts from their groups
CREATE POLICY group_posts ON posts
  FOR SELECT
  TO authenticated
  USING (group_id = ANY(jwt_public.current_group_ids()));
```

### Using Claims in Functions

```sql
-- Function that uses current user ID
CREATE FUNCTION create_post(title text, content text)
RETURNS uuid AS $$
DECLARE
  new_post_id uuid;
BEGIN
  INSERT INTO posts (user_id, title, content)
  VALUES (jwt_public.current_user_id(), title, content)
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function that checks group membership
CREATE FUNCTION user_in_group(group_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN group_id = ANY(jwt_public.current_group_ids());
END;
$$ LANGUAGE plpgsql;
```

### Audit Logging with JWT Claims

```sql
-- Audit log table
CREATE TABLE audit_log (
  id serial PRIMARY KEY,
  user_id uuid,
  ip_address text,
  user_agent text,
  action text,
  timestamp timestamptz DEFAULT now()
);

-- Trigger function for audit logging
CREATE FUNCTION log_action()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log (user_id, ip_address, user_agent, action)
  VALUES (
    jwt_public.current_user_id(),
    jwt_public.current_ip_address(),
    jwt_public.current_user_agent(),
    TG_OP || ' on ' || TG_TABLE_NAME
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to table
CREATE TRIGGER audit_posts
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION log_action();
```

### Multi-Tenancy with Database ID

```sql
-- Filter data by database ID
CREATE FUNCTION get_tenant_data()
RETURNS SETOF my_table AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM my_table
  WHERE database_id = jwt_private.current_database_id();
END;
$$ LANGUAGE plpgsql;
```

## Integration with Other Packages

### With @pgpm/stamps

The stamps package uses JWT claims for automatic user tracking:

```sql
-- Stamps automatically uses jwt_public.current_user_id()
-- for created_by and updated_by columns
```

### With @pgpm/achievements

The achievements package uses JWT claims for user context:

```sql
-- Check current user's achievements
SELECT * FROM status_public.steps_required('newbie');
-- Uses jwt_public.current_user_id() internally
```

### With @pgpm/default-roles

Combine JWT claims with role-based access:

```sql
-- Set role based on JWT claim
CREATE FUNCTION set_user_role()
RETURNS void AS $$
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

## Error Handling

All functions include error handling for invalid claim values:

```sql
-- If jwt.claims.user_id is not a valid UUID
SELECT jwt_public.current_user_id();
-- Returns NULL and raises NOTICE: 'Invalid UUID value'

-- If jwt.claims.group_ids is not a valid UUID array
SELECT jwt_public.current_group_ids();
-- Returns empty array [] and raises NOTICE: 'Invalid UUID value'
```

## Security Considerations

1. **Trust the Source**: Only set JWT claims from trusted authentication middleware
2. **Validate Claims**: Always validate JWT signatures before setting claims
3. **Session Scope**: Claims are session-scoped and don't persist across connections
4. **No Direct Access**: Users cannot directly modify session variables in most configurations
5. **Use HTTPS**: Always transmit JWTs over HTTPS to prevent interception

## Dependencies

- `@pgpm/types`: Core PostgreSQL types
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
