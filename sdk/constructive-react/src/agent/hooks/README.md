# React Query Hooks

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from './hooks';

configure({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Hooks

| Hook | Type | Description |
|------|------|-------------|
| `useAgentsQuery` | Query | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useAgentQuery` | Query | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useCreateAgentMutation` | Mutation | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useUpdateAgentMutation` | Mutation | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useDeleteAgentMutation` | Mutation | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useAgentEventsQuery` | Query | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useAgentEventQuery` | Query | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useCreateAgentEventMutation` | Mutation | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useUpdateAgentEventMutation` | Mutation | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useDeleteAgentEventMutation` | Mutation | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useAgentMessagesQuery` | Query | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useAgentMessageQuery` | Query | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useCreateAgentMessageMutation` | Mutation | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useUpdateAgentMessageMutation` | Mutation | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useDeleteAgentMessageMutation` | Mutation | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useAgentPersonasQuery` | Query | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useAgentPersonaQuery` | Query | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useCreateAgentPersonaMutation` | Mutation | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useUpdateAgentPersonaMutation` | Mutation | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useDeleteAgentPersonaMutation` | Mutation | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useAgentPlansQuery` | Query | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useAgentPlanQuery` | Query | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useCreateAgentPlanMutation` | Mutation | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useUpdateAgentPlanMutation` | Mutation | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useDeleteAgentPlanMutation` | Mutation | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useAgentPromptsQuery` | Query | Shared system prompt templates for agent conversations |
| `useAgentPromptQuery` | Query | Shared system prompt templates for agent conversations |
| `useCreateAgentPromptMutation` | Mutation | Shared system prompt templates for agent conversations |
| `useUpdateAgentPromptMutation` | Mutation | Shared system prompt templates for agent conversations |
| `useDeleteAgentPromptMutation` | Mutation | Shared system prompt templates for agent conversations |
| `useAgentResourceChunksQuery` | Query | List all agentResourceChunks |
| `useAgentResourceChunkQuery` | Query | Get one agentResourceChunk |
| `useCreateAgentResourceChunkMutation` | Mutation | Create a agentResourceChunk |
| `useUpdateAgentResourceChunkMutation` | Mutation | Update a agentResourceChunk |
| `useDeleteAgentResourceChunkMutation` | Mutation | Delete a agentResourceChunk |
| `useAgentResourcesQuery` | Query | Unified skills and knowledge resources for agent retrieval |
| `useAgentResourceQuery` | Query | Unified skills and knowledge resources for agent retrieval |
| `useCreateAgentResourceMutation` | Mutation | Unified skills and knowledge resources for agent retrieval |
| `useUpdateAgentResourceMutation` | Mutation | Unified skills and knowledge resources for agent retrieval |
| `useDeleteAgentResourceMutation` | Mutation | Unified skills and knowledge resources for agent retrieval |
| `useAgentRunsQuery` | Query | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useAgentRunQuery` | Query | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useCreateAgentRunMutation` | Mutation | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useUpdateAgentRunMutation` | Mutation | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useDeleteAgentRunMutation` | Mutation | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useAgentRunWorkspacesQuery` | Query | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useAgentRunWorkspaceQuery` | Query | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useCreateAgentRunWorkspaceMutation` | Mutation | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useUpdateAgentRunWorkspaceMutation` | Mutation | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useDeleteAgentRunWorkspaceMutation` | Mutation | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useAgentTasksQuery` | Query | Task within a plan, with ordering and optional approval gates |
| `useAgentTaskQuery` | Query | Task within a plan, with ordering and optional approval gates |
| `useCreateAgentTaskMutation` | Mutation | Task within a plan, with ordering and optional approval gates |
| `useUpdateAgentTaskMutation` | Mutation | Task within a plan, with ordering and optional approval gates |
| `useDeleteAgentTaskMutation` | Mutation | Task within a plan, with ordering and optional approval gates |
| `useAgentThreadsQuery` | Query | Top-level AI/LLM conversation thread |
| `useAgentThreadQuery` | Query | Top-level AI/LLM conversation thread |
| `useCreateAgentThreadMutation` | Mutation | Top-level AI/LLM conversation thread |
| `useUpdateAgentThreadMutation` | Mutation | Top-level AI/LLM conversation thread |
| `useDeleteAgentThreadMutation` | Mutation | Top-level AI/LLM conversation thread |
| `usePlatformAgentsQuery` | Query | Agent instance registry (human-managed or ephemeral sub-agents) |
| `usePlatformAgentQuery` | Query | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useCreatePlatformAgentMutation` | Mutation | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useUpdatePlatformAgentMutation` | Mutation | Agent instance registry (human-managed or ephemeral sub-agents) |
| `useDeletePlatformAgentMutation` | Mutation | Agent instance registry (human-managed or ephemeral sub-agents) |
| `usePlatformAgentEventsQuery` | Query | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `usePlatformAgentEventQuery` | Query | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useCreatePlatformAgentEventMutation` | Mutation | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useUpdatePlatformAgentEventMutation` | Mutation | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `useDeletePlatformAgentEventMutation` | Mutation | Append-only transcript of an agent run: one agent session entry per row, stored verbatim |
| `usePlatformAgentMessagesQuery` | Query | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `usePlatformAgentMessageQuery` | Query | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useCreatePlatformAgentMessageMutation` | Mutation | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useUpdatePlatformAgentMessageMutation` | Mutation | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `useDeletePlatformAgentMessageMutation` | Mutation | Message within an agent thread with TextPart/ToolPart jsonb parts |
| `usePlatformAgentPersonasQuery` | Query | Agent persona templates (role, system prompt, default skills/knowledge) |
| `usePlatformAgentPersonaQuery` | Query | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useCreatePlatformAgentPersonaMutation` | Mutation | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useUpdatePlatformAgentPersonaMutation` | Mutation | Agent persona templates (role, system prompt, default skills/knowledge) |
| `useDeletePlatformAgentPersonaMutation` | Mutation | Agent persona templates (role, system prompt, default skills/knowledge) |
| `usePlatformAgentPlansQuery` | Query | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `usePlatformAgentPlanQuery` | Query | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useCreatePlatformAgentPlanMutation` | Mutation | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useUpdatePlatformAgentPlanMutation` | Mutation | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `useDeletePlatformAgentPlanMutation` | Mutation | Workflow plan attached to an agent thread with ordered tasks and optional approval gates |
| `usePlatformAgentPromptsQuery` | Query | Shared system prompt templates for agent conversations |
| `usePlatformAgentPromptQuery` | Query | Shared system prompt templates for agent conversations |
| `useCreatePlatformAgentPromptMutation` | Mutation | Shared system prompt templates for agent conversations |
| `useUpdatePlatformAgentPromptMutation` | Mutation | Shared system prompt templates for agent conversations |
| `useDeletePlatformAgentPromptMutation` | Mutation | Shared system prompt templates for agent conversations |
| `usePlatformAgentResourceChunksQuery` | Query | List all platformAgentResourceChunks |
| `usePlatformAgentResourceChunkQuery` | Query | Get one platformAgentResourceChunk |
| `useCreatePlatformAgentResourceChunkMutation` | Mutation | Create a platformAgentResourceChunk |
| `useUpdatePlatformAgentResourceChunkMutation` | Mutation | Update a platformAgentResourceChunk |
| `useDeletePlatformAgentResourceChunkMutation` | Mutation | Delete a platformAgentResourceChunk |
| `usePlatformAgentResourcesQuery` | Query | Unified skills and knowledge resources for agent retrieval |
| `usePlatformAgentResourceQuery` | Query | Unified skills and knowledge resources for agent retrieval |
| `useCreatePlatformAgentResourceMutation` | Mutation | Unified skills and knowledge resources for agent retrieval |
| `useUpdatePlatformAgentResourceMutation` | Mutation | Unified skills and knowledge resources for agent retrieval |
| `useDeletePlatformAgentResourceMutation` | Mutation | Unified skills and knowledge resources for agent retrieval |
| `usePlatformAgentRunsQuery` | Query | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `usePlatformAgentRunQuery` | Query | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useCreatePlatformAgentRunMutation` | Mutation | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useUpdatePlatformAgentRunMutation` | Mutation | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `useDeletePlatformAgentRunMutation` | Mutation | One supervised agent run of a thread: its placement, workspace, cursor and artifacts |
| `usePlatformAgentRunWorkspacesQuery` | Query | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `usePlatformAgentRunWorkspaceQuery` | Query | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useCreatePlatformAgentRunWorkspaceMutation` | Mutation | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useUpdatePlatformAgentRunWorkspaceMutation` | Mutation | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `useDeletePlatformAgentRunWorkspaceMutation` | Mutation | One repository an agent run works in: its remote, branch, commits and how the work is published |
| `usePlatformAgentTasksQuery` | Query | Task within a plan, with ordering and optional approval gates |
| `usePlatformAgentTaskQuery` | Query | Task within a plan, with ordering and optional approval gates |
| `useCreatePlatformAgentTaskMutation` | Mutation | Task within a plan, with ordering and optional approval gates |
| `useUpdatePlatformAgentTaskMutation` | Mutation | Task within a plan, with ordering and optional approval gates |
| `useDeletePlatformAgentTaskMutation` | Mutation | Task within a plan, with ordering and optional approval gates |
| `usePlatformAgentThreadsQuery` | Query | Top-level AI/LLM conversation thread |
| `usePlatformAgentThreadQuery` | Query | Top-level AI/LLM conversation thread |
| `useCreatePlatformAgentThreadMutation` | Mutation | Top-level AI/LLM conversation thread |
| `useUpdatePlatformAgentThreadMutation` | Mutation | Top-level AI/LLM conversation thread |
| `useDeletePlatformAgentThreadMutation` | Mutation | Top-level AI/LLM conversation thread |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |

## Table Hooks

### Agent

```typescript
// List all agents
const { data, isLoading } = useAgentsQuery({
  selection: { fields: { config: true, createdAt: true, databaseId: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } },
});

// Get one agent
const { data: item } = useAgentQuery({
  id: '<UUID>',
  selection: { fields: { config: true, createdAt: true, databaseId: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } },
});

// Create a agent
const { mutate: create } = useCreateAgentMutation({
  selection: { fields: { id: true } },
});
create({ config: '<JSON>', databaseId: '<UUID>', isEphemeral: '<Boolean>', name: '<String>', ownerId: '<UUID>', parentId: '<UUID>', personaId: '<UUID>', status: '<String>', systemPrompt: '<String>' });
```

### AgentEvent

```typescript
// List all agentEvents
const { data, isLoading } = useAgentEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } },
});

// Get one agentEvent
const { data: item } = useAgentEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } },
});

// Create a agentEvent
const { mutate: create } = useCreateAgentEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', databaseId: '<UUID>', entry: '<JSON>', recordedAt: '<Datetime>', runId: '<UUID>', seq: '<Int>', transcriptFormat: '<String>', transcriptVersion: '<Int>', visibility: '<String>' });
```

### AgentMessage

```typescript
// List all agentMessages
const { data, isLoading } = useAgentMessagesQuery({
  selection: { fields: { actorId: true, agentId: true, authorRole: true, createdAt: true, databaseId: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } },
});

// Get one agentMessage
const { data: item } = useAgentMessageQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, agentId: true, authorRole: true, createdAt: true, databaseId: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } },
});

// Create a agentMessage
const { mutate: create } = useCreateAgentMessageMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', agentId: '<UUID>', authorRole: '<String>', databaseId: '<UUID>', deliveredRunId: '<UUID>', kind: '<String>', model: '<String>', parts: '<JSON>', threadId: '<UUID>', visibility: '<String>' });
```

### AgentPersona

```typescript
// List all agentPersonas
const { data, isLoading } = useAgentPersonasQuery({
  selection: { fields: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one agentPersona
const { data: item } = useAgentPersonaQuery({
  id: '<UUID>',
  selection: { fields: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a agentPersona
const { mutate: create } = useCreateAgentPersonaMutation({
  selection: { fields: { id: true } },
});
create({ config: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', isActive: '<Boolean>', name: '<String>', resources: '<String>', slug: '<String>', systemPrompt: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### AgentPlan

```typescript
// List all agentPlans
const { data, isLoading } = useAgentPlansQuery({
  selection: { fields: { createdAt: true, databaseId: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } },
});

// Get one agentPlan
const { data: item } = useAgentPlanQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, databaseId: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } },
});

// Create a agentPlan
const { mutate: create } = useCreateAgentPlanMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', description: '<String>', ownerId: '<UUID>', status: '<String>', threadId: '<UUID>', title: '<String>', visibility: '<String>' });
```

### AgentPrompt

```typescript
// List all agentPrompts
const { data, isLoading } = useAgentPromptsQuery({
  selection: { fields: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one agentPrompt
const { data: item } = useAgentPromptQuery({
  id: '<UUID>',
  selection: { fields: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a agentPrompt
const { mutate: create } = useCreateAgentPromptMutation({
  selection: { fields: { id: true } },
});
create({ content: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', isDefault: '<Boolean>', metadata: '<JSON>', name: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### AgentResourceChunk

```typescript
// List all agentResourceChunks
const { data, isLoading } = useAgentResourceChunksQuery({
  selection: { fields: { agentResourceId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, searchScore: true, updatedAt: true } },
});

// Get one agentResourceChunk
const { data: item } = useAgentResourceChunkQuery({
  id: '<UUID>',
  selection: { fields: { agentResourceId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, searchScore: true, updatedAt: true } },
});

// Create a agentResourceChunk
const { mutate: create } = useCreateAgentResourceChunkMutation({
  selection: { fields: { id: true } },
});
create({ agentResourceId: '<UUID>', body: '<String>', chunkIndex: '<Int>', databaseId: '<UUID>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', searchScore: '<Float>' });
```

### AgentResource

```typescript
// List all agentResources
const { data, isLoading } = useAgentResourcesQuery({
  selection: { fields: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one agentResource
const { data: item } = useAgentResourceQuery({
  id: '<UUID>',
  selection: { fields: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a agentResource
const { mutate: create } = useCreateAgentResourceMutation({
  selection: { fields: { id: true } },
});
create({ archivedAt: '<Datetime>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', isActive: '<Boolean>', isArchived: '<Boolean>', keywords: '<String>', kind: '<String>', kindTrgmSimilarity: '<Float>', metadata: '<JSON>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### AgentRun

```typescript
// List all agentRuns
const { data, isLoading } = useAgentRunsQuery({
  selection: { fields: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } },
});

// Get one agentRun
const { data: item } = useAgentRunQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } },
});

// Create a agentRun
const { mutate: create } = useCreateAgentRunMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', artifacts: '<JSON>', attempt: '<Int>', baseCommit: '<String>', branch: '<String>', databaseId: '<UUID>', deadlineAt: '<Datetime>', entityId: '<UUID>', error: '<String>', executionId: '<UUID>', finishedAt: '<Datetime>', headCommit: '<String>', lastEventSeq: '<Int>', parentRunId: '<UUID>', placement: '<String>', principalId: '<UUID>', repoUrl: '<String>', startedAt: '<Datetime>', status: '<String>', threadId: '<UUID>', tokenUsage: '<JSON>', totalCost: '<BigFloat>', visibility: '<String>' });
```

### AgentRunWorkspace

```typescript
// List all agentRunWorkspaces
const { data, isLoading } = useAgentRunWorkspacesQuery({
  selection: { fields: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, databaseId: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } },
});

// Get one agentRunWorkspace
const { data: item } = useAgentRunWorkspaceQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, databaseId: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } },
});

// Create a agentRunWorkspace
const { mutate: create } = useCreateAgentRunWorkspaceMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', artifacts: '<JSON>', baseBranch: '<String>', baseCommit: '<String>', branch: '<String>', clonedAt: '<Datetime>', databaseId: '<UUID>', headCommit: '<String>', lastUsedAt: '<Datetime>', ordinal: '<Int>', provider: '<String>', publication: '<String>', repo: '<String>', repositoryId: '<UUID>', runId: '<UUID>', state: '<String>', visibility: '<String>' });
```

### AgentTask

```typescript
// List all agentTasks
const { data, isLoading } = useAgentTasksQuery({
  selection: { fields: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, databaseId: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } },
});

// Get one agentTask
const { data: item } = useAgentTaskQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, databaseId: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } },
});

// Create a agentTask
const { mutate: create } = useCreateAgentTaskMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', approvalFeedback: '<String>', approvalStatus: '<String>', approvedAt: '<Datetime>', approvedBy: '<UUID>', databaseId: '<UUID>', description: '<String>', error: '<String>', orderIndex: '<Int>', planId: '<UUID>', requiresApproval: '<Boolean>', source: '<String>', status: '<String>', visibility: '<String>' });
```

### AgentThread

```typescript
// List all agentThreads
const { data, isLoading } = useAgentThreadsQuery({
  selection: { fields: { agentId: true, archivedAt: true, createdAt: true, databaseId: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } },
});

// Get one agentThread
const { data: item } = useAgentThreadQuery({
  id: '<UUID>',
  selection: { fields: { agentId: true, archivedAt: true, createdAt: true, databaseId: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } },
});

// Create a agentThread
const { mutate: create } = useCreateAgentThreadMutation({
  selection: { fields: { id: true } },
});
create({ agentId: '<UUID>', archivedAt: '<Datetime>', databaseId: '<UUID>', isArchived: '<Boolean>', mode: '<String>', model: '<String>', ownerId: '<UUID>', parentThreadId: '<UUID>', promptTemplateId: '<UUID>', status: '<String>', systemPrompt: '<String>', tags: '<String>', title: '<String>', visibility: '<String>' });
```

### PlatformAgent

```typescript
// List all platformAgents
const { data, isLoading } = usePlatformAgentsQuery({
  selection: { fields: { config: true, createdAt: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } },
});

// Get one platformAgent
const { data: item } = usePlatformAgentQuery({
  id: '<UUID>',
  selection: { fields: { config: true, createdAt: true, id: true, isEphemeral: true, name: true, ownerId: true, parentId: true, personaId: true, status: true, systemPrompt: true, updatedAt: true } },
});

// Create a platformAgent
const { mutate: create } = useCreatePlatformAgentMutation({
  selection: { fields: { id: true } },
});
create({ config: '<JSON>', isEphemeral: '<Boolean>', name: '<String>', ownerId: '<UUID>', parentId: '<UUID>', personaId: '<UUID>', status: '<String>', systemPrompt: '<String>' });
```

### PlatformAgentEvent

```typescript
// List all platformAgentEvents
const { data, isLoading } = usePlatformAgentEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } },
});

// Get one platformAgentEvent
const { data: item } = usePlatformAgentEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, entry: true, id: true, recordedAt: true, runId: true, seq: true, transcriptFormat: true, transcriptVersion: true, updatedAt: true, visibility: true } },
});

// Create a platformAgentEvent
const { mutate: create } = useCreatePlatformAgentEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', entry: '<JSON>', recordedAt: '<Datetime>', runId: '<UUID>', seq: '<Int>', transcriptFormat: '<String>', transcriptVersion: '<Int>', visibility: '<String>' });
```

### PlatformAgentMessage

```typescript
// List all platformAgentMessages
const { data, isLoading } = usePlatformAgentMessagesQuery({
  selection: { fields: { actorId: true, agentId: true, authorRole: true, createdAt: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } },
});

// Get one platformAgentMessage
const { data: item } = usePlatformAgentMessageQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, agentId: true, authorRole: true, createdAt: true, deliveredRunId: true, id: true, kind: true, model: true, parts: true, threadId: true, updatedAt: true, visibility: true } },
});

// Create a platformAgentMessage
const { mutate: create } = useCreatePlatformAgentMessageMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', agentId: '<UUID>', authorRole: '<String>', deliveredRunId: '<UUID>', kind: '<String>', model: '<String>', parts: '<JSON>', threadId: '<UUID>', visibility: '<String>' });
```

### PlatformAgentPersona

```typescript
// List all platformAgentPersonas
const { data, isLoading } = usePlatformAgentPersonasQuery({
  selection: { fields: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformAgentPersona
const { data: item } = usePlatformAgentPersonaQuery({
  id: '<UUID>',
  selection: { fields: { config: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isActive: true, name: true, resources: true, slug: true, systemPrompt: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformAgentPersona
const { mutate: create } = useCreatePlatformAgentPersonaMutation({
  selection: { fields: { id: true } },
});
create({ config: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', description: '<String>', isActive: '<Boolean>', name: '<String>', resources: '<String>', slug: '<String>', systemPrompt: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformAgentPlan

```typescript
// List all platformAgentPlans
const { data, isLoading } = usePlatformAgentPlansQuery({
  selection: { fields: { createdAt: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } },
});

// Get one platformAgentPlan
const { data: item } = usePlatformAgentPlanQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, description: true, id: true, ownerId: true, status: true, threadId: true, title: true, updatedAt: true, visibility: true } },
});

// Create a platformAgentPlan
const { mutate: create } = useCreatePlatformAgentPlanMutation({
  selection: { fields: { id: true } },
});
create({ description: '<String>', ownerId: '<UUID>', status: '<String>', threadId: '<UUID>', title: '<String>', visibility: '<String>' });
```

### PlatformAgentPrompt

```typescript
// List all platformAgentPrompts
const { data, isLoading } = usePlatformAgentPromptsQuery({
  selection: { fields: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformAgentPrompt
const { data: item } = usePlatformAgentPromptQuery({
  id: '<UUID>',
  selection: { fields: { content: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, id: true, isDefault: true, metadata: true, name: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformAgentPrompt
const { mutate: create } = useCreatePlatformAgentPromptMutation({
  selection: { fields: { id: true } },
});
create({ content: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', description: '<String>', isDefault: '<Boolean>', metadata: '<JSON>', name: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformAgentResourceChunk

```typescript
// List all platformAgentResourceChunks
const { data, isLoading } = usePlatformAgentResourceChunksQuery({
  selection: { fields: { body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformAgentResourceId: true, searchScore: true, updatedAt: true } },
});

// Get one platformAgentResourceChunk
const { data: item } = usePlatformAgentResourceChunkQuery({
  id: '<UUID>',
  selection: { fields: { body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformAgentResourceId: true, searchScore: true, updatedAt: true } },
});

// Create a platformAgentResourceChunk
const { mutate: create } = useCreatePlatformAgentResourceChunkMutation({
  selection: { fields: { id: true } },
});
create({ body: '<String>', chunkIndex: '<Int>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', platformAgentResourceId: '<UUID>', searchScore: '<Float>' });
```

### PlatformAgentResource

```typescript
// List all platformAgentResources
const { data, isLoading } = usePlatformAgentResourcesQuery({
  selection: { fields: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformAgentResource
const { data: item } = usePlatformAgentResourceQuery({
  id: '<UUID>',
  selection: { fields: { archivedAt: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, isActive: true, isArchived: true, keywords: true, kind: true, kindTrgmSimilarity: true, metadata: true, search: true, searchScore: true, searchTsvRank: true, slug: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformAgentResource
const { mutate: create } = useCreatePlatformAgentResourceMutation({
  selection: { fields: { id: true } },
});
create({ archivedAt: '<Datetime>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', isActive: '<Boolean>', isArchived: '<Boolean>', keywords: '<String>', kind: '<String>', kindTrgmSimilarity: '<Float>', metadata: '<JSON>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformAgentRun

```typescript
// List all platformAgentRuns
const { data, isLoading } = usePlatformAgentRunsQuery({
  selection: { fields: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } },
});

// Get one platformAgentRun
const { data: item } = usePlatformAgentRunQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, artifacts: true, attempt: true, baseCommit: true, branch: true, createdAt: true, databaseId: true, deadlineAt: true, entityId: true, error: true, executionId: true, finishedAt: true, headCommit: true, id: true, lastEventSeq: true, parentRunId: true, placement: true, principalId: true, repoUrl: true, startedAt: true, status: true, threadId: true, tokenUsage: true, totalCost: true, updatedAt: true, visibility: true } },
});

// Create a platformAgentRun
const { mutate: create } = useCreatePlatformAgentRunMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', artifacts: '<JSON>', attempt: '<Int>', baseCommit: '<String>', branch: '<String>', databaseId: '<UUID>', deadlineAt: '<Datetime>', entityId: '<UUID>', error: '<String>', executionId: '<UUID>', finishedAt: '<Datetime>', headCommit: '<String>', lastEventSeq: '<Int>', parentRunId: '<UUID>', placement: '<String>', principalId: '<UUID>', repoUrl: '<String>', startedAt: '<Datetime>', status: '<String>', threadId: '<UUID>', tokenUsage: '<JSON>', totalCost: '<BigFloat>', visibility: '<String>' });
```

### PlatformAgentRunWorkspace

```typescript
// List all platformAgentRunWorkspaces
const { data, isLoading } = usePlatformAgentRunWorkspacesQuery({
  selection: { fields: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } },
});

// Get one platformAgentRunWorkspace
const { data: item } = usePlatformAgentRunWorkspaceQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, artifacts: true, baseBranch: true, baseCommit: true, branch: true, clonedAt: true, createdAt: true, headCommit: true, id: true, lastUsedAt: true, ordinal: true, provider: true, publication: true, repo: true, repositoryId: true, runId: true, state: true, updatedAt: true, visibility: true } },
});

// Create a platformAgentRunWorkspace
const { mutate: create } = useCreatePlatformAgentRunWorkspaceMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', artifacts: '<JSON>', baseBranch: '<String>', baseCommit: '<String>', branch: '<String>', clonedAt: '<Datetime>', headCommit: '<String>', lastUsedAt: '<Datetime>', ordinal: '<Int>', provider: '<String>', publication: '<String>', repo: '<String>', repositoryId: '<UUID>', runId: '<UUID>', state: '<String>', visibility: '<String>' });
```

### PlatformAgentTask

```typescript
// List all platformAgentTasks
const { data, isLoading } = usePlatformAgentTasksQuery({
  selection: { fields: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } },
});

// Get one platformAgentTask
const { data: item } = usePlatformAgentTaskQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, approvalFeedback: true, approvalStatus: true, approvedAt: true, approvedBy: true, createdAt: true, description: true, error: true, id: true, orderIndex: true, planId: true, requiresApproval: true, source: true, status: true, updatedAt: true, visibility: true } },
});

// Create a platformAgentTask
const { mutate: create } = useCreatePlatformAgentTaskMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', approvalFeedback: '<String>', approvalStatus: '<String>', approvedAt: '<Datetime>', approvedBy: '<UUID>', description: '<String>', error: '<String>', orderIndex: '<Int>', planId: '<UUID>', requiresApproval: '<Boolean>', source: '<String>', status: '<String>', visibility: '<String>' });
```

### PlatformAgentThread

```typescript
// List all platformAgentThreads
const { data, isLoading } = usePlatformAgentThreadsQuery({
  selection: { fields: { agentId: true, archivedAt: true, createdAt: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } },
});

// Get one platformAgentThread
const { data: item } = usePlatformAgentThreadQuery({
  id: '<UUID>',
  selection: { fields: { agentId: true, archivedAt: true, createdAt: true, id: true, isArchived: true, mode: true, model: true, ownerId: true, parentThreadId: true, promptTemplateId: true, status: true, systemPrompt: true, tags: true, title: true, updatedAt: true, visibility: true } },
});

// Create a platformAgentThread
const { mutate: create } = useCreatePlatformAgentThreadMutation({
  selection: { fields: { id: true } },
});
create({ agentId: '<UUID>', archivedAt: '<Datetime>', isArchived: '<Boolean>', mode: '<String>', model: '<String>', ownerId: '<UUID>', parentThreadId: '<UUID>', promptTemplateId: '<UUID>', status: '<String>', systemPrompt: '<String>', tags: '<String>', title: '<String>', visibility: '<String>' });
```

## Custom Operation Hooks

### `useProvisionBucketMutation`

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
