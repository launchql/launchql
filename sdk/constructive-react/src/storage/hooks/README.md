# React Query Hooks

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from './hooks';

configure({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Hooks

| Hook | Type | Description |
|------|------|-------------|
| `useBucketsQuery` | Query | Logical storage containers that group files with shared access policies and CDN behavior |
| `useBucketQuery` | Query | Logical storage containers that group files with shared access policies and CDN behavior |
| `useCreateBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `useUpdateBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `useDeleteBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `useFilesQuery` | Query | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useFileQuery` | Query | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useCreateFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useUpdateFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useDeleteFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `usePlatformBucketsQuery` | Query | Logical storage containers that group files with shared access policies and CDN behavior |
| `usePlatformBucketQuery` | Query | Logical storage containers that group files with shared access policies and CDN behavior |
| `useCreatePlatformBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `useUpdatePlatformBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `useDeletePlatformBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `usePlatformFilesQuery` | Query | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `usePlatformFileQuery` | Query | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useCreatePlatformFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useUpdatePlatformFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useDeletePlatformFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useFilesRenameMutation` | Mutation | filesRename |
| `usePlatformFilesRenameMutation` | Mutation | platformFilesRename |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |
| `useUploadFileMutation` | Mutation | Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL. |
| `useUploadFilesMutation` | Mutation | Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call. |
| `useUploadPlatformFileMutation` | Mutation | Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL. |
| `useUploadPlatformFilesMutation` | Mutation | Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call. |

## Table Hooks

### Bucket

```typescript
// List all buckets
const { data, isLoading } = useBucketsQuery({
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } },
});

// Get one bucket
const { data: item } = useBucketQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } },
});

// Create a bucket
const { mutate: create } = useCreateBucketMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' });
```

### File

```typescript
// List all files
const { data, isLoading } = useFilesQuery({
  selection: { fields: { actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } },
});

// Get one file
const { data: item } = useFileQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } },
});

// Create a file
const { mutate: create } = useCreateFileMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', databaseId: '<UUID>', description: '<String>', downloadUrl: '<String>', expiryEnqueuedAt: '<Datetime>', filePath: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', promotedAt: '<Datetime>', size: '<BigInt>', status: '<FileStatus>', tags: '<String>', upload: '<Upload>' });
```

### PlatformBucket

```typescript
// List all platformBuckets
const { data, isLoading } = usePlatformBucketsQuery({
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } },
});

// Get one platformBucket
const { data: item } = usePlatformBucketQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, description: true, destinationBucketId: true, id: true, isPublic: true, key: true, maxBulkFiles: true, maxFileSize: true, physicalName: true, stagingTtl: true, tags: true, type: true, updatedAt: true } },
});

// Create a platformBucket
const { mutate: create } = useCreatePlatformBucketMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', description: '<String>', destinationBucketId: '<UUID>', isPublic: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxFileSize: '<BigInt>', physicalName: '<String>', stagingTtl: '<Interval>', tags: '<String>', type: '<BucketType>' });
```

### PlatformFile

```typescript
// List all platformFiles
const { data, isLoading } = usePlatformFilesQuery({
  selection: { fields: { actorId: true, bucketId: true, contentHash: true, createdAt: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } },
});

// Get one platformFile
const { data: item } = usePlatformFileQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, bucketId: true, contentHash: true, createdAt: true, description: true, downloadUrl: true, expiryEnqueuedAt: true, filePath: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, promotedAt: true, size: true, status: true, tags: true, updatedAt: true, upload: true } },
});

// Create a platformFile
const { mutate: create } = useCreatePlatformFileMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', description: '<String>', downloadUrl: '<String>', expiryEnqueuedAt: '<Datetime>', filePath: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', promotedAt: '<Datetime>', size: '<BigInt>', status: '<FileStatus>', tags: '<String>', upload: '<Upload>' });
```

## Custom Operation Hooks

### `useFilesRenameMutation`

filesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FilesRenameInput (required) |

### `usePlatformFilesRenameMutation`

platformFilesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFilesRenameInput (required) |

### `useProvisionBucketMutation`

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

### `useUploadFileMutation`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadFileInput (required) |

### `useUploadFilesMutation`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadFileBulkInput (required) |

### `useUploadPlatformFileMutation`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileInput (required) |

### `useUploadPlatformFilesMutation`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileBulkInput (required) |
