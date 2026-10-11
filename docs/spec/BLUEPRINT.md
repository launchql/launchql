# Blueprint Specification v1

## Overview

A **blueprint** is a declarative JSON document that describes a set of database tables, their columns, authorization policies, relations, indexes, and search configurations. The Constructive platform consumes blueprints via `construct_blueprint()` — a SQL function that materializes the described schema into real PostgreSQL objects.

This specification defines the shape of that JSON document, the rules for validating it, the extension points that allow new capabilities to be added without changing the core spec, and the type generation pipeline that provides client-side TypeScript safety.

### Design Goals

1. **Declarative over imperative** — blueprints describe *what*, not *how*. The platform decides execution order, dependency resolution, and SQL generation.
2. **Extensible without fragility** — new node types, relation types, and extension categories can be added without modifying the core specification.
3. **Procedurally typed** — TypeScript types are generated from the spec's sources of truth (the node type registry and database introspection metadata), never hand-written.
4. **Snake_case everywhere** — all blueprint keys use `snake_case` to match the SQL convention. No camelCase conversion layer exists or is needed.

### Audience

- **Application developers** building schemas with blueprints (e.g., agentic-db)
- **Platform developers** extending the node type registry or modifying the codegen pipeline
- **AI agents** generating or validating blueprints programmatically

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Blueprint Specification                      │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Core Layer     │  │  Registry Layer  │  │  Extension   │  │
│  │   (rigid)        │  │  (semi-open)     │  │  Layer       │  │
│  │                  │  │                  │  │  (open)      │  │
│  │  BlueprintTable  │  │  Node Types      │  │              │  │
│  │  BlueprintField  │  │  ┌────────────┐  │  │  Frontend    │  │
│  │  BlueprintPolicy │  │  │ Authz*     │  │  │  Skills      │  │
│  │  BlueprintIndex  │  │  │ Data*      │  │  │  Deployment  │  │
│  │  BlueprintDef    │  │  │ Relation*  │  │  │  CI/CD       │  │
│  │                  │  │  │ View*      │  │  │  Custom      │  │
│  │  Derived from DB │  │  │ Table*     │  │  │              │  │
│  │  introspection   │  │  └────────────┘  │  │  User-       │  │
│  │                  │  │                  │  │  defined      │  │
│  │                  │  │  JSON Schema per │  │  schemas      │  │
│  │                  │  │  node type       │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Type Codegen    │
                    │  (generate-      │
                    │   types.ts)      │
                    │                  │
                    │  Reads:          │
                    │  - allNodeTypes  │
                    │  - introspection │
                    │    JSON          │
                    │                  │
                    │  Produces:       │
                    │  - blueprint-    │
                    │    types.        │
                    │    generated.ts  │
                    └──────────────────┘
```

---

## Layers

### Layer 1: Core (Rigid)

Core types represent the structural skeleton of a blueprint. They map directly to metaschema database tables and are **derived procedurally** from introspection JSON when available. They have a static fallback for environments where introspection data is not present.

Core types are not extensible by consumers. Changes to core types require changes to the metaschema and a new version of the specification.

| Type | Derived From | Description |
|------|-------------|-------------|
| `BlueprintDefinition` | Spec-defined | Top-level container: `tables`, `relations`, `indexes`, `full_text_searches` |
| `BlueprintTable` | Spec-defined | A table entry: `ref`, `table_name`, `nodes`, `fields`, `policies`, `grants`, `use_rls` |
| `BlueprintField` | `metaschema_public.field` | A column definition: `name`, `type`, `is_required`, `default_value`, `description` |
| `BlueprintPolicy` | `metaschema_public.policy` | An RLS policy: `$type`, `policy_role`, `permissive`, `privileges`, `data` |
| `BlueprintIndex` | `metaschema_public.index` | An index: `table_ref`, `column`/`columns`, `access_method`, `is_unique`, `options` |
| `BlueprintFullTextSearch` | Spec-defined | FTS config: `table_ref`, `field`, `sources[]` |
| `BlueprintFtsSource` | Spec-defined | FTS source field: `field`, `weight`, `lang` |
| `BlueprintRelation` | Spec-defined | Typed union of Relation* entries with `$type`, `source_ref`, `target_ref` |
| `BlueprintNode` | Spec-defined | Union of `BlueprintNodeShorthand` (string) and `BlueprintNodeObject` (`{ $type, data }`) |

#### Derivation Rules

When introspection JSON is available (`--meta` flag), core structural types are derived from the actual database schema:

1. **Column filtering**: Primary key and foreign key columns are excluded (they are internal to the DB)
2. **Required vs optional**: A field is required if `isNotNull && !hasDefault`; optional otherwise
3. **Type mapping**: PostgreSQL types are mapped to TypeScript types (`text` → `string`, `boolean` → `boolean`, `jsonb` → `Record<string, unknown>`, etc.)
4. **JSDoc from comments**: PostgreSQL column `COMMENT`s become JSDoc descriptions on the generated interface properties

When introspection JSON is not available, hardcoded fallback interfaces are used. These should match the derived versions but may drift — introspection-derived types are always authoritative.

### Layer 2: Registry (Semi-Extensible)

The **node type registry** (`node-type-registry` package) is the single source of truth for all reusable building blocks. Each node type is a `NodeTypeDefinition`:

```typescript
interface NodeTypeDefinition {
  name: string;              // PascalCase, e.g. "DataEmbedding"
  slug: string;              // snake_case, e.g. "data_embedding"
  category: string;          // "authz" | "data" | "relation" | "view"
  display_name: string;      // Human-readable name
  description: string;       // What this node type does
  parameter_schema: JSONSchema; // JSON Schema for the node's config
  tags: string[];            // Categorization tags
}
```

#### Categories

| Category | Prefix | Purpose | Example |
|----------|--------|---------|---------|
| `authz` | `Authz*` | Row-level security policies | `AuthzDirectOwner`, `AuthzEntityMembership` |
| `data` | `Data*` | Column generators and table behaviors | `DataId`, `DataTimestamps`, `DataEmbedding` |
| `relation` | `Relation*` | Table relationships | `RelationBelongsTo`, `RelationManyToMany` |
| `view` | `View*` | Materialized/virtual views | `ViewFilteredTable`, `ViewJoinedTables` |
| `data` | `Table*` | Complete table templates | `TableUserProfiles`, `TableOrganizationSettings` |

#### Adding a New Node Type

Adding a new node type requires **no changes to the core specification**. The process is:

1. Create a new `.ts` file in the appropriate category directory (e.g., `src/data/data-my-feature.ts`)
2. Export a `NodeTypeDefinition` with a JSON Schema describing the parameters
3. Re-export from the category's `index.ts`
4. Run `pnpm generate:types` — the codegen picks up the new type automatically
5. The generated `blueprint-types.generated.ts` now includes `DataMyFeatureParams` and the new type appears in `BlueprintNodeShorthand`, `BlueprintNodeObject`, and `BlueprintNode`

This is the key extensibility mechanism. The registry is **semi-open**: anyone can add new node types, but the category system and `NodeTypeDefinition` shape are fixed by the spec.

#### Parameter Schemas

Each node type's `parameter_schema` is a JSON Schema that defines what configuration the node accepts. These schemas are the source of truth for:

- **TypeScript type generation** — `schema-typescript` converts each JSON Schema to a TypeScript interface (`DataEmbeddingParams`, `AuthzDirectOwnerParams`, etc.)
- **Runtime validation** — the server can validate blueprint JSONB against these schemas
- **Documentation** — `description` fields in the schema become JSDoc comments in generated types

Example — a simple node type:

```typescript
export const DataId: NodeTypeDefinition = {
  name: "DataId",
  slug: "data_id",
  category: "data",
  display_name: "Primary Key ID",
  description: "Adds a UUID primary key column with auto-generation default (uuidv7).",
  parameter_schema: {
    type: "object",
    properties: {
      field_name: {
        type: "string",
        description: "Column name for the primary key",
        default: "id"
      }
    }
  },
  tags: ["primary_key", "schema"]
};
```

This produces:

```typescript
export interface DataIdParams {
  /** Column name for the primary key */
  field_name?: string;
}
```

### Layer 3: Extensions (Open)

Extensions allow consumers to attach additional metadata, configurations, or capabilities to a blueprint that the core specification does not define. Extensions are **fully open** — any consumer can define their own.

#### Extension Points

Extensions can appear at any level of the blueprint hierarchy:

```typescript
interface BlueprintDefinition {
  // Core fields (Layer 1)
  tables: BlueprintTable[];
  relations?: BlueprintRelation[];
  indexes?: BlueprintIndex[];
  full_text_searches?: BlueprintFullTextSearch[];

  // Extension point
  extensions?: BlueprintExtension[];
}

interface BlueprintTable {
  // Core fields
  ref: string;
  table_name: string;
  nodes: BlueprintNode[];
  // ...

  // Extension point
  extensions?: BlueprintExtension[];
}
```

#### Extension Shape

```typescript
interface BlueprintExtension {
  /** Reverse-domain namespace to prevent collisions */
  namespace: string;

  /** Extension type identifier within the namespace */
  kind: string;

  /** Semver version of this extension's schema */
  version: string;

  /** Extension-specific configuration (validated by the extension, not the core spec) */
  config: Record<string, unknown>;
}
```

#### Example Extensions

**Frontend scaffolding:**
```json
{
  "namespace": "io.constructive.frontend",
  "kind": "crud-card",
  "version": "1.0.0",
  "config": {
    "component_name": "ContactsCard",
    "list_fields": ["name", "email", "company"],
    "detail_fields": ["name", "email", "phone", "company", "notes"],
    "search_enabled": true,
    "sort_fields": ["name", "created_at"]
  }
}
```

**Deployment recipe:**
```json
{
  "namespace": "io.constructive.deploy",
  "kind": "migration-strategy",
  "version": "1.0.0",
  "config": {
    "strategy": "blue-green",
    "rollback_on_failure": true,
    "health_check_timeout": 30
  }
}
```

**AI/Agent skill:**
```json
{
  "namespace": "io.constructive.agent",
  "kind": "embedding-pipeline",
  "version": "1.0.0",
  "config": {
    "model": "text-embedding-3-small",
    "chunk_strategy": "sliding-window",
    "chunk_size": 512,
    "overlap": 64,
    "source_tables": ["contacts", "companies", "notes"]
  }
}
```

#### Extension Validation

The core spec does **not** validate extension `config` contents — that responsibility belongs to the extension's own validation logic. The core spec only validates that extensions conform to the `BlueprintExtension` shape (have `namespace`, `kind`, `version`, and `config`).

Extension authors should publish their own JSON Schemas for their `config` shapes, enabling type-safe usage in TypeScript consumers.

---

## Type Generation Pipeline

The blueprint type generation pipeline produces `blueprint-types.generated.ts` from two inputs:

```
┌─────────────────────┐     ┌─────────────────────────┐
│  Node Type Registry │     │  Introspection JSON     │
│  (allNodeTypes[])   │     │  (TableMeta[])          │
│                     │     │                         │
│  Source: TS files   │     │  Source: buildIntro-    │
│  in src/authz/,     │     │  spectionJSON() from    │
│  src/data/, etc.    │     │  graphile-schema        │
└─────────┬───────────┘     └───────────┬─────────────┘
          │                             │
          └──────────┐   ┌──────────────┘
                     ▼   ▼
              ┌──────────────────┐
              │ generate-types.ts │
              │                  │
              │ schema-typescript │
              │ + @babel/types   │
              │ AST generation   │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────────────┐
              │ blueprint-types.         │
              │ generated.ts             │
              │                          │
              │ - *Params interfaces     │
              │ - BlueprintNode union    │
              │ - BlueprintRelation      │
              │ - BlueprintField (from   │
              │   introspection or       │
              │   static fallback)       │
              │ - BlueprintDefinition    │
              └──────────────────────────┘
```

### Generation Steps

1. **Group node types by category** — `allNodeTypes` is partitioned into `data`, `authz`, `relation`, `view`
2. **Generate parameter interfaces** — each node type's `parameter_schema` is fed through `schema-typescript` to produce a TypeScript interface (e.g., `DataEmbeddingParams`)
3. **Derive structural types** — if `--meta` introspection JSON is provided, `BlueprintField`, `BlueprintPolicy`, and `BlueprintIndex` are derived from the actual `metaschema_public` tables; otherwise static fallbacks are used
4. **Build discriminated unions** — `BlueprintNodeShorthand` (string literal union), `BlueprintNodeObject` (discriminated `{ $type, data }` union), and `BlueprintNode` (shorthand | object) are generated from the non-relation, non-view node types
5. **Build relation types** — `BlueprintRelation` is a union of intersection types: `{ $type, source_ref, target_ref } & Partial<RelationFooParams>`
6. **Build top-level types** — `BlueprintTable` and `BlueprintDefinition` are emitted as interfaces

### Running the Generator

```bash
# Without introspection (static fallback types)
cd graphile/node-type-registry && pnpm generate:types

# With introspection (procedurally derived structural types)
cd graphile/node-type-registry && pnpm generate:types -- --meta path/to/introspection.json
```

### Output Location

The generated file is written to `src/blueprint-types.generated.ts` in the `node-type-registry` package and re-exported from `src/index.ts`.

---

## Blueprint Shape Reference

### BlueprintDefinition

The top-level container. This is the JSONB shape accepted by `construct_blueprint()`.

```typescript
interface BlueprintDefinition {
  tables: BlueprintTable[];
  relations?: BlueprintRelation[];
  indexes?: BlueprintIndex[];
  full_text_searches?: BlueprintFullTextSearch[];
  extensions?: BlueprintExtension[];    // Layer 3
}
```

### BlueprintTable

A single table to be created.

```typescript
interface BlueprintTable {
  ref: string;                    // Local reference key (used by relations, indexes, fts)
  table_name: string;             // PostgreSQL table name
  nodes: BlueprintNode[];         // Node types that define behavior
  fields?: BlueprintField[];      // Custom columns
  policies?: BlueprintPolicy[];   // RLS policies
  grant_roles?: string[];         // Roles to grant privileges to (default: ["authenticated"])
  grants?: unknown[];             // Privilege grants
  use_rls?: boolean;              // Enable RLS (default: true)
  extensions?: BlueprintExtension[];  // Layer 3
}
```

### BlueprintNode

A node entry in a table. Can be a **string shorthand** (just the type name) or an **object** with typed parameters:

```typescript
// String shorthand — use when the node type has no required parameters
"DataTimestamps"

// Object form — use when parameters are needed
{ $type: "DataEmbedding", data: { dimensions: 1536, metric: "cosine" } }
```

The discriminant field is `$type`. The `data` field is typed per node type via the generated `*Params` interfaces.

### BlueprintRelation

A relation between two tables:

```typescript
{
  $type: "RelationManyToMany",
  source_ref: "contacts",
  target_ref: "tags",
  junction_table_name: "contact_tags",
  use_composite_key: true
}
```

Relations always require `$type`, `source_ref`, and `target_ref`. Additional parameters are spread as top-level keys (not nested under `data`).

### BlueprintField

A custom column:

```typescript
{ name: "email", type: "citext", is_required: true }
{ name: "notes", type: "text" }
{ name: "score", type: "integer", default_value: "0" }
```

### BlueprintPolicy

An RLS policy:

```typescript
{
  $type: "AuthzDirectOwner",
  policy_role: "authenticated",
  permissive: true,
  data: { entity_field: "owner_id" }
}
```

### BlueprintIndex

An index on table columns:

```typescript
{ table_ref: "contacts", column: "email", access_method: "BTREE", is_unique: true }
{ table_ref: "contacts", columns: ["last_name", "first_name"], access_method: "BTREE" }
```

---

## Complete Example

```typescript
import type { BlueprintDefinition } from 'node-type-registry';

const crm: BlueprintDefinition = {
  tables: [
    {
      ref: 'contacts',
      table_name: 'contacts',
      nodes: [
        'DataId',
        'DataTimestamps',
        'DataPeoplestamps',
        { $type: 'DataDirectOwner', data: { include_id: false } },
        { $type: 'DataSoftDelete', data: {} },
        { $type: 'DataPostGIS', data: {
          field_name: 'location',
          geometry_type: 'Point',
          srid: 4326,
          use_geography: true
        }},
        { $type: 'DataSearch', data: {
          full_text_search: {
            source_fields: [
              { field: 'first_name', weight: 'A' },
              { field: 'last_name', weight: 'A' },
              { field: 'email', weight: 'B' }
            ]
          },
          trgm_fields: ['first_name', 'last_name', 'email']
        }},
      ],
      fields: [
        { name: 'first_name', type: 'citext', is_required: true },
        { name: 'last_name', type: 'citext', is_required: true },
        { name: 'email', type: 'citext' },
        { name: 'phone', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      policies: [
        {
          $type: 'AuthzDirectOwner',
          permissive: true,
          data: { entity_field: 'owner_id' }
        }
      ]
    },
    {
      ref: 'companies',
      table_name: 'companies',
      nodes: [
        'DataId',
        'DataTimestamps',
        { $type: 'DataDirectOwner', data: { include_id: false } },
      ],
      fields: [
        { name: 'name', type: 'citext', is_required: true },
        { name: 'domain', type: 'citext' },
      ],
      policies: [
        {
          $type: 'AuthzDirectOwner',
          permissive: true,
          data: { entity_field: 'owner_id' }
        }
      ]
    }
  ],
  relations: [
    {
      $type: 'RelationBelongsTo',
      source_ref: 'contacts',
      target_ref: 'companies',
      field_name: 'company_id',
      nullable: true
    }
  ],
  indexes: [
    {
      table_ref: 'contacts',
      column: 'email',
      access_method: 'BTREE',
      is_unique: true
    }
  ]
};
```

---

## Versioning

The blueprint specification follows semantic versioning:

- **Major** version increments when breaking changes are made to the core shape (Layer 1) — e.g., renaming `BlueprintTable.ref`, removing a required field, changing the discriminant key
- **Minor** version increments when new core fields are added (backward-compatible) or when new built-in categories are introduced in Layer 2
- **Patch** version increments for documentation, clarification, and non-functional changes

Node type additions (Layer 2) and extensions (Layer 3) do **not** increment the specification version — they are additive by design.

### Compatibility Matrix

| Spec Version | node-type-registry | construct_blueprint() |
|-------------|-------------------|----------------------|
| v1.0.0 | >= 0.6.0 | Current |

---

## Validation

### Core Validation (enforced by `construct_blueprint()`)

1. `tables` array must be non-empty
2. Each table must have a unique `ref`
3. Each table must have a non-empty `table_name`
4. `nodes[]` entries must reference valid node types from the registry
5. `$type` in `BlueprintNodeObject` must match a registered node type name
6. `$type` in `BlueprintRelation` must be one of: `RelationBelongsTo`, `RelationHasOne`, `RelationHasMany`, `RelationManyToMany`
7. `source_ref` and `target_ref` in relations must reference table `ref` values in the same blueprint
8. `$type` in `BlueprintPolicy` must reference a valid `Authz*` node type

### Type Validation (enforced by TypeScript at build time)

1. `BlueprintNodeObject.data` is typed per `$type` — passing `DataEmbeddingParams` to a `DataId` node is a compile error
2. `BlueprintRelation` parameters are type-checked against the specific relation type's `*Params` interface
3. `BlueprintPolicy.$type` is restricted to the string literal union of known `Authz*` types
4. All field names are `snake_case` — the generated types enforce this

### Extension Validation (enforced by extension authors)

Extensions are pass-through at the core level. Extension authors are responsible for providing their own validation logic and JSON Schemas for their `config` shapes.

---

## Relationship to Other Specifications

| Spec | Relationship |
|------|-------------|
| [SLICING.md](./SLICING.md) | PGPM migration slicing — operates on the *output* of blueprint materialization |
| Safegres (Authz*) | The security protocol that defines `Authz*` policy semantics — Layer 2 of this spec |
| Metaschema | The database schema that `BlueprintField`, `BlueprintPolicy`, `BlueprintIndex` are derived from |
| Node Type Registry | The package that implements Layer 2 — all node type definitions and the codegen pipeline |

---

## Future Directions

1. **Blueprint composition** — importing/merging blueprints from multiple files or packages (`$import` / `$ref` style)
2. **Extension registry** — a central catalog of published extensions with versioned JSON Schemas
3. **Blueprint diffing** — computing the delta between two blueprints for incremental migration
4. **Runtime type narrowing** — using `$type` discriminants for runtime validation without external schema validators
5. **Frontend code generation** — extensions that produce React components, forms, and pages from blueprint metadata
