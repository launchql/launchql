# listSuspendedDatabasesRecord

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for ListSuspendedDatabasesRecord records via csdk CLI

## Usage

```bash
csdk list-suspended-databases-record list
csdk list-suspended-databases-record list --where.<field>.<op> <value> --orderBy <values>
csdk list-suspended-databases-record list --limit 10 --after <cursor>
csdk list-suspended-databases-record find-first --where.<field>.<op> <value>
csdk list-suspended-databases-record get --id <UUID>
csdk list-suspended-databases-record create --name <String> --ownerId <UUID> --suspendedAt <Datetime> --suspendedReason <String>
csdk list-suspended-databases-record update --id <UUID> [--name <String>] [--ownerId <UUID>] [--suspendedAt <Datetime>] [--suspendedReason <String>]
csdk list-suspended-databases-record delete --id <UUID>
```

## Examples

### List listSuspendedDatabasesRecord records

```bash
csdk list-suspended-databases-record list
```

### List listSuspendedDatabasesRecord records with pagination

```bash
csdk list-suspended-databases-record list --limit 10 --offset 0
```

### List listSuspendedDatabasesRecord records with cursor pagination

```bash
csdk list-suspended-databases-record list --limit 10 --after <cursor>
```

### Find first matching listSuspendedDatabasesRecord

```bash
csdk list-suspended-databases-record find-first --where.id.equalTo <value>
```

### List listSuspendedDatabasesRecord records with field selection

```bash
csdk list-suspended-databases-record list --select id,id
```

### List listSuspendedDatabasesRecord records with filtering and ordering

```bash
csdk list-suspended-databases-record list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a listSuspendedDatabasesRecord

```bash
csdk list-suspended-databases-record create --name <String> --ownerId <UUID> --suspendedAt <Datetime> --suspendedReason <String>
```

### Get a listSuspendedDatabasesRecord by id

```bash
csdk list-suspended-databases-record get --id <value>
```
