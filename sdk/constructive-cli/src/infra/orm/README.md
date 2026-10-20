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
| `contentPreset` | findMany, findOne, create, update, delete |
| `dbPreset` | findMany, findOne, create, update, delete |
| `namespace` | findMany, findOne, create, update, delete |
| `namespaceEvent` | findMany, findOne, create, update, delete |
| `platformInfraCommit` | findMany, findOne, create, update, delete |
| `platformInfraGetAllTreeNodesRecord` | findMany, findOne, create, update, delete |
| `platformInfraObject` | findMany, findOne, create, update, delete |
| `platformInfraRef` | findMany, findOne, create, update, delete |
| `platformInfraStore` | findMany, findOne, create, update, delete |
| `platformNamespace` | findMany, findOne, create, update, delete |
| `platformNamespaceEvent` | findMany, findOne, create, update, delete |

## Table Operations

### `db.contentPreset`

CRUD operations for ContentPreset records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `active` | Boolean | Yes |
| `commitId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `definition` | JSON | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `label` | String | Yes |
| `slug` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all contentPreset records
const items = await db.contentPreset.findMany({ select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, kind: true, label: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.contentPreset.findOne({ id: '<UUID>', select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, kind: true, label: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Create
const created = await db.contentPreset.create({ data: { active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', kind: '<String>', label: '<String>', slug: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.contentPreset.update({ where: { id: '<UUID>' }, data: { active: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.contentPreset.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.dbPreset`

CRUD operations for DbPreset records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `active` | Boolean | Yes |
| `commitId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `definition` | JSON | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `label` | String | Yes |
| `modulesHash` | UUID | Yes |
| `slug` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all dbPreset records
const items = await db.dbPreset.findMany({ select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, modulesHash: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.dbPreset.findOne({ id: '<UUID>', select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, modulesHash: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Create
const created = await db.dbPreset.create({ data: { active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', label: '<String>', modulesHash: '<UUID>', slug: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.dbPreset.update({ where: { id: '<UUID>' }, data: { active: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.dbPreset.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.namespace`

CRUD operations for Namespace records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `clusterId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `isManaged` | Boolean | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `name` | String | Yes |
| `namespaceName` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all namespace records
const items = await db.namespace.findMany({ select: { annotations: true, clusterId: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.namespace.findOne({ id: '<UUID>', select: { annotations: true, clusterId: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } }).execute();

// Create
const created = await db.namespace.create({ data: { annotations: '<JSON>', clusterId: '<UUID>', databaseId: '<UUID>', description: '<String>', isActive: '<Boolean>', isManaged: '<Boolean>', labels: '<JSON>', lastError: '<String>', name: '<String>', namespaceName: '<String>', status: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.namespace.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.namespace.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.namespaceEvent`

CRUD operations for NamespaceEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `namespaceId` | UUID | Yes |

**Operations:**

```typescript
// List all namespaceEvent records
const items = await db.namespaceEvent.findMany({ select: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } }).execute();

// Get one by id
const item = await db.namespaceEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } }).execute();

// Create
const created = await db.namespaceEvent.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', namespaceId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.namespaceEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.namespaceEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformInfraCommit`

CRUD operations for PlatformInfraCommit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `authorId` | UUID | Yes |
| `committerId` | UUID | Yes |
| `date` | Datetime | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `parentIds` | UUID | Yes |
| `scopeId` | UUID | Yes |
| `storeId` | UUID | Yes |
| `treeId` | UUID | Yes |

**Operations:**

```typescript
// List all platformInfraCommit records
const items = await db.platformInfraCommit.findMany({ select: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } }).execute();

// Get one by id
const item = await db.platformInfraCommit.findOne({ id: '<UUID>', select: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } }).execute();

// Create
const created = await db.platformInfraCommit.create({ data: { authorId: '<UUID>', committerId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', scopeId: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformInfraCommit.update({ where: { id: '<UUID>' }, data: { authorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformInfraCommit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformInfraGetAllTreeNodesRecord`

CRUD operations for PlatformInfraGetAllTreeNodesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `data` | JSON | Yes |
| `path` | String | Yes |

**Operations:**

```typescript
// List all platformInfraGetAllTreeNodesRecord records
const items = await db.platformInfraGetAllTreeNodesRecord.findMany({ select: { data: true, path: true } }).execute();

// Get one by id
const item = await db.platformInfraGetAllTreeNodesRecord.findOne({ id: '<UUID>', select: { data: true, path: true } }).execute();

// Create
const created = await db.platformInfraGetAllTreeNodesRecord.create({ data: { data: '<JSON>', path: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformInfraGetAllTreeNodesRecord.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformInfraGetAllTreeNodesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformInfraObject`

CRUD operations for PlatformInfraObject records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `id` | UUID | No |
| `kids` | UUID | Yes |
| `ktree` | String | Yes |
| `scopeId` | UUID | Yes |

**Operations:**

```typescript
// List all platformInfraObject records
const items = await db.platformInfraObject.findMany({ select: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } }).execute();

// Get one by id
const item = await db.platformInfraObject.findOne({ id: '<UUID>', select: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } }).execute();

// Create
const created = await db.platformInfraObject.create({ data: { data: '<JSON>', kids: '<UUID>', ktree: '<String>', scopeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformInfraObject.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformInfraObject.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformInfraRef`

CRUD operations for PlatformInfraRef records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `commitId` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `scopeId` | UUID | Yes |
| `storeId` | UUID | Yes |

**Operations:**

```typescript
// List all platformInfraRef records
const items = await db.platformInfraRef.findMany({ select: { commitId: true, id: true, name: true, scopeId: true, storeId: true } }).execute();

// Get one by id
const item = await db.platformInfraRef.findOne({ id: '<UUID>', select: { commitId: true, id: true, name: true, scopeId: true, storeId: true } }).execute();

// Create
const created = await db.platformInfraRef.create({ data: { commitId: '<UUID>', name: '<String>', scopeId: '<UUID>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformInfraRef.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformInfraRef.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformInfraStore`

CRUD operations for PlatformInfraStore records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `hash` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `scopeId` | UUID | Yes |

**Operations:**

```typescript
// List all platformInfraStore records
const items = await db.platformInfraStore.findMany({ select: { createdAt: true, hash: true, id: true, name: true, scopeId: true } }).execute();

// Get one by id
const item = await db.platformInfraStore.findOne({ id: '<UUID>', select: { createdAt: true, hash: true, id: true, name: true, scopeId: true } }).execute();

// Create
const created = await db.platformInfraStore.create({ data: { hash: '<UUID>', name: '<String>', scopeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformInfraStore.update({ where: { id: '<UUID>' }, data: { hash: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformInfraStore.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformNamespace`

CRUD operations for PlatformNamespace records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `clusterId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `isManaged` | Boolean | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `name` | String | Yes |
| `namespaceName` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformNamespace records
const items = await db.platformNamespace.findMany({ select: { annotations: true, clusterId: true, createdAt: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformNamespace.findOne({ id: '<UUID>', select: { annotations: true, clusterId: true, createdAt: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } }).execute();

// Create
const created = await db.platformNamespace.create({ data: { annotations: '<JSON>', clusterId: '<UUID>', description: '<String>', isActive: '<Boolean>', isManaged: '<Boolean>', labels: '<JSON>', lastError: '<String>', name: '<String>', namespaceName: '<String>', status: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformNamespace.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformNamespace.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformNamespaceEvent`

CRUD operations for PlatformNamespaceEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `namespaceId` | UUID | Yes |

**Operations:**

```typescript
// List all platformNamespaceEvent records
const items = await db.platformNamespaceEvent.findMany({ select: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } }).execute();

// Get one by id
const item = await db.platformNamespaceEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } }).execute();

// Create
const created = await db.platformNamespaceEvent.create({ data: { actorId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', namespaceId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformNamespaceEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformNamespaceEvent.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.mutation.platformInfraInitEmptyRepo`

platformInfraInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraInitEmptyRepoInput (required) |

```typescript
const result = await db.mutation.platformInfraInitEmptyRepo({ input: { sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.platformInfraInsertNodeAtPath`

platformInfraInsertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraInsertNodeAtPathInput (required) |

```typescript
const result = await db.mutation.platformInfraInsertNodeAtPath({ input: '<PlatformInfraInsertNodeAtPathInput>' }).execute();
```

### `db.mutation.platformInfraInsertNodesAtPaths`

platformInfraInsertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraInsertNodesAtPathsInput (required) |

```typescript
const result = await db.mutation.platformInfraInsertNodesAtPaths({ input: '<PlatformInfraInsertNodesAtPathsInput>' }).execute();
```

### `db.mutation.platformInfraSetAndCommit`

platformInfraSetAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraSetAndCommitInput (required) |

```typescript
const result = await db.mutation.platformInfraSetAndCommit({ input: '<PlatformInfraSetAndCommitInput>' }).execute();
```

### `db.mutation.platformInfraSetDataAtPath`

platformInfraSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraSetDataAtPathInput (required) |

```typescript
const result = await db.mutation.platformInfraSetDataAtPath({ input: { data: '<JSON>', path: '<String>', root: '<UUID>', sId: '<UUID>' } }).execute();
```

### `db.mutation.platformInfraSetManyAndCommit`

platformInfraSetManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraSetManyAndCommitInput (required) |

```typescript
const result = await db.mutation.platformInfraSetManyAndCommit({ input: { entries: '<JSON>', message: '<String>', refname: '<String>', sId: '<UUID>', storeId: '<UUID>' } }).execute();
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
