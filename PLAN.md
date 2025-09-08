# LaunchQL Publish Flow Implementation Plan

## Overview

This document outlines the implementation of three new CLI commands for LaunchQL's publish flow:

1. `lql validate` - Ensure package consistency before bumping
2. `lql sync` - Synchronize artifacts with the new bumped version  
3. `lql version` - Detect changed packages, bump versions, update dependencies, commit and tag

## Architecture & Patterns

### Existing Infrastructure to Leverage

- **LaunchQLPackage class** (`packages/core/src/core/class/launchql.ts`): Core orchestrator for workspace and module management
- **analyzeModule()** method: Comprehensive validation logic for package consistency
- **Control file generation** (`packages/core/src/files/extension/writer.ts`): `generateControlFileContent()` for PostgreSQL control files
- **Plan file management** (`packages/core/src/files/plan/`): Parsing and writing launchql.plan files with tag support
- **Dependency resolution** (`packages/core/src/resolution/deps.ts`): Workspace dependency resolution and topological sorting
- **CLI command patterns** (`packages/cli/src/commands/`): Consistent structure with usage text, error handling, and logging
- **Lerna integration** (`lerna.json`): `conventionalCommits: true` for automatic change detection and version bumping

### Workspace Structure

- **Yarn workspaces** with `packages/*` pattern
- **Independent versioning** via lerna
- **Workspace dependencies** using `workspace:*` and `workspace:^` semantics
- **Package.json** files in each module with version management

## Command Implementations

### 1. `lql validate` Command

**Purpose**: Ensure package is consistent before bumping

**Implementation Strategy**:
- Extend existing `LaunchQLPackage.analyzeModule()` method as foundation
- Add specific validation checks:
  - `.control.default_version === package.json.version`
  - SQL migration file for current version exists (`sql/<extension>--<version>.sql`)
  - `launchql.plan` has a tag for current version
  - Dependencies in `launchql.plan` reference real published versions
- Return exit code 0 if valid, 1 if inconsistencies found

**Key Files**:
- `packages/cli/src/commands/validate.ts` (new)
- Leverage `packages/core/src/core/class/launchql.ts` analyzeModule()

### 2. `lql sync` Command

**Purpose**: Synchronize artifacts with the new bumped version

**Implementation Strategy**:
- Read `package.json` version
- Update PostgreSQL control file using `generateControlFileContent()`
- Write `default_version = '<version>'` in `<pkg>.control`
- Generate SQL migration file ensuring `sql/<extension>--<version>.sql` exists
- Use existing file creation patterns from LaunchQLPackage

**Key Files**:
- `packages/cli/src/commands/sync.ts` (new)
- Leverage `packages/core/src/files/extension/writer.ts`

### 3. `lql version` Command (Independent Mode)

**Purpose**: Comprehensive version management workflow

**Implementation Strategy**:
- **Change Detection**: Use git operations and lerna's conventional commit parsing
- **Version Bumping**: Support `--bump` flags (patch|minor|major|prerelease|exact)
- **Package Updates**: Update `package.json` versions for changed packages
- **Dependency Management**: 
  - For `workspace:*`, do nothing (pnpm resolves at pack time)
  - For caret ranges, rewrite version ranges (e.g., `^1.2.3` → `^1.3.0`)
- **Synchronization**: Run `lql sync` per bumped package
- **Plan Updates**: Append plan tags using existing tag management
- **Git Operations**: Stage + commit with "chore(release): publish" message
- **Tagging**: Create per-package git tags `name@version`

**Key Files**:
- `packages/cli/src/commands/version.ts` (new)
- Leverage dependency resolution from `packages/core/src/resolution/deps.ts`
- Use plan file writing from `packages/core/src/files/plan/writer.ts`

## Implementation Details

### CLI Command Structure

Following existing patterns from `packages/cli/src/commands/deploy.ts`:

```typescript
export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Usage text handling
  if (argv.help || argv.h) {
    console.log(usageText);
    process.exit(0);
  }
  
  // Argument processing and validation
  // Core logic using LaunchQLPackage
  // Error handling and logging
  // Return argv
};
```

### Error Handling & Logging

- Use `Logger` from `@launchql/logger` for consistent logging
- Proper exit codes: 0 for success, 1 for errors
- Comprehensive error messages with context
- Usage text for each command following existing patterns

### Workspace Dependency Updates

For `lql version` command, handle workspace dependencies:

1. **Detection**: Use existing dependency resolution to find internal dependencies
2. **Version Range Updates**: 
   - `workspace:*` → no change (pnpm handles at pack time)
   - `^1.2.3` → `^1.3.0` (update caret ranges between workspace packages)
3. **Dependency Order**: Use topological sorting from existing dependency resolution

### Git Integration

- Use `execSync` for git operations following patterns in codebase
- Conventional commit message format: "chore(release): publish"
- Per-package tags in format: `name@version`
- Single commit for all version updates

## File Structure

```
packages/cli/src/commands/
├── validate.ts          # New: Package validation command
├── sync.ts             # New: Artifact synchronization command  
├── version.ts          # New: Version management command
└── ...existing commands

packages/cli/src/commands.ts  # Updated: Add new commands to registry
```

## Testing Strategy

1. **Unit Testing**: Test each command with valid/invalid scenarios
2. **Integration Testing**: Test full workflow (validate → version → sync)
3. **Workspace Testing**: Test with multiple packages and dependencies
4. **Git Testing**: Verify commit and tagging behavior
5. **Regression Testing**: Ensure existing functionality remains intact

## Dependencies & Imports

Reuse existing dependencies:
- `@launchql/core` - LaunchQLPackage class and file operations
- `@launchql/logger` - Consistent logging
- `@launchql/types` - Type definitions and error handling
- `inquirerer` - CLI prompting (following existing patterns)
- `minimist` - Argument parsing
- `child_process` - Git operations via execSync

## Validation Criteria

### `lql validate` Success Criteria:
- ✅ Control file `default_version` matches `package.json` version
- ✅ SQL migration file exists for current version
- ✅ `launchql.plan` has tag for current version
- ✅ All dependencies reference valid published versions
- ✅ Exit code 0 for valid packages, 1 for invalid

### `lql sync` Success Criteria:
- ✅ Control file updated with correct version
- ✅ SQL migration file created/updated
- ✅ File operations follow existing patterns
- ✅ Proper error handling for file system operations

### `lql version` Success Criteria:
- ✅ Changed packages detected correctly
- ✅ Version bumping follows conventional commits or explicit flags
- ✅ Internal dependency ranges updated appropriately
- ✅ `lql sync` executed for each bumped package
- ✅ Plan tags appended correctly
- ✅ Single commit with proper message
- ✅ Per-package git tags created

## Risk Mitigation

1. **Backward Compatibility**: All changes extend existing functionality without breaking current workflows
2. **Error Recovery**: Comprehensive error handling with clear messages
3. **Validation**: Extensive validation before making changes
4. **Atomic Operations**: Git operations are atomic to prevent partial state
5. **Testing**: Thorough testing of edge cases and error scenarios

## Future Enhancements

- Integration with CI/CD pipelines
- Support for pre-release versions
- Automated changelog generation
- Integration with npm/yarn publish workflows
- Support for custom version bump strategies
