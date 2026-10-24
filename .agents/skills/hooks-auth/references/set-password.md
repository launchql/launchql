# setPassword

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query mutation hook for setPassword

## Usage

```typescript
const { mutate } = useSetPasswordMutation(); mutate({ input: { currentPassword: '<String>', newPassword: '<String>', signOutOtherSessions: '<Boolean>' } });
```

## Examples

### Use useSetPasswordMutation

```typescript
const { mutate, isLoading } = useSetPasswordMutation();
mutate({ input: { currentPassword: '<String>', newPassword: '<String>', signOutOtherSessions: '<Boolean>' } });
```
