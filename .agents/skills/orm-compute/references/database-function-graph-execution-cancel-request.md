# databaseFunctionGraphExecutionCancelRequest

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched

## Usage

```typescript
db.databaseFunctionGraphExecutionCancelRequest.findMany({ select: { id: true } }).execute()
db.databaseFunctionGraphExecutionCancelRequest.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.databaseFunctionGraphExecutionCancelRequest.create({ data: { actorId: '<UUID>', executionId: '<UUID>' }, select: { id: true } }).execute()
db.databaseFunctionGraphExecutionCancelRequest.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.databaseFunctionGraphExecutionCancelRequest.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all databaseFunctionGraphExecutionCancelRequest records

```typescript
const items = await db.databaseFunctionGraphExecutionCancelRequest.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a databaseFunctionGraphExecutionCancelRequest

```typescript
const item = await db.databaseFunctionGraphExecutionCancelRequest.create({
  data: { actorId: '<UUID>', executionId: '<UUID>' },
  select: { id: true }
}).execute();
```
