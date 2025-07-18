# LaunchQL Revert System

## Overview

The LaunchQL revert system provides comprehensive functionality for safely rolling back database schema changes across modules and projects. It implements reverse dependency processing to ensure safe rollback operations and supports both individual module reverts and recursive project-wide operations.

## Current Behavior

### Module-Level Revert (`revertModule`)

The `revertModule` function handles reversion of individual modules:

- **Location**: `src/modules/revert.ts`
- **Purpose**: Revert database changes for a single module based on its plan file
- **Behavior**: 
  - Checks for existence of `launchql.plan` file
  - Initializes `LaunchQLMigrate` client with database configuration
  - Executes revert with optional transaction control
  - Supports reverting to a specific change via `toChange` parameter (exclusive - the target change is NOT reverted)
  - Logs revert results including reverted and skipped changes
  - Mimics Sqitch revert behavior for compatibility

### Project-Level Revert (`revertProject`)

The `revertProject` function orchestrates reversion across multiple modules:

- **Location**: `src/projects/revert.ts`
- **Purpose**: Revert all modules within a project in reverse dependency order
- **Behavior**:
  - Resolves module dependencies using `LaunchQLProject.getModuleExtensions()`
  - **Reverses the dependency order** for safe rollback (`[...extensions.resolved].reverse()`)
  - Handles external extensions via PostgreSQL `DROP EXTENSION IF EXISTS ... CASCADE`
  - Delegates to `revertModule` for local modules
  - Supports both Sqitch compatibility mode and native LaunchQL migration
  - Provides transaction control and change targeting
  - Uses CASCADE for external extension drops to handle dependencies

### Orchestration-Level Revert (`revertModules`)

The `revertModules` function provides the highest-level revert interface:

- **Location**: `src/migrate/migration.ts`
- **Purpose**: Handle both recursive (project-level) and non-recursive (module-level) operations
- **Behavior**:
  - Routes to `revertProject` when `recursive: true`
  - Routes to `revertModule` when `recursive: false`
  - Validates required parameters based on operation mode
  - Provides unified interface for CLI and programmatic usage

## Capabilities

- [x] Support reverting individual modules
- [x] Support reverting individual projects
- [x] Support reverting via tag (using `toChange` parameter)
- [ ] Support recursive revert via tag (across projects/modules)
- [x] Support transaction control for reverts
- [x] Support reverse dependency order processing
- [x] Support external extension cleanup with CASCADE
- [x] Support Sqitch compatibility mode
- [x] Support change targeting (revert to specific change)
- [ ] Support cross-project dependency-aware revert
- [ ] Support workspace-wide recursive revert
- [ ] Support dry-run revert operations
- [ ] Support revert impact analysis

### Missing Capabilities Analysis

#### Support recursive revert via tag (across projects/modules)
- **Status**: Not implemented
- **Reason**: While individual modules and projects support tag-based revert via `toChange`, there's no mechanism to recursively revert across multiple projects using a single tag reference
- **Internal methods involved**: Would need `resolveTagToChangeName`, cross-project dependency resolution
- **Implementation complexity**: **Non-trivial** - requires coordinating tag resolution across multiple plan files and ensuring safe cross-project rollback order

## Tag Support in Revert Operations

### Current Tag Integration

The revert system fully supports tag-based operations through the same infrastructure as deployment:

#### Tag Resolution in Revert Context
- **Same Function**: Uses `resolveTagToChangeName()` identically to deployment
- **Format Support**: Supports both `@tagName` and `project:@tagName` formats
- **Resolution Timing**: Tag resolution occurs before reverse dependency processing
- **Exclusive Behavior**: `toChange` parameter is exclusive - the target change is NOT reverted

#### Revert-Specific Tag Behavior

**Module-Level Revert with Tags:**
```typescript
await revertModule(opts.pg, database, modulePath, { 
  useTransaction: options?.useTransaction,
  toChange: options?.toChange  // Can be tag reference like '@v1.0.0'
});
```

**Project-Level Revert with Tags:**
- Tags resolved once at project level
- Same tag reference passed to all modules in project
- Each module reverts to the resolved change name
- Reverse dependency order maintained regardless of tag resolution

#### Tag Resolution Modes in Revert

The `resolveDependencies()` function's tag resolution modes affect revert operations:

**'preserve' Mode:**
- Tags kept as-is during dependency resolution
- Resolution happens at execution time in `LaunchQLMigrate.revert()`
- Maintains flexibility for different tag interpretations per module

**'resolve' Mode:**
- Tags resolved to change names during dependency analysis
- Enables dependency validation against resolved changes
- May be more efficient for complex dependency graphs

**'internal' Mode:**
- Tags resolved internally but preserved in dependency tracking
- Balances resolution needs with tag reference preservation
- Useful for debugging and audit trails

### Tag Safety in Reverse Operations

#### Critical Considerations for Tag-Based Revert

**Dependency Order Preservation:**
- Tag resolution must complete before reverse order processing
- `[...extensions.resolved].reverse()` applies after tag resolution
- Ensures safe rollback regardless of tag complexity

**Cross-Module Tag Consistency:**
- Same tag reference should resolve consistently across modules
- Plan file changes between modules could cause inconsistent resolution
- Current implementation assumes stable plan files during operation

**External Dependency Handling:**
- External dependencies dropped with CASCADE regardless of tags
- Tag resolution doesn't affect external extension cleanup
- External extensions don't have tag-based targeting

### Missing Tag Features in Revert

#### Cross-Project Tag Revert
- **Current Limitation**: Cannot revert multiple projects to same tag
- **Safety Concern**: Cross-project reverse order must be maintained
- **Complexity**: Requires workspace-level dependency analysis with tag resolution

#### Tag Range Revert
- **Current Limitation**: Can only revert to single tag, not between tags
- **Use Case**: Revert changes between `@v1.0.0` and `@v2.0.0`
- **Implementation**: Would need tag range resolution and change filtering

#### Tag Validation Before Revert
- **Current Limitation**: No pre-revert validation that tag exists/is reachable
- **Safety Concern**: Revert could fail mid-operation if tag is invalid
- **Implementation**: Could add tag validation phase before execution

### Tag-Related Error Scenarios

#### Tag Resolution Failures
- **Invalid Format**: Malformed tag references cause immediate failure
- **Missing Tag**: Tag not found in plan file causes operation failure
- **Plan File Issues**: Corrupted or missing plan files prevent tag resolution

#### Partial Revert Scenarios
- **Module Failure**: If one module fails tag-based revert, others continue
- **Tag Inconsistency**: Different modules might resolve same tag differently
- **External Dependencies**: External extension cleanup proceeds regardless of tag issues

#### Support cross-project dependency-aware revert
- **Status**: Not implemented
- **Reason**: Current revert operations are scoped to individual projects and don't consider dependencies between projects
- **Internal methods involved**: Would need workspace-level dependency resolution, extending `resolveDependencies`
- **Implementation complexity**: **Non-trivial** - requires understanding cross-project dependencies and coordinating rollback order across project boundaries

#### Support workspace-wide recursive revert
- **Status**: Not implemented
- **Reason**: No mechanism exists to revert all projects in a workspace in reverse dependency order
- **Internal methods involved**: Would need workspace-level orchestration, possibly extending `LaunchQLProject`
- **Implementation complexity**: **Easy** - could be implemented by extending existing project-level logic to workspace level with proper reverse ordering

#### Support dry-run revert operations
- **Status**: Not implemented
- **Reason**: No mechanism to preview what would be reverted without actually executing the revert
- **Internal methods involved**: Would need to extend `LaunchQLMigrate.revert()` with dry-run mode
- **Implementation complexity**: **Easy** - could be implemented by adding a flag to skip actual SQL execution while logging planned operations

#### Support revert impact analysis
- **Status**: Not implemented
- **Reason**: No tooling to analyze the impact of a revert operation before execution
- **Internal methods involved**: Would need dependency analysis and change impact assessment
- **Implementation complexity**: **Non-trivial** - requires analyzing SQL changes and their potential impact on dependent modules

## Internal Methods

### Core Revert Functions
- `revertModule(config, database, cwd, options)` - Single module revert
- `revertProject(opts, name, database, dir, options)` - Project-wide revert
- `revertModules(options)` - Orchestration layer

### Dependency Resolution (Reverse Order)
- `LaunchQLProject.getModuleExtensions()` - Module dependency resolution
- **Reverse processing**: `[...extensions.resolved].reverse()` ensures safe rollback order
- External extension handling with CASCADE cleanup

### Tag Resolution
- `resolveTagToChangeName(planPath, tagReference, currentProject)` - Tag to change resolution
- Supports formats: `@tagName` and `project:@tagName`
- Integrates with `LaunchQLMigrate.revert()` for tag-based reverts

### Database Operations
- `LaunchQLMigrate.revert(options)` - Core database revert logic
- External extension cleanup: `DROP EXTENSION IF EXISTS "${extension}" CASCADE`
- Plan file parsing and change tracking in reverse order

## Architecture Notes

### Reverse Dependency Processing
The revert system implements critical safety measures:
1. **Dependency Resolution**: Same as deployment - `resolveDependencies` builds dependency graph
2. **Reverse Order Processing**: `[...extensions.resolved].reverse()` ensures dependencies are removed before dependents
3. **CASCADE Cleanup**: External extensions dropped with CASCADE to handle dependent objects
4. **Module Processing**: Each module reverted via `revertModule` in reverse order

### Transaction Control
- Module-level: Individual module reverts can be wrapped in transactions
- Project-level: Each module revert is independently transacted
- No cross-module transaction support (by design for safety and partial rollback capability)

### Tag Support
- Tags defined in `launchql.plan` files map to specific changes
- `resolveTagToChangeName` handles both simple (`@v1.0`) and qualified (`project:@v1.0`) formats
- Tag resolution occurs before revert execution
- `toChange` parameter is exclusive - the specified change is NOT reverted
- Limited to single-project scope currently

### Safety Mechanisms
- **Reverse dependency order**: Prevents orphaned dependencies
- **CASCADE cleanup**: Handles PostgreSQL extension dependencies
- **Transaction isolation**: Each module revert is atomic
- **Error handling**: Failed reverts don't affect subsequent modules
- **Confirmation support**: Sqitch mode supports confirmation prompts

## Recursive Behaviors in Revert Operations

### Critical Reverse Processing

The revert system implements sophisticated reverse dependency processing to ensure safe rollbacks:

#### Dependency Resolution (Same as Deploy)
- Uses `LaunchQLProject.getModuleExtensions()` to discover all modules
- Calls `resolveDependencies()` with same logic as deployment
- Builds complete dependency graph including external references

#### Reverse Order Enforcement
```typescript
const reversedExtensions = [...extensions.resolved].reverse();
```

This critical line ensures that:
1. **Dependents First**: Modules that depend on others are reverted first
2. **Dependencies Last**: Core dependencies are reverted after their dependents
3. **Safe Rollback**: Prevents orphaned database objects and constraint violations

#### Tag Resolution in Reverse Context
- Same tag resolution modes as deployment: 'preserve', 'resolve', 'internal'
- `resolveTagToChangeName()` works identically for revert operations
- `toChange` parameter is exclusive - target change is NOT reverted
- Tag resolution occurs before reverse processing begins

### Multi-Module Revert Flow

1. **Dependency Discovery**: `LaunchQLProject.getModuleExtensions()` finds all modules
2. **Forward Resolution**: `resolveDependencies()` builds dependency graph in deployment order
3. **Reverse Processing**: Array is reversed to create safe rollback order
4. **External Extensions**: Dropped first with CASCADE to handle dependencies
5. **Local Modules**: Reverted in reverse dependency order
6. **Error Isolation**: Each module revert is independent - failures don't cascade

### Cross-Project Considerations

While current implementation is project-scoped, the architecture supports cross-project revert:
- External dependencies are tracked but not recursively reverted
- `resolveDependencies()` can load plan files from other projects
- Workspace-level revert would need to coordinate across project boundaries
- Reverse order must be maintained across entire workspace dependency graph
