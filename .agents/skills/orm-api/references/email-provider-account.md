# emailProviderAccount

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

A tenant's configured account at an email provider: provider slug, endpoint coordinates, and the NAME of the secret holding its credentials (never the credential itself)

## Usage

```typescript
db.emailProviderAccount.findMany({ select: { id: true } }).execute()
db.emailProviderAccount.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.emailProviderAccount.create({ data: { credentialsSecretName: '<String>', databaseId: '<UUID>', isActive: '<Boolean>', name: '<String>', provider: '<String>', providerAccountName: '<String>', region: '<String>', smtpHost: '<String>', smtpPort: '<Int>', smtpSecure: '<Boolean>', smtpUser: '<String>', webhookSigningSecretName: '<String>' }, select: { id: true } }).execute()
db.emailProviderAccount.update({ where: { id: '<UUID>' }, data: { credentialsSecretName: '<String>' }, select: { id: true } }).execute()
db.emailProviderAccount.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all emailProviderAccount records

```typescript
const items = await db.emailProviderAccount.findMany({
  select: { id: true, credentialsSecretName: true }
}).execute();
```

### Create a emailProviderAccount

```typescript
const item = await db.emailProviderAccount.create({
  data: { credentialsSecretName: '<String>', databaseId: '<UUID>', isActive: '<Boolean>', name: '<String>', provider: '<String>', providerAccountName: '<String>', region: '<String>', smtpHost: '<String>', smtpPort: '<Int>', smtpSecure: '<Boolean>', smtpUser: '<String>', webhookSigningSecretName: '<String>' },
  select: { id: true }
}).execute();
```
