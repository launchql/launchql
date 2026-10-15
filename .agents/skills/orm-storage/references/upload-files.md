# uploadFiles

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

## Usage

```typescript
db.mutation.uploadFiles({ input: { bucketKey: '<String>', files: '<UploadFileBulkFileInput>', isPublic: '<Boolean>' } }).execute()
```

## Examples

### Run uploadFiles

```typescript
const result = await db.mutation.uploadFiles({ input: { bucketKey: '<String>', files: '<UploadFileBulkFileInput>', isPublic: '<Boolean>' } }).execute();
```
