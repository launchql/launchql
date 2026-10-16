# csdk CLI

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```bash
# Create a context pointing at your GraphQL endpoint
csdk context create production --endpoint https://api.example.com/graphql

# Set the active context
csdk context use production

# Authenticate
csdk auth set-token <your-token>
```

## Commands

| Command | Description |
|---------|-------------|
| `context` | Manage API contexts (endpoints) |
| `auth` | Manage authentication tokens |
| `config` | Manage config key-value store (per-context) |
| `bucket` | bucket CRUD operations |
| `file` | file CRUD operations |
| `platform-bucket` | platformBucket CRUD operations |
| `platform-file` | platformFile CRUD operations |
| `files-rename` | filesRename |
| `platform-files-rename` | platformFilesRename |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |
| `upload-file` | Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL. |
| `upload-files` | Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call. |
| `upload-platform-file` | Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL. |
| `upload-platform-files` | Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call. |

## Infrastructure Commands

### `context`

Manage named API contexts (kubectl-style).

| Subcommand | Description |
|------------|-------------|
| `create <name> --endpoint <url>` | Create a new context |
| `list` | List all contexts |
| `use <name>` | Set the active context |
| `current` | Show current context |
| `delete <name>` | Delete a context |

Configuration is stored at `~/.csdk/config/`.

### `auth`

Manage authentication tokens per context.

| Subcommand | Description |
|------------|-------------|
| `set-token <token>` | Store bearer token for current context |
| `status` | Show auth status across all contexts |
| `logout` | Remove credentials for current context |

### `config`

Manage per-context key-value configuration variables.

| Subcommand | Description |
|------------|-------------|
| `get <key>` | Get a config value |
| `set <key> <value>` | Set a config value |
| `list` | List all config values |
| `delete <key>` | Delete a config value |

Variables are scoped to the active context and stored at `~/.csdk/config/`.

## Table Commands

### `bucket`

CRUD operations for Bucket records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all bucket records |
| `find-first` | Find first matching bucket record |
| `get` | Get a bucket by id |
| `create` | Create a new bucket |
| `update` | Update an existing bucket |
| `delete` | Delete a bucket |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `allowCustomKeys` | Boolean |
| `allowedMimeTypes` | String |
| `allowedOrigins` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `destinationBucketId` | UUID |
| `id` | UUID |
| `isPublic` | Boolean |
| `key` | String |
| `maxBulkFiles` | Int |
| `maxFileSize` | BigInt |
| `physicalName` | String |
| `stagingTtl` | Interval |
| `tags` | String |
| `type` | BucketType |
| `updatedAt` | Datetime |

**Required create fields:** `actorId`, `databaseId`, `key`
**Optional create fields (backend defaults):** `allowCustomKeys`, `allowedMimeTypes`, `allowedOrigins`, `description`, `destinationBucketId`, `isPublic`, `maxFileSize`, `physicalName`, `stagingTtl`, `tags`, `type`

### `file`

CRUD operations for File records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all file records |
| `find-first` | Find first matching file record |
| `get` | Get a file by id |
| `create` | Create a new file |
| `update` | Update an existing file |
| `delete` | Delete a file |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `bucketId` | UUID |
| `contentHash` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `downloadUrl` | String |
| `expiryEnqueuedAt` | Datetime |
| `filePath` | String |
| `filename` | String |
| `id` | UUID |
| `isPublic` | Boolean |
| `key` | String |
| `mimeType` | String |
| `promotedAt` | Datetime |
| `size` | BigInt |
| `status` | FileStatus |
| `tags` | String |
| `updatedAt` | Datetime |
| `upload` | Upload |

**Required create fields:** `actorId`, `bucketId`, `key`, `mimeType`, `size`
**Optional create fields (backend defaults):** `contentHash`, `description`, `expiryEnqueuedAt`, `filename`, `promotedAt`, `status`, `tags`, `upload`

### `platform-bucket`

CRUD operations for PlatformBucket records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformBucket records |
| `find-first` | Find first matching platformBucket record |
| `get` | Get a platformBucket by id |
| `create` | Create a new platformBucket |
| `update` | Update an existing platformBucket |
| `delete` | Delete a platformBucket |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `allowCustomKeys` | Boolean |
| `allowedMimeTypes` | String |
| `allowedOrigins` | String |
| `createdAt` | Datetime |
| `description` | String |
| `destinationBucketId` | UUID |
| `id` | UUID |
| `isPublic` | Boolean |
| `key` | String |
| `maxBulkFiles` | Int |
| `maxFileSize` | BigInt |
| `physicalName` | String |
| `stagingTtl` | Interval |
| `tags` | String |
| `type` | BucketType |
| `updatedAt` | Datetime |

**Required create fields:** `actorId`, `key`
**Optional create fields (backend defaults):** `allowCustomKeys`, `allowedMimeTypes`, `allowedOrigins`, `description`, `destinationBucketId`, `isPublic`, `maxFileSize`, `physicalName`, `stagingTtl`, `tags`, `type`

### `platform-file`

CRUD operations for PlatformFile records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFile records |
| `find-first` | Find first matching platformFile record |
| `get` | Get a platformFile by id |
| `create` | Create a new platformFile |
| `update` | Update an existing platformFile |
| `delete` | Delete a platformFile |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `bucketId` | UUID |
| `contentHash` | String |
| `createdAt` | Datetime |
| `description` | String |
| `downloadUrl` | String |
| `expiryEnqueuedAt` | Datetime |
| `filePath` | String |
| `filename` | String |
| `id` | UUID |
| `isPublic` | Boolean |
| `key` | String |
| `mimeType` | String |
| `promotedAt` | Datetime |
| `size` | BigInt |
| `status` | FileStatus |
| `tags` | String |
| `updatedAt` | Datetime |
| `upload` | Upload |

**Required create fields:** `actorId`, `bucketId`, `key`, `mimeType`, `size`
**Optional create fields (backend defaults):** `contentHash`, `description`, `expiryEnqueuedAt`, `filename`, `promotedAt`, `status`, `tags`, `upload`

## Custom Operations

### `files-rename`

filesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.fileId` | UUID |
  | `--input.newFilename` | String |

### `platform-files-rename`

platformFilesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.fileId` | UUID |
  | `--input.newFilename` | String |

### `provision-bucket`

Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.ownerId` | UUID |

### `upload-file`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String |
  | `--input.contentHash` | String (required) |
  | `--input.contentType` | String (required) |
  | `--input.filename` | String |
  | `--input.isPublic` | Boolean |
  | `--input.key` | String |
  | `--input.size` | Int (required) |

### `upload-files`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String |
  | `--input.files` | UploadFileBulkFileInput (required) |
  | `--input.isPublic` | Boolean |

### `upload-platform-file`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String |
  | `--input.contentHash` | String (required) |
  | `--input.contentType` | String (required) |
  | `--input.filename` | String |
  | `--input.isPublic` | Boolean |
  | `--input.key` | String |
  | `--input.size` | Int (required) |

### `upload-platform-files`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's `maxBulkFiles` files per call.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String |
  | `--input.files` | UploadPlatformFileBulkFileInput (required) |
  | `--input.isPublic` | Boolean |

## Output

All commands output JSON to stdout. Pipe to `jq` for formatting:

```bash
csdk car list | jq '.[]'
csdk car get --id <uuid> | jq '.'
```

## Non-Interactive Mode

Use `--no-tty` to skip all interactive prompts (useful for scripts and CI):

```bash
csdk --no-tty car create --name "Sedan" --year 2024
```
