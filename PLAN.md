# usePlan Default Analysis and Implementation Plan

## Problem Statement

There is a mismatch between the core package and CLI package regarding the default value of `usePlan`:

- **Core Package**: Defaults `usePlan = true` in `packageModule()` function
- **CLI Package**: Passes `argv.usePlan` (undefined by default) to core methods
- **Result**: Inconsistent behavior between development and production environments

## Current State Analysis

### Core Package Defaults

1. **`packageModule()` function** (`packages/core/src/packaging/package.ts:47`)
   - Defaults `usePlan = true`
   - Uses `resolveWithPlan` when `usePlan = true`, `resolve` when `usePlan = false`

2. **`LaunchQLMigrate.deploy()`** (`packages/core/src/migrate/client.ts:138`)
   - Uses `options.usePlan ? 'plan' : 'sql'` for dependency resolution source
   - Plan-based resolution reads `launchql.plan` files directly
   - SQL-based resolution parses deploy/*.sql file headers

### CLI Package Current State

1. **Deploy Command** (`packages/cli/src/commands/deploy.ts:133`)
   - Passes `usePlan: argv.usePlan` (undefined by default)
   - Has `--usePlan` flag but no default value
   - Help text shows `--usePlan` as optional flag

2. **Revert Command** (`packages/cli/src/commands/revert.ts`)
   - Does NOT support `usePlan` at all
   - Only passes `useTx` to deployment options

3. **Verify Command** (`packages/cli/src/commands/verify.ts`)
   - Does NOT support `usePlan` at all
   - No deployment options passed

### Key Differences Between Resolution Methods

#### Plan-based Resolution (`usePlan: true`)
- Reads dependency order directly from `launchql.plan` files
- Uses `resolveWithPlan()` function
- More reliable and explicit dependency management
- Follows the exact order specified in plan files

#### SQL-based Resolution (`usePlan: false`)
- Parses deploy/*.sql file headers to build dependency graph
- Uses `resolve()` function with topological sorting
- Legacy approach that scans filesystem
- May have different ordering than plan files

## Implementation Changes

### 1. CLI Deploy Command Updates

**File**: `packages/cli/src/commands/deploy.ts`

- Change `usePlan: argv.usePlan` to `usePlan: argv.usePlan !== false`
- Update help text to reflect new default
- Add `--no-usePlan` flag documentation

### 2. CLI Argument Parsing Updates

**File**: `packages/cli/src/utils/argv.ts`

- Update boolean flag handling to support `--no-usePlan` pattern
- Ensure proper validation of usePlan argument

### 3. Revert and Verify Command Analysis

**Revert Command**: Currently does not use dependency resolution, so `usePlan` may not be applicable.

**Verify Command**: Currently does not use dependency resolution, so `usePlan` may not be applicable.

**Decision**: Keep revert and verify commands as-is since they don't appear to use the dependency resolution system that `usePlan` affects.

## Expected Impact

### Positive Changes
- Consistent behavior between development and production
- Plan-based resolution is more reliable and explicit
- Aligns CLI defaults with core package expectations

### Potential Breaking Changes
- Users relying on SQL-based resolution by default will need to use `--no-usePlan`
- Existing scripts may need updating if they depend on SQL-based resolution behavior

### Migration Path
- Add `--no-usePlan` flag for users who need the old behavior
- Update documentation to explain the change
- Consider deprecation warnings in future versions

## Testing Strategy

1. **Existing Tests**: Ensure all current CLI tests pass with new defaults
2. **New Flag Testing**: Verify `--no-usePlan` works correctly
3. **Integration Testing**: Test both plan-based and SQL-based resolution paths
4. **Regression Testing**: Ensure no breaking changes to existing functionality

## Conclusion

Making `usePlan` default to `true` in the CLI aligns the behavior with the core package expectations and provides more consistent, reliable dependency resolution. The `--no-usePlan` flag provides backward compatibility for users who need the legacy SQL-based resolution behavior.
