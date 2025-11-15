# LaunchQL Core Package - Agent Guide

The `@launchql/core` package is the heart of the LaunchQL framework, providing the main orchestration classes and migration engine. This guide helps agents understand the key classes and their methods.

## 🎯 Overview

**Main Purpose:** Database migrations, package management, and package scaffolding for PostgreSQL-backed applications.

**Key Responsibilities:**
- Managing PostgreSQL extensions and modules
- Deploying, reverting, and verifying migrations  
- Parsing and generating migration plans
- Reading and writing SQL scripts
- Resolving dependencies between migrations

## 🏗️ Core Architecture

### Main Entry Point
**File:** `src/index.ts`

**Key Exports:**
```typescript
// Main classes
export { LaunchQLPackage } from './core/class/launchql';
export { LaunchQLMigrate } from './migrate/client';
export { LaunchQLInit } from './init/client';

// Migration types
export { DeployOptions, DeployResult, RevertOptions, RevertResult, StatusResult, VerifyOptions, VerifyResult } from './migrate/types';

// Utilities
export { hashFile, hashString } from './migrate/utils/hash';
export { executeQuery, TransactionContext, TransactionOptions, withTransaction } from './migrate/utils/transaction';
```

## 🎮 LaunchQLPackage Class

**Location:** `src/core/class/launchql.ts`
**Purpose:** High-level orchestration for workspace and module management

### Context Management

```typescript
enum PackageContext {
  Outside = 'outside',
  Workspace = 'workspace-root', 
  Module = 'module',
  ModuleInsideWorkspace = 'module-in-workspace'
}
```

**Key Context Methods:**
- `getContext(): PackageContext` - Determine current context
- `isInWorkspace(): boolean` - Check if in workspace
- `isInModule(): boolean` - Check if in module
- `ensureWorkspace()` - Throw error if not in workspace
- `ensureModule()` - Throw error if not in module

### Workspace Operations

**Module Discovery:**
- `getModules(): Promise<LaunchQLPackage[]>` - Get all workspace modules
- `listModules(): ModuleMap` - Parse .control files to find modules
- `getModuleMap(): ModuleMap` - Get cached module map
- `getAvailableModules(): string[]` - Get list of available module names
- `getModuleProject(name: string): LaunchQLPackage` - Get specific module project

**Module Creation:**
- `initModule(options: InitModuleOptions): void` - Initialize new module
- `createModuleDirectory(modName: string): string` - Create module directory structure

```typescript
interface InitModuleOptions {
  name: string;
  description: string;
  author: string;
  extensions: string[];
}
```

### Module Operations

**Module Information:**
- `getModuleInfo(): ExtensionInfo` - Get current module info
- `getModuleName(): string` - Get current module name
- `getRequiredModules(): string[]` - Get module dependencies

**Dependency Management:**
- `setModuleDependencies(modules: string[]): void` - Set module dependencies
- `validateModuleDependencies(modules: string[]): void` - Check for circular dependencies
- `getModuleExtensions(): { resolved: string[]; external: string[] }` - Get extension dependencies
- `getModuleDependencies(moduleName: string): { native: string[]; modules: string[] }` - Get dependencies
- `getModuleDependencyChanges(moduleName: string)` - Get dependency changes with versions

### Plan Management

**Plan Operations:**
- `getModulePlan(): string` - Read launchql.plan file
- `generateModulePlan(options): string` - Generate plan from dependencies
- `writeModulePlan(options): void` - Write generated plan to file
- `addTag(tagName: string, changeName?: string, comment?: string): void` - Add version tag

**Plan Generation Options:**
```typescript
interface PlanOptions {
  uri?: string;
  includePackages?: boolean;
  includeTags?: boolean;
}
```

### Deployment Operations

**Main Deployment Method:**
```typescript
async deploy(
  opts: LaunchQLOptions,
  target?: string,        // Package:change or package:@tag format
  recursive: boolean = true
): Promise<void>
```

**Deployment Features:**
- **Fast Deployment:** Uses `packageModule()` for consolidated SQL
- **Standard Deployment:** Uses `LaunchQLMigrate` for change-by-change deployment
- **Dependency Resolution:** Automatically resolves and deploys dependencies
- **Caching:** Optional caching for fast deployments
- **Transaction Control:** Configurable transaction usage

**Revert Operations:**
```typescript
async revert(opts: LaunchQLOptions, target?: string): Promise<void>
```

**Verification:**
```typescript
async verify(opts: LaunchQLOptions, target?: string): Promise<void>
```

### Package Management

**Installation:**
- `installModules(...pkgstrs: string[]): Promise<void>` - Install npm packages as modules
- `publishToDist(distFolder?: string): void` - Package module for distribution

**Analysis:**
- `analyzeModule(): PackageAnalysisResult` - Analyze module for issues
- `renameModule(to: string, options?: RenameOptions): void` - Rename module

**Utility Methods:**
- `removeFromPlan(changeName: string): void` - Remove change from plan
- `resolveWorkspaceExtensionDependencies()` - Get all workspace dependencies
- `parsePackageTarget(target?: string)` - Parse deployment target strings

## 🔄 LaunchQLMigrate Class

**Location:** `src/migrate/client.ts`
**Purpose:** Low-level database migration execution

### Configuration

```typescript
interface LaunchQLMigrateOptions {
  hashMethod?: 'content' | 'ast'; // How to hash SQL files
}
```

**Hash Methods:**
- `content` - Hash raw file content (fast, sensitive to formatting)
- `ast` - Hash parsed AST structure (robust, ignores formatting)

### Core Migration Operations

**Deploy Changes:**
```typescript
async deploy(options: DeployOptions): Promise<DeployResult>
```

**DeployOptions:**
```typescript
interface DeployOptions {
  modulePath: string;
  toChange?: string;        // Stop at specific change
  useTransaction?: boolean; // Default: true
  debug?: boolean;         // Show full SQL on errors
  logOnly?: boolean;       // Log without executing
  usePlan?: boolean;       // Use plan vs SQL files
}
```

**Revert Changes:**
```typescript
async revert(options: RevertOptions): Promise<RevertResult>
```

**Verify Changes:**
```typescript
async verify(options: VerifyOptions): Promise<VerifyResult>
```

### Status and Introspection

**Status Checking:**
- `status(packageName?: string): Promise<StatusResult[]>` - Get deployment status
- `isDeployed(packageName: string, changeName: string): Promise<boolean>` - Check if change is deployed
- `getRecentChanges(targetDatabase: string, limit?: number)` - Get recent deployments
- `getPendingChanges(planPath: string, targetDatabase: string)` - Get undeployed changes
- `getDeployedChanges(targetDatabase: string, packageName: string)` - Get all deployed changes
- `getDependencies(packageName: string, changeName: string)` - Get change dependencies

**Migration Schema:**
- `initialize(): Promise<void>` - Create pgpm_migrate schema
- `hasSqitchTables(): Promise<boolean>` - Check for existing Sqitch tables
- `importFromSqitch(): Promise<void>` - Import from existing Sqitch deployment

### Error Handling and Debugging

**Error Context:** The deploy method provides comprehensive error information:
- Change name and package
- Script hash and dependencies
- SQL script preview (first 10 lines by default, full script in debug mode)
- PostgreSQL error codes with hints
- Debugging suggestions based on error type

**Common Error Codes:**
- `25P02` - Previous command in transaction failed
- `42P01` - Table/view does not exist
- `42883` - Function does not exist

## 🔧 Supporting Systems

### Dependency Resolution
**Location:** `src/resolution/deps.ts`

**Key Functions:**
- `resolveDependencies(cwd, moduleName, options)` - Resolve module dependencies
- `resolveExtensionDependencies(moduleName, moduleMap)` - Resolve extension dependencies

### File Operations
**Location:** `src/files/`

**Key Functions:**
- `parsePlanFile(planPath)` - Parse launchql.plan files
- `generatePlan(options)` - Generate plan content
- `writePlan(planPath, content)` - Write plan files
- `readScript(baseDir, type, changeName)` - Read SQL scripts

### Module Management
**Location:** `src/modules/modules.ts`

**Key Functions:**
- `getExtensionsAndModules(moduleName, modules)` - Get module dependencies
- `latestChange(moduleName, modules, workspacePath)` - Get latest change
- `latestChangeAndVersion(moduleName, modules, workspacePath)` - Get latest with version

## 🎯 Common Usage Patterns

### 1. Workspace Setup
```typescript
const pkg = new LaunchQLPackage('/path/to/workspace');
if (!pkg.isInWorkspace()) {
  // Initialize workspace
}

// Create new module
pkg.initModule({
  name: 'my-module',
  description: 'My module description',
  author: 'Developer Name',
  extensions: ['uuid-ossp', 'postgis']
});
```

### 2. Module Deployment
```typescript
const pkg = new LaunchQLPackage('/path/to/module');
const options = {
  pg: { database: 'mydb', host: 'localhost' },
  deployment: { useTx: true, fast: false }
};

// Deploy single module
await pkg.deploy(options);

// Deploy to specific change
await pkg.deploy(options, 'my-module:my-change');

// Deploy to tag
await pkg.deploy(options, 'my-module:@v1.0.0');
```

### 3. Direct Migration Operations
```typescript
const migrate = new LaunchQLMigrate(pgConfig, { hashMethod: 'ast' });

// Deploy changes
const result = await migrate.deploy({
  modulePath: '/path/to/module',
  useTransaction: true,
  debug: true
});

if (result.failed) {
  console.error(`Deployment failed at: ${result.failed}`);
}
```

### 4. Dependency Management
```typescript
const pkg = new LaunchQLPackage('/path/to/module');

// Get module dependencies
const deps = pkg.getModuleDependencies('my-module');
console.log('Native extensions:', deps.native);
console.log('Module dependencies:', deps.modules);

// Install new dependencies
await pkg.installModules('@launchql/auth', '@launchql/utils');
```

### 5. Plan Management
```typescript
const pkg = new LaunchQLPackage('/path/to/module');

// Generate plan with external dependencies
const plan = pkg.generateModulePlan({
  includePackages: true,
  includeTags: true
});

// Write plan to file
pkg.writeModulePlan({ includePackages: true });

// Add version tag
pkg.addTag('v1.0.0', 'latest-change', 'Initial release');
```

## 🔍 Debugging Tips

### 1. Context Issues
```typescript
const pkg = new LaunchQLPackage(cwd);
console.log('Context:', pkg.getContext());
console.log('Workspace path:', pkg.getWorkspacePath());
console.log('Module path:', pkg.getModulePath());
```

### 2. Dependency Resolution
```typescript
// Check module map
const modules = pkg.getModuleMap();
console.log('Available modules:', Object.keys(modules));

// Check specific module dependencies
const deps = pkg.getModuleDependencyChanges('my-module');
console.log('Dependencies:', deps);
```

### 3. Migration Debugging
```typescript
const migrate = new LaunchQLMigrate(pgConfig, { hashMethod: 'content' });

// Use debug mode for detailed error information
await migrate.deploy({
  modulePath: '/path/to/module',
  debug: true,  // Shows full SQL scripts on errors
  logOnly: true // Test without executing
});
```

## 📁 Key Files to Understand

1. **`src/core/class/launchql.ts`** - Main LaunchQLPackage class (1472 lines)
2. **`src/migrate/client.ts`** - LaunchQLMigrate class (661 lines)
3. **`src/resolution/deps.ts`** - Dependency resolution algorithms
4. **`src/files/plan/parser.ts`** - Plan file parsing
5. **`src/modules/modules.ts`** - Module discovery and management
6. **`src/migrate/sql/schema.sql`** - Migration schema definition
7. **`src/migrate/utils/transaction.ts`** - Transaction management utilities

This guide covers the essential aspects of the core package. For specific implementation details, refer to the source files and their comprehensive inline documentation.
