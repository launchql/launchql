# PGPM State Directory

The PGPM state directory provides optional state storage for the CLI. By default, this is `~/.pgpm/` but can be configured via environment variables or CLI flags.

## Design Principles

**pgpm should:**
- **Attempt creation** - Try to create the folder when needed
- **Gracefully handle failure** - Never throw errors if creation fails
- **Never require it** - Behave perfectly without it; only benefits if it's there

## Structure

```
~/.pgpm/              # Default state directory
  └── state.json      # Optional state storage
```

## Usage

### Basic Usage with PgpmHome Class

```typescript
import { PgpmHome } from '@launchql/core';

// Create instance with default state directory (~/.pgpm)
const pgpmHome = new PgpmHome();

// Or specify custom state directory
const pgpmHome = new PgpmHome({ stateDir: '~/.custom-pgpm' });

// Initialize (optional - will be attempted automatically when needed)
const { dirCreated, stateInitialized } = pgpmHome.initialize();

// Read state (returns null if unavailable)
const state = pgpmHome.readState();

// Write state (returns false if unavailable)
const success = pgpmHome.writeState({ key: 'value' });

// Update specific keys (returns false if unavailable)
pgpmHome.updateState({ lastRun: new Date().toISOString() });

// Get specific value (returns null if unavailable)
const value = pgpmHome.get('key');

// Check if directory exists
if (pgpmHome.exists()) {
  console.log('State directory exists');
}

// Ensure directory exists
pgpmHome.ensure();
```

### Integration with Environment Resolution

```typescript
import { resolvePgpmEnv } from '@launchql/env';
import { PgpmHome } from '@launchql/core';

// Resolve environment with config precedence
const resolved = resolvePgpmEnv({
  flags: { noGlobalConfig: true },
  env: process.env,
  cwd: process.cwd()
});

// Create PgpmHome with resolved state directory
const pgpmHome = new PgpmHome({ stateDir: resolved.stateDir });

// Use merged options
const dbConfig = resolved.options.db;
```

## Configuration Precedence

The state directory can be configured through multiple sources (highest to lowest precedence):

1. **CLI flags**: `--state-dir=/path`
2. **Environment variables**: `PGPM_STATE_DIR`
3. **Default**: `~/.pgpm`

See `@launchql/env` package for full configuration options.

## Behavior

All methods handle failures gracefully:
- Return `null`, `false`, or default values on failure
- Never throw exceptions
- System continues to work normally without the directory
- Benefits are only available when the directory exists and is writable

## When It's Used

The state directory is used for:
- Caching CLI state between runs
- Storing user preferences
- Tracking usage analytics (if enabled)
- Any other optional persistent data

The CLI works perfectly without it - it's purely an optimization.

## Development

For development, you can override the state directory:

```bash
# Dev mode: use custom state directory
PGPM_STATE_DIR=/tmp/pgpm-dev-state lql deploy

# Or via CLI flag
lql deploy --state-dir=/tmp/pgpm-dev-state
```
