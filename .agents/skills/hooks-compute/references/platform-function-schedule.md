# platformFunctionSchedule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs)

## Usage

```typescript
usePlatformFunctionSchedulesQuery({ selection: { fields: { actorId: true, createdAt: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } } })
usePlatformFunctionScheduleQuery({ id: '<UUID>', selection: { fields: { actorId: true, createdAt: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } } })
useCreatePlatformFunctionScheduleMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionScheduleMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionScheduleMutation({})
```

## Examples

### List all platformFunctionSchedules

```typescript
const { data, isLoading } = usePlatformFunctionSchedulesQuery({
  selection: { fields: { actorId: true, createdAt: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } },
});
```

### Create a platformFunctionSchedule

```typescript
const { mutate } = useCreatePlatformFunctionScheduleMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' });
```
