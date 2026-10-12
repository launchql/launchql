# functionSchedule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for FunctionSchedule records via csdk CLI

## Usage

```bash
csdk function-schedule list
csdk function-schedule list --where.<field>.<op> <value> --orderBy <values>
csdk function-schedule list --limit 10 --after <cursor>
csdk function-schedule find-first --where.<field>.<op> <value>
csdk function-schedule get --id <UUID>
csdk function-schedule create --databaseId <UUID> --functionDefinitionId <UUID> --name <String> --scheduleInfo <JSON> [--actorId <UUID>] [--description <String>] [--isActive <Boolean>] [--payload <JSON>] [--suspendedAt <Datetime>] [--suspendedReason <String>]
csdk function-schedule update --id <UUID> [--actorId <UUID>] [--databaseId <UUID>] [--description <String>] [--functionDefinitionId <UUID>] [--isActive <Boolean>] [--name <String>] [--payload <JSON>] [--scheduleInfo <JSON>] [--suspendedAt <Datetime>] [--suspendedReason <String>]
csdk function-schedule delete --id <UUID>
```

## Examples

### List functionSchedule records

```bash
csdk function-schedule list
```

### List functionSchedule records with pagination

```bash
csdk function-schedule list --limit 10 --offset 0
```

### List functionSchedule records with cursor pagination

```bash
csdk function-schedule list --limit 10 --after <cursor>
```

### Find first matching functionSchedule

```bash
csdk function-schedule find-first --where.id.equalTo <value>
```

### List functionSchedule records with field selection

```bash
csdk function-schedule list --select id,id
```

### List functionSchedule records with filtering and ordering

```bash
csdk function-schedule list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a functionSchedule

```bash
csdk function-schedule create --databaseId <UUID> --functionDefinitionId <UUID> --name <String> --scheduleInfo <JSON> [--actorId <UUID>] [--description <String>] [--isActive <Boolean>] [--payload <JSON>] [--suspendedAt <Datetime>] [--suspendedReason <String>]
```

### Get a functionSchedule by id

```bash
csdk function-schedule get --id <value>
```
