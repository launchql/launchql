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
| `machine` | machine CRUD operations |
| `machine-message` | machineMessage CRUD operations |
| `machine-session` | machineSession CRUD operations |
| `machines-enroll` | machinesEnroll |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |

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

### `machine`

CRUD operations for Machine records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all machine records |
| `find-first` | Find first matching machine record |
| `get` | Get a machine by id |
| `create` | Create a new machine |
| `update` | Update an existing machine |
| `delete` | Delete a machine |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `entityId` | UUID |
| `facts` | JSON |
| `id` | UUID |
| `isShared` | Boolean |
| `label` | String |
| `lastSeenAt` | Datetime |
| `ownerId` | UUID |
| `policy` | JSON |
| `principalId` | UUID |
| `relayUrl` | String |
| `revokedAt` | Datetime |
| `tokenHash` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `entityId`, `label`, `ownerId`, `tokenHash`
**Optional create fields (backend defaults):** `createdBy`, `createdByPrincipal`, `facts`, `isShared`, `lastSeenAt`, `policy`, `principalId`, `relayUrl`, `revokedAt`, `updatedBy`, `updatedByPrincipal`

### `machine-message`

CRUD operations for MachineMessage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all machineMessage records |
| `find-first` | Find first matching machineMessage record |
| `get` | Get a machineMessage by id |
| `create` | Create a new machineMessage |
| `update` | Update an existing machineMessage |
| `delete` | Delete a machineMessage |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `content` | JSON |
| `createdByPrincipal` | UUID |
| `entityId` | UUID |
| `id` | UUID |
| `kind` | String |
| `ownerId` | UUID |
| `recordedAt` | Datetime |
| `seq` | BigInt |
| `sessionId` | UUID |

**Required create fields:** `actorId`, `kind`, `seq`, `sessionId`
**Optional create fields (backend defaults):** `content`, `createdByPrincipal`, `recordedAt`

### `machine-session`

CRUD operations for MachineSession records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all machineSession records |
| `find-first` | Find first matching machineSession record |
| `get` | Get a machineSession by id |
| `create` | Create a new machineSession |
| `update` | Update an existing machineSession |
| `delete` | Delete a machineSession |

**Fields:**

| Field | Type |
|-------|------|
| `agentMode` | String |
| `agentSessionRef` | String |
| `args` | String |
| `cols` | Int |
| `command` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `cwd` | String |
| `endedAt` | Datetime |
| `entityId` | UUID |
| `env` | JSON |
| `exitCode` | Int |
| `id` | UUID |
| `interactive` | Boolean |
| `lastActivityAt` | Datetime |
| `lastSeq` | BigInt |
| `machineId` | UUID |
| `metadata` | JSON |
| `ownerId` | UUID |
| `pid` | Int |
| `runId` | UUID |
| `startedAt` | Datetime |
| `state` | String |
| `termRows` | Int |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `machineId`, `ownerId`
**Optional create fields (backend defaults):** `agentMode`, `agentSessionRef`, `args`, `cols`, `command`, `createdBy`, `createdByPrincipal`, `cwd`, `endedAt`, `env`, `exitCode`, `interactive`, `lastActivityAt`, `lastSeq`, `metadata`, `pid`, `runId`, `startedAt`, `state`, `termRows`, `updatedBy`, `updatedByPrincipal`

## Custom Operations

### `machines-enroll`

machinesEnroll

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.isShared` | Boolean |
  | `--input.label` | String |
  | `--input.relayUrl` | String |
  | `--input.tokenHash` | String |

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
