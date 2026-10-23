# blueprintConstruction

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Tracks individual construction attempts of a blueprint. Each time construct_blueprint() is called, a new record is created here as pending and a blueprint:construct job builds it in the background. This separates the editable blueprint definition from its build history, allowing blueprints to be re-executed, constructed into multiple databases, and maintain an audit trail of all construction attempts, including failed ones.

## Usage

```typescript
useBlueprintConstructionsQuery({ selection: { fields: { blueprintId: true, constructedAt: true, constructedDefinition: true, createdAt: true, databaseId: true, error: true, id: true, schemaId: true, status: true, tableMap: true, updatedAt: true } } })
useBlueprintConstructionQuery({ id: '<UUID>', selection: { fields: { blueprintId: true, constructedAt: true, constructedDefinition: true, createdAt: true, databaseId: true, error: true, id: true, schemaId: true, status: true, tableMap: true, updatedAt: true } } })
useCreateBlueprintConstructionMutation({ selection: { fields: { id: true } } })
useUpdateBlueprintConstructionMutation({ selection: { fields: { id: true } } })
useDeleteBlueprintConstructionMutation({})
```

## Examples

### List all blueprintConstructions

```typescript
const { data, isLoading } = useBlueprintConstructionsQuery({
  selection: { fields: { blueprintId: true, constructedAt: true, constructedDefinition: true, createdAt: true, databaseId: true, error: true, id: true, schemaId: true, status: true, tableMap: true, updatedAt: true } },
});
```

### Create a blueprintConstruction

```typescript
const { mutate } = useCreateBlueprintConstructionMutation({
  selection: { fields: { id: true } },
});
mutate({ blueprintId: '<UUID>', constructedAt: '<Datetime>', constructedDefinition: '<JSON>', databaseId: '<UUID>', error: '<JSON>', schemaId: '<UUID>', status: '<String>', tableMap: '<JSON>' });
```
