# ORM Client

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { createClient } from './orm';

const db = createClient({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});
```

## Models

| Model | Operations |
|-------|------------|
| `agentModule` | findMany, findOne, create, update, delete |
| `apiSurfaceModule` | findMany, findOne, create, update, delete |
| `appModule` | findMany, findOne, create, update, delete |
| `billingModule` | findMany, findOne, create, update, delete |
| `billingProviderModule` | findMany, findOne, create, update, delete |
| `blueprint` | findMany, findOne, create, update, delete |
| `blueprintConstruction` | findMany, findOne, create, update, delete |
| `blueprintTemplate` | findMany, findOne, create, update, delete |
| `capabilitiesModule` | findMany, findOne, create, update, delete |
| `catalogModule` | findMany, findOne, create, update, delete |
| `clusterModule` | findMany, findOne, create, update, delete |
| `computeLogModule` | findMany, findOne, create, update, delete |
| `connectedAccountsModule` | findMany, findOne, create, update, delete |
| `contentPresetModule` | findMany, findOne, create, update, delete |
| `cryptoAddressesModule` | findMany, findOne, create, update, delete |
| `cryptoAuthModule` | findMany, findOne, create, update, delete |
| `dataCapabilitiesField` | findMany, findOne, create, update, delete |
| `databaseProvisionModule` | findMany, findOne, create, update, delete |
| `databaseSettingsModule` | findMany, findOne, create, update, delete |
| `dbPoolConfig` | findMany, findOne, create, update, delete |
| `dbPool` | findMany, findOne, create, update, delete |
| `dbPresetModule` | findMany, findOne, create, update, delete |
| `dbUsageModule` | findMany, findOne, create, update, delete |
| `defaultIdsModule` | findMany, findOne, create, update, delete |
| `denormalizedTableField` | findMany, findOne, create, update, delete |
| `devicesModule` | findMany, findOne, create, update, delete |
| `domainModule` | findMany, findOne, create, update, delete |
| `emailSenderModule` | findMany, findOne, create, update, delete |
| `emailsModule` | findMany, findOne, create, update, delete |
| `entityTypeProvision` | findMany, findOne, create, update, delete |
| `eventsModule` | findMany, findOne, create, update, delete |
| `fileRefField` | findMany, findOne, create, update, delete |
| `functionDeploymentModule` | findMany, findOne, create, update, delete |
| `functionInvocationModule` | findMany, findOne, create, update, delete |
| `functionModule` | findMany, findOne, create, update, delete |
| `graphExecutionModule` | findMany, findOne, create, update, delete |
| `graphModule` | findMany, findOne, create, update, delete |
| `hierarchyModule` | findMany, findOne, create, update, delete |
| `i18NModule` | findMany, findOne, create, update, delete |
| `identityProvidersModule` | findMany, findOne, create, update, delete |
| `imageModule` | findMany, findOne, create, update, delete |
| `inferenceLogModule` | findMany, findOne, create, update, delete |
| `infraConfigModule` | findMany, findOne, create, update, delete |
| `infraSecretsModule` | findMany, findOne, create, update, delete |
| `integrationProvidersModule` | findMany, findOne, create, update, delete |
| `internalConfigModule` | findMany, findOne, create, update, delete |
| `internalSecretsModule` | findMany, findOne, create, update, delete |
| `invitesModule` | findMany, findOne, create, update, delete |
| `k8sAdmissionModule` | findMany, findOne, create, update, delete |
| `limitsModule` | findMany, findOne, create, update, delete |
| `machineModule` | findMany, findOne, create, update, delete |
| `membershipTypesModule` | findMany, findOne, create, update, delete |
| `membershipsModule` | findMany, findOne, create, update, delete |
| `merkleStoreModule` | findMany, findOne, create, update, delete |
| `namespaceModule` | findMany, findOne, create, update, delete |
| `notificationsModule` | findMany, findOne, create, update, delete |
| `oauthRequestsModule` | findMany, findOne, create, update, delete |
| `pagesModule` | findMany, findOne, create, update, delete |
| `phoneNumbersModule` | findMany, findOne, create, update, delete |
| `plansModule` | findMany, findOne, create, update, delete |
| `principalAuthModule` | findMany, findOne, create, update, delete |
| `profilesModule` | findMany, findOne, create, update, delete |
| `rateLimitMetersModule` | findMany, findOne, create, update, delete |
| `rateLimitsModule` | findMany, findOne, create, update, delete |
| `realtimeModule` | findMany, findOne, create, update, delete |
| `refusalLogModule` | findMany, findOne, create, update, delete |
| `relationProvision` | findMany, findOne, create, update, delete |
| `repositoryModule` | findMany, findOne, create, update, delete |
| `resourceModule` | findMany, findOne, create, update, delete |
| `rlsModule` | findMany, findOne, create, update, delete |
| `routeModule` | findMany, findOne, create, update, delete |
| `scopeTypesModule` | findMany, findOne, create, update, delete |
| `secureTableProvision` | findMany, findOne, create, update, delete |
| `sessionSecretsModule` | findMany, findOne, create, update, delete |
| `sessionsModule` | findMany, findOne, create, update, delete |
| `siteSurfaceModule` | findMany, findOne, create, update, delete |
| `storageLogModule` | findMany, findOne, create, update, delete |
| `storageModule` | findMany, findOne, create, update, delete |
| `transferLogModule` | findMany, findOne, create, update, delete |
| `userAuthModule` | findMany, findOne, create, update, delete |
| `userCredentialsModule` | findMany, findOne, create, update, delete |
| `userSettingsModule` | findMany, findOne, create, update, delete |
| `userSettingsSecurityModule` | findMany, findOne, create, update, delete |
| `userStateModule` | findMany, findOne, create, update, delete |
| `usersModule` | findMany, findOne, create, update, delete |
| `webauthnAuthModule` | findMany, findOne, create, update, delete |
| `webauthnCredentialsModule` | findMany, findOne, create, update, delete |
| `webhookModule` | findMany, findOne, create, update, delete |

## Table Operations

### `db.agentModule`

CRUD operations for AgentModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `agentTableId` | UUID | Yes |
| `agentTableName` | String | Yes |
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `defaultVisibility` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `eventTableId` | UUID | Yes |
| `eventTableName` | String | Yes |
| `hasAgents` | Boolean | Yes |
| `hasAttachments` | Boolean | Yes |
| `hasPlans` | Boolean | Yes |
| `hasRepositoryResources` | Boolean | Yes |
| `hasResources` | Boolean | Yes |
| `hasRuns` | Boolean | Yes |
| `id` | UUID | No |
| `messageTableId` | UUID | Yes |
| `messageTableName` | String | Yes |
| `personaTableId` | UUID | Yes |
| `personaTableName` | String | Yes |
| `planTableId` | UUID | Yes |
| `planTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `promptsTableId` | UUID | Yes |
| `promptsTableName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `resourceRepositoryTableId` | UUID | Yes |
| `resourceRepositoryTableName` | String | Yes |
| `resourceTableId` | UUID | Yes |
| `resourceTableName` | String | Yes |
| `resources` | JSON | Yes |
| `runTableId` | UUID | Yes |
| `runTableName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `settleRunCostFunctionName` | String | Yes |
| `taskTableId` | UUID | Yes |
| `taskTableName` | String | Yes |
| `threadTableId` | UUID | Yes |
| `threadTableName` | String | Yes |
| `workspaceTableId` | UUID | Yes |
| `workspaceTableName` | String | Yes |

**Operations:**

```typescript
// List all agentModule records
const items = await db.agentModule.findMany({ select: { agentTableId: true, agentTableName: true, apiName: true, databaseId: true, defaultCapabilities: true, defaultVisibility: true, entityField: true, entityTableId: true, eventTableId: true, eventTableName: true, hasAgents: true, hasAttachments: true, hasPlans: true, hasRepositoryResources: true, hasResources: true, hasRuns: true, id: true, messageTableId: true, messageTableName: true, personaTableId: true, personaTableName: true, planTableId: true, planTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, promptsTableId: true, promptsTableName: true, provisions: true, publicSchemaName: true, resourceRepositoryTableId: true, resourceRepositoryTableName: true, resourceTableId: true, resourceTableName: true, resources: true, runTableId: true, runTableName: true, schemaId: true, scope: true, settleRunCostFunctionName: true, taskTableId: true, taskTableName: true, threadTableId: true, threadTableName: true, workspaceTableId: true, workspaceTableName: true } }).execute();

// Get one by id
const item = await db.agentModule.findOne({ id: '<UUID>', select: { agentTableId: true, agentTableName: true, apiName: true, databaseId: true, defaultCapabilities: true, defaultVisibility: true, entityField: true, entityTableId: true, eventTableId: true, eventTableName: true, hasAgents: true, hasAttachments: true, hasPlans: true, hasRepositoryResources: true, hasResources: true, hasRuns: true, id: true, messageTableId: true, messageTableName: true, personaTableId: true, personaTableName: true, planTableId: true, planTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, promptsTableId: true, promptsTableName: true, provisions: true, publicSchemaName: true, resourceRepositoryTableId: true, resourceRepositoryTableName: true, resourceTableId: true, resourceTableName: true, resources: true, runTableId: true, runTableName: true, schemaId: true, scope: true, settleRunCostFunctionName: true, taskTableId: true, taskTableName: true, threadTableId: true, threadTableName: true, workspaceTableId: true, workspaceTableName: true } }).execute();

// Create
const created = await db.agentModule.create({ data: { agentTableId: '<UUID>', agentTableName: '<String>', apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', defaultVisibility: '<String>', entityField: '<String>', entityTableId: '<UUID>', eventTableId: '<UUID>', eventTableName: '<String>', hasAgents: '<Boolean>', hasAttachments: '<Boolean>', hasPlans: '<Boolean>', hasRepositoryResources: '<Boolean>', hasResources: '<Boolean>', hasRuns: '<Boolean>', messageTableId: '<UUID>', messageTableName: '<String>', personaTableId: '<UUID>', personaTableName: '<String>', planTableId: '<UUID>', planTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', promptsTableId: '<UUID>', promptsTableName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', resourceRepositoryTableId: '<UUID>', resourceRepositoryTableName: '<String>', resourceTableId: '<UUID>', resourceTableName: '<String>', resources: '<JSON>', runTableId: '<UUID>', runTableName: '<String>', schemaId: '<UUID>', scope: '<String>', settleRunCostFunctionName: '<String>', taskTableId: '<UUID>', taskTableName: '<String>', threadTableId: '<UUID>', threadTableName: '<String>', workspaceTableId: '<UUID>', workspaceTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.agentModule.update({ where: { id: '<UUID>' }, data: { agentTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.agentModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.apiSurfaceModule`

CRUD operations for ApiSurfaceModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `apiSchemasTableId` | UUID | Yes |
| `apiSchemasTableName` | String | Yes |
| `apiSettingsTableId` | UUID | Yes |
| `apiSettingsTableName` | String | Yes |
| `apisTableId` | UUID | Yes |
| `apisTableName` | String | Yes |
| `catalogModuleId` | UUID | Yes |
| `corsSettingsTableId` | UUID | Yes |
| `corsSettingsTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all apiSurfaceModule records
const items = await db.apiSurfaceModule.findMany({ select: { apiName: true, apiSchemasTableId: true, apiSchemasTableName: true, apiSettingsTableId: true, apiSettingsTableName: true, apisTableId: true, apisTableName: true, catalogModuleId: true, corsSettingsTableId: true, corsSettingsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.apiSurfaceModule.findOne({ id: '<UUID>', select: { apiName: true, apiSchemasTableId: true, apiSchemasTableName: true, apiSettingsTableId: true, apiSettingsTableName: true, apisTableId: true, apisTableName: true, catalogModuleId: true, corsSettingsTableId: true, corsSettingsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.apiSurfaceModule.create({ data: { apiName: '<String>', apiSchemasTableId: '<UUID>', apiSchemasTableName: '<String>', apiSettingsTableId: '<UUID>', apiSettingsTableName: '<String>', apisTableId: '<UUID>', apisTableName: '<String>', catalogModuleId: '<UUID>', corsSettingsTableId: '<UUID>', corsSettingsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.apiSurfaceModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.apiSurfaceModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appModule`

CRUD operations for AppModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `appComponentsTableId` | UUID | Yes |
| `appComponentsTableName` | String | Yes |
| `appStoreIdentitiesTableName` | String | Yes |
| `appsTableId` | UUID | Yes |
| `appsTableName` | String | Yes |
| `catalogModuleId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all appModule records
const items = await db.appModule.findMany({ select: { apiName: true, appComponentsTableId: true, appComponentsTableName: true, appStoreIdentitiesTableName: true, appsTableId: true, appsTableName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.appModule.findOne({ id: '<UUID>', select: { apiName: true, appComponentsTableId: true, appComponentsTableName: true, appStoreIdentitiesTableName: true, appsTableId: true, appsTableName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.appModule.create({ data: { apiName: '<String>', appComponentsTableId: '<UUID>', appComponentsTableName: '<String>', appStoreIdentitiesTableName: '<String>', appsTableId: '<UUID>', appsTableName: '<String>', catalogModuleId: '<UUID>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.appModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.billingModule`

CRUD operations for BillingModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `balancesTableId` | UUID | Yes |
| `balancesTableName` | String | Yes |
| `creditPacksTableId` | UUID | Yes |
| `creditPacksTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `defaultMeterCatalog` | JSON | Yes |
| `grantMeterCreditsFunction` | String | Yes |
| `id` | UUID | No |
| `ledgerTableId` | UUID | Yes |
| `ledgerTableName` | String | Yes |
| `meterCreditsTableId` | UUID | Yes |
| `meterCreditsTableName` | String | Yes |
| `meterDefaultsTableId` | UUID | Yes |
| `meterDefaultsTableName` | String | Yes |
| `meterSourcesTableId` | UUID | Yes |
| `meterSourcesTableName` | String | Yes |
| `metersTableId` | UUID | Yes |
| `metersTableName` | String | Yes |
| `planSubscriptionsTableId` | UUID | Yes |
| `planSubscriptionsTableName` | String | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `recordUsageFunction` | String | Yes |
| `rollupUsageSummaryFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `sweepExpiredSubscriptionsFunction` | String | Yes |

**Operations:**

```typescript
// List all billingModule records
const items = await db.billingModule.findMany({ select: { apiName: true, balancesTableId: true, balancesTableName: true, creditPacksTableId: true, creditPacksTableName: true, databaseId: true, defaultCapabilities: true, defaultMeterCatalog: true, grantMeterCreditsFunction: true, id: true, ledgerTableId: true, ledgerTableName: true, meterCreditsTableId: true, meterCreditsTableName: true, meterDefaultsTableId: true, meterDefaultsTableName: true, meterSourcesTableId: true, meterSourcesTableName: true, metersTableId: true, metersTableName: true, planSubscriptionsTableId: true, planSubscriptionsTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, recordUsageFunction: true, rollupUsageSummaryFunction: true, schemaId: true, sweepExpiredSubscriptionsFunction: true } }).execute();

// Get one by id
const item = await db.billingModule.findOne({ id: '<UUID>', select: { apiName: true, balancesTableId: true, balancesTableName: true, creditPacksTableId: true, creditPacksTableName: true, databaseId: true, defaultCapabilities: true, defaultMeterCatalog: true, grantMeterCreditsFunction: true, id: true, ledgerTableId: true, ledgerTableName: true, meterCreditsTableId: true, meterCreditsTableName: true, meterDefaultsTableId: true, meterDefaultsTableName: true, meterSourcesTableId: true, meterSourcesTableName: true, metersTableId: true, metersTableName: true, planSubscriptionsTableId: true, planSubscriptionsTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, recordUsageFunction: true, rollupUsageSummaryFunction: true, schemaId: true, sweepExpiredSubscriptionsFunction: true } }).execute();

// Create
const created = await db.billingModule.create({ data: { apiName: '<String>', balancesTableId: '<UUID>', balancesTableName: '<String>', creditPacksTableId: '<UUID>', creditPacksTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', defaultMeterCatalog: '<JSON>', grantMeterCreditsFunction: '<String>', ledgerTableId: '<UUID>', ledgerTableName: '<String>', meterCreditsTableId: '<UUID>', meterCreditsTableName: '<String>', meterDefaultsTableId: '<UUID>', meterDefaultsTableName: '<String>', meterSourcesTableId: '<UUID>', meterSourcesTableName: '<String>', metersTableId: '<UUID>', metersTableName: '<String>', planSubscriptionsTableId: '<UUID>', planSubscriptionsTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', recordUsageFunction: '<String>', rollupUsageSummaryFunction: '<String>', schemaId: '<UUID>', sweepExpiredSubscriptionsFunction: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.billingModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.billingModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.billingProviderModule`

CRUD operations for BillingProviderModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `activatePlanSubscriptionFunction` | String | Yes |
| `apiName` | String | Yes |
| `applyProviderObservationFunction` | String | Yes |
| `billingConnectionTableId` | UUID | Yes |
| `billingConnectionTableName` | String | Yes |
| `billingCustomersTableId` | UUID | Yes |
| `billingCustomersTableName` | String | Yes |
| `billingDisputesTableId` | UUID | Yes |
| `billingDisputesTableName` | String | Yes |
| `billingHealthTableId` | UUID | Yes |
| `billingHealthTableName` | String | Yes |
| `billingInvoicesTableId` | UUID | Yes |
| `billingInvoicesTableName` | String | Yes |
| `billingOperationsTableId` | UUID | Yes |
| `billingOperationsTableName` | String | Yes |
| `billingPricesTableId` | UUID | Yes |
| `billingPricesTableName` | String | Yes |
| `billingProductsTableId` | UUID | Yes |
| `billingProductsTableName` | String | Yes |
| `billingProviderConnectedFunction` | String | Yes |
| `billingProviderStateTableId` | UUID | Yes |
| `billingProviderStateTableName` | String | Yes |
| `billingRefundsTableId` | UUID | Yes |
| `billingRefundsTableName` | String | Yes |
| `billingSubscriptionsTableId` | UUID | Yes |
| `billingSubscriptionsTableName` | String | Yes |
| `billingWebhookEventsTableId` | UUID | Yes |
| `billingWebhookEventsTableName` | String | Yes |
| `bindCheckoutSessionFunction` | String | Yes |
| `clearScheduledChangeFunction` | String | Yes |
| `databaseId` | UUID | Yes |
| `finishBillingOperationFunction` | String | Yes |
| `getActivePlanPricingFunction` | String | Yes |
| `getActivePlanSubscriptionFunction` | String | Yes |
| `getBillingCustomerFunction` | String | Yes |
| `getBillingPriceFunction` | String | Yes |
| `getBillingProductFunction` | String | Yes |
| `getBillingProviderStateFunction` | String | Yes |
| `getBillingSubscriptionByEntityFunction` | String | Yes |
| `getBillingSubscriptionByExternalIdFunction` | String | Yes |
| `getBillingSubscriptionFunction` | String | Yes |
| `getFallbackFreePlanFunction` | String | Yes |
| `getPlanPricingByExternalPriceFunction` | String | Yes |
| `hasDueReconciliationsFunction` | String | Yes |
| `id` | UUID | No |
| `listDueReconciliationsFunction` | String | Yes |
| `listPendingUsageSyncFunction` | String | Yes |
| `markUsageSyncedFunction` | String | Yes |
| `prefix` | String | Yes |
| `prepareScheduledChangeFunction` | String | Yes |
| `pricesTableId` | UUID | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `processBillingEventFunction` | String | Yes |
| `productsTableId` | UUID | Yes |
| `provider` | String | Yes |
| `recordBillingConnectionFunction` | String | Yes |
| `recordBillingHealthFunction` | String | Yes |
| `recordDisputeFunction` | String | Yes |
| `recordRefundFunction` | String | Yes |
| `reserveBillingOperationFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `subscriptionsTableId` | UUID | Yes |
| `sweepOverdueSubscriptionsFunction` | String | Yes |
| `upsertBillingCustomerFunction` | String | Yes |
| `upsertBillingPriceFunction` | String | Yes |
| `upsertBillingProductFunction` | String | Yes |
| `upsertBillingSubscriptionFunction` | String | Yes |
| `upsertInvoiceFunction` | String | Yes |
| `usageSyncShardCount` | Int | Yes |

**Operations:**

```typescript
// List all billingProviderModule records
const items = await db.billingProviderModule.findMany({ select: { activatePlanSubscriptionFunction: true, apiName: true, applyProviderObservationFunction: true, billingConnectionTableId: true, billingConnectionTableName: true, billingCustomersTableId: true, billingCustomersTableName: true, billingDisputesTableId: true, billingDisputesTableName: true, billingHealthTableId: true, billingHealthTableName: true, billingInvoicesTableId: true, billingInvoicesTableName: true, billingOperationsTableId: true, billingOperationsTableName: true, billingPricesTableId: true, billingPricesTableName: true, billingProductsTableId: true, billingProductsTableName: true, billingProviderConnectedFunction: true, billingProviderStateTableId: true, billingProviderStateTableName: true, billingRefundsTableId: true, billingRefundsTableName: true, billingSubscriptionsTableId: true, billingSubscriptionsTableName: true, billingWebhookEventsTableId: true, billingWebhookEventsTableName: true, bindCheckoutSessionFunction: true, clearScheduledChangeFunction: true, databaseId: true, finishBillingOperationFunction: true, getActivePlanPricingFunction: true, getActivePlanSubscriptionFunction: true, getBillingCustomerFunction: true, getBillingPriceFunction: true, getBillingProductFunction: true, getBillingProviderStateFunction: true, getBillingSubscriptionByEntityFunction: true, getBillingSubscriptionByExternalIdFunction: true, getBillingSubscriptionFunction: true, getFallbackFreePlanFunction: true, getPlanPricingByExternalPriceFunction: true, hasDueReconciliationsFunction: true, id: true, listDueReconciliationsFunction: true, listPendingUsageSyncFunction: true, markUsageSyncedFunction: true, prefix: true, prepareScheduledChangeFunction: true, pricesTableId: true, privateApiName: true, privateSchemaId: true, processBillingEventFunction: true, productsTableId: true, provider: true, recordBillingConnectionFunction: true, recordBillingHealthFunction: true, recordDisputeFunction: true, recordRefundFunction: true, reserveBillingOperationFunction: true, schemaId: true, subscriptionsTableId: true, sweepOverdueSubscriptionsFunction: true, upsertBillingCustomerFunction: true, upsertBillingPriceFunction: true, upsertBillingProductFunction: true, upsertBillingSubscriptionFunction: true, upsertInvoiceFunction: true, usageSyncShardCount: true } }).execute();

// Get one by id
const item = await db.billingProviderModule.findOne({ id: '<UUID>', select: { activatePlanSubscriptionFunction: true, apiName: true, applyProviderObservationFunction: true, billingConnectionTableId: true, billingConnectionTableName: true, billingCustomersTableId: true, billingCustomersTableName: true, billingDisputesTableId: true, billingDisputesTableName: true, billingHealthTableId: true, billingHealthTableName: true, billingInvoicesTableId: true, billingInvoicesTableName: true, billingOperationsTableId: true, billingOperationsTableName: true, billingPricesTableId: true, billingPricesTableName: true, billingProductsTableId: true, billingProductsTableName: true, billingProviderConnectedFunction: true, billingProviderStateTableId: true, billingProviderStateTableName: true, billingRefundsTableId: true, billingRefundsTableName: true, billingSubscriptionsTableId: true, billingSubscriptionsTableName: true, billingWebhookEventsTableId: true, billingWebhookEventsTableName: true, bindCheckoutSessionFunction: true, clearScheduledChangeFunction: true, databaseId: true, finishBillingOperationFunction: true, getActivePlanPricingFunction: true, getActivePlanSubscriptionFunction: true, getBillingCustomerFunction: true, getBillingPriceFunction: true, getBillingProductFunction: true, getBillingProviderStateFunction: true, getBillingSubscriptionByEntityFunction: true, getBillingSubscriptionByExternalIdFunction: true, getBillingSubscriptionFunction: true, getFallbackFreePlanFunction: true, getPlanPricingByExternalPriceFunction: true, hasDueReconciliationsFunction: true, id: true, listDueReconciliationsFunction: true, listPendingUsageSyncFunction: true, markUsageSyncedFunction: true, prefix: true, prepareScheduledChangeFunction: true, pricesTableId: true, privateApiName: true, privateSchemaId: true, processBillingEventFunction: true, productsTableId: true, provider: true, recordBillingConnectionFunction: true, recordBillingHealthFunction: true, recordDisputeFunction: true, recordRefundFunction: true, reserveBillingOperationFunction: true, schemaId: true, subscriptionsTableId: true, sweepOverdueSubscriptionsFunction: true, upsertBillingCustomerFunction: true, upsertBillingPriceFunction: true, upsertBillingProductFunction: true, upsertBillingSubscriptionFunction: true, upsertInvoiceFunction: true, usageSyncShardCount: true } }).execute();

// Create
const created = await db.billingProviderModule.create({ data: { activatePlanSubscriptionFunction: '<String>', apiName: '<String>', applyProviderObservationFunction: '<String>', billingConnectionTableId: '<UUID>', billingConnectionTableName: '<String>', billingCustomersTableId: '<UUID>', billingCustomersTableName: '<String>', billingDisputesTableId: '<UUID>', billingDisputesTableName: '<String>', billingHealthTableId: '<UUID>', billingHealthTableName: '<String>', billingInvoicesTableId: '<UUID>', billingInvoicesTableName: '<String>', billingOperationsTableId: '<UUID>', billingOperationsTableName: '<String>', billingPricesTableId: '<UUID>', billingPricesTableName: '<String>', billingProductsTableId: '<UUID>', billingProductsTableName: '<String>', billingProviderConnectedFunction: '<String>', billingProviderStateTableId: '<UUID>', billingProviderStateTableName: '<String>', billingRefundsTableId: '<UUID>', billingRefundsTableName: '<String>', billingSubscriptionsTableId: '<UUID>', billingSubscriptionsTableName: '<String>', billingWebhookEventsTableId: '<UUID>', billingWebhookEventsTableName: '<String>', bindCheckoutSessionFunction: '<String>', clearScheduledChangeFunction: '<String>', databaseId: '<UUID>', finishBillingOperationFunction: '<String>', getActivePlanPricingFunction: '<String>', getActivePlanSubscriptionFunction: '<String>', getBillingCustomerFunction: '<String>', getBillingPriceFunction: '<String>', getBillingProductFunction: '<String>', getBillingProviderStateFunction: '<String>', getBillingSubscriptionByEntityFunction: '<String>', getBillingSubscriptionByExternalIdFunction: '<String>', getBillingSubscriptionFunction: '<String>', getFallbackFreePlanFunction: '<String>', getPlanPricingByExternalPriceFunction: '<String>', hasDueReconciliationsFunction: '<String>', listDueReconciliationsFunction: '<String>', listPendingUsageSyncFunction: '<String>', markUsageSyncedFunction: '<String>', prefix: '<String>', prepareScheduledChangeFunction: '<String>', pricesTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', processBillingEventFunction: '<String>', productsTableId: '<UUID>', provider: '<String>', recordBillingConnectionFunction: '<String>', recordBillingHealthFunction: '<String>', recordDisputeFunction: '<String>', recordRefundFunction: '<String>', reserveBillingOperationFunction: '<String>', schemaId: '<UUID>', subscriptionsTableId: '<UUID>', sweepOverdueSubscriptionsFunction: '<String>', upsertBillingCustomerFunction: '<String>', upsertBillingPriceFunction: '<String>', upsertBillingProductFunction: '<String>', upsertBillingSubscriptionFunction: '<String>', upsertInvoiceFunction: '<String>', usageSyncShardCount: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.billingProviderModule.update({ where: { id: '<UUID>' }, data: { activatePlanSubscriptionFunction: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.billingProviderModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.blueprint`

CRUD operations for Blueprint records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `definition` | JSON | Yes |
| `definitionHash` | UUID | Yes |
| `description` | String | Yes |
| `displayName` | String | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `tableHashes` | JSON | Yes |
| `templateId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all blueprint records
const items = await db.blueprint.findMany({ select: { createdAt: true, databaseId: true, definition: true, definitionHash: true, description: true, displayName: true, id: true, name: true, ownerId: true, tableHashes: true, templateId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.blueprint.findOne({ id: '<UUID>', select: { createdAt: true, databaseId: true, definition: true, definitionHash: true, description: true, displayName: true, id: true, name: true, ownerId: true, tableHashes: true, templateId: true, updatedAt: true } }).execute();

// Create
const created = await db.blueprint.create({ data: { databaseId: '<UUID>', definition: '<JSON>', definitionHash: '<UUID>', description: '<String>', displayName: '<String>', name: '<String>', ownerId: '<UUID>', tableHashes: '<JSON>', templateId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.blueprint.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.blueprint.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.blueprintConstruction`

CRUD operations for BlueprintConstruction records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `blueprintId` | UUID | Yes |
| `constructedAt` | Datetime | Yes |
| `constructedDefinition` | JSON | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `errorDetails` | String | Yes |
| `id` | UUID | No |
| `schemaId` | UUID | Yes |
| `status` | String | Yes |
| `tableMap` | JSON | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all blueprintConstruction records
const items = await db.blueprintConstruction.findMany({ select: { blueprintId: true, constructedAt: true, constructedDefinition: true, createdAt: true, databaseId: true, errorDetails: true, id: true, schemaId: true, status: true, tableMap: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.blueprintConstruction.findOne({ id: '<UUID>', select: { blueprintId: true, constructedAt: true, constructedDefinition: true, createdAt: true, databaseId: true, errorDetails: true, id: true, schemaId: true, status: true, tableMap: true, updatedAt: true } }).execute();

// Create
const created = await db.blueprintConstruction.create({ data: { blueprintId: '<UUID>', constructedAt: '<Datetime>', constructedDefinition: '<JSON>', databaseId: '<UUID>', errorDetails: '<String>', schemaId: '<UUID>', status: '<String>', tableMap: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.blueprintConstruction.update({ where: { id: '<UUID>' }, data: { blueprintId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.blueprintConstruction.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.blueprintTemplate`

CRUD operations for BlueprintTemplate records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `categories` | String | Yes |
| `complexity` | String | Yes |
| `copyCount` | Int | Yes |
| `createdAt` | Datetime | No |
| `definition` | JSON | Yes |
| `definitionHash` | UUID | Yes |
| `definitionSchemaVersion` | String | Yes |
| `description` | String | Yes |
| `displayName` | String | Yes |
| `forkCount` | Int | Yes |
| `forkedFromId` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `source` | String | Yes |
| `tableHashes` | JSON | Yes |
| `tags` | String | Yes |
| `updatedAt` | Datetime | No |
| `version` | String | Yes |
| `visibility` | String | Yes |

**Operations:**

```typescript
// List all blueprintTemplate records
const items = await db.blueprintTemplate.findMany({ select: { categories: true, complexity: true, copyCount: true, createdAt: true, definition: true, definitionHash: true, definitionSchemaVersion: true, description: true, displayName: true, forkCount: true, forkedFromId: true, id: true, name: true, ownerId: true, source: true, tableHashes: true, tags: true, updatedAt: true, version: true, visibility: true } }).execute();

// Get one by id
const item = await db.blueprintTemplate.findOne({ id: '<UUID>', select: { categories: true, complexity: true, copyCount: true, createdAt: true, definition: true, definitionHash: true, definitionSchemaVersion: true, description: true, displayName: true, forkCount: true, forkedFromId: true, id: true, name: true, ownerId: true, source: true, tableHashes: true, tags: true, updatedAt: true, version: true, visibility: true } }).execute();

// Create
const created = await db.blueprintTemplate.create({ data: { categories: '<String>', complexity: '<String>', copyCount: '<Int>', definition: '<JSON>', definitionHash: '<UUID>', definitionSchemaVersion: '<String>', description: '<String>', displayName: '<String>', forkCount: '<Int>', forkedFromId: '<UUID>', name: '<String>', ownerId: '<UUID>', source: '<String>', tableHashes: '<JSON>', tags: '<String>', version: '<String>', visibility: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.blueprintTemplate.update({ where: { id: '<UUID>' }, data: { categories: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.blueprintTemplate.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.capabilitiesModule`

CRUD operations for CapabilitiesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorTableId` | UUID | Yes |
| `apiName` | String | Yes |
| `bitlen` | Int | Yes |
| `databaseId` | UUID | Yes |
| `defaultTableId` | UUID | Yes |
| `defaultTableName` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `getByMask` | String | Yes |
| `getMask` | String | Yes |
| `getMaskByName` | String | Yes |
| `getPaddedMask` | String | Yes |
| `id` | UUID | No |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all capabilitiesModule records
const items = await db.capabilitiesModule.findMany({ select: { actorTableId: true, apiName: true, bitlen: true, databaseId: true, defaultTableId: true, defaultTableName: true, entityField: true, entityTableId: true, getByMask: true, getMask: true, getMaskByName: true, getPaddedMask: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.capabilitiesModule.findOne({ id: '<UUID>', select: { actorTableId: true, apiName: true, bitlen: true, databaseId: true, defaultTableId: true, defaultTableName: true, entityField: true, entityTableId: true, getByMask: true, getMask: true, getMaskByName: true, getPaddedMask: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.capabilitiesModule.create({ data: { actorTableId: '<UUID>', apiName: '<String>', bitlen: '<Int>', databaseId: '<UUID>', defaultTableId: '<UUID>', defaultTableName: '<String>', entityField: '<String>', entityTableId: '<UUID>', getByMask: '<String>', getMask: '<String>', getMaskByName: '<String>', getPaddedMask: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.capabilitiesModule.update({ where: { id: '<UUID>' }, data: { actorTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.capabilitiesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.catalogModule`

CRUD operations for CatalogModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `apisTableId` | UUID | Yes |
| `apisTableName` | String | Yes |
| `appStoreIdentitiesTableId` | UUID | Yes |
| `appStoreIdentitiesTableName` | String | Yes |
| `appsTableId` | UUID | Yes |
| `appsTableName` | String | Yes |
| `bindingsTableId` | UUID | Yes |
| `bindingsTableName` | String | Yes |
| `bucketsTableId` | UUID | Yes |
| `bucketsTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `domainsTableId` | UUID | Yes |
| `domainsTableName` | String | Yes |
| `entityTableId` | UUID | Yes |
| `functionsTableId` | UUID | Yes |
| `functionsTableName` | String | Yes |
| `id` | UUID | No |
| `imagesTableId` | UUID | Yes |
| `imagesTableName` | String | Yes |
| `managedDomainsTableId` | UUID | Yes |
| `managedDomainsTableName` | String | Yes |
| `namespacesTableId` | UUID | Yes |
| `namespacesTableName` | String | Yes |
| `policies` | JSON | Yes |
| `privateApiName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `redirectsTableId` | UUID | Yes |
| `redirectsTableName` | String | Yes |
| `resourceDefinitionsTableId` | UUID | Yes |
| `resourceDefinitionsTableName` | String | Yes |
| `resourceInstallationsTableId` | UUID | Yes |
| `resourceInstallationsTableName` | String | Yes |
| `resourcesTableId` | UUID | Yes |
| `resourcesTableName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `sitesAppLinksTableId` | UUID | Yes |
| `sitesAppLinksTableName` | String | Yes |
| `sitesDeepLinksTableId` | UUID | Yes |
| `sitesDeepLinksTableName` | String | Yes |
| `sitesErrorPagesTableId` | UUID | Yes |
| `sitesErrorPagesTableName` | String | Yes |
| `sitesTableId` | UUID | Yes |
| `sitesTableName` | String | Yes |
| `sitesWebConfigTableId` | UUID | Yes |
| `sitesWebConfigTableName` | String | Yes |

**Operations:**

```typescript
// List all catalogModule records
const items = await db.catalogModule.findMany({ select: { apiName: true, apisTableId: true, apisTableName: true, appStoreIdentitiesTableId: true, appStoreIdentitiesTableName: true, appsTableId: true, appsTableName: true, bindingsTableId: true, bindingsTableName: true, bucketsTableId: true, bucketsTableName: true, databaseId: true, defaultCapabilities: true, domainsTableId: true, domainsTableName: true, entityTableId: true, functionsTableId: true, functionsTableName: true, id: true, imagesTableId: true, imagesTableName: true, managedDomainsTableId: true, managedDomainsTableName: true, namespacesTableId: true, namespacesTableName: true, policies: true, privateApiName: true, provisions: true, publicSchemaName: true, redirectsTableId: true, redirectsTableName: true, resourceDefinitionsTableId: true, resourceDefinitionsTableName: true, resourceInstallationsTableId: true, resourceInstallationsTableName: true, resourcesTableId: true, resourcesTableName: true, schemaId: true, scope: true, sitesAppLinksTableId: true, sitesAppLinksTableName: true, sitesDeepLinksTableId: true, sitesDeepLinksTableName: true, sitesErrorPagesTableId: true, sitesErrorPagesTableName: true, sitesTableId: true, sitesTableName: true, sitesWebConfigTableId: true, sitesWebConfigTableName: true } }).execute();

// Get one by id
const item = await db.catalogModule.findOne({ id: '<UUID>', select: { apiName: true, apisTableId: true, apisTableName: true, appStoreIdentitiesTableId: true, appStoreIdentitiesTableName: true, appsTableId: true, appsTableName: true, bindingsTableId: true, bindingsTableName: true, bucketsTableId: true, bucketsTableName: true, databaseId: true, defaultCapabilities: true, domainsTableId: true, domainsTableName: true, entityTableId: true, functionsTableId: true, functionsTableName: true, id: true, imagesTableId: true, imagesTableName: true, managedDomainsTableId: true, managedDomainsTableName: true, namespacesTableId: true, namespacesTableName: true, policies: true, privateApiName: true, provisions: true, publicSchemaName: true, redirectsTableId: true, redirectsTableName: true, resourceDefinitionsTableId: true, resourceDefinitionsTableName: true, resourceInstallationsTableId: true, resourceInstallationsTableName: true, resourcesTableId: true, resourcesTableName: true, schemaId: true, scope: true, sitesAppLinksTableId: true, sitesAppLinksTableName: true, sitesDeepLinksTableId: true, sitesDeepLinksTableName: true, sitesErrorPagesTableId: true, sitesErrorPagesTableName: true, sitesTableId: true, sitesTableName: true, sitesWebConfigTableId: true, sitesWebConfigTableName: true } }).execute();

// Create
const created = await db.catalogModule.create({ data: { apiName: '<String>', apisTableId: '<UUID>', apisTableName: '<String>', appStoreIdentitiesTableId: '<UUID>', appStoreIdentitiesTableName: '<String>', appsTableId: '<UUID>', appsTableName: '<String>', bindingsTableId: '<UUID>', bindingsTableName: '<String>', bucketsTableId: '<UUID>', bucketsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', domainsTableId: '<UUID>', domainsTableName: '<String>', entityTableId: '<UUID>', functionsTableId: '<UUID>', functionsTableName: '<String>', imagesTableId: '<UUID>', imagesTableName: '<String>', managedDomainsTableId: '<UUID>', managedDomainsTableName: '<String>', namespacesTableId: '<UUID>', namespacesTableName: '<String>', policies: '<JSON>', privateApiName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', redirectsTableId: '<UUID>', redirectsTableName: '<String>', resourceDefinitionsTableId: '<UUID>', resourceDefinitionsTableName: '<String>', resourceInstallationsTableId: '<UUID>', resourceInstallationsTableName: '<String>', resourcesTableId: '<UUID>', resourcesTableName: '<String>', schemaId: '<UUID>', scope: '<String>', sitesAppLinksTableId: '<UUID>', sitesAppLinksTableName: '<String>', sitesDeepLinksTableId: '<UUID>', sitesDeepLinksTableName: '<String>', sitesErrorPagesTableId: '<UUID>', sitesErrorPagesTableName: '<String>', sitesTableId: '<UUID>', sitesTableName: '<String>', sitesWebConfigTableId: '<UUID>', sitesWebConfigTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.catalogModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.catalogModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.clusterModule`

CRUD operations for ClusterModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `clusterEventsTableId` | UUID | Yes |
| `clusterEventsTableName` | String | Yes |
| `clustersTableId` | UUID | Yes |
| `clustersTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `databasePlacementsTableId` | UUID | Yes |
| `databasePlacementsTableName` | String | Yes |
| `databaseServersTableId` | UUID | Yes |
| `databaseServersTableName` | String | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `partitionInterval` | String | Yes |
| `physicalDatabasesTableId` | UUID | Yes |
| `physicalDatabasesTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `retention` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all clusterModule records
const items = await db.clusterModule.findMany({ select: { apiName: true, clusterEventsTableId: true, clusterEventsTableName: true, clustersTableId: true, clustersTableName: true, databaseId: true, databasePlacementsTableId: true, databasePlacementsTableName: true, databaseServersTableId: true, databaseServersTableName: true, defaultCapabilities: true, entityField: true, id: true, partitionInterval: true, physicalDatabasesTableId: true, physicalDatabasesTableName: true, policies: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, retention: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.clusterModule.findOne({ id: '<UUID>', select: { apiName: true, clusterEventsTableId: true, clusterEventsTableName: true, clustersTableId: true, clustersTableName: true, databaseId: true, databasePlacementsTableId: true, databasePlacementsTableName: true, databaseServersTableId: true, databaseServersTableName: true, defaultCapabilities: true, entityField: true, id: true, partitionInterval: true, physicalDatabasesTableId: true, physicalDatabasesTableName: true, policies: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, retention: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.clusterModule.create({ data: { apiName: '<String>', clusterEventsTableId: '<UUID>', clusterEventsTableName: '<String>', clustersTableId: '<UUID>', clustersTableName: '<String>', databaseId: '<UUID>', databasePlacementsTableId: '<UUID>', databasePlacementsTableName: '<String>', databaseServersTableId: '<UUID>', databaseServersTableName: '<String>', defaultCapabilities: '<String>', entityField: '<String>', partitionInterval: '<String>', physicalDatabasesTableId: '<UUID>', physicalDatabasesTableName: '<String>', policies: '<JSON>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', retention: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.clusterModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.clusterModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.computeLogModule`

CRUD operations for ComputeLogModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `computeLogTableId` | UUID | Yes |
| `computeLogTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `interval` | String | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `retention` | String | Yes |
| `rollupFunctionName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `usageSummaryTableId` | UUID | Yes |
| `usageSummaryTableName` | String | Yes |

**Operations:**

```typescript
// List all computeLogModule records
const items = await db.computeLogModule.findMany({ select: { apiName: true, computeLogTableId: true, computeLogTableName: true, databaseId: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Get one by id
const item = await db.computeLogModule.findOne({ id: '<UUID>', select: { apiName: true, computeLogTableId: true, computeLogTableName: true, databaseId: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Create
const created = await db.computeLogModule.create({ data: { apiName: '<String>', computeLogTableId: '<UUID>', computeLogTableName: '<String>', databaseId: '<UUID>', entityField: '<String>', interval: '<String>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', retention: '<String>', rollupFunctionName: '<String>', schemaId: '<UUID>', scope: '<String>', usageSummaryTableId: '<UUID>', usageSummaryTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.computeLogModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.computeLogModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.connectedAccountsModule`

CRUD operations for ConnectedAccountsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ownerTableId` | UUID | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all connectedAccountsModule records
const items = await db.connectedAccountsModule.findMany({ select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.connectedAccountsModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.connectedAccountsModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', ownerTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.connectedAccountsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.connectedAccountsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.contentPresetModule`

CRUD operations for ContentPresetModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `contentPresetsTableId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `merkleStoreModuleId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaId` | UUID | Yes |
| `publicSchemaName` | String | Yes |
| `scope` | String | Yes |
| `storeName` | String | Yes |

**Operations:**

```typescript
// List all contentPresetModule records
const items = await db.contentPresetModule.findMany({ select: { apiName: true, contentPresetsTableId: true, createdAt: true, databaseId: true, entityTableId: true, id: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true, storeName: true } }).execute();

// Get one by id
const item = await db.contentPresetModule.findOne({ id: '<UUID>', select: { apiName: true, contentPresetsTableId: true, createdAt: true, databaseId: true, entityTableId: true, id: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true, storeName: true } }).execute();

// Create
const created = await db.contentPresetModule.create({ data: { apiName: '<String>', contentPresetsTableId: '<UUID>', databaseId: '<UUID>', entityTableId: '<UUID>', merkleStoreModuleId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaId: '<UUID>', publicSchemaName: '<String>', scope: '<String>', storeName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.contentPresetModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.contentPresetModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.cryptoAddressesModule`

CRUD operations for CryptoAddressesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `cryptoNetwork` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ownerTableId` | UUID | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all cryptoAddressesModule records
const items = await db.cryptoAddressesModule.findMany({ select: { apiName: true, cryptoNetwork: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.cryptoAddressesModule.findOne({ id: '<UUID>', select: { apiName: true, cryptoNetwork: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.cryptoAddressesModule.create({ data: { apiName: '<String>', cryptoNetwork: '<String>', databaseId: '<UUID>', ownerTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.cryptoAddressesModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.cryptoAddressesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.cryptoAuthModule`

CRUD operations for CryptoAuthModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `addressesTableId` | UUID | Yes |
| `cryptoNetwork` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `schemaId` | UUID | Yes |
| `secretsTableId` | UUID | Yes |
| `sessionCredentialsTableId` | UUID | Yes |
| `sessionsTableId` | UUID | Yes |
| `signInRecordFailure` | String | Yes |
| `signInRequestChallenge` | String | Yes |
| `signInWithChallenge` | String | Yes |
| `signUpWithKey` | String | Yes |
| `userField` | String | Yes |
| `usersTableId` | UUID | Yes |

**Operations:**

```typescript
// List all cryptoAuthModule records
const items = await db.cryptoAuthModule.findMany({ select: { addressesTableId: true, cryptoNetwork: true, databaseId: true, id: true, schemaId: true, secretsTableId: true, sessionCredentialsTableId: true, sessionsTableId: true, signInRecordFailure: true, signInRequestChallenge: true, signInWithChallenge: true, signUpWithKey: true, userField: true, usersTableId: true } }).execute();

// Get one by id
const item = await db.cryptoAuthModule.findOne({ id: '<UUID>', select: { addressesTableId: true, cryptoNetwork: true, databaseId: true, id: true, schemaId: true, secretsTableId: true, sessionCredentialsTableId: true, sessionsTableId: true, signInRecordFailure: true, signInRequestChallenge: true, signInWithChallenge: true, signUpWithKey: true, userField: true, usersTableId: true } }).execute();

// Create
const created = await db.cryptoAuthModule.create({ data: { addressesTableId: '<UUID>', cryptoNetwork: '<String>', databaseId: '<UUID>', schemaId: '<UUID>', secretsTableId: '<UUID>', sessionCredentialsTableId: '<UUID>', sessionsTableId: '<UUID>', signInRecordFailure: '<String>', signInRequestChallenge: '<String>', signInWithChallenge: '<String>', signUpWithKey: '<String>', userField: '<String>', usersTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.cryptoAuthModule.update({ where: { id: '<UUID>' }, data: { addressesTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.cryptoAuthModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.dataCapabilitiesField`

CRUD operations for DataCapabilitiesField records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `capabilitiesModuleId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `fieldId` | UUID | Yes |
| `fromFieldId` | UUID | Yes |
| `id` | UUID | No |
| `mappingFieldId` | UUID | Yes |
| `mappingKeyFieldId` | UUID | Yes |
| `mappingTableId` | UUID | Yes |
| `mode` | String | Yes |
| `subsetGuard` | Boolean | Yes |
| `tableId` | UUID | Yes |

**Operations:**

```typescript
// List all dataCapabilitiesField records
const items = await db.dataCapabilitiesField.findMany({ select: { capabilitiesModuleId: true, databaseId: true, fieldId: true, fromFieldId: true, id: true, mappingFieldId: true, mappingKeyFieldId: true, mappingTableId: true, mode: true, subsetGuard: true, tableId: true } }).execute();

// Get one by id
const item = await db.dataCapabilitiesField.findOne({ id: '<UUID>', select: { capabilitiesModuleId: true, databaseId: true, fieldId: true, fromFieldId: true, id: true, mappingFieldId: true, mappingKeyFieldId: true, mappingTableId: true, mode: true, subsetGuard: true, tableId: true } }).execute();

// Create
const created = await db.dataCapabilitiesField.create({ data: { capabilitiesModuleId: '<UUID>', databaseId: '<UUID>', fieldId: '<UUID>', fromFieldId: '<UUID>', mappingFieldId: '<UUID>', mappingKeyFieldId: '<UUID>', mappingTableId: '<UUID>', mode: '<String>', subsetGuard: '<Boolean>', tableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.dataCapabilitiesField.update({ where: { id: '<UUID>' }, data: { capabilitiesModuleId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.dataCapabilitiesField.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseProvisionModule`

CRUD operations for DatabaseProvisionModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `async` | Boolean | Yes |
| `bootstrapActorId` | UUID | Yes |
| `bootstrapError` | String | Yes |
| `bootstrapStatus` | String | Yes |
| `bootstrapUser` | Boolean | Yes |
| `completedAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `databaseName` | String | Yes |
| `domain` | String | Yes |
| `errorMessage` | String | Yes |
| `fulfilledAt` | Datetime | Yes |
| `id` | UUID | No |
| `modules` | JSON | Yes |
| `options` | JSON | Yes |
| `ownerId` | UUID | Yes |
| `sourceDatabaseId` | UUID | Yes |
| `status` | String | Yes |
| `subdomain` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all databaseProvisionModule records
const items = await db.databaseProvisionModule.findMany({ select: { async: true, bootstrapActorId: true, bootstrapError: true, bootstrapStatus: true, bootstrapUser: true, completedAt: true, createdAt: true, databaseId: true, databaseName: true, domain: true, errorMessage: true, fulfilledAt: true, id: true, modules: true, options: true, ownerId: true, sourceDatabaseId: true, status: true, subdomain: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.databaseProvisionModule.findOne({ id: '<UUID>', select: { async: true, bootstrapActorId: true, bootstrapError: true, bootstrapStatus: true, bootstrapUser: true, completedAt: true, createdAt: true, databaseId: true, databaseName: true, domain: true, errorMessage: true, fulfilledAt: true, id: true, modules: true, options: true, ownerId: true, sourceDatabaseId: true, status: true, subdomain: true, updatedAt: true } }).execute();

// Create
const created = await db.databaseProvisionModule.create({ data: { async: '<Boolean>', bootstrapActorId: '<UUID>', bootstrapError: '<String>', bootstrapStatus: '<String>', bootstrapUser: '<Boolean>', completedAt: '<Datetime>', databaseId: '<UUID>', databaseName: '<String>', domain: '<String>', errorMessage: '<String>', fulfilledAt: '<Datetime>', modules: '<JSON>', options: '<JSON>', ownerId: '<UUID>', sourceDatabaseId: '<UUID>', status: '<String>', subdomain: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseProvisionModule.update({ where: { id: '<UUID>' }, data: { async: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseProvisionModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.databaseSettingsModule`

CRUD operations for DatabaseSettingsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `databaseSettingsTableId` | UUID | Yes |
| `databaseSettingsTableName` | String | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `provisions` | JSON | Yes |
| `pubkeySettingsTableId` | UUID | Yes |
| `pubkeySettingsTableName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `rlsSettingsTableId` | UUID | Yes |
| `rlsSettingsTableName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `webauthnSettingsTableId` | UUID | Yes |
| `webauthnSettingsTableName` | String | Yes |

**Operations:**

```typescript
// List all databaseSettingsModule records
const items = await db.databaseSettingsModule.findMany({ select: { apiName: true, databaseId: true, databaseSettingsTableId: true, databaseSettingsTableName: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, provisions: true, pubkeySettingsTableId: true, pubkeySettingsTableName: true, publicSchemaName: true, rlsSettingsTableId: true, rlsSettingsTableName: true, schemaId: true, scope: true, webauthnSettingsTableId: true, webauthnSettingsTableName: true } }).execute();

// Get one by id
const item = await db.databaseSettingsModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, databaseSettingsTableId: true, databaseSettingsTableName: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, provisions: true, pubkeySettingsTableId: true, pubkeySettingsTableName: true, publicSchemaName: true, rlsSettingsTableId: true, rlsSettingsTableName: true, schemaId: true, scope: true, webauthnSettingsTableId: true, webauthnSettingsTableName: true } }).execute();

// Create
const created = await db.databaseSettingsModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', databaseSettingsTableId: '<UUID>', databaseSettingsTableName: '<String>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', provisions: '<JSON>', pubkeySettingsTableId: '<UUID>', pubkeySettingsTableName: '<String>', publicSchemaName: '<String>', rlsSettingsTableId: '<UUID>', rlsSettingsTableName: '<String>', schemaId: '<UUID>', scope: '<String>', webauthnSettingsTableId: '<UUID>', webauthnSettingsTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.databaseSettingsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.databaseSettingsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.dbPoolConfig`

CRUD operations for DbPoolConfig records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `domain` | String | Yes |
| `enabled` | Boolean | Yes |
| `id` | UUID | No |
| `max` | Int | Yes |
| `min` | Int | Yes |
| `poolOwnerId` | UUID | Yes |
| `presetSlug` | String | Yes |
| `updatedAt` | Datetime | No |
| `warmTtl` | Interval | Yes |

**Operations:**

```typescript
// List all dbPoolConfig records
const items = await db.dbPoolConfig.findMany({ select: { createdAt: true, domain: true, enabled: true, id: true, max: true, min: true, poolOwnerId: true, presetSlug: true, updatedAt: true, warmTtl: true } }).execute();

// Get one by id
const item = await db.dbPoolConfig.findOne({ id: '<UUID>', select: { createdAt: true, domain: true, enabled: true, id: true, max: true, min: true, poolOwnerId: true, presetSlug: true, updatedAt: true, warmTtl: true } }).execute();

// Create
const created = await db.dbPoolConfig.create({ data: { domain: '<String>', enabled: '<Boolean>', max: '<Int>', min: '<Int>', poolOwnerId: '<UUID>', presetSlug: '<String>', warmTtl: '<Interval>' }, select: { id: true } }).execute();

// Update
const updated = await db.dbPoolConfig.update({ where: { id: '<UUID>' }, data: { domain: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.dbPoolConfig.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.dbPool`

CRUD operations for DbPool records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `bootstrapError` | String | Yes |
| `bootstrapStatus` | String | Yes |
| `claimedAt` | Datetime | Yes |
| `claimedBy` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `errorMessage` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `presetCommitId` | UUID | Yes |
| `presetSlug` | String | Yes |
| `status` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all dbPool records
const items = await db.dbPool.findMany({ select: { bootstrapError: true, bootstrapStatus: true, claimedAt: true, claimedBy: true, createdAt: true, databaseId: true, errorMessage: true, expiresAt: true, id: true, presetCommitId: true, presetSlug: true, status: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.dbPool.findOne({ id: '<UUID>', select: { bootstrapError: true, bootstrapStatus: true, claimedAt: true, claimedBy: true, createdAt: true, databaseId: true, errorMessage: true, expiresAt: true, id: true, presetCommitId: true, presetSlug: true, status: true, updatedAt: true } }).execute();

// Create
const created = await db.dbPool.create({ data: { bootstrapError: '<String>', bootstrapStatus: '<String>', claimedAt: '<Datetime>', claimedBy: '<UUID>', databaseId: '<UUID>', errorMessage: '<String>', expiresAt: '<Datetime>', presetCommitId: '<UUID>', presetSlug: '<String>', status: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.dbPool.update({ where: { id: '<UUID>' }, data: { bootstrapError: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.dbPool.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.dbPresetModule`

CRUD operations for DbPresetModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `dbPresetsTableId` | UUID | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `merkleStoreModuleId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaId` | UUID | Yes |
| `publicSchemaName` | String | Yes |
| `scope` | String | Yes |
| `storeName` | String | Yes |

**Operations:**

```typescript
// List all dbPresetModule records
const items = await db.dbPresetModule.findMany({ select: { apiName: true, createdAt: true, databaseId: true, dbPresetsTableId: true, entityTableId: true, id: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true, storeName: true } }).execute();

// Get one by id
const item = await db.dbPresetModule.findOne({ id: '<UUID>', select: { apiName: true, createdAt: true, databaseId: true, dbPresetsTableId: true, entityTableId: true, id: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true, storeName: true } }).execute();

// Create
const created = await db.dbPresetModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', dbPresetsTableId: '<UUID>', entityTableId: '<UUID>', merkleStoreModuleId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaId: '<UUID>', publicSchemaName: '<String>', scope: '<String>', storeName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.dbPresetModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.dbPresetModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.dbUsageModule`

CRUD operations for DbUsageModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `collectDbQueryStatsFunction` | String | Yes |
| `collectDbTableStatsFunction` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `interval` | String | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `queryStatsLogTableId` | UUID | Yes |
| `queryStatsLogTableName` | String | Yes |
| `queryStatsSummaryTableId` | UUID | Yes |
| `queryStatsSummaryTableName` | String | Yes |
| `retention` | String | Yes |
| `rollupDbQueryStatsUsageSummaryFunction` | String | Yes |
| `rollupDbTableStatsUsageSummaryFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `tableStatsLogTableId` | UUID | Yes |
| `tableStatsLogTableName` | String | Yes |
| `tableStatsSummaryTableId` | UUID | Yes |
| `tableStatsSummaryTableName` | String | Yes |

**Operations:**

```typescript
// List all dbUsageModule records
const items = await db.dbUsageModule.findMany({ select: { apiName: true, collectDbQueryStatsFunction: true, collectDbTableStatsFunction: true, databaseId: true, defaultCapabilities: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, queryStatsLogTableId: true, queryStatsLogTableName: true, queryStatsSummaryTableId: true, queryStatsSummaryTableName: true, retention: true, rollupDbQueryStatsUsageSummaryFunction: true, rollupDbTableStatsUsageSummaryFunction: true, schemaId: true, scope: true, tableStatsLogTableId: true, tableStatsLogTableName: true, tableStatsSummaryTableId: true, tableStatsSummaryTableName: true } }).execute();

// Get one by id
const item = await db.dbUsageModule.findOne({ id: '<UUID>', select: { apiName: true, collectDbQueryStatsFunction: true, collectDbTableStatsFunction: true, databaseId: true, defaultCapabilities: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, queryStatsLogTableId: true, queryStatsLogTableName: true, queryStatsSummaryTableId: true, queryStatsSummaryTableName: true, retention: true, rollupDbQueryStatsUsageSummaryFunction: true, rollupDbTableStatsUsageSummaryFunction: true, schemaId: true, scope: true, tableStatsLogTableId: true, tableStatsLogTableName: true, tableStatsSummaryTableId: true, tableStatsSummaryTableName: true } }).execute();

// Create
const created = await db.dbUsageModule.create({ data: { apiName: '<String>', collectDbQueryStatsFunction: '<String>', collectDbTableStatsFunction: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', interval: '<String>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', queryStatsLogTableId: '<UUID>', queryStatsLogTableName: '<String>', queryStatsSummaryTableId: '<UUID>', queryStatsSummaryTableName: '<String>', retention: '<String>', rollupDbQueryStatsUsageSummaryFunction: '<String>', rollupDbTableStatsUsageSummaryFunction: '<String>', schemaId: '<UUID>', scope: '<String>', tableStatsLogTableId: '<UUID>', tableStatsLogTableName: '<String>', tableStatsSummaryTableId: '<UUID>', tableStatsSummaryTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.dbUsageModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.dbUsageModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.defaultIdsModule`

CRUD operations for DefaultIdsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `id` | UUID | No |

**Operations:**

```typescript
// List all defaultIdsModule records
const items = await db.defaultIdsModule.findMany({ select: { databaseId: true, id: true } }).execute();

// Get one by id
const item = await db.defaultIdsModule.findOne({ id: '<UUID>', select: { databaseId: true, id: true } }).execute();

// Create
const created = await db.defaultIdsModule.create({ data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.defaultIdsModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.defaultIdsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.denormalizedTableField`

CRUD operations for DenormalizedTableField records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `fieldId` | UUID | Yes |
| `funcName` | String | Yes |
| `funcOrder` | Int | Yes |
| `id` | UUID | No |
| `refFieldId` | UUID | Yes |
| `refIds` | UUID | Yes |
| `refTableId` | UUID | Yes |
| `setIds` | UUID | Yes |
| `tableId` | UUID | Yes |
| `updateDefaults` | Boolean | Yes |
| `useUpdates` | Boolean | Yes |

**Operations:**

```typescript
// List all denormalizedTableField records
const items = await db.denormalizedTableField.findMany({ select: { databaseId: true, fieldId: true, funcName: true, funcOrder: true, id: true, refFieldId: true, refIds: true, refTableId: true, setIds: true, tableId: true, updateDefaults: true, useUpdates: true } }).execute();

// Get one by id
const item = await db.denormalizedTableField.findOne({ id: '<UUID>', select: { databaseId: true, fieldId: true, funcName: true, funcOrder: true, id: true, refFieldId: true, refIds: true, refTableId: true, setIds: true, tableId: true, updateDefaults: true, useUpdates: true } }).execute();

// Create
const created = await db.denormalizedTableField.create({ data: { databaseId: '<UUID>', fieldId: '<UUID>', funcName: '<String>', funcOrder: '<Int>', refFieldId: '<UUID>', refIds: '<UUID>', refTableId: '<UUID>', setIds: '<UUID>', tableId: '<UUID>', updateDefaults: '<Boolean>', useUpdates: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.denormalizedTableField.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.denormalizedTableField.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.devicesModule`

CRUD operations for DevicesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `deviceSettingsTableId` | UUID | Yes |
| `deviceSettingsTableName` | String | Yes |
| `id` | UUID | No |
| `schemaId` | UUID | Yes |
| `userDevicesTableId` | UUID | Yes |
| `userDevicesTableName` | String | Yes |

**Operations:**

```typescript
// List all devicesModule records
const items = await db.devicesModule.findMany({ select: { databaseId: true, deviceSettingsTableId: true, deviceSettingsTableName: true, id: true, schemaId: true, userDevicesTableId: true, userDevicesTableName: true } }).execute();

// Get one by id
const item = await db.devicesModule.findOne({ id: '<UUID>', select: { databaseId: true, deviceSettingsTableId: true, deviceSettingsTableName: true, id: true, schemaId: true, userDevicesTableId: true, userDevicesTableName: true } }).execute();

// Create
const created = await db.devicesModule.create({ data: { databaseId: '<UUID>', deviceSettingsTableId: '<UUID>', deviceSettingsTableName: '<String>', schemaId: '<UUID>', userDevicesTableId: '<UUID>', userDevicesTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.devicesModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.devicesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.domainModule`

CRUD operations for DomainModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `catalogModuleId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `domainEventsTableId` | UUID | Yes |
| `domainEventsTableName` | String | Yes |
| `domainVerificationsTableId` | UUID | Yes |
| `domainVerificationsTableName` | String | Yes |
| `domainsTableId` | UUID | Yes |
| `domainsTableName` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `managedDomainsTableId` | UUID | Yes |
| `managedDomainsTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all domainModule records
const items = await db.domainModule.findMany({ select: { apiName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, domainEventsTableId: true, domainEventsTableName: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityField: true, entityTableId: true, id: true, managedDomainsTableId: true, managedDomainsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.domainModule.findOne({ id: '<UUID>', select: { apiName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, domainEventsTableId: true, domainEventsTableName: true, domainVerificationsTableId: true, domainVerificationsTableName: true, domainsTableId: true, domainsTableName: true, entityField: true, entityTableId: true, id: true, managedDomainsTableId: true, managedDomainsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.domainModule.create({ data: { apiName: '<String>', catalogModuleId: '<UUID>', databaseId: '<UUID>', defaultCapabilities: '<String>', domainEventsTableId: '<UUID>', domainEventsTableName: '<String>', domainVerificationsTableId: '<UUID>', domainVerificationsTableName: '<String>', domainsTableId: '<UUID>', domainsTableName: '<String>', entityField: '<String>', entityTableId: '<UUID>', managedDomainsTableId: '<UUID>', managedDomainsTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.domainModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.domainModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.emailSenderModule`

CRUD operations for EmailSenderModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `emailIdentitiesTableId` | UUID | Yes |
| `emailIdentitiesTableName` | String | Yes |
| `emailProviderAccountsTableId` | UUID | Yes |
| `emailProviderAccountsTableName` | String | Yes |
| `emailSiteIdentitiesTableId` | UUID | Yes |
| `emailSiteIdentitiesTableName` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `siteSurfaceModuleId` | UUID | Yes |

**Operations:**

```typescript
// List all emailSenderModule records
const items = await db.emailSenderModule.findMany({ select: { apiName: true, databaseId: true, defaultCapabilities: true, emailIdentitiesTableId: true, emailIdentitiesTableName: true, emailProviderAccountsTableId: true, emailProviderAccountsTableName: true, emailSiteIdentitiesTableId: true, emailSiteIdentitiesTableName: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, siteSurfaceModuleId: true } }).execute();

// Get one by id
const item = await db.emailSenderModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, defaultCapabilities: true, emailIdentitiesTableId: true, emailIdentitiesTableName: true, emailProviderAccountsTableId: true, emailProviderAccountsTableName: true, emailSiteIdentitiesTableId: true, emailSiteIdentitiesTableName: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, siteSurfaceModuleId: true } }).execute();

// Create
const created = await db.emailSenderModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', emailIdentitiesTableId: '<UUID>', emailIdentitiesTableName: '<String>', emailProviderAccountsTableId: '<UUID>', emailProviderAccountsTableName: '<String>', emailSiteIdentitiesTableId: '<UUID>', emailSiteIdentitiesTableName: '<String>', entityField: '<String>', entityTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', siteSurfaceModuleId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.emailSenderModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.emailSenderModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.emailsModule`

CRUD operations for EmailsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ownerTableId` | UUID | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all emailsModule records
const items = await db.emailsModule.findMany({ select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.emailsModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.emailsModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', ownerTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.emailsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.emailsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.entityTypeProvision`

CRUD operations for EntityTypeProvision records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `agents` | JSON | Yes |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `functions` | JSON | Yes |
| `graphs` | JSON | Yes |
| `hasInviteAchievements` | Boolean | Yes |
| `hasInvites` | Boolean | Yes |
| `hasLevels` | Boolean | Yes |
| `hasLimits` | Boolean | Yes |
| `hasProfiles` | Boolean | Yes |
| `id` | UUID | No |
| `isVisible` | Boolean | Yes |
| `name` | String | Yes |
| `namespaces` | JSON | Yes |
| `outAgentModuleId` | UUID | Yes |
| `outDefinitionsTableId` | UUID | Yes |
| `outEntityTableId` | UUID | Yes |
| `outEntityTableName` | String | Yes |
| `outExecutionLogsTableId` | UUID | Yes |
| `outFunctionModuleId` | UUID | Yes |
| `outGraphModuleId` | UUID | Yes |
| `outGraphsTableId` | UUID | Yes |
| `outInstalledModules` | String | Yes |
| `outInvitesModuleId` | UUID | Yes |
| `outInvocationsTableId` | UUID | Yes |
| `outMembershipType` | Int | Yes |
| `outNamespaceEventsTableId` | UUID | Yes |
| `outNamespaceModuleId` | UUID | Yes |
| `outNamespacesTableId` | UUID | Yes |
| `parentEntity` | String | Yes |
| `prefix` | String | Yes |
| `skipEntityPolicies` | Boolean | Yes |
| `storage` | JSON | Yes |
| `tableName` | String | Yes |
| `tableProvision` | JSON | Yes |

**Operations:**

```typescript
// List all entityTypeProvision records
const items = await db.entityTypeProvision.findMany({ select: { agents: true, databaseId: true, description: true, functions: true, graphs: true, hasInviteAchievements: true, hasInvites: true, hasLevels: true, hasLimits: true, hasProfiles: true, id: true, isVisible: true, name: true, namespaces: true, outAgentModuleId: true, outDefinitionsTableId: true, outEntityTableId: true, outEntityTableName: true, outExecutionLogsTableId: true, outFunctionModuleId: true, outGraphModuleId: true, outGraphsTableId: true, outInstalledModules: true, outInvitesModuleId: true, outInvocationsTableId: true, outMembershipType: true, outNamespaceEventsTableId: true, outNamespaceModuleId: true, outNamespacesTableId: true, parentEntity: true, prefix: true, skipEntityPolicies: true, storage: true, tableName: true, tableProvision: true } }).execute();

// Get one by id
const item = await db.entityTypeProvision.findOne({ id: '<UUID>', select: { agents: true, databaseId: true, description: true, functions: true, graphs: true, hasInviteAchievements: true, hasInvites: true, hasLevels: true, hasLimits: true, hasProfiles: true, id: true, isVisible: true, name: true, namespaces: true, outAgentModuleId: true, outDefinitionsTableId: true, outEntityTableId: true, outEntityTableName: true, outExecutionLogsTableId: true, outFunctionModuleId: true, outGraphModuleId: true, outGraphsTableId: true, outInstalledModules: true, outInvitesModuleId: true, outInvocationsTableId: true, outMembershipType: true, outNamespaceEventsTableId: true, outNamespaceModuleId: true, outNamespacesTableId: true, parentEntity: true, prefix: true, skipEntityPolicies: true, storage: true, tableName: true, tableProvision: true } }).execute();

// Create
const created = await db.entityTypeProvision.create({ data: { agents: '<JSON>', databaseId: '<UUID>', description: '<String>', functions: '<JSON>', graphs: '<JSON>', hasInviteAchievements: '<Boolean>', hasInvites: '<Boolean>', hasLevels: '<Boolean>', hasLimits: '<Boolean>', hasProfiles: '<Boolean>', isVisible: '<Boolean>', name: '<String>', namespaces: '<JSON>', outAgentModuleId: '<UUID>', outDefinitionsTableId: '<UUID>', outEntityTableId: '<UUID>', outEntityTableName: '<String>', outExecutionLogsTableId: '<UUID>', outFunctionModuleId: '<UUID>', outGraphModuleId: '<UUID>', outGraphsTableId: '<UUID>', outInstalledModules: '<String>', outInvitesModuleId: '<UUID>', outInvocationsTableId: '<UUID>', outMembershipType: '<Int>', outNamespaceEventsTableId: '<UUID>', outNamespaceModuleId: '<UUID>', outNamespacesTableId: '<UUID>', parentEntity: '<String>', prefix: '<String>', skipEntityPolicies: '<Boolean>', storage: '<JSON>', tableName: '<String>', tableProvision: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.entityTypeProvision.update({ where: { id: '<UUID>' }, data: { agents: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.entityTypeProvision.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.eventsModule`

CRUD operations for EventsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `achievementRewardsTableId` | UUID | Yes |
| `achievementRewardsTableName` | String | Yes |
| `actorTableId` | UUID | Yes |
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `eventAggregatesTableId` | UUID | Yes |
| `eventAggregatesTableName` | String | Yes |
| `eventTypesTableId` | UUID | Yes |
| `eventTypesTableName` | String | Yes |
| `eventsTableId` | UUID | Yes |
| `eventsTableName` | String | Yes |
| `expireGrants` | String | Yes |
| `grantAchievement` | String | Yes |
| `id` | UUID | No |
| `interval` | String | Yes |
| `levelAchieved` | String | Yes |
| `levelGrantsTableId` | UUID | Yes |
| `levelGrantsTableName` | String | Yes |
| `levelRequirementsTableId` | UUID | Yes |
| `levelRequirementsTableName` | String | Yes |
| `levelsTableId` | UUID | Yes |
| `levelsTableName` | String | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `recomputeCapabilities` | String | Yes |
| `recordError` | String | Yes |
| `recordEvent` | String | Yes |
| `removeEvent` | String | Yes |
| `retention` | String | Yes |
| `revokeAchievement` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `stepsRequired` | String | Yes |
| `tgAchievementReward` | String | Yes |
| `tgCheckAchievements` | String | Yes |
| `tgEvent` | String | Yes |
| `tgEventBool` | String | Yes |
| `tgEventToggle` | String | Yes |
| `tgEventToggleBool` | String | Yes |
| `tgLevelGrantSync` | String | Yes |
| `tgUpdateAggregates` | String | Yes |
| `trustLadder` | JSON | Yes |
| `upsertAggregate` | String | Yes |

**Operations:**

```typescript
// List all eventsModule records
const items = await db.eventsModule.findMany({ select: { achievementRewardsTableId: true, achievementRewardsTableName: true, actorTableId: true, apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, eventAggregatesTableId: true, eventAggregatesTableName: true, eventTypesTableId: true, eventTypesTableName: true, eventsTableId: true, eventsTableName: true, expireGrants: true, grantAchievement: true, id: true, interval: true, levelAchieved: true, levelGrantsTableId: true, levelGrantsTableName: true, levelRequirementsTableId: true, levelRequirementsTableName: true, levelsTableId: true, levelsTableName: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, recomputeCapabilities: true, recordError: true, recordEvent: true, removeEvent: true, retention: true, revokeAchievement: true, schemaId: true, scope: true, stepsRequired: true, tgAchievementReward: true, tgCheckAchievements: true, tgEvent: true, tgEventBool: true, tgEventToggle: true, tgEventToggleBool: true, tgLevelGrantSync: true, tgUpdateAggregates: true, trustLadder: true, upsertAggregate: true } }).execute();

// Get one by id
const item = await db.eventsModule.findOne({ id: '<UUID>', select: { achievementRewardsTableId: true, achievementRewardsTableName: true, actorTableId: true, apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, eventAggregatesTableId: true, eventAggregatesTableName: true, eventTypesTableId: true, eventTypesTableName: true, eventsTableId: true, eventsTableName: true, expireGrants: true, grantAchievement: true, id: true, interval: true, levelAchieved: true, levelGrantsTableId: true, levelGrantsTableName: true, levelRequirementsTableId: true, levelRequirementsTableName: true, levelsTableId: true, levelsTableName: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, recomputeCapabilities: true, recordError: true, recordEvent: true, removeEvent: true, retention: true, revokeAchievement: true, schemaId: true, scope: true, stepsRequired: true, tgAchievementReward: true, tgCheckAchievements: true, tgEvent: true, tgEventBool: true, tgEventToggle: true, tgEventToggleBool: true, tgLevelGrantSync: true, tgUpdateAggregates: true, trustLadder: true, upsertAggregate: true } }).execute();

// Create
const created = await db.eventsModule.create({ data: { achievementRewardsTableId: '<UUID>', achievementRewardsTableName: '<String>', actorTableId: '<UUID>', apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', eventAggregatesTableId: '<UUID>', eventAggregatesTableName: '<String>', eventTypesTableId: '<UUID>', eventTypesTableName: '<String>', eventsTableId: '<UUID>', eventsTableName: '<String>', expireGrants: '<String>', grantAchievement: '<String>', interval: '<String>', levelAchieved: '<String>', levelGrantsTableId: '<UUID>', levelGrantsTableName: '<String>', levelRequirementsTableId: '<UUID>', levelRequirementsTableName: '<String>', levelsTableId: '<UUID>', levelsTableName: '<String>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', recomputeCapabilities: '<String>', recordError: '<String>', recordEvent: '<String>', removeEvent: '<String>', retention: '<String>', revokeAchievement: '<String>', schemaId: '<UUID>', scope: '<String>', stepsRequired: '<String>', tgAchievementReward: '<String>', tgCheckAchievements: '<String>', tgEvent: '<String>', tgEventBool: '<String>', tgEventToggle: '<String>', tgEventToggleBool: '<String>', tgLevelGrantSync: '<String>', tgUpdateAggregates: '<String>', trustLadder: '<JSON>', upsertAggregate: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.eventsModule.update({ where: { id: '<UUID>' }, data: { achievementRewardsTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.eventsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.fileRefField`

CRUD operations for FileRefField records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `bucketKey` | String | Yes |
| `bucketTags` | String | Yes |
| `databaseId` | UUID | Yes |
| `enforceFk` | Boolean | Yes |
| `fieldId` | UUID | Yes |
| `id` | UUID | No |
| `isPublic` | Boolean | Yes |
| `storageModuleId` | UUID | Yes |
| `tableId` | UUID | Yes |

**Operations:**

```typescript
// List all fileRefField records
const items = await db.fileRefField.findMany({ select: { bucketKey: true, bucketTags: true, databaseId: true, enforceFk: true, fieldId: true, id: true, isPublic: true, storageModuleId: true, tableId: true } }).execute();

// Get one by id
const item = await db.fileRefField.findOne({ id: '<UUID>', select: { bucketKey: true, bucketTags: true, databaseId: true, enforceFk: true, fieldId: true, id: true, isPublic: true, storageModuleId: true, tableId: true } }).execute();

// Create
const created = await db.fileRefField.create({ data: { bucketKey: '<String>', bucketTags: '<String>', databaseId: '<UUID>', enforceFk: '<Boolean>', fieldId: '<UUID>', isPublic: '<Boolean>', storageModuleId: '<UUID>', tableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.fileRefField.update({ where: { id: '<UUID>' }, data: { bucketKey: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.fileRefField.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionDeploymentModule`

CRUD operations for FunctionDeploymentModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `deploymentEventsTableId` | UUID | Yes |
| `deploymentEventsTableName` | String | Yes |
| `deploymentsTableId` | UUID | Yes |
| `deploymentsTableName` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `functionModuleId` | UUID | Yes |
| `id` | UUID | No |
| `namespaceModuleId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all functionDeploymentModule records
const items = await db.functionDeploymentModule.findMany({ select: { apiName: true, databaseId: true, defaultCapabilities: true, deploymentEventsTableId: true, deploymentEventsTableName: true, deploymentsTableId: true, deploymentsTableName: true, entityField: true, entityTableId: true, functionModuleId: true, id: true, namespaceModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.functionDeploymentModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, defaultCapabilities: true, deploymentEventsTableId: true, deploymentEventsTableName: true, deploymentsTableId: true, deploymentsTableName: true, entityField: true, entityTableId: true, functionModuleId: true, id: true, namespaceModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.functionDeploymentModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', deploymentEventsTableId: '<UUID>', deploymentEventsTableName: '<String>', deploymentsTableId: '<UUID>', deploymentsTableName: '<String>', entityField: '<String>', entityTableId: '<UUID>', functionModuleId: '<UUID>', namespaceModuleId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionDeploymentModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionDeploymentModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionInvocationModule`

CRUD operations for FunctionInvocationModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `attemptsTableId` | UUID | Yes |
| `attemptsTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `executionLogsTableId` | UUID | Yes |
| `executionLogsTableName` | String | Yes |
| `id` | UUID | No |
| `invocationsTableId` | UUID | Yes |
| `invocationsTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all functionInvocationModule records
const items = await db.functionInvocationModule.findMany({ select: { apiName: true, attemptsTableId: true, attemptsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, executionLogsTableId: true, executionLogsTableName: true, id: true, invocationsTableId: true, invocationsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.functionInvocationModule.findOne({ id: '<UUID>', select: { apiName: true, attemptsTableId: true, attemptsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, executionLogsTableId: true, executionLogsTableName: true, id: true, invocationsTableId: true, invocationsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.functionInvocationModule.create({ data: { apiName: '<String>', attemptsTableId: '<UUID>', attemptsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', executionLogsTableId: '<UUID>', executionLogsTableName: '<String>', invocationsTableId: '<UUID>', invocationsTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionInvocationModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionInvocationModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.functionModule`

CRUD operations for FunctionModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `bindingsTableId` | UUID | Yes |
| `bindingsTableName` | String | Yes |
| `capabilityBindingsTableId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `definitionsTableId` | UUID | Yes |
| `definitionsTableName` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `hasCron` | Boolean | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schedulesTableId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `storageKey` | String | Yes |

**Operations:**

```typescript
// List all functionModule records
const items = await db.functionModule.findMany({ select: { apiName: true, bindingsTableId: true, bindingsTableName: true, capabilityBindingsTableId: true, databaseId: true, defaultCapabilities: true, definitionsTableId: true, definitionsTableName: true, entityField: true, entityTableId: true, hasCron: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schedulesTableId: true, schemaId: true, scope: true, storageKey: true } }).execute();

// Get one by id
const item = await db.functionModule.findOne({ id: '<UUID>', select: { apiName: true, bindingsTableId: true, bindingsTableName: true, capabilityBindingsTableId: true, databaseId: true, defaultCapabilities: true, definitionsTableId: true, definitionsTableName: true, entityField: true, entityTableId: true, hasCron: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schedulesTableId: true, schemaId: true, scope: true, storageKey: true } }).execute();

// Create
const created = await db.functionModule.create({ data: { apiName: '<String>', bindingsTableId: '<UUID>', bindingsTableName: '<String>', capabilityBindingsTableId: '<UUID>', databaseId: '<UUID>', defaultCapabilities: '<String>', definitionsTableId: '<UUID>', definitionsTableName: '<String>', entityField: '<String>', entityTableId: '<UUID>', hasCron: '<Boolean>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schedulesTableId: '<UUID>', schemaId: '<UUID>', scope: '<String>', storageKey: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.functionModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.functionModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.graphExecutionModule`

CRUD operations for GraphExecutionModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `executionsTableId` | UUID | Yes |
| `executionsTableName` | String | Yes |
| `graphModuleId` | UUID | Yes |
| `id` | UUID | No |
| `nodeStatesTableId` | UUID | Yes |
| `nodeStatesTableName` | String | Yes |
| `outputsTableId` | UUID | Yes |
| `outputsTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all graphExecutionModule records
const items = await db.graphExecutionModule.findMany({ select: { apiName: true, createdAt: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, executionsTableId: true, executionsTableName: true, graphModuleId: true, id: true, nodeStatesTableId: true, nodeStatesTableName: true, outputsTableId: true, outputsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.graphExecutionModule.findOne({ id: '<UUID>', select: { apiName: true, createdAt: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, executionsTableId: true, executionsTableName: true, graphModuleId: true, id: true, nodeStatesTableId: true, nodeStatesTableName: true, outputsTableId: true, outputsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.graphExecutionModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', executionsTableId: '<UUID>', executionsTableName: '<String>', graphModuleId: '<UUID>', nodeStatesTableId: '<UUID>', nodeStatesTableName: '<String>', outputsTableId: '<UUID>', outputsTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.graphExecutionModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.graphExecutionModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.graphModule`

CRUD operations for GraphModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `graphsTableId` | UUID | Yes |
| `id` | UUID | No |
| `merkleStoreModuleId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaId` | UUID | Yes |
| `publicSchemaName` | String | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all graphModule records
const items = await db.graphModule.findMany({ select: { apiName: true, createdAt: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, graphsTableId: true, id: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true } }).execute();

// Get one by id
const item = await db.graphModule.findOne({ id: '<UUID>', select: { apiName: true, createdAt: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, graphsTableId: true, id: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true } }).execute();

// Create
const created = await db.graphModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', graphsTableId: '<UUID>', merkleStoreModuleId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaId: '<UUID>', publicSchemaName: '<String>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.graphModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.graphModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.hierarchyModule`

CRUD operations for HierarchyModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `chartEdgeGrantsTableId` | UUID | Yes |
| `chartEdgeGrantsTableName` | String | Yes |
| `chartEdgesTableId` | UUID | Yes |
| `chartEdgesTableName` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `getManagersFunction` | String | Yes |
| `getSubordinatesFunction` | String | Yes |
| `hierarchySprtTableId` | UUID | Yes |
| `hierarchySprtTableName` | String | Yes |
| `id` | UUID | No |
| `isManagerOfFunction` | String | Yes |
| `prefix` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `rebuildHierarchyFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `sprtTableName` | String | Yes |
| `usersTableId` | UUID | Yes |

**Operations:**

```typescript
// List all hierarchyModule records
const items = await db.hierarchyModule.findMany({ select: { chartEdgeGrantsTableId: true, chartEdgeGrantsTableName: true, chartEdgesTableId: true, chartEdgesTableName: true, createdAt: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, getManagersFunction: true, getSubordinatesFunction: true, hierarchySprtTableId: true, hierarchySprtTableName: true, id: true, isManagerOfFunction: true, prefix: true, privateSchemaId: true, privateSchemaName: true, rebuildHierarchyFunction: true, schemaId: true, scope: true, sprtTableName: true, usersTableId: true } }).execute();

// Get one by id
const item = await db.hierarchyModule.findOne({ id: '<UUID>', select: { chartEdgeGrantsTableId: true, chartEdgeGrantsTableName: true, chartEdgesTableId: true, chartEdgesTableName: true, createdAt: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, getManagersFunction: true, getSubordinatesFunction: true, hierarchySprtTableId: true, hierarchySprtTableName: true, id: true, isManagerOfFunction: true, prefix: true, privateSchemaId: true, privateSchemaName: true, rebuildHierarchyFunction: true, schemaId: true, scope: true, sprtTableName: true, usersTableId: true } }).execute();

// Create
const created = await db.hierarchyModule.create({ data: { chartEdgeGrantsTableId: '<UUID>', chartEdgeGrantsTableName: '<String>', chartEdgesTableId: '<UUID>', chartEdgesTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', getManagersFunction: '<String>', getSubordinatesFunction: '<String>', hierarchySprtTableId: '<UUID>', hierarchySprtTableName: '<String>', isManagerOfFunction: '<String>', prefix: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', rebuildHierarchyFunction: '<String>', schemaId: '<UUID>', scope: '<String>', sprtTableName: '<String>', usersTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.hierarchyModule.update({ where: { id: '<UUID>' }, data: { chartEdgeGrantsTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.hierarchyModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.i18NModule`

CRUD operations for I18NModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `settingsTableId` | UUID | Yes |

**Operations:**

```typescript
// List all i18NModule records
const items = await db.i18NModule.findMany({ select: { apiName: true, databaseId: true, id: true, privateApiName: true, privateSchemaId: true, schemaId: true, settingsTableId: true } }).execute();

// Get one by id
const item = await db.i18NModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, privateApiName: true, privateSchemaId: true, schemaId: true, settingsTableId: true } }).execute();

// Create
const created = await db.i18NModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', schemaId: '<UUID>', settingsTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.i18NModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.i18NModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.identityProvidersModule`

CRUD operations for IdentityProvidersModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all identityProvidersModule records
const items = await db.identityProvidersModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.identityProvidersModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.identityProvidersModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.identityProvidersModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.identityProvidersModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.imageModule`

CRUD operations for ImageModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `imageGrantsTableId` | UUID | Yes |
| `imageGrantsTableName` | String | Yes |
| `imagesTableId` | UUID | Yes |
| `imagesTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `registriesTableId` | UUID | Yes |
| `registriesTableName` | String | Yes |
| `registryGrantsTableId` | UUID | Yes |
| `registryGrantsTableName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all imageModule records
const items = await db.imageModule.findMany({ select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, imageGrantsTableId: true, imageGrantsTableName: true, imagesTableId: true, imagesTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, registriesTableId: true, registriesTableName: true, registryGrantsTableId: true, registryGrantsTableName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.imageModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, imageGrantsTableId: true, imageGrantsTableName: true, imagesTableId: true, imagesTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, registriesTableId: true, registriesTableName: true, registryGrantsTableId: true, registryGrantsTableName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.imageModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', imageGrantsTableId: '<UUID>', imageGrantsTableName: '<String>', imagesTableId: '<UUID>', imagesTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', registriesTableId: '<UUID>', registriesTableName: '<String>', registryGrantsTableId: '<UUID>', registryGrantsTableName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.imageModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.imageModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.inferenceLogModule`

CRUD operations for InferenceLogModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `inferenceLogTableId` | UUID | Yes |
| `inferenceLogTableName` | String | Yes |
| `inferencePriceTableId` | UUID | Yes |
| `inferencePriceTableName` | String | Yes |
| `interval` | String | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `retention` | String | Yes |
| `rollupFunctionName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `usageSummaryTableId` | UUID | Yes |
| `usageSummaryTableName` | String | Yes |

**Operations:**

```typescript
// List all inferenceLogModule records
const items = await db.inferenceLogModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, id: true, inferenceLogTableId: true, inferenceLogTableName: true, inferencePriceTableId: true, inferencePriceTableName: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Get one by id
const item = await db.inferenceLogModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, id: true, inferenceLogTableId: true, inferenceLogTableName: true, inferencePriceTableId: true, inferencePriceTableName: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Create
const created = await db.inferenceLogModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', inferenceLogTableId: '<UUID>', inferenceLogTableName: '<String>', inferencePriceTableId: '<UUID>', inferencePriceTableName: '<String>', interval: '<String>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', retention: '<String>', rollupFunctionName: '<String>', schemaId: '<UUID>', scope: '<String>', usageSummaryTableId: '<UUID>', usageSummaryTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.inferenceLogModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.inferenceLogModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.infraConfigModule`

CRUD operations for InfraConfigModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `configTableId` | UUID | Yes |
| `configTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all infraConfigModule records
const items = await db.infraConfigModule.findMany({ select: { apiName: true, configTableId: true, configTableName: true, databaseId: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.infraConfigModule.findOne({ id: '<UUID>', select: { apiName: true, configTableId: true, configTableName: true, databaseId: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.infraConfigModule.create({ data: { apiName: '<String>', configTableId: '<UUID>', configTableName: '<String>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.infraConfigModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.infraConfigModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.infraSecretsModule`

CRUD operations for InfraSecretsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `secretsTableId` | UUID | Yes |
| `secretsTableName` | String | Yes |

**Operations:**

```typescript
// List all infraSecretsModule records
const items = await db.infraSecretsModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, secretsTableId: true, secretsTableName: true } }).execute();

// Get one by id
const item = await db.infraSecretsModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, secretsTableId: true, secretsTableName: true } }).execute();

// Create
const created = await db.infraSecretsModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', secretsTableId: '<UUID>', secretsTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.infraSecretsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.infraSecretsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.integrationProvidersModule`

CRUD operations for IntegrationProvidersModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all integrationProvidersModule records
const items = await db.integrationProvidersModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.integrationProvidersModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.integrationProvidersModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.integrationProvidersModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.integrationProvidersModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.internalConfigModule`

CRUD operations for InternalConfigModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `internalConfigTableId` | UUID | Yes |
| `internalConfigTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all internalConfigModule records
const items = await db.internalConfigModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, internalConfigTableId: true, internalConfigTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.internalConfigModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, internalConfigTableId: true, internalConfigTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.internalConfigModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', internalConfigTableId: '<UUID>', internalConfigTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.internalConfigModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.internalConfigModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.internalSecretsModule`

CRUD operations for InternalSecretsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `internalSecretsTableId` | UUID | Yes |
| `internalSecretsTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all internalSecretsModule records
const items = await db.internalSecretsModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, internalSecretsTableId: true, internalSecretsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.internalSecretsModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, entityTableId: true, id: true, internalSecretsTableId: true, internalSecretsTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.internalSecretsModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', internalSecretsTableId: '<UUID>', internalSecretsTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.internalSecretsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.internalSecretsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.invitesModule`

CRUD operations for InvitesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `claimedInvitesTableId` | UUID | Yes |
| `claimedInvitesTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `emailsTableId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `invitesTableId` | UUID | Yes |
| `invitesTableName` | String | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `submitInviteCodeFunction` | String | Yes |
| `usersTableId` | UUID | Yes |

**Operations:**

```typescript
// List all invitesModule records
const items = await db.invitesModule.findMany({ select: { apiName: true, claimedInvitesTableId: true, claimedInvitesTableName: true, databaseId: true, emailsTableId: true, entityField: true, entityTableId: true, id: true, invitesTableId: true, invitesTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, submitInviteCodeFunction: true, usersTableId: true } }).execute();

// Get one by id
const item = await db.invitesModule.findOne({ id: '<UUID>', select: { apiName: true, claimedInvitesTableId: true, claimedInvitesTableName: true, databaseId: true, emailsTableId: true, entityField: true, entityTableId: true, id: true, invitesTableId: true, invitesTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, submitInviteCodeFunction: true, usersTableId: true } }).execute();

// Create
const created = await db.invitesModule.create({ data: { apiName: '<String>', claimedInvitesTableId: '<UUID>', claimedInvitesTableName: '<String>', databaseId: '<UUID>', emailsTableId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', invitesTableId: '<UUID>', invitesTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', submitInviteCodeFunction: '<String>', usersTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.invitesModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.invitesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.k8sAdmissionModule`

CRUD operations for K8sAdmissionModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `k8sResourceKindsTableId` | UUID | Yes |
| `k8sSpecRulesTableId` | UUID | Yes |
| `merkleStoreModuleId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaId` | UUID | Yes |
| `publicSchemaName` | String | Yes |
| `scope` | String | Yes |
| `storeName` | String | Yes |

**Operations:**

```typescript
// List all k8sAdmissionModule records
const items = await db.k8sAdmissionModule.findMany({ select: { apiName: true, createdAt: true, databaseId: true, entityTableId: true, id: true, k8sResourceKindsTableId: true, k8sSpecRulesTableId: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true, storeName: true } }).execute();

// Get one by id
const item = await db.k8sAdmissionModule.findOne({ id: '<UUID>', select: { apiName: true, createdAt: true, databaseId: true, entityTableId: true, id: true, k8sResourceKindsTableId: true, k8sSpecRulesTableId: true, merkleStoreModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, scope: true, storeName: true } }).execute();

// Create
const created = await db.k8sAdmissionModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityTableId: '<UUID>', k8sResourceKindsTableId: '<UUID>', k8sSpecRulesTableId: '<UUID>', merkleStoreModuleId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaId: '<UUID>', publicSchemaName: '<String>', scope: '<String>', storeName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.k8sAdmissionModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.k8sAdmissionModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.limitsModule`

CRUD operations for LimitsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorTableId` | UUID | Yes |
| `aggregateTableId` | UUID | Yes |
| `apiName` | String | Yes |
| `capCheckTrigger` | String | Yes |
| `creditCodeItemsTableId` | UUID | Yes |
| `creditCodesTableId` | UUID | Yes |
| `creditRedemptionsTableId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultTableId` | UUID | Yes |
| `defaultTableName` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `eventsTableId` | UUID | Yes |
| `id` | UUID | No |
| `limitAggregateCheckSoftFunction` | String | Yes |
| `limitCapsDefaultsTableId` | UUID | Yes |
| `limitCapsTableId` | UUID | Yes |
| `limitCheckFunction` | String | Yes |
| `limitCheckSoftFunction` | String | Yes |
| `limitCreditsTableId` | UUID | Yes |
| `limitDecrementFunction` | String | Yes |
| `limitDecrementTrigger` | String | Yes |
| `limitDefaults` | JSON | Yes |
| `limitIncrementFunction` | String | Yes |
| `limitIncrementTrigger` | String | Yes |
| `limitUpdateTrigger` | String | Yes |
| `limitWarningStateTableId` | UUID | Yes |
| `limitWarningsTableId` | UUID | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `resolveCapFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all limitsModule records
const items = await db.limitsModule.findMany({ select: { actorTableId: true, aggregateTableId: true, apiName: true, capCheckTrigger: true, creditCodeItemsTableId: true, creditCodesTableId: true, creditRedemptionsTableId: true, databaseId: true, defaultTableId: true, defaultTableName: true, entityField: true, entityTableId: true, eventsTableId: true, id: true, limitAggregateCheckSoftFunction: true, limitCapsDefaultsTableId: true, limitCapsTableId: true, limitCheckFunction: true, limitCheckSoftFunction: true, limitCreditsTableId: true, limitDecrementFunction: true, limitDecrementTrigger: true, limitDefaults: true, limitIncrementFunction: true, limitIncrementTrigger: true, limitUpdateTrigger: true, limitWarningStateTableId: true, limitWarningsTableId: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, resolveCapFunction: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.limitsModule.findOne({ id: '<UUID>', select: { actorTableId: true, aggregateTableId: true, apiName: true, capCheckTrigger: true, creditCodeItemsTableId: true, creditCodesTableId: true, creditRedemptionsTableId: true, databaseId: true, defaultTableId: true, defaultTableName: true, entityField: true, entityTableId: true, eventsTableId: true, id: true, limitAggregateCheckSoftFunction: true, limitCapsDefaultsTableId: true, limitCapsTableId: true, limitCheckFunction: true, limitCheckSoftFunction: true, limitCreditsTableId: true, limitDecrementFunction: true, limitDecrementTrigger: true, limitDefaults: true, limitIncrementFunction: true, limitIncrementTrigger: true, limitUpdateTrigger: true, limitWarningStateTableId: true, limitWarningsTableId: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, resolveCapFunction: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.limitsModule.create({ data: { actorTableId: '<UUID>', aggregateTableId: '<UUID>', apiName: '<String>', capCheckTrigger: '<String>', creditCodeItemsTableId: '<UUID>', creditCodesTableId: '<UUID>', creditRedemptionsTableId: '<UUID>', databaseId: '<UUID>', defaultTableId: '<UUID>', defaultTableName: '<String>', entityField: '<String>', entityTableId: '<UUID>', eventsTableId: '<UUID>', limitAggregateCheckSoftFunction: '<String>', limitCapsDefaultsTableId: '<UUID>', limitCapsTableId: '<UUID>', limitCheckFunction: '<String>', limitCheckSoftFunction: '<String>', limitCreditsTableId: '<UUID>', limitDecrementFunction: '<String>', limitDecrementTrigger: '<String>', limitDefaults: '<JSON>', limitIncrementFunction: '<String>', limitIncrementTrigger: '<String>', limitUpdateTrigger: '<String>', limitWarningStateTableId: '<UUID>', limitWarningsTableId: '<UUID>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', resolveCapFunction: '<String>', schemaId: '<UUID>', scope: '<String>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.limitsModule.update({ where: { id: '<UUID>' }, data: { actorTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.limitsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.machineModule`

CRUD operations for MachineModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `machineMessagesTableId` | UUID | Yes |
| `machineMessagesTableName` | String | Yes |
| `machineSessionsTableId` | UUID | Yes |
| `machineSessionsTableName` | String | Yes |
| `machinesTableId` | UUID | Yes |
| `machinesTableName` | String | Yes |
| `partitionInterval` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `retention` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all machineModule records
const items = await db.machineModule.findMany({ select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, machineMessagesTableId: true, machineMessagesTableName: true, machineSessionsTableId: true, machineSessionsTableName: true, machinesTableId: true, machinesTableName: true, partitionInterval: true, policies: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, retention: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.machineModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, machineMessagesTableId: true, machineMessagesTableName: true, machineSessionsTableId: true, machineSessionsTableName: true, machinesTableId: true, machinesTableName: true, partitionInterval: true, policies: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, retention: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.machineModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', machineMessagesTableId: '<UUID>', machineMessagesTableName: '<String>', machineSessionsTableId: '<UUID>', machineSessionsTableName: '<String>', machinesTableId: '<UUID>', machinesTableName: '<String>', partitionInterval: '<String>', policies: '<JSON>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', retention: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.machineModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.machineModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.membershipTypesModule`

CRUD operations for MembershipTypesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all membershipTypesModule records
const items = await db.membershipTypesModule.findMany({ select: { databaseId: true, id: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.membershipTypesModule.findOne({ id: '<UUID>', select: { databaseId: true, id: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.membershipTypesModule.create({ data: { databaseId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.membershipTypesModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.membershipTypesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.membershipsModule`

CRUD operations for MembershipsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorMaskCheck` | String | Yes |
| `actorPermCheck` | String | Yes |
| `actorTableId` | UUID | Yes |
| `adminGrantsTableId` | UUID | Yes |
| `adminGrantsTableName` | String | Yes |
| `apiName` | String | Yes |
| `capabilitiesTableId` | UUID | Yes |
| `capabilityDefaultCapabilitiesTableId` | UUID | Yes |
| `capabilityDefaultGrantsTableId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilitiesTableId` | UUID | Yes |
| `defaultLimitsTableId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityIdsByMask` | String | Yes |
| `entityIdsByPerm` | String | Yes |
| `entityIdsFunction` | String | Yes |
| `entityTableId` | UUID | Yes |
| `entityTableOwnerId` | UUID | Yes |
| `getOrgFn` | String | Yes |
| `grantsTableId` | UUID | Yes |
| `grantsTableName` | String | Yes |
| `id` | UUID | No |
| `limitsTableId` | UUID | Yes |
| `memberProfilesTableId` | UUID | Yes |
| `membersTableId` | UUID | Yes |
| `membersTableName` | String | Yes |
| `membershipDefaultsTableId` | UUID | Yes |
| `membershipDefaultsTableName` | String | Yes |
| `membershipSettingsTableId` | UUID | Yes |
| `membershipSettingsTableName` | String | Yes |
| `membershipsTableId` | UUID | Yes |
| `membershipsTableName` | String | Yes |
| `ownerGrantsTableId` | UUID | Yes |
| `ownerGrantsTableName` | String | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `sprtTableId` | UUID | Yes |

**Operations:**

```typescript
// List all membershipsModule records
const items = await db.membershipsModule.findMany({ select: { actorMaskCheck: true, actorPermCheck: true, actorTableId: true, adminGrantsTableId: true, adminGrantsTableName: true, apiName: true, capabilitiesTableId: true, capabilityDefaultCapabilitiesTableId: true, capabilityDefaultGrantsTableId: true, databaseId: true, defaultCapabilitiesTableId: true, defaultLimitsTableId: true, entityField: true, entityIdsByMask: true, entityIdsByPerm: true, entityIdsFunction: true, entityTableId: true, entityTableOwnerId: true, getOrgFn: true, grantsTableId: true, grantsTableName: true, id: true, limitsTableId: true, memberProfilesTableId: true, membersTableId: true, membersTableName: true, membershipDefaultsTableId: true, membershipDefaultsTableName: true, membershipSettingsTableId: true, membershipSettingsTableName: true, membershipsTableId: true, membershipsTableName: true, ownerGrantsTableId: true, ownerGrantsTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, sprtTableId: true } }).execute();

// Get one by id
const item = await db.membershipsModule.findOne({ id: '<UUID>', select: { actorMaskCheck: true, actorPermCheck: true, actorTableId: true, adminGrantsTableId: true, adminGrantsTableName: true, apiName: true, capabilitiesTableId: true, capabilityDefaultCapabilitiesTableId: true, capabilityDefaultGrantsTableId: true, databaseId: true, defaultCapabilitiesTableId: true, defaultLimitsTableId: true, entityField: true, entityIdsByMask: true, entityIdsByPerm: true, entityIdsFunction: true, entityTableId: true, entityTableOwnerId: true, getOrgFn: true, grantsTableId: true, grantsTableName: true, id: true, limitsTableId: true, memberProfilesTableId: true, membersTableId: true, membersTableName: true, membershipDefaultsTableId: true, membershipDefaultsTableName: true, membershipSettingsTableId: true, membershipSettingsTableName: true, membershipsTableId: true, membershipsTableName: true, ownerGrantsTableId: true, ownerGrantsTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true, scope: true, sprtTableId: true } }).execute();

// Create
const created = await db.membershipsModule.create({ data: { actorMaskCheck: '<String>', actorPermCheck: '<String>', actorTableId: '<UUID>', adminGrantsTableId: '<UUID>', adminGrantsTableName: '<String>', apiName: '<String>', capabilitiesTableId: '<UUID>', capabilityDefaultCapabilitiesTableId: '<UUID>', capabilityDefaultGrantsTableId: '<UUID>', databaseId: '<UUID>', defaultCapabilitiesTableId: '<UUID>', defaultLimitsTableId: '<UUID>', entityField: '<String>', entityIdsByMask: '<String>', entityIdsByPerm: '<String>', entityIdsFunction: '<String>', entityTableId: '<UUID>', entityTableOwnerId: '<UUID>', getOrgFn: '<String>', grantsTableId: '<UUID>', grantsTableName: '<String>', limitsTableId: '<UUID>', memberProfilesTableId: '<UUID>', membersTableId: '<UUID>', membersTableName: '<String>', membershipDefaultsTableId: '<UUID>', membershipDefaultsTableName: '<String>', membershipSettingsTableId: '<UUID>', membershipSettingsTableName: '<String>', membershipsTableId: '<UUID>', membershipsTableName: '<String>', ownerGrantsTableId: '<UUID>', ownerGrantsTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', sprtTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.membershipsModule.update({ where: { id: '<UUID>' }, data: { actorMaskCheck: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.membershipsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.merkleStoreModule`

CRUD operations for MerkleStoreModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `capabilityKey` | String | Yes |
| `commitTableId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `functionPrefix` | String | Yes |
| `id` | UUID | No |
| `objectTableId` | UUID | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `refTableId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `storeTableId` | UUID | Yes |

**Operations:**

```typescript
// List all merkleStoreModule records
const items = await db.merkleStoreModule.findMany({ select: { apiName: true, capabilityKey: true, commitTableId: true, createdAt: true, databaseId: true, entityField: true, entityTableId: true, functionPrefix: true, id: true, objectTableId: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, refTableId: true, schemaId: true, scope: true, storeTableId: true } }).execute();

// Get one by id
const item = await db.merkleStoreModule.findOne({ id: '<UUID>', select: { apiName: true, capabilityKey: true, commitTableId: true, createdAt: true, databaseId: true, entityField: true, entityTableId: true, functionPrefix: true, id: true, objectTableId: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, refTableId: true, schemaId: true, scope: true, storeTableId: true } }).execute();

// Create
const created = await db.merkleStoreModule.create({ data: { apiName: '<String>', capabilityKey: '<String>', commitTableId: '<UUID>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', functionPrefix: '<String>', objectTableId: '<UUID>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', refTableId: '<UUID>', schemaId: '<UUID>', scope: '<String>', storeTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.merkleStoreModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.merkleStoreModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.namespaceModule`

CRUD operations for NamespaceModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `namespaceEventsTableId` | UUID | Yes |
| `namespaceEventsTableName` | String | Yes |
| `namespacesTableId` | UUID | Yes |
| `namespacesTableName` | String | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all namespaceModule records
const items = await db.namespaceModule.findMany({ select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, namespaceEventsTableId: true, namespaceEventsTableName: true, namespacesTableId: true, namespacesTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.namespaceModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, namespaceEventsTableId: true, namespaceEventsTableName: true, namespacesTableId: true, namespacesTableName: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.namespaceModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', namespaceEventsTableId: '<UUID>', namespaceEventsTableName: '<String>', namespacesTableId: '<UUID>', namespacesTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.namespaceModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.namespaceModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.notificationsModule`

CRUD operations for NotificationsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `channelsTableId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `deliveryLogTableId` | UUID | Yes |
| `entityField` | String | Yes |
| `hasChannels` | Boolean | Yes |
| `hasDigestMetadata` | Boolean | Yes |
| `hasPreferences` | Boolean | Yes |
| `hasSettingsExtension` | Boolean | Yes |
| `hasSubscriptions` | Boolean | Yes |
| `id` | UUID | No |
| `notificationsTableId` | UUID | Yes |
| `organizationSettingsTableId` | UUID | Yes |
| `ownerTableId` | UUID | Yes |
| `preferencesTableId` | UUID | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `readStateTableId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `suppressionsTableId` | UUID | Yes |
| `userSettingsTableId` | UUID | Yes |

**Operations:**

```typescript
// List all notificationsModule records
const items = await db.notificationsModule.findMany({ select: { apiName: true, channelsTableId: true, databaseId: true, defaultCapabilities: true, deliveryLogTableId: true, entityField: true, hasChannels: true, hasDigestMetadata: true, hasPreferences: true, hasSettingsExtension: true, hasSubscriptions: true, id: true, notificationsTableId: true, organizationSettingsTableId: true, ownerTableId: true, preferencesTableId: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, readStateTableId: true, schemaId: true, suppressionsTableId: true, userSettingsTableId: true } }).execute();

// Get one by id
const item = await db.notificationsModule.findOne({ id: '<UUID>', select: { apiName: true, channelsTableId: true, databaseId: true, defaultCapabilities: true, deliveryLogTableId: true, entityField: true, hasChannels: true, hasDigestMetadata: true, hasPreferences: true, hasSettingsExtension: true, hasSubscriptions: true, id: true, notificationsTableId: true, organizationSettingsTableId: true, ownerTableId: true, preferencesTableId: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, readStateTableId: true, schemaId: true, suppressionsTableId: true, userSettingsTableId: true } }).execute();

// Create
const created = await db.notificationsModule.create({ data: { apiName: '<String>', channelsTableId: '<UUID>', databaseId: '<UUID>', defaultCapabilities: '<String>', deliveryLogTableId: '<UUID>', entityField: '<String>', hasChannels: '<Boolean>', hasDigestMetadata: '<Boolean>', hasPreferences: '<Boolean>', hasSettingsExtension: '<Boolean>', hasSubscriptions: '<Boolean>', notificationsTableId: '<UUID>', organizationSettingsTableId: '<UUID>', ownerTableId: '<UUID>', preferencesTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', readStateTableId: '<UUID>', schemaId: '<UUID>', suppressionsTableId: '<UUID>', userSettingsTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.notificationsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.notificationsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.oauthRequestsModule`

CRUD operations for OauthRequestsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `oauthAuthorizationRequestsTableId` | UUID | Yes |
| `oauthAuthorizationRequestsTableName` | String | Yes |
| `pendingIdentityLinksTableId` | UUID | Yes |
| `pendingIdentityLinksTableName` | String | Yes |
| `prefix` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all oauthRequestsModule records
const items = await db.oauthRequestsModule.findMany({ select: { databaseId: true, entityField: true, entityTableId: true, id: true, oauthAuthorizationRequestsTableId: true, oauthAuthorizationRequestsTableName: true, pendingIdentityLinksTableId: true, pendingIdentityLinksTableName: true, prefix: true, privateSchemaId: true, privateSchemaName: true, scope: true } }).execute();

// Get one by id
const item = await db.oauthRequestsModule.findOne({ id: '<UUID>', select: { databaseId: true, entityField: true, entityTableId: true, id: true, oauthAuthorizationRequestsTableId: true, oauthAuthorizationRequestsTableName: true, pendingIdentityLinksTableId: true, pendingIdentityLinksTableName: true, prefix: true, privateSchemaId: true, privateSchemaName: true, scope: true } }).execute();

// Create
const created = await db.oauthRequestsModule.create({ data: { databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', oauthAuthorizationRequestsTableId: '<UUID>', oauthAuthorizationRequestsTableName: '<String>', pendingIdentityLinksTableId: '<UUID>', pendingIdentityLinksTableName: '<String>', prefix: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.oauthRequestsModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.oauthRequestsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.pagesModule`

CRUD operations for PagesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `merkleStoreModuleId` | UUID | Yes |
| `pagesTableId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `previewCommitFunctionName` | String | Yes |
| `previewSetFunctionName` | String | Yes |
| `previewTokenMintFunctionName` | String | Yes |
| `previewTokenVerifierFunctionName` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaId` | UUID | Yes |
| `publicSchemaName` | String | Yes |
| `releaseManifestFunctionName` | String | Yes |
| `scope` | String | Yes |
| `siteSurfaceModuleId` | UUID | Yes |
| `sitesTableId` | UUID | Yes |
| `storeNamePrefix` | String | Yes |

**Operations:**

```typescript
// List all pagesModule records
const items = await db.pagesModule.findMany({ select: { apiName: true, createdAt: true, databaseId: true, entityTableId: true, id: true, merkleStoreModuleId: true, pagesTableId: true, policies: true, prefix: true, previewCommitFunctionName: true, previewSetFunctionName: true, previewTokenMintFunctionName: true, previewTokenVerifierFunctionName: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, releaseManifestFunctionName: true, scope: true, siteSurfaceModuleId: true, sitesTableId: true, storeNamePrefix: true } }).execute();

// Get one by id
const item = await db.pagesModule.findOne({ id: '<UUID>', select: { apiName: true, createdAt: true, databaseId: true, entityTableId: true, id: true, merkleStoreModuleId: true, pagesTableId: true, policies: true, prefix: true, previewCommitFunctionName: true, previewSetFunctionName: true, previewTokenMintFunctionName: true, previewTokenVerifierFunctionName: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaId: true, publicSchemaName: true, releaseManifestFunctionName: true, scope: true, siteSurfaceModuleId: true, sitesTableId: true, storeNamePrefix: true } }).execute();

// Create
const created = await db.pagesModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityTableId: '<UUID>', merkleStoreModuleId: '<UUID>', pagesTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', previewCommitFunctionName: '<String>', previewSetFunctionName: '<String>', previewTokenMintFunctionName: '<String>', previewTokenVerifierFunctionName: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaId: '<UUID>', publicSchemaName: '<String>', releaseManifestFunctionName: '<String>', scope: '<String>', siteSurfaceModuleId: '<UUID>', sitesTableId: '<UUID>', storeNamePrefix: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.pagesModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.pagesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.phoneNumbersModule`

CRUD operations for PhoneNumbersModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ownerTableId` | UUID | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all phoneNumbersModule records
const items = await db.phoneNumbersModule.findMany({ select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.phoneNumbersModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.phoneNumbersModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', ownerTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.phoneNumbersModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.phoneNumbersModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.plansModule`

CRUD operations for PlansModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `applyBillingPlanFunction` | String | Yes |
| `applyPlanAggregateFunction` | String | Yes |
| `applyPlanCapsFunction` | String | Yes |
| `applyPlanFunction` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `planCapsTableId` | UUID | Yes |
| `planLimitsTableId` | UUID | Yes |
| `planLimitsTableName` | String | Yes |
| `planMeterLimitsTableId` | UUID | Yes |
| `planPricingTableId` | UUID | Yes |
| `plansTableId` | UUID | Yes |
| `plansTableName` | String | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |

**Operations:**

```typescript
// List all plansModule records
const items = await db.plansModule.findMany({ select: { apiName: true, applyBillingPlanFunction: true, applyPlanAggregateFunction: true, applyPlanCapsFunction: true, applyPlanFunction: true, databaseId: true, id: true, planCapsTableId: true, planLimitsTableId: true, planLimitsTableName: true, planMeterLimitsTableId: true, planPricingTableId: true, plansTableId: true, plansTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true } }).execute();

// Get one by id
const item = await db.plansModule.findOne({ id: '<UUID>', select: { apiName: true, applyBillingPlanFunction: true, applyPlanAggregateFunction: true, applyPlanCapsFunction: true, applyPlanFunction: true, databaseId: true, id: true, planCapsTableId: true, planLimitsTableId: true, planLimitsTableName: true, planMeterLimitsTableId: true, planPricingTableId: true, plansTableId: true, plansTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, schemaId: true } }).execute();

// Create
const created = await db.plansModule.create({ data: { apiName: '<String>', applyBillingPlanFunction: '<String>', applyPlanAggregateFunction: '<String>', applyPlanCapsFunction: '<String>', applyPlanFunction: '<String>', databaseId: '<UUID>', planCapsTableId: '<UUID>', planLimitsTableId: '<UUID>', planLimitsTableName: '<String>', planMeterLimitsTableId: '<UUID>', planPricingTableId: '<UUID>', plansTableId: '<UUID>', plansTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.plansModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.plansModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.principalAuthModule`

CRUD operations for PrincipalAuthModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `auditsTableId` | UUID | Yes |
| `createOrgApiKeyFunction` | String | Yes |
| `createOrgPrincipalFunction` | String | Yes |
| `createPrincipalFunction` | String | Yes |
| `databaseId` | UUID | Yes |
| `deleteOrgPrincipalFunction` | String | Yes |
| `deletePrincipalFunction` | String | Yes |
| `id` | UUID | No |
| `principalEntitiesTableId` | UUID | Yes |
| `principalScopeOverridesTableId` | UUID | Yes |
| `principalsTableId` | UUID | Yes |
| `principalsTableName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `revokeOrgApiKeyFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `sessionCredentialsTableId` | UUID | Yes |
| `sessionsTableId` | UUID | Yes |
| `sweepExpiredPrincipalsFunction` | String | Yes |
| `usersTableId` | UUID | Yes |

**Operations:**

```typescript
// List all principalAuthModule records
const items = await db.principalAuthModule.findMany({ select: { apiName: true, auditsTableId: true, createOrgApiKeyFunction: true, createOrgPrincipalFunction: true, createPrincipalFunction: true, databaseId: true, deleteOrgPrincipalFunction: true, deletePrincipalFunction: true, id: true, principalEntitiesTableId: true, principalScopeOverridesTableId: true, principalsTableId: true, principalsTableName: true, privateSchemaId: true, revokeOrgApiKeyFunction: true, schemaId: true, sessionCredentialsTableId: true, sessionsTableId: true, sweepExpiredPrincipalsFunction: true, usersTableId: true } }).execute();

// Get one by id
const item = await db.principalAuthModule.findOne({ id: '<UUID>', select: { apiName: true, auditsTableId: true, createOrgApiKeyFunction: true, createOrgPrincipalFunction: true, createPrincipalFunction: true, databaseId: true, deleteOrgPrincipalFunction: true, deletePrincipalFunction: true, id: true, principalEntitiesTableId: true, principalScopeOverridesTableId: true, principalsTableId: true, principalsTableName: true, privateSchemaId: true, revokeOrgApiKeyFunction: true, schemaId: true, sessionCredentialsTableId: true, sessionsTableId: true, sweepExpiredPrincipalsFunction: true, usersTableId: true } }).execute();

// Create
const created = await db.principalAuthModule.create({ data: { apiName: '<String>', auditsTableId: '<UUID>', createOrgApiKeyFunction: '<String>', createOrgPrincipalFunction: '<String>', createPrincipalFunction: '<String>', databaseId: '<UUID>', deleteOrgPrincipalFunction: '<String>', deletePrincipalFunction: '<String>', principalEntitiesTableId: '<UUID>', principalScopeOverridesTableId: '<UUID>', principalsTableId: '<UUID>', principalsTableName: '<String>', privateSchemaId: '<UUID>', revokeOrgApiKeyFunction: '<String>', schemaId: '<UUID>', sessionCredentialsTableId: '<UUID>', sessionsTableId: '<UUID>', sweepExpiredPrincipalsFunction: '<String>', usersTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.principalAuthModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.principalAuthModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.profilesModule`

CRUD operations for ProfilesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorTableId` | UUID | Yes |
| `apiName` | String | Yes |
| `capabilitiesTableId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `membershipProfilesTableId` | UUID | Yes |
| `membershipProfilesTableName` | String | Yes |
| `membershipsTableId` | UUID | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `profileCapabilitiesTableId` | UUID | Yes |
| `profileCapabilitiesTableName` | String | Yes |
| `profileDefinitionGrantsTableId` | UUID | Yes |
| `profileDefinitionGrantsTableName` | String | Yes |
| `profileGrantsTableId` | UUID | Yes |
| `profileGrantsTableName` | String | Yes |
| `profileTemplatesTableId` | UUID | Yes |
| `profileTemplatesTableName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all profilesModule records
const items = await db.profilesModule.findMany({ select: { actorTableId: true, apiName: true, capabilitiesTableId: true, databaseId: true, entityField: true, entityTableId: true, id: true, membershipProfilesTableId: true, membershipProfilesTableName: true, membershipsTableId: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, profileCapabilitiesTableId: true, profileCapabilitiesTableName: true, profileDefinitionGrantsTableId: true, profileDefinitionGrantsTableName: true, profileGrantsTableId: true, profileGrantsTableName: true, profileTemplatesTableId: true, profileTemplatesTableName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.profilesModule.findOne({ id: '<UUID>', select: { actorTableId: true, apiName: true, capabilitiesTableId: true, databaseId: true, entityField: true, entityTableId: true, id: true, membershipProfilesTableId: true, membershipProfilesTableName: true, membershipsTableId: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, profileCapabilitiesTableId: true, profileCapabilitiesTableName: true, profileDefinitionGrantsTableId: true, profileDefinitionGrantsTableName: true, profileGrantsTableId: true, profileGrantsTableName: true, profileTemplatesTableId: true, profileTemplatesTableName: true, publicSchemaName: true, schemaId: true, scope: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.profilesModule.create({ data: { actorTableId: '<UUID>', apiName: '<String>', capabilitiesTableId: '<UUID>', databaseId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', membershipProfilesTableId: '<UUID>', membershipProfilesTableName: '<String>', membershipsTableId: '<UUID>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', profileCapabilitiesTableId: '<UUID>', profileCapabilitiesTableName: '<String>', profileDefinitionGrantsTableId: '<UUID>', profileDefinitionGrantsTableName: '<String>', profileGrantsTableId: '<UUID>', profileGrantsTableName: '<String>', profileTemplatesTableId: '<UUID>', profileTemplatesTableName: '<String>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.profilesModule.update({ where: { id: '<UUID>' }, data: { actorTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.profilesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.rateLimitMetersModule`

CRUD operations for RateLimitMetersModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `checkRateLimitFunction` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `id` | UUID | No |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `rateLimitOverridesTableId` | UUID | Yes |
| `rateLimitOverridesTableName` | String | Yes |
| `rateLimitStateTableId` | UUID | Yes |
| `rateLimitStateTableName` | String | Yes |
| `rateWindowLimitsTableId` | UUID | Yes |
| `rateWindowLimitsTableName` | String | Yes |
| `schemaId` | UUID | Yes |

**Operations:**

```typescript
// List all rateLimitMetersModule records
const items = await db.rateLimitMetersModule.findMany({ select: { apiName: true, checkRateLimitFunction: true, databaseId: true, defaultCapabilities: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, rateLimitOverridesTableId: true, rateLimitOverridesTableName: true, rateLimitStateTableId: true, rateLimitStateTableName: true, rateWindowLimitsTableId: true, rateWindowLimitsTableName: true, schemaId: true } }).execute();

// Get one by id
const item = await db.rateLimitMetersModule.findOne({ id: '<UUID>', select: { apiName: true, checkRateLimitFunction: true, databaseId: true, defaultCapabilities: true, id: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, rateLimitOverridesTableId: true, rateLimitOverridesTableName: true, rateLimitStateTableId: true, rateLimitStateTableName: true, rateWindowLimitsTableId: true, rateWindowLimitsTableName: true, schemaId: true } }).execute();

// Create
const created = await db.rateLimitMetersModule.create({ data: { apiName: '<String>', checkRateLimitFunction: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', rateLimitOverridesTableId: '<UUID>', rateLimitOverridesTableName: '<String>', rateLimitStateTableId: '<UUID>', rateLimitStateTableName: '<String>', rateWindowLimitsTableId: '<UUID>', rateWindowLimitsTableName: '<String>', schemaId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.rateLimitMetersModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.rateLimitMetersModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.rateLimitsModule`

CRUD operations for RateLimitsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ipRateLimitsTableId` | UUID | Yes |
| `ipRateLimitsTableName` | String | Yes |
| `rateLimitSettingsTableId` | UUID | Yes |
| `rateLimitSettingsTableName` | String | Yes |
| `rateLimitsTableId` | UUID | Yes |
| `rateLimitsTableName` | String | Yes |
| `schemaId` | UUID | Yes |

**Operations:**

```typescript
// List all rateLimitsModule records
const items = await db.rateLimitsModule.findMany({ select: { databaseId: true, id: true, ipRateLimitsTableId: true, ipRateLimitsTableName: true, rateLimitSettingsTableId: true, rateLimitSettingsTableName: true, rateLimitsTableId: true, rateLimitsTableName: true, schemaId: true } }).execute();

// Get one by id
const item = await db.rateLimitsModule.findOne({ id: '<UUID>', select: { databaseId: true, id: true, ipRateLimitsTableId: true, ipRateLimitsTableName: true, rateLimitSettingsTableId: true, rateLimitSettingsTableName: true, rateLimitsTableId: true, rateLimitsTableName: true, schemaId: true } }).execute();

// Create
const created = await db.rateLimitsModule.create({ data: { databaseId: '<UUID>', ipRateLimitsTableId: '<UUID>', ipRateLimitsTableName: '<String>', rateLimitSettingsTableId: '<UUID>', rateLimitSettingsTableName: '<String>', rateLimitsTableId: '<UUID>', rateLimitsTableName: '<String>', schemaId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.rateLimitsModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.rateLimitsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.realtimeModule`

CRUD operations for RealtimeModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `changeLogTableId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `interval` | String | Yes |
| `listenerNodeTableId` | UUID | Yes |
| `notifyChannel` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `retentionHours` | Int | Yes |
| `schemaId` | UUID | Yes |
| `sourceRegistryTableId` | UUID | Yes |
| `subscriptionsSchemaId` | UUID | Yes |

**Operations:**

```typescript
// List all realtimeModule records
const items = await db.realtimeModule.findMany({ select: { apiName: true, changeLogTableId: true, databaseId: true, id: true, interval: true, listenerNodeTableId: true, notifyChannel: true, premake: true, privateApiName: true, privateSchemaId: true, retentionHours: true, schemaId: true, sourceRegistryTableId: true, subscriptionsSchemaId: true } }).execute();

// Get one by id
const item = await db.realtimeModule.findOne({ id: '<UUID>', select: { apiName: true, changeLogTableId: true, databaseId: true, id: true, interval: true, listenerNodeTableId: true, notifyChannel: true, premake: true, privateApiName: true, privateSchemaId: true, retentionHours: true, schemaId: true, sourceRegistryTableId: true, subscriptionsSchemaId: true } }).execute();

// Create
const created = await db.realtimeModule.create({ data: { apiName: '<String>', changeLogTableId: '<UUID>', databaseId: '<UUID>', interval: '<String>', listenerNodeTableId: '<UUID>', notifyChannel: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', retentionHours: '<Int>', schemaId: '<UUID>', sourceRegistryTableId: '<UUID>', subscriptionsSchemaId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.realtimeModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.realtimeModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.refusalLogModule`

CRUD operations for RefusalLogModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `logInterval` | String | Yes |
| `logPremake` | Int | Yes |
| `logRetention` | String | Yes |
| `logTableId` | UUID | Yes |
| `logTableName` | String | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `recordRefusalsFunction` | String | Yes |
| `rollupRefusalUsageSummaryFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `summaryInterval` | String | Yes |
| `summaryPremake` | Int | Yes |
| `summaryRetention` | String | Yes |
| `summaryTableId` | UUID | Yes |
| `summaryTableName` | String | Yes |

**Operations:**

```typescript
// List all refusalLogModule records
const items = await db.refusalLogModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, id: true, logInterval: true, logPremake: true, logRetention: true, logTableId: true, logTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, recordRefusalsFunction: true, rollupRefusalUsageSummaryFunction: true, schemaId: true, scope: true, summaryInterval: true, summaryPremake: true, summaryRetention: true, summaryTableId: true, summaryTableName: true } }).execute();

// Get one by id
const item = await db.refusalLogModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, id: true, logInterval: true, logPremake: true, logRetention: true, logTableId: true, logTableName: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, recordRefusalsFunction: true, rollupRefusalUsageSummaryFunction: true, schemaId: true, scope: true, summaryInterval: true, summaryPremake: true, summaryRetention: true, summaryTableId: true, summaryTableName: true } }).execute();

// Create
const created = await db.refusalLogModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', logInterval: '<String>', logPremake: '<Int>', logRetention: '<String>', logTableId: '<UUID>', logTableName: '<String>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', recordRefusalsFunction: '<String>', rollupRefusalUsageSummaryFunction: '<String>', schemaId: '<UUID>', scope: '<String>', summaryInterval: '<String>', summaryPremake: '<Int>', summaryRetention: '<String>', summaryTableId: '<UUID>', summaryTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.refusalLogModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.refusalLogModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.relationProvision`

CRUD operations for RelationProvision records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiRequired` | Boolean | Yes |
| `createIndex` | Boolean | Yes |
| `databaseId` | UUID | Yes |
| `deleteAction` | String | Yes |
| `exposeInApi` | Boolean | Yes |
| `fieldName` | String | Yes |
| `grants` | JSON | Yes |
| `id` | UUID | No |
| `isRequired` | Boolean | Yes |
| `junctionSchemaId` | UUID | Yes |
| `junctionTableId` | UUID | Yes |
| `junctionTableName` | String | Yes |
| `nodes` | JSON | Yes |
| `outFieldId` | UUID | Yes |
| `outJunctionTableId` | UUID | Yes |
| `outSourceFieldId` | UUID | Yes |
| `outTargetFieldId` | UUID | Yes |
| `policies` | JSON | Yes |
| `relationType` | String | Yes |
| `sourceFieldName` | String | Yes |
| `sourceTableId` | UUID | Yes |
| `targetFieldName` | String | Yes |
| `targetTableId` | UUID | Yes |
| `useCompositeKey` | Boolean | Yes |

**Operations:**

```typescript
// List all relationProvision records
const items = await db.relationProvision.findMany({ select: { apiRequired: true, createIndex: true, databaseId: true, deleteAction: true, exposeInApi: true, fieldName: true, grants: true, id: true, isRequired: true, junctionSchemaId: true, junctionTableId: true, junctionTableName: true, nodes: true, outFieldId: true, outJunctionTableId: true, outSourceFieldId: true, outTargetFieldId: true, policies: true, relationType: true, sourceFieldName: true, sourceTableId: true, targetFieldName: true, targetTableId: true, useCompositeKey: true } }).execute();

// Get one by id
const item = await db.relationProvision.findOne({ id: '<UUID>', select: { apiRequired: true, createIndex: true, databaseId: true, deleteAction: true, exposeInApi: true, fieldName: true, grants: true, id: true, isRequired: true, junctionSchemaId: true, junctionTableId: true, junctionTableName: true, nodes: true, outFieldId: true, outJunctionTableId: true, outSourceFieldId: true, outTargetFieldId: true, policies: true, relationType: true, sourceFieldName: true, sourceTableId: true, targetFieldName: true, targetTableId: true, useCompositeKey: true } }).execute();

// Create
const created = await db.relationProvision.create({ data: { apiRequired: '<Boolean>', createIndex: '<Boolean>', databaseId: '<UUID>', deleteAction: '<String>', exposeInApi: '<Boolean>', fieldName: '<String>', grants: '<JSON>', isRequired: '<Boolean>', junctionSchemaId: '<UUID>', junctionTableId: '<UUID>', junctionTableName: '<String>', nodes: '<JSON>', outFieldId: '<UUID>', outJunctionTableId: '<UUID>', outSourceFieldId: '<UUID>', outTargetFieldId: '<UUID>', policies: '<JSON>', relationType: '<String>', sourceFieldName: '<String>', sourceTableId: '<UUID>', targetFieldName: '<String>', targetTableId: '<UUID>', useCompositeKey: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.relationProvision.update({ where: { id: '<UUID>' }, data: { apiRequired: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.relationProvision.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.repositoryModule`

CRUD operations for RepositoryModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `buildStepsTableId` | UUID | Yes |
| `buildStepsTableName` | String | Yes |
| `buildsTableId` | UUID | Yes |
| `buildsTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `hasAttachments` | Boolean | Yes |
| `hasBuilds` | Boolean | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `proposalCommentsTableId` | UUID | Yes |
| `proposalCommentsTableName` | String | Yes |
| `proposalFileViewsTableId` | UUID | Yes |
| `proposalFileViewsTableName` | String | Yes |
| `proposalReactionsTableId` | UUID | Yes |
| `proposalReactionsTableName` | String | Yes |
| `proposalReviewsTableId` | UUID | Yes |
| `proposalReviewsTableName` | String | Yes |
| `proposalsTableId` | UUID | Yes |
| `proposalsTableName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `repositoriesTableId` | UUID | Yes |
| `repositoriesTableName` | String | Yes |
| `repositoryEventsTableId` | UUID | Yes |
| `repositoryEventsTableName` | String | Yes |
| `repositoryRequiredChecksTableId` | UUID | Yes |
| `repositoryRequiredChecksTableName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `search` | JSON | Yes |
| `workflowsTableId` | UUID | Yes |
| `workflowsTableName` | String | Yes |

**Operations:**

```typescript
// List all repositoryModule records
const items = await db.repositoryModule.findMany({ select: { apiName: true, buildStepsTableId: true, buildStepsTableName: true, buildsTableId: true, buildsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, hasAttachments: true, hasBuilds: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, proposalCommentsTableId: true, proposalCommentsTableName: true, proposalFileViewsTableId: true, proposalFileViewsTableName: true, proposalReactionsTableId: true, proposalReactionsTableName: true, proposalReviewsTableId: true, proposalReviewsTableName: true, proposalsTableId: true, proposalsTableName: true, provisions: true, publicSchemaName: true, repositoriesTableId: true, repositoriesTableName: true, repositoryEventsTableId: true, repositoryEventsTableName: true, repositoryRequiredChecksTableId: true, repositoryRequiredChecksTableName: true, schemaId: true, scope: true, search: true, workflowsTableId: true, workflowsTableName: true } }).execute();

// Get one by id
const item = await db.repositoryModule.findOne({ id: '<UUID>', select: { apiName: true, buildStepsTableId: true, buildStepsTableName: true, buildsTableId: true, buildsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, hasAttachments: true, hasBuilds: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, proposalCommentsTableId: true, proposalCommentsTableName: true, proposalFileViewsTableId: true, proposalFileViewsTableName: true, proposalReactionsTableId: true, proposalReactionsTableName: true, proposalReviewsTableId: true, proposalReviewsTableName: true, proposalsTableId: true, proposalsTableName: true, provisions: true, publicSchemaName: true, repositoriesTableId: true, repositoriesTableName: true, repositoryEventsTableId: true, repositoryEventsTableName: true, repositoryRequiredChecksTableId: true, repositoryRequiredChecksTableName: true, schemaId: true, scope: true, search: true, workflowsTableId: true, workflowsTableName: true } }).execute();

// Create
const created = await db.repositoryModule.create({ data: { apiName: '<String>', buildStepsTableId: '<UUID>', buildStepsTableName: '<String>', buildsTableId: '<UUID>', buildsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', hasAttachments: '<Boolean>', hasBuilds: '<Boolean>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', proposalCommentsTableId: '<UUID>', proposalCommentsTableName: '<String>', proposalFileViewsTableId: '<UUID>', proposalFileViewsTableName: '<String>', proposalReactionsTableId: '<UUID>', proposalReactionsTableName: '<String>', proposalReviewsTableId: '<UUID>', proposalReviewsTableName: '<String>', proposalsTableId: '<UUID>', proposalsTableName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', repositoriesTableId: '<UUID>', repositoriesTableName: '<String>', repositoryEventsTableId: '<UUID>', repositoryEventsTableName: '<String>', repositoryRequiredChecksTableId: '<UUID>', repositoryRequiredChecksTableName: '<String>', schemaId: '<UUID>', scope: '<String>', search: '<JSON>', workflowsTableId: '<UUID>', workflowsTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.repositoryModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.repositoryModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.resourceModule`

CRUD operations for ResourceModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `builderBindingsTableId` | UUID | Yes |
| `builderBindingsTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `installationStoreName` | String | Yes |
| `merkleStoreModuleId` | UUID | Yes |
| `namespaceModuleId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `registryBindingsTableId` | UUID | Yes |
| `registryBindingsTableName` | String | Yes |
| `requirementsStateViewName` | String | Yes |
| `resolvedRequirementsViewName` | String | Yes |
| `resourceBillingRollupFunction` | String | Yes |
| `resourceDefinitionsTableId` | UUID | Yes |
| `resourceDefinitionsTableName` | String | Yes |
| `resourceEventsTableId` | UUID | Yes |
| `resourceEventsTableName` | String | Yes |
| `resourceInstallationsTableId` | UUID | Yes |
| `resourceInstallationsTableName` | String | Yes |
| `resourceStatusChecksTableId` | UUID | Yes |
| `resourceStatusChecksTableName` | String | Yes |
| `resourceUsageLogTableId` | UUID | Yes |
| `resourceUsageLogTableName` | String | Yes |
| `resourceUsageSummaryTableId` | UUID | Yes |
| `resourceUsageSummaryTableName` | String | Yes |
| `resourcesTableId` | UUID | Yes |
| `resourcesTableName` | String | Yes |
| `rollupResourceUsageSummaryFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all resourceModule records
const items = await db.resourceModule.findMany({ select: { apiName: true, builderBindingsTableId: true, builderBindingsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, installationStoreName: true, merkleStoreModuleId: true, namespaceModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, registryBindingsTableId: true, registryBindingsTableName: true, requirementsStateViewName: true, resolvedRequirementsViewName: true, resourceBillingRollupFunction: true, resourceDefinitionsTableId: true, resourceDefinitionsTableName: true, resourceEventsTableId: true, resourceEventsTableName: true, resourceInstallationsTableId: true, resourceInstallationsTableName: true, resourceStatusChecksTableId: true, resourceStatusChecksTableName: true, resourceUsageLogTableId: true, resourceUsageLogTableName: true, resourceUsageSummaryTableId: true, resourceUsageSummaryTableName: true, resourcesTableId: true, resourcesTableName: true, rollupResourceUsageSummaryFunction: true, schemaId: true, scope: true } }).execute();

// Get one by id
const item = await db.resourceModule.findOne({ id: '<UUID>', select: { apiName: true, builderBindingsTableId: true, builderBindingsTableName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, installationStoreName: true, merkleStoreModuleId: true, namespaceModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, registryBindingsTableId: true, registryBindingsTableName: true, requirementsStateViewName: true, resolvedRequirementsViewName: true, resourceBillingRollupFunction: true, resourceDefinitionsTableId: true, resourceDefinitionsTableName: true, resourceEventsTableId: true, resourceEventsTableName: true, resourceInstallationsTableId: true, resourceInstallationsTableName: true, resourceStatusChecksTableId: true, resourceStatusChecksTableName: true, resourceUsageLogTableId: true, resourceUsageLogTableName: true, resourceUsageSummaryTableId: true, resourceUsageSummaryTableName: true, resourcesTableId: true, resourcesTableName: true, rollupResourceUsageSummaryFunction: true, schemaId: true, scope: true } }).execute();

// Create
const created = await db.resourceModule.create({ data: { apiName: '<String>', builderBindingsTableId: '<UUID>', builderBindingsTableName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', installationStoreName: '<String>', merkleStoreModuleId: '<UUID>', namespaceModuleId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', registryBindingsTableId: '<UUID>', registryBindingsTableName: '<String>', requirementsStateViewName: '<String>', resolvedRequirementsViewName: '<String>', resourceBillingRollupFunction: '<String>', resourceDefinitionsTableId: '<UUID>', resourceDefinitionsTableName: '<String>', resourceEventsTableId: '<UUID>', resourceEventsTableName: '<String>', resourceInstallationsTableId: '<UUID>', resourceInstallationsTableName: '<String>', resourceStatusChecksTableId: '<UUID>', resourceStatusChecksTableName: '<String>', resourceUsageLogTableId: '<UUID>', resourceUsageLogTableName: '<String>', resourceUsageSummaryTableId: '<UUID>', resourceUsageSummaryTableName: '<String>', resourcesTableId: '<UUID>', resourcesTableName: '<String>', rollupResourceUsageSummaryFunction: '<String>', schemaId: '<UUID>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.resourceModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.resourceModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.rlsModule`

CRUD operations for RlsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `authenticate` | String | Yes |
| `authenticateStrict` | String | Yes |
| `currentRole` | String | Yes |
| `currentRoleId` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `sessionCredentialsTableId` | UUID | Yes |
| `sessionsTableId` | UUID | Yes |
| `usersTableId` | UUID | Yes |

**Operations:**

```typescript
// List all rlsModule records
const items = await db.rlsModule.findMany({ select: { apiName: true, authenticate: true, authenticateStrict: true, currentRole: true, currentRoleId: true, databaseId: true, id: true, privateApiName: true, privateSchemaId: true, schemaId: true, sessionCredentialsTableId: true, sessionsTableId: true, usersTableId: true } }).execute();

// Get one by id
const item = await db.rlsModule.findOne({ id: '<UUID>', select: { apiName: true, authenticate: true, authenticateStrict: true, currentRole: true, currentRoleId: true, databaseId: true, id: true, privateApiName: true, privateSchemaId: true, schemaId: true, sessionCredentialsTableId: true, sessionsTableId: true, usersTableId: true } }).execute();

// Create
const created = await db.rlsModule.create({ data: { apiName: '<String>', authenticate: '<String>', authenticateStrict: '<String>', currentRole: '<String>', currentRoleId: '<String>', databaseId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', schemaId: '<UUID>', sessionCredentialsTableId: '<UUID>', sessionsTableId: '<UUID>', usersTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.rlsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.rlsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.routeModule`

CRUD operations for RouteModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `appLinksFunctionName` | String | Yes |
| `catalogModuleId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `deepLinkFunctionName` | String | Yes |
| `defaultCapabilities` | String | Yes |
| `domainModuleId` | UUID | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `hostnameBindingsTableId` | UUID | Yes |
| `hostnameBindingsTableName` | String | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `redirectsTableId` | UUID | Yes |
| `redirectsTableName` | String | Yes |
| `resolverFunctionName` | String | Yes |
| `routeBindingsTableId` | UUID | Yes |
| `routeBindingsTableName` | String | Yes |
| `routesTableId` | UUID | Yes |
| `routesTableName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `servingSiteField` | String | Yes |
| `storageKey` | String | Yes |

**Operations:**

```typescript
// List all routeModule records
const items = await db.routeModule.findMany({ select: { apiName: true, appLinksFunctionName: true, catalogModuleId: true, databaseId: true, deepLinkFunctionName: true, defaultCapabilities: true, domainModuleId: true, entityField: true, entityTableId: true, hostnameBindingsTableId: true, hostnameBindingsTableName: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, redirectsTableId: true, redirectsTableName: true, resolverFunctionName: true, routeBindingsTableId: true, routeBindingsTableName: true, routesTableId: true, routesTableName: true, schemaId: true, scope: true, servingSiteField: true, storageKey: true } }).execute();

// Get one by id
const item = await db.routeModule.findOne({ id: '<UUID>', select: { apiName: true, appLinksFunctionName: true, catalogModuleId: true, databaseId: true, deepLinkFunctionName: true, defaultCapabilities: true, domainModuleId: true, entityField: true, entityTableId: true, hostnameBindingsTableId: true, hostnameBindingsTableName: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, redirectsTableId: true, redirectsTableName: true, resolverFunctionName: true, routeBindingsTableId: true, routeBindingsTableName: true, routesTableId: true, routesTableName: true, schemaId: true, scope: true, servingSiteField: true, storageKey: true } }).execute();

// Create
const created = await db.routeModule.create({ data: { apiName: '<String>', appLinksFunctionName: '<String>', catalogModuleId: '<UUID>', databaseId: '<UUID>', deepLinkFunctionName: '<String>', defaultCapabilities: '<String>', domainModuleId: '<UUID>', entityField: '<String>', entityTableId: '<UUID>', hostnameBindingsTableId: '<UUID>', hostnameBindingsTableName: '<String>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', redirectsTableId: '<UUID>', redirectsTableName: '<String>', resolverFunctionName: '<String>', routeBindingsTableId: '<UUID>', routeBindingsTableName: '<String>', routesTableId: '<UUID>', routesTableName: '<String>', schemaId: '<UUID>', scope: '<String>', servingSiteField: '<String>', storageKey: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.routeModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.routeModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.scopeTypesModule`

CRUD operations for ScopeTypesModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `privateSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scopeTypesTableId` | UUID | Yes |

**Operations:**

```typescript
// List all scopeTypesModule records
const items = await db.scopeTypesModule.findMany({ select: { databaseId: true, id: true, privateSchemaName: true, schemaId: true, scopeTypesTableId: true } }).execute();

// Get one by id
const item = await db.scopeTypesModule.findOne({ id: '<UUID>', select: { databaseId: true, id: true, privateSchemaName: true, schemaId: true, scopeTypesTableId: true } }).execute();

// Create
const created = await db.scopeTypesModule.create({ data: { databaseId: '<UUID>', privateSchemaName: '<String>', schemaId: '<UUID>', scopeTypesTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.scopeTypesModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.scopeTypesModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.secureTableProvision`

CRUD operations for SecureTableProvision records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `fields` | JSON | Yes |
| `grants` | JSON | Yes |
| `id` | UUID | No |
| `module` | JSON | Yes |
| `nodes` | JSON | Yes |
| `outFields` | UUID | Yes |
| `owns` | JSON | Yes |
| `policies` | JSON | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |
| `useRls` | Boolean | Yes |

**Operations:**

```typescript
// List all secureTableProvision records
const items = await db.secureTableProvision.findMany({ select: { databaseId: true, fields: true, grants: true, id: true, module: true, nodes: true, outFields: true, owns: true, policies: true, schemaId: true, tableId: true, tableName: true, useRls: true } }).execute();

// Get one by id
const item = await db.secureTableProvision.findOne({ id: '<UUID>', select: { databaseId: true, fields: true, grants: true, id: true, module: true, nodes: true, outFields: true, owns: true, policies: true, schemaId: true, tableId: true, tableName: true, useRls: true } }).execute();

// Create
const created = await db.secureTableProvision.create({ data: { databaseId: '<UUID>', fields: '<JSON>', grants: '<JSON>', module: '<JSON>', nodes: '<JSON>', outFields: '<UUID>', owns: '<JSON>', policies: '<JSON>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>', useRls: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.secureTableProvision.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.secureTableProvision.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.sessionSecretsModule`

CRUD operations for SessionSecretsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `schemaId` | UUID | Yes |
| `sessionsTableId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all sessionSecretsModule records
const items = await db.sessionSecretsModule.findMany({ select: { databaseId: true, id: true, schemaId: true, sessionsTableId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.sessionSecretsModule.findOne({ id: '<UUID>', select: { databaseId: true, id: true, schemaId: true, sessionsTableId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.sessionSecretsModule.create({ data: { databaseId: '<UUID>', schemaId: '<UUID>', sessionsTableId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.sessionSecretsModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.sessionSecretsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.sessionsModule`

CRUD operations for SessionsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `authSettingsTableId` | UUID | Yes |
| `authSettingsTableName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `schemaId` | UUID | Yes |
| `sessionCredentialsTableId` | UUID | Yes |
| `sessionCredentialsTableName` | String | Yes |
| `sessionsDefaultExpiration` | Interval | Yes |
| `sessionsTableId` | UUID | Yes |
| `sessionsTableName` | String | Yes |
| `usersTableId` | UUID | Yes |

**Operations:**

```typescript
// List all sessionsModule records
const items = await db.sessionsModule.findMany({ select: { authSettingsTableId: true, authSettingsTableName: true, databaseId: true, id: true, schemaId: true, sessionCredentialsTableId: true, sessionCredentialsTableName: true, sessionsDefaultExpiration: true, sessionsTableId: true, sessionsTableName: true, usersTableId: true } }).execute();

// Get one by id
const item = await db.sessionsModule.findOne({ id: '<UUID>', select: { authSettingsTableId: true, authSettingsTableName: true, databaseId: true, id: true, schemaId: true, sessionCredentialsTableId: true, sessionCredentialsTableName: true, sessionsDefaultExpiration: true, sessionsTableId: true, sessionsTableName: true, usersTableId: true } }).execute();

// Create
const created = await db.sessionsModule.create({ data: { authSettingsTableId: '<UUID>', authSettingsTableName: '<String>', databaseId: '<UUID>', schemaId: '<UUID>', sessionCredentialsTableId: '<UUID>', sessionCredentialsTableName: '<String>', sessionsDefaultExpiration: '<Interval>', sessionsTableId: '<UUID>', sessionsTableName: '<String>', usersTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.sessionsModule.update({ where: { id: '<UUID>' }, data: { authSettingsTableId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.sessionsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.siteSurfaceModule`

CRUD operations for SiteSurfaceModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `catalogModuleId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `id` | UUID | No |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `siteAppLinksTableId` | UUID | Yes |
| `siteAppLinksTableName` | String | Yes |
| `siteDeepLinksTableId` | UUID | Yes |
| `siteDeepLinksTableName` | String | Yes |
| `siteErrorPagesTableId` | UUID | Yes |
| `siteErrorPagesTableName` | String | Yes |
| `siteMetadataTableId` | UUID | Yes |
| `siteMetadataTableName` | String | Yes |
| `siteModulesTableId` | UUID | Yes |
| `siteModulesTableName` | String | Yes |
| `siteReleasesTableId` | UUID | Yes |
| `siteReleasesTableName` | String | Yes |
| `siteThemesTableId` | UUID | Yes |
| `siteThemesTableName` | String | Yes |
| `siteWebConfigTableId` | UUID | Yes |
| `siteWebConfigTableName` | String | Yes |
| `sitesTableId` | UUID | Yes |
| `sitesTableName` | String | Yes |
| `storageKey` | String | Yes |

**Operations:**

```typescript
// List all siteSurfaceModule records
const items = await db.siteSurfaceModule.findMany({ select: { apiName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, siteAppLinksTableId: true, siteAppLinksTableName: true, siteDeepLinksTableId: true, siteDeepLinksTableName: true, siteErrorPagesTableId: true, siteErrorPagesTableName: true, siteMetadataTableId: true, siteMetadataTableName: true, siteModulesTableId: true, siteModulesTableName: true, siteReleasesTableId: true, siteReleasesTableName: true, siteThemesTableId: true, siteThemesTableName: true, siteWebConfigTableId: true, siteWebConfigTableName: true, sitesTableId: true, sitesTableName: true, storageKey: true } }).execute();

// Get one by id
const item = await db.siteSurfaceModule.findOne({ id: '<UUID>', select: { apiName: true, catalogModuleId: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, id: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, siteAppLinksTableId: true, siteAppLinksTableName: true, siteDeepLinksTableId: true, siteDeepLinksTableName: true, siteErrorPagesTableId: true, siteErrorPagesTableName: true, siteMetadataTableId: true, siteMetadataTableName: true, siteModulesTableId: true, siteModulesTableName: true, siteReleasesTableId: true, siteReleasesTableName: true, siteThemesTableId: true, siteThemesTableName: true, siteWebConfigTableId: true, siteWebConfigTableName: true, sitesTableId: true, sitesTableName: true, storageKey: true } }).execute();

// Create
const created = await db.siteSurfaceModule.create({ data: { apiName: '<String>', catalogModuleId: '<UUID>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', siteAppLinksTableId: '<UUID>', siteAppLinksTableName: '<String>', siteDeepLinksTableId: '<UUID>', siteDeepLinksTableName: '<String>', siteErrorPagesTableId: '<UUID>', siteErrorPagesTableName: '<String>', siteMetadataTableId: '<UUID>', siteMetadataTableName: '<String>', siteModulesTableId: '<UUID>', siteModulesTableName: '<String>', siteReleasesTableId: '<UUID>', siteReleasesTableName: '<String>', siteThemesTableId: '<UUID>', siteThemesTableName: '<String>', siteWebConfigTableId: '<UUID>', siteWebConfigTableName: '<String>', sitesTableId: '<UUID>', sitesTableName: '<String>', storageKey: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.siteSurfaceModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.siteSurfaceModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.storageLogModule`

CRUD operations for StorageLogModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `interval` | String | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `retention` | String | Yes |
| `rollupFunctionName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `storageLogTableId` | UUID | Yes |
| `storageLogTableName` | String | Yes |
| `usageSummaryTableId` | UUID | Yes |
| `usageSummaryTableName` | String | Yes |

**Operations:**

```typescript
// List all storageLogModule records
const items = await db.storageLogModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, storageLogTableId: true, storageLogTableName: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Get one by id
const item = await db.storageLogModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, storageLogTableId: true, storageLogTableName: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Create
const created = await db.storageLogModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', interval: '<String>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', retention: '<String>', rollupFunctionName: '<String>', schemaId: '<UUID>', scope: '<String>', storageLogTableId: '<UUID>', storageLogTableName: '<String>', usageSummaryTableId: '<UUID>', usageSummaryTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.storageLogModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.storageLogModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.storageModule`

CRUD operations for StorageModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `allowedOrigins` | String | Yes |
| `apiName` | String | Yes |
| `bucketsTableId` | UUID | Yes |
| `bucketsTableName` | String | Yes |
| `cacheTtlSeconds` | Int | Yes |
| `catalogModuleId` | UUID | Yes |
| `confirmUploadDelay` | Interval | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `defaultMaxFileSize` | BigInt | Yes |
| `downloadUrlExpirySeconds` | Int | Yes |
| `endpoint` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `fileEventsTableId` | UUID | Yes |
| `filesTableId` | UUID | Yes |
| `filesTableName` | String | Yes |
| `hasAuditLog` | Boolean | Yes |
| `hasConfirmUpload` | Boolean | Yes |
| `hasContentHash` | Boolean | Yes |
| `hasCustomKeys` | Boolean | Yes |
| `hasPathShares` | Boolean | Yes |
| `hasVersioning` | Boolean | Yes |
| `id` | UUID | No |
| `key` | String | Yes |
| `maxBulkFiles` | Int | Yes |
| `maxBulkTotalSize` | BigInt | Yes |
| `maxFilenameLength` | Int | Yes |
| `pathSharesTableId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provider` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `publicUrlPrefix` | String | Yes |
| `region` | String | Yes |
| `restrictReads` | Boolean | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `uploadUrlExpirySeconds` | Int | Yes |

**Operations:**

```typescript
// List all storageModule records
const items = await db.storageModule.findMany({ select: { allowedOrigins: true, apiName: true, bucketsTableId: true, bucketsTableName: true, cacheTtlSeconds: true, catalogModuleId: true, confirmUploadDelay: true, databaseId: true, defaultCapabilities: true, defaultMaxFileSize: true, downloadUrlExpirySeconds: true, endpoint: true, entityField: true, entityTableId: true, fileEventsTableId: true, filesTableId: true, filesTableName: true, hasAuditLog: true, hasConfirmUpload: true, hasContentHash: true, hasCustomKeys: true, hasPathShares: true, hasVersioning: true, id: true, key: true, maxBulkFiles: true, maxBulkTotalSize: true, maxFilenameLength: true, pathSharesTableId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provider: true, provisions: true, publicSchemaName: true, publicUrlPrefix: true, region: true, restrictReads: true, schemaId: true, scope: true, uploadUrlExpirySeconds: true } }).execute();

// Get one by id
const item = await db.storageModule.findOne({ id: '<UUID>', select: { allowedOrigins: true, apiName: true, bucketsTableId: true, bucketsTableName: true, cacheTtlSeconds: true, catalogModuleId: true, confirmUploadDelay: true, databaseId: true, defaultCapabilities: true, defaultMaxFileSize: true, downloadUrlExpirySeconds: true, endpoint: true, entityField: true, entityTableId: true, fileEventsTableId: true, filesTableId: true, filesTableName: true, hasAuditLog: true, hasConfirmUpload: true, hasContentHash: true, hasCustomKeys: true, hasPathShares: true, hasVersioning: true, id: true, key: true, maxBulkFiles: true, maxBulkTotalSize: true, maxFilenameLength: true, pathSharesTableId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provider: true, provisions: true, publicSchemaName: true, publicUrlPrefix: true, region: true, restrictReads: true, schemaId: true, scope: true, uploadUrlExpirySeconds: true } }).execute();

// Create
const created = await db.storageModule.create({ data: { allowedOrigins: '<String>', apiName: '<String>', bucketsTableId: '<UUID>', bucketsTableName: '<String>', cacheTtlSeconds: '<Int>', catalogModuleId: '<UUID>', confirmUploadDelay: '<Interval>', databaseId: '<UUID>', defaultCapabilities: '<String>', defaultMaxFileSize: '<BigInt>', downloadUrlExpirySeconds: '<Int>', endpoint: '<String>', entityField: '<String>', entityTableId: '<UUID>', fileEventsTableId: '<UUID>', filesTableId: '<UUID>', filesTableName: '<String>', hasAuditLog: '<Boolean>', hasConfirmUpload: '<Boolean>', hasContentHash: '<Boolean>', hasCustomKeys: '<Boolean>', hasPathShares: '<Boolean>', hasVersioning: '<Boolean>', key: '<String>', maxBulkFiles: '<Int>', maxBulkTotalSize: '<BigInt>', maxFilenameLength: '<Int>', pathSharesTableId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provider: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', publicUrlPrefix: '<String>', region: '<String>', restrictReads: '<Boolean>', schemaId: '<UUID>', scope: '<String>', uploadUrlExpirySeconds: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.storageModule.update({ where: { id: '<UUID>' }, data: { allowedOrigins: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.storageModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.transferLogModule`

CRUD operations for TransferLogModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `interval` | String | Yes |
| `prefix` | String | Yes |
| `premake` | Int | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `publicSchemaName` | String | Yes |
| `retention` | String | Yes |
| `rollupFunctionName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `transferLogTableId` | UUID | Yes |
| `transferLogTableName` | String | Yes |
| `usageSummaryTableId` | UUID | Yes |
| `usageSummaryTableName` | String | Yes |

**Operations:**

```typescript
// List all transferLogModule records
const items = await db.transferLogModule.findMany({ select: { apiName: true, databaseId: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, transferLogTableId: true, transferLogTableName: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Get one by id
const item = await db.transferLogModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, entityField: true, id: true, interval: true, prefix: true, premake: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, publicSchemaName: true, retention: true, rollupFunctionName: true, schemaId: true, scope: true, transferLogTableId: true, transferLogTableName: true, usageSummaryTableId: true, usageSummaryTableName: true } }).execute();

// Create
const created = await db.transferLogModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', entityField: '<String>', interval: '<String>', prefix: '<String>', premake: '<Int>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', publicSchemaName: '<String>', retention: '<String>', rollupFunctionName: '<String>', schemaId: '<UUID>', scope: '<String>', transferLogTableId: '<UUID>', transferLogTableName: '<String>', usageSummaryTableId: '<UUID>', usageSummaryTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.transferLogModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.transferLogModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.userAuthModule`

CRUD operations for UserAuthModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `auditsTableId` | UUID | Yes |
| `auditsTableName` | String | Yes |
| `checkPasswordFunction` | String | Yes |
| `databaseId` | UUID | Yes |
| `deleteAccountFunction` | String | Yes |
| `emailsTableId` | UUID | Yes |
| `encryptedTableId` | UUID | Yes |
| `extendTokenExpires` | String | Yes |
| `forgotPasswordFunction` | String | Yes |
| `id` | UUID | No |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `requestCrossOriginTokenFunction` | String | Yes |
| `resetPasswordFunction` | String | Yes |
| `revokeSessionTreeFunction` | String | Yes |
| `schemaId` | UUID | Yes |
| `secretsTableId` | UUID | Yes |
| `sendAccountDeletionEmailFunction` | String | Yes |
| `sendVerificationEmailFunction` | String | Yes |
| `sessionCredentialsTableId` | UUID | Yes |
| `sessionsTableId` | UUID | Yes |
| `setPasswordFunction` | String | Yes |
| `signInCrossOriginFunction` | String | Yes |
| `signInFunction` | String | Yes |
| `signOutFunction` | String | Yes |
| `signUpFunction` | String | Yes |
| `sweepExpiredSessionsFunction` | String | Yes |
| `sweepUnverifiedIdentifiersFunction` | String | Yes |
| `usersTableId` | UUID | Yes |
| `verifyEmailFunction` | String | Yes |
| `verifyPasswordFunction` | String | Yes |

**Operations:**

```typescript
// List all userAuthModule records
const items = await db.userAuthModule.findMany({ select: { apiName: true, auditsTableId: true, auditsTableName: true, checkPasswordFunction: true, databaseId: true, deleteAccountFunction: true, emailsTableId: true, encryptedTableId: true, extendTokenExpires: true, forgotPasswordFunction: true, id: true, privateApiName: true, privateSchemaId: true, requestCrossOriginTokenFunction: true, resetPasswordFunction: true, revokeSessionTreeFunction: true, schemaId: true, secretsTableId: true, sendAccountDeletionEmailFunction: true, sendVerificationEmailFunction: true, sessionCredentialsTableId: true, sessionsTableId: true, setPasswordFunction: true, signInCrossOriginFunction: true, signInFunction: true, signOutFunction: true, signUpFunction: true, sweepExpiredSessionsFunction: true, sweepUnverifiedIdentifiersFunction: true, usersTableId: true, verifyEmailFunction: true, verifyPasswordFunction: true } }).execute();

// Get one by id
const item = await db.userAuthModule.findOne({ id: '<UUID>', select: { apiName: true, auditsTableId: true, auditsTableName: true, checkPasswordFunction: true, databaseId: true, deleteAccountFunction: true, emailsTableId: true, encryptedTableId: true, extendTokenExpires: true, forgotPasswordFunction: true, id: true, privateApiName: true, privateSchemaId: true, requestCrossOriginTokenFunction: true, resetPasswordFunction: true, revokeSessionTreeFunction: true, schemaId: true, secretsTableId: true, sendAccountDeletionEmailFunction: true, sendVerificationEmailFunction: true, sessionCredentialsTableId: true, sessionsTableId: true, setPasswordFunction: true, signInCrossOriginFunction: true, signInFunction: true, signOutFunction: true, signUpFunction: true, sweepExpiredSessionsFunction: true, sweepUnverifiedIdentifiersFunction: true, usersTableId: true, verifyEmailFunction: true, verifyPasswordFunction: true } }).execute();

// Create
const created = await db.userAuthModule.create({ data: { apiName: '<String>', auditsTableId: '<UUID>', auditsTableName: '<String>', checkPasswordFunction: '<String>', databaseId: '<UUID>', deleteAccountFunction: '<String>', emailsTableId: '<UUID>', encryptedTableId: '<UUID>', extendTokenExpires: '<String>', forgotPasswordFunction: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', requestCrossOriginTokenFunction: '<String>', resetPasswordFunction: '<String>', revokeSessionTreeFunction: '<String>', schemaId: '<UUID>', secretsTableId: '<UUID>', sendAccountDeletionEmailFunction: '<String>', sendVerificationEmailFunction: '<String>', sessionCredentialsTableId: '<UUID>', sessionsTableId: '<UUID>', setPasswordFunction: '<String>', signInCrossOriginFunction: '<String>', signInFunction: '<String>', signOutFunction: '<String>', signUpFunction: '<String>', sweepExpiredSessionsFunction: '<String>', sweepUnverifiedIdentifiersFunction: '<String>', usersTableId: '<UUID>', verifyEmailFunction: '<String>', verifyPasswordFunction: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.userAuthModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userAuthModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.userCredentialsModule`

CRUD operations for UserCredentialsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `privateApiName` | String | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all userCredentialsModule records
const items = await db.userCredentialsModule.findMany({ select: { databaseId: true, entityField: true, id: true, privateApiName: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.userCredentialsModule.findOne({ id: '<UUID>', select: { databaseId: true, entityField: true, id: true, privateApiName: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.userCredentialsModule.create({ data: { databaseId: '<UUID>', entityField: '<String>', privateApiName: '<String>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.userCredentialsModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userCredentialsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.userSettingsModule`

CRUD operations for UserSettingsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ownerTableId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all userSettingsModule records
const items = await db.userSettingsModule.findMany({ select: { apiName: true, databaseId: true, id: true, ownerTableId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.userSettingsModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, ownerTableId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.userSettingsModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', ownerTableId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.userSettingsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userSettingsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.userSettingsSecurityModule`

CRUD operations for UserSettingsSecurityModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ownerTableId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all userSettingsSecurityModule records
const items = await db.userSettingsSecurityModule.findMany({ select: { apiName: true, databaseId: true, id: true, ownerTableId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.userSettingsSecurityModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, ownerTableId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.userSettingsSecurityModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', ownerTableId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.userSettingsSecurityModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userSettingsSecurityModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.userStateModule`

CRUD operations for UserStateModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `databaseId` | UUID | Yes |
| `entityField` | String | Yes |
| `id` | UUID | No |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all userStateModule records
const items = await db.userStateModule.findMany({ select: { databaseId: true, entityField: true, id: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.userStateModule.findOne({ id: '<UUID>', select: { databaseId: true, entityField: true, id: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.userStateModule.create({ data: { databaseId: '<UUID>', entityField: '<String>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.userStateModule.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userStateModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.usersModule`

CRUD operations for UsersModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `privateApiName` | String | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |
| `typeTableId` | UUID | Yes |
| `typeTableName` | String | Yes |

**Operations:**

```typescript
// List all usersModule records
const items = await db.usersModule.findMany({ select: { apiName: true, databaseId: true, id: true, privateApiName: true, schemaId: true, tableId: true, tableName: true, typeTableId: true, typeTableName: true } }).execute();

// Get one by id
const item = await db.usersModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, privateApiName: true, schemaId: true, tableId: true, tableName: true, typeTableId: true, typeTableName: true } }).execute();

// Create
const created = await db.usersModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', privateApiName: '<String>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>', typeTableId: '<UUID>', typeTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.usersModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.usersModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.webauthnAuthModule`

CRUD operations for WebauthnAuthModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `attestationType` | String | Yes |
| `authSettingsTableId` | UUID | Yes |
| `challengeExpiry` | Interval | Yes |
| `credentialsTableId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `originAllowlist` | String | Yes |
| `requireUserVerification` | Boolean | Yes |
| `residentKey` | String | Yes |
| `rpId` | String | Yes |
| `rpName` | String | Yes |
| `schemaId` | UUID | Yes |
| `sessionCredentialsTableId` | UUID | Yes |
| `sessionSecretsTableId` | UUID | Yes |
| `sessionsTableId` | UUID | Yes |
| `usersTableId` | UUID | Yes |

**Operations:**

```typescript
// List all webauthnAuthModule records
const items = await db.webauthnAuthModule.findMany({ select: { attestationType: true, authSettingsTableId: true, challengeExpiry: true, credentialsTableId: true, databaseId: true, id: true, originAllowlist: true, requireUserVerification: true, residentKey: true, rpId: true, rpName: true, schemaId: true, sessionCredentialsTableId: true, sessionSecretsTableId: true, sessionsTableId: true, usersTableId: true } }).execute();

// Get one by id
const item = await db.webauthnAuthModule.findOne({ id: '<UUID>', select: { attestationType: true, authSettingsTableId: true, challengeExpiry: true, credentialsTableId: true, databaseId: true, id: true, originAllowlist: true, requireUserVerification: true, residentKey: true, rpId: true, rpName: true, schemaId: true, sessionCredentialsTableId: true, sessionSecretsTableId: true, sessionsTableId: true, usersTableId: true } }).execute();

// Create
const created = await db.webauthnAuthModule.create({ data: { attestationType: '<String>', authSettingsTableId: '<UUID>', challengeExpiry: '<Interval>', credentialsTableId: '<UUID>', databaseId: '<UUID>', originAllowlist: '<String>', requireUserVerification: '<Boolean>', residentKey: '<String>', rpId: '<String>', rpName: '<String>', schemaId: '<UUID>', sessionCredentialsTableId: '<UUID>', sessionSecretsTableId: '<UUID>', sessionsTableId: '<UUID>', usersTableId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.webauthnAuthModule.update({ where: { id: '<UUID>' }, data: { attestationType: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.webauthnAuthModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.webauthnCredentialsModule`

CRUD operations for WebauthnCredentialsModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `ownerTableId` | UUID | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `schemaId` | UUID | Yes |
| `tableId` | UUID | Yes |
| `tableName` | String | Yes |

**Operations:**

```typescript
// List all webauthnCredentialsModule records
const items = await db.webauthnCredentialsModule.findMany({ select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Get one by id
const item = await db.webauthnCredentialsModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, id: true, ownerTableId: true, privateApiName: true, privateSchemaId: true, schemaId: true, tableId: true, tableName: true } }).execute();

// Create
const created = await db.webauthnCredentialsModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', ownerTableId: '<UUID>', privateApiName: '<String>', privateSchemaId: '<UUID>', schemaId: '<UUID>', tableId: '<UUID>', tableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.webauthnCredentialsModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.webauthnCredentialsModule.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.webhookModule`

CRUD operations for WebhookModule records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiName` | String | Yes |
| `databaseId` | UUID | Yes |
| `defaultCapabilities` | String | Yes |
| `entityField` | String | Yes |
| `entityTableId` | UUID | Yes |
| `functionInvocationModuleId` | UUID | Yes |
| `functionModuleId` | UUID | Yes |
| `id` | UUID | No |
| `infraSecretsModuleId` | UUID | Yes |
| `namespaceModuleId` | UUID | Yes |
| `policies` | JSON | Yes |
| `prefix` | String | Yes |
| `privateApiName` | String | Yes |
| `privateSchemaId` | UUID | Yes |
| `privateSchemaName` | String | Yes |
| `provisions` | JSON | Yes |
| `publicSchemaName` | String | Yes |
| `schemaId` | UUID | Yes |
| `scope` | String | Yes |
| `webhookEndpointsTableId` | UUID | Yes |
| `webhookEndpointsTableName` | String | Yes |
| `webhookEventsTableId` | UUID | Yes |
| `webhookEventsTableName` | String | Yes |

**Operations:**

```typescript
// List all webhookModule records
const items = await db.webhookModule.findMany({ select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, functionInvocationModuleId: true, functionModuleId: true, id: true, infraSecretsModuleId: true, namespaceModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, webhookEndpointsTableId: true, webhookEndpointsTableName: true, webhookEventsTableId: true, webhookEventsTableName: true } }).execute();

// Get one by id
const item = await db.webhookModule.findOne({ id: '<UUID>', select: { apiName: true, databaseId: true, defaultCapabilities: true, entityField: true, entityTableId: true, functionInvocationModuleId: true, functionModuleId: true, id: true, infraSecretsModuleId: true, namespaceModuleId: true, policies: true, prefix: true, privateApiName: true, privateSchemaId: true, privateSchemaName: true, provisions: true, publicSchemaName: true, schemaId: true, scope: true, webhookEndpointsTableId: true, webhookEndpointsTableName: true, webhookEventsTableId: true, webhookEventsTableName: true } }).execute();

// Create
const created = await db.webhookModule.create({ data: { apiName: '<String>', databaseId: '<UUID>', defaultCapabilities: '<String>', entityField: '<String>', entityTableId: '<UUID>', functionInvocationModuleId: '<UUID>', functionModuleId: '<UUID>', infraSecretsModuleId: '<UUID>', namespaceModuleId: '<UUID>', policies: '<JSON>', prefix: '<String>', privateApiName: '<String>', privateSchemaId: '<UUID>', privateSchemaName: '<String>', provisions: '<JSON>', publicSchemaName: '<String>', schemaId: '<UUID>', scope: '<String>', webhookEndpointsTableId: '<UUID>', webhookEndpointsTableName: '<String>', webhookEventsTableId: '<UUID>', webhookEventsTableName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.webhookModule.update({ where: { id: '<UUID>' }, data: { apiName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.webhookModule.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.mutation.constructBlueprint`

Executes a blueprint definition by delegating to provision_* procedures. Creates a blueprint_construction record to track the attempt. Eight phases: (0) entity_type_provision for each membership_type entry — provisions entity tables, membership modules, and security. When a prefix already exists (e.g., 'org'), the entry extends the existing entity type instead of creating a new one; if a storage[] key is present, it provisions entity-scoped storage for that type. (0.5) scope-based storage: each storage[] entry has an optional scope ('app' or 'org' only). App-scoped storage seeds buckets at migration time. Org-scoped storage resolves the org membership type, creates org_buckets/org_files with owner_id, and seeds buckets per-entity via an AFTER INSERT trigger on the users table. When function_module is installed, a private functions bucket is auto-injected into org-scoped or entity-scoped storage entries. (1) provision_table() for each table with nodes[], fields[], policies[], and grants (table-level indexes/fts/unique_constraints/check_constraints are deferred). A table entry either names its table (table_name plus optional schema_name) or references one an installed module generated ("module": {"type": "agent", "scope": "org", "table": "message"}), which resolves through the module row's recorded table ids and raises when it matches nothing instead of creating an empty table. After provisioning, optional smart_tags (jsonb object) on the table entry are applied via metaschema.append_table_smart_tags(), and optional smart_tags on individual field entries are applied via metaschema.append_field_smart_tags(). (2) provision_relation() for each relation, (3) provision_index() for top-level + deferred indexes, (4) provision_full_text_search() for top-level + deferred FTS, (5) provision_unique_constraint() for top-level + deferred unique constraints, (6) provision_check_constraint() for top-level + deferred check constraints, (7) seed achievements from definition.achievements[] — resolves events_module by entity_prefix and creates INSERT actions for levels, level_requirements, and achievement_rewards tables. Phase 0 entity tables are added to the table_map so subsequent phases can reference them by name. Table-level entries are deferred to phases 3-6 so they can reference columns created by relations in phase 2. Returns the construction record ID on success, NULL on failure.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ConstructBlueprintInput (required) |

```typescript
const result = await db.mutation.constructBlueprint({ input: { blueprintId: '<UUID>', schemaId: '<UUID>' } }).execute();
```

### `db.mutation.copyTemplateToBlueprint`

Creates a new blueprint by copying a template definition. Checks visibility: owners can always copy their own templates, others require public visibility. Increments the template copy_count. Returns the new blueprint ID.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CopyTemplateToBlueprintInput (required) |

```typescript
const result = await db.mutation.copyTemplateToBlueprint({ input: { databaseId: '<UUID>', displayNameOverride: '<String>', nameOverride: '<String>', ownerId: '<UUID>', templateId: '<UUID>' } }).execute();
```

### `db.mutation.provisionBucket`

Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

```typescript
const result = await db.mutation.provisionBucket({ input: { bucketKey: '<String>', ownerId: '<UUID>' } }).execute();
```
