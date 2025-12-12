# @pgpm/totp

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/totp"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fsecurity%2Ftotp%2Fpackage.json"/></a>
</p>

TOTP implementation in pure PostgreSQL plpgsql

This extension provides the HMAC Time-Based One-Time Password Algorithm (TOTP) as specified in RFC 4226 as pure plpgsql functions.

## Overview

`@pgpm/totp` implements Time-based One-Time Password (TOTP) authentication entirely in PostgreSQL using plpgsql. This package enables two-factor authentication (2FA) directly in your database without external dependencies. It supports TOTP code generation, verification, and QR code URL generation for authenticator apps like Google Authenticator, Authy, and 1Password.

## Features

- **Pure plpgsql Implementation**: No external dependencies or libraries required
- **TOTP Code Generation**: Generate 6-digit time-based codes
- **Code Verification**: Verify user-provided TOTP codes
- **QR Code URLs**: Generate otpauth:// URLs for authenticator apps
- **Configurable Parameters**: Customize interval and code length
- **RFC 4226 Compliant**: Follows the HOTP standard
- **Base32 Integration**: Uses `@pgpm/base32` for secret encoding

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/totp
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
pgpm install @pgpm/totp

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
pgpm install @pgpm/totp

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Usage

## totp.generate

```sql
SELECT totp.generate('mysecret');

-- you can also specify totp_interval, and totp_length
SELECT totp.generate('mysecret', 30, 6);
```

In this case, produces a TOTP code of length 6

```
013438
```

## totp.verify

```sql
SELECT totp.verify('mysecret', '765430');

-- you can also specify totp_interval, and totp_length
SELECT totp.verify('mysecret', '765430', 30, 6);
```

Depending on input, returns `TRUE/FALSE` 

## totp.url

```sql
-- totp.url ( email text, totp_secret text, totp_interval int, totp_issuer text )
SELECT totp.url(
    'customer@email.com',
    'mysecret',
    30,
    'Acme Inc'
);
```

Will produce a URL-encoded string

```
otpauth://totp/customer@email.com?secret=mysecret&period=30&issuer=Acme%20Inc
```

## Integration Examples

### User Registration with 2FA

```sql
-- Store TOTP secret for user
CREATE TABLE user_totp (
  user_id uuid PRIMARY KEY,
  totp_secret text NOT NULL,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Generate and store secret for new user
INSERT INTO user_totp (user_id, totp_secret)
VALUES ('user-uuid', 'mysecret');

-- Get QR code URL for user to scan
SELECT totp.url(
  'user@example.com',
  totp_secret,
  30,
  'My App'
) FROM user_totp WHERE user_id = 'user-uuid';
```

### Login Verification

```sql
-- Verify TOTP code during login
CREATE FUNCTION verify_user_totp(
  p_user_id uuid,
  p_code text
) RETURNS boolean AS $$
DECLARE
  v_secret text;
BEGIN
  SELECT totp_secret INTO v_secret
  FROM user_totp
  WHERE user_id = p_user_id AND enabled = true;
  
  IF v_secret IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN totp.verify(v_secret, p_code, 30, 6);
END;
$$ LANGUAGE plpgsql;
```

### Enable 2FA Flow

```sql
-- 1. Generate secret and QR code URL
SELECT totp.url('user@example.com', 'newsecret', 30, 'My App');

-- 2. User scans QR code with authenticator app

-- 3. User provides first code to verify setup
SELECT totp.verify('newsecret', '123456', 30, 6);

-- 4. If verified, enable 2FA
UPDATE user_totp
SET enabled = true
WHERE user_id = 'user-uuid';
```

## Use Cases

- **Two-Factor Authentication (2FA)**: Add an extra layer of security to user logins
- **API Access Tokens**: Generate time-based tokens for API authentication
- **Transaction Verification**: Require TOTP codes for sensitive operations
- **Admin Access**: Require 2FA for administrative functions
- **Password Reset**: Use TOTP as part of password reset flow

## Dependencies

- `@pgpm/base32`: Base32 encoding for TOTP secrets
- `@pgpm/verify`: Verification utilities

## Testing

```bash
pnpm test
```

## Caveats

Currently only supports `sha1`, pull requests welcome!

## Debugging

use the verbose option to show keys

```sh
$ oathtool --totp -v -d 7 -s 10s -b OH3NUPO3WOGOZZQ4
Hex secret: 71f6da3ddbb38cece61c
Base32 secret: OH3NUPO3WOGOZZQ4
Digits: 7
Window size: 0
TOTP mode: SHA1
Step size (seconds): 10
Start time: 1970-01-01 00:00:00 UTC (0)
Current time: 2020-11-18 12:35:08 UTC (1605702908)
Counter: 0x9921BB2 (160570290)
```

using time for testing

oathtool --totp -v -d 6 -s 30s -b vmlhl2knm27eftq7 --now "2020-02-05 22:11:40 UTC"

## Credits

Thanks to 

https://tools.ietf.org/html/rfc6238

https://www.youtube.com/watch?v=VOYxF12K1vE

https://pgxn.org/dist/otp/

And major improvements from 

https://gist.github.com/bwbroersma/676d0de32263ed554584ab132434ebd9

---

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
