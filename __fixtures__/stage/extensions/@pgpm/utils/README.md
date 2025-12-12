# @pgpm/utils

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/utils"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Futils%2Futils%2Fpackage.json"/></a>
</p>

General utility functions for PostgreSQL extensions

## Overview

`@pgpm/utils` provides essential utility functions and helper procedures used across LaunchQL extension modules. This package includes functions for error handling, data masking, and singleton pattern enforcement. These utilities form the foundation for building robust PostgreSQL extensions with consistent error handling and data protection patterns.

## Features

- **Error Handling**: Throw custom exceptions with detailed messages
- **Data Masking**: Mask sensitive data with padding characters
- **Singleton Enforcement**: Ensure tables contain exactly one row
- **Reusable Utilities**: Common functions used across multiple extensions
- **Pure plpgsql**: No external dependencies required

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/utils
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
pgpm install @pgpm/utils

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
pgpm install @pgpm/utils

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Functions

### utils.throw(message text)

Throw a custom exception with a specific message.

**Signature:**
```sql
utils.throw(message text) RETURNS void
```

**Usage:**
```sql
-- Throw an error
SELECT utils.throw('Invalid user ID provided');
-- ERROR: Invalid user ID provided

-- Use in conditional logic
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'some-uuid') THEN
    PERFORM utils.throw('User not found');
  END IF;
END $$;

-- Use in functions
CREATE FUNCTION validate_email(email text)
RETURNS boolean AS $$
BEGIN
  IF email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
    PERFORM utils.throw('Invalid email format: ' || email);
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

### utils.mask_pad(value text, visible_chars int, pad_char text)

Mask sensitive data by showing only a specified number of characters and padding the rest.

**Signature:**
```sql
utils.mask_pad(
  value text,
  visible_chars int DEFAULT 4,
  pad_char text DEFAULT '*'
) RETURNS text
```

**Parameters:**
- `value`: The text to mask
- `visible_chars`: Number of characters to show at the end (default: 4)
- `pad_char`: Character to use for masking (default: '*')

**Usage:**
```sql
-- Mask credit card number
SELECT utils.mask_pad('4532123456789012', 4, '*');
-- ************9012

-- Mask email
SELECT utils.mask_pad('user@example.com', 6, 'x');
-- xxxxxxxxple.com

-- Mask phone number
SELECT utils.mask_pad('+1-555-123-4567', 4, '#');
-- ###########4567

-- Use in queries
SELECT 
  user_id,
  utils.mask_pad(credit_card, 4, '*') as masked_card,
  utils.mask_pad(ssn, 4, 'X') as masked_ssn
FROM sensitive_data;
```

### utils.ensure_singleton()

Trigger function to ensure a table contains exactly one row.

**Signature:**
```sql
utils.ensure_singleton() RETURNS trigger
```

**Usage:**
```sql
-- Create a settings table that should only have one row
CREATE TABLE app_settings (
  id int PRIMARY KEY DEFAULT 1,
  app_name text NOT NULL,
  max_users int DEFAULT 100,
  maintenance_mode boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT singleton_check CHECK (id = 1)
);

-- Add trigger to enforce singleton pattern
CREATE TRIGGER ensure_singleton_trigger
  BEFORE INSERT OR UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION utils.ensure_singleton();

-- First insert works
INSERT INTO app_settings (app_name) VALUES ('My App');

-- Second insert fails
INSERT INTO app_settings (app_name) VALUES ('Another App');
-- ERROR: Table app_settings can only contain one row

-- Updates work fine
UPDATE app_settings SET max_users = 200;
```

## Usage Examples

### Error Handling in Business Logic

Use `utils.throw()` for consistent error handling:

```sql
CREATE FUNCTION process_payment(
  user_id uuid,
  amount numeric
) RETURNS void AS $$
DECLARE
  user_balance numeric;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    PERFORM utils.throw('User not found: ' || user_id);
  END IF;
  
  -- Check balance
  SELECT balance INTO user_balance FROM accounts WHERE user_id = user_id;
  
  IF user_balance IS NULL THEN
    PERFORM utils.throw('Account not found for user: ' || user_id);
  END IF;
  
  IF user_balance < amount THEN
    PERFORM utils.throw('Insufficient funds. Balance: ' || user_balance || ', Required: ' || amount);
  END IF;
  
  -- Process payment
  UPDATE accounts SET balance = balance - amount WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql;
```

### Data Masking for Privacy

Protect sensitive data in logs and reports:

```sql
-- Create view with masked data for reporting
CREATE VIEW user_report AS
SELECT 
  id,
  username,
  utils.mask_pad(email, 8, '*') as email,
  utils.mask_pad(phone, 4, 'X') as phone,
  utils.mask_pad(credit_card, 4, '*') as credit_card,
  created_at
FROM users;

-- Audit log with masked sensitive data
CREATE FUNCTION log_user_access(user_id uuid)
RETURNS void AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM users WHERE id = user_id;
  
  INSERT INTO access_logs (user_id, masked_email, accessed_at)
  VALUES (user_id, utils.mask_pad(user_email, 6, '*'), now());
END;
$$ LANGUAGE plpgsql;
```

### Singleton Configuration Tables

Ensure configuration tables have exactly one row:

```sql
-- System configuration table
CREATE TABLE system_config (
  id int PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL,
  admin_email text NOT NULL,
  max_upload_size_mb int DEFAULT 10,
  enable_registration boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT singleton_check CHECK (id = 1)
);

CREATE TRIGGER ensure_singleton_trigger
  BEFORE INSERT OR UPDATE ON system_config
  FOR EACH ROW
  EXECUTE FUNCTION utils.ensure_singleton();

-- Initialize with default values
INSERT INTO system_config (site_name, admin_email)
VALUES ('My Application', 'admin@example.com');

-- Helper function to get config
CREATE FUNCTION get_config()
RETURNS system_config AS $$
  SELECT * FROM system_config LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Helper function to update config
CREATE FUNCTION update_config(
  p_site_name text DEFAULT NULL,
  p_admin_email text DEFAULT NULL,
  p_max_upload_size_mb int DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE system_config SET
    site_name = COALESCE(p_site_name, site_name),
    admin_email = COALESCE(p_admin_email, admin_email),
    max_upload_size_mb = COALESCE(p_max_upload_size_mb, max_upload_size_mb),
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
```

## Integration Examples

### With @pgpm/encrypted-secrets

Combine error handling with secrets management:

```sql
CREATE FUNCTION get_api_key(service_name text)
RETURNS text AS $$
DECLARE
  api_key text;
BEGIN
  api_key := encrypted_secrets.secrets_getter(
    current_user_id(),
    service_name
  );
  
  IF api_key IS NULL THEN
    PERFORM utils.throw('API key not found for service: ' || service_name);
  END IF;
  
  RETURN api_key;
END;
$$ LANGUAGE plpgsql;
```

### With @pgpm/jobs

Use error handling in job processing:

```sql
CREATE FUNCTION process_job_with_validation(job_id int)
RETURNS void AS $$
DECLARE
  job_data jsonb;
BEGIN
  SELECT payload INTO job_data FROM app_jobs.jobs WHERE id = job_id;
  
  IF job_data IS NULL THEN
    PERFORM utils.throw('Job not found: ' || job_id);
  END IF;
  
  IF NOT (job_data ? 'email') THEN
    PERFORM utils.throw('Job payload missing required field: email');
  END IF;
  
  -- Process job
  -- ...
END;
$$ LANGUAGE plpgsql;
```

### With @pgpm/achievements

Mask user data in achievement displays:

```sql
CREATE VIEW public_achievements AS
SELECT 
  utils.mask_pad(u.email, 8, '*') as masked_email,
  a.achievement_name,
  a.count,
  a.achieved_at
FROM user_achievements a
JOIN users u ON u.id = a.user_id
WHERE a.achieved_at IS NOT NULL;
```

## Use Cases

- **Error Handling**: Consistent exception throwing across extensions
- **Data Privacy**: Mask sensitive information in logs and reports
- **Configuration Management**: Singleton tables for application settings
- **Validation**: Input validation with clear error messages
- **Audit Logging**: Log events with masked sensitive data
- **API Responses**: Return masked data to clients
- **Development**: Shared utilities for extension development

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
