# LaunchQL Agent Navigation Guide

This guide helps AI agents quickly navigate and understand the LaunchQL codebase without having to read everything. LaunchQL is a comprehensive full-stack framework for building secure, role-aware GraphQL APIs backed by PostgreSQL databases.

## 🎯 Quick Start for Agents

**Most Important Packages to Know First:**
1. **`packages/core`** - Main orchestration and migration engine ([detailed guide](packages/core/AGENTS.md))
2. **`packages/cli`** - Command-line interface and user workflows ([detailed guide](packages/cli/AGENTS.md))
3. **`packages/pgsql-test`** - Testing infrastructure ([detailed guide](packages/pgsql-test/AGENTS.md))
4. **`packages/server`** - GraphQL API server
5. **`packages/types`** - TypeScript type definitions

**Key Classes to Understand:**
- **`LaunchQLPackage`** (`packages/core/src/core/class/launchql.ts`) - Workspace and module management
- **`LaunchQLMigrate`** (`packages/core/src/migrate/client.ts`) - Database migration operations

## 📦 Package Categories

### 🏗️ Core Framework
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`core`** | Main orchestration, migrations, dependency resolution | `src/core/class/launchql.ts`, `src/migrate/client.ts` |
| **`cli`** | Command-line interface (`lql` command) | `src/commands.ts`, `src/commands/deploy.ts` |
| **`types`** | TypeScript type definitions | `src/launchql.ts` |
| **`env`** | Environment and configuration management | - |

### 🚀 API & Server
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`server`** | Express + PostGraphile GraphQL API server | `src/middleware/api.ts` |
| **`explorer`** | GraphiQL API browser/debugger | - |
| **`graphile-settings`** | PostGraphile configuration utilities | - |
| **`graphile-cache`** | Caching for GraphQL operations | - |
| **`graphile-test`** | GraphQL testing utilities | - |
| **`graphile-query`** | GraphQL query building | - |

### 🧪 Testing Infrastructure
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`pgsql-test`** | Isolated PostgreSQL test environments | `src/test-client.ts` |
| **`pg-query-context`** | Session context injection for tests | - |

### 🔄 Database & Migration
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`pg-env`** | PostgreSQL environment configuration | - |
| **`pg-cache`** | PostgreSQL connection pooling | - |
| **`pg-codegen`** | Code generation from PostgreSQL schemas | - |
| **`introspectron`** | PostgreSQL schema introspection | - |

### 🧠 Parsing & AST
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`pg-ast`** | PostgreSQL AST tools and transformations | - |
| **`gql-ast`** | GraphQL AST utilities | - |

### 🔁 Streaming & File Handling
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`s3-streamer`** | Direct S3 streaming for large files | - |
| **`s3-utils`** | S3 utilities and helpers | - |
| **`etag-hash`** | S3-compatible ETag generation | - |
| **`etag-stream`** | ETag computation via streams | - |
| **`stream-to-etag`** | Stream-to-ETag transformation | - |
| **`uuid-hash`** | Deterministic UUID generation | - |
| **`uuid-stream`** | Streaming UUID generation | - |
| **`upload-names`** | Collision-resistant filename utilities | - |
| **`content-type-stream`** | Content type detection in streams | - |
| **`mime-bytes`** | MIME type utilities | - |

### 🏗️ Query Building & Code Generation
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`query-builder`** | TypeScript SQL query builder | - |
| **`query`** | Fluent GraphQL query builder | - |
| **`launchql-gen`** | Auto-generated GraphQL mutations/queries | - |
| **`client`** | Client-side utilities | - |
| **`react`** | React integration components | - |

### 🛠️ Development Tools
| Package | Purpose | Key Files |
|---------|---------|-----------|
| **`templatizer`** | Template rendering system | - |
| **`logger`** | Logging utilities | - |
| **`url-domains`** | URL and domain utilities | - |
| **`server-utils`** | Server utility functions | - |
| **`orm`** | Object-relational mapping utilities | - |

## 🔑 Key Classes and Entry Points

### LaunchQLPackage Class
**Location:** `packages/core/src/core/class/launchql.ts`

**Purpose:** High-level orchestration for workspace and module management

**Key Methods:**
- `deploy(opts, target?, recursive?)` - Deploy modules to database
- `revert(opts, target?)` - Revert database changes
- `verify(opts, target?)` - Verify database state
- `getModuleMap()` - Get all available modules
- `initModule(options)` - Initialize new module
- `installModules(...packages)` - Install module dependencies
- `addTag(tagName, changeName?, comment?)` - Tag changes for versioning

**Context Detection:**
- `getContext()` - Determine if in workspace, module, or outside
- `isInWorkspace()` / `isInModule()` - Context checks

### LaunchQLMigrate Class
**Location:** `packages/core/src/migrate/client.ts`

**Purpose:** Low-level database migration operations

**Key Methods:**
- `deploy(options)` - Deploy changes to database
- `revert(options)` - Revert changes from database
- `verify(options)` - Verify deployed changes
- `status(packageName?)` - Get deployment status
- `isDeployed(packageName, changeName)` - Check if change is deployed
- `initialize()` - Set up migration schema

**Configuration:**
- Supports `content` or `ast` hash methods for SQL files
- Configurable via `LaunchQLMigrateOptions`

### CLI Command Structure
**Location:** `packages/cli/src/commands.ts`

**Main Commands:**
- `deploy` - Deploy database changes
- `revert` - Revert database changes  
- `verify` - Verify database state
- `init` - Initialize workspace or module
- `server` - Start development server
- `explorer` - Launch GraphiQL explorer
- `migrate` - Migration management
- `install` - Install module dependencies
- `tag` - Version management

**Command Pattern:** All commands follow the pattern:
```typescript
export default async (argv: ParsedArgs, prompter: Inquirerer, options: CLIOptions) => {
  // Command implementation
}
```

## 🚀 Common Workflows

### 1. Module Development Workflow
```typescript
// 1. Initialize workspace
const pkg = new LaunchQLPackage(cwd);
pkg.initWorkspace();

// 2. Create module
pkg.initModule({
  name: 'my-module',
  description: 'My module',
  author: 'Developer',
  extensions: ['uuid-ossp']
});

// 3. Deploy changes
await pkg.deploy(options);
```

### 2. Testing Workflow
```typescript
// Set up isolated test database
import { getConnections } from 'pgsql-test';

const { db, teardown } = await getConnections();
await db.query('SELECT 1'); // Ready for testing
```

### 3. Migration Workflow
```typescript
// Direct migration operations
const migrate = new LaunchQLMigrate(pgConfig);
await migrate.deploy({ modulePath: './my-module' });
await migrate.verify({ modulePath: './my-module' });
```

## 📁 File Structure Patterns

### Module Structure
```
my-module/
├── launchql.plan          # Migration plan
├── my-module.control      # Extension metadata
├── Makefile              # Build configuration
├── deploy/               # Deploy scripts
│   ├── init.sql
│   └── tables.sql
├── revert/               # Revert scripts
│   ├── tables.sql
│   └── init.sql
└── verify/               # Verification scripts
    ├── init.sql
    └── tables.sql
```

### Workspace Structure
```
workspace/
├── launchql.config.js    # Workspace configuration
├── packages/             # Module packages
│   ├── module-a/
│   └── module-b/
└── extensions/           # Installed extensions
```

## 🔍 Finding Specific Functionality

### For Database Operations
- **Migrations:** `packages/core/src/migrate/`
- **Schema introspection:** `packages/introspectron/`
- **Connection management:** `packages/pg-cache/`, `packages/pg-env/`

### For API Development
- **GraphQL server:** `packages/server/`
- **Query building:** `packages/query/`, `packages/query-builder/`
- **Code generation:** `packages/launchql-gen/`

### For Testing
- **Test infrastructure:** `packages/pgsql-test/`
- **GraphQL testing:** `packages/graphile-test/`
- **Context injection:** `packages/pg-query-context/`

### For File Operations
- **S3 streaming:** `packages/s3-streamer/`
- **File hashing:** `packages/etag-hash/`, `packages/uuid-hash/`
- **Upload handling:** `packages/upload-names/`

## 📚 Additional Resources

- **Package-specific guides:** See `packages/*/AGENTS.md` for detailed documentation
- **Type definitions:** `packages/types/src/` for comprehensive TypeScript interfaces
- **Examples:** `sandbox/` directory contains example projects
- **Tests:** Each package's `__tests__/` directory shows usage patterns

## 🎯 Agent Tips

1. **Start with `packages/core/AGENTS.md`** for deep understanding of the main classes
2. **Check `packages/cli/AGENTS.md`** to understand user-facing workflows
3. **Use `packages/pgsql-test/AGENTS.md`** for testing patterns
4. **Look at existing tests** in `__tests__/` directories for usage examples
5. **Check `package.json` files** to understand dependencies between packages
6. **Use the type definitions** in `packages/types/` to understand interfaces

This navigation guide should help you quickly find the right code without reading the entire codebase. For detailed information about specific packages, refer to their individual AGENTS.md files.
