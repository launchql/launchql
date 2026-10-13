# @constructive-io/bucket-provisioner

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@constructive-io/bucket-provisioner"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fbucket-provisioner%2Fpackage.json"/></a>
</p>

S3-compatible bucket provisioning library for the Constructive storage module. Creates and configures buckets with the correct privacy policies, CORS rules, versioning, and lifecycle settings for private, public, and temporary file storage.

## Features

- **Privacy enforcement** — Block All Public Access for private/temp buckets, public-read policy for public buckets
- **CORS configuration** — Browser-compatible rules for presigned URL uploads
- **Lifecycle rules** — Auto-cleanup for temp buckets (abandoned uploads)
- **Versioning** — Optional S3 versioning for durability
- **Multi-provider** — Works with AWS S3, RustFS (or any S3-compatible store), Cloudflare R2, Google Cloud Storage, and DigitalOcean Spaces
- **Inspect/audit** — Read back a bucket's current configuration for verification
- **Typed errors** — Structured `ProvisionerError` with error codes for programmatic handling

## Installation

```bash
pnpm add @constructive-io/bucket-provisioner
```

## Quick Start

```typescript
import { BucketProvisioner } from '@constructive-io/bucket-provisioner';

const provisioner = new BucketProvisioner({
  connection: {
    provider: 'minio',
    region: 'us-east-1',
    endpoint: 'http://rustfs:9000',
    accessKeyId: 'constructive',
    secretAccessKey: 'constructive-dev-secret',
  },
  allowedOrigins: ['https://app.example.com'],
});

// Provision a private bucket (presigned URLs only)
const result = await provisioner.provision({
  bucketName: 'my-app-private',
  accessType: 'private',
  versioning: true,
});

console.log(result);
// {
//   bucketName: 'my-app-private',
//   accessType: 'private',
//   blockPublicAccess: true,
//   versioning: true,
//   corsRules: [...],
//   lifecycleRules: [],
//   ...
// }
```

## Usage

### Provision a Public Bucket

Public buckets serve files via direct URL or CDN. The provisioner applies a public-read bucket policy and configures CORS for browser uploads.

```typescript
const result = await provisioner.provision({
  bucketName: 'my-app-public',
  accessType: 'public',
  publicUrlPrefix: 'https://cdn.example.com/public',
});
// result.blockPublicAccess === false
// result.publicUrlPrefix === 'https://cdn.example.com/public'
```

### Provision a Temp Bucket

Temp buckets are staging areas for uploads. They behave like private buckets but include a lifecycle rule to auto-delete objects after a configurable period.

```typescript
const result = await provisioner.provision({
  bucketName: 'my-app-temp',
  accessType: 'temp',
});
// result.lifecycleRules[0].id === 'temp-cleanup'
// result.lifecycleRules[0].expirationDays === 1
```

### Inspect an Existing Bucket

Read back a bucket's current configuration to verify it matches expectations.

```typescript
const config = await provisioner.inspect('my-app-private', 'private');
console.log(config.blockPublicAccess); // true
console.log(config.versioning);        // true
console.log(config.corsRules.length);  // 1
```

### Use with AWS S3

For AWS S3, no endpoint is needed — just region and credentials.

```typescript
const provisioner = new BucketProvisioner({
  connection: {
    provider: 's3',
    region: 'us-west-2',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
  allowedOrigins: ['https://app.example.com'],
});
```

### Use with Cloudflare R2

```typescript
const provisioner = new BucketProvisioner({
  connection: {
    provider: 'r2',
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
  allowedOrigins: ['https://app.example.com'],
});
```

## API

### `BucketProvisioner`

The main class that orchestrates bucket creation and configuration.

#### `new BucketProvisioner(options)`

| Option | Type | Description |
|--------|------|-------------|
| `connection.provider` | `'s3' \| 'minio' \| 'rustfs' \| 'r2' \| 'gcs' \| 'spaces'` | Storage provider type |
| `connection.region` | `string` | S3 region (e.g., `'us-east-1'`) |
| `connection.endpoint` | `string?` | S3-compatible endpoint URL. Required for non-AWS providers. |
| `connection.accessKeyId` | `string` | AWS access key ID |
| `connection.secretAccessKey` | `string` | AWS secret access key |
| `connection.forcePathStyle` | `boolean?` | Force path-style URLs (auto-detected per provider) |
| `allowedOrigins` | `string[]?` | Domains allowed for CORS (e.g., `['https://app.example.com']`). Empty or omitted means no browser origin may reach these buckets, and they are provisioned with no CORS rule set at all. |

#### `provisioner.provision(options): Promise<ProvisionResult>`

Creates and configures a bucket. Steps:

1. Creates the bucket (or verifies it exists)
2. Configures Block Public Access
3. Applies bucket policy (public-read or none)
4. Sets CORS rules for presigned URL uploads (skipped when no origins are allowed)
5. Optionally enables versioning
6. Adds lifecycle rules for temp buckets

| Option | Type | Description |
|--------|------|-------------|
| `bucketName` | `string` | S3 bucket name |
| `accessType` | `'public' \| 'private' \| 'temp'` | Determines which policies are applied |
| `region` | `string?` | Override region for this bucket |
| `versioning` | `boolean?` | Enable S3 versioning (default: `false`) |
| `publicUrlPrefix` | `string?` | CDN/public URL for public buckets |
| `allowedOrigins` | `string[]?` | Per-bucket CORS origins, overriding the constructor's |

#### `provisioner.inspect(bucketName, accessType): Promise<ProvisionResult>`

Reads back a bucket's current configuration (policy, CORS, versioning, lifecycle).

#### `provisioner.getClient(): S3Client`

Returns the underlying `@aws-sdk/client-s3` S3Client for advanced operations.

#### `provisioner.bucketExists(bucketName): Promise<boolean>`

Checks if a bucket exists and is accessible.

### Naming

#### `physicalBucketName({ scope, databaseId, bucketKey })`

The physical name a platform-provisioned bucket gets from its own identity:
`{scope}-{database label}-{bucketKey}-{digest}`. Takes no prefix — a bucket
belongs to one database at one scope, and there is no global bucket namespace to
prefix into. Each readable component has its own budget, so a long scope cannot
crowd out the database label, and the digest covers the untruncated identity.

### Policy Builders

Standalone functions for generating S3 policy documents.

#### `getPublicAccessBlock(accessType)`

Returns the Block Public Access configuration for a given access type.

#### `buildPublicReadPolicy(bucketName, keyPrefix?)`

Builds a public-read bucket policy document.

#### `buildCloudFrontOacPolicy(bucketName, distributionArn, keyPrefix?)`

Builds a CloudFront Origin Access Control bucket policy.

#### `buildPresignedUrlIamPolicy(bucketName)`

Builds the minimum-permission IAM policy for the presigned URL plugin.

### CORS Builders

#### `buildUploadCorsRules(allowedOrigins, maxAgeSeconds?)`

CORS rules for public/temp buckets (PUT, GET, HEAD).

#### `buildPrivateCorsRules(allowedOrigins, maxAgeSeconds?)`

CORS rules for private buckets (PUT, HEAD only — no GET).

### Lifecycle Builders

#### `buildTempCleanupRule(expirationDays?, prefix?)`

Lifecycle rule for auto-expiring temp bucket objects.

#### `buildAbortIncompleteMultipartRule(days?)`

Lifecycle rule for cleaning up incomplete multipart uploads.

### Error Handling

All errors thrown by the provisioner are instances of `ProvisionerError`:

```typescript
import { ProvisionerError } from '@constructive-io/bucket-provisioner';

try {
  await provisioner.provision({ bucketName: 'test', accessType: 'private' });
} catch (err) {
  if (err instanceof ProvisionerError) {
    console.error(err.code);    // 'POLICY_FAILED', 'CORS_FAILED', etc.
    console.error(err.message); // Human-readable description
    console.error(err.cause);   // Original AWS SDK error
  }
}
```

Error codes:

| Code | Description |
|------|-------------|
| `CONNECTION_FAILED` | Could not connect to the storage endpoint |
| `BUCKET_ALREADY_EXISTS` | Bucket exists and is owned by another account |
| `BUCKET_NOT_FOUND` | Bucket does not exist (for inspect/read operations) |
| `INVALID_CONFIG` | Invalid configuration (missing credentials, origins, etc.) |
| `POLICY_FAILED` | Failed to apply Block Public Access or bucket policy |
| `CORS_FAILED` | Failed to set CORS configuration |
| `LIFECYCLE_FAILED` | Failed to set lifecycle rules |
| `VERSIONING_FAILED` | Failed to enable versioning |
| `ACCESS_DENIED` | Credentials lack required permissions |
| `PROVIDER_ERROR` | Generic provider error (check `cause` for details) |

## Privacy Model

| Access Type | Block Public Access | Bucket Policy | CORS Methods | Lifecycle |
|-------------|-------------------|---------------|--------------|-----------|
| `private` | All blocked | None (deleted) | PUT, HEAD | None |
| `public` | Partially relaxed | Public-read | PUT, GET, HEAD | None |
| `temp` | All blocked | None (deleted) | PUT, GET, HEAD | Auto-expire (1 day) |

## Provider Notes

| Provider | Endpoint Required | Path Style | Notes |
|----------|------------------|------------|-------|
| `s3` | No | Virtual-hosted | AWS default |
| `minio` | Yes | Path-style S3-compatible (RustFS, MinIO) | Local development, self-hosted |
| `r2` | Yes | Path-style | Cloudflare R2 |
| `gcs` | Yes | Path-style | GCS S3-compatible API |
| `spaces` | Yes | Virtual-hosted | DigitalOcean Spaces |
