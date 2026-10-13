# functionSchedule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs)

## Usage

```typescript
db.functionSchedule.findMany({ select: { id: true } }).execute()
db.functionSchedule.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.functionSchedule.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' }, select: { id: true } }).execute()
db.functionSchedule.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.functionSchedule.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all functionSchedule records

```typescript
const items = await db.functionSchedule.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a functionSchedule

```typescript
const item = await db.functionSchedule.create({
  data: { actorId: '<UUID>', databaseId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' },
  select: { id: true }
}).execute();
```
