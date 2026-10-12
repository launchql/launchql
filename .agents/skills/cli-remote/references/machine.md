# machine

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for Machine records via csdk CLI

## Usage

```bash
csdk machine list
csdk machine list --where.<field>.<op> <value> --orderBy <values>
csdk machine list --limit 10 --after <cursor>
csdk machine find-first --where.<field>.<op> <value>
csdk machine get --id <UUID>
csdk machine create --entityId <UUID> --label <String> --ownerId <UUID> --tokenHash <String> [--createdBy <UUID>] [--createdByPrincipal <UUID>] [--facts <JSON>] [--isShared <Boolean>] [--lastSeenAt <Datetime>] [--policy <JSON>] [--principalId <UUID>] [--relayUrl <String>] [--revokedAt <Datetime>] [--updatedBy <UUID>] [--updatedByPrincipal <UUID>]
csdk machine update --id <UUID> [--createdBy <UUID>] [--createdByPrincipal <UUID>] [--entityId <UUID>] [--facts <JSON>] [--isShared <Boolean>] [--label <String>] [--lastSeenAt <Datetime>] [--ownerId <UUID>] [--policy <JSON>] [--principalId <UUID>] [--relayUrl <String>] [--revokedAt <Datetime>] [--tokenHash <String>] [--updatedBy <UUID>] [--updatedByPrincipal <UUID>]
csdk machine delete --id <UUID>
```

## Examples

### List machine records

```bash
csdk machine list
```

### List machine records with pagination

```bash
csdk machine list --limit 10 --offset 0
```

### List machine records with cursor pagination

```bash
csdk machine list --limit 10 --after <cursor>
```

### Find first matching machine

```bash
csdk machine find-first --where.id.equalTo <value>
```

### List machine records with field selection

```bash
csdk machine list --select id,id
```

### List machine records with filtering and ordering

```bash
csdk machine list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a machine

```bash
csdk machine create --entityId <UUID> --label <String> --ownerId <UUID> --tokenHash <String> [--createdBy <UUID>] [--createdByPrincipal <UUID>] [--facts <JSON>] [--isShared <Boolean>] [--lastSeenAt <Datetime>] [--policy <JSON>] [--principalId <UUID>] [--relayUrl <String>] [--revokedAt <Datetime>] [--updatedBy <UUID>] [--updatedByPrincipal <UUID>]
```

### Get a machine by id

```bash
csdk machine get --id <value>
```
