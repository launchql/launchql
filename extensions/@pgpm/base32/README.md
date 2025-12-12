# @pgpm/base32

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/base32"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Futils%2Fbase32%2Fpackage.json"/></a>
</p>

RFC4648 Base32 encode/decode in plpgsql

## Overview

`@pgpm/base32` implements Base32 encoding and decoding entirely in PostgreSQL using plpgsql. Base32 is commonly used for encoding binary data in a human-readable format, particularly for TOTP secrets, API keys, and other security tokens. This package provides a pure SQL implementation without external dependencies.

## Features

- **Pure plpgsql Implementation**: No external dependencies or libraries required
- **RFC 4648 Compliant**: Follows the Base32 standard
- **Bidirectional Conversion**: Encode to Base32 and decode back to original
- **Case Insensitive**: Handles both uppercase and lowercase Base32 strings
- **TOTP Integration**: Perfect for encoding TOTP secrets
- **Lightweight**: Minimal overhead, runs entirely in PostgreSQL

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/base32
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
pgpm install @pgpm/base32

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
pgpm install @pgpm/base32

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Usage

```sql
select base32.encode('foo');
-- MZXW6===


select base32.decode('MZXW6===');
-- foo
```

## Use Cases

### TOTP Secret Encoding

Base32 is the standard encoding for TOTP secrets:

```sql
-- Generate a random secret and encode it
SELECT base32.encode('randomsecret123');
-- Result: MJQXGZJTGIQGS4ZAON2XAZLSEBRW63LNN5XCA2LOEBRW63LQMFZXG===

-- Use with TOTP
SELECT totp.generate(base32.encode('mysecret'));
```

### API Key Encoding

Encode binary data as human-readable API keys:

```sql
-- Encode a UUID as Base32
SELECT base32.encode(gen_random_uuid()::text);

-- Create a table with Base32-encoded keys
CREATE TABLE api_keys (
  id serial PRIMARY KEY,
  user_id uuid,
  key_encoded text DEFAULT base32.encode(gen_random_bytes(20)::text),
  created_at timestamptz DEFAULT now()
);
```

### Data Obfuscation

Encode sensitive identifiers:

```sql
-- Encode user IDs for public URLs
CREATE FUNCTION get_public_user_id(user_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN base32.encode(user_uuid::text);
END;
$$ LANGUAGE plpgsql;

-- Decode back to UUID
CREATE FUNCTION get_user_from_public_id(public_id text)
RETURNS uuid AS $$
BEGIN
  RETURN base32.decode(public_id)::uuid;
END;
$$ LANGUAGE plpgsql;
```

### File Integrity Verification

Encode checksums and hashes:

```sql
-- Encode a SHA256 hash
SELECT base32.encode(
  encode(digest('file contents', 'sha256'), 'hex')
);
```

## Integration Examples

### With @pgpm/totp

Base32 is essential for TOTP authentication:

```sql
-- Store TOTP secret in Base32 format
CREATE TABLE user_2fa (
  user_id uuid PRIMARY KEY,
  secret_base32 text NOT NULL,
  enabled boolean DEFAULT false
);

-- Generate and store Base32-encoded secret
INSERT INTO user_2fa (user_id, secret_base32)
VALUES (
  'user-uuid',
  base32.encode('randomsecret')
);

-- Generate TOTP code from Base32 secret
SELECT totp.generate(
  base32.decode(secret_base32)
) FROM user_2fa WHERE user_id = 'user-uuid';
```

### With @pgpm/encrypted-secrets

Combine with encrypted secrets for secure storage:

```sql
-- Store Base32-encoded secret encrypted
SELECT encrypted_secrets.secrets_upsert(
  'user-uuid',
  'totp_secret',
  base32.encode('mysecret'),
  'pgp'
);

-- Retrieve and use
SELECT totp.generate(
  base32.decode(
    encrypted_secrets.secrets_getter('user-uuid', 'totp_secret')
  )
);
```

## Character Set

Base32 uses the following character set (RFC 4648):

```
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 2 3 4 5 6 7
```

Padding character: `=`

## Comparison with Base64

Base32 vs Base64:

| Feature | Base32 | Base64 |
|---------|--------|--------|
| Character Set | A-Z, 2-7 | A-Z, a-z, 0-9, +, / |
| Case Sensitive | No | Yes |
| URL Safe | Yes | Requires modification |
| Human Readable | More readable | Less readable |
| Efficiency | ~60% overhead | ~33% overhead |
| Use Case | TOTP, user-facing | General encoding |

Base32 is preferred for TOTP because:
- Case insensitive (easier to type)
- No ambiguous characters (0/O, 1/I/l)
- URL-safe without modification

## Testing

```bash
pnpm test
```

## Dependencies

None - this is a pure plpgsql implementation.

## Credits

Thanks to 

https://tools.ietf.org/html/rfc4648

https://www.youtube.com/watch?v=Va8FLD-iuTg

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
