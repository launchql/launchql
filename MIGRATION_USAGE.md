# Migration Usage Analysis

## Current State: `cwd` Parameter Usage

### Overview

The migration functions `deployModules`, `revertModules`, and `verifyModules` in `packages/core/src/migrate/migration.ts` accept a `cwd` parameter that represents the user's current working directory. However, the current implementation has inconsistencies in how this parameter is interpreted and used.

### MigrationOptions Interface

```typescript
export interface MigrationOptions {
  database: string;
  cwd: string;
  recursive?: boolean;
  projectName?: string;  // Required if recursive=true
  useTransaction?: boolean;
  toChange?: string;
  // Options for fast deployment
  fast?: boolean;
  usePlan?: boolean;
  cache?: boolean;
}
```

## Current Usage Patterns

### 1. CLI Commands (Direct Pass-through)

**Location**: `packages/cli/src/commands/{deploy,revert,verify}.ts`

All CLI commands pass `cwd` directly from the prompter without any validation or transformation:

```typescript
// deploy.ts, revert.ts, verify.ts
await deployModules({
  database,
  cwd,           // ← Direct pass-through from prompter
  recursive,
  projectName,
  // ... other options
});
```

**Issue**: The CLI assumes `cwd` is always valid for the intended operation, but doesn't validate whether it's a workspace root, module directory, or somewhere in between.

### 2. Migration Functions (Dual Interpretation)

**Location**: `packages/core/src/migrate/migration.ts`

The migration functions handle `cwd` differently based on the `recursive` flag:

#### Recursive Mode (Project-level operations)
```typescript
if (options.recursive) {
  const project = new LaunchQLProject(options.cwd);  // ← Used as workspace context
  const modules = project.getModuleMap();
  // ... resolves to specific module path later
}
```

#### Non-recursive Mode (Module-level operations)
```typescript
else {
  const client = new LaunchQLMigrate(getPgEnvOptions({ database: options.database }));
  const result = await client.deploy({
    modulePath: options.cwd,  // ← Used directly as module path
    // ...
  });
}
```

**Issue**: In non-recursive mode, `cwd` is passed directly as `modulePath` to `LaunchQLMigrate`, which expects a directory containing `launchql.plan`. This fails if the user runs the command from a workspace root or intermediate directory.

### 3. LaunchQLMigrate Client (Strict Expectations)

**Location**: `packages/core/src/migrate/client.ts`

The `LaunchQLMigrate` client expects `modulePath` to be a directory containing `launchql.plan`:

```typescript
async deploy(options: DeployOptions): Promise<DeployResult> {
  const { modulePath } = options;
  const planPath = join(modulePath, 'launchql.plan');  // ← Assumes plan file exists
  const plan = parsePlanFile(planPath);
  // ...
}
```

**Issue**: If `cwd` points to a workspace root or intermediate directory, this will fail with "launchql.plan not found".

### 4. LaunchQLProject (Smart Path Resolution)

**Location**: `packages/core/src/core/class/launchql.ts`

The `LaunchQLProject` class has sophisticated path resolution logic:

```typescript
constructor(cwd: string = process.cwd()) {
  this.resetCwd(cwd);
}

resetCwd(cwd: string) {
  this.cwd = cwd;
  this.workspacePath = this.resolveLaunchqlPath();  // ← Walks up to find launchql.json
  this.modulePath = this.resolveSqitchPath();       // ← Walks up to find launchql.plan
  // ...
}

getContext(): ProjectContext {
  if (this.modulePath && this.workspacePath) {
    const rel = path.relative(this.workspacePath, this.modulePath);
    const nested = !rel.startsWith('..') && !path.isAbsolute(rel);
    return nested ? ProjectContext.ModuleInsideWorkspace : ProjectContext.Module;
  }
  if (this.modulePath) return ProjectContext.Module;
  if (this.workspacePath) return ProjectContext.Workspace;
  return ProjectContext.Outside;
}
```

**Success**: This class correctly handles various contexts and can determine whether the user is in a workspace, module, or somewhere in between.

## Identified Problems

### 1. Inconsistent Path Interpretation

- **Recursive mode**: `cwd` is treated as workspace context (works well)
- **Non-recursive mode**: `cwd` is treated as module path (fails if not in module directory)

### 2. No Path Validation

CLI commands don't validate whether `cwd` is appropriate for the requested operation:

```typescript
// This can fail silently or with confusing errors
await deployModules({
  cwd: '/workspace/root',  // ← User is in workspace root
  recursive: false         // ← But requesting non-recursive (module-level) operation
});
```

### 3. Poor Error Messages

When `launchql.plan` is not found, users get generic file system errors rather than helpful guidance about context.

### 4. Inconsistent with LaunchQLProject Patterns

The migration functions don't leverage the sophisticated path resolution logic that `LaunchQLProject` already provides.

## Test Usage Patterns

### CoreDeployTestFixture

**Location**: `packages/core/test-utils/CoreDeployTestFixture.ts`

Tests show both patterns:

```typescript
// Workspace-level deployment
const options: MigrationOptions = {
  database,
  cwd: basePath,        // ← Workspace root
  recursive: true,
  projectName: 'my-third'
};

// Module-level deployment  
const options: MigrationOptions = {
  database,
  cwd: projectPath,     // ← Specific module path
  recursive: true,
  projectName
};
```

**Observation**: Even tests sometimes use `recursive: true` with module-specific paths, suggesting the current API is confusing.

## Suggested Refactor

### 1. Enhanced MigrationOptions

```typescript
export interface MigrationOptions {
  database: string;
  cwd: string;
  recursive?: boolean;
  projectName?: string;
  useTransaction?: boolean;
  toChange?: string;
  fast?: boolean;
  usePlan?: boolean;
  cache?: boolean;
  
  // New: Allow explicit path specification
  workspacePath?: string;
  modulePath?: string;
}
```

### 2. Smart Path Resolution

Add path resolution logic similar to `LaunchQLProject`:

```typescript
export async function deployModules(options: MigrationOptions): Promise<void> {
  // Resolve paths using LaunchQLProject logic
  const project = new LaunchQLProject(options.cwd);
  const context = project.getContext();
  
  // Determine operation mode based on context and options
  if (options.recursive || context === ProjectContext.Workspace) {
    // Project-level operation
    if (!options.projectName) {
      // Auto-detect or prompt for project
    }
    // Use workspace-level deployment
  } else if (context === ProjectContext.Module || context === ProjectContext.ModuleInsideWorkspace) {
    // Module-level operation
    const modulePath = project.getModulePath();
    // Use module-level deployment
  } else {
    throw new Error(`Cannot determine operation context from cwd: ${options.cwd}`);
  }
}
```

### 3. Better Error Messages

Provide context-aware error messages:

```typescript
if (context === ProjectContext.Outside) {
  throw new Error(
    `Not in a LaunchQL workspace or module. ` +
    `Please run this command from within a workspace (containing launchql.json) ` +
    `or module (containing launchql.plan).`
  );
}

if (context === ProjectContext.Workspace && !options.recursive && !options.projectName) {
  throw new Error(
    `You are in a workspace root but requested a non-recursive operation. ` +
    `Either use --recursive flag or navigate to a specific module directory.`
  );
}
```

### 4. Backward Compatibility

Maintain existing behavior while adding flexibility:

```typescript
// Current usage continues to work
await deployModules({ database: 'test', cwd: '/some/path', recursive: true, projectName: 'my-app' });

// New usage with auto-detection
await deployModules({ database: 'test', cwd: '/some/path' }); // Auto-detects context and operation mode
```

## Implementation Plan

1. **Phase 1**: Add path resolution logic to migration functions without breaking existing API
2. **Phase 2**: Add better error messages and validation
3. **Phase 3**: Add auto-detection capabilities for operation mode
4. **Phase 4**: Update CLI commands to leverage new capabilities
5. **Phase 5**: Update documentation and examples

## Benefits

1. **Flexibility**: Users can run migration commands from any location within a workspace
2. **Consistency**: Aligns with `LaunchQLProject` path resolution patterns
3. **Better UX**: Clear error messages guide users to correct usage
4. **Backward Compatibility**: Existing code continues to work
5. **Reduced Confusion**: Auto-detection reduces need to understand recursive vs non-recursive modes
