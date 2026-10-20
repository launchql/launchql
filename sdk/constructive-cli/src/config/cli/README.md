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
| `app-internal-secret` | appInternalSecret CRUD operations |
| `config` | config CRUD operations |
| `internal-config` | internalConfig CRUD operations |
| `internal-secret` | internalSecret CRUD operations |
| `platform-config` | platformConfig CRUD operations |
| `platform-internal-config` | platformInternalConfig CRUD operations |
| `platform-internal-secret` | platformInternalSecret CRUD operations |
| `platform-secret` | platformSecret CRUD operations |
| `secret` | secret CRUD operations |
| `internal-secrets-del` | _internalSecretsDel |
| `internal-secrets-remove-array` | _internalSecretsRemoveArray |
| `internal-secrets-rotate` | _internalSecretsRotate |
| `internal-secrets-set` | _internalSecretsSet |
| `secrets-del` | _secretsDel |
| `secrets-remove-array` | _secretsRemoveArray |
| `secrets-rotate` | _secretsRotate |
| `secrets-set` | _secretsSet |
| `app-internal-secrets-del` | appInternalSecretsDel |
| `app-internal-secrets-remove-array` | appInternalSecretsRemoveArray |
| `app-internal-secrets-rotate` | appInternalSecretsRotate |
| `app-internal-secrets-set` | appInternalSecretsSet |
| `platform-internal-secrets-del` | platformInternalSecretsDel |
| `platform-internal-secrets-remove-array` | platformInternalSecretsRemoveArray |
| `platform-internal-secrets-rotate` | platformInternalSecretsRotate |
| `platform-internal-secrets-set` | platformInternalSecretsSet |
| `platform-secrets-del` | platformSecretsDel |
| `platform-secrets-remove-array` | platformSecretsRemoveArray |
| `platform-secrets-rotate` | platformSecretsRotate |
| `platform-secrets-set` | platformSecretsSet |
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

### `app-internal-secret`

CRUD operations for AppInternalSecret records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appInternalSecret records |
| `find-first` | Find first matching appInternalSecret record |
| `get` | Get a appInternalSecret by id |
| `create` | Create a new appInternalSecret |
| `update` | Update an existing appInternalSecret |
| `delete` | Delete a appInternalSecret |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `description` | String |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `realm` | String |
| `retiredAt` | Datetime |
| `rotatedAt` | Datetime |
| `updatedAt` | Datetime |

**Required create fields:** `annotations`, `description`, `labels`, `name`, `realm`, `retiredAt`, `rotatedAt`

### `config`

CRUD operations for Config records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all config records |
| `find-first` | Find first matching config record |
| `get` | Get a config by id |
| `create` | Create a new config |
| `update` | Update an existing config |
| `delete` | Delete a config |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `description` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `namespaceId` | UUID |
| `provider` | String |
| `realm` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `value` | String |

**Required create fields:** `databaseId`, `name`, `namespaceId`
**Optional create fields (backend defaults):** `annotations`, `createdByPrincipal`, `description`, `expiresAt`, `labels`, `provider`, `realm`, `updatedByPrincipal`, `value`

### `internal-config`

CRUD operations for InternalConfig records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all internalConfig records |
| `find-first` | Find first matching internalConfig record |
| `get` | Get a internalConfig by id |
| `create` | Create a new internalConfig |
| `update` | Update an existing internalConfig |
| `delete` | Delete a internalConfig |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `provider` | String |
| `realm` | String |
| `updatedAt` | Datetime |
| `value` | String |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `annotations`, `description`, `expiresAt`, `labels`, `provider`, `realm`, `value`

### `internal-secret`

CRUD operations for InternalSecret records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all internalSecret records |
| `find-first` | Find first matching internalSecret record |
| `get` | Get a internalSecret by id |
| `create` | Create a new internalSecret |
| `update` | Update an existing internalSecret |
| `delete` | Delete a internalSecret |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `realm` | String |
| `retiredAt` | Datetime |
| `rotatedAt` | Datetime |
| `updatedAt` | Datetime |

**Required create fields:** `annotations`, `databaseId`, `description`, `labels`, `name`, `realm`, `retiredAt`, `rotatedAt`

### `platform-config`

CRUD operations for PlatformConfig records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformConfig records |
| `find-first` | Find first matching platformConfig record |
| `get` | Get a platformConfig by id |
| `create` | Create a new platformConfig |
| `update` | Update an existing platformConfig |
| `delete` | Delete a platformConfig |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `description` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `namespaceId` | UUID |
| `provider` | String |
| `realm` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `value` | String |

**Required create fields:** `name`, `namespaceId`
**Optional create fields (backend defaults):** `annotations`, `createdByPrincipal`, `description`, `expiresAt`, `labels`, `provider`, `realm`, `updatedByPrincipal`, `value`

### `platform-internal-config`

CRUD operations for PlatformInternalConfig records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformInternalConfig records |
| `find-first` | Find first matching platformInternalConfig record |
| `get` | Get a platformInternalConfig by id |
| `create` | Create a new platformInternalConfig |
| `update` | Update an existing platformInternalConfig |
| `delete` | Delete a platformInternalConfig |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `description` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `provider` | String |
| `realm` | String |
| `updatedAt` | Datetime |
| `value` | String |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `annotations`, `description`, `expiresAt`, `labels`, `provider`, `realm`, `value`

### `platform-internal-secret`

CRUD operations for PlatformInternalSecret records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformInternalSecret records |
| `find-first` | Find first matching platformInternalSecret record |
| `get` | Get a platformInternalSecret by id |
| `create` | Create a new platformInternalSecret |
| `update` | Update an existing platformInternalSecret |
| `delete` | Delete a platformInternalSecret |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `description` | String |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `realm` | String |
| `retiredAt` | Datetime |
| `rotatedAt` | Datetime |
| `updatedAt` | Datetime |

**Required create fields:** `annotations`, `description`, `labels`, `name`, `realm`, `retiredAt`, `rotatedAt`

### `platform-secret`

CRUD operations for PlatformSecret records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSecret records |
| `find-first` | Find first matching platformSecret record |
| `get` | Get a platformSecret by id |
| `create` | Create a new platformSecret |
| `update` | Update an existing platformSecret |
| `delete` | Delete a platformSecret |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `description` | String |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `namespaceId` | UUID |
| `provider` | String |
| `realm` | String |
| `retiredAt` | Datetime |
| `rotatedAt` | Datetime |
| `updatedAt` | Datetime |

**Required create fields:** `annotations`, `description`, `labels`, `name`, `namespaceId`, `provider`, `realm`, `retiredAt`, `rotatedAt`

### `secret`

CRUD operations for Secret records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all secret records |
| `find-first` | Find first matching secret record |
| `get` | Get a secret by id |
| `create` | Create a new secret |
| `update` | Update an existing secret |
| `delete` | Delete a secret |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `namespaceId` | UUID |
| `provider` | String |
| `realm` | String |
| `retiredAt` | Datetime |
| `rotatedAt` | Datetime |
| `updatedAt` | Datetime |

**Required create fields:** `annotations`, `databaseId`, `description`, `labels`, `name`, `namespaceId`, `provider`, `realm`, `retiredAt`, `rotatedAt`

## Custom Operations

### `internal-secrets-del`

_internalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.realm` | String |
  | `--input.secretName` | String |

### `internal-secrets-remove-array`

_internalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.realm` | String |
  | `--input.secretNames` | String |

### `internal-secrets-rotate`

_internalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.realm` | String |
  | `--input.secretName` | String |
  | `--input.secretValue` | String |

### `internal-secrets-set`

_internalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.scopeDatabaseId` | UUID |
  | `--input.secretName` | String |
  | `--input.secretRealm` | String |
  | `--input.secretValue` | String |

### `secrets-del`

_secretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.namespaceId` | UUID |
  | `--input.realm` | String |
  | `--input.secretName` | String |

### `secrets-remove-array`

_secretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.namespaceId` | UUID |
  | `--input.realm` | String |
  | `--input.secretNames` | String |

### `secrets-rotate`

_secretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.namespaceId` | UUID |
  | `--input.realm` | String |
  | `--input.secretName` | String |
  | `--input.secretValue` | String |

### `secrets-set`

_secretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.provider` | String |
  | `--input.scopeDatabaseId` | UUID |
  | `--input.secretName` | String |
  | `--input.secretNamespaceId` | UUID |
  | `--input.secretRealm` | String |
  | `--input.secretValue` | String |

### `app-internal-secrets-del`

appInternalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.realm` | String |
  | `--input.secretName` | String |

### `app-internal-secrets-remove-array`

appInternalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.realm` | String |
  | `--input.secretNames` | String |

### `app-internal-secrets-rotate`

appInternalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.realm` | String |
  | `--input.secretName` | String |
  | `--input.secretValue` | String |

### `app-internal-secrets-set`

appInternalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.secretName` | String |
  | `--input.secretRealm` | String |
  | `--input.secretValue` | String |

### `platform-internal-secrets-del`

platformInternalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.realm` | String |
  | `--input.secretName` | String |

### `platform-internal-secrets-remove-array`

platformInternalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.realm` | String |
  | `--input.secretNames` | String |

### `platform-internal-secrets-rotate`

platformInternalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.realm` | String |
  | `--input.secretName` | String |
  | `--input.secretValue` | String |

### `platform-internal-secrets-set`

platformInternalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.secretName` | String |
  | `--input.secretRealm` | String |
  | `--input.secretValue` | String |

### `platform-secrets-del`

platformSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.namespaceId` | UUID |
  | `--input.realm` | String |
  | `--input.secretName` | String |

### `platform-secrets-remove-array`

platformSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.namespaceId` | UUID |
  | `--input.realm` | String |
  | `--input.secretNames` | String |

### `platform-secrets-rotate`

platformSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.namespaceId` | UUID |
  | `--input.realm` | String |
  | `--input.secretName` | String |
  | `--input.secretValue` | String |

### `platform-secrets-set`

platformSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.algo` | String |
  | `--input.clientMutationId` | String |
  | `--input.provider` | String |
  | `--input.secretName` | String |
  | `--input.secretNamespaceId` | UUID |
  | `--input.secretRealm` | String |
  | `--input.secretValue` | String |

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
