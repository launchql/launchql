# graphile-settings

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-settings"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fgraphile-settings%2Fpackage.json"/></a>
</p>

**`graphile-settings`** is a batteries-included configuration builder for [PostGraphile](https://www.graphile.org/postgraphile/), purpose-built for the [LaunchQL](https://github.com/launchql/launchql) ecosystem. It centralizes plugin setup, schema wiring, and feature flags into a single, composable interface — enabling consistent, high-performance GraphQL APIs across projects.

## 🚀 Installation

```bash
npm install graphile-settings
```

## ✨ Features

* Built-in support for:

  * ✅ Connection filters
  * 🔍 Full-text search
  * 🌍 PostGIS support (with filters)
  * 🧩 Many-to-many helpers
  * 🆎 Simplified inflectors
  * 🗂 Upload field support (S3/MinIO)
  * 🌐 i18n support via `graphile-i18n`
  * 🧠 Meta schema plugin
  * 🔎 Graphile search plugin
* Smart schema and plugin configuration via environment or options
* Express-compatible with support for request-aware context

## 📦 Usage

```ts
import { getGraphileSettings } from 'graphile-settings';
import { postgraphile } from 'postgraphile';
import express from 'express';

const app = express();

const settings = getGraphileSettings({
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictAuth: true,
  },
  graphile: {
    schema: ['app_public'],
    metaSchemas: ['meta_public'],
  },
  features: {
    postgis: true,
    simpleInflection: true,
    oppositeBaseNames: true,
  },
  cdn: {
    bucketName: 'media-bucket',
    awsRegion: 'us-west-1',
    awsAccessKey: 'AKIA...',
    awsSecretKey: 'secret',
    minioEndpoint: 'http://localhost:9000'
  }
});

app.use(postgraphile({
  ...settings,
  pgPool: myPool // your initialized pg.Pool
}));

app.listen(settings.port);
```

## 🧰 Configuration Options

### `LaunchQLOptions`

#### `server`

* `port` — (number) Port to use
* `host` — (string) Hostname
* `trustProxy` — (boolean) Whether to trust proxy headers (e.g. for real IPs)
* `origin` — (string) Origin for CORS/auth logic
* `strictAuth` — (boolean) Whether to enforce strict auth

#### `graphile`

* `schema` — (string or string\[]) Required list of main GraphQL schemas
* `metaSchemas` — (string\[]) Optional list of meta/introspection schemas
* `isPublic` — (boolean) Flag for public GraphQL instance
* `appendPlugins` — (Plugin\[]) Additional Graphile plugins
* `graphileBuildOptions` — (PostGraphileOptions.graphileBuildOptions) Extra build options
* `overrideSettings` — (Partial<PostGraphileOptions>) Manual overrides of generated config

#### `features`

* `simpleInflection` — Use simplified inflection (e.g. `fooByBarId`)
* `oppositeBaseNames` — Enable smart reverse relation names
* `postgis` — Enable PostGIS and filter plugin

#### `cdn`

* `bucketName` — Required for upload plugin (S3 or MinIO)
* `awsRegion` — AWS region
* `awsAccessKey` — Access key for upload
* `awsSecretKey` — Secret key
* `minioEndpoint` — Optional override for MinIO compatibility

## 🔌 Included Plugins

* `postgraphile-plugin-connection-filter`
* `@pyramation/postgraphile-plugin-fulltext-filter`
* `@pyramation/postgis`
* `postgraphile-plugin-connection-filter-postgis`
* `postgraphile-derived-upload-field`
* `graphile-simple-inflector`
* `graphile-i18n`
* `graphile-meta-schema`
* `@graphile-contrib/pg-many-to-many`
* `graphile-search-plugin`
* `./plugins/types` (custom LaunchQL plugin)

## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
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

* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

