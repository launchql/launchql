# ORM Client

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { createClient } from './orm';

const db = createClient({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});
```

## Models

| Model | Operations |
|-------|------------|
| `bucket` | findMany, findOne, create, update, delete |
| `file` | findMany, findOne, create, update, delete |
| `platformBucket` | findMany, findOne, create, update, delete |
| `platformFile` | findMany, findOne, create, update, delete |

## Table Operations

### `db.bucket`

CRUD operations for Bucket records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `allowCustomKeys` | Boolean | Yes |
| `allowedMimeTypes` | String | Yes |
| `allowedOrigins` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `destinationBucketId` | UUID | Yes |
| `id` | UUID | No |
| `isPublic` | Boolean | Yes |
| `key` | String | Yes |
| `maxBulkFiles` | Int | Yes |
| `maxFileSize` | BigInt | Yes |
| `physicalName` | String | Yes |
| `stagingTtl` | Interval | Yes |
| `tags` | String | Yes |
| `type` | BucketType | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all bucket records
const items = await db.bucket.findMany({ select: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.bucket.findOne({ id: '<UUID>', select: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } }).execute();

// Create
const created = await db.bucket.create({ data: { actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' }, select: { id: true } }).execute();

// Update
const updated = await db.bucket.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.bucket.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.file`

CRUD operations for File records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `bucketId` | UUID | Yes |
| `contentHash` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `downloadUrl` | String | Yes |
| `expiryEnqueuedAt` | Datetime | Yes |
| `filePath` | String | Yes |
| `filename` | String | Yes |
| `id` | UUID | No |
| `isPublic` | Boolean | Yes |
| `key` | String | Yes |
| `mimeType` | String | Yes |
| `promotedAt` | Datetime | Yes |
| `size` | BigInt | Yes |
| `status` | FileStatus | Yes |
| `tags` | String | Yes |
| `updatedAt` | Datetime | No |
| `upload` | ConstructiveInternalTypeUpload | Yes |

**Operations:**

```typescript
// List all file records
const items = await db.file.findMany({ select: { actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } }).execute();

// Get one by id
const item = await db.file.findOne({ id: '<UUID>', select: { actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } }).execute();

// Create
const created = await db.file.create({ data: { actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', databaseId: '<UUID>', description: '<String>', downloadUrl: '<String>', expiryEnqueuedAt: '<Datetime>', filePath: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', promotedAt: '<Datetime>', size: '<BigInt>', status: '<FileStatus>', tags: '<String>', upload: '<Upload>' }, select: { id: true } }).execute();

// Update
const updated = await db.file.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.file.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformBucket`

CRUD operations for PlatformBucket records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `allowCustomKeys` | Boolean | Yes |
| `allowedMimeTypes` | String | Yes |
| `allowedOrigins` | String | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `destinationBucketId` | UUID | Yes |
| `id` | UUID | No |
| `isPublic` | Boolean | Yes |
| `key` | String | Yes |
| `maxBulkFiles` | Int | Yes |
| `maxFileSize` | BigInt | Yes |
| `physicalName` | String | Yes |
| `stagingTtl` | Interval | Yes |
| `tags` | String | Yes |
| `type` | BucketType | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformBucket records
const items = await db.platformBucket.findMany({ select: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformBucket.findOne({ id: '<UUID>', select: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } }).execute();

// Create
const created = await db.platformBucket.create({ data: { actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformBucket.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformBucket.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFile`

CRUD operations for PlatformFile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `bucketId` | UUID | Yes |
| `contentHash` | String | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `downloadUrl` | String | Yes |
| `expiryEnqueuedAt` | Datetime | Yes |
| `filePath` | String | Yes |
| `filename` | String | Yes |
| `id` | UUID | No |
| `isPublic` | Boolean | Yes |
| `key` | String | Yes |
| `mimeType` | String | Yes |
| `promotedAt` | Datetime | Yes |
| `size` | BigInt | Yes |
| `status` | FileStatus | Yes |
| `tags` | String | Yes |
| `updatedAt` | Datetime | No |
| `upload` | ConstructiveInternalTypeUpload | Yes |

**Operations:**

```typescript
// List all platformFile records
const items = await db.platformFile.findMany({ select: { actorId: true, bucketId: true, contentHash: true, createdAt: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } }).execute();

// Get one by id
const item = await db.platformFile.findOne({ id: '<UUID>', select: { actorId: true, bucketId: true, contentHash: true, createdAt: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } }).execute();

// Create
const created = await db.platformFile.create({ data: { actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', description: '<String>', downloadUrl: '<String>', expiryEnqueuedAt: '<Datetime>', filePath: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', promotedAt: '<Datetime>', size: '<BigInt>', status: '<FileStatus>', tags: '<String>', upload: '<Upload>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFile.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFile.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.mutation.filesRename`

filesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FilesRenameInput (required) |

```typescript
const result = await db.mutation.filesRename({ input: { fileId: '<UUID>', newFilename: '<String>' } }).execute();
```

### `db.mutation.platformFilesRename`

platformFilesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFilesRenameInput (required) |

```typescript
const result = await db.mutation.platformFilesRename({ input: { fileId: '<UUID>', newFilename: '<String>' } }).execute();
```

### `db.mutation.provisionBucket`

Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

```typescript
const result = await db.mutation.provisionBucket({ input: { bucketKey: '<String>', ownerId: '<UUID>' } }).execute();
```

### `db.mutation.uploadFile`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadFileInput (required) |

```typescript
const result = await db.mutation.uploadFile({ input: '<UploadFileInput>' }).execute();
```

### `db.mutation.uploadFiles`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadFileBulkInput (required) |

```typescript
const result = await db.mutation.uploadFiles({ input: { bucketKey: '<String>', files: '<UploadFileBulkFileInput>', isPublic: '<Boolean>' } }).execute();
```

### `db.mutation.uploadPlatformFile`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileInput (required) |

```typescript
const result = await db.mutation.uploadPlatformFile({ input: '<UploadPlatformFileInput>' }).execute();
```

### `db.mutation.uploadPlatformFiles`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileBulkInput (required) |

```typescript
const result = await db.mutation.uploadPlatformFiles({ input: { bucketKey: '<String>', files: '<UploadPlatformFileBulkFileInput>', isPublic: '<Boolean>' } }).execute();
```
