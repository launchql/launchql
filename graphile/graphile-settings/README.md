# graphile-settings

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-settings">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-settings%2Fpackage.json"/>
  </a>
</p>

A batteries-included configuration builder for [PostGraphile v5](https://www.graphile.org/postgraphile/), purpose-built for the Constructive ecosystem. It centralizes plugin setup, schema wiring, and feature flags into a single, composable interface — enabling consistent, high-performance GraphQL APIs across projects.

## Installation

```bash
npm install graphile-settings
```

## Quick Start

```typescript
import { ConstructivePreset, makePgService } from 'graphile-settings';
import { postgraphile } from 'postgraphile';
import { grafserv } from 'grafserv/express/v4';
import express from 'express';

const app = express();

const preset = {
  extends: [ConstructivePreset],
  pgServices: [
    makePgService({
      connectionString: 'postgres://user:pass@localhost/mydb',
      schemas: ['app_public'],
    }),
  ],
};

const pgl = postgraphile(preset);
const serv = pgl.createServ(grafserv);

const httpServer = require('http').createServer(app);
serv.addTo(app, httpServer);
httpServer.listen(5000);
```

## Features

The `ConstructivePreset` combines multiple plugins and configurations to provide a clean, opinionated GraphQL API. Below is a detailed breakdown of each feature.

### No Node/Relay Features (MinimalPreset)

PostGraphile v5 includes Relay Global Object Identification by default, which adds a global `id` field to types and renames actual `id` columns to `rowId`. Since Constructive uses UUIDs, we disable all Node/Relay plugins to keep `id` columns as `id`.

Disabled plugins: `NodePlugin`, `AddNodeInterfaceToSuitableTypesPlugin`, `NodeIdCodecBase64JSONPlugin`, `NodeIdCodecPipeStringPlugin`, `RegisterQueryNodePlugin`, `NodeAccessorPlugin`, `PgNodeIdAttributesPlugin`, `PgTableNodePlugin`

### Custom Inflection (InflektPreset)

Uses the `inflekt` library for consistent naming conventions with proper Latin plural handling (e.g., "schemata" → "schema" instead of "schematum"). Key simplifications include simplified root query fields (`allUsers` → `users`), simplified relation fields (`userByAuthorId` → `author`, `postsByAuthorId` → `posts`), simplified many-to-many fields (`tagsByPostTagPostIdAndTagId` → `tags`), and shortened mutation names (`updateUserById` → `updateUser`).

The many-to-many inflector includes conflict detection — if a direct relation to the same target table exists or there are multiple many-to-many relations to the same target, it falls back to verbose naming to avoid conflicts.

### Connection Filter Plugin

Adds powerful filtering capabilities to connections with operators like `eq`, `ne`, `lt`, `gt`, `contains`, `startsWith`, etc. Configuration includes logical operators (`and`, `or`, `not`) enabled for combining conditions, array filtering enabled for PostgreSQL array columns, computed column filtering disabled by default (enable with `@filterable` smart tag), setof function filtering disabled by default, and relation filtering disabled to keep the API surface clean.

### Filter All Columns (EnableAllFilterColumnsPreset)

By default, PostGraphile v5 only allows filtering on indexed columns. This preset enables filtering on ALL columns, giving developers flexibility while leaving index optimization to DBAs. Monitor query performance and add indexes as needed for frequently filtered columns.

### Many-to-Many Relationships (ManyToManyOptInPreset)

Uses `@graphile-contrib/pg-many-to-many` with opt-in behavior. By default, no many-to-many fields are generated. To enable for a specific junction table:

```sql
COMMENT ON TABLE post_tags IS E'@behavior +manyToMany';
```

This prevents API bloat from unused junction table fields.

### Primary Key Only Lookups (NoUniqueLookupPreset)

Disables non-primary-key unique constraint lookups for both queries and mutations. Instead of generating `user(id)`, `userByEmail(email)`, `userByUsername(username)`, only `user(id)` is generated. The same operations can be done using filters, reducing API surface and generated code complexity.

### Meta Schema Plugin (MetaSchemaPreset)

Exposes a `_meta` GraphQL query for database schema introspection:

```graphql
query {
  _meta {
    tables {
      name
      schemaName
      fields { name, type { pgType, gqlType, isArray }, isNotNull, hasDefault }
      indexes { name, isUnique, isPrimary, columns }
      constraints { primaryKey, unique, foreignKey }
      inflection { tableType, allRows, connection, edge }
      query { all, one, create, update, delete }
    }
  }
}
```

Useful for code generation tools that need to understand the database structure.

Testing strategy:
- Metadata behavior is tested in-process with mocked PostGraphile build resources (no live DB required).
- Snapshot coverage captures full multi-table metadata scenarios and query contract shape.
- Run: `pnpm --filter graphile-settings exec jest --runInBand`

### Tsvector Codec (TsvectorCodecPreset)

Adds support for PostgreSQL's `tsvector` and `tsquery` types used in full-text search. These types are represented as strings in GraphQL.

### Conflict Detector (ConflictDetectorPreset)

Detects naming conflicts between tables in different schemas. When two tables would have the same GraphQL type name, logs a warning with resolution options (smart tags, rename, or omit).

### Inflector Logger (InflectorLoggerPreset)

Logs inflector calls during schema build for debugging. Enable with `INFLECTOR_LOG=1` environment variable. Only runs at build time, not on every request.

## Presets

| Preset | Description |
|--------|-------------|
| `ConstructivePreset` | Main preset combining all features (recommended) |
| `MinimalPreset` | PostGraphile without Node/Relay features |
| `InflektPreset` | Custom inflection using inflekt library |
| `ConflictDetectorPreset` | Warns about naming conflicts between schemas |
| `InflectorLoggerPreset` | Debug logging for inflector calls |
| `EnableAllFilterColumnsPreset` | Allow filtering on all columns |
| `ManyToManyOptInPreset` | Many-to-many with opt-in behavior |
| `NoUniqueLookupPreset` | Disable non-primary-key lookups |
| `MetaSchemaPreset` | `_meta` query for schema introspection |
| `TsvectorCodecPreset` | Support for tsvector/tsquery types |

## Plugins

Each preset includes one or more plugins that can be used individually:

| Plugin | Description |
|--------|-------------|
| `InflektPlugin` | Custom inflection rules |
| `ConflictDetectorPlugin` | Naming conflict detection |
| `InflectorLoggerPlugin` | Debug logging |
| `EnableAllFilterColumnsPlugin` | Enable all column filters |
| `ManyToManyOptInPlugin` | Opt-in many-to-many behavior |
| `PrimaryKeyOnlyPlugin` | Keep only primary key lookups |
| `NoUniqueLookupPlugin` | Disable all unique lookups |
| `MetaSchemaPlugin` | Schema introspection |
| `TsvectorCodecPlugin` | Tsvector type support |

## Building Schema Directly

For codegen, testing, or other use cases where you need the schema without a server:

```typescript
import { ConstructivePreset, makePgService } from 'graphile-settings';
import { makeSchema } from 'graphile-build';
import { printSchema } from 'graphql';

const preset = {
  extends: [ConstructivePreset],
  pgServices: [
    makePgService({
      connectionString: 'postgres://user:pass@localhost/mydb',
      schemas: ['app_public'],
    }),
  ],
};

const { schema } = await makeSchema(preset);
const sdl = printSchema(schema);
```

## Opt-in Scoped Introspection

`ConstructivePreset` and `makePgService` retain PostGraphile's upstream
introspection behavior. Applications that explicitly opt into schema-scoped
introspection add the independently owned replacement preset and configure the
service by name in the Graphile gather options:

```typescript
import { ScopedIntrospectionPreset } from 'graphile-scoped-introspection';
import { ConstructivePreset, makePgService } from 'graphile-settings';

const preset = {
  extends: [ConstructivePreset, ScopedIntrospectionPreset],
  gather: {
    pgScopedIntrospection: {
      main: true,
    },
  },
  pgServices: [
    makePgService({
      connectionString: 'postgres://user:pass@localhost/mydb',
      schemas: ['app_public'],
    }),
  ],
};
```

Use an options object when a service needs a specific catalog policy or
extension capability:

```typescript
const preset = {
  extends: [ConstructivePreset, ScopedIntrospectionPreset],
  gather: {
    pgScopedIntrospection: {
      main: {
        catalogTypes: 'dependency-closure',
        capabilityExtensions: ['pg_trgm'],
      },
    },
  },
};
```

The map is keyed by the final PostgreSQL service name. `true` enables scoped
defaults, `false` keeps stock introspection, and an omitted service keeps stock
introspection. The Constructive GraphQL server always installs the scoped
preset for its `main` service and accepts the same options under
`graphile.preset.gather`; it rejects `main: false`.

## Smart Tags Reference

Control schema generation with PostgreSQL comments:

```sql
-- Enable many-to-many on a junction table
COMMENT ON TABLE post_tags IS E'@behavior +manyToMany';

-- Customize many-to-many field name
COMMENT ON CONSTRAINT post_tags_tag_id_fkey ON post_tags IS E'@manyToManyFieldName tags';

-- Rename a type
COMMENT ON TABLE users IS E'@name Person';

-- Omit a table from the schema
COMMENT ON TABLE internal_logs IS E'@omit';

-- Make a computed column filterable
COMMENT ON FUNCTION full_name(users) IS E'@filterable';
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `INFLECTOR_LOG=1` | Enable inflector debug logging |
