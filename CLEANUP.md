# LaunchQL Modes Cleanup Analysis

## Executive Summary

This document analyzes whether to eliminate **non-recursive mode** and **fast mode** from the LaunchQL deployment system. Based on comprehensive codebase analysis, we recommend:

- **✅ ELIMINATE non-recursive mode**: Rarely used, adds complexity, and workspace operations already require recursive mode
- **⚠️ KEEP fast mode (with cleanup)**: Still provides performance benefits for large deployments, but clean up stale references

## Current State Analysis

### Non-Recursive Mode

**Current Implementation:**
- Defaults to `recursive: boolean = true` in both `deploy()` and `revert()` methods ([LaunchQLPackage class](packages/core/src/core/class/launchql.ts#L924))
- Non-recursive workspace operations throw `WORKSPACE_OPERATION_ERROR` ([error-factory.ts](packages/types/src/error-factory.ts#L135-140))
- CLI commands support `--recursive` flag but default to recursive behavior ([deploy.ts](packages/cli/src/commands/deploy.ts), [revert.ts](packages/cli/src/commands/revert.ts))

**Behavior Differences:**
- **Recursive mode (default)**: Resolves and deploys/reverts all dependencies in correct order
- **Non-recursive mode**: Single module operation only, throws error for workspace-level operations

**Usage Pattern:**
```typescript
// Current implementation in LaunchQLPackage.deploy()
if (recursive) {
  // Resolve dependencies and deploy in order
  const extensions = await this.resolveWorkspaceExtensionDependencies();
  // Deploy each extension...
} else {
  // Single module deployment only
  if (name === null) {
    throw errors.WORKSPACE_OPERATION_ERROR({ operation: 'deployment' });
  }
  // Deploy single module...
}
```

### Fast Mode

**Current Implementation:**
- Controlled by `opts.deployment.fast` boolean flag ([DeploymentOptions](packages/types/src/launchql.ts#L153-154))
- Implemented in both core LaunchQL class and projects/deploy.ts
- Uses `packageModule()` for consolidated SQL vs `LaunchQLMigrate` for change-by-change deployment

**Contradiction Found:**
- TODO.md states "Remove deployFast option" ([TODO.md](TODO.md#L60))
- But fast mode is actively implemented and used throughout the codebase
- Stale `deployFast` function imports exist in sandbox tests but function is not exported from core package

**Behavior Differences:**
- **Fast mode**: Uses `packageModule()` to generate consolidated SQL, supports caching via `deployFastCache`
- **Normal mode**: Uses `LaunchQLMigrate` for change-by-change deployment with transaction control

**Usage Pattern:**
```typescript
// Current implementation in LaunchQLPackage.deploy()
if (opts.deployment.fast) {
  // Use packageModule for consolidated SQL
  const pkg = await packageModule(localProject.modulePath, { 
    usePlan: opts.deployment.usePlan, 
    extension: false 
  });
  await pgPool.query(pkg.sql);
  
  if (opts.deployment.cache) {
    deployFastCache[cacheKey] = pkg;
  }
} else {
  // Use LaunchQLMigrate for change-by-change deployment
  const client = new LaunchQLMigrate(opts.pg as PgConfig);
  const result = await client.deploy({
    modulePath,
    toChange: moduleToChange,
    useTransaction: opts.deployment.useTx,
    logOnly: opts.deployment.logOnly,
    usePlan: opts.deployment.usePlan
  });
}
```

## Analysis: Non-Recursive Mode

### Pros of Eliminating Non-Recursive Mode

1. **Simplifies API**: Removes confusing parameter that most users don't need
2. **Reduces Code Complexity**: Eliminates branching logic in deploy/revert methods
3. **Prevents User Errors**: No more `WORKSPACE_OPERATION_ERROR` when users forget recursive flag
4. **Aligns with Best Practices**: Dependency resolution should always be automatic
5. **Minimal Usage**: Non-recursive mode is primarily for edge cases

### Cons of Eliminating Non-Recursive Mode

1. **Breaking Change**: Existing code that explicitly sets `recursive: false` will break
2. **Loss of Granular Control**: Some advanced users may want single-module operations
3. **Testing Scenarios**: May be useful for isolated testing of individual modules

### Impact Assessment

**Low Impact** - Non-recursive mode appears to be rarely used:
- Default behavior is already recursive
- Workspace operations require recursive mode
- Most CLI usage relies on default recursive behavior
- Single-module operations can still be achieved by targeting specific modules

## Analysis: Fast Mode

### Pros of Eliminating Fast Mode

1. **Simplifies Deployment Logic**: Single code path for all deployments
2. **Consistent Behavior**: All deployments use same migration system
3. **Better Error Handling**: LaunchQLMigrate provides superior error reporting
4. **Transaction Control**: Better transaction management in normal mode
5. **TypeScript Performance**: Current TS implementation may be fast enough

### Cons of Eliminating Fast Mode

1. **Performance Regression**: Fast mode can be significantly faster for large schemas
2. **Caching Benefits**: `deployFastCache` provides performance benefits for repeated deployments
3. **Testing Infrastructure**: pgsql-test package relies on fast mode for performance ([launchql.ts](packages/pgsql-test/src/seed/launchql.ts#L16))
4. **Consolidated SQL**: Some use cases benefit from single SQL execution vs multiple changes

### Performance Considerations

Fast mode provides measurable benefits:
- **Consolidated SQL**: Single query execution vs multiple change deployments
- **Caching**: `deployFastCache` prevents redundant packaging operations
- **Testing Speed**: pgsql-test documentation claims "up to 10x faster than traditional Sqitch"

### Impact Assessment

**Medium-High Impact** - Fast mode is actively used:
- pgsql-test package uses `fast: true` by default
- Performance benefits are significant for large deployments
- Caching infrastructure provides value for repeated operations

## Recommendations

### 1. Eliminate Non-Recursive Mode ✅

**Recommendation**: Remove non-recursive mode entirely

**Migration Strategy**:
1. Remove `recursive` parameter from `deploy()` and `revert()` methods
2. Always use recursive behavior (current default)
3. Update CLI commands to remove `--recursive` flag
4. Update documentation and examples

**Breaking Changes**:
- Code explicitly setting `recursive: false` will need updates
- CLI scripts using `--recursive` flag will need flag removal

**Timeline**: Can be done in next major version (breaking change)

### 2. Keep Fast Mode (with Cleanup) ⚠️

**Recommendation**: Retain fast mode but clean up inconsistencies

**Cleanup Actions**:
1. **Resolve TODO contradiction**: Update TODO.md to reflect that fast mode is still needed
2. **Remove stale imports**: Clean up `deployFast` imports in sandbox tests
3. **Improve documentation**: Clarify when to use fast vs normal mode
4. **Consider renaming**: `deployment.fast` could be `deployment.consolidated` for clarity

**Rationale**:
- Performance benefits are significant and measurable
- Testing infrastructure depends on it
- TypeScript performance improvements don't eliminate all benefits
- Caching provides additional value

## Stale References to Clean Up

### Immediate Cleanup (Regardless of Elimination Decisions)

1. **Stale deployFast imports**: 
   - `sandbox/my-third/__tests__/deploy-fast.test.ts`
   - `sandbox/my-third/__tests__/deploy-introspect.test.ts`
   - `sandbox/my-third/__tests__/deploy-massive.test.ts`

2. **TODO contradiction**: Update TODO.md to reflect current fast mode status

3. **Documentation**: Update references to removed `deployFast()` function

## Implementation Plan

### Phase 1: Immediate Cleanup
- [ ] Remove stale `deployFast` imports from sandbox tests
- [ ] Update TODO.md to reflect fast mode status
- [ ] Update documentation references

### Phase 2: Non-Recursive Mode Elimination (Next Major Version)
- [ ] Remove `recursive` parameter from core methods
- [ ] Update CLI commands
- [ ] Update tests and documentation
- [ ] Add migration guide for breaking changes

### Phase 3: Fast Mode Improvements (Optional)
- [ ] Consider renaming for clarity
- [ ] Improve documentation on when to use each mode
- [ ] Add performance benchmarks

## Conclusion

The analysis reveals that **non-recursive mode adds complexity with minimal benefit** and should be eliminated. However, **fast mode provides significant performance benefits** and should be retained with cleanup of stale references and improved documentation.

The contradiction in TODO.md suggests that fast mode elimination was considered but the performance benefits ultimately justified keeping it. The current TypeScript implementation is fast, but not fast enough to eliminate the need for consolidated SQL deployment in performance-critical scenarios.
