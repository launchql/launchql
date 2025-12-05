# LaunchQL CLI Package - Agent Guide

The `@launchql/cli` package provides the command-line interface for LaunchQL, exposing all framework functionality through the `lql` command. This guide helps agents understand the CLI structure and command patterns.

## 🎯 Overview

**Main Purpose:** User-facing command-line toolkit for managing LaunchQL projects, supporting database scaffolding, migrations, seeding, code generation, and automation.

**Binary:** `lql` (LaunchQL command-line tool)

**Key Features:**
- Database-first development workflow
- Module system with dependency management
- Smart migrations with automated deployment
- Development server with hot-reload
- Production-ready deployment plans

## 🏗️ CLI Architecture

### Main Entry Point
**File:** `src/commands.ts`

**Command Structure:**
```typescript
export const commands = async (
  argv: Partial<ParsedArgs>, 
  prompter: Inquirerer, 
  options: CLIOptions & { skipPgTeardown?: boolean }
) => {
  // Command routing and execution
}
```

**Connection Management:**
All commands (except `server` and `explorer`) are wrapped with `withPgTeardown()` to ensure proper PostgreSQL connection cleanup.

### Command Map
**Available Commands:**
```typescript
const commandMap = {
  'admin-users': adminUsers,    // User management
  'clear': clear,               // Clear/cleanup operations
  'deploy': deploy,             // Deploy database changes
  'verify': verify,             // Verify database state
  'revert': revert,             // Revert database changes
  'remove': remove,             // Remove changes from plan
  'init': init,                 // Initialize workspace/module
  'extension': extension,       // Manage module dependencies
  'plan': plan,                 // Generate deployment plans
  'export': _export,            // Export migrations
  'package': _package,          // Package modules
  'tag': tag,                   // Version management
  'kill': kill,                 // Cleanup connections/databases
  'install': install,           // Install module dependencies
  'migrate': migrate,           // Migration management
  'analyze': analyze,           // Analyze modules
  'rename': rename,             // Rename modules
  'server': server,             // Development server
  'explorer': explorer          // GraphiQL explorer
};
```

## 🚀 Core Commands

### 1. Deploy Command
**File:** `src/commands/deploy.ts`
**Purpose:** Deploy database changes and migrations to target database

**Usage:**
```bash
lql deploy [OPTIONS]
```

**Key Options:**
- `--createdb` - Create database if it doesn't exist
- `--recursive` - Deploy recursively through dependencies (default)
- `--package <name>` - Target specific package
- `--to <target>` - Deploy to specific change or tag
- `--tx` - Use transactions (default: true)
- `--fast` - Use fast deployment strategy
- `--logOnly` - Log-only mode, skip script execution
- `--usePlan` - Use deployment plan
- `--cache` - Enable caching

**Implementation Pattern:**
```typescript
export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // 1. Show usage if requested
  if (argv.help || argv.h) {
    console.log(deployUsageText);
    process.exit(0);
  }

  // 2. Get target database
  const database = await getTargetDatabase(argv, prompter, {
    message: 'Select database'
  });

  // 3. Prompt for confirmation and options
  const { yes, tx, fast, logOnly } = await prompter.prompt(argv, questions);

  // 4. Create database if requested
  if (createdb) {
    execSync(`createdb ${database}`, {
      env: getSpawnEnvWithPg(pgEnv)
    });
  }

  // 5. Execute deployment
  const project = new LaunchQLPackage(cwd);
  await project.deploy(opts, target, recursive);
}
```

### 2. Init Command
**File:** `src/commands/init.ts`
**Purpose:** Initialize new LaunchQL workspace or module

**Subcommands:**
- **Workspace Init:** `src/commands/init/workspace.ts`
- **Module Init:** `src/commands/init/module.ts`

**Usage:**
```bash
lql init --workspace    # Initialize workspace
lql init               # Initialize module (in workspace)
```

**Template Options:**
- `--repo <repo>` - Use templates from GitHub repository (e.g., `owner/repo`)
- `--template-path <path>` - Use templates from local path
- `--from-branch <branch>` - Specify branch when using `--repo` (default: `main`)

**Examples:**
```bash
lql init --workspace --repo launchql/launchql
lql init --workspace --template-path ./custom-templates
lql init --repo owner/repo --from-branch develop
```

**Implementation:**
- Supports loading templates from GitHub repositories or local paths
- Automatically detects template type (workspace vs module)
- Uses `create-gen-app` scaffolding with cached boilerplates (via the shared `pgpm` init flow)

### 3. Server Command
**File:** `src/commands/server.ts`
**Purpose:** Start GraphQL development server with hot-reload

**Features:**
- PostGraphile-powered GraphQL API
- Automatic schema generation from database
- Hot-reload on database changes
- GraphiQL interface
- CORS configuration

### 4. Migrate Command
**File:** `src/commands/migrate.ts`
**Purpose:** Comprehensive migration management

**Subcommands:**
- `init` - Initialize migration tracking
- `status` - Check migration status
- `list` - List all changes
- `deps` - Show change dependencies

**Subcommand Files:**
- `src/commands/migrate/status.ts`
- `src/commands/migrate/list.ts`
- `src/commands/migrate/deps.ts`

### 5. Extension Command
**File:** `src/commands/extension.ts`
**Purpose:** Interactively manage module dependencies

**Features:**
- Interactive dependency selection
- Automatic .control file updates
- Dependency validation

## 🎮 Command Patterns

### Standard Command Structure
All CLI commands follow this pattern:

```typescript
export default async (
  argv: Partial<ParsedArgs>,      // Command-line arguments
  prompter: Inquirerer,           // Interactive prompting
  options: CLIOptions             // CLI options
) => {
  // 1. Help handling
  if (argv.help || argv.h) {
    console.log(usageText);
    process.exit(0);
  }

  // 2. Argument processing and prompting
  const answers = await prompter.prompt(argv, questions);

  // 3. Validation and confirmation
  if (!answers.confirmed) {
    log.info('Operation cancelled.');
    return;
  }

  // 4. Core logic execution
  const project = new LaunchQLPackage(cwd);
  await project.someOperation(options);

  // 5. Success reporting
  log.success('Operation complete.');
  return argv;
};
```

### Interactive Prompting
Commands use the `Inquirerer` for interactive prompts:

```typescript
const questions: Question[] = [
  {
    type: 'confirm',
    name: 'confirmed',
    message: 'Are you sure you want to proceed?',
    required: true
  },
  {
    type: 'text',
    name: 'database',
    message: 'Database name',
    required: true
  },
  {
    type: 'autocomplete',
    name: 'package',
    message: 'Select package',
    options: availablePackages
  }
];

const answers = await prompter.prompt(argv, questions);
```

### Database Selection
**File:** `src/utils/database.ts`

**Key Function:**
```typescript
export async function getTargetDatabase(
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  options: { message: string }
): Promise<string>
```

**Features:**
- Lists available databases
- Supports database creation
- Handles PostgreSQL connection errors

### Module Selection
**File:** `src/utils/module-utils.ts`

**Key Function:**
```typescript
export async function selectPackage(
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  cwd: string,
  operation: string,
  log: Logger
): Promise<string | undefined>
```

## 🔧 Utility Systems

### Environment Integration
Commands integrate with environment configuration:

```typescript
import { getEnvOptions } from '@launchql/env';
import { getPgEnvOptions, getSpawnEnvWithPg } from 'pg-env';

// Get PostgreSQL environment
const pgEnv = getPgEnvOptions();

// Override with CLI options
const cliOverrides = {
  pg: getPgEnvOptions({ database }),
  deployment: {
    useTx: tx !== false,
    fast: fast !== false,
    usePlan: argv.usePlan !== false
  }
};

const opts = getEnvOptions(cliOverrides);
```

### Connection Management
**PostgreSQL Cleanup:**
```typescript
const withPgTeardown = (fn: Function, skipTeardown: boolean = false) => 
  async (...args: any[]) => {
    try {
      await fn(...args);
    } finally {
      if (!skipTeardown) {
        await teardownPgPools();
      }
    }
  };
```

### Error Handling
Commands provide comprehensive error handling:

```typescript
try {
  await project.deploy(opts, target, recursive);
  log.success('Deployment complete.');
} catch (error) {
  log.error('Deployment failed:', error);
  process.exit(1);
}
```

## 📋 Command Reference

### Development Commands
| Command | Purpose | Key Options |
|---------|---------|-------------|
| `init` | Initialize workspace/module | `--workspace`, `--repo`, `--template-path`, `--from-branch` |
| `server` | Start development server | `--port`, `--no-postgis` |
| `explorer` | Launch GraphiQL explorer | `--origin` |

### Database Commands
| Command | Purpose | Key Options |
|---------|---------|-------------|
| `deploy` | Deploy changes | `--createdb`, `--fast`, `--package`, `--to` |
| `verify` | Verify database state | `--package` |
| `revert` | Revert changes | `--to` |

### Migration Commands
| Command | Purpose | Key Options |
|---------|---------|-------------|
| `migrate init` | Initialize migration tracking | - |
| `migrate status` | Check migration status | - |
| `migrate list` | List all changes | - |
| `migrate deps` | Show dependencies | - |

### Module Commands
| Command | Purpose | Key Options |
|---------|---------|-------------|
| `install` | Install module dependencies | - |
| `extension` | Manage dependencies interactively | - |
| `tag` | Version changes | `--comment`, `--changeName` |
| `analyze` | Analyze module issues | - |
| `rename` | Rename module | `--to` |

### Packaging Commands
| Command | Purpose | Key Options |
|---------|---------|-------------|
| `plan` | Generate deployment plans | - |
| `package` | Package module for distribution | `--no-plan` |
| `export` | Export migrations | - |

### Utility Commands
| Command | Purpose | Key Options |
|---------|---------|-------------|
| `kill` | Clean up connections/databases | `--no-drop` |
| `clear` | Clear/cleanup operations | - |
| `admin-users` | User management | - |
| `remove` | Remove changes from plan | - |

## 🎯 Common Usage Patterns

### 1. New Project Setup
```bash
# Initialize workspace
lql init --workspace
cd my-project

# Create first module
lql init

# Deploy to database
lql deploy --createdb

# Start development server
lql server
```

### 2. Module Development
```bash
# Create new module
lql init

# Add dependencies
lql extension

# Deploy changes
lql deploy

# Verify deployment
lql verify
```

### 3. Production Deployment
```bash
# Generate deployment plan
lql plan

# Package module
lql package

# Deploy to production
lql deploy --package myapp --to @production

# Verify deployment
lql verify --package myapp
```

### 4. Migration Management
```bash
# Check migration status
lql migrate status

# List all changes
lql migrate list

# Show dependencies
lql migrate deps

# Revert to specific point
lql revert --to @v1.0.0
```

## 🔍 Integration with Core Classes

### LaunchQLPackage Integration
Commands primarily use `LaunchQLPackage` for operations:

```typescript
import { LaunchQLPackage } from '@launchql/core';

const project = new LaunchQLPackage(cwd);

// Context-aware operations
if (project.isInWorkspace()) {
  // Workspace operations
} else if (project.isInModule()) {
  // Module operations
}

// Deploy with options
await project.deploy(opts, target, recursive);
```

### LaunchQLMigrate Integration
Some commands use `LaunchQLMigrate` directly:

```typescript
import { LaunchQLMigrate } from '@launchql/core';

const migrate = new LaunchQLMigrate(pgConfig);
const result = await migrate.status();
```

## 📁 Key Files to Understand

1. **`src/commands.ts`** - Main command router and setup
2. **`src/commands/deploy.ts`** - Primary deployment command
3. **`src/commands/init.ts`** - Workspace/module initialization
4. **`src/commands/server.ts`** - Development server
5. **`src/commands/migrate.ts`** - Migration management
6. **`src/utils/database.ts`** - Database selection utilities
7. **`src/utils/module-utils.ts`** - Module selection utilities
8. **`package.json`** - CLI binary configuration

## 🎯 Agent Tips

1. **Command Pattern:** All commands follow the same structure - study `deploy.ts` as a template
2. **Interactive Prompts:** Use `prompter.prompt()` for user input with validation
3. **Environment Integration:** Always use `getEnvOptions()` for configuration
4. **Error Handling:** Provide clear error messages and exit codes
5. **Help Text:** Include comprehensive usage text for each command
6. **Connection Cleanup:** Use `withPgTeardown()` wrapper for database commands

This guide covers the essential aspects of the CLI package. The CLI serves as the primary interface between users and the LaunchQL core functionality, so understanding these patterns is crucial for extending or debugging the system.
