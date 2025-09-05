# LaunchQL Revert Optimization Plan

## Problem Statement

The current recursive revert functionality in LaunchQL has a performance issue where it processes ALL modules in the workspace regardless of their deployment status. When using the `--recursive` option, the system calls `resolveWorkspaceExtensionDependencies()` which returns every module in the workspace, leading to unnecessary processing of modules that were never deployed to the database.

### Current Behavior

When executing `lql revert --recursive`, the system:

1. Calls `resolveWorkspaceExtensionDependencies()` to get ALL workspace modules
2. Processes each module in reverse dependency order
3. Often skips many modules that were never deployed, wasting time on:
   - File system operations
   - Database connection attempts
   - Unnecessary logging and error handling

### Impact

- Significantly slower revert operations in large workspaces
- Confusing output with many "skipping" messages for undeployed modules
- Unnecessary resource consumption (I/O, database connections)
- Poor user experience during rollback operations

## Proposed Solution

Implement database-aware filtering before dependency resolution by:

1. Querying the `launchql_migrate` database to determine which modules are actually deployed
2. Filtering the workspace extension list to only include deployed modules
3. Processing only modules that have deployment history

### Benefits

- **Performance**: Dramatically reduces processing time for large workspaces
- **Clarity**: Eliminates confusing "skipping" messages for undeployed modules
- **Efficiency**: Reduces unnecessary database queries and file operations
- **Accuracy**: Maintains exact same behavior for actually deployed modules

## Implementation Plan

### Code Locations Requiring Changes

#### Primary Location: LaunchQLPackage.revert() Method

**File**: `packages/core/src/core/class/launchql.ts`  
**Lines**: 1052-1152  
**Method**: `LaunchQLPackage.revert()`

**Current problematic code** (lines 1067-1075):
```typescript
if (name === null) {
  // When name is null, revert ALL modules in the workspace
  extensionsToRevert = this.resolveWorkspaceExtensionDependencies();
} else {
  // Always use workspace-wide resolution in recursive mode
  // This ensures all dependent modules are reverted before their dependencies.
  const workspaceExtensions = this.resolveWorkspaceExtensionDependencies();
  extensionsToRevert = truncateExtensionsToTarget(workspaceExtensions, name);
}
```

#### Supporting Functions

**1. resolveWorkspaceExtensionDependencies()**
- **File**: `packages/core/src/core/class/launchql.ts`
- **Lines**: 841-865
- **Current**: Returns ALL workspace modules regardless of deployment status
- **Needs**: Optional database filtering capability

**2. truncateExtensionsToTarget()**
- **File**: `packages/core/src/core/class/launchql.ts`
- **Lines**: 80-94
- **Current**: Truncates from target module in dependency order
- **Needs**: Work with pre-filtered deployed modules list

### Database Integration Points

#### Existing Database Schema

**Schema**: `launchql_migrate`  
**File**: `packages/core/src/migrate/sql/schema.sql`

**Key Tables**:
- `launchql_migrate.changes` - Tracks deployed changes per package
- `launchql_migrate.packages` - Tracks registered packages

#### Existing Database Procedures

**File**: `packages/core/src/migrate/sql/procedures.sql`

**Key Function**: `launchql_migrate.deployed_changes()`
- **Lines**: 198-207
- **Purpose**: Lists deployed changes, optionally filtered by package
- **Returns**: `(package TEXT, change_name TEXT, deployed_at TIMESTAMPTZ)`

#### Existing Client Methods

**File**: `packages/core/src/migrate/client.ts`

**Key Method**: `LaunchQLMigrate.getDeployedChanges()`
- **Lines**: 605-630
- **Purpose**: Gets all deployed changes for a package
- **Usage**: Can be adapted to get list of deployed packages

## Implementation Strategy

### Option A: Modify Existing Methods (Recommended)

#### 1. Enhance resolveWorkspaceExtensionDependencies()

```typescript
public async resolveWorkspaceExtensionDependencies(
  opts?: { filterDeployed?: boolean; pgConfig?: PgConfig }
): Promise<{ resolved: string[]; external: string[] }> {
  const modules = this.getModuleMap();
  const allModuleNames = Object.keys(modules);
  
  if (allModuleNames.length === 0) {
    return { resolved: [], external: [] };
  }
  
  // Create virtual module that depends on all workspace modules
  const virtualModuleName = '_virtual/workspace';
  const virtualModuleMap = {
    ...modules,
    [virtualModuleName]: {
      requires: allModuleNames
    }
  };
  
  const { resolved, external } = resolveExtensionDependencies(virtualModuleName, virtualModuleMap);
  
  let filteredResolved = resolved.filter((moduleName: string) => moduleName !== virtualModuleName);
  
  // NEW: Filter by deployment status if requested
  if (opts?.filterDeployed && opts?.pgConfig) {
    const deployedModules = await this.getDeployedModules(opts.pgConfig);
    filteredResolved = filteredResolved.filter(module => deployedModules.has(module));
  }
  
  return {
    resolved: filteredResolved,
    external: external
  };
}
```

#### 2. Add Helper Method: getDeployedModules()

```typescript
private async getDeployedModules(pgConfig: PgConfig): Promise<Set<string>> {
  try {
    const client = new LaunchQLMigrate(pgConfig);
    await client.initialize();
    
    // Query all deployed packages
    const result = await client.pool.query(`
      SELECT DISTINCT package 
      FROM launchql_migrate.changes 
      WHERE deployed_at IS NOT NULL
    `);
    
    return new Set(result.rows.map(row => row.package));
  } catch (error: any) {
    // If schema doesn't exist or other DB errors, assume no deployments
    if (error.code === '42P01' || error.code === '3F000') {
      return new Set();
    }
    throw error;
  }
}
```

#### 3. Update revert() Method

**Replace lines 1067-1075** with:

```typescript
if (name === null) {
  // When name is null, revert ALL deployed modules in the workspace
  extensionsToRevert = await this.resolveWorkspaceExtensionDependencies({
    filterDeployed: true,
    pgConfig: opts.pg as PgConfig
  });
} else {
  // Always use workspace-wide resolution in recursive mode, but filter to deployed modules
  const workspaceExtensions = await this.resolveWorkspaceExtensionDependencies({
    filterDeployed: true,
    pgConfig: opts.pg as PgConfig
  });
  extensionsToRevert = truncateExtensionsToTarget(workspaceExtensions, name);
}
```

### Option B: Add New Method (Alternative)

#### Add getDeployedWorkspaceExtensions() Method

```typescript
private async getDeployedWorkspaceExtensions(
  opts: LaunchQLOptions
): Promise<{ resolved: string[]; external: string[] }> {
  // Get all workspace extensions
  const allExtensions = this.resolveWorkspaceExtensionDependencies();
  
  // Get deployed modules from database
  const deployedModules = await this.getDeployedModules(opts.pg as PgConfig);
  
  // Filter to only deployed modules
  return {
    resolved: allExtensions.resolved.filter(module => deployedModules.has(module)),
    external: allExtensions.external
  };
}
```

## Error Handling Considerations

### Database Connection Issues
- Handle cases where `launchql_migrate` schema doesn't exist
- Gracefully handle database connection errors
- Fall back to current behavior if database queries fail

### Backward Compatibility
- Maintain existing behavior for non-recursive reverts
- Ensure existing API contracts are preserved
- Add optional parameters rather than breaking changes

### Edge Cases
- Empty database (no deployments) - should return empty set
- Missing schema - treat as no deployments
- Network/connection errors - log warning and fall back to current behavior

## Testing Strategy

### Unit Tests
- Test `getDeployedModules()` with various database states
- Test `resolveWorkspaceExtensionDependencies()` with filtering enabled/disabled
- Test error handling for missing schema and connection issues

### Integration Tests
- Create workspace with mix of deployed and undeployed modules
- Verify recursive revert only processes deployed modules
- Test with empty database and missing schema
- Verify non-recursive reverts remain unchanged

### Performance Tests
- Measure improvement in large workspaces with many undeployed modules
- Compare processing time before and after optimization
- Verify memory usage doesn't increase significantly

## Migration Considerations

### Existing Deployments
- Optimization works with existing `launchql_migrate` schema
- No database migrations required
- Compatible with imported Sqitch deployments

### Configuration
- No configuration changes required
- Optimization is automatic when using recursive revert
- Maintains backward compatibility

## Files Requiring Modification

### Primary Files
1. **`packages/core/src/core/class/launchql.ts`**
   - Modify `resolveWorkspaceExtensionDependencies()` method
   - Add `getDeployedModules()` helper method
   - Update `revert()` method to use database filtering

### Supporting Files (if needed)
2. **`packages/core/src/migrate/client.ts`**
   - Potentially add helper methods for querying deployed packages
   - Enhance error handling for schema detection

### Test Files (new)
3. **`packages/core/__tests__/core/revert-optimization.test.ts`**
   - Unit tests for new functionality
   - Integration tests for recursive revert optimization

## Success Metrics

### Performance Improvements
- **Target**: 50-80% reduction in processing time for workspaces with >10 undeployed modules
- **Measurement**: Time from revert command start to completion
- **Baseline**: Current recursive revert performance

### User Experience
- **Elimination**: No more "skipping" messages for undeployed modules
- **Clarity**: Only deployed modules appear in revert output
- **Speed**: Faster feedback during rollback operations

### Reliability
- **Compatibility**: 100% backward compatibility with existing functionality
- **Error Handling**: Graceful degradation when database is unavailable
- **Accuracy**: Identical behavior for actually deployed modules

## Implementation Timeline

### Phase 1: Core Implementation
1. Add `getDeployedModules()` helper method
2. Modify `resolveWorkspaceExtensionDependencies()` with optional filtering
3. Update `revert()` method to use database-aware filtering

### Phase 2: Testing & Validation
1. Create comprehensive unit tests
2. Add integration tests with various deployment scenarios
3. Performance testing and benchmarking

### Phase 3: Documentation & Rollout
1. Update CLI help text and documentation
2. Add migration notes for existing users
3. Monitor performance improvements in production

## Conclusion

This optimization addresses a significant performance bottleneck in LaunchQL's recursive revert functionality. By leveraging the existing `launchql_migrate` database schema to filter modules before processing, we can dramatically improve performance while maintaining full backward compatibility and accuracy.

The implementation follows existing code patterns and leverages already-available database infrastructure, making it a low-risk, high-impact improvement to the user experience.
