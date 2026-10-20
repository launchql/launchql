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
| `useContentPresetsQuery` | Query | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useContentPresetQuery` | Query | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useCreateContentPresetMutation` | Mutation | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useUpdateContentPresetMutation` | Mutation | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useDeleteContentPresetMutation` | Mutation | Seed-content preset catalog (limit defaults, trust ladders, ...) — merkle-versioned head over the infra store |
| `useDbPresetsQuery` | Query | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useDbPresetQuery` | Query | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useCreateDbPresetMutation` | Mutation | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useUpdateDbPresetMutation` | Mutation | Database provisioning preset catalog — merkle-versioned head over the infra store |
| `useDeleteDbPresetMutation` | Mutation | Database provisioning preset catalog — merkle-versioned head over the infra store |
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
| `usePlatformInfraInitEmptyRepoMutation` | Mutation | platformInfraInitEmptyRepo |
| `usePlatformInfraInsertNodeAtPathMutation` | Mutation | platformInfraInsertNodeAtPath |
| `usePlatformInfraInsertNodesAtPathsMutation` | Mutation | platformInfraInsertNodesAtPaths |
| `usePlatformInfraSetAndCommitMutation` | Mutation | platformInfraSetAndCommit |
| `usePlatformInfraSetDataAtPathMutation` | Mutation | platformInfraSetDataAtPath |
| `usePlatformInfraSetManyAndCommitMutation` | Mutation | platformInfraSetManyAndCommit |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |

## Table Hooks

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

## Custom Operation Hooks

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
