# managedDomain

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for ManagedDomain records via csdk CLI

## Usage

```bash
csdk managed-domain list
csdk managed-domain list --where.<field>.<op> <value> --orderBy <values>
csdk managed-domain list --limit 10 --after <cursor>
csdk managed-domain find-first --where.<field>.<op> <value>
csdk managed-domain get --id <UUID>
csdk managed-domain create --databaseId <UUID> --domain <String> [--allowPublicUsage <Boolean>] [--annotations <JSON>] [--certStatus <String>] [--createdByPrincipal <UUID>] [--isWildcard <Boolean>] [--publicPort <Int>] [--tlsReadyAt <Datetime>] [--tlsStatus <String>] [--updatedByPrincipal <UUID>] [--verificationStatus <String>] [--verifiedAt <Datetime>]
csdk managed-domain update --id <UUID> [--allowPublicUsage <Boolean>] [--annotations <JSON>] [--certStatus <String>] [--createdByPrincipal <UUID>] [--databaseId <UUID>] [--domain <String>] [--isWildcard <Boolean>] [--publicPort <Int>] [--tlsReadyAt <Datetime>] [--tlsStatus <String>] [--updatedByPrincipal <UUID>] [--verificationStatus <String>] [--verifiedAt <Datetime>]
csdk managed-domain delete --id <UUID>
```

## Examples

### List managedDomain records

```bash
csdk managed-domain list
```

### List managedDomain records with pagination

```bash
csdk managed-domain list --limit 10 --offset 0
```

### List managedDomain records with cursor pagination

```bash
csdk managed-domain list --limit 10 --after <cursor>
```

### Find first matching managedDomain

```bash
csdk managed-domain find-first --where.id.equalTo <value>
```

### List managedDomain records with field selection

```bash
csdk managed-domain list --select id,id
```

### List managedDomain records with filtering and ordering

```bash
csdk managed-domain list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a managedDomain

```bash
csdk managed-domain create --databaseId <UUID> --domain <String> [--allowPublicUsage <Boolean>] [--annotations <JSON>] [--certStatus <String>] [--createdByPrincipal <UUID>] [--isWildcard <Boolean>] [--publicPort <Int>] [--tlsReadyAt <Datetime>] [--tlsStatus <String>] [--updatedByPrincipal <UUID>] [--verificationStatus <String>] [--verifiedAt <Datetime>]
```

### Get a managedDomain by id

```bash
csdk managed-domain get --id <value>
```
