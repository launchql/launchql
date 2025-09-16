# Implementation Plan: Add CLI Command

## Overview
Implement `lql add <changeName>` command to create deploy/revert/verify SQL file triplets and update plan files, similar to `sqitch add` but simplified.

## Requirements Analysis
- **Command**: `lql add <changeName> [options]`
- **Options**: 
  - `--requires <dependency>` (can be used multiple times)
  - `--note <comment>` (brief description)
- **Behavior**: 
  - Create deploy/revert/verify SQL files in appropriate directories
  - Update launchql.plan file with new change entry
  - Handle nested paths with mkdir -p behavior (e.g., `be/a/path/like/this`)
  - Follow existing LaunchQL CLI patterns

## Existing Infrastructure Analysis

### CLI Command Structure
- **Pattern**: Commands in `/packages/cli/src/commands/` follow standard structure
- **Registration**: Commands registered in `/packages/cli/src/commands.ts` commandMap
- **Template**: Use `tag.ts` as reference for argument handling and LaunchQLPackage integration

### Core Functionality Available
- **SQL File Creation**: `writeSqitchFiles()` in `/packages/core/src/files/sql/writer.ts`
- **Plan Management**: `writePlanFile()` in `/packages/core/src/files/plan/writer.ts`
- **LaunchQLPackage**: Has `addTag()` method, need similar `addChange()` method
- **Directory Creation**: `fs.mkdirSync(dir, { recursive: true })` pattern used throughout

### Data Structures
- **Change Interface**: 
  ```typescript
  interface Change {
    name: string;
    dependencies: string[];
    timestamp?: string;
    planner?: string;
    email?: string;
    comment?: string;
  }
  ```

## Implementation Plan

### Step 1: Create CLI Command File
- **File**: `/packages/cli/src/commands/add.ts`
- **Pattern**: Follow `tag.ts` structure
- **Features**:
  - Help text with usage examples
  - Argument parsing for changeName
  - Support for `--requires` and `--note` options
  - Interactive prompts for missing arguments
  - Integration with LaunchQLPackage

### Step 2: Add Command to CLI Router
- **File**: `/packages/cli/src/commands.ts`
- **Changes**:
  - Import new add command
  - Add to commandMap
  - Wrap with `withPgTeardown`

### Step 3: Update Usage Text
- **File**: `/packages/cli/src/utils/display.ts`
- **Changes**: Add `add` command to usageText

### Step 4: Implement Core addChange Method
- **File**: `/packages/core/src/core/class/launchql.ts`
- **Method**: `addChange(changeName: string, dependencies?: string[], comment?: string)`
- **Logic**:
  - Validate changeName using existing validators
  - Parse plan file using `parsePlanFile()`
  - Create new Change object with timestamp
  - Add to plan.changes array
  - Write updated plan using `writePlanFile()`

### Step 5: Create SQL File Templates
- **Approach**: Create minimal SQL file templates or use empty templates
- **Files**: Generate deploy/revert/verify files with basic structure
- **Content**: 
  - Deploy: Basic structure with change name and dependencies
  - Revert: Placeholder for undoing deploy changes
  - Verify: Placeholder for verifying deploy worked

### Step 6: Handle Nested Paths
- **Logic**: Use `path.dirname()` and `fs.mkdirSync(dir, { recursive: true })`
- **Pattern**: Follow existing pattern in `writeSqitchFiles()`

## File Structure After Implementation

```
packages/cli/src/commands/
├── add.ts                    # New CLI command
├── ...

packages/core/src/core/class/
├── launchql.ts              # Add addChange() method

packages/cli/src/
├── commands.ts              # Register add command
├── utils/display.ts         # Update usage text
```

## Testing Strategy
- **Unit Tests**: Test addChange method with various inputs
- **Integration Tests**: Test CLI command end-to-end
- **File System Tests**: Verify correct file creation and directory structure
- **Plan File Tests**: Verify plan file updates correctly

## Edge Cases to Handle
- **Duplicate Changes**: Check if change already exists
- **Invalid Names**: Use existing name validators
- **Missing Dependencies**: Validate dependency references
- **Nested Paths**: Ensure proper directory creation
- **Module Context**: Ensure command works in module context

## Success Criteria
- ✅ `lql add mychange` creates deploy/revert/verify files
- ✅ `lql add mychange --requires dep1 --note "description"` works
- ✅ `lql add path/to/change` creates nested directories
- ✅ Plan file updated with new change entry
- ✅ All existing tests pass
- ✅ New functionality has test coverage

## Implementation Notes
- Reuse existing file writing utilities
- Follow established error handling patterns
- Use existing validation functions
- Maintain consistency with other CLI commands
- Ensure proper TypeScript types throughout
