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
| `useBuildsQuery` | Query | One run of a repository workflow: its commit, its job, and what it produced |
| `useBuildQuery` | Query | One run of a repository workflow: its commit, its job, and what it produced |
| `useCreateBuildMutation` | Mutation | One run of a repository workflow: its commit, its job, and what it produced |
| `useUpdateBuildMutation` | Mutation | One run of a repository workflow: its commit, its job, and what it produced |
| `useDeleteBuildMutation` | Mutation | One run of a repository workflow: its commit, its job, and what it produced |
| `useBuildStepsQuery` | Query | Partitioned append-only step and test results of a build, keyed into its log object |
| `useBuildStepQuery` | Query | Partitioned append-only step and test results of a build, keyed into its log object |
| `useCreateBuildStepMutation` | Mutation | Partitioned append-only step and test results of a build, keyed into its log object |
| `useUpdateBuildStepMutation` | Mutation | Partitioned append-only step and test results of a build, keyed into its log object |
| `useDeleteBuildStepMutation` | Mutation | Partitioned append-only step and test results of a build, keyed into its log object |
| `useBuilderBindingsQuery` | Query | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useBuilderBindingQuery` | Query | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useCreateBuilderBindingMutation` | Mutation | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useUpdateBuilderBindingMutation` | Mutation | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useDeleteBuilderBindingMutation` | Mutation | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useContentPresetsQuery` | Query | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useContentPresetQuery` | Query | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useCreateContentPresetMutation` | Mutation | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useUpdateContentPresetMutation` | Mutation | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useDeleteContentPresetMutation` | Mutation | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useDatabaseFunctionGraphsQuery` | Query | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useDatabaseFunctionGraphQuery` | Query | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useCreateDatabaseFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useUpdateDatabaseFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useDeleteDatabaseFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useDatabaseFunctionGraphExecutionCancelRequestsQuery` | Query | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useDatabaseFunctionGraphExecutionCancelRequestQuery` | Query | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useCreateDatabaseFunctionGraphExecutionCancelRequestMutation` | Mutation | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useUpdateDatabaseFunctionGraphExecutionCancelRequestMutation` | Mutation | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useDeleteDatabaseFunctionGraphExecutionCancelRequestMutation` | Mutation | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useDatabaseFunctionGraphExecutionsQuery` | Query | Ephemeral execution state for flow graph evaluation |
| `useDatabaseFunctionGraphExecutionQuery` | Query | Ephemeral execution state for flow graph evaluation |
| `useCreateDatabaseFunctionGraphExecutionMutation` | Mutation | Ephemeral execution state for flow graph evaluation |
| `useUpdateDatabaseFunctionGraphExecutionMutation` | Mutation | Ephemeral execution state for flow graph evaluation |
| `useDeleteDatabaseFunctionGraphExecutionMutation` | Mutation | Ephemeral execution state for flow graph evaluation |
| `useDatabaseFunctionGraphExecutionNodeStatesQuery` | Query | Per-node execution state — tracks individual node lifecycle for debugging |
| `useDatabaseFunctionGraphExecutionNodeStateQuery` | Query | Per-node execution state — tracks individual node lifecycle for debugging |
| `useCreateDatabaseFunctionGraphExecutionNodeStateMutation` | Mutation | Per-node execution state — tracks individual node lifecycle for debugging |
| `useUpdateDatabaseFunctionGraphExecutionNodeStateMutation` | Mutation | Per-node execution state — tracks individual node lifecycle for debugging |
| `useDeleteDatabaseFunctionGraphExecutionNodeStateMutation` | Mutation | Per-node execution state — tracks individual node lifecycle for debugging |
| `useDatabaseFunctionGraphExecutionOutputsQuery` | Query | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useDatabaseFunctionGraphExecutionOutputQuery` | Query | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useCreateDatabaseFunctionGraphExecutionOutputMutation` | Mutation | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useUpdateDatabaseFunctionGraphExecutionOutputMutation` | Mutation | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useDeleteDatabaseFunctionGraphExecutionOutputMutation` | Mutation | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useDatabaseGraphCommitsQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useDatabaseGraphCommitQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useCreateDatabaseGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useUpdateDatabaseGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useDeleteDatabaseGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useDatabaseGraphGetAllTreeNodesQuery` | Query | List all databaseGraphGetAllTreeNodes |
| `useCreateDatabaseGraphGetAllTreeNodesRecordMutation` | Mutation | Create a databaseGraphGetAllTreeNodesRecord |
| `useDatabaseGraphObjectsQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useDatabaseGraphObjectQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useCreateDatabaseGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useUpdateDatabaseGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useDeleteDatabaseGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useDatabaseGraphRefsQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useDatabaseGraphRefQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useCreateDatabaseGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useUpdateDatabaseGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useDeleteDatabaseGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useDatabaseGraphStoresQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useDatabaseGraphStoreQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useCreateDatabaseGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useUpdateDatabaseGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useDeleteDatabaseGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useDbPresetsQuery` | Query | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useDbPresetQuery` | Query | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useCreateDbPresetMutation` | Mutation | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useUpdateDbPresetMutation` | Mutation | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useDeleteDbPresetMutation` | Mutation | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useFunctionApiBindingsQuery` | Query | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useFunctionApiBindingQuery` | Query | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useCreateFunctionApiBindingMutation` | Mutation | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useUpdateFunctionApiBindingMutation` | Mutation | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useDeleteFunctionApiBindingMutation` | Mutation | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useFunctionCapabilityBindingsQuery` | Query | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useFunctionCapabilityBindingQuery` | Query | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useCreateFunctionCapabilityBindingMutation` | Mutation | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useUpdateFunctionCapabilityBindingMutation` | Mutation | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useDeleteFunctionCapabilityBindingMutation` | Mutation | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useFunctionDefinitionsQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useFunctionDefinitionQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useCreateFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useUpdateFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useDeleteFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useFunctionDeploymentsQuery` | Query | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useFunctionDeploymentQuery` | Query | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useCreateFunctionDeploymentMutation` | Mutation | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useUpdateFunctionDeploymentMutation` | Mutation | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useDeleteFunctionDeploymentMutation` | Mutation | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useFunctionDeploymentEventsQuery` | Query | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useFunctionDeploymentEventQuery` | Query | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useCreateFunctionDeploymentEventMutation` | Mutation | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useUpdateFunctionDeploymentEventMutation` | Mutation | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useDeleteFunctionDeploymentEventMutation` | Mutation | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useFunctionExecutionLogsQuery` | Query | Function execution logs — structured console output per invocation |
| `useFunctionExecutionLogQuery` | Query | Function execution logs — structured console output per invocation |
| `useCreateFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useUpdateFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useDeleteFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useFunctionGraphCommitsQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useFunctionGraphCommitQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useCreateFunctionGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useUpdateFunctionGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useDeleteFunctionGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useFunctionGraphsQuery` | Query | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useFunctionGraphQuery` | Query | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useCreateFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useUpdateFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useDeleteFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useFunctionGraphExecutionCancelRequestsQuery` | Query | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useFunctionGraphExecutionCancelRequestQuery` | Query | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useCreateFunctionGraphExecutionCancelRequestMutation` | Mutation | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useUpdateFunctionGraphExecutionCancelRequestMutation` | Mutation | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useDeleteFunctionGraphExecutionCancelRequestMutation` | Mutation | Requests to stop a graph execution; each insert settles it cancelled and tears down the Jobs its nodes dispatched |
| `useFunctionGraphExecutionsQuery` | Query | Ephemeral execution state for flow graph evaluation |
| `useFunctionGraphExecutionQuery` | Query | Ephemeral execution state for flow graph evaluation |
| `useCreateFunctionGraphExecutionMutation` | Mutation | Ephemeral execution state for flow graph evaluation |
| `useUpdateFunctionGraphExecutionMutation` | Mutation | Ephemeral execution state for flow graph evaluation |
| `useDeleteFunctionGraphExecutionMutation` | Mutation | Ephemeral execution state for flow graph evaluation |
| `useFunctionGraphExecutionNodeStatesQuery` | Query | Per-node execution state — tracks individual node lifecycle for debugging |
| `useFunctionGraphExecutionNodeStateQuery` | Query | Per-node execution state — tracks individual node lifecycle for debugging |
| `useCreateFunctionGraphExecutionNodeStateMutation` | Mutation | Per-node execution state — tracks individual node lifecycle for debugging |
| `useUpdateFunctionGraphExecutionNodeStateMutation` | Mutation | Per-node execution state — tracks individual node lifecycle for debugging |
| `useDeleteFunctionGraphExecutionNodeStateMutation` | Mutation | Per-node execution state — tracks individual node lifecycle for debugging |
| `useFunctionGraphExecutionOutputsQuery` | Query | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useFunctionGraphExecutionOutputQuery` | Query | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useCreateFunctionGraphExecutionOutputMutation` | Mutation | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useUpdateFunctionGraphExecutionOutputMutation` | Mutation | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useDeleteFunctionGraphExecutionOutputMutation` | Mutation | Content-addressed store for execution outputs — hash-referenced from node_outputs |
| `useFunctionGraphObjectsQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useFunctionGraphObjectQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useCreateFunctionGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useUpdateFunctionGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useDeleteFunctionGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useFunctionGraphRefsQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useFunctionGraphRefQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useCreateFunctionGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useUpdateFunctionGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useDeleteFunctionGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useFunctionGraphStoresQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useFunctionGraphStoreQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useCreateFunctionGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useUpdateFunctionGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useDeleteFunctionGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useFunctionInvocationAttemptsQuery` | Query | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useFunctionInvocationAttemptQuery` | Query | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useCreateFunctionInvocationAttemptMutation` | Mutation | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useUpdateFunctionInvocationAttemptMutation` | Mutation | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useDeleteFunctionInvocationAttemptMutation` | Mutation | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useFunctionInvocationsQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useFunctionInvocationQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useCreateFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useUpdateFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useDeleteFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useFunctionSchedulesQuery` | Query | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useFunctionScheduleQuery` | Query | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useCreateFunctionScheduleMutation` | Mutation | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useUpdateFunctionScheduleMutation` | Mutation | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useDeleteFunctionScheduleMutation` | Mutation | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useGetAllTreeNodesQuery` | Query | List all getAllTreeNodes |
| `useCreateGetAllTreeNodesRecordMutation` | Mutation | Create a getAllTreeNodesRecord |
| `useImagesQuery` | Query | Container image catalog: images available to run as functions, resources, and builds |
| `useImageQuery` | Query | Container image catalog: images available to run as functions, resources, and builds |
| `useCreateImageMutation` | Mutation | Container image catalog: images available to run as functions, resources, and builds |
| `useUpdateImageMutation` | Mutation | Container image catalog: images available to run as functions, resources, and builds |
| `useDeleteImageMutation` | Mutation | Container image catalog: images available to run as functions, resources, and builds |
| `useImageGrantsQuery` | Query | Grants that make a catalog image usable by one scope |
| `useImageGrantQuery` | Query | Grants that make a catalog image usable by one scope |
| `useCreateImageGrantMutation` | Mutation | Grants that make a catalog image usable by one scope |
| `useUpdateImageGrantMutation` | Mutation | Grants that make a catalog image usable by one scope |
| `useDeleteImageGrantMutation` | Mutation | Grants that make a catalog image usable by one scope |
| `useInfraCommitsQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useInfraCommitQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useCreateInfraCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useUpdateInfraCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useDeleteInfraCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useInfraGetAllTreeNodesQuery` | Query | List all infraGetAllTreeNodes |
| `useCreateInfraGetAllTreeNodesRecordMutation` | Mutation | Create a infraGetAllTreeNodesRecord |
| `useInfraObjectsQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useInfraObjectQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useCreateInfraObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useUpdateInfraObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useDeleteInfraObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useInfraRefsQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useInfraRefQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useCreateInfraRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useUpdateInfraRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useDeleteInfraRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useInfraStoresQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useInfraStoreQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useCreateInfraStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useUpdateInfraStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useDeleteInfraStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useIntegrationProvidersQuery` | Query | Branded catalog of external service integrations and their canonical secret/config requirements. Each row defines a provider (e.g. Mailgun, Postgres) that function and resource definitions can reference by slug. The required_secrets/required_configs arrays are guidance that the UI can copy into a definition; the definition arrays remain the source of truth. |
| `useIntegrationProviderQuery` | Query | Branded catalog of external service integrations and their canonical secret/config requirements. Each row defines a provider (e.g. Mailgun, Postgres) that function and resource definitions can reference by slug. The required_secrets/required_configs arrays are guidance that the UI can copy into a definition; the definition arrays remain the source of truth. |
| `useCreateIntegrationProviderMutation` | Mutation | Branded catalog of external service integrations and their canonical secret/config requirements. Each row defines a provider (e.g. Mailgun, Postgres) that function and resource definitions can reference by slug. The required_secrets/required_configs arrays are guidance that the UI can copy into a definition; the definition arrays remain the source of truth. |
| `useUpdateIntegrationProviderMutation` | Mutation | Branded catalog of external service integrations and their canonical secret/config requirements. Each row defines a provider (e.g. Mailgun, Postgres) that function and resource definitions can reference by slug. The required_secrets/required_configs arrays are guidance that the UI can copy into a definition; the definition arrays remain the source of truth. |
| `useDeleteIntegrationProviderMutation` | Mutation | Branded catalog of external service integrations and their canonical secret/config requirements. Each row defines a provider (e.g. Mailgun, Postgres) that function and resource definitions can reference by slug. The required_secrets/required_configs arrays are guidance that the UI can copy into a definition; the definition arrays remain the source of truth. |
| `useNamespacesQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useNamespaceQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useCreateNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useUpdateNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useDeleteNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useNamespaceEventsQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useNamespaceEventQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useCreateNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useUpdateNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useDeleteNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `usePlatformBuildsQuery` | Query | One run of a repository workflow: its commit, its job, and what it produced |
| `usePlatformBuildQuery` | Query | One run of a repository workflow: its commit, its job, and what it produced |
| `useCreatePlatformBuildMutation` | Mutation | One run of a repository workflow: its commit, its job, and what it produced |
| `useUpdatePlatformBuildMutation` | Mutation | One run of a repository workflow: its commit, its job, and what it produced |
| `useDeletePlatformBuildMutation` | Mutation | One run of a repository workflow: its commit, its job, and what it produced |
| `usePlatformBuildStepsQuery` | Query | Partitioned append-only step and test results of a build, keyed into its log object |
| `usePlatformBuildStepQuery` | Query | Partitioned append-only step and test results of a build, keyed into its log object |
| `useCreatePlatformBuildStepMutation` | Mutation | Partitioned append-only step and test results of a build, keyed into its log object |
| `useUpdatePlatformBuildStepMutation` | Mutation | Partitioned append-only step and test results of a build, keyed into its log object |
| `useDeletePlatformBuildStepMutation` | Mutation | Partitioned append-only step and test results of a build, keyed into its log object |
| `usePlatformBuilderBindingsQuery` | Query | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `usePlatformBuilderBindingQuery` | Query | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useCreatePlatformBuilderBindingMutation` | Mutation | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useUpdatePlatformBuilderBindingMutation` | Mutation | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `useDeletePlatformBuilderBindingMutation` | Mutation | Binds a namespace to an installed BuildKit resource for a lane (realm) — the reconciler projects its in-cluster Service address as BUILDKIT_HOST |
| `usePlatformFunctionApiBindingsQuery` | Query | Join table binding function definitions to API endpoints with per-binding alias and config |
| `usePlatformFunctionApiBindingQuery` | Query | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useCreatePlatformFunctionApiBindingMutation` | Mutation | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useUpdatePlatformFunctionApiBindingMutation` | Mutation | Join table binding function definitions to API endpoints with per-binding alias and config |
| `useDeletePlatformFunctionApiBindingMutation` | Mutation | Join table binding function definitions to API endpoints with per-binding alias and config |
| `usePlatformFunctionCapabilityBindingsQuery` | Query | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `usePlatformFunctionCapabilityBindingQuery` | Query | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useCreatePlatformFunctionCapabilityBindingMutation` | Mutation | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useUpdatePlatformFunctionCapabilityBindingMutation` | Mutation | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `useDeletePlatformFunctionCapabilityBindingMutation` | Mutation | Capability bindings — declarative grants of typed resource capabilities (buckets) to function/graph holders per lifecycle |
| `usePlatformFunctionDefinitionsQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `usePlatformFunctionDefinitionQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useCreatePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useUpdatePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useDeletePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `usePlatformFunctionDeploymentsQuery` | Query | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `usePlatformFunctionDeploymentQuery` | Query | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useCreatePlatformFunctionDeploymentMutation` | Mutation | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useUpdatePlatformFunctionDeploymentMutation` | Mutation | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `useDeletePlatformFunctionDeploymentMutation` | Mutation | Function deployment bindings — ties a handler image to a namespace for Knative provisioning and routing (one row per handler image per namespace) |
| `usePlatformFunctionDeploymentEventsQuery` | Query | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `usePlatformFunctionDeploymentEventQuery` | Query | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useCreatePlatformFunctionDeploymentEventMutation` | Mutation | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useUpdatePlatformFunctionDeploymentEventMutation` | Mutation | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `useDeletePlatformFunctionDeploymentEventMutation` | Mutation | Deployment lifecycle events — audit log of provisioning, scaling, and failure events |
| `usePlatformFunctionExecutionLogsQuery` | Query | Function execution logs — structured console output per invocation |
| `usePlatformFunctionExecutionLogQuery` | Query | Function execution logs — structured console output per invocation |
| `useCreatePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useUpdatePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useDeletePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `usePlatformFunctionInvocationAttemptsQuery` | Query | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `usePlatformFunctionInvocationAttemptQuery` | Query | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useCreatePlatformFunctionInvocationAttemptMutation` | Mutation | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useUpdatePlatformFunctionInvocationAttemptMutation` | Mutation | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `useDeletePlatformFunctionInvocationAttemptMutation` | Mutation | Function invocation attempts — one row per worker attempt (including failed retries) with duration and error detail |
| `usePlatformFunctionInvocationsQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `usePlatformFunctionInvocationQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useCreatePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useUpdatePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `useDeletePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions via function_definition_id FK, with task_identifier as the denormalized routing/audit slug. |
| `usePlatformFunctionSchedulesQuery` | Query | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `usePlatformFunctionScheduleQuery` | Query | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useCreatePlatformFunctionScheduleMutation` | Mutation | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useUpdatePlatformFunctionScheduleMutation` | Mutation | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `useDeletePlatformFunctionScheduleMutation` | Mutation | Function schedules — user-facing cron schedules synced into the worker scheduler (app_jobs.scheduled_jobs) |
| `usePlatformImagesQuery` | Query | Container image catalog: images available to run as functions, resources, and builds |
| `usePlatformImageQuery` | Query | Container image catalog: images available to run as functions, resources, and builds |
| `useCreatePlatformImageMutation` | Mutation | Container image catalog: images available to run as functions, resources, and builds |
| `useUpdatePlatformImageMutation` | Mutation | Container image catalog: images available to run as functions, resources, and builds |
| `useDeletePlatformImageMutation` | Mutation | Container image catalog: images available to run as functions, resources, and builds |
| `usePlatformImageGrantsQuery` | Query | Grants that make a catalog image usable by one scope |
| `usePlatformImageGrantQuery` | Query | Grants that make a catalog image usable by one scope |
| `useCreatePlatformImageGrantMutation` | Mutation | Grants that make a catalog image usable by one scope |
| `useUpdatePlatformImageGrantMutation` | Mutation | Grants that make a catalog image usable by one scope |
| `useDeletePlatformImageGrantMutation` | Mutation | Grants that make a catalog image usable by one scope |
| `usePlatformInfraCommitsQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `usePlatformInfraCommitQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useCreatePlatformInfraCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useUpdatePlatformInfraCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useDeletePlatformInfraCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `usePlatformInfraGetAllTreeNodesQuery` | Query | List all platformInfraGetAllTreeNodes |
| `useCreatePlatformInfraGetAllTreeNodesRecordMutation` | Mutation | Create a platformInfraGetAllTreeNodesRecord |
| `usePlatformInfraObjectsQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `usePlatformInfraObjectQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useCreatePlatformInfraObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useUpdatePlatformInfraObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useDeletePlatformInfraObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `usePlatformInfraRefsQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `usePlatformInfraRefQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useCreatePlatformInfraRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useUpdatePlatformInfraRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useDeletePlatformInfraRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `usePlatformInfraStoresQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `usePlatformInfraStoreQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useCreatePlatformInfraStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useUpdatePlatformInfraStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useDeletePlatformInfraStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `usePlatformK8sResourceKindsQuery` | Query | Kubernetes kind allow-list for DB-driven resources — merkle-versioned head over the infra store; the admission gate fails closed on kinds without an active row |
| `usePlatformK8sResourceKindQuery` | Query | Kubernetes kind allow-list for DB-driven resources — merkle-versioned head over the infra store; the admission gate fails closed on kinds without an active row |
| `useCreatePlatformK8sResourceKindMutation` | Mutation | Kubernetes kind allow-list for DB-driven resources — merkle-versioned head over the infra store; the admission gate fails closed on kinds without an active row |
| `useUpdatePlatformK8sResourceKindMutation` | Mutation | Kubernetes kind allow-list for DB-driven resources — merkle-versioned head over the infra store; the admission gate fails closed on kinds without an active row |
| `useDeletePlatformK8sResourceKindMutation` | Mutation | Kubernetes kind allow-list for DB-driven resources — merkle-versioned head over the infra store; the admission gate fails closed on kinds without an active row |
| `usePlatformK8sSpecRulesQuery` | Query | Spec rulebook for DB-driven resources — merkle-versioned head over the infra store; enforced by the generated admission gate via infra_utils.check_resource_admission |
| `usePlatformK8sSpecRuleQuery` | Query | Spec rulebook for DB-driven resources — merkle-versioned head over the infra store; enforced by the generated admission gate via infra_utils.check_resource_admission |
| `useCreatePlatformK8sSpecRuleMutation` | Mutation | Spec rulebook for DB-driven resources — merkle-versioned head over the infra store; enforced by the generated admission gate via infra_utils.check_resource_admission |
| `useUpdatePlatformK8sSpecRuleMutation` | Mutation | Spec rulebook for DB-driven resources — merkle-versioned head over the infra store; enforced by the generated admission gate via infra_utils.check_resource_admission |
| `useDeletePlatformK8sSpecRuleMutation` | Mutation | Spec rulebook for DB-driven resources — merkle-versioned head over the infra store; enforced by the generated admission gate via infra_utils.check_resource_admission |
| `usePlatformNamespacesQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `usePlatformNamespaceQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useCreatePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useUpdatePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useDeletePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `usePlatformNamespaceEventsQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `usePlatformNamespaceEventQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useCreatePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useUpdatePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useDeletePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `usePlatformProposalCommentsQuery` | Query | Comments on a local proposal, optionally anchored to a line |
| `usePlatformProposalCommentQuery` | Query | Comments on a local proposal, optionally anchored to a line |
| `useCreatePlatformProposalCommentMutation` | Mutation | Comments on a local proposal, optionally anchored to a line |
| `useUpdatePlatformProposalCommentMutation` | Mutation | Comments on a local proposal, optionally anchored to a line |
| `useDeletePlatformProposalCommentMutation` | Mutation | Comments on a local proposal, optionally anchored to a line |
| `usePlatformProposalsQuery` | Query | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `usePlatformProposalQuery` | Query | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useCreatePlatformProposalMutation` | Mutation | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useUpdatePlatformProposalMutation` | Mutation | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useDeletePlatformProposalMutation` | Mutation | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `usePlatformProposalFileViewsQuery` | Query | Files a reviewer has read, pinned to the blob they read |
| `usePlatformProposalFileViewQuery` | Query | Files a reviewer has read, pinned to the blob they read |
| `useCreatePlatformProposalFileViewMutation` | Mutation | Files a reviewer has read, pinned to the blob they read |
| `useUpdatePlatformProposalFileViewMutation` | Mutation | Files a reviewer has read, pinned to the blob they read |
| `useDeletePlatformProposalFileViewMutation` | Mutation | Files a reviewer has read, pinned to the blob they read |
| `usePlatformProposalReactionsQuery` | Query | Emoji reactions to a local proposal or one of its comments |
| `usePlatformProposalReactionQuery` | Query | Emoji reactions to a local proposal or one of its comments |
| `useCreatePlatformProposalReactionMutation` | Mutation | Emoji reactions to a local proposal or one of its comments |
| `useUpdatePlatformProposalReactionMutation` | Mutation | Emoji reactions to a local proposal or one of its comments |
| `useDeletePlatformProposalReactionMutation` | Mutation | Emoji reactions to a local proposal or one of its comments |
| `usePlatformProposalReviewsQuery` | Query | Review verdicts on a proposal, each pinned to the commit reviewed |
| `usePlatformProposalReviewQuery` | Query | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useCreatePlatformProposalReviewMutation` | Mutation | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useUpdatePlatformProposalReviewMutation` | Mutation | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useDeletePlatformProposalReviewMutation` | Mutation | Review verdicts on a proposal, each pinned to the commit reviewed |
| `usePlatformProposalsChunksQuery` | Query | List all platformProposalsChunks |
| `usePlatformProposalsChunkQuery` | Query | Get one platformProposalsChunk |
| `useCreatePlatformProposalsChunkMutation` | Mutation | Create a platformProposalsChunk |
| `useUpdatePlatformProposalsChunkMutation` | Mutation | Update a platformProposalsChunk |
| `useDeletePlatformProposalsChunkMutation` | Mutation | Delete a platformProposalsChunk |
| `usePlatformRegistryBindingsQuery` | Query | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `usePlatformRegistryBindingQuery` | Query | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useCreatePlatformRegistryBindingMutation` | Mutation | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useUpdatePlatformRegistryBindingMutation` | Mutation | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useDeletePlatformRegistryBindingMutation` | Mutation | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `usePlatformRegistriesQuery` | Query | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `usePlatformRegistryQuery` | Query | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useCreatePlatformRegistryMutation` | Mutation | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useUpdatePlatformRegistryMutation` | Mutation | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useDeletePlatformRegistryMutation` | Mutation | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `usePlatformRegistryGrantsQuery` | Query | Grants that make a registry usable by one scope |
| `usePlatformRegistryGrantQuery` | Query | Grants that make a registry usable by one scope |
| `useCreatePlatformRegistryGrantMutation` | Mutation | Grants that make a registry usable by one scope |
| `useUpdatePlatformRegistryGrantMutation` | Mutation | Grants that make a registry usable by one scope |
| `useDeletePlatformRegistryGrantMutation` | Mutation | Grants that make a registry usable by one scope |
| `usePlatformRepositoriesQuery` | Query | Source repositories, hosted locally or on an external provider |
| `usePlatformRepositoryQuery` | Query | Source repositories, hosted locally or on an external provider |
| `useCreatePlatformRepositoryMutation` | Mutation | Source repositories, hosted locally or on an external provider |
| `useUpdatePlatformRepositoryMutation` | Mutation | Source repositories, hosted locally or on an external provider |
| `useDeletePlatformRepositoryMutation` | Mutation | Source repositories, hosted locally or on an external provider |
| `usePlatformRepositoryEventsQuery` | Query | Normalized repository events from local hooks and external providers |
| `usePlatformRepositoryEventQuery` | Query | Normalized repository events from local hooks and external providers |
| `useCreatePlatformRepositoryEventMutation` | Mutation | Normalized repository events from local hooks and external providers |
| `useUpdatePlatformRepositoryEventMutation` | Mutation | Normalized repository events from local hooks and external providers |
| `useDeletePlatformRepositoryEventMutation` | Mutation | Normalized repository events from local hooks and external providers |
| `usePlatformRepositoryRequiredChecksQuery` | Query | Workflows required to pass before a repository proposal merges |
| `usePlatformRepositoryRequiredCheckQuery` | Query | Workflows required to pass before a repository proposal merges |
| `useCreatePlatformRepositoryRequiredCheckMutation` | Mutation | Workflows required to pass before a repository proposal merges |
| `useUpdatePlatformRepositoryRequiredCheckMutation` | Mutation | Workflows required to pass before a repository proposal merges |
| `useDeletePlatformRepositoryRequiredCheckMutation` | Mutation | Workflows required to pass before a repository proposal merges |
| `usePlatformRepositoryWorkflowsQuery` | Query | Bindings from a repository event to the flow graph that should run |
| `usePlatformRepositoryWorkflowQuery` | Query | Bindings from a repository event to the flow graph that should run |
| `useCreatePlatformRepositoryWorkflowMutation` | Mutation | Bindings from a repository event to the flow graph that should run |
| `useUpdatePlatformRepositoryWorkflowMutation` | Mutation | Bindings from a repository event to the flow graph that should run |
| `useDeletePlatformRepositoryWorkflowMutation` | Mutation | Bindings from a repository event to the flow graph that should run |
| `usePlatformResourcesQuery` | Query | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `usePlatformResourceQuery` | Query | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useCreatePlatformResourceMutation` | Mutation | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useUpdatePlatformResourceMutation` | Mutation | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useDeletePlatformResourceMutation` | Mutation | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `usePlatformResourceDeclaredCapacitiesQuery` | Query | List all platformResourceDeclaredCapacities |
| `useCreatePlatformResourceDeclaredCapacityMutation` | Mutation | Create a platformResourceDeclaredCapacity |
| `usePlatformResourceDefinitionsQuery` | Query | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `usePlatformResourceDefinitionQuery` | Query | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useCreatePlatformResourceDefinitionMutation` | Mutation | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useUpdatePlatformResourceDefinitionMutation` | Mutation | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useDeletePlatformResourceDefinitionMutation` | Mutation | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `usePlatformResourceEventsQuery` | Query | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `usePlatformResourceEventQuery` | Query | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useCreatePlatformResourceEventMutation` | Mutation | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useUpdatePlatformResourceEventMutation` | Mutation | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useDeletePlatformResourceEventMutation` | Mutation | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `usePlatformResourceInstallationsQuery` | Query | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `usePlatformResourceInstallationQuery` | Query | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useCreatePlatformResourceInstallationMutation` | Mutation | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useUpdatePlatformResourceInstallationMutation` | Mutation | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useDeletePlatformResourceInstallationMutation` | Mutation | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `usePlatformResourceObservedStoragesQuery` | Query | List all platformResourceObservedStorages |
| `useCreatePlatformResourceObservedStorageMutation` | Mutation | Create a platformResourceObservedStorage |
| `usePlatformResourceStatusChecksQuery` | Query | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `usePlatformResourceStatusCheckQuery` | Query | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useCreatePlatformResourceStatusCheckMutation` | Mutation | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useUpdatePlatformResourceStatusCheckMutation` | Mutation | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useDeletePlatformResourceStatusCheckMutation` | Mutation | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `usePlatformResourceUsageLogsQuery` | Query | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `usePlatformResourceUsageLogQuery` | Query | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useCreatePlatformResourceUsageLogMutation` | Mutation | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useUpdatePlatformResourceUsageLogMutation` | Mutation | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useDeletePlatformResourceUsageLogMutation` | Mutation | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `usePlatformResourceUsageSummariesQuery` | Query | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `usePlatformResourceUsageSummaryQuery` | Query | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useCreatePlatformResourceUsageSummaryMutation` | Mutation | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useUpdatePlatformResourceUsageSummaryMutation` | Mutation | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useDeletePlatformResourceUsageSummaryMutation` | Mutation | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `usePlatformResourceUtilizationsQuery` | Query | List all platformResourceUtilizations |
| `useCreatePlatformResourceUtilizationMutation` | Mutation | Create a platformResourceUtilization |
| `usePlatformResourcesHealthsQuery` | Query | List all platformResourcesHealths |
| `usePlatformResourcesHealthQuery` | Query | Get one platformResourcesHealth |
| `useCreatePlatformResourcesHealthMutation` | Mutation | Create a platformResourcesHealth |
| `useUpdatePlatformResourcesHealthMutation` | Mutation | Update a platformResourcesHealth |
| `useDeletePlatformResourcesHealthMutation` | Mutation | Delete a platformResourcesHealth |
| `usePlatformResourcesRequirementsStatesQuery` | Query | List all platformResourcesRequirementsStates |
| `useCreatePlatformResourcesRequirementsStateMutation` | Mutation | Create a platformResourcesRequirementsState |
| `usePlatformResourcesResolvedRequirementsQuery` | Query | List all platformResourcesResolvedRequirements |
| `useCreatePlatformResourcesResolvedRequirementMutation` | Mutation | Create a platformResourcesResolvedRequirement |
| `usePlatformWebhookEndpointsQuery` | Query | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `usePlatformWebhookEndpointQuery` | Query | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useCreatePlatformWebhookEndpointMutation` | Mutation | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useUpdatePlatformWebhookEndpointMutation` | Mutation | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useDeletePlatformWebhookEndpointMutation` | Mutation | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `usePlatformWebhookEventsQuery` | Query | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `usePlatformWebhookEventQuery` | Query | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useCreatePlatformWebhookEventMutation` | Mutation | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useUpdatePlatformWebhookEventMutation` | Mutation | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useDeletePlatformWebhookEventMutation` | Mutation | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useProposalCommentsQuery` | Query | Comments on a local proposal, optionally anchored to a line |
| `useProposalCommentQuery` | Query | Comments on a local proposal, optionally anchored to a line |
| `useCreateProposalCommentMutation` | Mutation | Comments on a local proposal, optionally anchored to a line |
| `useUpdateProposalCommentMutation` | Mutation | Comments on a local proposal, optionally anchored to a line |
| `useDeleteProposalCommentMutation` | Mutation | Comments on a local proposal, optionally anchored to a line |
| `useProposalsQuery` | Query | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useProposalQuery` | Query | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useCreateProposalMutation` | Mutation | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useUpdateProposalMutation` | Mutation | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useDeleteProposalMutation` | Mutation | Proposals against a repository: issues, changes to merge, discussions and decisions |
| `useProposalFileViewsQuery` | Query | Files a reviewer has read, pinned to the blob they read |
| `useProposalFileViewQuery` | Query | Files a reviewer has read, pinned to the blob they read |
| `useCreateProposalFileViewMutation` | Mutation | Files a reviewer has read, pinned to the blob they read |
| `useUpdateProposalFileViewMutation` | Mutation | Files a reviewer has read, pinned to the blob they read |
| `useDeleteProposalFileViewMutation` | Mutation | Files a reviewer has read, pinned to the blob they read |
| `useProposalReactionsQuery` | Query | Emoji reactions to a local proposal or one of its comments |
| `useProposalReactionQuery` | Query | Emoji reactions to a local proposal or one of its comments |
| `useCreateProposalReactionMutation` | Mutation | Emoji reactions to a local proposal or one of its comments |
| `useUpdateProposalReactionMutation` | Mutation | Emoji reactions to a local proposal or one of its comments |
| `useDeleteProposalReactionMutation` | Mutation | Emoji reactions to a local proposal or one of its comments |
| `useProposalReviewsQuery` | Query | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useProposalReviewQuery` | Query | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useCreateProposalReviewMutation` | Mutation | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useUpdateProposalReviewMutation` | Mutation | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useDeleteProposalReviewMutation` | Mutation | Review verdicts on a proposal, each pinned to the commit reviewed |
| `useProposalsChunksQuery` | Query | List all proposalsChunks |
| `useProposalsChunkQuery` | Query | Get one proposalsChunk |
| `useCreateProposalsChunkMutation` | Mutation | Create a proposalsChunk |
| `useUpdateProposalsChunkMutation` | Mutation | Update a proposalsChunk |
| `useDeleteProposalsChunkMutation` | Mutation | Delete a proposalsChunk |
| `useRegistryBindingsQuery` | Query | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useRegistryBindingQuery` | Query | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useCreateRegistryBindingMutation` | Mutation | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useUpdateRegistryBindingMutation` | Mutation | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useDeleteRegistryBindingMutation` | Mutation | Binds a namespace to an installed container registry for a lane (realm) — the reconciler projects that registry's credentials into the namespace as an image pull secret |
| `useRegistriesQuery` | Query | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useRegistryQuery` | Query | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useCreateRegistryMutation` | Mutation | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useUpdateRegistryMutation` | Mutation | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useDeleteRegistryMutation` | Mutation | Artifact registries this scope pulls from or pushes to (OCI images, npm packages), platform-run or external |
| `useRegistryGrantsQuery` | Query | Grants that make a registry usable by one scope |
| `useRegistryGrantQuery` | Query | Grants that make a registry usable by one scope |
| `useCreateRegistryGrantMutation` | Mutation | Grants that make a registry usable by one scope |
| `useUpdateRegistryGrantMutation` | Mutation | Grants that make a registry usable by one scope |
| `useDeleteRegistryGrantMutation` | Mutation | Grants that make a registry usable by one scope |
| `useRepositoriesQuery` | Query | Source repositories, hosted locally or on an external provider |
| `useRepositoryQuery` | Query | Source repositories, hosted locally or on an external provider |
| `useCreateRepositoryMutation` | Mutation | Source repositories, hosted locally or on an external provider |
| `useUpdateRepositoryMutation` | Mutation | Source repositories, hosted locally or on an external provider |
| `useDeleteRepositoryMutation` | Mutation | Source repositories, hosted locally or on an external provider |
| `useRepositoryEventsQuery` | Query | Normalized repository events from local hooks and external providers |
| `useRepositoryEventQuery` | Query | Normalized repository events from local hooks and external providers |
| `useCreateRepositoryEventMutation` | Mutation | Normalized repository events from local hooks and external providers |
| `useUpdateRepositoryEventMutation` | Mutation | Normalized repository events from local hooks and external providers |
| `useDeleteRepositoryEventMutation` | Mutation | Normalized repository events from local hooks and external providers |
| `useRepositoryRequiredChecksQuery` | Query | Workflows required to pass before a repository proposal merges |
| `useRepositoryRequiredCheckQuery` | Query | Workflows required to pass before a repository proposal merges |
| `useCreateRepositoryRequiredCheckMutation` | Mutation | Workflows required to pass before a repository proposal merges |
| `useUpdateRepositoryRequiredCheckMutation` | Mutation | Workflows required to pass before a repository proposal merges |
| `useDeleteRepositoryRequiredCheckMutation` | Mutation | Workflows required to pass before a repository proposal merges |
| `useRepositoryWorkflowsQuery` | Query | Bindings from a repository event to the flow graph that should run |
| `useRepositoryWorkflowQuery` | Query | Bindings from a repository event to the flow graph that should run |
| `useCreateRepositoryWorkflowMutation` | Mutation | Bindings from a repository event to the flow graph that should run |
| `useUpdateRepositoryWorkflowMutation` | Mutation | Bindings from a repository event to the flow graph that should run |
| `useDeleteRepositoryWorkflowMutation` | Mutation | Bindings from a repository event to the flow graph that should run |
| `useResourcesQuery` | Query | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useResourceQuery` | Query | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useCreateResourceMutation` | Mutation | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useUpdateResourceMutation` | Mutation | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useDeleteResourceMutation` | Mutation | Unified K8s resource declarations — stores desired state (spec) and observed state (status) for all resource kinds within a namespace |
| `useResourceDeclaredCapacitiesQuery` | Query | List all resourceDeclaredCapacities |
| `useCreateResourceDeclaredCapacityMutation` | Mutation | Create a resourceDeclaredCapacity |
| `useResourceDefinitionsQuery` | Query | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useResourceDefinitionQuery` | Query | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useCreateResourceDefinitionMutation` | Mutation | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useUpdateResourceDefinitionMutation` | Mutation | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useDeleteResourceDefinitionMutation` | Mutation | Resource definitions — templates for resource kinds declaring default spec and secret/config requirements |
| `useResourceEventsQuery` | Query | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useResourceEventQuery` | Query | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useCreateResourceEventMutation` | Mutation | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useUpdateResourceEventMutation` | Mutation | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useDeleteResourceEventMutation` | Mutation | Resource lifecycle events — audit log of provisioning, updates, and failure events |
| `useResourceInstallationsQuery` | Query | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useResourceInstallationQuery` | Query | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useCreateResourceInstallationMutation` | Mutation | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useUpdateResourceInstallationMutation` | Mutation | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useDeleteResourceInstallationMutation` | Mutation | Installed resource bundle ("release") — groups a set of resources; params are merkle-versioned in the scope's shared infra store for rollback |
| `useResourceObservedStoragesQuery` | Query | List all resourceObservedStorages |
| `useCreateResourceObservedStorageMutation` | Mutation | Create a resourceObservedStorage |
| `useResourceStatusChecksQuery` | Query | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useResourceStatusCheckQuery` | Query | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useCreateResourceStatusCheckMutation` | Mutation | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useUpdateResourceStatusCheckMutation` | Mutation | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useDeleteResourceStatusCheckMutation` | Mutation | On-demand resource status checks — diagnostic snapshots from the runtime (K8s status, conditions, log tails) |
| `useResourceUsageLogsQuery` | Query | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useResourceUsageLogQuery` | Query | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useCreateResourceUsageLogMutation` | Mutation | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useUpdateResourceUsageLogMutation` | Mutation | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useDeleteResourceUsageLogMutation` | Mutation | Raw resource usage log — interval-accounting measurements from heartbeats (self), the reconciler (observer), and the namespace-grain collector (prometheus) |
| `useResourceUsageSummariesQuery` | Query | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useResourceUsageSummaryQuery` | Query | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useCreateResourceUsageSummaryMutation` | Mutation | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useUpdateResourceUsageSummaryMutation` | Mutation | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useDeleteResourceUsageSummaryMutation` | Mutation | Resource usage summaries — runtime seconds, GB-seconds, and max gauges per (resource, namespace, day); resource_id-NULL rows are namespace-grain totals |
| `useResourceUtilizationsQuery` | Query | List all resourceUtilizations |
| `useCreateResourceUtilizationMutation` | Mutation | Create a resourceUtilization |
| `useResourcesHealthsQuery` | Query | List all resourcesHealths |
| `useResourcesHealthQuery` | Query | Get one resourcesHealth |
| `useCreateResourcesHealthMutation` | Mutation | Create a resourcesHealth |
| `useUpdateResourcesHealthMutation` | Mutation | Update a resourcesHealth |
| `useDeleteResourcesHealthMutation` | Mutation | Delete a resourcesHealth |
| `useResourcesRequirementsStatesQuery` | Query | List all resourcesRequirementsStates |
| `useCreateResourcesRequirementsStateMutation` | Mutation | Create a resourcesRequirementsState |
| `useResourcesResolvedRequirementsQuery` | Query | List all resourcesResolvedRequirements |
| `useCreateResourcesResolvedRequirementMutation` | Mutation | Create a resourcesResolvedRequirement |
| `useWebhookEndpointsQuery` | Query | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useWebhookEndpointQuery` | Query | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useCreateWebhookEndpointMutation` | Mutation | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useUpdateWebhookEndpointMutation` | Mutation | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useDeleteWebhookEndpointMutation` | Mutation | Webhook route authority: (host, path) -> function task_identifier invoked through the webhook channel, with provider, signing-secret reference, and replay window |
| `useWebhookEventsQuery` | Query | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useWebhookEventQuery` | Query | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useCreateWebhookEventMutation` | Mutation | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useUpdateWebhookEventMutation` | Mutation | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useDeleteWebhookEventMutation` | Mutation | Durable webhook acceptance log — one row per accepted delivery, deduplicated on (endpoint_id, external_event_id), linked to the pending function invocation it enqueued |
| `useDatabaseReadFunctionGraphQuery` | Query | databaseReadFunctionGraph |
| `useReadFunctionGraphQuery` | Query | readFunctionGraph |
| `useAddEdgeMutation` | Mutation | addEdge |
| `useAddEdgeAndSaveMutation` | Mutation | addEdgeAndSave |
| `useAddNodeMutation` | Mutation | addNode |
| `useAddNodeAndSaveMutation` | Mutation | addNodeAndSave |
| `useApproveNodeMutation` | Mutation | approveNode |
| `useCopyGraphMutation` | Mutation | copyGraph |
| `useDatabaseAddEdgeMutation` | Mutation | databaseAddEdge |
| `useDatabaseAddEdgeAndSaveMutation` | Mutation | databaseAddEdgeAndSave |
| `useDatabaseAddNodeMutation` | Mutation | databaseAddNode |
| `useDatabaseAddNodeAndSaveMutation` | Mutation | databaseAddNodeAndSave |
| `useDatabaseApproveNodeMutation` | Mutation | databaseApproveNode |
| `useDatabaseCopyGraphMutation` | Mutation | databaseCopyGraph |
| `useDatabaseCreateFunctionGraphMutation` | Mutation | databaseCreateFunctionGraph |
| `useDatabaseGraphInitEmptyRepoMutation` | Mutation | databaseGraphInitEmptyRepo |
| `useDatabaseGraphInsertNodeAtPathMutation` | Mutation | databaseGraphInsertNodeAtPath |
| `useDatabaseGraphInsertNodesAtPathsMutation` | Mutation | databaseGraphInsertNodesAtPaths |
| `useDatabaseGraphSetAndCommitMutation` | Mutation | databaseGraphSetAndCommit |
| `useDatabaseGraphSetDataAtPathMutation` | Mutation | databaseGraphSetDataAtPath |
| `useDatabaseGraphSetManyAndCommitMutation` | Mutation | databaseGraphSetManyAndCommit |
| `useDatabaseImportDefinitionsMutation` | Mutation | databaseImportDefinitions |
| `useDatabaseImportGraphJsonMutation` | Mutation | databaseImportGraphJson |
| `useDatabaseSaveGraphMutation` | Mutation | databaseSaveGraph |
| `useDatabaseStartExecutionMutation` | Mutation | databaseStartExecution |
| `useDatabaseValidateFunctionGraphMutation` | Mutation | databaseValidateFunctionGraph |
| `useFunctionExecutionLogsAppendMutation` | Mutation | functionExecutionLogsAppend |
| `useFunctionInvocationsCreatePageMutation` | Mutation | functionInvocationsCreatePage |
| `useFunctionInvocationsCreateSyncMutation` | Mutation | functionInvocationsCreateSync |
| `useImportDefinitionsMutation` | Mutation | importDefinitions |
| `useImportGraphJsonMutation` | Mutation | importGraphJson |
| `useInfraInitEmptyRepoMutation` | Mutation | infraInitEmptyRepo |
| `useInfraInsertNodeAtPathMutation` | Mutation | infraInsertNodeAtPath |
| `useInfraInsertNodesAtPathsMutation` | Mutation | infraInsertNodesAtPaths |
| `useInfraSetAndCommitMutation` | Mutation | infraSetAndCommit |
| `useInfraSetDataAtPathMutation` | Mutation | infraSetDataAtPath |
| `useInfraSetManyAndCommitMutation` | Mutation | infraSetManyAndCommit |
| `useInitEmptyRepoMutation` | Mutation | initEmptyRepo |
| `useInsertNodeAtPathMutation` | Mutation | insertNodeAtPath |
| `useInsertNodesAtPathsMutation` | Mutation | insertNodesAtPaths |
| `usePlatformFunctionExecutionLogsAppendMutation` | Mutation | platformFunctionExecutionLogsAppend |
| `usePlatformFunctionInvocationsCreatePageMutation` | Mutation | platformFunctionInvocationsCreatePage |
| `usePlatformFunctionInvocationsCreateSyncMutation` | Mutation | platformFunctionInvocationsCreateSync |
| `usePlatformInfraInitEmptyRepoMutation` | Mutation | platformInfraInitEmptyRepo |
| `usePlatformInfraInsertNodeAtPathMutation` | Mutation | platformInfraInsertNodeAtPath |
| `usePlatformInfraInsertNodesAtPathsMutation` | Mutation | platformInfraInsertNodesAtPaths |
| `usePlatformInfraSetAndCommitMutation` | Mutation | platformInfraSetAndCommit |
| `usePlatformInfraSetDataAtPathMutation` | Mutation | platformInfraSetDataAtPath |
| `usePlatformInfraSetManyAndCommitMutation` | Mutation | platformInfraSetManyAndCommit |
| `usePlatformResourceInstallationsInstallMutation` | Mutation | platformResourceInstallationsInstall |
| `usePlatformResourceInstallationsRollbackMutation` | Mutation | platformResourceInstallationsRollback |
| `usePlatformResourceInstallationsUninstallMutation` | Mutation | platformResourceInstallationsUninstall |
| `usePlatformResourceInstallationsUpgradeMutation` | Mutation | platformResourceInstallationsUpgrade |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |
| `useResourceInstallationsInstallMutation` | Mutation | resourceInstallationsInstall |
| `useResourceInstallationsRollbackMutation` | Mutation | resourceInstallationsRollback |
| `useResourceInstallationsUninstallMutation` | Mutation | resourceInstallationsUninstall |
| `useResourceInstallationsUpgradeMutation` | Mutation | resourceInstallationsUpgrade |
| `useSaveGraphMutation` | Mutation | saveGraph |
| `useSetAndCommitMutation` | Mutation | setAndCommit |
| `useSetDataAtPathMutation` | Mutation | setDataAtPath |
| `useSetManyAndCommitMutation` | Mutation | setManyAndCommit |
| `useStartExecutionMutation` | Mutation | startExecution |
| `useValidateFunctionGraphMutation` | Mutation | validateFunctionGraph |

## Table Hooks

### Build

```typescript
// List all builds
const { data, isLoading } = useBuildsQuery({
  selection: { fields: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, databaseId: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } },
});

// Get one build
const { data: item } = useBuildQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, databaseId: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } },
});

// Create a build
const { mutate: create } = useCreateBuildMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', attempt: '<Int>', commitSha: '<String>', conclusion: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', eventId: '<UUID>', finishedAt: '<Datetime>', imageRef: '<String>', jobId: '<BigInt>', logs: '<Upload>', matrixKey: '<String>', metadata: '<JSON>', proposalId: '<UUID>', ref: '<String>', repositoryId: '<UUID>', startedAt: '<Datetime>', status: '<String>', updatedByPrincipal: '<UUID>', workflowId: '<UUID>' });
```

### BuildStep

```typescript
// List all buildSteps
const { data, isLoading } = useBuildStepsQuery({
  selection: { fields: { buildId: true, createdByPrincipal: true, databaseId: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } },
});

// Get one buildStep
const { data: item } = useBuildStepQuery({
  id: '<UUID>',
  selection: { fields: { buildId: true, createdByPrincipal: true, databaseId: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } },
});

// Create a buildStep
const { mutate: create } = useCreateBuildStepMutation({
  selection: { fields: { id: true } },
});
create({ buildId: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', exitCode: '<Int>', finishedAt: '<Datetime>', kind: '<String>', logBytes: '<BigInt>', logOffset: '<BigInt>', name: '<String>', parentSeq: '<Int>', recordedAt: '<Datetime>', seq: '<Int>', startedAt: '<Datetime>', status: '<String>', summary: '<JSON>' });
```

### BuilderBinding

```typescript
// List all builderBindings
const { data, isLoading } = useBuilderBindingsQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one builderBinding
const { data: item } = useBuilderBindingQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a builderBinding
const { mutate: create } = useCreateBuilderBindingMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', installationId: '<UUID>', lastError: '<String>', metadata: '<JSON>', namespaceId: '<UUID>', observedHost: '<String>', realm: '<String>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### ContentPreset

```typescript
// List all contentPresets
const { data, isLoading } = useContentPresetsQuery({
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, kind: true, label: true, slug: true, storeId: true, updatedAt: true } },
});

// Get one contentPreset
const { data: item } = useContentPresetQuery({
  id: '<UUID>',
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, kind: true, label: true, slug: true, storeId: true, updatedAt: true } },
});

// Create a contentPreset
const { mutate: create } = useCreateContentPresetMutation({
  selection: { fields: { id: true } },
});
create({ active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', kind: '<String>', label: '<String>', slug: '<String>', storeId: '<UUID>' });
```

### DatabaseFunctionGraph

```typescript
// List all databaseFunctionGraphs
const { data, isLoading } = useDatabaseFunctionGraphsQuery({
  selection: { fields: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } },
});

// Get one databaseFunctionGraph
const { data: item } = useDatabaseFunctionGraphQuery({
  id: '<UUID>',
  selection: { fields: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } },
});

// Create a databaseFunctionGraph
const { mutate: create } = useCreateDatabaseFunctionGraphMutation({
  selection: { fields: { id: true } },
});
create({ context: '<String>', createdBy: '<UUID>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', isValid: '<Boolean>', name: '<String>', storeId: '<UUID>', validationErrors: '<JSON>' });
```

### DatabaseFunctionGraphExecutionCancelRequest

```typescript
// List all databaseFunctionGraphExecutionCancelRequests
const { data, isLoading } = useDatabaseFunctionGraphExecutionCancelRequestsQuery({
  selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } },
});

// Get one databaseFunctionGraphExecutionCancelRequest
const { data: item } = useDatabaseFunctionGraphExecutionCancelRequestQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } },
});

// Create a databaseFunctionGraphExecutionCancelRequest
const { mutate: create } = useCreateDatabaseFunctionGraphExecutionCancelRequestMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', executionId: '<UUID>' });
```

### DatabaseFunctionGraphExecution

```typescript
// List all databaseFunctionGraphExecutions
const { data, isLoading } = useDatabaseFunctionGraphExecutionsQuery({
  selection: { fields: { actorId: true, completedAt: true, currentWave: true, databaseId: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } },
});

// Get one databaseFunctionGraphExecution
const { data: item } = useDatabaseFunctionGraphExecutionQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, completedAt: true, currentWave: true, databaseId: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } },
});

// Create a databaseFunctionGraphExecution
const { mutate: create } = useCreateDatabaseFunctionGraphExecutionMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', completedAt: '<Datetime>', currentWave: '<Int>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', entityId: '<UUID>', entityType: '<String>', errorCode: '<String>', errorMessage: '<String>', executionPlan: '<JSON>', graphId: '<UUID>', inputPayload: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', lastProgressAt: '<Datetime>', maxPendingJobs: '<Int>', maxTicks: '<Int>', nodeOutputs: '<JSON>', organizationId: '<UUID>', outputNames: '<String>', outputNode: '<String>', outputPayload: '<JSON>', outputPort: '<String>', parentExecutionId: '<UUID>', parentInvocationId: '<UUID>', parentNodeName: '<String>', principalId: '<UUID>', startedAt: '<Datetime>', status: '<String>', tickCount: '<Int>', timeoutAt: '<Datetime>' });
```

### DatabaseFunctionGraphExecutionNodeState

```typescript
// List all databaseFunctionGraphExecutionNodeStates
const { data, isLoading } = useDatabaseFunctionGraphExecutionNodeStatesQuery({
  selection: { fields: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, databaseId: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } },
});

// Get one databaseFunctionGraphExecutionNodeState
const { data: item } = useDatabaseFunctionGraphExecutionNodeStateQuery({
  id: '<UUID>',
  selection: { fields: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, databaseId: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } },
});

// Create a databaseFunctionGraphExecutionNodeState
const { mutate: create } = useCreateDatabaseFunctionGraphExecutionNodeStateMutation({
  selection: { fields: { id: true } },
});
create({ callbackInputs: '<JSON>', callbackMeta: '<JSON>', callbackTokenHash: '<String>', completedAt: '<Datetime>', databaseId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionId: '<UUID>', expiryDefaultOutput: '<JSON>', expiryEscalatedAt: '<Datetime>', expiryPolicy: '<String>', nodeName: '<String>', nodePath: '<String>', outputId: '<UUID>', startedAt: '<Datetime>', status: '<String>', waitingDeadlineAt: '<Datetime>', waitingOn: '<String>', waitingSince: '<Datetime>' });
```

### DatabaseFunctionGraphExecutionOutput

```typescript
// List all databaseFunctionGraphExecutionOutputs
const { data, isLoading } = useDatabaseFunctionGraphExecutionOutputsQuery({
  selection: { fields: { createdAt: true, data: true, databaseId: true, hash: true, id: true } },
});

// Get one databaseFunctionGraphExecutionOutput
const { data: item } = useDatabaseFunctionGraphExecutionOutputQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, databaseId: true, hash: true, id: true } },
});

// Create a databaseFunctionGraphExecutionOutput
const { mutate: create } = useCreateDatabaseFunctionGraphExecutionOutputMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', databaseId: '<UUID>', hash: '<Base64EncodedBinary>' });
```

### DatabaseGraphCommit

```typescript
// List all databaseGraphCommits
const { data, isLoading } = useDatabaseGraphCommitsQuery({
  selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } },
});

// Get one databaseGraphCommit
const { data: item } = useDatabaseGraphCommitQuery({
  id: '<UUID>',
  selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } },
});

// Create a databaseGraphCommit
const { mutate: create } = useCreateDatabaseGraphCommitMutation({
  selection: { fields: { id: true } },
});
create({ authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' });
```

### DatabaseGraphGetAllTreeNodesRecord

```typescript
// List all databaseGraphGetAllTreeNodes
const { data, isLoading } = useDatabaseGraphGetAllTreeNodesQuery({
  selection: { fields: { data: true, path: true } },
});

// Create a databaseGraphGetAllTreeNodesRecord
const { mutate: create } = useCreateDatabaseGraphGetAllTreeNodesRecordMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', path: '<String>' });
```

### DatabaseGraphObject

```typescript
// List all databaseGraphObjects
const { data, isLoading } = useDatabaseGraphObjectsQuery({
  selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } },
});

// Get one databaseGraphObject
const { data: item } = useDatabaseGraphObjectQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } },
});

// Create a databaseGraphObject
const { mutate: create } = useCreateDatabaseGraphObjectMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' });
```

### DatabaseGraphRef

```typescript
// List all databaseGraphRefs
const { data, isLoading } = useDatabaseGraphRefsQuery({
  selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } },
});

// Get one databaseGraphRef
const { data: item } = useDatabaseGraphRefQuery({
  id: '<UUID>',
  selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } },
});

// Create a databaseGraphRef
const { mutate: create } = useCreateDatabaseGraphRefMutation({
  selection: { fields: { id: true } },
});
create({ commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' });
```

### DatabaseGraphStore

```typescript
// List all databaseGraphStores
const { data, isLoading } = useDatabaseGraphStoresQuery({
  selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } },
});

// Get one databaseGraphStore
const { data: item } = useDatabaseGraphStoreQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } },
});

// Create a databaseGraphStore
const { mutate: create } = useCreateDatabaseGraphStoreMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', hash: '<UUID>', name: '<String>' });
```

### DbPreset

```typescript
// List all dbPresets
const { data, isLoading } = useDbPresetsQuery({
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, modulesHash: true, slug: true, storeId: true, updatedAt: true } },
});

// Get one dbPreset
const { data: item } = useDbPresetQuery({
  id: '<UUID>',
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, modulesHash: true, slug: true, storeId: true, updatedAt: true } },
});

// Create a dbPreset
const { mutate: create } = useCreateDbPresetMutation({
  selection: { fields: { id: true } },
});
create({ active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', label: '<String>', modulesHash: '<UUID>', slug: '<String>', storeId: '<UUID>' });
```

### FunctionApiBinding

```typescript
// List all functionApiBindings
const { data, isLoading } = useFunctionApiBindingsQuery({
  selection: { fields: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } },
});

// Get one functionApiBinding
const { data: item } = useFunctionApiBindingQuery({
  id: '<UUID>',
  selection: { fields: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } },
});

// Create a functionApiBinding
const { mutate: create } = useCreateFunctionApiBindingMutation({
  selection: { fields: { id: true } },
});
create({ alias: '<String>', apiId: '<UUID>', config: '<JSON>', functionDefinitionId: '<UUID>' });
```

### FunctionCapabilityBinding

```typescript
// List all functionCapabilityBindings
const { data, isLoading } = useFunctionCapabilityBindingsQuery({
  selection: { fields: { bucketId: true, createdAt: true, databaseId: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } },
});

// Get one functionCapabilityBinding
const { data: item } = useFunctionCapabilityBindingQuery({
  id: '<UUID>',
  selection: { fields: { bucketId: true, createdAt: true, databaseId: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } },
});

// Create a functionCapabilityBinding
const { mutate: create } = useCreateFunctionCapabilityBindingMutation({
  selection: { fields: { id: true } },
});
create({ bucketId: '<UUID>', databaseId: '<UUID>', functionId: '<UUID>', graphId: '<UUID>', key: '<String>', lifecycle: '<String>', metadata: '<JSON>' });
```

### FunctionDefinition

```typescript
// List all functionDefinitions
const { data, isLoading } = useFunctionDefinitionsQuery({
  selection: { fields: { accessChannels: true, anonymousCallable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } },
});

// Get one functionDefinition
const { data: item } = useFunctionDefinitionQuery({
  id: '<UUID>',
  selection: { fields: { accessChannels: true, anonymousCallable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, databaseId: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } },
});

// Create a functionDefinition
const { mutate: create } = useCreateFunctionDefinitionMutation({
  selection: { fields: { id: true } },
});
create({ accessChannels: '<String>', anonymousCallable: '<Boolean>', category: '<String>', concurrency: '<Int>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', fnCategory: '<String>', functionColumns: '<JSON>', graphId: '<UUID>', icon: '<String>', image: '<String>', inputs: '<JSON>', integrations: '<String>', isPublished: '<Boolean>', maxAttempts: '<Int>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', moduleTable: '<String>', name: '<String>', outputs: '<JSON>', payloadArgs: '<JSON>', priority: '<Int>', props: '<JSON>', protected: '<Boolean>', publishedAt: '<Datetime>', queueName: '<String>', requiredBuckets: '<String>', requiredCapabilities: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredModels: '<String>', requiredModules: '<String>', requiredSecrets: '<ResourceRequirement>', resources: '<JSON>', runtime: '<String>', scaleMax: '<Int>', scaleMin: '<Int>', targetFunction: '<String>', targetSchema: '<String>', taskIdentifier: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>', volatile: '<Boolean>' });
```

### FunctionDeployment

```typescript
// List all functionDeployments
const { data, isLoading } = useFunctionDeploymentsQuery({
  selection: { fields: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, databaseId: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one functionDeployment
const { data: item } = useFunctionDeploymentQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, databaseId: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a functionDeployment
const { mutate: create } = useCreateFunctionDeploymentMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', concurrency: '<Int>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', errorCount: '<Int>', handlerName: '<String>', image: '<String>', imageVersion: '<String>', labels: '<JSON>', lastError: '<String>', lastErrorAt: '<Datetime>', namespaceId: '<UUID>', realm: '<String>', resources: '<JSON>', revision: '<Int>', scaleMax: '<Int>', scaleMin: '<Int>', serviceName: '<String>', serviceUrl: '<String>', status: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>' });
```

### FunctionDeploymentEvent

```typescript
// List all functionDeploymentEvents
const { data, isLoading } = useFunctionDeploymentEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } },
});

// Get one functionDeploymentEvent
const { data: item } = useFunctionDeploymentEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } },
});

// Create a functionDeploymentEvent
const { mutate: create } = useCreateFunctionDeploymentEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', databaseId: '<UUID>', deploymentId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>' });
```

### FunctionExecutionLog

```typescript
// List all functionExecutionLogs
const { data, isLoading } = useFunctionExecutionLogsQuery({
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Get one functionExecutionLog
const { data: item } = useFunctionExecutionLogQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Create a functionExecutionLog
const { mutate: create } = useCreateFunctionExecutionLogMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', databaseId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' });
```

### FunctionGraphCommit

```typescript
// List all functionGraphCommits
const { data, isLoading } = useFunctionGraphCommitsQuery({
  selection: { fields: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } },
});

// Get one functionGraphCommit
const { data: item } = useFunctionGraphCommitQuery({
  id: '<UUID>',
  selection: { fields: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } },
});

// Create a functionGraphCommit
const { mutate: create } = useCreateFunctionGraphCommitMutation({
  selection: { fields: { id: true } },
});
create({ authorId: '<UUID>', committerId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', scopeId: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' });
```

### FunctionGraph

```typescript
// List all functionGraphs
const { data, isLoading } = useFunctionGraphsQuery({
  selection: { fields: { context: true, createdAt: true, createdBy: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, scopeId: true, storeId: true, updatedAt: true, validationErrors: true } },
});

// Get one functionGraph
const { data: item } = useFunctionGraphQuery({
  id: '<UUID>',
  selection: { fields: { context: true, createdAt: true, createdBy: true, definitionsCommitId: true, description: true, id: true, isValid: true, name: true, scopeId: true, storeId: true, updatedAt: true, validationErrors: true } },
});

// Create a functionGraph
const { mutate: create } = useCreateFunctionGraphMutation({
  selection: { fields: { id: true } },
});
create({ context: '<String>', createdBy: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', isValid: '<Boolean>', name: '<String>', scopeId: '<UUID>', storeId: '<UUID>', validationErrors: '<JSON>' });
```

### FunctionGraphExecutionCancelRequest

```typescript
// List all functionGraphExecutionCancelRequests
const { data, isLoading } = useFunctionGraphExecutionCancelRequestsQuery({
  selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } },
});

// Get one functionGraphExecutionCancelRequest
const { data: item } = useFunctionGraphExecutionCancelRequestQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, executionId: true, id: true } },
});

// Create a functionGraphExecutionCancelRequest
const { mutate: create } = useCreateFunctionGraphExecutionCancelRequestMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', executionId: '<UUID>' });
```

### FunctionGraphExecution

```typescript
// List all functionGraphExecutions
const { data, isLoading } = useFunctionGraphExecutionsQuery({
  selection: { fields: { actorId: true, completedAt: true, currentWave: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, scopeId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } },
});

// Get one functionGraphExecution
const { data: item } = useFunctionGraphExecutionQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, completedAt: true, currentWave: true, definitionsCommitId: true, entityId: true, entityType: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationCreatedAt: true, invocationId: true, lastProgressAt: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, organizationId: true, outputNames: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentInvocationId: true, parentNodeName: true, principalId: true, scopeId: true, startedAt: true, status: true, tickCount: true, timeoutAt: true } },
});

// Create a functionGraphExecution
const { mutate: create } = useCreateFunctionGraphExecutionMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', completedAt: '<Datetime>', currentWave: '<Int>', definitionsCommitId: '<UUID>', entityId: '<UUID>', entityType: '<String>', errorCode: '<String>', errorMessage: '<String>', executionPlan: '<JSON>', graphId: '<UUID>', inputPayload: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', lastProgressAt: '<Datetime>', maxPendingJobs: '<Int>', maxTicks: '<Int>', nodeOutputs: '<JSON>', organizationId: '<UUID>', outputNames: '<String>', outputNode: '<String>', outputPayload: '<JSON>', outputPort: '<String>', parentExecutionId: '<UUID>', parentInvocationId: '<UUID>', parentNodeName: '<String>', principalId: '<UUID>', scopeId: '<UUID>', startedAt: '<Datetime>', status: '<String>', tickCount: '<Int>', timeoutAt: '<Datetime>' });
```

### FunctionGraphExecutionNodeState

```typescript
// List all functionGraphExecutionNodeStates
const { data, isLoading } = useFunctionGraphExecutionNodeStatesQuery({
  selection: { fields: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, scopeId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } },
});

// Get one functionGraphExecutionNodeState
const { data: item } = useFunctionGraphExecutionNodeStateQuery({
  id: '<UUID>',
  selection: { fields: { callbackInputs: true, callbackMeta: true, callbackTokenHash: true, completedAt: true, createdAt: true, errorCode: true, errorMessage: true, executionId: true, expiryDefaultOutput: true, expiryEscalatedAt: true, expiryPolicy: true, id: true, nodeName: true, nodePath: true, outputId: true, scopeId: true, startedAt: true, status: true, waitingDeadlineAt: true, waitingOn: true, waitingSince: true } },
});

// Create a functionGraphExecutionNodeState
const { mutate: create } = useCreateFunctionGraphExecutionNodeStateMutation({
  selection: { fields: { id: true } },
});
create({ callbackInputs: '<JSON>', callbackMeta: '<JSON>', callbackTokenHash: '<String>', completedAt: '<Datetime>', errorCode: '<String>', errorMessage: '<String>', executionId: '<UUID>', expiryDefaultOutput: '<JSON>', expiryEscalatedAt: '<Datetime>', expiryPolicy: '<String>', nodeName: '<String>', nodePath: '<String>', outputId: '<UUID>', scopeId: '<UUID>', startedAt: '<Datetime>', status: '<String>', waitingDeadlineAt: '<Datetime>', waitingOn: '<String>', waitingSince: '<Datetime>' });
```

### FunctionGraphExecutionOutput

```typescript
// List all functionGraphExecutionOutputs
const { data, isLoading } = useFunctionGraphExecutionOutputsQuery({
  selection: { fields: { createdAt: true, data: true, hash: true, id: true, scopeId: true } },
});

// Get one functionGraphExecutionOutput
const { data: item } = useFunctionGraphExecutionOutputQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, hash: true, id: true, scopeId: true } },
});

// Create a functionGraphExecutionOutput
const { mutate: create } = useCreateFunctionGraphExecutionOutputMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', hash: '<Base64EncodedBinary>', scopeId: '<UUID>' });
```

### FunctionGraphObject

```typescript
// List all functionGraphObjects
const { data, isLoading } = useFunctionGraphObjectsQuery({
  selection: { fields: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } },
});

// Get one functionGraphObject
const { data: item } = useFunctionGraphObjectQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } },
});

// Create a functionGraphObject
const { mutate: create } = useCreateFunctionGraphObjectMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', kids: '<UUID>', ktree: '<String>', scopeId: '<UUID>' });
```

### FunctionGraphRef

```typescript
// List all functionGraphRefs
const { data, isLoading } = useFunctionGraphRefsQuery({
  selection: { fields: { commitId: true, id: true, name: true, scopeId: true, storeId: true } },
});

// Get one functionGraphRef
const { data: item } = useFunctionGraphRefQuery({
  id: '<UUID>',
  selection: { fields: { commitId: true, id: true, name: true, scopeId: true, storeId: true } },
});

// Create a functionGraphRef
const { mutate: create } = useCreateFunctionGraphRefMutation({
  selection: { fields: { id: true } },
});
create({ commitId: '<UUID>', name: '<String>', scopeId: '<UUID>', storeId: '<UUID>' });
```

### FunctionGraphStore

```typescript
// List all functionGraphStores
const { data, isLoading } = useFunctionGraphStoresQuery({
  selection: { fields: { createdAt: true, hash: true, id: true, name: true, scopeId: true } },
});

// Get one functionGraphStore
const { data: item } = useFunctionGraphStoreQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, hash: true, id: true, name: true, scopeId: true } },
});

// Create a functionGraphStore
const { mutate: create } = useCreateFunctionGraphStoreMutation({
  selection: { fields: { id: true } },
});
create({ hash: '<UUID>', name: '<String>', scopeId: '<UUID>' });
```

### FunctionInvocationAttempt

```typescript
// List all functionInvocationAttempts
const { data, isLoading } = useFunctionInvocationAttemptsQuery({
  selection: { fields: { actorId: true, attempt: true, createdAt: true, databaseId: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } },
});

// Get one functionInvocationAttempt
const { data: item } = useFunctionInvocationAttemptQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, attempt: true, createdAt: true, databaseId: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } },
});

// Create a functionInvocationAttempt
const { mutate: create } = useCreateFunctionInvocationAttemptMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', attempt: '<Int>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', errorDetail: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', startedAt: '<Datetime>', success: '<Boolean>', taskIdentifier: '<String>' });
```

### FunctionInvocation

```typescript
// List all functionInvocations
const { data, isLoading } = useFunctionInvocationsQuery({
  selection: { fields: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Get one functionInvocation
const { data: item } = useFunctionInvocationQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Create a functionInvocation
const { mutate: create } = useCreateFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```

### FunctionSchedule

```typescript
// List all functionSchedules
const { data, isLoading } = useFunctionSchedulesQuery({
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } },
});

// Get one functionSchedule
const { data: item } = useFunctionScheduleQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } },
});

// Create a functionSchedule
const { mutate: create } = useCreateFunctionScheduleMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', databaseId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' });
```

### GetAllTreeNodesRecord

```typescript
// List all getAllTreeNodes
const { data, isLoading } = useGetAllTreeNodesQuery({
  selection: { fields: { data: true, path: true } },
});

// Create a getAllTreeNodesRecord
const { mutate: create } = useCreateGetAllTreeNodesRecordMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', path: '<String>' });
```

### Image

```typescript
// List all images
const { data, isLoading } = useImagesQuery({
  selection: { fields: { createdAt: true, createdByPrincipal: true, databaseId: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one image
const { data: item } = useImageQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdByPrincipal: true, databaseId: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a image
const { mutate: create } = useCreateImageMutation({
  selection: { fields: { id: true } },
});
create({ createdByPrincipal: '<UUID>', databaseId: '<UUID>', description: '<String>', digest: '<String>', expiresAt: '<Datetime>', isPublished: '<Boolean>', labels: '<JSON>', metadata: '<JSON>', name: '<String>', ownerId: '<UUID>', platformOnly: '<Boolean>', registryHost: '<String>', repository: '<String>', runtime: '<String>', tag: '<String>', updatedByPrincipal: '<UUID>' });
```

### ImageGrant

```typescript
// List all imageGrants
const { data, isLoading } = useImageGrantsQuery({
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one imageGrant
const { data: item } = useImageGrantQuery({
  id: '<UUID>',
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a imageGrant
const { mutate: create } = useCreateImageGrantMutation({
  selection: { fields: { id: true } },
});
create({ actions: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', imageId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### InfraCommit

```typescript
// List all infraCommits
const { data, isLoading } = useInfraCommitsQuery({
  selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } },
});

// Get one infraCommit
const { data: item } = useInfraCommitQuery({
  id: '<UUID>',
  selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } },
});

// Create a infraCommit
const { mutate: create } = useCreateInfraCommitMutation({
  selection: { fields: { id: true } },
});
create({ authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' });
```

### InfraGetAllTreeNodesRecord

```typescript
// List all infraGetAllTreeNodes
const { data, isLoading } = useInfraGetAllTreeNodesQuery({
  selection: { fields: { data: true, path: true } },
});

// Create a infraGetAllTreeNodesRecord
const { mutate: create } = useCreateInfraGetAllTreeNodesRecordMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', path: '<String>' });
```

### InfraObject

```typescript
// List all infraObjects
const { data, isLoading } = useInfraObjectsQuery({
  selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } },
});

// Get one infraObject
const { data: item } = useInfraObjectQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } },
});

// Create a infraObject
const { mutate: create } = useCreateInfraObjectMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' });
```

### InfraRef

```typescript
// List all infraRefs
const { data, isLoading } = useInfraRefsQuery({
  selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } },
});

// Get one infraRef
const { data: item } = useInfraRefQuery({
  id: '<UUID>',
  selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } },
});

// Create a infraRef
const { mutate: create } = useCreateInfraRefMutation({
  selection: { fields: { id: true } },
});
create({ commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' });
```

### InfraStore

```typescript
// List all infraStores
const { data, isLoading } = useInfraStoresQuery({
  selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } },
});

// Get one infraStore
const { data: item } = useInfraStoreQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } },
});

// Create a infraStore
const { mutate: create } = useCreateInfraStoreMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', hash: '<UUID>', name: '<String>' });
```

### IntegrationProvider

```typescript
// List all integrationProviders
const { data, isLoading } = useIntegrationProvidersQuery({
  selection: { fields: { brand: true, category: true, createdAt: true, description: true, icon: true, id: true, logo: true, name: true, requiredConfigs: true, requiredSecrets: true, slug: true, updatedAt: true } },
});

// Get one integrationProvider
const { data: item } = useIntegrationProviderQuery({
  id: '<UUID>',
  selection: { fields: { brand: true, category: true, createdAt: true, description: true, icon: true, id: true, logo: true, name: true, requiredConfigs: true, requiredSecrets: true, slug: true, updatedAt: true } },
});

// Create a integrationProvider
const { mutate: create } = useCreateIntegrationProviderMutation({
  selection: { fields: { id: true } },
});
create({ brand: '<JSON>', category: '<String>', description: '<String>', icon: '<String>', logo: '<Image>', name: '<String>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', slug: '<String>' });
```

### Namespace

```typescript
// List all namespaces
const { data, isLoading } = useNamespacesQuery({
  selection: { fields: { annotations: true, clusterId: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } },
});

// Get one namespace
const { data: item } = useNamespaceQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, clusterId: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } },
});

// Create a namespace
const { mutate: create } = useCreateNamespaceMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', clusterId: '<UUID>', databaseId: '<UUID>', description: '<String>', isActive: '<Boolean>', isManaged: '<Boolean>', labels: '<JSON>', lastError: '<String>', name: '<String>', namespaceName: '<String>', status: '<String>' });
```

### NamespaceEvent

```typescript
// List all namespaceEvents
const { data, isLoading } = useNamespaceEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } },
});

// Get one namespaceEvent
const { data: item } = useNamespaceEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } },
});

// Create a namespaceEvent
const { mutate: create } = useCreateNamespaceEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', databaseId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', namespaceId: '<UUID>' });
```

### PlatformBuild

```typescript
// List all platformBuilds
const { data, isLoading } = usePlatformBuildsQuery({
  selection: { fields: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } },
});

// Get one platformBuild
const { data: item } = usePlatformBuildQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, attempt: true, commitSha: true, conclusion: true, createdAt: true, createdByPrincipal: true, eventId: true, finishedAt: true, id: true, imageRef: true, jobId: true, logs: true, matrixKey: true, metadata: true, proposalId: true, ref: true, repositoryId: true, startedAt: true, status: true, updatedAt: true, updatedByPrincipal: true, workflowId: true } },
});

// Create a platformBuild
const { mutate: create } = useCreatePlatformBuildMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', attempt: '<Int>', commitSha: '<String>', conclusion: '<String>', createdByPrincipal: '<UUID>', eventId: '<UUID>', finishedAt: '<Datetime>', imageRef: '<String>', jobId: '<BigInt>', logs: '<Upload>', matrixKey: '<String>', metadata: '<JSON>', proposalId: '<UUID>', ref: '<String>', repositoryId: '<UUID>', startedAt: '<Datetime>', status: '<String>', updatedByPrincipal: '<UUID>', workflowId: '<UUID>' });
```

### PlatformBuildStep

```typescript
// List all platformBuildSteps
const { data, isLoading } = usePlatformBuildStepsQuery({
  selection: { fields: { buildId: true, createdByPrincipal: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } },
});

// Get one platformBuildStep
const { data: item } = usePlatformBuildStepQuery({
  id: '<UUID>',
  selection: { fields: { buildId: true, createdByPrincipal: true, exitCode: true, finishedAt: true, id: true, kind: true, logBytes: true, logOffset: true, name: true, parentSeq: true, recordedAt: true, seq: true, startedAt: true, status: true, summary: true } },
});

// Create a platformBuildStep
const { mutate: create } = useCreatePlatformBuildStepMutation({
  selection: { fields: { id: true } },
});
create({ buildId: '<UUID>', createdByPrincipal: '<UUID>', exitCode: '<Int>', finishedAt: '<Datetime>', kind: '<String>', logBytes: '<BigInt>', logOffset: '<BigInt>', name: '<String>', parentSeq: '<Int>', recordedAt: '<Datetime>', seq: '<Int>', startedAt: '<Datetime>', status: '<String>', summary: '<JSON>' });
```

### PlatformBuilderBinding

```typescript
// List all platformBuilderBindings
const { data, isLoading } = usePlatformBuilderBindingsQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformBuilderBinding
const { data: item } = usePlatformBuilderBindingQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, installationId: true, lastError: true, metadata: true, namespaceId: true, observedHost: true, realm: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformBuilderBinding
const { mutate: create } = useCreatePlatformBuilderBindingMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', installationId: '<UUID>', lastError: '<String>', metadata: '<JSON>', namespaceId: '<UUID>', observedHost: '<String>', realm: '<String>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformFunctionApiBinding

```typescript
// List all platformFunctionApiBindings
const { data, isLoading } = usePlatformFunctionApiBindingsQuery({
  selection: { fields: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } },
});

// Get one platformFunctionApiBinding
const { data: item } = usePlatformFunctionApiBindingQuery({
  id: '<UUID>',
  selection: { fields: { alias: true, apiId: true, config: true, createdAt: true, functionDefinitionId: true, id: true, updatedAt: true } },
});

// Create a platformFunctionApiBinding
const { mutate: create } = useCreatePlatformFunctionApiBindingMutation({
  selection: { fields: { id: true } },
});
create({ alias: '<String>', apiId: '<UUID>', config: '<JSON>', functionDefinitionId: '<UUID>' });
```

### PlatformFunctionCapabilityBinding

```typescript
// List all platformFunctionCapabilityBindings
const { data, isLoading } = usePlatformFunctionCapabilityBindingsQuery({
  selection: { fields: { bucketId: true, createdAt: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } },
});

// Get one platformFunctionCapabilityBinding
const { data: item } = usePlatformFunctionCapabilityBindingQuery({
  id: '<UUID>',
  selection: { fields: { bucketId: true, createdAt: true, functionId: true, graphId: true, id: true, key: true, lifecycle: true, metadata: true, updatedAt: true } },
});

// Create a platformFunctionCapabilityBinding
const { mutate: create } = useCreatePlatformFunctionCapabilityBindingMutation({
  selection: { fields: { id: true } },
});
create({ bucketId: '<UUID>', functionId: '<UUID>', graphId: '<UUID>', key: '<String>', lifecycle: '<String>', metadata: '<JSON>' });
```

### PlatformFunctionDefinition

```typescript
// List all platformFunctionDefinitions
const { data, isLoading } = usePlatformFunctionDefinitionsQuery({
  selection: { fields: { accessChannels: true, anonymousCallable: true, billable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, system: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } },
});

// Get one platformFunctionDefinition
const { data: item } = usePlatformFunctionDefinitionQuery({
  id: '<UUID>',
  selection: { fields: { accessChannels: true, anonymousCallable: true, billable: true, category: true, concurrency: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdByPrincipal: true, description: true, fnCategory: true, functionColumns: true, graphId: true, icon: true, id: true, image: true, inputs: true, integrations: true, isPublished: true, maxAttempts: true, memoryLimitBytes: true, memoryRequestBytes: true, moduleTable: true, name: true, outputs: true, payloadArgs: true, priority: true, props: true, protected: true, publishedAt: true, queueName: true, requiredBuckets: true, requiredCapabilities: true, requiredConfigs: true, requiredModels: true, requiredModules: true, requiredSecrets: true, resources: true, runtime: true, scaleMax: true, scaleMin: true, system: true, targetFunction: true, targetSchema: true, taskIdentifier: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true, volatile: true } },
});

// Create a platformFunctionDefinition
const { mutate: create } = useCreatePlatformFunctionDefinitionMutation({
  selection: { fields: { id: true } },
});
create({ accessChannels: '<String>', anonymousCallable: '<Boolean>', billable: '<Boolean>', category: '<String>', concurrency: '<Int>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdByPrincipal: '<UUID>', description: '<String>', fnCategory: '<String>', functionColumns: '<JSON>', graphId: '<UUID>', icon: '<String>', image: '<String>', inputs: '<JSON>', integrations: '<String>', isPublished: '<Boolean>', maxAttempts: '<Int>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', moduleTable: '<String>', name: '<String>', outputs: '<JSON>', payloadArgs: '<JSON>', priority: '<Int>', props: '<JSON>', protected: '<Boolean>', publishedAt: '<Datetime>', queueName: '<String>', requiredBuckets: '<String>', requiredCapabilities: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredModels: '<String>', requiredModules: '<String>', requiredSecrets: '<ResourceRequirement>', resources: '<JSON>', runtime: '<String>', scaleMax: '<Int>', scaleMin: '<Int>', system: '<Boolean>', targetFunction: '<String>', targetSchema: '<String>', taskIdentifier: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>', volatile: '<Boolean>' });
```

### PlatformFunctionDeployment

```typescript
// List all platformFunctionDeployments
const { data, isLoading } = usePlatformFunctionDeploymentsQuery({
  selection: { fields: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one platformFunctionDeployment
const { data: item } = usePlatformFunctionDeploymentQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, concurrency: true, createdAt: true, createdByPrincipal: true, errorCount: true, handlerName: true, id: true, image: true, imageVersion: true, labels: true, lastError: true, lastErrorAt: true, namespaceId: true, realm: true, resources: true, revision: true, scaleMax: true, scaleMin: true, serviceName: true, serviceUrl: true, status: true, timeoutSeconds: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a platformFunctionDeployment
const { mutate: create } = useCreatePlatformFunctionDeploymentMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', concurrency: '<Int>', createdByPrincipal: '<UUID>', errorCount: '<Int>', handlerName: '<String>', image: '<String>', imageVersion: '<String>', labels: '<JSON>', lastError: '<String>', lastErrorAt: '<Datetime>', namespaceId: '<UUID>', realm: '<String>', resources: '<JSON>', revision: '<Int>', scaleMax: '<Int>', scaleMin: '<Int>', serviceName: '<String>', serviceUrl: '<String>', status: '<String>', timeoutSeconds: '<Int>', updatedByPrincipal: '<UUID>' });
```

### PlatformFunctionDeploymentEvent

```typescript
// List all platformFunctionDeploymentEvents
const { data, isLoading } = usePlatformFunctionDeploymentEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } },
});

// Get one platformFunctionDeploymentEvent
const { data: item } = usePlatformFunctionDeploymentEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, deploymentId: true, eventType: true, id: true, message: true, metadata: true } },
});

// Create a platformFunctionDeploymentEvent
const { mutate: create } = useCreatePlatformFunctionDeploymentEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', deploymentId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>' });
```

### PlatformFunctionExecutionLog

```typescript
// List all platformFunctionExecutionLogs
const { data, isLoading } = usePlatformFunctionExecutionLogsQuery({
  selection: { fields: { actorId: true, createdAt: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Get one platformFunctionExecutionLog
const { data: item } = usePlatformFunctionExecutionLogQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Create a platformFunctionExecutionLog
const { mutate: create } = useCreatePlatformFunctionExecutionLogMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' });
```

### PlatformFunctionInvocationAttempt

```typescript
// List all platformFunctionInvocationAttempts
const { data, isLoading } = usePlatformFunctionInvocationAttemptsQuery({
  selection: { fields: { actorId: true, attempt: true, createdAt: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } },
});

// Get one platformFunctionInvocationAttempt
const { data: item } = usePlatformFunctionInvocationAttemptQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, attempt: true, createdAt: true, durationMs: true, error: true, errorDetail: true, id: true, invocationCreatedAt: true, invocationId: true, startedAt: true, success: true, taskIdentifier: true } },
});

// Create a platformFunctionInvocationAttempt
const { mutate: create } = useCreatePlatformFunctionInvocationAttemptMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', attempt: '<Int>', durationMs: '<Int>', error: '<String>', errorDetail: '<JSON>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', startedAt: '<Datetime>', success: '<Boolean>', taskIdentifier: '<String>' });
```

### PlatformFunctionInvocation

```typescript
// List all platformFunctionInvocations
const { data, isLoading } = usePlatformFunctionInvocationsQuery({
  selection: { fields: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Get one platformFunctionInvocation
const { data: item } = usePlatformFunctionInvocationQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, apiBindingId: true, channel: true, completedAt: true, createdAt: true, createdByPrincipal: true, databaseId: true, definitionScope: true, durationMs: true, entityId: true, entityType: true, error: true, functionDefinitionId: true, graphExecutionId: true, id: true, jobId: true, organizationId: true, parentInvocationId: true, payload: true, principalId: true, provenance: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Create a platformFunctionInvocation
const { mutate: create } = useCreatePlatformFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', apiBindingId: '<UUID>', channel: '<String>', completedAt: '<Datetime>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', definitionScope: '<String>', durationMs: '<Int>', entityId: '<UUID>', entityType: '<String>', error: '<String>', functionDefinitionId: '<UUID>', graphExecutionId: '<UUID>', jobId: '<BigInt>', organizationId: '<UUID>', parentInvocationId: '<UUID>', payload: '<JSON>', principalId: '<UUID>', provenance: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```

### PlatformFunctionSchedule

```typescript
// List all platformFunctionSchedules
const { data, isLoading } = usePlatformFunctionSchedulesQuery({
  selection: { fields: { actorId: true, createdAt: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } },
});

// Get one platformFunctionSchedule
const { data: item } = usePlatformFunctionScheduleQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, description: true, functionDefinitionId: true, id: true, isActive: true, name: true, payload: true, scheduleInfo: true, suspendedAt: true, suspendedReason: true, updatedAt: true } },
});

// Create a platformFunctionSchedule
const { mutate: create } = useCreatePlatformFunctionScheduleMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', description: '<String>', functionDefinitionId: '<UUID>', isActive: '<Boolean>', name: '<String>', payload: '<JSON>', scheduleInfo: '<JSON>', suspendedAt: '<Datetime>', suspendedReason: '<String>' });
```

### PlatformImage

```typescript
// List all platformImages
const { data, isLoading } = usePlatformImagesQuery({
  selection: { fields: { createdAt: true, createdByPrincipal: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one platformImage
const { data: item } = usePlatformImageQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdByPrincipal: true, description: true, digest: true, expiresAt: true, id: true, isPublished: true, labels: true, metadata: true, name: true, ownerId: true, platformOnly: true, registryHost: true, repository: true, runtime: true, tag: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a platformImage
const { mutate: create } = useCreatePlatformImageMutation({
  selection: { fields: { id: true } },
});
create({ createdByPrincipal: '<UUID>', description: '<String>', digest: '<String>', expiresAt: '<Datetime>', isPublished: '<Boolean>', labels: '<JSON>', metadata: '<JSON>', name: '<String>', ownerId: '<UUID>', platformOnly: '<Boolean>', registryHost: '<String>', repository: '<String>', runtime: '<String>', tag: '<String>', updatedByPrincipal: '<UUID>' });
```

### PlatformImageGrant

```typescript
// List all platformImageGrants
const { data, isLoading } = usePlatformImageGrantsQuery({
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one platformImageGrant
const { data: item } = usePlatformImageGrantQuery({
  id: '<UUID>',
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, imageId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a platformImageGrant
const { mutate: create } = useCreatePlatformImageGrantMutation({
  selection: { fields: { id: true } },
});
create({ actions: '<String>', createdByPrincipal: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', imageId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformInfraCommit

```typescript
// List all platformInfraCommits
const { data, isLoading } = usePlatformInfraCommitsQuery({
  selection: { fields: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } },
});

// Get one platformInfraCommit
const { data: item } = usePlatformInfraCommitQuery({
  id: '<UUID>',
  selection: { fields: { authorId: true, committerId: true, date: true, id: true, message: true, parentIds: true, scopeId: true, storeId: true, treeId: true } },
});

// Create a platformInfraCommit
const { mutate: create } = useCreatePlatformInfraCommitMutation({
  selection: { fields: { id: true } },
});
create({ authorId: '<UUID>', committerId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', scopeId: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' });
```

### PlatformInfraGetAllTreeNodesRecord

```typescript
// List all platformInfraGetAllTreeNodes
const { data, isLoading } = usePlatformInfraGetAllTreeNodesQuery({
  selection: { fields: { data: true, path: true } },
});

// Create a platformInfraGetAllTreeNodesRecord
const { mutate: create } = useCreatePlatformInfraGetAllTreeNodesRecordMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', path: '<String>' });
```

### PlatformInfraObject

```typescript
// List all platformInfraObjects
const { data, isLoading } = usePlatformInfraObjectsQuery({
  selection: { fields: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } },
});

// Get one platformInfraObject
const { data: item } = usePlatformInfraObjectQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, id: true, kids: true, ktree: true, scopeId: true } },
});

// Create a platformInfraObject
const { mutate: create } = useCreatePlatformInfraObjectMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', kids: '<UUID>', ktree: '<String>', scopeId: '<UUID>' });
```

### PlatformInfraRef

```typescript
// List all platformInfraRefs
const { data, isLoading } = usePlatformInfraRefsQuery({
  selection: { fields: { commitId: true, id: true, name: true, scopeId: true, storeId: true } },
});

// Get one platformInfraRef
const { data: item } = usePlatformInfraRefQuery({
  id: '<UUID>',
  selection: { fields: { commitId: true, id: true, name: true, scopeId: true, storeId: true } },
});

// Create a platformInfraRef
const { mutate: create } = useCreatePlatformInfraRefMutation({
  selection: { fields: { id: true } },
});
create({ commitId: '<UUID>', name: '<String>', scopeId: '<UUID>', storeId: '<UUID>' });
```

### PlatformInfraStore

```typescript
// List all platformInfraStores
const { data, isLoading } = usePlatformInfraStoresQuery({
  selection: { fields: { createdAt: true, hash: true, id: true, name: true, scopeId: true } },
});

// Get one platformInfraStore
const { data: item } = usePlatformInfraStoreQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, hash: true, id: true, name: true, scopeId: true } },
});

// Create a platformInfraStore
const { mutate: create } = useCreatePlatformInfraStoreMutation({
  selection: { fields: { id: true } },
});
create({ hash: '<UUID>', name: '<String>', scopeId: '<UUID>' });
```

### PlatformK8sResourceKind

```typescript
// List all platformK8sResourceKinds
const { data, isLoading } = usePlatformK8sResourceKindsQuery({
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } },
});

// Get one platformK8sResourceKind
const { data: item } = usePlatformK8sResourceKindQuery({
  id: '<UUID>',
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } },
});

// Create a platformK8sResourceKind
const { mutate: create } = useCreatePlatformK8sResourceKindMutation({
  selection: { fields: { id: true } },
});
create({ active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', label: '<String>', slug: '<String>', storeId: '<UUID>' });
```

### PlatformK8sSpecRule

```typescript
// List all platformK8sSpecRules
const { data, isLoading } = usePlatformK8sSpecRulesQuery({
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } },
});

// Get one platformK8sSpecRule
const { data: item } = usePlatformK8sSpecRuleQuery({
  id: '<UUID>',
  selection: { fields: { active: true, commitId: true, createdAt: true, definition: true, description: true, id: true, label: true, slug: true, storeId: true, updatedAt: true } },
});

// Create a platformK8sSpecRule
const { mutate: create } = useCreatePlatformK8sSpecRuleMutation({
  selection: { fields: { id: true } },
});
create({ active: '<Boolean>', commitId: '<UUID>', definition: '<JSON>', description: '<String>', label: '<String>', slug: '<String>', storeId: '<UUID>' });
```

### PlatformNamespace

```typescript
// List all platformNamespaces
const { data, isLoading } = usePlatformNamespacesQuery({
  selection: { fields: { annotations: true, clusterId: true, createdAt: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } },
});

// Get one platformNamespace
const { data: item } = usePlatformNamespaceQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, clusterId: true, createdAt: true, description: true, id: true, isActive: true, isManaged: true, labels: true, lastError: true, name: true, namespaceName: true, status: true, updatedAt: true } },
});

// Create a platformNamespace
const { mutate: create } = useCreatePlatformNamespaceMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', clusterId: '<UUID>', description: '<String>', isActive: '<Boolean>', isManaged: '<Boolean>', labels: '<JSON>', lastError: '<String>', name: '<String>', namespaceName: '<String>', status: '<String>' });
```

### PlatformNamespaceEvent

```typescript
// List all platformNamespaceEvents
const { data, isLoading } = usePlatformNamespaceEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } },
});

// Get one platformNamespaceEvent
const { data: item } = usePlatformNamespaceEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, namespaceId: true } },
});

// Create a platformNamespaceEvent
const { mutate: create } = useCreatePlatformNamespaceEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', namespaceId: '<UUID>' });
```

### PlatformProposalComment

```typescript
// List all platformProposalComments
const { data, isLoading } = usePlatformProposalCommentsQuery({
  selection: { fields: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformProposalComment
const { data: item } = usePlatformProposalCommentQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformProposalComment
const { mutate: create } = useCreatePlatformProposalCommentMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', attachments: '<Upload>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', line: '<Int>', outdatedAt: '<Datetime>', path: '<String>', pathTrgmSimilarity: '<Float>', proposalId: '<UUID>', resolvedAt: '<Datetime>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformProposal

```typescript
// List all platformProposals
const { data, isLoading } = usePlatformProposalsQuery({
  selection: { fields: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformProposal
const { data: item } = usePlatformProposalQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformProposal
const { mutate: create } = useCreatePlatformProposalMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', body: '<String>', bodyTrgmSimilarity: '<Float>', closedReason: '<String>', closedReasonTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', decidedAt: '<Datetime>', dueAt: '<Datetime>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', kind: '<String>', kindTrgmSimilarity: '<Float>', labels: '<String>', mergeCommit: '<String>', mergeCommitTrgmSimilarity: '<Float>', mergeMethod: '<String>', mergeMethodTrgmSimilarity: '<Float>', mergeRequestedAt: '<Datetime>', mergedAt: '<Datetime>', metadata: '<JSON>', parentId: '<UUID>', priority: '<BigFloat>', repositoryId: '<UUID>', resolution: '<String>', resolutionTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', sourceRef: '<String>', sourceRefTrgmSimilarity: '<Float>', status: '<String>', statusTrgmSimilarity: '<Float>', targetRef: '<String>', targetRefTrgmSimilarity: '<Float>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformProposalFileView

```typescript
// List all platformProposalFileViews
const { data, isLoading } = usePlatformProposalFileViewsQuery({
  selection: { fields: { blobSha: true, createdAt: true, createdByPrincipal: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } },
});

// Get one platformProposalFileView
const { data: item } = usePlatformProposalFileViewQuery({
  id: '<UUID>',
  selection: { fields: { blobSha: true, createdAt: true, createdByPrincipal: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } },
});

// Create a platformProposalFileView
const { mutate: create } = useCreatePlatformProposalFileViewMutation({
  selection: { fields: { id: true } },
});
create({ blobSha: '<String>', createdByPrincipal: '<UUID>', path: '<String>', proposalId: '<UUID>', reviewerId: '<UUID>', updatedByPrincipal: '<UUID>', viewedAt: '<Datetime>' });
```

### PlatformProposalReaction

```typescript
// List all platformProposalReactions
const { data, isLoading } = usePlatformProposalReactionsQuery({
  selection: { fields: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one platformProposalReaction
const { data: item } = usePlatformProposalReactionQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a platformProposalReaction
const { mutate: create } = useCreatePlatformProposalReactionMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', commentId: '<UUID>', createdByPrincipal: '<UUID>', emoji: '<String>', proposalId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformProposalReview

```typescript
// List all platformProposalReviews
const { data, isLoading } = usePlatformProposalReviewsQuery({
  selection: { fields: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } },
});

// Get one platformProposalReview
const { data: item } = usePlatformProposalReviewQuery({
  id: '<UUID>',
  selection: { fields: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } },
});

// Create a platformProposalReview
const { mutate: create } = useCreatePlatformProposalReviewMutation({
  selection: { fields: { id: true } },
});
create({ body: '<String>', bodyTrgmSimilarity: '<Float>', commitSha: '<String>', commitShaTrgmSimilarity: '<Float>', createdByPrincipal: '<UUID>', proposalId: '<UUID>', reviewerId: '<UUID>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', submittedAt: '<Datetime>', updatedByPrincipal: '<UUID>', verdict: '<String>', verdictTrgmSimilarity: '<Float>' });
```

### PlatformProposalsChunk

```typescript
// List all platformProposalsChunks
const { data, isLoading } = usePlatformProposalsChunksQuery({
  selection: { fields: { actorId: true, body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformProposalsId: true, searchScore: true, updatedAt: true } },
});

// Get one platformProposalsChunk
const { data: item } = usePlatformProposalsChunkQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, body: true, chunkIndex: true, createdAt: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, platformProposalsId: true, searchScore: true, updatedAt: true } },
});

// Create a platformProposalsChunk
const { mutate: create } = useCreatePlatformProposalsChunkMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', body: '<String>', chunkIndex: '<Int>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', platformProposalsId: '<UUID>', searchScore: '<Float>' });
```

### PlatformRegistryBinding

```typescript
// List all platformRegistryBindings
const { data, isLoading } = usePlatformRegistryBindingsQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformRegistryBinding
const { data: item } = usePlatformRegistryBindingQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformRegistryBinding
const { mutate: create } = useCreatePlatformRegistryBindingMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', metadata: '<JSON>', namespaceId: '<UUID>', observedCredentialVersion: '<String>', pullSecretName: '<String>', realm: '<String>', registryHost: '<String>', registryId: '<UUID>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformRegistry

```typescript
// List all platformRegistries
const { data, isLoading } = usePlatformRegistriesQuery({
  selection: { fields: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one platformRegistry
const { data: item } = usePlatformRegistryQuery({
  id: '<UUID>',
  selection: { fields: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a platformRegistry
const { mutate: create } = useCreatePlatformRegistryMutation({
  selection: { fields: { id: true } },
});
create({ authMode: '<String>', basePath: '<String>', createdByPrincipal: '<UUID>', credentialSecretName: '<String>', host: '<String>', installationId: '<UUID>', isPublished: '<Boolean>', kind: '<String>', labels: '<JSON>', lastError: '<String>', metadata: '<JSON>', name: '<String>', platformOnly: '<Boolean>', role: '<String>', status: '<String>', updatedByPrincipal: '<UUID>' });
```

### PlatformRegistryGrant

```typescript
// List all platformRegistryGrants
const { data, isLoading } = usePlatformRegistryGrantsQuery({
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one platformRegistryGrant
const { data: item } = usePlatformRegistryGrantQuery({
  id: '<UUID>',
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a platformRegistryGrant
const { mutate: create } = useCreatePlatformRegistryGrantMutation({
  selection: { fields: { id: true } },
});
create({ actions: '<String>', createdByPrincipal: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', registryId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformRepository

```typescript
// List all platformRepositories
const { data, isLoading } = usePlatformRepositoriesQuery({
  selection: { fields: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } },
});

// Get one platformRepository
const { data: item } = usePlatformRepositoryQuery({
  id: '<UUID>',
  selection: { fields: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } },
});

// Create a platformRepository
const { mutate: create } = useCreatePlatformRepositoryMutation({
  selection: { fields: { id: true } },
});
create({ cloneUrl: '<String>', cloneUrlTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', defaultBranch: '<String>', defaultBranchTrgmSimilarity: '<Float>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', externalId: '<String>', externalIdTrgmSimilarity: '<Float>', isArchived: '<Boolean>', metadata: '<JSON>', name: '<String>', nameTrgmSimilarity: '<Float>', ownerId: '<UUID>', provider: '<String>', providerTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', slugTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>', visibility: '<String>', visibilityTrgmSimilarity: '<Float>' });
```

### PlatformRepositoryEvent

```typescript
// List all platformRepositoryEvents
const { data, isLoading } = usePlatformRepositoryEventsQuery({
  selection: { fields: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one platformRepositoryEvent
const { data: item } = usePlatformRepositoryEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a platformRepositoryEvent
const { mutate: create } = useCreatePlatformRepositoryEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', commitSha: '<String>', createdByPrincipal: '<UUID>', deliveryId: '<String>', eventType: '<String>', metadata: '<JSON>', payload: '<JSON>', ref: '<String>', repositoryId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformRepositoryRequiredCheck

```typescript
// List all platformRepositoryRequiredChecks
const { data, isLoading } = usePlatformRepositoryRequiredChecksQuery({
  selection: { fields: { createdAt: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } },
});

// Get one platformRepositoryRequiredCheck
const { data: item } = usePlatformRepositoryRequiredCheckQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } },
});

// Create a platformRepositoryRequiredCheck
const { mutate: create } = useCreatePlatformRepositoryRequiredCheckMutation({
  selection: { fields: { id: true } },
});
create({ repositoryId: '<UUID>', workflowId: '<UUID>' });
```

### PlatformRepositoryWorkflow

```typescript
// List all platformRepositoryWorkflows
const { data, isLoading } = usePlatformRepositoryWorkflowsQuery({
  selection: { fields: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformRepositoryWorkflow
const { data: item } = usePlatformRepositoryWorkflowQuery({
  id: '<UUID>',
  selection: { fields: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformRepositoryWorkflow
const { mutate: create } = useCreatePlatformRepositoryWorkflowMutation({
  selection: { fields: { id: true } },
});
create({ cancelInProgress: '<Boolean>', concurrencyKey: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', eventType: '<String>', graphId: '<UUID>', inputs: '<JSON>', isEnabled: '<Boolean>', name: '<String>', refPattern: '<String>', repositoryId: '<UUID>', requiredSecrets: '<String>', slug: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformResource

```typescript
// List all platformResources
const { data, isLoading } = usePlatformResourcesQuery({
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformResource
const { data: item } = usePlatformResourceQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformResource
const { mutate: create } = useCreatePlatformResourceMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformResourceDeclaredCapacity

```typescript
// List all platformResourceDeclaredCapacities
const { data, isLoading } = usePlatformResourceDeclaredCapacitiesQuery({
  selection: { fields: { cpuLimitMillicores: true, cpuRequestMillicores: true, installationId: true, isTransient: true, kind: true, memoryLimitBytes: true, memoryRequestBytes: true, namespaceId: true, podCountMax: true, podCountMin: true, source: true, sourceId: true, storageSizeBytes: true, storageTotalBytes: true } },
});

// Create a platformResourceDeclaredCapacity
const { mutate: create } = useCreatePlatformResourceDeclaredCapacityMutation({
  selection: { fields: { id: true } },
});
create({ cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', installationId: '<UUID>', isTransient: '<Boolean>', kind: '<String>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', namespaceId: '<UUID>', podCountMax: '<Int>', podCountMin: '<Int>', source: '<String>', sourceId: '<UUID>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>' });
```

### PlatformResourceDefinition

```typescript
// List all platformResourceDefinitions
const { data, isLoading } = usePlatformResourceDefinitionsQuery({
  selection: { fields: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformResourceDefinition
const { data: item } = usePlatformResourceDefinitionQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformResourceDefinition
const { mutate: create } = useCreatePlatformResourceDefinitionMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', defaultSpec: '<JSON>', description: '<String>', integrations: '<String>', kind: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', paramsSchema: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', slug: '<String>', stepUpMinAge: '<Interval>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformResourceEvent

```typescript
// List all platformResourceEvents
const { data, isLoading } = usePlatformResourceEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } },
});

// Get one platformResourceEvent
const { data: item } = usePlatformResourceEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } },
});

// Create a platformResourceEvent
const { mutate: create } = useCreatePlatformResourceEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', resourceId: '<UUID>' });
```

### PlatformResourceInstallation

```typescript
// List all platformResourceInstallations
const { data, isLoading } = usePlatformResourceInstallationsQuery({
  selection: { fields: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformResourceInstallation
const { data: item } = usePlatformResourceInstallationQuery({
  id: '<UUID>',
  selection: { fields: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformResourceInstallation
const { mutate: create } = useCreatePlatformResourceInstallationMutation({
  selection: { fields: { id: true } },
});
create({ commitId: '<UUID>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', name: '<String>', namespaceId: '<UUID>', params: '<JSON>', revision: '<Int>', slug: '<String>', status: '<String>', storeId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformResourceObservedStorage

```typescript
// List all platformResourceObservedStorages
const { data, isLoading } = usePlatformResourceObservedStoragesQuery({
  selection: { fields: { capacity: true, capacityBytes: true, claimName: true, declaredStorageClass: true, declaredStorageSizeBytes: true, declaredStorageTotalBytes: true, installationId: true, isBound: true, kind: true, namespaceId: true, phase: true, requested: true, requestedBytes: true, resourceId: true, resourceStatus: true, slug: true, storageClass: true, storageName: true } },
});

// Create a platformResourceObservedStorage
const { mutate: create } = useCreatePlatformResourceObservedStorageMutation({
  selection: { fields: { id: true } },
});
create({ capacity: '<String>', capacityBytes: '<BigInt>', claimName: '<String>', declaredStorageClass: '<String>', declaredStorageSizeBytes: '<BigInt>', declaredStorageTotalBytes: '<BigInt>', installationId: '<UUID>', isBound: '<Boolean>', kind: '<String>', namespaceId: '<UUID>', phase: '<String>', requested: '<String>', requestedBytes: '<BigInt>', resourceId: '<UUID>', resourceStatus: '<String>', slug: '<String>', storageClass: '<String>', storageName: '<String>' });
```

### PlatformResourceStatusCheck

```typescript
// List all platformResourceStatusChecks
const { data, isLoading } = usePlatformResourceStatusChecksQuery({
  selection: { fields: { completedAt: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } },
});

// Get one platformResourceStatusCheck
const { data: item } = usePlatformResourceStatusCheckQuery({
  id: '<UUID>',
  selection: { fields: { completedAt: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } },
});

// Create a platformResourceStatusCheck
const { mutate: create } = useCreatePlatformResourceStatusCheckMutation({
  selection: { fields: { id: true } },
});
create({ completedAt: '<Datetime>', requestedAt: '<Datetime>', requestedBy: '<UUID>', resourceId: '<UUID>', result: '<JSON>', status: '<String>' });
```

### PlatformResourceUsageLog

```typescript
// List all platformResourceUsageLogs
const { data, isLoading } = usePlatformResourceUsageLogsQuery({
  selection: { fields: { cpuMillicores: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } },
});

// Get one platformResourceUsageLog
const { data: item } = usePlatformResourceUsageLogQuery({
  id: '<UUID>',
  selection: { fields: { cpuMillicores: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } },
});

// Create a platformResourceUsageLog
const { mutate: create } = useCreatePlatformResourceUsageLogMutation({
  selection: { fields: { id: true } },
});
create({ cpuMillicores: '<BigInt>', intervalSeconds: '<Int>', memoryBytes: '<BigInt>', metrics: '<JSON>', namespaceId: '<UUID>', resourceId: '<UUID>', sampledAt: '<Datetime>', source: '<String>' });
```

### PlatformResourceUsageSummary

```typescript
// List all platformResourceUsageSummaries
const { data, isLoading } = usePlatformResourceUsageSummariesQuery({
  selection: { fields: { date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } },
});

// Get one platformResourceUsageSummary
const { data: item } = usePlatformResourceUsageSummaryQuery({
  id: '<UUID>',
  selection: { fields: { date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } },
});

// Create a platformResourceUsageSummary
const { mutate: create } = useCreatePlatformResourceUsageSummaryMutation({
  selection: { fields: { id: true } },
});
create({ date: '<Date>', gbSeconds: '<BigFloat>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', namespaceId: '<UUID>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' });
```

### PlatformResourceUtilization

```typescript
// List all platformResourceUtilizations
const { data, isLoading } = usePlatformResourceUtilizationsQuery({
  selection: { fields: { avgMemoryBytes: true, cpuLimitMillicores: true, cpuPeakUtilization: true, cpuRequestHeadroomMillicores: true, cpuRequestMillicores: true, date: true, gbSeconds: true, kind: true, maxCpuMillicores: true, maxMemoryBytes: true, memoryLimitBytes: true, memoryPeakUtilization: true, memoryRequestBytes: true, memoryRequestHeadroomBytes: true, namespaceId: true, replicas: true, resourceId: true, runtimeSeconds: true, sampleCount: true } },
});

// Create a platformResourceUtilization
const { mutate: create } = useCreatePlatformResourceUtilizationMutation({
  selection: { fields: { id: true } },
});
create({ avgMemoryBytes: '<BigInt>', cpuLimitMillicores: '<BigInt>', cpuPeakUtilization: '<BigFloat>', cpuRequestHeadroomMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', date: '<Date>', gbSeconds: '<BigFloat>', kind: '<String>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', memoryLimitBytes: '<BigInt>', memoryPeakUtilization: '<BigFloat>', memoryRequestBytes: '<BigInt>', memoryRequestHeadroomBytes: '<BigInt>', namespaceId: '<UUID>', replicas: '<Int>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' });
```

### PlatformResourcesHealth

```typescript
// List all platformResourcesHealths
const { data, isLoading } = usePlatformResourcesHealthsQuery({
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformResourcesHealth
const { data: item } = usePlatformResourcesHealthQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformResourcesHealth
const { mutate: create } = useCreatePlatformResourcesHealthMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusDetail: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformResourcesRequirementsState

```typescript
// List all platformResourcesRequirementsStates
const { data, isLoading } = usePlatformResourcesRequirementsStatesQuery({
  selection: { fields: { configHash: true, configObjectName: true, requirementsHash: true, resourceId: true, secretsHash: true, secretsObjectName: true, slug: true } },
});

// Create a platformResourcesRequirementsState
const { mutate: create } = useCreatePlatformResourcesRequirementsStateMutation({
  selection: { fields: { id: true } },
});
create({ configHash: '<String>', configObjectName: '<String>', requirementsHash: '<String>', resourceId: '<UUID>', secretsHash: '<String>', secretsObjectName: '<String>', slug: '<String>' });
```

### PlatformResourcesResolvedRequirement

```typescript
// List all platformResourcesResolvedRequirements
const { data, isLoading } = usePlatformResourcesResolvedRequirementsQuery({
  selection: { fields: { atomId: true, configObjectName: true, name: true, namespaceId: true, present: true, realm: true, required: true, requirementKind: true, resourceId: true, secretsObjectName: true, slug: true } },
});

// Create a platformResourcesResolvedRequirement
const { mutate: create } = useCreatePlatformResourcesResolvedRequirementMutation({
  selection: { fields: { id: true } },
});
create({ atomId: '<UUID>', configObjectName: '<String>', name: '<String>', namespaceId: '<UUID>', present: '<Boolean>', realm: '<String>', required: '<Boolean>', requirementKind: '<String>', resourceId: '<UUID>', secretsObjectName: '<String>', slug: '<String>' });
```

### PlatformWebhookEndpoint

```typescript
// List all platformWebhookEndpoints
const { data, isLoading } = usePlatformWebhookEndpointsQuery({
  selection: { fields: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one platformWebhookEndpoint
const { data: item } = usePlatformWebhookEndpointQuery({
  id: '<UUID>',
  selection: { fields: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a platformWebhookEndpoint
const { mutate: create } = useCreatePlatformWebhookEndpointMutation({
  selection: { fields: { id: true } },
});
create({ active: '<Boolean>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', functionDefinitionId: '<UUID>', host: '<String>', namespaceId: '<UUID>', path: '<String>', provider: '<String>', replayWindowSeconds: '<Int>', signingSecretName: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### PlatformWebhookEvent

```typescript
// List all platformWebhookEvents
const { data, isLoading } = usePlatformWebhookEventsQuery({
  selection: { fields: { createdAt: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } },
});

// Get one platformWebhookEvent
const { data: item } = usePlatformWebhookEventQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } },
});

// Create a platformWebhookEvent
const { mutate: create } = useCreatePlatformWebhookEventMutation({
  selection: { fields: { id: true } },
});
create({ endpointId: '<UUID>', error: '<String>', externalEventId: '<String>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', payload: '<JSON>', provider: '<String>', providerTimestamp: '<Datetime>', status: '<String>' });
```

### ProposalComment

```typescript
// List all proposalComments
const { data, isLoading } = useProposalCommentsQuery({
  selection: { fields: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one proposalComment
const { data: item } = useProposalCommentQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, attachments: true, body: true, bodyTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, line: true, outdatedAt: true, path: true, pathTrgmSimilarity: true, proposalId: true, resolvedAt: true, search: true, searchScore: true, searchTsvRank: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a proposalComment
const { mutate: create } = useCreateProposalCommentMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', attachments: '<Upload>', body: '<String>', bodyTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', line: '<Int>', outdatedAt: '<Datetime>', path: '<String>', pathTrgmSimilarity: '<Float>', proposalId: '<UUID>', resolvedAt: '<Datetime>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### Proposal

```typescript
// List all proposals
const { data, isLoading } = useProposalsQuery({
  selection: { fields: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one proposal
const { data: item } = useProposalQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, body: true, bodyTrgmSimilarity: true, closedReason: true, closedReasonTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, decidedAt: true, dueAt: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, id: true, kind: true, kindTrgmSimilarity: true, labels: true, mergeCommit: true, mergeCommitTrgmSimilarity: true, mergeMethod: true, mergeMethodTrgmSimilarity: true, mergeRequestedAt: true, mergedAt: true, metadata: true, parentId: true, priority: true, repositoryId: true, resolution: true, resolutionTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, sourceRef: true, sourceRefTrgmSimilarity: true, status: true, statusTrgmSimilarity: true, targetRef: true, targetRefTrgmSimilarity: true, title: true, titleTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a proposal
const { mutate: create } = useCreateProposalMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', body: '<String>', bodyTrgmSimilarity: '<Float>', closedReason: '<String>', closedReasonTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', decidedAt: '<Datetime>', dueAt: '<Datetime>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', kind: '<String>', kindTrgmSimilarity: '<Float>', labels: '<String>', mergeCommit: '<String>', mergeCommitTrgmSimilarity: '<Float>', mergeMethod: '<String>', mergeMethodTrgmSimilarity: '<Float>', mergeRequestedAt: '<Datetime>', mergedAt: '<Datetime>', metadata: '<JSON>', parentId: '<UUID>', priority: '<BigFloat>', repositoryId: '<UUID>', resolution: '<String>', resolutionTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', sourceRef: '<String>', sourceRefTrgmSimilarity: '<Float>', status: '<String>', statusTrgmSimilarity: '<Float>', targetRef: '<String>', targetRefTrgmSimilarity: '<Float>', title: '<String>', titleTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### ProposalFileView

```typescript
// List all proposalFileViews
const { data, isLoading } = useProposalFileViewsQuery({
  selection: { fields: { blobSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } },
});

// Get one proposalFileView
const { data: item } = useProposalFileViewQuery({
  id: '<UUID>',
  selection: { fields: { blobSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, path: true, proposalId: true, reviewerId: true, updatedAt: true, updatedByPrincipal: true, viewedAt: true } },
});

// Create a proposalFileView
const { mutate: create } = useCreateProposalFileViewMutation({
  selection: { fields: { id: true } },
});
create({ blobSha: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', path: '<String>', proposalId: '<UUID>', reviewerId: '<UUID>', updatedByPrincipal: '<UUID>', viewedAt: '<Datetime>' });
```

### ProposalReaction

```typescript
// List all proposalReactions
const { data, isLoading } = useProposalReactionsQuery({
  selection: { fields: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, databaseId: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one proposalReaction
const { data: item } = useProposalReactionQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, commentId: true, createdAt: true, createdByPrincipal: true, databaseId: true, emoji: true, id: true, proposalId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a proposalReaction
const { mutate: create } = useCreateProposalReactionMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', commentId: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', emoji: '<String>', proposalId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### ProposalReview

```typescript
// List all proposalReviews
const { data, isLoading } = useProposalReviewsQuery({
  selection: { fields: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } },
});

// Get one proposalReview
const { data: item } = useProposalReviewQuery({
  id: '<UUID>',
  selection: { fields: { body: true, bodyTrgmSimilarity: true, commitSha: true, commitShaTrgmSimilarity: true, createdAt: true, createdByPrincipal: true, databaseId: true, id: true, proposalId: true, reviewerId: true, search: true, searchScore: true, searchTsvRank: true, submittedAt: true, updatedAt: true, updatedByPrincipal: true, verdict: true, verdictTrgmSimilarity: true } },
});

// Create a proposalReview
const { mutate: create } = useCreateProposalReviewMutation({
  selection: { fields: { id: true } },
});
create({ body: '<String>', bodyTrgmSimilarity: '<Float>', commitSha: '<String>', commitShaTrgmSimilarity: '<Float>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', proposalId: '<UUID>', reviewerId: '<UUID>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', submittedAt: '<Datetime>', updatedByPrincipal: '<UUID>', verdict: '<String>', verdictTrgmSimilarity: '<Float>' });
```

### ProposalsChunk

```typescript
// List all proposalsChunks
const { data, isLoading } = useProposalsChunksQuery({
  selection: { fields: { actorId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, proposalsId: true, searchScore: true, updatedAt: true } },
});

// Get one proposalsChunk
const { data: item } = useProposalsChunkQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, body: true, chunkIndex: true, createdAt: true, databaseId: true, embedding: true, embeddingVectorDistance: true, id: true, metadata: true, proposalsId: true, searchScore: true, updatedAt: true } },
});

// Create a proposalsChunk
const { mutate: create } = useCreateProposalsChunkMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', body: '<String>', chunkIndex: '<Int>', databaseId: '<UUID>', embedding: '<Vector>', embeddingVectorDistance: '<Float>', metadata: '<JSON>', proposalsId: '<UUID>', searchScore: '<Float>' });
```

### RegistryBinding

```typescript
// List all registryBindings
const { data, isLoading } = useRegistryBindingsQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one registryBinding
const { data: item } = useRegistryBindingQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, metadata: true, namespaceId: true, observedCredentialVersion: true, pullSecretName: true, realm: true, registryHost: true, registryId: true, status: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a registryBinding
const { mutate: create } = useCreateRegistryBindingMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', metadata: '<JSON>', namespaceId: '<UUID>', observedCredentialVersion: '<String>', pullSecretName: '<String>', realm: '<String>', registryHost: '<String>', registryId: '<UUID>', status: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### Registry

```typescript
// List all registries
const { data, isLoading } = useRegistriesQuery({
  selection: { fields: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, databaseId: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one registry
const { data: item } = useRegistryQuery({
  id: '<UUID>',
  selection: { fields: { authMode: true, basePath: true, createdAt: true, createdByPrincipal: true, credentialSecretName: true, databaseId: true, host: true, id: true, installationId: true, isPublished: true, kind: true, labels: true, lastError: true, metadata: true, name: true, platformOnly: true, role: true, status: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a registry
const { mutate: create } = useCreateRegistryMutation({
  selection: { fields: { id: true } },
});
create({ authMode: '<String>', basePath: '<String>', createdByPrincipal: '<UUID>', credentialSecretName: '<String>', databaseId: '<UUID>', host: '<String>', installationId: '<UUID>', isPublished: '<Boolean>', kind: '<String>', labels: '<JSON>', lastError: '<String>', metadata: '<JSON>', name: '<String>', platformOnly: '<Boolean>', role: '<String>', status: '<String>', updatedByPrincipal: '<UUID>' });
```

### RegistryGrant

```typescript
// List all registryGrants
const { data, isLoading } = useRegistryGrantsQuery({
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one registryGrant
const { data: item } = useRegistryGrantQuery({
  id: '<UUID>',
  selection: { fields: { actions: true, createdAt: true, createdByPrincipal: true, databaseId: true, expiresAt: true, grantedBy: true, granteeKey: true, granteeScope: true, id: true, registryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a registryGrant
const { mutate: create } = useCreateRegistryGrantMutation({
  selection: { fields: { id: true } },
});
create({ actions: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', expiresAt: '<Datetime>', grantedBy: '<UUID>', granteeKey: '<UUID>', granteeScope: '<String>', registryId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### Repository

```typescript
// List all repositories
const { data, isLoading } = useRepositoriesQuery({
  selection: { fields: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } },
});

// Get one repository
const { data: item } = useRepositoryQuery({
  id: '<UUID>',
  selection: { fields: { cloneUrl: true, cloneUrlTrgmSimilarity: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultBranch: true, defaultBranchTrgmSimilarity: true, description: true, descriptionTrgmSimilarity: true, embedding: true, embeddingUpdatedAt: true, embeddingVectorDistance: true, externalId: true, externalIdTrgmSimilarity: true, id: true, isArchived: true, metadata: true, name: true, nameTrgmSimilarity: true, ownerId: true, provider: true, providerTrgmSimilarity: true, search: true, searchScore: true, searchTsvRank: true, slug: true, slugTrgmSimilarity: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true, visibility: true, visibilityTrgmSimilarity: true } },
});

// Create a repository
const { mutate: create } = useCreateRepositoryMutation({
  selection: { fields: { id: true } },
});
create({ cloneUrl: '<String>', cloneUrlTrgmSimilarity: '<Float>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', defaultBranch: '<String>', defaultBranchTrgmSimilarity: '<Float>', description: '<String>', descriptionTrgmSimilarity: '<Float>', embedding: '<Vector>', embeddingUpdatedAt: '<Datetime>', embeddingVectorDistance: '<Float>', externalId: '<String>', externalIdTrgmSimilarity: '<Float>', isArchived: '<Boolean>', metadata: '<JSON>', name: '<String>', nameTrgmSimilarity: '<Float>', ownerId: '<UUID>', provider: '<String>', providerTrgmSimilarity: '<Float>', search: '<FullText>', searchScore: '<Float>', searchTsvRank: '<Float>', slug: '<String>', slugTrgmSimilarity: '<Float>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>', visibility: '<String>', visibilityTrgmSimilarity: '<Float>' });
```

### RepositoryEvent

```typescript
// List all repositoryEvents
const { data, isLoading } = useRepositoryEventsQuery({
  selection: { fields: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Get one repositoryEvent
const { data: item } = useRepositoryEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, commitSha: true, createdAt: true, createdByPrincipal: true, databaseId: true, deliveryId: true, eventType: true, id: true, metadata: true, payload: true, ref: true, repositoryId: true, updatedAt: true, updatedByPrincipal: true } },
});

// Create a repositoryEvent
const { mutate: create } = useCreateRepositoryEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', commitSha: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', deliveryId: '<String>', eventType: '<String>', metadata: '<JSON>', payload: '<JSON>', ref: '<String>', repositoryId: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### RepositoryRequiredCheck

```typescript
// List all repositoryRequiredChecks
const { data, isLoading } = useRepositoryRequiredChecksQuery({
  selection: { fields: { createdAt: true, databaseId: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } },
});

// Get one repositoryRequiredCheck
const { data: item } = useRepositoryRequiredCheckQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, databaseId: true, id: true, repositoryId: true, updatedAt: true, workflowId: true } },
});

// Create a repositoryRequiredCheck
const { mutate: create } = useCreateRepositoryRequiredCheckMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', repositoryId: '<UUID>', workflowId: '<UUID>' });
```

### RepositoryWorkflow

```typescript
// List all repositoryWorkflows
const { data, isLoading } = useRepositoryWorkflowsQuery({
  selection: { fields: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one repositoryWorkflow
const { data: item } = useRepositoryWorkflowQuery({
  id: '<UUID>',
  selection: { fields: { cancelInProgress: true, concurrencyKey: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, eventType: true, graphId: true, id: true, inputs: true, isEnabled: true, name: true, refPattern: true, repositoryId: true, requiredSecrets: true, slug: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a repositoryWorkflow
const { mutate: create } = useCreateRepositoryWorkflowMutation({
  selection: { fields: { id: true } },
});
create({ cancelInProgress: '<Boolean>', concurrencyKey: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', eventType: '<String>', graphId: '<UUID>', inputs: '<JSON>', isEnabled: '<Boolean>', name: '<String>', refPattern: '<String>', repositoryId: '<UUID>', requiredSecrets: '<String>', slug: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### Resource

```typescript
// List all resources
const { data, isLoading } = useResourcesQuery({
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one resource
const { data: item } = useResourceQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a resource
const { mutate: create } = useCreateResourceMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### ResourceDeclaredCapacity

```typescript
// List all resourceDeclaredCapacities
const { data, isLoading } = useResourceDeclaredCapacitiesQuery({
  selection: { fields: { cpuLimitMillicores: true, cpuRequestMillicores: true, installationId: true, isTransient: true, kind: true, memoryLimitBytes: true, memoryRequestBytes: true, namespaceId: true, podCountMax: true, podCountMin: true, source: true, sourceId: true, storageSizeBytes: true, storageTotalBytes: true } },
});

// Create a resourceDeclaredCapacity
const { mutate: create } = useCreateResourceDeclaredCapacityMutation({
  selection: { fields: { id: true } },
});
create({ cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', installationId: '<UUID>', isTransient: '<Boolean>', kind: '<String>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', namespaceId: '<UUID>', podCountMax: '<Int>', podCountMin: '<Int>', source: '<String>', sourceId: '<UUID>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>' });
```

### ResourceDefinition

```typescript
// List all resourceDefinitions
const { data, isLoading } = useResourceDefinitionsQuery({
  selection: { fields: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one resourceDefinition
const { data: item } = useResourceDefinitionQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, defaultSpec: true, description: true, id: true, integrations: true, kind: true, labels: true, name: true, namespaceId: true, paramsSchema: true, requiredConfigs: true, requiredSecrets: true, slug: true, stepUpMinAge: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a resourceDefinition
const { mutate: create } = useCreateResourceDefinitionMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', defaultSpec: '<JSON>', description: '<String>', integrations: '<String>', kind: '<String>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', paramsSchema: '<JSON>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', slug: '<String>', stepUpMinAge: '<Interval>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### ResourceEvent

```typescript
// List all resourceEvents
const { data, isLoading } = useResourceEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } },
});

// Get one resourceEvent
const { data: item } = useResourceEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, databaseId: true, eventType: true, id: true, message: true, metadata: true, resourceId: true } },
});

// Create a resourceEvent
const { mutate: create } = useCreateResourceEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', databaseId: '<UUID>', eventType: '<String>', message: '<String>', metadata: '<JSON>', resourceId: '<UUID>' });
```

### ResourceInstallation

```typescript
// List all resourceInstallations
const { data, isLoading } = useResourceInstallationsQuery({
  selection: { fields: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one resourceInstallation
const { data: item } = useResourceInstallationQuery({
  id: '<UUID>',
  selection: { fields: { commitId: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, id: true, name: true, namespaceId: true, params: true, revision: true, slug: true, status: true, storeId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a resourceInstallation
const { mutate: create } = useCreateResourceInstallationMutation({
  selection: { fields: { id: true } },
});
create({ commitId: '<UUID>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', name: '<String>', namespaceId: '<UUID>', params: '<JSON>', revision: '<Int>', slug: '<String>', status: '<String>', storeId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### ResourceObservedStorage

```typescript
// List all resourceObservedStorages
const { data, isLoading } = useResourceObservedStoragesQuery({
  selection: { fields: { capacity: true, capacityBytes: true, claimName: true, declaredStorageClass: true, declaredStorageSizeBytes: true, declaredStorageTotalBytes: true, installationId: true, isBound: true, kind: true, namespaceId: true, phase: true, requested: true, requestedBytes: true, resourceId: true, resourceStatus: true, slug: true, storageClass: true, storageName: true } },
});

// Create a resourceObservedStorage
const { mutate: create } = useCreateResourceObservedStorageMutation({
  selection: { fields: { id: true } },
});
create({ capacity: '<String>', capacityBytes: '<BigInt>', claimName: '<String>', declaredStorageClass: '<String>', declaredStorageSizeBytes: '<BigInt>', declaredStorageTotalBytes: '<BigInt>', installationId: '<UUID>', isBound: '<Boolean>', kind: '<String>', namespaceId: '<UUID>', phase: '<String>', requested: '<String>', requestedBytes: '<BigInt>', resourceId: '<UUID>', resourceStatus: '<String>', slug: '<String>', storageClass: '<String>', storageName: '<String>' });
```

### ResourceStatusCheck

```typescript
// List all resourceStatusChecks
const { data, isLoading } = useResourceStatusChecksQuery({
  selection: { fields: { completedAt: true, databaseId: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } },
});

// Get one resourceStatusCheck
const { data: item } = useResourceStatusCheckQuery({
  id: '<UUID>',
  selection: { fields: { completedAt: true, databaseId: true, id: true, requestedAt: true, requestedBy: true, resourceId: true, result: true, status: true } },
});

// Create a resourceStatusCheck
const { mutate: create } = useCreateResourceStatusCheckMutation({
  selection: { fields: { id: true } },
});
create({ completedAt: '<Datetime>', databaseId: '<UUID>', requestedAt: '<Datetime>', requestedBy: '<UUID>', resourceId: '<UUID>', result: '<JSON>', status: '<String>' });
```

### ResourceUsageLog

```typescript
// List all resourceUsageLogs
const { data, isLoading } = useResourceUsageLogsQuery({
  selection: { fields: { cpuMillicores: true, databaseId: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } },
});

// Get one resourceUsageLog
const { data: item } = useResourceUsageLogQuery({
  id: '<UUID>',
  selection: { fields: { cpuMillicores: true, databaseId: true, id: true, intervalSeconds: true, memoryBytes: true, metrics: true, namespaceId: true, resourceId: true, sampledAt: true, source: true } },
});

// Create a resourceUsageLog
const { mutate: create } = useCreateResourceUsageLogMutation({
  selection: { fields: { id: true } },
});
create({ cpuMillicores: '<BigInt>', databaseId: '<UUID>', intervalSeconds: '<Int>', memoryBytes: '<BigInt>', metrics: '<JSON>', namespaceId: '<UUID>', resourceId: '<UUID>', sampledAt: '<Datetime>', source: '<String>' });
```

### ResourceUsageSummary

```typescript
// List all resourceUsageSummaries
const { data, isLoading } = useResourceUsageSummariesQuery({
  selection: { fields: { databaseId: true, date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } },
});

// Get one resourceUsageSummary
const { data: item } = useResourceUsageSummaryQuery({
  id: '<UUID>',
  selection: { fields: { databaseId: true, date: true, gbSeconds: true, id: true, maxCpuMillicores: true, maxMemoryBytes: true, namespaceId: true, resourceId: true, runtimeSeconds: true, sampleCount: true } },
});

// Create a resourceUsageSummary
const { mutate: create } = useCreateResourceUsageSummaryMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', date: '<Date>', gbSeconds: '<BigFloat>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', namespaceId: '<UUID>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' });
```

### ResourceUtilization

```typescript
// List all resourceUtilizations
const { data, isLoading } = useResourceUtilizationsQuery({
  selection: { fields: { avgMemoryBytes: true, cpuLimitMillicores: true, cpuPeakUtilization: true, cpuRequestHeadroomMillicores: true, cpuRequestMillicores: true, date: true, gbSeconds: true, kind: true, maxCpuMillicores: true, maxMemoryBytes: true, memoryLimitBytes: true, memoryPeakUtilization: true, memoryRequestBytes: true, memoryRequestHeadroomBytes: true, namespaceId: true, replicas: true, resourceId: true, runtimeSeconds: true, sampleCount: true } },
});

// Create a resourceUtilization
const { mutate: create } = useCreateResourceUtilizationMutation({
  selection: { fields: { id: true } },
});
create({ avgMemoryBytes: '<BigInt>', cpuLimitMillicores: '<BigInt>', cpuPeakUtilization: '<BigFloat>', cpuRequestHeadroomMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', date: '<Date>', gbSeconds: '<BigFloat>', kind: '<String>', maxCpuMillicores: '<BigInt>', maxMemoryBytes: '<BigInt>', memoryLimitBytes: '<BigInt>', memoryPeakUtilization: '<BigFloat>', memoryRequestBytes: '<BigInt>', memoryRequestHeadroomBytes: '<BigInt>', namespaceId: '<UUID>', replicas: '<Int>', resourceId: '<UUID>', runtimeSeconds: '<BigInt>', sampleCount: '<Int>' });
```

### ResourcesHealth

```typescript
// List all resourcesHealths
const { data, isLoading } = useResourcesHealthsQuery({
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one resourcesHealth
const { data: item } = useResourcesHealthQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, cpuLimitMillicores: true, cpuRequestMillicores: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, errorCount: true, id: true, imageRef: true, installationId: true, integrations: true, kind: true, labels: true, lastError: true, lastHeartbeatAt: true, memoryLimitBytes: true, memoryRequestBytes: true, name: true, namespaceId: true, realm: true, replicas: true, requiredConfigs: true, requiredSecrets: true, resourceDefinitionId: true, slug: true, spec: true, status: true, statusDetail: true, statusObserved: true, storageClass: true, storageSizeBytes: true, storageTotalBytes: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a resourcesHealth
const { mutate: create } = useCreateResourcesHealthMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', cpuLimitMillicores: '<BigInt>', cpuRequestMillicores: '<BigInt>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', errorCount: '<Int>', imageRef: '<String>', installationId: '<UUID>', integrations: '<String>', kind: '<String>', labels: '<JSON>', lastError: '<String>', lastHeartbeatAt: '<Datetime>', memoryLimitBytes: '<BigInt>', memoryRequestBytes: '<BigInt>', name: '<String>', namespaceId: '<UUID>', realm: '<String>', replicas: '<Int>', requiredConfigs: '<ResourceRequirement>', requiredSecrets: '<ResourceRequirement>', resourceDefinitionId: '<UUID>', slug: '<String>', spec: '<JSON>', status: '<String>', statusDetail: '<String>', statusObserved: '<JSON>', storageClass: '<String>', storageSizeBytes: '<BigInt>', storageTotalBytes: '<BigInt>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### ResourcesRequirementsState

```typescript
// List all resourcesRequirementsStates
const { data, isLoading } = useResourcesRequirementsStatesQuery({
  selection: { fields: { configHash: true, configObjectName: true, requirementsHash: true, resourceId: true, secretsHash: true, secretsObjectName: true, slug: true } },
});

// Create a resourcesRequirementsState
const { mutate: create } = useCreateResourcesRequirementsStateMutation({
  selection: { fields: { id: true } },
});
create({ configHash: '<String>', configObjectName: '<String>', requirementsHash: '<String>', resourceId: '<UUID>', secretsHash: '<String>', secretsObjectName: '<String>', slug: '<String>' });
```

### ResourcesResolvedRequirement

```typescript
// List all resourcesResolvedRequirements
const { data, isLoading } = useResourcesResolvedRequirementsQuery({
  selection: { fields: { atomId: true, configObjectName: true, name: true, namespaceId: true, present: true, realm: true, required: true, requirementKind: true, resourceId: true, secretsObjectName: true, slug: true } },
});

// Create a resourcesResolvedRequirement
const { mutate: create } = useCreateResourcesResolvedRequirementMutation({
  selection: { fields: { id: true } },
});
create({ atomId: '<UUID>', configObjectName: '<String>', name: '<String>', namespaceId: '<UUID>', present: '<Boolean>', realm: '<String>', required: '<Boolean>', requirementKind: '<String>', resourceId: '<UUID>', secretsObjectName: '<String>', slug: '<String>' });
```

### WebhookEndpoint

```typescript
// List all webhookEndpoints
const { data, isLoading } = useWebhookEndpointsQuery({
  selection: { fields: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one webhookEndpoint
const { data: item } = useWebhookEndpointQuery({
  id: '<UUID>',
  selection: { fields: { active: true, createdAt: true, createdBy: true, createdByPrincipal: true, databaseId: true, functionDefinitionId: true, host: true, id: true, namespaceId: true, path: true, provider: true, replayWindowSeconds: true, signingSecretName: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a webhookEndpoint
const { mutate: create } = useCreateWebhookEndpointMutation({
  selection: { fields: { id: true } },
});
create({ active: '<Boolean>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', functionDefinitionId: '<UUID>', host: '<String>', namespaceId: '<UUID>', path: '<String>', provider: '<String>', replayWindowSeconds: '<Int>', signingSecretName: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### WebhookEvent

```typescript
// List all webhookEvents
const { data, isLoading } = useWebhookEventsQuery({
  selection: { fields: { createdAt: true, databaseId: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } },
});

// Get one webhookEvent
const { data: item } = useWebhookEventQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, databaseId: true, endpointId: true, error: true, externalEventId: true, id: true, invocationCreatedAt: true, invocationId: true, payload: true, provider: true, providerTimestamp: true, status: true, updatedAt: true } },
});

// Create a webhookEvent
const { mutate: create } = useCreateWebhookEventMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', endpointId: '<UUID>', error: '<String>', externalEventId: '<String>', invocationCreatedAt: '<Datetime>', invocationId: '<UUID>', payload: '<JSON>', provider: '<String>', providerTimestamp: '<Datetime>', status: '<String>' });
```

## Custom Operation Hooks

### `useDatabaseReadFunctionGraphQuery`

databaseReadFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `graphId` | UUID |

### `useReadFunctionGraphQuery`

readFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `graphId` | UUID |

### `useAddEdgeMutation`

addEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddEdgeInput (required) |

### `useAddEdgeAndSaveMutation`

addEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddEdgeAndSaveInput (required) |

### `useAddNodeMutation`

addNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddNodeInput (required) |

### `useAddNodeAndSaveMutation`

addNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddNodeAndSaveInput (required) |

### `useApproveNodeMutation`

approveNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ApproveNodeInput (required) |

### `useCopyGraphMutation`

copyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CopyGraphInput (required) |

### `useDatabaseAddEdgeMutation`

databaseAddEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddEdgeInput (required) |

### `useDatabaseAddEdgeAndSaveMutation`

databaseAddEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddEdgeAndSaveInput (required) |

### `useDatabaseAddNodeMutation`

databaseAddNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddNodeInput (required) |

### `useDatabaseAddNodeAndSaveMutation`

databaseAddNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseAddNodeAndSaveInput (required) |

### `useDatabaseApproveNodeMutation`

databaseApproveNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseApproveNodeInput (required) |

### `useDatabaseCopyGraphMutation`

databaseCopyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseCopyGraphInput (required) |

### `useDatabaseCreateFunctionGraphMutation`

databaseCreateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseCreateFunctionGraphInput (required) |

### `useDatabaseGraphInitEmptyRepoMutation`

databaseGraphInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphInitEmptyRepoInput (required) |

### `useDatabaseGraphInsertNodeAtPathMutation`

databaseGraphInsertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphInsertNodeAtPathInput (required) |

### `useDatabaseGraphInsertNodesAtPathsMutation`

databaseGraphInsertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphInsertNodesAtPathsInput (required) |

### `useDatabaseGraphSetAndCommitMutation`

databaseGraphSetAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphSetAndCommitInput (required) |

### `useDatabaseGraphSetDataAtPathMutation`

databaseGraphSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphSetDataAtPathInput (required) |

### `useDatabaseGraphSetManyAndCommitMutation`

databaseGraphSetManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseGraphSetManyAndCommitInput (required) |

### `useDatabaseImportDefinitionsMutation`

databaseImportDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseImportDefinitionsInput (required) |

### `useDatabaseImportGraphJsonMutation`

databaseImportGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseImportGraphJsonInput (required) |

### `useDatabaseSaveGraphMutation`

databaseSaveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseSaveGraphInput (required) |

### `useDatabaseStartExecutionMutation`

databaseStartExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseStartExecutionInput (required) |

### `useDatabaseValidateFunctionGraphMutation`

databaseValidateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DatabaseValidateFunctionGraphInput (required) |

### `useFunctionExecutionLogsAppendMutation`

functionExecutionLogsAppend

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FunctionExecutionLogsAppendInput (required) |

### `useFunctionInvocationsCreatePageMutation`

functionInvocationsCreatePage

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FunctionInvocationsCreatePageInput (required) |

### `useFunctionInvocationsCreateSyncMutation`

functionInvocationsCreateSync

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FunctionInvocationsCreateSyncInput (required) |

### `useImportDefinitionsMutation`

importDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ImportDefinitionsInput (required) |

### `useImportGraphJsonMutation`

importGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ImportGraphJsonInput (required) |

### `useInfraInitEmptyRepoMutation`

infraInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraInitEmptyRepoInput (required) |

### `useInfraInsertNodeAtPathMutation`

infraInsertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraInsertNodeAtPathInput (required) |

### `useInfraInsertNodesAtPathsMutation`

infraInsertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraInsertNodesAtPathsInput (required) |

### `useInfraSetAndCommitMutation`

infraSetAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraSetAndCommitInput (required) |

### `useInfraSetDataAtPathMutation`

infraSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraSetDataAtPathInput (required) |

### `useInfraSetManyAndCommitMutation`

infraSetManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InfraSetManyAndCommitInput (required) |

### `useInitEmptyRepoMutation`

initEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InitEmptyRepoInput (required) |

### `useInsertNodeAtPathMutation`

insertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InsertNodeAtPathInput (required) |

### `useInsertNodesAtPathsMutation`

insertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InsertNodesAtPathsInput (required) |

### `usePlatformFunctionExecutionLogsAppendMutation`

platformFunctionExecutionLogsAppend

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFunctionExecutionLogsAppendInput (required) |

### `usePlatformFunctionInvocationsCreatePageMutation`

platformFunctionInvocationsCreatePage

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFunctionInvocationsCreatePageInput (required) |

### `usePlatformFunctionInvocationsCreateSyncMutation`

platformFunctionInvocationsCreateSync

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFunctionInvocationsCreateSyncInput (required) |

### `usePlatformInfraInitEmptyRepoMutation`

platformInfraInitEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraInitEmptyRepoInput (required) |

### `usePlatformInfraInsertNodeAtPathMutation`

platformInfraInsertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraInsertNodeAtPathInput (required) |

### `usePlatformInfraInsertNodesAtPathsMutation`

platformInfraInsertNodesAtPaths

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraInsertNodesAtPathsInput (required) |

### `usePlatformInfraSetAndCommitMutation`

platformInfraSetAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraSetAndCommitInput (required) |

### `usePlatformInfraSetDataAtPathMutation`

platformInfraSetDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraSetDataAtPathInput (required) |

### `usePlatformInfraSetManyAndCommitMutation`

platformInfraSetManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformInfraSetManyAndCommitInput (required) |

### `usePlatformResourceInstallationsInstallMutation`

platformResourceInstallationsInstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsInstallInput (required) |

### `usePlatformResourceInstallationsRollbackMutation`

platformResourceInstallationsRollback

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsRollbackInput (required) |

### `usePlatformResourceInstallationsUninstallMutation`

platformResourceInstallationsUninstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsUninstallInput (required) |

### `usePlatformResourceInstallationsUpgradeMutation`

platformResourceInstallationsUpgrade

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformResourceInstallationsUpgradeInput (required) |

### `useProvisionBucketMutation`

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

### `useResourceInstallationsInstallMutation`

resourceInstallationsInstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsInstallInput (required) |

### `useResourceInstallationsRollbackMutation`

resourceInstallationsRollback

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsRollbackInput (required) |

### `useResourceInstallationsUninstallMutation`

resourceInstallationsUninstall

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsUninstallInput (required) |

### `useResourceInstallationsUpgradeMutation`

resourceInstallationsUpgrade

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResourceInstallationsUpgradeInput (required) |

### `useSaveGraphMutation`

saveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SaveGraphInput (required) |

### `useSetAndCommitMutation`

setAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetAndCommitInput (required) |

### `useSetDataAtPathMutation`

setDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetDataAtPathInput (required) |

### `useSetManyAndCommitMutation`

setManyAndCommit

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetManyAndCommitInput (required) |

### `useStartExecutionMutation`

startExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | StartExecutionInput (required) |

### `useValidateFunctionGraphMutation`

validateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ValidateFunctionGraphInput (required) |
