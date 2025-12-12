# @pgpm/uuid

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/uuid"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fdata-types%2Fuuid%2Fpackage.json"/></a>
</p>

UUID utilities and extensions for PostgreSQL.

## Overview

`@pgpm/uuid` provides PostgreSQL functions for generating pseudo-ordered UUIDs that maintain some temporal ordering while preserving UUID randomness. This package is particularly useful for multi-tenant applications where you want UUIDs that cluster by tenant or time period for better database performance.

## Features

- **pseudo_order_uuid()**: Generates time-influenced UUIDs for better index performance
- **pseudo_order_seed_uuid(seed)**: Generates UUIDs with a seed prefix for multi-tenant scenarios
- **trigger_set_uuid_seed**: Trigger function to automatically set UUID from a seed column
- **trigger_set_uuid_related_field**: Trigger function to set UUID based on another column value
- Version 4 UUID format compliance

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/uuid
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
pgpm install @pgpm/uuid

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
pgpm install @pgpm/uuid

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Usage

### Basic UUID Generation

```sql
-- Generate a pseudo-ordered UUID
SELECT uuids.pseudo_order_uuid();
-- Returns: e.g., '3a7f-8b2c-4d1e-9f3a-1b2c3d4e5f6a'

-- Use as default value in a table
CREATE TABLE items (
  id UUID DEFAULT uuids.pseudo_order_uuid() PRIMARY KEY,
  name TEXT
);
```

### Seeded UUID Generation (Multi-Tenant)

```sql
-- Generate UUID with tenant seed
SELECT uuids.pseudo_order_seed_uuid('tenant-123');
-- UUIDs for the same tenant will share a common prefix

-- Useful for multi-tenant applications
CREATE TABLE tenant_data (
  id UUID DEFAULT uuids.pseudo_order_seed_uuid('default-tenant'),
  tenant_id TEXT,
  data JSONB
);
```

### Automatic UUID Setting with Triggers

#### Set UUID from Seed Column

```sql
CREATE TABLE items (
  id UUID,
  name TEXT,
  tenant_id TEXT,
  custom_uuid UUID
);

-- Automatically set custom_uuid based on tenant_id
CREATE TRIGGER set_custom_uuid
BEFORE INSERT ON items
FOR EACH ROW
EXECUTE FUNCTION uuids.trigger_set_uuid_seed('custom_uuid', 'tenant_id');

-- Insert will automatically generate custom_uuid from tenant_id
INSERT INTO items (name, tenant_id) VALUES ('Item 1', 'tenant-abc');
```

#### Set UUID from Related Field

```sql
CREATE TABLE tenant_records (
  id UUID,
  tenant TEXT
);

-- Automatically set id based on tenant column
CREATE TRIGGER set_id_from_tenant
BEFORE INSERT ON tenant_records
FOR EACH ROW
EXECUTE FUNCTION uuids.trigger_set_uuid_related_field('id', 'tenant');

-- Insert will automatically generate id from tenant value
INSERT INTO tenant_records (tenant) VALUES ('tenant-xyz');
```

## Functions

### uuids.pseudo_order_uuid()

Generates a pseudo-ordered UUID that incorporates temporal information for better index performance.

**Returns**: `uuid`

**Algorithm**:
- First 4 characters: MD5 hash of current year + week number (provides weekly clustering)
- Remaining characters: Random values with timestamp influence
- Format: Version 4 UUID compliant

**Benefits**:
- Better B-tree index performance compared to random UUIDs
- Reduces index fragmentation
- Maintains UUID uniqueness guarantees

### uuids.pseudo_order_seed_uuid(seed text)

Generates a pseudo-ordered UUID with a seed prefix for multi-tenant scenarios.

**Parameters**:
- `seed` (text): Seed value (typically tenant ID or organization ID)

**Returns**: `uuid`

**Algorithm**:
- First 2 characters: MD5 hash of seed (provides tenant clustering)
- Next 2 characters: MD5 hash of year + week
- Remaining characters: Random values with timestamp influence
- Format: Version 4 UUID compliant

**Benefits**:
- UUIDs for same tenant cluster together in indexes
- Improves query performance for tenant-specific queries
- Maintains uniqueness across tenants

### uuids.trigger_set_uuid_seed(uuid_column, seed_column)

Trigger function that automatically sets a UUID column based on a seed column value.

**Parameters**:
- `uuid_column` (text): Name of the UUID column to set
- `seed_column` (text): Name of the column containing the seed value

**Usage**:
```sql
CREATE TRIGGER trigger_name
BEFORE INSERT ON table_name
FOR EACH ROW
EXECUTE FUNCTION uuids.trigger_set_uuid_seed('id_column', 'seed_column');
```

### uuids.trigger_set_uuid_related_field(uuid_column, related_column)

Trigger function that automatically sets a UUID column based on another column's value.

**Parameters**:
- `uuid_column` (text): Name of the UUID column to set
- `related_column` (text): Name of the column to use as seed

**Usage**:
```sql
CREATE TRIGGER trigger_name
BEFORE INSERT ON table_name
FOR EACH ROW
EXECUTE FUNCTION uuids.trigger_set_uuid_related_field('id_column', 'related_column');
```

## Use Cases

### Multi-Tenant Applications

```sql
CREATE TABLE tenant_users (
  id UUID,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_user_id
BEFORE INSERT ON tenant_users
FOR EACH ROW
EXECUTE FUNCTION uuids.trigger_set_uuid_seed('id', 'tenant_id');

-- All users for tenant 'acme' will have UUIDs with same prefix
INSERT INTO tenant_users (tenant_id, email) VALUES
  ('acme', 'user1@acme.com'),
  ('acme', 'user2@acme.com');
```

### Time-Series Data with Better Index Performance

```sql
CREATE TABLE events (
  id UUID DEFAULT uuids.pseudo_order_uuid() PRIMARY KEY,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UUIDs will cluster by week, improving range query performance
```

## Dependencies

- `@pgpm/verify`: Verification utilities for database objects

## Testing

```bash
pnpm test
```

The test suite validates:
- UUID format compliance (version 4)
- Pseudo-ordered UUID generation
- Seeded UUID generation with consistent prefixes
- Trigger functions for automatic UUID setting

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
