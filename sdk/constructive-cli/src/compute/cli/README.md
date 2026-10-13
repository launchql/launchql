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
| `build` | build CRUD operations |
| `build-step` | buildStep CRUD operations |
| `builder-binding` | builderBinding CRUD operations |
| `content-preset` | contentPreset CRUD operations |
| `database-function-graph` | databaseFunctionGraph CRUD operations |
| `database-function-graph-execution-cancel-request` | databaseFunctionGraphExecutionCancelRequest CRUD operations |
| `database-function-graph-execution` | databaseFunctionGraphExecution CRUD operations |
| `database-function-graph-execution-node-state` | databaseFunctionGraphExecutionNodeState CRUD operations |
| `database-function-graph-execution-output` | databaseFunctionGraphExecutionOutput CRUD operations |
| `database-graph-commit` | databaseGraphCommit CRUD operations |
| `database-graph-get-all-tree-nodes-record` | databaseGraphGetAllTreeNodesRecord CRUD operations |
| `database-graph-object` | databaseGraphObject CRUD operations |
| `database-graph-ref` | databaseGraphRef CRUD operations |
| `database-graph-store` | databaseGraphStore CRUD operations |
| `db-preset` | dbPreset CRUD operations |
| `function-api-binding` | functionApiBinding CRUD operations |
| `function-capability-binding` | functionCapabilityBinding CRUD operations |
| `function-definition` | functionDefinition CRUD operations |
| `function-deployment` | functionDeployment CRUD operations |
| `function-deployment-event` | functionDeploymentEvent CRUD operations |
| `function-execution-log` | functionExecutionLog CRUD operations |
| `function-graph-commit` | functionGraphCommit CRUD operations |
| `function-graph` | functionGraph CRUD operations |
| `function-graph-execution-cancel-request` | functionGraphExecutionCancelRequest CRUD operations |
| `function-graph-execution` | functionGraphExecution CRUD operations |
| `function-graph-execution-node-state` | functionGraphExecutionNodeState CRUD operations |
| `function-graph-execution-output` | functionGraphExecutionOutput CRUD operations |
| `function-graph-object` | functionGraphObject CRUD operations |
| `function-graph-ref` | functionGraphRef CRUD operations |
| `function-graph-store` | functionGraphStore CRUD operations |
| `function-invocation-attempt` | functionInvocationAttempt CRUD operations |
| `function-invocation` | functionInvocation CRUD operations |
| `function-schedule` | functionSchedule CRUD operations |
| `get-all-tree-nodes-record` | getAllTreeNodesRecord CRUD operations |
| `image` | image CRUD operations |
| `image-grant` | imageGrant CRUD operations |
| `infra-commit` | infraCommit CRUD operations |
| `infra-get-all-tree-nodes-record` | infraGetAllTreeNodesRecord CRUD operations |
| `infra-object` | infraObject CRUD operations |
| `infra-ref` | infraRef CRUD operations |
| `infra-store` | infraStore CRUD operations |
| `integration-provider` | integrationProvider CRUD operations |
| `namespace` | namespace CRUD operations |
| `namespace-event` | namespaceEvent CRUD operations |
| `platform-build` | platformBuild CRUD operations |
| `platform-build-step` | platformBuildStep CRUD operations |
| `platform-builder-binding` | platformBuilderBinding CRUD operations |
| `platform-function-api-binding` | platformFunctionApiBinding CRUD operations |
| `platform-function-capability-binding` | platformFunctionCapabilityBinding CRUD operations |
| `platform-function-definition` | platformFunctionDefinition CRUD operations |
| `platform-function-deployment` | platformFunctionDeployment CRUD operations |
| `platform-function-deployment-event` | platformFunctionDeploymentEvent CRUD operations |
| `platform-function-execution-log` | platformFunctionExecutionLog CRUD operations |
| `platform-function-invocation-attempt` | platformFunctionInvocationAttempt CRUD operations |
| `platform-function-invocation` | platformFunctionInvocation CRUD operations |
| `platform-function-schedule` | platformFunctionSchedule CRUD operations |
| `platform-image` | platformImage CRUD operations |
| `platform-image-grant` | platformImageGrant CRUD operations |
| `platform-infra-commit` | platformInfraCommit CRUD operations |
| `platform-infra-get-all-tree-nodes-record` | platformInfraGetAllTreeNodesRecord CRUD operations |
| `platform-infra-object` | platformInfraObject CRUD operations |
| `platform-infra-ref` | platformInfraRef CRUD operations |
| `platform-infra-store` | platformInfraStore CRUD operations |
| `platform-k-8-s-resource-kind` | platformK8sResourceKind CRUD operations |
| `platform-k-8-s-spec-rule` | platformK8sSpecRule CRUD operations |
| `platform-namespace` | platformNamespace CRUD operations |
| `platform-namespace-event` | platformNamespaceEvent CRUD operations |
| `platform-proposal-comment` | platformProposalComment CRUD operations |
| `platform-proposal` | platformProposal CRUD operations |
| `platform-proposal-file-view` | platformProposalFileView CRUD operations |
| `platform-proposal-reaction` | platformProposalReaction CRUD operations |
| `platform-proposal-review` | platformProposalReview CRUD operations |
| `platform-proposals-chunk` | platformProposalsChunk CRUD operations |
| `platform-registry-binding` | platformRegistryBinding CRUD operations |
| `platform-registry` | platformRegistry CRUD operations |
| `platform-registry-grant` | platformRegistryGrant CRUD operations |
| `platform-repository` | platformRepository CRUD operations |
| `platform-repository-event` | platformRepositoryEvent CRUD operations |
| `platform-repository-required-check` | platformRepositoryRequiredCheck CRUD operations |
| `platform-repository-workflow` | platformRepositoryWorkflow CRUD operations |
| `platform-resource` | platformResource CRUD operations |
| `platform-resource-declared-capacity` | platformResourceDeclaredCapacity CRUD operations |
| `platform-resource-definition` | platformResourceDefinition CRUD operations |
| `platform-resource-event` | platformResourceEvent CRUD operations |
| `platform-resource-installation` | platformResourceInstallation CRUD operations |
| `platform-resource-observed-storage` | platformResourceObservedStorage CRUD operations |
| `platform-resource-status-check` | platformResourceStatusCheck CRUD operations |
| `platform-resource-usage-log` | platformResourceUsageLog CRUD operations |
| `platform-resource-usage-summary` | platformResourceUsageSummary CRUD operations |
| `platform-resource-utilization` | platformResourceUtilization CRUD operations |
| `platform-resources-health` | platformResourcesHealth CRUD operations |
| `platform-resources-requirements-state` | platformResourcesRequirementsState CRUD operations |
| `platform-resources-resolved-requirement` | platformResourcesResolvedRequirement CRUD operations |
| `platform-webhook-endpoint` | platformWebhookEndpoint CRUD operations |
| `platform-webhook-event` | platformWebhookEvent CRUD operations |
| `proposal-comment` | proposalComment CRUD operations |
| `proposal` | proposal CRUD operations |
| `proposal-file-view` | proposalFileView CRUD operations |
| `proposal-reaction` | proposalReaction CRUD operations |
| `proposal-review` | proposalReview CRUD operations |
| `proposals-chunk` | proposalsChunk CRUD operations |
| `registry-binding` | registryBinding CRUD operations |
| `registry` | registry CRUD operations |
| `registry-grant` | registryGrant CRUD operations |
| `repository` | repository CRUD operations |
| `repository-event` | repositoryEvent CRUD operations |
| `repository-required-check` | repositoryRequiredCheck CRUD operations |
| `repository-workflow` | repositoryWorkflow CRUD operations |
| `resource` | resource CRUD operations |
| `resource-declared-capacity` | resourceDeclaredCapacity CRUD operations |
| `resource-definition` | resourceDefinition CRUD operations |
| `resource-event` | resourceEvent CRUD operations |
| `resource-installation` | resourceInstallation CRUD operations |
| `resource-observed-storage` | resourceObservedStorage CRUD operations |
| `resource-status-check` | resourceStatusCheck CRUD operations |
| `resource-usage-log` | resourceUsageLog CRUD operations |
| `resource-usage-summary` | resourceUsageSummary CRUD operations |
| `resource-utilization` | resourceUtilization CRUD operations |
| `resources-health` | resourcesHealth CRUD operations |
| `resources-requirements-state` | resourcesRequirementsState CRUD operations |
| `resources-resolved-requirement` | resourcesResolvedRequirement CRUD operations |
| `webhook-endpoint` | webhookEndpoint CRUD operations |
| `webhook-event` | webhookEvent CRUD operations |
| `database-read-function-graph` | databaseReadFunctionGraph |
| `read-function-graph` | readFunctionGraph |
| `add-edge` | addEdge |
| `add-edge-and-save` | addEdgeAndSave |
| `add-node` | addNode |
| `add-node-and-save` | addNodeAndSave |
| `approve-node` | approveNode |
| `copy-graph` | copyGraph |
| `database-add-edge` | databaseAddEdge |
| `database-add-edge-and-save` | databaseAddEdgeAndSave |
| `database-add-node` | databaseAddNode |
| `database-add-node-and-save` | databaseAddNodeAndSave |
| `database-approve-node` | databaseApproveNode |
| `database-copy-graph` | databaseCopyGraph |
| `database-create-function-graph` | databaseCreateFunctionGraph |
| `database-graph-init-empty-repo` | databaseGraphInitEmptyRepo |
| `database-graph-insert-node-at-path` | databaseGraphInsertNodeAtPath |
| `database-graph-insert-nodes-at-paths` | databaseGraphInsertNodesAtPaths |
| `database-graph-set-and-commit` | databaseGraphSetAndCommit |
| `database-graph-set-data-at-path` | databaseGraphSetDataAtPath |
| `database-graph-set-many-and-commit` | databaseGraphSetManyAndCommit |
| `database-import-definitions` | databaseImportDefinitions |
| `database-import-graph-json` | databaseImportGraphJson |
| `database-save-graph` | databaseSaveGraph |
| `database-start-execution` | databaseStartExecution |
| `database-validate-function-graph` | databaseValidateFunctionGraph |
| `function-execution-logs-append` | functionExecutionLogsAppend |
| `function-invocations-create-page` | functionInvocationsCreatePage |
| `function-invocations-create-sync` | functionInvocationsCreateSync |
| `import-definitions` | importDefinitions |
| `import-graph-json` | importGraphJson |
| `infra-init-empty-repo` | infraInitEmptyRepo |
| `infra-insert-node-at-path` | infraInsertNodeAtPath |
| `infra-insert-nodes-at-paths` | infraInsertNodesAtPaths |
| `infra-set-and-commit` | infraSetAndCommit |
| `infra-set-data-at-path` | infraSetDataAtPath |
| `infra-set-many-and-commit` | infraSetManyAndCommit |
| `init-empty-repo` | initEmptyRepo |
| `insert-node-at-path` | insertNodeAtPath |
| `insert-nodes-at-paths` | insertNodesAtPaths |
| `platform-function-execution-logs-append` | platformFunctionExecutionLogsAppend |
| `platform-function-invocations-create-page` | platformFunctionInvocationsCreatePage |
| `platform-function-invocations-create-sync` | platformFunctionInvocationsCreateSync |
| `platform-infra-init-empty-repo` | platformInfraInitEmptyRepo |
| `platform-infra-insert-node-at-path` | platformInfraInsertNodeAtPath |
| `platform-infra-insert-nodes-at-paths` | platformInfraInsertNodesAtPaths |
| `platform-infra-set-and-commit` | platformInfraSetAndCommit |
| `platform-infra-set-data-at-path` | platformInfraSetDataAtPath |
| `platform-infra-set-many-and-commit` | platformInfraSetManyAndCommit |
| `platform-resource-installations-install` | platformResourceInstallationsInstall |
| `platform-resource-installations-rollback` | platformResourceInstallationsRollback |
| `platform-resource-installations-uninstall` | platformResourceInstallationsUninstall |
| `platform-resource-installations-upgrade` | platformResourceInstallationsUpgrade |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |
| `resource-installations-install` | resourceInstallationsInstall |
| `resource-installations-rollback` | resourceInstallationsRollback |
| `resource-installations-uninstall` | resourceInstallationsUninstall |
| `resource-installations-upgrade` | resourceInstallationsUpgrade |
| `save-graph` | saveGraph |
| `set-and-commit` | setAndCommit |
| `set-data-at-path` | setDataAtPath |
| `set-many-and-commit` | setManyAndCommit |
| `start-execution` | startExecution |
| `validate-function-graph` | validateFunctionGraph |

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

### `build`

CRUD operations for Build records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all build records |
| `find-first` | Find first matching build record |
| `get` | Get a build by id |
| `create` | Create a new build |
| `update` | Update an existing build |
| `delete` | Delete a build |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `attempt` | Int |
| `commitSha` | String |
| `conclusion` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `eventId` | UUID |
| `finishedAt` | Datetime |
| `id` | UUID |
| `imageRef` | String |
| `jobId` | BigInt |
| `logs` | Upload |
| `matrixKey` | String |
| `metadata` | JSON |
| `proposalId` | UUID |
| `ref` | String |
| `repositoryId` | UUID |
| `startedAt` | Datetime |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `workflowId` | UUID |

**Required create fields:** `repositoryId`
**Optional create fields (backend defaults):** `actorId`, `attempt`, `commitSha`, `conclusion`, `createdByPrincipal`, `eventId`, `finishedAt`, `imageRef`, `jobId`, `logs`, `matrixKey`, `metadata`, `proposalId`, `ref`, `startedAt`, `status`, `updatedByPrincipal`, `workflowId`

### `build-step`

CRUD operations for BuildStep records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all buildStep records |
| `find-first` | Find first matching buildStep record |
| `get` | Get a buildStep by id |
| `create` | Create a new buildStep |
| `update` | Update an existing buildStep |
| `delete` | Delete a buildStep |

**Fields:**

| Field | Type |
|-------|------|
| `buildId` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `exitCode` | Int |
| `finishedAt` | Datetime |
| `id` | UUID |
| `kind` | String |
| `logBytes` | BigInt |
| `logOffset` | BigInt |
| `name` | String |
| `parentSeq` | Int |
| `recordedAt` | Datetime |
| `seq` | Int |
| `startedAt` | Datetime |
| `status` | String |
| `summary` | JSON |

**Required create fields:** `buildId`, `name`, `seq`
**Optional create fields (backend defaults):** `createdByPrincipal`, `exitCode`, `finishedAt`, `kind`, `logBytes`, `logOffset`, `parentSeq`, `recordedAt`, `startedAt`, `status`, `summary`

### `builder-binding`

CRUD operations for BuilderBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all builderBinding records |
| `find-first` | Find first matching builderBinding record |
| `get` | Get a builderBinding by id |
| `create` | Create a new builderBinding |
| `update` | Update an existing builderBinding |
| `delete` | Delete a builderBinding |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `installationId` | UUID |
| `lastError` | String |
| `metadata` | JSON |
| `namespaceId` | UUID |
| `observedHost` | String |
| `realm` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `installationId`, `namespaceId`
**Optional create fields (backend defaults):** `createdBy`, `createdByPrincipal`, `lastError`, `metadata`, `observedHost`, `realm`, `status`, `updatedBy`, `updatedByPrincipal`

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

### `database-function-graph`

CRUD operations for DatabaseFunctionGraph records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseFunctionGraph records |
| `find-first` | Find first matching databaseFunctionGraph record |
| `get` | Get a databaseFunctionGraph by id |
| `create` | Create a new databaseFunctionGraph |
| `update` | Update an existing databaseFunctionGraph |
| `delete` | Delete a databaseFunctionGraph |

**Fields:**

| Field | Type |
|-------|------|
| `context` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `databaseId` | UUID |
| `definitionsCommitId` | UUID |
| `description` | String |
| `id` | UUID |
| `isValid` | Boolean |
| `name` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |
| `validationErrors` | JSON |

**Required create fields:** `context`, `createdBy`, `databaseId`, `definitionsCommitId`, `description`, `isValid`, `name`, `storeId`, `validationErrors`

### `database-function-graph-execution-cancel-request`

CRUD operations for DatabaseFunctionGraphExecutionCancelRequest records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseFunctionGraphExecutionCancelRequest records |
| `find-first` | Find first matching databaseFunctionGraphExecutionCancelRequest record |
| `get` | Get a databaseFunctionGraphExecutionCancelRequest by id |
| `create` | Create a new databaseFunctionGraphExecutionCancelRequest |
| `update` | Update an existing databaseFunctionGraphExecutionCancelRequest |
| `delete` | Delete a databaseFunctionGraphExecutionCancelRequest |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `executionId` | UUID |
| `id` | UUID |

**Required create fields:** `executionId`
**Optional create fields (backend defaults):** `actorId`

### `database-function-graph-execution`

CRUD operations for DatabaseFunctionGraphExecution records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseFunctionGraphExecution records |
| `find-first` | Find first matching databaseFunctionGraphExecution record |
| `get` | Get a databaseFunctionGraphExecution by id |
| `create` | Create a new databaseFunctionGraphExecution |
| `update` | Update an existing databaseFunctionGraphExecution |
| `delete` | Delete a databaseFunctionGraphExecution |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `completedAt` | Datetime |
| `currentWave` | Int |
| `databaseId` | UUID |
| `definitionsCommitId` | UUID |
| `entityId` | UUID |
| `entityType` | String |
| `errorCode` | String |
| `errorMessage` | String |
| `executionPlan` | JSON |
| `graphId` | UUID |
| `id` | UUID |
| `inputPayload` | JSON |
| `invocationCreatedAt` | Datetime |
| `invocationId` | UUID |
| `lastProgressAt` | Datetime |
| `maxPendingJobs` | Int |
| `maxTicks` | Int |
| `nodeOutputs` | JSON |
| `organizationId` | UUID |
| `outputNames` | String |
| `outputNode` | String |
| `outputPayload` | JSON |
| `outputPort` | String |
| `parentExecutionId` | UUID |
| `parentInvocationId` | UUID |
| `parentNodeName` | String |
| `principalId` | UUID |
| `startedAt` | Datetime |
| `status` | String |
| `tickCount` | Int |
| `timeoutAt` | Datetime |

**Required create fields:** `databaseId`, `graphId`
**Optional create fields (backend defaults):** `actorId`, `completedAt`, `currentWave`, `definitionsCommitId`, `entityId`, `entityType`, `errorCode`, `errorMessage`, `executionPlan`, `inputPayload`, `invocationCreatedAt`, `invocationId`, `lastProgressAt`, `maxPendingJobs`, `maxTicks`, `nodeOutputs`, `organizationId`, `outputNames`, `outputNode`, `outputPayload`, `outputPort`, `parentExecutionId`, `parentInvocationId`, `parentNodeName`, `principalId`, `startedAt`, `status`, `tickCount`, `timeoutAt`

### `database-function-graph-execution-node-state`

CRUD operations for DatabaseFunctionGraphExecutionNodeState records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseFunctionGraphExecutionNodeState records |
| `find-first` | Find first matching databaseFunctionGraphExecutionNodeState record |
| `get` | Get a databaseFunctionGraphExecutionNodeState by id |
| `create` | Create a new databaseFunctionGraphExecutionNodeState |
| `update` | Update an existing databaseFunctionGraphExecutionNodeState |
| `delete` | Delete a databaseFunctionGraphExecutionNodeState |

**Fields:**

| Field | Type |
|-------|------|
| `callbackInputs` | JSON |
| `callbackMeta` | JSON |
| `callbackTokenHash` | String |
| `completedAt` | Datetime |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `errorCode` | String |
| `errorMessage` | String |
| `executionId` | UUID |
| `expiryDefaultOutput` | JSON |
| `expiryEscalatedAt` | Datetime |
| `expiryPolicy` | String |
| `id` | UUID |
| `nodeName` | String |
| `nodePath` | String |
| `outputId` | UUID |
| `startedAt` | Datetime |
| `status` | String |
| `waitingDeadlineAt` | Datetime |
| `waitingOn` | String |
| `waitingSince` | Datetime |

**Required create fields:** `databaseId`, `executionId`, `nodeName`
**Optional create fields (backend defaults):** `callbackInputs`, `callbackMeta`, `callbackTokenHash`, `completedAt`, `errorCode`, `errorMessage`, `expiryDefaultOutput`, `expiryEscalatedAt`, `expiryPolicy`, `nodePath`, `outputId`, `startedAt`, `status`, `waitingDeadlineAt`, `waitingOn`, `waitingSince`

### `database-function-graph-execution-output`

CRUD operations for DatabaseFunctionGraphExecutionOutput records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseFunctionGraphExecutionOutput records |
| `find-first` | Find first matching databaseFunctionGraphExecutionOutput record |
| `get` | Get a databaseFunctionGraphExecutionOutput by id |
| `create` | Create a new databaseFunctionGraphExecutionOutput |
| `update` | Update an existing databaseFunctionGraphExecutionOutput |
| `delete` | Delete a databaseFunctionGraphExecutionOutput |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `databaseId` | UUID |
| `hash` | Base64EncodedBinary |
| `id` | UUID |

**Required create fields:** `data`, `databaseId`, `hash`

### `database-graph-commit`

CRUD operations for DatabaseGraphCommit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseGraphCommit records |
| `find-first` | Find first matching databaseGraphCommit record |
| `get` | Get a databaseGraphCommit by id |
| `create` | Create a new databaseGraphCommit |
| `update` | Update an existing databaseGraphCommit |
| `delete` | Delete a databaseGraphCommit |

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

### `database-graph-get-all-tree-nodes-record`

CRUD operations for DatabaseGraphGetAllTreeNodesRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseGraphGetAllTreeNodesRecord records |
| `find-first` | Find first matching databaseGraphGetAllTreeNodesRecord record |
| `get` | Get a databaseGraphGetAllTreeNodesRecord by id |
| `create` | Create a new databaseGraphGetAllTreeNodesRecord |
| `update` | Update an existing databaseGraphGetAllTreeNodesRecord |
| `delete` | Delete a databaseGraphGetAllTreeNodesRecord |

**Fields:**

| Field | Type |
|-------|------|
| `data` | JSON |
| `path` | String |

**Required create fields:** `data`, `path`

### `database-graph-object`

CRUD operations for DatabaseGraphObject records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseGraphObject records |
| `find-first` | Find first matching databaseGraphObject record |
| `get` | Get a databaseGraphObject by id |
| `create` | Create a new databaseGraphObject |
| `update` | Update an existing databaseGraphObject |
| `delete` | Delete a databaseGraphObject |

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

### `database-graph-ref`

CRUD operations for DatabaseGraphRef records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseGraphRef records |
| `find-first` | Find first matching databaseGraphRef record |
| `get` | Get a databaseGraphRef by id |
| `create` | Create a new databaseGraphRef |
| `update` | Update an existing databaseGraphRef |
| `delete` | Delete a databaseGraphRef |

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

### `database-graph-store`

CRUD operations for DatabaseGraphStore records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseGraphStore records |
| `find-first` | Find first matching databaseGraphStore record |
| `get` | Get a databaseGraphStore by id |
| `create` | Create a new databaseGraphStore |
| `update` | Update an existing databaseGraphStore |
| `delete` | Delete a databaseGraphStore |

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

### `function-api-binding`

CRUD operations for FunctionApiBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionApiBinding records |
| `find-first` | Find first matching functionApiBinding record |
| `get` | Get a functionApiBinding by id |
| `create` | Create a new functionApiBinding |
| `update` | Update an existing functionApiBinding |
| `delete` | Delete a functionApiBinding |

**Fields:**

| Field | Type |
|-------|------|
| `alias` | String |
| `apiId` | UUID |
| `config` | JSON |
| `createdAt` | Datetime |
| `functionDefinitionId` | UUID |
| `id` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `apiId`, `functionDefinitionId`
**Optional create fields (backend defaults):** `alias`, `config`

### `function-capability-binding`

CRUD operations for FunctionCapabilityBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionCapabilityBinding records |
| `find-first` | Find first matching functionCapabilityBinding record |
| `get` | Get a functionCapabilityBinding by id |
| `create` | Create a new functionCapabilityBinding |
| `update` | Update an existing functionCapabilityBinding |
| `delete` | Delete a functionCapabilityBinding |

**Fields:**

| Field | Type |
|-------|------|
| `bucketId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `functionId` | UUID |
| `graphId` | UUID |
| `id` | UUID |
| `key` | String |
| `lifecycle` | String |
| `metadata` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `lifecycle`
**Optional create fields (backend defaults):** `bucketId`, `functionId`, `graphId`, `key`, `metadata`

### `function-definition`

CRUD operations for FunctionDefinition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionDefinition records |
| `find-first` | Find first matching functionDefinition record |
| `get` | Get a functionDefinition by id |
| `create` | Create a new functionDefinition |
| `update` | Update an existing functionDefinition |
| `delete` | Delete a functionDefinition |

**Fields:**

| Field | Type |
|-------|------|
| `accessChannels` | String |
| `anonymousCallable` | Boolean |
| `category` | String |
| `concurrency` | Int |
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `description` | String |
| `fnCategory` | String |
| `functionColumns` | JSON |
| `graphId` | UUID |
| `icon` | String |
| `id` | UUID |
| `image` | String |
| `inputs` | JSON |
| `integrations` | String |
| `isPublished` | Boolean |
| `maxAttempts` | Int |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `moduleTable` | String |
| `name` | String |
| `outputs` | JSON |
| `payloadArgs` | JSON |
| `priority` | Int |
| `props` | JSON |
| `protected` | Boolean |
| `publishedAt` | Datetime |
| `queueName` | String |
| `requiredBuckets` | String |
| `requiredCapabilities` | JSON |
| `requiredConfigs` | ResourceRequirement |
| `requiredModels` | String |
| `requiredModules` | String |
| `requiredSecrets` | ResourceRequirement |
| `resources` | JSON |
| `runtime` | String |
| `scaleMax` | Int |
| `scaleMin` | Int |
| `targetFunction` | String |
| `targetSchema` | String |
| `taskIdentifier` | String |
| `timeoutSeconds` | Int |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `volatile` | Boolean |

**Required create fields:** `category`, `databaseId`, `name`
**Optional create fields (backend defaults):** `accessChannels`, `anonymousCallable`, `concurrency`, `createdByPrincipal`, `description`, `fnCategory`, `functionColumns`, `graphId`, `icon`, `image`, `inputs`, `integrations`, `isPublished`, `maxAttempts`, `moduleTable`, `outputs`, `payloadArgs`, `priority`, `props`, `protected`, `publishedAt`, `queueName`, `requiredBuckets`, `requiredCapabilities`, `requiredConfigs`, `requiredModels`, `requiredModules`, `requiredSecrets`, `resources`, `runtime`, `scaleMax`, `scaleMin`, `targetFunction`, `targetSchema`, `timeoutSeconds`, `updatedByPrincipal`, `volatile`

### `function-deployment`

CRUD operations for FunctionDeployment records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionDeployment records |
| `find-first` | Find first matching functionDeployment record |
| `get` | Get a functionDeployment by id |
| `create` | Create a new functionDeployment |
| `update` | Update an existing functionDeployment |
| `delete` | Delete a functionDeployment |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `concurrency` | Int |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `errorCount` | Int |
| `handlerName` | String |
| `id` | UUID |
| `image` | String |
| `imageVersion` | String |
| `labels` | JSON |
| `lastError` | String |
| `lastErrorAt` | Datetime |
| `namespaceId` | UUID |
| `realm` | String |
| `resources` | JSON |
| `revision` | Int |
| `scaleMax` | Int |
| `scaleMin` | Int |
| `serviceName` | String |
| `serviceUrl` | String |
| `status` | String |
| `timeoutSeconds` | Int |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `image`, `namespaceId`
**Optional create fields (backend defaults):** `annotations`, `concurrency`, `createdByPrincipal`, `errorCount`, `handlerName`, `imageVersion`, `labels`, `lastError`, `lastErrorAt`, `realm`, `resources`, `revision`, `scaleMax`, `scaleMin`, `serviceName`, `serviceUrl`, `status`, `timeoutSeconds`, `updatedByPrincipal`

### `function-deployment-event`

CRUD operations for FunctionDeploymentEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionDeploymentEvent records |
| `find-first` | Find first matching functionDeploymentEvent record |
| `get` | Get a functionDeploymentEvent by id |
| `create` | Create a new functionDeploymentEvent |
| `update` | Update an existing functionDeploymentEvent |
| `delete` | Delete a functionDeploymentEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `deploymentId` | UUID |
| `eventType` | String |
| `id` | UUID |
| `message` | String |
| `metadata` | JSON |

**Required create fields:** `databaseId`, `deploymentId`, `eventType`
**Optional create fields (backend defaults):** `actorId`, `message`, `metadata`

### `function-execution-log`

CRUD operations for FunctionExecutionLog records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionExecutionLog records |
| `find-first` | Find first matching functionExecutionLog record |
| `get` | Get a functionExecutionLog by id |
| `create` | Create a new functionExecutionLog |
| `update` | Update an existing functionExecutionLog |
| `delete` | Delete a functionExecutionLog |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `invocationId` | UUID |
| `logLevel` | String |
| `message` | String |
| `metadata` | JSON |
| `taskIdentifier` | String |

**Required create fields:** `databaseId`, `message`
**Optional create fields (backend defaults):** `actorId`, `invocationId`, `logLevel`, `metadata`, `taskIdentifier`

### `function-graph-commit`

CRUD operations for FunctionGraphCommit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphCommit records |
| `find-first` | Find first matching functionGraphCommit record |
| `get` | Get a functionGraphCommit by id |
| `create` | Create a new functionGraphCommit |
| `update` | Update an existing functionGraphCommit |
| `delete` | Delete a functionGraphCommit |

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

### `function-graph`

CRUD operations for FunctionGraph records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraph records |
| `find-first` | Find first matching functionGraph record |
| `get` | Get a functionGraph by id |
| `create` | Create a new functionGraph |
| `update` | Update an existing functionGraph |
| `delete` | Delete a functionGraph |

**Fields:**

| Field | Type |
|-------|------|
| `context` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `definitionsCommitId` | UUID |
| `description` | String |
| `id` | UUID |
| `isValid` | Boolean |
| `name` | String |
| `scopeId` | UUID |
| `storeId` | UUID |
| `updatedAt` | Datetime |
| `validationErrors` | JSON |

**Required create fields:** `context`, `createdBy`, `definitionsCommitId`, `description`, `isValid`, `name`, `scopeId`, `storeId`, `validationErrors`

### `function-graph-execution-cancel-request`

CRUD operations for FunctionGraphExecutionCancelRequest records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphExecutionCancelRequest records |
| `find-first` | Find first matching functionGraphExecutionCancelRequest record |
| `get` | Get a functionGraphExecutionCancelRequest by id |
| `create` | Create a new functionGraphExecutionCancelRequest |
| `update` | Update an existing functionGraphExecutionCancelRequest |
| `delete` | Delete a functionGraphExecutionCancelRequest |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `executionId` | UUID |
| `id` | UUID |

**Required create fields:** `executionId`
**Optional create fields (backend defaults):** `actorId`

### `function-graph-execution`

CRUD operations for FunctionGraphExecution records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphExecution records |
| `find-first` | Find first matching functionGraphExecution record |
| `get` | Get a functionGraphExecution by id |
| `create` | Create a new functionGraphExecution |
| `update` | Update an existing functionGraphExecution |
| `delete` | Delete a functionGraphExecution |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `completedAt` | Datetime |
| `currentWave` | Int |
| `definitionsCommitId` | UUID |
| `entityId` | UUID |
| `entityType` | String |
| `errorCode` | String |
| `errorMessage` | String |
| `executionPlan` | JSON |
| `graphId` | UUID |
| `id` | UUID |
| `inputPayload` | JSON |
| `invocationCreatedAt` | Datetime |
| `invocationId` | UUID |
| `lastProgressAt` | Datetime |
| `maxPendingJobs` | Int |
| `maxTicks` | Int |
| `nodeOutputs` | JSON |
| `organizationId` | UUID |
| `outputNames` | String |
| `outputNode` | String |
| `outputPayload` | JSON |
| `outputPort` | String |
| `parentExecutionId` | UUID |
| `parentInvocationId` | UUID |
| `parentNodeName` | String |
| `principalId` | UUID |
| `scopeId` | UUID |
| `startedAt` | Datetime |
| `status` | String |
| `tickCount` | Int |
| `timeoutAt` | Datetime |

**Required create fields:** `graphId`, `scopeId`
**Optional create fields (backend defaults):** `actorId`, `completedAt`, `currentWave`, `definitionsCommitId`, `entityId`, `entityType`, `errorCode`, `errorMessage`, `executionPlan`, `inputPayload`, `invocationCreatedAt`, `invocationId`, `lastProgressAt`, `maxPendingJobs`, `maxTicks`, `nodeOutputs`, `organizationId`, `outputNames`, `outputNode`, `outputPayload`, `outputPort`, `parentExecutionId`, `parentInvocationId`, `parentNodeName`, `principalId`, `startedAt`, `status`, `tickCount`, `timeoutAt`

### `function-graph-execution-node-state`

CRUD operations for FunctionGraphExecutionNodeState records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphExecutionNodeState records |
| `find-first` | Find first matching functionGraphExecutionNodeState record |
| `get` | Get a functionGraphExecutionNodeState by id |
| `create` | Create a new functionGraphExecutionNodeState |
| `update` | Update an existing functionGraphExecutionNodeState |
| `delete` | Delete a functionGraphExecutionNodeState |

**Fields:**

| Field | Type |
|-------|------|
| `callbackInputs` | JSON |
| `callbackMeta` | JSON |
| `callbackTokenHash` | String |
| `completedAt` | Datetime |
| `createdAt` | Datetime |
| `errorCode` | String |
| `errorMessage` | String |
| `executionId` | UUID |
| `expiryDefaultOutput` | JSON |
| `expiryEscalatedAt` | Datetime |
| `expiryPolicy` | String |
| `id` | UUID |
| `nodeName` | String |
| `nodePath` | String |
| `outputId` | UUID |
| `scopeId` | UUID |
| `startedAt` | Datetime |
| `status` | String |
| `waitingDeadlineAt` | Datetime |
| `waitingOn` | String |
| `waitingSince` | Datetime |

**Required create fields:** `executionId`, `nodeName`, `scopeId`
**Optional create fields (backend defaults):** `callbackInputs`, `callbackMeta`, `callbackTokenHash`, `completedAt`, `errorCode`, `errorMessage`, `expiryDefaultOutput`, `expiryEscalatedAt`, `expiryPolicy`, `nodePath`, `outputId`, `startedAt`, `status`, `waitingDeadlineAt`, `waitingOn`, `waitingSince`

### `function-graph-execution-output`

CRUD operations for FunctionGraphExecutionOutput records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphExecutionOutput records |
| `find-first` | Find first matching functionGraphExecutionOutput record |
| `get` | Get a functionGraphExecutionOutput by id |
| `create` | Create a new functionGraphExecutionOutput |
| `update` | Update an existing functionGraphExecutionOutput |
| `delete` | Delete a functionGraphExecutionOutput |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `hash` | Base64EncodedBinary |
| `id` | UUID |
| `scopeId` | UUID |

**Required create fields:** `data`, `hash`, `scopeId`

### `function-graph-object`

CRUD operations for FunctionGraphObject records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphObject records |
| `find-first` | Find first matching functionGraphObject record |
| `get` | Get a functionGraphObject by id |
| `create` | Create a new functionGraphObject |
| `update` | Update an existing functionGraphObject |
| `delete` | Delete a functionGraphObject |

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

### `function-graph-ref`

CRUD operations for FunctionGraphRef records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphRef records |
| `find-first` | Find first matching functionGraphRef record |
| `get` | Get a functionGraphRef by id |
| `create` | Create a new functionGraphRef |
| `update` | Update an existing functionGraphRef |
| `delete` | Delete a functionGraphRef |

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

### `function-graph-store`

CRUD operations for FunctionGraphStore records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionGraphStore records |
| `find-first` | Find first matching functionGraphStore record |
| `get` | Get a functionGraphStore by id |
| `create` | Create a new functionGraphStore |
| `update` | Update an existing functionGraphStore |
| `delete` | Delete a functionGraphStore |

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

### `function-invocation-attempt`

CRUD operations for FunctionInvocationAttempt records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionInvocationAttempt records |
| `find-first` | Find first matching functionInvocationAttempt record |
| `get` | Get a functionInvocationAttempt by id |
| `create` | Create a new functionInvocationAttempt |
| `update` | Update an existing functionInvocationAttempt |
| `delete` | Delete a functionInvocationAttempt |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `attempt` | Int |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `durationMs` | Int |
| `error` | String |
| `errorDetail` | JSON |
| `id` | UUID |
| `invocationCreatedAt` | Datetime |
| `invocationId` | UUID |
| `startedAt` | Datetime |
| `success` | Boolean |
| `taskIdentifier` | String |

**Required create fields:** `attempt`, `databaseId`, `invocationCreatedAt`, `invocationId`, `success`, `taskIdentifier`
**Optional create fields (backend defaults):** `actorId`, `durationMs`, `error`, `errorDetail`, `startedAt`

### `function-invocation`

CRUD operations for FunctionInvocation records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionInvocation records |
| `find-first` | Find first matching functionInvocation record |
| `get` | Get a functionInvocation by id |
| `create` | Create a new functionInvocation |
| `update` | Update an existing functionInvocation |
| `delete` | Delete a functionInvocation |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `apiBindingId` | UUID |
| `channel` | String |
| `completedAt` | Datetime |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `definitionScope` | String |
| `durationMs` | Int |
| `entityId` | UUID |
| `entityType` | String |
| `error` | String |
| `functionDefinitionId` | UUID |
| `graphExecutionId` | UUID |
| `id` | UUID |
| `jobId` | BigInt |
| `organizationId` | UUID |
| `parentInvocationId` | UUID |
| `payload` | JSON |
| `principalId` | UUID |
| `provenance` | JSON |
| `result` | JSON |
| `startedAt` | Datetime |
| `status` | String |
| `taskIdentifier` | String |

**Required create fields:** `channel`, `databaseId`, `taskIdentifier`
**Optional create fields (backend defaults):** `actorId`, `apiBindingId`, `completedAt`, `createdByPrincipal`, `definitionScope`, `durationMs`, `entityId`, `entityType`, `error`, `functionDefinitionId`, `graphExecutionId`, `jobId`, `organizationId`, `parentInvocationId`, `payload`, `principalId`, `provenance`, `result`, `startedAt`, `status`

### `function-schedule`

CRUD operations for FunctionSchedule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionSchedule records |
| `find-first` | Find first matching functionSchedule record |
| `get` | Get a functionSchedule by id |
| `create` | Create a new functionSchedule |
| `update` | Update an existing functionSchedule |
| `delete` | Delete a functionSchedule |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `functionDefinitionId` | UUID |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `payload` | JSON |
| `scheduleInfo` | JSON |
| `suspendedAt` | Datetime |
| `suspendedReason` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `functionDefinitionId`, `name`, `scheduleInfo`
**Optional create fields (backend defaults):** `actorId`, `description`, `isActive`, `payload`, `suspendedAt`, `suspendedReason`

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

### `image`

CRUD operations for Image records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all image records |
| `find-first` | Find first matching image record |
| `get` | Get a image by id |
| `create` | Create a new image |
| `update` | Update an existing image |
| `delete` | Delete a image |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `description` | String |
| `digest` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `isPublished` | Boolean |
| `labels` | JSON |
| `metadata` | JSON |
| `name` | String |
| `ownerId` | UUID |
| `platformOnly` | Boolean |
| `registryHost` | String |
| `repository` | String |
| `runtime` | String |
| `tag` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `name`, `repository`
**Optional create fields (backend defaults):** `createdByPrincipal`, `description`, `digest`, `expiresAt`, `isPublished`, `labels`, `metadata`, `ownerId`, `platformOnly`, `registryHost`, `runtime`, `tag`, `updatedByPrincipal`

### `image-grant`

CRUD operations for ImageGrant records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all imageGrant records |
| `find-first` | Find first matching imageGrant record |
| `get` | Get a imageGrant by id |
| `create` | Create a new imageGrant |
| `update` | Update an existing imageGrant |
| `delete` | Delete a imageGrant |

**Fields:**

| Field | Type |
|-------|------|
| `actions` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `expiresAt` | Datetime |
| `grantedBy` | UUID |
| `granteeKey` | UUID |
| `granteeScope` | String |
| `id` | UUID |
| `imageId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `granteeKey`, `granteeScope`, `imageId`
**Optional create fields (backend defaults):** `actions`, `createdByPrincipal`, `expiresAt`, `grantedBy`, `updatedByPrincipal`

### `infra-commit`

CRUD operations for InfraCommit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all infraCommit records |
| `find-first` | Find first matching infraCommit record |
| `get` | Get a infraCommit by id |
| `create` | Create a new infraCommit |
| `update` | Update an existing infraCommit |
| `delete` | Delete a infraCommit |

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

### `infra-get-all-tree-nodes-record`

CRUD operations for InfraGetAllTreeNodesRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all infraGetAllTreeNodesRecord records |
| `find-first` | Find first matching infraGetAllTreeNodesRecord record |
| `get` | Get a infraGetAllTreeNodesRecord by id |
| `create` | Create a new infraGetAllTreeNodesRecord |
| `update` | Update an existing infraGetAllTreeNodesRecord |
| `delete` | Delete a infraGetAllTreeNodesRecord |

**Fields:**

| Field | Type |
|-------|------|
| `data` | JSON |
| `path` | String |

**Required create fields:** `data`, `path`

### `infra-object`

CRUD operations for InfraObject records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all infraObject records |
| `find-first` | Find first matching infraObject record |
| `get` | Get a infraObject by id |
| `create` | Create a new infraObject |
| `update` | Update an existing infraObject |
| `delete` | Delete a infraObject |

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

### `infra-ref`

CRUD operations for InfraRef records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all infraRef records |
| `find-first` | Find first matching infraRef record |
| `get` | Get a infraRef by id |
| `create` | Create a new infraRef |
| `update` | Update an existing infraRef |
| `delete` | Delete a infraRef |

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

### `infra-store`

CRUD operations for InfraStore records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all infraStore records |
| `find-first` | Find first matching infraStore record |
| `get` | Get a infraStore by id |
| `create` | Create a new infraStore |
| `update` | Update an existing infraStore |
| `delete` | Delete a infraStore |

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

### `integration-provider`

CRUD operations for IntegrationProvider records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all integrationProvider records |
| `find-first` | Find first matching integrationProvider record |
| `get` | Get a integrationProvider by id |
| `create` | Create a new integrationProvider |
| `update` | Update an existing integrationProvider |
| `delete` | Delete a integrationProvider |

**Fields:**

| Field | Type |
|-------|------|
| `brand` | JSON |
| `category` | String |
| `createdAt` | Datetime |
| `description` | String |
| `icon` | String |
| `id` | UUID |
| `logo` | Image |
| `name` | String |
| `requiredConfigs` | ResourceRequirement |
| `requiredSecrets` | ResourceRequirement |
| `slug` | String |
| `updatedAt` | Datetime |

**Required create fields:** `name`, `slug`
**Optional create fields (backend defaults):** `brand`, `category`, `description`, `icon`, `logo`, `requiredConfigs`, `requiredSecrets`

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

### `platform-build`

CRUD operations for PlatformBuild records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformBuild records |
| `find-first` | Find first matching platformBuild record |
| `get` | Get a platformBuild by id |
| `create` | Create a new platformBuild |
| `update` | Update an existing platformBuild |
| `delete` | Delete a platformBuild |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `attempt` | Int |
| `commitSha` | String |
| `conclusion` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `eventId` | UUID |
| `finishedAt` | Datetime |
| `id` | UUID |
| `imageRef` | String |
| `jobId` | BigInt |
| `logs` | Upload |
| `matrixKey` | String |
| `metadata` | JSON |
| `proposalId` | UUID |
| `ref` | String |
| `repositoryId` | UUID |
| `startedAt` | Datetime |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `workflowId` | UUID |

**Required create fields:** `repositoryId`
**Optional create fields (backend defaults):** `actorId`, `attempt`, `commitSha`, `conclusion`, `createdByPrincipal`, `eventId`, `finishedAt`, `imageRef`, `jobId`, `logs`, `matrixKey`, `metadata`, `proposalId`, `ref`, `startedAt`, `status`, `updatedByPrincipal`, `workflowId`

### `platform-build-step`

CRUD operations for PlatformBuildStep records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformBuildStep records |
| `find-first` | Find first matching platformBuildStep record |
| `get` | Get a platformBuildStep by id |
| `create` | Create a new platformBuildStep |
| `update` | Update an existing platformBuildStep |
| `delete` | Delete a platformBuildStep |

**Fields:**

| Field | Type |
|-------|------|
| `buildId` | UUID |
| `createdByPrincipal` | UUID |
| `exitCode` | Int |
| `finishedAt` | Datetime |
| `id` | UUID |
| `kind` | String |
| `logBytes` | BigInt |
| `logOffset` | BigInt |
| `name` | String |
| `parentSeq` | Int |
| `recordedAt` | Datetime |
| `seq` | Int |
| `startedAt` | Datetime |
| `status` | String |
| `summary` | JSON |

**Required create fields:** `buildId`, `name`, `seq`
**Optional create fields (backend defaults):** `createdByPrincipal`, `exitCode`, `finishedAt`, `kind`, `logBytes`, `logOffset`, `parentSeq`, `recordedAt`, `startedAt`, `status`, `summary`

### `platform-builder-binding`

CRUD operations for PlatformBuilderBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformBuilderBinding records |
| `find-first` | Find first matching platformBuilderBinding record |
| `get` | Get a platformBuilderBinding by id |
| `create` | Create a new platformBuilderBinding |
| `update` | Update an existing platformBuilderBinding |
| `delete` | Delete a platformBuilderBinding |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `id` | UUID |
| `installationId` | UUID |
| `lastError` | String |
| `metadata` | JSON |
| `namespaceId` | UUID |
| `observedHost` | String |
| `realm` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `installationId`, `namespaceId`
**Optional create fields (backend defaults):** `createdBy`, `createdByPrincipal`, `lastError`, `metadata`, `observedHost`, `realm`, `status`, `updatedBy`, `updatedByPrincipal`

### `platform-function-api-binding`

CRUD operations for PlatformFunctionApiBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionApiBinding records |
| `find-first` | Find first matching platformFunctionApiBinding record |
| `get` | Get a platformFunctionApiBinding by id |
| `create` | Create a new platformFunctionApiBinding |
| `update` | Update an existing platformFunctionApiBinding |
| `delete` | Delete a platformFunctionApiBinding |

**Fields:**

| Field | Type |
|-------|------|
| `alias` | String |
| `apiId` | UUID |
| `config` | JSON |
| `createdAt` | Datetime |
| `functionDefinitionId` | UUID |
| `id` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `apiId`, `functionDefinitionId`
**Optional create fields (backend defaults):** `alias`, `config`

### `platform-function-capability-binding`

CRUD operations for PlatformFunctionCapabilityBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionCapabilityBinding records |
| `find-first` | Find first matching platformFunctionCapabilityBinding record |
| `get` | Get a platformFunctionCapabilityBinding by id |
| `create` | Create a new platformFunctionCapabilityBinding |
| `update` | Update an existing platformFunctionCapabilityBinding |
| `delete` | Delete a platformFunctionCapabilityBinding |

**Fields:**

| Field | Type |
|-------|------|
| `bucketId` | UUID |
| `createdAt` | Datetime |
| `functionId` | UUID |
| `graphId` | UUID |
| `id` | UUID |
| `key` | String |
| `lifecycle` | String |
| `metadata` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `lifecycle`
**Optional create fields (backend defaults):** `bucketId`, `functionId`, `graphId`, `key`, `metadata`

### `platform-function-definition`

CRUD operations for PlatformFunctionDefinition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionDefinition records |
| `find-first` | Find first matching platformFunctionDefinition record |
| `get` | Get a platformFunctionDefinition by id |
| `create` | Create a new platformFunctionDefinition |
| `update` | Update an existing platformFunctionDefinition |
| `delete` | Delete a platformFunctionDefinition |

**Fields:**

| Field | Type |
|-------|------|
| `accessChannels` | String |
| `anonymousCallable` | Boolean |
| `billable` | Boolean |
| `category` | String |
| `concurrency` | Int |
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `description` | String |
| `fnCategory` | String |
| `functionColumns` | JSON |
| `graphId` | UUID |
| `icon` | String |
| `id` | UUID |
| `image` | String |
| `inputs` | JSON |
| `integrations` | String |
| `isPublished` | Boolean |
| `maxAttempts` | Int |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `moduleTable` | String |
| `name` | String |
| `outputs` | JSON |
| `payloadArgs` | JSON |
| `priority` | Int |
| `props` | JSON |
| `protected` | Boolean |
| `publishedAt` | Datetime |
| `queueName` | String |
| `requiredBuckets` | String |
| `requiredCapabilities` | JSON |
| `requiredConfigs` | ResourceRequirement |
| `requiredModels` | String |
| `requiredModules` | String |
| `requiredSecrets` | ResourceRequirement |
| `resources` | JSON |
| `runtime` | String |
| `scaleMax` | Int |
| `scaleMin` | Int |
| `system` | Boolean |
| `targetFunction` | String |
| `targetSchema` | String |
| `taskIdentifier` | String |
| `timeoutSeconds` | Int |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `volatile` | Boolean |

**Required create fields:** `category`, `name`
**Optional create fields (backend defaults):** `accessChannels`, `anonymousCallable`, `billable`, `concurrency`, `createdByPrincipal`, `description`, `fnCategory`, `functionColumns`, `graphId`, `icon`, `image`, `inputs`, `integrations`, `isPublished`, `maxAttempts`, `moduleTable`, `outputs`, `payloadArgs`, `priority`, `props`, `protected`, `publishedAt`, `queueName`, `requiredBuckets`, `requiredCapabilities`, `requiredConfigs`, `requiredModels`, `requiredModules`, `requiredSecrets`, `resources`, `runtime`, `scaleMax`, `scaleMin`, `system`, `targetFunction`, `targetSchema`, `timeoutSeconds`, `updatedByPrincipal`, `volatile`

### `platform-function-deployment`

CRUD operations for PlatformFunctionDeployment records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionDeployment records |
| `find-first` | Find first matching platformFunctionDeployment record |
| `get` | Get a platformFunctionDeployment by id |
| `create` | Create a new platformFunctionDeployment |
| `update` | Update an existing platformFunctionDeployment |
| `delete` | Delete a platformFunctionDeployment |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `concurrency` | Int |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `errorCount` | Int |
| `handlerName` | String |
| `id` | UUID |
| `image` | String |
| `imageVersion` | String |
| `labels` | JSON |
| `lastError` | String |
| `lastErrorAt` | Datetime |
| `namespaceId` | UUID |
| `realm` | String |
| `resources` | JSON |
| `revision` | Int |
| `scaleMax` | Int |
| `scaleMin` | Int |
| `serviceName` | String |
| `serviceUrl` | String |
| `status` | String |
| `timeoutSeconds` | Int |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `image`, `namespaceId`
**Optional create fields (backend defaults):** `annotations`, `concurrency`, `createdByPrincipal`, `errorCount`, `handlerName`, `imageVersion`, `labels`, `lastError`, `lastErrorAt`, `realm`, `resources`, `revision`, `scaleMax`, `scaleMin`, `serviceName`, `serviceUrl`, `status`, `timeoutSeconds`, `updatedByPrincipal`

### `platform-function-deployment-event`

CRUD operations for PlatformFunctionDeploymentEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionDeploymentEvent records |
| `find-first` | Find first matching platformFunctionDeploymentEvent record |
| `get` | Get a platformFunctionDeploymentEvent by id |
| `create` | Create a new platformFunctionDeploymentEvent |
| `update` | Update an existing platformFunctionDeploymentEvent |
| `delete` | Delete a platformFunctionDeploymentEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `deploymentId` | UUID |
| `eventType` | String |
| `id` | UUID |
| `message` | String |
| `metadata` | JSON |

**Required create fields:** `deploymentId`, `eventType`
**Optional create fields (backend defaults):** `actorId`, `message`, `metadata`

### `platform-function-execution-log`

CRUD operations for PlatformFunctionExecutionLog records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionExecutionLog records |
| `find-first` | Find first matching platformFunctionExecutionLog record |
| `get` | Get a platformFunctionExecutionLog by id |
| `create` | Create a new platformFunctionExecutionLog |
| `update` | Update an existing platformFunctionExecutionLog |
| `delete` | Delete a platformFunctionExecutionLog |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `id` | UUID |
| `invocationId` | UUID |
| `logLevel` | String |
| `message` | String |
| `metadata` | JSON |
| `taskIdentifier` | String |

**Required create fields:** `message`
**Optional create fields (backend defaults):** `actorId`, `invocationId`, `logLevel`, `metadata`, `taskIdentifier`

### `platform-function-invocation-attempt`

CRUD operations for PlatformFunctionInvocationAttempt records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionInvocationAttempt records |
| `find-first` | Find first matching platformFunctionInvocationAttempt record |
| `get` | Get a platformFunctionInvocationAttempt by id |
| `create` | Create a new platformFunctionInvocationAttempt |
| `update` | Update an existing platformFunctionInvocationAttempt |
| `delete` | Delete a platformFunctionInvocationAttempt |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `attempt` | Int |
| `createdAt` | Datetime |
| `durationMs` | Int |
| `error` | String |
| `errorDetail` | JSON |
| `id` | UUID |
| `invocationCreatedAt` | Datetime |
| `invocationId` | UUID |
| `startedAt` | Datetime |
| `success` | Boolean |
| `taskIdentifier` | String |

**Required create fields:** `attempt`, `invocationCreatedAt`, `invocationId`, `success`, `taskIdentifier`
**Optional create fields (backend defaults):** `actorId`, `durationMs`, `error`, `errorDetail`, `startedAt`

### `platform-function-invocation`

CRUD operations for PlatformFunctionInvocation records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionInvocation records |
| `find-first` | Find first matching platformFunctionInvocation record |
| `get` | Get a platformFunctionInvocation by id |
| `create` | Create a new platformFunctionInvocation |
| `update` | Update an existing platformFunctionInvocation |
| `delete` | Delete a platformFunctionInvocation |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `apiBindingId` | UUID |
| `channel` | String |
| `completedAt` | Datetime |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `definitionScope` | String |
| `durationMs` | Int |
| `entityId` | UUID |
| `entityType` | String |
| `error` | String |
| `functionDefinitionId` | UUID |
| `graphExecutionId` | UUID |
| `id` | UUID |
| `jobId` | BigInt |
| `organizationId` | UUID |
| `parentInvocationId` | UUID |
| `payload` | JSON |
| `principalId` | UUID |
| `provenance` | JSON |
| `result` | JSON |
| `startedAt` | Datetime |
| `status` | String |
| `taskIdentifier` | String |

**Required create fields:** `channel`, `taskIdentifier`
**Optional create fields (backend defaults):** `actorId`, `apiBindingId`, `completedAt`, `createdByPrincipal`, `databaseId`, `definitionScope`, `durationMs`, `entityId`, `entityType`, `error`, `functionDefinitionId`, `graphExecutionId`, `jobId`, `organizationId`, `parentInvocationId`, `payload`, `principalId`, `provenance`, `result`, `startedAt`, `status`

### `platform-function-schedule`

CRUD operations for PlatformFunctionSchedule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionSchedule records |
| `find-first` | Find first matching platformFunctionSchedule record |
| `get` | Get a platformFunctionSchedule by id |
| `create` | Create a new platformFunctionSchedule |
| `update` | Update an existing platformFunctionSchedule |
| `delete` | Delete a platformFunctionSchedule |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `description` | String |
| `functionDefinitionId` | UUID |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `payload` | JSON |
| `scheduleInfo` | JSON |
| `suspendedAt` | Datetime |
| `suspendedReason` | String |
| `updatedAt` | Datetime |

**Required create fields:** `functionDefinitionId`, `name`, `scheduleInfo`
**Optional create fields (backend defaults):** `actorId`, `description`, `isActive`, `payload`, `suspendedAt`, `suspendedReason`

### `platform-image`

CRUD operations for PlatformImage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformImage records |
| `find-first` | Find first matching platformImage record |
| `get` | Get a platformImage by id |
| `create` | Create a new platformImage |
| `update` | Update an existing platformImage |
| `delete` | Delete a platformImage |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `description` | String |
| `digest` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `isPublished` | Boolean |
| `labels` | JSON |
| `metadata` | JSON |
| `name` | String |
| `ownerId` | UUID |
| `platformOnly` | Boolean |
| `registryHost` | String |
| `repository` | String |
| `runtime` | String |
| `tag` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `name`, `repository`
**Optional create fields (backend defaults):** `createdByPrincipal`, `description`, `digest`, `expiresAt`, `isPublished`, `labels`, `metadata`, `ownerId`, `platformOnly`, `registryHost`, `runtime`, `tag`, `updatedByPrincipal`

### `platform-image-grant`

CRUD operations for PlatformImageGrant records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformImageGrant records |
| `find-first` | Find first matching platformImageGrant record |
| `get` | Get a platformImageGrant by id |
| `create` | Create a new platformImageGrant |
| `update` | Update an existing platformImageGrant |
| `delete` | Delete a platformImageGrant |

**Fields:**

| Field | Type |
|-------|------|
| `actions` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `expiresAt` | Datetime |
| `grantedBy` | UUID |
| `granteeKey` | UUID |
| `granteeScope` | String |
| `id` | UUID |
| `imageId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `granteeKey`, `granteeScope`, `imageId`
**Optional create fields (backend defaults):** `actions`, `createdByPrincipal`, `expiresAt`, `grantedBy`, `updatedByPrincipal`

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

### `platform-k-8-s-resource-kind`

CRUD operations for PlatformK8sResourceKind records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformK8sResourceKind records |
| `find-first` | Find first matching platformK8sResourceKind record |
| `get` | Get a platformK8sResourceKind by id |
| `create` | Create a new platformK8sResourceKind |
| `update` | Update an existing platformK8sResourceKind |
| `delete` | Delete a platformK8sResourceKind |

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
| `slug` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `definition`, `slug`
**Optional create fields (backend defaults):** `active`, `commitId`, `description`, `label`, `storeId`

### `platform-k-8-s-spec-rule`

CRUD operations for PlatformK8sSpecRule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformK8sSpecRule records |
| `find-first` | Find first matching platformK8sSpecRule record |
| `get` | Get a platformK8sSpecRule by id |
| `create` | Create a new platformK8sSpecRule |
| `update` | Update an existing platformK8sSpecRule |
| `delete` | Delete a platformK8sSpecRule |

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
| `slug` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `definition`, `slug`
**Optional create fields (backend defaults):** `active`, `commitId`, `description`, `label`, `storeId`

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

### `platform-proposal-comment`

CRUD operations for PlatformProposalComment records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformProposalComment records |
| `find-first` | Find first matching platformProposalComment record |
| `search <query>` | Search platformProposalComment records |
| `get` | Get a platformProposalComment by id |
| `create` | Create a new platformProposalComment |
| `update` | Update an existing platformProposalComment |
| `delete` | Delete a platformProposalComment |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `attachments` | Upload |
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `line` | Int |
| `outdatedAt` | Datetime |
| `path` | String |
| `pathTrgmSimilarity` | Float |
| `proposalId` | UUID |
| `resolvedAt` | Datetime |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `body`, `proposalId`
**Optional create fields (backend defaults):** `actorId`, `attachments`, `createdBy`, `createdByPrincipal`, `embedding`, `line`, `outdatedAt`, `path`, `resolvedAt`, `updatedBy`, `updatedByPrincipal`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `bodyTrgmSimilarity`, `pathTrgmSimilarity`, `search`, `searchScore`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk platform-proposal-comment list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk platform-proposal-comment search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk platform-proposal-comment list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk platform-proposal-comment create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk platform-proposal-comment update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk platform-proposal-comment list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmPath`):*
```bash
csdk platform-proposal-comment list --where.trgmPath.value "approximate query" --where.trgmPath.threshold 0.3 --select title,pathTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk platform-proposal-comment list --where.search "search query" --select title,tsvRank
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk platform-proposal-comment list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,pathTrgmSimilarity,tsvRank,searchScore
```

*Search with pagination and field projection:*
```bash
csdk platform-proposal-comment list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk platform-proposal-comment search "query" --limit 10 --select id,title,searchScore
```


### `platform-proposal`

CRUD operations for PlatformProposal records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformProposal records |
| `find-first` | Find first matching platformProposal record |
| `search <query>` | Search platformProposal records |
| `get` | Get a platformProposal by id |
| `create` | Create a new platformProposal |
| `update` | Update an existing platformProposal |
| `delete` | Delete a platformProposal |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `closedReason` | String |
| `closedReasonTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `decidedAt` | Datetime |
| `dueAt` | Datetime |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `kind` | String |
| `kindTrgmSimilarity` | Float |
| `labels` | String |
| `mergeCommit` | String |
| `mergeCommitTrgmSimilarity` | Float |
| `mergeMethod` | String |
| `mergeMethodTrgmSimilarity` | Float |
| `mergeRequestedAt` | Datetime |
| `mergedAt` | Datetime |
| `metadata` | JSON |
| `parentId` | UUID |
| `priority` | BigFloat |
| `repositoryId` | UUID |
| `resolution` | String |
| `resolutionTrgmSimilarity` | Float |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `sourceRef` | String |
| `sourceRefTrgmSimilarity` | Float |
| `status` | String |
| `statusTrgmSimilarity` | Float |
| `targetRef` | String |
| `targetRefTrgmSimilarity` | Float |
| `title` | String |
| `titleTrgmSimilarity` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `repositoryId`, `title`
**Optional create fields (backend defaults):** `actorId`, `body`, `closedReason`, `createdBy`, `createdByPrincipal`, `decidedAt`, `dueAt`, `embedding`, `kind`, `labels`, `mergeCommit`, `mergeMethod`, `mergeRequestedAt`, `mergedAt`, `metadata`, `parentId`, `priority`, `resolution`, `sourceRef`, `status`, `targetRef`, `updatedBy`, `updatedByPrincipal`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `bodyTrgmSimilarity`, `closedReasonTrgmSimilarity`, `kindTrgmSimilarity`, `mergeCommitTrgmSimilarity`, `mergeMethodTrgmSimilarity`, `resolutionTrgmSimilarity`, `search`, `searchScore`, `sourceRefTrgmSimilarity`, `statusTrgmSimilarity`, `targetRefTrgmSimilarity`, `titleTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk platform-proposal list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk platform-proposal search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk platform-proposal list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk platform-proposal create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk platform-proposal update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk platform-proposal list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmClosedReason`):*
```bash
csdk platform-proposal list --where.trgmClosedReason.value "approximate query" --where.trgmClosedReason.threshold 0.3 --select title,closedReasonTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmKind`):*
```bash
csdk platform-proposal list --where.trgmKind.value "approximate query" --where.trgmKind.threshold 0.3 --select title,kindTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmMergeCommit`):*
```bash
csdk platform-proposal list --where.trgmMergeCommit.value "approximate query" --where.trgmMergeCommit.threshold 0.3 --select title,mergeCommitTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmMergeMethod`):*
```bash
csdk platform-proposal list --where.trgmMergeMethod.value "approximate query" --where.trgmMergeMethod.threshold 0.3 --select title,mergeMethodTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmResolution`):*
```bash
csdk platform-proposal list --where.trgmResolution.value "approximate query" --where.trgmResolution.threshold 0.3 --select title,resolutionTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk platform-proposal list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmSourceRef`):*
```bash
csdk platform-proposal list --where.trgmSourceRef.value "approximate query" --where.trgmSourceRef.threshold 0.3 --select title,sourceRefTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmStatus`):*
```bash
csdk platform-proposal list --where.trgmStatus.value "approximate query" --where.trgmStatus.threshold 0.3 --select title,statusTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmTargetRef`):*
```bash
csdk platform-proposal list --where.trgmTargetRef.value "approximate query" --where.trgmTargetRef.threshold 0.3 --select title,targetRefTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmTitle`):*
```bash
csdk platform-proposal list --where.trgmTitle.value "approximate query" --where.trgmTitle.threshold 0.3 --select title,titleTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk platform-proposal list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,closedReasonTrgmSimilarity,kindTrgmSimilarity,mergeCommitTrgmSimilarity,mergeMethodTrgmSimilarity,resolutionTrgmSimilarity,tsvRank,searchScore,sourceRefTrgmSimilarity,statusTrgmSimilarity,targetRefTrgmSimilarity,titleTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk platform-proposal list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk platform-proposal search "query" --limit 10 --select id,title,searchScore
```


### `platform-proposal-file-view`

CRUD operations for PlatformProposalFileView records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformProposalFileView records |
| `find-first` | Find first matching platformProposalFileView record |
| `get` | Get a platformProposalFileView by id |
| `create` | Create a new platformProposalFileView |
| `update` | Update an existing platformProposalFileView |
| `delete` | Delete a platformProposalFileView |

**Fields:**

| Field | Type |
|-------|------|
| `blobSha` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `id` | UUID |
| `path` | String |
| `proposalId` | UUID |
| `reviewerId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `viewedAt` | Datetime |

**Required create fields:** `blobSha`, `path`, `proposalId`, `reviewerId`
**Optional create fields (backend defaults):** `createdByPrincipal`, `updatedByPrincipal`, `viewedAt`

### `platform-proposal-reaction`

CRUD operations for PlatformProposalReaction records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformProposalReaction records |
| `find-first` | Find first matching platformProposalReaction record |
| `get` | Get a platformProposalReaction by id |
| `create` | Create a new platformProposalReaction |
| `update` | Update an existing platformProposalReaction |
| `delete` | Delete a platformProposalReaction |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `commentId` | UUID |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `emoji` | String |
| `id` | UUID |
| `proposalId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `actorId`, `emoji`, `proposalId`
**Optional create fields (backend defaults):** `commentId`, `createdByPrincipal`, `updatedByPrincipal`

### `platform-proposal-review`

CRUD operations for PlatformProposalReview records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformProposalReview records |
| `find-first` | Find first matching platformProposalReview record |
| `search <query>` | Search platformProposalReview records |
| `get` | Get a platformProposalReview by id |
| `create` | Create a new platformProposalReview |
| `update` | Update an existing platformProposalReview |
| `delete` | Delete a platformProposalReview |

**Fields:**

| Field | Type |
|-------|------|
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `commitSha` | String |
| `commitShaTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `id` | UUID |
| `proposalId` | UUID |
| `reviewerId` | UUID |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `submittedAt` | Datetime |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `verdict` | String |
| `verdictTrgmSimilarity` | Float |

**Required create fields:** `commitSha`, `proposalId`, `reviewerId`, `verdict`
**Optional create fields (backend defaults):** `body`, `createdByPrincipal`, `submittedAt`, `updatedByPrincipal`
> **Unified Search API fields:** `bodyTrgmSimilarity`, `commitShaTrgmSimilarity`, `search`, `searchScore`, `verdictTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk platform-proposal-review list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmCommitSha`):*
```bash
csdk platform-proposal-review list --where.trgmCommitSha.value "approximate query" --where.trgmCommitSha.threshold 0.3 --select title,commitShaTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk platform-proposal-review list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmVerdict`):*
```bash
csdk platform-proposal-review list --where.trgmVerdict.value "approximate query" --where.trgmVerdict.threshold 0.3 --select title,verdictTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk platform-proposal-review list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,commitShaTrgmSimilarity,tsvRank,searchScore,verdictTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk platform-proposal-review list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk platform-proposal-review search "query" --limit 10 --select id,title,searchScore
```


### `platform-proposals-chunk`

CRUD operations for PlatformProposalsChunk records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformProposalsChunk records |
| `find-first` | Find first matching platformProposalsChunk record |
| `search <query>` | Search platformProposalsChunk records |
| `get` | Get a platformProposalsChunk by id |
| `create` | Create a new platformProposalsChunk |
| `update` | Update an existing platformProposalsChunk |
| `delete` | Delete a platformProposalsChunk |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `body` | String |
| `chunkIndex` | Int |
| `createdAt` | Datetime |
| `embedding` | Vector |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `metadata` | JSON |
| `platformProposalsId` | UUID |
| `searchScore` | Float |
| `updatedAt` | Datetime |

**Required create fields:** `body`, `platformProposalsId`
**Optional create fields (backend defaults):** `actorId`, `chunkIndex`, `embedding`, `metadata`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `searchScore`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk platform-proposals-chunk list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk platform-proposals-chunk search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk platform-proposals-chunk list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk platform-proposals-chunk create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk platform-proposals-chunk update --embedding "new text to embed" --auto-embed
```

*Search with pagination and field projection:*
```bash
csdk platform-proposals-chunk list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk platform-proposals-chunk search "query" --limit 10 --select id,title,searchScore
```


### `platform-registry-binding`

CRUD operations for PlatformRegistryBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformRegistryBinding records |
| `find-first` | Find first matching platformRegistryBinding record |
| `get` | Get a platformRegistryBinding by id |
| `create` | Create a new platformRegistryBinding |
| `update` | Update an existing platformRegistryBinding |
| `delete` | Delete a platformRegistryBinding |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `id` | UUID |
| `metadata` | JSON |
| `namespaceId` | UUID |
| `observedCredentialVersion` | String |
| `pullSecretName` | String |
| `realm` | String |
| `registryHost` | String |
| `registryId` | UUID |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `namespaceId`, `registryHost`, `registryId`
**Optional create fields (backend defaults):** `createdBy`, `createdByPrincipal`, `metadata`, `observedCredentialVersion`, `pullSecretName`, `realm`, `status`, `updatedBy`, `updatedByPrincipal`

### `platform-registry`

CRUD operations for PlatformRegistry records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformRegistry records |
| `find-first` | Find first matching platformRegistry record |
| `get` | Get a platformRegistry by id |
| `create` | Create a new platformRegistry |
| `update` | Update an existing platformRegistry |
| `delete` | Delete a platformRegistry |

**Fields:**

| Field | Type |
|-------|------|
| `authMode` | String |
| `basePath` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `credentialSecretName` | String |
| `host` | String |
| `id` | UUID |
| `installationId` | UUID |
| `isPublished` | Boolean |
| `kind` | String |
| `labels` | JSON |
| `lastError` | String |
| `metadata` | JSON |
| `name` | String |
| `platformOnly` | Boolean |
| `role` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `kind`, `name`
**Optional create fields (backend defaults):** `authMode`, `basePath`, `createdByPrincipal`, `credentialSecretName`, `host`, `installationId`, `isPublished`, `labels`, `lastError`, `metadata`, `platformOnly`, `role`, `status`, `updatedByPrincipal`

### `platform-registry-grant`

CRUD operations for PlatformRegistryGrant records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformRegistryGrant records |
| `find-first` | Find first matching platformRegistryGrant record |
| `get` | Get a platformRegistryGrant by id |
| `create` | Create a new platformRegistryGrant |
| `update` | Update an existing platformRegistryGrant |
| `delete` | Delete a platformRegistryGrant |

**Fields:**

| Field | Type |
|-------|------|
| `actions` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `expiresAt` | Datetime |
| `grantedBy` | UUID |
| `granteeKey` | UUID |
| `granteeScope` | String |
| `id` | UUID |
| `registryId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `granteeKey`, `granteeScope`, `registryId`
**Optional create fields (backend defaults):** `actions`, `createdByPrincipal`, `expiresAt`, `grantedBy`, `updatedByPrincipal`

### `platform-repository`

CRUD operations for PlatformRepository records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformRepository records |
| `find-first` | Find first matching platformRepository record |
| `search <query>` | Search platformRepository records |
| `get` | Get a platformRepository by id |
| `create` | Create a new platformRepository |
| `update` | Update an existing platformRepository |
| `delete` | Delete a platformRepository |

**Fields:**

| Field | Type |
|-------|------|
| `cloneUrl` | String |
| `cloneUrlTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `defaultBranch` | String |
| `defaultBranchTrgmSimilarity` | Float |
| `description` | String |
| `descriptionTrgmSimilarity` | Float |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `externalId` | String |
| `externalIdTrgmSimilarity` | Float |
| `id` | UUID |
| `isArchived` | Boolean |
| `metadata` | JSON |
| `name` | String |
| `nameTrgmSimilarity` | Float |
| `ownerId` | UUID |
| `provider` | String |
| `providerTrgmSimilarity` | Float |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `slug` | String |
| `slugTrgmSimilarity` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |
| `visibility` | String |
| `visibilityTrgmSimilarity` | Float |

**Required create fields:** `name`, `slug`
**Optional create fields (backend defaults):** `cloneUrl`, `createdBy`, `createdByPrincipal`, `defaultBranch`, `description`, `embedding`, `externalId`, `isArchived`, `metadata`, `ownerId`, `provider`, `updatedBy`, `updatedByPrincipal`, `visibility`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `cloneUrlTrgmSimilarity`, `defaultBranchTrgmSimilarity`, `descriptionTrgmSimilarity`, `externalIdTrgmSimilarity`, `nameTrgmSimilarity`, `providerTrgmSimilarity`, `search`, `searchScore`, `slugTrgmSimilarity`, `visibilityTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk platform-repository list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk platform-repository search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk platform-repository list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk platform-repository create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk platform-repository update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmCloneUrl`):*
```bash
csdk platform-repository list --where.trgmCloneUrl.value "approximate query" --where.trgmCloneUrl.threshold 0.3 --select title,cloneUrlTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmDefaultBranch`):*
```bash
csdk platform-repository list --where.trgmDefaultBranch.value "approximate query" --where.trgmDefaultBranch.threshold 0.3 --select title,defaultBranchTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmDescription`):*
```bash
csdk platform-repository list --where.trgmDescription.value "approximate query" --where.trgmDescription.threshold 0.3 --select title,descriptionTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmExternalId`):*
```bash
csdk platform-repository list --where.trgmExternalId.value "approximate query" --where.trgmExternalId.threshold 0.3 --select title,externalIdTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmName`):*
```bash
csdk platform-repository list --where.trgmName.value "approximate query" --where.trgmName.threshold 0.3 --select title,nameTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmProvider`):*
```bash
csdk platform-repository list --where.trgmProvider.value "approximate query" --where.trgmProvider.threshold 0.3 --select title,providerTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk platform-repository list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmSlug`):*
```bash
csdk platform-repository list --where.trgmSlug.value "approximate query" --where.trgmSlug.threshold 0.3 --select title,slugTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmVisibility`):*
```bash
csdk platform-repository list --where.trgmVisibility.value "approximate query" --where.trgmVisibility.threshold 0.3 --select title,visibilityTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk platform-repository list --where.unifiedSearch "search query" --select title,cloneUrlTrgmSimilarity,defaultBranchTrgmSimilarity,descriptionTrgmSimilarity,externalIdTrgmSimilarity,nameTrgmSimilarity,providerTrgmSimilarity,tsvRank,searchScore,slugTrgmSimilarity,visibilityTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk platform-repository list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk platform-repository search "query" --limit 10 --select id,title,searchScore
```


### `platform-repository-event`

CRUD operations for PlatformRepositoryEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformRepositoryEvent records |
| `find-first` | Find first matching platformRepositoryEvent record |
| `get` | Get a platformRepositoryEvent by id |
| `create` | Create a new platformRepositoryEvent |
| `update` | Update an existing platformRepositoryEvent |
| `delete` | Delete a platformRepositoryEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `commitSha` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `deliveryId` | String |
| `eventType` | String |
| `id` | UUID |
| `metadata` | JSON |
| `payload` | JSON |
| `ref` | String |
| `repositoryId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `eventType`, `repositoryId`
**Optional create fields (backend defaults):** `actorId`, `commitSha`, `createdByPrincipal`, `deliveryId`, `metadata`, `payload`, `ref`, `updatedByPrincipal`

### `platform-repository-required-check`

CRUD operations for PlatformRepositoryRequiredCheck records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformRepositoryRequiredCheck records |
| `find-first` | Find first matching platformRepositoryRequiredCheck record |
| `get` | Get a platformRepositoryRequiredCheck by id |
| `create` | Create a new platformRepositoryRequiredCheck |
| `update` | Update an existing platformRepositoryRequiredCheck |
| `delete` | Delete a platformRepositoryRequiredCheck |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `id` | UUID |
| `repositoryId` | UUID |
| `updatedAt` | Datetime |
| `workflowId` | UUID |

**Required create fields:** `repositoryId`, `workflowId`

### `platform-repository-workflow`

CRUD operations for PlatformRepositoryWorkflow records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformRepositoryWorkflow records |
| `find-first` | Find first matching platformRepositoryWorkflow record |
| `get` | Get a platformRepositoryWorkflow by id |
| `create` | Create a new platformRepositoryWorkflow |
| `update` | Update an existing platformRepositoryWorkflow |
| `delete` | Delete a platformRepositoryWorkflow |

**Fields:**

| Field | Type |
|-------|------|
| `cancelInProgress` | Boolean |
| `concurrencyKey` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `eventType` | String |
| `graphId` | UUID |
| `id` | UUID |
| `inputs` | JSON |
| `isEnabled` | Boolean |
| `name` | String |
| `refPattern` | String |
| `repositoryId` | UUID |
| `requiredSecrets` | String |
| `slug` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `eventType`, `name`, `repositoryId`, `slug`
**Optional create fields (backend defaults):** `cancelInProgress`, `concurrencyKey`, `createdBy`, `createdByPrincipal`, `graphId`, `inputs`, `isEnabled`, `refPattern`, `requiredSecrets`, `updatedBy`, `updatedByPrincipal`

### `platform-resource`

CRUD operations for PlatformResource records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResource records |
| `find-first` | Find first matching platformResource record |
| `get` | Get a platformResource by id |
| `create` | Create a new platformResource |
| `update` | Update an existing platformResource |
| `delete` | Delete a platformResource |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `errorCount` | Int |
| `id` | UUID |
| `imageRef` | String |
| `installationId` | UUID |
| `integrations` | String |
| `kind` | String |
| `labels` | JSON |
| `lastError` | String |
| `lastHeartbeatAt` | Datetime |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `name` | String |
| `namespaceId` | UUID |
| `realm` | String |
| `replicas` | Int |
| `requiredConfigs` | ResourceRequirement |
| `requiredSecrets` | ResourceRequirement |
| `resourceDefinitionId` | UUID |
| `slug` | String |
| `spec` | JSON |
| `status` | String |
| `statusObserved` | JSON |
| `storageClass` | String |
| `storageSizeBytes` | BigInt |
| `storageTotalBytes` | BigInt |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `kind`, `name`, `namespaceId`, `slug`
**Optional create fields (backend defaults):** `annotations`, `createdBy`, `createdByPrincipal`, `errorCount`, `imageRef`, `installationId`, `integrations`, `labels`, `lastError`, `lastHeartbeatAt`, `realm`, `requiredConfigs`, `requiredSecrets`, `resourceDefinitionId`, `spec`, `status`, `statusObserved`, `updatedBy`, `updatedByPrincipal`

### `platform-resource-declared-capacity`

CRUD operations for PlatformResourceDeclaredCapacity records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceDeclaredCapacity records |
| `find-first` | Find first matching platformResourceDeclaredCapacity record |
| `get` | Get a platformResourceDeclaredCapacity by id |
| `create` | Create a new platformResourceDeclaredCapacity |
| `update` | Update an existing platformResourceDeclaredCapacity |
| `delete` | Delete a platformResourceDeclaredCapacity |

**Fields:**

| Field | Type |
|-------|------|
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `installationId` | UUID |
| `isTransient` | Boolean |
| `kind` | String |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `namespaceId` | UUID |
| `podCountMax` | Int |
| `podCountMin` | Int |
| `source` | String |
| `sourceId` | UUID |
| `storageSizeBytes` | BigInt |
| `storageTotalBytes` | BigInt |

**Required create fields:** `cpuLimitMillicores`, `cpuRequestMillicores`, `installationId`, `isTransient`, `kind`, `memoryLimitBytes`, `memoryRequestBytes`, `namespaceId`, `podCountMax`, `podCountMin`, `source`, `sourceId`, `storageSizeBytes`, `storageTotalBytes`

### `platform-resource-definition`

CRUD operations for PlatformResourceDefinition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceDefinition records |
| `find-first` | Find first matching platformResourceDefinition record |
| `get` | Get a platformResourceDefinition by id |
| `create` | Create a new platformResourceDefinition |
| `update` | Update an existing platformResourceDefinition |
| `delete` | Delete a platformResourceDefinition |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `defaultSpec` | JSON |
| `description` | String |
| `id` | UUID |
| `integrations` | String |
| `kind` | String |
| `labels` | JSON |
| `name` | String |
| `namespaceId` | UUID |
| `paramsSchema` | JSON |
| `requiredConfigs` | ResourceRequirement |
| `requiredSecrets` | ResourceRequirement |
| `slug` | String |
| `stepUpMinAge` | Interval |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `kind`, `name`, `namespaceId`, `slug`
**Optional create fields (backend defaults):** `annotations`, `createdBy`, `createdByPrincipal`, `defaultSpec`, `description`, `integrations`, `labels`, `paramsSchema`, `requiredConfigs`, `requiredSecrets`, `stepUpMinAge`, `updatedBy`, `updatedByPrincipal`

### `platform-resource-event`

CRUD operations for PlatformResourceEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceEvent records |
| `find-first` | Find first matching platformResourceEvent record |
| `get` | Get a platformResourceEvent by id |
| `create` | Create a new platformResourceEvent |
| `update` | Update an existing platformResourceEvent |
| `delete` | Delete a platformResourceEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `eventType` | String |
| `id` | UUID |
| `message` | String |
| `metadata` | JSON |
| `resourceId` | UUID |

**Required create fields:** `eventType`, `resourceId`
**Optional create fields (backend defaults):** `actorId`, `message`, `metadata`

### `platform-resource-installation`

CRUD operations for PlatformResourceInstallation records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceInstallation records |
| `find-first` | Find first matching platformResourceInstallation record |
| `get` | Get a platformResourceInstallation by id |
| `create` | Create a new platformResourceInstallation |
| `update` | Update an existing platformResourceInstallation |
| `delete` | Delete a platformResourceInstallation |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `id` | UUID |
| `name` | String |
| `namespaceId` | UUID |
| `params` | JSON |
| `revision` | Int |
| `slug` | String |
| `status` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `name`, `namespaceId`, `slug`
**Optional create fields (backend defaults):** `commitId`, `createdBy`, `createdByPrincipal`, `params`, `revision`, `status`, `storeId`, `updatedBy`, `updatedByPrincipal`

### `platform-resource-observed-storage`

CRUD operations for PlatformResourceObservedStorage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceObservedStorage records |
| `find-first` | Find first matching platformResourceObservedStorage record |
| `get` | Get a platformResourceObservedStorage by id |
| `create` | Create a new platformResourceObservedStorage |
| `update` | Update an existing platformResourceObservedStorage |
| `delete` | Delete a platformResourceObservedStorage |

**Fields:**

| Field | Type |
|-------|------|
| `capacity` | String |
| `capacityBytes` | BigInt |
| `claimName` | String |
| `declaredStorageClass` | String |
| `declaredStorageSizeBytes` | BigInt |
| `declaredStorageTotalBytes` | BigInt |
| `installationId` | UUID |
| `isBound` | Boolean |
| `kind` | String |
| `namespaceId` | UUID |
| `phase` | String |
| `requested` | String |
| `requestedBytes` | BigInt |
| `resourceId` | UUID |
| `resourceStatus` | String |
| `slug` | String |
| `storageClass` | String |
| `storageName` | String |

**Required create fields:** `capacity`, `capacityBytes`, `claimName`, `declaredStorageClass`, `declaredStorageSizeBytes`, `declaredStorageTotalBytes`, `installationId`, `isBound`, `kind`, `namespaceId`, `phase`, `requested`, `requestedBytes`, `resourceId`, `resourceStatus`, `slug`, `storageClass`, `storageName`

### `platform-resource-status-check`

CRUD operations for PlatformResourceStatusCheck records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceStatusCheck records |
| `find-first` | Find first matching platformResourceStatusCheck record |
| `get` | Get a platformResourceStatusCheck by id |
| `create` | Create a new platformResourceStatusCheck |
| `update` | Update an existing platformResourceStatusCheck |
| `delete` | Delete a platformResourceStatusCheck |

**Fields:**

| Field | Type |
|-------|------|
| `completedAt` | Datetime |
| `id` | UUID |
| `requestedAt` | Datetime |
| `requestedBy` | UUID |
| `resourceId` | UUID |
| `result` | JSON |
| `status` | String |

**Required create fields:** `resourceId`
**Optional create fields (backend defaults):** `completedAt`, `requestedAt`, `requestedBy`, `result`, `status`

### `platform-resource-usage-log`

CRUD operations for PlatformResourceUsageLog records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceUsageLog records |
| `find-first` | Find first matching platformResourceUsageLog record |
| `get` | Get a platformResourceUsageLog by id |
| `create` | Create a new platformResourceUsageLog |
| `update` | Update an existing platformResourceUsageLog |
| `delete` | Delete a platformResourceUsageLog |

**Fields:**

| Field | Type |
|-------|------|
| `cpuMillicores` | BigInt |
| `id` | UUID |
| `intervalSeconds` | Int |
| `memoryBytes` | BigInt |
| `metrics` | JSON |
| `namespaceId` | UUID |
| `resourceId` | UUID |
| `sampledAt` | Datetime |
| `source` | String |

**Required create fields:** `intervalSeconds`, `namespaceId`, `source`
**Optional create fields (backend defaults):** `cpuMillicores`, `memoryBytes`, `metrics`, `resourceId`, `sampledAt`

### `platform-resource-usage-summary`

CRUD operations for PlatformResourceUsageSummary records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceUsageSummary records |
| `find-first` | Find first matching platformResourceUsageSummary record |
| `get` | Get a platformResourceUsageSummary by id |
| `create` | Create a new platformResourceUsageSummary |
| `update` | Update an existing platformResourceUsageSummary |
| `delete` | Delete a platformResourceUsageSummary |

**Fields:**

| Field | Type |
|-------|------|
| `date` | Date |
| `gbSeconds` | BigFloat |
| `id` | UUID |
| `maxCpuMillicores` | BigInt |
| `maxMemoryBytes` | BigInt |
| `namespaceId` | UUID |
| `resourceId` | UUID |
| `runtimeSeconds` | BigInt |
| `sampleCount` | Int |

**Required create fields:** `date`, `namespaceId`
**Optional create fields (backend defaults):** `gbSeconds`, `maxCpuMillicores`, `maxMemoryBytes`, `resourceId`, `runtimeSeconds`, `sampleCount`

### `platform-resource-utilization`

CRUD operations for PlatformResourceUtilization records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourceUtilization records |
| `find-first` | Find first matching platformResourceUtilization record |
| `get` | Get a platformResourceUtilization by id |
| `create` | Create a new platformResourceUtilization |
| `update` | Update an existing platformResourceUtilization |
| `delete` | Delete a platformResourceUtilization |

**Fields:**

| Field | Type |
|-------|------|
| `avgMemoryBytes` | BigInt |
| `cpuLimitMillicores` | BigInt |
| `cpuPeakUtilization` | BigFloat |
| `cpuRequestHeadroomMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `date` | Date |
| `gbSeconds` | BigFloat |
| `kind` | String |
| `maxCpuMillicores` | BigInt |
| `maxMemoryBytes` | BigInt |
| `memoryLimitBytes` | BigInt |
| `memoryPeakUtilization` | BigFloat |
| `memoryRequestBytes` | BigInt |
| `memoryRequestHeadroomBytes` | BigInt |
| `namespaceId` | UUID |
| `replicas` | Int |
| `resourceId` | UUID |
| `runtimeSeconds` | BigInt |
| `sampleCount` | Int |

**Required create fields:** `avgMemoryBytes`, `cpuLimitMillicores`, `cpuPeakUtilization`, `cpuRequestHeadroomMillicores`, `cpuRequestMillicores`, `date`, `gbSeconds`, `kind`, `maxCpuMillicores`, `maxMemoryBytes`, `memoryLimitBytes`, `memoryPeakUtilization`, `memoryRequestBytes`, `memoryRequestHeadroomBytes`, `namespaceId`, `replicas`, `resourceId`, `runtimeSeconds`, `sampleCount`

### `platform-resources-health`

CRUD operations for PlatformResourcesHealth records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourcesHealth records |
| `find-first` | Find first matching platformResourcesHealth record |
| `get` | Get a platformResourcesHealth by id |
| `create` | Create a new platformResourcesHealth |
| `update` | Update an existing platformResourcesHealth |
| `delete` | Delete a platformResourcesHealth |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `errorCount` | Int |
| `id` | UUID |
| `imageRef` | String |
| `installationId` | UUID |
| `integrations` | String |
| `kind` | String |
| `labels` | JSON |
| `lastError` | String |
| `lastHeartbeatAt` | Datetime |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `name` | String |
| `namespaceId` | UUID |
| `realm` | String |
| `replicas` | Int |
| `requiredConfigs` | ResourceRequirement |
| `requiredSecrets` | ResourceRequirement |
| `resourceDefinitionId` | UUID |
| `slug` | String |
| `spec` | JSON |
| `status` | String |
| `statusDetail` | String |
| `statusObserved` | JSON |
| `storageClass` | String |
| `storageSizeBytes` | BigInt |
| `storageTotalBytes` | BigInt |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `annotations`, `cpuLimitMillicores`, `cpuRequestMillicores`, `createdBy`, `createdByPrincipal`, `errorCount`, `imageRef`, `installationId`, `integrations`, `kind`, `labels`, `lastError`, `lastHeartbeatAt`, `memoryLimitBytes`, `memoryRequestBytes`, `name`, `namespaceId`, `realm`, `replicas`, `requiredConfigs`, `requiredSecrets`, `resourceDefinitionId`, `slug`, `spec`, `status`, `statusDetail`, `statusObserved`, `storageClass`, `storageSizeBytes`, `storageTotalBytes`, `updatedBy`, `updatedByPrincipal`

### `platform-resources-requirements-state`

CRUD operations for PlatformResourcesRequirementsState records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourcesRequirementsState records |
| `find-first` | Find first matching platformResourcesRequirementsState record |
| `get` | Get a platformResourcesRequirementsState by id |
| `create` | Create a new platformResourcesRequirementsState |
| `update` | Update an existing platformResourcesRequirementsState |
| `delete` | Delete a platformResourcesRequirementsState |

**Fields:**

| Field | Type |
|-------|------|
| `configHash` | String |
| `configObjectName` | String |
| `requirementsHash` | String |
| `resourceId` | UUID |
| `secretsHash` | String |
| `secretsObjectName` | String |
| `slug` | String |

**Required create fields:** `configHash`, `configObjectName`, `requirementsHash`, `resourceId`, `secretsHash`, `secretsObjectName`, `slug`

### `platform-resources-resolved-requirement`

CRUD operations for PlatformResourcesResolvedRequirement records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformResourcesResolvedRequirement records |
| `find-first` | Find first matching platformResourcesResolvedRequirement record |
| `get` | Get a platformResourcesResolvedRequirement by id |
| `create` | Create a new platformResourcesResolvedRequirement |
| `update` | Update an existing platformResourcesResolvedRequirement |
| `delete` | Delete a platformResourcesResolvedRequirement |

**Fields:**

| Field | Type |
|-------|------|
| `atomId` | UUID |
| `configObjectName` | String |
| `name` | String |
| `namespaceId` | UUID |
| `present` | Boolean |
| `realm` | String |
| `required` | Boolean |
| `requirementKind` | String |
| `resourceId` | UUID |
| `secretsObjectName` | String |
| `slug` | String |

**Required create fields:** `atomId`, `configObjectName`, `name`, `namespaceId`, `present`, `realm`, `required`, `requirementKind`, `resourceId`, `secretsObjectName`, `slug`

### `platform-webhook-endpoint`

CRUD operations for PlatformWebhookEndpoint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformWebhookEndpoint records |
| `find-first` | Find first matching platformWebhookEndpoint record |
| `get` | Get a platformWebhookEndpoint by id |
| `create` | Create a new platformWebhookEndpoint |
| `update` | Update an existing platformWebhookEndpoint |
| `delete` | Delete a platformWebhookEndpoint |

**Fields:**

| Field | Type |
|-------|------|
| `active` | Boolean |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `functionDefinitionId` | UUID |
| `host` | String |
| `id` | UUID |
| `namespaceId` | UUID |
| `path` | String |
| `provider` | String |
| `replayWindowSeconds` | Int |
| `signingSecretName` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `functionDefinitionId`, `host`, `namespaceId`, `path`, `signingSecretName`
**Optional create fields (backend defaults):** `active`, `createdBy`, `createdByPrincipal`, `provider`, `replayWindowSeconds`, `updatedBy`, `updatedByPrincipal`

### `platform-webhook-event`

CRUD operations for PlatformWebhookEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformWebhookEvent records |
| `find-first` | Find first matching platformWebhookEvent record |
| `get` | Get a platformWebhookEvent by id |
| `create` | Create a new platformWebhookEvent |
| `update` | Update an existing platformWebhookEvent |
| `delete` | Delete a platformWebhookEvent |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `endpointId` | UUID |
| `error` | String |
| `externalEventId` | String |
| `id` | UUID |
| `invocationCreatedAt` | Datetime |
| `invocationId` | UUID |
| `payload` | JSON |
| `provider` | String |
| `providerTimestamp` | Datetime |
| `status` | String |
| `updatedAt` | Datetime |

**Required create fields:** `endpointId`, `externalEventId`, `provider`
**Optional create fields (backend defaults):** `error`, `invocationCreatedAt`, `invocationId`, `payload`, `providerTimestamp`, `status`

### `proposal-comment`

CRUD operations for ProposalComment records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all proposalComment records |
| `find-first` | Find first matching proposalComment record |
| `search <query>` | Search proposalComment records |
| `get` | Get a proposalComment by id |
| `create` | Create a new proposalComment |
| `update` | Update an existing proposalComment |
| `delete` | Delete a proposalComment |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `attachments` | Upload |
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `line` | Int |
| `outdatedAt` | Datetime |
| `path` | String |
| `pathTrgmSimilarity` | Float |
| `proposalId` | UUID |
| `resolvedAt` | Datetime |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `body`, `proposalId`
**Optional create fields (backend defaults):** `actorId`, `attachments`, `createdBy`, `createdByPrincipal`, `embedding`, `line`, `outdatedAt`, `path`, `resolvedAt`, `updatedBy`, `updatedByPrincipal`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `bodyTrgmSimilarity`, `pathTrgmSimilarity`, `search`, `searchScore`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk proposal-comment list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk proposal-comment search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk proposal-comment list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk proposal-comment create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk proposal-comment update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk proposal-comment list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmPath`):*
```bash
csdk proposal-comment list --where.trgmPath.value "approximate query" --where.trgmPath.threshold 0.3 --select title,pathTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk proposal-comment list --where.search "search query" --select title,tsvRank
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk proposal-comment list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,pathTrgmSimilarity,tsvRank,searchScore
```

*Search with pagination and field projection:*
```bash
csdk proposal-comment list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk proposal-comment search "query" --limit 10 --select id,title,searchScore
```


### `proposal`

CRUD operations for Proposal records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all proposal records |
| `find-first` | Find first matching proposal record |
| `search <query>` | Search proposal records |
| `get` | Get a proposal by id |
| `create` | Create a new proposal |
| `update` | Update an existing proposal |
| `delete` | Delete a proposal |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `closedReason` | String |
| `closedReasonTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `decidedAt` | Datetime |
| `dueAt` | Datetime |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `kind` | String |
| `kindTrgmSimilarity` | Float |
| `labels` | String |
| `mergeCommit` | String |
| `mergeCommitTrgmSimilarity` | Float |
| `mergeMethod` | String |
| `mergeMethodTrgmSimilarity` | Float |
| `mergeRequestedAt` | Datetime |
| `mergedAt` | Datetime |
| `metadata` | JSON |
| `parentId` | UUID |
| `priority` | BigFloat |
| `repositoryId` | UUID |
| `resolution` | String |
| `resolutionTrgmSimilarity` | Float |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `sourceRef` | String |
| `sourceRefTrgmSimilarity` | Float |
| `status` | String |
| `statusTrgmSimilarity` | Float |
| `targetRef` | String |
| `targetRefTrgmSimilarity` | Float |
| `title` | String |
| `titleTrgmSimilarity` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `repositoryId`, `title`
**Optional create fields (backend defaults):** `actorId`, `body`, `closedReason`, `createdBy`, `createdByPrincipal`, `decidedAt`, `dueAt`, `embedding`, `kind`, `labels`, `mergeCommit`, `mergeMethod`, `mergeRequestedAt`, `mergedAt`, `metadata`, `parentId`, `priority`, `resolution`, `sourceRef`, `status`, `targetRef`, `updatedBy`, `updatedByPrincipal`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `bodyTrgmSimilarity`, `closedReasonTrgmSimilarity`, `kindTrgmSimilarity`, `mergeCommitTrgmSimilarity`, `mergeMethodTrgmSimilarity`, `resolutionTrgmSimilarity`, `search`, `searchScore`, `sourceRefTrgmSimilarity`, `statusTrgmSimilarity`, `targetRefTrgmSimilarity`, `titleTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk proposal list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk proposal search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk proposal list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk proposal create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk proposal update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk proposal list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmClosedReason`):*
```bash
csdk proposal list --where.trgmClosedReason.value "approximate query" --where.trgmClosedReason.threshold 0.3 --select title,closedReasonTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmKind`):*
```bash
csdk proposal list --where.trgmKind.value "approximate query" --where.trgmKind.threshold 0.3 --select title,kindTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmMergeCommit`):*
```bash
csdk proposal list --where.trgmMergeCommit.value "approximate query" --where.trgmMergeCommit.threshold 0.3 --select title,mergeCommitTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmMergeMethod`):*
```bash
csdk proposal list --where.trgmMergeMethod.value "approximate query" --where.trgmMergeMethod.threshold 0.3 --select title,mergeMethodTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmResolution`):*
```bash
csdk proposal list --where.trgmResolution.value "approximate query" --where.trgmResolution.threshold 0.3 --select title,resolutionTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk proposal list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmSourceRef`):*
```bash
csdk proposal list --where.trgmSourceRef.value "approximate query" --where.trgmSourceRef.threshold 0.3 --select title,sourceRefTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmStatus`):*
```bash
csdk proposal list --where.trgmStatus.value "approximate query" --where.trgmStatus.threshold 0.3 --select title,statusTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmTargetRef`):*
```bash
csdk proposal list --where.trgmTargetRef.value "approximate query" --where.trgmTargetRef.threshold 0.3 --select title,targetRefTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmTitle`):*
```bash
csdk proposal list --where.trgmTitle.value "approximate query" --where.trgmTitle.threshold 0.3 --select title,titleTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk proposal list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,closedReasonTrgmSimilarity,kindTrgmSimilarity,mergeCommitTrgmSimilarity,mergeMethodTrgmSimilarity,resolutionTrgmSimilarity,tsvRank,searchScore,sourceRefTrgmSimilarity,statusTrgmSimilarity,targetRefTrgmSimilarity,titleTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk proposal list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk proposal search "query" --limit 10 --select id,title,searchScore
```


### `proposal-file-view`

CRUD operations for ProposalFileView records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all proposalFileView records |
| `find-first` | Find first matching proposalFileView record |
| `get` | Get a proposalFileView by id |
| `create` | Create a new proposalFileView |
| `update` | Update an existing proposalFileView |
| `delete` | Delete a proposalFileView |

**Fields:**

| Field | Type |
|-------|------|
| `blobSha` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `path` | String |
| `proposalId` | UUID |
| `reviewerId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `viewedAt` | Datetime |

**Required create fields:** `blobSha`, `path`, `proposalId`, `reviewerId`
**Optional create fields (backend defaults):** `createdByPrincipal`, `updatedByPrincipal`, `viewedAt`

### `proposal-reaction`

CRUD operations for ProposalReaction records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all proposalReaction records |
| `find-first` | Find first matching proposalReaction record |
| `get` | Get a proposalReaction by id |
| `create` | Create a new proposalReaction |
| `update` | Update an existing proposalReaction |
| `delete` | Delete a proposalReaction |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `commentId` | UUID |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `emoji` | String |
| `id` | UUID |
| `proposalId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `actorId`, `emoji`, `proposalId`
**Optional create fields (backend defaults):** `commentId`, `createdByPrincipal`, `updatedByPrincipal`

### `proposal-review`

CRUD operations for ProposalReview records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all proposalReview records |
| `find-first` | Find first matching proposalReview record |
| `search <query>` | Search proposalReview records |
| `get` | Get a proposalReview by id |
| `create` | Create a new proposalReview |
| `update` | Update an existing proposalReview |
| `delete` | Delete a proposalReview |

**Fields:**

| Field | Type |
|-------|------|
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `commitSha` | String |
| `commitShaTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `proposalId` | UUID |
| `reviewerId` | UUID |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `submittedAt` | Datetime |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `verdict` | String |
| `verdictTrgmSimilarity` | Float |

**Required create fields:** `commitSha`, `proposalId`, `reviewerId`, `verdict`
**Optional create fields (backend defaults):** `body`, `createdByPrincipal`, `submittedAt`, `updatedByPrincipal`
> **Unified Search API fields:** `bodyTrgmSimilarity`, `commitShaTrgmSimilarity`, `search`, `searchScore`, `verdictTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk proposal-review list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmCommitSha`):*
```bash
csdk proposal-review list --where.trgmCommitSha.value "approximate query" --where.trgmCommitSha.threshold 0.3 --select title,commitShaTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk proposal-review list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmVerdict`):*
```bash
csdk proposal-review list --where.trgmVerdict.value "approximate query" --where.trgmVerdict.threshold 0.3 --select title,verdictTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk proposal-review list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,commitShaTrgmSimilarity,tsvRank,searchScore,verdictTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk proposal-review list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk proposal-review search "query" --limit 10 --select id,title,searchScore
```


### `proposals-chunk`

CRUD operations for ProposalsChunk records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all proposalsChunk records |
| `find-first` | Find first matching proposalsChunk record |
| `search <query>` | Search proposalsChunk records |
| `get` | Get a proposalsChunk by id |
| `create` | Create a new proposalsChunk |
| `update` | Update an existing proposalsChunk |
| `delete` | Delete a proposalsChunk |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `body` | String |
| `chunkIndex` | Int |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `embedding` | Vector |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `metadata` | JSON |
| `proposalsId` | UUID |
| `searchScore` | Float |
| `updatedAt` | Datetime |

**Required create fields:** `body`, `proposalsId`
**Optional create fields (backend defaults):** `actorId`, `chunkIndex`, `databaseId`, `embedding`, `metadata`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `searchScore`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk proposals-chunk list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk proposals-chunk search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk proposals-chunk list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk proposals-chunk create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk proposals-chunk update --embedding "new text to embed" --auto-embed
```

*Search with pagination and field projection:*
```bash
csdk proposals-chunk list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk proposals-chunk search "query" --limit 10 --select id,title,searchScore
```


### `registry-binding`

CRUD operations for RegistryBinding records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all registryBinding records |
| `find-first` | Find first matching registryBinding record |
| `get` | Get a registryBinding by id |
| `create` | Create a new registryBinding |
| `update` | Update an existing registryBinding |
| `delete` | Delete a registryBinding |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `metadata` | JSON |
| `namespaceId` | UUID |
| `observedCredentialVersion` | String |
| `pullSecretName` | String |
| `realm` | String |
| `registryHost` | String |
| `registryId` | UUID |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `namespaceId`, `registryHost`, `registryId`
**Optional create fields (backend defaults):** `createdBy`, `createdByPrincipal`, `metadata`, `observedCredentialVersion`, `pullSecretName`, `realm`, `status`, `updatedBy`, `updatedByPrincipal`

### `registry`

CRUD operations for Registry records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all registry records |
| `find-first` | Find first matching registry record |
| `get` | Get a registry by id |
| `create` | Create a new registry |
| `update` | Update an existing registry |
| `delete` | Delete a registry |

**Fields:**

| Field | Type |
|-------|------|
| `authMode` | String |
| `basePath` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `credentialSecretName` | String |
| `databaseId` | UUID |
| `host` | String |
| `id` | UUID |
| `installationId` | UUID |
| `isPublished` | Boolean |
| `kind` | String |
| `labels` | JSON |
| `lastError` | String |
| `metadata` | JSON |
| `name` | String |
| `platformOnly` | Boolean |
| `role` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `kind`, `name`
**Optional create fields (backend defaults):** `authMode`, `basePath`, `createdByPrincipal`, `credentialSecretName`, `host`, `installationId`, `isPublished`, `labels`, `lastError`, `metadata`, `platformOnly`, `role`, `status`, `updatedByPrincipal`

### `registry-grant`

CRUD operations for RegistryGrant records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all registryGrant records |
| `find-first` | Find first matching registryGrant record |
| `get` | Get a registryGrant by id |
| `create` | Create a new registryGrant |
| `update` | Update an existing registryGrant |
| `delete` | Delete a registryGrant |

**Fields:**

| Field | Type |
|-------|------|
| `actions` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `expiresAt` | Datetime |
| `grantedBy` | UUID |
| `granteeKey` | UUID |
| `granteeScope` | String |
| `id` | UUID |
| `registryId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `granteeKey`, `granteeScope`, `registryId`
**Optional create fields (backend defaults):** `actions`, `createdByPrincipal`, `expiresAt`, `grantedBy`, `updatedByPrincipal`

### `repository`

CRUD operations for Repository records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all repository records |
| `find-first` | Find first matching repository record |
| `search <query>` | Search repository records |
| `get` | Get a repository by id |
| `create` | Create a new repository |
| `update` | Update an existing repository |
| `delete` | Delete a repository |

**Fields:**

| Field | Type |
|-------|------|
| `cloneUrl` | String |
| `cloneUrlTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `defaultBranch` | String |
| `defaultBranchTrgmSimilarity` | Float |
| `description` | String |
| `descriptionTrgmSimilarity` | Float |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `externalId` | String |
| `externalIdTrgmSimilarity` | Float |
| `id` | UUID |
| `isArchived` | Boolean |
| `metadata` | JSON |
| `name` | String |
| `nameTrgmSimilarity` | Float |
| `ownerId` | UUID |
| `provider` | String |
| `providerTrgmSimilarity` | Float |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `slug` | String |
| `slugTrgmSimilarity` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |
| `visibility` | String |
| `visibilityTrgmSimilarity` | Float |

**Required create fields:** `databaseId`, `name`, `slug`
**Optional create fields (backend defaults):** `cloneUrl`, `createdBy`, `createdByPrincipal`, `defaultBranch`, `description`, `embedding`, `externalId`, `isArchived`, `metadata`, `ownerId`, `provider`, `updatedBy`, `updatedByPrincipal`, `visibility`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `cloneUrlTrgmSimilarity`, `defaultBranchTrgmSimilarity`, `descriptionTrgmSimilarity`, `externalIdTrgmSimilarity`, `nameTrgmSimilarity`, `providerTrgmSimilarity`, `search`, `searchScore`, `slugTrgmSimilarity`, `visibilityTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk repository list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk repository search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk repository list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk repository create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk repository update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmCloneUrl`):*
```bash
csdk repository list --where.trgmCloneUrl.value "approximate query" --where.trgmCloneUrl.threshold 0.3 --select title,cloneUrlTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmDefaultBranch`):*
```bash
csdk repository list --where.trgmDefaultBranch.value "approximate query" --where.trgmDefaultBranch.threshold 0.3 --select title,defaultBranchTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmDescription`):*
```bash
csdk repository list --where.trgmDescription.value "approximate query" --where.trgmDescription.threshold 0.3 --select title,descriptionTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmExternalId`):*
```bash
csdk repository list --where.trgmExternalId.value "approximate query" --where.trgmExternalId.threshold 0.3 --select title,externalIdTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmName`):*
```bash
csdk repository list --where.trgmName.value "approximate query" --where.trgmName.threshold 0.3 --select title,nameTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmProvider`):*
```bash
csdk repository list --where.trgmProvider.value "approximate query" --where.trgmProvider.threshold 0.3 --select title,providerTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk repository list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmSlug`):*
```bash
csdk repository list --where.trgmSlug.value "approximate query" --where.trgmSlug.threshold 0.3 --select title,slugTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmVisibility`):*
```bash
csdk repository list --where.trgmVisibility.value "approximate query" --where.trgmVisibility.threshold 0.3 --select title,visibilityTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk repository list --where.unifiedSearch "search query" --select title,cloneUrlTrgmSimilarity,defaultBranchTrgmSimilarity,descriptionTrgmSimilarity,externalIdTrgmSimilarity,nameTrgmSimilarity,providerTrgmSimilarity,tsvRank,searchScore,slugTrgmSimilarity,visibilityTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk repository list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk repository search "query" --limit 10 --select id,title,searchScore
```


### `repository-event`

CRUD operations for RepositoryEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all repositoryEvent records |
| `find-first` | Find first matching repositoryEvent record |
| `get` | Get a repositoryEvent by id |
| `create` | Create a new repositoryEvent |
| `update` | Update an existing repositoryEvent |
| `delete` | Delete a repositoryEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `commitSha` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `deliveryId` | String |
| `eventType` | String |
| `id` | UUID |
| `metadata` | JSON |
| `payload` | JSON |
| `ref` | String |
| `repositoryId` | UUID |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `eventType`, `repositoryId`
**Optional create fields (backend defaults):** `actorId`, `commitSha`, `createdByPrincipal`, `deliveryId`, `metadata`, `payload`, `ref`, `updatedByPrincipal`

### `repository-required-check`

CRUD operations for RepositoryRequiredCheck records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all repositoryRequiredCheck records |
| `find-first` | Find first matching repositoryRequiredCheck record |
| `get` | Get a repositoryRequiredCheck by id |
| `create` | Create a new repositoryRequiredCheck |
| `update` | Update an existing repositoryRequiredCheck |
| `delete` | Delete a repositoryRequiredCheck |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `repositoryId` | UUID |
| `updatedAt` | Datetime |
| `workflowId` | UUID |

**Required create fields:** `databaseId`, `repositoryId`, `workflowId`

### `repository-workflow`

CRUD operations for RepositoryWorkflow records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all repositoryWorkflow records |
| `find-first` | Find first matching repositoryWorkflow record |
| `get` | Get a repositoryWorkflow by id |
| `create` | Create a new repositoryWorkflow |
| `update` | Update an existing repositoryWorkflow |
| `delete` | Delete a repositoryWorkflow |

**Fields:**

| Field | Type |
|-------|------|
| `cancelInProgress` | Boolean |
| `concurrencyKey` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `eventType` | String |
| `graphId` | UUID |
| `id` | UUID |
| `inputs` | JSON |
| `isEnabled` | Boolean |
| `name` | String |
| `refPattern` | String |
| `repositoryId` | UUID |
| `requiredSecrets` | String |
| `slug` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `eventType`, `name`, `repositoryId`, `slug`
**Optional create fields (backend defaults):** `cancelInProgress`, `concurrencyKey`, `createdBy`, `createdByPrincipal`, `graphId`, `inputs`, `isEnabled`, `refPattern`, `requiredSecrets`, `updatedBy`, `updatedByPrincipal`

### `resource`

CRUD operations for Resource records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resource records |
| `find-first` | Find first matching resource record |
| `get` | Get a resource by id |
| `create` | Create a new resource |
| `update` | Update an existing resource |
| `delete` | Delete a resource |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `errorCount` | Int |
| `id` | UUID |
| `imageRef` | String |
| `installationId` | UUID |
| `integrations` | String |
| `kind` | String |
| `labels` | JSON |
| `lastError` | String |
| `lastHeartbeatAt` | Datetime |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `name` | String |
| `namespaceId` | UUID |
| `realm` | String |
| `replicas` | Int |
| `requiredConfigs` | ResourceRequirement |
| `requiredSecrets` | ResourceRequirement |
| `resourceDefinitionId` | UUID |
| `slug` | String |
| `spec` | JSON |
| `status` | String |
| `statusObserved` | JSON |
| `storageClass` | String |
| `storageSizeBytes` | BigInt |
| `storageTotalBytes` | BigInt |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `kind`, `name`, `namespaceId`, `slug`
**Optional create fields (backend defaults):** `annotations`, `createdBy`, `createdByPrincipal`, `errorCount`, `imageRef`, `installationId`, `integrations`, `labels`, `lastError`, `lastHeartbeatAt`, `realm`, `requiredConfigs`, `requiredSecrets`, `resourceDefinitionId`, `spec`, `status`, `statusObserved`, `updatedBy`, `updatedByPrincipal`

### `resource-declared-capacity`

CRUD operations for ResourceDeclaredCapacity records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceDeclaredCapacity records |
| `find-first` | Find first matching resourceDeclaredCapacity record |
| `get` | Get a resourceDeclaredCapacity by id |
| `create` | Create a new resourceDeclaredCapacity |
| `update` | Update an existing resourceDeclaredCapacity |
| `delete` | Delete a resourceDeclaredCapacity |

**Fields:**

| Field | Type |
|-------|------|
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `installationId` | UUID |
| `isTransient` | Boolean |
| `kind` | String |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `namespaceId` | UUID |
| `podCountMax` | Int |
| `podCountMin` | Int |
| `source` | String |
| `sourceId` | UUID |
| `storageSizeBytes` | BigInt |
| `storageTotalBytes` | BigInt |

**Required create fields:** `cpuLimitMillicores`, `cpuRequestMillicores`, `installationId`, `isTransient`, `kind`, `memoryLimitBytes`, `memoryRequestBytes`, `namespaceId`, `podCountMax`, `podCountMin`, `source`, `sourceId`, `storageSizeBytes`, `storageTotalBytes`

### `resource-definition`

CRUD operations for ResourceDefinition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceDefinition records |
| `find-first` | Find first matching resourceDefinition record |
| `get` | Get a resourceDefinition by id |
| `create` | Create a new resourceDefinition |
| `update` | Update an existing resourceDefinition |
| `delete` | Delete a resourceDefinition |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `defaultSpec` | JSON |
| `description` | String |
| `id` | UUID |
| `integrations` | String |
| `kind` | String |
| `labels` | JSON |
| `name` | String |
| `namespaceId` | UUID |
| `paramsSchema` | JSON |
| `requiredConfigs` | ResourceRequirement |
| `requiredSecrets` | ResourceRequirement |
| `slug` | String |
| `stepUpMinAge` | Interval |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `kind`, `name`, `namespaceId`, `slug`
**Optional create fields (backend defaults):** `annotations`, `createdBy`, `createdByPrincipal`, `defaultSpec`, `description`, `integrations`, `labels`, `paramsSchema`, `requiredConfigs`, `requiredSecrets`, `stepUpMinAge`, `updatedBy`, `updatedByPrincipal`

### `resource-event`

CRUD operations for ResourceEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceEvent records |
| `find-first` | Find first matching resourceEvent record |
| `get` | Get a resourceEvent by id |
| `create` | Create a new resourceEvent |
| `update` | Update an existing resourceEvent |
| `delete` | Delete a resourceEvent |

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
| `resourceId` | UUID |

**Required create fields:** `databaseId`, `eventType`, `resourceId`
**Optional create fields (backend defaults):** `actorId`, `message`, `metadata`

### `resource-installation`

CRUD operations for ResourceInstallation records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceInstallation records |
| `find-first` | Find first matching resourceInstallation record |
| `get` | Get a resourceInstallation by id |
| `create` | Create a new resourceInstallation |
| `update` | Update an existing resourceInstallation |
| `delete` | Delete a resourceInstallation |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `name` | String |
| `namespaceId` | UUID |
| `params` | JSON |
| `revision` | Int |
| `slug` | String |
| `status` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `name`, `namespaceId`, `slug`
**Optional create fields (backend defaults):** `commitId`, `createdBy`, `createdByPrincipal`, `params`, `revision`, `status`, `storeId`, `updatedBy`, `updatedByPrincipal`

### `resource-observed-storage`

CRUD operations for ResourceObservedStorage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceObservedStorage records |
| `find-first` | Find first matching resourceObservedStorage record |
| `get` | Get a resourceObservedStorage by id |
| `create` | Create a new resourceObservedStorage |
| `update` | Update an existing resourceObservedStorage |
| `delete` | Delete a resourceObservedStorage |

**Fields:**

| Field | Type |
|-------|------|
| `capacity` | String |
| `capacityBytes` | BigInt |
| `claimName` | String |
| `declaredStorageClass` | String |
| `declaredStorageSizeBytes` | BigInt |
| `declaredStorageTotalBytes` | BigInt |
| `installationId` | UUID |
| `isBound` | Boolean |
| `kind` | String |
| `namespaceId` | UUID |
| `phase` | String |
| `requested` | String |
| `requestedBytes` | BigInt |
| `resourceId` | UUID |
| `resourceStatus` | String |
| `slug` | String |
| `storageClass` | String |
| `storageName` | String |

**Required create fields:** `capacity`, `capacityBytes`, `claimName`, `declaredStorageClass`, `declaredStorageSizeBytes`, `declaredStorageTotalBytes`, `installationId`, `isBound`, `kind`, `namespaceId`, `phase`, `requested`, `requestedBytes`, `resourceId`, `resourceStatus`, `slug`, `storageClass`, `storageName`

### `resource-status-check`

CRUD operations for ResourceStatusCheck records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceStatusCheck records |
| `find-first` | Find first matching resourceStatusCheck record |
| `get` | Get a resourceStatusCheck by id |
| `create` | Create a new resourceStatusCheck |
| `update` | Update an existing resourceStatusCheck |
| `delete` | Delete a resourceStatusCheck |

**Fields:**

| Field | Type |
|-------|------|
| `completedAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `requestedAt` | Datetime |
| `requestedBy` | UUID |
| `resourceId` | UUID |
| `result` | JSON |
| `status` | String |

**Required create fields:** `databaseId`, `resourceId`
**Optional create fields (backend defaults):** `completedAt`, `requestedAt`, `requestedBy`, `result`, `status`

### `resource-usage-log`

CRUD operations for ResourceUsageLog records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceUsageLog records |
| `find-first` | Find first matching resourceUsageLog record |
| `get` | Get a resourceUsageLog by id |
| `create` | Create a new resourceUsageLog |
| `update` | Update an existing resourceUsageLog |
| `delete` | Delete a resourceUsageLog |

**Fields:**

| Field | Type |
|-------|------|
| `cpuMillicores` | BigInt |
| `databaseId` | UUID |
| `id` | UUID |
| `intervalSeconds` | Int |
| `memoryBytes` | BigInt |
| `metrics` | JSON |
| `namespaceId` | UUID |
| `resourceId` | UUID |
| `sampledAt` | Datetime |
| `source` | String |

**Required create fields:** `databaseId`, `intervalSeconds`, `namespaceId`, `source`
**Optional create fields (backend defaults):** `cpuMillicores`, `memoryBytes`, `metrics`, `resourceId`, `sampledAt`

### `resource-usage-summary`

CRUD operations for ResourceUsageSummary records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceUsageSummary records |
| `find-first` | Find first matching resourceUsageSummary record |
| `get` | Get a resourceUsageSummary by id |
| `create` | Create a new resourceUsageSummary |
| `update` | Update an existing resourceUsageSummary |
| `delete` | Delete a resourceUsageSummary |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `date` | Date |
| `gbSeconds` | BigFloat |
| `id` | UUID |
| `maxCpuMillicores` | BigInt |
| `maxMemoryBytes` | BigInt |
| `namespaceId` | UUID |
| `resourceId` | UUID |
| `runtimeSeconds` | BigInt |
| `sampleCount` | Int |

**Required create fields:** `databaseId`, `date`, `namespaceId`
**Optional create fields (backend defaults):** `gbSeconds`, `maxCpuMillicores`, `maxMemoryBytes`, `resourceId`, `runtimeSeconds`, `sampleCount`

### `resource-utilization`

CRUD operations for ResourceUtilization records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceUtilization records |
| `find-first` | Find first matching resourceUtilization record |
| `get` | Get a resourceUtilization by id |
| `create` | Create a new resourceUtilization |
| `update` | Update an existing resourceUtilization |
| `delete` | Delete a resourceUtilization |

**Fields:**

| Field | Type |
|-------|------|
| `avgMemoryBytes` | BigInt |
| `cpuLimitMillicores` | BigInt |
| `cpuPeakUtilization` | BigFloat |
| `cpuRequestHeadroomMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `date` | Date |
| `gbSeconds` | BigFloat |
| `kind` | String |
| `maxCpuMillicores` | BigInt |
| `maxMemoryBytes` | BigInt |
| `memoryLimitBytes` | BigInt |
| `memoryPeakUtilization` | BigFloat |
| `memoryRequestBytes` | BigInt |
| `memoryRequestHeadroomBytes` | BigInt |
| `namespaceId` | UUID |
| `replicas` | Int |
| `resourceId` | UUID |
| `runtimeSeconds` | BigInt |
| `sampleCount` | Int |

**Required create fields:** `avgMemoryBytes`, `cpuLimitMillicores`, `cpuPeakUtilization`, `cpuRequestHeadroomMillicores`, `cpuRequestMillicores`, `date`, `gbSeconds`, `kind`, `maxCpuMillicores`, `maxMemoryBytes`, `memoryLimitBytes`, `memoryPeakUtilization`, `memoryRequestBytes`, `memoryRequestHeadroomBytes`, `namespaceId`, `replicas`, `resourceId`, `runtimeSeconds`, `sampleCount`

### `resources-health`

CRUD operations for ResourcesHealth records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourcesHealth records |
| `find-first` | Find first matching resourcesHealth record |
| `get` | Get a resourcesHealth by id |
| `create` | Create a new resourcesHealth |
| `update` | Update an existing resourcesHealth |
| `delete` | Delete a resourcesHealth |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `cpuLimitMillicores` | BigInt |
| `cpuRequestMillicores` | BigInt |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `errorCount` | Int |
| `id` | UUID |
| `imageRef` | String |
| `installationId` | UUID |
| `integrations` | String |
| `kind` | String |
| `labels` | JSON |
| `lastError` | String |
| `lastHeartbeatAt` | Datetime |
| `memoryLimitBytes` | BigInt |
| `memoryRequestBytes` | BigInt |
| `name` | String |
| `namespaceId` | UUID |
| `realm` | String |
| `replicas` | Int |
| `requiredConfigs` | ResourceRequirement |
| `requiredSecrets` | ResourceRequirement |
| `resourceDefinitionId` | UUID |
| `slug` | String |
| `spec` | JSON |
| `status` | String |
| `statusDetail` | String |
| `statusObserved` | JSON |
| `storageClass` | String |
| `storageSizeBytes` | BigInt |
| `storageTotalBytes` | BigInt |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `annotations`, `cpuLimitMillicores`, `cpuRequestMillicores`, `createdBy`, `createdByPrincipal`, `databaseId`, `errorCount`, `imageRef`, `installationId`, `integrations`, `kind`, `labels`, `lastError`, `lastHeartbeatAt`, `memoryLimitBytes`, `memoryRequestBytes`, `name`, `namespaceId`, `realm`, `replicas`, `requiredConfigs`, `requiredSecrets`, `resourceDefinitionId`, `slug`, `spec`, `status`, `statusDetail`, `statusObserved`, `storageClass`, `storageSizeBytes`, `storageTotalBytes`, `updatedBy`, `updatedByPrincipal`

### `resources-requirements-state`

CRUD operations for ResourcesRequirementsState records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourcesRequirementsState records |
| `find-first` | Find first matching resourcesRequirementsState record |
| `get` | Get a resourcesRequirementsState by id |
| `create` | Create a new resourcesRequirementsState |
| `update` | Update an existing resourcesRequirementsState |
| `delete` | Delete a resourcesRequirementsState |

**Fields:**

| Field | Type |
|-------|------|
| `configHash` | String |
| `configObjectName` | String |
| `requirementsHash` | String |
| `resourceId` | UUID |
| `secretsHash` | String |
| `secretsObjectName` | String |
| `slug` | String |

**Required create fields:** `configHash`, `configObjectName`, `requirementsHash`, `resourceId`, `secretsHash`, `secretsObjectName`, `slug`

### `resources-resolved-requirement`

CRUD operations for ResourcesResolvedRequirement records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourcesResolvedRequirement records |
| `find-first` | Find first matching resourcesResolvedRequirement record |
| `get` | Get a resourcesResolvedRequirement by id |
| `create` | Create a new resourcesResolvedRequirement |
| `update` | Update an existing resourcesResolvedRequirement |
| `delete` | Delete a resourcesResolvedRequirement |

**Fields:**

| Field | Type |
|-------|------|
| `atomId` | UUID |
| `configObjectName` | String |
| `name` | String |
| `namespaceId` | UUID |
| `present` | Boolean |
| `realm` | String |
| `required` | Boolean |
| `requirementKind` | String |
| `resourceId` | UUID |
| `secretsObjectName` | String |
| `slug` | String |

**Required create fields:** `atomId`, `configObjectName`, `name`, `namespaceId`, `present`, `realm`, `required`, `requirementKind`, `resourceId`, `secretsObjectName`, `slug`

### `webhook-endpoint`

CRUD operations for WebhookEndpoint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all webhookEndpoint records |
| `find-first` | Find first matching webhookEndpoint record |
| `get` | Get a webhookEndpoint by id |
| `create` | Create a new webhookEndpoint |
| `update` | Update an existing webhookEndpoint |
| `delete` | Delete a webhookEndpoint |

**Fields:**

| Field | Type |
|-------|------|
| `active` | Boolean |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `functionDefinitionId` | UUID |
| `host` | String |
| `id` | UUID |
| `namespaceId` | UUID |
| `path` | String |
| `provider` | String |
| `replayWindowSeconds` | Int |
| `signingSecretName` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `functionDefinitionId`, `host`, `namespaceId`, `path`, `signingSecretName`
**Optional create fields (backend defaults):** `active`, `createdBy`, `createdByPrincipal`, `provider`, `replayWindowSeconds`, `updatedBy`, `updatedByPrincipal`

### `webhook-event`

CRUD operations for WebhookEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all webhookEvent records |
| `find-first` | Find first matching webhookEvent record |
| `get` | Get a webhookEvent by id |
| `create` | Create a new webhookEvent |
| `update` | Update an existing webhookEvent |
| `delete` | Delete a webhookEvent |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `endpointId` | UUID |
| `error` | String |
| `externalEventId` | String |
| `id` | UUID |
| `invocationCreatedAt` | Datetime |
| `invocationId` | UUID |
| `payload` | JSON |
| `provider` | String |
| `providerTimestamp` | Datetime |
| `status` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `endpointId`, `externalEventId`, `provider`
**Optional create fields (backend defaults):** `error`, `invocationCreatedAt`, `invocationId`, `payload`, `providerTimestamp`, `status`

## Custom Operations

### `database-read-function-graph`

databaseReadFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--graphId` | UUID |

### `read-function-graph`

readFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--graphId` | UUID |

### `add-edge`

addEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.context` | String |
  | `--input.dstNode` | String |
  | `--input.dstPort` | String |
  | `--input.graphName` | String |
  | `--input.rootHash` | UUID |
  | `--input.scopeId` | UUID |
  | `--input.srcNode` | String |
  | `--input.srcPort` | String |

### `add-edge-and-save`

addEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.dstNode` | String |
  | `--input.dstPort` | String |
  | `--input.graphId` | UUID |
  | `--input.message` | String |
  | `--input.srcNode` | String |
  | `--input.srcPort` | String |

### `add-node`

addNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.context` | String |
  | `--input.graphName` | String |
  | `--input.meta` | JSON |
  | `--input.nodeName` | String |
  | `--input.nodeType` | String |
  | `--input.props` | JSON |
  | `--input.rootHash` | UUID |
  | `--input.scopeId` | UUID |

### `add-node-and-save`

addNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.message` | String |
  | `--input.meta` | JSON |
  | `--input.nodeName` | String |
  | `--input.nodeType` | String |
  | `--input.props` | JSON |

### `approve-node`

approveNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.approved` | Boolean |
  | `--input.clientMutationId` | String |
  | `--input.executionId` | UUID |
  | `--input.feedback` | JSON |
  | `--input.nodeName` | String |

### `copy-graph`

copyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.name` | String |
  | `--input.scopeId` | UUID |

### `database-add-edge`

databaseAddEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.context` | String |
  | `--input.databaseId` | UUID |
  | `--input.dstNode` | String |
  | `--input.dstPort` | String |
  | `--input.graphName` | String |
  | `--input.rootHash` | UUID |
  | `--input.srcNode` | String |
  | `--input.srcPort` | String |

### `database-add-edge-and-save`

databaseAddEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.dstNode` | String |
  | `--input.dstPort` | String |
  | `--input.graphId` | UUID |
  | `--input.message` | String |
  | `--input.srcNode` | String |
  | `--input.srcPort` | String |

### `database-add-node`

databaseAddNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.context` | String |
  | `--input.databaseId` | UUID |
  | `--input.graphName` | String |
  | `--input.meta` | JSON |
  | `--input.nodeName` | String |
  | `--input.nodeType` | String |
  | `--input.props` | JSON |
  | `--input.rootHash` | UUID |

### `database-add-node-and-save`

databaseAddNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.message` | String |
  | `--input.meta` | JSON |
  | `--input.nodeName` | String |
  | `--input.nodeType` | String |
  | `--input.props` | JSON |

### `database-approve-node`

databaseApproveNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.approved` | Boolean |
  | `--input.clientMutationId` | String |
  | `--input.executionId` | UUID |
  | `--input.feedback` | JSON |
  | `--input.nodeName` | String |

### `database-copy-graph`

databaseCopyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.graphId` | UUID |
  | `--input.name` | String |

### `database-create-function-graph`

databaseCreateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.context` | String |
  | `--input.createdBy` | UUID |
  | `--input.databaseId` | UUID |
  | `--input.definitionsCommitId` | UUID |
  | `--input.description` | String |
  | `--input.name` | String |

### `database-graph-init-empty-repo`

databaseGraphInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

### `database-graph-insert-node-at-path`

databaseGraphInsertNodeAtPath

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

### `database-graph-insert-nodes-at-paths`

databaseGraphInsertNodesAtPaths

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

### `database-graph-set-and-commit`

databaseGraphSetAndCommit

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

### `database-graph-set-data-at-path`

databaseGraphSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.data` | JSON |
  | `--input.path` | String |
  | `--input.root` | UUID |
  | `--input.sId` | UUID |

### `database-graph-set-many-and-commit`

databaseGraphSetManyAndCommit

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

### `database-import-definitions`

databaseImportDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.contexts` | String |
  | `--input.graphId` | UUID |
  | `--input.sourceCommitId` | UUID |
  | `--input.sourceScopeId` | UUID |

### `database-import-graph-json`

databaseImportGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.context` | String |
  | `--input.createdBy` | UUID |
  | `--input.databaseId` | UUID |
  | `--input.definitionsCommitId` | UUID |
  | `--input.description` | String |
  | `--input.graphJson` | JSON |
  | `--input.name` | String |

### `database-save-graph`

databaseSaveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.message` | String |
  | `--input.rootHash` | UUID |

### `database-start-execution`

databaseStartExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.inputPayload` | JSON |
  | `--input.maxPendingJobs` | Int |
  | `--input.maxTicks` | Int |
  | `--input.outputNames` | String |
  | `--input.outputNode` | String |
  | `--input.outputPort` | String |
  | `--input.parentExecutionId` | UUID |
  | `--input.parentNodeName` | String |
  | `--input.timeoutInterval` | IntervalInput |

### `database-validate-function-graph`

databaseValidateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |

### `function-execution-logs-append`

functionExecutionLogsAppend

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.createdAt` | Datetime |
  | `--input.invocationId` | UUID |
  | `--input.logLevel` | String |
  | `--input.message` | String |
  | `--input.metadata` | JSON |
  | `--input.taskIdentifier` | String |

### `function-invocations-create-page`

functionInvocationsCreatePage

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.payload` | JSON |
  | `--input.provenance` | JSON |
  | `--input.routeBindingId` | UUID |
  | `--input.taskIdentifier` | String |

### `function-invocations-create-sync`

functionInvocationsCreateSync

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.payload` | JSON |
  | `--input.provenance` | JSON |
  | `--input.routeBindingId` | UUID |
  | `--input.taskIdentifier` | String |

### `import-definitions`

importDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.contexts` | String |
  | `--input.graphId` | UUID |
  | `--input.sourceCommitId` | UUID |
  | `--input.sourceScopeId` | UUID |

### `import-graph-json`

importGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.context` | String |
  | `--input.createdBy` | UUID |
  | `--input.definitionsCommitId` | UUID |
  | `--input.description` | String |
  | `--input.graphJson` | JSON |
  | `--input.name` | String |
  | `--input.scopeId` | UUID |

### `infra-init-empty-repo`

infraInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

### `infra-insert-node-at-path`

infraInsertNodeAtPath

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

### `infra-insert-nodes-at-paths`

infraInsertNodesAtPaths

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

### `infra-set-and-commit`

infraSetAndCommit

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

### `infra-set-data-at-path`

infraSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.data` | JSON |
  | `--input.path` | String |
  | `--input.root` | UUID |
  | `--input.sId` | UUID |

### `infra-set-many-and-commit`

infraSetManyAndCommit

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

### `platform-function-execution-logs-append`

platformFunctionExecutionLogsAppend

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.createdAt` | Datetime |
  | `--input.invocationId` | UUID |
  | `--input.logLevel` | String |
  | `--input.message` | String |
  | `--input.metadata` | JSON |
  | `--input.taskIdentifier` | String |

### `platform-function-invocations-create-page`

platformFunctionInvocationsCreatePage

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.payload` | JSON |
  | `--input.provenance` | JSON |
  | `--input.routeBindingId` | UUID |
  | `--input.taskIdentifier` | String |

### `platform-function-invocations-create-sync`

platformFunctionInvocationsCreateSync

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.payload` | JSON |
  | `--input.provenance` | JSON |
  | `--input.routeBindingId` | UUID |
  | `--input.taskIdentifier` | String |

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

### `platform-resource-installations-install`

platformResourceInstallationsInstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.definitionIds` | UUID |
  | `--input.name` | String |
  | `--input.namespaceId` | UUID |
  | `--input.newParams` | JSON |
  | `--input.slug` | String |

### `platform-resource-installations-rollback`

platformResourceInstallationsRollback

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.commitId` | UUID |
  | `--input.targetInstallationId` | UUID |

### `platform-resource-installations-uninstall`

platformResourceInstallationsUninstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.targetInstallationId` | UUID |

### `platform-resource-installations-upgrade`

platformResourceInstallationsUpgrade

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.newParams` | JSON |
  | `--input.targetInstallationId` | UUID |

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

### `resource-installations-install`

resourceInstallationsInstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.definitionIds` | UUID |
  | `--input.name` | String |
  | `--input.namespaceId` | UUID |
  | `--input.newParams` | JSON |
  | `--input.slug` | String |

### `resource-installations-rollback`

resourceInstallationsRollback

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.commitId` | UUID |
  | `--input.targetInstallationId` | UUID |

### `resource-installations-uninstall`

resourceInstallationsUninstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.targetInstallationId` | UUID |

### `resource-installations-upgrade`

resourceInstallationsUpgrade

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.newParams` | JSON |
  | `--input.targetInstallationId` | UUID |

### `save-graph`

saveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.message` | String |
  | `--input.rootHash` | UUID |

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

### `start-execution`

startExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.inputPayload` | JSON |
  | `--input.maxPendingJobs` | Int |
  | `--input.maxTicks` | Int |
  | `--input.outputNames` | String |
  | `--input.outputNode` | String |
  | `--input.outputPort` | String |
  | `--input.parentExecutionId` | UUID |
  | `--input.parentNodeName` | String |
  | `--input.timeoutInterval` | IntervalInput |

### `validate-function-graph`

validateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |

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
