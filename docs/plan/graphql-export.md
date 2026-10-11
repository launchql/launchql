# Plan: GraphQL-Based `pgpm export`

## Problem

The current `pgpm export` command fetches all data via direct SQL queries against the PostgreSQL database (using `pg-cache` / `pg` pool). Customers who use Constructive's hosted platform do **not** have direct SQL access to their databases — they only have access to the **GraphQL API** served by the Constructive server (`graphql/server`).

This means customers cannot run `pgpm export` today because the command requires a direct database connection.

## Goal

Create an alternative data-fetching backend for `pgpm export` that uses **GraphQL queries** instead of raw SQL, so the export can run against a customer's GraphQL endpoint (e.g. `https://api.example.com/graphql`).

The developer should be able to run something like:

```bash
pgpm export --graphql-endpoint https://api.example.com/graphql --token <auth-token>
```

---

## Current Architecture

### Export Flow Overview

The export command has three layers:

1. **CLI layer** — `pgpm/cli/src/commands/export.ts`
2. **Core orchestrator** — `pgpm/core/src/export/export-migrations.ts`
3. **Meta exporter** — `pgpm/core/src/export/export-meta.ts`

### SQL Queries Used Today

#### CLI layer (`pgpm/cli/src/commands/export.ts`)

| # | Query | Purpose |
|---|-------|---------|
| 1 | `SELECT datname FROM pg_catalog.pg_database ...` | List available Postgres databases |
| 2 | `SELECT id, name FROM metaschema_public.database` | List database entries in metaschema |
| 3 | `SELECT * FROM metaschema_public.schema WHERE database_id = $1` | List schemas for a database |

#### Core orchestrator (`pgpm/core/src/export/export-migrations.ts`)

| # | Query | Purpose |
|---|-------|---------|
| 4 | `SELECT * FROM metaschema_public.database WHERE id = $1` | Get database record |
| 5 | `SELECT * FROM metaschema_public.schema WHERE database_id = $1` | Get schemas |
| 6 | `SELECT * FROM db_migrate.sql_actions WHERE database_id = $1 ORDER BY id` | Get migration SQL actions |

#### Meta exporter (`pgpm/core/src/export/export-meta.ts`)

~50+ queries of the form:

```sql
SELECT * FROM <schema>.<table> WHERE database_id = $1
```

Across three schemas:
- **`metaschema_public`** — `database`, `schema`, `table`, `field`, `policy`, `index`, `trigger`, `trigger_function`, `rls_function`, `limit_function`, `procedure`, `foreign_key_constraint`, `primary_key_constraint`, `unique_constraint`, `check_constraint`, `full_text_search`, `schema_grant`, `table_grant`
- **`services_public`** — `domains`, `sites`, `apis`, `apps`, `site_modules`, `site_themes`, `site_metadata`, `api_modules`, `api_extensions`, `api_schemas`
- **`metaschema_modules_public`** — `rls_module`, `user_auth_module`, `memberships_module`, `permissions_module`, `limits_module`, `levels_module`, `users_module`, `hierarchy_module`, `membership_types_module`, `invites_module`, `emails_module`, `sessions_module`, `secrets_module`, `profiles_module`, `encrypted_secrets_module`, `connected_accounts_module`, `phone_numbers_module`, `crypto_addresses_module`, `crypto_auth_module`, `field_module`, `table_template_module`, `secure_table_provision`, `uuid_module`, `default_ids_module`, `denormalized_table_field`

Additionally, `export-meta.ts` queries `information_schema.columns` to dynamically discover table columns for each table (via `getTableColumns()`).

---

## GraphQL Availability Analysis

The Constructive GraphQL server (PostGraphile v5) auto-generates a GraphQL schema from the exposed Postgres schemas. The schemas exposed are configured per-API via `services_public.api_schemas`.

### Tables accessible via GraphQL

All tables in these schemas are exposed through PostGraphile and will have auto-generated GraphQL queries:

- `metaschema_public.*` — All 18+ tables
- `services_public.*` — All 10+ tables
- `metaschema_modules_public.*` — All 25+ modules tables

For each table, PostGraphile generates:
- `all<TableName>s` (connection query with filtering, pagination)
- `<tableName>ById` (single-row lookup by primary key)

For example, `metaschema_public.schema` becomes:
```graphql
query {
  allSchemas(condition: { databaseId: "..." }) {
    nodes {
      id
      databaseId
      name
      schemaName
      description
      isPublic
    }
  }
}
```

### Tables/queries NOT accessible via GraphQL

| Query | Why | Mitigation |
|-------|-----|------------|
| `pg_catalog.pg_database` | System catalog, never exposed | Not needed — in GraphQL mode the user already knows their database |
| `db_migrate.sql_actions` | Internal migration schema, not in exposed schemas | **Blocker** — see below |
| `information_schema.columns` | System schema, never exposed | Not needed — field metadata already lives in `metaschema_public.field` |

### Blocker: `db_migrate.sql_actions`

The `db_migrate.sql_actions` table contains the actual migration SQL that was generated. This is the core data for the database-schema portion of the export. This table lives in the `db_migrate` schema which is **not** exposed via GraphQL.

**Options:**

1. **Expose `db_migrate` schema via a dedicated admin API** — Add it as an optional schema in the API configuration (requires server-side change)
2. **Create a custom GraphQL query/mutation** — A Graphile plugin that adds a `exportSqlActions(databaseId)` query returning the migration data
3. **Split the export** — Only export metadata via GraphQL (the meta portion), skip the migration SQL portion. The metadata export is the larger and more complex part anyway.
4. **Provide a REST endpoint** — Add a `/api/export/sql-actions` REST route that returns this data

**Recommended:** Option 3 initially (metadata-only export via GraphQL), with Option 2 as a follow-up to support full export.

---

## Proposed Architecture

### Data Source Abstraction

Create an `ExportDataSource` interface that abstracts how data is fetched. The existing SQL path becomes one implementation; the new GraphQL path becomes another.

#### Interface

```typescript
// pgpm/core/src/export/data-source.ts

export interface ExportDataSource {
  /** Fetch all rows from a metaschema/services/modules table filtered by database_id */
  fetchTable(schema: string, table: string, databaseId: string): Promise<Record<string, unknown>[]>;

  /** Fetch the database record by id */
  fetchDatabase(databaseId: string): Promise<Record<string, unknown> | null>;

  /** Fetch schemas for a database */
  fetchSchemas(databaseId: string): Promise<Record<string, unknown>[]>;

  /** Fetch migration SQL actions (may not be available in GraphQL mode) */
  fetchSqlActions?(databaseId: string): Promise<Record<string, unknown>[]>;

  /** List available databases (for interactive selection) */
  listDatabases?(): Promise<{ id: string; name: string }[]>;

  /** Clean up connections */
  close(): Promise<void>;
}
```

#### SQL Implementation (existing behavior)

```typescript
// pgpm/core/src/export/data-source-sql.ts

export class SqlDataSource implements ExportDataSource {
  constructor(private pool: Pool) {}

  async fetchTable(schema: string, table: string, databaseId: string) {
    const result = await this.pool.query(
      `SELECT * FROM ${schema}.${table} WHERE database_id = $1`,
      [databaseId]
    );
    return result.rows;
  }
  // ... etc
}
```

#### GraphQL Implementation (new)

```typescript
// pgpm/core/src/export/data-source-graphql.ts

export class GraphQLDataSource implements ExportDataSource {
  constructor(
    private endpoint: string,
    private token?: string
  ) {}

  async fetchTable(schema: string, table: string, databaseId: string) {
    // Build GraphQL query using PostGraphile naming conventions:
    // schema: metaschema_public, table: field
    //   => allFields(condition: { databaseId: "..." }) { nodes { ... } }
    const queryName = toGraphQLCollectionName(schema, table);
    const query = buildAllNodesQuery(queryName, databaseId);
    const result = await this.executeQuery(query);
    return extractNodes(result, queryName);
  }
  // ... etc
}
```

### Naming Convention Mapping

PostGraphile transforms Postgres names to GraphQL names using inflection. The mapping follows:

| Postgres | GraphQL Query | GraphQL Type |
|----------|--------------|--------------|
| `metaschema_public.database` | `allDatabases` | `Database` |
| `metaschema_public.schema` | `allSchemas` | `Schema` |
| `metaschema_public.table` | `allTables` | `Table` |
| `metaschema_public.field` | `allFields` | `Field` |
| `metaschema_public.foreign_key_constraint` | `allForeignKeyConstraints` | `ForeignKeyConstraint` |
| `services_public.domains` | `allDomains` | `Domain` |
| `services_public.apis` | `allApis` | `Api` |
| `metaschema_modules_public.rls_module` | `allRlsModules` | `RlsModule` |

Column names: `database_id` => `databaseId`, `schema_name` => `schemaName`, etc.

**Important:** The actual inflection is controlled by `graphile-settings` (specifically the `InflektPreset`). The developer should use **GraphQL introspection** at runtime to discover the exact names rather than hardcoding them. The existing `QueryBuilder` in `graphql/query` already handles this.

---

## Files to Create / Modify

### New Files

| File | Purpose |
|------|---------|
| `pgpm/core/src/export/data-source.ts` | `ExportDataSource` interface definition |
| `pgpm/core/src/export/data-source-sql.ts` | SQL implementation (refactor existing code) |
| `pgpm/core/src/export/data-source-graphql.ts` | GraphQL implementation (new) |
| `pgpm/core/src/export/graphql-naming.ts` | PostGraphile naming convention helpers (postgres name => GraphQL query/field names) |
| `pgpm/cli/src/commands/export.ts` | Modify to accept `--graphql-endpoint` and `--token` flags |

### Files to Modify

| File | Change |
|------|--------|
| `pgpm/core/src/export/export-migrations.ts` | Refactor `exportMigrationsToDisk` to accept `ExportDataSource` instead of using `pg-cache` directly |
| `pgpm/core/src/export/export-meta.ts` | Refactor `exportMeta` to accept `ExportDataSource` instead of using `pg-cache` directly. The `queryAndParse` helper should use `dataSource.fetchTable()` instead of `pool.query()` |
| `pgpm/cli/src/commands/export.ts` | Add `--graphql-endpoint` / `--token` CLI flags; construct `GraphQLDataSource` when endpoint is provided, `SqlDataSource` otherwise |

### Existing Packages to Leverage

| Package | What to Use |
|---------|-------------|
| `graphql/query` (`@constructive-io/graphql-query`) | `QueryBuilder` for building GraphQL AST queries; `MetaObject` types |
| `graphql/query/src/executor.ts` | `QueryExecutor` for local execution (if connecting via connection string rather than HTTP endpoint) |
| `graphql` (v16) | `print()` for serializing DocumentNode to string; `parse()` for parsing responses |

---

## Implementation Phases

### Phase 1: Data Source Abstraction

1. Define the `ExportDataSource` interface in `pgpm/core/src/export/data-source.ts`
2. Create `SqlDataSource` that wraps the existing `pg` pool logic
3. Refactor `exportMeta()` to accept a data source instead of pool options
4. Refactor `exportMigrationsToDisk()` similarly
5. Verify existing SQL export still works identically (no behavior change)

### Phase 2: GraphQL Data Source

1. Create `GraphQLDataSource` class
2. Implement `fetchTable()` — builds a GraphQL `allXxx(condition: { databaseId: "..." }) { nodes { ... } }` query and executes it via HTTP POST to the endpoint
3. Implement `fetchDatabase()` and `fetchSchemas()` as specific instances of `fetchTable()`
4. Handle authentication (Bearer token in `Authorization` header)
5. Handle pagination — PostGraphile uses cursor-based pagination; the implementation must page through all results if there are more than the default page size

### Phase 3: CLI Integration

1. Add `--graphql-endpoint <url>` and `--token <token>` flags to the export command
2. When `--graphql-endpoint` is provided:
   - Skip the `pg_catalog.pg_database` query (not available)
   - Fetch databases from `metaschema_public.database` via GraphQL instead
   - Construct `GraphQLDataSource` and pass it through to the core
3. When no endpoint is provided, use `SqlDataSource` (existing behavior)
4. Handle the `db_migrate.sql_actions` gap — in GraphQL mode, only export metadata (skip the database migration portion), or error with a helpful message

### Phase 4: Field Discovery

The current `export-meta.ts` uses `information_schema.columns` to dynamically discover which columns exist in each table. In GraphQL mode, this information is not directly available. Options:

1. **Use GraphQL introspection** — Query the GraphQL schema's `__type` for each type to discover available fields. This is the cleanest approach.
2. **Use the `config` map** — The hardcoded `config` in `export-meta.ts` already lists expected fields per table. In GraphQL mode, these can be cross-referenced with introspection results.

**Recommended:** Use GraphQL introspection (`__schema` / `__type` queries) to discover fields, then map them back to Postgres column names using reverse inflection.

---

## Key Design Decisions

### 1. HTTP vs Direct Execution

Two modes of GraphQL execution should be supported:

- **HTTP mode** (primary): POST queries to a remote GraphQL endpoint. This is what customers will use.
- **Local mode** (optional): Use `QueryExecutor` from `graphql/query` to execute queries directly against a local database via PostGraphile. This could be useful for development/testing.

### 2. Pagination Strategy

PostGraphile uses Relay-style cursor pagination. The `GraphQLDataSource.fetchTable()` must handle tables with many rows by paginating:

```graphql
query {
  allFields(condition: { databaseId: "..." }, first: 100, after: "cursor...") {
    nodes { ... }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Loop until `hasNextPage` is false.

### 3. Column Name Translation

GraphQL field names are camelCase (`databaseId`), but the `csv-to-pg` Parser and the rest of the export pipeline expect snake_case Postgres column names (`database_id`). The GraphQL data source must translate response keys back to snake_case before returning rows.

### 4. Authentication

The GraphQL endpoint requires authentication. The export command should accept:
- `--token <jwt>` — A JWT token passed as `Authorization: Bearer <token>`
- The token must have sufficient privileges to read from `metaschema_public`, `services_public`, and `metaschema_modules_public` schemas

---

## Testing Strategy

1. **Unit tests**: Mock the `ExportDataSource` interface and verify `exportMeta`/`exportMigrations` work with both implementations
2. **Integration tests**: Stand up a local GraphQL server, run the GraphQL export against it, compare output to SQL export output — they should be identical
3. **E2E test**: Run `pgpm export --graphql-endpoint http://localhost:5678/graphql` against a running dev server

---

## Open Questions

1. **Should `db_migrate.sql_actions` be exposed via GraphQL?** If so, this requires a server-side change (adding `db_migrate` to the exposed schemas or creating a custom Graphile plugin). Without this, GraphQL export can only produce the metadata/service portion, not the database-schema migration SQL.
2. **Should the GraphQL export produce the same output format?** The SQL export produces pgpm plan files + deploy/revert/verify SQL files. The metadata-only export is a subset of this.
3. **Should we support introspection-based field discovery or rely on the hardcoded config map?** Introspection is cleaner but adds complexity; the config map is already maintained.

---

## Summary

| What | Where |
|------|-------|
| New interface | `pgpm/core/src/export/data-source.ts` |
| SQL adapter (refactor) | `pgpm/core/src/export/data-source-sql.ts` |
| GraphQL adapter (new) | `pgpm/core/src/export/data-source-graphql.ts` |
| Naming helpers | `pgpm/core/src/export/graphql-naming.ts` |
| CLI changes | `pgpm/cli/src/commands/export.ts` |
| Core refactors | `pgpm/core/src/export/export-meta.ts`, `pgpm/core/src/export/export-migrations.ts` |
| Leverage | `graphql/query` (QueryBuilder), `graphql` v16 (print/parse) |
