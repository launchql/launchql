# LaunchQL Deployment System

## Overview

The LaunchQL deployment system provides a comprehensive solution for managing database schema changes across modules and projects. It supports both individual module deployments and recursive project-wide operations with sophisticated dependency resolution.

## Current Behavior

### Module-Level Deployment (`deployModule`)

The `deployModule` function handles deployment of individual modules:

- **Location**: `src/modules/deploy.ts`
- **Purpose**: Deploy database changes for a single module based on its plan file
- **Behavior**: 
  - Checks for existence of `launchql.plan` file
  - Initializes `LaunchQLMigrate` client with database configuration
  - Executes deployment with optional transaction control
  - Supports deploying up to a specific change via `toChange` parameter
  - Logs deployment results including deployed and skipped changes

### Project-Level Deployment (`deployProject`)

The `deployProject` function orchestrates deployment across multiple modules:

- **Location**: `src/projects/deploy.ts`
- **Purpose**: Deploy all modules within a project in dependency order
- **Behavior**:
  - Resolves module dependencies using `LaunchQLProject.getModuleExtensions()`
  - Iterates through resolved extensions in topological order
  - Handles external extensions via PostgreSQL `CREATE EXTENSION`
  - Delegates to `deployModule` for local modules
  - Supports both Sqitch compatibility mode and native LaunchQL migration
  - Provides transaction control and change targeting

### Orchestration-Level Deployment (`deployModules`)

The `deployModules` function provides the highest-level deployment interface:

- **Location**: `src/migrate/migration.ts`
- **Purpose**: Handle both recursive (project-level) and non-recursive (module-level) operations
- **Behavior**:
  - Routes to `deployProject` when `recursive: true`
  - Routes to `deployModule` when `recursive: false`
  - Validates required parameters based on operation mode
  - Provides unified interface for CLI and programmatic usage

### Missing Capabilities Analysis

#### Support recursive deploy via tag (across projects/modules)
- **Status**: Not implemented
- **Reason**: While individual modules and projects support tag-based deployment via `toChange`, there's no mechanism to recursively deploy across multiple projects using a single tag reference
- **Internal methods involved**: Would need `resolveTagToChangeName`, `resolveDependencies` with cross-project awareness
- **Implementation complexity**: **Non-trivial** - requires extending dependency resolution to work across project boundaries and coordinating tag resolution across multiple plan files

## Tag Support Capabilities

### Current Tag Support Architecture

The LaunchQL system provides comprehensive tag support through several key components:

#### Tag Definition and Storage
- **Plan Files**: Tags are defined in `launchql.plan` files with format: `%tag_name change_name`
- **Tag Structure**: Each tag maps to a specific change name within a project
- **Project Scoping**: Tags are scoped to individual projects by default

#### Tag Resolution Function (`resolveTagToChangeName`)
Located in `src/resolution/resolve.ts` (lines 82-126), this function provides:

**Supported Tag Formats:**
- **Simple Format**: `@tagName` - resolves within current project context
- **Qualified Format**: `project:@tagName` - explicitly specifies target project
- **Fallback Handling**: Non-tag references pass through unchanged

**Resolution Process:**
1. **Format Detection**: Checks for `@` symbol to identify tag references
2. **Project Resolution**: Adds current project prefix for simple format tags
3. **Plan File Parsing**: Loads and parses target project's plan file
4. **Tag Lookup**: Searches plan file tags array for matching tag name
5. **Change Return**: Returns the change name that the tag points to

#### Tag Integration Points

**Module-Level Operations:**
- `deployModule()`: Accepts `toChange` parameter supporting tag references
- `revertModule()`: Accepts `toChange` parameter supporting tag references  
- `verifyModule()`: Currently no tag support (missing feature)

**Project-Level Operations:**
- `deployProject()`: Passes `toChange` through to individual modules
- `revertProject()`: Passes `toChange` through to individual modules
- `verifyProject()`: Currently no tag support (missing feature)

**Database Operations:**
- `LaunchQLMigrate.deploy()`: Calls `resolveTagToChangeName` when `toChange` contains `@`
- `LaunchQLMigrate.revert()`: Calls `resolveTagToChangeName` when `toChange` contains `@`
- `LaunchQLMigrate.verify()`: No tag resolution integration

#### Dependency Resolution Tag Modes

The `resolveDependencies()` function supports three tag resolution modes:

**'preserve' Mode (Default):**
- Keeps tag references as-is in dependency graph
- Tags remain unresolved until deployment execution
- Maintains original tag syntax in dependency tracking

**'resolve' Mode:**
- Fully resolves tags to their target changes during dependency resolution
- Replaces tag references with actual change names
- Enables dependency analysis on resolved changes

**'internal' Mode:**
- Resolves tags internally but preserves original references in output
- Maintains tag mappings for later resolution
- Balances resolution needs with tag preservation

### Tag Support Limitations

#### Cross-Project Tag Operations
- **Current State**: Tags work within single project scope
- **Limitation**: No mechanism for workspace-wide tag-based operations
- **Impact**: Cannot deploy/revert multiple projects to same tag simultaneously

#### Verification Tag Support
- **Current State**: Verification functions don't support tag parameters
- **Limitation**: Cannot verify deployment state at specific tag
- **Impact**: No way to validate that database matches tagged state

#### Tag Dependency Resolution
- **Current State**: Tags in dependency statements are resolved per project
- **Limitation**: Cross-project tag dependencies not fully supported
- **Impact**: Complex multi-project tag scenarios may not resolve correctly

### Implementation Complexity for Missing Features

#### Workspace-Wide Tag Operations
- **Complexity**: **Non-trivial**
- **Requirements**: 
  - Workspace-level tag coordination
  - Cross-project dependency resolution
  - Unified tag namespace or conflict resolution
- **Internal Methods**: Would extend `LaunchQLProject`, `resolveDependencies`

#### Verification Tag Support  
- **Complexity**: **Easy**
- **Requirements**:
  - Add `toChange` parameter to verification functions
  - Integrate `resolveTagToChangeName` in verification flow
- **Internal Methods**: Modify `verifyModule`, `verifyProject`, `verifyModules`

#### Advanced Tag Features
- **Tag Inheritance**: **Non-trivial** - would need hierarchical tag resolution
- **Tag Validation**: **Easy** - could validate tag existence before operations
- **Tag History**: **Non-trivial** - would need tag change tracking over time

#### Support cross-project dependency resolution  
- **Status**: Partially supported
- **Reason**: `resolveDependencies` can handle external dependencies but doesn't recursively resolve them across project boundaries
- **Internal methods involved**: `resolveDependencies`, `LaunchQLProject.getModuleMap`
- **Implementation complexity**: **Non-trivial** - requires workspace-aware dependency resolution and cross-project plan file coordination

#### Support workspace-wide recursive deployment
- **Status**: Not implemented  
- **Reason**: No mechanism exists to deploy all projects in a workspace in dependency order
- **Internal methods involved**: Would need workspace-level orchestration, possibly extending `LaunchQLProject`
- **Implementation complexity**: **Easy** - could be implemented by extending existing project-level logic to workspace level

#### Support parallel deployment of independent modules
- **Status**: Not implemented
- **Reason**: Current implementation processes modules sequentially
- **Internal methods involved**: Would need async coordination in `deployProject` and `deployModules`
- **Implementation complexity**: **Non-trivial** - requires careful handling of database connections and transaction coordination

## Internal Methods

### Core Deployment Functions
- `deployModule(config, database, cwd, options)` - Single module deployment
- `deployProject(opts, name, database, dir, options)` - Project-wide deployment  
- `deployModules(options)` - Orchestration layer

### Dependency Resolution
- `resolveDependencies(packageDir, extname, options)` - Main dependency resolver
- `LaunchQLProject.getModuleExtensions()` - Module dependency resolution
- `LaunchQLProject.getModuleMap()` - Module discovery and mapping

### Tag Resolution
- `resolveTagToChangeName(planPath, tagReference, currentProject)` - Tag to change resolution
- Supports formats: `@tagName` and `project:@tagName`
- Integrates with `LaunchQLMigrate.deploy()` for tag-based deployments

### Database Operations
- `LaunchQLMigrate.deploy(options)` - Core database deployment logic
- `LaunchQLMigrate.initializeSchema()` - Migration schema setup
- Plan file parsing and change tracking

## Architecture Notes

### Recursive Behavior
The system implements recursion at the project level:
1. **Project Discovery**: `LaunchQLProject` scans workspace for modules
2. **Dependency Resolution**: `resolveDependencies` builds dependency graph
3. **Topological Sort**: Dependencies processed in correct order
4. **Module Processing**: Each module deployed via `deployModule`

### Transaction Control
- Module-level: Individual module deployments can be wrapped in transactions
- Project-level: Each module deployment is independently transacted
- No cross-module transaction support (by design for safety)

### Tag Support
- Tags defined in `launchql.plan` files map to specific changes
- `resolveTagToChangeName` handles both simple (`@v1.0`) and qualified (`project:@v1.0`) formats
- Tag resolution occurs before deployment execution
- Limited to single-project scope currently

## Recursive Behaviors

### Multi-Module Operations via LaunchQLProject

The `LaunchQLProject.getModuleExtensions()` method (lines 219-225 in `src/core/class/launchql.ts`) enables multi-module operations by:

1. **Module Discovery**: Scans workspace for all available modules using `getModuleMap()`
2. **Dependency Resolution**: Calls `resolveDependencies()` to build complete dependency graph
3. **Extension Filtering**: Returns both resolved modules and external dependencies
4. **Topological Ordering**: Ensures modules are processed in correct dependency order

### Dependency Resolution System

The `resolveDependencies()` function (lines 223-533 in `src/resolution/deps.ts`) provides sophisticated dependency management:

#### Tag Resolution Modes
- **'preserve'**: Keep tags as-is in dependency graph (default behavior)
- **'resolve'**: Fully resolve tags to their target changes before processing
- **'internal'**: Resolve tags internally but preserve original references in output

#### Recursive Processing
1. **SQL File Scanning**: Parses all `deploy/*.sql` files for `-- requires:` statements
2. **Dependency Graph Building**: Creates complete dependency map with circular detection
3. **External Dependency Handling**: Identifies and tracks cross-project dependencies
4. **Topological Sort**: Orders modules to respect all dependencies

#### Cross-Project Awareness
- Handles `project:module` syntax for external references
- Loads plan files from other projects when needed
- Maintains separation between internal and external dependencies
- Supports workspace-level module discovery via `LaunchQLProject`

### Deployment Recursion Flow

1. **Entry Point**: `deployModules()` with `recursive: true`
2. **Project Resolution**: Routes to `deployProject()` 
3. **Module Discovery**: `LaunchQLProject.getModuleExtensions()` finds all modules
4. **Dependency Order**: Processes modules in topological order
5. **Individual Deployment**: Each module deployed via `deployModule()`
6. **External Extensions**: PostgreSQL extensions created via `CREATE EXTENSION`

### Revert Recursion Flow (Reverse Order)

1. **Entry Point**: `revertModules()` with `recursive: true`
2. **Project Resolution**: Routes to `revertProject()`
3. **Module Discovery**: Same as deployment - `LaunchQLProject.getModuleExtensions()`
4. **Reverse Order**: `[...extensions.resolved].reverse()` for safe rollback
5. **Individual Revert**: Each module reverted via `revertModule()`
6. **External Cleanup**: PostgreSQL extensions dropped with CASCADE

### Verification Recursion Flow (Forward Order)

1. **Entry Point**: `verifyModules()` with `recursive: true`
2. **Project Resolution**: Routes to `verifyProject()`
3. **Module Discovery**: Same dependency resolution as deployment
4. **Forward Order**: Processes in deployment order for consistency
5. **Individual Verification**: Each module verified via `verifyModule()`
6. **External Validation**: Checks extension availability via `pg_available_extensions`
