# createFunctionFromSource

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Creates a `Function` from its `CREATE FUNCTION` source text.

## Usage

```typescript
const { mutate } = useCreateFunctionFromSourceMutation(); mutate({ input: { apiExposed: '<Boolean>', databaseId: '<UUID>', schemaId: '<UUID>', source: '<String>' } });
```

## Examples

### Use useCreateFunctionFromSourceMutation

```typescript
const { mutate, isLoading } = useCreateFunctionFromSourceMutation();
mutate({ input: { apiExposed: '<Boolean>', databaseId: '<UUID>', schemaId: '<UUID>', source: '<String>' } });
```
