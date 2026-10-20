# functionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug.

## Usage

```typescript
useFunctionInvocationsQuery({ selection: { fields: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, jobKey: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, queueName: true, result: true, startedAt: true, status: true, taskIdentifier: true } } })
useFunctionInvocationQuery({ id: '<UUID>', selection: { fields: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, jobKey: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, queueName: true, result: true, startedAt: true, status: true, taskIdentifier: true } } })
useCreateFunctionInvocationMutation({ selection: { fields: { id: true } } })
useUpdateFunctionInvocationMutation({ selection: { fields: { id: true } } })
useDeleteFunctionInvocationMutation({})
```

## Examples

### List all functionInvocations

```typescript
const { data, isLoading } = useFunctionInvocationsQuery({
  selection: { fields: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, jobKey: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, queueName: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});
```

### Create a functionInvocation

```typescript
const { mutate } = useCreateFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', jobKey: '<String>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', queueName: '<String>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```
