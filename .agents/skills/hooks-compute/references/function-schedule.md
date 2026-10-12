# functionSchedule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs)

## Usage

```typescript
useFunctionSchedulesQuery({ selection: { fields: { actorId: true, createdAt: true, databaseId: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } } })
useFunctionScheduleQuery({ id: '<UUID>', selection: { fields: { actorId: true, createdAt: true, databaseId: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } } })
useCreateFunctionScheduleMutation({ selection: { fields: { id: true } } })
useUpdateFunctionScheduleMutation({ selection: { fields: { id: true } } })
useDeleteFunctionScheduleMutation({})
```

## Examples

### List all functionSchedules

```typescript
const { data, isLoading } = useFunctionSchedulesQuery({
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } },
});
```

### Create a functionSchedule

```typescript
const { mutate } = useCreateFunctionScheduleMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', databaseId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' });
```
