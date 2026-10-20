# constructBlueprint

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Executes a blueprint definition by delegating to provision_* procedures. Creates a blueprint_construction record to track the attempt. Eight phases: (0) entity_type_provision for each membership_type entry — provisions entity tables, membership modules, and security. When a prefix already exists (e.g., 'org'), the entry extends the existing entity type instead of creating a new one; if a storage[] key is present, it provisions entity-scoped storage for that type. (0.5) scope-based storage: each storage[] entry has an optional scope ('app' or 'org' only). App-scoped storage seeds buckets at migration time. Org-scoped storage resolves the org membership type, creates org_buckets/org_files with owner_id, and seeds buckets per-entity via an AFTER INSERT trigger on the users table. When function_module is installed, a private functions bucket is auto-injected into org-scoped or entity-scoped storage entries. (1) provision_table() for each table with nodes[], fields[], policies[], and grants (table-level indexes/fts/unique_constraints/check_constraints are deferred). A table entry either names its table (table_name plus optional schema_name) or references one an installed module generated ("module": {"type": "agent", "scope": "org", "table": "message"}), which resolves through the module row's recorded table ids and raises when it matches nothing instead of creating an empty table. After provisioning, optional smart_tags (jsonb object) on the table entry are applied via metaschema.append_table_smart_tags(), and optional smart_tags on individual field entries are applied via metaschema.append_field_smart_tags(). (2) provision_relation() for each relation, (3) provision_index() for top-level + deferred indexes, (4) provision_full_text_search() for top-level + deferred FTS, (5) provision_unique_constraint() for top-level + deferred unique constraints, (6) provision_check_constraint() for top-level + deferred check constraints, (7) seed achievements from definition.achievements[] — resolves events_module by entity_prefix and creates INSERT actions for levels, level_requirements, and achievement_rewards tables. Phase 0 entity tables are added to the table_map so subsequent phases can reference them by name. Table-level entries are deferred to phases 3-6 so they can reference columns created by relations in phase 2. Returns the construction record ID. A failure raises its coded error to the caller and rolls back the whole construction, including the construction record.

## Usage

```typescript
db.mutation.constructBlueprint({ input: { blueprintId: '<UUID>', schemaId: '<UUID>' } }).execute()
```

## Examples

### Run constructBlueprint

```typescript
const result = await db.mutation.constructBlueprint({ input: { blueprintId: '<UUID>', schemaId: '<UUID>' } }).execute();
```
