# graphile-meta

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-meta"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-meta%2Fpackage.json"/></a>
</p>

PostGraphile v5 plugin exposing a single `_meta` root query that describes each table exposed by the final GraphQL schema, including fields, indexes, constraints, relations, inflection names, root query/mutation names, and smart-tag-derived metadata (storage, search, i18n, realtime).

## Overview

Standard GraphQL introspection tells you about the GraphQL schema — `_meta` adds the **database identities** behind its exposed objects. `MetaSchemaPlugin` reconciles the PostGraphile registry with the final executable schema and caches a `TableMeta` entry per exposed table, covering:

- **Tables and fields** — exact PostgreSQL names alongside final GraphQL names, plus Postgres type, GraphQL type, nullability, defaults, primary/foreign key flags, and scalar encoding hints (how to serialize bigints, datetimes, vectors, geojson, …)
- **Form metadata** — allowed values from CHECK constraints, whether the create input requires a field, which fields create and update accept, and whether a table is a junction
- **Indexes & constraints** — primary key, unique constraints, foreign keys with referenced tables
- **Relations** — `belongsTo`, `hasOne`, `hasMany`, and `manyToMany` with the exact generated field names
- **Inflection** — the type names and root field names PostGraphile generated (`tableType`, `allRows`, `connection`, `createInputType`, …)
- **Root operations** — the query/mutation names for `all`, `one`, `create`, `update`, `delete`
- **Feature metadata from smart tags** — `storage` (`@storageFiles` / `@storageBuckets`), `search` (tsvector/BM25/pg_trgm/pgvector columns), `i18n` (translation tables and translatable fields), and `realtime` (subscription field names)

The first `_meta` execution reconciles metadata against that request's final schema; subsequent requests for the same schema return the cached result. Schema construction also seeds the legacy metadata cache for existing codegen consumers.

## Why it exists: dynamic queries

`_meta` exists to power **dynamic queries** with [`@constructive-io/graphql-query`](https://github.com/constructive-io/constructive/tree/main/graphql/query): clients introspect `_meta` at runtime and build queries/mutations on the fly — no generated code, no build step. It is also the backbone of [`@constructive-io/graphql-codegen`](https://github.com/constructive-io/constructive/tree/main/graphql/codegen), which uses `_meta` to generate typed ORMs, React Query hooks, and CLIs.

## Usage

Extend your preset with `MetaSchemaPreset` (already included in `ConstructivePreset` from `graphile-settings`):

```typescript
import { MetaSchemaPreset } from 'graphile-meta';

const preset: GraphileConfig.Preset = {
  extends: [MetaSchemaPreset],
};
```

### Querying `_meta`

```graphql
query {
  _meta {
    tables {
      name
      tableName
      schemaName
      fields {
        name
        columnName
        type { pgType gqlType isArray }
        isNotNull
        hasDefault
        isPrimaryKey
        isForeignKey
        allowedValues
        isRequiredOnCreate
        isWritableOnCreate
        isWritableOnUpdate
      }
      isJunction
      indexes { name isUnique isPrimary columns }
      constraints {
        primaryKey { name }
        unique { name }
        foreignKey { name referencedTable }
      }
      relations {
        belongsTo { fieldName references { name } }
        hasMany { fieldName referencedBy { name } }
        manyToMany { fieldName rightTable { name } }
      }
      inflection { tableType allRows connection edge createInputType }
      query { all one create update delete }
      storage { isFilesTable isBucketsTable }
      search { algorithms columns { name algorithm } hasUnifiedSearch }
      i18n { translationTable translatableFields { name type } }
      realtime { subscriptionFieldName }
    }
  }
}
```

Example response snippet:

```json
{
  "_meta": {
    "tables": [
      {
        "name": "User",
        "tableName": "users",
        "schemaName": "app_public",
        "fields": [
          { "name": "id", "columnName": "id", "type": { "pgType": "uuid", "gqlType": "UUID", "isArray": false }, "isNotNull": true, "hasDefault": true, "isPrimaryKey": true, "isForeignKey": false },
          { "name": "displayName", "columnName": "display_name", "type": { "pgType": "text", "gqlType": "String", "isArray": false }, "isNotNull": true, "hasDefault": false, "isPrimaryKey": false, "isForeignKey": false }
        ],
        "inflection": { "tableType": "User", "allRows": "users", "connection": "UserConnection" },
        "query": { "all": "users", "one": null, "create": "createUser", "update": "updateUser", "delete": "deleteUser" }
      }
    ]
  }
}
```

`name` and `fields.name` are final GraphQL names. `tableName` and
`fields.columnName` preserve the corresponding PostgreSQL identifiers. An
operation under `query` is `null` when that field was not emitted in the final
GraphQL schema.

### Form metadata

These fields let a generic client build correct create and edit forms from `_meta` alone. Their GraphQL descriptions are public copy that says only what a client may rely on; the rules below are how the values are derived.

These form fields only describe what the final schema exposes: a column hidden from the API (no select behavior, or no field on the table's type) and a table without an output type contribute nothing to them, so none of their values hints that hidden columns or tables exist. That holds for these fields only. The older metadata (indexes, constraints, foreign keys and scope) isn't filtered by visibility, so it can still name columns or tables the API hides.

- **`MetaField.allowedValues`** lists the values that simple single-column CHECK constraints permit on a text, varchar or char column: `col IN ('a', 'b')`, `col = ANY (ARRAY['a', 'b'])`, `col = ANY ('{a,b}'::text[])` and `col = 'a' OR col = 'b'`. It's read at gather time from the constraint expressions introspection already carries, so `_meta` runs no extra query, and only the values are reported, never the constraint's name or expression. Several simple constraints on one column intersect. When any other single-column CHECK on the column can't be read that way, it may reject listed values too, so the field is `null`; it's also `null` when no simple constraint applies.
- **`MetaField.isRequiredOnCreate`** is true when the field is non-null in the table's create input type, so a create must supply it. The record input is found by its inflected name (`tableFieldName`, and `patchField` of it for updates), never by guessing among the input's fields; when it can't be found the flags are `null`. It follows the input PostGraphile actually built rather than `NOT NULL`: a column a trigger fills (`@behavior -insert`) or one with a default is `NOT NULL` but not required.
- **`MetaField.isWritableOnCreate` / `isWritableOnUpdate`** say whether the create input and the patch type have the field.

  These four are set on the fields under `MetaTable.fields` and are `null` on the fields nested in indexes, constraints and relations.
- **Detected many-to-many relations.** A table is a detected junction when its exposed non-system columns are exactly the local columns of two foreign keys whose relations have the select behavior. A column is a system column when a client never picks its value in a form:
  1. it's a surrogate key: in the primary key and in no foreign key (a primary key made of the two foreign keys is the classic junction);
  2. it has a default, which covers generated ids, `owner_id DEFAULT current_user_id()` and `created_at`/`updated_at DEFAULT now()`;
  3. the create input can't set it (`@behavior -insert`);
  4. it's the table's `@scope` key column.

  Foreign keys on system columns, such as `owner_id` referencing users, don't count. A timestamp with no default that clients write (e.g. `checked_in_at`) is data, so a table carrying one isn't a junction. A detected junction adds a `relations.manyToMany` entry to each of the two tables it links, even when the many-to-many plugin doesn't create one, but only when the junction has its create mutation and the junction, both linked tables and every key column on either side are exposed. Both constraints in the entry are the junction's own foreign keys, so it never depends on, or names, a backward relation the API hides (Constructive's preset hides them unless a table opts into many-to-many). `fieldName` and `type` are `null` when the final schema has no field for the relation.
- **`MetaTable.isJunction`** is true exactly when a reported `manyToMany` relation, declared by the many-to-many plugin or detected, names the table as its junction.

### Pairing with @constructive-io/graphql-query

```typescript
import { convertFromMetaSchema, validateMetaObject } from '@constructive-io/graphql-query';

// Fetch the _meta query result once at runtime, convert it to a meta object,
// then drive dynamic query/mutation generation from it
const metaObject = convertFromMetaSchema(metaQueryResult);
const { valid } = validateMetaObject(metaObject);
```

## Exports

| Export | Description |
|--------|-------------|
| `MetaSchemaPlugin` | The plugin (default export too) |
| `MetaSchemaPreset` | Preset wrapping the plugin |
| `TableMeta`, `FieldMeta`, `TypeMeta`, `IndexMeta`, `ConstraintsMeta`, `RelationsMeta`, `InflectionMeta`, `QueryMeta`, … | Type contracts for the `_meta` payload |

## Related

- [`graphile-settings`](https://github.com/constructive-io/constructive/tree/main/graphile/graphile-settings) — re-exports this plugin as part of `ConstructivePreset`
- [`@constructive-io/graphql-query`](https://github.com/constructive-io/constructive/tree/main/graphql/query) — runtime dynamic query building driven by `_meta`
- [`@constructive-io/graphql-codegen`](https://github.com/constructive-io/constructive/tree/main/graphql/codegen) — code generation driven by `_meta`
