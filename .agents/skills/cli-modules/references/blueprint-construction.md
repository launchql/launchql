# blueprintConstruction

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for BlueprintConstruction records via csdk CLI

## Usage

```bash
csdk blueprint-construction list
csdk blueprint-construction list --where.<field>.<op> <value> --orderBy <values>
csdk blueprint-construction list --limit 10 --after <cursor>
csdk blueprint-construction find-first --where.<field>.<op> <value>
csdk blueprint-construction get --id <UUID>
csdk blueprint-construction create --blueprintId <UUID> --databaseId <UUID> [--constructedAt <Datetime>] [--constructedDefinition <JSON>] [--error <JSON>] [--schemaId <UUID>] [--status <String>] [--tableMap <JSON>]
csdk blueprint-construction update --id <UUID> [--blueprintId <UUID>] [--constructedAt <Datetime>] [--constructedDefinition <JSON>] [--databaseId <UUID>] [--error <JSON>] [--schemaId <UUID>] [--status <String>] [--tableMap <JSON>]
csdk blueprint-construction delete --id <UUID>
```

## Examples

### List blueprintConstruction records

```bash
csdk blueprint-construction list
```

### List blueprintConstruction records with pagination

```bash
csdk blueprint-construction list --limit 10 --offset 0
```

### List blueprintConstruction records with cursor pagination

```bash
csdk blueprint-construction list --limit 10 --after <cursor>
```

### Find first matching blueprintConstruction

```bash
csdk blueprint-construction find-first --where.id.equalTo <value>
```

### List blueprintConstruction records with field selection

```bash
csdk blueprint-construction list --select id,id
```

### List blueprintConstruction records with filtering and ordering

```bash
csdk blueprint-construction list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a blueprintConstruction

```bash
csdk blueprint-construction create --blueprintId <UUID> --databaseId <UUID> [--constructedAt <Datetime>] [--constructedDefinition <JSON>] [--error <JSON>] [--schemaId <UUID>] [--status <String>] [--tableMap <JSON>]
```

### Get a blueprintConstruction by id

```bash
csdk blueprint-construction get --id <value>
```
