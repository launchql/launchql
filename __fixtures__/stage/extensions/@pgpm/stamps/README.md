# @pgpm/stamps

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/stamps"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fdata-types%2Fstamps%2Fpackage.json"/></a>
</p>

Timestamp utilities and audit trail functions for PostgreSQL.

## Overview

`@pgpm/stamps` provides PostgreSQL trigger functions for automatically managing timestamp and user tracking columns in your tables. This package simplifies audit trail implementation by automatically setting `created_at`, `updated_at`, `created_by`, and `updated_by` fields.

## Features

- **timestamps()**: Trigger function that automatically manages `created_at` and `updated_at` columns
- **peoplestamps()**: Trigger function that automatically manages `created_by` and `updated_by` columns using JWT claims
- Automatic preservation of creation timestamps and users on updates
- Integration with `@pgpm/jwt-claims` for user context

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/stamps
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
pgpm install @pgpm/stamps

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
pgpm install @pgpm/stamps

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Usage

### Setting Up Timestamp Tracking

```sql
-- Create a table with timestamp columns
CREATE TABLE public.posts (
  id serial PRIMARY KEY,
  title text,
  content text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Add trigger to automatically manage timestamps
CREATE TRIGGER set_timestamps
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION stamps.timestamps();
```

### Setting Up User Tracking

```sql
-- Create a table with user tracking columns
CREATE TABLE public.posts (
  id serial PRIMARY KEY,
  title text,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid
);

-- Add triggers for automatic timestamp and user tracking
CREATE TRIGGER set_timestamps
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION stamps.timestamps();

CREATE TRIGGER set_peoplestamps
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION stamps.peoplestamps();
```

### How It Works

When you insert a new row:
- `created_at` and `updated_at` are set to the current timestamp
- `created_by` and `updated_by` are set to the current user ID from JWT claims

When you update an existing row:
- `created_at` and `created_by` are preserved (set to their original values)
- `updated_at` is set to the current timestamp
- `updated_by` is set to the current user ID from JWT claims

### Example Usage

```sql
-- Set the user context (typically done by your application)
SET jwt.claims.user_id = '00000000-0000-0000-0000-000000000001';

-- Insert a new post
INSERT INTO public.posts (title, content)
VALUES ('My First Post', 'Hello World!');
-- created_at, updated_at, created_by, and updated_by are automatically set

-- Update the post
UPDATE public.posts
SET content = 'Updated content'
WHERE id = 1;
-- updated_at and updated_by are automatically updated
-- created_at and created_by remain unchanged
```

## Trigger Functions

### stamps.timestamps()

Automatically manages timestamp columns on INSERT and UPDATE operations.

**Behavior:**
- **INSERT**: Sets both `created_at` and `updated_at` to `NOW()`
- **UPDATE**: Preserves `created_at`, updates `updated_at` to `NOW()`

**Required Columns:**
- `created_at timestamptz`
- `updated_at timestamptz`

### stamps.peoplestamps()

Automatically manages user tracking columns on INSERT and UPDATE operations using JWT claims.

**Behavior:**
- **INSERT**: Sets both `created_by` and `updated_by` to `jwt_public.current_user_id()`
- **UPDATE**: Preserves `created_by`, updates `updated_by` to `jwt_public.current_user_id()`

**Required Columns:**
- `created_by uuid`
- `updated_by uuid`

**Dependencies:**
- Requires `@pgpm/jwt-claims` for `jwt_public.current_user_id()` function
- User context must be set via `jwt.claims.user_id` session variable

## Dependencies

- `@pgpm/jwt-claims`: JWT claim handling for user context
- `@pgpm/verify`: Verification utilities for database objects

## Testing

```bash
pnpm test
```

The test suite validates:
- Automatic timestamp setting on insert and update
- Automatic user tracking on insert and update
- Preservation of creation timestamps and users on updates
- Integration with JWT claims for user context

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
