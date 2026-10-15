# bucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Logical storage containers that group files with shared access policies and CDN behavior

## Usage

```typescript
useBucketsQuery({ selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } } })
useBucketQuery({ id: '<UUID>', selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } } })
useCreateBucketMutation({ selection: { fields: { id: true } } })
useUpdateBucketMutation({ selection: { fields: { id: true } } })
useDeleteBucketMutation({})
```

## Examples

### List all buckets

```typescript
const { data, isLoading } = useBucketsQuery({
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } },
});
```

### Create a bucket

```typescript
const { mutate } = useCreateBucketMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' });
```
