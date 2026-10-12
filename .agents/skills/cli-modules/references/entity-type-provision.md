# entityTypeProvision

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for EntityTypeProvision records via csdk CLI

## Usage

```bash
csdk entity-type-provision list
csdk entity-type-provision list --where.<field>.<op> <value> --orderBy <values>
csdk entity-type-provision list --limit 10 --after <cursor>
csdk entity-type-provision find-first --where.<field>.<op> <value>
csdk entity-type-provision get --id <UUID>
csdk entity-type-provision create --databaseId <UUID> --name <String> --prefix <String> [--agents <JSON>] [--description <String>] [--functions <JSON>] [--graphs <JSON>] [--hasInviteAchievements <Boolean>] [--hasInvites <Boolean>] [--hasLevels <Boolean>] [--hasLimits <Boolean>] [--hasProfiles <Boolean>] [--isVisible <Boolean>] [--namespaces <JSON>] [--outAgentModuleId <UUID>] [--outDefinitionsTableId <UUID>] [--outEntityTableId <UUID>] [--outEntityTableName <String>] [--outExecutionLogsTableId <UUID>] [--outFunctionModuleId <UUID>] [--outGraphModuleId <UUID>] [--outGraphsTableId <UUID>] [--outInstalledModules <String>] [--outInvitesModuleId <UUID>] [--outInvocationsTableId <UUID>] [--outMembershipType <Int>] [--outNamespaceEventsTableId <UUID>] [--outNamespaceModuleId <UUID>] [--outNamespacesTableId <UUID>] [--parentEntity <String>] [--skipEntityPolicies <Boolean>] [--storage <JSON>] [--tableName <String>] [--tableProvision <JSON>]
csdk entity-type-provision update --id <UUID> [--agents <JSON>] [--databaseId <UUID>] [--description <String>] [--functions <JSON>] [--graphs <JSON>] [--hasInviteAchievements <Boolean>] [--hasInvites <Boolean>] [--hasLevels <Boolean>] [--hasLimits <Boolean>] [--hasProfiles <Boolean>] [--isVisible <Boolean>] [--name <String>] [--namespaces <JSON>] [--outAgentModuleId <UUID>] [--outDefinitionsTableId <UUID>] [--outEntityTableId <UUID>] [--outEntityTableName <String>] [--outExecutionLogsTableId <UUID>] [--outFunctionModuleId <UUID>] [--outGraphModuleId <UUID>] [--outGraphsTableId <UUID>] [--outInstalledModules <String>] [--outInvitesModuleId <UUID>] [--outInvocationsTableId <UUID>] [--outMembershipType <Int>] [--outNamespaceEventsTableId <UUID>] [--outNamespaceModuleId <UUID>] [--outNamespacesTableId <UUID>] [--parentEntity <String>] [--prefix <String>] [--skipEntityPolicies <Boolean>] [--storage <JSON>] [--tableName <String>] [--tableProvision <JSON>]
csdk entity-type-provision delete --id <UUID>
```

## Examples

### List entityTypeProvision records

```bash
csdk entity-type-provision list
```

### List entityTypeProvision records with pagination

```bash
csdk entity-type-provision list --limit 10 --offset 0
```

### List entityTypeProvision records with cursor pagination

```bash
csdk entity-type-provision list --limit 10 --after <cursor>
```

### Find first matching entityTypeProvision

```bash
csdk entity-type-provision find-first --where.id.equalTo <value>
```

### List entityTypeProvision records with field selection

```bash
csdk entity-type-provision list --select id,id
```

### List entityTypeProvision records with filtering and ordering

```bash
csdk entity-type-provision list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a entityTypeProvision

```bash
csdk entity-type-provision create --databaseId <UUID> --name <String> --prefix <String> [--agents <JSON>] [--description <String>] [--functions <JSON>] [--graphs <JSON>] [--hasInviteAchievements <Boolean>] [--hasInvites <Boolean>] [--hasLevels <Boolean>] [--hasLimits <Boolean>] [--hasProfiles <Boolean>] [--isVisible <Boolean>] [--namespaces <JSON>] [--outAgentModuleId <UUID>] [--outDefinitionsTableId <UUID>] [--outEntityTableId <UUID>] [--outEntityTableName <String>] [--outExecutionLogsTableId <UUID>] [--outFunctionModuleId <UUID>] [--outGraphModuleId <UUID>] [--outGraphsTableId <UUID>] [--outInstalledModules <String>] [--outInvitesModuleId <UUID>] [--outInvocationsTableId <UUID>] [--outMembershipType <Int>] [--outNamespaceEventsTableId <UUID>] [--outNamespaceModuleId <UUID>] [--outNamespacesTableId <UUID>] [--parentEntity <String>] [--skipEntityPolicies <Boolean>] [--storage <JSON>] [--tableName <String>] [--tableProvision <JSON>]
```

### Get a entityTypeProvision by id

```bash
csdk entity-type-provision get --id <value>
```
