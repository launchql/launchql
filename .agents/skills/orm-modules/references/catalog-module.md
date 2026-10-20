# catalogModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for CatalogModule records

## Usage

```typescript
db.catalogModule.findMany({ select: { id: true } }).execute()
db.catalogModule.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.catalogModule.create({ data: { apiName: '<String>', apisTableId: '<UUID>', apisTableName: '<String>', appStoreIdentitiesTableId: '<UUID>', appStoreIdentitiesTableName: '<String>', appsTableId: '<UUID>', appsTableName: '<String>', bindingsTableId: '<UUID>', bindingsTableName: '<String>', bucketsTableId: '<UUID>', bucketsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', domainVerificationsTableId: '<UUID>', domainVerificationsTableName: '<String>', domainsTableId: '<UUID>', domainsTableName: '<String>', entityTableId: '<UUID>', functionsTableId: '<UUID>', functionsTableName: '<String>', imagesTableId: '<UUID>', imagesTableName: '<String>', managedDomainsTableId: '<UUID>', managedDomainsTableName: '<String>', namespacesTableId: '<UUID>', namespacesTableName: '<String>', policies: '<JSON>', privateApiName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', redirectsTableId: '<UUID>', redirectsTableName: '<String>', resourceDefinitionsTableId: '<UUID>', resourceDefinitionsTableName: '<String>', resourceInstallationsTableId: '<UUID>', resourceInstallationsTableName: '<String>', resourcesTableId: '<UUID>', resourcesTableName: '<String>', schemaId: '<UUID>', scope: '<String>', sitesAppLinksTableId: '<UUID>', sitesAppLinksTableName: '<String>', sitesDeepLinksTableId: '<UUID>', sitesDeepLinksTableName: '<String>', sitesErrorPagesTableId: '<UUID>', sitesErrorPagesTableName: '<String>', sitesTableId: '<UUID>', sitesTableName: '<String>', sitesWebConfigTableId: '<UUID>', sitesWebConfigTableName: '<String>' }, select: { id: true } }).execute()
db.catalogModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute()
db.catalogModule.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all catalogModule records

```typescript
const items = await db.catalogModule.findMany({
  select: { id: true, apiName: true }
}).execute();
```

### Create a catalogModule

```typescript
const item = await db.catalogModule.create({
  data: { apiName: '<String>', apisTableId: '<UUID>', apisTableName: '<String>', appStoreIdentitiesTableId: '<UUID>', appStoreIdentitiesTableName: '<String>', appsTableId: '<UUID>', appsTableName: '<String>', bindingsTableId: '<UUID>', bindingsTableName: '<String>', bucketsTableId: '<UUID>', bucketsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', domainVerificationsTableId: '<UUID>', domainVerificationsTableName: '<String>', domainsTableId: '<UUID>', domainsTableName: '<String>', entityTableId: '<UUID>', functionsTableId: '<UUID>', functionsTableName: '<String>', imagesTableId: '<UUID>', imagesTableName: '<String>', managedDomainsTableId: '<UUID>', managedDomainsTableName: '<String>', namespacesTableId: '<UUID>', namespacesTableName: '<String>', policies: '<JSON>', privateApiName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', redirectsTableId: '<UUID>', redirectsTableName: '<String>', resourceDefinitionsTableId: '<UUID>', resourceDefinitionsTableName: '<String>', resourceInstallationsTableId: '<UUID>', resourceInstallationsTableName: '<String>', resourcesTableId: '<UUID>', resourcesTableName: '<String>', schemaId: '<UUID>', scope: '<String>', sitesAppLinksTableId: '<UUID>', sitesAppLinksTableName: '<String>', sitesDeepLinksTableId: '<UUID>', sitesDeepLinksTableName: '<String>', sitesErrorPagesTableId: '<UUID>', sitesErrorPagesTableName: '<String>', sitesTableId: '<UUID>', sitesTableName: '<String>', sitesWebConfigTableId: '<UUID>', sitesWebConfigTableName: '<String>' },
  select: { id: true }
}).execute();
```
