# PGPM Home Directory

The `.pgpm/` folder in the user's home directory provides optional state storage for the CLI.

## Design Principles

**pgpm should:**
- **Attempt creation** - Try to create the folder when needed
- **Gracefully handle failure** - Never throw errors if creation fails
- **Never require it** - Behave perfectly without it; only benefits if it's there

## Structure

```
~/.pgpm/
  └── state.json    # Optional state storage
```

## Usage

```typescript
import { 
  initializePgpmHome,
  readPgpmState,
  writePgpmState,
  updatePgpmState,
  getPgpmStateValue
} from '@launchql/core';

// Initialize (optional - will be attempted automatically when needed)
const { dirCreated, stateInitialized } = initializePgpmHome();

// Read state (returns null if unavailable)
const state = readPgpmState();

// Write state (returns false if unavailable)
const success = writePgpmState({ key: 'value' });

// Update specific keys (returns false if unavailable)
updatePgpmState({ lastRun: new Date().toISOString() });

// Get specific value (returns null if unavailable)
const value = getPgpmStateValue('key');
```

## Behavior

All functions handle failures gracefully:
- Return `null`, `false`, or default values on failure
- Never throw exceptions
- System continues to work normally without the folder
- Benefits are only available when the folder exists and is writable

## When It's Used

The `.pgpm/` folder is used for:
- Caching CLI state between runs
- Storing user preferences
- Tracking usage analytics (if enabled)
- Any other optional persistent data

The CLI works perfectly without it - it's purely an optimization.
