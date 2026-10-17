# platformBucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Logical storage containers that group files with shared access policies and CDN behavior

## Usage

```typescript
db.platformBucket.findMany({ select: { id: true } }).execute()
db.platformBucket.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformBucket.create({ data: { actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' }, select: { id: true } }).execute()
db.platformBucket.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.platformBucket.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformBucket records

```typescript
const items = await db.platformBucket.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a platformBucket

```typescript
const item = await db.platformBucket.create({
  data: { actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' },
  select: { id: true }
}).execute();
```
