# platformManagedDomain

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Platform-operated hostnames whose DNS and certificate lifecycle the platform drives

## Usage

```typescript
db.platformManagedDomain.findMany({ select: { id: true } }).execute()
db.platformManagedDomain.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformManagedDomain.create({ data: { allowPublicUsage: '<Boolean>', annotations: '<JSON>', certStatus: '<String>', createdByPrincipal: '<UUID>', domain: '<String>', isWildcard: '<Boolean>', publicPort: '<Int>', tlsReadyAt: '<Datetime>', tlsStatus: '<String>', updatedByPrincipal: '<UUID>', verificationStatus: '<String>', verifiedAt: '<Datetime>' }, select: { id: true } }).execute()
db.platformManagedDomain.update({ where: { id: '<UUID>' }, data: { allowPublicUsage: '<Boolean>' }, select: { id: true } }).execute()
db.platformManagedDomain.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformManagedDomain records

```typescript
const items = await db.platformManagedDomain.findMany({
  select: { id: true, allowPublicUsage: true }
}).execute();
```

### Create a platformManagedDomain

```typescript
const item = await db.platformManagedDomain.create({
  data: { allowPublicUsage: '<Boolean>', annotations: '<JSON>', certStatus: '<String>', createdByPrincipal: '<UUID>', domain: '<String>', isWildcard: '<Boolean>', publicPort: '<Int>', tlsReadyAt: '<Datetime>', tlsStatus: '<String>', updatedByPrincipal: '<UUID>', verificationStatus: '<String>', verifiedAt: '<Datetime>' },
  select: { id: true }
}).execute();
```
