# uploadPlatformFiles

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

## Usage

```bash
csdk upload-platform-files --input.bucketKey <String> --input.files <UploadPlatformFileBulkFileInput> --input.isPublic <Boolean>
```

## Examples

### Run uploadPlatformFiles

```bash
csdk upload-platform-files --input.bucketKey <String> --input.files <UploadPlatformFileBulkFileInput> --input.isPublic <Boolean>
```
