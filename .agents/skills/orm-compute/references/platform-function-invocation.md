# platformFunctionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug.

## Usage

```typescript
db.platformFunctionInvocation.findMany({ select: { id: true } }).execute()
db.platformFunctionInvocation.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionInvocation.create({ data: { actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', jobKey: '<String>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', queueName: '<String>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute()
db.platformFunctionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.platformFunctionInvocation.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionInvocation records

```typescript
const items = await db.platformFunctionInvocation.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a platformFunctionInvocation

```typescript
const item = await db.platformFunctionInvocation.create({
  data: { actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', jobKey: '<String>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', queueName: '<String>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' },
  select: { id: true }
}).execute();
```
