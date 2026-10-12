# platformFunctionSchedule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionSchedule records via csdk CLI

## Usage

```bash
csdk platform-function-schedule list
csdk platform-function-schedule list --where.<field>.<op> <value> --orderBy <values>
csdk platform-function-schedule list --limit 10 --after <cursor>
csdk platform-function-schedule find-first --where.<field>.<op> <value>
csdk platform-function-schedule get --id <UUID>
csdk platform-function-schedule create --functionDefinitionId <UUID> --name <String> --scheduleInfo <JSON> [--actorId <UUID>] [--description <String>] [--isActive <Boolean>] [--payload <JSON>] [--suspendedAt <Datetime>] [--suspendedReason <String>]
csdk platform-function-schedule update --id <UUID> [--actorId <UUID>] [--description <String>] [--functionDefinitionId <UUID>] [--isActive <Boolean>] [--name <String>] [--payload <JSON>] [--scheduleInfo <JSON>] [--suspendedAt <Datetime>] [--suspendedReason <String>]
csdk platform-function-schedule delete --id <UUID>
```

## Examples

### List platformFunctionSchedule records

```bash
csdk platform-function-schedule list
```

### List platformFunctionSchedule records with pagination

```bash
csdk platform-function-schedule list --limit 10 --offset 0
```

### List platformFunctionSchedule records with cursor pagination

```bash
csdk platform-function-schedule list --limit 10 --after <cursor>
```

### Find first matching platformFunctionSchedule

```bash
csdk platform-function-schedule find-first --where.id.equalTo <value>
```

### List platformFunctionSchedule records with field selection

```bash
csdk platform-function-schedule list --select id,id
```

### List platformFunctionSchedule records with filtering and ordering

```bash
csdk platform-function-schedule list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionSchedule

```bash
csdk platform-function-schedule create --functionDefinitionId <UUID> --name <String> --scheduleInfo <JSON> [--actorId <UUID>] [--description <String>] [--isActive <Boolean>] [--payload <JSON>] [--suspendedAt <Datetime>] [--suspendedReason <String>]
```

### Get a platformFunctionSchedule by id

```bash
csdk platform-function-schedule get --id <value>
```
