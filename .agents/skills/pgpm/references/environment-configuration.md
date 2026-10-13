# Environment Configuration with @pgpmjs/env

Unified environment configuration for PGPM and Constructive projects. Provides config file discovery, environment variable parsing, and hierarchical option merging.

## When to Apply

Use this skill when:
- Configuring PostgreSQL connections programmatically
- Setting up PGPM environment options
- Managing database configuration across environments
- Writing code that needs consistent environment handling

## Installation

```bash
pnpm add @pgpmjs/env
```

## Core Concepts

### Configuration Hierarchy

Options are merged in this order (later overrides earlier):

1. **PGPM defaults** — Built-in sensible defaults
2. **Config file** — `pgpm.json` discovered via walkUp
3. **Environment variables** — `PGHOST`, `PGPORT`, etc.
4. **Runtime overrides** — Passed programmatically

## Basic Usage

### getEnvOptions()

Get merged PGPM options:

```typescript
import { getEnvOptions } from '@pgpmjs/env';

const options = getEnvOptions();
// Returns merged options from defaults + config + env vars

// With runtime overrides
const options = getEnvOptions({
  pg: { database: 'mydb' }
});

// With custom working directory
const options = getEnvOptions({}, '/path/to/project');
```

### getConnEnvOptions()

Get database connection options specifically:

```typescript
import { getConnEnvOptions } from '@pgpmjs/env';

const connOptions = getConnEnvOptions();
// Returns db-specific options with roles and connections resolved
```

### getDeploymentEnvOptions()

Get deployment-specific options:

```typescript
import { getDeploymentEnvOptions } from '@pgpmjs/env';

const deployOptions = getDeploymentEnvOptions();
// Returns deployment options (useTx, fast, usePlan, etc.)
```

## Environment Variables

### PostgreSQL Connection

| Variable | Description | Default |
|----------|-------------|---------|
| `PGHOST` | Database host | `localhost` |
| `PGPORT` | Database port | `5432` |
| `PGDATABASE` | Database name | — |
| `PGUSER` | Database user | `postgres` |
| `PGPASSWORD` | Database password | — |

### Database Configuration

| Variable | Description |
|----------|-------------|
| `PGROOTDATABASE` | Root database for admin operations |
| `PGTEMPLATE` | Template database for createdb |
| `DB_PREFIX` | Prefix for database names |
| `DB_EXTENSIONS` | Comma-separated list of extensions |
| `DB_CWD` | Working directory for database operations |

### Connection Credentials

| Variable | Description |
|----------|-------------|
| `DB_CONNECTION_USER` | App connection user |
| `DB_CONNECTION_PASSWORD` | App connection password |
| `DB_CONNECTION_ROLE` | App connection role |
| `DB_CONNECTIONS_APP_USER` | App-level user |
| `DB_CONNECTIONS_APP_PASSWORD` | App-level password |
| `DB_CONNECTIONS_ADMIN_USER` | Admin-level user |
| `DB_CONNECTIONS_ADMIN_PASSWORD` | Admin-level password |

### Deployment Options

| Variable | Description |
|----------|-------------|
| `DEPLOYMENT_USE_TX` | Use transactions for deployment |
| `DEPLOYMENT_FAST` | Fast deployment mode |
| `DEPLOYMENT_USE_PLAN` | Use deployment plan |
| `DEPLOYMENT_CACHE` | Enable deployment caching |
| `DEPLOYMENT_TO_CHANGE` | Deploy to specific change |

### Server Configuration

| Variable | Description |
|----------|-------------|
| `PORT` | Server port |
| `SERVER_HOST` | Server host |
| `SERVER_TRUST_PROXY` | Trust proxy headers |
| `SERVER_ORIGIN` | Server origin URL |
| `SERVER_STRICT_AUTH` | Strict authentication mode |

### Storage

Endpoint, provider, region, bucket and public URL prefix are never env: they
are `metaschema_modules_public.storage_module` rows (NULL inherits the platform
database's `platform` plane). Only the credentials are env, and both are
required wherever storage is used:

| Variable | Description |
|----------|-------------|
| `STORAGE_ACCESS_KEY_ID` | Object-store access key |
| `STORAGE_SECRET_ACCESS_KEY` | Object-store secret key |

### Jobs Configuration

| Variable | Description |
|----------|-------------|
| `JOBS_SCHEMA` | Schema for job tables |
| `JOBS_SUPPORT_ANY` | Support any job type |
| `JOBS_SUPPORTED` | Comma-separated supported job types |
| `INTERNAL_GATEWAY_URL` | Internal gateway URL |
| `INTERNAL_JOBS_CALLBACK_URL` | Jobs callback URL |
| `INTERNAL_JOBS_CALLBACK_PORT` | Jobs callback port |

### Error Output

| Variable | Description |
|----------|-------------|
| `PGPM_ERROR_QUERY_HISTORY_LIMIT` | Query history limit in errors |
| `PGPM_ERROR_MAX_LENGTH` | Max error message length |
| `PGPM_ERROR_VERBOSE` | Verbose error output |

## Config File Discovery

### loadConfigSync()

Load `pgpm.json` by walking up directory tree:

```typescript
import { loadConfigSync } from '@pgpmjs/env';

const config = loadConfigSync('/path/to/project');
// Finds nearest pgpm.json walking up from given path
```

### loadConfigSyncFromDir()

Load config from specific directory:

```typescript
import { loadConfigSyncFromDir } from '@pgpmjs/env';

const config = loadConfigSyncFromDir('/path/to/project');
```

### resolvePgpmPath()

Find the pgpm.json file path:

```typescript
import { resolvePgpmPath } from '@pgpmjs/env';

const pgpmPath = resolvePgpmPath('/path/to/project');
// Returns full path to pgpm.json or undefined
```

## Workspace Resolution

### resolvePnpmWorkspace()

Find pnpm-workspace.yaml:

```typescript
import { resolvePnpmWorkspace } from '@pgpmjs/env';

const workspacePath = resolvePnpmWorkspace('/path/to/project');
```

### resolveLernaWorkspace()

Find lerna.json:

```typescript
import { resolveLernaWorkspace } from '@pgpmjs/env';

const lernaPath = resolveLernaWorkspace('/path/to/project');
```

### resolveWorkspaceByType()

Find workspace config by type:

```typescript
import { resolveWorkspaceByType, WorkspaceType } from '@pgpmjs/env';

const path = resolveWorkspaceByType('/path/to/project', 'pnpm');
// WorkspaceType: 'pnpm' | 'lerna' | 'npm'
```

## Utility Functions

### walkUp()

Walk up directory tree to find a file:

```typescript
import { walkUp } from '@pgpmjs/env';

const found = walkUp('/start/path', 'pgpm.json');
// Returns path to file or undefined
```

### getEnvVars()

Parse environment variables into PgpmOptions:

```typescript
import { getEnvVars } from '@pgpmjs/env';

const envOptions = getEnvVars();
// Or with custom env object
const envOptions = getEnvVars(process.env);
```

### getNodeEnv()

Get normalized NODE_ENV:

```typescript
import { getNodeEnv } from '@pgpmjs/env';

const env = getNodeEnv();
// Returns 'development' | 'production' | 'test'
```

### parseEnvBoolean()

Parse boolean environment variable:

```typescript
import { parseEnvBoolean } from '@pgpmjs/env';

parseEnvBoolean('true');  // true
parseEnvBoolean('1');     // true
parseEnvBoolean('yes');   // true
parseEnvBoolean('false'); // false
parseEnvBoolean(undefined); // undefined
```

### parseEnvNumber()

Parse numeric environment variable:

```typescript
import { parseEnvNumber } from '@pgpmjs/env';

parseEnvNumber('5432');    // 5432
parseEnvNumber('invalid'); // undefined
parseEnvNumber(undefined); // undefined
```

## pgpm.json Configuration

Example `pgpm.json` with environment options:

```json
{
  "name": "my-module",
  "version": "1.0.0",
  "db": {
    "rootDb": "postgres",
    "template": "template1",
    "prefix": "myapp_",
    "extensions": ["uuid-ossp", "pgcrypto"],
    "roles": {
      "admin": "admin_role",
      "app": "app_role",
      "anonymous": "anon_role",
      "authenticated": "auth_role"
    },
    "connections": {
      "app": {
        "user": "app_user",
        "password": "app_password"
      },
      "admin": {
        "user": "admin_user",
        "password": "admin_password"
      }
    }
  },
  "deployment": {
    "useTx": true,
    "fast": false,
    "usePlan": true
  }
}
```

## Integration with pgsql-test

```typescript
import { getConnEnvOptions } from '@pgpmjs/env';
import { getConnections } from 'pgsql-test';

const connOptions = getConnEnvOptions();
const { db, teardown } = await getConnections(connOptions);
```

## Integration with pgpm CLI

The pgpm CLI uses @pgpmjs/env internally. Quick setup:

```bash
# Export standard PostgreSQL env vars
eval "$(pgpm env)"

# Now all pgpm commands use these vars
pgpm deploy --createdb
```

## Best Practices

1. **Use getEnvOptions()**: Let the library handle merging
2. **Config file for defaults**: Put project defaults in pgpm.json
3. **Env vars for secrets**: Never commit passwords to pgpm.json
4. **Override at runtime**: Pass overrides for test-specific config
5. **Consistent cwd**: Pass explicit cwd when running from different directories

## References

- Related skill: `references/cli.md` for CLI commands
- Related skill: `references/workspace.md` for workspace configuration
- Related skill: `github-workflows-pgpm` for CI/CD environment setup
- Related skill: `constructive-env` — Covers the full two-layer architecture (`@pgpmjs/env` + `@constructive-io/graphql-env`), GraphQL-specific env vars, SMTP config, and the "which package to import" decision guide
