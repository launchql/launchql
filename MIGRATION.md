# LaunchQL Migration System Documentation

## Overview

LaunchQLMigrate is designed to operate on a **single module only** — it is **NOT workspace-wide**. Cross-project operations should be handled by LaunchQLProject, which orchestrates multiple LaunchQLMigrate instances across different modules.

## Core Principles

### Module-Only Scope
- LaunchQLMigrate manages migrations for one module at a time
- Each module has its own `launchql.plan` file defining its changes
- Cross-project dependencies are resolved by LaunchQLProject before calling LaunchQLMigrate

### Tag Resolution Consistency
All three main methods (`deploy`, `revert`, `verify`) now handle tag resolution consistently:
- Tags in the format `@tagName` are resolved to change names using `resolveTagToChangeName`
- Tag resolution happens before any database operations
- Cross-project tag references (e.g., `project:@tag`) should be handled by LaunchQLProject

## Deploy vs Revert Semantics

### Deploy Semantics
Deploy adds changes **up to** a specified point:
```bash
# Deploy all changes up to and including "my-third"
launchql deploy my-third
# Result: A → B → C → D (if my-third is change D)
```

### Revert Semantics
Revert goes **back to** a specific point, not reverting a specific change:
```bash
# If you deployed: A → B → C → D
launchql deploy my-fourth  # Deploys A, B, C, D

# To revert back to state after A:
launchql revert my-first   # Reverts D, C, B (keeping A)
# Result: A → B → C → D becomes A
```

**Important**: `revert my-third` does NOT revert the "my-third" change specifically. It reverts TO the state where "my-third" was the last deployed change.

### Complete Module Revert
To revert an entire module (remove all changes), set `toChange` to `undefined`:
```bash
launchql revert  # No toChange specified - reverts all changes
```

## Workspace-Wide Operations (LaunchQLProject)

When both `name` and `toChange` arguments are undefined in LaunchQLProject method calls, the behavior differs depending on the operation:

### Deploy/Verify All Modules
```bash
# Deploy ALL modules in the workspace
launchql deploy  # No name or toChange - deploys everything

# Verify ALL modules in the workspace  
launchql verify  # No name or toChange - verifies everything
```

### Revert Everything (Complete Rollback)
```bash
# Revert ALL modules completely (remove all changes from all modules)
launchql revert  # No name or toChange - complete workspace rollback
```

**Important**: This workspace-wide behavior is handled by `LaunchQLProject` method arguments (`name` and `toChange` parameters), not `LaunchQLMigrate`. The `LaunchQLMigrate` class always operates on a single module and requires a `modulePath` parameter.

## Method Signatures

### deploy(options: DeployOptions)
```typescript
interface DeployOptions {
  modulePath: string;
  toChange?: string;        // Deploy up to this change (supports tags)
  useTransaction?: boolean;
  debug?: boolean;
  logOnly?: boolean;
}
```

### revert(options: RevertOptions)
```typescript
interface RevertOptions {
  modulePath: string;
  toChange?: string;        // Revert back to this change (supports tags)
  useTransaction?: boolean;
  debug?: boolean;
}
```

### verify(options: VerifyOptions)
```typescript
interface VerifyOptions {
  modulePath: string;
  toChange?: string;        // Verify up to this change (supports tags)
}
```

## Tag Resolution Examples

### Simple Tags
```typescript
// In launchql.plan:
// tags:
//   - name: v1.0.0
//     change: schema/tables

// Usage:
await migrate.deploy({ modulePath: '/path/to/module', toChange: '@v1.0.0' });
// Resolves to: toChange: 'schema/tables'
```

### Cross-Project Tags (Handled by LaunchQLProject)
```typescript
// LaunchQLProject handles cross-project resolution:
// auth:@v2.0.0 → resolves to specific change in auth module
// Then calls LaunchQLMigrate.deploy with resolved change name
```

## Current Issues Fixed

### Previous Problems with revert()
1. **Cross-project logic**: Previously contained complex LaunchQLProject instantiation and module map lookups
2. **Inconsistent tag resolution**: Missing `resolveTagToChangeName` calls
3. **Time-based comparisons**: Complex deployment time logic that belonged in LaunchQLProject
4. **Variable confusion**: Mixed `targetProject`, `targetChangeName`, and `resolvedToChange`

### Solutions Implemented
1. **Simplified tag resolution**: Consistent `resolveTagToChangeName` pattern across all methods
2. **Removed cross-project handling**: LaunchQLProject now handles cross-module operations
3. **Consistent method signatures**: All methods support `toChange` parameter with tag resolution
4. **Clear separation of concerns**: LaunchQLMigrate = single module, LaunchQLProject = workspace

## Usage Patterns

### Basic Module Operations
```typescript
const migrate = new LaunchQLMigrate(pgConfig);

// Deploy all changes in module
await migrate.deploy({ modulePath: '/path/to/module' });

// Deploy up to specific change
await migrate.deploy({ modulePath: '/path/to/module', toChange: 'add-users-table' });

// Deploy up to tagged version
await migrate.deploy({ modulePath: '/path/to/module', toChange: '@v1.0.0' });

// Revert to specific change
await migrate.revert({ modulePath: '/path/to/module', toChange: 'initial-schema' });

// Revert to tagged version
await migrate.revert({ modulePath: '/path/to/module', toChange: '@v0.9.0' });

// Verify deployed changes
await migrate.verify({ modulePath: '/path/to/module' });

// Verify up to specific change
await migrate.verify({ modulePath: '/path/to/module', toChange: 'add-indexes' });
```

### Cross-Project Operations (Use LaunchQLProject)
```typescript
// DON'T do this with LaunchQLMigrate:
// await migrate.deploy({ toChange: 'auth:@v2.0.0' }); // ❌

// DO use LaunchQLProject for cross-project operations:
const project = new LaunchQLProject('/workspace/path');
await project.deploy({ target: 'auth:@v2.0.0' }); // ✅
```

## Migration Best Practices

1. **Use tags for stable points**: Tag important milestones in your migration history
2. **Test revert scripts**: Always test that revert scripts properly undo deploy scripts
3. **Module boundaries**: Keep related changes within the same module
4. **Cross-project dependencies**: Use LaunchQLProject for operations spanning multiple modules
5. **Transaction safety**: Use `useTransaction: true` (default) for atomic operations

## Error Handling

LaunchQLMigrate provides detailed error messages including:
- Change name and project context
- Script hash for verification
- Dependency information
- SQL script preview (first 10 lines, or full script in debug mode)
- Specific PostgreSQL error codes and hints

Enable debug mode for comprehensive error reporting:
```typescript
await migrate.deploy({ 
  modulePath: '/path/to/module', 
  debug: true 
});
```
