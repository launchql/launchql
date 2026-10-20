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
| `app-limit-cap` | appLimitCap CRUD operations |
| `app-limit-caps-default` | appLimitCapsDefault CRUD operations |
| `app-limit` | appLimit CRUD operations |
| `app-limit-credit-code` | appLimitCreditCode CRUD operations |
| `app-limit-credit-code-item` | appLimitCreditCodeItem CRUD operations |
| `app-limit-credit` | appLimitCredit CRUD operations |
| `app-limit-credit-redemption` | appLimitCreditRedemption CRUD operations |
| `app-limit-default` | appLimitDefault CRUD operations |
| `app-limit-event` | appLimitEvent CRUD operations |
| `app-limit-warning` | appLimitWarning CRUD operations |
| `org-limit-aggregate` | orgLimitAggregate CRUD operations |
| `org-limit-cap` | orgLimitCap CRUD operations |
| `org-limit-caps-default` | orgLimitCapsDefault CRUD operations |
| `org-limit` | orgLimit CRUD operations |
| `org-limit-credit` | orgLimitCredit CRUD operations |
| `org-limit-default` | orgLimitDefault CRUD operations |
| `org-limit-event` | orgLimitEvent CRUD operations |
| `org-limit-warning` | orgLimitWarning CRUD operations |
| `capture-app-limit-defaults` | captureAppLimitDefaults |
| `capture-org-limit-defaults` | captureOrgLimitDefaults |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |
| `seed-app-limit-caps-defaults` | seedAppLimitCapsDefaults |
| `seed-app-limit-defaults` | seedAppLimitDefaults |
| `seed-org-limit-caps-defaults` | seedOrgLimitCapsDefaults |
| `seed-org-limit-defaults` | seedOrgLimitDefaults |

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

### `app-limit-cap`

CRUD operations for AppLimitCap records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitCap records |
| `find-first` | Find first matching appLimitCap record |
| `get` | Get a appLimitCap by id |
| `create` | Create a new appLimitCap |
| `update` | Update an existing appLimitCap |
| `delete` | Delete a appLimitCap |

**Fields:**

| Field | Type |
|-------|------|
| `entityId` | UUID |
| `id` | UUID |
| `max` | BigInt |
| `name` | String |

**Required create fields:** `entityId`, `name`
**Optional create fields (backend defaults):** `max`

### `app-limit-caps-default`

CRUD operations for AppLimitCapsDefault records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitCapsDefault records |
| `find-first` | Find first matching appLimitCapsDefault record |
| `get` | Get a appLimitCapsDefault by id |
| `create` | Create a new appLimitCapsDefault |
| `update` | Update an existing appLimitCapsDefault |
| `delete` | Delete a appLimitCapsDefault |

**Fields:**

| Field | Type |
|-------|------|
| `id` | UUID |
| `max` | BigInt |
| `name` | String |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `max`

### `app-limit`

CRUD operations for AppLimit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimit records |
| `find-first` | Find first matching appLimit record |
| `get` | Get a appLimit by id |
| `create` | Create a new appLimit |
| `update` | Update an existing appLimit |
| `delete` | Delete a appLimit |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `entityType` | String |
| `id` | UUID |
| `max` | BigInt |
| `name` | String |
| `num` | BigInt |
| `organizationId` | UUID |
| `periodCredits` | BigInt |
| `planMax` | BigInt |
| `purchasedCredits` | BigInt |
| `softMax` | BigInt |
| `windowDuration` | Interval |
| `windowStart` | Datetime |

**Required create fields:** `actorId`
**Optional create fields (backend defaults):** `entityType`, `max`, `name`, `num`, `organizationId`, `periodCredits`, `planMax`, `purchasedCredits`, `softMax`, `windowDuration`, `windowStart`

### `app-limit-credit-code`

CRUD operations for AppLimitCreditCode records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitCreditCode records |
| `find-first` | Find first matching appLimitCreditCode record |
| `get` | Get a appLimitCreditCode by id |
| `create` | Create a new appLimitCreditCode |
| `update` | Update an existing appLimitCreditCode |
| `delete` | Delete a appLimitCreditCode |

**Fields:**

| Field | Type |
|-------|------|
| `code` | String |
| `currentRedemptions` | Int |
| `expiresAt` | Datetime |
| `id` | UUID |
| `maxRedemptions` | Int |

**Required create fields:** `code`
**Optional create fields (backend defaults):** `currentRedemptions`, `expiresAt`, `maxRedemptions`

### `app-limit-credit-code-item`

CRUD operations for AppLimitCreditCodeItem records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitCreditCodeItem records |
| `find-first` | Find first matching appLimitCreditCodeItem record |
| `get` | Get a appLimitCreditCodeItem by id |
| `create` | Create a new appLimitCreditCodeItem |
| `update` | Update an existing appLimitCreditCodeItem |
| `delete` | Delete a appLimitCreditCodeItem |

**Fields:**

| Field | Type |
|-------|------|
| `amount` | BigInt |
| `creditCodeId` | UUID |
| `creditType` | String |
| `defaultLimitId` | UUID |
| `id` | UUID |

**Required create fields:** `amount`, `creditCodeId`, `defaultLimitId`
**Optional create fields (backend defaults):** `creditType`

### `app-limit-credit`

CRUD operations for AppLimitCredit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitCredit records |
| `find-first` | Find first matching appLimitCredit record |
| `get` | Get a appLimitCredit by id |
| `create` | Create a new appLimitCredit |
| `update` | Update an existing appLimitCredit |
| `delete` | Delete a appLimitCredit |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `amount` | BigInt |
| `creditType` | String |
| `defaultLimitId` | UUID |
| `id` | UUID |
| `reason` | String |

**Required create fields:** `amount`, `defaultLimitId`
**Optional create fields (backend defaults):** `actorId`, `creditType`, `reason`

### `app-limit-credit-redemption`

CRUD operations for AppLimitCreditRedemption records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitCreditRedemption records |
| `find-first` | Find first matching appLimitCreditRedemption record |
| `get` | Get a appLimitCreditRedemption by id |
| `create` | Create a new appLimitCreditRedemption |
| `update` | Update an existing appLimitCreditRedemption |
| `delete` | Delete a appLimitCreditRedemption |

**Fields:**

| Field | Type |
|-------|------|
| `creditCodeId` | UUID |
| `entityId` | UUID |
| `entityType` | String |
| `id` | UUID |
| `organizationId` | UUID |

**Required create fields:** `creditCodeId`, `entityId`
**Optional create fields (backend defaults):** `entityType`, `organizationId`

### `app-limit-default`

CRUD operations for AppLimitDefault records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitDefault records |
| `find-first` | Find first matching appLimitDefault record |
| `get` | Get a appLimitDefault by id |
| `create` | Create a new appLimitDefault |
| `update` | Update an existing appLimitDefault |
| `delete` | Delete a appLimitDefault |

**Fields:**

| Field | Type |
|-------|------|
| `id` | UUID |
| `max` | BigInt |
| `name` | String |
| `softMax` | BigInt |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `max`, `softMax`

### `app-limit-event`

CRUD operations for AppLimitEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitEvent records |
| `find-first` | Find first matching appLimitEvent record |
| `get` | Get a appLimitEvent by id |
| `create` | Create a new appLimitEvent |
| `update` | Update an existing appLimitEvent |
| `delete` | Delete a appLimitEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `delta` | BigInt |
| `entityId` | UUID |
| `entityType` | String |
| `eventType` | String |
| `id` | UUID |
| `maxAtEvent` | BigInt |
| `name` | String |
| `numAfter` | BigInt |
| `numBefore` | BigInt |
| `organizationId` | UUID |
| `reason` | String |

**Optional create fields (backend defaults):** `actorId`, `delta`, `entityId`, `entityType`, `eventType`, `maxAtEvent`, `name`, `numAfter`, `numBefore`, `organizationId`, `reason`

### `app-limit-warning`

CRUD operations for AppLimitWarning records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appLimitWarning records |
| `find-first` | Find first matching appLimitWarning record |
| `get` | Get a appLimitWarning by id |
| `create` | Create a new appLimitWarning |
| `update` | Update an existing appLimitWarning |
| `delete` | Delete a appLimitWarning |

**Fields:**

| Field | Type |
|-------|------|
| `id` | UUID |
| `name` | String |
| `taskIdentifier` | String |
| `thresholdValue` | BigInt |
| `warningType` | String |

**Required create fields:** `name`, `taskIdentifier`, `thresholdValue`, `warningType`

### `org-limit-aggregate`

CRUD operations for OrgLimitAggregate records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimitAggregate records |
| `find-first` | Find first matching orgLimitAggregate record |
| `get` | Get a orgLimitAggregate by id |
| `create` | Create a new orgLimitAggregate |
| `update` | Update an existing orgLimitAggregate |
| `delete` | Delete a orgLimitAggregate |

**Fields:**

| Field | Type |
|-------|------|
| `entityId` | UUID |
| `entityType` | String |
| `id` | UUID |
| `max` | BigInt |
| `name` | String |
| `num` | BigInt |
| `organizationId` | UUID |
| `periodCredits` | BigInt |
| `planMax` | BigInt |
| `purchasedCredits` | BigInt |
| `reserved` | BigInt |
| `softMax` | BigInt |
| `windowDuration` | Interval |
| `windowStart` | Datetime |

**Required create fields:** `entityId`
**Optional create fields (backend defaults):** `entityType`, `max`, `name`, `num`, `organizationId`, `periodCredits`, `planMax`, `purchasedCredits`, `reserved`, `softMax`, `windowDuration`, `windowStart`

### `org-limit-cap`

CRUD operations for OrgLimitCap records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimitCap records |
| `find-first` | Find first matching orgLimitCap record |
| `get` | Get a orgLimitCap by id |
| `create` | Create a new orgLimitCap |
| `update` | Update an existing orgLimitCap |
| `delete` | Delete a orgLimitCap |

**Fields:**

| Field | Type |
|-------|------|
| `entityId` | UUID |
| `id` | UUID |
| `max` | BigInt |
| `name` | String |

**Required create fields:** `entityId`, `name`
**Optional create fields (backend defaults):** `max`

### `org-limit-caps-default`

CRUD operations for OrgLimitCapsDefault records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimitCapsDefault records |
| `find-first` | Find first matching orgLimitCapsDefault record |
| `get` | Get a orgLimitCapsDefault by id |
| `create` | Create a new orgLimitCapsDefault |
| `update` | Update an existing orgLimitCapsDefault |
| `delete` | Delete a orgLimitCapsDefault |

**Fields:**

| Field | Type |
|-------|------|
| `id` | UUID |
| `max` | BigInt |
| `name` | String |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `max`

### `org-limit`

CRUD operations for OrgLimit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimit records |
| `find-first` | Find first matching orgLimit record |
| `get` | Get a orgLimit by id |
| `create` | Create a new orgLimit |
| `update` | Update an existing orgLimit |
| `delete` | Delete a orgLimit |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `entityId` | UUID |
| `entityType` | String |
| `id` | UUID |
| `max` | BigInt |
| `name` | String |
| `num` | BigInt |
| `organizationId` | UUID |
| `periodCredits` | BigInt |
| `planMax` | BigInt |
| `purchasedCredits` | BigInt |
| `softMax` | BigInt |
| `windowDuration` | Interval |
| `windowStart` | Datetime |

**Required create fields:** `actorId`, `entityId`
**Optional create fields (backend defaults):** `entityType`, `max`, `name`, `num`, `organizationId`, `periodCredits`, `planMax`, `purchasedCredits`, `softMax`, `windowDuration`, `windowStart`

### `org-limit-credit`

CRUD operations for OrgLimitCredit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimitCredit records |
| `find-first` | Find first matching orgLimitCredit record |
| `get` | Get a orgLimitCredit by id |
| `create` | Create a new orgLimitCredit |
| `update` | Update an existing orgLimitCredit |
| `delete` | Delete a orgLimitCredit |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `amount` | BigInt |
| `creditType` | String |
| `defaultLimitId` | UUID |
| `entityId` | UUID |
| `entityType` | String |
| `id` | UUID |
| `organizationId` | UUID |
| `reason` | String |

**Required create fields:** `amount`, `defaultLimitId`
**Optional create fields (backend defaults):** `actorId`, `creditType`, `entityId`, `entityType`, `organizationId`, `reason`

### `org-limit-default`

CRUD operations for OrgLimitDefault records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimitDefault records |
| `find-first` | Find first matching orgLimitDefault record |
| `get` | Get a orgLimitDefault by id |
| `create` | Create a new orgLimitDefault |
| `update` | Update an existing orgLimitDefault |
| `delete` | Delete a orgLimitDefault |

**Fields:**

| Field | Type |
|-------|------|
| `id` | UUID |
| `max` | BigInt |
| `name` | String |
| `softMax` | BigInt |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `max`, `softMax`

### `org-limit-event`

CRUD operations for OrgLimitEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimitEvent records |
| `find-first` | Find first matching orgLimitEvent record |
| `get` | Get a orgLimitEvent by id |
| `create` | Create a new orgLimitEvent |
| `update` | Update an existing orgLimitEvent |
| `delete` | Delete a orgLimitEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `delta` | BigInt |
| `entityId` | UUID |
| `entityType` | String |
| `eventType` | String |
| `id` | UUID |
| `maxAtEvent` | BigInt |
| `name` | String |
| `numAfter` | BigInt |
| `numBefore` | BigInt |
| `organizationId` | UUID |
| `reason` | String |

**Optional create fields (backend defaults):** `actorId`, `delta`, `entityId`, `entityType`, `eventType`, `maxAtEvent`, `name`, `numAfter`, `numBefore`, `organizationId`, `reason`

### `org-limit-warning`

CRUD operations for OrgLimitWarning records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgLimitWarning records |
| `find-first` | Find first matching orgLimitWarning record |
| `get` | Get a orgLimitWarning by id |
| `create` | Create a new orgLimitWarning |
| `update` | Update an existing orgLimitWarning |
| `delete` | Delete a orgLimitWarning |

**Fields:**

| Field | Type |
|-------|------|
| `entityId` | UUID |
| `id` | UUID |
| `name` | String |
| `taskIdentifier` | String |
| `thresholdValue` | BigInt |
| `warningType` | String |

**Required create fields:** `name`, `taskIdentifier`, `thresholdValue`, `warningType`
**Optional create fields (backend defaults):** `entityId`

## Custom Operations

### `capture-app-limit-defaults`

captureAppLimitDefaults

- **Type:** query
- **Arguments:** none

### `capture-org-limit-defaults`

captureOrgLimitDefaults

- **Type:** query
- **Arguments:** none

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

### `seed-app-limit-caps-defaults`

seedAppLimitCapsDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.defaults` | JSON |

### `seed-app-limit-defaults`

seedAppLimitDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.defaults` | JSON |

### `seed-org-limit-caps-defaults`

seedOrgLimitCapsDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.defaults` | JSON |

### `seed-org-limit-defaults`

seedOrgLimitDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.defaults` | JSON |

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
