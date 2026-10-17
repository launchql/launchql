# billingProviderModule

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for BillingProviderModule records via csdk CLI

## Usage

```bash
csdk billing-provider-module list
csdk billing-provider-module list --where.<field>.<op> <value> --orderBy <values>
csdk billing-provider-module list --limit 10 --after <cursor>
csdk billing-provider-module find-first --where.<field>.<op> <value>
csdk billing-provider-module get --id <UUID>
csdk billing-provider-module create --databaseId <UUID> [--activatePlanSubscriptionFunction <String>] [--apiName <String>] [--applyProviderObservationFunction <String>] [--billingConnectionTableId <UUID>] [--billingConnectionTableName <String>] [--billingCustomersTableId <UUID>] [--billingCustomersTableName <String>] [--billingDisputesTableId <UUID>] [--billingDisputesTableName <String>] [--billingHealthTableId <UUID>] [--billingHealthTableName <String>] [--billingInvoicesTableId <UUID>] [--billingInvoicesTableName <String>] [--billingOperationsTableId <UUID>] [--billingOperationsTableName <String>] [--billingPricesTableId <UUID>] [--billingPricesTableName <String>] [--billingProductsTableId <UUID>] [--billingProductsTableName <String>] [--billingProviderConnectedFunction <String>] [--billingProviderStateTableId <UUID>] [--billingProviderStateTableName <String>] [--billingRefundsTableId <UUID>] [--billingRefundsTableName <String>] [--billingSubscriptionsTableId <UUID>] [--billingSubscriptionsTableName <String>] [--billingWebhookEventsTableId <UUID>] [--billingWebhookEventsTableName <String>] [--bindCheckoutSessionFunction <String>] [--clearScheduledChangeFunction <String>] [--finishBillingOperationFunction <String>] [--getActivePlanPricingFunction <String>] [--getActivePlanSubscriptionFunction <String>] [--getBillingCustomerFunction <String>] [--getBillingPriceFunction <String>] [--getBillingProductFunction <String>] [--getBillingProviderStateFunction <String>] [--getBillingSubscriptionByEntityFunction <String>] [--getBillingSubscriptionByExternalIdFunction <String>] [--getBillingSubscriptionFunction <String>] [--getFallbackFreePlanFunction <String>] [--getPlanPricingByExternalPriceFunction <String>] [--hasDueReconciliationsFunction <String>] [--listDueReconciliationsFunction <String>] [--listPendingUsageSyncFunction <String>] [--markUsageSyncedFunction <String>] [--prefix <String>] [--prepareScheduledChangeFunction <String>] [--pricesTableId <UUID>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--processBillingEventFunction <String>] [--productsTableId <UUID>] [--provider <String>] [--recordBillingConnectionFunction <String>] [--recordBillingHealthFunction <String>] [--recordDisputeFunction <String>] [--recordRefundFunction <String>] [--reserveBillingOperationFunction <String>] [--schemaId <UUID>] [--subscriptionsTableId <UUID>] [--sweepOverdueSubscriptionsFunction <String>] [--upsertBillingCustomerFunction <String>] [--upsertBillingPriceFunction <String>] [--upsertBillingProductFunction <String>] [--upsertBillingSubscriptionFunction <String>] [--upsertInvoiceFunction <String>] [--usageSyncShardCount <Int>]
csdk billing-provider-module update --id <UUID> [--activatePlanSubscriptionFunction <String>] [--apiName <String>] [--applyProviderObservationFunction <String>] [--billingConnectionTableId <UUID>] [--billingConnectionTableName <String>] [--billingCustomersTableId <UUID>] [--billingCustomersTableName <String>] [--billingDisputesTableId <UUID>] [--billingDisputesTableName <String>] [--billingHealthTableId <UUID>] [--billingHealthTableName <String>] [--billingInvoicesTableId <UUID>] [--billingInvoicesTableName <String>] [--billingOperationsTableId <UUID>] [--billingOperationsTableName <String>] [--billingPricesTableId <UUID>] [--billingPricesTableName <String>] [--billingProductsTableId <UUID>] [--billingProductsTableName <String>] [--billingProviderConnectedFunction <String>] [--billingProviderStateTableId <UUID>] [--billingProviderStateTableName <String>] [--billingRefundsTableId <UUID>] [--billingRefundsTableName <String>] [--billingSubscriptionsTableId <UUID>] [--billingSubscriptionsTableName <String>] [--billingWebhookEventsTableId <UUID>] [--billingWebhookEventsTableName <String>] [--bindCheckoutSessionFunction <String>] [--clearScheduledChangeFunction <String>] [--databaseId <UUID>] [--finishBillingOperationFunction <String>] [--getActivePlanPricingFunction <String>] [--getActivePlanSubscriptionFunction <String>] [--getBillingCustomerFunction <String>] [--getBillingPriceFunction <String>] [--getBillingProductFunction <String>] [--getBillingProviderStateFunction <String>] [--getBillingSubscriptionByEntityFunction <String>] [--getBillingSubscriptionByExternalIdFunction <String>] [--getBillingSubscriptionFunction <String>] [--getFallbackFreePlanFunction <String>] [--getPlanPricingByExternalPriceFunction <String>] [--hasDueReconciliationsFunction <String>] [--listDueReconciliationsFunction <String>] [--listPendingUsageSyncFunction <String>] [--markUsageSyncedFunction <String>] [--prefix <String>] [--prepareScheduledChangeFunction <String>] [--pricesTableId <UUID>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--processBillingEventFunction <String>] [--productsTableId <UUID>] [--provider <String>] [--recordBillingConnectionFunction <String>] [--recordBillingHealthFunction <String>] [--recordDisputeFunction <String>] [--recordRefundFunction <String>] [--reserveBillingOperationFunction <String>] [--schemaId <UUID>] [--subscriptionsTableId <UUID>] [--sweepOverdueSubscriptionsFunction <String>] [--upsertBillingCustomerFunction <String>] [--upsertBillingPriceFunction <String>] [--upsertBillingProductFunction <String>] [--upsertBillingSubscriptionFunction <String>] [--upsertInvoiceFunction <String>] [--usageSyncShardCount <Int>]
csdk billing-provider-module delete --id <UUID>
```

## Examples

### List billingProviderModule records

```bash
csdk billing-provider-module list
```

### List billingProviderModule records with pagination

```bash
csdk billing-provider-module list --limit 10 --offset 0
```

### List billingProviderModule records with cursor pagination

```bash
csdk billing-provider-module list --limit 10 --after <cursor>
```

### Find first matching billingProviderModule

```bash
csdk billing-provider-module find-first --where.id.equalTo <value>
```

### List billingProviderModule records with field selection

```bash
csdk billing-provider-module list --select id,id
```

### List billingProviderModule records with filtering and ordering

```bash
csdk billing-provider-module list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a billingProviderModule

```bash
csdk billing-provider-module create --databaseId <UUID> [--activatePlanSubscriptionFunction <String>] [--apiName <String>] [--applyProviderObservationFunction <String>] [--billingConnectionTableId <UUID>] [--billingConnectionTableName <String>] [--billingCustomersTableId <UUID>] [--billingCustomersTableName <String>] [--billingDisputesTableId <UUID>] [--billingDisputesTableName <String>] [--billingHealthTableId <UUID>] [--billingHealthTableName <String>] [--billingInvoicesTableId <UUID>] [--billingInvoicesTableName <String>] [--billingOperationsTableId <UUID>] [--billingOperationsTableName <String>] [--billingPricesTableId <UUID>] [--billingPricesTableName <String>] [--billingProductsTableId <UUID>] [--billingProductsTableName <String>] [--billingProviderConnectedFunction <String>] [--billingProviderStateTableId <UUID>] [--billingProviderStateTableName <String>] [--billingRefundsTableId <UUID>] [--billingRefundsTableName <String>] [--billingSubscriptionsTableId <UUID>] [--billingSubscriptionsTableName <String>] [--billingWebhookEventsTableId <UUID>] [--billingWebhookEventsTableName <String>] [--bindCheckoutSessionFunction <String>] [--clearScheduledChangeFunction <String>] [--finishBillingOperationFunction <String>] [--getActivePlanPricingFunction <String>] [--getActivePlanSubscriptionFunction <String>] [--getBillingCustomerFunction <String>] [--getBillingPriceFunction <String>] [--getBillingProductFunction <String>] [--getBillingProviderStateFunction <String>] [--getBillingSubscriptionByEntityFunction <String>] [--getBillingSubscriptionByExternalIdFunction <String>] [--getBillingSubscriptionFunction <String>] [--getFallbackFreePlanFunction <String>] [--getPlanPricingByExternalPriceFunction <String>] [--hasDueReconciliationsFunction <String>] [--listDueReconciliationsFunction <String>] [--listPendingUsageSyncFunction <String>] [--markUsageSyncedFunction <String>] [--prefix <String>] [--prepareScheduledChangeFunction <String>] [--pricesTableId <UUID>] [--privateApiName <String>] [--privateSchemaId <UUID>] [--processBillingEventFunction <String>] [--productsTableId <UUID>] [--provider <String>] [--recordBillingConnectionFunction <String>] [--recordBillingHealthFunction <String>] [--recordDisputeFunction <String>] [--recordRefundFunction <String>] [--reserveBillingOperationFunction <String>] [--schemaId <UUID>] [--subscriptionsTableId <UUID>] [--sweepOverdueSubscriptionsFunction <String>] [--upsertBillingCustomerFunction <String>] [--upsertBillingPriceFunction <String>] [--upsertBillingProductFunction <String>] [--upsertBillingSubscriptionFunction <String>] [--upsertInvoiceFunction <String>] [--usageSyncShardCount <Int>]
```

### Get a billingProviderModule by id

```bash
csdk billing-provider-module get --id <value>
```
