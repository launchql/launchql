# exchangeNativeHandoff

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the exchangeNativeHandoff mutation

## Usage

```typescript
db.mutation.exchangeNativeHandoff({ input: { code: '<String>', codeVerifier: '<String>', credentialKind: '<String>' } }).execute()
```

## Examples

### Run exchangeNativeHandoff

```typescript
const result = await db.mutation.exchangeNativeHandoff({ input: { code: '<String>', codeVerifier: '<String>', credentialKind: '<String>' } }).execute();
```
