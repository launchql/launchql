# entityTypeProvision

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Provisions a new membership entity type. Each INSERT creates an entity table, registers a membership type,
     and installs the required modules (capabilities, memberships, limits) plus optional modules (profiles, levels, invites).
     Uses provision_membership_table() internally. Graceful: duplicate (database_id, prefix) pairs are silently skipped
     via the unique constraint (use INSERT ... ON CONFLICT DO NOTHING).
     Policy behavior: by default the five entity-table RLS policies are applied (gated by is_visible).
     Set table_provision to a single jsonb object (using the same shape as provision_table() /
     blueprint tables[] entries) to replace the defaults with your own; set skip_entity_policies=true
     as an escape hatch to apply zero policies.

## Usage

```typescript
db.entityTypeProvision.findMany({ select: { id: true } }).execute()
db.entityTypeProvision.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.entityTypeProvision.create({ data: { agents: '<JSON>', databaseId: '<UUID>', description: '<String>', functions: '<JSON>', graphs: '<JSON>', hasInviteAchievements: '<Boolean>', hasInvites: '<Boolean>', hasLevels: '<Boolean>', hasLimits: '<Boolean>', hasProfiles: '<Boolean>', isVisible: '<Boolean>', name: '<String>', namespaces: '<JSON>', outAgentModuleId: '<UUID>', outDefinitionsTableId: '<UUID>', outEntityTableId: '<UUID>', outEntityTableName: '<String>', outExecutionLogsTableId: '<UUID>', outFunctionModuleId: '<UUID>', outGraphModuleId: '<UUID>', outGraphsTableId: '<UUID>', outInstalledModules: '<String>', outInvitesModuleId: '<UUID>', outInvocationsTableId: '<UUID>', outMembershipType: '<Int>', outNamespaceEventsTableId: '<UUID>', outNamespaceModuleId: '<UUID>', outNamespacesTableId: '<UUID>', parentEntity: '<String>', prefix: '<String>', skipEntityPolicies: '<Boolean>', storage: '<JSON>', tableName: '<String>', tableProvision: '<JSON>' }, select: { id: true } }).execute()
db.entityTypeProvision.update({ where: { id: '<UUID>' }, data: { agents: '<JSON>' }, select: { id: true } }).execute()
db.entityTypeProvision.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all entityTypeProvision records

```typescript
const items = await db.entityTypeProvision.findMany({
  select: { id: true, agents: true }
}).execute();
```

### Create a entityTypeProvision

```typescript
const item = await db.entityTypeProvision.create({
  data: { agents: '<JSON>', databaseId: '<UUID>', description: '<String>', functions: '<JSON>', graphs: '<JSON>', hasInviteAchievements: '<Boolean>', hasInvites: '<Boolean>', hasLevels: '<Boolean>', hasLimits: '<Boolean>', hasProfiles: '<Boolean>', isVisible: '<Boolean>', name: '<String>', namespaces: '<JSON>', outAgentModuleId: '<UUID>', outDefinitionsTableId: '<UUID>', outEntityTableId: '<UUID>', outEntityTableName: '<String>', outExecutionLogsTableId: '<UUID>', outFunctionModuleId: '<UUID>', outGraphModuleId: '<UUID>', outGraphsTableId: '<UUID>', outInstalledModules: '<String>', outInvitesModuleId: '<UUID>', outInvocationsTableId: '<UUID>', outMembershipType: '<Int>', outNamespaceEventsTableId: '<UUID>', outNamespaceModuleId: '<UUID>', outNamespacesTableId: '<UUID>', parentEntity: '<String>', prefix: '<String>', skipEntityPolicies: '<Boolean>', storage: '<JSON>', tableName: '<String>', tableProvision: '<JSON>' },
  select: { id: true }
}).execute();
```
