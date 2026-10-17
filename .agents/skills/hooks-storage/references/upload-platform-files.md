# uploadPlatformFiles

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

## Usage

```typescript
const { mutate } = useUploadPlatformFilesMutation(); mutate({ input: { bucketKey: '<String>', files: '<UploadPlatformFileBulkFileInput>', isPublic: '<Boolean>' } });
```

## Examples

### Use useUploadPlatformFilesMutation

```typescript
const { mutate, isLoading } = useUploadPlatformFilesMutation();
mutate({ input: { bucketKey: '<String>', files: '<UploadPlatformFileBulkFileInput>', isPublic: '<Boolean>' } });
```
