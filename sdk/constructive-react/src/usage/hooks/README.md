# React Query Hooks

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from './hooks';

configure({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Hooks

| Hook | Type | Description |
|------|------|-------------|
| `useAppLimitCapsQuery` | Query | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useAppLimitCapQuery` | Query | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useCreateAppLimitCapMutation` | Mutation | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useUpdateAppLimitCapMutation` | Mutation | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useDeleteAppLimitCapMutation` | Mutation | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useAppLimitCapsDefaultsQuery` | Query | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useAppLimitCapsDefaultQuery` | Query | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useCreateAppLimitCapsDefaultMutation` | Mutation | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useUpdateAppLimitCapsDefaultMutation` | Mutation | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useDeleteAppLimitCapsDefaultMutation` | Mutation | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useAppLimitsQuery` | Query | Tracks per-actor usage counts against configurable maximum limits |
| `useAppLimitQuery` | Query | Tracks per-actor usage counts against configurable maximum limits |
| `useCreateAppLimitMutation` | Mutation | Tracks per-actor usage counts against configurable maximum limits |
| `useUpdateAppLimitMutation` | Mutation | Tracks per-actor usage counts against configurable maximum limits |
| `useDeleteAppLimitMutation` | Mutation | Tracks per-actor usage counts against configurable maximum limits |
| `useAppLimitCreditCodesQuery` | Query | Redeemable credit codes managed by admins with the add_credits capability |
| `useAppLimitCreditCodeQuery` | Query | Redeemable credit codes managed by admins with the add_credits capability |
| `useCreateAppLimitCreditCodeMutation` | Mutation | Redeemable credit codes managed by admins with the add_credits capability |
| `useUpdateAppLimitCreditCodeMutation` | Mutation | Redeemable credit codes managed by admins with the add_credits capability |
| `useDeleteAppLimitCreditCodeMutation` | Mutation | Redeemable credit codes managed by admins with the add_credits capability |
| `useAppLimitCreditCodeItemsQuery` | Query | Items within a credit code — each row grants credits for a specific limit definition |
| `useAppLimitCreditCodeItemQuery` | Query | Items within a credit code — each row grants credits for a specific limit definition |
| `useCreateAppLimitCreditCodeItemMutation` | Mutation | Items within a credit code — each row grants credits for a specific limit definition |
| `useUpdateAppLimitCreditCodeItemMutation` | Mutation | Items within a credit code — each row grants credits for a specific limit definition |
| `useDeleteAppLimitCreditCodeItemMutation` | Mutation | Items within a credit code — each row grants credits for a specific limit definition |
| `useAppLimitCreditsQuery` | Query | Append-only ledger of credit grants that automatically update limit ceilings |
| `useAppLimitCreditQuery` | Query | Append-only ledger of credit grants that automatically update limit ceilings |
| `useCreateAppLimitCreditMutation` | Mutation | Append-only ledger of credit grants that automatically update limit ceilings |
| `useUpdateAppLimitCreditMutation` | Mutation | Append-only ledger of credit grants that automatically update limit ceilings |
| `useDeleteAppLimitCreditMutation` | Mutation | Append-only ledger of credit grants that automatically update limit ceilings |
| `useAppLimitCreditRedemptionsQuery` | Query | Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits |
| `useAppLimitCreditRedemptionQuery` | Query | Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits |
| `useCreateAppLimitCreditRedemptionMutation` | Mutation | Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits |
| `useUpdateAppLimitCreditRedemptionMutation` | Mutation | Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits |
| `useDeleteAppLimitCreditRedemptionMutation` | Mutation | Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits |
| `useAppLimitDefaultsQuery` | Query | Default maximum values for each named limit, applied when no per-actor override exists |
| `useAppLimitDefaultQuery` | Query | Default maximum values for each named limit, applied when no per-actor override exists |
| `useCreateAppLimitDefaultMutation` | Mutation | Default maximum values for each named limit, applied when no per-actor override exists |
| `useUpdateAppLimitDefaultMutation` | Mutation | Default maximum values for each named limit, applied when no per-actor override exists |
| `useDeleteAppLimitDefaultMutation` | Mutation | Default maximum values for each named limit, applied when no per-actor override exists |
| `useAppLimitEventsQuery` | Query | Append-only log of limit events for historical reporting and audit |
| `useAppLimitEventQuery` | Query | Append-only log of limit events for historical reporting and audit |
| `useCreateAppLimitEventMutation` | Mutation | Append-only log of limit events for historical reporting and audit |
| `useUpdateAppLimitEventMutation` | Mutation | Append-only log of limit events for historical reporting and audit |
| `useDeleteAppLimitEventMutation` | Mutation | Append-only log of limit events for historical reporting and audit |
| `useAppLimitWarningsQuery` | Query | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useAppLimitWarningQuery` | Query | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useCreateAppLimitWarningMutation` | Mutation | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useUpdateAppLimitWarningMutation` | Mutation | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useDeleteAppLimitWarningMutation` | Mutation | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useOrgLimitAggregatesQuery` | Query | Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown) |
| `useOrgLimitAggregateQuery` | Query | Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown) |
| `useCreateOrgLimitAggregateMutation` | Mutation | Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown) |
| `useUpdateOrgLimitAggregateMutation` | Mutation | Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown) |
| `useDeleteOrgLimitAggregateMutation` | Mutation | Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown) |
| `useOrgLimitCapsQuery` | Query | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useOrgLimitCapQuery` | Query | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useCreateOrgLimitCapMutation` | Mutation | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useUpdateOrgLimitCapMutation` | Mutation | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useDeleteOrgLimitCapMutation` | Mutation | Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default. |
| `useOrgLimitCapsDefaultsQuery` | Query | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useOrgLimitCapsDefaultQuery` | Query | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useCreateOrgLimitCapsDefaultMutation` | Mutation | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useUpdateOrgLimitCapsDefaultMutation` | Mutation | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useDeleteOrgLimitCapsDefaultMutation` | Mutation | Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers. |
| `useOrgLimitsQuery` | Query | Tracks per-actor usage counts against configurable maximum limits |
| `useOrgLimitQuery` | Query | Tracks per-actor usage counts against configurable maximum limits |
| `useCreateOrgLimitMutation` | Mutation | Tracks per-actor usage counts against configurable maximum limits |
| `useUpdateOrgLimitMutation` | Mutation | Tracks per-actor usage counts against configurable maximum limits |
| `useDeleteOrgLimitMutation` | Mutation | Tracks per-actor usage counts against configurable maximum limits |
| `useOrgLimitCreditsQuery` | Query | Append-only ledger of credit grants that automatically update limit ceilings |
| `useOrgLimitCreditQuery` | Query | Append-only ledger of credit grants that automatically update limit ceilings |
| `useCreateOrgLimitCreditMutation` | Mutation | Append-only ledger of credit grants that automatically update limit ceilings |
| `useUpdateOrgLimitCreditMutation` | Mutation | Append-only ledger of credit grants that automatically update limit ceilings |
| `useDeleteOrgLimitCreditMutation` | Mutation | Append-only ledger of credit grants that automatically update limit ceilings |
| `useOrgLimitDefaultsQuery` | Query | Default maximum values for each named limit, applied when no per-actor override exists |
| `useOrgLimitDefaultQuery` | Query | Default maximum values for each named limit, applied when no per-actor override exists |
| `useCreateOrgLimitDefaultMutation` | Mutation | Default maximum values for each named limit, applied when no per-actor override exists |
| `useUpdateOrgLimitDefaultMutation` | Mutation | Default maximum values for each named limit, applied when no per-actor override exists |
| `useDeleteOrgLimitDefaultMutation` | Mutation | Default maximum values for each named limit, applied when no per-actor override exists |
| `useOrgLimitEventsQuery` | Query | Append-only log of limit events for historical reporting and audit |
| `useOrgLimitEventQuery` | Query | Append-only log of limit events for historical reporting and audit |
| `useCreateOrgLimitEventMutation` | Mutation | Append-only log of limit events for historical reporting and audit |
| `useUpdateOrgLimitEventMutation` | Mutation | Append-only log of limit events for historical reporting and audit |
| `useDeleteOrgLimitEventMutation` | Mutation | Append-only log of limit events for historical reporting and audit |
| `useOrgLimitWarningsQuery` | Query | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useOrgLimitWarningQuery` | Query | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useCreateOrgLimitWarningMutation` | Mutation | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useUpdateOrgLimitWarningMutation` | Mutation | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useDeleteOrgLimitWarningMutation` | Mutation | Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it. |
| `useCaptureAppLimitDefaultsQuery` | Query | captureAppLimitDefaults |
| `useCaptureOrgLimitDefaultsQuery` | Query | captureOrgLimitDefaults |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |
| `useSeedAppLimitCapsDefaultsMutation` | Mutation | seedAppLimitCapsDefaults |
| `useSeedAppLimitDefaultsMutation` | Mutation | seedAppLimitDefaults |
| `useSeedOrgLimitCapsDefaultsMutation` | Mutation | seedOrgLimitCapsDefaults |
| `useSeedOrgLimitDefaultsMutation` | Mutation | seedOrgLimitDefaults |

## Table Hooks

### AppLimitCap

```typescript
// List all appLimitCaps
const { data, isLoading } = useAppLimitCapsQuery({
  selection: { fields: { entityId: true, id: true, max: true, name: true } },
});

// Get one appLimitCap
const { data: item } = useAppLimitCapQuery({
  id: '<UUID>',
  selection: { fields: { entityId: true, id: true, max: true, name: true } },
});

// Create a appLimitCap
const { mutate: create } = useCreateAppLimitCapMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', max: '<BigInt>', name: '<String>' });
```

### AppLimitCapsDefault

```typescript
// List all appLimitCapsDefaults
const { data, isLoading } = useAppLimitCapsDefaultsQuery({
  selection: { fields: { id: true, max: true, name: true } },
});

// Get one appLimitCapsDefault
const { data: item } = useAppLimitCapsDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, max: true, name: true } },
});

// Create a appLimitCapsDefault
const { mutate: create } = useCreateAppLimitCapsDefaultMutation({
  selection: { fields: { id: true } },
});
create({ max: '<BigInt>', name: '<String>' });
```

### AppLimit

```typescript
// List all appLimits
const { data, isLoading } = useAppLimitsQuery({
  selection: { fields: { actorId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } },
});

// Get one appLimit
const { data: item } = useAppLimitQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } },
});

// Create a appLimit
const { mutate: create } = useCreateAppLimitMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', entityType: '<String>', max: '<BigInt>', name: '<String>', num: '<BigInt>', organizationId: '<UUID>', periodCredits: '<BigInt>', planMax: '<BigInt>', purchasedCredits: '<BigInt>', softMax: '<BigInt>', windowDuration: '<Interval>', windowStart: '<Datetime>' });
```

### AppLimitCreditCode

```typescript
// List all appLimitCreditCodes
const { data, isLoading } = useAppLimitCreditCodesQuery({
  selection: { fields: { code: true, currentRedemptions: true, expiresAt: true, id: true, maxRedemptions: true } },
});

// Get one appLimitCreditCode
const { data: item } = useAppLimitCreditCodeQuery({
  id: '<UUID>',
  selection: { fields: { code: true, currentRedemptions: true, expiresAt: true, id: true, maxRedemptions: true } },
});

// Create a appLimitCreditCode
const { mutate: create } = useCreateAppLimitCreditCodeMutation({
  selection: { fields: { id: true } },
});
create({ code: '<String>', currentRedemptions: '<Int>', expiresAt: '<Datetime>', maxRedemptions: '<Int>' });
```

### AppLimitCreditCodeItem

```typescript
// List all appLimitCreditCodeItems
const { data, isLoading } = useAppLimitCreditCodeItemsQuery({
  selection: { fields: { amount: true, creditCodeId: true, creditType: true, defaultLimitId: true, id: true } },
});

// Get one appLimitCreditCodeItem
const { data: item } = useAppLimitCreditCodeItemQuery({
  id: '<UUID>',
  selection: { fields: { amount: true, creditCodeId: true, creditType: true, defaultLimitId: true, id: true } },
});

// Create a appLimitCreditCodeItem
const { mutate: create } = useCreateAppLimitCreditCodeItemMutation({
  selection: { fields: { id: true } },
});
create({ amount: '<BigInt>', creditCodeId: '<UUID>', creditType: '<String>', defaultLimitId: '<UUID>' });
```

### AppLimitCredit

```typescript
// List all appLimitCredits
const { data, isLoading } = useAppLimitCreditsQuery({
  selection: { fields: { actorId: true, amount: true, creditType: true, defaultLimitId: true, id: true, reason: true } },
});

// Get one appLimitCredit
const { data: item } = useAppLimitCreditQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, amount: true, creditType: true, defaultLimitId: true, id: true, reason: true } },
});

// Create a appLimitCredit
const { mutate: create } = useCreateAppLimitCreditMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', amount: '<BigInt>', creditType: '<String>', defaultLimitId: '<UUID>', reason: '<String>' });
```

### AppLimitCreditRedemption

```typescript
// List all appLimitCreditRedemptions
const { data, isLoading } = useAppLimitCreditRedemptionsQuery({
  selection: { fields: { creditCodeId: true, entityId: true, entityType: true, id: true, organizationId: true } },
});

// Get one appLimitCreditRedemption
const { data: item } = useAppLimitCreditRedemptionQuery({
  id: '<UUID>',
  selection: { fields: { creditCodeId: true, entityId: true, entityType: true, id: true, organizationId: true } },
});

// Create a appLimitCreditRedemption
const { mutate: create } = useCreateAppLimitCreditRedemptionMutation({
  selection: { fields: { id: true } },
});
create({ creditCodeId: '<UUID>', entityId: '<UUID>', entityType: '<String>', organizationId: '<UUID>' });
```

### AppLimitDefault

```typescript
// List all appLimitDefaults
const { data, isLoading } = useAppLimitDefaultsQuery({
  selection: { fields: { id: true, max: true, name: true, softMax: true } },
});

// Get one appLimitDefault
const { data: item } = useAppLimitDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, max: true, name: true, softMax: true } },
});

// Create a appLimitDefault
const { mutate: create } = useCreateAppLimitDefaultMutation({
  selection: { fields: { id: true } },
});
create({ max: '<BigInt>', name: '<String>', softMax: '<BigInt>' });
```

### AppLimitEvent

```typescript
// List all appLimitEvents
const { data, isLoading } = useAppLimitEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } },
});

// Get one appLimitEvent
const { data: item } = useAppLimitEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } },
});

// Create a appLimitEvent
const { mutate: create } = useCreateAppLimitEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', delta: '<BigInt>', entityId: '<UUID>', entityType: '<String>', eventType: '<String>', maxAtEvent: '<BigInt>', name: '<String>', numAfter: '<BigInt>', numBefore: '<BigInt>', organizationId: '<UUID>', reason: '<String>' });
```

### AppLimitWarning

```typescript
// List all appLimitWarnings
const { data, isLoading } = useAppLimitWarningsQuery({
  selection: { fields: { id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } },
});

// Get one appLimitWarning
const { data: item } = useAppLimitWarningQuery({
  id: '<UUID>',
  selection: { fields: { id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } },
});

// Create a appLimitWarning
const { mutate: create } = useCreateAppLimitWarningMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', taskIdentifier: '<String>', thresholdValue: '<BigInt>', warningType: '<String>' });
```

### OrgLimitAggregate

```typescript
// List all orgLimitAggregates
const { data, isLoading } = useOrgLimitAggregatesQuery({
  selection: { fields: { entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, reserved: true, softMax: true, windowDuration: true, windowStart: true } },
});

// Get one orgLimitAggregate
const { data: item } = useOrgLimitAggregateQuery({
  id: '<UUID>',
  selection: { fields: { entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, reserved: true, softMax: true, windowDuration: true, windowStart: true } },
});

// Create a orgLimitAggregate
const { mutate: create } = useCreateOrgLimitAggregateMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', entityType: '<String>', max: '<BigInt>', name: '<String>', num: '<BigInt>', organizationId: '<UUID>', periodCredits: '<BigInt>', planMax: '<BigInt>', purchasedCredits: '<BigInt>', reserved: '<BigInt>', softMax: '<BigInt>', windowDuration: '<Interval>', windowStart: '<Datetime>' });
```

### OrgLimitCap

```typescript
// List all orgLimitCaps
const { data, isLoading } = useOrgLimitCapsQuery({
  selection: { fields: { entityId: true, id: true, max: true, name: true } },
});

// Get one orgLimitCap
const { data: item } = useOrgLimitCapQuery({
  id: '<UUID>',
  selection: { fields: { entityId: true, id: true, max: true, name: true } },
});

// Create a orgLimitCap
const { mutate: create } = useCreateOrgLimitCapMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', max: '<BigInt>', name: '<String>' });
```

### OrgLimitCapsDefault

```typescript
// List all orgLimitCapsDefaults
const { data, isLoading } = useOrgLimitCapsDefaultsQuery({
  selection: { fields: { id: true, max: true, name: true } },
});

// Get one orgLimitCapsDefault
const { data: item } = useOrgLimitCapsDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, max: true, name: true } },
});

// Create a orgLimitCapsDefault
const { mutate: create } = useCreateOrgLimitCapsDefaultMutation({
  selection: { fields: { id: true } },
});
create({ max: '<BigInt>', name: '<String>' });
```

### OrgLimit

```typescript
// List all orgLimits
const { data, isLoading } = useOrgLimitsQuery({
  selection: { fields: { actorId: true, entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } },
});

// Get one orgLimit
const { data: item } = useOrgLimitQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, entityId: true, entityType: true, id: true, max: true, name: true, num: true, organizationId: true, periodCredits: true, planMax: true, purchasedCredits: true, softMax: true, windowDuration: true, windowStart: true } },
});

// Create a orgLimit
const { mutate: create } = useCreateOrgLimitMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', entityId: '<UUID>', entityType: '<String>', max: '<BigInt>', name: '<String>', num: '<BigInt>', organizationId: '<UUID>', periodCredits: '<BigInt>', planMax: '<BigInt>', purchasedCredits: '<BigInt>', softMax: '<BigInt>', windowDuration: '<Interval>', windowStart: '<Datetime>' });
```

### OrgLimitCredit

```typescript
// List all orgLimitCredits
const { data, isLoading } = useOrgLimitCreditsQuery({
  selection: { fields: { actorId: true, amount: true, creditType: true, defaultLimitId: true, entityId: true, entityType: true, id: true, organizationId: true, reason: true } },
});

// Get one orgLimitCredit
const { data: item } = useOrgLimitCreditQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, amount: true, creditType: true, defaultLimitId: true, entityId: true, entityType: true, id: true, organizationId: true, reason: true } },
});

// Create a orgLimitCredit
const { mutate: create } = useCreateOrgLimitCreditMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', amount: '<BigInt>', creditType: '<String>', defaultLimitId: '<UUID>', entityId: '<UUID>', entityType: '<String>', organizationId: '<UUID>', reason: '<String>' });
```

### OrgLimitDefault

```typescript
// List all orgLimitDefaults
const { data, isLoading } = useOrgLimitDefaultsQuery({
  selection: { fields: { id: true, max: true, name: true, softMax: true } },
});

// Get one orgLimitDefault
const { data: item } = useOrgLimitDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, max: true, name: true, softMax: true } },
});

// Create a orgLimitDefault
const { mutate: create } = useCreateOrgLimitDefaultMutation({
  selection: { fields: { id: true } },
});
create({ max: '<BigInt>', name: '<String>', softMax: '<BigInt>' });
```

### OrgLimitEvent

```typescript
// List all orgLimitEvents
const { data, isLoading } = useOrgLimitEventsQuery({
  selection: { fields: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } },
});

// Get one orgLimitEvent
const { data: item } = useOrgLimitEventQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, delta: true, entityId: true, entityType: true, eventType: true, id: true, maxAtEvent: true, name: true, numAfter: true, numBefore: true, organizationId: true, reason: true } },
});

// Create a orgLimitEvent
const { mutate: create } = useCreateOrgLimitEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', delta: '<BigInt>', entityId: '<UUID>', entityType: '<String>', eventType: '<String>', maxAtEvent: '<BigInt>', name: '<String>', numAfter: '<BigInt>', numBefore: '<BigInt>', organizationId: '<UUID>', reason: '<String>' });
```

### OrgLimitWarning

```typescript
// List all orgLimitWarnings
const { data, isLoading } = useOrgLimitWarningsQuery({
  selection: { fields: { entityId: true, id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } },
});

// Get one orgLimitWarning
const { data: item } = useOrgLimitWarningQuery({
  id: '<UUID>',
  selection: { fields: { entityId: true, id: true, name: true, taskIdentifier: true, thresholdValue: true, warningType: true } },
});

// Create a orgLimitWarning
const { mutate: create } = useCreateOrgLimitWarningMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', name: '<String>', taskIdentifier: '<String>', thresholdValue: '<BigInt>', warningType: '<String>' });
```

## Custom Operation Hooks

### `useCaptureAppLimitDefaultsQuery`

captureAppLimitDefaults

- **Type:** query
- **Arguments:** none

### `useCaptureOrgLimitDefaultsQuery`

captureOrgLimitDefaults

- **Type:** query
- **Arguments:** none

### `useProvisionBucketMutation`

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

### `useSeedAppLimitCapsDefaultsMutation`

seedAppLimitCapsDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedAppLimitCapsDefaultsInput (required) |

### `useSeedAppLimitDefaultsMutation`

seedAppLimitDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedAppLimitDefaultsInput (required) |

### `useSeedOrgLimitCapsDefaultsMutation`

seedOrgLimitCapsDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedOrgLimitCapsDefaultsInput (required) |

### `useSeedOrgLimitDefaultsMutation`

seedOrgLimitDefaults

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SeedOrgLimitDefaultsInput (required) |
