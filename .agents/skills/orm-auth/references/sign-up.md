# signUp

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the signUp mutation

## Usage

```typescript
db.mutation.signUp({ input: { csrfToken: '<String>', email: '<String>', inviteToken: '<String>', password: '<String>' } }).execute()
```

## Examples

### Run signUp

```typescript
const result = await db.mutation.signUp({ input: { csrfToken: '<String>', email: '<String>', inviteToken: '<String>', password: '<String>' } }).execute();
```
