# graphile-presigned-url-plugin

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-presigned-url-plugin"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-presigned-url-plugin%2Fpackage.json"/></a>
</p>

Presigned URL upload plugin for PostGraphile v5.

## Features

- `requestUploadUrl` mutation — generates presigned PUT URLs for direct client-to-S3 upload
- `downloadUrl` computed field — presigned GET URLs for private files, public URLs for public files
- `maxBulkFiles` field on bucket types — the most files one bulk-upload call accepts (`storage_module.max_bulk_files`, default 100)
- Content-hash based S3 keys (SHA-256) with automatic deduplication — only against rows whose bytes are in S3, so a retry of a never-completed upload gets a fresh URL
- Per-bucket MIME type and file size validation

## Usage

```typescript
import { PresignedUrlPreset } from 'graphile-presigned-url-plugin';
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

const preset = {
  extends: [
    PresignedUrlPreset({
      s3: {
        client: s3Client,
        bucket: 'my-uploads',
        publicUrlPrefix: 'https://cdn.example.com',
      },
      urlExpirySeconds: 900,
      maxFileSize: 200 * 1024 * 1024,
    }),
  ],
};
```
