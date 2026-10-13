# emailProviderAccount

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for EmailProviderAccount records via csdk CLI

## Usage

```bash
csdk email-provider-account list
csdk email-provider-account list --where.<field>.<op> <value> --orderBy <values>
csdk email-provider-account list --limit 10 --after <cursor>
csdk email-provider-account find-first --where.<field>.<op> <value>
csdk email-provider-account get --id <UUID>
csdk email-provider-account create --credentialsSecretName <String> --databaseId <UUID> --name <String> --provider <String> [--isActive <Boolean>] [--providerAccountName <String>] [--region <String>] [--smtpHost <String>] [--smtpPort <Int>] [--smtpSecure <Boolean>] [--smtpUser <String>] [--webhookSigningSecretName <String>]
csdk email-provider-account update --id <UUID> [--credentialsSecretName <String>] [--databaseId <UUID>] [--isActive <Boolean>] [--name <String>] [--provider <String>] [--providerAccountName <String>] [--region <String>] [--smtpHost <String>] [--smtpPort <Int>] [--smtpSecure <Boolean>] [--smtpUser <String>] [--webhookSigningSecretName <String>]
csdk email-provider-account delete --id <UUID>
```

## Examples

### List emailProviderAccount records

```bash
csdk email-provider-account list
```

### List emailProviderAccount records with pagination

```bash
csdk email-provider-account list --limit 10 --offset 0
```

### List emailProviderAccount records with cursor pagination

```bash
csdk email-provider-account list --limit 10 --after <cursor>
```

### Find first matching emailProviderAccount

```bash
csdk email-provider-account find-first --where.id.equalTo <value>
```

### List emailProviderAccount records with field selection

```bash
csdk email-provider-account list --select id,id
```

### List emailProviderAccount records with filtering and ordering

```bash
csdk email-provider-account list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a emailProviderAccount

```bash
csdk email-provider-account create --credentialsSecretName <String> --databaseId <UUID> --name <String> --provider <String> [--isActive <Boolean>] [--providerAccountName <String>] [--region <String>] [--smtpHost <String>] [--smtpPort <Int>] [--smtpSecure <Boolean>] [--smtpUser <String>] [--webhookSigningSecretName <String>]
```

### Get a emailProviderAccount by id

```bash
csdk email-provider-account get --id <value>
```
