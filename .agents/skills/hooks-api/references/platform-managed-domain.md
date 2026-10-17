# platformManagedDomain

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Platform-operated hostnames whose DNS and certificate lifecycle the platform drives

## Usage

```typescript
usePlatformManagedDomainsQuery({ selection: { fields: { allowPublicUsage: true, annotations: true, certStatus: true, createdAt: true, createdByPrincipal: true, domain: true, id: true, isWildcard: true, publicPort: true, tlsReadyAt: true, tlsStatus: true, updatedAt: true, updatedByPrincipal: true, verificationStatus: true, verifiedAt: true } } })
usePlatformManagedDomainQuery({ id: '<UUID>', selection: { fields: { allowPublicUsage: true, annotations: true, certStatus: true, createdAt: true, createdByPrincipal: true, domain: true, id: true, isWildcard: true, publicPort: true, tlsReadyAt: true, tlsStatus: true, updatedAt: true, updatedByPrincipal: true, verificationStatus: true, verifiedAt: true } } })
useCreatePlatformManagedDomainMutation({ selection: { fields: { id: true } } })
useUpdatePlatformManagedDomainMutation({ selection: { fields: { id: true } } })
useDeletePlatformManagedDomainMutation({})
```

## Examples

### List all platformManagedDomains

```typescript
const { data, isLoading } = usePlatformManagedDomainsQuery({
  selection: { fields: { allowPublicUsage: true, annotations: true, certStatus: true, createdAt: true, createdByPrincipal: true, domain: true, id: true, isWildcard: true, publicPort: true, tlsReadyAt: true, tlsStatus: true, updatedAt: true, updatedByPrincipal: true, verificationStatus: true, verifiedAt: true } },
});
```

### Create a platformManagedDomain

```typescript
const { mutate } = useCreatePlatformManagedDomainMutation({
  selection: { fields: { id: true } },
});
mutate({ allowPublicUsage: '<Boolean>', annotations: '<JSON>', certStatus: '<String>', createdByPrincipal: '<UUID>', domain: '<String>', isWildcard: '<Boolean>', publicPort: '<Int>', tlsReadyAt: '<Datetime>', tlsStatus: '<String>', updatedByPrincipal: '<UUID>', verificationStatus: '<String>', verifiedAt: '<Datetime>' });
```
