# domainModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for DomainModule records via csdk CLI

## Usage

```bash
csdk domain-module list
csdk domain-module list --where.<field>.<op> <value> --orderBy <values>
csdk domain-module list --limit 10 --after <cursor>
csdk domain-module find-first --where.<field>.<op> <value>
csdk domain-module get --id <UUID>
csdk domain-module create --databaseId <UUID> --scope <String> [--apiName <String>] [--catalogModuleId <UUID>] [--defaultCapabilities <String>] [--domainEventsTableId <UUID>] [--domainEventsTableName <String>] [--domainVerificationsTableId <UUID>] [--domainVerificationsTableName <String>] [--domainsTableId <UUID>] [--domainsTableName <String>] [--entityField <String>] [--entityTableId <UUID>] [--managedDomainsTableId <UUID>] [--managedDomainsTableName <String>] [--policies <JSON>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--schemaId <UUID>] [--sweepUnverifiedDomainsFunction <String>]
csdk domain-module update --id <UUID> [--apiName <String>] [--catalogModuleId <UUID>] [--databaseId <UUID>] [--defaultCapabilities <String>] [--domainEventsTableId <UUID>] [--domainEventsTableName <String>] [--domainVerificationsTableId <UUID>] [--domainVerificationsTableName <String>] [--domainsTableId <UUID>] [--domainsTableName <String>] [--entityField <String>] [--entityTableId <UUID>] [--managedDomainsTableId <UUID>] [--managedDomainsTableName <String>] [--policies <JSON>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--schemaId <UUID>] [--scope <String>] [--sweepUnverifiedDomainsFunction <String>]
csdk domain-module delete --id <UUID>
```

## Examples

### List domainModule records

```bash
csdk domain-module list
```

### List domainModule records with pagination

```bash
csdk domain-module list --limit 10 --offset 0
```

### List domainModule records with cursor pagination

```bash
csdk domain-module list --limit 10 --after <cursor>
```

### Find first matching domainModule

```bash
csdk domain-module find-first --where.id.equalTo <value>
```

### List domainModule records with field selection

```bash
csdk domain-module list --select id,id
```

### List domainModule records with filtering and ordering

```bash
csdk domain-module list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a domainModule

```bash
csdk domain-module create --databaseId <UUID> --scope <String> [--apiName <String>] [--catalogModuleId <UUID>] [--defaultCapabilities <String>] [--domainEventsTableId <UUID>] [--domainEventsTableName <String>] [--domainVerificationsTableId <UUID>] [--domainVerificationsTableName <String>] [--domainsTableId <UUID>] [--domainsTableName <String>] [--entityField <String>] [--entityTableId <UUID>] [--managedDomainsTableId <UUID>] [--managedDomainsTableName <String>] [--policies <JSON>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--schemaId <UUID>] [--sweepUnverifiedDomainsFunction <String>]
```

### Get a domainModule by id

```bash
csdk domain-module get --id <value>
```
