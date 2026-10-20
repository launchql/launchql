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
| `appInternalSecret` | findMany, findOne, create, update, delete |
| `config` | findMany, findOne, create, update, delete |
| `internalConfig` | findMany, findOne, create, update, delete |
| `internalSecret` | findMany, findOne, create, update, delete |
| `platformConfig` | findMany, findOne, create, update, delete |
| `platformInternalConfig` | findMany, findOne, create, update, delete |
| `platformInternalSecret` | findMany, findOne, create, update, delete |
| `platformSecret` | findMany, findOne, create, update, delete |
| `secret` | findMany, findOne, create, update, delete |

## Table Operations

### `db.appInternalSecret`

CRUD operations for AppInternalSecret records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `realm` | String | Yes |
| `retiredAt` | Datetime | Yes |
| `rotatedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appInternalSecret records
const items = await db.appInternalSecret.findMany({ select: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appInternalSecret.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appInternalSecret.create({ data: { annotations: '<JSON>', description: '<String>', labels: '<JSON>', name: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.appInternalSecret.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appInternalSecret.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.config`

CRUD operations for Config records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `provider` | String | Yes |
| `realm` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `value` | String | Yes |

**Operations:**

```typescript
// List all config records
const items = await db.config.findMany({ select: { annotations: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } }).execute();

// Get one by id
const item = await db.config.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } }).execute();

// Create
const created = await db.config.create({ data: { annotations: '<JSON>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', updatedByPrincipal: '<UUID>', value: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.config.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.config.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.internalConfig`

CRUD operations for InternalConfig records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `provider` | String | Yes |
| `realm` | String | Yes |
| `updatedAt` | Datetime | No |
| `value` | String | Yes |

**Operations:**

```typescript
// List all internalConfig records
const items = await db.internalConfig.findMany({ select: { annotations: true, createdAt: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } }).execute();

// Get one by id
const item = await db.internalConfig.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, databaseId: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } }).execute();

// Create
const created = await db.internalConfig.create({ data: { annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', provider: '<String>', realm: '<String>', value: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.internalConfig.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.internalConfig.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.internalSecret`

CRUD operations for InternalSecret records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `realm` | String | Yes |
| `retiredAt` | Datetime | Yes |
| `rotatedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all internalSecret records
const items = await db.internalSecret.findMany({ select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.internalSecret.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Create
const created = await db.internalSecret.create({ data: { annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', labels: '<JSON>', name: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.internalSecret.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.internalSecret.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformConfig`

CRUD operations for PlatformConfig records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `description` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `provider` | String | Yes |
| `realm` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `value` | String | Yes |

**Operations:**

```typescript
// List all platformConfig records
const items = await db.platformConfig.findMany({ select: { annotations: true, createdAt: true, createdByPrincipal: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } }).execute();

// Get one by id
const item = await db.platformConfig.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, createdByPrincipal: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, updatedAt: true, updatedByPrincipal: true, value: true } }).execute();

// Create
const created = await db.platformConfig.create({ data: { annotations: '<JSON>', createdByPrincipal: '<UUID>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', updatedByPrincipal: '<UUID>', value: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformConfig.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformConfig.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformInternalConfig`

CRUD operations for PlatformInternalConfig records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `provider` | String | Yes |
| `realm` | String | Yes |
| `updatedAt` | Datetime | No |
| `value` | String | Yes |

**Operations:**

```typescript
// List all platformInternalConfig records
const items = await db.platformInternalConfig.findMany({ select: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } }).execute();

// Get one by id
const item = await db.platformInternalConfig.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, provider: true, realm: true, updatedAt: true, value: true } }).execute();

// Create
const created = await db.platformInternalConfig.create({ data: { annotations: '<JSON>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', provider: '<String>', realm: '<String>', value: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformInternalConfig.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformInternalConfig.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformInternalSecret`

CRUD operations for PlatformInternalSecret records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `realm` | String | Yes |
| `retiredAt` | Datetime | Yes |
| `rotatedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformInternalSecret records
const items = await db.platformInternalSecret.findMany({ select: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformInternalSecret.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Create
const created = await db.platformInternalSecret.create({ data: { annotations: '<JSON>', description: '<String>', labels: '<JSON>', name: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformInternalSecret.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformInternalSecret.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformSecret`

CRUD operations for PlatformSecret records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `provider` | String | Yes |
| `realm` | String | Yes |
| `retiredAt` | Datetime | Yes |
| `rotatedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformSecret records
const items = await db.platformSecret.findMany({ select: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformSecret.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Create
const created = await db.platformSecret.create({ data: { annotations: '<JSON>', description: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformSecret.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformSecret.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.secret`

CRUD operations for Secret records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `provider` | String | Yes |
| `realm` | String | Yes |
| `retiredAt` | Datetime | Yes |
| `rotatedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all secret records
const items = await db.secret.findMany({ select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.secret.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, labels: true, name: true, namespaceId: true, provider: true, realm: true, retiredAt: true, rotatedAt: true, updatedAt: true } }).execute();

// Create
const created = await db.secret.create({ data: { annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', provider: '<String>', realm: '<String>', retiredAt: '<Datetime>', rotatedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.secret.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.secret.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.mutation._internalSecretsDel`

_internalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsDelInput (required) |

```typescript
const result = await db.mutation._internalSecretsDel({ input: { databaseId: '<UUID>', realm: '<String>', secretName: '<String>' } }).execute();
```

### `db.mutation._internalSecretsRemoveArray`

_internalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsRemoveArrayInput (required) |

```typescript
const result = await db.mutation._internalSecretsRemoveArray({ input: { databaseId: '<UUID>', realm: '<String>', secretNames: '<String>' } }).execute();
```

### `db.mutation._internalSecretsRotate`

_internalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsRotateInput (required) |

```typescript
const result = await db.mutation._internalSecretsRotate({ input: { algo: '<String>', databaseId: '<UUID>', realm: '<String>', secretName: '<String>', secretValue: '<String>' } }).execute();
```

### `db.mutation._internalSecretsSet`

_internalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _InternalSecretsSetInput (required) |

```typescript
const result = await db.mutation._internalSecretsSet({ input: { algo: '<String>', scopeDatabaseId: '<UUID>', secretName: '<String>', secretRealm: '<String>', secretValue: '<String>' } }).execute();
```

### `db.mutation._secretsDel`

_secretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsDelInput (required) |

```typescript
const result = await db.mutation._secretsDel({ input: { databaseId: '<UUID>', namespaceId: '<UUID>', realm: '<String>', secretName: '<String>' } }).execute();
```

### `db.mutation._secretsRemoveArray`

_secretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsRemoveArrayInput (required) |

```typescript
const result = await db.mutation._secretsRemoveArray({ input: { databaseId: '<UUID>', namespaceId: '<UUID>', realm: '<String>', secretNames: '<String>' } }).execute();
```

### `db.mutation._secretsRotate`

_secretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsRotateInput (required) |

```typescript
const result = await db.mutation._secretsRotate({ input: '<_SecretsRotateInput>' }).execute();
```

### `db.mutation._secretsSet`

_secretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | _SecretsSetInput (required) |

```typescript
const result = await db.mutation._secretsSet({ input: '<_SecretsSetInput>' }).execute();
```

### `db.mutation.appInternalSecretsDel`

appInternalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsDelInput (required) |

```typescript
const result = await db.mutation.appInternalSecretsDel({ input: { realm: '<String>', secretName: '<String>' } }).execute();
```

### `db.mutation.appInternalSecretsRemoveArray`

appInternalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsRemoveArrayInput (required) |

```typescript
const result = await db.mutation.appInternalSecretsRemoveArray({ input: { realm: '<String>', secretNames: '<String>' } }).execute();
```

### `db.mutation.appInternalSecretsRotate`

appInternalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsRotateInput (required) |

```typescript
const result = await db.mutation.appInternalSecretsRotate({ input: { algo: '<String>', realm: '<String>', secretName: '<String>', secretValue: '<String>' } }).execute();
```

### `db.mutation.appInternalSecretsSet`

appInternalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AppInternalSecretsSetInput (required) |

```typescript
const result = await db.mutation.appInternalSecretsSet({ input: { algo: '<String>', secretName: '<String>', secretRealm: '<String>', secretValue: '<String>' } }).execute();
```

### `db.mutation.platformInternalSecretsDel`

platformInternalSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsDelInput (required) |

```typescript
const result = await db.mutation.platformInternalSecretsDel({ input: { realm: '<String>', secretName: '<String>' } }).execute();
```

### `db.mutation.platformInternalSecretsRemoveArray`

platformInternalSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsRemoveArrayInput (required) |

```typescript
const result = await db.mutation.platformInternalSecretsRemoveArray({ input: { realm: '<String>', secretNames: '<String>' } }).execute();
```

### `db.mutation.platformInternalSecretsRotate`

platformInternalSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsRotateInput (required) |

```typescript
const result = await db.mutation.platformInternalSecretsRotate({ input: { algo: '<String>', realm: '<String>', secretName: '<String>', secretValue: '<String>' } }).execute();
```

### `db.mutation.platformInternalSecretsSet`

platformInternalSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInternalSecretsSetInput (required) |

```typescript
const result = await db.mutation.platformInternalSecretsSet({ input: { algo: '<String>', secretName: '<String>', secretRealm: '<String>', secretValue: '<String>' } }).execute();
```

### `db.mutation.platformSecretsDel`

platformSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsDelInput (required) |

```typescript
const result = await db.mutation.platformSecretsDel({ input: { namespaceId: '<UUID>', realm: '<String>', secretName: '<String>' } }).execute();
```

### `db.mutation.platformSecretsRemoveArray`

platformSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsRemoveArrayInput (required) |

```typescript
const result = await db.mutation.platformSecretsRemoveArray({ input: { namespaceId: '<UUID>', realm: '<String>', secretNames: '<String>' } }).execute();
```

### `db.mutation.platformSecretsRotate`

platformSecretsRotate

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsRotateInput (required) |

```typescript
const result = await db.mutation.platformSecretsRotate({ input: { algo: '<String>', namespaceId: '<UUID>', realm: '<String>', secretName: '<String>', secretValue: '<String>' } }).execute();
```

### `db.mutation.platformSecretsSet`

platformSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsSetInput (required) |

```typescript
const result = await db.mutation.platformSecretsSet({ input: '<PlatformSecretsSetInput>' }).execute();
```

### `db.mutation.provisionBucket`

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
  | `input` | ProvisionBucketInput (required) |

```typescript
const result = await db.mutation.provisionBucket({ input: { bucketKey: '<String>', ownerId: '<UUID>' } }).execute();
```
