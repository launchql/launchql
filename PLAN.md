# LaunchQL Migration System Implementation Plan

## Overview

This document outlines the implementation plan for replacing Sqitch with a native TypeScript-based migration system in LaunchQL. The new system will be implemented as a separate package (`@launchql/migrate`) that can be used as a drop-in replacement for Sqitch calls throughout the codebase.

## Current State Analysis

### Sqitch Usage in LaunchQL

1. **Core Package (`packages/core/src/sqitch/`)**:
   - `deploy.ts`: Uses `spawn('sqitch', ['deploy', 'db:pg:database'])`
   - `revert.ts`: Uses `spawn('sqitch', ['revert', 'db:pg:database'])`
   - `verify.ts`: Uses `spawn('sqitch', ['verify', 'db:pg:database'])`
   - `resolve.ts`: Contains plan parser for reading `sqitch.plan` files

2. **CLI Package (`packages/cli/src/commands/`)**:
   - `deploy.ts`: Uses `execSync('sqitch deploy')`
   - `revert.ts`: Uses `execSync('sqitch revert')`
   - `verify.ts`: Uses `execSync('sqitch verify')`

3. **Plan File Format**:
   - Standard Sqitch plan files with dependencies
   - Example: `change_name [dep1 dep2] timestamp planner <email> # comment`

## Implementation Strategy

### Phase 1: Create New Migration Package (COMPLETED ✓)

Created `@launchql/migrate` package with:

1. **Core Components**:
   - ✓ PostgreSQL schema for tracking migrations (`launchql_migrate` schema)
   - ✓ Client class (`LaunchQLMigrate`) for managing migrations
   - ✓ Plan file parser compatible with Sqitch format
   - ✓ Command wrappers for drop-in replacement

2. **Database Schema**:
   ```sql
   -- Minimal schema focused on essential functionality
   launchql_migrate.projects (project, created_at)
   launchql_migrate.changes (change_id, change_name, project, script_hash, deployed_at)
   launchql_migrate.dependencies (change_id, requires)
   launchql_migrate.events (event_id, event_type, change_name, project, occurred_at)
   ```

3. **Key Features**:
   - ✓ Deploy/revert/verify operations
   - ✓ Dependency tracking and validation
   - ✓ Script content hashing (SHA256)
   - ✓ Import from existing Sqitch deployments
   - ✓ Compatible with existing plan files

### Phase 2: Integration with Existing Code (TODO)

1. **Update Core Package**:
   ```typescript
   // packages/core/src/sqitch/deploy.ts
   import { deployCommand } from '@launchql/migrate';
   
   // Replace spawn('sqitch', ['deploy', `db:pg:${database}`])
   await deployCommand(pgConfig, database, modulePath);
   ```

2. **Update CLI Package**:
   ```typescript
   // packages/cli/src/commands/deploy.ts
   import { deployCommand } from '@launchql/migrate';
   
   // Replace execSync('sqitch deploy')
   await deployCommand(config, database, cwd);
   ```

3. **Configuration Updates**:
   - Add `@launchql/migrate` as dependency to core and cli packages
   - Update environment variable handling to pass PostgreSQL credentials
   - Maintain backward compatibility with existing workflows

### Phase 3: Migration Path (TODO)

1. **Import Existing Deployments**:
   - Run `importFromSqitch()` to import existing Sqitch state
   - Verify imported data matches current deployment state
   - Test rollback capabilities

2. **Gradual Rollout**:
   - Add feature flag to toggle between Sqitch and new system
   - Test in development environments first
   - Monitor for any discrepancies

3. **Documentation**:
   - Update deployment guides
   - Document differences from Sqitch
   - Provide migration guide for existing users

## Implementation Details

### Package Structure

```
packages/migrate/
├── src/
│   ├── client.ts          # Main LaunchQLMigrate class
│   ├── types.ts           # TypeScript interfaces
│   ├── parser/
│   │   └── plan.ts        # Sqitch plan file parser
│   ├── sql/
│   │   ├── schema.sql     # Database schema
│   │   └── procedures.sql # Stored procedures
│   ├── commands/
│   │   ├── deploy.ts      # Deploy command wrapper
│   │   ├── revert.ts      # Revert command wrapper
│   │   └── verify.ts      # Verify command wrapper
│   └── utils/
│       ├── hash.ts        # File hashing utilities
│       └── fs.ts          # File system utilities
├── __tests__/
│   └── parser.test.ts     # Plan parser tests
├── package.json
└── README.md
```

### API Design

```typescript
// Main client
const migrate = new LaunchQLMigrate(pgConfig);

// Deploy changes
await migrate.deploy({
  project: 'myproject',
  targetDatabase: 'mydb',
  planPath: './sqitch.plan',
  deployPath: './deploy',
  verifyPath: './verify',
  toChange: 'specific-change' // optional
});

// Drop-in replacement
await deployCommand(pgConfig, 'mydb', '/path/to/project');
```

## Benefits

1. **No External Dependencies**: Removes Perl/Sqitch requirement
2. **Native TypeScript**: Better integration with existing codebase
3. **Simplified State Management**: All state in PostgreSQL
4. **Better Error Handling**: Native JavaScript error handling
5. **Improved Performance**: No process spawning overhead
6. **Internet Connectivity**: Can fetch remote resources if needed

## Risks and Mitigations

1. **Risk**: Incompatibility with complex Sqitch features
   - **Mitigation**: Focus on core features used by LaunchQL
   - **Mitigation**: Maintain Sqitch compatibility mode

2. **Risk**: Data loss during migration
   - **Mitigation**: Import existing Sqitch state
   - **Mitigation**: Extensive testing before production use

3. **Risk**: Performance issues with large deployments
   - **Mitigation**: Optimize database queries
   - **Mitigation**: Add batching for bulk operations

## Next Steps

1. **Immediate** (COMPLETED):
   - ✓ Create `@launchql/migrate` package
   - ✓ Implement core functionality
   - ✓ Add tests for plan parser
   - ✓ Create README documentation

2. **Short-term** (TODO):
   - [ ] Update `packages/core` to use new migration system
   - [ ] Update `packages/cli` to use new migration system
   - [ ] Add integration tests
   - [ ] Test with real LaunchQL projects

3. **Long-term** (TODO):
   - [ ] Add CLI tool for standalone usage
   - [ ] Support for migration rollback points
   - [ ] Add migration dry-run capability
   - [ ] Performance optimizations

## Success Criteria

1. All existing LaunchQL deployments work without Sqitch
2. No changes required to existing plan files
3. Performance equal or better than Sqitch
4. Successful import of existing Sqitch deployments
5. All tests passing in CI/CD pipeline