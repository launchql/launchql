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
| `content-preset` | contentPreset CRUD operations |
| `db-preset` | dbPreset CRUD operations |
| `namespace` | namespace CRUD operations |
| `namespace-event` | namespaceEvent CRUD operations |
| `platform-infra-commit` | platformInfraCommit CRUD operations |
| `platform-infra-get-all-tree-nodes-record` | platformInfraGetAllTreeNodesRecord CRUD operations |
| `platform-infra-object` | platformInfraObject CRUD operations |
| `platform-infra-ref` | platformInfraRef CRUD operations |
| `platform-infra-store` | platformInfraStore CRUD operations |
| `platform-namespace` | platformNamespace CRUD operations |
| `platform-namespace-event` | platformNamespaceEvent CRUD operations |
| `platform-infra-init-empty-repo` | platformInfraInitEmptyRepo |
| `platform-infra-insert-node-at-path` | platformInfraInsertNodeAtPath |
| `platform-infra-insert-nodes-at-paths` | platformInfraInsertNodesAtPaths |
| `platform-infra-set-and-commit` | platformInfraSetAndCommit |
| `platform-infra-set-data-at-path` | platformInfraSetDataAtPath |
| `platform-infra-set-many-and-commit` | platformInfraSetManyAndCommit |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |

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

### `content-preset`

CRUD operations for ContentPreset records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all contentPreset records |
| `find-first` | Find first matching contentPreset record |
| `get` | Get a contentPreset by id |
| `create` | Create a new contentPreset |
| `update` | Update an existing contentPreset |
| `delete` | Delete a contentPreset |

**Fields:**

| Field | Type |
|-------|------|
| `active` | Boolean |
| `commitId` | UUID |
| `createdAt` | Datetime |
| `definition` | JSON |
| `description` | String |
| `id` | UUID |
| `kind` | String |
| `label` | String |
| `slug` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `definition`, `kind`, `slug`
**Optional create fields (backend defaults):** `active`, `commitId`, `description`, `label`, `storeId`

### `db-preset`

CRUD operations for DbPreset records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all dbPreset records |
| `find-first` | Find first matching dbPreset record |
| `get` | Get a dbPreset by id |
| `create` | Create a new dbPreset |
| `update` | Update an existing dbPreset |
| `delete` | Delete a dbPreset |

**Fields:**

| Field | Type |
|-------|------|
| `active` | Boolean |
| `commitId` | UUID |
| `createdAt` | Datetime |
| `definition` | JSON |
| `description` | String |
| `id` | UUID |
| `label` | String |
| `modulesHash` | UUID |
| `slug` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `definition`, `slug`
**Optional create fields (backend defaults):** `active`, `commitId`, `description`, `label`, `modulesHash`, `storeId`

### `namespace`

CRUD operations for Namespace records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all namespace records |
| `find-first` | Find first matching namespace record |
| `get` | Get a namespace by id |
| `create` | Create a new namespace |
| `update` | Update an existing namespace |
| `delete` | Delete a namespace |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `clusterId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `isManaged` | Boolean |
| `labels` | JSON |
| `lastError` | String |
| `name` | String |
| `namespaceName` | String |
| `status` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`, `namespaceName`
**Optional create fields (backend defaults):** `annotations`, `clusterId`, `description`, `isActive`, `isManaged`, `labels`, `lastError`, `status`

### `namespace-event`

CRUD operations for NamespaceEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all namespaceEvent records |
| `find-first` | Find first matching namespaceEvent record |
| `get` | Get a namespaceEvent by id |
| `create` | Create a new namespaceEvent |
| `update` | Update an existing namespaceEvent |
| `delete` | Delete a namespaceEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `eventType` | String |
| `id` | UUID |
| `message` | String |
| `metadata` | JSON |
| `namespaceId` | UUID |

**Required create fields:** `databaseId`, `eventType`, `namespaceId`
**Optional create fields (backend defaults):** `actorId`, `message`, `metadata`

### `platform-infra-commit`

CRUD operations for PlatformInfraCommit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformInfraCommit records |
| `find-first` | Find first matching platformInfraCommit record |
| `get` | Get a platformInfraCommit by id |
| `create` | Create a new platformInfraCommit |
| `update` | Update an existing platformInfraCommit |
| `delete` | Delete a platformInfraCommit |

**Fields:**

| Field | Type |
|-------|------|
| `authorId` | UUID |
| `committerId` | UUID |
| `date` | Datetime |
| `id` | UUID |
| `message` | String |
| `parentIds` | UUID |
| `scopeId` | UUID |
| `storeId` | UUID |
| `treeId` | UUID |

**Required create fields:** `scopeId`, `storeId`
**Optional create fields (backend defaults):** `authorId`, `committerId`, `date`, `message`, `parentIds`, `treeId`

### `platform-infra-get-all-tree-nodes-record`

CRUD operations for PlatformInfraGetAllTreeNodesRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformInfraGetAllTreeNodesRecord records |
| `find-first` | Find first matching platformInfraGetAllTreeNodesRecord record |
| `get` | Get a platformInfraGetAllTreeNodesRecord by id |
| `create` | Create a new platformInfraGetAllTreeNodesRecord |
| `update` | Update an existing platformInfraGetAllTreeNodesRecord |
| `delete` | Delete a platformInfraGetAllTreeNodesRecord |

**Fields:**

| Field | Type |
|-------|------|
| `data` | JSON |
| `path` | String |

**Required create fields:** `data`, `path`

### `platform-infra-object`

CRUD operations for PlatformInfraObject records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformInfraObject records |
| `find-first` | Find first matching platformInfraObject record |
| `get` | Get a platformInfraObject by id |
| `create` | Create a new platformInfraObject |
| `update` | Update an existing platformInfraObject |
| `delete` | Delete a platformInfraObject |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `id` | UUID |
| `kids` | UUID |
| `ktree` | String |
| `scopeId` | UUID |

**Required create fields:** `scopeId`
**Optional create fields (backend defaults):** `data`, `kids`, `ktree`

### `platform-infra-ref`

CRUD operations for PlatformInfraRef records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformInfraRef records |
| `find-first` | Find first matching platformInfraRef record |
| `get` | Get a platformInfraRef by id |
| `create` | Create a new platformInfraRef |
| `update` | Update an existing platformInfraRef |
| `delete` | Delete a platformInfraRef |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `id` | UUID |
| `name` | String |
| `scopeId` | UUID |
| `storeId` | UUID |

**Required create fields:** `name`, `scopeId`, `storeId`
**Optional create fields (backend defaults):** `commitId`

### `platform-infra-store`

CRUD operations for PlatformInfraStore records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformInfraStore records |
| `find-first` | Find first matching platformInfraStore record |
| `get` | Get a platformInfraStore by id |
| `create` | Create a new platformInfraStore |
| `update` | Update an existing platformInfraStore |
| `delete` | Delete a platformInfraStore |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `hash` | UUID |
| `id` | UUID |
| `name` | String |
| `scopeId` | UUID |

**Required create fields:** `name`, `scopeId`
**Optional create fields (backend defaults):** `hash`

### `platform-namespace`

CRUD operations for PlatformNamespace records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformNamespace records |
| `find-first` | Find first matching platformNamespace record |
| `get` | Get a platformNamespace by id |
| `create` | Create a new platformNamespace |
| `update` | Update an existing platformNamespace |
| `delete` | Delete a platformNamespace |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `clusterId` | UUID |
| `createdAt` | Datetime |
| `description` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `isManaged` | Boolean |
| `labels` | JSON |
| `lastError` | String |
| `name` | String |
| `namespaceName` | String |
| `status` | String |
| `updatedAt` | Datetime |

**Required create fields:** `name`, `namespaceName`
**Optional create fields (backend defaults):** `annotations`, `clusterId`, `description`, `isActive`, `isManaged`, `labels`, `lastError`, `status`

### `platform-namespace-event`

CRUD operations for PlatformNamespaceEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformNamespaceEvent records |
| `find-first` | Find first matching platformNamespaceEvent record |
| `get` | Get a platformNamespaceEvent by id |
| `create` | Create a new platformNamespaceEvent |
| `update` | Update an existing platformNamespaceEvent |
| `delete` | Delete a platformNamespaceEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `eventType` | String |
| `id` | UUID |
| `message` | String |
| `metadata` | JSON |
| `namespaceId` | UUID |

**Required create fields:** `eventType`, `namespaceId`
**Optional create fields (backend defaults):** `actorId`, `message`, `metadata`

## Custom Operations

### `platform-infra-init-empty-repo`

platformInfraInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

### `platform-infra-insert-node-at-path`

platformInfraInsertNodeAtPath

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

### `platform-infra-insert-nodes-at-paths`

platformInfraInsertNodesAtPaths

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

### `platform-infra-set-and-commit`

platformInfraSetAndCommit

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

### `platform-infra-set-data-at-path`

platformInfraSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.data` | JSON |
  | `--input.path` | String |
  | `--input.root` | UUID |
  | `--input.sId` | UUID |

### `platform-infra-set-many-and-commit`

platformInfraSetManyAndCommit

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
