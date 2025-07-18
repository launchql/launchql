# LaunchQL Verification System

## Overview

The LaunchQL verification system provides comprehensive functionality for validating the current state of deployed database schema changes across modules and projects. It ensures that deployed changes match their expected state and can detect inconsistencies or missing deployments without making any modifications to the database.

## Current Behavior

### Module-Level Verification (`verifyModule`)

The `verifyModule` function handles verification of individual modules:

- **Location**: `src/modules/verify.ts`
- **Purpose**: Verify database changes for a single module against its plan file
- **Behavior**: 
  - Checks for existence of `launchql.plan` file
  - Initializes `LaunchQLMigrate` client with database configuration
  - Executes verification without modifying the database
  - Validates that all deployed changes match their expected state
  - Throws error if any changes fail verification
  - Logs number of successfully verified changes
  - Mimics Sqitch verify behavior for compatibility

### Project-Level Verification (`verifyProject`)

The `verifyProject` function orchestrates verification across multiple modules:

- **Location**: `src/projects/verify.ts`
- **Purpose**: Verify all modules within a project in dependency order
- **Behavior**:
  - Resolves module dependencies using `LaunchQLProject.getModuleExtensions()`
  - Processes modules in forward dependency order (same as deployment)
  - Handles external extensions via PostgreSQL availability check (`pg_available_extensions`)
  - Delegates to `verifyModule` for local modules
  - Supports both Sqitch compatibility mode and native LaunchQL migration
  - Uses query `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1` for external extension verification
  - Continues verification even if individual modules fail (logs errors)

### Orchestration-Level Verification (`verifyModules`)

The `verifyModules` function provides the highest-level verification interface:

- **Location**: `src/migrate/migration.ts`
- **Purpose**: Handle both recursive (project-level) and non-recursive (module-level) operations
- **Behavior**:
  - Routes to `verifyProject` when `recursive: true`
  - Routes to `verifyModule` when `recursive: false`
  - Validates required parameters based on operation mode
  - Provides unified interface for CLI and programmatic usage

### Database Validation (`LaunchQLMigrate.verify`)

The core database verification logic:

- **Location**: `src/migrate/client.ts` (lines 281-337)
- **Purpose**: Perform actual database state validation
- **Behavior**:
  - Queries migration tracking tables to get deployed changes
  - Compares deployed state against plan file expectations
  - Validates change checksums and dependencies
  - Returns detailed verification results
  - Does not modify database state during verification

## Capabilities

- [x] Support verifying individual modules
- [x] Support verifying individual projects
- [ ] Support verifying via tag (tag-based verification)
- [ ] Support recursive verify across project graph
- [x] Support external extension availability checking
- [x] Support Sqitch compatibility mode
- [x] Support change state validation
- [x] Support dependency order verification
- [ ] Support workspace-wide recursive verification
- [ ] Support verification reporting and summaries
- [ ] Support verification with change targeting
- [ ] Support verification impact analysis
- [ ] Support verification dry-run mode

### Missing Capabilities Analysis

#### Support verifying via tag (tag-based verification)
- **Status**: Not implemented
- **Reason**: While deployment and revert support tag-based operations via `toChange`, verification doesn't have equivalent tag-based targeting
- **Internal methods involved**: Would need `resolveTagToChangeName` integration with `verifyModule` and `verifyProject`
- **Implementation complexity**: **Easy** - could be implemented by adding `toChange` parameter to verification functions and integrating existing tag resolution

## Tag Support in Verification Operations

### Current Tag Support Status

The verification system currently lacks tag support, representing a significant gap compared to deploy and revert operations:

#### Missing Tag Integration Points

**Module-Level Verification:**
- `verifyModule()` function has no `toChange` parameter
- Cannot verify deployment state up to a specific tag
- No integration with `resolveTagToChangeName()` function

**Project-Level Verification:**
- `verifyProject()` function has no tag support
- Cannot verify project state at tagged releases
- No mechanism to pass tag references to individual modules

**Database Verification:**
- `LaunchQLMigrate.verify()` has no tag resolution logic
- Verifies entire deployed state, not state at specific tag
- No filtering of changes based on tag boundaries

### Tag Support Infrastructure Available

Despite missing integration, the verification system could leverage existing tag infrastructure:

#### Available Tag Resolution Components
- **`resolveTagToChangeName()`**: Fully functional tag resolution
- **Tag Formats**: Support for `@tagName` and `project:@tagName` already exists
- **Plan File Parsing**: Tag definitions already parsed from plan files
- **Dependency Resolution**: `resolveDependencies()` supports tag resolution modes

#### Verification-Specific Tag Requirements

**Tag-Based State Validation:**
- Verify only changes deployed up to specified tag
- Validate that tag-referenced changes are properly deployed
- Ensure no changes beyond tag are present in database

**Tag Boundary Enforcement:**
- Filter verification scope to changes within tag boundary
- Validate tag exists and is reachable in deployment history
- Handle tag resolution errors gracefully

### Implementation Path for Tag Support

#### Easy Implementation Steps

**1. Add `toChange` Parameter:**
```typescript
// Current signature
verifyModule(config, database, cwd, options?)

// Proposed signature  
verifyModule(config, database, cwd, options?: { toChange?: string })
```

**2. Integrate Tag Resolution:**
```typescript
// In verifyModule function
const resolvedToChange = toChange && toChange.includes('@') 
  ? resolveTagToChangeName(planPath, toChange, project) 
  : toChange;
```

**3. Pass to Database Layer:**
```typescript
// Pass resolved tag to LaunchQLMigrate
await client.verify({ 
  project, 
  targetDatabase: database, 
  planPath,
  toChange: resolvedToChange 
});
```

#### Database Layer Changes Required

**Modify `LaunchQLMigrate.verify()`:**
- Add `toChange` parameter to `VerifyOptions` interface
- Filter verification scope to changes up to resolved tag
- Validate tag boundary in deployed changes

**Change Filtering Logic:**
- Query deployed changes up to tag boundary
- Verify only changes within scope
- Report on changes beyond tag (if any)

### Tag Verification Use Cases

#### Release Validation
- **Use Case**: Verify production database matches tagged release
- **Command**: `launchql verify --to @v1.2.0`
- **Benefit**: Ensures deployment matches expected release state

#### Rollback Validation
- **Use Case**: Verify database state after tag-based revert
- **Command**: `launchql verify --to @v1.1.0` (after reverting from v1.2.0)
- **Benefit**: Confirms revert operation completed successfully

#### Development Validation
- **Use Case**: Verify development database matches feature branch tag
- **Command**: `launchql verify --to feature:@milestone-1`
- **Benefit**: Validates development environment consistency

### Missing Advanced Tag Features

#### Tag Range Verification
- **Feature**: Verify changes between two tags
- **Use Case**: Validate specific release changes
- **Implementation Complexity**: **Non-trivial** - requires tag range resolution

#### Cross-Project Tag Verification
- **Feature**: Verify multiple projects at same tag
- **Use Case**: Validate workspace-wide release state
- **Implementation Complexity**: **Non-trivial** - requires cross-project coordination

#### Tag History Verification
- **Feature**: Verify deployment history matches tag progression
- **Use Case**: Validate deployment audit trail
- **Implementation Complexity**: **Non-trivial** - requires historical state analysis

#### Support recursive verify across project graph
- **Status**: Not implemented
- **Reason**: Current verification is scoped to individual projects and doesn't traverse cross-project dependencies
- **Internal methods involved**: Would need workspace-level dependency resolution, extending `resolveDependencies`
- **Implementation complexity**: **Non-trivial** - requires understanding cross-project dependencies and coordinating verification across project boundaries

#### Support workspace-wide recursive verification
- **Status**: Not implemented
- **Reason**: No mechanism exists to verify all projects in a workspace in dependency order
- **Internal methods involved**: Would need workspace-level orchestration, possibly extending `LaunchQLProject`
- **Implementation complexity**: **Easy** - could be implemented by extending existing project-level logic to workspace level

#### Support verification reporting and summaries
- **Status**: Partially supported
- **Reason**: Basic logging exists but no comprehensive reporting or summary generation
- **Internal methods involved**: Would need to extend verification result handling and add reporting utilities
- **Implementation complexity**: **Easy** - could be implemented by enhancing existing result logging and adding summary generation

#### Support verification with change targeting
- **Status**: Not implemented
- **Reason**: No mechanism to verify only up to a specific change (unlike deploy/revert `toChange`)
- **Internal methods involved**: Would need to add `toChange` parameter support to verification functions
- **Implementation complexity**: **Easy** - could be implemented by adding change targeting logic similar to deploy/revert

#### Support verification impact analysis
- **Status**: Not implemented
- **Reason**: No tooling to analyze what verification would check before execution
- **Internal methods involved**: Would need dependency analysis and change impact assessment
- **Implementation complexity**: **Non-trivial** - requires analyzing planned verification scope and potential issues

#### Support verification dry-run mode
- **Status**: Unknown
- **Reason**: Verification is inherently read-only, but no explicit dry-run mode for preview
- **Internal methods involved**: Would need to extend verification logging to show what would be verified
- **Implementation complexity**: **Easy** - verification is already non-destructive, just needs enhanced preview logging

## Internal Methods

### Core Verification Functions
- `verifyModule(config, database, cwd, options)` - Single module verification
- `verifyProject(opts, name, database, dir, options)` - Project-wide verification
- `verifyModules(options)` - Orchestration layer

### Dependency Resolution (Forward Order)
- `LaunchQLProject.getModuleExtensions()` - Module dependency resolution
- **Forward processing**: Uses same order as deployment for consistency
- External extension availability checking via `pg_available_extensions`

### Database Validation
- `LaunchQLMigrate.verify(options)` - Core database verification logic
- Migration state queries and validation
- Change checksum verification
- Dependency validation

### External Extension Verification
- Query: `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`
- Validates that required external extensions are available
- Does not check if extensions are actually installed, only available

## Architecture Notes

### Forward Dependency Processing
The verification system processes modules in deployment order:
1. **Dependency Resolution**: Same as deployment - `resolveDependencies` builds dependency graph
2. **Forward Order Processing**: Processes modules in same order as deployment
3. **External Extension Checks**: Validates availability before checking local modules
4. **Module Processing**: Each module verified via `verifyModule` in dependency order

### Read-Only Operations
- **No Database Modifications**: Verification never changes database state
- **State Validation**: Compares current state against expected state
- **Error Reporting**: Reports inconsistencies without attempting fixes
- **Continuation**: Verification continues even if individual modules fail

### External Extension Handling
- **Availability Check**: Uses `pg_available_extensions` system view
- **Non-Installation Check**: Only verifies extensions are available, not installed
- **Error Handling**: Treats unavailable extensions as verification failures

### Sqitch Compatibility
- **Plan File Support**: Works with standard `launchql.plan` files
- **Command Compatibility**: Supports Sqitch-style verification workflows
- **Exit Code Handling**: Proper exit code handling for CI/CD integration

### Verification Scope
- **Module Level**: Verifies individual module state
- **Project Level**: Verifies all modules in a project
- **No Cross-Project**: Limited to single project scope currently
- **No Tag Support**: Cannot verify state at specific tags currently

## Recursive Behaviors in Verification Operations

### Forward Dependency Processing

The verification system processes modules in the same order as deployment to maintain consistency:

#### Dependency Resolution (Same as Deploy/Revert)
- Uses `LaunchQLProject.getModuleExtensions()` for module discovery
- Calls `resolveDependencies()` with identical logic to deployment
- Builds complete dependency graph including external references
- Maintains forward processing order (no reversal like revert)

#### Tag Resolution Support (Currently Limited)
- Same `resolveDependencies()` infrastructure supports tag resolution modes
- Could support 'preserve', 'resolve', 'internal' modes like deploy/revert
- Currently no `toChange` parameter support in verification functions
- Tag resolution would occur before verification execution

### Multi-Module Verification Flow

1. **Dependency Discovery**: `LaunchQLProject.getModuleExtensions()` finds all modules
2. **Forward Resolution**: `resolveDependencies()` builds dependency graph
3. **Forward Processing**: Modules verified in deployment order
4. **External Extensions**: Availability checked via `pg_available_extensions`
5. **Local Modules**: Each verified via `verifyModule()` in dependency order
6. **Continuation**: Verification continues even if individual modules fail

### Database State Validation

The verification system uses `LaunchQLMigrate.verify()` (lines 281-337 in `src/migrate/client.ts`) for:
- **Migration State Queries**: Checks deployed changes against tracking tables
- **Checksum Validation**: Ensures deployed changes match expected checksums
- **Dependency Validation**: Verifies all required dependencies are present
- **Read-Only Operations**: Never modifies database state during verification

### Cross-Project Verification Potential

While currently project-scoped, the architecture could support cross-project verification:
- `resolveDependencies()` can load plan files from other projects
- External dependencies are tracked but not recursively verified
- Workspace-level verification would need to coordinate across project boundaries
- Forward order must be maintained across entire workspace dependency graph

### Verification vs Deploy/Revert Recursion

| Aspect | Deploy | Revert | Verify |
|--------|--------|--------|--------|
| **Order** | Forward (dependencies first) | Reverse (dependents first) | Forward (same as deploy) |
| **External Handling** | CREATE EXTENSION | DROP EXTENSION CASCADE | Check availability |
| **Tag Support** | Full support via `toChange` | Full support via `toChange` | Not implemented |
| **Cross-Project** | Limited to external refs | Limited to external refs | Limited to external refs |
| **Database Changes** | Modifies state | Modifies state | Read-only validation |
