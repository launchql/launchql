# Seeding API Extension for PgTestClient

## Overview

This document outlines a plan to extend `PgTestClient` with instance-level seeding capabilities while maintaining backward compatibility with the existing seed adapter pattern. The goal is to provide developers with more flexible, intuitive options for loading test data at both setup time and runtime.

## Goals

1. **Maintain Backward Compatibility**: Keep existing seed adapters and `getConnections()` flow working without breaking changes
2. **Add Instance-Level API**: Provide convenient seeding methods directly on `PgTestClient` instances
3. **Support Runtime Seeding**: Enable data loading during test execution (e.g., in `beforeEach` hooks) with proper transaction isolation
4. **Flexible Context Control**: Allow developers to choose whether seeds run with admin privileges or as the application user (with RLS enforcement)
5. **Intuitive Developer Experience**: Create an API that feels natural and reduces boilerplate

## Current Architecture

### Existing Seed Adapters

The current seeding system uses composable adapter functions:

```typescript
interface SeedAdapter {
  seed(ctx: SeedContext): Promise<void> | void;
}

interface SeedContext {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;  // superuser/admin client
}
```

**Available Adapters:**
- `seed.csv(map)` - Load data from CSV files using PostgreSQL COPY
- `seed.json(map)` - Insert data from in-memory JSON objects
- `seed.launchql(cwd, cache)` - Deploy LaunchQL migrations
- `seed.sqitch(cwd)` - Deploy Sqitch migrations
- `seed.fn(callback)` - Execute custom seeding logic
- `seed.sqlfile(files)` - Load SQL files via admin
- `seed.compose(adapters)` - Compose multiple adapters

### Current Usage Pattern

Seeds are passed to `getConnections()` and executed during database setup:

```typescript
const { pg, db, teardown } = await getConnections({}, [
  seed.fn(async ({ pg }) => {
    await pg.query(`CREATE SCHEMA custom; CREATE TABLE custom.users (...)`);
  }),
  seed.csv({ 'custom.users': 'path/to/users.csv' }),
  seed.json({ 'custom.posts': [{ id: 1, content: 'Hello' }] })
]);
```

**Characteristics:**
- Seeds run once during setup with admin privileges (`ctx.pg`)
- Executed before the `db` client is fully configured
- Perfect for schema creation and initial data loading
- Cannot be used for per-test data seeding with RLS context

## Constraints

1. **No Breaking Changes**: Existing tests and adapter API must continue working
2. **Avoid Circular Dependencies**: `seed/csv.ts` imports `PgTestClient`; adding seed imports to `test-client.ts` would create a cycle
3. **Transaction Safety**: Runtime seeding must respect test isolation (transactions/savepoints)
4. **Context Awareness**: Seeds need access to both admin (`pg`) and app user (`db`) clients depending on use case
5. **Privilege Management**: Some operations require superuser privileges; others should enforce RLS

## Proposed Solution

### 1. Add Instance-Level Seeding API

Attach a `seed` property to `PgTestClient` instances at runtime in `connect.ts` after both clients are created. This avoids circular dependencies and keeps the class definition clean.

### 2. API Design

#### Core Instance Methods

```typescript
interface PgTestClientSeed {
  // Convenience methods for common formats
  csv(map: CsvSeedMap, opts?: SeedOptions): Promise<void>;
  json(map: JsonSeedMap, opts?: SeedOptions): Promise<void>;
  sqlfile(files: string[]): Promise<void>;
  
  // Migration deployment
  launchql(cwd?: string, cache?: boolean): Promise<void>;
}

interface SeedOptions {
  // Which client to use for execution
  client?: 'pg' | 'db';  // default: use the client being called on
  
  // Whether to commit data for visibility to other connections
  publish?: boolean;  // default: false
}

// Type exports for better DX
type CsvSeedMap = Record<string, string>;  // table -> csvPath
type JsonSeedMap = Record<string, Record<string, any>[]>;  // table -> rows
```

#### Extended SeedContext

```typescript
interface SeedContext {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;      // superuser/admin client
  db?: PgTestClient;     // app user client (optional, only available at runtime)
}
```

### 3. Usage Examples

#### Setup-Time Seeding (Unchanged)

```typescript
// Existing pattern continues to work
const { pg, db, teardown } = await getConnections({}, [
  seed.launchql(),
  seed.json({ 'app.users': [{ id: 1, name: 'Alice' }] }),
  seed.csv({ 'app.posts': 'path/to/posts.csv' })
]);
```

#### Runtime Seeding with RLS Enforcement

```typescript
describe('User notes', () => {
  beforeEach(async () => {
    await db.beforeEach();
    db.auth({ userId: 'user-123' });
    
    // Seed as application user - RLS policies apply
    await db.seed.json({
      'app.notes': [
        { id: 1, owner_id: 'user-123', text: 'My note' },
        { id: 2, owner_id: 'user-456', text: 'Other note' }
      ]
    });
  });
  
  afterEach(async () => {
    await db.afterEach();  // Rolls back seeded data
  });
  
  it('only sees own notes', async () => {
    const notes = await db.any('SELECT * FROM app.notes');
    expect(notes).toHaveLength(1);  // RLS filters to owner_id = 'user-123'
    expect(notes[0].text).toBe('My note');
  });
});
```

#### Admin Seeding with Publish

```typescript
it('shares data across connections', async () => {
  await pg.beforeEach();
  await db.beforeEach();
  
  // Seed as admin and commit for visibility
  await pg.seed.csv(
    { 'app.users': 'path/to/users.csv' },
    { publish: true }
  );
  
  // Now visible to db connection
  const users = await db.any('SELECT * FROM app.users');
  expect(users.length).toBeGreaterThan(0);
  
  await db.afterEach();
  await pg.afterEach();
});
```

#### Override Client Context

```typescript
// Seed via admin even when called on db
await db.seed.json(
  { 'app.system_config': [{ key: 'version', value: '1.0' }] },
  { client: 'pg' }  // Use admin privileges
);
```

#### CSV with SERIAL Sequence Fix

```typescript
beforeEach(async () => {
  await pg.beforeEach();
  
  await pg.seed.csv({ 'custom.users': 'users.csv' });
  
  // Fix sequence after CSV import
  await pg.query(`
    SELECT setval(
      pg_get_serial_sequence('custom.users', 'id'),
      (SELECT MAX(id) FROM custom.users)
    )
  `);
});
```

## Implementation Plan

### Phase 1: Core Infrastructure

**File: `packages/pgsql-test/src/seed/types.ts`**

```typescript
// Extend SeedContext to optionally include db client
export interface SeedContext {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
  db?: PgTestClient;  // NEW: optional app user client
}

// Export types for better DX
export type CsvSeedMap = Record<string, string>;
export type JsonSeedMap = Record<string, Record<string, any>[]>;

export interface SeedOptions {
  client?: 'pg' | 'db';
  publish?: boolean;
}
```

**File: `packages/pgsql-test/src/seed/api.ts` (NEW)**

```typescript
import { PgTestClient } from '../test-client';
import { DbAdmin } from '../admin';
import { PgConfig } from 'pg-env';
import { PgTestConnectionOptions } from '@launchql/types';
import { seed } from './index';
import { SeedAdapter, SeedContext, CsvSeedMap, JsonSeedMap, SeedOptions } from './types';

export interface SeedRuntime {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
  db?: PgTestClient;
  currentClient: PgTestClient;
}

export interface PgTestClientSeed {
  csv(map: CsvSeedMap, opts?: SeedOptions): Promise<void>;
  json(map: JsonSeedMap, opts?: SeedOptions): Promise<void>;
  sqlfile(files: string[]): Promise<void>;
  launchql(cwd?: string, cache?: boolean): Promise<void>;
}

export function attachSeedAPI(
  client: PgTestClient,
  runtime: SeedRuntime
): void {
  const seedAPI: PgTestClientSeed = {
    async csv(map: CsvSeedMap, opts: SeedOptions = {}): Promise<void> {
      const targetClient = resolveClient(runtime, opts.client);
      await targetClient.ctxQuery();  // Apply session context/role
      
      const ctx = buildContext(runtime, targetClient);
      await seed.csv(map).seed(ctx);
      
      if (opts.publish) {
        await targetClient.publish();
      }
    },

    async json(map: JsonSeedMap, opts: SeedOptions = {}): Promise<void> {
      const targetClient = resolveClient(runtime, opts.client);
      await targetClient.ctxQuery();  // Apply session context/role
      
      const ctx = buildContext(runtime, targetClient);
      await seed.json(map).seed(ctx);
      
      if (opts.publish) {
        await targetClient.publish();
      }
    },

    async sqlfile(files: string[]): Promise<void> {
      const ctx = buildContext(runtime, runtime.currentClient);
      await seed.sqlfile(files).seed(ctx);
    },

    async launchql(cwd?: string, cache: boolean = false): Promise<void> {
      const ctx = buildContext(runtime, runtime.currentClient);
      await seed.launchql(cwd, cache).seed(ctx);
    }
  };

  // Attach to client instance
  (client as any).seed = seedAPI;
}

function buildContext(runtime: SeedRuntime, targetClient: PgTestClient): SeedContext {
  return {
    connect: runtime.connect,
    admin: runtime.admin,
    config: runtime.config,
    pg: targetClient,  // Use target client as pg in context
    db: runtime.db
  };
}

function resolveClient(runtime: SeedRuntime, clientOption?: 'pg' | 'db'): PgTestClient {
  if (clientOption === 'pg') return runtime.pg;
  if (clientOption === 'db') {
    if (!runtime.db) {
      throw new Error('db client not available in this context');
    }
    return runtime.db;
  }
  // Default: use the client being called on
  return runtime.currentClient;
}
```

### Phase 2: Integration

**File: `packages/pgsql-test/src/connect.ts`**

```typescript
// Add import
import { attachSeedAPI, SeedRuntime } from './seed/api';

// In getConnections(), after line 127:
export const getConnections = async (
  cn: GetConnectionOpts = {},
  seedAdapters: SeedAdapter[] = [ seed.launchql() ]
): Promise<GetConnectionResult> => {
  // ... existing code ...
  
  const db = manager.getClient(dbConfig, {
    auth: connOpts.auth,
    roles: connOpts.roles
  });
  db.setContext({ role: getDefaultRole(connOpts) });
  
  // NEW: Attach seed API to both clients
  const runtime: SeedRuntime = {
    connect: connOpts,
    admin,
    config,
    pg,
    db
  };
  
  attachSeedAPI(pg, { ...runtime, currentClient: pg });
  attachSeedAPI(db, { ...runtime, currentClient: db });
  
  return { pg, db, teardown, manager, admin };
};
```

**File: `packages/pgsql-test/src/test-client.ts`**

```typescript
// Add type declaration at the end of the file
import type { PgTestClientSeed } from './seed/api';

export class PgTestClient {
  // ... existing code ...
  
  // Type-only declaration for seed API (attached at runtime)
  seed!: PgTestClientSeed;
}
```

### Phase 3: Enhance CSV/JSON Adapters

**File: `packages/pgsql-test/src/seed/csv.ts`**

```typescript
// Ensure ctxQuery() is called before COPY
export async function copyCsvIntoTable(
  pg: PgTestClient,
  table: string,
  filePath: string
): Promise<void> {
  // NEW: Apply session context before COPY
  await pg.ctxQuery();
  
  const client: Client = pg.client;
  const columns = await parseCsvHeader(filePath);
  
  // Consider adding table identifier quoting for safety
  const quotedTable = quoteIdentifier(table);
  const quotedColumns = columns.map(col => `"${col.replace(/"/g, '""')}"`);
  const columnList = quotedColumns.join(', ');
  const copyCommand = `COPY ${quotedTable} (${columnList}) FROM STDIN WITH CSV HEADER`;
  
  // ... rest of implementation
}

// Helper for safe identifier quoting
function quoteIdentifier(identifier: string): string {
  // Handle schema.table format
  const parts = identifier.split('.');
  return parts.map(part => `"${part.replace(/"/g, '""')}"`).join('.');
}
```

**File: `packages/pgsql-test/src/seed/json.ts`**

```typescript
export function json(data: JsonSeedMap): SeedAdapter {
  return {
    async seed(ctx: SeedContext) {
      const { pg } = ctx;
      
      // NEW: Apply session context before INSERT
      await pg.ctxQuery();

      for (const [table, rows] of Object.entries(data)) {
        if (!Array.isArray(rows) || rows.length === 0) continue;

        const columns = Object.keys(rows[0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        // Consider adding table identifier quoting
        const quotedTable = quoteIdentifier(table);
        const quotedColumns = columns.map(c => `"${c.replace(/"/g, '""')}"`).join(', ');
        const sql = `INSERT INTO ${quotedTable} (${quotedColumns}) VALUES (${placeholders})`;

        for (const row of rows) {
          const values = columns.map((c) => row[c]);
          await pg.query(sql, values);
        }
      }
    }
  };
}

function quoteIdentifier(identifier: string): string {
  const parts = identifier.split('.');
  return parts.map(part => `"${part.replace(/"/g, '""')}"`).join('.');
}
```

### Phase 4: Export Types

**File: `packages/pgsql-test/src/index.ts`**

```typescript
// Add exports
export * from './seed/api';
export type { CsvSeedMap, JsonSeedMap, SeedOptions } from './seed/types';
```

## Testing Plan

### New Test Files

**File: `packages/pgsql-test/__tests__/postgres-test.instance-seed-json.test.ts`**

Test runtime JSON seeding with transaction rollback:

```typescript
describe('Instance seed.json()', () => {
  it('seeds data in beforeEach and rolls back', async () => {
    await db.beforeEach();
    
    await db.seed.json({
      'custom.users': [{ id: 1, name: 'Alice' }]
    });
    
    const users = await db.any('SELECT * FROM custom.users');
    expect(users).toHaveLength(1);
    
    await db.afterEach();
    
    // Verify rollback
    await db.beforeEach();
    const usersAfter = await db.any('SELECT * FROM custom.users');
    expect(usersAfter).toHaveLength(0);
    await db.afterEach();
  });
  
  it('enforces RLS when seeding as db', async () => {
    // Test that RLS policies are respected
  });
});
```

**File: `packages/pgsql-test/__tests__/postgres-test.instance-seed-csv.test.ts`**

Test CSV seeding with different clients:

```typescript
describe('Instance seed.csv()', () => {
  it('seeds as pg with admin privileges', async () => {
    await pg.seed.csv({ 'custom.users': csvPath });
    // Verify data loaded
  });
  
  it('seeds as db with RLS enforcement', async () => {
    db.auth({ userId: 'user-1' });
    await db.seed.csv({ 'custom.notes': csvPath });
    // Verify RLS applied
  });
  
  it('publishes data for cross-connection visibility', async () => {
    await pg.seed.csv(
      { 'custom.users': csvPath },
      { publish: true }
    );
    
    const users = await db.any('SELECT * FROM custom.users');
    expect(users.length).toBeGreaterThan(0);
  });
});
```

### Regression Tests

Verify all existing tests continue to pass:
- `postgres-test.csv.test.ts`
- `postgres-test.json.test.ts`
- `postgres-test.deploy-fast.test.ts`
- `postgres-test.deploy-sqitch.test.ts`
- All other existing test files

## Migration and Backward Compatibility

### No Breaking Changes

1. **Existing seed adapters**: Continue to work exactly as before
2. **getConnections() signature**: Unchanged
3. **Setup-time seeding**: Existing pattern `getConnections({}, [seed.*])` works identically
4. **SeedContext extension**: Adding optional `db?` field is backward compatible

### Opt-In Usage

The new instance API is purely additive:
- Developers can continue using only setup-time seeding
- New instance methods are available when needed
- No migration required for existing tests

### Documentation Updates

Update `packages/pgsql-test/README.md` with:
1. Overview of both seeding approaches
2. When to use setup-time vs runtime seeding
3. Examples of instance API usage
4. Best practices for RLS testing
5. Transaction isolation considerations

## Open Questions

### 1. Privilege Verification

**Question**: Is `config.user` for `manager.getClient(config)` always a superuser in all environments?

**Impact**: If not guaranteed, admin-only seeds may fail unexpectedly.

**Recommendation**: Add verification during setup:
```typescript
const result = await pg.query(`
  SELECT rolsuper FROM pg_roles WHERE rolname = current_user
`);
if (!result.rows[0]?.rolsuper) {
  console.warn('[pgsql-test] Warning: pg client is not a superuser');
}
```

### 2. Method Naming

**Question**: Should we use `seed.*` or consider alternatives like `load.*` or `import.*`?

**Current Choice**: `seed.*` for consistency with existing adapter namespace.

**Alternative**: Could use `client.load.csv()` or `client.import.json()` if preferred.

### 3. Identifier Quoting Strategy

**Question**: Should we always quote table identifiers in CSV/JSON adapters?

**Current State**: CSV quotes columns but not table names; JSON doesn't quote either.

**Recommendation**: Add `quoteIdentifier()` helper and use it consistently to prevent SQL injection and handle edge cases (special characters, reserved words, schema-qualified names).

### 4. Context Safety

**Question**: Should we add parameterization to `setContext()` to prevent SQL injection?

**Current State**: Values are interpolated directly into SQL strings.

**Risk**: Low in test environments, but could be hardened.

**Recommendation**: Document as a future hardening task; not critical for test-only code.

### 5. Admin Flag

**Question**: Should we add an explicit `isAdmin` flag to `PgTestClient` to help gate admin-only operations?

**Current Approach**: Infer from client type (pg vs db).

**Alternative**: Add `client.isAdmin: boolean` set during construction.

**Recommendation**: Start without flag; add if needed based on usage patterns.

### 6. Error Handling

**Question**: How should we handle privilege errors when seeding as db with insufficient permissions?

**Options**:
1. Let PostgreSQL error bubble up (current behavior)
2. Catch and provide helpful error message suggesting `{ client: 'pg' }`
3. Add `requireAdmin` option that validates before execution

**Recommendation**: Start with option 1 (let errors bubble); add better error messages in Phase 2 if needed.

## Success Criteria

1. ✅ All existing tests pass without modification
2. ✅ New instance API is available on both `pg` and `db` clients
3. ✅ Runtime seeding works in `beforeEach` hooks with proper rollback
4. ✅ RLS enforcement works correctly when seeding as `db`
5. ✅ `publish()` option makes data visible across connections
6. ✅ No circular dependency issues
7. ✅ Type safety maintained with proper TypeScript definitions
8. ✅ Documentation covers both setup-time and runtime seeding patterns

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Streaming CSV for Large Files**: Add option to stream large CSVs in chunks
2. **Bulk Insert Optimization**: Batch JSON inserts for better performance
3. **Schema Inference**: Auto-detect table schemas for validation
4. **Seed Fixtures**: Built-in fixture management system
5. **Seed Snapshots**: Save/restore database state for complex test scenarios
6. **Parallel Seeding**: Seed multiple tables concurrently when no dependencies exist
7. **Seed Validation**: Verify data integrity after seeding (foreign keys, constraints)
8. **Progress Reporting**: Add logging/progress callbacks for large seed operations

### Integration Ideas

1. **Factory Pattern**: Integration with factory libraries for generating test data
2. **Faker Integration**: Built-in support for generating fake data
3. **GraphQL Seeding**: Seed via GraphQL mutations for API-level testing
4. **Seed Migrations**: Version control for seed data similar to schema migrations

## Summary

This plan proposes a backward-compatible extension to `pgsql-test` that adds instance-level seeding methods to `PgTestClient` while preserving the existing adapter pattern. The design prioritizes developer experience, flexibility, and safety by:

- Maintaining all existing functionality without breaking changes
- Providing intuitive instance methods for common seeding tasks
- Supporting both setup-time and runtime seeding use cases
- Enabling fine-grained control over execution context (admin vs app user)
- Respecting transaction boundaries for proper test isolation
- Avoiding circular dependencies through runtime API attachment

The implementation can be rolled out incrementally, starting with core infrastructure and expanding to additional features based on developer feedback and usage patterns.
