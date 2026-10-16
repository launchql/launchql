# graphile-bucket-provisioner-plugin

PostGraphile v5 plugin that exposes a `provisionBucket` mutation for manually
queueing storage reconciliation.

The constructive-db `storage:provision_bucket` job is the only component that
mints physical S3 bucket names, provisions S3, and records `physical_name`.
This plugin resolves the logical bucket under RLS and requests that job; it
does not call S3 or derive a physical name.

## Installation

```bash
pnpm add graphile-bucket-provisioner-plugin
```

## Usage

```typescript
import { BucketProvisionerPreset } from 'graphile-bucket-provisioner-plugin';

const preset = {
  extends: [BucketProvisionerPreset()],
};
```

The mutation accepts a logical bucket key and optionally an owner entity ID:

```graphql
mutation {
  provisionBucket(input: { bucketKey: "public" }) {
    bucketId
    bucketKey
    physicalName
    provisionRequestedAt
  }
}
```

`provisionBucket` resolves the bucket row under RLS and calls the storage
module's `<buckets>_provision(bucket_id)`, which stamps the row's
`provision_requested_at` as the caller and returns the row. The bucket's UPDATE
job trigger then enqueues the same `storage:provision_bucket` job used on
INSERT, keyed `storage:provision_bucket:<uuid>` on the `bucket:<uuid>` queue, so
repeated requests while a job is waiting collapse into it. Failures are
returned as GraphQL errors.

The payload fields are:

| Field | Description |
|-------|-------------|
| `bucketId` | Logical bucket row ID |
| `bucketKey` | Logical bucket key |
| `physicalName` | Recorded physical name, or `null` while reconciliation is pending |
| `provisionRequestedAt` | When reconciliation was last requested |

There are no plugin options: S3 connection details, naming, CORS, versioning,
and physical-name recording belong to the reconciler.
