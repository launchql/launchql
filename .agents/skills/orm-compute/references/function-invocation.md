# functionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug.

## Usage

```typescript
db.functionInvocation.findMany({ select: { id: true } }).execute()
db.functionInvocation.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.functionInvocation.create({ data: { actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', jobKey: '<String>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', queueName: '<String>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute()
db.functionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.functionInvocation.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all functionInvocation records

```typescript
const items = await db.functionInvocation.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a functionInvocation

```typescript
const item = await db.functionInvocation.create({
  data: { actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', jobKey: '<String>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', queueName: '<String>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' },
  select: { id: true }
}).execute();
```
