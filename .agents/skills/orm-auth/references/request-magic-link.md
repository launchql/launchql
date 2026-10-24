# requestMagicLink

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the requestMagicLink mutation

## Usage

```typescript
db.mutation.requestMagicLink({ input: { codeChallenge: '<String>', email: '<String>', nativeRedirectUri: '<String>', next: '<String>' } }).execute()
```

## Examples

### Run requestMagicLink

```typescript
const result = await db.mutation.requestMagicLink({ input: { codeChallenge: '<String>', email: '<String>', nativeRedirectUri: '<String>', next: '<String>' } }).execute();
```
