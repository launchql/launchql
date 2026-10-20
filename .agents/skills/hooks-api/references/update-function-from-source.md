# updateFunctionFromSource

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Replaces a `Function`'s definition from its source text; its database, schema and exposure are unchanged.

## Usage

```typescript
const { mutate } = useUpdateFunctionFromSourceMutation(); mutate({ input: { id: '<UUID>', source: '<String>' } });
```

## Examples

### Use useUpdateFunctionFromSourceMutation

```typescript
const { mutate, isLoading } = useUpdateFunctionFromSourceMutation();
mutate({ input: { id: '<UUID>', source: '<String>' } });
```
