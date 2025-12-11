# s3-streamer

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/s3-streamer"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fs3-streamer%2Fpackage.json"/></a>
</p>

Stream uploads to S3 with automatic content-type detection, ETag generation, and metadata extraction. Built on AWS SDK v3 for optimal performance and smaller bundle sizes.

## Features

- 🚀 **Streaming uploads** - Memory efficient streaming directly to S3
- 🔍 **Automatic content-type detection** - Uses magic bytes to detect file types
- 🏷️ **Metadata extraction** - Generates ETags, SHA hashes, and UUIDs for uploaded content
- 📦 **AWS SDK v3** - Modern, modular SDK with better tree-shaking
- 🔧 **MinIO compatible** - Works with S3-compatible storage services
- 💪 **TypeScript support** - Full type definitions included

## Installation

```sh
npm install @launchql/s3-streamer
```

## Quick Start

Stream uploads to S3

```js
import Streamer from '@launchql/s3-streamer';
const streamer = new Streamer(opts)
const readStream = createReadStream(filename);
const results = await streamer.upload({
    readStream,
    filename,
    bucket,
    key
});
```

## Response Format

The upload methods return a detailed payload with upload results and file metadata:

```js
{
  upload: {
    ETag: '"952fd44d14cee87882239b707231609d"',
    Location: 'http://localhost:9000/launchql/db1/assets/.gitignore',
    Key: 'db1/assets/.gitignore',
    Bucket: 'launchql'
  },
  magic: { 
    type: 'text/plain', 
    charset: 'us-ascii' 
  },
  contentType: 'text/plain',
  contents: {
    uuid: '278aee01-1404-5725-8f0e-7044c9c16397',
    sha: '7d65523f2a5afb69d76824dd1dfa62a34faa3197',
    etag: '952fd44d14cee87882239b707231609d'
  }
}
```

### Response Fields

- **upload**: S3 upload response
  - `ETag`: S3 ETag of the uploaded object
  - `Location`: Full URL to the uploaded object
  - `Key`: S3 object key
  - `Bucket`: Bucket name where object was uploaded
- **magic**: File type detection results
  - `type`: MIME type detected from file content
  - `charset`: Character encoding (for text files)
- **contentType**: Final content-type used for upload
- **contents**: File metadata
  - `uuid`: Deterministic UUID based on file content
  - `sha`: SHA-1 hash of file content
  - `etag`: Computed ETag (matches S3 ETag for single-part uploads)

## functional utils

If you don't want to use the `Streamer` class you can use the utils directly:

```js
import { getClient, upload } from '@launchql/s3-streamer';
const client = getClient(opts)
const readStream = createReadStream(filename);
const results = await upload({
    client,
    readStream,
    filename,
    bucket,
    key
});
```

## Configuration

### AWS S3 Production

```js
const streamer = new Streamer({
  defaultBucket: 'my-bucket',
  awsRegion: 'us-east-1',
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID
});
```

### MinIO / S3-Compatible Storage

```js
const streamer = new Streamer({
  defaultBucket: 'my-bucket',
  awsRegion: 'us-east-1',
  awsSecretKey: 'minio-secret',
  awsAccessKey: 'minio-access',
  minioEndpoint: 'http://localhost:9000'
});
```

## API Reference

### Streamer Class

#### Constructor Options

```typescript
interface StreamerOptions {
  awsRegion: string;        // AWS region (e.g., 'us-east-1')
  awsSecretKey: string;     // AWS secret access key
  awsAccessKey: string;     // AWS access key ID
  minioEndpoint?: string;   // Optional: MinIO/S3-compatible endpoint
  defaultBucket: string;    // Default bucket for uploads
}
```

#### Methods

##### `upload(params)`

Uploads a file stream to S3 with automatic content-type detection and metadata extraction.

```typescript
interface UploadParams {
  readStream: ReadStream;   // Node.js readable stream
  filename: string;         // Original filename (used for content-type detection)
  key: string;             // S3 object key (path in bucket)
  bucket?: string;         // Optional: Override default bucket
}
```

##### `destroy()`

Cleans up the S3 client connections. Should be called when done with the streamer instance.

```js
streamer.destroy();
```

### Functional API

If you prefer functional programming over classes:

```js
import { getClient, upload } from '@launchql/s3-streamer';

// Create S3 client
const client = getClient({
  awsRegion: 'us-east-1',
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  minioEndpoint: 'http://localhost:9000' // optional
});

// Upload file
const results = await upload({
  client,
  readStream: createReadStream('file.pdf'),
  filename: 'file.pdf',
  bucket: 'my-bucket',
  key: 'uploads/file.pdf'
});

// Clean up when done
client.destroy();
```
