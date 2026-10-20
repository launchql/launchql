# catalogModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for CatalogModule records via csdk CLI

## Usage

```bash
csdk catalog-module list
csdk catalog-module list --where.<field>.<op> <value> --orderBy <values>
csdk catalog-module list --limit 10 --after <cursor>
csdk catalog-module find-first --where.<field>.<op> <value>
csdk catalog-module get --id <UUID>
csdk catalog-module create --databaseId <UUID> --scope <String> [--apiName <String>] [--apisTableId <UUID>] [--apisTableName <String>] [--appStoreIdentitiesTableId <UUID>] [--appStoreIdentitiesTableName <String>] [--appsTableId <UUID>] [--appsTableName <String>] [--bindingsTableId <UUID>] [--bindingsTableName <String>] [--bucketsTableId <UUID>] [--bucketsTableName <String>] [--defaultCapabilities <String>] [--domainVerificationsTableId <UUID>] [--domainVerificationsTableName <String>] [--domainsTableId <UUID>] [--domainsTableName <String>] [--entityTableId <UUID>] [--functionsTableId <UUID>] [--functionsTableName <String>] [--imagesTableId <UUID>] [--imagesTableName <String>] [--managedDomainsTableId <UUID>] [--managedDomainsTableName <String>] [--namespacesTableId <UUID>] [--namespacesTableName <String>] [--policies <JSON>] [--privateApiName <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--redirectsTableId <UUID>] [--redirectsTableName <String>] [--resourceDefinitionsTableId <UUID>] [--resourceDefinitionsTableName <String>] [--resourceInstallationsTableId <UUID>] [--resourceInstallationsTableName <String>] [--resourcesTableId <UUID>] [--resourcesTableName <String>] [--schemaId <UUID>] [--sitesAppLinksTableId <UUID>] [--sitesAppLinksTableName <String>] [--sitesDeepLinksTableId <UUID>] [--sitesDeepLinksTableName <String>] [--sitesErrorPagesTableId <UUID>] [--sitesErrorPagesTableName <String>] [--sitesTableId <UUID>] [--sitesTableName <String>] [--sitesWebConfigTableId <UUID>] [--sitesWebConfigTableName <String>]
csdk catalog-module update --id <UUID> [--apiName <String>] [--apisTableId <UUID>] [--apisTableName <String>] [--appStoreIdentitiesTableId <UUID>] [--appStoreIdentitiesTableName <String>] [--appsTableId <UUID>] [--appsTableName <String>] [--bindingsTableId <UUID>] [--bindingsTableName <String>] [--bucketsTableId <UUID>] [--bucketsTableName <String>] [--databaseId <UUID>] [--defaultCapabilities <String>] [--domainVerificationsTableId <UUID>] [--domainVerificationsTableName <String>] [--domainsTableId <UUID>] [--domainsTableName <String>] [--entityTableId <UUID>] [--functionsTableId <UUID>] [--functionsTableName <String>] [--imagesTableId <UUID>] [--imagesTableName <String>] [--managedDomainsTableId <UUID>] [--managedDomainsTableName <String>] [--namespacesTableId <UUID>] [--namespacesTableName <String>] [--policies <JSON>] [--privateApiName <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--redirectsTableId <UUID>] [--redirectsTableName <String>] [--resourceDefinitionsTableId <UUID>] [--resourceDefinitionsTableName <String>] [--resourceInstallationsTableId <UUID>] [--resourceInstallationsTableName <String>] [--resourcesTableId <UUID>] [--resourcesTableName <String>] [--schemaId <UUID>] [--scope <String>] [--sitesAppLinksTableId <UUID>] [--sitesAppLinksTableName <String>] [--sitesDeepLinksTableId <UUID>] [--sitesDeepLinksTableName <String>] [--sitesErrorPagesTableId <UUID>] [--sitesErrorPagesTableName <String>] [--sitesTableId <UUID>] [--sitesTableName <String>] [--sitesWebConfigTableId <UUID>] [--sitesWebConfigTableName <String>]
csdk catalog-module delete --id <UUID>
```

## Examples

### List catalogModule records

```bash
csdk catalog-module list
```

### List catalogModule records with pagination

```bash
csdk catalog-module list --limit 10 --offset 0
```

### List catalogModule records with cursor pagination

```bash
csdk catalog-module list --limit 10 --after <cursor>
```

### Find first matching catalogModule

```bash
csdk catalog-module find-first --where.id.equalTo <value>
```

### List catalogModule records with field selection

```bash
csdk catalog-module list --select id,id
```

### List catalogModule records with filtering and ordering

```bash
csdk catalog-module list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a catalogModule

```bash
csdk catalog-module create --databaseId <UUID> --scope <String> [--apiName <String>] [--apisTableId <UUID>] [--apisTableName <String>] [--appStoreIdentitiesTableId <UUID>] [--appStoreIdentitiesTableName <String>] [--appsTableId <UUID>] [--appsTableName <String>] [--bindingsTableId <UUID>] [--bindingsTableName <String>] [--bucketsTableId <UUID>] [--bucketsTableName <String>] [--defaultCapabilities <String>] [--domainVerificationsTableId <UUID>] [--domainVerificationsTableName <String>] [--domainsTableId <UUID>] [--domainsTableName <String>] [--entityTableId <UUID>] [--functionsTableId <UUID>] [--functionsTableName <String>] [--imagesTableId <UUID>] [--imagesTableName <String>] [--managedDomainsTableId <UUID>] [--managedDomainsTableName <String>] [--namespacesTableId <UUID>] [--namespacesTableName <String>] [--policies <JSON>] [--privateApiName <String>] [--provisions <JSON>] [--publicSchemaName <String>] [--redirectsTableId <UUID>] [--redirectsTableName <String>] [--resourceDefinitionsTableId <UUID>] [--resourceDefinitionsTableName <String>] [--resourceInstallationsTableId <UUID>] [--resourceInstallationsTableName <String>] [--resourcesTableId <UUID>] [--resourcesTableName <String>] [--schemaId <UUID>] [--sitesAppLinksTableId <UUID>] [--sitesAppLinksTableName <String>] [--sitesDeepLinksTableId <UUID>] [--sitesDeepLinksTableName <String>] [--sitesErrorPagesTableId <UUID>] [--sitesErrorPagesTableName <String>] [--sitesTableId <UUID>] [--sitesTableName <String>] [--sitesWebConfigTableId <UUID>] [--sitesWebConfigTableName <String>]
```

### Get a catalogModule by id

```bash
csdk catalog-module get --id <value>
```
