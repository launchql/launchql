# domainModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for DomainModule data operations

## Usage

```typescript
useDomainModulesQuery({ selection: { fields: { apiName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, domainEventsTableId: true, domainEventsTableName: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityField: true, entityTableId: true, id: true, managedDomainsTableId: true, managedDomainsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, sweepUnverifiedDomainsFunction: true } } })
useDomainModuleQuery({ id: '<UUID>', selection: { fields: { apiName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, domainEventsTableId: true, domainEventsTableName: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityField: true, entityTableId: true, id: true, managedDomainsTableId: true, managedDomainsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, sweepUnverifiedDomainsFunction: true } } })
useCreateDomainModuleMutation({ selection: { fields: { id: true } } })
useUpdateDomainModuleMutation({ selection: { fields: { id: true } } })
useDeleteDomainModuleMutation({})
```

## Examples

### List all domainModules

```typescript
const { data, isLoading } = useDomainModulesQuery({
  selection: { fields: { apiName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, domainEventsTableId: true, domainEventsTableName: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityField: true, entityTableId: true, id: true, managedDomainsTableId: true, managedDomainsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, sweepUnverifiedDomainsFunction: true } },
});
```

### Create a domainModule

```typescript
const { mutate } = useCreateDomainModuleMutation({
  selection: { fields: { id: true } },
});
mutate({ apiName: '<String>', catalogModuleId: '<UUID>', databaseId: '<UUID>', defaultCapabilities: '<String>', domainEventsTableId: '<UUID>', domainEventsTableName: '<String>', domainVerificationsTableId: '<UUID>', domainVerificationsTableName: '<String>', domainsTableId: '<UUID>', domainsTableName: '<String>', entityField: '<String>', entityTableId: '<UUID>', managedDomainsTableId: '<UUID>', managedDomainsTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', sweepUnverifiedDomainsFunction: '<String>' });
```
