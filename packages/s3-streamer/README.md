# s3-streamer

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/s3-streamer"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fs3-streamer%2Fpackage.json"/></a>
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

## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/supabase-test](https://github.com/launchql/launchql/tree/main/packages/supabase-test): **🧪 Supabase-native test harness** preconfigured for the local Supabase stack—per-test rollbacks, JWT/role context helpers, and CI/GitHub Actions ready.
* [launchql/graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): **🔐 Authentication mocking** for Graphile-focused test helpers and emulating row-level security contexts.
* [launchql/pg-query-context](https://github.com/launchql/launchql/tree/main/packages/pg-query-context): **🔒 Session context injection** to add session-local context (e.g., `SET LOCAL`) into queries—ideal for setting `role`, `jwt.claims`, and other session settings.

### 🧠 Parsing & AST

* [launchql/pgsql-parser](https://github.com/launchql/pgsql-parser): **🔄 SQL conversion engine** that interprets and converts PostgreSQL syntax.
* [launchql/libpg-query-node](https://github.com/launchql/libpg-query-node): **🌉 Node.js bindings** for `libpg_query`, converting SQL into parse trees.
* [launchql/pg-proto-parser](https://github.com/launchql/pg-proto-parser): **📦 Protobuf parser** for parsing PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.
* [@pgsql/enums](https://github.com/launchql/pgsql-parser/tree/main/packages/enums): **🏷️ TypeScript enums** for PostgreSQL AST for safe and ergonomic parsing logic.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): **📝 Type definitions** for PostgreSQL AST nodes in TypeScript.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): **🛠️ AST utilities** for constructing and transforming PostgreSQL syntax trees.
* [launchql/pg-ast](https://github.com/launchql/launchql/tree/main/packages/pg-ast): **🔍 Low-level AST tools** and transformations for Postgres query structures.

### 🚀 API & Dev Tools

* [launchql/server](https://github.com/launchql/launchql/tree/main/packages/server): **⚡ Express-based API server** powered by PostGraphile to expose a secure, scalable GraphQL API over your Postgres database.
* [launchql/explorer](https://github.com/launchql/launchql/tree/main/packages/explorer): **🔎 Visual API explorer** with GraphiQL for browsing across all databases and schemas—useful for debugging, documentation, and API prototyping.

### 🔁 Streaming & Uploads

* [launchql/s3-streamer](https://github.com/launchql/launchql/tree/main/packages/s3-streamer): **📤 Direct S3 streaming** for large files with support for metadata injection and content validation.
* [launchql/etag-hash](https://github.com/launchql/launchql/tree/main/packages/etag-hash): **🏷️ S3-compatible ETags** created by streaming and hashing file uploads in chunks.
* [launchql/etag-stream](https://github.com/launchql/launchql/tree/main/packages/etag-stream): **🔄 ETag computation** via Node stream transformer during upload or transfer.
* [launchql/uuid-hash](https://github.com/launchql/launchql/tree/main/packages/uuid-hash): **🆔 Deterministic UUIDs** generated from hashed content, great for deduplication and asset referencing.
* [launchql/uuid-stream](https://github.com/launchql/launchql/tree/main/packages/uuid-stream): **🌊 Streaming UUID generation** based on piped file content—ideal for upload pipelines.
* [launchql/upload-names](https://github.com/launchql/launchql/tree/main/packages/upload-names): **📂 Collision-resistant filenames** utility for structured and unique file names for uploads.

### 🧰 CLI & Codegen

* [pgpm](https://github.com/launchql/launchql/tree/main/packages/pgpm): **🖥️ PostgreSQL Package Manager** for modular Postgres development. Works with database workspaces, scaffolding, migrations, seeding, and installing database packages.
* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

