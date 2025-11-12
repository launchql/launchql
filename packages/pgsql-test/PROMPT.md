# Seeding API Extension for PgTestClient

## Task Overview

Extend `PgTestClient` with seeding capabilities to provide developers with intuitive options for loading test data. The implementation should support CSV, JSON, SQL files, and LaunchQL deployments while maintaining simplicity and avoiding unnecessary abstraction.

## Core Requirements

### Supported Seeding Methods

1. **JSON Seeding** - Load data from JavaScript objects
2. **CSV Seeding** - Load data from CSV files using PostgreSQL COPY
3. **SQL Files** - Execute SQL files for schema and data setup
4. **LaunchQL** - Deploy LaunchQL packages for full schema management

### Explicitly Excluded Methods

- **NO sqitch()** - Sqitch integration is not part of the instance API
- **NO run()** - Users can create closure functions themselves
- **NO seeder()** - Users can create closure functions themselves

## API Design Principles

### 1. Simplicity First - "JUST A CLASS"

The API must be simple and direct. No meta-programming, no runtime attachment magic, no confusing abstractions.

**Bad (Rejected):**
```typescript
// Meta-programming with attachSeedAPI
attachSeedAPI(client, context);
client.seed.json(data);

// Confusing options
pg.seed.json(data, { client: 'pg', publish: true });
```

**Good (Implemented):**
```typescript
// Direct class methods
await pg.loadJson(data);
await pg.publish(); // Explicit when needed
```

### 2. No Confusing Options

Methods execute on the client they're called on. No `client` or `publish` options.

**Constraint:** Each method operates on its own client instance. Users call `publish()` explicitly when they need cross-connection visibility.

### 3. Backward Compatibility

While the new API uses direct class methods, a backward-compatible shim exists for external packages that still use the old adapter pattern:

```typescript
// Old pattern (still supported for external packages)
import { seed } from 'pgsql-test';
await getConnections({}, [seed.sqlfile(['schema.sql'])]);

// New pattern (primary API)
const { pg } = await getConnections({}, false);
await pg.runSqlfiles(['schema.sql']);
```

## Implementation Architecture

### Direct Class Methods on PgTestClient

The seeding capabilities are implemented as direct methods on the `PgTestClient` class:

```typescript
class PgTestClient {
  // Direct seeding methods
  async loadJson(data: JsonSeedMap): Promise<void>
  async loadCsv(map: CsvSeedMap): Promise<void>
  async runSqlfiles(files: string[]): Promise<void>
  async loadLaunchql(cwd?: string, cache?: boolean): Promise<void>
}
```

### Standalone Helper Functions

To avoid circular dependencies, the actual seeding logic is implemented as standalone functions that accept minimal primitives:

```typescript
// src/seed/json.ts
export async function insertJson(
  client: Client,
  ctxQuery: () => Promise<void>,
  data: JsonSeedMap
): Promise<void>

// src/seed/csv.ts
export async function loadCsvMap(
  client: Client,
  ctxQuery: () => Promise<void>,
  tables: CsvSeedMap
): Promise<void>
```

**Key Design Decision:** Helpers use type-only imports to avoid circular dependencies:
```typescript
import type { PgTestClient } from '../test-client';
```

### seedEnv Threading

The `seedEnv` object is passed through `PgTestClientOpts` to make connection options and admin capabilities available to methods that need them:

```typescript
export type PgTestClientOpts = {
  seedEnv?: {
    connect: PgTestConnectionOptions;
    admin: DbAdmin;
  };
  // ... other options
}
```

This allows methods like `loadLaunchql()` to access the necessary configuration without tight coupling.

## Architectural Decisions & Constraints

### 1. COPY Command Transaction Isolation

**Question:** Should `ctxQuery()` calls be run inside the same transaction as COPY commands?

**Answer:** Yes, they are. The `ctxQuery()` is called before the COPY operation within the same connection, ensuring proper transaction isolation and context application (RLS policies, search_path, etc.).

### 2. No SeedContext Interface

**Original Problem:** The `SeedContext` interface with `pg` and `db` fields was confusing and unnecessary.

**Solution:** Eliminated entirely. Methods have direct access to what they need through:
- Class properties (`this.client`, `this.config`)
- The `seedEnv` passed through options
- Parameters passed to helper functions

### 3. No Meta-Programming (attachSeedAPI)

**Original Problem:** Runtime attachment of seed methods via `attachSeedAPI()` was "old school meta programming" that added unnecessary complexity.

**Solution:** Seed methods are direct members of the `PgTestClient` class. No runtime attachment, no magic.

### 4. Backward Compatibility Shim

**Problem:** External packages (like `graphile-test`) use the old `seed` adapter pattern.

**Solution:** Export a backward-compatible `seed` object and update `getConnections` to accept both signatures:

```typescript
// Backward-compatible exports
export const seed = {
  sqlfile,
  fn,
  compose,
  launchql,
  csv,      // Delegates to ctx.pg.loadCsv()
  json,     // Delegates to ctx.pg.loadJson()
  sqitch    // For connect-time seeding only
};

// Overloaded getConnections
export const getConnections = async (
  cn: GetConnectionOpts = {},
  seedAdaptersOrRunLaunchql: SeedAdapter[] | boolean = true
): Promise<GetConnectionResult>
```

**Important:** The backward-compatible shim is for connect-time seeding only. The new direct class methods are the primary API.

## Test Structure Guidelines

### Simplified Test Patterns

Tests should use one client per test body to avoid confusion about transaction boundaries:

**Bad (Too Complex):**
```typescript
it('test', async () => {
  await pg.loadJson(data);
  await pg.publish();
  const result = await db.any('SELECT * FROM users');
  // Mixing pg and db in same test body
});
```

**Good (Simple):**
```typescript
describe('with pg client', () => {
  it('seeds data', async () => {
    await pg.loadJson(data);
    const result = await pg.any('SELECT * FROM users');
  });
});

describe('with db client', () => {
  it('respects RLS', async () => {
    await db.loadJson(data);
    const result = await db.any('SELECT * FROM users');
  });
});
```

### Cross-Connection Visibility Pattern

When testing RLS or cross-connection scenarios:

```typescript
beforeEach(async () => {
  // Seed with pg (admin) and publish
  await pg.loadJson(data);
  await pg.publish();
});

it('db client sees published data', async () => {
  const result = await db.any('SELECT * FROM users');
  expect(result).toHaveLength(2);
});
```

## Evolution of Requirements

### Phase 1: Initial Exploration
- Created comprehensive PLAN.md exploring seeding capabilities
- Proposed instance methods like `db.seed.json()`, `pg.seed.csv()`
- Included sqitch, run(), and seeder() methods

### Phase 2: Simplification
User feedback: "I don't want the sqitch. I'm also curious, do we really need run(), or seeder()? couldn't a user just make a closure function?"

**Changes:**
- Removed sqitch from instance API
- Removed run() and seeder() methods
- Kept only: csv(), json(), sqlfile(), launchql()

### Phase 3: Remove Confusing Options
User feedback: "this is a horrible idea: SeedOptions with client and publish options. db and pg are simply PgTestClient — DO NOT make weird APIs like this!"

**Changes:**
- Removed all SeedOptions
- Methods execute on the client they're called on
- Users call publish() explicitly when needed

### Phase 4: Simplify Test Structure
User feedback: "make the tests more simple. too many pg/db in the same test isn't a great idea. they don't share TXs."

**Changes:**
- One client per test body
- Seed at top with pg for setup
- Use db below for RLS testing

### Phase 5: Eliminate Meta-Programming
User feedback: "attachSeedAPI() works, but it's like old school meta programming, can we just put these capabilities on the PgTestClient directly? Why all this magic? Can we simplify things more, to... JUST A CLASS?"

**Changes:**
- Removed attachSeedAPI() entirely
- Added seed methods directly to PgTestClient class
- Abstracted seed logic to standalone functions to avoid circular imports

### Phase 6: Eliminate SeedContext
User feedback: "maybe if you redesign the api you won't even need the SeedContext and it's weird issues"

**Changes:**
- Removed SeedContext interface entirely
- Methods access what they need through class properties and seedEnv
- Standalone helper functions accept minimal primitives

## File Structure

```
packages/pgsql-test/
├── src/
│   ├── test-client.ts          # PgTestClient with direct seed methods
│   ├── connect.ts              # getConnections with seedEnv threading
│   ├── index.ts                # Public exports including seed shim
│   └── seed/
│       ├── json.ts             # insertJson() standalone function
│       ├── csv.ts              # loadCsvMap() standalone function
│       ├── launchql.ts         # launchql() adapter for BC
│       ├── adapters.ts         # sqlfile, fn, compose adapters
│       ├── types.ts            # SeedAdapter, SeedContext types
│       └── index.ts            # seed object export for BC
└── __tests__/
    ├── postgres-test.instance-seed-json.test.ts  # New API tests
    ├── postgres-test.instance-seed-csv.test.ts   # New API tests
    ├── postgres-test.json.test.ts                # Old adapter tests
    ├── postgres-test.csv.test.ts                 # Old adapter tests
    └── ...
```

## Key Constraints Summary

1. **No sqitch, run(), or seeder() methods** - Keep it simple
2. **No SeedOptions** - No client or publish options
3. **No meta-programming** - Direct class methods only
4. **No SeedContext** - Eliminated entirely
5. **Backward compatibility** - Old adapter pattern still works for external packages
6. **One client per test** - Avoid mixing pg/db in same test body
7. **Type-only imports** - Avoid circular dependencies
8. **seedEnv threading** - Pass connection options through PgTestClientOpts
9. **Standalone helpers** - Accept minimal primitives (client, ctxQuery)
10. **Explicit publish()** - No automatic cross-connection visibility

## Usage Examples

### JSON Seeding

```typescript
// Load data with pg client (admin)
await pg.loadJson({
  'custom.users': [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ]
});

// Load data with db client (app user)
await db.loadJson({
  'custom.posts': [
    { id: 1, user_id: 1, title: 'First Post' }
  ]
});
```

### CSV Seeding

```typescript
// Load CSV files
await pg.loadCsv({
  'custom.users': '/path/to/users.csv',
  'custom.posts': '/path/to/posts.csv'
});
```

### SQL Files

```typescript
// Run SQL files
await pg.runSqlfiles([
  '/path/to/schema.sql',
  '/path/to/seed-data.sql'
]);
```

### LaunchQL Deployment

```typescript
// Deploy LaunchQL package
await pg.loadLaunchql('/path/to/package', true); // with cache
```

### Cross-Connection Visibility

```typescript
// Seed with pg and make visible to db
await pg.loadJson({ 'custom.users': [{ id: 1, name: 'Alice' }] });
await pg.publish();

// Now db can see the data
const users = await db.any('SELECT * FROM custom.users');
```

## Implementation Status

### Completed
- ✅ Direct class methods on PgTestClient
- ✅ Standalone helper functions (json, csv)
- ✅ seedEnv threading through PgTestClientOpts
- ✅ Backward-compatible seed object export
- ✅ Updated getConnections to accept both signatures
- ✅ Type-only imports to avoid circular dependencies
- ✅ Tests updated to use new API (instance-seed tests)
- ✅ Eliminated SeedContext interface
- ✅ Eliminated attachSeedAPI meta-programming

### Known Issues
- ⚠️ CI failing on old adapter-based tests (csv, json, sqitch)
- ⚠️ Backward-compatible adapters incomplete (missing csv, json, sqitch implementations)

### Next Steps (If Continuing)
1. Add missing backward-compatible adapters (csv, json, sqitch) that delegate to class methods
2. Ensure getConnections properly builds SeedContext for old adapters
3. Verify CSV header handling for subset-header and optional-fields tests
4. Run pgsql-test package tests locally to verify fixes
5. Push changes and wait for CI to pass

## References

- PR: https://github.com/launchql/launchql/pull/268
- Branch: `research/seeding`
- Original PLAN.md: See packages/pgsql-test/PLAN.md
