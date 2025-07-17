# LaunchQL Deployment and Revert Documentation

## Table of Contents
1. [Overview](#overview)
2. [Deployment Strategies](#deployment-strategies)
3. [Revert Functionality](#revert-functionality)
4. [Tag Resolution](#tag-resolution)
5. [Error Handling and Failure Recovery](#error-handling-and-failure-recovery)
6. [API Surface and Architecture](#api-surface-and-architecture)
7. [Advanced Features](#advanced-features)

## Overview

LaunchQL provides a sophisticated deployment system that manages PostgreSQL database schema changes through SQL scripts. The system supports multiple deployment strategies, dependency resolution, and safe rollback capabilities.

### Key Components

1. **Core Deployment Engine** (`packages/core/src/projects/deploy-project.ts`)
2. **Migration System** (`packages/migrate/`)
3. **CLI Interface** (`packages/cli/src/commands/deploy.ts`)
4. **Dependency Resolution** (`packages/core/src/deps.ts`)

## Deployment Strategies

LaunchQL supports three distinct deployment strategies:

### 1. Fast Deployment (Default)

Fast deployment is the default and most efficient strategy. It packages all SQL files into a single transaction and executes them directly.

```typescript
// packages/core/src/projects/deploy-project.ts
if (options?.fast ?? true) {
  const pkg = await packageModule(localProject.modulePath, { 
    usePlan: options?.usePlan ?? true, 
    extension: false 
  });
  await pgPool.query(pkg.sql);
}
```

**Features:**
- Concatenates all SQL files based on dependency order
- Executes as a single database transaction
- Supports caching for repeated deployments
- Uses plan file for change ordering by default

**Configuration:**
```bash
# CLI usage
launchql deploy --fast --cache --use-plan
```

### 2. Sqitch-based Deployment (Legacy)

Uses the Sqitch database change management tool for deployments.

```typescript
if (options?.useSqitch) {
  const exitCode = await runSqitch('deploy', database, modulePath, opts.pg as PgConfig, {
    planFile: options.planFile || 'launchql.plan'
  });
}
```

**Features:**
- Maintains compatibility with existing Sqitch deployments
- Tracks individual change deployment status
- Supports incremental deployments

### 3. LaunchQL Migration System

A custom migration system that provides fine-grained control over deployments.

```typescript
await deployModule(opts.pg, database, modulePath, { 
  useTransaction: options?.useTransaction 
});
```

**Features:**
- Stored procedures for deployment tracking
- Built-in dependency validation
- Transaction support per change or entire deployment
- Cross-project dependency support

## Revert Functionality

The revert system mirrors the deployment architecture with three strategies:

### Revert Process Flow

1. **Dependency Check**: Ensures no other changes depend on the change being reverted
2. **Reverse Order**: Processes changes in reverse dependency order
3. **Script Execution**: Runs revert scripts for each change
4. **State Cleanup**: Removes deployment records

```typescript
// packages/core/src/projects/revert-project.ts
const reversedExtensions = [...extensions.resolved].reverse();

for (const extension of reversedExtensions) {
  if (extensions.external.includes(extension)) {
    // Drop external extensions
    await pgPool.query(`DROP EXTENSION IF EXISTS "${extension}" CASCADE;`);
  } else {
    // Revert local modules
    await revertModule(opts.pg, database, modulePath, { 
      useTransaction: options?.useTransaction 
    });
  }
}
```

### Revert Limitations

1. **No Partial Change Revert**: Currently, you cannot revert to a specific change within a module. The system reverts all changes or none.
2. **Dependency Constraints**: Cannot revert a change if other deployed changes depend on it.
3. **External Extensions**: External PostgreSQL extensions are dropped with CASCADE, which may have unintended consequences.

### Revert Safety Features

The migration system includes safety checks in stored procedures:

```sql
-- packages/migrate/src/sql/procedures.sql
IF EXISTS (
  SELECT 1 FROM launchql_migrate.dependencies d
  JOIN launchql_migrate.changes c ON c.change_id = d.change_id
  WHERE (d.requires = p_change_name AND c.project = p_project)
     OR (d.requires = p_project || ':' || p_change_name)
) THEN
  RAISE EXCEPTION 'Cannot revert %: required by %', p_change_name, dependent_changes;
END IF;
```

## Tag Resolution

Tags provide a way to reference specific points in a project's deployment history.

### Tag Format

Tags follow the format: `project:@tagName` or `@tagName` (for current project)

### Resolution Process

The `resolveTagToChangeName` function handles tag resolution:

```typescript
// packages/migrate/src/client.ts
private resolveTagToChangeName(planPath: string, tagReference: string, currentProject?: string): string {
  if (!tagReference.includes('@')) {
    return tagReference;
  }
  
  // Parse tag format
  const match = tagReference.match(/^([^:]+):@(.+)$/);
  if (!match) {
    throw new Error(`Invalid tag format: ${tagReference}`);
  }
  
  const [, projectName, tagName] = match;
  
  // Find tag in plan file
  const tag = planResult.data.tags?.find((t: any) => t.name === tagName);
  if (!tag) {
    throw new Error(`Tag ${tagName} not found in project ${projectName}`);
  }
  
  return tag.change;
}
```

### Tag Resolution in Dependencies

Dependencies can reference tags, which are resolved during deployment:

```typescript
// packages/core/src/deps.ts
if (dep.includes('@')) {
  const match = dep.match(/^([^:]+):@(.+)$/);
  if (match) {
    const [, projectName, tagName] = match;
    const taggedChange = resolveTagToChange(projectName, tagName);
    
    if (taggedChange) {
      if (tagResolution === 'resolve') {
        // Replace tag with actual change
        const resolvedDep = `${projectName}:${taggedChange}`;
        deps[key].push(resolvedDep);
      }
    }
  }
}
```

### Tag Resolution API Location

The `resolveTagToChangeName` function has been hoisted from the `LaunchQLMigrate` client class to the core API surface. It is now available as an exported utility function from `@launchql/core`:

```typescript
import { resolveTagToChangeName } from '@launchql/core';

// Usage
const changeName = resolveTagToChangeName(planPath, '@v1.0.0', 'myproject');
```

This change improves the API design by:
1. **Making tag resolution available to all consumers** - Not just the migrate client
2. **Centralizing plan file operations** - All plan-related utilities in one place
3. **Enabling broader dependency analysis** - Other tools can resolve tags without instantiating a migrate client

Location: `packages/core/src/resolve.ts`

## Error Handling and Failure Recovery

### Deployment Failure Handling

When a deployment fails, the system:

1. **Logs the Failure**: Records in the events table
2. **Throws Typed Error**: Uses `DEPLOYMENT_FAILED` error
3. **Rollback**: If using transactions, automatically rolls back

```typescript
// packages/core/src/projects/deploy-project.ts
try {
  await pgPool.query(pkg.sql);
} catch (err) {
  log.error(`❌ Failed to package module "${extension}"`);
  throw errors.DEPLOYMENT_FAILED({ 
    type: 'Deployment', 
    module: extension
  });
}
```

### Automatic Revert on Failure

**Current Behavior**: LaunchQL does NOT automatically revert on deployment failure.

**Transaction Mode**: When `useTransaction` is enabled:
- Individual change failures roll back that specific change
- The deployment stops at the failed change
- Previously deployed changes remain deployed

**Non-Transaction Mode**: 
- Partial changes from failed scripts may remain
- Manual intervention required to clean up

### Recovery Strategies

1. **Manual Revert**: Run `launchql revert` to roll back deployed changes
2. **Fix and Retry**: Fix the failing script and re-run deployment
3. **Skip Deployed**: The system automatically skips already-deployed changes

## API Surface and Architecture

### Core API Functions

#### Deployment API

```typescript
// High-level deployment
export async function deployModules(options: MigrationOptions): Promise<void>

// Project-level deployment with dependency resolution
export const deployProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string,
  options?: DeploymentOptions
): Promise<Extensions>

// Module-level deployment
export async function deployModule(
  config: Partial<MigrateConfig>,
  database: string,
  cwd: string,
  options?: DeployOptions
): Promise<void>
```

#### Revert API

```typescript
// High-level revert
export async function revertModules(options: MigrationOptions): Promise<void>

// Project-level revert
export const revertProject = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string,
  options?: RevertOptions
): Promise<Extensions>

// Module-level revert
export async function revertModule(
  config: Partial<MigrateConfig>,
  database: string,
  cwd: string,
  options?: RevertOptions
): Promise<void>
```

### Deployment Options

```typescript
interface DeploymentOptions {
  useSqitch?: boolean;      // Use legacy Sqitch
  useTransaction?: boolean;  // Wrap in transaction
  fast?: boolean;           // Use fast deployment (default: true)
  usePlan?: boolean;        // Use plan file for ordering
  cache?: boolean;          // Cache packaged modules
  planFile?: string;        // Custom plan file name
  toChange?: string;        // Deploy up to specific change (inclusive)
}

interface RevertOptions {
  useSqitch?: boolean;      // Use legacy Sqitch
  useTransaction?: boolean;  // Wrap in transaction
  planFile?: string;        // Custom plan file name
  toChange?: string;        // Revert to specific change (exclusive)
}
```

### Partial Deployment and Revert

The `toChange` parameter enables partial deployments and reverts:

```bash
# Deploy up to and including a specific change
launchql deploy --to-change "users/table"

# Deploy up to a tagged version
launchql deploy --to-change "@v1.0.0"

# Revert to a specific change (not including it)
launchql revert --to-change "users/table"
```

**Important Notes:**
- For deployment: `toChange` is **inclusive** - the specified change will be deployed
- For revert: `toChange` is **exclusive** - the specified change will NOT be reverted
- Verify operations do not support `toChange` - they always verify all deployed changes

### Migration Schema

The migration system uses a dedicated schema `launchql_migrate` with tables:

1. **projects**: Registered projects
2. **changes**: Deployed changes with hash tracking
3. **dependencies**: Change dependency relationships
4. **events**: Deployment/revert event log

## Advanced Features

### Cross-Project Dependencies

LaunchQL supports dependencies across projects:

```sql
-- requires: auth:users/table
-- requires: billing:@v1.0.0
```

### Deployment Caching

Fast deployment supports caching of packaged SQL:

```typescript
const cacheKey = getCacheKey(opts.pg as PgConfig, extension, database);
if (options?.cache && deployFastCache[cacheKey]) {
  log.warn(`⚡ Using cached pkg for ${extension}.`);
  await pgPool.query(deployFastCache[cacheKey].sql);
  continue;
}
```

### Plan File Resolution

The system supports multiple plan file strategies:

1. **Default**: `launchql.plan`
2. **Custom**: Specified via `planFile` option
3. **Module-specific**: Each module can have its own plan file

### Dependency Resolution Modes

```typescript
export interface DependencyResolutionOptions {
  tagResolution?: 'preserve' | 'resolve' | 'internal';
  loadPlanFiles?: boolean;
  planFileLoader?: (projectName: string, currentProject: string, packageDir: string) => ExtendedPlanFile | null;
}
```

- **preserve**: Keep tags as-is in dependencies
- **resolve**: Replace tags with actual change names
- **internal**: Resolve internally but preserve in output

## Best Practices

1. **Use Transactions**: Enable `useTransaction` for safer deployments
2. **Test Deployments**: Deploy to test databases first
3. **Version Tags**: Use semantic versioning for tags
4. **Dependency Documentation**: Document cross-project dependencies
5. **Revert Scripts**: Always provide comprehensive revert scripts
6. **Verify Scripts**: Include verify scripts for critical changes

## Future Enhancements

1. **Partial Revert**: Support reverting to a specific change
2. **Dry Run Mode**: Preview deployment without executing
3. **Parallel Deployment**: Deploy independent modules in parallel
4. **Rollback Points**: Automatic savepoints for complex deployments
5. **Deployment Hooks**: Pre/post deployment scripts
6. **Change Editing**: Modify deployed changes without full revert