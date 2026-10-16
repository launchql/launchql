# bucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Logical storage containers that group files with shared access policies and CDN behavior

## Usage

```typescript
db.bucket.findMany({ select: { id: true } }).execute()
db.bucket.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.bucket.create({ data: { actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' }, select: { id: true } }).execute()
db.bucket.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.bucket.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all bucket records

```typescript
const items = await db.bucket.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a bucket

```typescript
const item = await db.bucket.create({
  data: { actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' },
  select: { id: true }
}).execute();
```
