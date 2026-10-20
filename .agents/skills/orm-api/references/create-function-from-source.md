# createFunctionFromSource

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Creates a `Function` from its `CREATE FUNCTION` source text.

## Usage

```typescript
db.mutation.createFunctionFromSource({ input: { apiExposed: '<Boolean>', databaseId: '<UUID>', schemaId: '<UUID>', source: '<String>' } }).execute()
```

## Examples

### Run createFunctionFromSource

```typescript
const result = await db.mutation.createFunctionFromSource({ input: { apiExposed: '<Boolean>', databaseId: '<UUID>', schemaId: '<UUID>', source: '<String>' } }).execute();
```
