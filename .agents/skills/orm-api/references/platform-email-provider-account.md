# platformEmailProviderAccount

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

A tenant's configured account at an email provider: provider slug, endpoint coordinates, and the NAME of the secret holding its credentials (never the credential itself)

## Usage

```typescript
db.platformEmailProviderAccount.findMany({ select: { id: true } }).execute()
db.platformEmailProviderAccount.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformEmailProviderAccount.create({ data: { credentialsSecretName: '<String>', isActive: '<Boolean>', name: '<String>', provider: '<String>', providerAccountName: '<String>', region: '<String>', smtpHost: '<String>', smtpPort: '<Int>', smtpSecure: '<Boolean>', smtpUser: '<String>', webhookSigningSecretName: '<String>' }, select: { id: true } }).execute()
db.platformEmailProviderAccount.update({ where: { id: '<UUID>' }, data: { credentialsSecretName: '<String>' }, select: { id: true } }).execute()
db.platformEmailProviderAccount.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformEmailProviderAccount records

```typescript
const items = await db.platformEmailProviderAccount.findMany({
  select: { id: true, credentialsSecretName: true }
}).execute();
```

### Create a platformEmailProviderAccount

```typescript
const item = await db.platformEmailProviderAccount.create({
  data: { credentialsSecretName: '<String>', isActive: '<Boolean>', name: '<String>', provider: '<String>', providerAccountName: '<String>', region: '<String>', smtpHost: '<String>', smtpPort: '<Int>', smtpSecure: '<Boolean>', smtpUser: '<String>', webhookSigningSecretName: '<String>' },
  select: { id: true }
}).execute();
```
