# @pgpm/db-meta-schema

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/db-meta-schema"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fmeta%2Fdb-meta-schema%2Fpackage.json"/></a>
</p>

Database metadata utilities and introspection functions.

## Overview

`@pgpm/db-meta-schema` provides a comprehensive metadata management system for PostgreSQL databases. This package creates tables and schemas for storing and querying database structure information including databases, schemas, tables, fields, constraints, indexes, and more. It enables runtime schema introspection, metadata-driven code generation, and database structure management.

## Features

- **Database Metadata Storage**: Store information about databases, schemas, tables, and fields
- **Constraint Tracking**: Track primary keys, foreign keys, unique constraints, and check constraints
- **Index Management**: Store and query index definitions
- **Trigger and Procedure Metadata**: Track database functions and triggers
- **RLS and Policy Information**: Store row-level security policies
- **Extension Tracking**: Manage database extensions and their relationships
- **API and Site Metadata**: Store API configurations and site information
- **GraphQL Integration**: Smart tags and annotations for GraphQL schema generation

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/db-meta-schema
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
pgpm install @pgpm/db-meta-schema

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
pgpm install @pgpm/db-meta-schema

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Schemas

### collections_public Schema

Stores database structure metadata:

- **database**: Database definitions with schema names and hashes
- **schema**: Schema definitions within databases
- **table**: Table definitions with RLS, timestamps, and naming conventions
- **field**: Column definitions with types, constraints, and validation rules
- **primary_key_constraint**: Primary key definitions
- **foreign_key_constraint**: Foreign key relationships
- **unique_constraint**: Unique constraints
- **check_constraint**: Check constraint definitions
- **index**: Index definitions
- **trigger**: Trigger definitions
- **procedure**: Stored procedure definitions
- **policy**: Row-level security policies
- **extension**: PostgreSQL extensions
- **database_extension**: Extension installations per database

### collections_private Schema

Private schema for internal metadata operations.

### meta_public Schema

Application-level metadata:

- **apis**: API configurations
- **api_extensions**: API extension relationships
- **api_modules**: API module definitions
- **api_schemata**: API schema configurations
- **sites**: Site definitions
- **apps**: Application definitions
- **domains**: Domain configurations
- **site_metadata**: Site metadata
- **site_modules**: Site module configurations
- **site_themes**: Site theme definitions

## Usage

### Storing Database Metadata

```sql
-- Create a database entry
INSERT INTO collections_public.database (name, label, schema_name, private_schema_name)
VALUES ('my_app', 'My Application', 'my_app_public', 'my_app_private')
RETURNING id;

-- Create a schema entry
INSERT INTO collections_public.schema (database_id, name)
VALUES ('database-uuid', 'public')
RETURNING id;

-- Create a table entry
INSERT INTO collections_public.table (
  database_id,
  schema_id,
  name,
  label,
  use_rls,
  timestamps,
  peoplestamps
) VALUES (
  'database-uuid',
  'schema-uuid',
  'users',
  'Users',
  true,
  true,
  true
);

-- Create field entries
INSERT INTO collections_public.field (
  database_id,
  table_id,
  name,
  label,
  type,
  is_required,
  field_order
) VALUES
  ('database-uuid', 'table-uuid', 'id', 'ID', 'uuid', true, 1),
  ('database-uuid', 'table-uuid', 'email', 'Email', 'email', true, 2),
  ('database-uuid', 'table-uuid', 'name', 'Name', 'text', false, 3);
```

### Querying Metadata

```sql
-- Get all tables in a database
SELECT t.name, t.label, s.name as schema_name
FROM collections_public.table t
JOIN collections_public.schema s ON t.schema_id = s.id
WHERE t.database_id = 'database-uuid';

-- Get all fields for a table
SELECT f.name, f.label, f.type, f.is_required, f.default_value
FROM collections_public.field f
WHERE f.table_id = 'table-uuid'
ORDER BY f.field_order;

-- Get foreign key relationships
SELECT 
  fk.name as constraint_name,
  t1.name as from_table,
  t2.name as to_table
FROM collections_public.foreign_key_constraint fk
JOIN collections_public.table t1 ON fk.table_id = t1.id
JOIN collections_public.table t2 ON fk.foreign_table_id = t2.id
WHERE fk.database_id = 'database-uuid';
```

### Smart Tags for GraphQL

The package supports smart tags for GraphQL schema generation:

```sql
-- Add smart tags to a table
UPDATE collections_public.table
SET smart_tags = '{
  "@omit": "create,update,delete",
  "@name": "CustomTableName"
}'::jsonb
WHERE id = 'table-uuid';

-- Add smart tags to a field
UPDATE collections_public.field
SET smart_tags = '{
  "@omit": true,
  "@deprecated": "Use new_field instead"
}'::jsonb
WHERE id = 'field-uuid';
```

## Table Structures

### database Table

Stores database definitions:
- `id`: UUID primary key
- `owner_id`: Owner UUID
- `schema_hash`: Unique schema hash
- `schema_name`: Public schema name
- `private_schema_name`: Private schema name
- `name`: Database name
- `label`: Display label
- `hash`: Database hash

### table Table

Stores table definitions:
- `id`: UUID primary key
- `database_id`: Foreign key to database
- `schema_id`: Foreign key to schema
- `name`: Table name
- `label`: Display label
- `description`: Table description
- `smart_tags`: JSONB smart tags for GraphQL
- `use_rls`: Enable row-level security
- `timestamps`: Enable created_at/updated_at
- `peoplestamps`: Enable created_by/updated_by
- `plural_name`: Plural form for API
- `singular_name`: Singular form for API
- `inherits_id`: Table inheritance

### field Table

Stores column definitions:
- `id`: UUID primary key
- `database_id`: Foreign key to database
- `table_id`: Foreign key to table
- `name`: Column name
- `label`: Display label
- `description`: Column description
- `smart_tags`: JSONB smart tags
- `is_required`: NOT NULL constraint
- `default_value`: Default value
- `is_hidden`: Hide from API
- `type`: PostgreSQL type
- `field_order`: Display order
- `regexp`: Validation regex
- `chk`: Check constraint JSON
- `min`/`max`: Numeric constraints

## Use Cases

### Schema-Driven Code Generation

Use metadata to generate:
- GraphQL schemas
- TypeScript types
- API documentation
- Database migration scripts
- Admin interfaces

### Runtime Schema Introspection

Query metadata at runtime to:
- Build dynamic forms
- Generate validation rules
- Create custom queries
- Implement multi-tenancy

### Database Documentation

Generate documentation from metadata:
- Entity-relationship diagrams
- Data dictionaries
- API specifications

## Dependencies

- `@pgpm/database-jobs`: Background job processing
- `@pgpm/inflection`: String inflection utilities
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
