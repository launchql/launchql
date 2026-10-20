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
| `appLimitCap` | findMany, findOne, create, update, delete |
| `appLimitCapsDefault` | findMany, findOne, create, update, delete |
| `appLimit` | findMany, findOne, create, update, delete |
| `appLimitCreditCode` | findMany, findOne, create, update, delete |
| `appLimitCreditCodeItem` | findMany, findOne, create, update, delete |
| `appLimitCredit` | findMany, findOne, create, update, delete |
| `appLimitCreditRedemption` | findMany, findOne, create, update, delete |
| `appLimitDefault` | findMany, findOne, create, update, delete |
| `appLimitEvent` | findMany, findOne, create, update, delete |
| `appLimitWarning` | findMany, findOne, create, update, delete |
| `orgLimitAggregate` | findMany, findOne, create, update, delete |
| `orgLimitCap` | findMany, findOne, create, update, delete |
| `orgLimitCapsDefault` | findMany, findOne, create, update, delete |
| `orgLimit` | findMany, findOne, create, update, delete |
| `orgLimitCredit` | findMany, findOne, create, update, delete |
| `orgLimitDefault` | findMany, findOne, create, update, delete |
| `orgLimitEvent` | findMany, findOne, create, update, delete |
| `orgLimitWarning` | findMany, findOne, create, update, delete |

## Table Operations

### `db.appLimitCap`

CRUD operations for AppLimitCap records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |

**Operations:**

```typescript
// List all appLimitCap records
const items = await db.appLimitCap.findMany({ select: { entityId: true, id: true, max: true, name: true } }).execute();

// Get one by id
const item = await db.appLimitCap.findOne({ id: '<UUID>', select: { entityId: true, id: true, max: true, name: true } }).execute();

// Create
const created = await db.appLimitCap.create({ data: { entityId: '<UUID>', max: '<BigInt>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitCap.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitCap.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitCapsDefault`

CRUD operations for AppLimitCapsDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |

**Operations:**

```typescript
// List all appLimitCapsDefault records
const items = await db.appLimitCapsDefault.findMany({ select: { id: true, max: true, name: true } }).execute();

// Get one by id
const item = await db.appLimitCapsDefault.findOne({ id: '<UUID>', select: { id: true, max: true, name: true } }).execute();

// Create
const created = await db.appLimitCapsDefault.create({ data: { max: '<BigInt>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitCapsDefault.update({ where: { id: '<UUID>' }, data: { max: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitCapsDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimit`

CRUD operations for AppLimit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `entityType` | String | Yes |
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |
| `num` | BigInt | Yes |
| `organizationId` | UUID | Yes |
| `periodCredits` | BigInt | Yes |
| `planMax` | BigInt | Yes |
| `purchasedCredits` | BigInt | Yes |
| `softMax` | BigInt | Yes |
| `windowDuration` | Interval | Yes |
| `windowStart` | Datetime | Yes |

**Operations:**

```typescript
// List all appLimit records
const items = await db.appLimit.findMany({ select: { actorId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } }).execute();

// Get one by id
const item = await db.appLimit.findOne({ id: '<UUID>', select: { actorId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } }).execute();

// Create
const created = await db.appLimit.create({ data: { actorId: '<UUID>', entityType: '<String>', max: '<BigInt>', name: '<String>', num: '<BigInt>', organizationId: '<UUID>', periodCredits: '<BigInt>', planMax: '<BigInt>', purchasedCredits: '<BigInt>', softMax: '<BigInt>', windowDuration: '<Interval>', windowStart: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimit.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitCreditCode`

CRUD operations for AppLimitCreditCode records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `code` | String | Yes |
| `currentRedemptions` | Int | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `maxRedemptions` | Int | Yes |

**Operations:**

```typescript
// List all appLimitCreditCode records
const items = await db.appLimitCreditCode.findMany({ select: { code: true, currentRedemptions: true, expiresAt: true, id: true, maxRedemptions: true } }).execute();

// Get one by id
const item = await db.appLimitCreditCode.findOne({ id: '<UUID>', select: { code: true, currentRedemptions: true, expiresAt: true, id: true, maxRedemptions: true } }).execute();

// Create
const created = await db.appLimitCreditCode.create({ data: { code: '<String>', currentRedemptions: '<Int>', expiresAt: '<Datetime>', maxRedemptions: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitCreditCode.update({ where: { id: '<UUID>' }, data: { code: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitCreditCode.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitCreditCodeItem`

CRUD operations for AppLimitCreditCodeItem records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `amount` | BigInt | Yes |
| `creditCodeId` | UUID | Yes |
| `creditType` | String | Yes |
| `defaultLimitId` | UUID | Yes |
| `id` | UUID | No |

**Operations:**

```typescript
// List all appLimitCreditCodeItem records
const items = await db.appLimitCreditCodeItem.findMany({ select: { amount: true, creditCodeId: true, creditType: true, defaultLimitId: true, id: true } }).execute();

// Get one by id
const item = await db.appLimitCreditCodeItem.findOne({ id: '<UUID>', select: { amount: true, creditCodeId: true, creditType: true, defaultLimitId: true, id: true } }).execute();

// Create
const created = await db.appLimitCreditCodeItem.create({ data: { amount: '<BigInt>', creditCodeId: '<UUID>', creditType: '<String>', defaultLimitId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitCreditCodeItem.update({ where: { id: '<UUID>' }, data: { amount: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitCreditCodeItem.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitCredit`

CRUD operations for AppLimitCredit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `amount` | BigInt | Yes |
| `creditType` | String | Yes |
| `defaultLimitId` | UUID | Yes |
| `id` | UUID | No |
| `reason` | String | Yes |

**Operations:**

```typescript
// List all appLimitCredit records
const items = await db.appLimitCredit.findMany({ select: { actorId: true, amount: true, creditType: true, defaultLimitId: true, id: true, reason: true } }).execute();

// Get one by id
const item = await db.appLimitCredit.findOne({ id: '<UUID>', select: { actorId: true, amount: true, creditType: true, defaultLimitId: true, id: true, reason: true } }).execute();

// Create
const created = await db.appLimitCredit.create({ data: { actorId: '<UUID>', amount: '<BigInt>', creditType: '<String>', defaultLimitId: '<UUID>', reason: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitCredit.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitCredit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitCreditRedemption`

CRUD operations for AppLimitCreditRedemption records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `creditCodeId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `id` | UUID | No |
| `organizationId` | UUID | Yes |

**Operations:**

```typescript
// List all appLimitCreditRedemption records
const items = await db.appLimitCreditRedemption.findMany({ select: { creditCodeId: true, entityId: true, entityType: true, id: true, organizationId: true } }).execute();

// Get one by id
const item = await db.appLimitCreditRedemption.findOne({ id: '<UUID>', select: { creditCodeId: true, entityId: true, entityType: true, id: true, organizationId: true } }).execute();

// Create
const created = await db.appLimitCreditRedemption.create({ data: { creditCodeId: '<UUID>', entityId: '<UUID>', entityType: '<String>', organizationId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitCreditRedemption.update({ where: { id: '<UUID>' }, data: { creditCodeId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitCreditRedemption.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitDefault`

CRUD operations for AppLimitDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |
| `softMax` | BigInt | Yes |

**Operations:**

```typescript
// List all appLimitDefault records
const items = await db.appLimitDefault.findMany({ select: { id: true, max: true, name: true, softMax: true } }).execute();

// Get one by id
const item = await db.appLimitDefault.findOne({ id: '<UUID>', select: { id: true, max: true, name: true, softMax: true } }).execute();

// Create
const created = await db.appLimitDefault.create({ data: { max: '<BigInt>', name: '<String>', softMax: '<BigInt>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitDefault.update({ where: { id: '<UUID>' }, data: { max: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitEvent`

CRUD operations for AppLimitEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `delta` | BigInt | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `maxAtEvent` | BigInt | Yes |
| `name` | String | Yes |
| `numAfter` | BigInt | Yes |
| `numBefore` | BigInt | Yes |
| `organizationId` | UUID | Yes |
| `reason` | String | Yes |

**Operations:**

```typescript
// List all appLimitEvent records
const items = await db.appLimitEvent.findMany({ select: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } }).execute();

// Get one by id
const item = await db.appLimitEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } }).execute();

// Create
const created = await db.appLimitEvent.create({ data: { actorId: '<UUID>', delta: '<BigInt>', entityId: '<UUID>', entityType: '<String>', eventType: '<String>', maxAtEvent: '<BigInt>', name: '<String>', numAfter: '<BigInt>', numBefore: '<BigInt>', organizationId: '<UUID>', reason: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appLimitWarning`

CRUD operations for AppLimitWarning records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `name` | String | Yes |
| `taskIdentifier` | String | Yes |
| `thresholdValue` | BigInt | Yes |
| `warningType` | String | Yes |

**Operations:**

```typescript
// List all appLimitWarning records
const items = await db.appLimitWarning.findMany({ select: { id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } }).execute();

// Get one by id
const item = await db.appLimitWarning.findOne({ id: '<UUID>', select: { id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } }).execute();

// Create
const created = await db.appLimitWarning.create({ data: { name: '<String>', taskIdentifier: '<String>', thresholdValue: '<BigInt>', warningType: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.appLimitWarning.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appLimitWarning.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimitAggregate`

CRUD operations for OrgLimitAggregate records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |
| `num` | BigInt | Yes |
| `organizationId` | UUID | Yes |
| `periodCredits` | BigInt | Yes |
| `planMax` | BigInt | Yes |
| `purchasedCredits` | BigInt | Yes |
| `reserved` | BigInt | Yes |
| `softMax` | BigInt | Yes |
| `windowDuration` | Interval | Yes |
| `windowStart` | Datetime | Yes |

**Operations:**

```typescript
// List all orgLimitAggregate records
const items = await db.orgLimitAggregate.findMany({ select: { entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, reserved: true, softMax: true, windowDuration: true, windowStart: true } }).execute();

// Get one by id
const item = await db.orgLimitAggregate.findOne({ id: '<UUID>', select: { entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, reserved: true, softMax: true, windowDuration: true, windowStart: true } }).execute();

// Create
const created = await db.orgLimitAggregate.create({ data: { entityId: '<UUID>', entityType: '<String>', max: '<BigInt>', name: '<String>', num: '<BigInt>', organizationId: '<UUID>', periodCredits: '<BigInt>', planMax: '<BigInt>', purchasedCredits: '<BigInt>', reserved: '<BigInt>', softMax: '<BigInt>', windowDuration: '<Interval>', windowStart: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimitAggregate.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimitAggregate.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimitCap`

CRUD operations for OrgLimitCap records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |

**Operations:**

```typescript
// List all orgLimitCap records
const items = await db.orgLimitCap.findMany({ select: { entityId: true, id: true, max: true, name: true } }).execute();

// Get one by id
const item = await db.orgLimitCap.findOne({ id: '<UUID>', select: { entityId: true, id: true, max: true, name: true } }).execute();

// Create
const created = await db.orgLimitCap.create({ data: { entityId: '<UUID>', max: '<BigInt>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimitCap.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimitCap.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimitCapsDefault`

CRUD operations for OrgLimitCapsDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |

**Operations:**

```typescript
// List all orgLimitCapsDefault records
const items = await db.orgLimitCapsDefault.findMany({ select: { id: true, max: true, name: true } }).execute();

// Get one by id
const item = await db.orgLimitCapsDefault.findOne({ id: '<UUID>', select: { id: true, max: true, name: true } }).execute();

// Create
const created = await db.orgLimitCapsDefault.create({ data: { max: '<BigInt>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimitCapsDefault.update({ where: { id: '<UUID>' }, data: { max: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimitCapsDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimit`

CRUD operations for OrgLimit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |
| `num` | BigInt | Yes |
| `organizationId` | UUID | Yes |
| `periodCredits` | BigInt | Yes |
| `planMax` | BigInt | Yes |
| `purchasedCredits` | BigInt | Yes |
| `softMax` | BigInt | Yes |
| `windowDuration` | Interval | Yes |
| `windowStart` | Datetime | Yes |

**Operations:**

```typescript
// List all orgLimit records
const items = await db.orgLimit.findMany({ select: { actorId: true, entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } }).execute();

// Get one by id
const item = await db.orgLimit.findOne({ id: '<UUID>', select: { actorId: true, entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } }).execute();

// Create
const created = await db.orgLimit.create({ data: { actorId: '<UUID>', entityId: '<UUID>', entityType: '<String>', max: '<BigInt>', name: '<String>', num: '<BigInt>', organizationId: '<UUID>', periodCredits: '<BigInt>', planMax: '<BigInt>', purchasedCredits: '<BigInt>', softMax: '<BigInt>', windowDuration: '<Interval>', windowStart: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimit.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimitCredit`

CRUD operations for OrgLimitCredit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `amount` | BigInt | Yes |
| `creditType` | String | Yes |
| `defaultLimitId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `id` | UUID | No |
| `organizationId` | UUID | Yes |
| `reason` | String | Yes |

**Operations:**

```typescript
// List all orgLimitCredit records
const items = await db.orgLimitCredit.findMany({ select: { actorId: true, amount: true, creditType: true, defaultLimitId: true, entityId: true, entityType: true, id: true, organizationId: true, reason: true } }).execute();

// Get one by id
const item = await db.orgLimitCredit.findOne({ id: '<UUID>', select: { actorId: true, amount: true, creditType: true, defaultLimitId: true, entityId: true, entityType: true, id: true, organizationId: true, reason: true } }).execute();

// Create
const created = await db.orgLimitCredit.create({ data: { actorId: '<UUID>', amount: '<BigInt>', creditType: '<String>', defaultLimitId: '<UUID>', entityId: '<UUID>', entityType: '<String>', organizationId: '<UUID>', reason: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimitCredit.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimitCredit.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimitDefault`

CRUD operations for OrgLimitDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `max` | BigInt | Yes |
| `name` | String | Yes |
| `softMax` | BigInt | Yes |

**Operations:**

```typescript
// List all orgLimitDefault records
const items = await db.orgLimitDefault.findMany({ select: { id: true, max: true, name: true, softMax: true } }).execute();

// Get one by id
const item = await db.orgLimitDefault.findOne({ id: '<UUID>', select: { id: true, max: true, name: true, softMax: true } }).execute();

// Create
const created = await db.orgLimitDefault.create({ data: { max: '<BigInt>', name: '<String>', softMax: '<BigInt>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimitDefault.update({ where: { id: '<UUID>' }, data: { max: '<BigInt>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimitDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimitEvent`

CRUD operations for OrgLimitEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `delta` | BigInt | Yes |
| `entityId` | UUID | Yes |
| `entityType` | String | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `maxAtEvent` | BigInt | Yes |
| `name` | String | Yes |
| `numAfter` | BigInt | Yes |
| `numBefore` | BigInt | Yes |
| `organizationId` | UUID | Yes |
| `reason` | String | Yes |

**Operations:**

```typescript
// List all orgLimitEvent records
const items = await db.orgLimitEvent.findMany({ select: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } }).execute();

// Get one by id
const item = await db.orgLimitEvent.findOne({ id: '<UUID>', select: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } }).execute();

// Create
const created = await db.orgLimitEvent.create({ data: { actorId: '<UUID>', delta: '<BigInt>', entityId: '<UUID>', entityType: '<String>', eventType: '<String>', maxAtEvent: '<BigInt>', name: '<String>', numAfter: '<BigInt>', numBefore: '<BigInt>', organizationId: '<UUID>', reason: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimitEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimitEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgLimitWarning`

CRUD operations for OrgLimitWarning records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `taskIdentifier` | String | Yes |
| `thresholdValue` | BigInt | Yes |
| `warningType` | String | Yes |

**Operations:**

```typescript
// List all orgLimitWarning records
const items = await db.orgLimitWarning.findMany({ select: { entityId: true, id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } }).execute();

// Get one by id
const item = await db.orgLimitWarning.findOne({ id: '<UUID>', select: { entityId: true, id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } }).execute();

// Create
const created = await db.orgLimitWarning.create({ data: { entityId: '<UUID>', name: '<String>', taskIdentifier: '<String>', thresholdValue: '<BigInt>', warningType: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgLimitWarning.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgLimitWarning.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.query.captureAppLimitDefaults`

captureAppLimitDefaults

- **Type:** query
- **Arguments:** none

```typescript
const result = await db.query.captureAppLimitDefaults().execute();
```

### `db.query.captureOrgLimitDefaults`

captureOrgLimitDefaults

- **Type:** query
- **Arguments:** none

```typescript
const result = await db.query.captureOrgLimitDefaults().execute();
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

### `db.mutation.seedAppLimitCapsDefaults`

seedAppLimitCapsDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedAppLimitCapsDefaultsInput (required) |

```typescript
const result = await db.mutation.seedAppLimitCapsDefaults({ input: { defaults: '<JSON>' } }).execute();
```

### `db.mutation.seedAppLimitDefaults`

seedAppLimitDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedAppLimitDefaultsInput (required) |

```typescript
const result = await db.mutation.seedAppLimitDefaults({ input: { defaults: '<JSON>' } }).execute();
```

### `db.mutation.seedOrgLimitCapsDefaults`

seedOrgLimitCapsDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedOrgLimitCapsDefaultsInput (required) |

```typescript
const result = await db.mutation.seedOrgLimitCapsDefaults({ input: { defaults: '<JSON>' } }).execute();
```

### `db.mutation.seedOrgLimitDefaults`

seedOrgLimitDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedOrgLimitDefaultsInput (required) |

```typescript
const result = await db.mutation.seedOrgLimitDefaults({ input: { defaults: '<JSON>' } }).execute();
```
