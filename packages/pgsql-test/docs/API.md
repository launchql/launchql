# pgsql-test API Reference

## getConnections()

The main entry point for creating isolated PostgreSQL test database connections.

### Signature

```typescript
async function getConnections(
  cn?: GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<GetConnectionResult>
```

### Parameters

#### `cn?: GetConnectionOpts`

Optional configuration object for connection setup:

```typescript
interface GetConnectionOpts {
  pg?: Partial<PgConfig>;              // PostgreSQL superuser connection config
  db?: Partial<PgTestConnectionOptions>; // App-level user connection config
}
```

**`pg` options (superuser connection):**
- `host`: PostgreSQL host (default: `'localhost'`)
- `port`: PostgreSQL port (default: `5432`)
- `user`: Superuser username (default: `'postgres'`)
- `password`: Superuser password (default: `'password'`)
- `database`: Database name (auto-generated with UUID if not specified)

**`db` options (app-level user connection):**
- `rootDb`: Root database for initial connection (default: `'postgres'`)
- `template`: Template database for creating test databases
- `prefix`: Prefix for test database names (default: `'db-'`)
- `extensions`: PostgreSQL extensions to install (default: `[]`)
- `connection`: User credentials and role configuration
  - `user`: App user name (default: `'app_user'`)
  - `password`: App user password (default: `'app_password'`)
  - `role`: Initial role to assume (default: `'anonymous'`)
- `roles`: Custom role name mapping
  - `anonymous`: Custom name for anonymous role (default: `'anonymous'`)
  - `authenticated`: Custom name for authenticated role (default: `'authenticated'`)
  - `administrator`: Custom name for administrator role (default: `'administrator'`)
  - `default`: Default role for new connections (default: `'anonymous'`)
- `grantAdministratorToDb`: Grant administrator role to db user (default: `false`)

#### `seedAdapters?: SeedAdapter[]`

Optional array of seed adapters to populate the test database with initial data. Default includes `seed.launchql()` which sets up standard roles and permissions.

### Return Value

```typescript
interface GetConnectionResult {
  pg: PgTestClient;              // Superuser connection
  db: PgTestClient;              // App-level user connection
  admin: DbAdmin;                // Database admin utilities
  teardown: () => Promise<void>; // Cleanup function
  manager: PgTestConnector;      // Shared connection pool manager
}
```

#### Return Value Details

**`pg: PgTestClient`**
- Superuser connection with full PostgreSQL privileges
- Bypasses all Row Level Security (RLS) policies
- Use for:
  - Creating extensions (`CREATE EXTENSION`)
  - Schema modifications requiring superuser
  - Setting up test infrastructure in `beforeAll`
- Should NOT be rolled back in most scenarios (see Scenario C)

**`db: PgTestClient`**
- App-level user connection with realistic permissions
- Respects Row Level Security (RLS) policies
- Use for:
  - All test operations (recommended)
  - Testing RLS policies with `setContext()`
  - Simulating real application behavior
- Should be rolled back with `beforeEach`/`afterEach`

**`admin: DbAdmin`**
- Database administration utilities
- Methods:
  - `createDatabase(name)`: Create a new database
  - `dropDatabase(name)`: Drop a database
  - `createFromTemplate(template, name)`: Create from template
  - `installExtensions(extensions, dbName)`: Install extensions
  - `grantRole(role, user, dbName)`: Grant role to user
  - `grantConnect(role, dbName)`: Grant connect privilege
  - `createUserRole(user, password, dbName)`: Create app user with roles
  - `streamSql(sql, dbName)`: Execute SQL via streaming
- Use when: You need database-level operations beyond what `pg`/`db` provide

**`teardown: () => Promise<void>`**
- Cleanup function to close all connections and drop test database
- **Always call in `afterAll` hook**
- Handles:
  - Closing all connections
  - Dropping test database
  - Cleaning up connection pools

**`manager: PgTestConnector`**
- Shared connection pool manager (singleton)
- Rarely needed - most users should ignore this
- Use when: You need direct access to connection pool internals

## Usage Patterns

### Pattern 1: Hybrid Strategy (Recommended - Scenario C)

Use `pg` for extensions only, `db` for everything else with role switching:

```typescript
import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections({
    db: {
      grantAdministratorToDb: true  // Enable administrator role for db user
    }
  }));
  
  // Use pg ONLY for extensions
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();  // Only manage db transaction
});

afterEach(async () => {
  await db.afterEach();   // Only manage db transaction
});

it('should test with RLS', async () => {
  // Setup as administrator (bypasses RLS)
  db.setContext({ role: 'administrator' });
  await db.query(`INSERT INTO users (email) VALUES ('alice@example.com')`);
  
  // Test as authenticated user (RLS enforced)
  db.setContext({
    role: 'authenticated',
    'jwt.claims.user_id': '123'
  });
  
  const users = await db.any('SELECT * FROM users');
  expect(users.length).toBe(1);
});
```

**Advantages:**
- ✅ Simple transaction management (one connection)
- ✅ Supports extensions via `pg`
- ✅ Full RLS testing via role switching
- ✅ Minimal error potential

### Pattern 2: Single Connection Only (Scenario B)

Use only `db` when no extensions are needed:

```typescript
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, teardown } = await getConnections({
    db: {
      grantAdministratorToDb: true  // Enable administrator role
    }
  }));
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

it('should test with role switching', async () => {
  // All operations use db with role switching
  db.setContext({ role: 'administrator' });
  await db.query(`CREATE TABLE users (...)`);
  
  db.setContext({ role: 'authenticated' });
  const users = await db.any('SELECT * FROM users');
});
```

**Advantages:**
- ✅ Simplest setup
- ✅ Fastest (one transaction)
- ⚠️ Cannot create extensions (no superuser)

### Pattern 3: Dual Connection (Scenario A)

Use both connections with independent transaction management:

```typescript
let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
  // Note: grantAdministratorToDb not needed here
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();  // Manage both connections
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();   // Rollback both connections
  await db.afterEach();
});

it('should test with separate connections', async () => {
  // Use pg for admin operations
  await pg.query(`INSERT INTO users (email) VALUES ('alice@example.com')`);
  
  // Use db for testing with RLS
  db.setContext({ role: 'authenticated' });
  const users = await db.any('SELECT * FROM users');
});
```

**Advantages:**
- ✅ Explicit privilege separation
- ✅ Natural RLS testing (no role switching)
- ⚠️ Must manage two transactions
- ⚠️ Easy to forget rollback on one connection

## Configuration Options

### grantAdministratorToDb

**Type:** `boolean`  
**Default:** `false`

When `true`, grants the `administrator` role to the `db` user during setup. This enables single-connection testing patterns where you can switch between administrator and other roles using `setContext()`.

```typescript
const { db, teardown } = await getConnections({
  db: {
    grantAdministratorToDb: true
  }
});

// Now db can switch to administrator role
db.setContext({ role: 'administrator' });
await db.query(`CREATE TABLE users (...)`);  // Bypasses RLS

// Switch back to authenticated
db.setContext({ role: 'authenticated' });
await db.any('SELECT * FROM users');  // RLS enforced
```

**When to use:**
- ✅ Scenario B (single connection only)
- ✅ Scenario C (hybrid strategy)
- ❌ Scenario A (dual connection) - not needed since `pg` is superuser

**Impact on security testing:**
- With `grantAdministratorToDb: true`, the db user CAN bypass RLS by switching to administrator role
- With `grantAdministratorToDb: false` (default), db user CANNOT bypass RLS at all
- Use `true` for flexible testing, `false` for stricter privilege boundaries

### extensions

**Type:** `string[]`  
**Default:** `[]`

PostgreSQL extensions to install in the test database:

```typescript
const { db, pg, teardown } = await getConnections({
  db: {
    extensions: ['uuid-ossp', 'pgcrypto', 'postgis']
  }
});
```

**Note:** Extensions are installed via the superuser connection (`pg`), so this works regardless of `grantAdministratorToDb` setting.

### template

**Type:** `string`  
**Default:** `undefined`

Create the test database from a PostgreSQL template database:

```typescript
const { db, teardown } = await getConnections({
  db: {
    template: 'my_template_db'
  }
});
```

**Use when:**
- You have a pre-seeded template database
- You want faster test setup (template cloning is fast)
- You want consistent starting state across tests

### Custom Role Names

Override default role names:

```typescript
const { db, teardown } = await getConnections({
  db: {
    roles: {
      anonymous: 'anon',           // Custom anonymous role name
      authenticated: 'auth_user',  // Custom authenticated role name
      administrator: 'admin',      // Custom administrator role name
      default: 'anon'             // Default role for new connections
    }
  }
});
```

## Destructuring Patterns

### Minimal (Single Connection)

```typescript
const { db, teardown } = await getConnections();
```

### Standard (Hybrid Strategy)

```typescript
const { pg, db, teardown } = await getConnections();
```

### With Admin Utilities

```typescript
const { db, admin, teardown } = await getConnections();
```

### Complete (All Return Values)

```typescript
const { pg, db, admin, teardown, manager } = await getConnections();
```

### Quick Reference Table

| Return Value | Always Include? | Use Case |
|--------------|----------------|----------|
| `db` | ✅ Yes | Main testing connection |
| `teardown` | ✅ Yes | Cleanup in `afterAll` |
| `pg` | ⚠️ Optional | Only if you need extensions or superuser operations |
| `admin` | ⚠️ Optional | Only if you need database admin utilities |
| `manager` | ⚠️ Rare | Advanced connection pool management |

## PgTestClient Methods

Both `pg` and `db` are instances of `PgTestClient` with the following key methods:

### Transaction Management

```typescript
// Start transaction + savepoint
await db.beforeEach();

// Rollback to savepoint + commit transaction
await db.afterEach();

// Manual transaction control
await db.begin();
await db.commit();
await db.rollback();

// Savepoint management
await db.savepoint('my_savepoint');
await db.rollbackToSavepoint('my_savepoint');
await db.releaseSavepoint('my_savepoint');
```

### Context Management

```typescript
// Set role and claims
db.setContext({
  role: 'authenticated',
  'jwt.claims.user_id': '123',
  'jwt.claims.email': 'alice@example.com'
});

// Clear context
db.clearContext();
```

### Query Methods

```typescript
// Execute query (no return)
await db.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);

// Query and return all rows
const users = await db.any('SELECT * FROM users');

// Query and return one row (throws if not exactly 1 row)
const user = await db.one('SELECT * FROM users WHERE id = $1', [123]);

// Query and return one row or null
const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [123]);

// Query and return many rows (throws if 0 rows)
const users = await db.many('SELECT * FROM users WHERE active = true');
```

## API Design Proposals: Controlling db User Roles

**Status:** 🚧 Proposed - Not Yet Implemented

The following section presents different API design options for controlling which roles are granted to the `db` user during test setup. This is particularly important for enabling single-connection RLS testing strategies where you want the `db` user to be able to switch to the `administrator` role via `setContext()`.

**Current Behavior:** By default, the `db` user is granted only `anonymous` and `authenticated` roles. To test RLS policies with a single connection, users need a way to also grant the `administrator` role (which has `BYPASSRLS` privilege).

### Option 1: `dbRoles` Array

**API:**
```typescript
const { db, teardown } = await getConnections({
  db: { 
    dbRoles: ['anonymous', 'authenticated', 'administrator'] 
  }
});
```

**Pros:**
- ✅ Explicit - clearly shows exactly which roles are granted
- ✅ Flexible - can grant any combination of roles
- ✅ Extensible - easy to add more roles in the future (e.g., `service_role`)
- ✅ No ambiguity about what roles the user has

**Cons:**
- ⚠️ More verbose than a simple boolean
- ⚠️ Requires knowing the exact role names
- ⚠️ Replaces defaults entirely (must list all roles you want)

**Default Behavior Impact:**
- Default: `dbRoles` undefined → grants `anonymous` + `authenticated` (current behavior)
- Explicit: `dbRoles: ['administrator']` → grants ONLY `administrator` (must list all wanted roles)

**Implementation Complexity:** ⭐⭐ (Medium)
- Need to validate role names exist
- Need to handle empty array case
- Need to merge with or replace default roles

**Example Usage:**
```typescript
// Standard RLS testing with role switching
const { db, teardown } = await getConnections({
  db: { 
    dbRoles: ['anonymous', 'authenticated', 'administrator'] 
  }
});

// Minimal - only admin for setup-heavy tests
const { db, teardown } = await getConnections({
  db: { 
    dbRoles: ['administrator'] 
  }
});

// Standard - explicitly list defaults
const { db, teardown } = await getConnections({
  db: { 
    dbRoles: ['anonymous', 'authenticated'] 
  }
});
```

---

### Option 2: `grantAdmin` Boolean

**API:**
```typescript
const { db, teardown } = await getConnections({
  db: { 
    grantAdmin: true 
  }
});
```

**Pros:**
- ✅ Very concise and simple
- ✅ Intuitive for the common use case (add admin role)
- ✅ Easy to discover and understand
- ✅ Minimal cognitive overhead

**Cons:**
- ⚠️ Not extensible to other roles (what about `service_role`?)
- ⚠️ Binary choice - either you have admin or you don't
- ⚠️ May need to add more boolean flags later (`grantServiceRole`?)

**Default Behavior Impact:**
- Default: `grantAdmin` undefined or `false` → grants `anonymous` + `authenticated` (current)
- Explicit: `grantAdmin: true` → grants `anonymous` + `authenticated` + `administrator`

**Implementation Complexity:** ⭐ (Low)
- Simple boolean check
- Just adds one more role to the default list

**Example Usage:**
```typescript
// Most common - enable admin for RLS testing
const { db, teardown } = await getConnections({
  db: { grantAdmin: true }
});

// Explicit opt-out (same as default)
const { db, teardown } = await getConnections({
  db: { grantAdmin: false }
});

// Default behavior - no option needed
const { db, teardown } = await getConnections();
```

---

### Option 3: `userLevel` Enum

**API:**
```typescript
const { db, teardown } = await getConnections({
  db: { 
    userLevel: 'admin' | 'standard' | 'minimal' | 'custom'
  }
});
```

**Pros:**
- ✅ Semantic presets that encode best practices
- ✅ Self-documenting - clear intent from the value
- ✅ Can evolve presets over time without breaking changes
- ✅ Guides users toward good patterns

**Cons:**
- ⚠️ Less flexible - limited to predefined combinations
- ⚠️ Requires understanding what each preset means
- ⚠️ "Custom" level might be confusing

**Default Behavior Impact:**
- Default: `userLevel` undefined → same as `'standard'` → grants `anonymous` + `authenticated`
- `userLevel: 'admin'` → grants `anonymous` + `authenticated` + `administrator`
- `userLevel: 'minimal'` → grants only `anonymous`

**Preset Definitions:**
```typescript
// Preset definitions
const USER_LEVELS = {
  minimal: ['anonymous'],                           // Basic read-only
  standard: ['anonymous', 'authenticated'],         // Default - current behavior
  admin: ['anonymous', 'authenticated', 'administrator'], // RLS testing
  custom: []  // Use with dbRoles array
};
```

**Implementation Complexity:** ⭐⭐ (Medium)
- Need to define and document presets
- Need to handle custom case
- May need to evolve presets over time

**Example Usage:**
```typescript
// RLS testing with admin privileges
const { db, teardown } = await getConnections({
  db: { userLevel: 'admin' }
});

// Standard testing (explicit - same as default)
const { db, teardown } = await getConnections({
  db: { userLevel: 'standard' }
});

// Minimal privileges
const { db, teardown } = await getConnections({
  db: { userLevel: 'minimal' }
});
```

---

### Option 4: Callback-Based Configuration

**API:**
```typescript
const { db, teardown } = await getConnections({
  db: {
    configureRoles: (defaults: string[]) => {
      return [...defaults, 'administrator'];
    }
  }
});
```

**Pros:**
- ✅ Maximum flexibility - can compute roles dynamically
- ✅ Functional programming approach
- ✅ Can access defaults and modify them
- ✅ Future-proof for complex scenarios

**Cons:**
- ⚠️ Most complex option for simple use cases
- ⚠️ Overkill for 90% of users
- ⚠️ Less discoverable than declarative options
- ⚠️ Harder to type-check and validate

**Default Behavior Impact:**
- Default: `configureRoles` undefined → grants `anonymous` + `authenticated` (current)
- Callback: receives `['anonymous', 'authenticated']` as input, returns modified array

**Implementation Complexity:** ⭐⭐⭐ (High)
- Need to handle callback execution safely
- Need to validate returned array
- Need to provide good TypeScript types

**Example Usage:**
```typescript
// Add administrator to defaults
const { db, teardown } = await getConnections({
  db: {
    configureRoles: (defaults) => [...defaults, 'administrator']
  }
});

// Replace defaults entirely
const { db, teardown } = await getConnections({
  db: {
    configureRoles: () => ['administrator']
  }
});

// Conditional logic
const { db, teardown } = await getConnections({
  db: {
    configureRoles: (defaults) => {
      const roles = [...defaults];
      if (process.env.TEST_MODE === 'integration') {
        roles.push('administrator');
      }
      return roles;
    }
  }
});
```

---

### Option 5: Multiple Boolean Flags

**API:**
```typescript
const { db, teardown } = await getConnections({
  db: {
    includeAnonymous: true,      // Default: true
    includeAuthenticated: true,  // Default: true
    includeAdmin: true,           // Default: false
    includeServiceRole: false     // Default: false
  }
});
```

**Pros:**
- ✅ Very explicit and self-documenting
- ✅ Easy to discover through autocomplete
- ✅ Each flag is independent
- ✅ Clear defaults in documentation

**Cons:**
- ⚠️ Clutters the interface with multiple properties
- ⚠️ Verbose - need to set multiple flags
- ⚠️ Harder to see "big picture" of granted roles
- ⚠️ Adds new properties for each new role

**Default Behavior Impact:**
- All flags default to their current behavior
- `includeAnonymous: true` (default)
- `includeAuthenticated: true` (default)
- `includeAdmin: false` (default)
- `includeServiceRole: false` (default)

**Implementation Complexity:** ⭐⭐ (Medium)
- Need to check multiple boolean flags
- Need to maintain as new roles are added
- Need to document each flag

**Example Usage:**
```typescript
// Most common - add admin only
const { db, teardown } = await getConnections({
  db: { includeAdmin: true }
});

// Minimal - only admin (disable defaults)
const { db, teardown } = await getConnections({
  db: {
    includeAnonymous: false,
    includeAuthenticated: false,
    includeAdmin: true
  }
});

// Everything
const { db, teardown } = await getConnections({
  db: {
    includeAdmin: true,
    includeServiceRole: true
  }
});
```

---

### Option 6: Dual Connection Helper

**API:**
```typescript
const { pg, db, connections, teardown } = await getConnections();

// Use the helper to manage both connections
beforeEach(async () => {
  await connections.beforeEach();  // Manages both pg and db internally
});

afterEach(async () => {
  await connections.afterEach();   // Rolls back both pg and db
});
```

**Pros:**
- ✅ Eliminates duplication when using dual connection strategy
- ✅ No risk of forgetting to roll back one connection
- ✅ Clean, single API call
- ✅ Avoids global scope name collision issues
- ✅ Backward compatible - `pg` and `db` still available individually

**Cons:**
- ⚠️ Only useful for Scenario A (dual connection with both rolled back)
- ⚠️ Not needed for Scenario C (recommended pattern where only `db` is rolled back)
- ⚠️ Adds another return value to destructure
- ⚠️ May encourage dual connection anti-pattern

**Default Behavior Impact:**
- New optional return value: `connections` helper
- If not destructured, no change to existing behavior
- When used, calls both `pg.beforeEach()` and `db.beforeEach()` internally

**Implementation Complexity:** ⭐⭐ (Medium)
- Create a `ConnectionManager` class that wraps both clients
- Implement `beforeEach()`, `afterEach()`, `begin()`, `commit()`, `rollback()` methods
- Each method delegates to both underlying clients
- Return from `getConnections()` alongside existing values

**Implementation Sketch:**
```typescript
class ConnectionManager {
  constructor(private pg: PgTestClient, private db: PgTestClient) {}
  
  async beforeEach(): Promise<void> {
    await this.pg.beforeEach();
    await this.db.beforeEach();
  }
  
  async afterEach(): Promise<void> {
    await this.pg.afterEach();
    await this.db.afterEach();
  }
  
  async begin(): Promise<void> {
    await this.pg.begin();
    await this.db.begin();
  }
  
  async commit(): Promise<void> {
    await this.pg.commit();
    await this.db.commit();
  }
  
  async rollback(): Promise<void> {
    await this.pg.rollback();
    await this.db.rollback();
  }
}
```

**Example Usage:**
```typescript
// Scenario A with helper - cleanest dual connection management
const { pg, db, connections, teardown } = await getConnections();

beforeEach(async () => {
  await connections.beforeEach();  // Both pg and db start transactions
});

afterEach(async () => {
  await connections.afterEach();   // Both pg and db roll back
});

it('test with proper isolation', async () => {
  // Insert via pg
  await pg.query('INSERT INTO users (email) VALUES ($1)', ['alice@example.com']);
  
  // Insert via db
  await db.query('INSERT INTO products (name) VALUES ($1)', ['Laptop']);
  
  // Both will be rolled back automatically
});

// Can still use pg and db individually when needed
it('test with selective operations', async () => {
  await connections.beforeEach();
  
  await pg.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');  // pg only
  await db.query('SELECT * FROM products');  // db only
  
  await connections.afterEach();
});
```

**When to Use:**
- ✅ Scenario A (strict privilege separation, both connections need rollback)
- ❌ Scenario C (recommended - only `db` needs rollback, `pg` used in `beforeAll`)
- ❌ Scenario B (single connection - no need for helper)

**Note:** This helper is specifically for the dual connection rollback pattern. For most use cases, **Scenario C is still recommended** where you only manage `db` transactions and use `pg` sparingly in `beforeAll` for setup.

---

### Comparison Matrix

**Options 1-5: Role Configuration**

| Criterion | Option 1: `dbRoles` | Option 2: `grantAdmin` | Option 3: `userLevel` | Option 4: Callback | Option 5: Flags |
|-----------|-------------------|---------------------|---------------------|-------------------|----------------|
| **Simplicity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Discoverability** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Extensibility** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Common Case** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Implementation** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **TypeScript DX** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Option 6: Dual Connection Helper** (orthogonal to Options 1-5)
- **Purpose:** Simplifies Scenario A (dual connection with both rolled back)
- **Use Case:** Only relevant when using both `pg` and `db` with independent transactions
- **Recommendation:** Most users should use Scenario C instead, making this helper unnecessary

### Recommendation Request

**Which option should be implemented?** Please choose one of the above options, or suggest a hybrid/alternative approach.

**Key Questions to Consider:**
1. **Common case optimization:** How often will users need to grant admin? If >50%, maybe default should change?
2. **Future roles:** Will we add `service_role` or other roles? If yes, Options 1, 4, or 5 are better.
3. **User sophistication:** Are users comfortable with arrays/callbacks, or prefer simple booleans?
4. **API consistency:** Does the rest of the codebase favor explicit arrays, booleans, or enums?

**Hybrid Alternative:**
Could combine Option 2 (`grantAdmin: boolean`) with Option 1 (`dbRoles: string[]`) where:
- `grantAdmin` is a convenience shortcut (adds admin to defaults)
- `dbRoles` is for power users who want full control
- If both are specified, `dbRoles` takes precedence (explicit wins)

```typescript
// Simple case - most users
const { db } = await getConnections({
  db: { grantAdmin: true }
});

// Power user case
const { db } = await getConnections({
  db: { dbRoles: ['administrator', 'service_role'] }
});
```

---

## Best Practices

### 1. Always Include teardown

```typescript
afterAll(async () => {
  await teardown();  // ✅ Always call this
});
```

### 2. Choose Your Pattern Based on Needs

- **No extensions needed?** → Use Scenario B (single `db` connection)
- **Need extensions?** → Use Scenario C (hybrid with `pg` + `db`)
- **Need strict privilege separation?** → Use Scenario A (dual connection)

### 3. Only Destructure What You Need

```typescript
// ❌ Bad - grabbing everything unnecessarily
const { pg, db, admin, teardown, manager } = await getConnections();

// ✅ Good - only what you need
const { db, teardown } = await getConnections();
```

### 4. Manage Transactions Consistently

```typescript
// ✅ Good - consistent transaction management
beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

// ❌ Bad - forgetting afterEach leads to data pollution
beforeEach(async () => {
  await db.beforeEach();
});
// Missing afterEach!
```

## Common Pitfalls

### Forgetting to Roll Back pg

```typescript
// ❌ Wrong - pg data persists between tests
beforeEach(async () => {
  await db.beforeEach();  // Only db!
});

afterEach(async () => {
  await db.afterEach();   // Only db!
});

it('test 1', async () => {
  await pg.query('INSERT INTO users ...');  // Not rolled back!
});

it('test 2', async () => {
  const users = await pg.any('SELECT * FROM users');
  expect(users.length).toBe(0);  // ❌ Fails - data from test 1 still there
});
```

**Solution:** Use Scenario C (don't roll back `pg`, only use it in `beforeAll`).

### Not Calling teardown

```typescript
// ❌ Wrong - connection and database leak
beforeAll(async () => {
  ({ db, pg, teardown } = await getConnections());
});
// Missing afterAll!
```

**Solution:** Always call `teardown` in `afterAll`:

```typescript
// ✅ Correct
afterAll(async () => {
  await teardown();
});
```

## See Also

- [recommendation.md](./recommendation.md) - Detailed comparison of connection strategies with weighted scorecard
- [scenario-a.md](./scenario-a.md) - Dual connection strategy (pg + db)
- [scenario-b.md](./scenario-b.md) - Single connection strategy (db only)
- [scenario-c.md](./scenario-c.md) - Hybrid strategy (recommended)
- [CONNECTION-MODEL.md](./CONNECTION-MODEL.md) - Deep dive into connection behavior
- [VISIBILITY-EXAMPLE.md](./VISIBILITY-EXAMPLE.md) - Data visibility examples
