# functionGraphExecutionCancelRequest

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched

## Usage

```typescript
db.functionGraphExecutionCancelRequest.findMany({ select: { id: true } }).execute()
db.functionGraphExecutionCancelRequest.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.functionGraphExecutionCancelRequest.create({ data: { actorId: '<UUID>', executionId: '<UUID>' }, select: { id: true } }).execute()
db.functionGraphExecutionCancelRequest.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.functionGraphExecutionCancelRequest.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all functionGraphExecutionCancelRequest records

```typescript
const items = await db.functionGraphExecutionCancelRequest.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a functionGraphExecutionCancelRequest

```typescript
const item = await db.functionGraphExecutionCancelRequest.create({
  data: { actorId: '<UUID>', executionId: '<UUID>' },
  select: { id: true }
}).execute();
```
