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
| `api` | api CRUD operations |
| `api-schema` | apiSchema CRUD operations |
| `api-setting` | apiSetting CRUD operations |
| `ast-migration` | astMigration CRUD operations |
| `check-constraint` | checkConstraint CRUD operations |
| `composite-type` | compositeType CRUD operations |
| `cors-setting` | corsSetting CRUD operations |
| `database` | database CRUD operations |
| `database-setting` | databaseSetting CRUD operations |
| `database-transfer` | databaseTransfer CRUD operations |
| `default-privilege` | defaultPrivilege CRUD operations |
| `derive` | derive CRUD operations |
| `domain` | domain CRUD operations |
| `domain-event` | domainEvent CRUD operations |
| `domain-type` | domainType CRUD operations |
| `domain-verification` | domainVerification CRUD operations |
| `email-identity` | emailIdentity CRUD operations |
| `email-provider-account` | emailProviderAccount CRUD operations |
| `email-site-identity` | emailSiteIdentity CRUD operations |
| `embedding-chunk` | embeddingChunk CRUD operations |
| `enum` | enum CRUD operations |
| `exclusion-constraint` | exclusionConstraint CRUD operations |
| `field-behavior` | fieldBehavior CRUD operations |
| `field` | field CRUD operations |
| `foreign-key-constraint-behavior` | foreignKeyConstraintBehavior CRUD operations |
| `foreign-key-constraint` | foreignKeyConstraint CRUD operations |
| `full-text-search` | fullTextSearch CRUD operations |
| `function` | function CRUD operations |
| `get-site-previews-record` | getSitePreviewsRecord CRUD operations |
| `identity-provider-registry` | identityProviderRegistry CRUD operations |
| `index` | index CRUD operations |
| `list-suspended-databases-record` | listSuspendedDatabasesRecord CRUD operations |
| `managed-domain` | managedDomain CRUD operations |
| `node-type-registry` | nodeTypeRegistry CRUD operations |
| `page` | page CRUD operations |
| `partition` | partition CRUD operations |
| `platform-api` | platformApi CRUD operations |
| `platform-api-schema` | platformApiSchema CRUD operations |
| `platform-api-setting` | platformApiSetting CRUD operations |
| `platform-cors-setting` | platformCorsSetting CRUD operations |
| `platform-domain` | platformDomain CRUD operations |
| `platform-domain-event` | platformDomainEvent CRUD operations |
| `platform-domain-verification` | platformDomainVerification CRUD operations |
| `platform-email-identity` | platformEmailIdentity CRUD operations |
| `platform-email-provider-account` | platformEmailProviderAccount CRUD operations |
| `platform-email-site-identity` | platformEmailSiteIdentity CRUD operations |
| `platform-get-site-previews-record` | platformGetSitePreviewsRecord CRUD operations |
| `platform-managed-domain` | platformManagedDomain CRUD operations |
| `platform-page` | platformPage CRUD operations |
| `platform-site-app-link` | platformSiteAppLink CRUD operations |
| `platform-site` | platformSite CRUD operations |
| `platform-site-deep-link` | platformSiteDeepLink CRUD operations |
| `platform-site-error-page` | platformSiteErrorPage CRUD operations |
| `platform-site-metadatum` | platformSiteMetadatum CRUD operations |
| `platform-site-module` | platformSiteModule CRUD operations |
| `platform-site-release` | platformSiteRelease CRUD operations |
| `platform-site-theme` | platformSiteTheme CRUD operations |
| `platform-site-web-config` | platformSiteWebConfig CRUD operations |
| `policy` | policy CRUD operations |
| `primary-key-constraint` | primaryKeyConstraint CRUD operations |
| `pubkey-setting` | pubkeySetting CRUD operations |
| `redirect` | redirect CRUD operations |
| `rls-setting` | rlsSetting CRUD operations |
| `route` | route CRUD operations |
| `schema` | schema CRUD operations |
| `schema-grant` | schemaGrant CRUD operations |
| `site-app-link` | siteAppLink CRUD operations |
| `site` | site CRUD operations |
| `site-deep-link` | siteDeepLink CRUD operations |
| `site-error-page` | siteErrorPage CRUD operations |
| `site-metadatum` | siteMetadatum CRUD operations |
| `site-module` | siteModule CRUD operations |
| `site-release` | siteRelease CRUD operations |
| `site-theme` | siteTheme CRUD operations |
| `site-web-config` | siteWebConfig CRUD operations |
| `spatial-relation` | spatialRelation CRUD operations |
| `sql-action` | sqlAction CRUD operations |
| `table-behavior` | tableBehavior CRUD operations |
| `table` | table CRUD operations |
| `table-grant` | tableGrant CRUD operations |
| `trigger` | trigger CRUD operations |
| `trigger-function` | triggerFunction CRUD operations |
| `unique-constraint-behavior` | uniqueConstraintBehavior CRUD operations |
| `unique-constraint` | uniqueConstraint CRUD operations |
| `view-behavior` | viewBehavior CRUD operations |
| `view` | view CRUD operations |
| `view-grant` | viewGrant CRUD operations |
| `view-rule` | viewRule CRUD operations |
| `view-table` | viewTable CRUD operations |
| `webauthn-setting` | webauthnSetting CRUD operations |
| `api-schema-names` | apiSchemaNames |
| `apply-registry-defaults` | applyRegistryDefaults |
| `get-site-preview-commit` | getSitePreviewCommit |
| `get-site-release-manifest` | getSiteReleaseManifest |
| `page-published` | pagePublished |
| `platform-get-site-preview-commit` | platformGetSitePreviewCommit |
| `platform-get-site-release-manifest` | platformGetSiteReleaseManifest |
| `platform-page-published` | platformPagePublished |
| `platform-sites-deep-link-url` | platformSitesDeepLinkUrl |
| `platform-sites-site-origin` | platformSitesSiteOrigin |
| `platform-verify-site-preview-token` | platformVerifySitePreviewToken |
| `resolve-deep-link` | resolveDeepLink |
| `resolve-route` | resolveRoute |
| `resolve-site-app-links` | resolveSiteAppLinks |
| `sites-deep-link-url` | sitesDeepLinkUrl |
| `sites-site-origin` | sitesSiteOrigin |
| `verify-site-preview-token` | verifySitePreviewToken |
| `accept-database-transfer` | acceptDatabaseTransfer |
| `apply-rls` | applyRls |
| `cancel-database-transfer` | cancelDatabaseTransfer |
| `delete-site-preview` | deleteSitePreview |
| `domains-assign-subdomain` | domainsAssignSubdomain |
| `mint-site-preview-token` | mintSitePreviewToken |
| `pages-install-pages` | pagesInstallPages |
| `platform-delete-site-preview` | platformDeleteSitePreview |
| `platform-domains-assign-subdomain` | platformDomainsAssignSubdomain |
| `platform-mint-site-preview-token` | platformMintSitePreviewToken |
| `platform-pages-install-pages` | platformPagesInstallPages |
| `platform-provision-site-preview` | platformProvisionSitePreview |
| `platform-set-site-preview` | platformSetSitePreview |
| `platform-site-metadata-install-robots` | platformSiteMetadataInstallRobots |
| `platform-sites-install-content-preset` | platformSitesInstallContentPreset |
| `platform-sites-install-mantra` | platformSitesInstallMantra |
| `platform-sites-provision-static-site` | platformSitesProvisionStaticSite |
| `provision-bucket` | Reconcile an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then enqueues the same
storage:provision_bucket job used by the INSERT trigger. This is
idempotent for an already-reconciled bucket; enqueue failures become
GraphQL errors. |
| `provision-site-preview` | provisionSitePreview |
| `reject-database-transfer` | rejectDatabaseTransfer |
| `request-database` | Requests a database and returns a ticket (database_provision_module row) to poll.

Pass exactly one of preset_slug or modules. Pass organization_id to have the organization own the database from the start (the caller must be an owner of that organization); the requesting user is still the identity bootstrapped into the new database. Omit it for a personal database. The pool, presets, and owner bootstrap are private implementation details: a warm pool hit fulfills the ticket immediately (fulfilled_at set, deferred owner bootstrap), otherwise the database is cold-provisioned asynchronously with exactly the requested modules. Poll the ticket until status = 'completed'; it then carries database_id and fulfilled_at.

Example usage:
  SELECT * FROM metaschema_public.request_database('my_app', 'example.com', preset_slug := 'full');
  SELECT * FROM metaschema_public.request_database('my_app', 'example.com', modules := '["users_module", "emails_module"]'::jsonb);
  SELECT * FROM metaschema_public.request_database('team_app', 'example.com', preset_slug := 'full', organization_id := '00000000-0000-0000-0000-000000000000'::uuid); |
| `set-field-order` | setFieldOrder |
| `set-site-preview` | setSitePreview |
| `site-metadata-install-robots` | siteMetadataInstallRobots |
| `sites-install-content-preset` | sitesInstallContentPreset |
| `sites-install-mantra` | sitesInstallMantra |
| `sites-provision-static-site` | sitesProvisionStaticSite |
| `suspend-database` | suspendDatabase |
| `unsuspend-database` | unsuspendDatabase |

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

### `api`

CRUD operations for Api records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all api records |
| `find-first` | Find first matching api record |
| `get` | Get a api by id |
| `create` | Create a new api |
| `update` | Update an existing api |
| `delete` | Delete a api |

**Fields:**

| Field | Type |
|-------|------|
| `anonRole` | String |
| `config` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `dbname` | String |
| `id` | UUID |
| `isPublished` | Boolean |
| `name` | String |
| `roleName` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `anonRole`, `config`, `dbname`, `isPublished`, `roleName`

### `api-schema`

CRUD operations for ApiSchema records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all apiSchema records |
| `find-first` | Find first matching apiSchema record |
| `get` | Get a apiSchema by id |
| `create` | Create a new apiSchema |
| `update` | Update an existing apiSchema |
| `delete` | Delete a apiSchema |

**Fields:**

| Field | Type |
|-------|------|
| `apiId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `schemaId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `apiId`, `databaseId`, `schemaId`

### `api-setting`

CRUD operations for ApiSetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all apiSetting records |
| `find-first` | Find first matching apiSetting record |
| `get` | Get a apiSetting by id |
| `create` | Create a new apiSetting |
| `update` | Update an existing apiSetting |
| `delete` | Delete a apiSetting |

**Fields:**

| Field | Type |
|-------|------|
| `apiId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `enableAggregates` | Boolean |
| `enableBulk` | Boolean |
| `enableConnectionFilter` | Boolean |
| `enableDirectUploads` | Boolean |
| `enableI18N` | Boolean |
| `enableIntrospection` | Boolean |
| `enableLlm` | Boolean |
| `enableLtree` | Boolean |
| `enableManyToMany` | Boolean |
| `enablePostgis` | Boolean |
| `enablePresignedUploads` | Boolean |
| `enableRealtime` | Boolean |
| `enableSearch` | Boolean |
| `id` | UUID |
| `idleInTransactionTimeoutMs` | BigInt |
| `lockTimeoutMs` | BigInt |
| `maxConcurrentRequests` | Int |
| `maxPageSize` | Int |
| `maxQueryCost` | Int |
| `maxQueryDepth` | Int |
| `maxQueueWaitMs` | Int |
| `maxRequestBytes` | Int |
| `options` | JSON |
| `rateLimitBurst` | Int |
| `rateLimitRpm` | Int |
| `statementTimeoutMs` | BigInt |
| `updatedAt` | Datetime |

**Required create fields:** `apiId`, `databaseId`
**Optional create fields (backend defaults):** `enableAggregates`, `enableBulk`, `enableConnectionFilter`, `enableDirectUploads`, `enableI18N`, `enableIntrospection`, `enableLlm`, `enableLtree`, `enableManyToMany`, `enablePostgis`, `enablePresignedUploads`, `enableRealtime`, `enableSearch`, `idleInTransactionTimeoutMs`, `lockTimeoutMs`, `maxConcurrentRequests`, `maxPageSize`, `maxQueryCost`, `maxQueryDepth`, `maxQueueWaitMs`, `maxRequestBytes`, `options`, `rateLimitBurst`, `rateLimitRpm`, `statementTimeoutMs`

### `ast-migration`

CRUD operations for AstMigration records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all astMigration records |
| `find-first` | Find first matching astMigration record |
| `get` | Get a astMigration by id |
| `create` | Create a new astMigration |
| `update` | Update an existing astMigration |
| `delete` | Delete a astMigration |

**Fields:**

| Field | Type |
|-------|------|
| `actionId` | UUID |
| `actionName` | String |
| `actorId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `deploy` | JSON |
| `deploys` | String |
| `id` | Int |
| `name` | String |
| `payload` | JSON |
| `requires` | String |
| `revert` | JSON |
| `verify` | JSON |

**Required create fields:** `actionId`, `actionName`, `actorId`, `databaseId`, `deploy`, `deploys`, `name`, `payload`, `requires`, `revert`, `verify`

### `check-constraint`

CRUD operations for CheckConstraint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all checkConstraint records |
| `find-first` | Find first matching checkConstraint record |
| `get` | Get a checkConstraint by id |
| `create` | Create a new checkConstraint |
| `update` | Update an existing checkConstraint |
| `delete` | Delete a checkConstraint |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `expr` | JSON |
| `fieldIds` | UUID |
| `id` | UUID |
| `initiallyDeferred` | Boolean |
| `isDeferrable` | Boolean |
| `name` | String |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `type` | String |
| `updatedAt` | Datetime |

**Required create fields:** `fieldIds`, `tableId`
**Optional create fields (backend defaults):** `category`, `databaseId`, `expr`, `initiallyDeferred`, `isDeferrable`, `name`, `smartTags`, `tags`, `type`

### `composite-type`

CRUD operations for CompositeType records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all compositeType records |
| `find-first` | Find first matching compositeType record |
| `get` | Get a compositeType by id |
| `create` | Create a new compositeType |
| `update` | Update an existing compositeType |
| `delete` | Delete a compositeType |

**Fields:**

| Field | Type |
|-------|------|
| `attributes` | JSON |
| `category` | ObjectCategory |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `label` | String |
| `name` | String |
| `schemaId` | UUID |
| `smartTags` | JSON |
| `tags` | String |

**Required create fields:** `databaseId`, `name`, `schemaId`
**Optional create fields (backend defaults):** `attributes`, `category`, `description`, `label`, `smartTags`, `tags`

### `cors-setting`

CRUD operations for CorsSetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all corsSetting records |
| `find-first` | Find first matching corsSetting record |
| `get` | Get a corsSetting by id |
| `create` | Create a new corsSetting |
| `update` | Update an existing corsSetting |
| `delete` | Delete a corsSetting |

**Fields:**

| Field | Type |
|-------|------|
| `allowedOrigins` | String |
| `apiId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `allowedOrigins`, `apiId`

### `database`

CRUD operations for Database records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all database records |
| `find-first` | Find first matching database record |
| `get` | Get a database by id |
| `create` | Create a new database |
| `update` | Update an existing database |
| `delete` | Delete a database |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `hash` | UUID |
| `id` | UUID |
| `label` | String |
| `name` | String |
| `ownerId` | UUID |
| `platform` | Boolean |
| `suspendedAt` | Datetime |
| `suspendedReason` | String |
| `updatedAt` | Datetime |

**Optional create fields (backend defaults):** `hash`, `label`, `name`, `ownerId`, `platform`

### `database-setting`

CRUD operations for DatabaseSetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseSetting records |
| `find-first` | Find first matching databaseSetting record |
| `get` | Get a databaseSetting by id |
| `create` | Create a new databaseSetting |
| `update` | Update an existing databaseSetting |
| `delete` | Delete a databaseSetting |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `creditsPerCent` | Int |
| `databaseId` | UUID |
| `enableAggregates` | Boolean |
| `enableBilling` | Boolean |
| `enableBulk` | Boolean |
| `enableConnectionFilter` | Boolean |
| `enableDirectUploads` | Boolean |
| `enableI18N` | Boolean |
| `enableIntrospection` | Boolean |
| `enableLlm` | Boolean |
| `enableLtree` | Boolean |
| `enableManyToMany` | Boolean |
| `enablePostgis` | Boolean |
| `enablePresignedUploads` | Boolean |
| `enableRealtime` | Boolean |
| `enableSearch` | Boolean |
| `id` | UUID |
| `idleInTransactionTimeoutMs` | BigInt |
| `labels` | JSON |
| `lockTimeoutMs` | BigInt |
| `maxConcurrentRequests` | Int |
| `maxPageSize` | Int |
| `maxQueryCost` | Int |
| `maxQueryDepth` | Int |
| `maxQueueWaitMs` | Int |
| `maxRequestBytes` | Int |
| `options` | JSON |
| `rateLimitBurst` | Int |
| `rateLimitRpm` | Int |
| `statementTimeoutMs` | BigInt |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `annotations`, `creditsPerCent`, `enableAggregates`, `enableBilling`, `enableBulk`, `enableConnectionFilter`, `enableDirectUploads`, `enableI18N`, `enableIntrospection`, `enableLlm`, `enableLtree`, `enableManyToMany`, `enablePostgis`, `enablePresignedUploads`, `enableRealtime`, `enableSearch`, `idleInTransactionTimeoutMs`, `labels`, `lockTimeoutMs`, `maxConcurrentRequests`, `maxPageSize`, `maxQueryCost`, `maxQueryDepth`, `maxQueueWaitMs`, `maxRequestBytes`, `options`, `rateLimitBurst`, `rateLimitRpm`, `statementTimeoutMs`

### `database-transfer`

CRUD operations for DatabaseTransfer records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all databaseTransfer records |
| `find-first` | Find first matching databaseTransfer record |
| `get` | Get a databaseTransfer by id |
| `create` | Create a new databaseTransfer |
| `update` | Update an existing databaseTransfer |
| `delete` | Delete a databaseTransfer |

**Fields:**

| Field | Type |
|-------|------|
| `completedAt` | Datetime |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `expiresAt` | Datetime |
| `id` | UUID |
| `initiatedBy` | UUID |
| `notes` | String |
| `sourceApproved` | Boolean |
| `sourceApprovedAt` | Datetime |
| `status` | String |
| `targetApproved` | Boolean |
| `targetApprovedAt` | Datetime |
| `targetOwnerId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `initiatedBy`, `targetOwnerId`
**Optional create fields (backend defaults):** `completedAt`, `expiresAt`, `notes`, `sourceApproved`, `sourceApprovedAt`, `status`, `targetApproved`, `targetApprovedAt`

### `default-privilege`

CRUD operations for DefaultPrivilege records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all defaultPrivilege records |
| `find-first` | Find first matching defaultPrivilege record |
| `get` | Get a defaultPrivilege by id |
| `create` | Create a new defaultPrivilege |
| `update` | Update an existing defaultPrivilege |
| `delete` | Delete a defaultPrivilege |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `granteeName` | String |
| `id` | UUID |
| `isGrant` | Boolean |
| `objectType` | String |
| `privilege` | String |
| `schemaId` | UUID |

**Required create fields:** `granteeName`, `objectType`, `privilege`, `schemaId`
**Optional create fields (backend defaults):** `databaseId`, `isGrant`

### `derive`

CRUD operations for Derive records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all derive records |
| `find-first` | Find first matching derive record |
| `get` | Get a derive by id |
| `create` | Create a new derive |
| `update` | Update an existing derive |
| `delete` | Delete a derive |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `includeGrants` | Boolean |
| `includeMutations` | Boolean |
| `kind` | String |
| `policyPrefix` | String |
| `sourceTableId` | UUID |
| `tableId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `kind`, `sourceTableId`, `tableId`
**Optional create fields (backend defaults):** `databaseId`, `includeGrants`, `includeMutations`, `policyPrefix`

### `domain`

CRUD operations for Domain records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all domain records |
| `find-first` | Find first matching domain record |
| `get` | Get a domain by id |
| `create` | Create a new domain |
| `update` | Update an existing domain |
| `delete` | Delete a domain |

**Fields:**

| Field | Type |
|-------|------|
| `config` | JSON |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `hostname` | String |
| `id` | UUID |
| `isPublished` | Boolean |
| `isWildcard` | Boolean |
| `managed` | Boolean |
| `parentHostname` | String |
| `tlsReadyAt` | Datetime |
| `tlsSecretName` | String |
| `tlsStatus` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `verificationStatus` | String |
| `verifiedAt` | Datetime |

**Required create fields:** `databaseId`, `hostname`
**Optional create fields (backend defaults):** `config`, `createdByPrincipal`, `isPublished`, `isWildcard`, `managed`, `parentHostname`, `tlsReadyAt`, `tlsSecretName`, `tlsStatus`, `updatedByPrincipal`, `verificationStatus`, `verifiedAt`

### `domain-event`

CRUD operations for DomainEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all domainEvent records |
| `find-first` | Find first matching domainEvent record |
| `get` | Get a domainEvent by id |
| `create` | Create a new domainEvent |
| `update` | Update an existing domainEvent |
| `delete` | Delete a domainEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `domainId` | UUID |
| `domainVerificationId` | UUID |
| `eventType` | String |
| `id` | UUID |
| `managedDomainId` | UUID |
| `message` | String |
| `metadata` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `eventType`
**Optional create fields (backend defaults):** `actorId`, `domainId`, `domainVerificationId`, `managedDomainId`, `message`, `metadata`

### `domain-type`

CRUD operations for DomainType records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all domainType records |
| `find-first` | Find first matching domainType record |
| `get` | Get a domainType by id |
| `create` | Create a new domainType |
| `update` | Update an existing domainType |
| `delete` | Delete a domainType |

**Fields:**

| Field | Type |
|-------|------|
| `baseType` | JSON |
| `category` | ObjectCategory |
| `checkExpr` | JSON |
| `databaseId` | UUID |
| `defaultExpr` | JSON |
| `description` | String |
| `id` | UUID |
| `label` | String |
| `name` | String |
| `notNull` | Boolean |
| `schemaId` | UUID |
| `smartTags` | JSON |
| `tags` | String |

**Required create fields:** `baseType`, `databaseId`, `name`, `schemaId`
**Optional create fields (backend defaults):** `category`, `checkExpr`, `defaultExpr`, `description`, `label`, `notNull`, `smartTags`, `tags`

### `domain-verification`

CRUD operations for DomainVerification records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all domainVerification records |
| `find-first` | Find first matching domainVerification record |
| `get` | Get a domainVerification by id |
| `create` | Create a new domainVerification |
| `update` | Update an existing domainVerification |
| `delete` | Delete a domainVerification |

**Fields:**

| Field | Type |
|-------|------|
| `attempts` | Int |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `domainId` | UUID |
| `error` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `lastCheckedAt` | Datetime |
| `managedDomainId` | UUID |
| `method` | String |
| `recordName` | String |
| `recordType` | String |
| `recordValue` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `verifiedAt` | Datetime |

**Required create fields:** `databaseId`, `method`
**Optional create fields (backend defaults):** `attempts`, `domainId`, `error`, `expiresAt`, `lastCheckedAt`, `managedDomainId`, `recordName`, `recordType`, `recordValue`, `status`, `verifiedAt`

### `email-identity`

CRUD operations for EmailIdentity records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all emailIdentity records |
| `find-first` | Find first matching emailIdentity record |
| `get` | Get a emailIdentity by id |
| `create` | Create a new emailIdentity |
| `update` | Update an existing emailIdentity |
| `delete` | Delete a emailIdentity |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fromAddress` | String |
| `fromName` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `isDefault` | Boolean |
| `name` | String |
| `providerAccountId` | UUID |
| `replyToAddress` | String |
| `supportAddress` | String |
| `transportMode` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `fromAddress`, `name`
**Optional create fields (backend defaults):** `fromName`, `isActive`, `isDefault`, `providerAccountId`, `replyToAddress`, `supportAddress`, `transportMode`

### `email-provider-account`

CRUD operations for EmailProviderAccount records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all emailProviderAccount records |
| `find-first` | Find first matching emailProviderAccount record |
| `get` | Get a emailProviderAccount by id |
| `create` | Create a new emailProviderAccount |
| `update` | Update an existing emailProviderAccount |
| `delete` | Delete a emailProviderAccount |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `credentialsSecretName` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `provider` | String |
| `providerAccountName` | String |
| `region` | String |
| `smtpHost` | String |
| `smtpPort` | Int |
| `smtpSecure` | Boolean |
| `smtpUser` | String |
| `updatedAt` | Datetime |
| `webhookSigningSecretName` | String |

**Required create fields:** `credentialsSecretName`, `databaseId`, `name`, `provider`
**Optional create fields (backend defaults):** `isActive`, `providerAccountName`, `region`, `smtpHost`, `smtpPort`, `smtpSecure`, `smtpUser`, `webhookSigningSecretName`

### `email-site-identity`

CRUD operations for EmailSiteIdentity records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all emailSiteIdentity records |
| `find-first` | Find first matching emailSiteIdentity record |
| `get` | Get a emailSiteIdentity by id |
| `create` | Create a new emailSiteIdentity |
| `update` | Update an existing emailSiteIdentity |
| `delete` | Delete a emailSiteIdentity |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `emailIdentityId` | UUID |
| `id` | UUID |
| `siteId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `emailIdentityId`, `siteId`

### `embedding-chunk`

CRUD operations for EmbeddingChunk records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all embeddingChunk records |
| `find-first` | Find first matching embeddingChunk record |
| `get` | Get a embeddingChunk by id |
| `create` | Create a new embeddingChunk |
| `update` | Update an existing embeddingChunk |
| `delete` | Delete a embeddingChunk |

**Fields:**

| Field | Type |
|-------|------|
| `chunkOverlap` | Int |
| `chunkSize` | Int |
| `chunkStrategy` | String |
| `chunkingTaskName` | String |
| `chunksTableId` | UUID |
| `chunksTableName` | String |
| `contentFieldName` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `dimensions` | Int |
| `embeddingFieldId` | UUID |
| `embeddingModel` | String |
| `embeddingProvider` | String |
| `enqueueChunkingJob` | Boolean |
| `id` | UUID |
| `metadataFields` | JSON |
| `metric` | String |
| `parentFkFieldId` | UUID |
| `searchIndexes` | JSON |
| `sourceFields` | JSON |
| `tableId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `tableId`
**Optional create fields (backend defaults):** `chunkOverlap`, `chunkSize`, `chunkStrategy`, `chunkingTaskName`, `chunksTableId`, `chunksTableName`, `contentFieldName`, `databaseId`, `dimensions`, `embeddingFieldId`, `embeddingModel`, `embeddingProvider`, `enqueueChunkingJob`, `metadataFields`, `metric`, `parentFkFieldId`, `searchIndexes`, `sourceFields`

### `enum`

CRUD operations for Enum records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all enum records |
| `find-first` | Find first matching enum record |
| `get` | Get a enum by id |
| `create` | Create a new enum |
| `update` | Update an existing enum |
| `delete` | Delete a enum |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `label` | String |
| `name` | String |
| `schemaId` | UUID |
| `smartTags` | JSON |
| `tags` | String |
| `values` | String |

**Required create fields:** `databaseId`, `name`, `schemaId`
**Optional create fields (backend defaults):** `category`, `description`, `label`, `smartTags`, `tags`, `values`

### `exclusion-constraint`

CRUD operations for ExclusionConstraint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all exclusionConstraint records |
| `find-first` | Find first matching exclusionConstraint record |
| `get` | Get a exclusionConstraint by id |
| `create` | Create a new exclusionConstraint |
| `update` | Update an existing exclusionConstraint |
| `delete` | Delete a exclusionConstraint |

**Fields:**

| Field | Type |
|-------|------|
| `accessMethod` | String |
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `elementExpr` | JSON |
| `fieldIds` | UUID |
| `id` | UUID |
| `name` | String |
| `operators` | String |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `type` | String |
| `updatedAt` | Datetime |
| `whereClause` | JSON |

**Required create fields:** `tableId`
**Optional create fields (backend defaults):** `accessMethod`, `category`, `databaseId`, `elementExpr`, `fieldIds`, `name`, `operators`, `smartTags`, `tags`, `type`, `whereClause`

### `field-behavior`

CRUD operations for FieldBehavior records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all fieldBehavior records |
| `find-first` | Find first matching fieldBehavior record |
| `get` | Get a fieldBehavior by id |
| `create` | Create a new fieldBehavior |
| `update` | Update an existing fieldBehavior |
| `delete` | Delete a fieldBehavior |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fieldId` | UUID |
| `id` | UUID |
| `modifier` | String |
| `scope` | String |
| `sortOrder` | Int |
| `updatedAt` | Datetime |

**Required create fields:** `fieldId`, `scope`
**Optional create fields (backend defaults):** `databaseId`, `modifier`, `sortOrder`

### `field`

CRUD operations for Field records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all field records |
| `find-first` | Find first matching field record |
| `get` | Get a field by id |
| `create` | Create a new field |
| `update` | Update an existing field |
| `delete` | Delete a field |

**Fields:**

| Field | Type |
|-------|------|
| `apiRequired` | Boolean |
| `category` | ObjectCategory |
| `chk` | JSON |
| `chkExpr` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `defaultValue` | JSON |
| `description` | String |
| `fieldOrder` | Int |
| `generationExpression` | JSON |
| `generationType` | String |
| `id` | UUID |
| `identityGeneration` | String |
| `identityOptions` | JSON |
| `isRequired` | Boolean |
| `label` | String |
| `max` | Float |
| `min` | Float |
| `name` | String |
| `regexp` | String |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `type` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `name`, `tableId`, `type`
**Optional create fields (backend defaults):** `apiRequired`, `category`, `chk`, `chkExpr`, `databaseId`, `defaultValue`, `description`, `fieldOrder`, `generationExpression`, `generationType`, `identityGeneration`, `identityOptions`, `isRequired`, `label`, `max`, `min`, `regexp`, `smartTags`, `tags`

### `foreign-key-constraint-behavior`

CRUD operations for ForeignKeyConstraintBehavior records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all foreignKeyConstraintBehavior records |
| `find-first` | Find first matching foreignKeyConstraintBehavior record |
| `get` | Get a foreignKeyConstraintBehavior by id |
| `create` | Create a new foreignKeyConstraintBehavior |
| `update` | Update an existing foreignKeyConstraintBehavior |
| `delete` | Delete a foreignKeyConstraintBehavior |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `foreignKeyConstraintId` | UUID |
| `id` | UUID |
| `modifier` | String |
| `scope` | String |
| `sortOrder` | Int |
| `updatedAt` | Datetime |

**Required create fields:** `foreignKeyConstraintId`, `scope`
**Optional create fields (backend defaults):** `databaseId`, `modifier`, `sortOrder`

### `foreign-key-constraint`

CRUD operations for ForeignKeyConstraint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all foreignKeyConstraint records |
| `find-first` | Find first matching foreignKeyConstraint record |
| `get` | Get a foreignKeyConstraint by id |
| `create` | Create a new foreignKeyConstraint |
| `update` | Update an existing foreignKeyConstraint |
| `delete` | Delete a foreignKeyConstraint |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `deleteAction` | String |
| `deleteSetFieldIds` | UUID |
| `description` | String |
| `fieldIds` | UUID |
| `id` | UUID |
| `initiallyDeferred` | Boolean |
| `isDeferrable` | Boolean |
| `name` | String |
| `refFieldIds` | UUID |
| `refTableId` | UUID |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `type` | String |
| `updateAction` | String |
| `updatedAt` | Datetime |
| `withPeriod` | Boolean |

**Required create fields:** `fieldIds`, `refFieldIds`, `refTableId`, `tableId`
**Optional create fields (backend defaults):** `category`, `databaseId`, `deleteAction`, `deleteSetFieldIds`, `description`, `initiallyDeferred`, `isDeferrable`, `name`, `smartTags`, `tags`, `type`, `updateAction`, `withPeriod`

### `full-text-search`

CRUD operations for FullTextSearch records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all fullTextSearch records |
| `find-first` | Find first matching fullTextSearch record |
| `get` | Get a fullTextSearch by id |
| `create` | Create a new fullTextSearch |
| `update` | Update an existing fullTextSearch |
| `delete` | Delete a fullTextSearch |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fieldId` | UUID |
| `fieldIds` | UUID |
| `id` | UUID |
| `langColumn` | String |
| `langs` | String |
| `tableId` | UUID |
| `updatedAt` | Datetime |
| `weights` | String |

**Required create fields:** `fieldId`, `fieldIds`, `langs`, `tableId`, `weights`
**Optional create fields (backend defaults):** `databaseId`, `langColumn`

### `function`

CRUD operations for Function records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all function records |
| `find-first` | Find first matching function record |
| `get` | Get a function by id |
| `create` | Create a new function |
| `update` | Update an existing function |
| `delete` | Delete a function |

**Fields:**

| Field | Type |
|-------|------|
| `apiExposed` | Boolean |
| `arguments` | JSON |
| `bodyAst` | JSON |
| `category` | ObjectCategory |
| `data` | JSON |
| `databaseId` | UUID |
| `functionType` | String |
| `id` | UUID |
| `isStrict` | Boolean |
| `kind` | String |
| `name` | String |
| `returns` | JSON |
| `schemaId` | UUID |
| `securityInvoker` | Boolean |
| `smartTags` | JSON |
| `tags` | String |
| `volatility` | String |

**Required create fields:** `databaseId`, `name`, `schemaId`
**Optional create fields (backend defaults):** `apiExposed`, `arguments`, `bodyAst`, `category`, `data`, `functionType`, `isStrict`, `kind`, `returns`, `securityInvoker`, `smartTags`, `tags`, `volatility`

### `get-site-previews-record`

CRUD operations for GetSitePreviewsRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all getSitePreviewsRecord records |
| `find-first` | Find first matching getSitePreviewsRecord record |
| `get` | Get a getSitePreviewsRecord by id |
| `create` | Create a new getSitePreviewsRecord |
| `update` | Update an existing getSitePreviewsRecord |
| `delete` | Delete a getSitePreviewsRecord |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `name` | String |

**Required create fields:** `commitId`, `name`

### `identity-provider-registry`

CRUD operations for IdentityProviderRegistry records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all identityProviderRegistry records |
| `find-first` | Find first matching identityProviderRegistry record |
| `get` | Get a identityProviderRegistry by slug |
| `create` | Create a new identityProviderRegistry |
| `update` | Update an existing identityProviderRegistry |
| `delete` | Delete a identityProviderRegistry |

**Fields:**

| Field | Type |
|-------|------|
| `authorizationUrl` | String |
| `displayName` | String |
| `issuerUrl` | String |
| `kind` | String |
| `scopes` | String |
| `slug` | String |
| `tokenUrl` | String |
| `userinfoUrl` | String |

**Required create fields:** `displayName`, `kind`
**Optional create fields (backend defaults):** `authorizationUrl`, `issuerUrl`, `scopes`, `tokenUrl`, `userinfoUrl`

### `index`

CRUD operations for Index records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all index records |
| `find-first` | Find first matching index record |
| `get` | Get a index by id |
| `create` | Create a new index |
| `update` | Update an existing index |
| `delete` | Delete a index |

**Fields:**

| Field | Type |
|-------|------|
| `accessMethod` | String |
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fieldIds` | UUID |
| `id` | UUID |
| `includeFieldIds` | UUID |
| `indexParams` | JSON |
| `isUnique` | Boolean |
| `name` | String |
| `nullsNotDistinct` | Boolean |
| `opClasses` | String |
| `options` | JSON |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `updatedAt` | Datetime |
| `whereClause` | JSON |

**Required create fields:** `databaseId`, `tableId`
**Optional create fields (backend defaults):** `accessMethod`, `category`, `fieldIds`, `includeFieldIds`, `indexParams`, `isUnique`, `name`, `nullsNotDistinct`, `opClasses`, `options`, `smartTags`, `tags`, `whereClause`

### `list-suspended-databases-record`

CRUD operations for ListSuspendedDatabasesRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all listSuspendedDatabasesRecord records |
| `find-first` | Find first matching listSuspendedDatabasesRecord record |
| `get` | Get a listSuspendedDatabasesRecord by id |
| `create` | Create a new listSuspendedDatabasesRecord |
| `update` | Update an existing listSuspendedDatabasesRecord |
| `delete` | Delete a listSuspendedDatabasesRecord |

**Fields:**

| Field | Type |
|-------|------|
| `id` | UUID |
| `name` | String |
| `ownerId` | UUID |
| `suspendedAt` | Datetime |
| `suspendedReason` | String |

**Required create fields:** `name`, `ownerId`, `suspendedAt`, `suspendedReason`

### `managed-domain`

CRUD operations for ManagedDomain records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all managedDomain records |
| `find-first` | Find first matching managedDomain record |
| `get` | Get a managedDomain by id |
| `create` | Create a new managedDomain |
| `update` | Update an existing managedDomain |
| `delete` | Delete a managedDomain |

**Fields:**

| Field | Type |
|-------|------|
| `allowPublicUsage` | Boolean |
| `annotations` | JSON |
| `certStatus` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `domain` | String |
| `id` | UUID |
| `isWildcard` | Boolean |
| `publicPort` | Int |
| `tlsReadyAt` | Datetime |
| `tlsStatus` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `verificationStatus` | String |
| `verifiedAt` | Datetime |

**Required create fields:** `databaseId`, `domain`
**Optional create fields (backend defaults):** `allowPublicUsage`, `annotations`, `certStatus`, `createdByPrincipal`, `isWildcard`, `publicPort`, `tlsReadyAt`, `tlsStatus`, `updatedByPrincipal`, `verificationStatus`, `verifiedAt`

### `node-type-registry`

CRUD operations for NodeTypeRegistry records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all nodeTypeRegistry records |
| `find-first` | Find first matching nodeTypeRegistry record |
| `get` | Get a nodeTypeRegistry by name |
| `create` | Create a new nodeTypeRegistry |
| `update` | Update an existing nodeTypeRegistry |
| `delete` | Delete a nodeTypeRegistry |

**Fields:**

| Field | Type |
|-------|------|
| `category` | String |
| `description` | String |
| `displayName` | String |
| `name` | String |
| `parameterSchema` | JSON |
| `slug` | String |
| `tags` | String |

**Required create fields:** `category`, `slug`
**Optional create fields (backend defaults):** `description`, `displayName`, `parameterSchema`, `tags`

### `page`

CRUD operations for Page records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all page records |
| `find-first` | Find first matching page record |
| `get` | Get a page by id |
| `create` | Create a new page |
| `update` | Update an existing page |
| `delete` | Delete a page |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `content` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `seededFrom` | JSON |
| `siteId` | UUID |
| `slug` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `content`, `databaseId`, `siteId`, `slug`
**Optional create fields (backend defaults):** `commitId`, `seededFrom`, `storeId`

### `partition`

CRUD operations for Partition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all partition records |
| `find-first` | Find first matching partition record |
| `get` | Get a partition by id |
| `create` | Create a new partition |
| `update` | Update an existing partition |
| `delete` | Delete a partition |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `interval` | String |
| `isParented` | Boolean |
| `namingPattern` | String |
| `partitionKeyId` | UUID |
| `premake` | Int |
| `retention` | String |
| `retentionKeepTable` | Boolean |
| `strategy` | String |
| `tableId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `partitionKeyId`, `strategy`, `tableId`
**Optional create fields (backend defaults):** `interval`, `isParented`, `namingPattern`, `premake`, `retention`, `retentionKeepTable`

### `platform-api`

CRUD operations for PlatformApi records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformApi records |
| `find-first` | Find first matching platformApi record |
| `get` | Get a platformApi by id |
| `create` | Create a new platformApi |
| `update` | Update an existing platformApi |
| `delete` | Delete a platformApi |

**Fields:**

| Field | Type |
|-------|------|
| `anonRole` | String |
| `config` | JSON |
| `createdAt` | Datetime |
| `dbname` | String |
| `id` | UUID |
| `isPublished` | Boolean |
| `name` | String |
| `roleName` | String |
| `updatedAt` | Datetime |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `anonRole`, `config`, `dbname`, `isPublished`, `roleName`

### `platform-api-schema`

CRUD operations for PlatformApiSchema records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformApiSchema records |
| `find-first` | Find first matching platformApiSchema record |
| `get` | Get a platformApiSchema by id |
| `create` | Create a new platformApiSchema |
| `update` | Update an existing platformApiSchema |
| `delete` | Delete a platformApiSchema |

**Fields:**

| Field | Type |
|-------|------|
| `apiId` | UUID |
| `createdAt` | Datetime |
| `id` | UUID |
| `schemaId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `apiId`, `schemaId`

### `platform-api-setting`

CRUD operations for PlatformApiSetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformApiSetting records |
| `find-first` | Find first matching platformApiSetting record |
| `get` | Get a platformApiSetting by id |
| `create` | Create a new platformApiSetting |
| `update` | Update an existing platformApiSetting |
| `delete` | Delete a platformApiSetting |

**Fields:**

| Field | Type |
|-------|------|
| `apiId` | UUID |
| `createdAt` | Datetime |
| `enableAggregates` | Boolean |
| `enableBulk` | Boolean |
| `enableConnectionFilter` | Boolean |
| `enableDirectUploads` | Boolean |
| `enableI18N` | Boolean |
| `enableIntrospection` | Boolean |
| `enableLlm` | Boolean |
| `enableLtree` | Boolean |
| `enableManyToMany` | Boolean |
| `enablePostgis` | Boolean |
| `enablePresignedUploads` | Boolean |
| `enableRealtime` | Boolean |
| `enableSearch` | Boolean |
| `id` | UUID |
| `idleInTransactionTimeoutMs` | BigInt |
| `lockTimeoutMs` | BigInt |
| `maxConcurrentRequests` | Int |
| `maxPageSize` | Int |
| `maxQueryCost` | Int |
| `maxQueryDepth` | Int |
| `maxQueueWaitMs` | Int |
| `maxRequestBytes` | Int |
| `options` | JSON |
| `rateLimitBurst` | Int |
| `rateLimitRpm` | Int |
| `statementTimeoutMs` | BigInt |
| `updatedAt` | Datetime |

**Required create fields:** `apiId`
**Optional create fields (backend defaults):** `enableAggregates`, `enableBulk`, `enableConnectionFilter`, `enableDirectUploads`, `enableI18N`, `enableIntrospection`, `enableLlm`, `enableLtree`, `enableManyToMany`, `enablePostgis`, `enablePresignedUploads`, `enableRealtime`, `enableSearch`, `idleInTransactionTimeoutMs`, `lockTimeoutMs`, `maxConcurrentRequests`, `maxPageSize`, `maxQueryCost`, `maxQueryDepth`, `maxQueueWaitMs`, `maxRequestBytes`, `options`, `rateLimitBurst`, `rateLimitRpm`, `statementTimeoutMs`

### `platform-cors-setting`

CRUD operations for PlatformCorsSetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformCorsSetting records |
| `find-first` | Find first matching platformCorsSetting record |
| `get` | Get a platformCorsSetting by id |
| `create` | Create a new platformCorsSetting |
| `update` | Update an existing platformCorsSetting |
| `delete` | Delete a platformCorsSetting |

**Fields:**

| Field | Type |
|-------|------|
| `allowedOrigins` | String |
| `apiId` | UUID |
| `createdAt` | Datetime |
| `id` | UUID |
| `updatedAt` | Datetime |

**Optional create fields (backend defaults):** `allowedOrigins`, `apiId`

### `platform-domain`

CRUD operations for PlatformDomain records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformDomain records |
| `find-first` | Find first matching platformDomain record |
| `get` | Get a platformDomain by id |
| `create` | Create a new platformDomain |
| `update` | Update an existing platformDomain |
| `delete` | Delete a platformDomain |

**Fields:**

| Field | Type |
|-------|------|
| `config` | JSON |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `hostname` | String |
| `id` | UUID |
| `isPublished` | Boolean |
| `isWildcard` | Boolean |
| `managed` | Boolean |
| `parentHostname` | String |
| `tlsReadyAt` | Datetime |
| `tlsSecretName` | String |
| `tlsStatus` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `verificationStatus` | String |
| `verifiedAt` | Datetime |

**Required create fields:** `hostname`
**Optional create fields (backend defaults):** `config`, `createdByPrincipal`, `isPublished`, `isWildcard`, `managed`, `parentHostname`, `tlsReadyAt`, `tlsSecretName`, `tlsStatus`, `updatedByPrincipal`, `verificationStatus`, `verifiedAt`

### `platform-domain-event`

CRUD operations for PlatformDomainEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformDomainEvent records |
| `find-first` | Find first matching platformDomainEvent record |
| `get` | Get a platformDomainEvent by id |
| `create` | Create a new platformDomainEvent |
| `update` | Update an existing platformDomainEvent |
| `delete` | Delete a platformDomainEvent |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `createdAt` | Datetime |
| `domainId` | UUID |
| `domainVerificationId` | UUID |
| `eventType` | String |
| `id` | UUID |
| `managedDomainId` | UUID |
| `message` | String |
| `metadata` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `eventType`
**Optional create fields (backend defaults):** `actorId`, `domainId`, `domainVerificationId`, `managedDomainId`, `message`, `metadata`

### `platform-domain-verification`

CRUD operations for PlatformDomainVerification records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformDomainVerification records |
| `find-first` | Find first matching platformDomainVerification record |
| `get` | Get a platformDomainVerification by id |
| `create` | Create a new platformDomainVerification |
| `update` | Update an existing platformDomainVerification |
| `delete` | Delete a platformDomainVerification |

**Fields:**

| Field | Type |
|-------|------|
| `attempts` | Int |
| `createdAt` | Datetime |
| `domainId` | UUID |
| `error` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `lastCheckedAt` | Datetime |
| `managedDomainId` | UUID |
| `method` | String |
| `recordName` | String |
| `recordType` | String |
| `recordValue` | String |
| `status` | String |
| `updatedAt` | Datetime |
| `verifiedAt` | Datetime |

**Required create fields:** `method`
**Optional create fields (backend defaults):** `attempts`, `domainId`, `error`, `expiresAt`, `lastCheckedAt`, `managedDomainId`, `recordName`, `recordType`, `recordValue`, `status`, `verifiedAt`

### `platform-email-identity`

CRUD operations for PlatformEmailIdentity records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformEmailIdentity records |
| `find-first` | Find first matching platformEmailIdentity record |
| `get` | Get a platformEmailIdentity by id |
| `create` | Create a new platformEmailIdentity |
| `update` | Update an existing platformEmailIdentity |
| `delete` | Delete a platformEmailIdentity |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `fromAddress` | String |
| `fromName` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `isDefault` | Boolean |
| `name` | String |
| `providerAccountId` | UUID |
| `replyToAddress` | String |
| `supportAddress` | String |
| `transportMode` | String |
| `updatedAt` | Datetime |

**Required create fields:** `fromAddress`, `name`
**Optional create fields (backend defaults):** `fromName`, `isActive`, `isDefault`, `providerAccountId`, `replyToAddress`, `supportAddress`, `transportMode`

### `platform-email-provider-account`

CRUD operations for PlatformEmailProviderAccount records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformEmailProviderAccount records |
| `find-first` | Find first matching platformEmailProviderAccount record |
| `get` | Get a platformEmailProviderAccount by id |
| `create` | Create a new platformEmailProviderAccount |
| `update` | Update an existing platformEmailProviderAccount |
| `delete` | Delete a platformEmailProviderAccount |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `credentialsSecretName` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `provider` | String |
| `providerAccountName` | String |
| `region` | String |
| `smtpHost` | String |
| `smtpPort` | Int |
| `smtpSecure` | Boolean |
| `smtpUser` | String |
| `updatedAt` | Datetime |
| `webhookSigningSecretName` | String |

**Required create fields:** `credentialsSecretName`, `name`, `provider`
**Optional create fields (backend defaults):** `isActive`, `providerAccountName`, `region`, `smtpHost`, `smtpPort`, `smtpSecure`, `smtpUser`, `webhookSigningSecretName`

### `platform-email-site-identity`

CRUD operations for PlatformEmailSiteIdentity records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformEmailSiteIdentity records |
| `find-first` | Find first matching platformEmailSiteIdentity record |
| `get` | Get a platformEmailSiteIdentity by id |
| `create` | Create a new platformEmailSiteIdentity |
| `update` | Update an existing platformEmailSiteIdentity |
| `delete` | Delete a platformEmailSiteIdentity |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `emailIdentityId` | UUID |
| `id` | UUID |
| `siteId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `emailIdentityId`, `siteId`

### `platform-get-site-previews-record`

CRUD operations for PlatformGetSitePreviewsRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformGetSitePreviewsRecord records |
| `find-first` | Find first matching platformGetSitePreviewsRecord record |
| `get` | Get a platformGetSitePreviewsRecord by id |
| `create` | Create a new platformGetSitePreviewsRecord |
| `update` | Update an existing platformGetSitePreviewsRecord |
| `delete` | Delete a platformGetSitePreviewsRecord |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `name` | String |

**Required create fields:** `commitId`, `name`

### `platform-managed-domain`

CRUD operations for PlatformManagedDomain records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformManagedDomain records |
| `find-first` | Find first matching platformManagedDomain record |
| `get` | Get a platformManagedDomain by id |
| `create` | Create a new platformManagedDomain |
| `update` | Update an existing platformManagedDomain |
| `delete` | Delete a platformManagedDomain |

**Fields:**

| Field | Type |
|-------|------|
| `allowPublicUsage` | Boolean |
| `annotations` | JSON |
| `certStatus` | String |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `domain` | String |
| `id` | UUID |
| `isWildcard` | Boolean |
| `publicPort` | Int |
| `tlsReadyAt` | Datetime |
| `tlsStatus` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |
| `verificationStatus` | String |
| `verifiedAt` | Datetime |

**Required create fields:** `domain`
**Optional create fields (backend defaults):** `allowPublicUsage`, `annotations`, `certStatus`, `createdByPrincipal`, `isWildcard`, `publicPort`, `tlsReadyAt`, `tlsStatus`, `updatedByPrincipal`, `verificationStatus`, `verifiedAt`

### `platform-page`

CRUD operations for PlatformPage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformPage records |
| `find-first` | Find first matching platformPage record |
| `get` | Get a platformPage by id |
| `create` | Create a new platformPage |
| `update` | Update an existing platformPage |
| `delete` | Delete a platformPage |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `content` | JSON |
| `createdAt` | Datetime |
| `id` | UUID |
| `seededFrom` | JSON |
| `siteId` | UUID |
| `slug` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `content`, `siteId`, `slug`
**Optional create fields (backend defaults):** `commitId`, `seededFrom`, `storeId`

### `platform-site-app-link`

CRUD operations for PlatformSiteAppLink records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteAppLink records |
| `find-first` | Find first matching platformSiteAppLink record |
| `get` | Get a platformSiteAppLink by id |
| `create` | Create a new platformSiteAppLink |
| `update` | Update an existing platformSiteAppLink |
| `delete` | Delete a platformSiteAppLink |

**Fields:**

| Field | Type |
|-------|------|
| `appStoreIdentityId` | UUID |
| `createdAt` | Datetime |
| `id` | UUID |
| `pathComponents` | String |
| `siteId` | UUID |
| `updatedAt` | Datetime |
| `webcredentials` | Boolean |

**Required create fields:** `appStoreIdentityId`, `siteId`
**Optional create fields (backend defaults):** `pathComponents`, `webcredentials`

### `platform-site`

CRUD operations for PlatformSite records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSite records |
| `find-first` | Find first matching platformSite record |
| `get` | Get a platformSite by id |
| `create` | Create a new platformSite |
| `update` | Update an existing platformSite |
| `delete` | Delete a platformSite |

**Fields:**

| Field | Type |
|-------|------|
| `activeCommitId` | UUID |
| `bucketId` | UUID |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `description` | String |
| `id` | UUID |
| `installationId` | UUID |
| `installationMemberSlug` | String |
| `isPublished` | Boolean |
| `name` | String |
| `resourceId` | UUID |
| `title` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `activeCommitId`, `bucketId`, `createdByPrincipal`, `description`, `installationId`, `installationMemberSlug`, `isPublished`, `resourceId`, `title`, `updatedByPrincipal`

### `platform-site-deep-link`

CRUD operations for PlatformSiteDeepLink records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteDeepLink records |
| `find-first` | Find first matching platformSiteDeepLink record |
| `get` | Get a platformSiteDeepLink by id |
| `create` | Create a new platformSiteDeepLink |
| `update` | Update an existing platformSiteDeepLink |
| `delete` | Delete a platformSiteDeepLink |

**Fields:**

| Field | Type |
|-------|------|
| `appPath` | String |
| `createdAt` | Datetime |
| `fallbackUrl` | String |
| `id` | UUID |
| `metadata` | JSON |
| `pageId` | UUID |
| `siteId` | UUID |
| `slug` | String |
| `updatedAt` | Datetime |
| `webPath` | String |

**Required create fields:** `appPath`, `siteId`, `slug`
**Optional create fields (backend defaults):** `fallbackUrl`, `metadata`, `pageId`, `webPath`

### `platform-site-error-page`

CRUD operations for PlatformSiteErrorPage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteErrorPage records |
| `find-first` | Find first matching platformSiteErrorPage record |
| `get` | Get a platformSiteErrorPage by id |
| `create` | Create a new platformSiteErrorPage |
| `update` | Update an existing platformSiteErrorPage |
| `delete` | Delete a platformSiteErrorPage |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `id` | UUID |
| `objectPath` | String |
| `siteId` | UUID |
| `statusCode` | Int |
| `updatedAt` | Datetime |

**Required create fields:** `objectPath`, `siteId`, `statusCode`

### `platform-site-metadatum`

CRUD operations for PlatformSiteMetadatum records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteMetadatum records |
| `find-first` | Find first matching platformSiteMetadatum record |
| `get` | Get a platformSiteMetadatum by id |
| `create` | Create a new platformSiteMetadatum |
| `update` | Update an existing platformSiteMetadatum |
| `delete` | Delete a platformSiteMetadatum |

**Fields:**

| Field | Type |
|-------|------|
| `appleTouchIcon` | Image |
| `canonicalUrl` | String |
| `commitId` | UUID |
| `createdAt` | Datetime |
| `description` | String |
| `favicon` | Image |
| `id` | UUID |
| `logo` | Image |
| `ogImage` | Image |
| `robots` | String |
| `robotsSeededFrom` | JSON |
| `siteId` | UUID |
| `storeId` | UUID |
| `title` | String |
| `updatedAt` | Datetime |

**Required create fields:** `siteId`
**Optional create fields (backend defaults):** `appleTouchIcon`, `canonicalUrl`, `commitId`, `description`, `favicon`, `logo`, `ogImage`, `robots`, `robotsSeededFrom`, `storeId`, `title`

### `platform-site-module`

CRUD operations for PlatformSiteModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteModule records |
| `find-first` | Find first matching platformSiteModule record |
| `get` | Get a platformSiteModule by id |
| `create` | Create a new platformSiteModule |
| `update` | Update an existing platformSiteModule |
| `delete` | Delete a platformSiteModule |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `id` | UUID |
| `isEnabled` | Boolean |
| `name` | String |
| `position` | Int |
| `siteId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `data`, `name`, `siteId`
**Optional create fields (backend defaults):** `isEnabled`, `position`

### `platform-site-release`

CRUD operations for PlatformSiteRelease records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteRelease records |
| `find-first` | Find first matching platformSiteRelease record |
| `get` | Get a platformSiteRelease by id |
| `create` | Create a new platformSiteRelease |
| `update` | Update an existing platformSiteRelease |
| `delete` | Delete a platformSiteRelease |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `createdAt` | Datetime |
| `id` | UUID |
| `manifest` | JSON |
| `siteId` | UUID |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `manifest`, `siteId`
**Optional create fields (backend defaults):** `commitId`, `storeId`

### `platform-site-theme`

CRUD operations for PlatformSiteTheme records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteTheme records |
| `find-first` | Find first matching platformSiteTheme record |
| `get` | Get a platformSiteTheme by id |
| `create` | Create a new platformSiteTheme |
| `update` | Update an existing platformSiteTheme |
| `delete` | Delete a platformSiteTheme |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `createdAt` | Datetime |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `siteId` | UUID |
| `storeId` | UUID |
| `theme` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `siteId`, `theme`
**Optional create fields (backend defaults):** `commitId`, `isActive`, `name`, `storeId`

### `platform-site-web-config`

CRUD operations for PlatformSiteWebConfig records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSiteWebConfig records |
| `find-first` | Find first matching platformSiteWebConfig record |
| `get` | Get a platformSiteWebConfig by id |
| `create` | Create a new platformSiteWebConfig |
| `update` | Update an existing platformSiteWebConfig |
| `delete` | Delete a platformSiteWebConfig |

**Fields:**

| Field | Type |
|-------|------|
| `cleanUrls` | Boolean |
| `createdAt` | Datetime |
| `id` | UUID |
| `indexDocument` | String |
| `metadata` | JSON |
| `siteId` | UUID |
| `spaFallback` | Boolean |
| `updatedAt` | Datetime |

**Required create fields:** `siteId`
**Optional create fields (backend defaults):** `cleanUrls`, `indexDocument`, `metadata`, `spaFallback`

### `policy`

CRUD operations for Policy records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all policy records |
| `find-first` | Find first matching policy record |
| `get` | Get a policy by id |
| `create` | Create a new policy |
| `update` | Update an existing policy |
| `delete` | Delete a policy |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `columnRefs` | String |
| `createdAt` | Datetime |
| `data` | JSON |
| `databaseId` | UUID |
| `derivedFromPolicyId` | UUID |
| `derivedFromTableId` | UUID |
| `disabled` | Boolean |
| `granteeName` | String |
| `id` | UUID |
| `name` | String |
| `permissive` | Boolean |
| `policyType` | String |
| `privilege` | String |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `updatedAt` | Datetime |
| `withCheck` | JSON |

**Required create fields:** `tableId`
**Optional create fields (backend defaults):** `category`, `columnRefs`, `data`, `databaseId`, `derivedFromPolicyId`, `derivedFromTableId`, `disabled`, `granteeName`, `name`, `permissive`, `policyType`, `privilege`, `smartTags`, `tags`, `withCheck`

### `primary-key-constraint`

CRUD operations for PrimaryKeyConstraint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all primaryKeyConstraint records |
| `find-first` | Find first matching primaryKeyConstraint record |
| `get` | Get a primaryKeyConstraint by id |
| `create` | Create a new primaryKeyConstraint |
| `update` | Update an existing primaryKeyConstraint |
| `delete` | Delete a primaryKeyConstraint |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fieldIds` | UUID |
| `id` | UUID |
| `initiallyDeferred` | Boolean |
| `isDeferrable` | Boolean |
| `name` | String |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `type` | String |
| `updatedAt` | Datetime |
| `withoutOverlaps` | Boolean |

**Required create fields:** `fieldIds`, `tableId`
**Optional create fields (backend defaults):** `category`, `databaseId`, `initiallyDeferred`, `isDeferrable`, `name`, `smartTags`, `tags`, `type`, `withoutOverlaps`

### `pubkey-setting`

CRUD operations for PubkeySetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all pubkeySetting records |
| `find-first` | Find first matching pubkeySetting record |
| `get` | Get a pubkeySetting by id |
| `create` | Create a new pubkeySetting |
| `update` | Update an existing pubkeySetting |
| `delete` | Delete a pubkeySetting |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `cryptoNetwork` | String |
| `databaseId` | UUID |
| `id` | UUID |
| `schemaId` | UUID |
| `signInRecordFailureFunctionId` | UUID |
| `signInRequestChallengeFunctionId` | UUID |
| `signInWithChallengeFunctionId` | UUID |
| `signUpWithKeyFunctionId` | UUID |
| `updatedAt` | Datetime |
| `userField` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `cryptoNetwork`, `schemaId`, `signInRecordFailureFunctionId`, `signInRequestChallengeFunctionId`, `signInWithChallengeFunctionId`, `signUpWithKeyFunctionId`, `userField`

### `redirect`

CRUD operations for Redirect records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all redirect records |
| `find-first` | Find first matching redirect record |
| `get` | Get a redirect by id |
| `create` | Create a new redirect |
| `update` | Update an existing redirect |
| `delete` | Delete a redirect |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `name` | String |
| `preservePath` | Boolean |
| `preserveQuery` | Boolean |
| `statusCode` | Int |
| `toHost` | String |
| `toPath` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`, `toHost`
**Optional create fields (backend defaults):** `preservePath`, `preserveQuery`, `statusCode`, `toPath`

### `rls-setting`

CRUD operations for RlsSetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all rlsSetting records |
| `find-first` | Find first matching rlsSetting record |
| `get` | Get a rlsSetting by id |
| `create` | Create a new rlsSetting |
| `update` | Update an existing rlsSetting |
| `delete` | Delete a rlsSetting |

**Fields:**

| Field | Type |
|-------|------|
| `authenticateFunctionId` | UUID |
| `authenticateSchemaId` | UUID |
| `authenticateStrictFunctionId` | UUID |
| `createdAt` | Datetime |
| `currentIpAddressFunctionId` | UUID |
| `currentRoleFunctionId` | UUID |
| `currentRoleIdFunctionId` | UUID |
| `currentUserAgentFunctionId` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `roleSchemaId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `authenticateFunctionId`, `authenticateSchemaId`, `authenticateStrictFunctionId`, `currentIpAddressFunctionId`, `currentRoleFunctionId`, `currentRoleIdFunctionId`, `currentUserAgentFunctionId`, `roleSchemaId`

### `route`

CRUD operations for Route records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all route records |
| `find-first` | Find first matching route record |
| `get` | Get a route by id |
| `create` | Create a new route |
| `update` | Update an existing route |
| `delete` | Delete a route |

**Fields:**

| Field | Type |
|-------|------|
| `anonymous` | Boolean |
| `config` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `domainId` | UUID |
| `id` | UUID |
| `isActive` | Boolean |
| `method` | String |
| `path` | String |
| `previewRef` | String |
| `priority` | Int |
| `servingSiteId` | UUID |
| `targetApiId` | UUID |
| `targetBucketId` | UUID |
| `targetFunctionId` | UUID |
| `targetRedirectId` | UUID |
| `targetServiceId` | UUID |
| `targetSiteId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `domainId`
**Optional create fields (backend defaults):** `anonymous`, `config`, `isActive`, `method`, `path`, `previewRef`, `priority`, `servingSiteId`, `targetApiId`, `targetBucketId`, `targetFunctionId`, `targetRedirectId`, `targetServiceId`, `targetSiteId`

### `schema`

CRUD operations for Schema records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all schema records |
| `find-first` | Find first matching schema record |
| `get` | Get a schema by id |
| `create` | Create a new schema |
| `update` | Update an existing schema |
| `delete` | Delete a schema |

**Fields:**

| Field | Type |
|-------|------|
| `apiExposure` | ApiExposureLevel |
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `isPublic` | Boolean |
| `label` | String |
| `name` | String |
| `schemaName` | String |
| `smartTags` | JSON |
| `tags` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`, `schemaName`
**Optional create fields (backend defaults):** `apiExposure`, `category`, `description`, `isPublic`, `label`, `smartTags`, `tags`

### `schema-grant`

CRUD operations for SchemaGrant records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all schemaGrant records |
| `find-first` | Find first matching schemaGrant record |
| `get` | Get a schemaGrant by id |
| `create` | Create a new schemaGrant |
| `update` | Update an existing schemaGrant |
| `delete` | Delete a schemaGrant |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `granteeName` | String |
| `id` | UUID |
| `schemaId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `granteeName`, `schemaId`
**Optional create fields (backend defaults):** `databaseId`

### `site-app-link`

CRUD operations for SiteAppLink records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteAppLink records |
| `find-first` | Find first matching siteAppLink record |
| `get` | Get a siteAppLink by id |
| `create` | Create a new siteAppLink |
| `update` | Update an existing siteAppLink |
| `delete` | Delete a siteAppLink |

**Fields:**

| Field | Type |
|-------|------|
| `appStoreIdentityId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `pathComponents` | String |
| `siteId` | UUID |
| `updatedAt` | Datetime |
| `webcredentials` | Boolean |

**Required create fields:** `appStoreIdentityId`, `databaseId`, `siteId`
**Optional create fields (backend defaults):** `pathComponents`, `webcredentials`

### `site`

CRUD operations for Site records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all site records |
| `find-first` | Find first matching site record |
| `get` | Get a site by id |
| `create` | Create a new site |
| `update` | Update an existing site |
| `delete` | Delete a site |

**Fields:**

| Field | Type |
|-------|------|
| `activeCommitId` | UUID |
| `bucketId` | UUID |
| `createdAt` | Datetime |
| `createdByPrincipal` | UUID |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `installationId` | UUID |
| `installationMemberSlug` | String |
| `isPublished` | Boolean |
| `name` | String |
| `resourceId` | UUID |
| `title` | String |
| `updatedAt` | Datetime |
| `updatedByPrincipal` | UUID |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `activeCommitId`, `bucketId`, `createdByPrincipal`, `description`, `installationId`, `installationMemberSlug`, `isPublished`, `resourceId`, `title`, `updatedByPrincipal`

### `site-deep-link`

CRUD operations for SiteDeepLink records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteDeepLink records |
| `find-first` | Find first matching siteDeepLink record |
| `get` | Get a siteDeepLink by id |
| `create` | Create a new siteDeepLink |
| `update` | Update an existing siteDeepLink |
| `delete` | Delete a siteDeepLink |

**Fields:**

| Field | Type |
|-------|------|
| `appPath` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fallbackUrl` | String |
| `id` | UUID |
| `metadata` | JSON |
| `pageId` | UUID |
| `siteId` | UUID |
| `slug` | String |
| `updatedAt` | Datetime |
| `webPath` | String |

**Required create fields:** `appPath`, `databaseId`, `siteId`, `slug`
**Optional create fields (backend defaults):** `fallbackUrl`, `metadata`, `pageId`, `webPath`

### `site-error-page`

CRUD operations for SiteErrorPage records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteErrorPage records |
| `find-first` | Find first matching siteErrorPage record |
| `get` | Get a siteErrorPage by id |
| `create` | Create a new siteErrorPage |
| `update` | Update an existing siteErrorPage |
| `delete` | Delete a siteErrorPage |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `objectPath` | String |
| `siteId` | UUID |
| `statusCode` | Int |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `objectPath`, `siteId`, `statusCode`

### `site-metadatum`

CRUD operations for SiteMetadatum records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteMetadatum records |
| `find-first` | Find first matching siteMetadatum record |
| `get` | Get a siteMetadatum by id |
| `create` | Create a new siteMetadatum |
| `update` | Update an existing siteMetadatum |
| `delete` | Delete a siteMetadatum |

**Fields:**

| Field | Type |
|-------|------|
| `appleTouchIcon` | Image |
| `canonicalUrl` | String |
| `commitId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `favicon` | Image |
| `id` | UUID |
| `logo` | Image |
| `ogImage` | Image |
| `robots` | String |
| `robotsSeededFrom` | JSON |
| `siteId` | UUID |
| `storeId` | UUID |
| `title` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `siteId`
**Optional create fields (backend defaults):** `appleTouchIcon`, `canonicalUrl`, `commitId`, `description`, `favicon`, `logo`, `ogImage`, `robots`, `robotsSeededFrom`, `storeId`, `title`

### `site-module`

CRUD operations for SiteModule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteModule records |
| `find-first` | Find first matching siteModule record |
| `get` | Get a siteModule by id |
| `create` | Create a new siteModule |
| `update` | Update an existing siteModule |
| `delete` | Delete a siteModule |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `databaseId` | UUID |
| `id` | UUID |
| `isEnabled` | Boolean |
| `name` | String |
| `position` | Int |
| `siteId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `data`, `databaseId`, `name`, `siteId`
**Optional create fields (backend defaults):** `isEnabled`, `position`

### `site-release`

CRUD operations for SiteRelease records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteRelease records |
| `find-first` | Find first matching siteRelease record |
| `get` | Get a siteRelease by id |
| `create` | Create a new siteRelease |
| `update` | Update an existing siteRelease |
| `delete` | Delete a siteRelease |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `manifest` | JSON |
| `siteId` | UUID |
| `storeId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `manifest`, `siteId`
**Optional create fields (backend defaults):** `commitId`, `storeId`

### `site-theme`

CRUD operations for SiteTheme records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteTheme records |
| `find-first` | Find first matching siteTheme record |
| `get` | Get a siteTheme by id |
| `create` | Create a new siteTheme |
| `update` | Update an existing siteTheme |
| `delete` | Delete a siteTheme |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `isActive` | Boolean |
| `name` | String |
| `siteId` | UUID |
| `storeId` | UUID |
| `theme` | JSON |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `siteId`, `theme`
**Optional create fields (backend defaults):** `commitId`, `isActive`, `name`, `storeId`

### `site-web-config`

CRUD operations for SiteWebConfig records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all siteWebConfig records |
| `find-first` | Find first matching siteWebConfig record |
| `get` | Get a siteWebConfig by id |
| `create` | Create a new siteWebConfig |
| `update` | Update an existing siteWebConfig |
| `delete` | Delete a siteWebConfig |

**Fields:**

| Field | Type |
|-------|------|
| `cleanUrls` | Boolean |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `indexDocument` | String |
| `metadata` | JSON |
| `siteId` | UUID |
| `spaFallback` | Boolean |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `siteId`
**Optional create fields (backend defaults):** `cleanUrls`, `indexDocument`, `metadata`, `spaFallback`

### `spatial-relation`

CRUD operations for SpatialRelation records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all spatialRelation records |
| `find-first` | Find first matching spatialRelation record |
| `get` | Get a spatialRelation by id |
| `create` | Create a new spatialRelation |
| `update` | Update an existing spatialRelation |
| `delete` | Delete a spatialRelation |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fieldId` | UUID |
| `id` | UUID |
| `name` | String |
| `operator` | String |
| `paramName` | String |
| `refFieldId` | UUID |
| `refTableId` | UUID |
| `tableId` | UUID |
| `tags` | String |
| `updatedAt` | Datetime |

**Required create fields:** `fieldId`, `name`, `operator`, `refFieldId`, `refTableId`, `tableId`
**Optional create fields (backend defaults):** `category`, `databaseId`, `paramName`, `tags`

### `sql-action`

CRUD operations for SqlAction records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all sqlAction records |
| `find-first` | Find first matching sqlAction record |
| `get` | Get a sqlAction by id |
| `create` | Create a new sqlAction |
| `update` | Update an existing sqlAction |
| `delete` | Delete a sqlAction |

**Fields:**

| Field | Type |
|-------|------|
| `actionId` | UUID |
| `actionName` | String |
| `actorId` | UUID |
| `content` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `deploy` | String |
| `deps` | String |
| `id` | Int |
| `name` | String |
| `payload` | JSON |
| `revert` | String |
| `verify` | String |

**Required create fields:** `actionId`, `actionName`, `actorId`, `content`, `databaseId`, `deploy`, `deps`, `name`, `payload`, `revert`, `verify`

### `table-behavior`

CRUD operations for TableBehavior records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all tableBehavior records |
| `find-first` | Find first matching tableBehavior record |
| `get` | Get a tableBehavior by id |
| `create` | Create a new tableBehavior |
| `update` | Update an existing tableBehavior |
| `delete` | Delete a tableBehavior |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `modifier` | String |
| `scope` | String |
| `sortOrder` | Int |
| `tableId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `scope`, `tableId`
**Optional create fields (backend defaults):** `databaseId`, `modifier`, `sortOrder`

### `table`

CRUD operations for Table records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all table records |
| `find-first` | Find first matching table record |
| `get` | Get a table by id |
| `create` | Create a new table |
| `update` | Update an existing table |
| `delete` | Delete a table |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `inheritsId` | UUID |
| `label` | String |
| `name` | String |
| `partitionKeyNames` | String |
| `partitionKeyTypes` | String |
| `partitionStrategy` | String |
| `partitioned` | Boolean |
| `peoplestamps` | Boolean |
| `pluralName` | String |
| `principalstamps` | Boolean |
| `schemaId` | UUID |
| `singularName` | String |
| `smartTags` | JSON |
| `stepUp` | JSON |
| `tags` | String |
| `timestamps` | Boolean |
| `updatedAt` | Datetime |
| `useRls` | Boolean |

**Required create fields:** `name`, `schemaId`
**Optional create fields (backend defaults):** `category`, `databaseId`, `description`, `inheritsId`, `label`, `partitionKeyNames`, `partitionKeyTypes`, `partitionStrategy`, `partitioned`, `peoplestamps`, `pluralName`, `principalstamps`, `singularName`, `smartTags`, `stepUp`, `tags`, `timestamps`, `useRls`

### `table-grant`

CRUD operations for TableGrant records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all tableGrant records |
| `find-first` | Find first matching tableGrant record |
| `get` | Get a tableGrant by id |
| `create` | Create a new tableGrant |
| `update` | Update an existing tableGrant |
| `delete` | Delete a tableGrant |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `fieldIds` | UUID |
| `granteeName` | String |
| `id` | UUID |
| `isGrant` | Boolean |
| `privilege` | String |
| `tableId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `granteeName`, `privilege`, `tableId`
**Optional create fields (backend defaults):** `databaseId`, `fieldIds`, `isGrant`

### `trigger`

CRUD operations for Trigger records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all trigger records |
| `find-first` | Find first matching trigger record |
| `get` | Get a trigger by id |
| `create` | Create a new trigger |
| `update` | Update an existing trigger |
| `delete` | Delete a trigger |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `event` | String |
| `events` | String |
| `forEachRow` | Boolean |
| `functionId` | UUID |
| `functionName` | String |
| `id` | UUID |
| `kind` | String |
| `name` | String |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `timing` | String |
| `updatedAt` | Datetime |
| `whenAst` | JSON |

**Required create fields:** `name`, `tableId`
**Optional create fields (backend defaults):** `category`, `databaseId`, `event`, `events`, `forEachRow`, `functionId`, `functionName`, `kind`, `smartTags`, `tags`, `timing`, `whenAst`

### `trigger-function`

CRUD operations for TriggerFunction records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all triggerFunction records |
| `find-first` | Find first matching triggerFunction record |
| `get` | Get a triggerFunction by id |
| `create` | Create a new triggerFunction |
| `update` | Update an existing triggerFunction |
| `delete` | Delete a triggerFunction |

**Fields:**

| Field | Type |
|-------|------|
| `code` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `name` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `code`

### `unique-constraint-behavior`

CRUD operations for UniqueConstraintBehavior records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all uniqueConstraintBehavior records |
| `find-first` | Find first matching uniqueConstraintBehavior record |
| `get` | Get a uniqueConstraintBehavior by id |
| `create` | Create a new uniqueConstraintBehavior |
| `update` | Update an existing uniqueConstraintBehavior |
| `delete` | Delete a uniqueConstraintBehavior |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `modifier` | String |
| `scope` | String |
| `sortOrder` | Int |
| `uniqueConstraintId` | UUID |
| `updatedAt` | Datetime |

**Required create fields:** `scope`, `uniqueConstraintId`
**Optional create fields (backend defaults):** `databaseId`, `modifier`, `sortOrder`

### `unique-constraint`

CRUD operations for UniqueConstraint records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all uniqueConstraint records |
| `find-first` | Find first matching uniqueConstraint record |
| `get` | Get a uniqueConstraint by id |
| `create` | Create a new uniqueConstraint |
| `update` | Update an existing uniqueConstraint |
| `delete` | Delete a uniqueConstraint |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `fieldIds` | UUID |
| `id` | UUID |
| `initiallyDeferred` | Boolean |
| `isDeferrable` | Boolean |
| `name` | String |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `type` | String |
| `updatedAt` | Datetime |
| `withoutOverlaps` | Boolean |

**Required create fields:** `fieldIds`, `tableId`
**Optional create fields (backend defaults):** `category`, `databaseId`, `description`, `initiallyDeferred`, `isDeferrable`, `name`, `smartTags`, `tags`, `type`, `withoutOverlaps`

### `view-behavior`

CRUD operations for ViewBehavior records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all viewBehavior records |
| `find-first` | Find first matching viewBehavior record |
| `get` | Get a viewBehavior by id |
| `create` | Create a new viewBehavior |
| `update` | Update an existing viewBehavior |
| `delete` | Delete a viewBehavior |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `id` | UUID |
| `modifier` | String |
| `scope` | String |
| `sortOrder` | Int |
| `updatedAt` | Datetime |
| `viewId` | UUID |

**Required create fields:** `scope`, `viewId`
**Optional create fields (backend defaults):** `databaseId`, `modifier`, `sortOrder`

### `view`

CRUD operations for View records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all view records |
| `find-first` | Find first matching view record |
| `get` | Get a view by id |
| `create` | Create a new view |
| `update` | Update an existing view |
| `delete` | Delete a view |

**Fields:**

| Field | Type |
|-------|------|
| `category` | ObjectCategory |
| `checkOption` | String |
| `data` | JSON |
| `databaseId` | UUID |
| `filterData` | JSON |
| `filterType` | String |
| `id` | UUID |
| `isReadOnly` | Boolean |
| `name` | String |
| `schemaId` | UUID |
| `securityBarrier` | Boolean |
| `securityInvoker` | Boolean |
| `smartTags` | JSON |
| `tableId` | UUID |
| `tags` | String |
| `viewType` | String |

**Required create fields:** `name`, `schemaId`, `viewType`
**Optional create fields (backend defaults):** `category`, `checkOption`, `data`, `databaseId`, `filterData`, `filterType`, `isReadOnly`, `securityBarrier`, `securityInvoker`, `smartTags`, `tableId`, `tags`

### `view-grant`

CRUD operations for ViewGrant records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all viewGrant records |
| `find-first` | Find first matching viewGrant record |
| `get` | Get a viewGrant by id |
| `create` | Create a new viewGrant |
| `update` | Update an existing viewGrant |
| `delete` | Delete a viewGrant |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `granteeName` | String |
| `id` | UUID |
| `isGrant` | Boolean |
| `privilege` | String |
| `viewId` | UUID |
| `withGrantOption` | Boolean |

**Required create fields:** `granteeName`, `privilege`, `viewId`
**Optional create fields (backend defaults):** `databaseId`, `isGrant`, `withGrantOption`

### `view-rule`

CRUD operations for ViewRule records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all viewRule records |
| `find-first` | Find first matching viewRule record |
| `get` | Get a viewRule by id |
| `create` | Create a new viewRule |
| `update` | Update an existing viewRule |
| `delete` | Delete a viewRule |

**Fields:**

| Field | Type |
|-------|------|
| `action` | String |
| `databaseId` | UUID |
| `event` | String |
| `id` | UUID |
| `name` | String |
| `viewId` | UUID |

**Required create fields:** `event`, `name`, `viewId`
**Optional create fields (backend defaults):** `action`, `databaseId`

### `view-table`

CRUD operations for ViewTable records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all viewTable records |
| `find-first` | Find first matching viewTable record |
| `get` | Get a viewTable by id |
| `create` | Create a new viewTable |
| `update` | Update an existing viewTable |
| `delete` | Delete a viewTable |

**Fields:**

| Field | Type |
|-------|------|
| `databaseId` | UUID |
| `id` | UUID |
| `joinOrder` | Int |
| `tableId` | UUID |
| `viewId` | UUID |

**Required create fields:** `tableId`, `viewId`
**Optional create fields (backend defaults):** `databaseId`, `joinOrder`

### `webauthn-setting`

CRUD operations for WebauthnSetting records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all webauthnSetting records |
| `find-first` | Find first matching webauthnSetting record |
| `get` | Get a webauthnSetting by id |
| `create` | Create a new webauthnSetting |
| `update` | Update an existing webauthnSetting |
| `delete` | Delete a webauthnSetting |

**Fields:**

| Field | Type |
|-------|------|
| `attestationType` | String |
| `challengeExpirySeconds` | BigInt |
| `createdAt` | Datetime |
| `credentialsSchemaId` | UUID |
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
| `sessionSecretsSchemaId` | UUID |
| `sessionSecretsTableId` | UUID |
| `sessionsSchemaId` | UUID |
| `sessionsTableId` | UUID |
| `updatedAt` | Datetime |
| `userFieldId` | UUID |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `attestationType`, `challengeExpirySeconds`, `credentialsSchemaId`, `credentialsTableId`, `originAllowlist`, `requireUserVerification`, `residentKey`, `rpId`, `rpName`, `schemaId`, `sessionCredentialsTableId`, `sessionSecretsSchemaId`, `sessionSecretsTableId`, `sessionsSchemaId`, `sessionsTableId`, `userFieldId`

## Custom Operations

### `api-schema-names`

apiSchemaNames

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetApiId` | UUID |

### `apply-registry-defaults`

applyRegistryDefaults

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--data` | JSON |
  | `--nodeType` | String |

### `get-site-preview-commit`

getSitePreviewCommit

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetName` | String |
  | `--targetSiteId` | UUID |

### `get-site-release-manifest`

getSiteReleaseManifest

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetCommitId` | UUID |
  | `--targetSiteId` | UUID |

### `page-published`

pagePublished

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--pageSlug` | String |
  | `--targetSiteId` | UUID |

### `platform-get-site-preview-commit`

platformGetSitePreviewCommit

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetName` | String |
  | `--targetSiteId` | UUID |

### `platform-get-site-release-manifest`

platformGetSiteReleaseManifest

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetCommitId` | UUID |
  | `--targetSiteId` | UUID |

### `platform-page-published`

platformPagePublished

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--pageSlug` | String |
  | `--targetSiteId` | UUID |

### `platform-sites-deep-link-url`

platformSitesDeepLinkUrl

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--linkSlug` | String |
  | `--targetSiteId` | UUID |

### `platform-sites-site-origin`

platformSitesSiteOrigin

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetSiteId` | UUID |

### `platform-verify-site-preview-token`

platformVerifySitePreviewToken

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--siteId` | UUID |
  | `--token` | String |

### `resolve-deep-link`

resolveDeepLink

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--linkSlug` | String |
  | `--targetSiteId` | UUID |

### `resolve-route`

resolveRoute

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--requestHost` | String |
  | `--requestMethod` | String |
  | `--requestPath` | String |

### `resolve-site-app-links`

resolveSiteAppLinks

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetSiteId` | UUID |

### `sites-deep-link-url`

sitesDeepLinkUrl

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--linkSlug` | String |
  | `--targetSiteId` | UUID |

### `sites-site-origin`

sitesSiteOrigin

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--targetSiteId` | UUID |

### `verify-site-preview-token`

verifySitePreviewToken

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--siteId` | UUID |
  | `--token` | String |

### `accept-database-transfer`

acceptDatabaseTransfer

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.transferId` | UUID |

### `apply-rls`

applyRls

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.fieldIds` | UUID |
  | `--input.grants` | JSON |
  | `--input.name` | String |
  | `--input.permissive` | Boolean |
  | `--input.policyType` | String |
  | `--input.tableId` | UUID |
  | `--input.vars` | JSON |

### `cancel-database-transfer`

cancelDatabaseTransfer

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.transferId` | UUID |

### `delete-site-preview`

deleteSitePreview

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.targetName` | String |
  | `--input.targetSiteId` | UUID |

### `domains-assign-subdomain`

domainsAssignSubdomain

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.apex` | String |
  | `--input.clientMutationId` | String |
  | `--input.label` | String |
  | `--input.maxAttempts` | Int |

### `mint-site-preview-token`

mintSitePreviewToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.siteId` | UUID |
  | `--input.target` | String |
  | `--input.targetKind` | String |
  | `--input.ttlSeconds` | Int |

### `pages-install-pages`

pagesInstallPages

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.pagesPreset` | String |
  | `--input.siteId` | UUID |

### `platform-delete-site-preview`

platformDeleteSitePreview

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.targetName` | String |
  | `--input.targetSiteId` | UUID |

### `platform-domains-assign-subdomain`

platformDomainsAssignSubdomain

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.apex` | String |
  | `--input.clientMutationId` | String |
  | `--input.label` | String |
  | `--input.maxAttempts` | Int |

### `platform-mint-site-preview-token`

platformMintSitePreviewToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.siteId` | UUID |
  | `--input.target` | String |
  | `--input.targetKind` | String |
  | `--input.ttlSeconds` | Int |

### `platform-pages-install-pages`

platformPagesInstallPages

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.pagesPreset` | String |
  | `--input.siteId` | UUID |

### `platform-provision-site-preview`

platformProvisionSitePreview

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.apex` | String |
  | `--input.clientMutationId` | String |
  | `--input.commitId` | UUID |
  | `--input.name` | String |
  | `--input.siteId` | UUID |

### `platform-set-site-preview`

platformSetSitePreview

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.targetCommitId` | UUID |
  | `--input.targetName` | String |
  | `--input.targetSiteId` | UUID |

### `platform-site-metadata-install-robots`

platformSiteMetadataInstallRobots

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.robotsPreset` | String |
  | `--input.siteId` | UUID |

### `platform-sites-install-content-preset`

platformSitesInstallContentPreset

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.presetKind` | String |
  | `--input.presetSlug` | String |
  | `--input.siteId` | UUID |

### `platform-sites-install-mantra`

platformSitesInstallMantra

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.routePreset` | String |
  | `--input.siteId` | UUID |

### `platform-sites-provision-static-site`

platformSitesProvisionStaticSite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.apex` | String |
  | `--input.clientMutationId` | String |
  | `--input.hostname` | String |
  | `--input.label` | String |
  | `--input.name` | String |
  | `--input.routePath` | String |
  | `--input.siteConfig` | JSON |

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

### `provision-site-preview`

provisionSitePreview

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.apex` | String |
  | `--input.clientMutationId` | String |
  | `--input.commitId` | UUID |
  | `--input.name` | String |
  | `--input.siteId` | UUID |

### `reject-database-transfer`

rejectDatabaseTransfer

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.transferId` | UUID |

### `request-database`

Requests a database and returns a ticket (database_provision_module row) to poll.

Pass exactly one of preset_slug or modules. Pass organization_id to have the organization own the database from the start (the caller must be an owner of that organization); the requesting user is still the identity bootstrapped into the new database. Omit it for a personal database. The pool, presets, and owner bootstrap are private implementation details: a warm pool hit fulfills the ticket immediately (fulfilled_at set, deferred owner bootstrap), otherwise the database is cold-provisioned asynchronously with exactly the requested modules. Poll the ticket until status = 'completed'; it then carries database_id and fulfilled_at.

Example usage:
  SELECT * FROM metaschema_public.request_database('my_app', 'example.com', preset_slug := 'full');
  SELECT * FROM metaschema_public.request_database('my_app', 'example.com', modules := '["users_module", "emails_module"]'::jsonb);
  SELECT * FROM metaschema_public.request_database('team_app', 'example.com', preset_slug := 'full', organization_id := '00000000-0000-0000-0000-000000000000'::uuid);

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseName` | String |
  | `--input.domain` | String |
  | `--input.modules` | JSON |
  | `--input.options` | JSON |
  | `--input.organizationId` | UUID |
  | `--input.presetSlug` | String |
  | `--input.subdomain` | String |

### `set-field-order`

setFieldOrder

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.fieldIds` | UUID |

### `set-site-preview`

setSitePreview

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.targetCommitId` | UUID |
  | `--input.targetName` | String |
  | `--input.targetSiteId` | UUID |

### `site-metadata-install-robots`

siteMetadataInstallRobots

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.robotsPreset` | String |
  | `--input.siteId` | UUID |

### `sites-install-content-preset`

sitesInstallContentPreset

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.presetKind` | String |
  | `--input.presetSlug` | String |
  | `--input.siteId` | UUID |

### `sites-install-mantra`

sitesInstallMantra

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.entityId` | UUID |
  | `--input.routePreset` | String |
  | `--input.siteId` | UUID |

### `sites-provision-static-site`

sitesProvisionStaticSite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.apex` | String |
  | `--input.clientMutationId` | String |
  | `--input.hostname` | String |
  | `--input.label` | String |
  | `--input.name` | String |
  | `--input.routePath` | String |
  | `--input.siteConfig` | JSON |

### `suspend-database`

suspendDatabase

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.reason` | String |

### `unsuspend-database`

unsuspendDatabase

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.reason` | String |

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
