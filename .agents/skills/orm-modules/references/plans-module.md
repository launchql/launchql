# plansModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for PlansModule records

## Usage

```typescript
db.plansModule.findMany({ select: { id: true } }).execute()
db.plansModule.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.plansModule.create({ data: { apiName: '<String>', applyBillingPlanFunction: '<String>', applyPlanAggregateFunction: '<String>', applyPlanCapsFunction: '<String>', applyPlanFunction: '<String>', databaseId: '<UUID>', planCapsTableId: '<UUID>', planLimitsTableId: '<UUID>', planLimitsTableName: '<String>', planMeterLimitsTableId: '<UUID>', planPricingTableId: '<UUID>', plansTableId: '<UUID>', plansTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>' }, select: { id: true } }).execute()
db.plansModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute()
db.plansModule.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all plansModule records

```typescript
const items = await db.plansModule.findMany({
  select: { id: true, apiName: true }
}).execute();
```

### Create a plansModule

```typescript
const item = await db.plansModule.create({
  data: { apiName: '<String>', applyBillingPlanFunction: '<String>', applyPlanAggregateFunction: '<String>', applyPlanCapsFunction: '<String>', applyPlanFunction: '<String>', databaseId: '<UUID>', planCapsTableId: '<UUID>', planLimitsTableId: '<UUID>', planLimitsTableName: '<String>', planMeterLimitsTableId: '<UUID>', planPricingTableId: '<UUID>', plansTableId: '<UUID>', plansTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>' },
  select: { id: true }
}).execute();
```
