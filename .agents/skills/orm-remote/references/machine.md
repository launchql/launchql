# machine

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Computers enrolled for remote control, one row per database enrollment

## Usage

```typescript
db.machine.findMany({ select: { id: true } }).execute()
db.machine.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.machine.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', facts: '<JSON>', isShared: '<Boolean>', label: '<String>', lastSeenAt: '<Datetime>', ownerId: '<UUID>', policy: '<JSON>', principalId: '<UUID>', relayUrl: '<String>', revokedAt: '<Datetime>', tokenHash: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute()
db.machine.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute()
db.machine.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all machine records

```typescript
const items = await db.machine.findMany({
  select: { id: true, createdBy: true }
}).execute();
```

### Create a machine

```typescript
const item = await db.machine.create({
  data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', facts: '<JSON>', isShared: '<Boolean>', label: '<String>', lastSeenAt: '<Datetime>', ownerId: '<UUID>', policy: '<JSON>', principalId: '<UUID>', relayUrl: '<String>', revokedAt: '<Datetime>', tokenHash: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' },
  select: { id: true }
}).execute();
```
