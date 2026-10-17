# managedDomain

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Platform-operated hostnames whose DNS and certificate lifecycle the platform drives

## Usage

```typescript
db.managedDomain.findMany({ select: { id: true } }).execute()
db.managedDomain.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.managedDomain.create({ data: { allowPublicUsage: '<Boolean>', annotations: '<JSON>', certStatus: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', domain: '<String>', isWildcard: '<Boolean>', publicPort: '<Int>', tlsReadyAt: '<Datetime>', tlsStatus: '<String>', updatedByPrincipal: '<UUID>', verificationStatus: '<String>', verifiedAt: '<Datetime>' }, select: { id: true } }).execute()
db.managedDomain.update({ where: { id: '<UUID>' }, data: { allowPublicUsage: '<Boolean>' }, select: { id: true } }).execute()
db.managedDomain.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all managedDomain records

```typescript
const items = await db.managedDomain.findMany({
  select: { id: true, allowPublicUsage: true }
}).execute();
```

### Create a managedDomain

```typescript
const item = await db.managedDomain.create({
  data: { allowPublicUsage: '<Boolean>', annotations: '<JSON>', certStatus: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', domain: '<String>', isWildcard: '<Boolean>', publicPort: '<Int>', tlsReadyAt: '<Datetime>', tlsStatus: '<String>', updatedByPrincipal: '<UUID>', verificationStatus: '<String>', verifiedAt: '<Datetime>' },
  select: { id: true }
}).execute();
```
