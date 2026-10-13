# databaseFunctionGraphExecutionCancelRequest

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched

## Usage

```typescript
useDatabaseFunctionGraphExecutionCancelRequestsQuery({ selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } } })
useDatabaseFunctionGraphExecutionCancelRequestQuery({ id: '<UUID>', selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } } })
useCreateDatabaseFunctionGraphExecutionCancelRequestMutation({ selection: { fields: { id: true } } })
useUpdateDatabaseFunctionGraphExecutionCancelRequestMutation({ selection: { fields: { id: true } } })
useDeleteDatabaseFunctionGraphExecutionCancelRequestMutation({})
```

## Examples

### List all databaseFunctionGraphExecutionCancelRequests

```typescript
const { data, isLoading } = useDatabaseFunctionGraphExecutionCancelRequestsQuery({
  selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } },
});
```

### Create a databaseFunctionGraphExecutionCancelRequest

```typescript
const { mutate } = useCreateDatabaseFunctionGraphExecutionCancelRequestMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', executionId: '<UUID>' });
```
