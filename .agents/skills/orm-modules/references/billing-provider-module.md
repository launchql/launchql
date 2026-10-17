# billingProviderModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for BillingProviderModule records

## Usage

```typescript
db.billingProviderModule.findMany({ select: { id: true } }).execute()
db.billingProviderModule.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.billingProviderModule.create({ data: { activatePlanSubscriptionFunction: '<String>', apiName: '<String>', applyProviderObservationFunction: '<String>', billingConnectionTableId: '<UUID>', billingConnectionTableName: '<String>', billingCustomersTableId: '<UUID>', billingCustomersTableName: '<String>', billingDisputesTableId: '<UUID>', billingDisputesTableName: '<String>', billingHealthTableId: '<UUID>', billingHealthTableName: '<String>', billingInvoicesTableId: '<UUID>', billingInvoicesTableName: '<String>', billingOperationsTableId: '<UUID>', billingOperationsTableName: '<String>', billingPricesTableId: '<UUID>', billingPricesTableName: '<String>', billingProductsTableId: '<UUID>', billingProductsTableName: '<String>', billingProviderConnectedFunction: '<String>', billingProviderStateTableId: '<UUID>', billingProviderStateTableName: '<String>', billingRefundsTableId: '<UUID>', billingRefundsTableName: '<String>', billingSubscriptionsTableId: '<UUID>', billingSubscriptionsTableName: '<String>', billingWebhookEventsTableId: '<UUID>', billingWebhookEventsTableName: '<String>', bindCheckoutSessionFunction: '<String>', clearScheduledChangeFunction: '<String>', databaseId: '<UUID>', finishBillingOperationFunction: '<String>', getActivePlanPricingFunction: '<String>', getActivePlanSubscriptionFunction: '<String>', getBillingCustomerFunction: '<String>', getBillingPriceFunction: '<String>', getBillingProductFunction: '<String>', getBillingProviderStateFunction: '<String>', getBillingSubscriptionByEntityFunction: '<String>', getBillingSubscriptionByExternalIdFunction: '<String>', getBillingSubscriptionFunction: '<String>', getFallbackFreePlanFunction: '<String>', getPlanPricingByExternalPriceFunction: '<String>', hasDueReconciliationsFunction: '<String>', listDueReconciliationsFunction: '<String>', listPendingUsageSyncFunction: '<String>', markUsageSyncedFunction: '<String>', prefix: '<String>', prepareScheduledChangeFunction: '<String>', pricesTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', processBillingEventFunction: '<String>', productsTableId: '<UUID>', provider: '<String>', recordBillingConnectionFunction: '<String>', recordBillingHealthFunction: '<String>', recordDisputeFunction: '<String>', recordRefundFunction: '<String>', reserveBillingOperationFunction: '<String>', schemaId: '<UUID>', subscriptionsTableId: '<UUID>', sweepOverdueSubscriptionsFunction: '<String>', upsertBillingCustomerFunction: '<String>', upsertBillingPriceFunction: '<String>', upsertBillingProductFunction: '<String>', upsertBillingSubscriptionFunction: '<String>', upsertInvoiceFunction: '<String>', usageSyncShardCount: '<Int>' }, select: { id: true } }).execute()
db.billingProviderModule.update({ where: { id: '<UUID>' }, data: { activatePlanSubscriptionFunction: '<String>' }, select: { id: true } }).execute()
db.billingProviderModule.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all billingProviderModule records

```typescript
const items = await db.billingProviderModule.findMany({
  select: { id: true, activatePlanSubscriptionFunction: true }
}).execute();
```

### Create a billingProviderModule

```typescript
const item = await db.billingProviderModule.create({
  data: { activatePlanSubscriptionFunction: '<String>', apiName: '<String>', applyProviderObservationFunction: '<String>', billingConnectionTableId: '<UUID>', billingConnectionTableName: '<String>', billingCustomersTableId: '<UUID>', billingCustomersTableName: '<String>', billingDisputesTableId: '<UUID>', billingDisputesTableName: '<String>', billingHealthTableId: '<UUID>', billingHealthTableName: '<String>', billingInvoicesTableId: '<UUID>', billingInvoicesTableName: '<String>', billingOperationsTableId: '<UUID>', billingOperationsTableName: '<String>', billingPricesTableId: '<UUID>', billingPricesTableName: '<String>', billingProductsTableId: '<UUID>', billingProductsTableName: '<String>', billingProviderConnectedFunction: '<String>', billingProviderStateTableId: '<UUID>', billingProviderStateTableName: '<String>', billingRefundsTableId: '<UUID>', billingRefundsTableName: '<String>', billingSubscriptionsTableId: '<UUID>', billingSubscriptionsTableName: '<String>', billingWebhookEventsTableId: '<UUID>', billingWebhookEventsTableName: '<String>', bindCheckoutSessionFunction: '<String>', clearScheduledChangeFunction: '<String>', databaseId: '<UUID>', finishBillingOperationFunction: '<String>', getActivePlanPricingFunction: '<String>', getActivePlanSubscriptionFunction: '<String>', getBillingCustomerFunction: '<String>', getBillingPriceFunction: '<String>', getBillingProductFunction: '<String>', getBillingProviderStateFunction: '<String>', getBillingSubscriptionByEntityFunction: '<String>', getBillingSubscriptionByExternalIdFunction: '<String>', getBillingSubscriptionFunction: '<String>', getFallbackFreePlanFunction: '<String>', getPlanPricingByExternalPriceFunction: '<String>', hasDueReconciliationsFunction: '<String>', listDueReconciliationsFunction: '<String>', listPendingUsageSyncFunction: '<String>', markUsageSyncedFunction: '<String>', prefix: '<String>', prepareScheduledChangeFunction: '<String>', pricesTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', processBillingEventFunction: '<String>', productsTableId: '<UUID>', provider: '<String>', recordBillingConnectionFunction: '<String>', recordBillingHealthFunction: '<String>', recordDisputeFunction: '<String>', recordRefundFunction: '<String>', reserveBillingOperationFunction: '<String>', schemaId: '<UUID>', subscriptionsTableId: '<UUID>', sweepOverdueSubscriptionsFunction: '<String>', upsertBillingCustomerFunction: '<String>', upsertBillingPriceFunction: '<String>', upsertBillingProductFunction: '<String>', upsertBillingSubscriptionFunction: '<String>', upsertInvoiceFunction: '<String>', usageSyncShardCount: '<Int>' },
  select: { id: true }
}).execute();
```
