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
| `auditLogAuth` | findMany, findOne, create, update, delete |
| `cryptoAddress` | findMany, findOne, create, update, delete |
| `email` | findMany, findOne, create, update, delete |
| `identityProvider` | findMany, findOne, create, update, delete |
| `orgApiKeyList` | findMany, findOne, create, update, delete |
| `phoneNumber` | findMany, findOne, create, update, delete |
| `principal` | findMany, findOne, create, update, delete |
| `principalEntity` | findMany, findOne, create, update, delete |
| `principalScopeOverride` | findMany, findOne, create, update, delete |
| `roleType` | findMany, findOne, create, update, delete |
| `userConnectedAccount` | findMany, findOne, create, update, delete |
| `user` | findMany, findOne, create, update, delete |
| `userSetting` | findMany, findOne, create, update, delete |
| `userSettingsSecurity` | findMany, findOne, create, update, delete |
| `webauthnCredential` | findMany, findOne, create, update, delete |

## Table Operations

### `db.auditLogAuth`

CRUD operations for AuditLogAuth records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `details` | JSON | Yes |
| `event` | String | Yes |
| `id` | UUID | No |
| `ipAddress` | InternetAddress | Yes |
| `origin` | ConstructiveInternalTypeOrigin | Yes |
| `success` | Boolean | Yes |
| `userAgent` | String | Yes |

**Operations:**

```typescript
// List all auditLogAuth records
const items = await db.auditLogAuth.findMany({ select: { actorId: true, createdAt: true, details: true, event: true, id: true, ipAddress: true, origin: true, success: true, userAgent: true } }).execute();

// Get one by id
const item = await db.auditLogAuth.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, details: true, event: true, id: true, ipAddress: true, origin: true, success: true, userAgent: true } }).execute();

// Create
const created = await db.auditLogAuth.create({ data: { actorId: '<UUID>', details: '<JSON>', event: '<String>', ipAddress: '<InternetAddress>', origin: '<Origin>', success: '<Boolean>', userAgent: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.auditLogAuth.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.auditLogAuth.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.cryptoAddress`

CRUD operations for CryptoAddress records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `address` | String | Yes |
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `isPrimary` | Boolean | Yes |
| `isVerified` | Boolean | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all cryptoAddress records
const items = await db.cryptoAddress.findMany({ select: { address: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.cryptoAddress.findOne({ id: '<UUID>', select: { address: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } }).execute();

// Create
const created = await db.cryptoAddress.create({ data: { address: '<String>', isPrimary: '<Boolean>', isVerified: '<Boolean>', name: '<String>', ownerId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.cryptoAddress.update({ where: { id: '<UUID>' }, data: { address: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.cryptoAddress.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.email`

CRUD operations for Email records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `email` | ConstructiveInternalTypeEmail | Yes |
| `id` | UUID | No |
| `isPrimary` | Boolean | Yes |
| `isVerified` | Boolean | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all email records
const items = await db.email.findMany({ select: { createdAt: true, email: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.email.findOne({ id: '<UUID>', select: { createdAt: true, email: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } }).execute();

// Create
const created = await db.email.create({ data: { email: '<Email>', isPrimary: '<Boolean>', isVerified: '<Boolean>', name: '<String>', ownerId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.email.update({ where: { id: '<UUID>' }, data: { email: '<Email>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.email.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.identityProvider`

CRUD operations for IdentityProvider records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `displayName` | String | Yes |
| `enabled` | Boolean | Yes |
| `kind` | String | Yes |
| `slug` | String | Yes |

**Operations:**

```typescript
// List all identityProvider records
const items = await db.identityProvider.findMany({ select: { displayName: true, enabled: true, kind: true, slug: true } }).execute();

// Get one by id
const item = await db.identityProvider.findOne({ id: '<UUID>', select: { displayName: true, enabled: true, kind: true, slug: true } }).execute();

// Create
const created = await db.identityProvider.create({ data: { displayName: '<String>', enabled: '<Boolean>', kind: '<String>', slug: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.identityProvider.update({ where: { id: '<UUID>' }, data: { displayName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.identityProvider.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgApiKeyList`

CRUD operations for OrgApiKeyList records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `accessLevel` | String | Yes |
| `createdAt` | Datetime | No |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `keyId` | String | Yes |
| `lastUsedAt` | Datetime | Yes |
| `mfaLevel` | String | Yes |
| `name` | String | Yes |
| `orgId` | UUID | Yes |
| `principalId` | UUID | Yes |
| `revokedAt` | Datetime | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgApiKeyList records
const items = await db.orgApiKeyList.findMany({ select: { accessLevel: true, createdAt: true, expiresAt: true, id: true, keyId: true, lastUsedAt: true, mfaLevel: true, name: true, orgId: true, principalId: true, revokedAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgApiKeyList.findOne({ id: '<UUID>', select: { accessLevel: true, createdAt: true, expiresAt: true, id: true, keyId: true, lastUsedAt: true, mfaLevel: true, name: true, orgId: true, principalId: true, revokedAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgApiKeyList.create({ data: { accessLevel: '<String>', expiresAt: '<Datetime>', keyId: '<String>', lastUsedAt: '<Datetime>', mfaLevel: '<String>', name: '<String>', orgId: '<UUID>', principalId: '<UUID>', revokedAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgApiKeyList.update({ where: { id: '<UUID>' }, data: { accessLevel: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgApiKeyList.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.phoneNumber`

CRUD operations for PhoneNumber records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `cc` | String | Yes |
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `isPrimary` | Boolean | Yes |
| `isVerified` | Boolean | Yes |
| `name` | String | Yes |
| `number` | String | Yes |
| `ownerId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all phoneNumber records
const items = await db.phoneNumber.findMany({ select: { cc: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, number: true, ownerId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.phoneNumber.findOne({ id: '<UUID>', select: { cc: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, number: true, ownerId: true, updatedAt: true } }).execute();

// Create
const created = await db.phoneNumber.create({ data: { cc: '<String>', isPrimary: '<Boolean>', isVerified: '<Boolean>', name: '<String>', number: '<String>', ownerId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.phoneNumber.update({ where: { id: '<UUID>' }, data: { cc: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.phoneNumber.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.principal`

CRUD operations for Principal records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `apiKeyMaxDuration` | Interval | Yes |
| `bypassStepUp` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `createdBySessionId` | UUID | Yes |
| `depth` | Int | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | Yes |
| `isReadOnly` | Boolean | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `parentPrincipalId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `useAdminOwner` | Boolean | Yes |
| `userId` | UUID | Yes |

**Operations:**

```typescript
// List all principal records
const items = await db.principal.findMany({ select: { apiKeyMaxDuration: true, bypassStepUp: true, createdAt: true, createdBySessionId: true, depth: true, expiresAt: true, id: true, isReadOnly: true, name: true, ownerId: true, parentPrincipalId: true, updatedAt: true, useAdminOwner: true, userId: true } }).execute();

// Get one by principalId
const item = await db.principal.findOne({ principalId: '<UUID>', select: { apiKeyMaxDuration: true, bypassStepUp: true, createdAt: true, createdBySessionId: true, depth: true, expiresAt: true, id: true, isReadOnly: true, name: true, ownerId: true, parentPrincipalId: true, updatedAt: true, useAdminOwner: true, userId: true } }).execute();

// Create
const created = await db.principal.create({ data: { apiKeyMaxDuration: '<Interval>', bypassStepUp: '<Boolean>', createdBySessionId: '<UUID>', depth: '<Int>', expiresAt: '<Datetime>', id: '<UUID>', isReadOnly: '<Boolean>', name: '<String>', ownerId: '<UUID>', parentPrincipalId: '<UUID>', useAdminOwner: '<Boolean>', userId: '<UUID>' }, select: { principalId: true } }).execute();

// Update
const updated = await db.principal.update({ where: { principalId: '<UUID>' }, data: { apiKeyMaxDuration: '<Interval>' }, select: { principalId: true } }).execute();

// Delete
const deleted = await db.principal.delete({ where: { principalId: '<UUID>' } }).execute();
```

### `db.principalEntity`

CRUD operations for PrincipalEntity records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `ownerId` | UUID | Yes |
| `principalId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all principalEntity records
const items = await db.principalEntity.findMany({ select: { createdAt: true, entityId: true, id: true, ownerId: true, principalId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.principalEntity.findOne({ id: '<UUID>', select: { createdAt: true, entityId: true, id: true, ownerId: true, principalId: true, updatedAt: true } }).execute();

// Create
const created = await db.principalEntity.create({ data: { entityId: '<UUID>', ownerId: '<UUID>', principalId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.principalEntity.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.principalEntity.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.principalScopeOverride`

CRUD operations for PrincipalScopeOverride records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `allowedMask` | BitString | Yes |
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `isReadOnly` | Boolean | Yes |
| `membershipType` | Int | Yes |
| `principalId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `useAdminOwner` | Boolean | Yes |

**Operations:**

```typescript
// List all principalScopeOverride records
const items = await db.principalScopeOverride.findMany({ select: { allowedMask: true, createdAt: true, id: true, isActive: true, isReadOnly: true, membershipType: true, principalId: true, updatedAt: true, useAdminOwner: true } }).execute();

// Get one by id
const item = await db.principalScopeOverride.findOne({ id: '<UUID>', select: { allowedMask: true, createdAt: true, id: true, isActive: true, isReadOnly: true, membershipType: true, principalId: true, updatedAt: true, useAdminOwner: true } }).execute();

// Create
const created = await db.principalScopeOverride.create({ data: { allowedMask: '<BitString>', isActive: '<Boolean>', isReadOnly: '<Boolean>', membershipType: '<Int>', principalId: '<UUID>', useAdminOwner: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.principalScopeOverride.update({ where: { id: '<UUID>' }, data: { allowedMask: '<BitString>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.principalScopeOverride.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.roleType`

CRUD operations for RoleType records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | Int | No |
| `name` | String | Yes |

**Operations:**

```typescript
// List all roleType records
const items = await db.roleType.findMany({ select: { id: true, name: true } }).execute();

// Get one by id
const item = await db.roleType.findOne({ id: '<Int>', select: { id: true, name: true } }).execute();

// Create
const created = await db.roleType.create({ data: { name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.roleType.update({ where: { id: '<Int>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.roleType.delete({ where: { id: '<Int>' } }).execute();
```

### `db.userConnectedAccount`

CRUD operations for UserConnectedAccount records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `details` | JSON | Yes |
| `id` | UUID | No |
| `identifier` | String | Yes |
| `isVerified` | Boolean | Yes |
| `ownerId` | UUID | Yes |
| `service` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all userConnectedAccount records
const items = await db.userConnectedAccount.findMany({ select: { createdAt: true, details: true, id: true, identifier: true, isVerified: true, ownerId: true, service: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.userConnectedAccount.findOne({ id: '<UUID>', select: { createdAt: true, details: true, id: true, identifier: true, isVerified: true, ownerId: true, service: true, updatedAt: true } }).execute();

// Create
const created = await db.userConnectedAccount.create({ data: { details: '<JSON>', identifier: '<String>', isVerified: '<Boolean>', ownerId: '<UUID>', service: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.userConnectedAccount.update({ where: { id: '<UUID>' }, data: { details: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userConnectedAccount.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.user`

CRUD operations for User records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `displayName` | String | Yes |
| `displayNameTrgmSimilarity` | Float | Yes |
| `id` | UUID | No |
| `profilePicture` | ConstructiveInternalTypeImage | Yes |
| `searchScore` | Float | Yes |
| `searchTsv` | FullText | Yes |
| `searchTsvRank` | Float | Yes |
| `type` | Int | Yes |
| `updatedAt` | Datetime | No |
| `username` | String | Yes |

**Operations:**

```typescript
// List all user records
const items = await db.user.findMany({ select: { createdAt: true, displayName: true, displayNameTrgmSimilarity: true, id: true, profilePicture: true, searchScore: true, searchTsv: true, searchTsvRank: true, type: true, updatedAt: true, username: true } }).execute();

// Get one by id
const item = await db.user.findOne({ id: '<UUID>', select: { createdAt: true, displayName: true, displayNameTrgmSimilarity: true, id: true, profilePicture: true, searchScore: true, searchTsv: true, searchTsvRank: true, type: true, updatedAt: true, username: true } }).execute();

// Create
const created = await db.user.create({ data: { displayName: '<String>', displayNameTrgmSimilarity: '<Float>', profilePicture: '<Image>', searchScore: '<Float>', searchTsv: '<FullText>', searchTsvRank: '<Float>', type: '<Int>', username: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.user.update({ where: { id: '<UUID>' }, data: { displayName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.user.delete({ where: { id: '<UUID>' } }).execute();
```

> **Unified Search API fields:** `searchTsv`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

### `db.userSetting`

CRUD operations for UserSetting records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `ownerId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all userSetting records
const items = await db.userSetting.findMany({ select: { createdAt: true, id: true, ownerId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.userSetting.findOne({ id: '<UUID>', select: { createdAt: true, id: true, ownerId: true, updatedAt: true } }).execute();

// Create
const created = await db.userSetting.create({ data: { ownerId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.userSetting.update({ where: { id: '<UUID>' }, data: { ownerId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userSetting.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.userSettingsSecurity`

CRUD operations for UserSettingsSecurity records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `backupCodesCount` | Int | Yes |
| `createdAt` | Datetime | No |
| `emailMfaEnabled` | Boolean | Yes |
| `id` | UUID | No |
| `mfaEnrolledAt` | Datetime | Yes |
| `mfaLastUsedAt` | Datetime | Yes |
| `ownerId` | UUID | Yes |
| `smsMfaEnabled` | Boolean | Yes |
| `totpEnabled` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all userSettingsSecurity records
const items = await db.userSettingsSecurity.findMany({ select: { backupCodesCount: true, createdAt: true, emailMfaEnabled: true, id: true, mfaEnrolledAt: true, mfaLastUsedAt: true, ownerId: true, smsMfaEnabled: true, totpEnabled: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.userSettingsSecurity.findOne({ id: '<UUID>', select: { backupCodesCount: true, createdAt: true, emailMfaEnabled: true, id: true, mfaEnrolledAt: true, mfaLastUsedAt: true, ownerId: true, smsMfaEnabled: true, totpEnabled: true, updatedAt: true } }).execute();

// Create
const created = await db.userSettingsSecurity.create({ data: { backupCodesCount: '<Int>', emailMfaEnabled: '<Boolean>', mfaEnrolledAt: '<Datetime>', mfaLastUsedAt: '<Datetime>', ownerId: '<UUID>', smsMfaEnabled: '<Boolean>', totpEnabled: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.userSettingsSecurity.update({ where: { id: '<UUID>' }, data: { backupCodesCount: '<Int>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.userSettingsSecurity.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.webauthnCredential`

CRUD operations for WebauthnCredential records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `backupEligible` | Boolean | Yes |
| `backupState` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `credentialDeviceType` | String | Yes |
| `credentialId` | String | Yes |
| `id` | UUID | No |
| `lastUsedAt` | Datetime | Yes |
| `name` | String | Yes |
| `ownerId` | UUID | Yes |
| `publicKey` | Base64EncodedBinary | Yes |
| `signCount` | BigInt | Yes |
| `transports` | String | Yes |
| `updatedAt` | Datetime | No |
| `webauthnUserId` | String | Yes |

**Operations:**

```typescript
// List all webauthnCredential records
const items = await db.webauthnCredential.findMany({ select: { backupEligible: true, backupState: true, createdAt: true, credentialDeviceType: true, credentialId: true, id: true, lastUsedAt: true, name: true, ownerId: true, publicKey: true, signCount: true, transports: true, updatedAt: true, webauthnUserId: true } }).execute();

// Get one by id
const item = await db.webauthnCredential.findOne({ id: '<UUID>', select: { backupEligible: true, backupState: true, createdAt: true, credentialDeviceType: true, credentialId: true, id: true, lastUsedAt: true, name: true, ownerId: true, publicKey: true, signCount: true, transports: true, updatedAt: true, webauthnUserId: true } }).execute();

// Create
const created = await db.webauthnCredential.create({ data: { backupEligible: '<Boolean>', backupState: '<Boolean>', credentialDeviceType: '<String>', credentialId: '<String>', lastUsedAt: '<Datetime>', name: '<String>', ownerId: '<UUID>', publicKey: '<Base64EncodedBinary>', signCount: '<BigInt>', transports: '<String>', webauthnUserId: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.webauthnCredential.update({ where: { id: '<UUID>' }, data: { backupEligible: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.webauthnCredential.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.query.currentIpAddress`

currentIpAddress

- **Type:** query
- **Arguments:** none

```typescript
const result = await db.query.currentIpAddress().execute();
```

### `db.query.currentUser`

currentUser

- **Type:** query
- **Arguments:** none

```typescript
const result = await db.query.currentUser().execute();
```

### `db.query.currentUserAgent`

currentUserAgent

- **Type:** query
- **Arguments:** none

```typescript
const result = await db.query.currentUserAgent().execute();
```

### `db.query.currentUserId`

currentUserId

- **Type:** query
- **Arguments:** none

```typescript
const result = await db.query.currentUserId().execute();
```

### `db.query.getMfaStatus`

getMfaStatus

- **Type:** query
- **Arguments:** none

```typescript
const result = await db.query.getMfaStatus().execute();
```

### `db.query.requireStepUp`

requireStepUp

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `stepUpType` | String |

```typescript
const result = await db.query.requireStepUp({ stepUpType: '<String>' }).execute();
```

### `db.mutation.approveDevice`

approveDevice

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ApproveDeviceInput (required) |

```typescript
const result = await db.mutation.approveDevice({ input: { approvalToken: '<String>' } }).execute();
```

### `db.mutation.checkPassword`

checkPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CheckPasswordInput (required) |

```typescript
const result = await db.mutation.checkPassword({ input: { password: '<String>' } }).execute();
```

### `db.mutation.completeMfaChallenge`

completeMfaChallenge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CompleteMfaChallengeInput (required) |

```typescript
const result = await db.mutation.completeMfaChallenge({ input: '<CompleteMfaChallengeInput>' }).execute();
```

### `db.mutation.confirmDeleteAccount`

confirmDeleteAccount

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ConfirmDeleteAccountInput (required) |

```typescript
const result = await db.mutation.confirmDeleteAccount({ input: { token: '<String>', userId: '<UUID>' } }).execute();
```

### `db.mutation.confirmTotpSetup`

confirmTotpSetup

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ConfirmTotpSetupInput (required) |

```typescript
const result = await db.mutation.confirmTotpSetup({ input: { totpValue: '<String>' } }).execute();
```

### `db.mutation.createApiKey`

Mint an API key for the current user; the plaintext key is returned once. access_level: full_access (default) or read_only. mfa_level: none (default) or verified; verified needs a fresh MFA proof on the calling session. A key minted while authenticated by another API key never outlives that key.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateApiKeyInput (required) |

```typescript
const result = await db.mutation.createApiKey({ input: { accessLevel: '<String>', expiresIn: '<IntervalInput>', keyName: '<String>', mfaLevel: '<String>', principalId: '<UUID>' } }).execute();
```

### `db.mutation.createChildPrincipal`

createChildPrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateChildPrincipalInput (required) |

```typescript
const result = await db.mutation.createChildPrincipal({ input: '<CreateChildPrincipalInput>' }).execute();
```

### `db.mutation.createOrgApiKey`

createOrgApiKey

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateOrgApiKeyInput (required) |

```typescript
const result = await db.mutation.createOrgApiKey({ input: '<CreateOrgApiKeyInput>' }).execute();
```

### `db.mutation.createOrgPrincipal`

createOrgPrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateOrgPrincipalInput (required) |

```typescript
const result = await db.mutation.createOrgPrincipal({ input: { bypassStepUp: '<Boolean>', isReadOnly: '<Boolean>', name: '<String>', orgId: '<UUID>', useAdminOwner: '<Boolean>' } }).execute();
```

### `db.mutation.createPrincipalFromPreset`

createPrincipalFromPreset

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreatePrincipalFromPresetInput (required) |

```typescript
const result = await db.mutation.createPrincipalFromPreset({ input: { entityIds: '<UUID>', name: '<String>', overrides: '<JSON>', slug: '<String>' } }).execute();
```

### `db.mutation.deleteOrgPrincipal`

deleteOrgPrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DeleteOrgPrincipalInput (required) |

```typescript
const result = await db.mutation.deleteOrgPrincipal({ input: { principalId: '<UUID>' } }).execute();
```

### `db.mutation.deletePrincipal`

deletePrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DeletePrincipalInput (required) |

```typescript
const result = await db.mutation.deletePrincipal({ input: { principalId: '<UUID>' } }).execute();
```

### `db.mutation.disableEmailMfa`

disableEmailMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisableEmailMfaInput (required) |

```typescript
const result = await db.mutation.disableEmailMfa({ input: '<DisableEmailMfaInput>' }).execute();
```

### `db.mutation.disableSmsMfa`

disableSmsMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisableSmsMfaInput (required) |

```typescript
const result = await db.mutation.disableSmsMfa({ input: '<DisableSmsMfaInput>' }).execute();
```

### `db.mutation.disableTotp`

disableTotp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisableTotpInput (required) |

```typescript
const result = await db.mutation.disableTotp({ input: { totpValue: '<String>' } }).execute();
```

### `db.mutation.disconnectAccount`

disconnectAccount

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisconnectAccountInput (required) |

```typescript
const result = await db.mutation.disconnectAccount({ input: { accountId: '<UUID>' } }).execute();
```

### `db.mutation.enableEmailMfa`

enableEmailMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | EnableEmailMfaInput (required) |

```typescript
const result = await db.mutation.enableEmailMfa({ input: '<EnableEmailMfaInput>' }).execute();
```

### `db.mutation.enableSmsMfa`

enableSmsMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | EnableSmsMfaInput (required) |

```typescript
const result = await db.mutation.enableSmsMfa({ input: '<EnableSmsMfaInput>' }).execute();
```

### `db.mutation.enableTotp`

enableTotp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | EnableTotpInput (required) |

```typescript
const result = await db.mutation.enableTotp({ input: '<EnableTotpInput>' }).execute();
```

### `db.mutation.exchangeNativeHandoff`

exchangeNativeHandoff

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ExchangeNativeHandoffInput (required) |

```typescript
const result = await db.mutation.exchangeNativeHandoff({ input: { code: '<String>', codeVerifier: '<String>', credentialKind: '<String>' } }).execute();
```

### `db.mutation.extendTokenExpires`

extendTokenExpires

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ExtendTokenExpiresInput (required) |

```typescript
const result = await db.mutation.extendTokenExpires({ input: { amount: '<IntervalInput>' } }).execute();
```

### `db.mutation.forgotPassword`

forgotPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ForgotPasswordInput (required) |

```typescript
const result = await db.mutation.forgotPassword({ input: { email: '<Email>' } }).execute();
```

### `db.mutation.generateBackupCodes`

generateBackupCodes

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | GenerateBackupCodesInput (required) |

```typescript
const result = await db.mutation.generateBackupCodes({ input: '<GenerateBackupCodesInput>' }).execute();
```

### `db.mutation.linkIdentity`

linkIdentity

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | LinkIdentityInput (required) |

```typescript
const result = await db.mutation.linkIdentity({ input: { details: '<JSON>', identifier: '<String>', service: '<String>' } }).execute();
```

### `db.mutation.mintAccessToken`

mintAccessToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | MintAccessTokenInput (required) |

```typescript
const result = await db.mutation.mintAccessToken({ input: { accessTtl: '<IntervalInput>', intent: '<String>', principalId: '<UUID>' } }).execute();
```

### `db.mutation.provisionBucket`

Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

```typescript
const result = await db.mutation.provisionBucket({ input: { bucketKey: '<String>', ownerId: '<UUID>' } }).execute();
```

### `db.mutation.refreshAccessToken`

refreshAccessToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RefreshAccessTokenInput (required) |

```typescript
const result = await db.mutation.refreshAccessToken({ input: { token: '<String>' } }).execute();
```

### `db.mutation.requestCrossOriginToken`

requestCrossOriginToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RequestCrossOriginTokenInput (required) |

```typescript
const result = await db.mutation.requestCrossOriginToken({ input: { email: '<String>', origin: '<Origin>', password: '<String>', rememberMe: '<Boolean>' } }).execute();
```

### `db.mutation.requestMagicLink`

requestMagicLink

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RequestMagicLinkInput (required) |

```typescript
const result = await db.mutation.requestMagicLink({ input: { codeChallenge: '<String>', email: '<String>', nativeRedirectUri: '<String>', next: '<String>' } }).execute();
```

### `db.mutation.resetPassword`

resetPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResetPasswordInput (required) |

```typescript
const result = await db.mutation.resetPassword({ input: { newPassword: '<String>', resetToken: '<String>', roleId: '<UUID>' } }).execute();
```

### `db.mutation.revokeApiKey`

revokeApiKey

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RevokeApiKeyInput (required) |

```typescript
const result = await db.mutation.revokeApiKey({ input: { keyId: '<UUID>' } }).execute();
```

### `db.mutation.revokeOrgApiKey`

revokeOrgApiKey

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RevokeOrgApiKeyInput (required) |

```typescript
const result = await db.mutation.revokeOrgApiKey({ input: { keyId: '<UUID>', orgId: '<UUID>' } }).execute();
```

### `db.mutation.revokeSession`

revokeSession

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RevokeSessionInput (required) |

```typescript
const result = await db.mutation.revokeSession({ input: { sessionId: '<UUID>' } }).execute();
```

### `db.mutation.sendAccountDeletionEmail`

sendAccountDeletionEmail

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendAccountDeletionEmailInput (required) |

```typescript
const result = await db.mutation.sendAccountDeletionEmail({ input: '<SendAccountDeletionEmailInput>' }).execute();
```

### `db.mutation.sendMfaChallengeCode`

sendMfaChallengeCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendMfaChallengeCodeInput (required) |

```typescript
const result = await db.mutation.sendMfaChallengeCode({ input: { mfaChallengeToken: '<String>', mfaMethod: '<String>', userId: '<UUID>' } }).execute();
```

### `db.mutation.sendPhoneVerificationCode`

sendPhoneVerificationCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendPhoneVerificationCodeInput (required) |

```typescript
const result = await db.mutation.sendPhoneVerificationCode({ input: { phone: '<String>' } }).execute();
```

### `db.mutation.sendSmsOtp`

sendSmsOtp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendSmsOtpInput (required) |

```typescript
const result = await db.mutation.sendSmsOtp({ input: { phone: '<String>' } }).execute();
```

### `db.mutation.sendStepUpCode`

sendStepUpCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendStepUpCodeInput (required) |

```typescript
const result = await db.mutation.sendStepUpCode({ input: { method: '<String>' } }).execute();
```

### `db.mutation.sendVerificationEmail`

sendVerificationEmail

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendVerificationEmailInput (required) |

```typescript
const result = await db.mutation.sendVerificationEmail({ input: { email: '<Email>' } }).execute();
```

### `db.mutation.setPassword`

setPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetPasswordInput (required) |

```typescript
const result = await db.mutation.setPassword({ input: { currentPassword: '<String>', newPassword: '<String>', signOutOtherSessions: '<Boolean>' } }).execute();
```

### `db.mutation.setPrincipalEntities`

setPrincipalEntities

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetPrincipalEntitiesInput (required) |

```typescript
const result = await db.mutation.setPrincipalEntities({ input: { entityIds: '<UUID>', principalId: '<UUID>' } }).execute();
```

### `db.mutation.setPrincipalScope`

setPrincipalScope

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetPrincipalScopeInput (required) |

```typescript
const result = await db.mutation.setPrincipalScope({ input: '<SetPrincipalScopeInput>' }).execute();
```

### `db.mutation.signIn`

signIn

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInInput (required) |

```typescript
const result = await db.mutation.signIn({ input: '<SignInInput>' }).execute();
```

### `db.mutation.signInCrossOrigin`

signInCrossOrigin

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInCrossOriginInput (required) |

```typescript
const result = await db.mutation.signInCrossOrigin({ input: { credentialKind: '<String>', token: '<String>' } }).execute();
```

### `db.mutation.signInMagicLink`

signInMagicLink

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInMagicLinkInput (required) |

```typescript
const result = await db.mutation.signInMagicLink({ input: { credentialKind: '<String>', deviceToken: '<String>', rememberMe: '<Boolean>', token: '<String>' } }).execute();
```

### `db.mutation.signInSmsOtp`

signInSmsOtp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInSmsOtpInput (required) |

```typescript
const result = await db.mutation.signInSmsOtp({ input: { code: '<String>', credentialKind: '<String>', deviceToken: '<String>', phone: '<String>', rememberMe: '<Boolean>' } }).execute();
```

### `db.mutation.signOut`

signOut

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignOutInput (required) |

```typescript
const result = await db.mutation.signOut({ input: '<SignOutInput>' }).execute();
```

### `db.mutation.signUp`

signUp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignUpInput (required) |

```typescript
const result = await db.mutation.signUp({ input: { csrfToken: '<String>', email: '<String>', inviteToken: '<String>', password: '<String>' } }).execute();
```

### `db.mutation.signUpMagicLink`

signUpMagicLink

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignUpMagicLinkInput (required) |

```typescript
const result = await db.mutation.signUpMagicLink({ input: { credentialKind: '<String>', deviceToken: '<String>', inviteToken: '<String>', rememberMe: '<Boolean>', token: '<String>' } }).execute();
```

### `db.mutation.signUpSms`

signUpSms

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignUpSmsInput (required) |

```typescript
const result = await db.mutation.signUpSms({ input: '<SignUpSmsInput>' }).execute();
```

### `db.mutation.updatePrincipal`

updatePrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UpdatePrincipalInput (required) |

```typescript
const result = await db.mutation.updatePrincipal({ input: '<UpdatePrincipalInput>' }).execute();
```

### `db.mutation.verifyEmail`

verifyEmail

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyEmailInput (required) |

```typescript
const result = await db.mutation.verifyEmail({ input: { emailId: '<UUID>', token: '<String>' } }).execute();
```

### `db.mutation.verifyPassword`

verifyPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyPasswordInput (required) |

```typescript
const result = await db.mutation.verifyPassword({ input: { password: '<String>' } }).execute();
```

### `db.mutation.verifyPhone`

verifyPhone

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyPhoneInput (required) |

```typescript
const result = await db.mutation.verifyPhone({ input: { code: '<String>', phone: '<String>' } }).execute();
```

### `db.mutation.verifyStepUpCode`

verifyStepUpCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyStepUpCodeInput (required) |

```typescript
const result = await db.mutation.verifyStepUpCode({ input: { code: '<String>' } }).execute();
```

### `db.mutation.verifyTotp`

verifyTotp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyTotpInput (required) |

```typescript
const result = await db.mutation.verifyTotp({ input: { totpValue: '<String>' } }).execute();
```
