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
| `agent` | findMany, findOne, create, update, delete |
| `agentEvent` | findMany, findOne, create, update, delete |
| `agentMessage` | findMany, findOne, create, update, delete |
| `agentPersona` | findMany, findOne, create, update, delete |
| `agentPlan` | findMany, findOne, create, update, delete |
| `agentPrompt` | findMany, findOne, create, update, delete |
| `agentResourceChunk` | findMany, findOne, create, update, delete |
| `agentResource` | findMany, findOne, create, update, delete |
| `agentRun` | findMany, findOne, create, update, delete |
| `agentRunWorkspace` | findMany, findOne, create, update, delete |
| `agentTask` | findMany, findOne, create, update, delete |
| `agentThread` | findMany, findOne, create, update, delete |
| `platformAgent` | findMany, findOne, create, update, delete |
| `platformAgentEvent` | findMany, findOne, create, update, delete |
| `platformAgentMessage` | findMany, findOne, create, update, delete |
| `platformAgentPersona` | findMany, findOne, create, update, delete |
| `platformAgentPlan` | findMany, findOne, create, update, delete |
| `platformAgentPrompt` | findMany, findOne, create, update, delete |
| `platformAgentResourceChunk` | findMany, findOne, create, update, delete |
| `platformAgentResource` | findMany, findOne, create, update, delete |
| `platformAgentRun` | findMany, findOne, create, update, delete |
| `platformAgentRunWorkspace` | findMany, findOne, create, update, delete |
| `platformAgentTask` | findMany, findOne, create, update, delete |
| `platformAgentThread` | findMany, findOne, create, update, delete |

## Table Operations

### `db.agent`

CRUD operations for Agent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `config` | JSON | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `isEphemeral` | Boolean | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `parentId` | UUID | Yes |
| `personaId` | UUID | Yes |
| `status` | String | Yes |
| `systemPrompt` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all agent records
const items = await db.agent.findMany({ select: { config: true, createdAt: true, databaseId: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.agent.findOne({ id: '<UUID>', select: { config: true, createdAt: true, databaseId: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } }).execute();

// Create
const created = await db.agent.create({ data: { config: '<JSON>', databaseId: '<UUID>', isEphemeral: '<Boolean>', name: '<String>', ownerId: '<UUID>', parentId: '<UUID>', personaId: '<UUID>', status: '<String>', systemPrompt: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agent.update({ where: { id: '<UUID>' }, data: { config: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentEvent`

CRUD operations for AgentEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `entry` | JSON | Yes |
| `id` | UUID | No |
| `recordedAt` | Datetime | Yes |
| `runId` | UUID | Yes |
| `seq` | Int | Yes |
| `transcriptFormat` | String | Yes |
| `transcriptVersion` | Int | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all agentEvent records
const items = await db.agentEvent.findMany({ select: { actorId: true, createdAt: true, databaseId: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.agentEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, databaseId: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.agentEvent.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', entry: '<JSON>', recordedAt: '<Datetime>', runId: '<UUID>', seq: '<Int>', transcriptFormat: '<String>', transcriptVersion: '<Int>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentMessage`

CRUD operations for AgentMessage records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `agentId` | UUID | Yes |
| `authorRole` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `deliveredRunId` | UUID | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `model` | String | Yes |
| `parts` | JSON | Yes |
| `threadId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all agentMessage records
const items = await db.agentMessage.findMany({ select: { actorId: true, agentId: true, authorRole: true, createdAt: true, databaseId: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.agentMessage.findOne({ id: '<UUID>', select: { actorId: true, agentId: true, authorRole: true, createdAt: true, databaseId: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.agentMessage.create({ data: { actorId: '<UUID>', agentId: '<UUID>', authorRole: '<String>', databaseId: '<UUID>', deliveredRunId: '<UUID>', kind: '<String>', model: '<String>', parts: '<JSON>', threadId: '<UUID>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentMessage.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentMessage.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentPersona`

CRUD operations for AgentPersona records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `config` | JSON | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `name` | String | Yes |
| `resources` | String | Yes |
| `slug` | String | Yes |
| `systemPrompt` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all agentPersona records
const items = await db.agentPersona.findMany({ select: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.agentPersona.findOne({ id: '<UUID>', select: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.agentPersona.create({ data: { config: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', isActive: '<Boolean>', name: '<String>', resources: '<String>', slug: '<String>', systemPrompt: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentPersona.update({ where: { id: '<UUID>' }, data: { config: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentPersona.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentPlan`

CRUD operations for AgentPlan records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `ownerId` | UUID | Yes |
| `status` | String | Yes |
| `threadId` | UUID | Yes |
| `title` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all agentPlan records
const items = await db.agentPlan.findMany({ select: { createdAt: true, databaseId: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.agentPlan.findOne({ id: '<UUID>', select: { createdAt: true, databaseId: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.agentPlan.create({ data: { databaseId: '<UUID>', description: '<String>', ownerId: '<UUID>', status: '<String>', threadId: '<UUID>', title: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentPlan.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentPlan.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentPrompt`

CRUD operations for AgentPrompt records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `content` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isDefault` | Boolean | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all agentPrompt records
const items = await db.agentPrompt.findMany({ select: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.agentPrompt.findOne({ id: '<UUID>', select: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.agentPrompt.create({ data: { content: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', isDefault: '<Boolean>', metadata: '<JSON>', name: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentPrompt.update({ where: { id: '<UUID>' }, data: { content: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentPrompt.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentResourceChunk`

CRUD operations for AgentResourceChunk records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `agentResourceId` | UUID | Yes |
| `body` | String | Yes |
| `chunkIndex` | Int | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `embedding` | Vector | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `searchScore` | Float | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all agentResourceChunk records
const items = await db.agentResourceChunk.findMany({ select: { agentResourceId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, searchScore: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.agentResourceChunk.findOne({ id: '<UUID>', select: { agentResourceId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, searchScore: true, updatedAt: true } }).execute();

// Create
const created = await db.agentResourceChunk.create({ data: { agentResourceId: '<UUID>', body: '<String>', chunkIndex: '<Int>', databaseId: '<UUID>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', searchScore: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentResourceChunk.update({ where: { id: '<UUID>' }, data: { agentResourceId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentResourceChunk.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

### `db.agentResource`

CRUD operations for AgentResource records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `archivedAt` | Datetime | Yes |
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `descriptionTrgmSimilarity` | Float | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `isArchived` | Boolean | Yes |
| `keywords` | String | Yes |
| `kind` | String | Yes |
| `kindTrgmSimilarity` | Float | Yes |
| `metadata` | JSON | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `slug` | String | Yes |
| `title` | String | Yes |
| `titleTrgmSimilarity` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all agentResource records
const items = await db.agentResource.findMany({ select: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.agentResource.findOne({ id: '<UUID>', select: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.agentResource.create({ data: { archivedAt: '<Datetime>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', isActive: '<Boolean>', isArchived: '<Boolean>', keywords: '<String>', kind: '<String>', kindTrgmSimilarity: '<Float>', metadata: '<JSON>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentResource.update({ where: { id: '<UUID>' }, data: { archivedAt: '<Datetime>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentResource.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.agentRun`

CRUD operations for AgentRun records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `artifacts` | JSON | Yes |
| `attempt` | Int | Yes |
| `baseCommit` | String | Yes |
| `branch` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `deadlineAt` | Datetime | Yes |
| `entityId` | UUID | Yes |
| `error` | String | Yes |
| `executionId` | UUID | Yes |
| `finishedAt` | Datetime | Yes |
| `headCommit` | String | Yes |
| `id` | UUID | No |
| `lastEventSeq` | Int | Yes |
| `parentRunId` | UUID | Yes |
| `placement` | String | Yes |
| `principalId` | UUID | Yes |
| `repoUrl` | String | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `threadId` | UUID | Yes |
| `tokenUsage` | JSON | Yes |
| `totalCost` | BigFloat | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all agentRun records
const items = await db.agentRun.findMany({ select: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.agentRun.findOne({ id: '<UUID>', select: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.agentRun.create({ data: { actorId: '<UUID>', artifacts: '<JSON>', attempt: '<Int>', baseCommit: '<String>', branch: '<String>', databaseId: '<UUID>', deadlineAt: '<Datetime>', entityId: '<UUID>', error: '<String>', executionId: '<UUID>', finishedAt: '<Datetime>', headCommit: '<String>', lastEventSeq: '<Int>', parentRunId: '<UUID>', placement: '<String>', principalId: '<UUID>', repoUrl: '<String>', startedAt: '<Datetime>', status: '<String>', threadId: '<UUID>', tokenUsage: '<JSON>', totalCost: '<BigFloat>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentRun.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentRun.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentRunWorkspace`

CRUD operations for AgentRunWorkspace records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `artifacts` | JSON | Yes |
| `baseBranch` | String | Yes |
| `baseCommit` | String | Yes |
| `branch` | String | Yes |
| `clonedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `headCommit` | String | Yes |
| `id` | UUID | No |
| `lastUsedAt` | Datetime | Yes |
| `ordinal` | Int | Yes |
| `provider` | String | Yes |
| `publication` | String | Yes |
| `repo` | String | Yes |
| `repositoryId` | UUID | Yes |
| `runId` | UUID | Yes |
| `state` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all agentRunWorkspace records
const items = await db.agentRunWorkspace.findMany({ select: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, databaseId: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.agentRunWorkspace.findOne({ id: '<UUID>', select: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, databaseId: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.agentRunWorkspace.create({ data: { actorId: '<UUID>', artifacts: '<JSON>', baseBranch: '<String>', baseCommit: '<String>', branch: '<String>', clonedAt: '<Datetime>', databaseId: '<UUID>', headCommit: '<String>', lastUsedAt: '<Datetime>', ordinal: '<Int>', provider: '<String>', publication: '<String>', repo: '<String>', repositoryId: '<UUID>', runId: '<UUID>', state: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentRunWorkspace.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentRunWorkspace.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentTask`

CRUD operations for AgentTask records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `approvalFeedback` | String | Yes |
| `approvalStatus` | String | Yes |
| `approvedAt` | Datetime | Yes |
| `approvedBy` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `error` | String | Yes |
| `id` | UUID | No |
| `orderIndex` | Int | Yes |
| `planId` | UUID | Yes |
| `requiresApproval` | Boolean | Yes |
| `source` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all agentTask records
const items = await db.agentTask.findMany({ select: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, databaseId: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.agentTask.findOne({ id: '<UUID>', select: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, databaseId: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.agentTask.create({ data: { actorId: '<UUID>', approvalFeedback: '<String>', approvalStatus: '<String>', approvedAt: '<Datetime>', approvedBy: '<UUID>', databaseId: '<UUID>', description: '<String>', error: '<String>', orderIndex: '<Int>', planId: '<UUID>', requiresApproval: '<Boolean>', source: '<String>', status: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentTask.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentTask.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.agentThread`

CRUD operations for AgentThread records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `agentId` | UUID | Yes |
| `archivedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `isArchived` | Boolean | Yes |
| `mode` | String | Yes |
| `model` | String | Yes |
| `ownerId` | UUID | Yes |
| `parentThreadId` | UUID | Yes |
| `promptTemplateId` | UUID | Yes |
| `status` | String | Yes |
| `systemPrompt` | String | Yes |
| `tags` | String | Yes |
| `title` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all agentThread records
const items = await db.agentThread.findMany({ select: { agentId: true, archivedAt: true, createdAt: true, databaseId: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.agentThread.findOne({ id: '<UUID>', select: { agentId: true, archivedAt: true, createdAt: true, databaseId: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.agentThread.create({ data: { agentId: '<UUID>', archivedAt: '<Datetime>', databaseId: '<UUID>', isArchived: '<Boolean>', mode: '<String>', model: '<String>', ownerId: '<UUID>', parentThreadId: '<UUID>', promptTemplateId: '<UUID>', status: '<String>', systemPrompt: '<String>', tags: '<String>', title: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentThread.update({ where: { id: '<UUID>' }, data: { agentId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentThread.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgent`

CRUD operations for PlatformAgent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `config` | JSON | Yes |
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `isEphemeral` | Boolean | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `parentId` | UUID | Yes |
| `personaId` | UUID | Yes |
| `status` | String | Yes |
| `systemPrompt` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformAgent records
const items = await db.platformAgent.findMany({ select: { config: true, createdAt: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformAgent.findOne({ id: '<UUID>', select: { config: true, createdAt: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } }).execute();

// Create
const created = await db.platformAgent.create({ data: { config: '<JSON>', isEphemeral: '<Boolean>', name: '<String>', ownerId: '<UUID>', parentId: '<UUID>', personaId: '<UUID>', status: '<String>', systemPrompt: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgent.update({ where: { id: '<UUID>' }, data: { config: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentEvent`

CRUD operations for PlatformAgentEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `entry` | JSON | Yes |
| `id` | UUID | No |
| `recordedAt` | Datetime | Yes |
| `runId` | UUID | Yes |
| `seq` | Int | Yes |
| `transcriptFormat` | String | Yes |
| `transcriptVersion` | Int | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all platformAgentEvent records
const items = await db.platformAgentEvent.findMany({ select: { actorId: true, createdAt: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.platformAgentEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.platformAgentEvent.create({ data: { actorId: '<UUID>', entry: '<JSON>', recordedAt: '<Datetime>', runId: '<UUID>', seq: '<Int>', transcriptFormat: '<String>', transcriptVersion: '<Int>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentMessage`

CRUD operations for PlatformAgentMessage records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `agentId` | UUID | Yes |
| `authorRole` | String | Yes |
| `createdAt` | Datetime | No |
| `deliveredRunId` | UUID | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `model` | String | Yes |
| `parts` | JSON | Yes |
| `threadId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all platformAgentMessage records
const items = await db.platformAgentMessage.findMany({ select: { actorId: true, agentId: true, authorRole: true, createdAt: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.platformAgentMessage.findOne({ id: '<UUID>', select: { actorId: true, agentId: true, authorRole: true, createdAt: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.platformAgentMessage.create({ data: { actorId: '<UUID>', agentId: '<UUID>', authorRole: '<String>', deliveredRunId: '<UUID>', kind: '<String>', model: '<String>', parts: '<JSON>', threadId: '<UUID>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentMessage.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentMessage.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentPersona`

CRUD operations for PlatformAgentPersona records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `config` | JSON | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `name` | String | Yes |
| `resources` | String | Yes |
| `slug` | String | Yes |
| `systemPrompt` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformAgentPersona records
const items = await db.platformAgentPersona.findMany({ select: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformAgentPersona.findOne({ id: '<UUID>', select: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformAgentPersona.create({ data: { config: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', description: '<String>', isActive: '<Boolean>', name: '<String>', resources: '<String>', slug: '<String>', systemPrompt: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentPersona.update({ where: { id: '<UUID>' }, data: { config: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentPersona.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentPlan`

CRUD operations for PlatformAgentPlan records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `id` | UUID | No |
| `ownerId` | UUID | Yes |
| `status` | String | Yes |
| `threadId` | UUID | Yes |
| `title` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all platformAgentPlan records
const items = await db.platformAgentPlan.findMany({ select: { createdAt: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.platformAgentPlan.findOne({ id: '<UUID>', select: { createdAt: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.platformAgentPlan.create({ data: { description: '<String>', ownerId: '<UUID>', status: '<String>', threadId: '<UUID>', title: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentPlan.update({ where: { id: '<UUID>' }, data: { description: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentPlan.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentPrompt`

CRUD operations for PlatformAgentPrompt records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `content` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isDefault` | Boolean | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformAgentPrompt records
const items = await db.platformAgentPrompt.findMany({ select: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformAgentPrompt.findOne({ id: '<UUID>', select: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformAgentPrompt.create({ data: { content: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', description: '<String>', isDefault: '<Boolean>', metadata: '<JSON>', name: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentPrompt.update({ where: { id: '<UUID>' }, data: { content: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentPrompt.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentResourceChunk`

CRUD operations for PlatformAgentResourceChunk records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `body` | String | Yes |
| `chunkIndex` | Int | Yes |
| `createdAt` | Datetime | No |
| `embedding` | Vector | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `platformAgentResourceId` | UUID | Yes |
| `searchScore` | Float | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformAgentResourceChunk records
const items = await db.platformAgentResourceChunk.findMany({ select: { body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformAgentResourceId: true, searchScore: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformAgentResourceChunk.findOne({ id: '<UUID>', select: { body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformAgentResourceId: true, searchScore: true, updatedAt: true } }).execute();

// Create
const created = await db.platformAgentResourceChunk.create({ data: { body: '<String>', chunkIndex: '<Int>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', platformAgentResourceId: '<UUID>', searchScore: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentResourceChunk.update({ where: { id: '<UUID>' }, data: { body: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentResourceChunk.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

### `db.platformAgentResource`

CRUD operations for PlatformAgentResource records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `archivedAt` | Datetime | Yes |
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `description` | String | Yes |
| `descriptionTrgmSimilarity` | Float | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `isArchived` | Boolean | Yes |
| `keywords` | String | Yes |
| `kind` | String | Yes |
| `kindTrgmSimilarity` | Float | Yes |
| `metadata` | JSON | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `slug` | String | Yes |
| `title` | String | Yes |
| `titleTrgmSimilarity` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformAgentResource records
const items = await db.platformAgentResource.findMany({ select: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformAgentResource.findOne({ id: '<UUID>', select: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformAgentResource.create({ data: { archivedAt: '<Datetime>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', isActive: '<Boolean>', isArchived: '<Boolean>', keywords: '<String>', kind: '<String>', kindTrgmSimilarity: '<Float>', metadata: '<JSON>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentResource.update({ where: { id: '<UUID>' }, data: { archivedAt: '<Datetime>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentResource.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.platformAgentRun`

CRUD operations for PlatformAgentRun records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `artifacts` | JSON | Yes |
| `attempt` | Int | Yes |
| `baseCommit` | String | Yes |
| `branch` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `deadlineAt` | Datetime | Yes |
| `entityId` | UUID | Yes |
| `error` | String | Yes |
| `executionId` | UUID | Yes |
| `finishedAt` | Datetime | Yes |
| `headCommit` | String | Yes |
| `id` | UUID | No |
| `lastEventSeq` | Int | Yes |
| `parentRunId` | UUID | Yes |
| `placement` | String | Yes |
| `principalId` | UUID | Yes |
| `repoUrl` | String | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `threadId` | UUID | Yes |
| `tokenUsage` | JSON | Yes |
| `totalCost` | BigFloat | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all platformAgentRun records
const items = await db.platformAgentRun.findMany({ select: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.platformAgentRun.findOne({ id: '<UUID>', select: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.platformAgentRun.create({ data: { actorId: '<UUID>', artifacts: '<JSON>', attempt: '<Int>', baseCommit: '<String>', branch: '<String>', databaseId: '<UUID>', deadlineAt: '<Datetime>', entityId: '<UUID>', error: '<String>', executionId: '<UUID>', finishedAt: '<Datetime>', headCommit: '<String>', lastEventSeq: '<Int>', parentRunId: '<UUID>', placement: '<String>', principalId: '<UUID>', repoUrl: '<String>', startedAt: '<Datetime>', status: '<String>', threadId: '<UUID>', tokenUsage: '<JSON>', totalCost: '<BigFloat>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentRun.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentRun.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentRunWorkspace`

CRUD operations for PlatformAgentRunWorkspace records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `artifacts` | JSON | Yes |
| `baseBranch` | String | Yes |
| `baseCommit` | String | Yes |
| `branch` | String | Yes |
| `clonedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `headCommit` | String | Yes |
| `id` | UUID | No |
| `lastUsedAt` | Datetime | Yes |
| `ordinal` | Int | Yes |
| `provider` | String | Yes |
| `publication` | String | Yes |
| `repo` | String | Yes |
| `repositoryId` | UUID | Yes |
| `runId` | UUID | Yes |
| `state` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all platformAgentRunWorkspace records
const items = await db.platformAgentRunWorkspace.findMany({ select: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.platformAgentRunWorkspace.findOne({ id: '<UUID>', select: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.platformAgentRunWorkspace.create({ data: { actorId: '<UUID>', artifacts: '<JSON>', baseBranch: '<String>', baseCommit: '<String>', branch: '<String>', clonedAt: '<Datetime>', headCommit: '<String>', lastUsedAt: '<Datetime>', ordinal: '<Int>', provider: '<String>', publication: '<String>', repo: '<String>', repositoryId: '<UUID>', runId: '<UUID>', state: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentRunWorkspace.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentRunWorkspace.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentTask`

CRUD operations for PlatformAgentTask records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `approvalFeedback` | String | Yes |
| `approvalStatus` | String | Yes |
| `approvedAt` | Datetime | Yes |
| `approvedBy` | UUID | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `error` | String | Yes |
| `id` | UUID | No |
| `orderIndex` | Int | Yes |
| `planId` | UUID | Yes |
| `requiresApproval` | Boolean | Yes |
| `source` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all platformAgentTask records
const items = await db.platformAgentTask.findMany({ select: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.platformAgentTask.findOne({ id: '<UUID>', select: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.platformAgentTask.create({ data: { actorId: '<UUID>', approvalFeedback: '<String>', approvalStatus: '<String>', approvedAt: '<Datetime>', approvedBy: '<UUID>', description: '<String>', error: '<String>', orderIndex: '<Int>', planId: '<UUID>', requiresApproval: '<Boolean>', source: '<String>', status: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentTask.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentTask.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformAgentThread`

CRUD operations for PlatformAgentThread records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `agentId` | UUID | Yes |
| `archivedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `isArchived` | Boolean | Yes |
| `mode` | String | Yes |
| `model` | String | Yes |
| `ownerId` | UUID | Yes |
| `parentThreadId` | UUID | Yes |
| `promptTemplateId` | UUID | Yes |
| `status` | String | Yes |
| `systemPrompt` | String | Yes |
| `tags` | String | Yes |
| `title` | String | Yes |
| `updatedAt` | Datetime | No |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all platformAgentThread records
const items = await db.platformAgentThread.findMany({ select: { agentId: true, archivedAt: true, createdAt: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } }).execute();

// Get one by id
const item = await db.platformAgentThread.findOne({ id: '<UUID>', select: { agentId: true, archivedAt: true, createdAt: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } }).execute();

// Create
const created = await db.platformAgentThread.create({ data: { agentId: '<UUID>', archivedAt: '<Datetime>', isArchived: '<Boolean>', mode: '<String>', model: '<String>', ownerId: '<UUID>', parentThreadId: '<UUID>', promptTemplateId: '<UUID>', status: '<String>', systemPrompt: '<String>', tags: '<String>', title: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformAgentThread.update({ where: { id: '<UUID>' }, data: { agentId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformAgentThread.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

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
