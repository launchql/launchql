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
| `useMachinesQuery` | Query | Computers enrolled for remote control, one row per database enrollment |
| `useMachineQuery` | Query | Computers enrolled for remote control, one row per database enrollment |
| `useCreateMachineMutation` | Mutation | Computers enrolled for remote control, one row per database enrollment |
| `useUpdateMachineMutation` | Mutation | Computers enrolled for remote control, one row per database enrollment |
| `useDeleteMachineMutation` | Mutation | Computers enrolled for remote control, one row per database enrollment |
| `useMachineMessagesQuery` | Query | Partitioned append-only ledger of session input, output and lifecycle |
| `useMachineMessageQuery` | Query | Partitioned append-only ledger of session input, output and lifecycle |
| `useCreateMachineMessageMutation` | Mutation | Partitioned append-only ledger of session input, output and lifecycle |
| `useUpdateMachineMessageMutation` | Mutation | Partitioned append-only ledger of session input, output and lifecycle |
| `useDeleteMachineMessageMutation` | Mutation | Partitioned append-only ledger of session input, output and lifecycle |
| `useMachineSessionsQuery` | Query | Command or terminal sessions running on an enrolled machine |
| `useMachineSessionQuery` | Query | Command or terminal sessions running on an enrolled machine |
| `useCreateMachineSessionMutation` | Mutation | Command or terminal sessions running on an enrolled machine |
| `useUpdateMachineSessionMutation` | Mutation | Command or terminal sessions running on an enrolled machine |
| `useDeleteMachineSessionMutation` | Mutation | Command or terminal sessions running on an enrolled machine |
| `useMachinesEnrollMutation` | Mutation | machinesEnroll |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |

## Table Hooks

### Machine

```typescript
// List all machines
const { data, isLoading } = useMachinesQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, facts: true, id: true, isShared: true, label: true, lastSeenAt: true, ownerId: true, policy: true, principalId: true, relayUrl: true, revokedAt: true, tokenHash: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one machine
const { data: item } = useMachineQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, facts: true, id: true, isShared: true, label: true, lastSeenAt: true, ownerId: true, policy: true, principalId: true, relayUrl: true, revokedAt: true, tokenHash: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a machine
const { mutate: create } = useCreateMachineMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', facts: '<JSON>', isShared: '<Boolean>', label: '<String>', lastSeenAt: '<Datetime>', ownerId: '<UUID>', policy: '<JSON>', principalId: '<UUID>', relayUrl: '<String>', revokedAt: '<Datetime>', tokenHash: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### MachineMessage

```typescript
// List all machineMessages
const { data, isLoading } = useMachineMessagesQuery({
  selection: { fields: { actorId: true, content: true, createdByPrincipal: true, entityId: true, id: true, kind: true, ownerId: true, recordedAt: true, seq: true, sessionId: true } },
});

// Get one machineMessage
const { data: item } = useMachineMessageQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, content: true, createdByPrincipal: true, entityId: true, id: true, kind: true, ownerId: true, recordedAt: true, seq: true, sessionId: true } },
});

// Create a machineMessage
const { mutate: create } = useCreateMachineMessageMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', content: '<JSON>', createdByPrincipal: '<UUID>', entityId: '<UUID>', kind: '<String>', ownerId: '<UUID>', recordedAt: '<Datetime>', seq: '<BigInt>', sessionId: '<UUID>' });
```

### MachineSession

```typescript
// List all machineSessions
const { data, isLoading } = useMachineSessionsQuery({
  selection: { fields: { agentMode: true, agentSessionRef: true, args: true, cols: true, command: true, createdAt: true, createdBy: true, createdByPrincipal: true, cwd: true, endedAt: true, entityId: true, env: true, exitCode: true, id: true, interactive: true, lastActivityAt: true, lastSeq: true, machineId: true, metadata: true, ownerId: true, pid: true, runId: true, startedAt: true, state: true, termRows: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one machineSession
const { data: item } = useMachineSessionQuery({
  id: '<UUID>',
  selection: { fields: { agentMode: true, agentSessionRef: true, args: true, cols: true, command: true, createdAt: true, createdBy: true, createdByPrincipal: true, cwd: true, endedAt: true, entityId: true, env: true, exitCode: true, id: true, interactive: true, lastActivityAt: true, lastSeq: true, machineId: true, metadata: true, ownerId: true, pid: true, runId: true, startedAt: true, state: true, termRows: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a machineSession
const { mutate: create } = useCreateMachineSessionMutation({
  selection: { fields: { id: true } },
});
create({ agentMode: '<String>', agentSessionRef: '<String>', args: '<String>', cols: '<Int>', command: '<String>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', cwd: '<String>', endedAt: '<Datetime>', entityId: '<UUID>', env: '<JSON>', exitCode: '<Int>', interactive: '<Boolean>', lastActivityAt: '<Datetime>', lastSeq: '<BigInt>', machineId: '<UUID>', metadata: '<JSON>', ownerId: '<UUID>', pid: '<Int>', runId: '<UUID>', startedAt: '<Datetime>', state: '<String>', termRows: '<Int>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

## Custom Operation Hooks

### `useMachinesEnrollMutation`

machinesEnroll

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | MachinesEnrollInput (required) |

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
