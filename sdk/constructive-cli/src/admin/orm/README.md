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
| `appAdminGrant` | findMany, findOne, create, update, delete |
| `appCapabilityDefaultCapability` | findMany, findOne, create, update, delete |
| `appCapabilityDefaultGrant` | findMany, findOne, create, update, delete |
| `appClaimedInvite` | findMany, findOne, create, update, delete |
| `appGrant` | findMany, findOne, create, update, delete |
| `appInvite` | findMany, findOne, create, update, delete |
| `appMembership` | findMany, findOne, create, update, delete |
| `appMembershipDefault` | findMany, findOne, create, update, delete |
| `appOwnerGrant` | findMany, findOne, create, update, delete |
| `membershipType` | findMany, findOne, create, update, delete |
| `myPendingAppInvitesRecord` | findMany, findOne, create, update, delete |
| `myPendingOrgInvitesRecord` | findMany, findOne, create, update, delete |
| `orgAdminGrant` | findMany, findOne, create, update, delete |
| `orgCapabilityDefaultCapability` | findMany, findOne, create, update, delete |
| `orgCapabilityDefaultGrant` | findMany, findOne, create, update, delete |
| `orgChartEdge` | findMany, findOne, create, update, delete |
| `orgChartEdgeGrant` | findMany, findOne, create, update, delete |
| `orgClaimedInvite` | findMany, findOne, create, update, delete |
| `orgGetManagersRecord` | findMany, findOne, create, update, delete |
| `orgGetSubordinatesRecord` | findMany, findOne, create, update, delete |
| `orgGrant` | findMany, findOne, create, update, delete |
| `orgInvite` | findMany, findOne, create, update, delete |
| `orgMember` | findMany, findOne, create, update, delete |
| `orgMemberProfile` | findMany, findOne, create, update, delete |
| `orgMembership` | findMany, findOne, create, update, delete |
| `orgMembershipDefault` | findMany, findOne, create, update, delete |
| `orgMembershipSetting` | findMany, findOne, create, update, delete |
| `orgOwnerGrant` | findMany, findOne, create, update, delete |

## Table Operations

### `db.appAdminGrant`

CRUD operations for AppAdminGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appAdminGrant records
const items = await db.appAdminGrant.findMany({ select: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appAdminGrant.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.appAdminGrant.create({ data: { actorId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appAdminGrant.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appAdminGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appCapabilityDefaultCapability`

CRUD operations for AppCapabilityDefaultCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `capabilityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `id` | UUID | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appCapabilityDefaultCapability records
const items = await db.appCapabilityDefaultCapability.findMany({ select: { capabilityId: true, createdAt: true, id: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appCapabilityDefaultCapability.findOne({ id: '<UUID>', select: { capabilityId: true, createdAt: true, id: true, updatedAt: true } }).execute();

// Create
const created = await db.appCapabilityDefaultCapability.create({ data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appCapabilityDefaultCapability.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appCapabilityDefaultCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appCapabilityDefaultGrant`

CRUD operations for AppCapabilityDefaultGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `capabilityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appCapabilityDefaultGrant records
const items = await db.appCapabilityDefaultGrant.findMany({ select: { capabilityId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appCapabilityDefaultGrant.findOne({ id: '<UUID>', select: { capabilityId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.appCapabilityDefaultGrant.create({ data: { capabilityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appCapabilityDefaultGrant.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appCapabilityDefaultGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appClaimedInvite`

CRUD operations for AppClaimedInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `id` | UUID | No |
| `receiverId` | UUID | Yes |
| `senderId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appClaimedInvite records
const items = await db.appClaimedInvite.findMany({ select: { createdAt: true, data: true, id: true, receiverId: true, senderId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appClaimedInvite.findOne({ id: '<UUID>', select: { createdAt: true, data: true, id: true, receiverId: true, senderId: true, updatedAt: true } }).execute();

// Create
const created = await db.appClaimedInvite.create({ data: { data: '<JSON>', receiverId: '<UUID>', senderId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appClaimedInvite.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appClaimedInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appGrant`

CRUD operations for AppGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `capabilities` | BitString | Yes |
| `createdAt` | Datetime | No |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appGrant records
const items = await db.appGrant.findMany({ select: { actorId: true, capabilities: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appGrant.findOne({ id: '<UUID>', select: { actorId: true, capabilities: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.appGrant.create({ data: { actorId: '<UUID>', capabilities: '<BitString>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appGrant.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appInvite`

CRUD operations for AppInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `channel` | String | Yes |
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `email` | ConstructiveInternalTypeEmail | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `inviteCount` | Int | Yes |
| `inviteLimit` | Int | Yes |
| `inviteToken` | String | Yes |
| `inviteValid` | Boolean | Yes |
| `multiple` | Boolean | Yes |
| `phone` | String | Yes |
| `profileId` | UUID | Yes |
| `senderId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appInvite records
const items = await db.appInvite.findMany({ select: { channel: true, createdAt: true, data: true, email: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, multiple: true, phone: true, profileId: true, senderId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appInvite.findOne({ id: '<UUID>', select: { channel: true, createdAt: true, data: true, email: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, multiple: true, phone: true, profileId: true, senderId: true, updatedAt: true } }).execute();

// Create
const created = await db.appInvite.create({ data: { channel: '<String>', data: '<JSON>', email: '<Email>', expiresAt: '<Datetime>', inviteCount: '<Int>', inviteLimit: '<Int>', inviteToken: '<String>', inviteValid: '<Boolean>', multiple: '<Boolean>', phone: '<String>', profileId: '<UUID>', senderId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appInvite.update({ where: { id: '<UUID>' }, data: { channel: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appMembership`

CRUD operations for AppMembership records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `capabilities` | BitString | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `granted` | BitString | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `isAdmin` | Boolean | Yes |
| `isApproved` | Boolean | Yes |
| `isBanned` | Boolean | Yes |
| `isDisabled` | Boolean | Yes |
| `isOwner` | Boolean | Yes |
| `isVerified` | Boolean | Yes |
| `profileId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all appMembership records
const items = await db.appMembership.findMany({ select: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isOwner: true, isVerified: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.appMembership.findOne({ id: '<UUID>', select: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isOwner: true, isVerified: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.appMembership.create({ data: { actorId: '<UUID>', capabilities: '<BitString>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', granted: '<BitString>', isActive: '<Boolean>', isAdmin: '<Boolean>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isOwner: '<Boolean>', isVerified: '<Boolean>', profileId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appMembership.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appMembership.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appMembershipDefault`

CRUD operations for AppMembershipDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `id` | UUID | No |
| `isApproved` | Boolean | Yes |
| `isVerified` | Boolean | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all appMembershipDefault records
const items = await db.appMembershipDefault.findMany({ select: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, isApproved: true, isVerified: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.appMembershipDefault.findOne({ id: '<UUID>', select: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, isApproved: true, isVerified: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.appMembershipDefault.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', isApproved: '<Boolean>', isVerified: '<Boolean>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appMembershipDefault.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appMembershipDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appOwnerGrant`

CRUD operations for AppOwnerGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appOwnerGrant records
const items = await db.appOwnerGrant.findMany({ select: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appOwnerGrant.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.appOwnerGrant.create({ data: { actorId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appOwnerGrant.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appOwnerGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.membershipType`

CRUD operations for MembershipType records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `description` | String | Yes |
| `hasUsersTableEntry` | Boolean | Yes |
| `id` | Int | No |
| `name` | String | Yes |
| `parentMembershipType` | Int | Yes |
| `scope` | String | Yes |

**Operations:**

```typescript
// List all membershipType records
const items = await db.membershipType.findMany({ select: { description: true, hasUsersTableEntry: true, id: true, name: true, parentMembershipType: true, scope: true } }).execute();

// Get one by id
const item = await db.membershipType.findOne({ id: '<Int>', select: { description: true, hasUsersTableEntry: true, id: true, name: true, parentMembershipType: true, scope: true } }).execute();

// Create
const created = await db.membershipType.create({ data: { description: '<String>', hasUsersTableEntry: '<Boolean>', name: '<String>', parentMembershipType: '<Int>', scope: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.membershipType.update({ where: { id: '<Int>' }, data: { description: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.membershipType.delete({ where: { id: '<Int>' } }).execute();
```

### `db.myPendingAppInvitesRecord`

CRUD operations for MyPendingAppInvitesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `channel` | String | Yes |
| `createdAt` | Datetime | No |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `senderId` | UUID | Yes |

**Operations:**

```typescript
// List all myPendingAppInvitesRecord records
const items = await db.myPendingAppInvitesRecord.findMany({ select: { channel: true, createdAt: true, expiresAt: true, id: true, senderId: true } }).execute();

// Get one by id
const item = await db.myPendingAppInvitesRecord.findOne({ id: '<UUID>', select: { channel: true, createdAt: true, expiresAt: true, id: true, senderId: true } }).execute();

// Create
const created = await db.myPendingAppInvitesRecord.create({ data: { channel: '<String>', expiresAt: '<Datetime>', senderId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.myPendingAppInvitesRecord.update({ where: { id: '<UUID>' }, data: { channel: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.myPendingAppInvitesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.myPendingOrgInvitesRecord`

CRUD operations for MyPendingOrgInvitesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `channel` | String | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `senderId` | UUID | Yes |

**Operations:**

```typescript
// List all myPendingOrgInvitesRecord records
const items = await db.myPendingOrgInvitesRecord.findMany({ select: { channel: true, createdAt: true, entityId: true, expiresAt: true, id: true, senderId: true } }).execute();

// Get one by id
const item = await db.myPendingOrgInvitesRecord.findOne({ id: '<UUID>', select: { channel: true, createdAt: true, entityId: true, expiresAt: true, id: true, senderId: true } }).execute();

// Create
const created = await db.myPendingOrgInvitesRecord.create({ data: { channel: '<String>', entityId: '<UUID>', expiresAt: '<Datetime>', senderId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.myPendingOrgInvitesRecord.update({ where: { id: '<UUID>' }, data: { channel: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.myPendingOrgInvitesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgAdminGrant`

CRUD operations for OrgAdminGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgAdminGrant records
const items = await db.orgAdminGrant.findMany({ select: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgAdminGrant.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.orgAdminGrant.create({ data: { actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgAdminGrant.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgAdminGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgCapabilityDefaultCapability`

CRUD operations for OrgCapabilityDefaultCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `capabilityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgCapabilityDefaultCapability records
const items = await db.orgCapabilityDefaultCapability.findMany({ select: { capabilityId: true, createdAt: true, entityId: true, id: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgCapabilityDefaultCapability.findOne({ id: '<UUID>', select: { capabilityId: true, createdAt: true, entityId: true, id: true, updatedAt: true } }).execute();

// Create
const created = await db.orgCapabilityDefaultCapability.create({ data: { capabilityId: '<UUID>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgCapabilityDefaultCapability.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgCapabilityDefaultCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgCapabilityDefaultGrant`

CRUD operations for OrgCapabilityDefaultGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `capabilityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgCapabilityDefaultGrant records
const items = await db.orgCapabilityDefaultGrant.findMany({ select: { capabilityId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgCapabilityDefaultGrant.findOne({ id: '<UUID>', select: { capabilityId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.orgCapabilityDefaultGrant.create({ data: { capabilityId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgCapabilityDefaultGrant.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgCapabilityDefaultGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgChartEdge`

CRUD operations for OrgChartEdge records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `childId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `parentId` | UUID | Yes |
| `positionLevel` | Int | Yes |
| `positionTitle` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgChartEdge records
const items = await db.orgChartEdge.findMany({ select: { childId: true, createdAt: true, entityId: true, id: true, parentId: true, positionLevel: true, positionTitle: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgChartEdge.findOne({ id: '<UUID>', select: { childId: true, createdAt: true, entityId: true, id: true, parentId: true, positionLevel: true, positionTitle: true, updatedAt: true } }).execute();

// Create
const created = await db.orgChartEdge.create({ data: { childId: '<UUID>', entityId: '<UUID>', parentId: '<UUID>', positionLevel: '<Int>', positionTitle: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgChartEdge.update({ where: { id: '<UUID>' }, data: { childId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgChartEdge.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgChartEdgeGrant`

CRUD operations for OrgChartEdgeGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `childId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `parentId` | UUID | Yes |
| `positionLevel` | Int | Yes |
| `positionTitle` | String | Yes |

**Operations:**

```typescript
// List all orgChartEdgeGrant records
const items = await db.orgChartEdgeGrant.findMany({ select: { childId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, parentId: true, positionLevel: true, positionTitle: true } }).execute();

// Get one by id
const item = await db.orgChartEdgeGrant.findOne({ id: '<UUID>', select: { childId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, parentId: true, positionLevel: true, positionTitle: true } }).execute();

// Create
const created = await db.orgChartEdgeGrant.create({ data: { childId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>', parentId: '<UUID>', positionLevel: '<Int>', positionTitle: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgChartEdgeGrant.update({ where: { id: '<UUID>' }, data: { childId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgChartEdgeGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgClaimedInvite`

CRUD operations for OrgClaimedInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `receiverId` | UUID | Yes |
| `senderId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgClaimedInvite records
const items = await db.orgClaimedInvite.findMany({ select: { createdAt: true, data: true, entityId: true, id: true, receiverId: true, senderId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgClaimedInvite.findOne({ id: '<UUID>', select: { createdAt: true, data: true, entityId: true, id: true, receiverId: true, senderId: true, updatedAt: true } }).execute();

// Create
const created = await db.orgClaimedInvite.create({ data: { data: '<JSON>', entityId: '<UUID>', receiverId: '<UUID>', senderId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgClaimedInvite.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgClaimedInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgGetManagersRecord`

CRUD operations for OrgGetManagersRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `depth` | Int | Yes |
| `userId` | UUID | Yes |

**Operations:**

```typescript
// List all orgGetManagersRecord records
const items = await db.orgGetManagersRecord.findMany({ select: { depth: true, userId: true } }).execute();

// Get one by id
const item = await db.orgGetManagersRecord.findOne({ id: '<UUID>', select: { depth: true, userId: true } }).execute();

// Create
const created = await db.orgGetManagersRecord.create({ data: { depth: '<Int>', userId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgGetManagersRecord.update({ where: { id: '<UUID>' }, data: { depth: '<Int>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgGetManagersRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgGetSubordinatesRecord`

CRUD operations for OrgGetSubordinatesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `depth` | Int | Yes |
| `userId` | UUID | Yes |

**Operations:**

```typescript
// List all orgGetSubordinatesRecord records
const items = await db.orgGetSubordinatesRecord.findMany({ select: { depth: true, userId: true } }).execute();

// Get one by id
const item = await db.orgGetSubordinatesRecord.findOne({ id: '<UUID>', select: { depth: true, userId: true } }).execute();

// Create
const created = await db.orgGetSubordinatesRecord.create({ data: { depth: '<Int>', userId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgGetSubordinatesRecord.update({ where: { id: '<UUID>' }, data: { depth: '<Int>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgGetSubordinatesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgGrant`

CRUD operations for OrgGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `capabilities` | BitString | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgGrant records
const items = await db.orgGrant.findMany({ select: { actorId: true, capabilities: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgGrant.findOne({ id: '<UUID>', select: { actorId: true, capabilities: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.orgGrant.create({ data: { actorId: '<UUID>', capabilities: '<BitString>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgGrant.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgInvite`

CRUD operations for OrgInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `channel` | String | Yes |
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `email` | ConstructiveInternalTypeEmail | Yes |
| `entityId` | UUID | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `inviteCount` | Int | Yes |
| `inviteLimit` | Int | Yes |
| `inviteToken` | String | Yes |
| `inviteValid` | Boolean | Yes |
| `isReadOnly` | Boolean | Yes |
| `multiple` | Boolean | Yes |
| `phone` | String | Yes |
| `profileId` | UUID | Yes |
| `receiverId` | UUID | Yes |
| `senderId` | UUID | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgInvite records
const items = await db.orgInvite.findMany({ select: { channel: true, createdAt: true, data: true, email: true, entityId: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, isReadOnly: true, multiple: true, phone: true, profileId: true, receiverId: true, senderId: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgInvite.findOne({ id: '<UUID>', select: { channel: true, createdAt: true, data: true, email: true, entityId: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, isReadOnly: true, multiple: true, phone: true, profileId: true, receiverId: true, senderId: true, updatedAt: true } }).execute();

// Create
const created = await db.orgInvite.create({ data: { channel: '<String>', data: '<JSON>', email: '<Email>', entityId: '<UUID>', expiresAt: '<Datetime>', inviteCount: '<Int>', inviteLimit: '<Int>', inviteToken: '<String>', inviteValid: '<Boolean>', isReadOnly: '<Boolean>', multiple: '<Boolean>', phone: '<String>', profileId: '<UUID>', receiverId: '<UUID>', senderId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgInvite.update({ where: { id: '<UUID>' }, data: { channel: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMember`

CRUD operations for OrgMember records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `isAdmin` | Boolean | Yes |

**Operations:**

```typescript
// List all orgMember records
const items = await db.orgMember.findMany({ select: { actorId: true, entityId: true, id: true, isAdmin: true } }).execute();

// Get one by id
const item = await db.orgMember.findOne({ id: '<UUID>', select: { actorId: true, entityId: true, id: true, isAdmin: true } }).execute();

// Create
const created = await db.orgMember.create({ data: { actorId: '<UUID>', entityId: '<UUID>', isAdmin: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMember.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMember.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMemberProfile`

CRUD operations for OrgMemberProfile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `bio` | String | Yes |
| `createdAt` | Datetime | No |
| `displayName` | String | Yes |
| `email` | String | Yes |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `membershipId` | UUID | Yes |
| `profilePicture` | ConstructiveInternalTypeImage | Yes |
| `title` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgMemberProfile records
const items = await db.orgMemberProfile.findMany({ select: { actorId: true, bio: true, createdAt: true, displayName: true, email: true, entityId: true, id: true, membershipId: true, profilePicture: true, title: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgMemberProfile.findOne({ id: '<UUID>', select: { actorId: true, bio: true, createdAt: true, displayName: true, email: true, entityId: true, id: true, membershipId: true, profilePicture: true, title: true, updatedAt: true } }).execute();

// Create
const created = await db.orgMemberProfile.create({ data: { actorId: '<UUID>', bio: '<String>', displayName: '<String>', email: '<String>', entityId: '<UUID>', membershipId: '<UUID>', profilePicture: '<Image>', title: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMemberProfile.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMemberProfile.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMembership`

CRUD operations for OrgMembership records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `capabilities` | BitString | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `entityId` | UUID | Yes |
| `granted` | BitString | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `isAdmin` | Boolean | Yes |
| `isApproved` | Boolean | Yes |
| `isBanned` | Boolean | Yes |
| `isDisabled` | Boolean | Yes |
| `isExternal` | Boolean | Yes |
| `isOwner` | Boolean | Yes |
| `isReadOnly` | Boolean | Yes |
| `profileId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all orgMembership records
const items = await db.orgMembership.findMany({ select: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isExternal: true, isOwner: true, isReadOnly: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.orgMembership.findOne({ id: '<UUID>', select: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isExternal: true, isOwner: true, isReadOnly: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.orgMembership.create({ data: { actorId: '<UUID>', capabilities: '<BitString>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', granted: '<BitString>', isActive: '<Boolean>', isAdmin: '<Boolean>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isExternal: '<Boolean>', isOwner: '<Boolean>', isReadOnly: '<Boolean>', profileId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMembership.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMembership.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMembershipDefault`

CRUD operations for OrgMembershipDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `isApproved` | Boolean | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all orgMembershipDefault records
const items = await db.orgMembershipDefault.findMany({ select: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, id: true, isApproved: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.orgMembershipDefault.findOne({ id: '<UUID>', select: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, id: true, isApproved: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.orgMembershipDefault.create({ data: { createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', isApproved: '<Boolean>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMembershipDefault.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMembershipDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMembershipSetting`

CRUD operations for OrgMembershipSetting records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `allowExternalMembers` | Boolean | Yes |
| `allowPrincipalOwnedApiKeys` | Boolean | Yes |
| `apiKeyMaxDuration` | Interval | Yes |
| `createChildCascadeAdmins` | Boolean | Yes |
| `createChildCascadeMembers` | Boolean | Yes |
| `createChildCascadeOwners` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `deleteMemberCascadeChildren` | Boolean | Yes |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `inviteProfileAssignmentMode` | String | Yes |
| `limitAllocationMode` | String | Yes |
| `populateMemberEmail` | Boolean | Yes |
| `updatedAt` | Datetime | No |
| `updatedBy` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |

**Operations:**

```typescript
// List all orgMembershipSetting records
const items = await db.orgMembershipSetting.findMany({ select: { allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, createChildCascadeOwners: true, createdAt: true, createdBy: true, createdByPrincipal: true, deleteMemberCascadeChildren: true, entityId: true, id: true, inviteProfileAssignmentMode: true, limitAllocationMode: true, populateMemberEmail: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Get one by id
const item = await db.orgMembershipSetting.findOne({ id: '<UUID>', select: { allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, createChildCascadeOwners: true, createdAt: true, createdBy: true, createdByPrincipal: true, deleteMemberCascadeChildren: true, entityId: true, id: true, inviteProfileAssignmentMode: true, limitAllocationMode: true, populateMemberEmail: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } }).execute();

// Create
const created = await db.orgMembershipSetting.create({ data: { allowExternalMembers: '<Boolean>', allowPrincipalOwnedApiKeys: '<Boolean>', apiKeyMaxDuration: '<Interval>', createChildCascadeAdmins: '<Boolean>', createChildCascadeMembers: '<Boolean>', createChildCascadeOwners: '<Boolean>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', deleteMemberCascadeChildren: '<Boolean>', entityId: '<UUID>', inviteProfileAssignmentMode: '<String>', limitAllocationMode: '<String>', populateMemberEmail: '<Boolean>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMembershipSetting.update({ where: { id: '<UUID>' }, data: { allowExternalMembers: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMembershipSetting.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgOwnerGrant`

CRUD operations for OrgOwnerGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgOwnerGrant records
const items = await db.orgOwnerGrant.findMany({ select: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgOwnerGrant.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } }).execute();

// Create
const created = await db.orgOwnerGrant.create({ data: { actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgOwnerGrant.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgOwnerGrant.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.query.getOrganizationId`

getOrganizationId

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `entityId` | UUID |
  | `entityType` | String |

```typescript
const result = await db.query.getOrganizationId({ entityId: '<UUID>', entityType: '<String>' }).execute();
```

### `db.query.orgIsManagerOf`

orgIsManagerOf

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `managerId` | UUID |
  | `maxDepth` | Int |
  | `targetEntityId` | UUID |
  | `userId` | UUID |

```typescript
const result = await db.query.orgIsManagerOf({ managerId: '<UUID>', maxDepth: '<Int>', targetEntityId: '<UUID>', userId: '<UUID>' }).execute();
```

### `db.mutation.acceptAppInvite`

acceptAppInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptAppInviteInput (required) |

```typescript
const result = await db.mutation.acceptAppInvite({ input: { inviteId: '<UUID>' } }).execute();
```

### `db.mutation.acceptOrgInvite`

acceptOrgInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptOrgInviteInput (required) |

```typescript
const result = await db.mutation.acceptOrgInvite({ input: { inviteId: '<UUID>' } }).execute();
```

### `db.mutation.provisionAppUser`

provisionAppUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUserInput (required) |

```typescript
const result = await db.mutation.provisionAppUser({ input: { email: '<String>', phone: '<String>', profileId: '<UUID>' } }).execute();
```

### `db.mutation.provisionAppUsersBulk`

provisionAppUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUsersBulkInput (required) |

```typescript
const result = await db.mutation.provisionAppUsersBulk({ input: { users: '<JSON>' } }).execute();
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

### `db.mutation.provisionOrgUser`

provisionOrgUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUserInput (required) |

```typescript
const result = await db.mutation.provisionOrgUser({ input: { email: '<String>', entityId: '<UUID>', isReadOnly: '<Boolean>', phone: '<String>', profileId: '<UUID>' } }).execute();
```

### `db.mutation.provisionOrgUsersBulk`

provisionOrgUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUsersBulkInput (required) |

```typescript
const result = await db.mutation.provisionOrgUsersBulk({ input: { entityId: '<UUID>', users: '<JSON>' } }).execute();
```

### `db.mutation.submitAppInviteCode`

submitAppInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitAppInviteCodeInput (required) |

```typescript
const result = await db.mutation.submitAppInviteCode({ input: { token: '<String>' } }).execute();
```

### `db.mutation.submitOrgInviteCode`

submitOrgInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitOrgInviteCodeInput (required) |

```typescript
const result = await db.mutation.submitOrgInviteCode({ input: { token: '<String>' } }).execute();
```
