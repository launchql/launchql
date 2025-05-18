# @launchql/content-type-stream

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/content-type-stream"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fcontent-type-stream%2Fpackage.json"/></a>
</p>

```sh
npm install @launchql/content-type-stream
```

In my life I've always found that `content-type`s or mimetypes to be totally hacky and different across operating systems and browsers. Also, knowing when to use the magic bytes compared to how we actually use files based on their extensions is never consistent... so this is aimed to make all that simple :)

## content-type info

get proper content-type information via streams without ever writing to disk

```js
const readStream = createReadStream(filename);
const { stream, magic, contentType } = await streamContentType({
   readStream,
   filename
});
```

## using steams

the `stream` it returns can then be used, for example

```js
  const { stream, contentType } = await streamContentType({
    readStream,
    filename
  });
  return await asyncUpload({
    key,
    contentType,
    readStream: stream,
    bucket
  });
```

## contents hash stream

if you want more info with your upload, with `ContentStream` you can get nice hashes

* `uuid`: RFC-compliant UUID v5.
* `etag`: Etag/S3 MD5 sum
* `sha`: A sha sum

```js
    const contentStream = new ContentStream();
// ...
    readStream.pipe(contentStream);
    contentStream.pipe(uploadStream);
```

```js
   { 
        uuid: '78160718-8dfa-5cb4-bb50-e479c8c58383',
        sha: 'e6c7c64d292a414941d239c57117b36f24c9f829',
        etag: '64dcb5b3b291074d02c80f600fda3f6e'
    }
```

## Related

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): Provides isolated PostgreSQL testing environments with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): Graphile-focused test helpers for mocking authentication and emulating row-level security contexts.

### 🧠 Parsing & AST

* [launchql/pgsql-parser](https://github.com/launchql/pgsql-parser): A Node.js PostgreSQL parser/deparser that interprets and converts PostgreSQL syntax.
* [launchql/libpg-query-node](https://github.com/launchql/libpg-query-node): Node.js bindings for `libpg_query`, converting SQL into parse trees.
* [@pgsql/enums](https://github.com/launchql/pgsql-parser/tree/main/packages/enums): PostgreSQL AST enums in TypeScript for safe and ergonomic parsing logic.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): TypeScript definitions for PostgreSQL AST nodes.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): AST utility functions for constructing and transforming PostgreSQL syntax trees.
* [launchql/pg-ast](https://github.com/launchql/launchql/tree/main/packages/pg-ast): Low-level AST tools and transformations for Postgres query structures.
* [launchql/pg-query-context](https://github.com/launchql/launchql/tree/main/packages/pg-query-context): Lightweight wrapper to inject session-local context (e.g., `SET LOCAL`) into queries—ideal for setting `role`, `jwt.claims`, and other session settings.

### 🚀 API & Dev Tools

* [launchql/server](https://github.com/launchql/launchql/tree/main/packages/server): Express-based server powered by PostGraphile to expose a secure, scalable GraphQL API over your Postgres database.
* [launchql/explorer](https://github.com/launchql/launchql/tree/main/packages/explorer): Visual GraphiQL explorer for browsing across all databases and schemas—useful for debugging, documentation, and API prototyping.

### 🔁 Streaming & Uploads

* [launchql/s3-streamer](https://github.com/launchql/launchql/tree/main/packages/s3-streamer): Stream large files directly to S3 with support for metadata injection and content validation.
* [launchql/etag-hash](https://github.com/launchql/launchql/tree/main/packages/etag-hash): Create S3-compatible ETags by streaming and hashing file uploads in chunks.
* [launchql/etag-stream](https://github.com/launchql/launchql/tree/main/packages/etag-stream): Node stream transformer that computes ETags during upload or transfer.
* [launchql/uuid-hash](https://github.com/launchql/launchql/tree/main/packages/uuid-hash): Generate UUIDs deterministically from hashed content, great for deduplication and asset referencing.
* [launchql/uuid-stream](https://github.com/launchql/launchql/tree/main/packages/uuid-stream): Streaming UUID generation based on piped file content—ideal for upload pipelines.
* [launchql/upload-names](https://github.com/launchql/launchql/tree/main/packages/upload-names): Utility for generating structured and collision-resistant file names for uploads.

### 🧰 CLI & Codegen

* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): Command-line tool for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): Generate GraphQL mutations and queries dynamically from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): A robust TypeScript-based SQL query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): Fluent GraphQL query and mutation builder for PostGraphile schemas. ⚡ Schema-aware via introspection, ✅ prevents common syntax issues, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

