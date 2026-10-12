# listSuspendedDatabasesRecord

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for ListSuspendedDatabasesRecord records

## Usage

```typescript
db.listSuspendedDatabasesRecord.findMany({ select: { id: true } }).execute()
db.listSuspendedDatabasesRecord.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.listSuspendedDatabasesRecord.create({ data: { name: '<String>', ownerId: '<UUID>', suspendedAt: '<Datetime>', suspendedReason: '<String>' }, select: { id: true } }).execute()
db.listSuspendedDatabasesRecord.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute()
db.listSuspendedDatabasesRecord.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all listSuspendedDatabasesRecord records

```typescript
const items = await db.listSuspendedDatabasesRecord.findMany({
  select: { id: true, name: true }
}).execute();
```

### Create a listSuspendedDatabasesRecord

```typescript
const item = await db.listSuspendedDatabasesRecord.create({
  data: { name: '<String>', ownerId: '<UUID>', suspendedAt: '<Datetime>', suspendedReason: '<String>' },
  select: { id: true }
}).execute();
```
