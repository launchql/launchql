# setPassword

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the setPassword mutation

## Usage

```typescript
db.mutation.setPassword({ input: { currentPassword: '<String>', newPassword: '<String>', signOutOtherSessions: '<Boolean>' } }).execute()
```

## Examples

### Run setPassword

```typescript
const result = await db.mutation.setPassword({ input: { currentPassword: '<String>', newPassword: '<String>', signOutOtherSessions: '<Boolean>' } }).execute();
```
