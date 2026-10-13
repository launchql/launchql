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
| `machine` | findMany, findOne, create, update, delete |
| `machineMessage` | findMany, findOne, create, update, delete |
| `machineSession` | findMany, findOne, create, update, delete |

## Table Operations

### `db.machine`

CRUD operations for Machine records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `entityId` | UUID | Yes |
| `facts` | JSON | Yes |
| `id` | UUID | No |
| `isShared` | Boolean | Yes |
| `label` | String | Yes |
| `lastSeenAt` | Datetime | Yes |
| `ownerId` | UUID | Yes |
| `policy` | JSON | Yes |
| `principalId` | UUID | Yes |
| `relayUrl` | String | Yes |
| `revokedAt` | Datetime | Yes |
| `tokenHash` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all machine records
const items = await db.machine.findMany({ select: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, facts: true, id: true, isShared: true, label: true, lastSeenAt: true, ownerId: true, policy: true, principalId: true, relayUrl: true, revokedAt: true, tokenHash: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.machine.findOne({ id: '<UUID>', select: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, facts: true, id: true, isShared: true, label: true, lastSeenAt: true, ownerId: true, policy: true, principalId: true, relayUrl: true, revokedAt: true, tokenHash: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.machine.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', facts: '<JSON>', isShared: '<Boolean>', label: '<String>', lastSeenAt: '<Datetime>', ownerId: '<UUID>', policy: '<JSON>', principalId: '<UUID>', relayUrl: '<String>', revokedAt: '<Datetime>', tokenHash: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.machine.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.machine.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.machineMessage`

CRUD operations for MachineMessage records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `content` | JSON | Yes |
| `createdByPrincipal` | UUID | Yes |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `ownerId` | UUID | Yes |
| `recordedAt` | Datetime | Yes |
| `seq` | BigInt | Yes |
| `sessionId` | UUID | Yes |

**Operations:**

```typescript
// List all machineMessage records
const items = await db.machineMessage.findMany({ select: { actorId: true, content: true, createdByPrincipal: true, entityId: true, id: true, kind: true, ownerId: true, recordedAt: true, seq: true, sessionId: true } }).execute();

// Get one by id
const item = await db.machineMessage.findOne({ id: '<UUID>', select: { actorId: true, content: true, createdByPrincipal: true, entityId: true, id: true, kind: true, ownerId: true, recordedAt: true, seq: true, sessionId: true } }).execute();

// Create
const created = await db.machineMessage.create({ data: { actorId: '<UUID>', content: '<JSON>', createdByPrincipal: '<UUID>', entityId: '<UUID>', kind: '<String>', ownerId: '<UUID>', recordedAt: '<Datetime>', seq: '<BigInt>', sessionId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.machineMessage.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.machineMessage.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.machineSession`

CRUD operations for MachineSession records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `agentMode` | String | Yes |
| `agentSessionRef` | String | Yes |
| `args` | String | Yes |
| `cols` | Int | Yes |
| `command` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `cwd` | String | Yes |
| `endedAt` | Datetime | Yes |
| `entityId` | UUID | Yes |
| `env` | JSON | Yes |
| `exitCode` | Int | Yes |
| `id` | UUID | No |
| `interactive` | Boolean | Yes |
| `lastActivityAt` | Datetime | Yes |
| `lastSeq` | BigInt | Yes |
| `machineId` | UUID | Yes |
| `metadata` | JSON | Yes |
| `ownerId` | UUID | Yes |
| `pid` | Int | Yes |
| `runId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `state` | String | Yes |
| `termRows` | Int | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all machineSession records
const items = await db.machineSession.findMany({ select: { agentMode: true, agentSessionRef: true, args: true, cols: true, command: true, createdAt: true, createdBy: true, createdByPrincipal: true, cwd: true, endedAt: true, entityId: true, env: true, exitCode: true, id: true, interactive: true, lastActivityAt: true, lastSeq: true, machineId: true, metadata: true, ownerId: true, pid: true, runId: true, startedAt: true, state: true, termRows: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.machineSession.findOne({ id: '<UUID>', select: { agentMode: true, agentSessionRef: true, args: true, cols: true, command: true, createdAt: true, createdBy: true, createdByPrincipal: true, cwd: true, endedAt: true, entityId: true, env: true, exitCode: true, id: true, interactive: true, lastActivityAt: true, lastSeq: true, machineId: true, metadata: true, ownerId: true, pid: true, runId: true, startedAt: true, state: true, termRows: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.machineSession.create({ data: { agentMode: '<String>', agentSessionRef: '<String>', args: '<String>', cols: '<Int>', command: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', cwd: '<String>', endedAt: '<Datetime>', entityId: '<UUID>', env: '<JSON>', exitCode: '<Int>', interactive: '<Boolean>', lastActivityAt: '<Datetime>', lastSeq: '<BigInt>', machineId: '<UUID>', metadata: '<JSON>', ownerId: '<UUID>', pid: '<Int>', runId: '<UUID>', startedAt: '<Datetime>', state: '<String>', termRows: '<Int>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.machineSession.update({ where: { id: '<UUID>' }, data: { agentMode: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.machineSession.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.mutation.machinesEnroll`

machinesEnroll

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | MachinesEnrollInput (required) |

```typescript
const result = await db.mutation.machinesEnroll({ input: { entityId: '<UUID>', isShared: '<Boolean>', label: '<String>', relayUrl: '<String>', tokenHash: '<String>' } }).execute();
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
