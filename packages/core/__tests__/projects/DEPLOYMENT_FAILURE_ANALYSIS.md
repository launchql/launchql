# Deployment Failure Analysis

## Overview

This document analyzes the behavior of LaunchQL's migration system when SQL changes fail during deployment, specifically examining the state of the `pgpm_migrate` schema and tables.

## Key Findings

### Transaction Mode (Default: `useTransaction: true`)

When a deployment fails in transaction mode:

- **Complete Rollback**: All changes are automatically rolled back
- **Database State**: Clean (as if deployment never happened)
- **Migration Tracking**: 
  - `pgpm_migrate.changes`: 0 rows
  - `pgpm_migrate.events`: 0 rows
- **Behavior**: Entire deployment is wrapped in a single transaction

**Snapshot Evidence:**
```json
{
  "changeCount": 0,
  "changes": [],
  "eventCount": 0,
  "events": []
}
```

### Non-Transaction Mode (`useTransaction: false`)

When a deployment fails in non-transaction mode:

- **Partial Deployment**: Successful changes remain deployed
- **Database State**: Mixed (successful changes persist)
- **Migration Tracking**:
  - `pgpm_migrate.changes`: Contains successful deployments
  - `pgpm_migrate.events`: Contains `deploy` events for successful changes
- **Behavior**: Each change deployed individually

**Snapshot Evidence:**
```json
{
  "changeCount": 2,
  "changes": [
    {
      "change_name": "create_table",
      "deployed_at": "2025-07-20T09:15:13.265Z",
      "project": "test-constraint-partial",
      "script_hash": "0624b3e2276299c8c3b8bfa514fe0d128906193769b3aeaea6732e71c0e352e6"
    },
    {
      "change_name": "add_record", 
      "deployed_at": "2025-07-20T09:15:13.269Z",
      "project": "test-constraint-partial",
      "script_hash": "833d7d349e3c4f07e1a24ed40ac9814329efc87c180180342a09874f8124a037"
    }
  ],
  "eventCount": 2,
  "events": [
    {
      "change_name": "create_table",
      "event_type": "deploy",
      "occurred_at": "2025-07-20T09:15:13.266Z",
      "project": "test-constraint-partial"
    },
    {
      "change_name": "add_record",
      "event_type": "deploy", 
      "occurred_at": "2025-07-20T09:15:13.269Z",
      "project": "test-constraint-partial"
    }
  ]
}
```

## Important Observations

### Failure Event Logging

**Critical Discovery**: Failure events are NOT logged to the `pgpm_migrate.events` table. Only successful deployments create entries with `event_type: 'deploy'`.

- Failed deployments are logged to application logs but not persisted in the migration tracking tables
- The `pgpm_migrate.events` table only contains successful deployment records
- This means you cannot query the migration tables to see deployment failure history

### Schema Structure

The `pgpm_migrate.events` table supports failure tracking with:
```sql
event_type TEXT NOT NULL CHECK (event_type IN ('deploy', 'revert', 'fail'))
```

However, in practice, only `'deploy'` events are currently being logged.

## Recommendations

### For Production Use

1. **Use Transaction Mode (Default)**: Provides automatic rollback and clean state on failure
2. **Monitor Application Logs**: Failure details are logged but not persisted in migration tables
3. **Manual Cleanup**: In non-transaction mode, failed deployments require manual cleanup of successful changes

### For Development/Testing

- Non-transaction mode can be useful for incremental rollout scenarios where partial success is acceptable
- Always verify the state of `pgpm_migrate.changes` after deployment failures

## Test Coverage

The deployment failure scenarios are tested in:
- `packages/core/__tests__/projects/deploy-failure-scenarios.test.ts`
- Snapshots: `packages/core/__tests__/projects/__snapshots__/deploy-failure-scenarios.test.ts.snap`

These tests demonstrate the exact database state differences between transaction and non-transaction failure modes using constraint violations as the failure mechanism.
