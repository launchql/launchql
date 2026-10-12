# plansModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for PlansModule data operations

## Usage

```typescript
usePlansModulesQuery({ selection: { fields: { apiName: true, applyBillingPlanFunction: true, applyPlanAggregateFunction: true, applyPlanCapsFunction: true, applyPlanFunction: true, databaseId: true, id: true, planCapsTableId: true, planLimitsTableId: true, planLimitsTableName: true, planMeterLimitsTableId: true, planPricingTableId: true, plansTableId: true, plansTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true } } })
usePlansModuleQuery({ id: '<UUID>', selection: { fields: { apiName: true, applyBillingPlanFunction: true, applyPlanAggregateFunction: true, applyPlanCapsFunction: true, applyPlanFunction: true, databaseId: true, id: true, planCapsTableId: true, planLimitsTableId: true, planLimitsTableName: true, planMeterLimitsTableId: true, planPricingTableId: true, plansTableId: true, plansTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true } } })
useCreatePlansModuleMutation({ selection: { fields: { id: true } } })
useUpdatePlansModuleMutation({ selection: { fields: { id: true } } })
useDeletePlansModuleMutation({})
```

## Examples

### List all plansModules

```typescript
const { data, isLoading } = usePlansModulesQuery({
  selection: { fields: { apiName: true, applyBillingPlanFunction: true, applyPlanAggregateFunction: true, applyPlanCapsFunction: true, applyPlanFunction: true, databaseId: true, id: true, planCapsTableId: true, planLimitsTableId: true, planLimitsTableName: true, planMeterLimitsTableId: true, planPricingTableId: true, plansTableId: true, plansTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true } },
});
```

### Create a plansModule

```typescript
const { mutate } = useCreatePlansModuleMutation({
  selection: { fields: { id: true } },
});
mutate({ apiName: '<String>', applyBillingPlanFunction: '<String>', applyPlanAggregateFunction: '<String>', applyPlanCapsFunction: '<String>', applyPlanFunction: '<String>', databaseId: '<UUID>', planCapsTableId: '<UUID>', planLimitsTableId: '<UUID>', planLimitsTableName: '<String>', planMeterLimitsTableId: '<UUID>', planPricingTableId: '<UUID>', plansTableId: '<UUID>', plansTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>' });
```
