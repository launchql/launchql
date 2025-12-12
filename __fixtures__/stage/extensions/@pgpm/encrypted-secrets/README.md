# @pgpm/encrypted-secrets

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/encrypted-secrets"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fsecurity%2Fencrypted-secrets%2Fpackage.json"/></a>
</p>

Encrypted secrets management for PostgreSQL.

## Overview

`@pgpm/encrypted-secrets` provides a comprehensive API layer for managing encrypted secrets in PostgreSQL. Built on top of `@pgpm/encrypted-secrets-table`, this package offers high-level functions for storing, retrieving, verifying, and deleting encrypted secrets with support for multiple encryption methods (PGP and crypt). It includes role-based access control and integrates seamlessly with PostgreSQL's encryption extensions.

## Features

- **Multiple Encryption Methods**: Support for PGP symmetric encryption and crypt hashing
- **High-Level API**: Simple functions for secret management (upsert, get, verify, delete)
- **Role-Based Access**: Grants execute permissions to authenticated users
- **Automatic Encryption**: Secrets are encrypted before storage
- **Verification Support**: Verify secrets without exposing stored values
- **Batch Operations**: Delete multiple secrets at once
- **Default Values**: Return default values when secrets don't exist

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/encrypted-secrets
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
pgpm install @pgpm/encrypted-secrets

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
pgpm install @pgpm/encrypted-secrets

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Functions

### encrypted_secrets.secrets_upsert()

Insert or update a secret.

**Signature:**
```sql
encrypted_secrets.secrets_upsert(
  v_secrets_owned_field uuid,
  secret_name text,
  secret_value text,
  field_encoding text DEFAULT 'pgp'
) RETURNS boolean
```

**Parameters:**
- `v_secrets_owned_field`: UUID of the entity that owns this secret
- `secret_name`: Name/identifier for the secret
- `secret_value`: The secret value to encrypt and store
- `field_encoding`: Encryption method ('pgp' or 'crypt')

**Returns:** `TRUE` on success

**Usage:**
```sql
-- Store a secret with PGP encryption
SELECT encrypted_secrets.secrets_upsert(
  'user-uuid',
  'github_token',
  'ghp_xxxxxxxxxxxx',
  'pgp'
);

-- Store a password with crypt hashing
SELECT encrypted_secrets.secrets_upsert(
  'user-uuid',
  'password',
  'my-secure-password',
  'crypt'
);
```

### encrypted_secrets.secrets_getter()

Retrieve and decrypt a secret.

**Signature:**
```sql
encrypted_secrets.secrets_getter(
  secrets_owned_field uuid,
  secret_name text,
  default_value text DEFAULT NULL
) RETURNS text
```

**Parameters:**
- `secrets_owned_field`: UUID of the secret owner
- `secret_name`: Name of the secret to retrieve
- `default_value`: Value to return if secret doesn't exist

**Returns:** Decrypted secret value or default value

**Usage:**
```sql
-- Get a secret
SELECT encrypted_secrets.secrets_getter(
  'user-uuid',
  'github_token'
);

-- Get a secret with default value
SELECT encrypted_secrets.secrets_getter(
  'user-uuid',
  'api_key',
  'default-key-value'
);
```

### encrypted_secrets.secrets_verify()

Verify a secret without retrieving it.

**Signature:**
```sql
encrypted_secrets.secrets_verify(
  secrets_owned_field uuid,
  secret_name text,
  secret_value text
) RETURNS boolean
```

**Parameters:**
- `secrets_owned_field`: UUID of the secret owner
- `secret_name`: Name of the secret to verify
- `secret_value`: Value to verify against stored secret

**Returns:** `TRUE` if values match, `FALSE` otherwise

**Usage:**
```sql
-- Verify a password
SELECT encrypted_secrets.secrets_verify(
  'user-uuid',
  'password',
  'user-provided-password'
);

-- Use in authentication
DO $$
DECLARE
  is_valid boolean;
BEGIN
  SELECT encrypted_secrets.secrets_verify(
    current_user_id(),
    'password',
    'user-input'
  ) INTO is_valid;
  
  IF NOT is_valid THEN
    RAISE EXCEPTION 'Invalid password';
  END IF;
END $$;
```

### encrypted_secrets.secrets_delete()

Delete one or more secrets.

**Signatures:**
```sql
-- Delete single secret
encrypted_secrets.secrets_delete(
  secrets_owned_field uuid,
  secret_name text
) RETURNS void

-- Delete multiple secrets
encrypted_secrets.secrets_delete(
  secrets_owned_field uuid,
  secret_names text[]
) RETURNS void
```

**Usage:**
```sql
-- Delete a single secret
SELECT encrypted_secrets.secrets_delete(
  'user-uuid',
  'old_api_key'
);

-- Delete multiple secrets
SELECT encrypted_secrets.secrets_delete(
  'user-uuid',
  ARRAY['temp_token', 'expired_key', 'old_password']
);
```

## Encryption Methods

### PGP Encryption

PGP (Pretty Good Privacy) symmetric encryption provides strong encryption for secrets:

```sql
-- Store with PGP
SELECT encrypted_secrets.secrets_upsert(
  'owner-uuid',
  'api_key',
  'secret-value',
  'pgp'
);

-- Retrieval automatically decrypts
SELECT encrypted_secrets.secrets_getter('owner-uuid', 'api_key');
```

**Characteristics:**
- Reversible encryption (can decrypt)
- Uses owner UUID as encryption key
- Suitable for API keys, tokens, connection strings

### Crypt Hashing

Crypt provides one-way hashing for passwords:

```sql
-- Store with crypt
SELECT encrypted_secrets.secrets_upsert(
  'user-uuid',
  'password',
  'user-password',
  'crypt'
);

-- Verify password
SELECT encrypted_secrets.secrets_verify(
  'user-uuid',
  'password',
  'user-provided-password'
);
```

**Characteristics:**
- One-way hashing (cannot decrypt)
- Suitable for passwords
- Use `secrets_verify()` to check passwords

## Usage Patterns

### User Authentication

```sql
-- Register user with password
SELECT encrypted_secrets.secrets_upsert(
  user_id,
  'password',
  'user-chosen-password',
  'crypt'
);

-- Login verification
CREATE FUNCTION authenticate_user(
  p_user_id uuid,
  p_password text
) RETURNS boolean AS $$
BEGIN
  RETURN encrypted_secrets.secrets_verify(
    p_user_id,
    'password',
    p_password
  );
END;
$$ LANGUAGE plpgsql;
```

### API Key Management

```sql
-- Store API keys for a service
SELECT encrypted_secrets.secrets_upsert(
  organization_id,
  'stripe_secret_key',
  'sk_live_xxxxxxxxxxxx',
  'pgp'
);

SELECT encrypted_secrets.secrets_upsert(
  organization_id,
  'stripe_publishable_key',
  'pk_live_xxxxxxxxxxxx',
  'pgp'
);

-- Retrieve for use
CREATE FUNCTION get_stripe_config(org_id uuid)
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'secret_key', encrypted_secrets.secrets_getter(org_id, 'stripe_secret_key'),
    'publishable_key', encrypted_secrets.secrets_getter(org_id, 'stripe_publishable_key')
  );
END;
$$ LANGUAGE plpgsql;
```

### Database Credentials

```sql
-- Store database connection strings
SELECT encrypted_secrets.secrets_upsert(
  app_id,
  'db_connection_string',
  'postgresql://user:pass@host:5432/db',
  'pgp'
);

-- Retrieve for connection
SELECT encrypted_secrets.secrets_getter(
  app_id,
  'db_connection_string'
);
```

### Secret Rotation

```sql
-- Rotate an API key
DO $$
DECLARE
  old_key text;
BEGIN
  -- Get old key for migration
  old_key := encrypted_secrets.secrets_getter('org-uuid', 'api_key');
  
  -- Store new key
  PERFORM encrypted_secrets.secrets_upsert(
    'org-uuid',
    'api_key',
    'new-api-key-value',
    'pgp'
  );
  
  -- Optionally keep old key temporarily
  PERFORM encrypted_secrets.secrets_upsert(
    'org-uuid',
    'api_key_old',
    old_key,
    'pgp'
  );
END $$;
```

## Security Considerations

1. **Encryption Keys**: The PGP encryption uses the owner UUID as the encryption key. Ensure UUIDs are not exposed.

2. **Access Control**: Functions are granted to `authenticated` role. Use RLS on the underlying table for additional security.

3. **Audit Logging**: Consider logging secret access:
```sql
CREATE TABLE secret_access_log (
  id serial PRIMARY KEY,
  owner_id uuid,
  secret_name text,
  accessed_at timestamptz DEFAULT now(),
  accessed_by uuid
);

-- Wrap getter with logging
CREATE FUNCTION get_secret_with_audit(
  owner_id uuid,
  secret_name text
) RETURNS text AS $$
DECLARE
  secret_value text;
BEGIN
  secret_value := encrypted_secrets.secrets_getter(owner_id, secret_name);
  
  INSERT INTO secret_access_log (owner_id, secret_name, accessed_by)
  VALUES (owner_id, secret_name, current_user_id());
  
  RETURN secret_value;
END;
$$ LANGUAGE plpgsql;
```

4. **Never Log Secrets**: Ensure application logs don't capture decrypted values.

5. **Use HTTPS**: Always transmit secrets over encrypted connections.

## Integration with Other Packages

### With @pgpm/encrypted-secrets-table

This package builds directly on the storage layer:

```sql
-- High-level API (this package)
SELECT encrypted_secrets.secrets_upsert('uuid', 'key', 'value');

-- Low-level storage (encrypted-secrets-table)
SELECT * FROM secrets_schema.secrets_table WHERE secrets_owned_field = 'uuid';
```

### With @pgpm/default-roles

Combine with role-based access control:

```sql
-- Only authenticated users can manage secrets
GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_upsert TO authenticated;
GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_getter TO authenticated;
GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_verify TO authenticated;
GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_delete TO authenticated;
```

### With @pgpm/jwt-claims

Use JWT claims for owner context:

```sql
-- Store secret for current user
SELECT encrypted_secrets.secrets_upsert(
  jwt_public.current_user_id(),
  'personal_api_key',
  'key-value',
  'pgp'
);

-- Get secret for current user
SELECT encrypted_secrets.secrets_getter(
  jwt_public.current_user_id(),
  'personal_api_key'
);
```

## Dependencies

- `@pgpm/default-roles`: Role-based access control
- `@pgpm/encrypted-secrets-table`: Storage layer
- `@pgpm/verify`: Verification utilities
- PostgreSQL pgcrypto extension (for encryption functions)

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
