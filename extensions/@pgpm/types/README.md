# @pgpm/types

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/types"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fdata-types%2Ftypes%2Fpackage.json"/></a>
</p>

Core PostgreSQL data types with SQL scripts.

## Overview

`@pgpm/types` provides a collection of validated PostgreSQL domain types for common data formats. These domains enforce data integrity at the database level through regex-based validation, ensuring that only properly formatted data is stored.

## Features

- **email**: Case-insensitive email address validation
- **url**: HTTP/HTTPS URL validation
- **origin**: Origin URL validation (scheme + host)
- **hostname**: Domain name validation
- **image**: JSON-based image metadata with URL and MIME type
- **attachment**: File attachment metadata as a URL string or JSON with URL and MIME type
- **upload**: File upload metadata
- **single_select**: Single selection field
- **multiple_select**: Multiple selection field

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/types
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
pgpm install @pgpm/types

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
pgpm install @pgpm/types

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Usage

### Creating Tables with Validated Types

```sql
CREATE TABLE customers (
  id serial PRIMARY KEY,
  email email,
  website url,
  domain hostname,
  profile_image image,
  document attachment
);
```

### Email Domain

The `email` domain validates email addresses using a comprehensive regex pattern and stores them as case-insensitive text (`citext`).

```sql
-- Valid emails
INSERT INTO customers (email) VALUES
  ('user@example.com'),
  ('john.doe@company.co.uk'),
  ('support+tag@service.io');

-- Invalid email (will fail)
INSERT INTO customers (email) VALUES ('not-an-email');
-- ERROR: value for domain email violates check constraint
```

**Validation Pattern**: RFC-compliant email format with support for special characters and subdomains.

### URL Domain

The `url` domain validates HTTP and HTTPS URLs.

```sql
-- Valid URLs
INSERT INTO customers (website) VALUES
  ('http://example.com'),
  ('https://www.example.com/path?query=value'),
  ('http://foo.bar/path_(with)_parens');

-- Invalid URLs (will fail)
INSERT INTO customers (website) VALUES
  ('ftp://example.com'),  -- Only http/https allowed
  ('example.com'),        -- Missing protocol
  ('http://');            -- Incomplete URL
```

**Validation Pattern**: Requires `http://` or `https://` protocol and valid URL structure.

### Hostname Domain

The `hostname` domain validates domain names without protocol or path.

```sql
-- Valid hostnames
INSERT INTO customers (domain) VALUES
  ('example.com'),
  ('subdomain.example.com'),
  ('my-site.co.uk');

-- Invalid hostnames (will fail)
INSERT INTO customers (domain) VALUES
  ('http://example.com'),           -- No protocol allowed
  ('example.com/path'),              -- No path allowed
  ('invalid..domain.com');           -- Invalid format
```

**Validation Pattern**: Standard domain name format with support for subdomains and hyphens.

### Image and Attachment Domains

The `image` domain stores JSON objects with URL and MIME type information. The `attachment` domain accepts either that JSON shape or a plain URL string.
The `upload` domain uses the same JSON object shape as `image`, ensuring both the file URL and MIME type are present.

```sql
-- Valid image
INSERT INTO customers (profile_image) VALUES
  ('{"url": "https://cdn.example.com/photo.jpg", "mime": "image/jpeg"}'::json);

-- Valid attachment
INSERT INTO customers (document) VALUES
  ('{"url": "https://storage.example.com/file.pdf", "mime": "application/pdf"}'::json);

-- Valid attachment as plain URL
INSERT INTO customers (document) VALUES ('https://storage.example.com/favicon.ico');
```

**Structure**: Image values and JSON-form attachments expect `url` and `mime` properties; attachments also allow a bare URL string.

## Domain Types Reference

| Domain | Base Type | Description | Example |
|--------|-----------|-------------|---------|
| `email` | `citext` | Case-insensitive email address | `user@example.com` |
| `url` | `text` | HTTP/HTTPS URL | `https://example.com/path` |
| `origin` | `text` | Origin (scheme + host) | `https://example.com` |
| `hostname` | `text` | Domain name without protocol | `example.com` |
| `image` | `json` | Image metadata with URL and MIME | `{"url": "...", "mime": "image/jpeg"}` |
| `attachment` | `json` | File attachment URL or metadata | `{"url": "...", "mime": "application/pdf"}` or `https://example.com/favicon.ico` |
| `upload` | `json` | File upload metadata (URL + MIME) | `{"url": "...", "mime": "application/pdf"}` |
| `single_select` | `text` | Single selection value | Text value |
| `multiple_select` | `text[]` | Multiple selection values | Array of text values |

## Validation Benefits

Using domain types provides several advantages over plain text columns:

1. **Data Integrity**: Invalid data is rejected at insert/update time
2. **Self-Documenting**: Column types clearly indicate expected format
3. **Consistent Validation**: Same rules applied across all tables
4. **Database-Level Enforcement**: No reliance on application-level validation alone

## Dependencies

- `@pgpm/verify`: Verification utilities for database objects
- PostgreSQL `citext` extension (for email domain)

## Testing

```bash
pnpm test
```

The test suite validates:
- Email format validation (valid and invalid cases)
- URL format validation with extensive test cases
- Hostname format validation
- Image, upload, and attachment JSON structure validation

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
