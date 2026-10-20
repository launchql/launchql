# updateFunctionFromSource

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Replaces a `Function`'s definition from its source text; its database, schema and exposure are unchanged.

## Usage

```typescript
db.mutation.updateFunctionFromSource({ input: { id: '<UUID>', source: '<String>' } }).execute()
```

## Examples

### Run updateFunctionFromSource

```typescript
const result = await db.mutation.updateFunctionFromSource({ input: { id: '<UUID>', source: '<String>' } }).execute();
```
