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
| `agent` | agent CRUD operations |
| `agent-event` | agentEvent CRUD operations |
| `agent-message` | agentMessage CRUD operations |
| `agent-persona` | agentPersona CRUD operations |
| `agent-plan` | agentPlan CRUD operations |
| `agent-prompt` | agentPrompt CRUD operations |
| `agent-resource-chunk` | agentResourceChunk CRUD operations |
| `agent-resource` | agentResource CRUD operations |
| `agent-run` | agentRun CRUD operations |
| `agent-run-workspace` | agentRunWorkspace CRUD operations |
| `agent-task` | agentTask CRUD operations |
| `agent-thread` | agentThread CRUD operations |
| `platform-agent` | platformAgent CRUD operations |
| `platform-agent-event` | platformAgentEvent CRUD operations |
| `platform-agent-message` | platformAgentMessage CRUD operations |
| `platform-agent-persona` | platformAgentPersona CRUD operations |
| `platform-agent-plan` | platformAgentPlan CRUD operations |
| `platform-agent-prompt` | platformAgentPrompt CRUD operations |
| `platform-agent-resource-chunk` | platformAgentResourceChunk CRUD operations |
| `platform-agent-resource` | platformAgentResource CRUD operations |
| `platform-agent-run` | platformAgentRun CRUD operations |
| `platform-agent-run-workspace` | platformAgentRunWorkspace CRUD operations |
| `platform-agent-task` | platformAgentTask CRUD operations |
| `platform-agent-thread` | platformAgentThread CRUD operations |
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

### `agent`

CRUD operations for Agent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agent records |
| `find-first` | Find first matching agent record |
| `get` | Get a agent by id |
| `create` | Create a new agent |
| `update` | Update an existing agent |
| `delete` | Delete a agent |

**Fields:**

| Field | Type |
|-------|------|
| `config` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `isEphemeral` | Boolean |
| `name` | String |
| `ownerId` | UUID |
| `parentId` | UUID |
| `personaId` | UUID |
| `status` | String |
| `systemPrompt` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `config`, `isEphemeral`, `ownerId`, `parentId`, `personaId`, `status`, `systemPrompt`

### `agent-event`

CRUD operations for AgentEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentEvent records |
| `find-first` | Find first matching agentEvent record |
| `get` | Get a agentEvent by id |
| `create` | Create a new agentEvent |
| `update` | Update an existing agentEvent |
| `delete` | Delete a agentEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `entry` | JSON |
| `id` | UUID |
| `recordedAt` | Datetime |
| `runId` | UUID |
| `seq` | Int |
| `transcriptFormat` | String |
| `transcriptVersion` | Int |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `entry`, `recordedAt`, `runId`, `seq`, `transcriptVersion`
**Optional create fields (backend defaults):** `transcriptFormat`

### `agent-message`

CRUD operations for AgentMessage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentMessage records |
| `find-first` | Find first matching agentMessage record |
| `get` | Get a agentMessage by id |
| `create` | Create a new agentMessage |
| `update` | Update an existing agentMessage |
| `delete` | Delete a agentMessage |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `agentId` | UUID |
| `authorRole` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `deliveredRunId` | UUID |
| `id` | UUID |
| `kind` | String |
| `model` | String |
| `parts` | JSON |
| `threadId` | UUID |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `authorRole`, `threadId`
**Optional create fields (backend defaults):** `actorId`, `agentId`, `deliveredRunId`, `kind`, `model`, `parts`

### `agent-persona`

CRUD operations for AgentPersona records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentPersona records |
| `find-first` | Find first matching agentPersona record |
| `get` | Get a agentPersona by id |
| `create` | Create a new agentPersona |
| `update` | Update an existing agentPersona |
| `delete` | Delete a agentPersona |

**Fields:**

| Field | Type |
|-------|------|
| `config` | JSON |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `resources` | String |
| `slug` | String |
| `systemPrompt` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `name`, `slug`
**Optional create fields (backend defaults):** `config`, `createdBy`, `createdByPrincipal`, `description`, `isActive`, `resources`, `systemPrompt`, `updatedBy`, `updatedByPrincipal`

### `agent-plan`

CRUD operations for AgentPlan records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentPlan records |
| `find-first` | Find first matching agentPlan record |
| `get` | Get a agentPlan by id |
| `create` | Create a new agentPlan |
| `update` | Update an existing agentPlan |
| `delete` | Delete a agentPlan |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `ownerId` | UUID |
| `status` | String |
| `threadId` | UUID |
| `title` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `threadId`, `title`
**Optional create fields (backend defaults):** `description`, `ownerId`, `status`

### `agent-prompt`

CRUD operations for AgentPrompt records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentPrompt records |
| `find-first` | Find first matching agentPrompt record |
| `get` | Get a agentPrompt by id |
| `create` | Create a new agentPrompt |
| `update` | Update an existing agentPrompt |
| `delete` | Delete a agentPrompt |

**Fields:**

| Field | Type |
|-------|------|
| `content` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `isDefault` | Boolean |
| `metadata` | JSON |
| `name` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `content`, `databaseId`, `name`
**Optional create fields (backend defaults):** `createdBy`, `createdByPrincipal`, `description`, `isDefault`, `metadata`, `updatedBy`, `updatedByPrincipal`

### `agent-resource-chunk`

CRUD operations for AgentResourceChunk records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentResourceChunk records |
| `find-first` | Find first matching agentResourceChunk record |
| `search <query>` | Search agentResourceChunk records |
| `get` | Get a agentResourceChunk by id |
| `create` | Create a new agentResourceChunk |
| `update` | Update an existing agentResourceChunk |
| `delete` | Delete a agentResourceChunk |

**Fields:**

| Field | Type |
|-------|------|
| `agentResourceId` | UUID |
| `body` | String |
| `chunkIndex` | Int |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `embedding` | Vector |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `metadata` | JSON |
| `searchScore` | Float |
| `updatedAt` | Datetime |

**Required create fields:** `agentResourceId`, `body`
**Optional create fields (backend defaults):** `chunkIndex`, `databaseId`, `embedding`, `metadata`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `searchScore`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk agent-resource-chunk list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk agent-resource-chunk search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk agent-resource-chunk list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk agent-resource-chunk create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk agent-resource-chunk update --embedding "new text to embed" --auto-embed
```

*Search with pagination and field projection:*
```bash
csdk agent-resource-chunk list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk agent-resource-chunk search "query" --limit 10 --select id,title,searchScore
```


### `agent-resource`

CRUD operations for AgentResource records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentResource records |
| `find-first` | Find first matching agentResource record |
| `search <query>` | Search agentResource records |
| `get` | Get a agentResource by id |
| `create` | Create a new agentResource |
| `update` | Update an existing agentResource |
| `delete` | Delete a agentResource |

**Fields:**

| Field | Type |
|-------|------|
| `archivedAt` | Datetime |
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `description` | String |
| `descriptionTrgmSimilarity` | Float |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `isActive` | Boolean |
| `isArchived` | Boolean |
| `keywords` | String |
| `kind` | String |
| `kindTrgmSimilarity` | Float |
| `metadata` | JSON |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `slug` | String |
| `title` | String |
| `titleTrgmSimilarity` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `body`, `databaseId`, `slug`, `title`
**Optional create fields (backend defaults):** `archivedAt`, `createdBy`, `createdByPrincipal`, `description`, `embedding`, `isActive`, `isArchived`, `keywords`, `kind`, `metadata`, `updatedBy`, `updatedByPrincipal`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `bodyTrgmSimilarity`, `descriptionTrgmSimilarity`, `kindTrgmSimilarity`, `search`, `searchScore`, `titleTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk agent-resource list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk agent-resource search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk agent-resource list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk agent-resource create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk agent-resource update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk agent-resource list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmDescription`):*
```bash
csdk agent-resource list --where.trgmDescription.value "approximate query" --where.trgmDescription.threshold 0.3 --select title,descriptionTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmKind`):*
```bash
csdk agent-resource list --where.trgmKind.value "approximate query" --where.trgmKind.threshold 0.3 --select title,kindTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk agent-resource list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmTitle`):*
```bash
csdk agent-resource list --where.trgmTitle.value "approximate query" --where.trgmTitle.threshold 0.3 --select title,titleTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk agent-resource list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,descriptionTrgmSimilarity,kindTrgmSimilarity,tsvRank,searchScore,titleTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk agent-resource list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk agent-resource search "query" --limit 10 --select id,title,searchScore
```


### `agent-run`

CRUD operations for AgentRun records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentRun records |
| `find-first` | Find first matching agentRun record |
| `get` | Get a agentRun by id |
| `create` | Create a new agentRun |
| `update` | Update an existing agentRun |
| `delete` | Delete a agentRun |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `artifacts` | JSON |
| `attempt` | Int |
| `baseCommit` | String |
| `branch` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `deadlineAt` | Datetime |
| `entityId` | UUID |
| `error` | String |
| `executionId` | UUID |
| `finishedAt` | Datetime |
| `headCommit` | String |
| `id` | UUID |
| `lastEventSeq` | Int |
| `parentRunId` | UUID |
| `placement` | String |
| `principalId` | UUID |
| `repoUrl` | String |
| `startedAt` | Datetime |
| `status` | String |
| `threadId` | UUID |
| `tokenUsage` | JSON |
| `totalCost` | BigFloat |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `threadId`
**Optional create fields (backend defaults):** `actorId`, `artifacts`, `attempt`, `baseCommit`, `branch`, `deadlineAt`, `entityId`, `error`, `executionId`, `finishedAt`, `headCommit`, `lastEventSeq`, `parentRunId`, `placement`, `principalId`, `repoUrl`, `startedAt`, `status`, `tokenUsage`, `totalCost`

### `agent-run-workspace`

CRUD operations for AgentRunWorkspace records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentRunWorkspace records |
| `find-first` | Find first matching agentRunWorkspace record |
| `get` | Get a agentRunWorkspace by id |
| `create` | Create a new agentRunWorkspace |
| `update` | Update an existing agentRunWorkspace |
| `delete` | Delete a agentRunWorkspace |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `artifacts` | JSON |
| `baseBranch` | String |
| `baseCommit` | String |
| `branch` | String |
| `clonedAt` | Datetime |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `headCommit` | String |
| `id` | UUID |
| `lastUsedAt` | Datetime |
| `ordinal` | Int |
| `provider` | String |
| `publication` | String |
| `repo` | String |
| `repositoryId` | UUID |
| `runId` | UUID |
| `state` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `baseBranch`, `branch`, `provider`, `repo`, `runId`
**Optional create fields (backend defaults):** `artifacts`, `baseCommit`, `clonedAt`, `headCommit`, `lastUsedAt`, `ordinal`, `publication`, `repositoryId`, `state`

### `agent-task`

CRUD operations for AgentTask records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentTask records |
| `find-first` | Find first matching agentTask record |
| `get` | Get a agentTask by id |
| `create` | Create a new agentTask |
| `update` | Update an existing agentTask |
| `delete` | Delete a agentTask |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `approvalFeedback` | String |
| `approvalStatus` | String |
| `approvedAt` | Datetime |
| `approvedBy` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `error` | String |
| `id` | UUID |
| `orderIndex` | Int |
| `planId` | UUID |
| `requiresApproval` | Boolean |
| `source` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `description`, `planId`
**Optional create fields (backend defaults):** `actorId`, `approvalFeedback`, `approvalStatus`, `approvedAt`, `approvedBy`, `error`, `orderIndex`, `requiresApproval`, `source`, `status`

### `agent-thread`

CRUD operations for AgentThread records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentThread records |
| `find-first` | Find first matching agentThread record |
| `get` | Get a agentThread by id |
| `create` | Create a new agentThread |
| `update` | Update an existing agentThread |
| `delete` | Delete a agentThread |

**Fields:**

| Field | Type |
|-------|------|
| `agentId` | UUID |
| `archivedAt` | Datetime |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `isArchived` | Boolean |
| `mode` | String |
| `model` | String |
| `ownerId` | UUID |
| `parentThreadId` | UUID |
| `promptTemplateId` | UUID |
| `status` | String |
| `systemPrompt` | String |
| `tags` | String |
| `title` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `agentId`, `archivedAt`, `isArchived`, `mode`, `model`, `ownerId`, `parentThreadId`, `promptTemplateId`, `status`, `systemPrompt`, `tags`, `title`, `visibility`

### `platform-agent`

CRUD operations for PlatformAgent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgent records |
| `find-first` | Find first matching platformAgent record |
| `get` | Get a platformAgent by id |
| `create` | Create a new platformAgent |
| `update` | Update an existing platformAgent |
| `delete` | Delete a platformAgent |

**Fields:**

| Field | Type |
|-------|------|
| `config` | JSON |
| `createdAt` | Datetime |
| `id` | UUID |
| `isEphemeral` | Boolean |
| `name` | String |
| `ownerId` | UUID |
| `parentId` | UUID |
| `personaId` | UUID |
| `status` | String |
| `systemPrompt` | String |
| `updatedAt` | Datetime |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `config`, `isEphemeral`, `ownerId`, `parentId`, `personaId`, `status`, `systemPrompt`

### `platform-agent-event`

CRUD operations for PlatformAgentEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentEvent records |
| `find-first` | Find first matching platformAgentEvent record |
| `get` | Get a platformAgentEvent by id |
| `create` | Create a new platformAgentEvent |
| `update` | Update an existing platformAgentEvent |
| `delete` | Delete a platformAgentEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `entry` | JSON |
| `id` | UUID |
| `recordedAt` | Datetime |
| `runId` | UUID |
| `seq` | Int |
| `transcriptFormat` | String |
| `transcriptVersion` | Int |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `entry`, `recordedAt`, `runId`, `seq`, `transcriptVersion`
**Optional create fields (backend defaults):** `transcriptFormat`

### `platform-agent-message`

CRUD operations for PlatformAgentMessage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentMessage records |
| `find-first` | Find first matching platformAgentMessage record |
| `get` | Get a platformAgentMessage by id |
| `create` | Create a new platformAgentMessage |
| `update` | Update an existing platformAgentMessage |
| `delete` | Delete a platformAgentMessage |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `agentId` | UUID |
| `authorRole` | String |
| `createdAt` | Datetime |
| `deliveredRunId` | UUID |
| `id` | UUID |
| `kind` | String |
| `model` | String |
| `parts` | JSON |
| `threadId` | UUID |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `authorRole`, `threadId`
**Optional create fields (backend defaults):** `actorId`, `agentId`, `deliveredRunId`, `kind`, `model`, `parts`

### `platform-agent-persona`

CRUD operations for PlatformAgentPersona records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentPersona records |
| `find-first` | Find first matching platformAgentPersona record |
| `get` | Get a platformAgentPersona by id |
| `create` | Create a new platformAgentPersona |
| `update` | Update an existing platformAgentPersona |
| `delete` | Delete a platformAgentPersona |

**Fields:**

| Field | Type |
|-------|------|
| `config` | JSON |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `description` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `resources` | String |
| `slug` | String |
| `systemPrompt` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `name`, `slug`
**Optional create fields (backend defaults):** `config`, `createdBy`, `createdByPrincipal`, `description`, `isActive`, `resources`, `systemPrompt`, `updatedBy`, `updatedByPrincipal`

### `platform-agent-plan`

CRUD operations for PlatformAgentPlan records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentPlan records |
| `find-first` | Find first matching platformAgentPlan record |
| `get` | Get a platformAgentPlan by id |
| `create` | Create a new platformAgentPlan |
| `update` | Update an existing platformAgentPlan |
| `delete` | Delete a platformAgentPlan |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `description` | String |
| `id` | UUID |
| `ownerId` | UUID |
| `status` | String |
| `threadId` | UUID |
| `title` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `threadId`, `title`
**Optional create fields (backend defaults):** `description`, `ownerId`, `status`

### `platform-agent-prompt`

CRUD operations for PlatformAgentPrompt records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentPrompt records |
| `find-first` | Find first matching platformAgentPrompt record |
| `get` | Get a platformAgentPrompt by id |
| `create` | Create a new platformAgentPrompt |
| `update` | Update an existing platformAgentPrompt |
| `delete` | Delete a platformAgentPrompt |

**Fields:**

| Field | Type |
|-------|------|
| `content` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `description` | String |
| `id` | UUID |
| `isDefault` | Boolean |
| `metadata` | JSON |
| `name` | String |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `content`, `name`
**Optional create fields (backend defaults):** `createdBy`, `createdByPrincipal`, `description`, `isDefault`, `metadata`, `updatedBy`, `updatedByPrincipal`

### `platform-agent-resource-chunk`

CRUD operations for PlatformAgentResourceChunk records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentResourceChunk records |
| `find-first` | Find first matching platformAgentResourceChunk record |
| `search <query>` | Search platformAgentResourceChunk records |
| `get` | Get a platformAgentResourceChunk by id |
| `create` | Create a new platformAgentResourceChunk |
| `update` | Update an existing platformAgentResourceChunk |
| `delete` | Delete a platformAgentResourceChunk |

**Fields:**

| Field | Type |
|-------|------|
| `body` | String |
| `chunkIndex` | Int |
| `createdAt` | Datetime |
| `embedding` | Vector |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `metadata` | JSON |
| `platformAgentResourceId` | UUID |
| `searchScore` | Float |
| `updatedAt` | Datetime |

**Required create fields:** `body`, `platformAgentResourceId`
**Optional create fields (backend defaults):** `chunkIndex`, `embedding`, `metadata`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `searchScore`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk platform-agent-resource-chunk list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource-chunk search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource-chunk list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource-chunk create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource-chunk update --embedding "new text to embed" --auto-embed
```

*Search with pagination and field projection:*
```bash
csdk platform-agent-resource-chunk list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk platform-agent-resource-chunk search "query" --limit 10 --select id,title,searchScore
```


### `platform-agent-resource`

CRUD operations for PlatformAgentResource records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentResource records |
| `find-first` | Find first matching platformAgentResource record |
| `search <query>` | Search platformAgentResource records |
| `get` | Get a platformAgentResource by id |
| `create` | Create a new platformAgentResource |
| `update` | Update an existing platformAgentResource |
| `delete` | Delete a platformAgentResource |

**Fields:**

| Field | Type |
|-------|------|
| `archivedAt` | Datetime |
| `body` | String |
| `bodyTrgmSimilarity` | Float |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `createdByPrincipal` | UUID |
| `description` | String |
| `descriptionTrgmSimilarity` | Float |
| `embedding` | Vector |
| `embeddingUpdatedAt` | Datetime |
| `embeddingVectorDistance` | Float |
| `id` | UUID |
| `isActive` | Boolean |
| `isArchived` | Boolean |
| `keywords` | String |
| `kind` | String |
| `kindTrgmSimilarity` | Float |
| `metadata` | JSON |
| `search` | FullText |
| `searchScore` | Float |
| `searchTsvRank` | Float |
| `slug` | String |
| `title` | String |
| `titleTrgmSimilarity` | Float |
| `updatedAt` | Datetime |
| `updatedBy` | UUID |
| `updatedByPrincipal` | UUID |

**Required create fields:** `body`, `slug`, `title`
**Optional create fields (backend defaults):** `archivedAt`, `createdBy`, `createdByPrincipal`, `description`, `embedding`, `isActive`, `isArchived`, `keywords`, `kind`, `metadata`, `updatedBy`, `updatedByPrincipal`
> **pgvector embedding fields:** `embedding`
> High-dimensional vector columns for semantic similarity search. Query via the Unified Search API pgvector adapter using cosine, L2, or inner-product distance. Supports chunk-aware search: set `includeChunks: true` in VectorNearbyInput to transparently query across parent and chunk embeddings, returning the minimum distance.

> **Unified Search API fields:** `bodyTrgmSimilarity`, `descriptionTrgmSimilarity`, `kindTrgmSimilarity`, `search`, `searchScore`, `titleTrgmSimilarity`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Vector similarity search via `embedding` (manual vector):*
```bash
# Pass a pre-computed vector array via dot-notation
csdk platform-agent-resource list --where.embedding.vector '[0.1,0.2,0.3]' --where.embedding.distance 1.0 --select title,embeddingVectorDistance
```

*Vector semantic search via `embedding` with --auto-embed:*
```bash
# --auto-embed converts text to vectors using the configured embedder (e.g. Ollama nomic-embed-text)
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource search "semantic query" --auto-embed --select title,embeddingVectorDistance
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource list --where.embedding.vector "semantic query" --auto-embed --select title,embeddingVectorDistance
```

*Create/update with auto-embedded `embedding` via --auto-embed:*
```bash
# --auto-embed on create/update converts text strings in vector fields to embeddings before saving
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource create --embedding "text to embed" --auto-embed
EMBEDDER_PROVIDER=ollama csdk platform-agent-resource update --embedding "new text to embed" --auto-embed
```

*Fuzzy search via trigram similarity (`trgmBody`):*
```bash
csdk platform-agent-resource list --where.trgmBody.value "approximate query" --where.trgmBody.threshold 0.3 --select title,bodyTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmDescription`):*
```bash
csdk platform-agent-resource list --where.trgmDescription.value "approximate query" --where.trgmDescription.threshold 0.3 --select title,descriptionTrgmSimilarity
```

*Fuzzy search via trigram similarity (`trgmKind`):*
```bash
csdk platform-agent-resource list --where.trgmKind.value "approximate query" --where.trgmKind.threshold 0.3 --select title,kindTrgmSimilarity
```

*Full-text search via tsvector (`search`):*
```bash
csdk platform-agent-resource list --where.search "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmTitle`):*
```bash
csdk platform-agent-resource list --where.trgmTitle.value "approximate query" --where.trgmTitle.threshold 0.3 --select title,titleTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
csdk platform-agent-resource list --where.unifiedSearch "search query" --select title,bodyTrgmSimilarity,descriptionTrgmSimilarity,kindTrgmSimilarity,tsvRank,searchScore,titleTrgmSimilarity
```

*Search with pagination and field projection:*
```bash
csdk platform-agent-resource list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
csdk platform-agent-resource search "query" --limit 10 --select id,title,searchScore
```


### `platform-agent-run`

CRUD operations for PlatformAgentRun records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentRun records |
| `find-first` | Find first matching platformAgentRun record |
| `get` | Get a platformAgentRun by id |
| `create` | Create a new platformAgentRun |
| `update` | Update an existing platformAgentRun |
| `delete` | Delete a platformAgentRun |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `artifacts` | JSON |
| `attempt` | Int |
| `baseCommit` | String |
| `branch` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `deadlineAt` | Datetime |
| `entityId` | UUID |
| `error` | String |
| `executionId` | UUID |
| `finishedAt` | Datetime |
| `headCommit` | String |
| `id` | UUID |
| `lastEventSeq` | Int |
| `parentRunId` | UUID |
| `placement` | String |
| `principalId` | UUID |
| `repoUrl` | String |
| `startedAt` | Datetime |
| `status` | String |
| `threadId` | UUID |
| `tokenUsage` | JSON |
| `totalCost` | BigFloat |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `threadId`
**Optional create fields (backend defaults):** `actorId`, `artifacts`, `attempt`, `baseCommit`, `branch`, `databaseId`, `deadlineAt`, `entityId`, `error`, `executionId`, `finishedAt`, `headCommit`, `lastEventSeq`, `parentRunId`, `placement`, `principalId`, `repoUrl`, `startedAt`, `status`, `tokenUsage`, `totalCost`

### `platform-agent-run-workspace`

CRUD operations for PlatformAgentRunWorkspace records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentRunWorkspace records |
| `find-first` | Find first matching platformAgentRunWorkspace record |
| `get` | Get a platformAgentRunWorkspace by id |
| `create` | Create a new platformAgentRunWorkspace |
| `update` | Update an existing platformAgentRunWorkspace |
| `delete` | Delete a platformAgentRunWorkspace |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `artifacts` | JSON |
| `baseBranch` | String |
| `baseCommit` | String |
| `branch` | String |
| `clonedAt` | Datetime |
| `createdAt` | Datetime |
| `headCommit` | String |
| `id` | UUID |
| `lastUsedAt` | Datetime |
| `ordinal` | Int |
| `provider` | String |
| `publication` | String |
| `repo` | String |
| `repositoryId` | UUID |
| `runId` | UUID |
| `state` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `baseBranch`, `branch`, `provider`, `repo`, `runId`
**Optional create fields (backend defaults):** `artifacts`, `baseCommit`, `clonedAt`, `headCommit`, `lastUsedAt`, `ordinal`, `publication`, `repositoryId`, `state`

### `platform-agent-task`

CRUD operations for PlatformAgentTask records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentTask records |
| `find-first` | Find first matching platformAgentTask record |
| `get` | Get a platformAgentTask by id |
| `create` | Create a new platformAgentTask |
| `update` | Update an existing platformAgentTask |
| `delete` | Delete a platformAgentTask |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `approvalFeedback` | String |
| `approvalStatus` | String |
| `approvedAt` | Datetime |
| `approvedBy` | UUID |
| `createdAt` | Datetime |
| `description` | String |
| `error` | String |
| `id` | UUID |
| `orderIndex` | Int |
| `planId` | UUID |
| `requiresApproval` | Boolean |
| `source` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Required create fields:** `description`, `planId`
**Optional create fields (backend defaults):** `actorId`, `approvalFeedback`, `approvalStatus`, `approvedAt`, `approvedBy`, `error`, `orderIndex`, `requiresApproval`, `source`, `status`

### `platform-agent-thread`

CRUD operations for PlatformAgentThread records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformAgentThread records |
| `find-first` | Find first matching platformAgentThread record |
| `get` | Get a platformAgentThread by id |
| `create` | Create a new platformAgentThread |
| `update` | Update an existing platformAgentThread |
| `delete` | Delete a platformAgentThread |

**Fields:**

| Field | Type |
|-------|------|
| `agentId` | UUID |
| `archivedAt` | Datetime |
| `createdAt` | Datetime |
| `id` | UUID |
| `isArchived` | Boolean |
| `mode` | String |
| `model` | String |
| `ownerId` | UUID |
| `parentThreadId` | UUID |
| `promptTemplateId` | UUID |
| `status` | String |
| `systemPrompt` | String |
| `tags` | String |
| `title` | String |
| `updatedAt` | Datetime |
| `visibility` | String |

**Optional create fields (backend defaults):** `agentId`, `archivedAt`, `isArchived`, `mode`, `model`, `ownerId`, `parentThreadId`, `promptTemplateId`, `status`, `systemPrompt`, `tags`, `title`, `visibility`

## Custom Operations

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
