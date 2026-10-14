# csdk CLI

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```bash
# Create a context pointing at your GraphQL endpoint
csdk context create production --endpoint https://api.example.com/graphql

# Set the active context
csdk context use production

# Authenticate
csdk auth set-token <your-token>
```

## Commands

| Command | Description |
|---------|-------------|
| `context` | Manage API contexts (endpoints) |
| `auth` | Manage authentication tokens |
| `config` | Manage config key-value store (per-context) |
| `agent-module` | agentModule CRUD operations |
| `api-surface-module` | apiSurfaceModule CRUD operations |
| `app-module` | appModule CRUD operations |
| `billing-module` | billingModule CRUD operations |
| `billing-provider-module` | billingProviderModule CRUD operations |
| `blueprint` | blueprint CRUD operations |
| `blueprint-construction` | blueprintConstruction CRUD operations |
| `blueprint-template` | blueprintTemplate CRUD operations |
| `capabilities-module` | capabilitiesModule CRUD operations |
| `catalog-module` | catalogModule CRUD operations |
| `cluster-module` | clusterModule CRUD operations |
| `compute-log-module` | computeLogModule CRUD operations |
| `connected-accounts-module` | connectedAccountsModule CRUD operations |
| `content-preset-module` | contentPresetModule CRUD operations |
| `crypto-addresses-module` | cryptoAddressesModule CRUD operations |
| `crypto-auth-module` | cryptoAuthModule CRUD operations |
| `data-capabilities-field` | dataCapabilitiesField CRUD operations |
| `database-provision-module` | databaseProvisionModule CRUD operations |
| `database-settings-module` | databaseSettingsModule CRUD operations |
| `db-pool-config` | dbPoolConfig CRUD operations |
| `db-pool` | dbPool CRUD operations |
| `db-preset-module` | dbPresetModule CRUD operations |
| `db-usage-module` | dbUsageModule CRUD operations |
| `default-ids-module` | defaultIdsModule CRUD operations |
| `denormalized-table-field` | denormalizedTableField CRUD operations |
| `devices-module` | devicesModule CRUD operations |
| `domain-module` | domainModule CRUD operations |
| `email-sender-module` | emailSenderModule CRUD operations |
| `emails-module` | emailsModule CRUD operations |
| `entity-type-provision` | entityTypeProvision CRUD operations |
| `events-module` | eventsModule CRUD operations |
| `file-ref-field` | fileRefField CRUD operations |
| `function-deployment-module` | functionDeploymentModule CRUD operations |
| `function-invocation-module` | functionInvocationModule CRUD operations |
| `function-module` | functionModule CRUD operations |
| `graph-execution-module` | graphExecutionModule CRUD operations |
| `graph-module` | graphModule CRUD operations |
| `hierarchy-module` | hierarchyModule CRUD operations |
| `i-18-n-module` | i18NModule CRUD operations |
| `identity-providers-module` | identityProvidersModule CRUD operations |
| `image-module` | imageModule CRUD operations |
| `inference-log-module` | inferenceLogModule CRUD operations |
| `infra-config-module` | infraConfigModule CRUD operations |
| `infra-secrets-module` | infraSecretsModule CRUD operations |
| `integration-providers-module` | integrationProvidersModule CRUD operations |
| `internal-config-module` | internalConfigModule CRUD operations |
| `internal-secrets-module` | internalSecretsModule CRUD operations |
| `invites-module` | invitesModule CRUD operations |
| `k-8-s-admission-module` | k8sAdmissionModule CRUD operations |
| `limits-module` | limitsModule CRUD operations |
| `machine-module` | machineModule CRUD operations |
| `membership-types-module` | membershipTypesModule CRUD operations |
| `memberships-module` | membershipsModule CRUD operations |
| `merkle-store-module` | merkleStoreModule CRUD operations |
| `namespace-module` | namespaceModule CRUD operations |
| `notifications-module` | notificationsModule CRUD operations |
| `oauth-requests-module` | oauthRequestsModule CRUD operations |
| `pages-module` | pagesModule CRUD operations |
| `phone-numbers-module` | phoneNumbersModule CRUD operations |
| `plans-module` | plansModule CRUD operations |
| `principal-auth-module` | principalAuthModule CRUD operations |
| `profiles-module` | profilesModule CRUD operations |
| `rate-limit-meters-module` | rateLimitMetersModule CRUD operations |
| `rate-limits-module` | rateLimitsModule CRUD operations |
| `realtime-module` | realtimeModule CRUD operations |
| `refusal-log-module` | refusalLogModule CRUD operations |
| `relation-provision` | relationProvision CRUD operations |
| `repository-module` | repositoryModule CRUD operations |
| `resource-module` | resourceModule CRUD operations |
| `rls-module` | rlsModule CRUD operations |
| `route-module` | routeModule CRUD operations |
| `scope-types-module` | scopeTypesModule CRUD operations |
| `secure-table-provision` | secureTableProvision CRUD operations |
| `session-secrets-module` | sessionSecretsModule CRUD operations |
| `sessions-module` | sessionsModule CRUD operations |
| `site-surface-module` | siteSurfaceModule CRUD operations |
| `storage-log-module` | storageLogModule CRUD operations |
| `storage-module` | storageModule CRUD operations |
| `transfer-log-module` | transferLogModule CRUD operations |
| `user-auth-module` | userAuthModule CRUD operations |
| `user-credentials-module` | userCredentialsModule CRUD operations |
| `user-settings-module` | userSettingsModule CRUD operations |
| `user-settings-security-module` | userSettingsSecurityModule CRUD operations |
| `user-state-module` | userStateModule CRUD operations |
| `users-module` | usersModule CRUD operations |
| `webauthn-auth-module` | webauthnAuthModule CRUD operations |
| `webauthn-credentials-module` | webauthnCredentialsModule CRUD operations |
| `webhook-module` | webhookModule CRUD operations |
| `construct-blueprint` | Executes a blueprint definition by delegating to provision_* procedures. Creates a blueprint_construction record to track the attempt. Eight phases: (0) entity_type_provision for each membership_type entry — provisions entity tables, membership modules, and security. When a prefix already exists (e.g., 'org'), the entry extends the existing entity type instead of creating a new one; if a storage[] key is present, it provisions entity-scoped storage for that type. (0.5) scope-based storage: each storage[] entry has an optional scope ('app' or 'org' only). App-scoped storage seeds buckets at migration time. Org-scoped storage resolves the org membership type, creates org_buckets/org_files with owner_id, and seeds buckets per-entity via an AFTER INSERT trigger on the users table. When function_module is installed, a private functions bucket is auto-injected into org-scoped or entity-scoped storage entries. (1) provision_table() for each table with nodes[], fields[], policies[], and grants (table-level indexes/fts/unique_constraints/check_constraints are deferred). A table entry either names its table (table_name plus optional schema_name) or references one an installed module generated ("module": {"type": "agent", "scope": "org", "table": "message"}), which resolves through the module row's recorded table ids and raises when it matches nothing instead of creating an empty table. After provisioning, optional smart_tags (jsonb object) on the table entry are applied via metaschema.append_table_smart_tags(), and optional smart_tags on individual field entries are applied via metaschema.append_field_smart_tags(). (2) provision_relation() for each relation, (3) provision_index() for top-level + deferred indexes, (4) provision_full_text_search() for top-level + deferred FTS, (5) provision_unique_constraint() for top-level + deferred unique constraints, (6) provision_check_constraint() for top-level + deferred check constraints, (7) seed achievements from definition.achievements[] — resolves events_module by entity_prefix and creates INSERT actions for levels, level_requirements, and achievement_rewards tables. Phase 0 entity tables are added to the table_map so subsequent phases can reference them by name. Table-level entries are deferred to phases 3-6 so they can reference columns created by relations in phase 2. Returns the construction record ID on success, NULL on failure. |
| `copy-template-to-blueprint` | Creates a new blueprint by copying a template definition. Checks visibility: owners can always copy their own templates, others require public visibility. Increments the template copy_count. Returns the new blueprint ID. |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |

## Infrastructure Commands

### `context`

Manage named API contexts (kubectl-style).

| Subcommand | Description |
|------------|-------------|
| `create <name> --endpoint <url>` | Create a new context |
| `list` | List all contexts |
| `use <name>` | Set the active context |
| `current` | Show current context |
| `delete <name>` | Delete a context |

Configuration is stored at `~/.csdk/config/`.

### `auth`

Manage authentication tokens per context.

| Subcommand | Description |
|------------|-------------|
| `set-token <token>` | Store bearer token for current context |
| `status` | Show auth status across all contexts |
| `logout` | Remove credentials for current context |

### `config`

Manage per-context key-value configuration variables.

| Subcommand | Description |
|------------|-------------|
| `get <key>` | Get a config value |
| `set <key> <value>` | Set a config value |
| `list` | List all config values |
| `delete <key>` | Delete a config value |

Variables are scoped to the active context and stored at `~/.csdk/config/`.

## Table Commands

### `agent-module`

CRUD operations for AgentModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all agentModule records |
| `find-first` | Find first matching agentModule record |
| `get` | Get a agentModule by id |
| `create` | Create a new agentModule |
| `update` | Update an existing agentModule |
| `delete` | Delete a agentModule |

**Fields:**

| Field | Type |
|-------|------|
| `agentTableId` | UUID |
| `agentTableName` | String |
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `defaultVisibility` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `eventTableId` | UUID |
| `eventTableName` | String |
| `hasAgents` | Boolean |
| `hasAttachments` | Boolean |
| `hasPlans` | Boolean |
| `hasRepositoryResources` | Boolean |
| `hasResources` | Boolean |
| `hasRuns` | Boolean |
| `id` | UUID |
| `messageTableId` | UUID |
| `messageTableName` | String |
| `personaTableId` | UUID |
| `personaTableName` | String |
| `planTableId` | UUID |
| `planTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `promptsTableId` | UUID |
| `promptsTableName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `resourceRepositoryTableId` | UUID |
| `resourceRepositoryTableName` | String |
| `resourceTableId` | UUID |
| `resourceTableName` | String |
| `resources` | JSON |
| `runTableId` | UUID |
| `runTableName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `settleRunCostFunctionName` | String |
| `taskTableId` | UUID |
| `taskTableName` | String |
| `threadTableId` | UUID |
| `threadTableName` | String |
| `workspaceTableId` | UUID |
| `workspaceTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `agentTableId`, `agentTableName`, `apiName`, `defaultCapabilities`, `defaultVisibility`, `entityField`, `entityTableId`, `eventTableId`, `eventTableName`, `hasAgents`, `hasAttachments`, `hasPlans`, `hasRepositoryResources`, `hasResources`, `hasRuns`, `messageTableId`, `messageTableName`, `personaTableId`, `personaTableName`, `planTableId`, `planTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `promptsTableId`, `promptsTableName`, `provisions`, `publicSchemaName`, `resourceRepositoryTableId`, `resourceRepositoryTableName`, `resourceTableId`, `resourceTableName`, `resources`, `runTableId`, `runTableName`, `schemaId`, `settleRunCostFunctionName`, `taskTableId`, `taskTableName`, `threadTableId`, `threadTableName`, `workspaceTableId`, `workspaceTableName`

### `api-surface-module`

CRUD operations for ApiSurfaceModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all apiSurfaceModule records |
| `find-first` | Find first matching apiSurfaceModule record |
| `get` | Get a apiSurfaceModule by id |
| `create` | Create a new apiSurfaceModule |
| `update` | Update an existing apiSurfaceModule |
| `delete` | Delete a apiSurfaceModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `apiSchemasTableId` | UUID |
| `apiSchemasTableName` | String |
| `apiSettingsTableId` | UUID |
| `apiSettingsTableName` | String |
| `apisTableId` | UUID |
| `apisTableName` | String |
| `catalogModuleId` | UUID |
| `corsSettingsTableId` | UUID |
| `corsSettingsTableName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `apiSchemasTableId`, `apiSchemasTableName`, `apiSettingsTableId`, `apiSettingsTableName`, `apisTableId`, `apisTableName`, `catalogModuleId`, `corsSettingsTableId`, `corsSettingsTableName`, `defaultCapabilities`, `entityField`, `entityTableId`, `policies`, `prefix`, `privateApiName`, `provisions`, `publicSchemaName`, `schemaId`

### `app-module`

CRUD operations for AppModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all appModule records |
| `find-first` | Find first matching appModule record |
| `get` | Get a appModule by id |
| `create` | Create a new appModule |
| `update` | Update an existing appModule |
| `delete` | Delete a appModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `appComponentsTableId` | UUID |
| `appComponentsTableName` | String |
| `appStoreIdentitiesTableName` | String |
| `appsTableId` | UUID |
| `appsTableName` | String |
| `catalogModuleId` | UUID |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `appComponentsTableId`, `appComponentsTableName`, `appStoreIdentitiesTableName`, `appsTableId`, `appsTableName`, `catalogModuleId`, `defaultCapabilities`, `entityField`, `entityTableId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `billing-module`

CRUD operations for BillingModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all billingModule records |
| `find-first` | Find first matching billingModule record |
| `get` | Get a billingModule by id |
| `create` | Create a new billingModule |
| `update` | Update an existing billingModule |
| `delete` | Delete a billingModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `balancesTableId` | UUID |
| `balancesTableName` | String |
| `creditPacksTableId` | UUID |
| `creditPacksTableName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `defaultMeterCatalog` | JSON |
| `grantMeterCreditsFunction` | String |
| `id` | UUID |
| `ledgerTableId` | UUID |
| `ledgerTableName` | String |
| `meterCreditsTableId` | UUID |
| `meterCreditsTableName` | String |
| `meterDefaultsTableId` | UUID |
| `meterDefaultsTableName` | String |
| `meterSourcesTableId` | UUID |
| `meterSourcesTableName` | String |
| `metersTableId` | UUID |
| `metersTableName` | String |
| `planSubscriptionsTableId` | UUID |
| `planSubscriptionsTableName` | String |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `recordUsageFunction` | String |
| `rollupUsageSummaryFunction` | String |
| `schemaId` | UUID |
| `sweepExpiredSubscriptionsFunction` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `balancesTableId`, `balancesTableName`, `creditPacksTableId`, `creditPacksTableName`, `defaultCapabilities`, `defaultMeterCatalog`, `grantMeterCreditsFunction`, `ledgerTableId`, `ledgerTableName`, `meterCreditsTableId`, `meterCreditsTableName`, `meterDefaultsTableId`, `meterDefaultsTableName`, `meterSourcesTableId`, `meterSourcesTableName`, `metersTableId`, `metersTableName`, `planSubscriptionsTableId`, `planSubscriptionsTableName`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `recordUsageFunction`, `rollupUsageSummaryFunction`, `schemaId`, `sweepExpiredSubscriptionsFunction`

### `billing-provider-module`

CRUD operations for BillingProviderModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all billingProviderModule records |
| `find-first` | Find first matching billingProviderModule record |
| `get` | Get a billingProviderModule by id |
| `create` | Create a new billingProviderModule |
| `update` | Update an existing billingProviderModule |
| `delete` | Delete a billingProviderModule |

**Fields:**

| Field | Type |
|-------|------|
| `activatePlanSubscriptionFunction` | String |
| `apiName` | String |
| `applyProviderObservationFunction` | String |
| `billingConnectionTableId` | UUID |
| `billingConnectionTableName` | String |
| `billingCustomersTableId` | UUID |
| `billingCustomersTableName` | String |
| `billingDisputesTableId` | UUID |
| `billingDisputesTableName` | String |
| `billingHealthTableId` | UUID |
| `billingHealthTableName` | String |
| `billingInvoicesTableId` | UUID |
| `billingInvoicesTableName` | String |
| `billingOperationsTableId` | UUID |
| `billingOperationsTableName` | String |
| `billingPricesTableId` | UUID |
| `billingPricesTableName` | String |
| `billingProductsTableId` | UUID |
| `billingProductsTableName` | String |
| `billingProviderConnectedFunction` | String |
| `billingProviderStateTableId` | UUID |
| `billingProviderStateTableName` | String |
| `billingRefundsTableId` | UUID |
| `billingRefundsTableName` | String |
| `billingSubscriptionsTableId` | UUID |
| `billingSubscriptionsTableName` | String |
| `billingWebhookEventsTableId` | UUID |
| `billingWebhookEventsTableName` | String |
| `bindCheckoutSessionFunction` | String |
| `clearScheduledChangeFunction` | String |
| `databaseId` | UUID |
| `finishBillingOperationFunction` | String |
| `getActivePlanPricingFunction` | String |
| `getActivePlanSubscriptionFunction` | String |
| `getBillingCustomerFunction` | String |
| `getBillingPriceFunction` | String |
| `getBillingProductFunction` | String |
| `getBillingProviderStateFunction` | String |
| `getBillingSubscriptionByEntityFunction` | String |
| `getBillingSubscriptionByExternalIdFunction` | String |
| `getBillingSubscriptionFunction` | String |
| `getFallbackFreePlanFunction` | String |
| `getPlanPricingByExternalPriceFunction` | String |
| `hasDueReconciliationsFunction` | String |
| `id` | UUID |
| `listDueReconciliationsFunction` | String |
| `listPendingUsageSyncFunction` | String |
| `markUsageSyncedFunction` | String |
| `prefix` | String |
| `prepareScheduledChangeFunction` | String |
| `pricesTableId` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `processBillingEventFunction` | String |
| `productsTableId` | UUID |
| `provider` | String |
| `recordBillingConnectionFunction` | String |
| `recordBillingHealthFunction` | String |
| `recordDisputeFunction` | String |
| `recordRefundFunction` | String |
| `reserveBillingOperationFunction` | String |
| `schemaId` | UUID |
| `subscriptionsTableId` | UUID |
| `sweepOverdueSubscriptionsFunction` | String |
| `upsertBillingCustomerFunction` | String |
| `upsertBillingPriceFunction` | String |
| `upsertBillingProductFunction` | String |
| `upsertBillingSubscriptionFunction` | String |
| `upsertInvoiceFunction` | String |
| `usageSyncShardCount` | Int |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `activatePlanSubscriptionFunction`, `apiName`, `applyProviderObservationFunction`, `billingConnectionTableId`, `billingConnectionTableName`, `billingCustomersTableId`, `billingCustomersTableName`, `billingDisputesTableId`, `billingDisputesTableName`, `billingHealthTableId`, `billingHealthTableName`, `billingInvoicesTableId`, `billingInvoicesTableName`, `billingOperationsTableId`, `billingOperationsTableName`, `billingPricesTableId`, `billingPricesTableName`, `billingProductsTableId`, `billingProductsTableName`, `billingProviderConnectedFunction`, `billingProviderStateTableId`, `billingProviderStateTableName`, `billingRefundsTableId`, `billingRefundsTableName`, `billingSubscriptionsTableId`, `billingSubscriptionsTableName`, `billingWebhookEventsTableId`, `billingWebhookEventsTableName`, `bindCheckoutSessionFunction`, `clearScheduledChangeFunction`, `finishBillingOperationFunction`, `getActivePlanPricingFunction`, `getActivePlanSubscriptionFunction`, `getBillingCustomerFunction`, `getBillingPriceFunction`, `getBillingProductFunction`, `getBillingProviderStateFunction`, `getBillingSubscriptionByEntityFunction`, `getBillingSubscriptionByExternalIdFunction`, `getBillingSubscriptionFunction`, `getFallbackFreePlanFunction`, `getPlanPricingByExternalPriceFunction`, `hasDueReconciliationsFunction`, `listDueReconciliationsFunction`, `listPendingUsageSyncFunction`, `markUsageSyncedFunction`, `prefix`, `prepareScheduledChangeFunction`, `pricesTableId`, `privateApiName`, `privateSchemaId`, `processBillingEventFunction`, `productsTableId`, `provider`, `recordBillingConnectionFunction`, `recordBillingHealthFunction`, `recordDisputeFunction`, `recordRefundFunction`, `reserveBillingOperationFunction`, `schemaId`, `subscriptionsTableId`, `sweepOverdueSubscriptionsFunction`, `upsertBillingCustomerFunction`, `upsertBillingPriceFunction`, `upsertBillingProductFunction`, `upsertBillingSubscriptionFunction`, `upsertInvoiceFunction`, `usageSyncShardCount`

### `blueprint`

CRUD operations for Blueprint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all blueprint records |
| `find-first` | Find first matching blueprint record |
| `get` | Get a blueprint by id |
| `create` | Create a new blueprint |
| `update` | Update an existing blueprint |
| `delete` | Delete a blueprint |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `definition` | JSON |
| `definitionHash` | UUID |
| `description` | String |
| `displayName` | String |
| `id` | UUID |
| `name` | String |
| `ownerId` | UUID |
| `tableHashes` | JSON |
| `templateId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `definition`, `displayName`, `name`, `ownerId`
**Optional create fields (backend defaults):** `definitionHash`, `description`, `tableHashes`, `templateId`

### `blueprint-construction`

CRUD operations for BlueprintConstruction records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all blueprintConstruction records |
| `find-first` | Find first matching blueprintConstruction record |
| `get` | Get a blueprintConstruction by id |
| `create` | Create a new blueprintConstruction |
| `update` | Update an existing blueprintConstruction |
| `delete` | Delete a blueprintConstruction |

**Fields:**

| Field | Type |
|-------|------|
| `blueprintId` | UUID |
| `constructedAt` | Datetime |
| `constructedDefinition` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `errorDetails` | String |
| `id` | UUID |
| `schemaId` | UUID |
| `status` | String |
| `tableMap` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `blueprintId`, `databaseId`
**Optional create fields (backend defaults):** `constructedAt`, `constructedDefinition`, `errorDetails`, `schemaId`, `status`, `tableMap`

### `blueprint-template`

CRUD operations for BlueprintTemplate records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all blueprintTemplate records |
| `find-first` | Find first matching blueprintTemplate record |
| `get` | Get a blueprintTemplate by id |
| `create` | Create a new blueprintTemplate |
| `update` | Update an existing blueprintTemplate |
| `delete` | Delete a blueprintTemplate |

**Fields:**

| Field | Type |
|-------|------|
| `categories` | String |
| `complexity` | String |
| `copyCount` | Int |
| `createdAt` | Datetime |
| `definition` | JSON |
| `definitionHash` | UUID |
| `definitionSchemaVersion` | String |
| `description` | String |
| `displayName` | String |
| `forkCount` | Int |
| `forkedFromId` | UUID |
| `id` | UUID |
| `name` | String |
| `ownerId` | UUID |
| `source` | String |
| `tableHashes` | JSON |
| `tags` | String |
| `updatedAt` | Datetime |
| `version` | String |
| `visibility` | String |

**Required create fields:** `definition`, `displayName`, `name`, `ownerId`
**Optional create fields (backend defaults):** `categories`, `complexity`, `copyCount`, `definitionHash`, `definitionSchemaVersion`, `description`, `forkCount`, `forkedFromId`, `source`, `tableHashes`, `tags`, `version`, `visibility`

### `capabilities-module`

CRUD operations for CapabilitiesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all capabilitiesModule records |
| `find-first` | Find first matching capabilitiesModule record |
| `get` | Get a capabilitiesModule by id |
| `create` | Create a new capabilitiesModule |
| `update` | Update an existing capabilitiesModule |
| `delete` | Delete a capabilitiesModule |

**Fields:**

| Field | Type |
|-------|------|
| `actorTableId` | UUID |
| `apiName` | String |
| `bitlen` | Int |
| `databaseId` | UUID |
| `defaultTableId` | UUID |
| `defaultTableName` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `getByMask` | String |
| `getMask` | String |
| `getMaskByName` | String |
| `getPaddedMask` | String |
| `id` | UUID |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `actorTableId`, `apiName`, `bitlen`, `defaultTableId`, `defaultTableName`, `entityField`, `entityTableId`, `getByMask`, `getMask`, `getMaskByName`, `getPaddedMask`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `schemaId`, `tableId`, `tableName`

### `catalog-module`

CRUD operations for CatalogModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all catalogModule records |
| `find-first` | Find first matching catalogModule record |
| `get` | Get a catalogModule by id |
| `create` | Create a new catalogModule |
| `update` | Update an existing catalogModule |
| `delete` | Delete a catalogModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `apisTableId` | UUID |
| `apisTableName` | String |
| `appStoreIdentitiesTableId` | UUID |
| `appStoreIdentitiesTableName` | String |
| `appsTableId` | UUID |
| `appsTableName` | String |
| `bindingsTableId` | UUID |
| `bindingsTableName` | String |
| `bucketsTableId` | UUID |
| `bucketsTableName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `domainsTableId` | UUID |
| `domainsTableName` | String |
| `entityTableId` | UUID |
| `functionsTableId` | UUID |
| `functionsTableName` | String |
| `id` | UUID |
| `imagesTableId` | UUID |
| `imagesTableName` | String |
| `managedDomainsTableId` | UUID |
| `managedDomainsTableName` | String |
| `namespacesTableId` | UUID |
| `namespacesTableName` | String |
| `policies` | JSON |
| `privateApiName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `redirectsTableId` | UUID |
| `redirectsTableName` | String |
| `resourceDefinitionsTableId` | UUID |
| `resourceDefinitionsTableName` | String |
| `resourceInstallationsTableId` | UUID |
| `resourceInstallationsTableName` | String |
| `resourcesTableId` | UUID |
| `resourcesTableName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `sitesAppLinksTableId` | UUID |
| `sitesAppLinksTableName` | String |
| `sitesDeepLinksTableId` | UUID |
| `sitesDeepLinksTableName` | String |
| `sitesErrorPagesTableId` | UUID |
| `sitesErrorPagesTableName` | String |
| `sitesTableId` | UUID |
| `sitesTableName` | String |
| `sitesWebConfigTableId` | UUID |
| `sitesWebConfigTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `apisTableId`, `apisTableName`, `appStoreIdentitiesTableId`, `appStoreIdentitiesTableName`, `appsTableId`, `appsTableName`, `bindingsTableId`, `bindingsTableName`, `bucketsTableId`, `bucketsTableName`, `defaultCapabilities`, `domainsTableId`, `domainsTableName`, `entityTableId`, `functionsTableId`, `functionsTableName`, `imagesTableId`, `imagesTableName`, `managedDomainsTableId`, `managedDomainsTableName`, `namespacesTableId`, `namespacesTableName`, `policies`, `privateApiName`, `provisions`, `publicSchemaName`, `redirectsTableId`, `redirectsTableName`, `resourceDefinitionsTableId`, `resourceDefinitionsTableName`, `resourceInstallationsTableId`, `resourceInstallationsTableName`, `resourcesTableId`, `resourcesTableName`, `schemaId`, `sitesAppLinksTableId`, `sitesAppLinksTableName`, `sitesDeepLinksTableId`, `sitesDeepLinksTableName`, `sitesErrorPagesTableId`, `sitesErrorPagesTableName`, `sitesTableId`, `sitesTableName`, `sitesWebConfigTableId`, `sitesWebConfigTableName`

### `cluster-module`

CRUD operations for ClusterModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all clusterModule records |
| `find-first` | Find first matching clusterModule record |
| `get` | Get a clusterModule by id |
| `create` | Create a new clusterModule |
| `update` | Update an existing clusterModule |
| `delete` | Delete a clusterModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `clusterEventsTableId` | UUID |
| `clusterEventsTableName` | String |
| `clustersTableId` | UUID |
| `clustersTableName` | String |
| `databaseId` | UUID |
| `databasePlacementsTableId` | UUID |
| `databasePlacementsTableName` | String |
| `databaseServersTableId` | UUID |
| `databaseServersTableName` | String |
| `defaultCapabilities` | String |
| `entityField` | String |
| `id` | UUID |
| `partitionInterval` | String |
| `physicalDatabasesTableId` | UUID |
| `physicalDatabasesTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `retention` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `clusterEventsTableId`, `clusterEventsTableName`, `clustersTableId`, `clustersTableName`, `databasePlacementsTableId`, `databasePlacementsTableName`, `databaseServersTableId`, `databaseServersTableName`, `defaultCapabilities`, `entityField`, `partitionInterval`, `physicalDatabasesTableId`, `physicalDatabasesTableName`, `policies`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `retention`, `schemaId`, `scope`

### `compute-log-module`

CRUD operations for ComputeLogModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all computeLogModule records |
| `find-first` | Find first matching computeLogModule record |
| `get` | Get a computeLogModule by id |
| `create` | Create a new computeLogModule |
| `update` | Update an existing computeLogModule |
| `delete` | Delete a computeLogModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `computeLogTableId` | UUID |
| `computeLogTableName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `id` | UUID |
| `interval` | String |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `retention` | String |
| `rollupFunctionName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `usageSummaryTableId` | UUID |
| `usageSummaryTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `computeLogTableId`, `computeLogTableName`, `entityField`, `interval`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `retention`, `rollupFunctionName`, `schemaId`, `usageSummaryTableId`, `usageSummaryTableName`

### `connected-accounts-module`

CRUD operations for ConnectedAccountsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all connectedAccountsModule records |
| `find-first` | Find first matching connectedAccountsModule record |
| `get` | Get a connectedAccountsModule by id |
| `create` | Create a new connectedAccountsModule |
| `update` | Update an existing connectedAccountsModule |
| `delete` | Delete a connectedAccountsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `ownerTableId` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `tableName`
**Optional create fields (backend defaults):** `apiName`, `ownerTableId`, `privateApiName`, `privateSchemaId`, `schemaId`, `tableId`

### `content-preset-module`

CRUD operations for ContentPresetModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all contentPresetModule records |
| `find-first` | Find first matching contentPresetModule record |
| `get` | Get a contentPresetModule by id |
| `create` | Create a new contentPresetModule |
| `update` | Update an existing contentPresetModule |
| `delete` | Delete a contentPresetModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `contentPresetsTableId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `entityTableId` | UUID |
| `id` | UUID |
| `merkleStoreModuleId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaId` | UUID |
| `publicSchemaName` | String |
| `scope` | String |
| `storeName` | String |

**Required create fields:** `databaseId`, `merkleStoreModuleId`, `prefix`, `scope`, `storeName`
**Optional create fields (backend defaults):** `apiName`, `contentPresetsTableId`, `entityTableId`, `policies`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaId`, `publicSchemaName`

### `crypto-addresses-module`

CRUD operations for CryptoAddressesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all cryptoAddressesModule records |
| `find-first` | Find first matching cryptoAddressesModule record |
| `get` | Get a cryptoAddressesModule by id |
| `create` | Create a new cryptoAddressesModule |
| `update` | Update an existing cryptoAddressesModule |
| `delete` | Delete a cryptoAddressesModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `cryptoNetwork` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `ownerTableId` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `tableName`
**Optional create fields (backend defaults):** `apiName`, `cryptoNetwork`, `ownerTableId`, `privateApiName`, `privateSchemaId`, `schemaId`, `tableId`

### `crypto-auth-module`

CRUD operations for CryptoAuthModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all cryptoAuthModule records |
| `find-first` | Find first matching cryptoAuthModule record |
| `get` | Get a cryptoAuthModule by id |
| `create` | Create a new cryptoAuthModule |
| `update` | Update an existing cryptoAuthModule |
| `delete` | Delete a cryptoAuthModule |

**Fields:**

| Field | Type |
|-------|------|
| `addressesTableId` | UUID |
| `cryptoNetwork` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `schemaId` | UUID |
| `secretsTableId` | UUID |
| `sessionCredentialsTableId` | UUID |
| `sessionsTableId` | UUID |
| `signInRecordFailure` | String |
| `signInRequestChallenge` | String |
| `signInWithChallenge` | String |
| `signUpWithKey` | String |
| `userField` | String |
| `usersTableId` | UUID |

**Required create fields:** `databaseId`, `userField`
**Optional create fields (backend defaults):** `addressesTableId`, `cryptoNetwork`, `schemaId`, `secretsTableId`, `sessionCredentialsTableId`, `sessionsTableId`, `signInRecordFailure`, `signInRequestChallenge`, `signInWithChallenge`, `signUpWithKey`, `usersTableId`

### `data-capabilities-field`

CRUD operations for DataCapabilitiesField records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all dataCapabilitiesField records |
| `find-first` | Find first matching dataCapabilitiesField record |
| `get` | Get a dataCapabilitiesField by id |
| `create` | Create a new dataCapabilitiesField |
| `update` | Update an existing dataCapabilitiesField |
| `delete` | Delete a dataCapabilitiesField |

**Fields:**

| Field | Type |
|-------|------|
| `capabilitiesModuleId` | UUID |
| `databaseId` | UUID |
| `fieldId` | UUID |
| `fromFieldId` | UUID |
| `id` | UUID |
| `mappingFieldId` | UUID |
| `mappingKeyFieldId` | UUID |
| `mappingTableId` | UUID |
| `mode` | String |
| `subsetGuard` | Boolean |
| `tableId` | UUID |

**Required create fields:** `capabilitiesModuleId`, `databaseId`, `fieldId`, `tableId`
**Optional create fields (backend defaults):** `fromFieldId`, `mappingFieldId`, `mappingKeyFieldId`, `mappingTableId`, `mode`, `subsetGuard`

### `database-provision-module`

CRUD operations for DatabaseProvisionModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseProvisionModule records |
| `find-first` | Find first matching databaseProvisionModule record |
| `get` | Get a databaseProvisionModule by id |
| `create` | Create a new databaseProvisionModule |
| `update` | Update an existing databaseProvisionModule |
| `delete` | Delete a databaseProvisionModule |

**Fields:**

| Field | Type |
|-------|------|
| `async` | Boolean |
| `bootstrapActorId` | UUID |
| `bootstrapError` | String |
| `bootstrapStatus` | String |
| `bootstrapUser` | Boolean |
| `completedAt` | Datetime |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `databaseName` | String |
| `domain` | String |
| `errorMessage` | String |
| `fulfilledAt` | Datetime |
| `id` | UUID |
| `modules` | JSON |
| `options` | JSON |
| `ownerId` | UUID |
| `sourceDatabaseId` | UUID |
| `status` | String |
| `subdomain` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseName`, `domain`, `ownerId`
**Optional create fields (backend defaults):** `async`, `bootstrapActorId`, `bootstrapError`, `bootstrapStatus`, `bootstrapUser`, `completedAt`, `databaseId`, `errorMessage`, `fulfilledAt`, `modules`, `options`, `sourceDatabaseId`, `status`, `subdomain`

### `database-settings-module`

CRUD operations for DatabaseSettingsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseSettingsModule records |
| `find-first` | Find first matching databaseSettingsModule record |
| `get` | Get a databaseSettingsModule by id |
| `create` | Create a new databaseSettingsModule |
| `update` | Update an existing databaseSettingsModule |
| `delete` | Delete a databaseSettingsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `databaseSettingsTableId` | UUID |
| `databaseSettingsTableName` | String |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `provisions` | JSON |
| `pubkeySettingsTableId` | UUID |
| `pubkeySettingsTableName` | String |
| `publicSchemaName` | String |
| `rlsSettingsTableId` | UUID |
| `rlsSettingsTableName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `webauthnSettingsTableId` | UUID |
| `webauthnSettingsTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `databaseSettingsTableId`, `databaseSettingsTableName`, `defaultCapabilities`, `entityField`, `entityTableId`, `policies`, `prefix`, `privateApiName`, `provisions`, `pubkeySettingsTableId`, `pubkeySettingsTableName`, `publicSchemaName`, `rlsSettingsTableId`, `rlsSettingsTableName`, `schemaId`, `webauthnSettingsTableId`, `webauthnSettingsTableName`

### `db-pool-config`

CRUD operations for DbPoolConfig records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all dbPoolConfig records |
| `find-first` | Find first matching dbPoolConfig record |
| `get` | Get a dbPoolConfig by id |
| `create` | Create a new dbPoolConfig |
| `update` | Update an existing dbPoolConfig |
| `delete` | Delete a dbPoolConfig |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `domain` | String |
| `enabled` | Boolean |
| `id` | UUID |
| `max` | Int |
| `min` | Int |
| `poolOwnerId` | UUID |
| `presetSlug` | String |
| `updatedAt` | Datetime |
| `warmTtl` | Interval |

**Required create fields:** `domain`, `poolOwnerId`, `presetSlug`
**Optional create fields (backend defaults):** `enabled`, `max`, `min`, `warmTtl`

### `db-pool`

CRUD operations for DbPool records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all dbPool records |
| `find-first` | Find first matching dbPool record |
| `get` | Get a dbPool by id |
| `create` | Create a new dbPool |
| `update` | Update an existing dbPool |
| `delete` | Delete a dbPool |

**Fields:**

| Field | Type |
|-------|------|
| `bootstrapError` | String |
| `bootstrapStatus` | String |
| `claimedAt` | Datetime |
| `claimedBy` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `errorMessage` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `presetCommitId` | UUID |
| `presetSlug` | String |
| `status` | String |
| `updatedAt` | Datetime |

**Required create fields:** `presetSlug`
**Optional create fields (backend defaults):** `bootstrapError`, `bootstrapStatus`, `claimedAt`, `claimedBy`, `databaseId`, `errorMessage`, `expiresAt`, `presetCommitId`, `status`

### `db-preset-module`

CRUD operations for DbPresetModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all dbPresetModule records |
| `find-first` | Find first matching dbPresetModule record |
| `get` | Get a dbPresetModule by id |
| `create` | Create a new dbPresetModule |
| `update` | Update an existing dbPresetModule |
| `delete` | Delete a dbPresetModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `dbPresetsTableId` | UUID |
| `entityTableId` | UUID |
| `id` | UUID |
| `merkleStoreModuleId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaId` | UUID |
| `publicSchemaName` | String |
| `scope` | String |
| `storeName` | String |

**Required create fields:** `databaseId`, `merkleStoreModuleId`, `prefix`, `scope`, `storeName`
**Optional create fields (backend defaults):** `apiName`, `dbPresetsTableId`, `entityTableId`, `policies`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaId`, `publicSchemaName`

### `db-usage-module`

CRUD operations for DbUsageModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all dbUsageModule records |
| `find-first` | Find first matching dbUsageModule record |
| `get` | Get a dbUsageModule by id |
| `create` | Create a new dbUsageModule |
| `update` | Update an existing dbUsageModule |
| `delete` | Delete a dbUsageModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `collectDbQueryStatsFunction` | String |
| `collectDbTableStatsFunction` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `id` | UUID |
| `interval` | String |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `queryStatsLogTableId` | UUID |
| `queryStatsLogTableName` | String |
| `queryStatsSummaryTableId` | UUID |
| `queryStatsSummaryTableName` | String |
| `retention` | String |
| `rollupDbQueryStatsUsageSummaryFunction` | String |
| `rollupDbTableStatsUsageSummaryFunction` | String |
| `schemaId` | UUID |
| `scope` | String |
| `tableStatsLogTableId` | UUID |
| `tableStatsLogTableName` | String |
| `tableStatsSummaryTableId` | UUID |
| `tableStatsSummaryTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `collectDbQueryStatsFunction`, `collectDbTableStatsFunction`, `defaultCapabilities`, `entityField`, `interval`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `queryStatsLogTableId`, `queryStatsLogTableName`, `queryStatsSummaryTableId`, `queryStatsSummaryTableName`, `retention`, `rollupDbQueryStatsUsageSummaryFunction`, `rollupDbTableStatsUsageSummaryFunction`, `schemaId`, `tableStatsLogTableId`, `tableStatsLogTableName`, `tableStatsSummaryTableId`, `tableStatsSummaryTableName`

### `default-ids-module`

CRUD operations for DefaultIdsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all defaultIdsModule records |
| `find-first` | Find first matching defaultIdsModule record |
| `get` | Get a defaultIdsModule by id |
| `create` | Create a new defaultIdsModule |
| `update` | Update an existing defaultIdsModule |
| `delete` | Delete a defaultIdsModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `id` | UUID |

**Required create fields:** `databaseId`

### `denormalized-table-field`

CRUD operations for DenormalizedTableField records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all denormalizedTableField records |
| `find-first` | Find first matching denormalizedTableField record |
| `get` | Get a denormalizedTableField by id |
| `create` | Create a new denormalizedTableField |
| `update` | Update an existing denormalizedTableField |
| `delete` | Delete a denormalizedTableField |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `fieldId` | UUID |
| `funcName` | String |
| `funcOrder` | Int |
| `id` | UUID |
| `refFieldId` | UUID |
| `refIds` | UUID |
| `refTableId` | UUID |
| `setIds` | UUID |
| `tableId` | UUID |
| `updateDefaults` | Boolean |
| `useUpdates` | Boolean |

**Required create fields:** `databaseId`, `fieldId`, `refFieldId`, `refTableId`, `tableId`
**Optional create fields (backend defaults):** `funcName`, `funcOrder`, `refIds`, `setIds`, `updateDefaults`, `useUpdates`

### `devices-module`

CRUD operations for DevicesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all devicesModule records |
| `find-first` | Find first matching devicesModule record |
| `get` | Get a devicesModule by id |
| `create` | Create a new devicesModule |
| `update` | Update an existing devicesModule |
| `delete` | Delete a devicesModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `deviceSettingsTableId` | UUID |
| `deviceSettingsTableName` | String |
| `id` | UUID |
| `schemaId` | UUID |
| `userDevicesTableId` | UUID |
| `userDevicesTableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `deviceSettingsTableId`, `deviceSettingsTableName`, `schemaId`, `userDevicesTableId`, `userDevicesTableName`

### `domain-module`

CRUD operations for DomainModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all domainModule records |
| `find-first` | Find first matching domainModule record |
| `get` | Get a domainModule by id |
| `create` | Create a new domainModule |
| `update` | Update an existing domainModule |
| `delete` | Delete a domainModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `catalogModuleId` | UUID |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `domainEventsTableId` | UUID |
| `domainEventsTableName` | String |
| `domainVerificationsTableId` | UUID |
| `domainVerificationsTableName` | String |
| `domainsTableId` | UUID |
| `domainsTableName` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `managedDomainsTableId` | UUID |
| `managedDomainsTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `catalogModuleId`, `defaultCapabilities`, `domainEventsTableId`, `domainEventsTableName`, `domainVerificationsTableId`, `domainVerificationsTableName`, `domainsTableId`, `domainsTableName`, `entityField`, `entityTableId`, `managedDomainsTableId`, `managedDomainsTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `email-sender-module`

CRUD operations for EmailSenderModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all emailSenderModule records |
| `find-first` | Find first matching emailSenderModule record |
| `get` | Get a emailSenderModule by id |
| `create` | Create a new emailSenderModule |
| `update` | Update an existing emailSenderModule |
| `delete` | Delete a emailSenderModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `emailIdentitiesTableId` | UUID |
| `emailIdentitiesTableName` | String |
| `emailProviderAccountsTableId` | UUID |
| `emailProviderAccountsTableName` | String |
| `emailSiteIdentitiesTableId` | UUID |
| `emailSiteIdentitiesTableName` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `siteSurfaceModuleId` | UUID |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `emailIdentitiesTableId`, `emailIdentitiesTableName`, `emailProviderAccountsTableId`, `emailProviderAccountsTableName`, `emailSiteIdentitiesTableId`, `emailSiteIdentitiesTableName`, `entityField`, `entityTableId`, `policies`, `prefix`, `privateApiName`, `provisions`, `publicSchemaName`, `schemaId`, `siteSurfaceModuleId`

### `emails-module`

CRUD operations for EmailsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all emailsModule records |
| `find-first` | Find first matching emailsModule record |
| `get` | Get a emailsModule by id |
| `create` | Create a new emailsModule |
| `update` | Update an existing emailsModule |
| `delete` | Delete a emailsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `ownerTableId` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `tableName`
**Optional create fields (backend defaults):** `apiName`, `ownerTableId`, `privateApiName`, `privateSchemaId`, `schemaId`, `tableId`

### `entity-type-provision`

CRUD operations for EntityTypeProvision records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all entityTypeProvision records |
| `find-first` | Find first matching entityTypeProvision record |
| `get` | Get a entityTypeProvision by id |
| `create` | Create a new entityTypeProvision |
| `update` | Update an existing entityTypeProvision |
| `delete` | Delete a entityTypeProvision |

**Fields:**

| Field | Type |
|-------|------|
| `agents` | JSON |
| `databaseId` | UUID |
| `description` | String |
| `functions` | JSON |
| `graphs` | JSON |
| `hasInviteAchievements` | Boolean |
| `hasInvites` | Boolean |
| `hasLevels` | Boolean |
| `hasLimits` | Boolean |
| `hasProfiles` | Boolean |
| `id` | UUID |
| `isVisible` | Boolean |
| `name` | String |
| `namespaces` | JSON |
| `outAgentModuleId` | UUID |
| `outDefinitionsTableId` | UUID |
| `outEntityTableId` | UUID |
| `outEntityTableName` | String |
| `outExecutionLogsTableId` | UUID |
| `outFunctionModuleId` | UUID |
| `outGraphModuleId` | UUID |
| `outGraphsTableId` | UUID |
| `outInstalledModules` | String |
| `outInvitesModuleId` | UUID |
| `outInvocationsTableId` | UUID |
| `outMembershipType` | Int |
| `outNamespaceEventsTableId` | UUID |
| `outNamespaceModuleId` | UUID |
| `outNamespacesTableId` | UUID |
| `parentEntity` | String |
| `prefix` | String |
| `skipEntityPolicies` | Boolean |
| `storage` | JSON |
| `tableName` | String |
| `tableProvision` | JSON |

**Required create fields:** `databaseId`, `name`, `prefix`
**Optional create fields (backend defaults):** `agents`, `description`, `functions`, `graphs`, `hasInviteAchievements`, `hasInvites`, `hasLevels`, `hasLimits`, `hasProfiles`, `isVisible`, `namespaces`, `outAgentModuleId`, `outDefinitionsTableId`, `outEntityTableId`, `outEntityTableName`, `outExecutionLogsTableId`, `outFunctionModuleId`, `outGraphModuleId`, `outGraphsTableId`, `outInstalledModules`, `outInvitesModuleId`, `outInvocationsTableId`, `outMembershipType`, `outNamespaceEventsTableId`, `outNamespaceModuleId`, `outNamespacesTableId`, `parentEntity`, `skipEntityPolicies`, `storage`, `tableName`, `tableProvision`

### `events-module`

CRUD operations for EventsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all eventsModule records |
| `find-first` | Find first matching eventsModule record |
| `get` | Get a eventsModule by id |
| `create` | Create a new eventsModule |
| `update` | Update an existing eventsModule |
| `delete` | Delete a eventsModule |

**Fields:**

| Field | Type |
|-------|------|
| `achievementRewardsTableId` | UUID |
| `achievementRewardsTableName` | String |
| `actorTableId` | UUID |
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `eventAggregatesTableId` | UUID |
| `eventAggregatesTableName` | String |
| `eventTypesTableId` | UUID |
| `eventTypesTableName` | String |
| `eventsTableId` | UUID |
| `eventsTableName` | String |
| `expireGrants` | String |
| `grantAchievement` | String |
| `id` | UUID |
| `interval` | String |
| `levelAchieved` | String |
| `levelGrantsTableId` | UUID |
| `levelGrantsTableName` | String |
| `levelRequirementsTableId` | UUID |
| `levelRequirementsTableName` | String |
| `levelsTableId` | UUID |
| `levelsTableName` | String |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `recomputeCapabilities` | String |
| `recordError` | String |
| `recordEvent` | String |
| `removeEvent` | String |
| `retention` | String |
| `revokeAchievement` | String |
| `schemaId` | UUID |
| `scope` | String |
| `stepsRequired` | String |
| `tgAchievementReward` | String |
| `tgCheckAchievements` | String |
| `tgEvent` | String |
| `tgEventBool` | String |
| `tgEventToggle` | String |
| `tgEventToggleBool` | String |
| `tgLevelGrantSync` | String |
| `tgUpdateAggregates` | String |
| `trustLadder` | JSON |
| `upsertAggregate` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `achievementRewardsTableId`, `achievementRewardsTableName`, `actorTableId`, `apiName`, `defaultCapabilities`, `entityField`, `entityTableId`, `eventAggregatesTableId`, `eventAggregatesTableName`, `eventTypesTableId`, `eventTypesTableName`, `eventsTableId`, `eventsTableName`, `expireGrants`, `grantAchievement`, `interval`, `levelAchieved`, `levelGrantsTableId`, `levelGrantsTableName`, `levelRequirementsTableId`, `levelRequirementsTableName`, `levelsTableId`, `levelsTableName`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `recomputeCapabilities`, `recordError`, `recordEvent`, `removeEvent`, `retention`, `revokeAchievement`, `schemaId`, `stepsRequired`, `tgAchievementReward`, `tgCheckAchievements`, `tgEvent`, `tgEventBool`, `tgEventToggle`, `tgEventToggleBool`, `tgLevelGrantSync`, `tgUpdateAggregates`, `trustLadder`, `upsertAggregate`

### `file-ref-field`

CRUD operations for FileRefField records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all fileRefField records |
| `find-first` | Find first matching fileRefField record |
| `get` | Get a fileRefField by id |
| `create` | Create a new fileRefField |
| `update` | Update an existing fileRefField |
| `delete` | Delete a fileRefField |

**Fields:**

| Field | Type |
|-------|------|
| `bucketKey` | String |
| `bucketTags` | String |
| `databaseId` | UUID |
| `enforceFk` | Boolean |
| `fieldId` | UUID |
| `id` | UUID |
| `isPublic` | Boolean |
| `storageModuleId` | UUID |
| `tableId` | UUID |

**Required create fields:** `databaseId`, `fieldId`, `storageModuleId`, `tableId`
**Optional create fields (backend defaults):** `bucketKey`, `bucketTags`, `enforceFk`, `isPublic`

### `function-deployment-module`

CRUD operations for FunctionDeploymentModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionDeploymentModule records |
| `find-first` | Find first matching functionDeploymentModule record |
| `get` | Get a functionDeploymentModule by id |
| `create` | Create a new functionDeploymentModule |
| `update` | Update an existing functionDeploymentModule |
| `delete` | Delete a functionDeploymentModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `deploymentEventsTableId` | UUID |
| `deploymentEventsTableName` | String |
| `deploymentsTableId` | UUID |
| `deploymentsTableName` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `functionModuleId` | UUID |
| `id` | UUID |
| `namespaceModuleId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `deploymentEventsTableId`, `deploymentEventsTableName`, `deploymentsTableId`, `deploymentsTableName`, `entityField`, `entityTableId`, `functionModuleId`, `namespaceModuleId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `function-invocation-module`

CRUD operations for FunctionInvocationModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionInvocationModule records |
| `find-first` | Find first matching functionInvocationModule record |
| `get` | Get a functionInvocationModule by id |
| `create` | Create a new functionInvocationModule |
| `update` | Update an existing functionInvocationModule |
| `delete` | Delete a functionInvocationModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `attemptsTableId` | UUID |
| `attemptsTableName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `executionLogsTableId` | UUID |
| `executionLogsTableName` | String |
| `id` | UUID |
| `invocationsTableId` | UUID |
| `invocationsTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `attemptsTableId`, `attemptsTableName`, `defaultCapabilities`, `entityField`, `entityTableId`, `executionLogsTableId`, `executionLogsTableName`, `invocationsTableId`, `invocationsTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `function-module`

CRUD operations for FunctionModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all functionModule records |
| `find-first` | Find first matching functionModule record |
| `get` | Get a functionModule by id |
| `create` | Create a new functionModule |
| `update` | Update an existing functionModule |
| `delete` | Delete a functionModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `bindingsTableId` | UUID |
| `bindingsTableName` | String |
| `capabilityBindingsTableId` | UUID |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `definitionsTableId` | UUID |
| `definitionsTableName` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `hasCron` | Boolean |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schedulesTableId` | UUID |
| `schemaId` | UUID |
| `scope` | String |
| `storageKey` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `bindingsTableId`, `bindingsTableName`, `capabilityBindingsTableId`, `defaultCapabilities`, `definitionsTableId`, `definitionsTableName`, `entityField`, `entityTableId`, `hasCron`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schedulesTableId`, `schemaId`, `storageKey`

### `graph-execution-module`

CRUD operations for GraphExecutionModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all graphExecutionModule records |
| `find-first` | Find first matching graphExecutionModule record |
| `get` | Get a graphExecutionModule by id |
| `create` | Create a new graphExecutionModule |
| `update` | Update an existing graphExecutionModule |
| `delete` | Delete a graphExecutionModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `executionsTableId` | UUID |
| `executionsTableName` | String |
| `graphModuleId` | UUID |
| `id` | UUID |
| `nodeStatesTableId` | UUID |
| `nodeStatesTableName` | String |
| `outputsTableId` | UUID |
| `outputsTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `graphModuleId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `entityField`, `entityTableId`, `executionsTableId`, `executionsTableName`, `nodeStatesTableId`, `nodeStatesTableName`, `outputsTableId`, `outputsTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `graph-module`

CRUD operations for GraphModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all graphModule records |
| `find-first` | Find first matching graphModule record |
| `get` | Get a graphModule by id |
| `create` | Create a new graphModule |
| `update` | Update an existing graphModule |
| `delete` | Delete a graphModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `graphsTableId` | UUID |
| `id` | UUID |
| `merkleStoreModuleId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaId` | UUID |
| `publicSchemaName` | String |
| `scope` | String |

**Required create fields:** `databaseId`, `merkleStoreModuleId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `entityField`, `entityTableId`, `graphsTableId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaId`, `publicSchemaName`

### `hierarchy-module`

CRUD operations for HierarchyModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all hierarchyModule records |
| `find-first` | Find first matching hierarchyModule record |
| `get` | Get a hierarchyModule by id |
| `create` | Create a new hierarchyModule |
| `update` | Update an existing hierarchyModule |
| `delete` | Delete a hierarchyModule |

**Fields:**

| Field | Type |
|-------|------|
| `chartEdgeGrantsTableId` | UUID |
| `chartEdgeGrantsTableName` | String |
| `chartEdgesTableId` | UUID |
| `chartEdgesTableName` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `getManagersFunction` | String |
| `getSubordinatesFunction` | String |
| `hierarchySprtTableId` | UUID |
| `hierarchySprtTableName` | String |
| `id` | UUID |
| `isManagerOfFunction` | String |
| `prefix` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `rebuildHierarchyFunction` | String |
| `schemaId` | UUID |
| `scope` | String |
| `sprtTableName` | String |
| `usersTableId` | UUID |

**Required create fields:** `databaseId`, `entityTableId`, `scope`, `usersTableId`
**Optional create fields (backend defaults):** `chartEdgeGrantsTableId`, `chartEdgeGrantsTableName`, `chartEdgesTableId`, `chartEdgesTableName`, `defaultCapabilities`, `entityField`, `getManagersFunction`, `getSubordinatesFunction`, `hierarchySprtTableId`, `hierarchySprtTableName`, `isManagerOfFunction`, `prefix`, `privateSchemaId`, `privateSchemaName`, `rebuildHierarchyFunction`, `schemaId`, `sprtTableName`

### `i-18-n-module`

CRUD operations for I18NModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all i18NModule records |
| `find-first` | Find first matching i18NModule record |
| `get` | Get a i18NModule by id |
| `create` | Create a new i18NModule |
| `update` | Update an existing i18NModule |
| `delete` | Delete a i18NModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `schemaId` | UUID |
| `settingsTableId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `privateApiName`, `privateSchemaId`, `schemaId`, `settingsTableId`

### `identity-providers-module`

CRUD operations for IdentityProvidersModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all identityProvidersModule records |
| `find-first` | Find first matching identityProvidersModule record |
| `get` | Get a identityProvidersModule by id |
| `create` | Create a new identityProvidersModule |
| `update` | Update an existing identityProvidersModule |
| `delete` | Delete a identityProvidersModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `entityTableId`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `schemaId`, `tableId`, `tableName`

### `image-module`

CRUD operations for ImageModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all imageModule records |
| `find-first` | Find first matching imageModule record |
| `get` | Get a imageModule by id |
| `create` | Create a new imageModule |
| `update` | Update an existing imageModule |
| `delete` | Delete a imageModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `imageGrantsTableId` | UUID |
| `imageGrantsTableName` | String |
| `imagesTableId` | UUID |
| `imagesTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `registriesTableId` | UUID |
| `registriesTableName` | String |
| `registryGrantsTableId` | UUID |
| `registryGrantsTableName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `entityField`, `entityTableId`, `imageGrantsTableId`, `imageGrantsTableName`, `imagesTableId`, `imagesTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `registriesTableId`, `registriesTableName`, `registryGrantsTableId`, `registryGrantsTableName`, `schemaId`

### `inference-log-module`

CRUD operations for InferenceLogModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all inferenceLogModule records |
| `find-first` | Find first matching inferenceLogModule record |
| `get` | Get a inferenceLogModule by id |
| `create` | Create a new inferenceLogModule |
| `update` | Update an existing inferenceLogModule |
| `delete` | Delete a inferenceLogModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `id` | UUID |
| `inferenceLogTableId` | UUID |
| `inferenceLogTableName` | String |
| `inferencePriceTableId` | UUID |
| `inferencePriceTableName` | String |
| `interval` | String |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `retention` | String |
| `rollupFunctionName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `usageSummaryTableId` | UUID |
| `usageSummaryTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `inferenceLogTableId`, `inferenceLogTableName`, `inferencePriceTableId`, `inferencePriceTableName`, `interval`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `retention`, `rollupFunctionName`, `schemaId`, `usageSummaryTableId`, `usageSummaryTableName`

### `infra-config-module`

CRUD operations for InfraConfigModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all infraConfigModule records |
| `find-first` | Find first matching infraConfigModule record |
| `get` | Get a infraConfigModule by id |
| `create` | Create a new infraConfigModule |
| `update` | Update an existing infraConfigModule |
| `delete` | Delete a infraConfigModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `configTableId` | UUID |
| `configTableName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `configTableId`, `configTableName`, `entityField`, `entityTableId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `infra-secrets-module`

CRUD operations for InfraSecretsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all infraSecretsModule records |
| `find-first` | Find first matching infraSecretsModule record |
| `get` | Get a infraSecretsModule by id |
| `create` | Create a new infraSecretsModule |
| `update` | Update an existing infraSecretsModule |
| `delete` | Delete a infraSecretsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `secretsTableId` | UUID |
| `secretsTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `entityTableId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`, `secretsTableId`, `secretsTableName`

### `integration-providers-module`

CRUD operations for IntegrationProvidersModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all integrationProvidersModule records |
| `find-first` | Find first matching integrationProvidersModule record |
| `get` | Get a integrationProvidersModule by id |
| `create` | Create a new integrationProvidersModule |
| `update` | Update an existing integrationProvidersModule |
| `delete` | Delete a integrationProvidersModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `entityTableId`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `schemaId`, `tableId`, `tableName`

### `internal-config-module`

CRUD operations for InternalConfigModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all internalConfigModule records |
| `find-first` | Find first matching internalConfigModule record |
| `get` | Get a internalConfigModule by id |
| `create` | Create a new internalConfigModule |
| `update` | Update an existing internalConfigModule |
| `delete` | Delete a internalConfigModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `internalConfigTableId` | UUID |
| `internalConfigTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `entityTableId`, `internalConfigTableId`, `internalConfigTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `internal-secrets-module`

CRUD operations for InternalSecretsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all internalSecretsModule records |
| `find-first` | Find first matching internalSecretsModule record |
| `get` | Get a internalSecretsModule by id |
| `create` | Create a new internalSecretsModule |
| `update` | Update an existing internalSecretsModule |
| `delete` | Delete a internalSecretsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `internalSecretsTableId` | UUID |
| `internalSecretsTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `entityTableId`, `internalSecretsTableId`, `internalSecretsTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `invites-module`

CRUD operations for InvitesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all invitesModule records |
| `find-first` | Find first matching invitesModule record |
| `get` | Get a invitesModule by id |
| `create` | Create a new invitesModule |
| `update` | Update an existing invitesModule |
| `delete` | Delete a invitesModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `claimedInvitesTableId` | UUID |
| `claimedInvitesTableName` | String |
| `databaseId` | UUID |
| `emailsTableId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `invitesTableId` | UUID |
| `invitesTableName` | String |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `submitInviteCodeFunction` | String |
| `usersTableId` | UUID |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `claimedInvitesTableId`, `claimedInvitesTableName`, `emailsTableId`, `entityField`, `entityTableId`, `invitesTableId`, `invitesTableName`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `schemaId`, `submitInviteCodeFunction`, `usersTableId`

### `k-8-s-admission-module`

CRUD operations for K8sAdmissionModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all k8sAdmissionModule records |
| `find-first` | Find first matching k8sAdmissionModule record |
| `get` | Get a k8sAdmissionModule by id |
| `create` | Create a new k8sAdmissionModule |
| `update` | Update an existing k8sAdmissionModule |
| `delete` | Delete a k8sAdmissionModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `entityTableId` | UUID |
| `id` | UUID |
| `k8sResourceKindsTableId` | UUID |
| `k8sSpecRulesTableId` | UUID |
| `merkleStoreModuleId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaId` | UUID |
| `publicSchemaName` | String |
| `scope` | String |
| `storeName` | String |

**Required create fields:** `databaseId`, `merkleStoreModuleId`, `prefix`, `scope`, `storeName`
**Optional create fields (backend defaults):** `apiName`, `entityTableId`, `k8sResourceKindsTableId`, `k8sSpecRulesTableId`, `policies`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaId`, `publicSchemaName`

### `limits-module`

CRUD operations for LimitsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all limitsModule records |
| `find-first` | Find first matching limitsModule record |
| `get` | Get a limitsModule by id |
| `create` | Create a new limitsModule |
| `update` | Update an existing limitsModule |
| `delete` | Delete a limitsModule |

**Fields:**

| Field | Type |
|-------|------|
| `actorTableId` | UUID |
| `aggregateTableId` | UUID |
| `apiName` | String |
| `capCheckTrigger` | String |
| `creditCodeItemsTableId` | UUID |
| `creditCodesTableId` | UUID |
| `creditRedemptionsTableId` | UUID |
| `databaseId` | UUID |
| `defaultTableId` | UUID |
| `defaultTableName` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `eventsTableId` | UUID |
| `id` | UUID |
| `limitAggregateCheckSoftFunction` | String |
| `limitCapsDefaultsTableId` | UUID |
| `limitCapsTableId` | UUID |
| `limitCheckFunction` | String |
| `limitCheckSoftFunction` | String |
| `limitCreditsTableId` | UUID |
| `limitDecrementFunction` | String |
| `limitDecrementTrigger` | String |
| `limitDefaults` | JSON |
| `limitIncrementFunction` | String |
| `limitIncrementTrigger` | String |
| `limitUpdateTrigger` | String |
| `limitWarningStateTableId` | UUID |
| `limitWarningsTableId` | UUID |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `resolveCapFunction` | String |
| `schemaId` | UUID |
| `scope` | String |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `actorTableId`, `aggregateTableId`, `apiName`, `capCheckTrigger`, `creditCodeItemsTableId`, `creditCodesTableId`, `creditRedemptionsTableId`, `defaultTableId`, `defaultTableName`, `entityField`, `entityTableId`, `eventsTableId`, `limitAggregateCheckSoftFunction`, `limitCapsDefaultsTableId`, `limitCapsTableId`, `limitCheckFunction`, `limitCheckSoftFunction`, `limitCreditsTableId`, `limitDecrementFunction`, `limitDecrementTrigger`, `limitDefaults`, `limitIncrementFunction`, `limitIncrementTrigger`, `limitUpdateTrigger`, `limitWarningStateTableId`, `limitWarningsTableId`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `resolveCapFunction`, `schemaId`, `tableId`, `tableName`

### `machine-module`

CRUD operations for MachineModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all machineModule records |
| `find-first` | Find first matching machineModule record |
| `get` | Get a machineModule by id |
| `create` | Create a new machineModule |
| `update` | Update an existing machineModule |
| `delete` | Delete a machineModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `machineMessagesTableId` | UUID |
| `machineMessagesTableName` | String |
| `machineSessionsTableId` | UUID |
| `machineSessionsTableName` | String |
| `machinesTableId` | UUID |
| `machinesTableName` | String |
| `partitionInterval` | String |
| `policies` | JSON |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `retention` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `entityField`, `entityTableId`, `machineMessagesTableId`, `machineMessagesTableName`, `machineSessionsTableId`, `machineSessionsTableName`, `machinesTableId`, `machinesTableName`, `partitionInterval`, `policies`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `retention`, `schemaId`

### `membership-types-module`

CRUD operations for MembershipTypesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all membershipTypesModule records |
| `find-first` | Find first matching membershipTypesModule record |
| `get` | Get a membershipTypesModule by id |
| `create` | Create a new membershipTypesModule |
| `update` | Update an existing membershipTypesModule |
| `delete` | Delete a membershipTypesModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `id` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `schemaId`, `tableId`, `tableName`

### `memberships-module`

CRUD operations for MembershipsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all membershipsModule records |
| `find-first` | Find first matching membershipsModule record |
| `get` | Get a membershipsModule by id |
| `create` | Create a new membershipsModule |
| `update` | Update an existing membershipsModule |
| `delete` | Delete a membershipsModule |

**Fields:**

| Field | Type |
|-------|------|
| `actorMaskCheck` | String |
| `actorPermCheck` | String |
| `actorTableId` | UUID |
| `adminGrantsTableId` | UUID |
| `adminGrantsTableName` | String |
| `apiName` | String |
| `capabilitiesTableId` | UUID |
| `capabilityDefaultCapabilitiesTableId` | UUID |
| `capabilityDefaultGrantsTableId` | UUID |
| `databaseId` | UUID |
| `defaultCapabilitiesTableId` | UUID |
| `defaultLimitsTableId` | UUID |
| `entityField` | String |
| `entityIdsByMask` | String |
| `entityIdsByPerm` | String |
| `entityIdsFunction` | String |
| `entityTableId` | UUID |
| `entityTableOwnerId` | UUID |
| `getOrgFn` | String |
| `grantsTableId` | UUID |
| `grantsTableName` | String |
| `id` | UUID |
| `limitsTableId` | UUID |
| `memberProfilesTableId` | UUID |
| `membersTableId` | UUID |
| `membersTableName` | String |
| `membershipDefaultsTableId` | UUID |
| `membershipDefaultsTableName` | String |
| `membershipSettingsTableId` | UUID |
| `membershipSettingsTableName` | String |
| `membershipsTableId` | UUID |
| `membershipsTableName` | String |
| `ownerGrantsTableId` | UUID |
| `ownerGrantsTableName` | String |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `sprtTableId` | UUID |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `actorMaskCheck`, `actorPermCheck`, `actorTableId`, `adminGrantsTableId`, `adminGrantsTableName`, `apiName`, `capabilitiesTableId`, `capabilityDefaultCapabilitiesTableId`, `capabilityDefaultGrantsTableId`, `defaultCapabilitiesTableId`, `defaultLimitsTableId`, `entityField`, `entityIdsByMask`, `entityIdsByPerm`, `entityIdsFunction`, `entityTableId`, `entityTableOwnerId`, `getOrgFn`, `grantsTableId`, `grantsTableName`, `limitsTableId`, `memberProfilesTableId`, `membersTableId`, `membersTableName`, `membershipDefaultsTableId`, `membershipDefaultsTableName`, `membershipSettingsTableId`, `membershipSettingsTableName`, `membershipsTableId`, `membershipsTableName`, `ownerGrantsTableId`, `ownerGrantsTableName`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `schemaId`, `sprtTableId`

### `merkle-store-module`

CRUD operations for MerkleStoreModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all merkleStoreModule records |
| `find-first` | Find first matching merkleStoreModule record |
| `get` | Get a merkleStoreModule by id |
| `create` | Create a new merkleStoreModule |
| `update` | Update an existing merkleStoreModule |
| `delete` | Delete a merkleStoreModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `capabilityKey` | String |
| `commitTableId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `functionPrefix` | String |
| `id` | UUID |
| `objectTableId` | UUID |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `refTableId` | UUID |
| `schemaId` | UUID |
| `scope` | String |
| `storeTableId` | UUID |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `capabilityKey`, `commitTableId`, `entityField`, `entityTableId`, `functionPrefix`, `objectTableId`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `refTableId`, `schemaId`, `storeTableId`

### `namespace-module`

CRUD operations for NamespaceModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all namespaceModule records |
| `find-first` | Find first matching namespaceModule record |
| `get` | Get a namespaceModule by id |
| `create` | Create a new namespaceModule |
| `update` | Update an existing namespaceModule |
| `delete` | Delete a namespaceModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `namespaceEventsTableId` | UUID |
| `namespaceEventsTableName` | String |
| `namespacesTableId` | UUID |
| `namespacesTableName` | String |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `entityField`, `entityTableId`, `namespaceEventsTableId`, `namespaceEventsTableName`, `namespacesTableId`, `namespacesTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`

### `notifications-module`

CRUD operations for NotificationsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all notificationsModule records |
| `find-first` | Find first matching notificationsModule record |
| `get` | Get a notificationsModule by id |
| `create` | Create a new notificationsModule |
| `update` | Update an existing notificationsModule |
| `delete` | Delete a notificationsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `channelsTableId` | UUID |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `deliveryLogTableId` | UUID |
| `entityField` | String |
| `hasChannels` | Boolean |
| `hasDigestMetadata` | Boolean |
| `hasPreferences` | Boolean |
| `hasSettingsExtension` | Boolean |
| `hasSubscriptions` | Boolean |
| `id` | UUID |
| `notificationsTableId` | UUID |
| `organizationSettingsTableId` | UUID |
| `ownerTableId` | UUID |
| `preferencesTableId` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `readStateTableId` | UUID |
| `schemaId` | UUID |
| `suppressionsTableId` | UUID |
| `userSettingsTableId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `channelsTableId`, `defaultCapabilities`, `deliveryLogTableId`, `entityField`, `hasChannels`, `hasDigestMetadata`, `hasPreferences`, `hasSettingsExtension`, `hasSubscriptions`, `notificationsTableId`, `organizationSettingsTableId`, `ownerTableId`, `preferencesTableId`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `readStateTableId`, `schemaId`, `suppressionsTableId`, `userSettingsTableId`

### `oauth-requests-module`

CRUD operations for OauthRequestsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all oauthRequestsModule records |
| `find-first` | Find first matching oauthRequestsModule record |
| `get` | Get a oauthRequestsModule by id |
| `create` | Create a new oauthRequestsModule |
| `update` | Update an existing oauthRequestsModule |
| `delete` | Delete a oauthRequestsModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `oauthAuthorizationRequestsTableId` | UUID |
| `oauthAuthorizationRequestsTableName` | String |
| `pendingIdentityLinksTableId` | UUID |
| `pendingIdentityLinksTableName` | String |
| `prefix` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `entityField`, `entityTableId`, `oauthAuthorizationRequestsTableId`, `oauthAuthorizationRequestsTableName`, `pendingIdentityLinksTableId`, `pendingIdentityLinksTableName`, `prefix`, `privateSchemaId`, `privateSchemaName`

### `pages-module`

CRUD operations for PagesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all pagesModule records |
| `find-first` | Find first matching pagesModule record |
| `get` | Get a pagesModule by id |
| `create` | Create a new pagesModule |
| `update` | Update an existing pagesModule |
| `delete` | Delete a pagesModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `entityTableId` | UUID |
| `id` | UUID |
| `merkleStoreModuleId` | UUID |
| `pagesTableId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `previewCommitFunctionName` | String |
| `previewSetFunctionName` | String |
| `previewTokenMintFunctionName` | String |
| `previewTokenVerifierFunctionName` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaId` | UUID |
| `publicSchemaName` | String |
| `releaseManifestFunctionName` | String |
| `scope` | String |
| `siteSurfaceModuleId` | UUID |
| `sitesTableId` | UUID |
| `storeNamePrefix` | String |

**Required create fields:** `databaseId`, `merkleStoreModuleId`, `prefix`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityTableId`, `pagesTableId`, `policies`, `previewCommitFunctionName`, `previewSetFunctionName`, `previewTokenMintFunctionName`, `previewTokenVerifierFunctionName`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaId`, `publicSchemaName`, `releaseManifestFunctionName`, `siteSurfaceModuleId`, `sitesTableId`, `storeNamePrefix`

### `phone-numbers-module`

CRUD operations for PhoneNumbersModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all phoneNumbersModule records |
| `find-first` | Find first matching phoneNumbersModule record |
| `get` | Get a phoneNumbersModule by id |
| `create` | Create a new phoneNumbersModule |
| `update` | Update an existing phoneNumbersModule |
| `delete` | Delete a phoneNumbersModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `ownerTableId` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `tableName`
**Optional create fields (backend defaults):** `apiName`, `ownerTableId`, `privateApiName`, `privateSchemaId`, `schemaId`, `tableId`

### `plans-module`

CRUD operations for PlansModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all plansModule records |
| `find-first` | Find first matching plansModule record |
| `get` | Get a plansModule by id |
| `create` | Create a new plansModule |
| `update` | Update an existing plansModule |
| `delete` | Delete a plansModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `applyBillingPlanFunction` | String |
| `applyPlanAggregateFunction` | String |
| `applyPlanCapsFunction` | String |
| `applyPlanFunction` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `planCapsTableId` | UUID |
| `planLimitsTableId` | UUID |
| `planLimitsTableName` | String |
| `planMeterLimitsTableId` | UUID |
| `planPricingTableId` | UUID |
| `plansTableId` | UUID |
| `plansTableName` | String |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `schemaId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `applyBillingPlanFunction`, `applyPlanAggregateFunction`, `applyPlanCapsFunction`, `applyPlanFunction`, `planCapsTableId`, `planLimitsTableId`, `planLimitsTableName`, `planMeterLimitsTableId`, `planPricingTableId`, `plansTableId`, `plansTableName`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `schemaId`

### `principal-auth-module`

CRUD operations for PrincipalAuthModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all principalAuthModule records |
| `find-first` | Find first matching principalAuthModule record |
| `get` | Get a principalAuthModule by id |
| `create` | Create a new principalAuthModule |
| `update` | Update an existing principalAuthModule |
| `delete` | Delete a principalAuthModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `auditsTableId` | UUID |
| `createOrgApiKeyFunction` | String |
| `createOrgPrincipalFunction` | String |
| `createPrincipalFunction` | String |
| `databaseId` | UUID |
| `deleteOrgPrincipalFunction` | String |
| `deletePrincipalFunction` | String |
| `id` | UUID |
| `principalEntitiesTableId` | UUID |
| `principalScopeOverridesTableId` | UUID |
| `principalsTableId` | UUID |
| `principalsTableName` | String |
| `privateSchemaId` | UUID |
| `revokeOrgApiKeyFunction` | String |
| `schemaId` | UUID |
| `sessionCredentialsTableId` | UUID |
| `sessionsTableId` | UUID |
| `sweepExpiredPrincipalsFunction` | String |
| `usersTableId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `auditsTableId`, `createOrgApiKeyFunction`, `createOrgPrincipalFunction`, `createPrincipalFunction`, `deleteOrgPrincipalFunction`, `deletePrincipalFunction`, `principalEntitiesTableId`, `principalScopeOverridesTableId`, `principalsTableId`, `principalsTableName`, `privateSchemaId`, `revokeOrgApiKeyFunction`, `schemaId`, `sessionCredentialsTableId`, `sessionsTableId`, `sweepExpiredPrincipalsFunction`, `usersTableId`

### `profiles-module`

CRUD operations for ProfilesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all profilesModule records |
| `find-first` | Find first matching profilesModule record |
| `get` | Get a profilesModule by id |
| `create` | Create a new profilesModule |
| `update` | Update an existing profilesModule |
| `delete` | Delete a profilesModule |

**Fields:**

| Field | Type |
|-------|------|
| `actorTableId` | UUID |
| `apiName` | String |
| `capabilitiesTableId` | UUID |
| `databaseId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `membershipProfilesTableId` | UUID |
| `membershipProfilesTableName` | String |
| `membershipsTableId` | UUID |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `profileCapabilitiesTableId` | UUID |
| `profileCapabilitiesTableName` | String |
| `profileDefinitionGrantsTableId` | UUID |
| `profileDefinitionGrantsTableName` | String |
| `profileGrantsTableId` | UUID |
| `profileGrantsTableName` | String |
| `profileTemplatesTableId` | UUID |
| `profileTemplatesTableName` | String |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `actorTableId`, `apiName`, `capabilitiesTableId`, `entityField`, `entityTableId`, `membershipProfilesTableId`, `membershipProfilesTableName`, `membershipsTableId`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `profileCapabilitiesTableId`, `profileCapabilitiesTableName`, `profileDefinitionGrantsTableId`, `profileDefinitionGrantsTableName`, `profileGrantsTableId`, `profileGrantsTableName`, `profileTemplatesTableId`, `profileTemplatesTableName`, `publicSchemaName`, `schemaId`, `tableId`, `tableName`

### `rate-limit-meters-module`

CRUD operations for RateLimitMetersModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all rateLimitMetersModule records |
| `find-first` | Find first matching rateLimitMetersModule record |
| `get` | Get a rateLimitMetersModule by id |
| `create` | Create a new rateLimitMetersModule |
| `update` | Update an existing rateLimitMetersModule |
| `delete` | Delete a rateLimitMetersModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `checkRateLimitFunction` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `id` | UUID |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `rateLimitOverridesTableId` | UUID |
| `rateLimitOverridesTableName` | String |
| `rateLimitStateTableId` | UUID |
| `rateLimitStateTableName` | String |
| `rateWindowLimitsTableId` | UUID |
| `rateWindowLimitsTableName` | String |
| `schemaId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `checkRateLimitFunction`, `defaultCapabilities`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `rateLimitOverridesTableId`, `rateLimitOverridesTableName`, `rateLimitStateTableId`, `rateLimitStateTableName`, `rateWindowLimitsTableId`, `rateWindowLimitsTableName`, `schemaId`

### `rate-limits-module`

CRUD operations for RateLimitsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all rateLimitsModule records |
| `find-first` | Find first matching rateLimitsModule record |
| `get` | Get a rateLimitsModule by id |
| `create` | Create a new rateLimitsModule |
| `update` | Update an existing rateLimitsModule |
| `delete` | Delete a rateLimitsModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `id` | UUID |
| `ipRateLimitsTableId` | UUID |
| `ipRateLimitsTableName` | String |
| `rateLimitSettingsTableId` | UUID |
| `rateLimitSettingsTableName` | String |
| `rateLimitsTableId` | UUID |
| `rateLimitsTableName` | String |
| `schemaId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `ipRateLimitsTableId`, `ipRateLimitsTableName`, `rateLimitSettingsTableId`, `rateLimitSettingsTableName`, `rateLimitsTableId`, `rateLimitsTableName`, `schemaId`

### `realtime-module`

CRUD operations for RealtimeModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all realtimeModule records |
| `find-first` | Find first matching realtimeModule record |
| `get` | Get a realtimeModule by id |
| `create` | Create a new realtimeModule |
| `update` | Update an existing realtimeModule |
| `delete` | Delete a realtimeModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `changeLogTableId` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `interval` | String |
| `listenerNodeTableId` | UUID |
| `notifyChannel` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `retentionHours` | Int |
| `schemaId` | UUID |
| `sourceRegistryTableId` | UUID |
| `subscriptionsSchemaId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `changeLogTableId`, `interval`, `listenerNodeTableId`, `notifyChannel`, `premake`, `privateApiName`, `privateSchemaId`, `retentionHours`, `schemaId`, `sourceRegistryTableId`, `subscriptionsSchemaId`

### `refusal-log-module`

CRUD operations for RefusalLogModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all refusalLogModule records |
| `find-first` | Find first matching refusalLogModule record |
| `get` | Get a refusalLogModule by id |
| `create` | Create a new refusalLogModule |
| `update` | Update an existing refusalLogModule |
| `delete` | Delete a refusalLogModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `id` | UUID |
| `logInterval` | String |
| `logPremake` | Int |
| `logRetention` | String |
| `logTableId` | UUID |
| `logTableName` | String |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `recordRefusalsFunction` | String |
| `rollupRefusalUsageSummaryFunction` | String |
| `schemaId` | UUID |
| `scope` | String |
| `summaryInterval` | String |
| `summaryPremake` | Int |
| `summaryRetention` | String |
| `summaryTableId` | UUID |
| `summaryTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `logInterval`, `logPremake`, `logRetention`, `logTableId`, `logTableName`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `recordRefusalsFunction`, `rollupRefusalUsageSummaryFunction`, `schemaId`, `summaryInterval`, `summaryPremake`, `summaryRetention`, `summaryTableId`, `summaryTableName`

### `relation-provision`

CRUD operations for RelationProvision records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all relationProvision records |
| `find-first` | Find first matching relationProvision record |
| `get` | Get a relationProvision by id |
| `create` | Create a new relationProvision |
| `update` | Update an existing relationProvision |
| `delete` | Delete a relationProvision |

**Fields:**

| Field | Type |
|-------|------|
| `apiRequired` | Boolean |
| `createIndex` | Boolean |
| `databaseId` | UUID |
| `deleteAction` | String |
| `exposeInApi` | Boolean |
| `fieldName` | String |
| `grants` | JSON |
| `id` | UUID |
| `isRequired` | Boolean |
| `junctionSchemaId` | UUID |
| `junctionTableId` | UUID |
| `junctionTableName` | String |
| `nodes` | JSON |
| `outFieldId` | UUID |
| `outJunctionTableId` | UUID |
| `outSourceFieldId` | UUID |
| `outTargetFieldId` | UUID |
| `policies` | JSON |
| `relationType` | String |
| `sourceFieldName` | String |
| `sourceTableId` | UUID |
| `targetFieldName` | String |
| `targetTableId` | UUID |
| `useCompositeKey` | Boolean |

**Required create fields:** `databaseId`, `relationType`, `sourceTableId`, `targetTableId`
**Optional create fields (backend defaults):** `apiRequired`, `createIndex`, `deleteAction`, `exposeInApi`, `fieldName`, `grants`, `isRequired`, `junctionSchemaId`, `junctionTableId`, `junctionTableName`, `nodes`, `outFieldId`, `outJunctionTableId`, `outSourceFieldId`, `outTargetFieldId`, `policies`, `sourceFieldName`, `targetFieldName`, `useCompositeKey`

### `repository-module`

CRUD operations for RepositoryModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all repositoryModule records |
| `find-first` | Find first matching repositoryModule record |
| `get` | Get a repositoryModule by id |
| `create` | Create a new repositoryModule |
| `update` | Update an existing repositoryModule |
| `delete` | Delete a repositoryModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `buildStepsTableId` | UUID |
| `buildStepsTableName` | String |
| `buildsTableId` | UUID |
| `buildsTableName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `hasAttachments` | Boolean |
| `hasBuilds` | Boolean |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `proposalCommentsTableId` | UUID |
| `proposalCommentsTableName` | String |
| `proposalFileViewsTableId` | UUID |
| `proposalFileViewsTableName` | String |
| `proposalReactionsTableId` | UUID |
| `proposalReactionsTableName` | String |
| `proposalReviewsTableId` | UUID |
| `proposalReviewsTableName` | String |
| `proposalsTableId` | UUID |
| `proposalsTableName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `repositoriesTableId` | UUID |
| `repositoriesTableName` | String |
| `repositoryEventsTableId` | UUID |
| `repositoryEventsTableName` | String |
| `repositoryRequiredChecksTableId` | UUID |
| `repositoryRequiredChecksTableName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `search` | JSON |
| `workflowsTableId` | UUID |
| `workflowsTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `buildStepsTableId`, `buildStepsTableName`, `buildsTableId`, `buildsTableName`, `defaultCapabilities`, `entityField`, `entityTableId`, `hasAttachments`, `hasBuilds`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `proposalCommentsTableId`, `proposalCommentsTableName`, `proposalFileViewsTableId`, `proposalFileViewsTableName`, `proposalReactionsTableId`, `proposalReactionsTableName`, `proposalReviewsTableId`, `proposalReviewsTableName`, `proposalsTableId`, `proposalsTableName`, `provisions`, `publicSchemaName`, `repositoriesTableId`, `repositoriesTableName`, `repositoryEventsTableId`, `repositoryEventsTableName`, `repositoryRequiredChecksTableId`, `repositoryRequiredChecksTableName`, `schemaId`, `search`, `workflowsTableId`, `workflowsTableName`

### `resource-module`

CRUD operations for ResourceModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all resourceModule records |
| `find-first` | Find first matching resourceModule record |
| `get` | Get a resourceModule by id |
| `create` | Create a new resourceModule |
| `update` | Update an existing resourceModule |
| `delete` | Delete a resourceModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `builderBindingsTableId` | UUID |
| `builderBindingsTableName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `installationStoreName` | String |
| `merkleStoreModuleId` | UUID |
| `namespaceModuleId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `registryBindingsTableId` | UUID |
| `registryBindingsTableName` | String |
| `requirementsStateViewName` | String |
| `resolvedRequirementsViewName` | String |
| `resourceBillingRollupFunction` | String |
| `resourceDefinitionsTableId` | UUID |
| `resourceDefinitionsTableName` | String |
| `resourceEventsTableId` | UUID |
| `resourceEventsTableName` | String |
| `resourceInstallationsTableId` | UUID |
| `resourceInstallationsTableName` | String |
| `resourceStatusChecksTableId` | UUID |
| `resourceStatusChecksTableName` | String |
| `resourceUsageLogTableId` | UUID |
| `resourceUsageLogTableName` | String |
| `resourceUsageSummaryTableId` | UUID |
| `resourceUsageSummaryTableName` | String |
| `resourcesTableId` | UUID |
| `resourcesTableName` | String |
| `rollupResourceUsageSummaryFunction` | String |
| `schemaId` | UUID |
| `scope` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `builderBindingsTableId`, `builderBindingsTableName`, `defaultCapabilities`, `entityField`, `entityTableId`, `installationStoreName`, `merkleStoreModuleId`, `namespaceModuleId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `registryBindingsTableId`, `registryBindingsTableName`, `requirementsStateViewName`, `resolvedRequirementsViewName`, `resourceBillingRollupFunction`, `resourceDefinitionsTableId`, `resourceDefinitionsTableName`, `resourceEventsTableId`, `resourceEventsTableName`, `resourceInstallationsTableId`, `resourceInstallationsTableName`, `resourceStatusChecksTableId`, `resourceStatusChecksTableName`, `resourceUsageLogTableId`, `resourceUsageLogTableName`, `resourceUsageSummaryTableId`, `resourceUsageSummaryTableName`, `resourcesTableId`, `resourcesTableName`, `rollupResourceUsageSummaryFunction`, `schemaId`

### `rls-module`

CRUD operations for RlsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all rlsModule records |
| `find-first` | Find first matching rlsModule record |
| `get` | Get a rlsModule by id |
| `create` | Create a new rlsModule |
| `update` | Update an existing rlsModule |
| `delete` | Delete a rlsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `authenticate` | String |
| `authenticateStrict` | String |
| `currentRole` | String |
| `currentRoleId` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `schemaId` | UUID |
| `sessionCredentialsTableId` | UUID |
| `sessionsTableId` | UUID |
| `usersTableId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `authenticate`, `authenticateStrict`, `currentRole`, `currentRoleId`, `privateApiName`, `privateSchemaId`, `schemaId`, `sessionCredentialsTableId`, `sessionsTableId`, `usersTableId`

### `route-module`

CRUD operations for RouteModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all routeModule records |
| `find-first` | Find first matching routeModule record |
| `get` | Get a routeModule by id |
| `create` | Create a new routeModule |
| `update` | Update an existing routeModule |
| `delete` | Delete a routeModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `appLinksFunctionName` | String |
| `catalogModuleId` | UUID |
| `databaseId` | UUID |
| `deepLinkFunctionName` | String |
| `defaultCapabilities` | String |
| `domainModuleId` | UUID |
| `entityField` | String |
| `entityTableId` | UUID |
| `hostnameBindingsTableId` | UUID |
| `hostnameBindingsTableName` | String |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `redirectsTableId` | UUID |
| `redirectsTableName` | String |
| `resolverFunctionName` | String |
| `routeBindingsTableId` | UUID |
| `routeBindingsTableName` | String |
| `routesTableId` | UUID |
| `routesTableName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `servingSiteField` | String |
| `storageKey` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `appLinksFunctionName`, `catalogModuleId`, `deepLinkFunctionName`, `defaultCapabilities`, `domainModuleId`, `entityField`, `entityTableId`, `hostnameBindingsTableId`, `hostnameBindingsTableName`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `redirectsTableId`, `redirectsTableName`, `resolverFunctionName`, `routeBindingsTableId`, `routeBindingsTableName`, `routesTableId`, `routesTableName`, `schemaId`, `servingSiteField`, `storageKey`

### `scope-types-module`

CRUD operations for ScopeTypesModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all scopeTypesModule records |
| `find-first` | Find first matching scopeTypesModule record |
| `get` | Get a scopeTypesModule by id |
| `create` | Create a new scopeTypesModule |
| `update` | Update an existing scopeTypesModule |
| `delete` | Delete a scopeTypesModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `id` | UUID |
| `privateSchemaName` | String |
| `schemaId` | UUID |
| `scopeTypesTableId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `privateSchemaName`, `schemaId`, `scopeTypesTableId`

### `secure-table-provision`

CRUD operations for SecureTableProvision records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all secureTableProvision records |
| `find-first` | Find first matching secureTableProvision record |
| `get` | Get a secureTableProvision by id |
| `create` | Create a new secureTableProvision |
| `update` | Update an existing secureTableProvision |
| `delete` | Delete a secureTableProvision |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `fields` | JSON |
| `grants` | JSON |
| `id` | UUID |
| `module` | JSON |
| `nodes` | JSON |
| `outFields` | UUID |
| `owns` | JSON |
| `policies` | JSON |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |
| `useRls` | Boolean |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `fields`, `grants`, `module`, `nodes`, `outFields`, `owns`, `policies`, `schemaId`, `tableId`, `tableName`, `useRls`

### `session-secrets-module`

CRUD operations for SessionSecretsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all sessionSecretsModule records |
| `find-first` | Find first matching sessionSecretsModule record |
| `get` | Get a sessionSecretsModule by id |
| `create` | Create a new sessionSecretsModule |
| `update` | Update an existing sessionSecretsModule |
| `delete` | Delete a sessionSecretsModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `id` | UUID |
| `schemaId` | UUID |
| `sessionsTableId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `schemaId`, `sessionsTableId`, `tableId`, `tableName`

### `sessions-module`

CRUD operations for SessionsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all sessionsModule records |
| `find-first` | Find first matching sessionsModule record |
| `get` | Get a sessionsModule by id |
| `create` | Create a new sessionsModule |
| `update` | Update an existing sessionsModule |
| `delete` | Delete a sessionsModule |

**Fields:**

| Field | Type |
|-------|------|
| `authSettingsTableId` | UUID |
| `authSettingsTableName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `schemaId` | UUID |
| `sessionCredentialsTableId` | UUID |
| `sessionCredentialsTableName` | String |
| `sessionsDefaultExpiration` | Interval |
| `sessionsTableId` | UUID |
| `sessionsTableName` | String |
| `usersTableId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `authSettingsTableId`, `authSettingsTableName`, `schemaId`, `sessionCredentialsTableId`, `sessionCredentialsTableName`, `sessionsDefaultExpiration`, `sessionsTableId`, `sessionsTableName`, `usersTableId`

### `site-surface-module`

CRUD operations for SiteSurfaceModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteSurfaceModule records |
| `find-first` | Find first matching siteSurfaceModule record |
| `get` | Get a siteSurfaceModule by id |
| `create` | Create a new siteSurfaceModule |
| `update` | Update an existing siteSurfaceModule |
| `delete` | Delete a siteSurfaceModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `catalogModuleId` | UUID |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `id` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `siteAppLinksTableId` | UUID |
| `siteAppLinksTableName` | String |
| `siteDeepLinksTableId` | UUID |
| `siteDeepLinksTableName` | String |
| `siteErrorPagesTableId` | UUID |
| `siteErrorPagesTableName` | String |
| `siteMetadataTableId` | UUID |
| `siteMetadataTableName` | String |
| `siteModulesTableId` | UUID |
| `siteModulesTableName` | String |
| `siteReleasesTableId` | UUID |
| `siteReleasesTableName` | String |
| `siteThemesTableId` | UUID |
| `siteThemesTableName` | String |
| `siteWebConfigTableId` | UUID |
| `siteWebConfigTableName` | String |
| `sitesTableId` | UUID |
| `sitesTableName` | String |
| `storageKey` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `catalogModuleId`, `defaultCapabilities`, `entityField`, `entityTableId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`, `siteAppLinksTableId`, `siteAppLinksTableName`, `siteDeepLinksTableId`, `siteDeepLinksTableName`, `siteErrorPagesTableId`, `siteErrorPagesTableName`, `siteMetadataTableId`, `siteMetadataTableName`, `siteModulesTableId`, `siteModulesTableName`, `siteReleasesTableId`, `siteReleasesTableName`, `siteThemesTableId`, `siteThemesTableName`, `siteWebConfigTableId`, `siteWebConfigTableName`, `sitesTableId`, `sitesTableName`, `storageKey`

### `storage-log-module`

CRUD operations for StorageLogModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all storageLogModule records |
| `find-first` | Find first matching storageLogModule record |
| `get` | Get a storageLogModule by id |
| `create` | Create a new storageLogModule |
| `update` | Update an existing storageLogModule |
| `delete` | Delete a storageLogModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `id` | UUID |
| `interval` | String |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `retention` | String |
| `rollupFunctionName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `storageLogTableId` | UUID |
| `storageLogTableName` | String |
| `usageSummaryTableId` | UUID |
| `usageSummaryTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `interval`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `retention`, `rollupFunctionName`, `schemaId`, `storageLogTableId`, `storageLogTableName`, `usageSummaryTableId`, `usageSummaryTableName`

### `storage-module`

CRUD operations for StorageModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all storageModule records |
| `find-first` | Find first matching storageModule record |
| `get` | Get a storageModule by id |
| `create` | Create a new storageModule |
| `update` | Update an existing storageModule |
| `delete` | Delete a storageModule |

**Fields:**

| Field | Type |
|-------|------|
| `allowedOrigins` | String |
| `apiName` | String |
| `bucketsTableId` | UUID |
| `bucketsTableName` | String |
| `cacheTtlSeconds` | Int |
| `catalogModuleId` | UUID |
| `confirmUploadDelay` | Interval |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `defaultMaxFileSize` | BigInt |
| `downloadUrlExpirySeconds` | Int |
| `endpoint` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `fileEventsTableId` | UUID |
| `filesTableId` | UUID |
| `filesTableName` | String |
| `hasAuditLog` | Boolean |
| `hasConfirmUpload` | Boolean |
| `hasContentHash` | Boolean |
| `hasCustomKeys` | Boolean |
| `hasPathShares` | Boolean |
| `hasVersioning` | Boolean |
| `id` | UUID |
| `key` | String |
| `maxBulkFiles` | Int |
| `maxBulkTotalSize` | BigInt |
| `maxFilenameLength` | Int |
| `pathSharesTableId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provider` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `publicUrlPrefix` | String |
| `region` | String |
| `restrictReads` | Boolean |
| `schemaId` | UUID |
| `scope` | String |
| `uploadUrlExpirySeconds` | Int |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `allowedOrigins`, `apiName`, `bucketsTableId`, `bucketsTableName`, `cacheTtlSeconds`, `catalogModuleId`, `confirmUploadDelay`, `defaultCapabilities`, `defaultMaxFileSize`, `downloadUrlExpirySeconds`, `endpoint`, `entityField`, `entityTableId`, `fileEventsTableId`, `filesTableId`, `filesTableName`, `hasAuditLog`, `hasConfirmUpload`, `hasContentHash`, `hasCustomKeys`, `hasPathShares`, `hasVersioning`, `key`, `maxBulkFiles`, `maxBulkTotalSize`, `maxFilenameLength`, `pathSharesTableId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provider`, `provisions`, `publicSchemaName`, `publicUrlPrefix`, `region`, `restrictReads`, `schemaId`, `uploadUrlExpirySeconds`

### `transfer-log-module`

CRUD operations for TransferLogModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all transferLogModule records |
| `find-first` | Find first matching transferLogModule record |
| `get` | Get a transferLogModule by id |
| `create` | Create a new transferLogModule |
| `update` | Update an existing transferLogModule |
| `delete` | Delete a transferLogModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `entityField` | String |
| `id` | UUID |
| `interval` | String |
| `prefix` | String |
| `premake` | Int |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `publicSchemaName` | String |
| `retention` | String |
| `rollupFunctionName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `transferLogTableId` | UUID |
| `transferLogTableName` | String |
| `usageSummaryTableId` | UUID |
| `usageSummaryTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `entityField`, `interval`, `prefix`, `premake`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `publicSchemaName`, `retention`, `rollupFunctionName`, `schemaId`, `transferLogTableId`, `transferLogTableName`, `usageSummaryTableId`, `usageSummaryTableName`

### `user-auth-module`

CRUD operations for UserAuthModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all userAuthModule records |
| `find-first` | Find first matching userAuthModule record |
| `get` | Get a userAuthModule by id |
| `create` | Create a new userAuthModule |
| `update` | Update an existing userAuthModule |
| `delete` | Delete a userAuthModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `auditsTableId` | UUID |
| `auditsTableName` | String |
| `checkPasswordFunction` | String |
| `databaseId` | UUID |
| `deleteAccountFunction` | String |
| `emailsTableId` | UUID |
| `encryptedTableId` | UUID |
| `extendTokenExpires` | String |
| `forgotPasswordFunction` | String |
| `id` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `requestCrossOriginTokenFunction` | String |
| `resetPasswordFunction` | String |
| `revokeSessionTreeFunction` | String |
| `schemaId` | UUID |
| `secretsTableId` | UUID |
| `sendAccountDeletionEmailFunction` | String |
| `sendVerificationEmailFunction` | String |
| `sessionCredentialsTableId` | UUID |
| `sessionsTableId` | UUID |
| `setPasswordFunction` | String |
| `signInCrossOriginFunction` | String |
| `signInFunction` | String |
| `signOutFunction` | String |
| `signUpFunction` | String |
| `sweepExpiredSessionsFunction` | String |
| `sweepUnverifiedIdentifiersFunction` | String |
| `usersTableId` | UUID |
| `verifyEmailFunction` | String |
| `verifyPasswordFunction` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `auditsTableId`, `auditsTableName`, `checkPasswordFunction`, `deleteAccountFunction`, `emailsTableId`, `encryptedTableId`, `extendTokenExpires`, `forgotPasswordFunction`, `privateApiName`, `privateSchemaId`, `requestCrossOriginTokenFunction`, `resetPasswordFunction`, `revokeSessionTreeFunction`, `schemaId`, `secretsTableId`, `sendAccountDeletionEmailFunction`, `sendVerificationEmailFunction`, `sessionCredentialsTableId`, `sessionsTableId`, `setPasswordFunction`, `signInCrossOriginFunction`, `signInFunction`, `signOutFunction`, `signUpFunction`, `sweepExpiredSessionsFunction`, `sweepUnverifiedIdentifiersFunction`, `usersTableId`, `verifyEmailFunction`, `verifyPasswordFunction`

### `user-credentials-module`

CRUD operations for UserCredentialsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all userCredentialsModule records |
| `find-first` | Find first matching userCredentialsModule record |
| `get` | Get a userCredentialsModule by id |
| `create` | Create a new userCredentialsModule |
| `update` | Update an existing userCredentialsModule |
| `delete` | Delete a userCredentialsModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `entityField` | String |
| `id` | UUID |
| `privateApiName` | String |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `entityField`, `privateApiName`, `schemaId`, `tableId`, `tableName`

### `user-settings-module`

CRUD operations for UserSettingsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all userSettingsModule records |
| `find-first` | Find first matching userSettingsModule record |
| `get` | Get a userSettingsModule by id |
| `create` | Create a new userSettingsModule |
| `update` | Update an existing userSettingsModule |
| `delete` | Delete a userSettingsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `ownerTableId` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `ownerTableId`, `schemaId`, `tableId`, `tableName`

### `user-settings-security-module`

CRUD operations for UserSettingsSecurityModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all userSettingsSecurityModule records |
| `find-first` | Find first matching userSettingsSecurityModule record |
| `get` | Get a userSettingsSecurityModule by id |
| `create` | Create a new userSettingsSecurityModule |
| `update` | Update an existing userSettingsSecurityModule |
| `delete` | Delete a userSettingsSecurityModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `ownerTableId` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `ownerTableId`, `schemaId`, `tableId`, `tableName`

### `user-state-module`

CRUD operations for UserStateModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all userStateModule records |
| `find-first` | Find first matching userStateModule record |
| `get` | Get a userStateModule by id |
| `create` | Create a new userStateModule |
| `update` | Update an existing userStateModule |
| `delete` | Delete a userStateModule |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `entityField` | String |
| `id` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `entityField`, `schemaId`, `tableId`, `tableName`

### `users-module`

CRUD operations for UsersModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all usersModule records |
| `find-first` | Find first matching usersModule record |
| `get` | Get a usersModule by id |
| `create` | Create a new usersModule |
| `update` | Update an existing usersModule |
| `delete` | Delete a usersModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `privateApiName` | String |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |
| `typeTableId` | UUID |
| `typeTableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `privateApiName`, `schemaId`, `tableId`, `tableName`, `typeTableId`, `typeTableName`

### `webauthn-auth-module`

CRUD operations for WebauthnAuthModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all webauthnAuthModule records |
| `find-first` | Find first matching webauthnAuthModule record |
| `get` | Get a webauthnAuthModule by id |
| `create` | Create a new webauthnAuthModule |
| `update` | Update an existing webauthnAuthModule |
| `delete` | Delete a webauthnAuthModule |

**Fields:**

| Field | Type |
|-------|------|
| `attestationType` | String |
| `authSettingsTableId` | UUID |
| `challengeExpiry` | Interval |
| `credentialsTableId` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `originAllowlist` | String |
| `requireUserVerification` | Boolean |
| `residentKey` | String |
| `rpId` | String |
| `rpName` | String |
| `schemaId` | UUID |
| `sessionCredentialsTableId` | UUID |
| `sessionSecretsTableId` | UUID |
| `sessionsTableId` | UUID |
| `usersTableId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `attestationType`, `authSettingsTableId`, `challengeExpiry`, `credentialsTableId`, `originAllowlist`, `requireUserVerification`, `residentKey`, `rpId`, `rpName`, `schemaId`, `sessionCredentialsTableId`, `sessionSecretsTableId`, `sessionsTableId`, `usersTableId`

### `webauthn-credentials-module`

CRUD operations for WebauthnCredentialsModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all webauthnCredentialsModule records |
| `find-first` | Find first matching webauthnCredentialsModule record |
| `get` | Get a webauthnCredentialsModule by id |
| `create` | Create a new webauthnCredentialsModule |
| `update` | Update an existing webauthnCredentialsModule |
| `delete` | Delete a webauthnCredentialsModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `ownerTableId` | UUID |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `schemaId` | UUID |
| `tableId` | UUID |
| `tableName` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `apiName`, `ownerTableId`, `privateApiName`, `privateSchemaId`, `schemaId`, `tableId`, `tableName`

### `webhook-module`

CRUD operations for WebhookModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all webhookModule records |
| `find-first` | Find first matching webhookModule record |
| `get` | Get a webhookModule by id |
| `create` | Create a new webhookModule |
| `update` | Update an existing webhookModule |
| `delete` | Delete a webhookModule |

**Fields:**

| Field | Type |
|-------|------|
| `apiName` | String |
| `databaseId` | UUID |
| `defaultCapabilities` | String |
| `entityField` | String |
| `entityTableId` | UUID |
| `functionInvocationModuleId` | UUID |
| `functionModuleId` | UUID |
| `id` | UUID |
| `infraSecretsModuleId` | UUID |
| `namespaceModuleId` | UUID |
| `policies` | JSON |
| `prefix` | String |
| `privateApiName` | String |
| `privateSchemaId` | UUID |
| `privateSchemaName` | String |
| `provisions` | JSON |
| `publicSchemaName` | String |
| `schemaId` | UUID |
| `scope` | String |
| `webhookEndpointsTableId` | UUID |
| `webhookEndpointsTableName` | String |
| `webhookEventsTableId` | UUID |
| `webhookEventsTableName` | String |

**Required create fields:** `databaseId`, `scope`
**Optional create fields (backend defaults):** `apiName`, `defaultCapabilities`, `entityField`, `entityTableId`, `functionInvocationModuleId`, `functionModuleId`, `infraSecretsModuleId`, `namespaceModuleId`, `policies`, `prefix`, `privateApiName`, `privateSchemaId`, `privateSchemaName`, `provisions`, `publicSchemaName`, `schemaId`, `webhookEndpointsTableId`, `webhookEndpointsTableName`, `webhookEventsTableId`, `webhookEventsTableName`

## Custom Operations

### `construct-blueprint`

Executes a blueprint definition by delegating to provision_* procedures. Creates a blueprint_construction record to track the attempt. Eight phases: (0) entity_type_provision for each membership_type entry — provisions entity tables, membership modules, and security. When a prefix already exists (e.g., 'org'), the entry extends the existing entity type instead of creating a new one; if a storage[] key is present, it provisions entity-scoped storage for that type. (0.5) scope-based storage: each storage[] entry has an optional scope ('app' or 'org' only). App-scoped storage seeds buckets at migration time. Org-scoped storage resolves the org membership type, creates org_buckets/org_files with owner_id, and seeds buckets per-entity via an AFTER INSERT trigger on the users table. When function_module is installed, a private functions bucket is auto-injected into org-scoped or entity-scoped storage entries. (1) provision_table() for each table with nodes[], fields[], policies[], and grants (table-level indexes/fts/unique_constraints/check_constraints are deferred). A table entry either names its table (table_name plus optional schema_name) or references one an installed module generated ("module": {"type": "agent", "scope": "org", "table": "message"}), which resolves through the module row's recorded table ids and raises when it matches nothing instead of creating an empty table. After provisioning, optional smart_tags (jsonb object) on the table entry are applied via metaschema.append_table_smart_tags(), and optional smart_tags on individual field entries are applied via metaschema.append_field_smart_tags(). (2) provision_relation() for each relation, (3) provision_index() for top-level + deferred indexes, (4) provision_full_text_search() for top-level + deferred FTS, (5) provision_unique_constraint() for top-level + deferred unique constraints, (6) provision_check_constraint() for top-level + deferred check constraints, (7) seed achievements from definition.achievements[] — resolves events_module by entity_prefix and creates INSERT actions for levels, level_requirements, and achievement_rewards tables. Phase 0 entity tables are added to the table_map so subsequent phases can reference them by name. Table-level entries are deferred to phases 3-6 so they can reference columns created by relations in phase 2. Returns the construction record ID on success, NULL on failure.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.blueprintId` | UUID |
  | `--input.clientMutationId` | String |
  | `--input.schemaId` | UUID |

### `copy-template-to-blueprint`

Creates a new blueprint by copying a template definition. Checks visibility: owners can always copy their own templates, others require public visibility. Increments the template copy_count. Returns the new blueprint ID.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.displayNameOverride` | String |
  | `--input.nameOverride` | String |
  | `--input.ownerId` | UUID |
  | `--input.templateId` | UUID |

### `provision-bucket`

Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.ownerId` | UUID |

## Output

All commands output JSON to stdout. Pipe to `jq` for formatting:

```bash
csdk car list | jq '.[]'
csdk car get --id <uuid> | jq '.'
```

## Non-Interactive Mode

Use `--no-tty` to skip all interactive prompts (useful for scripts and CI):

```bash
csdk --no-tty car create --name "Sedan" --year 2024
```
