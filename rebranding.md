# LaunchQL Rebranding Strategy

This document outlines the comprehensive plan to rebrand the database/migration tooling in the LaunchQL monorepo to **PGPM** (PostgreSQL Package Manager), while keeping GraphQL/server functionality under the **LaunchQL** brand.

## Executive Summary

The rebranding splits the ecosystem into:

1. **PGPM** (`@pgpm/*` for SQL packages, `@pgpmjs/*` for JS/TS packages) - Database deployment, migrations, schema change management
2. **LaunchQL** (`@launchql/*`) - GraphQL server, explorer, client, and codegen tools (unchanged)
3. **Standalone Utilities** - Generic packages that remain unscoped (e.g., `pgsql-test`, `pg-cache`)

## Naming Conventions

### PGPM (Database/Migration)

- **NPM Scope for JS/TS**: `@pgpmjs/*`
- **SQL Package Scope**: `@pgpm/*`
- **Class Prefix**: `Pgpm` (PascalCase, not all-caps)
- **Examples**: `PgpmPackage`, `PgpmMigrate`, `PgpmOptions`

### LaunchQL (GraphQL/Server)

- **NPM Scope**: `@launchql/*` (unchanged)
- **Class Prefix**: `LaunchQL` (unchanged)
- **Examples**: `LaunchQLServer`, `LaunchQLExplorer`, `LaunchQLApiToken`

### Standalone Utilities

- **No scope** - Keep existing neutral names
- **Examples**: `pgsql-test`, `pg-cache`, `pg-env`, `introspectron`

---

## Package Renaming Matrix

### Category A: PGPM Packages (Database/Migration)

These packages form the core of the database deployment and migration system.

| Current Package | New Package | Category | Rationale |
|-----------------|-------------|----------|-----------|
| `@launchql/core` | `@pgpmjs/core` | PGPM | Core migration engine, plan parsing, deployment orchestration |
| `@launchql/env` | `@pgpmjs/env` | PGPM | Environment configuration for DB operations |
| `@launchql/types` | `@pgpmjs/types` | PGPM | Shared types used primarily by migration system |
| `@launchql/logger` | `@pgpmjs/logger` | PGPM | Logging utilities for CLI and core |
| `@launchql/templatizer` | `@pgpmjs/templatizer` | PGPM | Template generation for SQL files |
| `@launchql/server-utils` | `@pgpmjs/server-utils` | PGPM | HTTP utilities used by core infrastructure |
| `@launchql/client` | `@pgpmjs/client` | PGPM | PostgreSQL client wrapper (pure `pg` wrapper, no GraphQL) |
| `@launchql/orm` | `@pgpmjs/orm` | PGPM | PostgreSQL ORM (pure `pg` dependency, no GraphQL) |
| `pgpm` | `pgpm` | PGPM | CLI - no change needed |

### Category B: LaunchQL Packages (GraphQL/Server) - No Renaming

These packages handle GraphQL API generation, server functionality, and client-side tooling. They remain under the LaunchQL brand.

| Current Package | New Package | Category | Rationale |
|-----------------|-------------|----------|-----------|
| `@launchql/server` | `@launchql/server` | LaunchQL | GraphQL API server with PostGraphile |
| `@launchql/explorer` | `@launchql/explorer` | LaunchQL | GraphiQL UI interface |
| `@launchql/cli` | `@launchql/cli` | LaunchQL | Unified CLI (wraps pgpm + adds server commands) |
| `@launchql/codegen` | `@launchql/codegen` | LaunchQL | GraphQL query/mutation generator |
| `@launchql/query` | `@launchql/query` | LaunchQL | GraphQL query builder (uses `graphql`, `gql-ast`) |
| `@launchql/query-builder` | `@launchql/query-builder` | LaunchQL | Query builder utilities |
| `@launchql/react` | `@launchql/react` | LaunchQL | React hooks for GraphQL |
| `launchql-test` | `launchql-test` | LaunchQL | GraphQL testing with all plugins loaded |

### Category C: LaunchQL Utilities (Server/CDN Support) - No Renaming

These utilities primarily support the GraphQL server and API layer.

| Current Package | New Package | Category | Rationale |
|-----------------|-------------|----------|-----------|
| `@launchql/s3-streamer` | `@launchql/s3-streamer` | LaunchQL | S3 file upload streaming for API |
| `@launchql/s3-utils` | `@launchql/s3-utils` | LaunchQL | S3 utilities for file storage |
| `@launchql/upload-names` | `@launchql/upload-names` | LaunchQL | Upload naming for file uploads |
| `@launchql/url-domains` | `@launchql/url-domains` | LaunchQL | URL domain handling for API |
| `@launchql/content-type-stream` | `@launchql/content-type-stream` | LaunchQL | Content type detection for uploads |

### Category D: Standalone Utilities (No Rebranding Needed)

These packages already have neutral names and don't require renaming.

| Package | Status | Notes |
|---------|--------|-------|
| `pgsql-test` | Keep as-is | PostgreSQL test framework |
| `supabase-test` | Keep as-is | Supabase test utilities |
| `drizzle-orm-test` | Keep as-is | Drizzle ORM test utilities |
| `pg-codegen` | Keep as-is | TypeScript type generator |
| `pg-cache` | Keep as-is | Connection pool manager |
| `pg-env` | Keep as-is | PostgreSQL environment config |
| `pg-ast` | Keep as-is | PostgreSQL AST utilities |
| `pg-query-context` | Keep as-is | Query context utilities |
| `introspectron` | Keep as-is | Schema introspection |
| `gql-ast` | Keep as-is | GraphQL AST utilities |
| `etag-hash` | Keep as-is | ETag hash utilities |
| `etag-stream` | Keep as-is | ETag stream utilities |
| `stream-to-etag` | Keep as-is | Stream to ETag conversion |
| `uuid-hash` | Keep as-is | UUID hash utilities |
| `uuid-stream` | Keep as-is | UUID stream utilities |
| `mime-bytes` | Keep as-is | MIME type detection |

### Category E: Graphile Plugins (No Package Renaming)

These packages are already correctly branded as `graphile-*` and should not be renamed to avoid confusion in the Graphile/PostGraphile ecosystem.

| Package | Status | Notes |
|---------|--------|-------|
| `graphile-settings` | Keep as-is | Update keywords/description only |
| `graphile-cache` | Keep as-is | Update keywords/description only |
| `graphile-query` | Keep as-is | Update keywords/description only |
| `graphile-test` | Keep as-is | Update keywords/description only |
| `graphile-plugin-connection-filter` | Keep as-is | Update keywords/description only |
| `graphile-plugin-fulltext-filter` | Keep as-is | Update keywords/description only |
| `graphile-plugin-connection-filter-postgis` | Keep as-is | Update keywords/description only |
| `graphile-upload-plugin` | Keep as-is | Update keywords/description only |
| `graphile-search-plugin` | Keep as-is | Update keywords/description only |
| `graphile-i18n` | Keep as-is | Update keywords/description only |
| `graphile-postgis` | Keep as-is | Update keywords/description only |
| `graphile-meta-schema` | Keep as-is | Update keywords/description only |
| `graphile-simple-inflector` | Keep as-is | Update keywords/description only |
| `graphile-pg-type-mappings` | Keep as-is | Update keywords/description only |

---

## Class and Type Renames

### PGPM Classes (in `@pgpmjs/core`)

| Current Name | New Name | Location |
|--------------|----------|----------|
| `LaunchQLPackage` | `PgpmPackage` | `packages/core/src/core/class/launchql.ts` |
| `LaunchQLMigrate` | `PgpmMigrate` | `packages/core/src/migrate/client.ts` |
| `LaunchQLInit` | `PgpmInit` | `packages/core/src/init/client.ts` |
| `LaunchQLMigrateOptions` | `PgpmMigrateOptions` | `packages/core/src/migrate/client.ts` |

### PGPM Types (in `@pgpmjs/types`)

| Current Name | New Name | Location |
|--------------|----------|----------|
| `LaunchQLOptions` | `PgpmOptions` | `packages/types/src/launchql.ts` |
| `LaunchQLWorkspaceConfig` | `PgpmWorkspaceConfig` | `packages/types/src/launchql.ts` |
| `LaunchQLError` | `PgpmError` | `packages/types/src/error.ts` |

### LaunchQL Classes (Unchanged)

These classes remain under the LaunchQL namespace:

| Class Name | Location | Notes |
|------------|----------|-------|
| `LaunchQLServer` | `packages/server/src/server.ts` | No change |
| `LaunchQLExplorer` | `packages/explorer/src/server.ts` | No change |
| `LaunchQLAPIToken` | `packages/server/src/middleware/types.ts` | No change |

---

## CLI and Binary Renames

### Current State

| Package | Binary Names |
|---------|--------------|
| `@launchql/cli` | `lql`, `launchql` |
| `pgpm` | `pgpm` |

### Proposed State

| Package | Binary Names | Notes |
|---------|--------------|-------|
| `@launchql/cli` | `lql`, `launchql` | Unchanged - primary CLI for full stack |
| `pgpm` | `pgpm` | Database-only CLI (unchanged) |

---

## Non-Code Branding Updates

### package.json Fields to Update

For PGPM packages only, update these fields:

- `name` - As specified in the renaming matrix
- `description` - Replace "LaunchQL" with "PGPM" where appropriate
- `keywords` - Add "pgpm"/"pgpmjs" as appropriate
- `homepage` - Update once GitHub repo/org is renamed
- `repository.url` - Update once GitHub repo/org is renamed
- `bugs.url` - Update once GitHub repo/org is renamed

### Environment Variables

| Current | New | Notes |
|---------|-----|-------|
| `LAUNCHQL_*` (migration-related) | `PGPM_*` | Only for DB/migration config |
| `LAUNCHQL_*` (server-related) | `LAUNCHQL_*` | Keep as-is for GraphQL/server |

### Config File Names

| Current | New | Notes |
|---------|-----|-------|
| `launchql.yaml` | `pgpm.yaml` | Workspace config for migrations |
| `pgpm.json` | `pgpm.json` | No change needed |
| `pgpm.plan` | `pgpm.plan` | No change needed |

### Documentation Files

- Update README.md files for PGPM packages only
- Update DEVELOPMENT.md
- Update AGENTS.md
- Update any inline code comments referencing "LaunchQL" in migration-related code

---

## File and Directory Renames

### Source Files

| Current Path | New Path |
|--------------|----------|
| `packages/types/src/launchql.ts` | `packages/types/src/pgpm.ts` |
| `packages/core/src/core/class/launchql.ts` | `packages/core/src/core/class/pgpm.ts` |

### Test Fixtures

Search and update any test fixtures that reference "launchql" in file names or content (migration-related only).

---

## Breaking Changes and Migration

### Semantic Versioning

This rebrand constitutes a **major version bump** for affected PGPM packages due to:

1. Package name changes (import paths change)
2. Exported symbol renames (class/type names change)

LaunchQL packages (GraphQL/server) are NOT affected.

### Backward Compatibility Strategy

For a smoother migration, consider:

1. **Re-exports with deprecation warnings**:
   ```typescript
   // In @pgpmjs/core
   /** @deprecated Use PgpmPackage instead */
   export { PgpmPackage as LaunchQLPackage } from './core/class/pgpm';
   ```

2. **Documentation**: Provide clear migration guide for consumers

---

## Implementation Phases

### Phase 1: Preparation

- [ ] Verify npm scope availability (`@pgpm` for SQL, `@pgpmjs` for JS/TS)
- [ ] Create migration guide documentation
- [ ] Set up CI/CD for new package names

### Phase 2: Code Changes

- [ ] Rename PGPM classes and types
- [ ] Update import statements across all packages
- [ ] Rename source files
- [ ] Update package.json files for PGPM packages
- [ ] Add backward-compatible re-exports

### Phase 3: Package Publishing

- [ ] Publish new PGPM packages under new names
- [ ] Deprecate old PGPM packages on npm with pointer to new names
- [ ] Update GitHub repository name/organization (if applicable)

### Phase 4: Cleanup

- [ ] Remove deprecated re-exports (next major version)
- [ ] Archive old npm packages

---

## Summary Statistics

| Category | Package Count |
|----------|---------------|
| PGPM Packages (JS/TS) | 9 |
| LaunchQL Packages (unchanged) | 13 |
| Standalone Utilities | 16 |
| Graphile Plugins | 14 |
| **Total** | **52** |

| Change Type | Count |
|-------------|-------|
| Package renames | 9 |
| Class/type renames | 7 |
| Binary renames | 0 |
| Packages unchanged | 43 |

---

## Open Questions for User Decision

1. **NPM Scope Availability**: Have `@pgpm` (SQL) and `@pgpmjs` (JS/TS) scopes been secured on npm?

2. **GitHub Organization**: Will the GitHub org/repo be renamed? If so, to what?

3. **Shared Dependencies**: How should packages like `@launchql/types` be handled if they're used by both PGPM and LaunchQL packages? Consider splitting into `@pgpmjs/types` and `@launchql/types`.

---

## Appendix: Files Containing "LaunchQL" References

The following file types need to be searched and updated (for PGPM packages only):

```bash
# TypeScript/JavaScript files in core/migration packages
rg -l "LaunchQL|launchql" --type ts --type js packages/core packages/types packages/env

# Package.json files for PGPM packages
rg -l "launchql" -g "package.json" packages/core packages/types packages/env packages/logger packages/templatizer packages/server-utils packages/client packages/orm

# Markdown documentation
rg -l "LaunchQL|launchql" --type md packages/core packages/types
```

Key files identified for PGPM rebranding:
- `packages/core/src/core/class/launchql.ts` - Main class definitions
- `packages/types/src/launchql.ts` - Type definitions
- `packages/types/src/error.ts` - Error class
- `packages/env/src/*.ts` - Environment configuration
- All `package.json` files in PGPM packages
