# plansModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlansModule records via csdk CLI

## Usage

```bash
csdk plans-module list
csdk plans-module list --where.<field>.<op> <value> --orderBy <values>
csdk plans-module list --limit 10 --after <cursor>
csdk plans-module find-first --where.<field>.<op> <value>
csdk plans-module get --id <UUID>
csdk plans-module create --databaseId <UUID> [--apiName <String>] [--applyBillingPlanFunction <String>] [--applyPlanAggregateFunction <String>] [--applyPlanCapsFunction <String>] [--applyPlanFunction <String>] [--planCapsTableId <UUID>] [--planLimitsTableId <UUID>] [--planLimitsTableName <String>] [--planMeterLimitsTableId <UUID>] [--planPricingTableId <UUID>] [--plansTableId <UUID>] [--plansTableName <String>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--publicSchemaName <String>] [--schemaId <UUID>]
csdk plans-module update --id <UUID> [--apiName <String>] [--applyBillingPlanFunction <String>] [--applyPlanAggregateFunction <String>] [--applyPlanCapsFunction <String>] [--applyPlanFunction <String>] [--databaseId <UUID>] [--planCapsTableId <UUID>] [--planLimitsTableId <UUID>] [--planLimitsTableName <String>] [--planMeterLimitsTableId <UUID>] [--planPricingTableId <UUID>] [--plansTableId <UUID>] [--plansTableName <String>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--publicSchemaName <String>] [--schemaId <UUID>]
csdk plans-module delete --id <UUID>
```

## Examples

### List plansModule records

```bash
csdk plans-module list
```

### List plansModule records with pagination

```bash
csdk plans-module list --limit 10 --offset 0
```

### List plansModule records with cursor pagination

```bash
csdk plans-module list --limit 10 --after <cursor>
```

### Find first matching plansModule

```bash
csdk plans-module find-first --where.id.equalTo <value>
```

### List plansModule records with field selection

```bash
csdk plans-module list --select id,id
```

### List plansModule records with filtering and ordering

```bash
csdk plans-module list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a plansModule

```bash
csdk plans-module create --databaseId <UUID> [--apiName <String>] [--applyBillingPlanFunction <String>] [--applyPlanAggregateFunction <String>] [--applyPlanCapsFunction <String>] [--applyPlanFunction <String>] [--planCapsTableId <UUID>] [--planLimitsTableId <UUID>] [--planLimitsTableName <String>] [--planMeterLimitsTableId <UUID>] [--planPricingTableId <UUID>] [--plansTableId <UUID>] [--plansTableName <String>] [--prefix <String>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--privateSchemaName <String>] [--publicSchemaName <String>] [--schemaId <UUID>]
```

### Get a plansModule by id

```bash
csdk plans-module get --id <value>
```
