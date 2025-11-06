# @launchql/templatizer

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/templatizer"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Ftemplatizer%2Fpackage.json"/></a>
</p>

Template compilation and rendering system for LaunchQL boilerplates. Compiles template directories into executable function arrays with variable substitution support.

This package is used by the `lql init` command to generate new workspace and module projects from boilerplate templates. It supports loading templates from local paths or GitHub repositories.

## Installation

```sh
npm install @launchql/templatizer
```

## Features

- **Template Compilation**: Convert boilerplate directories into compiled template functions
- **Variable Substitution**: Support for `__VARIABLE__` style placeholders in file paths and content
- **Custom Template Sources**: Load templates from local paths or GitHub repositories
- **Type Safety**: Full TypeScript support with type definitions

## Usage

### Using Pre-compiled Templates

```typescript
import { workspaceTemplate, writeRenderedTemplates } from '@launchql/templatizer';

const vars = {
  MODULENAME: 'my-workspace',
  USERNAME: 'myuser',
  USERFULLNAME: 'My Name',
  USEREMAIL: 'my@email.com'
};

writeRenderedTemplates(workspaceTemplate, './output-dir', vars);
```

### Loading Templates from Custom Sources

```typescript
import { loadTemplates, writeRenderedTemplates, TemplateSource } from '@launchql/templatizer';

// Load from local path
const localSource: TemplateSource = {
  type: 'local',
  path: './custom-templates/workspace'
};

const templates = loadTemplates(localSource, 'workspace');
const rendered = templates.map(t => t.render);
writeRenderedTemplates(rendered, './output-dir', vars);

// Load from GitHub repository
const githubSource: TemplateSource = {
  type: 'github',
  path: 'owner/repo',
  branch: 'main' // optional, defaults to 'main'
};

const githubTemplates = loadTemplates(githubSource, 'workspace');
const githubRendered = githubTemplates.map(t => t.render);
writeRenderedTemplates(githubRendered, './output-dir', vars);
```

### Compiling Templates

```typescript
import { compileTemplatesToFunctions } from '@launchql/templatizer';

const templates = compileTemplatesToFunctions('./boilerplates/module');
// Returns CompiledTemplate[] with render functions
```

## Template Variable Format

Templates use the `__VARIABLE__` format for variable substitution in both file paths and content:

- **File paths**: `__MODULENAME__/package.json` → `my-module/package.json`
- **File content**: `"name": "__MODULENAME__"` → `"name": "my-module"`

Variables are replaced at render time with values from the `vars` object passed to `writeRenderedTemplates()`.

## API

### `compileTemplatesToFunctions(srcDir: string): CompiledTemplate[]`

Compiles all files in a directory into template functions.

### `writeRenderedTemplates(templates: Func[], outDir: string, vars: Record<string, any>): void`

Renders compiled templates and writes them to the output directory.

### `loadTemplates(source: TemplateSource, templateType: 'workspace' | 'module'): CompiledTemplate[]`

Loads templates from a local path or GitHub repository.

### `TemplateSource`

```typescript
interface TemplateSource {
  type: 'local' | 'github';
  path: string;
  branch?: string; // Optional, for GitHub sources
}
```

## Scripts

- `makeTemplates`: Compiles boilerplates from `boilerplates/` directory into `src/generated/` TypeScript files
- `generate`: Test script to render templates with sample variables

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

* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
