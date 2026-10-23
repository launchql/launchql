# constructBlueprint

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Requests a build of a blueprint: snapshots its definition into a pending blueprint_construction row, enqueues the blueprint:construct job that runs metaschema_private.construct_blueprint_run on it, and returns the construction id immediately. Poll the row: pending -> constructing -> constructed (table_map populated) or failed (error holds the coded error). schema_id is the default schema for tables without an explicit schema_name.

## Usage

```typescript
const { mutate } = useConstructBlueprintMutation(); mutate({ input: { blueprintId: '<UUID>', schemaId: '<UUID>' } });
```

## Examples

### Use useConstructBlueprintMutation

```typescript
const { mutate, isLoading } = useConstructBlueprintMutation();
mutate({ input: { blueprintId: '<UUID>', schemaId: '<UUID>' } });
```
