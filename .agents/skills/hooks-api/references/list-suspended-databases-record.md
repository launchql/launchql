# listSuspendedDatabasesRecord

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for ListSuspendedDatabasesRecord data operations

## Usage

```typescript
useListSuspendedDatabasesQuery({ selection: { fields: { id: true, name: true, ownerId: true, suspendedAt: true, suspendedReason: true } } })
useListSuspendedDatabasesRecordQuery({ id: '<UUID>', selection: { fields: { id: true, name: true, ownerId: true, suspendedAt: true, suspendedReason: true } } })
useCreateListSuspendedDatabasesRecordMutation({ selection: { fields: { id: true } } })
useUpdateListSuspendedDatabasesRecordMutation({ selection: { fields: { id: true } } })
useDeleteListSuspendedDatabasesRecordMutation({})
```

## Examples

### List all listSuspendedDatabases

```typescript
const { data, isLoading } = useListSuspendedDatabasesQuery({
  selection: { fields: { id: true, name: true, ownerId: true, suspendedAt: true, suspendedReason: true } },
});
```

### Create a listSuspendedDatabasesRecord

```typescript
const { mutate } = useCreateListSuspendedDatabasesRecordMutation({
  selection: { fields: { id: true } },
});
mutate({ name: '<String>', ownerId: '<UUID>', suspendedAt: '<Datetime>', suspendedReason: '<String>' });
```
