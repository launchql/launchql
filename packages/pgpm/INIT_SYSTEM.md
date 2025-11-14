# LaunchQL Init System Documentation

## Overview

The LaunchQL init system provides boilerplate/template generation for creating new workspaces and modules. It supports two primary modes:

- `pgpm init` or `lql init` - Initialize a new module within an existing workspace
- `pgpm init --workspace` or `lql init --workspace` - Initialize a new workspace

The system uses a template compilation and rendering approach that allows for variable substitution in both file names and file contents.

## Architecture

### Command Flow

```
User runs command
    ↓
CLI (packages/cli/src/commands.ts)
    ↓
PGPM Commands (packages/pgpm/src/commands.ts)
    ↓
Init Command (packages/pgpm/src/commands/init/index.ts)
    ↓
    ├─→ Module Init (packages/pgpm/src/commands/init/module.ts)
    │       ↓
    │   LaunchQLPackage.initModule() (packages/core/src/core/class/launchql.ts)
    │       ↓
    │   Template Rendering
    │
    └─→ Workspace Init (packages/pgpm/src/commands/init/workspace.ts)
            ↓
        Template Rendering
```

### Key Components

#### 1. Command Entry Point
**Location**: `packages/pgpm/src/commands/init/index.ts`

The init command accepts the following options:
- `--workspace` - Initialize workspace instead of module (default: false)
- `--cwd <directory>` - Working directory (default: current directory)
- `--repo <repo>` - Use templates from GitHub repository (e.g., owner/repo)
- `--template-path <path>` - Use templates from local path
- `--from-branch <branch>` - Specify branch when using --repo (default: main)

#### 2. Module Initialization
**Location**: `packages/pgpm/src/commands/init/module.ts`

**Flow**:
1. Validates that the current directory is inside a LaunchQL workspace
2. Prompts user for module information:
   - Module name (required)
   - Extensions/dependencies (checkbox selection from available modules)
3. Determines template source (custom or default)
4. Calls `LaunchQLPackage.initModule()` with collected options

**Key Method**: `runModuleSetup(argv, prompter)`

#### 3. Workspace Initialization
**Location**: `packages/pgpm/src/commands/init/workspace.ts`

**Flow**:
1. Prompts user for workspace name
2. Creates workspace directory (slugified name)
3. Determines template source (custom or default)
4. Loads and renders templates
5. Writes rendered templates to target directory

**Key Method**: `runWorkspaceSetup(argv, prompter)`

#### 4. Core Module Initialization
**Location**: `packages/core/src/core/class/launchql.ts`

**Method**: `LaunchQLPackage.initModule(options: InitModuleOptions)`

**Flow**:
1. Ensures current directory is in a workspace
2. Creates module directory (in `packages/` if at workspace root, or in current directory if in allowed workspace subdirectory)
3. Loads templates (custom source or default `moduleTemplate`)
4. Renders templates with provided variables
5. Initializes Sqitch structure:
   - Creates `launchql.plan` file
   - Creates `deploy/`, `revert/`, `verify/` directories
6. Writes extension dependencies to `.control` file

### Template System

#### Template Storage

Templates are stored in the repository at:
```
/home/ubuntu/repos/launchql/boilerplates/
├── workspace/          # Workspace templates
│   ├── .questions.json # Variable definitions
│   ├── package.json
│   ├── README.md
│   ├── docker-compose.yml
│   ├── launchql.json
│   ├── pnpm-workspace.yaml
│   ├── tsconfig.json
│   ├── lerna.json
│   ├── Makefile
│   ├── LICENSE
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── .prettierrc.json
│   ├── bin/install.sh
│   ├── .github/run-tests.yaml
│   └── .vscode/settings.json
└── module/             # Module templates
    ├── .questions.json
    ├── package.json
    ├── README.md
    ├── jest.config.js
    └── __tests__/basic.test.ts
```

#### Template Compilation

**Location**: `packages/templatizer/`

The template system uses a build-time compilation approach:

1. **Build Script**: `packages/templatizer/scripts/makeTemplates.ts`
   - Runs via `pnpm makeTemplates` in the templatizer package
   - Compiles boilerplate directories into TypeScript functions
   - Generates `src/generated/workspace.ts` and `src/generated/module.ts`

2. **Compilation Process**: `packages/templatizer/src/templatize/compileTemplatesToFunctions.ts`
   - Scans all files in template directory (including hidden files)
   - Escapes special characters (backslashes, backticks, `${`)
   - Converts `__VARIABLE__` patterns to `${vars.VARIABLE}` for template literals
   - Returns array of `CompiledTemplate` objects with render functions

3. **Generated Output**: Each template becomes a function:
   ```typescript
   (vars: Record<string, any>) => {
     const relPath = `path/with/${vars.VARIABLE}/substitution`;
     const content = `file content with ${vars.VARIABLE}`;
     return { relPath, content };
   }
   ```

#### Variable Substitution

Variables use the `__VARIABLE__` format in template files:

**In File Names**:
- Not currently supported in the boilerplate directory structure
- Would be replaced if used: `__MODULENAME__/package.json` → `my-module/package.json`

**In File Contents**:
- `__MODULENAME__` - Module/workspace name
- `__USERFULLNAME__` - Author full name
- `__USEREMAIL__` - Author email
- `__USERNAME__` - GitHub username
- `__MODULEDESC__` - Module description (module only)
- `__REPONAME__` - Repository name (module only)
- `__ACCESS__` - Package access level (module only)
- `__PACKAGE_IDENTIFIER__` - Package identifier (module only)

**Example** (from `boilerplates/workspace/package.json`):
```json
{
  "name": "__MODULENAME__",
  "version": "0.0.1",
  "author": "__USERFULLNAME__ <__USEREMAIL__>",
  "repository": {
    "type": "git",
    "url": "https://github.com/__USERNAME__/__MODULENAME__"
  }
}
```

After rendering with `{ MODULENAME: "my-workspace", USERFULLNAME: "John Doe", ... }`:
```json
{
  "name": "my-workspace",
  "version": "0.0.1",
  "author": "John Doe <john@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/johndoe/my-workspace"
  }
}
```

#### Template Loading

**Location**: `packages/templatizer/src/loadTemplates.ts`

**Function**: `loadTemplates(source: TemplateSource, templateType: 'workspace' | 'module')`

Supports two template sources:

1. **Local Path**:
   ```typescript
   {
     type: 'local',
     path: './custom-templates' // or direct path to workspace/module dir
   }
   ```
   - Resolves to absolute path
   - Checks for `.questions.json` to determine if direct template dir
   - Otherwise appends `templateType` to path

2. **GitHub Repository**:
   ```typescript
   {
     type: 'github',
     path: 'owner/repo', // or full URL
     branch: 'main' // optional, defaults to 'main'
   }
   ```
   - Clones repository to temporary directory
   - Looks for `boilerplates/` directory in repo
   - Extracts `boilerplates/workspace/` or `boilerplates/module/`
   - Cleans up temporary directory after compilation

#### Template Rendering

**Location**: `packages/templatizer/src/templatize/generateFromCompiled.ts`

**Function**: `writeRenderedTemplates(templates: Func[], outDir: string, vars: Record<string, any>)`

**Process**:
1. Iterates through compiled template functions
2. Calls each function with provided variables
3. Creates directory structure as needed
4. Writes rendered content to files

## Usage Examples

### Initialize a New Workspace

```bash
# Using default templates
lql init --workspace
# Prompts for: workspace name, author info, GitHub username

# Using custom local templates
lql init --workspace --template-path ./my-templates

# Using templates from GitHub
lql init --workspace --repo myorg/my-templates
lql init --workspace --repo myorg/my-templates --from-branch develop
```

### Initialize a New Module

```bash
# Must be run inside a workspace
cd my-workspace

# Using default templates
lql init
# Prompts for: module name, extensions/dependencies

# Using custom templates
lql init --template-path ./custom-module-templates
lql init --repo myorg/module-templates
```

## Custom Template Creation

### Creating Custom Templates

1. **Create Template Directory Structure**:
   ```
   my-templates/
   ├── workspace/
   │   ├── .questions.json
   │   └── [template files]
   └── module/
       ├── .questions.json
       └── [template files]
   ```

2. **Define Variables** (`.questions.json`):
   ```json
   [
     {
       "name": "__MYVAR__",
       "message": "Enter my variable",
       "required": true
     }
   ]
   ```

3. **Use Variables in Templates**:
   - File names: `__MYVAR__/file.txt`
   - File contents: `value: __MYVAR__`

4. **Use Templates**:
   ```bash
   lql init --workspace --template-path ./my-templates
   ```

### GitHub Template Repository Structure

For GitHub-hosted templates, the repository must have this structure:
```
my-template-repo/
└── boilerplates/
    ├── workspace/
    │   ├── .questions.json
    │   └── [template files]
    └── module/
        ├── .questions.json
        └── [template files]
```

## Known Issues and Limitations

### Issue 1: Missing MODULEDESC Variable in Workspace Templates

**Problem**: The workspace boilerplate's `README.md` uses `__MODULEDESC__` variable, but this variable is not defined in the workspace `.questions.json` file.

**Location**: 
- `boilerplates/workspace/README.md` line 5
- `boilerplates/workspace/.questions.json` (missing definition)

**Impact**: When initializing a workspace, the `__MODULEDESC__` variable is not replaced, leaving the literal string in the generated README.

**Fix Required**: Add `__MODULEDESC__` to `boilerplates/workspace/.questions.json` or remove it from the README template.

### Issue 2: Inconsistent Variable Naming

**Problem**: The module template uses `__PACKAGE_IDENTIFIER__` in `package.json` but this variable is not defined in `.questions.json` and is not prompted for.

**Location**: 
- `boilerplates/module/package.json` line 2
- `boilerplates/module/.questions.json` (missing definition)

**Impact**: The package name in generated modules will be the literal string `__PACKAGE_IDENTIFIER__` instead of a proper package identifier.

**Fix Required**: Either:
1. Add `__PACKAGE_IDENTIFIER__` to `.questions.json`, or
2. Replace with `__MODULENAME__` in the template, or
3. Generate it programmatically from `__MODULENAME__` (e.g., `@scope/__MODULENAME__`)

### Issue 3: Git Config Fallback

**Problem**: Module initialization uses `getGitConfigInfo()` to get username and email, but there's no clear error handling if git config is not set.

**Location**: `packages/pgpm/src/commands/init/module.ts` line 14

**Impact**: May fail silently or with unclear error if user doesn't have git configured.

**Fix Required**: Add validation and clear error message if git config is missing.

### Issue 4: Template Compilation Not Automated

**Problem**: The template compilation step (`pnpm makeTemplates`) must be run manually after modifying boilerplate files. This is not documented in the main README and is easy to forget.

**Impact**: Changes to boilerplate files won't take effect until templates are recompiled, leading to confusion.

**Fix Required**: 
1. Add pre-build hook to automatically run `makeTemplates` in templatizer package
2. Document the requirement in DEVELOPMENT.md
3. Consider adding a watch mode for development

### Issue 5: No Validation of Template Variables

**Problem**: There's no validation that all variables used in templates are defined in `.questions.json`.

**Impact**: Undefined variables will remain as literal `__VARIABLE__` strings in generated files.

**Fix Required**: Add validation in `makeTemplates.ts` to check that all `__VARIABLE__` patterns in templates have corresponding entries in `.questions.json`.

### Issue 6: Limited File Name Substitution

**Problem**: While the system supports variable substitution in file names, the current boilerplates don't use this feature, and it's not well documented.

**Impact**: Users may not know they can use variables in file/directory names.

**Fix Required**: Add examples and documentation for file name substitution.

## Development Workflow

### Modifying Templates

1. **Edit Boilerplate Files**:
   ```bash
   cd /path/to/launchql/boilerplates/workspace
   # Edit template files
   ```

2. **Recompile Templates**:
   ```bash
   cd packages/templatizer
   pnpm makeTemplates
   ```

3. **Build Packages**:
   ```bash
   cd /path/to/launchql
   pnpm build
   ```

4. **Test**:
   ```bash
   cd /tmp/test-workspace
   lql init --workspace
   ```

### Adding New Template Variables

1. **Add to `.questions.json`**:
   ```json
   {
     "name": "__NEWVAR__",
     "message": "Enter new variable",
     "required": true
   }
   ```

2. **Use in Templates**:
   ```
   Value: __NEWVAR__
   ```

3. **Recompile and Test** (see above)

## Technical Details

### Template Compilation Algorithm

The `compileTemplatesToFunctions()` function:

1. **Scans Directory**: Uses `glob` to find all files (including hidden)
2. **Reads Content**: Reads each file as UTF-8 text
3. **Escapes Special Characters**:
   - `\` → `\\`
   - `` ` `` → `` \` ``
   - `${` → `\${`
4. **Replaces Variables**: `__VAR__` → `${vars.VAR}`
5. **Generates Function**: Creates function that returns `{ relPath, content }`
6. **Returns Array**: Array of compiled template objects

### Variable Replacement Regex

Pattern: `/__([A-Z0-9_]+)__/g`

Matches:
- `__MODULENAME__` ✓
- `__USER_NAME__` ✓
- `__VAR123__` ✓

Does not match:
- `__lowercase__` ✗
- `_SINGLE_UNDERSCORE_` ✗
- `__SPACES NOT ALLOWED__` ✗

### Security Considerations

1. **Template Injection**: Variables are inserted via template literals, which could allow code injection if user input is not sanitized. However, the current implementation only uses trusted sources (git config, user prompts).

2. **GitHub Cloning**: When using `--repo`, the system clones repositories without authentication. This works for public repos but will fail for private repos.

3. **Temporary Files**: GitHub templates are cloned to temporary directories and cleaned up after use. Ensure cleanup happens even on errors.

## Future Improvements

1. **Template Validation**: Add linting/validation for templates
2. **Template Testing**: Add automated tests for template rendering
3. **Template Versioning**: Support versioned templates
4. **Interactive Template Selection**: Allow users to choose from multiple template sets
5. **Template Marketplace**: Create a registry of community templates
6. **Hot Reload**: Add watch mode for template development
7. **Better Error Messages**: Improve error handling and user feedback
8. **Template Inheritance**: Allow templates to extend/override base templates
9. **Conditional Content**: Support conditional sections in templates
10. **Post-Init Hooks**: Allow templates to define post-initialization scripts

## Related Files

- `packages/cli/src/commands.ts` - CLI entry point
- `packages/pgpm/src/commands.ts` - PGPM command map
- `packages/pgpm/src/commands/init/` - Init command implementation
- `packages/core/src/core/class/launchql.ts` - Core module initialization
- `packages/templatizer/` - Template compilation and rendering
- `boilerplates/` - Template source files

## See Also

- [LaunchQL Development Guide](../../DEVELOPMENT.md)
- [PGPM Package README](./README.md)
- [Templatizer Package README](../templatizer/README.md)
