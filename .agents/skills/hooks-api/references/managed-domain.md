# managedDomain

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Platform-operated hostnames whose DNS and certificate lifecycle the platform drives

## Usage

```typescript
useManagedDomainsQuery({ selection: { fields: { allowPublicUsage: true, annotations: true, certStatus: true, createdAt: true, createdByPrincipal: true, databaseId: true, domain: true, id: true, isWildcard: true, publicPort: true, tlsReadyAt: true, tlsStatus: true, updatedAt: true, updatedByPrincipal: true, verificationStatus: true, verifiedAt: true } } })
useManagedDomainQuery({ id: '<UUID>', selection: { fields: { allowPublicUsage: true, annotations: true, certStatus: true, createdAt: true, createdByPrincipal: true, databaseId: true, domain: true, id: true, isWildcard: true, publicPort: true, tlsReadyAt: true, tlsStatus: true, updatedAt: true, updatedByPrincipal: true, verificationStatus: true, verifiedAt: true } } })
useCreateManagedDomainMutation({ selection: { fields: { id: true } } })
useUpdateManagedDomainMutation({ selection: { fields: { id: true } } })
useDeleteManagedDomainMutation({})
```

## Examples

### List all managedDomains

```typescript
const { data, isLoading } = useManagedDomainsQuery({
  selection: { fields: { allowPublicUsage: true, annotations: true, certStatus: true, createdAt: true, createdByPrincipal: true, databaseId: true, domain: true, id: true, isWildcard: true, publicPort: true, tlsReadyAt: true, tlsStatus: true, updatedAt: true, updatedByPrincipal: true, verificationStatus: true, verifiedAt: true } },
});
```

### Create a managedDomain

```typescript
const { mutate } = useCreateManagedDomainMutation({
  selection: { fields: { id: true } },
});
mutate({ allowPublicUsage: '<Boolean>', annotations: '<JSON>', certStatus: '<String>', createdByPrincipal: '<UUID>', databaseId: '<UUID>', domain: '<String>', isWildcard: '<Boolean>', publicPort: '<Int>', tlsReadyAt: '<Datetime>', tlsStatus: '<String>', updatedByPrincipal: '<UUID>', verificationStatus: '<String>', verifiedAt: '<Datetime>' });
```
