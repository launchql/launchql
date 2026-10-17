# uploadFiles

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

## Usage

```typescript
const { mutate } = useUploadFilesMutation(); mutate({ input: { bucketKey: '<String>', files: '<UploadFileBulkFileInput>', isPublic: '<Boolean>' } });
```

## Examples

### Use useUploadFilesMutation

```typescript
const { mutate, isLoading } = useUploadFilesMutation();
mutate({ input: { bucketKey: '<String>', files: '<UploadFileBulkFileInput>', isPublic: '<Boolean>' } });
```
