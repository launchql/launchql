# platformEmailProviderAccount

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformEmailProviderAccount records via csdk CLI

## Usage

```bash
csdk platform-email-provider-account list
csdk platform-email-provider-account list --where.<field>.<op> <value> --orderBy <values>
csdk platform-email-provider-account list --limit 10 --after <cursor>
csdk platform-email-provider-account find-first --where.<field>.<op> <value>
csdk platform-email-provider-account get --id <UUID>
csdk platform-email-provider-account create --credentialsSecretName <String> --name <String> --provider <String> [--isActive <Boolean>] [--providerAccountName <String>] [--region <String>] [--smtpHost <String>] [--smtpPort <Int>] [--smtpSecure <Boolean>] [--smtpUser <String>] [--webhookSigningSecretName <String>]
csdk platform-email-provider-account update --id <UUID> [--credentialsSecretName <String>] [--isActive <Boolean>] [--name <String>] [--provider <String>] [--providerAccountName <String>] [--region <String>] [--smtpHost <String>] [--smtpPort <Int>] [--smtpSecure <Boolean>] [--smtpUser <String>] [--webhookSigningSecretName <String>]
csdk platform-email-provider-account delete --id <UUID>
```

## Examples

### List platformEmailProviderAccount records

```bash
csdk platform-email-provider-account list
```

### List platformEmailProviderAccount records with pagination

```bash
csdk platform-email-provider-account list --limit 10 --offset 0
```

### List platformEmailProviderAccount records with cursor pagination

```bash
csdk platform-email-provider-account list --limit 10 --after <cursor>
```

### Find first matching platformEmailProviderAccount

```bash
csdk platform-email-provider-account find-first --where.id.equalTo <value>
```

### List platformEmailProviderAccount records with field selection

```bash
csdk platform-email-provider-account list --select id,id
```

### List platformEmailProviderAccount records with filtering and ordering

```bash
csdk platform-email-provider-account list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformEmailProviderAccount

```bash
csdk platform-email-provider-account create --credentialsSecretName <String> --name <String> --provider <String> [--isActive <Boolean>] [--providerAccountName <String>] [--region <String>] [--smtpHost <String>] [--smtpPort <Int>] [--smtpSecure <Boolean>] [--smtpUser <String>] [--webhookSigningSecretName <String>]
```

### Get a platformEmailProviderAccount by id

```bash
csdk platform-email-provider-account get --id <value>
```
