# platformEmailProviderAccount

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

A tenant's configured account at an email provider: provider slug, endpoint coordinates, and the NAME of the secret holding its credentials (never the credential itself)

## Usage

```typescript
usePlatformEmailProviderAccountsQuery({ selection: { fields: { createdAt: true, credentialsSecretName: true, id: true, isActive: true, name: true, provider: true, providerAccountName: true, region: true, smtpHost: true, smtpPort: true, smtpSecure: true, smtpUser: true, updatedAt: true, webhookSigningSecretName: true } } })
usePlatformEmailProviderAccountQuery({ id: '<UUID>', selection: { fields: { createdAt: true, credentialsSecretName: true, id: true, isActive: true, name: true, provider: true, providerAccountName: true, region: true, smtpHost: true, smtpPort: true, smtpSecure: true, smtpUser: true, updatedAt: true, webhookSigningSecretName: true } } })
useCreatePlatformEmailProviderAccountMutation({ selection: { fields: { id: true } } })
useUpdatePlatformEmailProviderAccountMutation({ selection: { fields: { id: true } } })
useDeletePlatformEmailProviderAccountMutation({})
```

## Examples

### List all platformEmailProviderAccounts

```typescript
const { data, isLoading } = usePlatformEmailProviderAccountsQuery({
  selection: { fields: { createdAt: true, credentialsSecretName: true, id: true, isActive: true, name: true, provider: true, providerAccountName: true, region: true, smtpHost: true, smtpPort: true, smtpSecure: true, smtpUser: true, updatedAt: true, webhookSigningSecretName: true } },
});
```

### Create a platformEmailProviderAccount

```typescript
const { mutate } = useCreatePlatformEmailProviderAccountMutation({
  selection: { fields: { id: true } },
});
mutate({ credentialsSecretName: '<String>', isActive: '<Boolean>', name: '<String>', provider: '<String>', providerAccountName: '<String>', region: '<String>', smtpHost: '<String>', smtpPort: '<Int>', smtpSecure: '<Boolean>', smtpUser: '<String>', webhookSigningSecretName: '<String>' });
```
