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
| `commit` | commit CRUD operations |
| `get-all-tree-nodes-record` | getAllTreeNodesRecord CRUD operations |
| `object` | object CRUD operations |
| `ref` | ref CRUD operations |
| `store` | store CRUD operations |
| `init-empty-repo` | initEmptyRepo |
| `insert-node-at-path` | insertNodeAtPath |
| `insert-nodes-at-paths` | insertNodesAtPaths |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |
| `set-and-commit` | setAndCommit |
| `set-data-at-path` | setDataAtPath |
| `set-many-and-commit` | setManyAndCommit |

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

### `commit`

CRUD operations for Commit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all commit records |
| `find-first` | Find first matching commit record |
| `get` | Get a commit by id |
| `create` | Create a new commit |
| `update` | Update an existing commit |
| `delete` | Delete a commit |

**Fields:**

| Field | Type |
|-------|------|
| `authorId` | UUID |
| `committerId` | UUID |
| `databaseId` | UUID |
| `date` | Datetime |
| `id` | UUID |
| `message` | String |
| `parentIds` | UUID |
| `storeId` | UUID |
| `treeId` | UUID |

**Required create fields:** `databaseId`, `storeId`
**Optional create fields (backend defaults):** `authorId`, `committerId`, `date`, `message`, `parentIds`, `treeId`

### `get-all-tree-nodes-record`

CRUD operations for GetAllTreeNodesRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all getAllTreeNodesRecord records |
| `find-first` | Find first matching getAllTreeNodesRecord record |
| `get` | Get a getAllTreeNodesRecord by id |
| `create` | Create a new getAllTreeNodesRecord |
| `update` | Update an existing getAllTreeNodesRecord |
| `delete` | Delete a getAllTreeNodesRecord |

**Fields:**

| Field | Type |
|-------|------|
| `data` | JSON |
| `path` | String |

**Required create fields:** `data`, `path`

### `object`

CRUD operations for Object records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all object records |
| `find-first` | Find first matching object record |
| `get` | Get a object by id |
| `create` | Create a new object |
| `update` | Update an existing object |
| `delete` | Delete a object |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `databaseId` | UUID |
| `id` | UUID |
| `kids` | UUID |
| `ktree` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `data`, `kids`, `ktree`

### `ref`

CRUD operations for Ref records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all ref records |
| `find-first` | Find first matching ref record |
| `get` | Get a ref by id |
| `create` | Create a new ref |
| `update` | Update an existing ref |
| `delete` | Delete a ref |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `name` | String |
| `storeId` | UUID |

**Required create fields:** `databaseId`, `name`, `storeId`
**Optional create fields (backend defaults):** `commitId`

### `store`

CRUD operations for Store records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all store records |
| `find-first` | Find first matching store record |
| `get` | Get a store by id |
| `create` | Create a new store |
| `update` | Update an existing store |
| `delete` | Delete a store |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `hash` | UUID |
| `id` | UUID |
| `name` | String |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `hash`

## Custom Operations

### `init-empty-repo`

initEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

### `insert-node-at-path`

insertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.data` | JSON |
  | `--input.kids` | UUID |
  | `--input.ktree` | String |
  | `--input.path` | String |
  | `--input.root` | UUID |
  | `--input.sId` | UUID |

### `insert-nodes-at-paths`

insertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.datas` | JSON |
  | `--input.kidsList` | JSON |
  | `--input.ktreeList` | JSON |
  | `--input.paths` | JSON |
  | `--input.root` | UUID |
  | `--input.sId` | UUID |

### `provision-bucket`

Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.ownerId` | UUID |

### `set-and-commit`

setAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.data` | JSON |
  | `--input.kids` | UUID |
  | `--input.ktree` | String |
  | `--input.message` | String |
  | `--input.path` | String |
  | `--input.refname` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

### `set-data-at-path`

setDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.data` | JSON |
  | `--input.path` | String |
  | `--input.root` | UUID |
  | `--input.sId` | UUID |

### `set-many-and-commit`

setManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entries` | JSON |
  | `--input.message` | String |
  | `--input.refname` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

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
