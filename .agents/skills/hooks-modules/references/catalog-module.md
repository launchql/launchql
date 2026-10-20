# catalogModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for CatalogModule data operations

## Usage

```typescript
useCatalogModulesQuery({ selection: { fields: { apiName: true, apisTableId: true, apisTableName: true, appStoreIdentitiesTableId: true, appStoreIdentitiesTableName: true, appsTableId: true, appsTableName: true, bindingsTableId: true, bindingsTableName: true, bucketsTableId: true, bucketsTableName: true, databaseId: true, defaultCapabilities: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityTableId: true, functionsTableId: true, functionsTableName: true, id: true, imagesTableId: true, imagesTableName: true, managedDomainsTableId: true, managedDomainsTableName: true, namespacesTableId: true, namespacesTableName: true, policies: true, privateApiName: true, provisions: true, publicSchemaName: true, redirectsTableId: true, redirectsTableName: true, resourceDefinitionsTableId: true, resourceDefinitionsTableName: true, resourceInstallationsTableId: true, resourceInstallationsTableName: true, resourcesTableId: true, resourcesTableName: true, schemaId: true, scope: true, sitesAppLinksTableId: true, sitesAppLinksTableName: true, sitesDeepLinksTableId: true, sitesDeepLinksTableName: true, sitesErrorPagesTableId: true, sitesErrorPagesTableName: true, sitesTableId: true, sitesTableName: true, sitesWebConfigTableId: true, sitesWebConfigTableName: true } } })
useCatalogModuleQuery({ id: '<UUID>', selection: { fields: { apiName: true, apisTableId: true, apisTableName: true, appStoreIdentitiesTableId: true, appStoreIdentitiesTableName: true, appsTableId: true, appsTableName: true, bindingsTableId: true, bindingsTableName: true, bucketsTableId: true, bucketsTableName: true, databaseId: true, defaultCapabilities: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityTableId: true, functionsTableId: true, functionsTableName: true, id: true, imagesTableId: true, imagesTableName: true, managedDomainsTableId: true, managedDomainsTableName: true, namespacesTableId: true, namespacesTableName: true, policies: true, privateApiName: true, provisions: true, publicSchemaName: true, redirectsTableId: true, redirectsTableName: true, resourceDefinitionsTableId: true, resourceDefinitionsTableName: true, resourceInstallationsTableId: true, resourceInstallationsTableName: true, resourcesTableId: true, resourcesTableName: true, schemaId: true, scope: true, sitesAppLinksTableId: true, sitesAppLinksTableName: true, sitesDeepLinksTableId: true, sitesDeepLinksTableName: true, sitesErrorPagesTableId: true, sitesErrorPagesTableName: true, sitesTableId: true, sitesTableName: true, sitesWebConfigTableId: true, sitesWebConfigTableName: true } } })
useCreateCatalogModuleMutation({ selection: { fields: { id: true } } })
useUpdateCatalogModuleMutation({ selection: { fields: { id: true } } })
useDeleteCatalogModuleMutation({})
```

## Examples

### List all catalogModules

```typescript
const { data, isLoading } = useCatalogModulesQuery({
  selection: { fields: { apiName: true, apisTableId: true, apisTableName: true, appStoreIdentitiesTableId: true, appStoreIdentitiesTableName: true, appsTableId: true, appsTableName: true, bindingsTableId: true, bindingsTableName: true, bucketsTableId: true, bucketsTableName: true, databaseId: true, defaultCapabilities: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityTableId: true, functionsTableId: true, functionsTableName: true, id: true, imagesTableId: true, imagesTableName: true, managedDomainsTableId: true, managedDomainsTableName: true, namespacesTableId: true, namespacesTableName: true, policies: true, privateApiName: true, provisions: true, publicSchemaName: true, redirectsTableId: true, redirectsTableName: true, resourceDefinitionsTableId: true, resourceDefinitionsTableName: true, resourceInstallationsTableId: true, resourceInstallationsTableName: true, resourcesTableId: true, resourcesTableName: true, schemaId: true, scope: true, sitesAppLinksTableId: true, sitesAppLinksTableName: true, sitesDeepLinksTableId: true, sitesDeepLinksTableName: true, sitesErrorPagesTableId: true, sitesErrorPagesTableName: true, sitesTableId: true, sitesTableName: true, sitesWebConfigTableId: true, sitesWebConfigTableName: true } },
});
```

### Create a catalogModule

```typescript
const { mutate } = useCreateCatalogModuleMutation({
  selection: { fields: { id: true } },
});
mutate({ apiName: '<String>', apisTableId: '<UUID>', apisTableName: '<String>', appStoreIdentitiesTableId: '<UUID>', appStoreIdentitiesTableName: '<String>', appsTableId: '<UUID>', appsTableName: '<String>', bindingsTableId: '<UUID>', bindingsTableName: '<String>', bucketsTableId: '<UUID>', bucketsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', domainVerificationsTableId: '<UUID>', domainVerificationsTableName: '<String>', domainsTableId: '<UUID>', domainsTableName: '<String>', entityTableId: '<UUID>', functionsTableId: '<UUID>', functionsTableName: '<String>', imagesTableId: '<UUID>', imagesTableName: '<String>', managedDomainsTableId: '<UUID>', managedDomainsTableName: '<String>', namespacesTableId: '<UUID>', namespacesTableName: '<String>', policies: '<JSON>', privateApiName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', redirectsTableId: '<UUID>', redirectsTableName: '<String>', resourceDefinitionsTableId: '<UUID>', resourceDefinitionsTableName: '<String>', resourceInstallationsTableId: '<UUID>', resourceInstallationsTableName: '<String>', resourcesTableId: '<UUID>', resourcesTableName: '<String>', schemaId: '<UUID>', scope: '<String>', sitesAppLinksTableId: '<UUID>', sitesAppLinksTableName: '<String>', sitesDeepLinksTableId: '<UUID>', sitesDeepLinksTableName: '<String>', sitesErrorPagesTableId: '<UUID>', sitesErrorPagesTableName: '<String>', sitesTableId: '<UUID>', sitesTableName: '<String>', sitesWebConfigTableId: '<UUID>', sitesWebConfigTableName: '<String>' });
```
