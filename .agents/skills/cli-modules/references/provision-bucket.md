# provisionBucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors.

## Usage

```bash
csdk provision-bucket --input.bucketKey <String> --input.ownerId <UUID>
```

## Examples

### Run provisionBucket

```bash
csdk provision-bucket --input.bucketKey <String> --input.ownerId <UUID>
```
