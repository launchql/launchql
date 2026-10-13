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
| `build` | findMany, findOne, create, update, delete |
| `buildStep` | findMany, findOne, create, update, delete |
| `builderBinding` | findMany, findOne, create, update, delete |
| `contentPreset` | findMany, findOne, create, update, delete |
| `databaseFunctionGraph` | findMany, findOne, create, update, delete |
| `databaseFunctionGraphExecutionCancelRequest` | findMany, findOne, create, update, delete |
| `databaseFunctionGraphExecution` | findMany, findOne, create, update, delete |
| `databaseFunctionGraphExecutionNodeState` | findMany, findOne, create, update, delete |
| `databaseFunctionGraphExecutionOutput` | findMany, findOne, create, update, delete |
| `databaseGraphCommit` | findMany, findOne, create, update, delete |
| `databaseGraphGetAllTreeNodesRecord` | findMany, findOne, create, update, delete |
| `databaseGraphObject` | findMany, findOne, create, update, delete |
| `databaseGraphRef` | findMany, findOne, create, update, delete |
| `databaseGraphStore` | findMany, findOne, create, update, delete |
| `dbPreset` | findMany, findOne, create, update, delete |
| `functionApiBinding` | findMany, findOne, create, update, delete |
| `functionCapabilityBinding` | findMany, findOne, create, update, delete |
| `functionDefinition` | findMany, findOne, create, update, delete |
| `functionDeployment` | findMany, findOne, create, update, delete |
| `functionDeploymentEvent` | findMany, findOne, create, update, delete |
| `functionExecutionLog` | findMany, findOne, create, update, delete |
| `functionGraphCommit` | findMany, findOne, create, update, delete |
| `functionGraph` | findMany, findOne, create, update, delete |
| `functionGraphExecutionCancelRequest` | findMany, findOne, create, update, delete |
| `functionGraphExecution` | findMany, findOne, create, update, delete |
| `functionGraphExecutionNodeState` | findMany, findOne, create, update, delete |
| `functionGraphExecutionOutput` | findMany, findOne, create, update, delete |
| `functionGraphObject` | findMany, findOne, create, update, delete |
| `functionGraphRef` | findMany, findOne, create, update, delete |
| `functionGraphStore` | findMany, findOne, create, update, delete |
| `functionInvocationAttempt` | findMany, findOne, create, update, delete |
| `functionInvocation` | findMany, findOne, create, update, delete |
| `functionSchedule` | findMany, findOne, create, update, delete |
| `getAllTreeNodesRecord` | findMany, findOne, create, update, delete |
| `image` | findMany, findOne, create, update, delete |
| `imageGrant` | findMany, findOne, create, update, delete |
| `infraCommit` | findMany, findOne, create, update, delete |
| `infraGetAllTreeNodesRecord` | findMany, findOne, create, update, delete |
| `infraObject` | findMany, findOne, create, update, delete |
| `infraRef` | findMany, findOne, create, update, delete |
| `infraStore` | findMany, findOne, create, update, delete |
| `integrationProvider` | findMany, findOne, create, update, delete |
| `namespace` | findMany, findOne, create, update, delete |
| `namespaceEvent` | findMany, findOne, create, update, delete |
| `platformBuild` | findMany, findOne, create, update, delete |
| `platformBuildStep` | findMany, findOne, create, update, delete |
| `platformBuilderBinding` | findMany, findOne, create, update, delete |
| `platformFunctionApiBinding` | findMany, findOne, create, update, delete |
| `platformFunctionCapabilityBinding` | findMany, findOne, create, update, delete |
| `platformFunctionDefinition` | findMany, findOne, create, update, delete |
| `platformFunctionDeployment` | findMany, findOne, create, update, delete |
| `platformFunctionDeploymentEvent` | findMany, findOne, create, update, delete |
| `platformFunctionExecutionLog` | findMany, findOne, create, update, delete |
| `platformFunctionInvocationAttempt` | findMany, findOne, create, update, delete |
| `platformFunctionInvocation` | findMany, findOne, create, update, delete |
| `platformFunctionSchedule` | findMany, findOne, create, update, delete |
| `platformImage` | findMany, findOne, create, update, delete |
| `platformImageGrant` | findMany, findOne, create, update, delete |
| `platformInfraCommit` | findMany, findOne, create, update, delete |
| `platformInfraGetAllTreeNodesRecord` | findMany, findOne, create, update, delete |
| `platformInfraObject` | findMany, findOne, create, update, delete |
| `platformInfraRef` | findMany, findOne, create, update, delete |
| `platformInfraStore` | findMany, findOne, create, update, delete |
| `platformK8sResourceKind` | findMany, findOne, create, update, delete |
| `platformK8sSpecRule` | findMany, findOne, create, update, delete |
| `platformNamespace` | findMany, findOne, create, update, delete |
| `platformNamespaceEvent` | findMany, findOne, create, update, delete |
| `platformProposalComment` | findMany, findOne, create, update, delete |
| `platformProposal` | findMany, findOne, create, update, delete |
| `platformProposalFileView` | findMany, findOne, create, update, delete |
| `platformProposalReaction` | findMany, findOne, create, update, delete |
| `platformProposalReview` | findMany, findOne, create, update, delete |
| `platformProposalsChunk` | findMany, findOne, create, update, delete |
| `platformRegistryBinding` | findMany, findOne, create, update, delete |
| `platformRegistry` | findMany, findOne, create, update, delete |
| `platformRegistryGrant` | findMany, findOne, create, update, delete |
| `platformRepository` | findMany, findOne, create, update, delete |
| `platformRepositoryEvent` | findMany, findOne, create, update, delete |
| `platformRepositoryRequiredCheck` | findMany, findOne, create, update, delete |
| `platformRepositoryWorkflow` | findMany, findOne, create, update, delete |
| `platformResource` | findMany, findOne, create, update, delete |
| `platformResourceDeclaredCapacity` | findMany, findOne, create, update, delete |
| `platformResourceDefinition` | findMany, findOne, create, update, delete |
| `platformResourceEvent` | findMany, findOne, create, update, delete |
| `platformResourceInstallation` | findMany, findOne, create, update, delete |
| `platformResourceObservedStorage` | findMany, findOne, create, update, delete |
| `platformResourceStatusCheck` | findMany, findOne, create, update, delete |
| `platformResourceUsageLog` | findMany, findOne, create, update, delete |
| `platformResourceUsageSummary` | findMany, findOne, create, update, delete |
| `platformResourceUtilization` | findMany, findOne, create, update, delete |
| `platformResourcesHealth` | findMany, findOne, create, update, delete |
| `platformResourcesRequirementsState` | findMany, findOne, create, update, delete |
| `platformResourcesResolvedRequirement` | findMany, findOne, create, update, delete |
| `platformWebhookEndpoint` | findMany, findOne, create, update, delete |
| `platformWebhookEvent` | findMany, findOne, create, update, delete |
| `proposalComment` | findMany, findOne, create, update, delete |
| `proposal` | findMany, findOne, create, update, delete |
| `proposalFileView` | findMany, findOne, create, update, delete |
| `proposalReaction` | findMany, findOne, create, update, delete |
| `proposalReview` | findMany, findOne, create, update, delete |
| `proposalsChunk` | findMany, findOne, create, update, delete |
| `registryBinding` | findMany, findOne, create, update, delete |
| `registry` | findMany, findOne, create, update, delete |
| `registryGrant` | findMany, findOne, create, update, delete |
| `repository` | findMany, findOne, create, update, delete |
| `repositoryEvent` | findMany, findOne, create, update, delete |
| `repositoryRequiredCheck` | findMany, findOne, create, update, delete |
| `repositoryWorkflow` | findMany, findOne, create, update, delete |
| `resource` | findMany, findOne, create, update, delete |
| `resourceDeclaredCapacity` | findMany, findOne, create, update, delete |
| `resourceDefinition` | findMany, findOne, create, update, delete |
| `resourceEvent` | findMany, findOne, create, update, delete |
| `resourceInstallation` | findMany, findOne, create, update, delete |
| `resourceObservedStorage` | findMany, findOne, create, update, delete |
| `resourceStatusCheck` | findMany, findOne, create, update, delete |
| `resourceUsageLog` | findMany, findOne, create, update, delete |
| `resourceUsageSummary` | findMany, findOne, create, update, delete |
| `resourceUtilization` | findMany, findOne, create, update, delete |
| `resourcesHealth` | findMany, findOne, create, update, delete |
| `resourcesRequirementsState` | findMany, findOne, create, update, delete |
| `resourcesResolvedRequirement` | findMany, findOne, create, update, delete |
| `webhookEndpoint` | findMany, findOne, create, update, delete |
| `webhookEvent` | findMany, findOne, create, update, delete |

## Table Operations

### `db.build`

CRUD operations for Build records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `attempt` | Int | Yes |
| `commitSha` | String | Yes |
| `conclusion` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `eventId` | UUID | Yes |
| `finishedAt` | Datetime | Yes |
| `id` | UUID | No |
| `imageRef` | String | Yes |
| `jobId` | BigInt | Yes |
| `logs` | ConstructiveInternalTypeUpload | Yes |
| `matrixKey` | String | Yes |
| `metadata` | JSON | Yes |
| `proposalId` | UUID | Yes |
| `ref` | String | Yes |
| `repositoryId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `workflowId` | UUID | Yes |

**Operations:**

```typescript
// List all build records
const items = await db.build.findMany({ select: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, databaseId: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } }).execute();

// Get one by id
const item = await db.build.findOne({ id: '<UUID>', select: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, databaseId: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } }).execute();

// Create
const created = await db.build.create({ data: { actorId: '<UUID>', attempt: '<Int>', commitSha: '<String>', conclusion: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', eventId: '<UUID>', finishedAt: '<Datetime>', imageRef: '<String>', jobId: '<BigInt>', logs: '<Upload>', matrixKey: '<String>', metadata: '<JSON>', proposalId: '<UUID>', ref: '<String>', repositoryId: '<UUID>', startedAt: '<Datetime>', status: '<String>', updatedByPrincipal: '<UUID>', workflowId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.build.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.build.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.buildStep`

CRUD operations for BuildStep records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `buildId` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `exitCode` | Int | Yes |
| `finishedAt` | Datetime | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `logBytes` | BigInt | Yes |
| `logOffset` | BigInt | Yes |
| `name` | String | Yes |
| `parentSeq` | Int | Yes |
| `recordedAt` | Datetime | Yes |
| `seq` | Int | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `summary` | JSON | Yes |

**Operations:**

```typescript
// List all buildStep records
const items = await db.buildStep.findMany({ select: { buildId: true, createdByPrincipal: true, databaseId: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } }).execute();

// Get one by id
const item = await db.buildStep.findOne({ id: '<UUID>', select: { buildId: true, createdByPrincipal: true, databaseId: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } }).execute();

// Create
const created = await db.buildStep.create({ data: { buildId: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', exitCode: '<Int>', finishedAt: '<Datetime>', kind: '<String>', logBytes: '<BigInt>', logOffset: '<BigInt>', name: '<String>', parentSeq: '<Int>', recordedAt: '<Datetime>', seq: '<Int>', startedAt: '<Datetime>', status: '<String>', summary: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.buildStep.update({ where: { id: '<UUID>' }, data: { buildId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.buildStep.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.builderBinding`

CRUD operations for BuilderBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `installationId` | UUID | Yes |
| `lastError` | String | Yes |
| `metadata` | JSON | Yes |
| `namespaceId` | UUID | Yes |
| `observedHost` | String | Yes |
| `realm` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all builderBinding records
const items = await db.builderBinding.findMany({ select: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.builderBinding.findOne({ id: '<UUID>', select: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.builderBinding.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', installationId: '<UUID>', lastError: '<String>', metadata: '<JSON>', namespaceId: '<UUID>', observedHost: '<String>', realm: '<String>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.builderBinding.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.builderBinding.delete({ where: { id: '<UUID>' } }).execute();
```

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

### `db.databaseFunctionGraph`

CRUD operations for DatabaseFunctionGraph records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `context` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `definitionsCommitId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isValid` | Boolean | Yes |
| `name` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `validationErrors` | JSON | Yes |

**Operations:**

```typescript
// List all databaseFunctionGraph records
const items = await db.databaseFunctionGraph.findMany({ select: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } }).execute();

// Get one by id
const item = await db.databaseFunctionGraph.findOne({ id: '<UUID>', select: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } }).execute();

// Create
const created = await db.databaseFunctionGraph.create({ data: { context: '<String>', createdBy: '<UUID>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', isValid: '<Boolean>', name: '<String>', storeId: '<UUID>', validationErrors: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseFunctionGraph.update({ where: { id: '<UUID>' }, data: { context: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseFunctionGraph.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseFunctionGraphExecutionCancelRequest`

CRUD operations for DatabaseFunctionGraphExecutionCancelRequest records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `executionId` | UUID | Yes |
| `id` | UUID | No |

**Operations:**

```typescript
// List all databaseFunctionGraphExecutionCancelRequest records
const items = await db.databaseFunctionGraphExecutionCancelRequest.findMany({ select: { actorId: true, createdAt: true, executionId: true, id: true } }).execute();

// Get one by id
const item = await db.databaseFunctionGraphExecutionCancelRequest.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, executionId: true, id: true } }).execute();

// Create
const created = await db.databaseFunctionGraphExecutionCancelRequest.create({ data: { actorId: '<UUID>', executionId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseFunctionGraphExecutionCancelRequest.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseFunctionGraphExecutionCancelRequest.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseFunctionGraphExecution`

CRUD operations for DatabaseFunctionGraphExecution records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `completedAt` | Datetime | Yes |
| `currentWave` | Int | Yes |
| `databaseId` | UUID | Yes |
| `definitionsCommitId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `errorCode` | String | Yes |
| `errorMessage` | String | Yes |
| `executionPlan` | JSON | Yes |
| `graphId` | UUID | Yes |
| `id` | UUID | No |
| `inputPayload` | JSON | Yes |
| `invocationCreatedAt` | Datetime | Yes |
| `invocationId` | UUID | Yes |
| `lastProgressAt` | Datetime | Yes |
| `maxPendingJobs` | Int | Yes |
| `maxTicks` | Int | Yes |
| `nodeOutputs` | JSON | Yes |
| `organizationId` | UUID | Yes |
| `outputNames` | String | Yes |
| `outputNode` | String | Yes |
| `outputPayload` | JSON | Yes |
| `outputPort` | String | Yes |
| `parentExecutionId` | UUID | Yes |
| `parentInvocationId` | UUID | Yes |
| `parentNodeName` | String | Yes |
| `principalId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `tickCount` | Int | Yes |
| `timeoutAt` | Datetime | Yes |

**Operations:**

```typescript
// List all databaseFunctionGraphExecution records
const items = await db.databaseFunctionGraphExecution.findMany({ select: { actorId: true, completedAt: true, currentWave: true, databaseId: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } }).execute();

// Get one by id
const item = await db.databaseFunctionGraphExecution.findOne({ id: '<UUID>', select: { actorId: true, completedAt: true, currentWave: true, databaseId: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } }).execute();

// Create
const created = await db.databaseFunctionGraphExecution.create({ data: { actorId: '<UUID>', completedAt: '<Datetime>', currentWave: '<Int>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', entityId: '<UUID>', entityType: '<String>', errorCode: '<String>', errorMessage: '<String>', executionPlan: '<JSON>', graphId: '<UUID>', inputPayload: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', lastProgressAt: '<Datetime>', maxPendingJobs: '<Int>', maxTicks: '<Int>', nodeOutputs: '<JSON>', organizationId: '<UUID>', outputNames: '<String>', outputNode: '<String>', outputPayload: '<JSON>', outputPort: '<String>', parentExecutionId: '<UUID>', parentInvocationId: '<UUID>', parentNodeName: '<String>', principalId: '<UUID>', startedAt: '<Datetime>', status: '<String>', tickCount: '<Int>', timeoutAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseFunctionGraphExecution.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseFunctionGraphExecution.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseFunctionGraphExecutionNodeState`

CRUD operations for DatabaseFunctionGraphExecutionNodeState records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `callbackInputs` | JSON | Yes |
| `callbackMeta` | JSON | Yes |
| `callbackTokenHash` | String | Yes |
| `completedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `errorCode` | String | Yes |
| `errorMessage` | String | Yes |
| `executionId` | UUID | Yes |
| `expiryDefaultOutput` | JSON | Yes |
| `expiryEscalatedAt` | Datetime | Yes |
| `expiryPolicy` | String | Yes |
| `id` | UUID | No |
| `nodeName` | String | Yes |
| `nodePath` | String | Yes |
| `outputId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `waitingDeadlineAt` | Datetime | Yes |
| `waitingOn` | String | Yes |
| `waitingSince` | Datetime | Yes |

**Operations:**

```typescript
// List all databaseFunctionGraphExecutionNodeState records
const items = await db.databaseFunctionGraphExecutionNodeState.findMany({ select: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, databaseId: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } }).execute();

// Get one by id
const item = await db.databaseFunctionGraphExecutionNodeState.findOne({ id: '<UUID>', select: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, databaseId: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } }).execute();

// Create
const created = await db.databaseFunctionGraphExecutionNodeState.create({ data: { callbackInputs: '<JSON>', callbackMeta: '<JSON>', callbackTokenHash: '<String>', completedAt: '<Datetime>', databaseId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionId: '<UUID>', expiryDefaultOutput: '<JSON>', expiryEscalatedAt: '<Datetime>', expiryPolicy: '<String>', nodeName: '<String>', nodePath: '<String>', outputId: '<UUID>', startedAt: '<Datetime>', status: '<String>', waitingDeadlineAt: '<Datetime>', waitingOn: '<String>', waitingSince: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseFunctionGraphExecutionNodeState.update({ where: { id: '<UUID>' }, data: { callbackInputs: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseFunctionGraphExecutionNodeState.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseFunctionGraphExecutionOutput`

CRUD operations for DatabaseFunctionGraphExecutionOutput records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `databaseId` | UUID | Yes |
| `hash` | Base64EncodedBinary | Yes |
| `id` | UUID | No |

**Operations:**

```typescript
// List all databaseFunctionGraphExecutionOutput records
const items = await db.databaseFunctionGraphExecutionOutput.findMany({ select: { createdAt: true, data: true, databaseId: true, hash: true, id: true } }).execute();

// Get one by id
const item = await db.databaseFunctionGraphExecutionOutput.findOne({ id: '<UUID>', select: { createdAt: true, data: true, databaseId: true, hash: true, id: true } }).execute();

// Create
const created = await db.databaseFunctionGraphExecutionOutput.create({ data: { data: '<JSON>', databaseId: '<UUID>', hash: '<Base64EncodedBinary>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseFunctionGraphExecutionOutput.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseFunctionGraphExecutionOutput.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseGraphCommit`

CRUD operations for DatabaseGraphCommit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `authorId` | UUID | Yes |
| `committerId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `date` | Datetime | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `parentIds` | UUID | Yes |
| `storeId` | UUID | Yes |
| `treeId` | UUID | Yes |

**Operations:**

```typescript
// List all databaseGraphCommit records
const items = await db.databaseGraphCommit.findMany({ select: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } }).execute();

// Get one by id
const item = await db.databaseGraphCommit.findOne({ id: '<UUID>', select: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } }).execute();

// Create
const created = await db.databaseGraphCommit.create({ data: { authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseGraphCommit.update({ where: { id: '<UUID>' }, data: { authorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseGraphCommit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseGraphGetAllTreeNodesRecord`

CRUD operations for DatabaseGraphGetAllTreeNodesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `data` | JSON | Yes |
| `path` | String | Yes |

**Operations:**

```typescript
// List all databaseGraphGetAllTreeNodesRecord records
const items = await db.databaseGraphGetAllTreeNodesRecord.findMany({ select: { data: true, path: true } }).execute();

// Get one by id
const item = await db.databaseGraphGetAllTreeNodesRecord.findOne({ id: '<UUID>', select: { data: true, path: true } }).execute();

// Create
const created = await db.databaseGraphGetAllTreeNodesRecord.create({ data: { data: '<JSON>', path: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseGraphGetAllTreeNodesRecord.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseGraphGetAllTreeNodesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseGraphObject`

CRUD operations for DatabaseGraphObject records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `kids` | UUID | Yes |
| `ktree` | String | Yes |

**Operations:**

```typescript
// List all databaseGraphObject records
const items = await db.databaseGraphObject.findMany({ select: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } }).execute();

// Get one by id
const item = await db.databaseGraphObject.findOne({ id: '<UUID>', select: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } }).execute();

// Create
const created = await db.databaseGraphObject.create({ data: { data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseGraphObject.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseGraphObject.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseGraphRef`

CRUD operations for DatabaseGraphRef records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `commitId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `storeId` | UUID | Yes |

**Operations:**

```typescript
// List all databaseGraphRef records
const items = await db.databaseGraphRef.findMany({ select: { commitId: true, databaseId: true, id: true, name: true, storeId: true } }).execute();

// Get one by id
const item = await db.databaseGraphRef.findOne({ id: '<UUID>', select: { commitId: true, databaseId: true, id: true, name: true, storeId: true } }).execute();

// Create
const created = await db.databaseGraphRef.create({ data: { commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseGraphRef.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseGraphRef.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseGraphStore`

CRUD operations for DatabaseGraphStore records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `hash` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |

**Operations:**

```typescript
// List all databaseGraphStore records
const items = await db.databaseGraphStore.findMany({ select: { createdAt: true, databaseId: true, hash: true, id: true, name: true } }).execute();

// Get one by id
const item = await db.databaseGraphStore.findOne({ id: '<UUID>', select: { createdAt: true, databaseId: true, hash: true, id: true, name: true } }).execute();

// Create
const created = await db.databaseGraphStore.create({ data: { databaseId: '<UUID>', hash: '<UUID>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseGraphStore.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseGraphStore.delete({ where: { id: '<UUID>' } }).execute();
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

### `db.functionApiBinding`

CRUD operations for FunctionApiBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `alias` | String | Yes |
| `apiId` | UUID | Yes |
| `config` | JSON | Yes |
| `createdAt` | Datetime | No |
| `functionDefinitionId` | UUID | Yes |
| `id` | UUID | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all functionApiBinding records
const items = await db.functionApiBinding.findMany({ select: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.functionApiBinding.findOne({ id: '<UUID>', select: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } }).execute();

// Create
const created = await db.functionApiBinding.create({ data: { alias: '<String>', apiId: '<UUID>', config: '<JSON>', functionDefinitionId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionApiBinding.update({ where: { id: '<UUID>' }, data: { alias: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionApiBinding.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionCapabilityBinding`

CRUD operations for FunctionCapabilityBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `bucketId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `functionId` | UUID | Yes |
| `graphId` | UUID | Yes |
| `id` | UUID | No |
| `key` | String | Yes |
| `lifecycle` | String | Yes |
| `metadata` | JSON | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all functionCapabilityBinding records
const items = await db.functionCapabilityBinding.findMany({ select: { bucketId: true, createdAt: true, databaseId: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.functionCapabilityBinding.findOne({ id: '<UUID>', select: { bucketId: true, createdAt: true, databaseId: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } }).execute();

// Create
const created = await db.functionCapabilityBinding.create({ data: { bucketId: '<UUID>', databaseId: '<UUID>', functionId: '<UUID>', graphId: '<UUID>', key: '<String>', lifecycle: '<String>', metadata: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionCapabilityBinding.update({ where: { id: '<UUID>' }, data: { bucketId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionCapabilityBinding.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionDefinition`

CRUD operations for FunctionDefinition records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `accessChannels` | String | Yes |
| `anonymousCallable` | Boolean | Yes |
| `category` | String | Yes |
| `concurrency` | Int | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `fnCategory` | String | Yes |
| `functionColumns` | JSON | Yes |
| `graphId` | UUID | Yes |
| `icon` | String | Yes |
| `id` | UUID | No |
| `image` | String | Yes |
| `inputs` | JSON | Yes |
| `integrations` | String | Yes |
| `isPublished` | Boolean | Yes |
| `maxAttempts` | Int | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `moduleTable` | String | Yes |
| `name` | String | Yes |
| `outputs` | JSON | Yes |
| `payloadArgs` | JSON | Yes |
| `priority` | Int | Yes |
| `props` | JSON | Yes |
| `protected` | Boolean | Yes |
| `publishedAt` | Datetime | Yes |
| `queueName` | String | Yes |
| `requiredBuckets` | String | Yes |
| `requiredCapabilities` | JSON | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredModels` | String | Yes |
| `requiredModules` | String | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `resources` | JSON | Yes |
| `runtime` | String | Yes |
| `scaleMax` | Int | Yes |
| `scaleMin` | Int | Yes |
| `targetFunction` | String | Yes |
| `targetSchema` | String | Yes |
| `taskIdentifier` | String | Yes |
| `timeoutSeconds` | Int | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `volatile` | Boolean | Yes |

**Operations:**

```typescript
// List all functionDefinition records
const items = await db.functionDefinition.findMany({ select: { accessChannels: true, anonymousCallable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } }).execute();

// Get one by id
const item = await db.functionDefinition.findOne({ id: '<UUID>', select: { accessChannels: true, anonymousCallable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } }).execute();

// Create
const created = await db.functionDefinition.create({ data: { accessChannels: '<String>', anonymousCallable: '<Boolean>', category: '<String>', concurrency: '<Int>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', fnCategory: '<String>', functionColumns: '<JSON>', graphId: '<UUID>', icon: '<String>', image: '<String>', inputs: '<JSON>', integrations: '<String>', isPublished: '<Boolean>', maxAttempts: '<Int>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', moduleTable: '<String>', name: '<String>', outputs: '<JSON>', payloadArgs: '<JSON>', priority: '<Int>', props: '<JSON>', protected: '<Boolean>', publishedAt: '<Datetime>', queueName: '<String>', requiredBuckets: '<String>', requiredCapabilities: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredModels: '<String>', requiredModules: '<String>', requiredSecrets: '<ResourceRequirement>', resources: '<JSON>', runtime: '<String>', scaleMax: '<Int>', scaleMin: '<Int>', targetFunction: '<String>', targetSchema: '<String>', taskIdentifier: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>', volatile: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionDefinition.update({ where: { id: '<UUID>' }, data: { accessChannels: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionDefinition.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionDeployment`

CRUD operations for FunctionDeployment records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `concurrency` | Int | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `errorCount` | Int | Yes |
| `handlerName` | String | Yes |
| `id` | UUID | No |
| `image` | String | Yes |
| `imageVersion` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `lastErrorAt` | Datetime | Yes |
| `namespaceId` | UUID | Yes |
| `realm` | String | Yes |
| `resources` | JSON | Yes |
| `revision` | Int | Yes |
| `scaleMax` | Int | Yes |
| `scaleMin` | Int | Yes |
| `serviceName` | String | Yes |
| `serviceUrl` | String | Yes |
| `status` | String | Yes |
| `timeoutSeconds` | Int | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all functionDeployment records
const items = await db.functionDeployment.findMany({ select: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, databaseId: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.functionDeployment.findOne({ id: '<UUID>', select: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, databaseId: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.functionDeployment.create({ data: { annotations: '<JSON>', concurrency: '<Int>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', errorCount: '<Int>', handlerName: '<String>', image: '<String>', imageVersion: '<String>', labels: '<JSON>', lastError: '<String>', lastErrorAt: '<Datetime>', namespaceId: '<UUID>', realm: '<String>', resources: '<JSON>', revision: '<Int>', scaleMax: '<Int>', scaleMin: '<Int>', serviceName: '<String>', serviceUrl: '<String>', status: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionDeployment.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionDeployment.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionDeploymentEvent`

CRUD operations for FunctionDeploymentEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `deploymentId` | UUID | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `metadata` | JSON | Yes |

**Operations:**

```typescript
// List all functionDeploymentEvent records
const items = await db.functionDeploymentEvent.findMany({ select: { actorId: true, createdAt: true, databaseId: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } }).execute();

// Get one by id
const item = await db.functionDeploymentEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, databaseId: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } }).execute();

// Create
const created = await db.functionDeploymentEvent.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', deploymentId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionDeploymentEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionDeploymentEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionExecutionLog`

CRUD operations for FunctionExecutionLog records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `invocationId` | UUID | Yes |
| `logLevel` | String | Yes |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all functionExecutionLog records
const items = await db.functionExecutionLog.findMany({ select: { actorId: true, createdAt: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.functionExecutionLog.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Create
const created = await db.functionExecutionLog.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionExecutionLog.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionExecutionLog.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphCommit`

CRUD operations for FunctionGraphCommit records.

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
// List all functionGraphCommit records
const items = await db.functionGraphCommit.findMany({ select: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } }).execute();

// Get one by id
const item = await db.functionGraphCommit.findOne({ id: '<UUID>', select: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } }).execute();

// Create
const created = await db.functionGraphCommit.create({ data: { authorId: '<UUID>', committerId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', scopeId: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphCommit.update({ where: { id: '<UUID>' }, data: { authorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphCommit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraph`

CRUD operations for FunctionGraph records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `context` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `definitionsCommitId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isValid` | Boolean | Yes |
| `name` | String | Yes |
| `scopeId` | UUID | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `validationErrors` | JSON | Yes |

**Operations:**

```typescript
// List all functionGraph records
const items = await db.functionGraph.findMany({ select: { context: true, createdAt: true, createdBy: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, scopeId: true, storeId: true, updatedAt: true, validationErrors: true } }).execute();

// Get one by id
const item = await db.functionGraph.findOne({ id: '<UUID>', select: { context: true, createdAt: true, createdBy: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, scopeId: true, storeId: true, updatedAt: true, validationErrors: true } }).execute();

// Create
const created = await db.functionGraph.create({ data: { context: '<String>', createdBy: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', isValid: '<Boolean>', name: '<String>', scopeId: '<UUID>', storeId: '<UUID>', validationErrors: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraph.update({ where: { id: '<UUID>' }, data: { context: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraph.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphExecutionCancelRequest`

CRUD operations for FunctionGraphExecutionCancelRequest records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `executionId` | UUID | Yes |
| `id` | UUID | No |

**Operations:**

```typescript
// List all functionGraphExecutionCancelRequest records
const items = await db.functionGraphExecutionCancelRequest.findMany({ select: { actorId: true, createdAt: true, executionId: true, id: true } }).execute();

// Get one by id
const item = await db.functionGraphExecutionCancelRequest.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, executionId: true, id: true } }).execute();

// Create
const created = await db.functionGraphExecutionCancelRequest.create({ data: { actorId: '<UUID>', executionId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphExecutionCancelRequest.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphExecutionCancelRequest.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphExecution`

CRUD operations for FunctionGraphExecution records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `completedAt` | Datetime | Yes |
| `currentWave` | Int | Yes |
| `definitionsCommitId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `errorCode` | String | Yes |
| `errorMessage` | String | Yes |
| `executionPlan` | JSON | Yes |
| `graphId` | UUID | Yes |
| `id` | UUID | No |
| `inputPayload` | JSON | Yes |
| `invocationCreatedAt` | Datetime | Yes |
| `invocationId` | UUID | Yes |
| `lastProgressAt` | Datetime | Yes |
| `maxPendingJobs` | Int | Yes |
| `maxTicks` | Int | Yes |
| `nodeOutputs` | JSON | Yes |
| `organizationId` | UUID | Yes |
| `outputNames` | String | Yes |
| `outputNode` | String | Yes |
| `outputPayload` | JSON | Yes |
| `outputPort` | String | Yes |
| `parentExecutionId` | UUID | Yes |
| `parentInvocationId` | UUID | Yes |
| `parentNodeName` | String | Yes |
| `principalId` | UUID | Yes |
| `scopeId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `tickCount` | Int | Yes |
| `timeoutAt` | Datetime | Yes |

**Operations:**

```typescript
// List all functionGraphExecution records
const items = await db.functionGraphExecution.findMany({ select: { actorId: true, completedAt: true, currentWave: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, scopeId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } }).execute();

// Get one by id
const item = await db.functionGraphExecution.findOne({ id: '<UUID>', select: { actorId: true, completedAt: true, currentWave: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, scopeId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } }).execute();

// Create
const created = await db.functionGraphExecution.create({ data: { actorId: '<UUID>', completedAt: '<Datetime>', currentWave: '<Int>', definitionsCommitId: '<UUID>', entityId: '<UUID>', entityType: '<String>', errorCode: '<String>', errorMessage: '<String>', executionPlan: '<JSON>', graphId: '<UUID>', inputPayload: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', lastProgressAt: '<Datetime>', maxPendingJobs: '<Int>', maxTicks: '<Int>', nodeOutputs: '<JSON>', organizationId: '<UUID>', outputNames: '<String>', outputNode: '<String>', outputPayload: '<JSON>', outputPort: '<String>', parentExecutionId: '<UUID>', parentInvocationId: '<UUID>', parentNodeName: '<String>', principalId: '<UUID>', scopeId: '<UUID>', startedAt: '<Datetime>', status: '<String>', tickCount: '<Int>', timeoutAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphExecution.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphExecution.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphExecutionNodeState`

CRUD operations for FunctionGraphExecutionNodeState records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `callbackInputs` | JSON | Yes |
| `callbackMeta` | JSON | Yes |
| `callbackTokenHash` | String | Yes |
| `completedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `errorCode` | String | Yes |
| `errorMessage` | String | Yes |
| `executionId` | UUID | Yes |
| `expiryDefaultOutput` | JSON | Yes |
| `expiryEscalatedAt` | Datetime | Yes |
| `expiryPolicy` | String | Yes |
| `id` | UUID | No |
| `nodeName` | String | Yes |
| `nodePath` | String | Yes |
| `outputId` | UUID | Yes |
| `scopeId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `waitingDeadlineAt` | Datetime | Yes |
| `waitingOn` | String | Yes |
| `waitingSince` | Datetime | Yes |

**Operations:**

```typescript
// List all functionGraphExecutionNodeState records
const items = await db.functionGraphExecutionNodeState.findMany({ select: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, scopeId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } }).execute();

// Get one by id
const item = await db.functionGraphExecutionNodeState.findOne({ id: '<UUID>', select: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, scopeId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } }).execute();

// Create
const created = await db.functionGraphExecutionNodeState.create({ data: { callbackInputs: '<JSON>', callbackMeta: '<JSON>', callbackTokenHash: '<String>', completedAt: '<Datetime>', errorCode: '<String>', errorMessage: '<String>', executionId: '<UUID>', expiryDefaultOutput: '<JSON>', expiryEscalatedAt: '<Datetime>', expiryPolicy: '<String>', nodeName: '<String>', nodePath: '<String>', outputId: '<UUID>', scopeId: '<UUID>', startedAt: '<Datetime>', status: '<String>', waitingDeadlineAt: '<Datetime>', waitingOn: '<String>', waitingSince: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphExecutionNodeState.update({ where: { id: '<UUID>' }, data: { callbackInputs: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphExecutionNodeState.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphExecutionOutput`

CRUD operations for FunctionGraphExecutionOutput records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `hash` | Base64EncodedBinary | Yes |
| `id` | UUID | No |
| `scopeId` | UUID | Yes |

**Operations:**

```typescript
// List all functionGraphExecutionOutput records
const items = await db.functionGraphExecutionOutput.findMany({ select: { createdAt: true, data: true, hash: true, id: true, scopeId: true } }).execute();

// Get one by id
const item = await db.functionGraphExecutionOutput.findOne({ id: '<UUID>', select: { createdAt: true, data: true, hash: true, id: true, scopeId: true } }).execute();

// Create
const created = await db.functionGraphExecutionOutput.create({ data: { data: '<JSON>', hash: '<Base64EncodedBinary>', scopeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphExecutionOutput.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphExecutionOutput.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphObject`

CRUD operations for FunctionGraphObject records.

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
// List all functionGraphObject records
const items = await db.functionGraphObject.findMany({ select: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } }).execute();

// Get one by id
const item = await db.functionGraphObject.findOne({ id: '<UUID>', select: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } }).execute();

// Create
const created = await db.functionGraphObject.create({ data: { data: '<JSON>', kids: '<UUID>', ktree: '<String>', scopeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphObject.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphObject.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphRef`

CRUD operations for FunctionGraphRef records.

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
// List all functionGraphRef records
const items = await db.functionGraphRef.findMany({ select: { commitId: true, id: true, name: true, scopeId: true, storeId: true } }).execute();

// Get one by id
const item = await db.functionGraphRef.findOne({ id: '<UUID>', select: { commitId: true, id: true, name: true, scopeId: true, storeId: true } }).execute();

// Create
const created = await db.functionGraphRef.create({ data: { commitId: '<UUID>', name: '<String>', scopeId: '<UUID>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphRef.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphRef.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionGraphStore`

CRUD operations for FunctionGraphStore records.

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
// List all functionGraphStore records
const items = await db.functionGraphStore.findMany({ select: { createdAt: true, hash: true, id: true, name: true, scopeId: true } }).execute();

// Get one by id
const item = await db.functionGraphStore.findOne({ id: '<UUID>', select: { createdAt: true, hash: true, id: true, name: true, scopeId: true } }).execute();

// Create
const created = await db.functionGraphStore.create({ data: { hash: '<UUID>', name: '<String>', scopeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionGraphStore.update({ where: { id: '<UUID>' }, data: { hash: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionGraphStore.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionInvocationAttempt`

CRUD operations for FunctionInvocationAttempt records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `attempt` | Int | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `durationMs` | Int | Yes |
| `error` | String | Yes |
| `errorDetail` | JSON | Yes |
| `id` | UUID | No |
| `invocationCreatedAt` | Datetime | Yes |
| `invocationId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `success` | Boolean | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all functionInvocationAttempt records
const items = await db.functionInvocationAttempt.findMany({ select: { actorId: true, attempt: true, createdAt: true, databaseId: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.functionInvocationAttempt.findOne({ id: '<UUID>', select: { actorId: true, attempt: true, createdAt: true, databaseId: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } }).execute();

// Create
const created = await db.functionInvocationAttempt.create({ data: { actorId: '<UUID>', attempt: '<Int>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', errorDetail: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', startedAt: '<Datetime>', success: '<Boolean>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionInvocationAttempt.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionInvocationAttempt.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionInvocation`

CRUD operations for FunctionInvocation records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `apiBindingId` | UUID | Yes |
| `channel` | String | Yes |
| `completedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `definitionScope` | String | Yes |
| `durationMs` | Int | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `error` | String | Yes |
| `functionDefinitionId` | UUID | Yes |
| `graphExecutionId` | UUID | Yes |
| `id` | UUID | No |
| `jobId` | BigInt | Yes |
| `organizationId` | UUID | Yes |
| `parentInvocationId` | UUID | Yes |
| `payload` | JSON | Yes |
| `principalId` | UUID | Yes |
| `provenance` | JSON | Yes |
| `result` | JSON | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all functionInvocation records
const items = await db.functionInvocation.findMany({ select: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.functionInvocation.findOne({ id: '<UUID>', select: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Create
const created = await db.functionInvocation.create({ data: { actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionInvocation.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionSchedule`

CRUD operations for FunctionSchedule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `functionDefinitionId` | UUID | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `name` | String | Yes |
| `payload` | JSON | Yes |
| `scheduleInfo` | JSON | Yes |
| `suspendedAt` | Datetime | Yes |
| `suspendedReason` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all functionSchedule records
const items = await db.functionSchedule.findMany({ select: { actorId: true, createdAt: true, databaseId: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.functionSchedule.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, databaseId: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } }).execute();

// Create
const created = await db.functionSchedule.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionSchedule.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionSchedule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.getAllTreeNodesRecord`

CRUD operations for GetAllTreeNodesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `data` | JSON | Yes |
| `path` | String | Yes |

**Operations:**

```typescript
// List all getAllTreeNodesRecord records
const items = await db.getAllTreeNodesRecord.findMany({ select: { data: true, path: true } }).execute();

// Get one by id
const item = await db.getAllTreeNodesRecord.findOne({ id: '<UUID>', select: { data: true, path: true } }).execute();

// Create
const created = await db.getAllTreeNodesRecord.create({ data: { data: '<JSON>', path: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.getAllTreeNodesRecord.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.getAllTreeNodesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.image`

CRUD operations for Image records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `digest` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `isPublished` | Boolean | Yes |
| `labels` | JSON | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `platformOnly` | Boolean | Yes |
| `registryHost` | String | Yes |
| `repository` | String | Yes |
| `runtime` | String | Yes |
| `tag` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all image records
const items = await db.image.findMany({ select: { createdAt: true, createdByPrincipal: true, databaseId: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.image.findOne({ id: '<UUID>', select: { createdAt: true, createdByPrincipal: true, databaseId: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.image.create({ data: { createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', digest: '<String>', expiresAt: '<Datetime>', isPublished: '<Boolean>', labels: '<JSON>', metadata: '<JSON>', name: '<String>', ownerId: '<UUID>', platformOnly: '<Boolean>', registryHost: '<String>', repository: '<String>', runtime: '<String>', tag: '<String>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.image.update({ where: { id: '<UUID>' }, data: { createdByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.image.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.imageGrant`

CRUD operations for ImageGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actions` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `expiresAt` | Datetime | Yes |
| `grantedBy` | UUID | Yes |
| `granteeKey` | UUID | Yes |
| `granteeScope` | String | Yes |
| `id` | UUID | No |
| `imageId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all imageGrant records
const items = await db.imageGrant.findMany({ select: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.imageGrant.findOne({ id: '<UUID>', select: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.imageGrant.create({ data: { actions: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', imageId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.imageGrant.update({ where: { id: '<UUID>' }, data: { actions: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.imageGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.infraCommit`

CRUD operations for InfraCommit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `authorId` | UUID | Yes |
| `committerId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `date` | Datetime | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `parentIds` | UUID | Yes |
| `storeId` | UUID | Yes |
| `treeId` | UUID | Yes |

**Operations:**

```typescript
// List all infraCommit records
const items = await db.infraCommit.findMany({ select: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } }).execute();

// Get one by id
const item = await db.infraCommit.findOne({ id: '<UUID>', select: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } }).execute();

// Create
const created = await db.infraCommit.create({ data: { authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.infraCommit.update({ where: { id: '<UUID>' }, data: { authorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.infraCommit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.infraGetAllTreeNodesRecord`

CRUD operations for InfraGetAllTreeNodesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `data` | JSON | Yes |
| `path` | String | Yes |

**Operations:**

```typescript
// List all infraGetAllTreeNodesRecord records
const items = await db.infraGetAllTreeNodesRecord.findMany({ select: { data: true, path: true } }).execute();

// Get one by id
const item = await db.infraGetAllTreeNodesRecord.findOne({ id: '<UUID>', select: { data: true, path: true } }).execute();

// Create
const created = await db.infraGetAllTreeNodesRecord.create({ data: { data: '<JSON>', path: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.infraGetAllTreeNodesRecord.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.infraGetAllTreeNodesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.infraObject`

CRUD operations for InfraObject records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `kids` | UUID | Yes |
| `ktree` | String | Yes |

**Operations:**

```typescript
// List all infraObject records
const items = await db.infraObject.findMany({ select: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } }).execute();

// Get one by id
const item = await db.infraObject.findOne({ id: '<UUID>', select: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } }).execute();

// Create
const created = await db.infraObject.create({ data: { data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.infraObject.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.infraObject.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.infraRef`

CRUD operations for InfraRef records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `commitId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `storeId` | UUID | Yes |

**Operations:**

```typescript
// List all infraRef records
const items = await db.infraRef.findMany({ select: { commitId: true, databaseId: true, id: true, name: true, storeId: true } }).execute();

// Get one by id
const item = await db.infraRef.findOne({ id: '<UUID>', select: { commitId: true, databaseId: true, id: true, name: true, storeId: true } }).execute();

// Create
const created = await db.infraRef.create({ data: { commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.infraRef.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.infraRef.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.infraStore`

CRUD operations for InfraStore records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `hash` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |

**Operations:**

```typescript
// List all infraStore records
const items = await db.infraStore.findMany({ select: { createdAt: true, databaseId: true, hash: true, id: true, name: true } }).execute();

// Get one by id
const item = await db.infraStore.findOne({ id: '<UUID>', select: { createdAt: true, databaseId: true, hash: true, id: true, name: true } }).execute();

// Create
const created = await db.infraStore.create({ data: { databaseId: '<UUID>', hash: '<UUID>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.infraStore.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.infraStore.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.integrationProvider`

CRUD operations for IntegrationProvider records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `brand` | JSON | Yes |
| `category` | String | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `icon` | String | Yes |
| `id` | UUID | No |
| `logo` | ConstructiveInternalTypeImage | Yes |
| `name` | String | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `slug` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all integrationProvider records
const items = await db.integrationProvider.findMany({ select: { brand: true, category: true, createdAt: true, description: true, icon: true, id: true, logo: true, name: true, requiredConfigs: true, requiredSecrets: true, slug: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.integrationProvider.findOne({ id: '<UUID>', select: { brand: true, category: true, createdAt: true, description: true, icon: true, id: true, logo: true, name: true, requiredConfigs: true, requiredSecrets: true, slug: true, updatedAt: true } }).execute();

// Create
const created = await db.integrationProvider.create({ data: { brand: '<JSON>', category: '<String>', description: '<String>', icon: '<String>', logo: '<Image>', name: '<String>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', slug: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.integrationProvider.update({ where: { id: '<UUID>' }, data: { brand: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.integrationProvider.delete({ where: { id: '<UUID>' } }).execute();
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

### `db.platformBuild`

CRUD operations for PlatformBuild records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `attempt` | Int | Yes |
| `commitSha` | String | Yes |
| `conclusion` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `eventId` | UUID | Yes |
| `finishedAt` | Datetime | Yes |
| `id` | UUID | No |
| `imageRef` | String | Yes |
| `jobId` | BigInt | Yes |
| `logs` | ConstructiveInternalTypeUpload | Yes |
| `matrixKey` | String | Yes |
| `metadata` | JSON | Yes |
| `proposalId` | UUID | Yes |
| `ref` | String | Yes |
| `repositoryId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `workflowId` | UUID | Yes |

**Operations:**

```typescript
// List all platformBuild records
const items = await db.platformBuild.findMany({ select: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } }).execute();

// Get one by id
const item = await db.platformBuild.findOne({ id: '<UUID>', select: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } }).execute();

// Create
const created = await db.platformBuild.create({ data: { actorId: '<UUID>', attempt: '<Int>', commitSha: '<String>', conclusion: '<String>', createdByPrincipal: '<UUID>', eventId: '<UUID>', finishedAt: '<Datetime>', imageRef: '<String>', jobId: '<BigInt>', logs: '<Upload>', matrixKey: '<String>', metadata: '<JSON>', proposalId: '<UUID>', ref: '<String>', repositoryId: '<UUID>', startedAt: '<Datetime>', status: '<String>', updatedByPrincipal: '<UUID>', workflowId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformBuild.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformBuild.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformBuildStep`

CRUD operations for PlatformBuildStep records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `buildId` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `exitCode` | Int | Yes |
| `finishedAt` | Datetime | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `logBytes` | BigInt | Yes |
| `logOffset` | BigInt | Yes |
| `name` | String | Yes |
| `parentSeq` | Int | Yes |
| `recordedAt` | Datetime | Yes |
| `seq` | Int | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `summary` | JSON | Yes |

**Operations:**

```typescript
// List all platformBuildStep records
const items = await db.platformBuildStep.findMany({ select: { buildId: true, createdByPrincipal: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } }).execute();

// Get one by id
const item = await db.platformBuildStep.findOne({ id: '<UUID>', select: { buildId: true, createdByPrincipal: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } }).execute();

// Create
const created = await db.platformBuildStep.create({ data: { buildId: '<UUID>', createdByPrincipal: '<UUID>', exitCode: '<Int>', finishedAt: '<Datetime>', kind: '<String>', logBytes: '<BigInt>', logOffset: '<BigInt>', name: '<String>', parentSeq: '<Int>', recordedAt: '<Datetime>', seq: '<Int>', startedAt: '<Datetime>', status: '<String>', summary: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformBuildStep.update({ where: { id: '<UUID>' }, data: { buildId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformBuildStep.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformBuilderBinding`

CRUD operations for PlatformBuilderBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `id` | UUID | No |
| `installationId` | UUID | Yes |
| `lastError` | String | Yes |
| `metadata` | JSON | Yes |
| `namespaceId` | UUID | Yes |
| `observedHost` | String | Yes |
| `realm` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformBuilderBinding records
const items = await db.platformBuilderBinding.findMany({ select: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformBuilderBinding.findOne({ id: '<UUID>', select: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformBuilderBinding.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', installationId: '<UUID>', lastError: '<String>', metadata: '<JSON>', namespaceId: '<UUID>', observedHost: '<String>', realm: '<String>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformBuilderBinding.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformBuilderBinding.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionApiBinding`

CRUD operations for PlatformFunctionApiBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `alias` | String | Yes |
| `apiId` | UUID | Yes |
| `config` | JSON | Yes |
| `createdAt` | Datetime | No |
| `functionDefinitionId` | UUID | Yes |
| `id` | UUID | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformFunctionApiBinding records
const items = await db.platformFunctionApiBinding.findMany({ select: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformFunctionApiBinding.findOne({ id: '<UUID>', select: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } }).execute();

// Create
const created = await db.platformFunctionApiBinding.create({ data: { alias: '<String>', apiId: '<UUID>', config: '<JSON>', functionDefinitionId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionApiBinding.update({ where: { id: '<UUID>' }, data: { alias: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionApiBinding.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionCapabilityBinding`

CRUD operations for PlatformFunctionCapabilityBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `bucketId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `functionId` | UUID | Yes |
| `graphId` | UUID | Yes |
| `id` | UUID | No |
| `key` | String | Yes |
| `lifecycle` | String | Yes |
| `metadata` | JSON | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformFunctionCapabilityBinding records
const items = await db.platformFunctionCapabilityBinding.findMany({ select: { bucketId: true, createdAt: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformFunctionCapabilityBinding.findOne({ id: '<UUID>', select: { bucketId: true, createdAt: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } }).execute();

// Create
const created = await db.platformFunctionCapabilityBinding.create({ data: { bucketId: '<UUID>', functionId: '<UUID>', graphId: '<UUID>', key: '<String>', lifecycle: '<String>', metadata: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionCapabilityBinding.update({ where: { id: '<UUID>' }, data: { bucketId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionCapabilityBinding.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionDefinition`

CRUD operations for PlatformFunctionDefinition records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `accessChannels` | String | Yes |
| `anonymousCallable` | Boolean | Yes |
| `billable` | Boolean | Yes |
| `category` | String | Yes |
| `concurrency` | Int | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `description` | String | Yes |
| `fnCategory` | String | Yes |
| `functionColumns` | JSON | Yes |
| `graphId` | UUID | Yes |
| `icon` | String | Yes |
| `id` | UUID | No |
| `image` | String | Yes |
| `inputs` | JSON | Yes |
| `integrations` | String | Yes |
| `isPublished` | Boolean | Yes |
| `maxAttempts` | Int | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `moduleTable` | String | Yes |
| `name` | String | Yes |
| `outputs` | JSON | Yes |
| `payloadArgs` | JSON | Yes |
| `priority` | Int | Yes |
| `props` | JSON | Yes |
| `protected` | Boolean | Yes |
| `publishedAt` | Datetime | Yes |
| `queueName` | String | Yes |
| `requiredBuckets` | String | Yes |
| `requiredCapabilities` | JSON | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredModels` | String | Yes |
| `requiredModules` | String | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `resources` | JSON | Yes |
| `runtime` | String | Yes |
| `scaleMax` | Int | Yes |
| `scaleMin` | Int | Yes |
| `system` | Boolean | Yes |
| `targetFunction` | String | Yes |
| `targetSchema` | String | Yes |
| `taskIdentifier` | String | Yes |
| `timeoutSeconds` | Int | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `volatile` | Boolean | Yes |

**Operations:**

```typescript
// List all platformFunctionDefinition records
const items = await db.platformFunctionDefinition.findMany({ select: { accessChannels: true, anonymousCallable: true, billable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, system: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } }).execute();

// Get one by id
const item = await db.platformFunctionDefinition.findOne({ id: '<UUID>', select: { accessChannels: true, anonymousCallable: true, billable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, system: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } }).execute();

// Create
const created = await db.platformFunctionDefinition.create({ data: { accessChannels: '<String>', anonymousCallable: '<Boolean>', billable: '<Boolean>', category: '<String>', concurrency: '<Int>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdByPrincipal: '<UUID>', description: '<String>', fnCategory: '<String>', functionColumns: '<JSON>', graphId: '<UUID>', icon: '<String>', image: '<String>', inputs: '<JSON>', integrations: '<String>', isPublished: '<Boolean>', maxAttempts: '<Int>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', moduleTable: '<String>', name: '<String>', outputs: '<JSON>', payloadArgs: '<JSON>', priority: '<Int>', props: '<JSON>', protected: '<Boolean>', publishedAt: '<Datetime>', queueName: '<String>', requiredBuckets: '<String>', requiredCapabilities: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredModels: '<String>', requiredModules: '<String>', requiredSecrets: '<ResourceRequirement>', resources: '<JSON>', runtime: '<String>', scaleMax: '<Int>', scaleMin: '<Int>', system: '<Boolean>', targetFunction: '<String>', targetSchema: '<String>', taskIdentifier: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>', volatile: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionDefinition.update({ where: { id: '<UUID>' }, data: { accessChannels: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionDefinition.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionDeployment`

CRUD operations for PlatformFunctionDeployment records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `concurrency` | Int | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `errorCount` | Int | Yes |
| `handlerName` | String | Yes |
| `id` | UUID | No |
| `image` | String | Yes |
| `imageVersion` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `lastErrorAt` | Datetime | Yes |
| `namespaceId` | UUID | Yes |
| `realm` | String | Yes |
| `resources` | JSON | Yes |
| `revision` | Int | Yes |
| `scaleMax` | Int | Yes |
| `scaleMin` | Int | Yes |
| `serviceName` | String | Yes |
| `serviceUrl` | String | Yes |
| `status` | String | Yes |
| `timeoutSeconds` | Int | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformFunctionDeployment records
const items = await db.platformFunctionDeployment.findMany({ select: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformFunctionDeployment.findOne({ id: '<UUID>', select: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformFunctionDeployment.create({ data: { annotations: '<JSON>', concurrency: '<Int>', createdByPrincipal: '<UUID>', errorCount: '<Int>', handlerName: '<String>', image: '<String>', imageVersion: '<String>', labels: '<JSON>', lastError: '<String>', lastErrorAt: '<Datetime>', namespaceId: '<UUID>', realm: '<String>', resources: '<JSON>', revision: '<Int>', scaleMax: '<Int>', scaleMin: '<Int>', serviceName: '<String>', serviceUrl: '<String>', status: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionDeployment.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionDeployment.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionDeploymentEvent`

CRUD operations for PlatformFunctionDeploymentEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `deploymentId` | UUID | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `metadata` | JSON | Yes |

**Operations:**

```typescript
// List all platformFunctionDeploymentEvent records
const items = await db.platformFunctionDeploymentEvent.findMany({ select: { actorId: true, createdAt: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } }).execute();

// Get one by id
const item = await db.platformFunctionDeploymentEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } }).execute();

// Create
const created = await db.platformFunctionDeploymentEvent.create({ data: { actorId: '<UUID>', deploymentId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionDeploymentEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionDeploymentEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionExecutionLog`

CRUD operations for PlatformFunctionExecutionLog records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `invocationId` | UUID | Yes |
| `logLevel` | String | Yes |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionExecutionLog records
const items = await db.platformFunctionExecutionLog.findMany({ select: { actorId: true, createdAt: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.platformFunctionExecutionLog.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Create
const created = await db.platformFunctionExecutionLog.create({ data: { actorId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionExecutionLog.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionExecutionLog.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionInvocationAttempt`

CRUD operations for PlatformFunctionInvocationAttempt records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `attempt` | Int | Yes |
| `createdAt` | Datetime | No |
| `durationMs` | Int | Yes |
| `error` | String | Yes |
| `errorDetail` | JSON | Yes |
| `id` | UUID | No |
| `invocationCreatedAt` | Datetime | Yes |
| `invocationId` | UUID | Yes |
| `startedAt` | Datetime | Yes |
| `success` | Boolean | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionInvocationAttempt records
const items = await db.platformFunctionInvocationAttempt.findMany({ select: { actorId: true, attempt: true, createdAt: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.platformFunctionInvocationAttempt.findOne({ id: '<UUID>', select: { actorId: true, attempt: true, createdAt: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } }).execute();

// Create
const created = await db.platformFunctionInvocationAttempt.create({ data: { actorId: '<UUID>', attempt: '<Int>', durationMs: '<Int>', error: '<String>', errorDetail: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', startedAt: '<Datetime>', success: '<Boolean>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionInvocationAttempt.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionInvocationAttempt.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionInvocation`

CRUD operations for PlatformFunctionInvocation records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `apiBindingId` | UUID | Yes |
| `channel` | String | Yes |
| `completedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `definitionScope` | String | Yes |
| `durationMs` | Int | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `error` | String | Yes |
| `functionDefinitionId` | UUID | Yes |
| `graphExecutionId` | UUID | Yes |
| `id` | UUID | No |
| `jobId` | BigInt | Yes |
| `organizationId` | UUID | Yes |
| `parentInvocationId` | UUID | Yes |
| `payload` | JSON | Yes |
| `principalId` | UUID | Yes |
| `provenance` | JSON | Yes |
| `result` | JSON | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionInvocation records
const items = await db.platformFunctionInvocation.findMany({ select: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.platformFunctionInvocation.findOne({ id: '<UUID>', select: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Create
const created = await db.platformFunctionInvocation.create({ data: { actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionInvocation.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionSchedule`

CRUD operations for PlatformFunctionSchedule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `functionDefinitionId` | UUID | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `name` | String | Yes |
| `payload` | JSON | Yes |
| `scheduleInfo` | JSON | Yes |
| `suspendedAt` | Datetime | Yes |
| `suspendedReason` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformFunctionSchedule records
const items = await db.platformFunctionSchedule.findMany({ select: { actorId: true, createdAt: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformFunctionSchedule.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } }).execute();

// Create
const created = await db.platformFunctionSchedule.create({ data: { actorId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionSchedule.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionSchedule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformImage`

CRUD operations for PlatformImage records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `description` | String | Yes |
| `digest` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `isPublished` | Boolean | Yes |
| `labels` | JSON | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `platformOnly` | Boolean | Yes |
| `registryHost` | String | Yes |
| `repository` | String | Yes |
| `runtime` | String | Yes |
| `tag` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformImage records
const items = await db.platformImage.findMany({ select: { createdAt: true, createdByPrincipal: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformImage.findOne({ id: '<UUID>', select: { createdAt: true, createdByPrincipal: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformImage.create({ data: { createdByPrincipal: '<UUID>', description: '<String>', digest: '<String>', expiresAt: '<Datetime>', isPublished: '<Boolean>', labels: '<JSON>', metadata: '<JSON>', name: '<String>', ownerId: '<UUID>', platformOnly: '<Boolean>', registryHost: '<String>', repository: '<String>', runtime: '<String>', tag: '<String>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformImage.update({ where: { id: '<UUID>' }, data: { createdByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformImage.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformImageGrant`

CRUD operations for PlatformImageGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actions` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `expiresAt` | Datetime | Yes |
| `grantedBy` | UUID | Yes |
| `granteeKey` | UUID | Yes |
| `granteeScope` | String | Yes |
| `id` | UUID | No |
| `imageId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformImageGrant records
const items = await db.platformImageGrant.findMany({ select: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformImageGrant.findOne({ id: '<UUID>', select: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformImageGrant.create({ data: { actions: '<String>', createdByPrincipal: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', imageId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformImageGrant.update({ where: { id: '<UUID>' }, data: { actions: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformImageGrant.delete({ where: { id: '<UUID>' } }).execute();
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

### `db.platformK8sResourceKind`

CRUD operations for PlatformK8sResourceKind records.

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
| `slug` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformK8sResourceKind records
const items = await db.platformK8sResourceKind.findMany({ select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformK8sResourceKind.findOne({ id: '<UUID>', select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Create
const created = await db.platformK8sResourceKind.create({ data: { active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', label: '<String>', slug: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformK8sResourceKind.update({ where: { id: '<UUID>' }, data: { active: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformK8sResourceKind.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformK8sSpecRule`

CRUD operations for PlatformK8sSpecRule records.

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
| `slug` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformK8sSpecRule records
const items = await db.platformK8sSpecRule.findMany({ select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformK8sSpecRule.findOne({ id: '<UUID>', select: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } }).execute();

// Create
const created = await db.platformK8sSpecRule.create({ data: { active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', label: '<String>', slug: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformK8sSpecRule.update({ where: { id: '<UUID>' }, data: { active: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformK8sSpecRule.delete({ where: { id: '<UUID>' } }).execute();
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

### `db.platformProposalComment`

CRUD operations for PlatformProposalComment records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `attachments` | ConstructiveInternalTypeUpload | Yes |
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `line` | Int | Yes |
| `outdatedAt` | Datetime | Yes |
| `path` | String | Yes |
| `pathTrgmSimilarity` | Float | Yes |
| `proposalId` | UUID | Yes |
| `resolvedAt` | Datetime | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformProposalComment records
const items = await db.platformProposalComment.findMany({ select: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformProposalComment.findOne({ id: '<UUID>', select: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformProposalComment.create({ data: { actorId: '<UUID>', attachments: '<Upload>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', line: '<Int>', outdatedAt: '<Datetime>', path: '<String>', pathTrgmSimilarity: '<Float>', proposalId: '<UUID>', resolvedAt: '<Datetime>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformProposalComment.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformProposalComment.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.platformProposal`

CRUD operations for PlatformProposal records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `closedReason` | String | Yes |
| `closedReasonTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `decidedAt` | Datetime | Yes |
| `dueAt` | Datetime | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `kindTrgmSimilarity` | Float | Yes |
| `labels` | String | Yes |
| `mergeCommit` | String | Yes |
| `mergeCommitTrgmSimilarity` | Float | Yes |
| `mergeMethod` | String | Yes |
| `mergeMethodTrgmSimilarity` | Float | Yes |
| `mergeRequestedAt` | Datetime | Yes |
| `mergedAt` | Datetime | Yes |
| `metadata` | JSON | Yes |
| `parentId` | UUID | Yes |
| `priority` | BigFloat | Yes |
| `repositoryId` | UUID | Yes |
| `resolution` | String | Yes |
| `resolutionTrgmSimilarity` | Float | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `sourceRef` | String | Yes |
| `sourceRefTrgmSimilarity` | Float | Yes |
| `status` | String | Yes |
| `statusTrgmSimilarity` | Float | Yes |
| `targetRef` | String | Yes |
| `targetRefTrgmSimilarity` | Float | Yes |
| `title` | String | Yes |
| `titleTrgmSimilarity` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformProposal records
const items = await db.platformProposal.findMany({ select: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformProposal.findOne({ id: '<UUID>', select: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformProposal.create({ data: { actorId: '<UUID>', body: '<String>', bodyTrgmSimilarity: '<Float>', closedReason: '<String>', closedReasonTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', decidedAt: '<Datetime>', dueAt: '<Datetime>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', kind: '<String>', kindTrgmSimilarity: '<Float>', labels: '<String>', mergeCommit: '<String>', mergeCommitTrgmSimilarity: '<Float>', mergeMethod: '<String>', mergeMethodTrgmSimilarity: '<Float>', mergeRequestedAt: '<Datetime>', mergedAt: '<Datetime>', metadata: '<JSON>', parentId: '<UUID>', priority: '<BigFloat>', repositoryId: '<UUID>', resolution: '<String>', resolutionTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', sourceRef: '<String>', sourceRefTrgmSimilarity: '<Float>', status: '<String>', statusTrgmSimilarity: '<Float>', targetRef: '<String>', targetRefTrgmSimilarity: '<Float>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformProposal.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformProposal.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.platformProposalFileView`

CRUD operations for PlatformProposalFileView records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `blobSha` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `id` | UUID | No |
| `path` | String | Yes |
| `proposalId` | UUID | Yes |
| `reviewerId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `viewedAt` | Datetime | Yes |

**Operations:**

```typescript
// List all platformProposalFileView records
const items = await db.platformProposalFileView.findMany({ select: { blobSha: true, createdAt: true, createdByPrincipal: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } }).execute();

// Get one by id
const item = await db.platformProposalFileView.findOne({ id: '<UUID>', select: { blobSha: true, createdAt: true, createdByPrincipal: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } }).execute();

// Create
const created = await db.platformProposalFileView.create({ data: { blobSha: '<String>', createdByPrincipal: '<UUID>', path: '<String>', proposalId: '<UUID>', reviewerId: '<UUID>', updatedByPrincipal: '<UUID>', viewedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformProposalFileView.update({ where: { id: '<UUID>' }, data: { blobSha: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformProposalFileView.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformProposalReaction`

CRUD operations for PlatformProposalReaction records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `commentId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `emoji` | String | Yes |
| `id` | UUID | No |
| `proposalId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformProposalReaction records
const items = await db.platformProposalReaction.findMany({ select: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformProposalReaction.findOne({ id: '<UUID>', select: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformProposalReaction.create({ data: { actorId: '<UUID>', commentId: '<UUID>', createdByPrincipal: '<UUID>', emoji: '<String>', proposalId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformProposalReaction.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformProposalReaction.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformProposalReview`

CRUD operations for PlatformProposalReview records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `commitSha` | String | Yes |
| `commitShaTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `id` | UUID | No |
| `proposalId` | UUID | Yes |
| `reviewerId` | UUID | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `submittedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `verdict` | String | Yes |
| `verdictTrgmSimilarity` | Float | Yes |

**Operations:**

```typescript
// List all platformProposalReview records
const items = await db.platformProposalReview.findMany({ select: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } }).execute();

// Get one by id
const item = await db.platformProposalReview.findOne({ id: '<UUID>', select: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } }).execute();

// Create
const created = await db.platformProposalReview.create({ data: { body: '<String>', bodyTrgmSimilarity: '<Float>', commitSha: '<String>', commitShaTrgmSimilarity: '<Float>', createdByPrincipal: '<UUID>', proposalId: '<UUID>', reviewerId: '<UUID>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', submittedAt: '<Datetime>', updatedByPrincipal: '<UUID>', verdict: '<String>', verdictTrgmSimilarity: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformProposalReview.update({ where: { id: '<UUID>' }, data: { body: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformProposalReview.delete({ where: { id: '<UUID>' } }).execute();
```

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.platformProposalsChunk`

CRUD operations for PlatformProposalsChunk records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `body` | String | Yes |
| `chunkIndex` | Int | Yes |
| `createdAt` | Datetime | No |
| `embedding` | Vector | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `platformProposalsId` | UUID | Yes |
| `searchScore` | Float | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformProposalsChunk records
const items = await db.platformProposalsChunk.findMany({ select: { actorId: true, body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformProposalsId: true, searchScore: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformProposalsChunk.findOne({ id: '<UUID>', select: { actorId: true, body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformProposalsId: true, searchScore: true, updatedAt: true } }).execute();

// Create
const created = await db.platformProposalsChunk.create({ data: { actorId: '<UUID>', body: '<String>', chunkIndex: '<Int>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', platformProposalsId: '<UUID>', searchScore: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformProposalsChunk.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformProposalsChunk.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

### `db.platformRegistryBinding`

CRUD operations for PlatformRegistryBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `namespaceId` | UUID | Yes |
| `observedCredentialVersion` | String | Yes |
| `pullSecretName` | String | Yes |
| `realm` | String | Yes |
| `registryHost` | String | Yes |
| `registryId` | UUID | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformRegistryBinding records
const items = await db.platformRegistryBinding.findMany({ select: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformRegistryBinding.findOne({ id: '<UUID>', select: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformRegistryBinding.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', metadata: '<JSON>', namespaceId: '<UUID>', observedCredentialVersion: '<String>', pullSecretName: '<String>', realm: '<String>', registryHost: '<String>', registryId: '<UUID>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformRegistryBinding.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformRegistryBinding.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformRegistry`

CRUD operations for PlatformRegistry records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `authMode` | String | Yes |
| `basePath` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `credentialSecretName` | String | Yes |
| `host` | String | Yes |
| `id` | UUID | No |
| `installationId` | UUID | Yes |
| `isPublished` | Boolean | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `platformOnly` | Boolean | Yes |
| `role` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformRegistry records
const items = await db.platformRegistry.findMany({ select: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformRegistry.findOne({ id: '<UUID>', select: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformRegistry.create({ data: { authMode: '<String>', basePath: '<String>', createdByPrincipal: '<UUID>', credentialSecretName: '<String>', host: '<String>', installationId: '<UUID>', isPublished: '<Boolean>', kind: '<String>', labels: '<JSON>', lastError: '<String>', metadata: '<JSON>', name: '<String>', platformOnly: '<Boolean>', role: '<String>', status: '<String>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformRegistry.update({ where: { id: '<UUID>' }, data: { authMode: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformRegistry.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformRegistryGrant`

CRUD operations for PlatformRegistryGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actions` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `expiresAt` | Datetime | Yes |
| `grantedBy` | UUID | Yes |
| `granteeKey` | UUID | Yes |
| `granteeScope` | String | Yes |
| `id` | UUID | No |
| `registryId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformRegistryGrant records
const items = await db.platformRegistryGrant.findMany({ select: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformRegistryGrant.findOne({ id: '<UUID>', select: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformRegistryGrant.create({ data: { actions: '<String>', createdByPrincipal: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', registryId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformRegistryGrant.update({ where: { id: '<UUID>' }, data: { actions: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformRegistryGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformRepository`

CRUD operations for PlatformRepository records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cloneUrl` | String | Yes |
| `cloneUrlTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `defaultBranch` | String | Yes |
| `defaultBranchTrgmSimilarity` | Float | Yes |
| `description` | String | Yes |
| `descriptionTrgmSimilarity` | Float | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `externalId` | String | Yes |
| `externalIdTrgmSimilarity` | Float | Yes |
| `id` | UUID | No |
| `isArchived` | Boolean | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `nameTrgmSimilarity` | Float | Yes |
| `ownerId` | UUID | Yes |
| `provider` | String | Yes |
| `providerTrgmSimilarity` | Float | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `slug` | String | Yes |
| `slugTrgmSimilarity` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |
| `visibility` | String | Yes |
| `visibilityTrgmSimilarity` | Float | Yes |

**Operations:**

```typescript
// List all platformRepository records
const items = await db.platformRepository.findMany({ select: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } }).execute();

// Get one by id
const item = await db.platformRepository.findOne({ id: '<UUID>', select: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } }).execute();

// Create
const created = await db.platformRepository.create({ data: { cloneUrl: '<String>', cloneUrlTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', defaultBranch: '<String>', defaultBranchTrgmSimilarity: '<Float>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', externalId: '<String>', externalIdTrgmSimilarity: '<Float>', isArchived: '<Boolean>', metadata: '<JSON>', name: '<String>', nameTrgmSimilarity: '<Float>', ownerId: '<UUID>', provider: '<String>', providerTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', slugTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>', visibility: '<String>', visibilityTrgmSimilarity: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformRepository.update({ where: { id: '<UUID>' }, data: { cloneUrl: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformRepository.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.platformRepositoryEvent`

CRUD operations for PlatformRepositoryEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `commitSha` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `deliveryId` | String | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `payload` | JSON | Yes |
| `ref` | String | Yes |
| `repositoryId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformRepositoryEvent records
const items = await db.platformRepositoryEvent.findMany({ select: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformRepositoryEvent.findOne({ id: '<UUID>', select: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformRepositoryEvent.create({ data: { actorId: '<UUID>', commitSha: '<String>', createdByPrincipal: '<UUID>', deliveryId: '<String>', eventType: '<String>', metadata: '<JSON>', payload: '<JSON>', ref: '<String>', repositoryId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformRepositoryEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformRepositoryEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformRepositoryRequiredCheck`

CRUD operations for PlatformRepositoryRequiredCheck records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `repositoryId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `workflowId` | UUID | Yes |

**Operations:**

```typescript
// List all platformRepositoryRequiredCheck records
const items = await db.platformRepositoryRequiredCheck.findMany({ select: { createdAt: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } }).execute();

// Get one by id
const item = await db.platformRepositoryRequiredCheck.findOne({ id: '<UUID>', select: { createdAt: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } }).execute();

// Create
const created = await db.platformRepositoryRequiredCheck.create({ data: { repositoryId: '<UUID>', workflowId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformRepositoryRequiredCheck.update({ where: { id: '<UUID>' }, data: { repositoryId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformRepositoryRequiredCheck.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformRepositoryWorkflow`

CRUD operations for PlatformRepositoryWorkflow records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cancelInProgress` | Boolean | Yes |
| `concurrencyKey` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `eventType` | String | Yes |
| `graphId` | UUID | Yes |
| `id` | UUID | No |
| `inputs` | JSON | Yes |
| `isEnabled` | Boolean | Yes |
| `name` | String | Yes |
| `refPattern` | String | Yes |
| `repositoryId` | UUID | Yes |
| `requiredSecrets` | String | Yes |
| `slug` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformRepositoryWorkflow records
const items = await db.platformRepositoryWorkflow.findMany({ select: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformRepositoryWorkflow.findOne({ id: '<UUID>', select: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformRepositoryWorkflow.create({ data: { cancelInProgress: '<Boolean>', concurrencyKey: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', eventType: '<String>', graphId: '<UUID>', inputs: '<JSON>', isEnabled: '<Boolean>', name: '<String>', refPattern: '<String>', repositoryId: '<UUID>', requiredSecrets: '<String>', slug: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformRepositoryWorkflow.update({ where: { id: '<UUID>' }, data: { cancelInProgress: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformRepositoryWorkflow.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResource`

CRUD operations for PlatformResource records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `errorCount` | Int | Yes |
| `id` | UUID | No |
| `imageRef` | String | Yes |
| `installationId` | UUID | Yes |
| `integrations` | String | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `lastHeartbeatAt` | Datetime | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `realm` | String | Yes |
| `replicas` | Int | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `resourceDefinitionId` | UUID | Yes |
| `slug` | String | Yes |
| `spec` | JSON | Yes |
| `status` | String | Yes |
| `statusObserved` | JSON | Yes |
| `storageClass` | String | Yes |
| `storageSizeBytes` | BigInt | Yes |
| `storageTotalBytes` | BigInt | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformResource records
const items = await db.platformResource.findMany({ select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformResource.findOne({ id: '<UUID>', select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformResource.create({ data: { annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResource.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResource.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceDeclaredCapacity`

CRUD operations for PlatformResourceDeclaredCapacity records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `installationId` | UUID | Yes |
| `isTransient` | Boolean | Yes |
| `kind` | String | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `namespaceId` | UUID | Yes |
| `podCountMax` | Int | Yes |
| `podCountMin` | Int | Yes |
| `source` | String | Yes |
| `sourceId` | UUID | Yes |
| `storageSizeBytes` | BigInt | Yes |
| `storageTotalBytes` | BigInt | Yes |

**Operations:**

```typescript
// List all platformResourceDeclaredCapacity records
const items = await db.platformResourceDeclaredCapacity.findMany({ select: { cpuLimitMillicores: true, cpuRequestMillicores: true, installationId: true, isTransient: true, kind: true, memoryLimitBytes: true, memoryRequestBytes: true, namespaceId: true, podCountMax: true, podCountMin: true, source: true, sourceId: true, storageSizeBytes: true, storageTotalBytes: true } }).execute();

// Get one by id
const item = await db.platformResourceDeclaredCapacity.findOne({ id: '<UUID>', select: { cpuLimitMillicores: true, cpuRequestMillicores: true, installationId: true, isTransient: true, kind: true, memoryLimitBytes: true, memoryRequestBytes: true, namespaceId: true, podCountMax: true, podCountMin: true, source: true, sourceId: true, storageSizeBytes: true, storageTotalBytes: true } }).execute();

// Create
const created = await db.platformResourceDeclaredCapacity.create({ data: { cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', installationId: '<UUID>', isTransient: '<Boolean>', kind: '<String>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', namespaceId: '<UUID>', podCountMax: '<Int>', podCountMin: '<Int>', source: '<String>', sourceId: '<UUID>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceDeclaredCapacity.update({ where: { id: '<UUID>' }, data: { cpuLimitMillicores: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceDeclaredCapacity.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceDefinition`

CRUD operations for PlatformResourceDefinition records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `defaultSpec` | JSON | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `integrations` | String | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `paramsSchema` | JSON | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `slug` | String | Yes |
| `stepUpMinAge` | Interval | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformResourceDefinition records
const items = await db.platformResourceDefinition.findMany({ select: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformResourceDefinition.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformResourceDefinition.create({ data: { annotations: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', defaultSpec: '<JSON>', description: '<String>', integrations: '<String>', kind: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', paramsSchema: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', slug: '<String>', stepUpMinAge: '<Interval>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceDefinition.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceDefinition.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceEvent`

CRUD operations for PlatformResourceEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `resourceId` | UUID | Yes |

**Operations:**

```typescript
// List all platformResourceEvent records
const items = await db.platformResourceEvent.findMany({ select: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } }).execute();

// Get one by id
const item = await db.platformResourceEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } }).execute();

// Create
const created = await db.platformResourceEvent.create({ data: { actorId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', resourceId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceInstallation`

CRUD operations for PlatformResourceInstallation records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `commitId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `params` | JSON | Yes |
| `revision` | Int | Yes |
| `slug` | String | Yes |
| `status` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformResourceInstallation records
const items = await db.platformResourceInstallation.findMany({ select: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformResourceInstallation.findOne({ id: '<UUID>', select: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformResourceInstallation.create({ data: { commitId: '<UUID>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', name: '<String>', namespaceId: '<UUID>', params: '<JSON>', revision: '<Int>', slug: '<String>', status: '<String>', storeId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceInstallation.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceInstallation.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceObservedStorage`

CRUD operations for PlatformResourceObservedStorage records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `capacity` | String | Yes |
| `capacityBytes` | BigInt | Yes |
| `claimName` | String | Yes |
| `declaredStorageClass` | String | Yes |
| `declaredStorageSizeBytes` | BigInt | Yes |
| `declaredStorageTotalBytes` | BigInt | Yes |
| `installationId` | UUID | Yes |
| `isBound` | Boolean | Yes |
| `kind` | String | Yes |
| `namespaceId` | UUID | Yes |
| `phase` | String | Yes |
| `requested` | String | Yes |
| `requestedBytes` | BigInt | Yes |
| `resourceId` | UUID | Yes |
| `resourceStatus` | String | Yes |
| `slug` | String | Yes |
| `storageClass` | String | Yes |
| `storageName` | String | Yes |

**Operations:**

```typescript
// List all platformResourceObservedStorage records
const items = await db.platformResourceObservedStorage.findMany({ select: { capacity: true, capacityBytes: true, claimName: true, declaredStorageClass: true, declaredStorageSizeBytes: true, declaredStorageTotalBytes: true, installationId: true, isBound: true, kind: true, namespaceId: true, phase: true, requested: true, requestedBytes: true, resourceId: true, resourceStatus: true, slug: true, storageClass: true, storageName: true } }).execute();

// Get one by id
const item = await db.platformResourceObservedStorage.findOne({ id: '<UUID>', select: { capacity: true, capacityBytes: true, claimName: true, declaredStorageClass: true, declaredStorageSizeBytes: true, declaredStorageTotalBytes: true, installationId: true, isBound: true, kind: true, namespaceId: true, phase: true, requested: true, requestedBytes: true, resourceId: true, resourceStatus: true, slug: true, storageClass: true, storageName: true } }).execute();

// Create
const created = await db.platformResourceObservedStorage.create({ data: { capacity: '<String>', capacityBytes: '<BigInt>', claimName: '<String>', declaredStorageClass: '<String>', declaredStorageSizeBytes: '<BigInt>', declaredStorageTotalBytes: '<BigInt>', installationId: '<UUID>', isBound: '<Boolean>', kind: '<String>', namespaceId: '<UUID>', phase: '<String>', requested: '<String>', requestedBytes: '<BigInt>', resourceId: '<UUID>', resourceStatus: '<String>', slug: '<String>', storageClass: '<String>', storageName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceObservedStorage.update({ where: { id: '<UUID>' }, data: { capacity: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceObservedStorage.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceStatusCheck`

CRUD operations for PlatformResourceStatusCheck records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `completedAt` | Datetime | Yes |
| `id` | UUID | No |
| `requestedAt` | Datetime | Yes |
| `requestedBy` | UUID | Yes |
| `resourceId` | UUID | Yes |
| `result` | JSON | Yes |
| `status` | String | Yes |

**Operations:**

```typescript
// List all platformResourceStatusCheck records
const items = await db.platformResourceStatusCheck.findMany({ select: { completedAt: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } }).execute();

// Get one by id
const item = await db.platformResourceStatusCheck.findOne({ id: '<UUID>', select: { completedAt: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } }).execute();

// Create
const created = await db.platformResourceStatusCheck.create({ data: { completedAt: '<Datetime>', requestedAt: '<Datetime>', requestedBy: '<UUID>', resourceId: '<UUID>', result: '<JSON>', status: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceStatusCheck.update({ where: { id: '<UUID>' }, data: { completedAt: '<Datetime>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceStatusCheck.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceUsageLog`

CRUD operations for PlatformResourceUsageLog records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cpuMillicores` | BigInt | Yes |
| `id` | UUID | No |
| `intervalSeconds` | Int | Yes |
| `memoryBytes` | BigInt | Yes |
| `metrics` | JSON | Yes |
| `namespaceId` | UUID | Yes |
| `resourceId` | UUID | Yes |
| `sampledAt` | Datetime | Yes |
| `source` | String | Yes |

**Operations:**

```typescript
// List all platformResourceUsageLog records
const items = await db.platformResourceUsageLog.findMany({ select: { cpuMillicores: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } }).execute();

// Get one by id
const item = await db.platformResourceUsageLog.findOne({ id: '<UUID>', select: { cpuMillicores: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } }).execute();

// Create
const created = await db.platformResourceUsageLog.create({ data: { cpuMillicores: '<BigInt>', intervalSeconds: '<Int>', memoryBytes: '<BigInt>', metrics: '<JSON>', namespaceId: '<UUID>', resourceId: '<UUID>', sampledAt: '<Datetime>', source: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceUsageLog.update({ where: { id: '<UUID>' }, data: { cpuMillicores: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceUsageLog.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceUsageSummary`

CRUD operations for PlatformResourceUsageSummary records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `date` | Date | Yes |
| `gbSeconds` | BigFloat | Yes |
| `id` | UUID | No |
| `maxCpuMillicores` | BigInt | Yes |
| `maxMemoryBytes` | BigInt | Yes |
| `namespaceId` | UUID | Yes |
| `resourceId` | UUID | Yes |
| `runtimeSeconds` | BigInt | Yes |
| `sampleCount` | Int | Yes |

**Operations:**

```typescript
// List all platformResourceUsageSummary records
const items = await db.platformResourceUsageSummary.findMany({ select: { date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Get one by id
const item = await db.platformResourceUsageSummary.findOne({ id: '<UUID>', select: { date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Create
const created = await db.platformResourceUsageSummary.create({ data: { date: '<Date>', gbSeconds: '<BigFloat>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', namespaceId: '<UUID>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceUsageSummary.update({ where: { id: '<UUID>' }, data: { date: '<Date>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceUsageSummary.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourceUtilization`

CRUD operations for PlatformResourceUtilization records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `avgMemoryBytes` | BigInt | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuPeakUtilization` | BigFloat | Yes |
| `cpuRequestHeadroomMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `date` | Date | Yes |
| `gbSeconds` | BigFloat | Yes |
| `kind` | String | Yes |
| `maxCpuMillicores` | BigInt | Yes |
| `maxMemoryBytes` | BigInt | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryPeakUtilization` | BigFloat | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `memoryRequestHeadroomBytes` | BigInt | Yes |
| `namespaceId` | UUID | Yes |
| `replicas` | Int | Yes |
| `resourceId` | UUID | Yes |
| `runtimeSeconds` | BigInt | Yes |
| `sampleCount` | Int | Yes |

**Operations:**

```typescript
// List all platformResourceUtilization records
const items = await db.platformResourceUtilization.findMany({ select: { avgMemoryBytes: true, cpuLimitMillicores: true, cpuPeakUtilization: true, cpuRequestHeadroomMillicores: true, cpuRequestMillicores: true, date: true, gbSeconds: true, kind: true, maxCpuMillicores: true, maxMemoryBytes: true, memoryLimitBytes: true, memoryPeakUtilization: true, memoryRequestBytes: true, memoryRequestHeadroomBytes: true, namespaceId: true, replicas: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Get one by id
const item = await db.platformResourceUtilization.findOne({ id: '<UUID>', select: { avgMemoryBytes: true, cpuLimitMillicores: true, cpuPeakUtilization: true, cpuRequestHeadroomMillicores: true, cpuRequestMillicores: true, date: true, gbSeconds: true, kind: true, maxCpuMillicores: true, maxMemoryBytes: true, memoryLimitBytes: true, memoryPeakUtilization: true, memoryRequestBytes: true, memoryRequestHeadroomBytes: true, namespaceId: true, replicas: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Create
const created = await db.platformResourceUtilization.create({ data: { avgMemoryBytes: '<BigInt>', cpuLimitMillicores: '<BigInt>', cpuPeakUtilization: '<BigFloat>', cpuRequestHeadroomMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', date: '<Date>', gbSeconds: '<BigFloat>', kind: '<String>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', memoryLimitBytes: '<BigInt>', memoryPeakUtilization: '<BigFloat>', memoryRequestBytes: '<BigInt>', memoryRequestHeadroomBytes: '<BigInt>', namespaceId: '<UUID>', replicas: '<Int>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourceUtilization.update({ where: { id: '<UUID>' }, data: { avgMemoryBytes: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourceUtilization.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourcesHealth`

CRUD operations for PlatformResourcesHealth records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `errorCount` | Int | Yes |
| `id` | UUID | No |
| `imageRef` | String | Yes |
| `installationId` | UUID | Yes |
| `integrations` | String | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `lastHeartbeatAt` | Datetime | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `realm` | String | Yes |
| `replicas` | Int | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `resourceDefinitionId` | UUID | Yes |
| `slug` | String | Yes |
| `spec` | JSON | Yes |
| `status` | String | Yes |
| `statusDetail` | String | Yes |
| `statusObserved` | JSON | Yes |
| `storageClass` | String | Yes |
| `storageSizeBytes` | BigInt | Yes |
| `storageTotalBytes` | BigInt | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformResourcesHealth records
const items = await db.platformResourcesHealth.findMany({ select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformResourcesHealth.findOne({ id: '<UUID>', select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformResourcesHealth.create({ data: { annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusDetail: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourcesHealth.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourcesHealth.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourcesRequirementsState`

CRUD operations for PlatformResourcesRequirementsState records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `configHash` | String | Yes |
| `configObjectName` | String | Yes |
| `requirementsHash` | String | Yes |
| `resourceId` | UUID | Yes |
| `secretsHash` | String | Yes |
| `secretsObjectName` | String | Yes |
| `slug` | String | Yes |

**Operations:**

```typescript
// List all platformResourcesRequirementsState records
const items = await db.platformResourcesRequirementsState.findMany({ select: { configHash: true, configObjectName: true, requirementsHash: true, resourceId: true, secretsHash: true, secretsObjectName: true, slug: true } }).execute();

// Get one by id
const item = await db.platformResourcesRequirementsState.findOne({ id: '<UUID>', select: { configHash: true, configObjectName: true, requirementsHash: true, resourceId: true, secretsHash: true, secretsObjectName: true, slug: true } }).execute();

// Create
const created = await db.platformResourcesRequirementsState.create({ data: { configHash: '<String>', configObjectName: '<String>', requirementsHash: '<String>', resourceId: '<UUID>', secretsHash: '<String>', secretsObjectName: '<String>', slug: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourcesRequirementsState.update({ where: { id: '<UUID>' }, data: { configHash: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourcesRequirementsState.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformResourcesResolvedRequirement`

CRUD operations for PlatformResourcesResolvedRequirement records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `atomId` | UUID | Yes |
| `configObjectName` | String | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `present` | Boolean | Yes |
| `realm` | String | Yes |
| `required` | Boolean | Yes |
| `requirementKind` | String | Yes |
| `resourceId` | UUID | Yes |
| `secretsObjectName` | String | Yes |
| `slug` | String | Yes |

**Operations:**

```typescript
// List all platformResourcesResolvedRequirement records
const items = await db.platformResourcesResolvedRequirement.findMany({ select: { atomId: true, configObjectName: true, name: true, namespaceId: true, present: true, realm: true, required: true, requirementKind: true, resourceId: true, secretsObjectName: true, slug: true } }).execute();

// Get one by id
const item = await db.platformResourcesResolvedRequirement.findOne({ id: '<UUID>', select: { atomId: true, configObjectName: true, name: true, namespaceId: true, present: true, realm: true, required: true, requirementKind: true, resourceId: true, secretsObjectName: true, slug: true } }).execute();

// Create
const created = await db.platformResourcesResolvedRequirement.create({ data: { atomId: '<UUID>', configObjectName: '<String>', name: '<String>', namespaceId: '<UUID>', present: '<Boolean>', realm: '<String>', required: '<Boolean>', requirementKind: '<String>', resourceId: '<UUID>', secretsObjectName: '<String>', slug: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformResourcesResolvedRequirement.update({ where: { id: '<UUID>' }, data: { atomId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformResourcesResolvedRequirement.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformWebhookEndpoint`

CRUD operations for PlatformWebhookEndpoint records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `active` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `functionDefinitionId` | UUID | Yes |
| `host` | String | Yes |
| `id` | UUID | No |
| `namespaceId` | UUID | Yes |
| `path` | String | Yes |
| `provider` | String | Yes |
| `replayWindowSeconds` | Int | Yes |
| `signingSecretName` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all platformWebhookEndpoint records
const items = await db.platformWebhookEndpoint.findMany({ select: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.platformWebhookEndpoint.findOne({ id: '<UUID>', select: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.platformWebhookEndpoint.create({ data: { active: '<Boolean>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', functionDefinitionId: '<UUID>', host: '<String>', namespaceId: '<UUID>', path: '<String>', provider: '<String>', replayWindowSeconds: '<Int>', signingSecretName: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformWebhookEndpoint.update({ where: { id: '<UUID>' }, data: { active: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformWebhookEndpoint.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformWebhookEvent`

CRUD operations for PlatformWebhookEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `endpointId` | UUID | Yes |
| `error` | String | Yes |
| `externalEventId` | String | Yes |
| `id` | UUID | No |
| `invocationCreatedAt` | Datetime | Yes |
| `invocationId` | UUID | Yes |
| `payload` | JSON | Yes |
| `provider` | String | Yes |
| `providerTimestamp` | Datetime | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformWebhookEvent records
const items = await db.platformWebhookEvent.findMany({ select: { createdAt: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformWebhookEvent.findOne({ id: '<UUID>', select: { createdAt: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } }).execute();

// Create
const created = await db.platformWebhookEvent.create({ data: { endpointId: '<UUID>', error: '<String>', externalEventId: '<String>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', payload: '<JSON>', provider: '<String>', providerTimestamp: '<Datetime>', status: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformWebhookEvent.update({ where: { id: '<UUID>' }, data: { endpointId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformWebhookEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.proposalComment`

CRUD operations for ProposalComment records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `attachments` | ConstructiveInternalTypeUpload | Yes |
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `line` | Int | Yes |
| `outdatedAt` | Datetime | Yes |
| `path` | String | Yes |
| `pathTrgmSimilarity` | Float | Yes |
| `proposalId` | UUID | Yes |
| `resolvedAt` | Datetime | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all proposalComment records
const items = await db.proposalComment.findMany({ select: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.proposalComment.findOne({ id: '<UUID>', select: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.proposalComment.create({ data: { actorId: '<UUID>', attachments: '<Upload>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', line: '<Int>', outdatedAt: '<Datetime>', path: '<String>', pathTrgmSimilarity: '<Float>', proposalId: '<UUID>', resolvedAt: '<Datetime>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.proposalComment.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.proposalComment.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.proposal`

CRUD operations for Proposal records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `closedReason` | String | Yes |
| `closedReasonTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `decidedAt` | Datetime | Yes |
| `dueAt` | Datetime | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `kind` | String | Yes |
| `kindTrgmSimilarity` | Float | Yes |
| `labels` | String | Yes |
| `mergeCommit` | String | Yes |
| `mergeCommitTrgmSimilarity` | Float | Yes |
| `mergeMethod` | String | Yes |
| `mergeMethodTrgmSimilarity` | Float | Yes |
| `mergeRequestedAt` | Datetime | Yes |
| `mergedAt` | Datetime | Yes |
| `metadata` | JSON | Yes |
| `parentId` | UUID | Yes |
| `priority` | BigFloat | Yes |
| `repositoryId` | UUID | Yes |
| `resolution` | String | Yes |
| `resolutionTrgmSimilarity` | Float | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `sourceRef` | String | Yes |
| `sourceRefTrgmSimilarity` | Float | Yes |
| `status` | String | Yes |
| `statusTrgmSimilarity` | Float | Yes |
| `targetRef` | String | Yes |
| `targetRefTrgmSimilarity` | Float | Yes |
| `title` | String | Yes |
| `titleTrgmSimilarity` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all proposal records
const items = await db.proposal.findMany({ select: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.proposal.findOne({ id: '<UUID>', select: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.proposal.create({ data: { actorId: '<UUID>', body: '<String>', bodyTrgmSimilarity: '<Float>', closedReason: '<String>', closedReasonTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', decidedAt: '<Datetime>', dueAt: '<Datetime>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', kind: '<String>', kindTrgmSimilarity: '<Float>', labels: '<String>', mergeCommit: '<String>', mergeCommitTrgmSimilarity: '<Float>', mergeMethod: '<String>', mergeMethodTrgmSimilarity: '<Float>', mergeRequestedAt: '<Datetime>', mergedAt: '<Datetime>', metadata: '<JSON>', parentId: '<UUID>', priority: '<BigFloat>', repositoryId: '<UUID>', resolution: '<String>', resolutionTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', sourceRef: '<String>', sourceRefTrgmSimilarity: '<Float>', status: '<String>', statusTrgmSimilarity: '<Float>', targetRef: '<String>', targetRefTrgmSimilarity: '<Float>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.proposal.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.proposal.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.proposalFileView`

CRUD operations for ProposalFileView records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `blobSha` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `path` | String | Yes |
| `proposalId` | UUID | Yes |
| `reviewerId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `viewedAt` | Datetime | Yes |

**Operations:**

```typescript
// List all proposalFileView records
const items = await db.proposalFileView.findMany({ select: { blobSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } }).execute();

// Get one by id
const item = await db.proposalFileView.findOne({ id: '<UUID>', select: { blobSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } }).execute();

// Create
const created = await db.proposalFileView.create({ data: { blobSha: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', path: '<String>', proposalId: '<UUID>', reviewerId: '<UUID>', updatedByPrincipal: '<UUID>', viewedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.proposalFileView.update({ where: { id: '<UUID>' }, data: { blobSha: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.proposalFileView.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.proposalReaction`

CRUD operations for ProposalReaction records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `commentId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `emoji` | String | Yes |
| `id` | UUID | No |
| `proposalId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all proposalReaction records
const items = await db.proposalReaction.findMany({ select: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, databaseId: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.proposalReaction.findOne({ id: '<UUID>', select: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, databaseId: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.proposalReaction.create({ data: { actorId: '<UUID>', commentId: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', emoji: '<String>', proposalId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.proposalReaction.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.proposalReaction.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.proposalReview`

CRUD operations for ProposalReview records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `body` | String | Yes |
| `bodyTrgmSimilarity` | Float | Yes |
| `commitSha` | String | Yes |
| `commitShaTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `proposalId` | UUID | Yes |
| `reviewerId` | UUID | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `submittedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |
| `verdict` | String | Yes |
| `verdictTrgmSimilarity` | Float | Yes |

**Operations:**

```typescript
// List all proposalReview records
const items = await db.proposalReview.findMany({ select: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } }).execute();

// Get one by id
const item = await db.proposalReview.findOne({ id: '<UUID>', select: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } }).execute();

// Create
const created = await db.proposalReview.create({ data: { body: '<String>', bodyTrgmSimilarity: '<Float>', commitSha: '<String>', commitShaTrgmSimilarity: '<Float>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', proposalId: '<UUID>', reviewerId: '<UUID>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', submittedAt: '<Datetime>', updatedByPrincipal: '<UUID>', verdict: '<String>', verdictTrgmSimilarity: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.proposalReview.update({ where: { id: '<UUID>' }, data: { body: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.proposalReview.delete({ where: { id: '<UUID>' } }).execute();
```

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.proposalsChunk`

CRUD operations for ProposalsChunk records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `body` | String | Yes |
| `chunkIndex` | Int | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `embedding` | Vector | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `proposalsId` | UUID | Yes |
| `searchScore` | Float | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all proposalsChunk records
const items = await db.proposalsChunk.findMany({ select: { actorId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, proposalsId: true, searchScore: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.proposalsChunk.findOne({ id: '<UUID>', select: { actorId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, proposalsId: true, searchScore: true, updatedAt: true } }).execute();

// Create
const created = await db.proposalsChunk.create({ data: { actorId: '<UUID>', body: '<String>', chunkIndex: '<Int>', databaseId: '<UUID>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', proposalsId: '<UUID>', searchScore: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.proposalsChunk.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.proposalsChunk.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

### `db.registryBinding`

CRUD operations for RegistryBinding records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `namespaceId` | UUID | Yes |
| `observedCredentialVersion` | String | Yes |
| `pullSecretName` | String | Yes |
| `realm` | String | Yes |
| `registryHost` | String | Yes |
| `registryId` | UUID | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all registryBinding records
const items = await db.registryBinding.findMany({ select: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.registryBinding.findOne({ id: '<UUID>', select: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.registryBinding.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', metadata: '<JSON>', namespaceId: '<UUID>', observedCredentialVersion: '<String>', pullSecretName: '<String>', realm: '<String>', registryHost: '<String>', registryId: '<UUID>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.registryBinding.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.registryBinding.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.registry`

CRUD operations for Registry records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `authMode` | String | Yes |
| `basePath` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `credentialSecretName` | String | Yes |
| `databaseId` | UUID | Yes |
| `host` | String | Yes |
| `id` | UUID | No |
| `installationId` | UUID | Yes |
| `isPublished` | Boolean | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `platformOnly` | Boolean | Yes |
| `role` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all registry records
const items = await db.registry.findMany({ select: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, databaseId: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.registry.findOne({ id: '<UUID>', select: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, databaseId: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.registry.create({ data: { authMode: '<String>', basePath: '<String>', createdByPrincipal: '<UUID>', credentialSecretName: '<String>', databaseId: '<UUID>', host: '<String>', installationId: '<UUID>', isPublished: '<Boolean>', kind: '<String>', labels: '<JSON>', lastError: '<String>', metadata: '<JSON>', name: '<String>', platformOnly: '<Boolean>', role: '<String>', status: '<String>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.registry.update({ where: { id: '<UUID>' }, data: { authMode: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.registry.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.registryGrant`

CRUD operations for RegistryGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actions` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `expiresAt` | Datetime | Yes |
| `grantedBy` | UUID | Yes |
| `granteeKey` | UUID | Yes |
| `granteeScope` | String | Yes |
| `id` | UUID | No |
| `registryId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all registryGrant records
const items = await db.registryGrant.findMany({ select: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.registryGrant.findOne({ id: '<UUID>', select: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.registryGrant.create({ data: { actions: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', registryId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.registryGrant.update({ where: { id: '<UUID>' }, data: { actions: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.registryGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.repository`

CRUD operations for Repository records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cloneUrl` | String | Yes |
| `cloneUrlTrgmSimilarity` | Float | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultBranch` | String | Yes |
| `defaultBranchTrgmSimilarity` | Float | Yes |
| `description` | String | Yes |
| `descriptionTrgmSimilarity` | Float | Yes |
| `embedding` | Vector | Yes |
| `embeddingUpdatedAt` | Datetime | Yes |
| `embeddingVectorDistance` | Float | Yes |
| `externalId` | String | Yes |
| `externalIdTrgmSimilarity` | Float | Yes |
| `id` | UUID | No |
| `isArchived` | Boolean | Yes |
| `metadata` | JSON | Yes |
| `name` | String | Yes |
| `nameTrgmSimilarity` | Float | Yes |
| `ownerId` | UUID | Yes |
| `provider` | String | Yes |
| `providerTrgmSimilarity` | Float | Yes |
| `search` | FullText | Yes |
| `searchScore` | Float | Yes |
| `searchTsvRank` | Float | Yes |
| `slug` | String | Yes |
| `slugTrgmSimilarity` | Float | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |
| `visibility` | String | Yes |
| `visibilityTrgmSimilarity` | Float | Yes |

**Operations:**

```typescript
// List all repository records
const items = await db.repository.findMany({ select: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } }).execute();

// Get one by id
const item = await db.repository.findOne({ id: '<UUID>', select: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } }).execute();

// Create
const created = await db.repository.create({ data: { cloneUrl: '<String>', cloneUrlTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', defaultBranch: '<String>', defaultBranchTrgmSimilarity: '<Float>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', externalId: '<String>', externalIdTrgmSimilarity: '<Float>', isArchived: '<Boolean>', metadata: '<JSON>', name: '<String>', nameTrgmSimilarity: '<Float>', ownerId: '<UUID>', provider: '<String>', providerTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', slugTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>', visibility: '<String>', visibilityTrgmSimilarity: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.repository.update({ where: { id: '<UUID>' }, data: { cloneUrl: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.repository.delete({ where: { id: '<UUID>' } }).execute();
```

> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance.

> **Unified Search API fields:** `search`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.repositoryEvent`

CRUD operations for RepositoryEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `commitSha` | String | Yes |
| `createdAt` | Datetime | No |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `deliveryId` | String | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `metadata` | JSON | Yes |
| `payload` | JSON | Yes |
| `ref` | String | Yes |
| `repositoryId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all repositoryEvent records
const items = await db.repositoryEvent.findMany({ select: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.repositoryEvent.findOne({ id: '<UUID>', select: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.repositoryEvent.create({ data: { actorId: '<UUID>', commitSha: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', deliveryId: '<String>', eventType: '<String>', metadata: '<JSON>', payload: '<JSON>', ref: '<String>', repositoryId: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.repositoryEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.repositoryEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.repositoryRequiredCheck`

CRUD operations for RepositoryRequiredCheck records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `repositoryId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `workflowId` | UUID | Yes |

**Operations:**

```typescript
// List all repositoryRequiredCheck records
const items = await db.repositoryRequiredCheck.findMany({ select: { createdAt: true, databaseId: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } }).execute();

// Get one by id
const item = await db.repositoryRequiredCheck.findOne({ id: '<UUID>', select: { createdAt: true, databaseId: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } }).execute();

// Create
const created = await db.repositoryRequiredCheck.create({ data: { databaseId: '<UUID>', repositoryId: '<UUID>', workflowId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.repositoryRequiredCheck.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.repositoryRequiredCheck.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.repositoryWorkflow`

CRUD operations for RepositoryWorkflow records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cancelInProgress` | Boolean | Yes |
| `concurrencyKey` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `eventType` | String | Yes |
| `graphId` | UUID | Yes |
| `id` | UUID | No |
| `inputs` | JSON | Yes |
| `isEnabled` | Boolean | Yes |
| `name` | String | Yes |
| `refPattern` | String | Yes |
| `repositoryId` | UUID | Yes |
| `requiredSecrets` | String | Yes |
| `slug` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all repositoryWorkflow records
const items = await db.repositoryWorkflow.findMany({ select: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.repositoryWorkflow.findOne({ id: '<UUID>', select: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.repositoryWorkflow.create({ data: { cancelInProgress: '<Boolean>', concurrencyKey: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', eventType: '<String>', graphId: '<UUID>', inputs: '<JSON>', isEnabled: '<Boolean>', name: '<String>', refPattern: '<String>', repositoryId: '<UUID>', requiredSecrets: '<String>', slug: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.repositoryWorkflow.update({ where: { id: '<UUID>' }, data: { cancelInProgress: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.repositoryWorkflow.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resource`

CRUD operations for Resource records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `errorCount` | Int | Yes |
| `id` | UUID | No |
| `imageRef` | String | Yes |
| `installationId` | UUID | Yes |
| `integrations` | String | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `lastHeartbeatAt` | Datetime | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `realm` | String | Yes |
| `replicas` | Int | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `resourceDefinitionId` | UUID | Yes |
| `slug` | String | Yes |
| `spec` | JSON | Yes |
| `status` | String | Yes |
| `statusObserved` | JSON | Yes |
| `storageClass` | String | Yes |
| `storageSizeBytes` | BigInt | Yes |
| `storageTotalBytes` | BigInt | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all resource records
const items = await db.resource.findMany({ select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.resource.findOne({ id: '<UUID>', select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.resource.create({ data: { annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.resource.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resource.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceDeclaredCapacity`

CRUD operations for ResourceDeclaredCapacity records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `installationId` | UUID | Yes |
| `isTransient` | Boolean | Yes |
| `kind` | String | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `namespaceId` | UUID | Yes |
| `podCountMax` | Int | Yes |
| `podCountMin` | Int | Yes |
| `source` | String | Yes |
| `sourceId` | UUID | Yes |
| `storageSizeBytes` | BigInt | Yes |
| `storageTotalBytes` | BigInt | Yes |

**Operations:**

```typescript
// List all resourceDeclaredCapacity records
const items = await db.resourceDeclaredCapacity.findMany({ select: { cpuLimitMillicores: true, cpuRequestMillicores: true, installationId: true, isTransient: true, kind: true, memoryLimitBytes: true, memoryRequestBytes: true, namespaceId: true, podCountMax: true, podCountMin: true, source: true, sourceId: true, storageSizeBytes: true, storageTotalBytes: true } }).execute();

// Get one by id
const item = await db.resourceDeclaredCapacity.findOne({ id: '<UUID>', select: { cpuLimitMillicores: true, cpuRequestMillicores: true, installationId: true, isTransient: true, kind: true, memoryLimitBytes: true, memoryRequestBytes: true, namespaceId: true, podCountMax: true, podCountMin: true, source: true, sourceId: true, storageSizeBytes: true, storageTotalBytes: true } }).execute();

// Create
const created = await db.resourceDeclaredCapacity.create({ data: { cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', installationId: '<UUID>', isTransient: '<Boolean>', kind: '<String>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', namespaceId: '<UUID>', podCountMax: '<Int>', podCountMin: '<Int>', source: '<String>', sourceId: '<UUID>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceDeclaredCapacity.update({ where: { id: '<UUID>' }, data: { cpuLimitMillicores: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceDeclaredCapacity.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceDefinition`

CRUD operations for ResourceDefinition records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultSpec` | JSON | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `integrations` | String | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `paramsSchema` | JSON | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `slug` | String | Yes |
| `stepUpMinAge` | Interval | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all resourceDefinition records
const items = await db.resourceDefinition.findMany({ select: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.resourceDefinition.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.resourceDefinition.create({ data: { annotations: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', defaultSpec: '<JSON>', description: '<String>', integrations: '<String>', kind: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', paramsSchema: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', slug: '<String>', stepUpMinAge: '<Interval>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceDefinition.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceDefinition.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceEvent`

CRUD operations for ResourceEvent records.

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
| `resourceId` | UUID | Yes |

**Operations:**

```typescript
// List all resourceEvent records
const items = await db.resourceEvent.findMany({ select: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } }).execute();

// Get one by id
const item = await db.resourceEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } }).execute();

// Create
const created = await db.resourceEvent.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', resourceId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceInstallation`

CRUD operations for ResourceInstallation records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `commitId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `params` | JSON | Yes |
| `revision` | Int | Yes |
| `slug` | String | Yes |
| `status` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all resourceInstallation records
const items = await db.resourceInstallation.findMany({ select: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.resourceInstallation.findOne({ id: '<UUID>', select: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.resourceInstallation.create({ data: { commitId: '<UUID>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', name: '<String>', namespaceId: '<UUID>', params: '<JSON>', revision: '<Int>', slug: '<String>', status: '<String>', storeId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceInstallation.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceInstallation.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceObservedStorage`

CRUD operations for ResourceObservedStorage records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `capacity` | String | Yes |
| `capacityBytes` | BigInt | Yes |
| `claimName` | String | Yes |
| `declaredStorageClass` | String | Yes |
| `declaredStorageSizeBytes` | BigInt | Yes |
| `declaredStorageTotalBytes` | BigInt | Yes |
| `installationId` | UUID | Yes |
| `isBound` | Boolean | Yes |
| `kind` | String | Yes |
| `namespaceId` | UUID | Yes |
| `phase` | String | Yes |
| `requested` | String | Yes |
| `requestedBytes` | BigInt | Yes |
| `resourceId` | UUID | Yes |
| `resourceStatus` | String | Yes |
| `slug` | String | Yes |
| `storageClass` | String | Yes |
| `storageName` | String | Yes |

**Operations:**

```typescript
// List all resourceObservedStorage records
const items = await db.resourceObservedStorage.findMany({ select: { capacity: true, capacityBytes: true, claimName: true, declaredStorageClass: true, declaredStorageSizeBytes: true, declaredStorageTotalBytes: true, installationId: true, isBound: true, kind: true, namespaceId: true, phase: true, requested: true, requestedBytes: true, resourceId: true, resourceStatus: true, slug: true, storageClass: true, storageName: true } }).execute();

// Get one by id
const item = await db.resourceObservedStorage.findOne({ id: '<UUID>', select: { capacity: true, capacityBytes: true, claimName: true, declaredStorageClass: true, declaredStorageSizeBytes: true, declaredStorageTotalBytes: true, installationId: true, isBound: true, kind: true, namespaceId: true, phase: true, requested: true, requestedBytes: true, resourceId: true, resourceStatus: true, slug: true, storageClass: true, storageName: true } }).execute();

// Create
const created = await db.resourceObservedStorage.create({ data: { capacity: '<String>', capacityBytes: '<BigInt>', claimName: '<String>', declaredStorageClass: '<String>', declaredStorageSizeBytes: '<BigInt>', declaredStorageTotalBytes: '<BigInt>', installationId: '<UUID>', isBound: '<Boolean>', kind: '<String>', namespaceId: '<UUID>', phase: '<String>', requested: '<String>', requestedBytes: '<BigInt>', resourceId: '<UUID>', resourceStatus: '<String>', slug: '<String>', storageClass: '<String>', storageName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceObservedStorage.update({ where: { id: '<UUID>' }, data: { capacity: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceObservedStorage.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceStatusCheck`

CRUD operations for ResourceStatusCheck records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `completedAt` | Datetime | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `requestedAt` | Datetime | Yes |
| `requestedBy` | UUID | Yes |
| `resourceId` | UUID | Yes |
| `result` | JSON | Yes |
| `status` | String | Yes |

**Operations:**

```typescript
// List all resourceStatusCheck records
const items = await db.resourceStatusCheck.findMany({ select: { completedAt: true, databaseId: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } }).execute();

// Get one by id
const item = await db.resourceStatusCheck.findOne({ id: '<UUID>', select: { completedAt: true, databaseId: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } }).execute();

// Create
const created = await db.resourceStatusCheck.create({ data: { completedAt: '<Datetime>', databaseId: '<UUID>', requestedAt: '<Datetime>', requestedBy: '<UUID>', resourceId: '<UUID>', result: '<JSON>', status: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceStatusCheck.update({ where: { id: '<UUID>' }, data: { completedAt: '<Datetime>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceStatusCheck.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceUsageLog`

CRUD operations for ResourceUsageLog records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cpuMillicores` | BigInt | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `intervalSeconds` | Int | Yes |
| `memoryBytes` | BigInt | Yes |
| `metrics` | JSON | Yes |
| `namespaceId` | UUID | Yes |
| `resourceId` | UUID | Yes |
| `sampledAt` | Datetime | Yes |
| `source` | String | Yes |

**Operations:**

```typescript
// List all resourceUsageLog records
const items = await db.resourceUsageLog.findMany({ select: { cpuMillicores: true, databaseId: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } }).execute();

// Get one by id
const item = await db.resourceUsageLog.findOne({ id: '<UUID>', select: { cpuMillicores: true, databaseId: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } }).execute();

// Create
const created = await db.resourceUsageLog.create({ data: { cpuMillicores: '<BigInt>', databaseId: '<UUID>', intervalSeconds: '<Int>', memoryBytes: '<BigInt>', metrics: '<JSON>', namespaceId: '<UUID>', resourceId: '<UUID>', sampledAt: '<Datetime>', source: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceUsageLog.update({ where: { id: '<UUID>' }, data: { cpuMillicores: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceUsageLog.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceUsageSummary`

CRUD operations for ResourceUsageSummary records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `date` | Date | Yes |
| `gbSeconds` | BigFloat | Yes |
| `id` | UUID | No |
| `maxCpuMillicores` | BigInt | Yes |
| `maxMemoryBytes` | BigInt | Yes |
| `namespaceId` | UUID | Yes |
| `resourceId` | UUID | Yes |
| `runtimeSeconds` | BigInt | Yes |
| `sampleCount` | Int | Yes |

**Operations:**

```typescript
// List all resourceUsageSummary records
const items = await db.resourceUsageSummary.findMany({ select: { databaseId: true, date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Get one by id
const item = await db.resourceUsageSummary.findOne({ id: '<UUID>', select: { databaseId: true, date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Create
const created = await db.resourceUsageSummary.create({ data: { databaseId: '<UUID>', date: '<Date>', gbSeconds: '<BigFloat>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', namespaceId: '<UUID>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceUsageSummary.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceUsageSummary.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceUtilization`

CRUD operations for ResourceUtilization records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `avgMemoryBytes` | BigInt | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuPeakUtilization` | BigFloat | Yes |
| `cpuRequestHeadroomMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `date` | Date | Yes |
| `gbSeconds` | BigFloat | Yes |
| `kind` | String | Yes |
| `maxCpuMillicores` | BigInt | Yes |
| `maxMemoryBytes` | BigInt | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryPeakUtilization` | BigFloat | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `memoryRequestHeadroomBytes` | BigInt | Yes |
| `namespaceId` | UUID | Yes |
| `replicas` | Int | Yes |
| `resourceId` | UUID | Yes |
| `runtimeSeconds` | BigInt | Yes |
| `sampleCount` | Int | Yes |

**Operations:**

```typescript
// List all resourceUtilization records
const items = await db.resourceUtilization.findMany({ select: { avgMemoryBytes: true, cpuLimitMillicores: true, cpuPeakUtilization: true, cpuRequestHeadroomMillicores: true, cpuRequestMillicores: true, date: true, gbSeconds: true, kind: true, maxCpuMillicores: true, maxMemoryBytes: true, memoryLimitBytes: true, memoryPeakUtilization: true, memoryRequestBytes: true, memoryRequestHeadroomBytes: true, namespaceId: true, replicas: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Get one by id
const item = await db.resourceUtilization.findOne({ id: '<UUID>', select: { avgMemoryBytes: true, cpuLimitMillicores: true, cpuPeakUtilization: true, cpuRequestHeadroomMillicores: true, cpuRequestMillicores: true, date: true, gbSeconds: true, kind: true, maxCpuMillicores: true, maxMemoryBytes: true, memoryLimitBytes: true, memoryPeakUtilization: true, memoryRequestBytes: true, memoryRequestHeadroomBytes: true, namespaceId: true, replicas: true, resourceId: true, runtimeSeconds: true, sampleCount: true } }).execute();

// Create
const created = await db.resourceUtilization.create({ data: { avgMemoryBytes: '<BigInt>', cpuLimitMillicores: '<BigInt>', cpuPeakUtilization: '<BigFloat>', cpuRequestHeadroomMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', date: '<Date>', gbSeconds: '<BigFloat>', kind: '<String>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', memoryLimitBytes: '<BigInt>', memoryPeakUtilization: '<BigFloat>', memoryRequestBytes: '<BigInt>', memoryRequestHeadroomBytes: '<BigInt>', namespaceId: '<UUID>', replicas: '<Int>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceUtilization.update({ where: { id: '<UUID>' }, data: { avgMemoryBytes: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceUtilization.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourcesHealth`

CRUD operations for ResourcesHealth records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `cpuLimitMillicores` | BigInt | Yes |
| `cpuRequestMillicores` | BigInt | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `errorCount` | Int | Yes |
| `id` | UUID | No |
| `imageRef` | String | Yes |
| `installationId` | UUID | Yes |
| `integrations` | String | Yes |
| `kind` | String | Yes |
| `labels` | JSON | Yes |
| `lastError` | String | Yes |
| `lastHeartbeatAt` | Datetime | Yes |
| `memoryLimitBytes` | BigInt | Yes |
| `memoryRequestBytes` | BigInt | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `realm` | String | Yes |
| `replicas` | Int | Yes |
| `requiredConfigs` | ResourceRequirement | Yes |
| `requiredSecrets` | ResourceRequirement | Yes |
| `resourceDefinitionId` | UUID | Yes |
| `slug` | String | Yes |
| `spec` | JSON | Yes |
| `status` | String | Yes |
| `statusDetail` | String | Yes |
| `statusObserved` | JSON | Yes |
| `storageClass` | String | Yes |
| `storageSizeBytes` | BigInt | Yes |
| `storageTotalBytes` | BigInt | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all resourcesHealth records
const items = await db.resourcesHealth.findMany({ select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.resourcesHealth.findOne({ id: '<UUID>', select: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.resourcesHealth.create({ data: { annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusDetail: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourcesHealth.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourcesHealth.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourcesRequirementsState`

CRUD operations for ResourcesRequirementsState records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `configHash` | String | Yes |
| `configObjectName` | String | Yes |
| `requirementsHash` | String | Yes |
| `resourceId` | UUID | Yes |
| `secretsHash` | String | Yes |
| `secretsObjectName` | String | Yes |
| `slug` | String | Yes |

**Operations:**

```typescript
// List all resourcesRequirementsState records
const items = await db.resourcesRequirementsState.findMany({ select: { configHash: true, configObjectName: true, requirementsHash: true, resourceId: true, secretsHash: true, secretsObjectName: true, slug: true } }).execute();

// Get one by id
const item = await db.resourcesRequirementsState.findOne({ id: '<UUID>', select: { configHash: true, configObjectName: true, requirementsHash: true, resourceId: true, secretsHash: true, secretsObjectName: true, slug: true } }).execute();

// Create
const created = await db.resourcesRequirementsState.create({ data: { configHash: '<String>', configObjectName: '<String>', requirementsHash: '<String>', resourceId: '<UUID>', secretsHash: '<String>', secretsObjectName: '<String>', slug: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourcesRequirementsState.update({ where: { id: '<UUID>' }, data: { configHash: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourcesRequirementsState.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourcesResolvedRequirement`

CRUD operations for ResourcesResolvedRequirement records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `atomId` | UUID | Yes |
| `configObjectName` | String | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `present` | Boolean | Yes |
| `realm` | String | Yes |
| `required` | Boolean | Yes |
| `requirementKind` | String | Yes |
| `resourceId` | UUID | Yes |
| `secretsObjectName` | String | Yes |
| `slug` | String | Yes |

**Operations:**

```typescript
// List all resourcesResolvedRequirement records
const items = await db.resourcesResolvedRequirement.findMany({ select: { atomId: true, configObjectName: true, name: true, namespaceId: true, present: true, realm: true, required: true, requirementKind: true, resourceId: true, secretsObjectName: true, slug: true } }).execute();

// Get one by id
const item = await db.resourcesResolvedRequirement.findOne({ id: '<UUID>', select: { atomId: true, configObjectName: true, name: true, namespaceId: true, present: true, realm: true, required: true, requirementKind: true, resourceId: true, secretsObjectName: true, slug: true } }).execute();

// Create
const created = await db.resourcesResolvedRequirement.create({ data: { atomId: '<UUID>', configObjectName: '<String>', name: '<String>', namespaceId: '<UUID>', present: '<Boolean>', realm: '<String>', required: '<Boolean>', requirementKind: '<String>', resourceId: '<UUID>', secretsObjectName: '<String>', slug: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourcesResolvedRequirement.update({ where: { id: '<UUID>' }, data: { atomId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourcesResolvedRequirement.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.webhookEndpoint`

CRUD operations for WebhookEndpoint records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `active` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `functionDefinitionId` | UUID | Yes |
| `host` | String | Yes |
| `id` | UUID | No |
| `namespaceId` | UUID | Yes |
| `path` | String | Yes |
| `provider` | String | Yes |
| `replayWindowSeconds` | Int | Yes |
| `signingSecretName` | String | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all webhookEndpoint records
const items = await db.webhookEndpoint.findMany({ select: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.webhookEndpoint.findOne({ id: '<UUID>', select: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.webhookEndpoint.create({ data: { active: '<Boolean>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', functionDefinitionId: '<UUID>', host: '<String>', namespaceId: '<UUID>', path: '<String>', provider: '<String>', replayWindowSeconds: '<Int>', signingSecretName: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.webhookEndpoint.update({ where: { id: '<UUID>' }, data: { active: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.webhookEndpoint.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.webhookEvent`

CRUD operations for WebhookEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `endpointId` | UUID | Yes |
| `error` | String | Yes |
| `externalEventId` | String | Yes |
| `id` | UUID | No |
| `invocationCreatedAt` | Datetime | Yes |
| `invocationId` | UUID | Yes |
| `payload` | JSON | Yes |
| `provider` | String | Yes |
| `providerTimestamp` | Datetime | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all webhookEvent records
const items = await db.webhookEvent.findMany({ select: { createdAt: true, databaseId: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.webhookEvent.findOne({ id: '<UUID>', select: { createdAt: true, databaseId: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } }).execute();

// Create
const created = await db.webhookEvent.create({ data: { databaseId: '<UUID>', endpointId: '<UUID>', error: '<String>', externalEventId: '<String>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', payload: '<JSON>', provider: '<String>', providerTimestamp: '<Datetime>', status: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.webhookEvent.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.webhookEvent.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.query.databaseReadFunctionGraph`

databaseReadFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `graphId` | UUID |

```typescript
const result = await db.query.databaseReadFunctionGraph({ graphId: '<UUID>' }).execute();
```

### `db.query.readFunctionGraph`

readFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `graphId` | UUID |

```typescript
const result = await db.query.readFunctionGraph({ graphId: '<UUID>' }).execute();
```

### `db.mutation.addEdge`

addEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddEdgeInput (required) |

```typescript
const result = await db.mutation.addEdge({ input: '<AddEdgeInput>' }).execute();
```

### `db.mutation.addEdgeAndSave`

addEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddEdgeAndSaveInput (required) |

```typescript
const result = await db.mutation.addEdgeAndSave({ input: '<AddEdgeAndSaveInput>' }).execute();
```

### `db.mutation.addNode`

addNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddNodeInput (required) |

```typescript
const result = await db.mutation.addNode({ input: '<AddNodeInput>' }).execute();
```

### `db.mutation.addNodeAndSave`

addNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddNodeAndSaveInput (required) |

```typescript
const result = await db.mutation.addNodeAndSave({ input: '<AddNodeAndSaveInput>' }).execute();
```

### `db.mutation.approveNode`

approveNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ApproveNodeInput (required) |

```typescript
const result = await db.mutation.approveNode({ input: { approved: '<Boolean>', executionId: '<UUID>', feedback: '<JSON>', nodeName: '<String>' } }).execute();
```

### `db.mutation.copyGraph`

copyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CopyGraphInput (required) |

```typescript
const result = await db.mutation.copyGraph({ input: { graphId: '<UUID>', name: '<String>', scopeId: '<UUID>' } }).execute();
```

### `db.mutation.databaseAddEdge`

databaseAddEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddEdgeInput (required) |

```typescript
const result = await db.mutation.databaseAddEdge({ input: '<DatabaseAddEdgeInput>' }).execute();
```

### `db.mutation.databaseAddEdgeAndSave`

databaseAddEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddEdgeAndSaveInput (required) |

```typescript
const result = await db.mutation.databaseAddEdgeAndSave({ input: '<DatabaseAddEdgeAndSaveInput>' }).execute();
```

### `db.mutation.databaseAddNode`

databaseAddNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddNodeInput (required) |

```typescript
const result = await db.mutation.databaseAddNode({ input: '<DatabaseAddNodeInput>' }).execute();
```

### `db.mutation.databaseAddNodeAndSave`

databaseAddNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddNodeAndSaveInput (required) |

```typescript
const result = await db.mutation.databaseAddNodeAndSave({ input: '<DatabaseAddNodeAndSaveInput>' }).execute();
```

### `db.mutation.databaseApproveNode`

databaseApproveNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseApproveNodeInput (required) |

```typescript
const result = await db.mutation.databaseApproveNode({ input: { approved: '<Boolean>', executionId: '<UUID>', feedback: '<JSON>', nodeName: '<String>' } }).execute();
```

### `db.mutation.databaseCopyGraph`

databaseCopyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseCopyGraphInput (required) |

```typescript
const result = await db.mutation.databaseCopyGraph({ input: { databaseId: '<UUID>', graphId: '<UUID>', name: '<String>' } }).execute();
```

### `db.mutation.databaseCreateFunctionGraph`

databaseCreateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseCreateFunctionGraphInput (required) |

```typescript
const result = await db.mutation.databaseCreateFunctionGraph({ input: '<DatabaseCreateFunctionGraphInput>' }).execute();
```

### `db.mutation.databaseGraphInitEmptyRepo`

databaseGraphInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphInitEmptyRepoInput (required) |

```typescript
const result = await db.mutation.databaseGraphInitEmptyRepo({ input: { sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.databaseGraphInsertNodeAtPath`

databaseGraphInsertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphInsertNodeAtPathInput (required) |

```typescript
const result = await db.mutation.databaseGraphInsertNodeAtPath({ input: '<DatabaseGraphInsertNodeAtPathInput>' }).execute();
```

### `db.mutation.databaseGraphInsertNodesAtPaths`

databaseGraphInsertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphInsertNodesAtPathsInput (required) |

```typescript
const result = await db.mutation.databaseGraphInsertNodesAtPaths({ input: '<DatabaseGraphInsertNodesAtPathsInput>' }).execute();
```

### `db.mutation.databaseGraphSetAndCommit`

databaseGraphSetAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphSetAndCommitInput (required) |

```typescript
const result = await db.mutation.databaseGraphSetAndCommit({ input: '<DatabaseGraphSetAndCommitInput>' }).execute();
```

### `db.mutation.databaseGraphSetDataAtPath`

databaseGraphSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphSetDataAtPathInput (required) |

```typescript
const result = await db.mutation.databaseGraphSetDataAtPath({ input: { data: '<JSON>', path: '<String>', root: '<UUID>', sId: '<UUID>' } }).execute();
```

### `db.mutation.databaseGraphSetManyAndCommit`

databaseGraphSetManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphSetManyAndCommitInput (required) |

```typescript
const result = await db.mutation.databaseGraphSetManyAndCommit({ input: { entries: '<JSON>', message: '<String>', refname: '<String>', sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.databaseImportDefinitions`

databaseImportDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseImportDefinitionsInput (required) |

```typescript
const result = await db.mutation.databaseImportDefinitions({ input: { contexts: '<String>', graphId: '<UUID>', sourceCommitId: '<UUID>', sourceScopeId: '<UUID>' } }).execute();
```

### `db.mutation.databaseImportGraphJson`

databaseImportGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseImportGraphJsonInput (required) |

```typescript
const result = await db.mutation.databaseImportGraphJson({ input: '<DatabaseImportGraphJsonInput>' }).execute();
```

### `db.mutation.databaseSaveGraph`

databaseSaveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseSaveGraphInput (required) |

```typescript
const result = await db.mutation.databaseSaveGraph({ input: { graphId: '<UUID>', message: '<String>', rootHash: '<UUID>' } }).execute();
```

### `db.mutation.databaseStartExecution`

databaseStartExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseStartExecutionInput (required) |

```typescript
const result = await db.mutation.databaseStartExecution({ input: '<DatabaseStartExecutionInput>' }).execute();
```

### `db.mutation.databaseValidateFunctionGraph`

databaseValidateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseValidateFunctionGraphInput (required) |

```typescript
const result = await db.mutation.databaseValidateFunctionGraph({ input: { graphId: '<UUID>' } }).execute();
```

### `db.mutation.functionExecutionLogsAppend`

functionExecutionLogsAppend

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FunctionExecutionLogsAppendInput (required) |

```typescript
const result = await db.mutation.functionExecutionLogsAppend({ input: '<FunctionExecutionLogsAppendInput>' }).execute();
```

### `db.mutation.functionInvocationsCreatePage`

functionInvocationsCreatePage

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FunctionInvocationsCreatePageInput (required) |

```typescript
const result = await db.mutation.functionInvocationsCreatePage({ input: { entityId: '<UUID>', payload: '<JSON>', provenance: '<JSON>', routeBindingId: '<UUID>', taskIdentifier: '<String>' } }).execute();
```

### `db.mutation.functionInvocationsCreateSync`

functionInvocationsCreateSync

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FunctionInvocationsCreateSyncInput (required) |

```typescript
const result = await db.mutation.functionInvocationsCreateSync({ input: { entityId: '<UUID>', payload: '<JSON>', provenance: '<JSON>', routeBindingId: '<UUID>', taskIdentifier: '<String>' } }).execute();
```

### `db.mutation.importDefinitions`

importDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ImportDefinitionsInput (required) |

```typescript
const result = await db.mutation.importDefinitions({ input: { contexts: '<String>', graphId: '<UUID>', sourceCommitId: '<UUID>', sourceScopeId: '<UUID>' } }).execute();
```

### `db.mutation.importGraphJson`

importGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ImportGraphJsonInput (required) |

```typescript
const result = await db.mutation.importGraphJson({ input: '<ImportGraphJsonInput>' }).execute();
```

### `db.mutation.infraInitEmptyRepo`

infraInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraInitEmptyRepoInput (required) |

```typescript
const result = await db.mutation.infraInitEmptyRepo({ input: { sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.infraInsertNodeAtPath`

infraInsertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraInsertNodeAtPathInput (required) |

```typescript
const result = await db.mutation.infraInsertNodeAtPath({ input: '<InfraInsertNodeAtPathInput>' }).execute();
```

### `db.mutation.infraInsertNodesAtPaths`

infraInsertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraInsertNodesAtPathsInput (required) |

```typescript
const result = await db.mutation.infraInsertNodesAtPaths({ input: '<InfraInsertNodesAtPathsInput>' }).execute();
```

### `db.mutation.infraSetAndCommit`

infraSetAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraSetAndCommitInput (required) |

```typescript
const result = await db.mutation.infraSetAndCommit({ input: '<InfraSetAndCommitInput>' }).execute();
```

### `db.mutation.infraSetDataAtPath`

infraSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraSetDataAtPathInput (required) |

```typescript
const result = await db.mutation.infraSetDataAtPath({ input: { data: '<JSON>', path: '<String>', root: '<UUID>', sId: '<UUID>' } }).execute();
```

### `db.mutation.infraSetManyAndCommit`

infraSetManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraSetManyAndCommitInput (required) |

```typescript
const result = await db.mutation.infraSetManyAndCommit({ input: { entries: '<JSON>', message: '<String>', refname: '<String>', sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.initEmptyRepo`

initEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InitEmptyRepoInput (required) |

```typescript
const result = await db.mutation.initEmptyRepo({ input: { sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.insertNodeAtPath`

insertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InsertNodeAtPathInput (required) |

```typescript
const result = await db.mutation.insertNodeAtPath({ input: '<InsertNodeAtPathInput>' }).execute();
```

### `db.mutation.insertNodesAtPaths`

insertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InsertNodesAtPathsInput (required) |

```typescript
const result = await db.mutation.insertNodesAtPaths({ input: '<InsertNodesAtPathsInput>' }).execute();
```

### `db.mutation.platformFunctionExecutionLogsAppend`

platformFunctionExecutionLogsAppend

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFunctionExecutionLogsAppendInput (required) |

```typescript
const result = await db.mutation.platformFunctionExecutionLogsAppend({ input: '<PlatformFunctionExecutionLogsAppendInput>' }).execute();
```

### `db.mutation.platformFunctionInvocationsCreatePage`

platformFunctionInvocationsCreatePage

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFunctionInvocationsCreatePageInput (required) |

```typescript
const result = await db.mutation.platformFunctionInvocationsCreatePage({ input: { entityId: '<UUID>', payload: '<JSON>', provenance: '<JSON>', routeBindingId: '<UUID>', taskIdentifier: '<String>' } }).execute();
```

### `db.mutation.platformFunctionInvocationsCreateSync`

platformFunctionInvocationsCreateSync

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFunctionInvocationsCreateSyncInput (required) |

```typescript
const result = await db.mutation.platformFunctionInvocationsCreateSync({ input: { entityId: '<UUID>', payload: '<JSON>', provenance: '<JSON>', routeBindingId: '<UUID>', taskIdentifier: '<String>' } }).execute();
```

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

### `db.mutation.platformResourceInstallationsInstall`

platformResourceInstallationsInstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsInstallInput (required) |

```typescript
const result = await db.mutation.platformResourceInstallationsInstall({ input: { definitionIds: '<UUID>', name: '<String>', namespaceId: '<UUID>', newParams: '<JSON>', slug: '<String>' } }).execute();
```

### `db.mutation.platformResourceInstallationsRollback`

platformResourceInstallationsRollback

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsRollbackInput (required) |

```typescript
const result = await db.mutation.platformResourceInstallationsRollback({ input: { commitId: '<UUID>', targetInstallationId: '<UUID>' } }).execute();
```

### `db.mutation.platformResourceInstallationsUninstall`

platformResourceInstallationsUninstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsUninstallInput (required) |

```typescript
const result = await db.mutation.platformResourceInstallationsUninstall({ input: { targetInstallationId: '<UUID>' } }).execute();
```

### `db.mutation.platformResourceInstallationsUpgrade`

platformResourceInstallationsUpgrade

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsUpgradeInput (required) |

```typescript
const result = await db.mutation.platformResourceInstallationsUpgrade({ input: { newParams: '<JSON>', targetInstallationId: '<UUID>' } }).execute();
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

### `db.mutation.resourceInstallationsInstall`

resourceInstallationsInstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsInstallInput (required) |

```typescript
const result = await db.mutation.resourceInstallationsInstall({ input: { definitionIds: '<UUID>', name: '<String>', namespaceId: '<UUID>', newParams: '<JSON>', slug: '<String>' } }).execute();
```

### `db.mutation.resourceInstallationsRollback`

resourceInstallationsRollback

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsRollbackInput (required) |

```typescript
const result = await db.mutation.resourceInstallationsRollback({ input: { commitId: '<UUID>', targetInstallationId: '<UUID>' } }).execute();
```

### `db.mutation.resourceInstallationsUninstall`

resourceInstallationsUninstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsUninstallInput (required) |

```typescript
const result = await db.mutation.resourceInstallationsUninstall({ input: { targetInstallationId: '<UUID>' } }).execute();
```

### `db.mutation.resourceInstallationsUpgrade`

resourceInstallationsUpgrade

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsUpgradeInput (required) |

```typescript
const result = await db.mutation.resourceInstallationsUpgrade({ input: { newParams: '<JSON>', targetInstallationId: '<UUID>' } }).execute();
```

### `db.mutation.saveGraph`

saveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SaveGraphInput (required) |

```typescript
const result = await db.mutation.saveGraph({ input: { graphId: '<UUID>', message: '<String>', rootHash: '<UUID>' } }).execute();
```

### `db.mutation.setAndCommit`

setAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetAndCommitInput (required) |

```typescript
const result = await db.mutation.setAndCommit({ input: '<SetAndCommitInput>' }).execute();
```

### `db.mutation.setDataAtPath`

setDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetDataAtPathInput (required) |

```typescript
const result = await db.mutation.setDataAtPath({ input: { data: '<JSON>', path: '<String>', root: '<UUID>', sId: '<UUID>' } }).execute();
```

### `db.mutation.setManyAndCommit`

setManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetManyAndCommitInput (required) |

```typescript
const result = await db.mutation.setManyAndCommit({ input: { entries: '<JSON>', message: '<String>', refname: '<String>', sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.startExecution`

startExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | StartExecutionInput (required) |

```typescript
const result = await db.mutation.startExecution({ input: '<StartExecutionInput>' }).execute();
```

### `db.mutation.validateFunctionGraph`

validateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ValidateFunctionGraphInput (required) |

```typescript
const result = await db.mutation.validateFunctionGraph({ input: { graphId: '<UUID>' } }).execute();
```
