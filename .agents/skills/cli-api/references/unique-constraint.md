# uniqueConstraint

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for UniqueConstraint records via csdk CLI

## Usage

```bash
csdk unique-constraint list
csdk unique-constraint list --where.<field>.<op> <value> --orderBy <values>
csdk unique-constraint list --limit 10 --after <cursor>
csdk unique-constraint find-first --where.<field>.<op> <value>
csdk unique-constraint get --id <UUID>
csdk unique-constraint create --fieldIds <UUID> --tableId <UUID> [--category <ObjectCategory>] [--databaseId <UUID>] [--description <String>] [--initiallyDeferred <Boolean>] [--isDeferrable <Boolean>] [--name <String>] [--nullsNotDistinct <Boolean>] [--smartTags <JSON>] [--tags <String>] [--type <String>] [--withoutOverlaps <Boolean>]
csdk unique-constraint update --id <UUID> [--category <ObjectCategory>] [--databaseId <UUID>] [--description <String>] [--fieldIds <UUID>] [--initiallyDeferred <Boolean>] [--isDeferrable <Boolean>] [--name <String>] [--nullsNotDistinct <Boolean>] [--smartTags <JSON>] [--tableId <UUID>] [--tags <String>] [--type <String>] [--withoutOverlaps <Boolean>]
csdk unique-constraint delete --id <UUID>
```

## Examples

### List uniqueConstraint records

```bash
csdk unique-constraint list
```

### List uniqueConstraint records with pagination

```bash
csdk unique-constraint list --limit 10 --offset 0
```

### List uniqueConstraint records with cursor pagination

```bash
csdk unique-constraint list --limit 10 --after <cursor>
```

### Find first matching uniqueConstraint

```bash
csdk unique-constraint find-first --where.id.equalTo <value>
```

### List uniqueConstraint records with field selection

```bash
csdk unique-constraint list --select id,id
```

### List uniqueConstraint records with filtering and ordering

```bash
csdk unique-constraint list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a uniqueConstraint

```bash
csdk unique-constraint create --fieldIds <UUID> --tableId <UUID> [--category <ObjectCategory>] [--databaseId <UUID>] [--description <String>] [--initiallyDeferred <Boolean>] [--isDeferrable <Boolean>] [--name <String>] [--nullsNotDistinct <Boolean>] [--smartTags <JSON>] [--tags <String>] [--type <String>] [--withoutOverlaps <Boolean>]
```

### Get a uniqueConstraint by id

```bash
csdk unique-constraint get --id <value>
```
