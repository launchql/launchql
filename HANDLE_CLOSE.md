# HANDLE_CLOSE.md - Fixing Jest Process Hanging in pgsql-test

## Problem Description

The `pgsql-test` framework has a critical issue where Jest processes hang indefinitely when database seeding fails during test setup. This occurs when:

1. `getConnections()` is called in test `beforeAll()` hooks
2. Seeding fails (e.g., missing PostgreSQL extension control files like `launchql-ext-jobs.control`)
3. An exception is thrown before the `teardown` function is created
4. The `teardown` variable remains `undefined`
5. Test `afterAll()` hooks fail with `TypeError: teardown is not a function`
6. Database connections and pools remain open, preventing Jest from exiting

## Root Cause Analysis

The issue is in `/packages/pgsql-test/src/connect.ts` in the `getConnections()` function:

```typescript
// Current problematic pattern (lines 84-106)
if (seedAdapters.length) {
  await seed.compose(seedAdapters).seed({...}); // Can throw, leaving teardown undefined
}

// Teardown created after seeding - never reached if seeding fails
const teardown = async () => {
  manager.beginTeardown();
  await teardownPgPools();
  await manager.closeAll();
};
```

When seeding fails, the exception is thrown before `teardown` is created, causing:
- **Immediate error**: `TypeError: teardown is not a function` in test afterAll hooks
- **Process hanging**: Database connections and pools remain open, preventing Jest from exiting

## Solution Approach

### Framework-Level Fix (Recommended)

Modify `getConnections()` to create the teardown function early, before any operations that can fail:

```typescript
// Create teardown function early, before any operations that can fail
const teardown = async () => {
  manager.beginTeardown();
  await teardownPgPools();
  await manager.closeAll();
};

// Wrap seeding in try-catch to ensure cleanup on failure
if (seedAdapters.length) {
  try {
    await seed.compose(seedAdapters).seed({
      connect: connOpts,
      admin,
      config: config,
      pg: manager.getClient(config)
    });
  } catch (error) {
    // Ensure cleanup happens even when seeding fails
    await teardown();
    // Re-throw the original error to preserve existing behavior
    throw error;
  }
}
```

### Key Principles

1. **Early teardown creation**: Create teardown before any operations that can throw
2. **Graceful error handling**: Wrap seeding in try-catch without changing the API
3. **Preserve original errors**: Re-throw seeding errors after cleanup
4. **Leverage existing cleanup**: Use the existing `PgTestConnector.beginTeardown()` and `closeAll()` methods

### Alternative Approaches (Not Recommended)

#### Per-Test Defensive Coding
```typescript
// Not recommended - requires changes in every test file
let teardown: (() => Promise<void>) | undefined;

afterAll(async () => {
  if (teardown) {
    await teardown();
  }
});
```

This approach is error-prone and requires updating every test file that uses `getConnections()`.

## Implementation Details

### Files Modified
- `/packages/pgsql-test/src/connect.ts` - Main fix in `getConnections()` function

### Behavior Preservation
- API remains unchanged - existing tests continue to work
- Error messages and stack traces are preserved
- Seeding failures still cause test failures as expected
- Only difference: proper cleanup happens before re-throwing errors

### Testing Strategy
1. Test with missing extension control files (original failure scenario)
2. Test with database connection failures
3. Verify teardown is always a valid function
4. Verify Jest exits cleanly instead of hanging
5. Run existing pgsql-test suite to ensure no regressions

## Benefits

1. **Prevents hanging**: Jest processes exit properly even when seeding fails
2. **Maintains API compatibility**: No changes required in existing test files
3. **Preserves error behavior**: Original seeding errors are still thrown and visible
4. **Robust cleanup**: Database connections and pools are always properly closed
5. **Framework-level solution**: Fixes the issue for all users of pgsql-test

## Verification Commands

```bash
# Test with the original failing packages
cd ~/repos/launchql-extensions/packages/meta/db_meta
pnpm test

cd ~/repos/launchql-extensions/packages/security/encrypted-secrets  
pnpm test

# Verify existing functionality
cd ~/repos/launchql/packages/pgsql-test
yarn test
```

Tests should fail gracefully and exit within reasonable time, without Jest hanging warnings.
