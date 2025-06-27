# LaunchQL Migration System Implementation Plan

## Overview

This plan outlines the implementation of a new TypeScript-based migration system that completely removes the Sqitch dependency while maintaining compatibility with existing Sqitch plan files. The system will be implemented as a new package (`@launchql/migrate`) that replaces all Sqitch calls in the existing `@launchql/core` deploy and deployFast functions.

## Goals

1. **Complete Sqitch removal** - Eliminate all Sqitch/Perl dependencies
2. **Maintain compatibility** - Support existing Sqitch plan file format (parser already exists in `resolve.ts`)
3. **TypeScript implementation** - Pure TypeScript/Node.js solution
4. **Minimal database footprint** - Only 4 tables in `launchql_migrate` schema
5. **Drop-in replacement** - Replace all `spawn('sqitch', ...)` calls with new migration system

## Architecture

### Package Structure

```
packages/
├── migrate/                    # New package: @launchql/migrate
│   ├── src/
│   │   ├── index.ts           # Main exports
│   │   ├── client.ts          # LaunchQLMigrate client class
│   │   ├── parser/
│   │   │   ├── plan.ts        # Sqitch plan file parser
│   │   │   └── types.ts       # Plan file types
│   │   ├── sql/
│   │   │   ├── schema.sql     # Database schema creation
│   │   │   └── procedures.sql # Stored procedures
│   │   ├── commands/
│   │   │   ├── deploy.ts      # Deploy command implementation
│   │   │   ├── revert.ts      # Revert command implementation
│   │   │   ├── verify.ts      # Verify command implementation
│   │   │   └── status.ts      # Status command implementation
│   │   ├── utils/
│   │   │   ├── hash.ts        # Script hashing utilities
│   │   │   ├── fs.ts          # File system utilities
│   │   │   └── remote.ts      # Remote dependency fetching
│   │   └── types.ts           # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
├── core/                      # Existing package (minimal changes)
│   └── src/
│       ├── sqitch/            # Refactor to use @launchql/migrate
│       └── deploy-fast.ts     # Update to use new migration system
└── cli/                       # Existing package (minimal changes)
    └── src/
        └── commands/          # Update deploy/revert/verify commands
```

## Implementation Phases

### Phase 1: Core Migration Package Setup (Week 1)

1. **Create new package structure**
   - Initialize `@launchql/migrate` package
   - Set up TypeScript configuration
   - Configure build system

2. **Implement database schema**
   - Create SQL files for schema and procedures
   - Implement schema initialization function
   - Add connection management

3. **Create client class**
   ```typescript
   class LaunchQLMigrate {
     constructor(connectionConfig: PgConfig)
     async initialize(): Promise<void>
     async deploy(...): Promise<void>
     async revert(...): Promise<void>
     async verify(...): Promise<boolean>
     async status(...): Promise<Status[]>
   }
   ```

### Phase 2: Plan File Integration (Week 1-2)

1. **Enhance existing parser**
   - Extend `resolveWithPlan` from `resolve.ts` to extract full metadata
   - Parse dependencies from plan file format (e.g., `change_name [dependency1 dependency2]`)
   - Extract timestamps and planner information
   - Support for tags (@tag syntax)

2. **Script hash calculation**
   - Generate SHA256 hashes for deploy/revert/verify scripts
   - Store hashes for change detection
   - Validate script integrity

3. **Dependency tracking**
   - Parse dependencies from both plan files and SQL comments
   - Build complete dependency graph
   - Integrate with existing `getDeps` function

### Phase 3: Core Commands Implementation (Week 2-3)

1. **Deploy command**
   - Read plan file and scripts
   - Check deployment status
   - Execute deployments in order
   - Handle transactions and rollbacks
   - Support for remote dependencies

2. **Revert command**
   - Check for dependent changes
   - Execute revert scripts
   - Update deployment records

3. **Verify command**
   - Run verification scripts
   - Report verification status

4. **Status command**
   - Show deployment status
   - List pending changes
   - Display dependency information

### Phase 4: Integration with Existing Code (Week 4)

1. **Replace Sqitch calls in @launchql/core**
   - Replace `spawn('sqitch', ['deploy', ...])` in `sqitch/deploy.ts`
   - Replace `spawn('sqitch', ['revert', ...])` in `sqitch/revert.ts`
   - Replace `spawn('sqitch', ['verify', ...])` in `sqitch/verify.ts`
   - Update `deploy-fast.ts` to use new migration client directly
   - Remove all Sqitch environment variable handling

2. **Update @launchql/cli**
   - Remove direct `execSync('sqitch ...')` calls
   - Update deploy command to use new migration system
   - Update revert command
   - Update verify command
   - Add `launchql migrate init` command for schema setup

3. **Migration utilities**
   - Tool to import existing Sqitch registry data
   - Automatic detection and migration of Sqitch deployments
   - Verification of migration data integrity

### Phase 5: Testing and Documentation (Week 4-5)

1. **Unit tests**
   - Parser tests
   - Command tests
   - Integration tests

2. **Documentation**
   - API documentation
   - Migration guide from Sqitch
   - Usage examples

## Technical Details

### API Design

The new `@launchql/migrate` package will provide a drop-in replacement for Sqitch commands:

```typescript
import { LaunchQLMigrate } from '@launchql/migrate';

class LaunchQLMigrate {
  constructor(config: PgConfig);
  
  // Initialize migration schema (replaces sqitch init)
  async initialize(): Promise<void>;
  
  // Deploy changes (replaces sqitch deploy)
  async deploy(options: {
    project: string;
    targetDatabase: string;
    planPath: string;
    deployPath: string;
    verifyPath?: string;
    toChange?: string;  // Deploy up to specific change
  }): Promise<DeployResult>;
  
  // Revert changes (replaces sqitch revert)
  async revert(options: {
    project: string;
    targetDatabase: string;
    planPath: string;
    revertPath: string;
    toChange?: string;  // Revert to specific change
  }): Promise<RevertResult>;
  
  // Verify deployment (replaces sqitch verify)
  async verify(options: {
    project: string;
    targetDatabase: string;
    planPath: string;
    verifyPath: string;
  }): Promise<VerifyResult>;
  
  // Get deployment status (replaces sqitch status)
  async status(project?: string): Promise<StatusResult[]>;
  
  // Import from existing Sqitch deployment
  async importFromSqitch(): Promise<void>;
}
```

### Plan File Parser Enhancement

The existing `resolveWithPlan` function will be enhanced to parse full Sqitch plan format:

```typescript
interface Change {
  name: string;
  dependencies: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}

interface PlanFile {
  project: string;
  uri?: string;
  changes: Change[];
}

// Example plan line format:
// change_name [dep1 dep2] 2024-01-01T00:00:00Z planner <email> # comment
```

### Remote Dependency Syntax

Support for remote dependencies in plan files:
```
change_name [https://example.com/migrations/dependency.sql] 2024-01-01T00:00:00Z planner <email> # comment
```

### Migration from Sqitch

The system will provide automatic migration that:
1. Detects existing Sqitch registry tables (`sqitch.*`)
2. Imports deployment history into `launchql_migrate` tables
3. Maps Sqitch change IDs to new format
4. Preserves dependency relationships
5. Verifies data integrity
6. Optionally removes Sqitch tables after successful migration

### Key Differences from Sqitch

1. **No tags** - Use Git tags instead
2. **No rework** - Use new change names for modifications
3. **Simpler registry** - Only 4 tables vs Sqitch's 7+ tables
4. **No committer tracking** - Git already tracks this
5. **Direct SQL execution** - No need for external process spawning

### Error Handling

- Clear error messages for missing dependencies
- Transaction rollback on deployment failure
- Detailed logging for debugging
- Network retry logic for remote dependencies

## Benefits

1. **Complete Sqitch removal** - No Perl/Sqitch installation required
2. **Simplified deployment** - Direct database connection, no subprocess spawning
3. **Better performance** - No overhead from external process calls
4. **Native TypeScript** - Better error handling and type safety
5. **Remote dependencies** - Fetch migrations from URLs
6. **Minimal overhead** - Only 4 database tables vs Sqitch's 7+
7. **Plan file compatible** - Reuse existing Sqitch plan files without modification

## Migration Path

1. **Parallel operation** - Can run alongside Sqitch initially
2. **Gradual migration** - Projects can migrate one at a time
3. **Data preservation** - Import existing deployment history
4. **Rollback option** - Can revert to Sqitch if needed

## Success Criteria

1. **Zero Sqitch dependency** - Complete removal of all Sqitch calls
2. **Full compatibility** - Deploy all existing LaunchQL packages using plan files
3. **Performance improvement** - Faster deployment without subprocess overhead
4. **Remote dependencies** - Successfully fetch and deploy from URLs
5. **Seamless migration** - Automatic import of existing Sqitch deployments
6. **Test coverage** - All existing tests pass with new implementation
7. **CLI compatibility** - `launchql deploy` works without Sqitch installed

## Files to Modify

### @launchql/core
- `src/sqitch/deploy.ts` - Replace `spawn('sqitch', ['deploy'])` with migration client
- `src/sqitch/revert.ts` - Replace `spawn('sqitch', ['revert'])` with migration client
- `src/sqitch/verify.ts` - Replace `spawn('sqitch', ['verify'])` with migration client
- `src/deploy-fast.ts` - Use migration client directly instead of packaging for Sqitch
- `src/resolve.ts` - Enhance `resolveWithPlan` to parse full plan format

### @launchql/cli
- `src/commands/deploy.ts` - Remove `execSync('sqitch deploy')` calls
- `src/commands/revert.ts` - Remove `execSync('sqitch revert')` calls
- `src/commands/verify.ts` - Remove `execSync('sqitch verify')` calls
- `src/commands/init/` - Add migration schema initialization

### New Package (@launchql/migrate)
- All new files as outlined in package structure

## Timeline

- **Week 1**: Core package setup and database schema
- **Week 2**: Plan parser enhancement and basic commands
- **Week 3**: Remote dependencies and advanced features
- **Week 4**: Integration and migration tools
- **Week 5**: Testing, documentation, and polish

Total estimated time: 5 weeks for full implementation