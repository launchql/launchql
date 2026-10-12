# machine

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Computers enrolled for remote control, one row per database enrollment

## Usage

```typescript
useMachinesQuery({ selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, facts: true, id: true, isShared: true, label: true, lastSeenAt: true, ownerId: true, policy: true, principalId: true, relayUrl: true, revokedAt: true, tokenHash: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } } })
useMachineQuery({ id: '<UUID>', selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, facts: true, id: true, isShared: true, label: true, lastSeenAt: true, ownerId: true, policy: true, principalId: true, relayUrl: true, revokedAt: true, tokenHash: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } } })
useCreateMachineMutation({ selection: { fields: { id: true } } })
useUpdateMachineMutation({ selection: { fields: { id: true } } })
useDeleteMachineMutation({})
```

## Examples

### List all machines

```typescript
const { data, isLoading } = useMachinesQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, facts: true, id: true, isShared: true, label: true, lastSeenAt: true, ownerId: true, policy: true, principalId: true, relayUrl: true, revokedAt: true, tokenHash: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});
```

### Create a machine

```typescript
const { mutate } = useCreateMachineMutation({
  selection: { fields: { id: true } },
});
mutate({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', facts: '<JSON>', isShared: '<Boolean>', label: '<String>', lastSeenAt: '<Datetime>', ownerId: '<UUID>', policy: '<JSON>', principalId: '<UUID>', relayUrl: '<String>', revokedAt: '<Datetime>', tokenHash: '<String>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```
