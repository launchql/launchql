# emailProviderAccount

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

A tenant's configured account at an email provider: provider slug, endpoint coordinates, and the NAME of the secret holding its credentials (never the credential itself)

## Usage

```typescript
useEmailProviderAccountsQuery({ selection: { fields: { createdAt: true, credentialsSecretName: true, databaseId: true, id: true, isActive: true, name: true, provider: true, providerAccountName: true, region: true, smtpHost: true, smtpPort: true, smtpSecure: true, smtpUser: true, updatedAt: true, webhookSigningSecretName: true } } })
useEmailProviderAccountQuery({ id: '<UUID>', selection: { fields: { createdAt: true, credentialsSecretName: true, databaseId: true, id: true, isActive: true, name: true, provider: true, providerAccountName: true, region: true, smtpHost: true, smtpPort: true, smtpSecure: true, smtpUser: true, updatedAt: true, webhookSigningSecretName: true } } })
useCreateEmailProviderAccountMutation({ selection: { fields: { id: true } } })
useUpdateEmailProviderAccountMutation({ selection: { fields: { id: true } } })
useDeleteEmailProviderAccountMutation({})
```

## Examples

### List all emailProviderAccounts

```typescript
const { data, isLoading } = useEmailProviderAccountsQuery({
  selection: { fields: { createdAt: true, credentialsSecretName: true, databaseId: true, id: true, isActive: true, name: true, provider: true, providerAccountName: true, region: true, smtpHost: true, smtpPort: true, smtpSecure: true, smtpUser: true, updatedAt: true, webhookSigningSecretName: true } },
});
```

### Create a emailProviderAccount

```typescript
const { mutate } = useCreateEmailProviderAccountMutation({
  selection: { fields: { id: true } },
});
mutate({ credentialsSecretName: '<String>', databaseId: '<UUID>', isActive: '<Boolean>', name: '<String>', provider: '<String>', providerAccountName: '<String>', region: '<String>', smtpHost: '<String>', smtpPort: '<Int>', smtpSecure: '<Boolean>', smtpUser: '<String>', webhookSigningSecretName: '<String>' });
```
