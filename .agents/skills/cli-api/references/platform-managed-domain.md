# platformManagedDomain

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformManagedDomain records via csdk CLI

## Usage

```bash
csdk platform-managed-domain list
csdk platform-managed-domain list --where.<field>.<op> <value> --orderBy <values>
csdk platform-managed-domain list --limit 10 --after <cursor>
csdk platform-managed-domain find-first --where.<field>.<op> <value>
csdk platform-managed-domain get --id <UUID>
csdk platform-managed-domain create --domain <String> [--allowPublicUsage <Boolean>] [--annotations <JSON>] [--certStatus <String>] [--createdByPrincipal <UUID>] [--isWildcard <Boolean>] [--publicPort <Int>] [--tlsReadyAt <Datetime>] [--tlsStatus <String>] [--updatedByPrincipal <UUID>] [--verificationStatus <String>] [--verifiedAt <Datetime>]
csdk platform-managed-domain update --id <UUID> [--allowPublicUsage <Boolean>] [--annotations <JSON>] [--certStatus <String>] [--createdByPrincipal <UUID>] [--domain <String>] [--isWildcard <Boolean>] [--publicPort <Int>] [--tlsReadyAt <Datetime>] [--tlsStatus <String>] [--updatedByPrincipal <UUID>] [--verificationStatus <String>] [--verifiedAt <Datetime>]
csdk platform-managed-domain delete --id <UUID>
```

## Examples

### List platformManagedDomain records

```bash
csdk platform-managed-domain list
```

### List platformManagedDomain records with pagination

```bash
csdk platform-managed-domain list --limit 10 --offset 0
```

### List platformManagedDomain records with cursor pagination

```bash
csdk platform-managed-domain list --limit 10 --after <cursor>
```

### Find first matching platformManagedDomain

```bash
csdk platform-managed-domain find-first --where.id.equalTo <value>
```

### List platformManagedDomain records with field selection

```bash
csdk platform-managed-domain list --select id,id
```

### List platformManagedDomain records with filtering and ordering

```bash
csdk platform-managed-domain list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformManagedDomain

```bash
csdk platform-managed-domain create --domain <String> [--allowPublicUsage <Boolean>] [--annotations <JSON>] [--certStatus <String>] [--createdByPrincipal <UUID>] [--isWildcard <Boolean>] [--publicPort <Int>] [--tlsReadyAt <Datetime>] [--tlsStatus <String>] [--updatedByPrincipal <UUID>] [--verificationStatus <String>] [--verifiedAt <Datetime>]
```

### Get a platformManagedDomain by id

```bash
csdk platform-managed-domain get --id <value>
```
