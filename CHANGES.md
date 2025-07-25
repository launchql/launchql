# Changes in PR #164: Add undefined target handling for deploy/revert/verify operations

## Summary

This PR implements undefined target handling for `deploy`, `revert`, and `verify` operations in the `LaunchQLProject` class, allowing users to operate on ALL modules in a workspace when no specific target is provided. The key improvement is a complete refactor of workspace-wide dependency resolution using a virtual module pattern with `extDeps` for proper ordering.

## Key Changes

### 1. Virtual Module Pattern for Dependency Resolution

**File**: `packages/core/src/core/class/launchql.ts`

- **New Method**: `getWorkspaceExtensionsInDependencyOrder()`
  - Replaces broken `getAllWorkspaceExtensionsWithDependencyOrder` implementation
  - Uses `extDeps()` with a virtual module pattern instead of `resolveDependencies`
  - Creates a virtual `_virtual/workspace` module that depends on all workspace modules
  - Ensures proper dependency ordering for workspace-wide operations
  - Filters out the virtual module from final results
  - Collects extensions from resolved modules in correct dependency order

- **Implementation Details**:
  ```typescript
  const virtualModuleName = '_virtual/workspace';
  const virtualModuleMap = {
    ...modules,
    [virtualModuleName]: {
      requires: allModuleNames
    }
  };
  const { resolved, external } = extDeps(virtualModuleName, virtualModuleMap);
  ```

### 2. Enhanced Target Parsing and Workspace-Wide Operations

**File**: `packages/core/src/core/class/launchql.ts`

- **Updated Method**: `parseProjectTarget(target?: string)`
  - **Breaking Change**: Return type changed from `{ name: string; toChange: string | undefined }` to `{ name: string | null; toChange: string | undefined }`
  - `name === null` now indicates workspace-wide operations (all modules)
  - Removed error when running from workspace root without target
  - Added logic to detect workspace context and set `name = null` for undefined targets

- **Enhanced Operations**: All three core operations now support undefined targets:
  - `deploy(target?: string)` - Deploys ALL modules when target is undefined
  - `revert(target?: string)` - Reverts ALL modules when target is undefined  
  - `verify(target?: string)` - Verifies ALL modules when target is undefined

### 3. Improved Revert Operations with Reverse Dependency Ordering

**File**: `packages/core/src/core/class/launchql.ts`

- **New Method**: `findTopDependentModule(name: string, toChange: string)`
  - Extracts complex dependency analysis logic from revert method
  - Finds all modules that depend on the target module
  - Selects the module with the most dependencies as the "top" module
  - Returns extensions from the top dependent module for proper revert ordering

- **Enhanced Revert Logic**:
  - Workspace-wide reverts (`name === null`) use reverse dependency order to avoid constraint violations
  - Single module reverts with changes use `findTopDependentModule()` for proper ordering
  - Fixed double-reversal bug: `reversedExtensions = name === null ? extensionsToRevert.resolved : [...extensionsToRevert.resolved].reverse()`
  - Ensures dependents are reverted before dependencies

### 4. Consistent Virtual Module References

**File**: `packages/core/src/resolution/deps.ts`

- **Updated**: Changed synthetic root node from `apps/index` to `_virtual/app`
- **Consistency**: Aligns with the virtual module pattern used throughout the system
- **Impact**: Affects dependency resolution in `resolveDependencies()` function

### 5. Bug Fixes and Robustness Improvements

**File**: `packages/core/src/core/class/launchql.ts`

- **External Extension Handling**: Fixed critical bug where external extensions (like 'citext') were incorrectly processed as workspace modules
  ```typescript
  // Only process modules that exist in our workspace
  if (modules[moduleName]) {
    const moduleProject = this.getModuleProject(moduleName);
    // ...
  }
  ```

- **Non-Recursive Operation Guards**: Added validation to prevent workspace-wide operations without recursive flag
  ```typescript
  if (name === null) {
    throw new Error('Cannot perform non-recursive operation on workspace. Use recursive=true or specify a target module.');
  }
  ```

- **Improved Logging**: Enhanced log messages to distinguish between single module and workspace-wide operations
  ```typescript
  const targetDescription = name === null ? 'all modules' : name;
  log.success(`✅ Deployment complete for ${targetDescription}.`);
  ```

### 6. Comprehensive Test Coverage

**New File**: `packages/core/__tests__/projects/deployment-scenarios.test.ts`

- **Test Suite**: "Deployment Scenarios with Undefined Targets"
- **Coverage**: Tests undefined target scenarios for all three operations (deploy, revert, verify)
- **Fixtures**: Uses `CoreDeployTestFixture` with 'sqitch' and 'simple-w-tags' test data
- **Validation**: Verifies database state changes and operation success
- **Scenarios Tested**:
  - Deploy with undefined target → verify all modules deployed
  - Verify with undefined target → ensure no errors
  - Revert with undefined target → verify all modules reverted
  - Mixed operations with specific targets and undefined targets

## Technical Implementation Details

### Virtual Module Pattern Benefits

1. **Leverages Existing Logic**: Uses proven `extDeps()` dependency resolution instead of reimplementing
2. **Proper Ordering**: Ensures modules are processed in correct dependency order
3. **Scalable**: Works with any number of modules and complex dependency graphs
4. **Maintainable**: Centralizes dependency logic in one place

### Workspace-Wide Operation Flow

1. **Target Detection**: `parseProjectTarget()` detects workspace context and sets `name = null`
2. **Extension Collection**: `getWorkspaceExtensionsInDependencyOrder()` gathers all extensions in order
3. **Operation Execution**: Each operation processes extensions with proper ordering
4. **Revert Special Case**: Uses reverse order to avoid database constraint violations

### Backward Compatibility

- **Existing APIs**: All existing single-module operations continue to work unchanged
- **Error Handling**: Clear error messages for invalid operation combinations
- **Type Safety**: TypeScript types updated to reflect new `string | null` return type

## Breaking Changes

1. **`parseProjectTarget()` Return Type**: Changed from `{ name: string; ... }` to `{ name: string | null; ... }`
2. **Workspace Root Behavior**: No longer throws error when running from workspace root without target

## Migration Guide

For code that directly calls `parseProjectTarget()`:

```typescript
// Before
const { name } = this.parseProjectTarget(target);
// name was always string

// After  
const { name } = this.parseProjectTarget(target);
// name can be string | null (null = workspace-wide operation)
if (name === null) {
  // Handle workspace-wide operation
} else {
  // Handle single module operation
}
```

## Testing

- **New Test File**: Comprehensive test coverage for undefined target scenarios
- **Existing Tests**: All existing tests continue to pass
- **Manual Testing**: Verified with complex dependency chains and edge cases

## Performance Impact

- **Positive**: Virtual module pattern is more efficient than previous `resolveDependencies` approach
- **Minimal Overhead**: Workspace-wide operations have slight overhead due to processing all modules
- **Caching**: Leverages existing module caching mechanisms

## Future Considerations

- **CLI Integration**: This foundation enables CLI commands to support workspace-wide operations
- **Progress Reporting**: Could add progress indicators for workspace-wide operations
- **Parallel Processing**: Future optimization could process independent modules in parallel
