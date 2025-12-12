# @pgpm/inflection

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/inflection"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Futils%2Finflection%2Fpackage.json"/></a>
</p>

String inflection utilities for PostgreSQL naming conventions

## Overview

`@pgpm/inflection` provides comprehensive string transformation functions for PostgreSQL, enabling seamless conversion between different naming conventions. This package is essential for code generation, schema introspection, and maintaining consistent naming patterns across your database. It includes pluralization, singularization, case conversion, and slugification utilities.

## Features

- **Case Conversion**: Transform between camelCase, PascalCase, snake_case, and kebab-case
- **Pluralization**: Convert singular words to plural forms with English grammar rules
- **Singularization**: Convert plural words to singular forms
- **Slugification**: Create URL-friendly slugs from strings
- **Rule-Based System**: Extensible inflection rules stored in database table
- **Uncountable Words**: Handles special cases like "sheep", "fish", "data"
- **Pure plpgsql**: No external dependencies required

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/inflection
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
pgpm install @pgpm/inflection

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
pgpm install @pgpm/inflection

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Functions

### Case Conversion Functions

#### inflection.camel(text)

Convert string to camelCase.

```sql
SELECT inflection.camel('user_profile_image');
-- userProfileImage

SELECT inflection.camel('UserProfileImage');
-- userProfileImage

SELECT inflection.camel('user-profile-image');
-- userProfileImage
```

#### inflection.pascal(text)

Convert string to PascalCase.

```sql
SELECT inflection.pascal('user_profile_image');
-- UserProfileImage

SELECT inflection.pascal('user-profile-image');
-- UserProfileImage
```

#### inflection.underscore(text)

Convert string to snake_case.

```sql
SELECT inflection.underscore('UserProfileImage');
-- user_profile_image

SELECT inflection.underscore('userProfileImage');
-- user_profile_image

SELECT inflection.underscore('user-profile-image');
-- user_profile_image
```

#### inflection.dashed(text)

Convert string to kebab-case.

```sql
SELECT inflection.dashed('UserProfileImage');
-- user-profile-image

SELECT inflection.dashed('user_profile_image');
-- user-profile-image
```

### Pluralization Functions

#### inflection.plural(text)

Convert singular word to plural form.

```sql
SELECT inflection.plural('user');
-- users

SELECT inflection.plural('person');
-- people

SELECT inflection.plural('child');
-- children

SELECT inflection.plural('category');
-- categories

SELECT inflection.plural('status');
-- statuses
```

#### inflection.singular(text)

Convert plural word to singular form.

```sql
SELECT inflection.singular('users');
-- user

SELECT inflection.singular('people');
-- person

SELECT inflection.singular('children');
-- child

SELECT inflection.singular('categories');
-- category
```

### Slugification Functions

#### inflection.slugify(text)

Create URL-friendly slug from string.

```sql
SELECT inflection.slugify('Hello World!');
-- hello-world

SELECT inflection.slugify('User Profile & Settings');
-- user-profile-settings

SELECT inflection.slugify('  Multiple   Spaces  ');
-- multiple-spaces
```

## Usage Examples

### Database Schema Generation

Generate table and column names following conventions:

```sql
-- Convert API field names to database columns
CREATE TABLE users (
  id uuid PRIMARY KEY,
  user_name text,  -- from userName
  email_address text,  -- from emailAddress
  created_at timestamptz DEFAULT now()
);

-- Function to convert camelCase to snake_case
CREATE FUNCTION api_to_db_column(field_name text)
RETURNS text AS $$
BEGIN
  RETURN inflection.underscore(field_name);
END;
$$ LANGUAGE plpgsql;

SELECT api_to_db_column('firstName');  -- first_name
SELECT api_to_db_column('emailAddress');  -- email_address
```

### GraphQL Schema Generation

Generate GraphQL type names from database tables:

```sql
-- Convert table names to GraphQL types
SELECT inflection.pascal(inflection.singular(table_name)) as graphql_type
FROM information_schema.tables
WHERE table_schema = 'public';

-- user_profiles → UserProfile
-- blog_posts → BlogPost
-- categories → Category
```

### REST API Endpoint Generation

Create consistent API endpoints:

```sql
-- Generate REST endpoints from table names
SELECT 
  '/' || inflection.dashed(inflection.plural(table_name)) as endpoint,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- users → /users
-- blog_posts → /blog-posts
-- user_profiles → /user-profiles
```

### Code Generation

Generate TypeScript interfaces from database schema:

```sql
-- Generate TypeScript interface names
CREATE FUNCTION generate_ts_interface(table_name text)
RETURNS text AS $$
BEGIN
  RETURN 'export interface ' || 
         inflection.pascal(inflection.singular(table_name)) || 
         ' {';
END;
$$ LANGUAGE plpgsql;

SELECT generate_ts_interface('user_profiles');
-- export interface UserProfile {
```

### URL Slug Generation

Create SEO-friendly URLs:

```sql
-- Generate slugs for blog posts
CREATE TABLE blog_posts (
  id serial PRIMARY KEY,
  title text NOT NULL,
  slug text GENERATED ALWAYS AS (inflection.slugify(title)) STORED,
  content text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO blog_posts (title, content)
VALUES ('How to Use PostgreSQL', 'Content here...');

SELECT slug FROM blog_posts;
-- how-to-use-postgresql
```

## Integration Examples

### With @pgpm/db-meta-schema

Use inflection for schema introspection and code generation:

```sql
-- Generate model names from tables
SELECT 
  table_name,
  inflection.pascal(inflection.singular(table_name)) as model_name,
  inflection.camel(inflection.plural(table_name)) as collection_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- user_profiles → UserProfile (model), userProfiles (collection)
-- blog_posts → BlogPost (model), blogPosts (collection)
```

### With @pgpm/utils

Combine with other utilities for advanced transformations:

```sql
-- Generate API response field names
SELECT 
  column_name,
  inflection.camel(column_name) as api_field_name
FROM information_schema.columns
WHERE table_name = 'users';

-- user_name → userName
-- email_address → emailAddress
-- created_at → createdAt
```

## Inflection Rules

The package uses a rule-based system stored in the `inflection.inflection_rules` table:

```sql
-- View pluralization rules
SELECT * FROM inflection.inflection_rules WHERE type = 'plural';

-- View singularization rules
SELECT * FROM inflection.inflection_rules WHERE type = 'singular';
```

### Adding Custom Rules

You can extend the inflection system with custom rules:

```sql
-- Add custom pluralization rule
INSERT INTO inflection.inflection_rules (type, test, replacement)
VALUES ('plural', '(ox)$', '\1en');

-- Now "ox" → "oxen"
SELECT inflection.plural('ox');
-- oxen
```

### Uncountable Words

Some words don't change between singular and plural:

```sql
SELECT inflection.plural('sheep');
-- sheep

SELECT inflection.plural('fish');
-- fish

SELECT inflection.plural('data');
-- data
```

## Use Cases

- **ORM Code Generation**: Generate model classes from database tables
- **API Development**: Convert between database and API naming conventions
- **GraphQL Schema**: Generate GraphQL types from database schema
- **Documentation**: Create consistent naming in generated documentation
- **Migration Scripts**: Transform legacy naming to modern conventions
- **URL Generation**: Create SEO-friendly slugs for content
- **Multi-Language Support**: Handle naming conventions across different programming languages

## Testing

```bash
pnpm test
```

## Dependencies

- `@pgpm/verify`: Verification utilities

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
