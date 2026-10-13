# functionGraphExecutionCancelRequest

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched

## Usage

```typescript
useFunctionGraphExecutionCancelRequestsQuery({ selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } } })
useFunctionGraphExecutionCancelRequestQuery({ id: '<UUID>', selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } } })
useCreateFunctionGraphExecutionCancelRequestMutation({ selection: { fields: { id: true } } })
useUpdateFunctionGraphExecutionCancelRequestMutation({ selection: { fields: { id: true } } })
useDeleteFunctionGraphExecutionCancelRequestMutation({})
```

## Examples

### List all functionGraphExecutionCancelRequests

```typescript
const { data, isLoading } = useFunctionGraphExecutionCancelRequestsQuery({
  selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } },
});
```

### Create a functionGraphExecutionCancelRequest

```typescript
const { mutate } = useCreateFunctionGraphExecutionCancelRequestMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', executionId: '<UUID>' });
```
