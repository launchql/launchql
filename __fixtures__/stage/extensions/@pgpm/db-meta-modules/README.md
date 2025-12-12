# @pgpm/db-meta-modules

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/db-meta-modules"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fmeta%2Fdb-meta-modules%2Fpackage.json"/></a>
</p>

Module metadata handling and dependency tracking.

## Overview

`@pgpm/db-meta-modules` extends the `@pgpm/db-meta-schema` package with module-specific metadata tables. This package provides tables for tracking various LaunchQL modules including authentication, permissions, memberships, encrypted secrets, and more. It enables configuration and metadata storage for modular application features.

## Features

- **Module Metadata Tables**: Store configuration for various application modules
- **Authentication Modules**: Track user authentication, connected accounts, and crypto auth
- **Permission System**: Store permissions and membership configurations
- **Security Modules**: Track encrypted secrets and tokens
- **User Management**: Store user and membership module configurations
- **Field Modules**: Track custom field configurations
- **API Configuration**: Store API and RLS module settings

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/db-meta-modules
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
pgpm install @pgpm/db-meta-modules

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
pgpm install @pgpm/db-meta-modules

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Module Tables

The package provides metadata tables for the following modules:

### Authentication & Users
- **users_module**: User management configuration
- **user_auth_module**: User authentication settings
- **connected_accounts_module**: Connected account configurations
- **crypto_auth_module**: Cryptocurrency authentication settings
- **crypto_addresses_module**: Crypto address management

### Permissions & Memberships
- **permissions_module**: Permission system configuration
- **memberships_module**: Membership management settings
- **membership_types_module**: Membership type definitions
- **levels_module**: User level configurations

### Security
- **encrypted_secrets_module**: Encrypted secrets configuration
- **secrets_module**: Secret management settings
- **tokens_module**: Token management configuration

### Communication
- **emails_module**: Email module configuration
- **phone_numbers_module**: Phone number management settings
- **invites_module**: Invitation system configuration

### Other Modules
- **field_module**: Custom field configurations
- **default_ids_module**: Default ID generation settings
- **limits_module**: Rate limiting and quota configurations
- **rls_module**: Row-level security configurations
- **denormalized_table_field**: Denormalized field tracking

### Application Structure
- **apis**: API configurations
- **sites**: Site definitions

## Usage

### Storing Module Configuration

```sql
-- Configure users module
INSERT INTO meta_public.users_module (
  database_id,
  api_id,
  enabled,
  settings
) VALUES (
  'database-uuid',
  'api-uuid',
  true,
  '{"require_email_verification": true}'::jsonb
);

-- Configure permissions module
INSERT INTO meta_public.permissions_module (
  database_id,
  api_id,
  enabled,
  settings
) VALUES (
  'database-uuid',
  'api-uuid',
  true,
  '{"default_role": "user"}'::jsonb
);

-- Configure encrypted secrets module
INSERT INTO meta_public.encrypted_secrets_module (
  database_id,
  api_id,
  enabled,
  encryption_key_id
) VALUES (
  'database-uuid',
  'api-uuid',
  true,
  'key-uuid'
);
```

### Querying Module Configuration

```sql
-- Get all enabled modules for a database
SELECT 
  'users' as module_name, enabled 
FROM meta_public.users_module 
WHERE database_id = 'database-uuid'
UNION ALL
SELECT 
  'permissions' as module_name, enabled 
FROM meta_public.permissions_module 
WHERE database_id = 'database-uuid'
UNION ALL
SELECT 
  'encrypted_secrets' as module_name, enabled 
FROM meta_public.encrypted_secrets_module 
WHERE database_id = 'database-uuid';

-- Get RLS module configuration
SELECT * FROM meta_public.rls_module
WHERE api_id = 'api-uuid';
```

## Use Cases

### Modular Application Configuration

Store and manage configuration for optional application features:
- Enable/disable modules per database or API
- Store module-specific settings
- Track module dependencies
- Configure module behavior

### Multi-Tenant Applications

Manage module configurations per tenant:
- Different modules enabled per tenant
- Tenant-specific module settings
- Isolated module configurations

### Dynamic Feature Flags

Use module tables as feature flags:
- Enable/disable features at runtime
- A/B testing configurations
- Gradual feature rollouts

## Dependencies

- `@pgpm/db-meta-schema`: Core metadata management
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
