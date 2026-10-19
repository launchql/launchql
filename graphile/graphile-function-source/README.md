# graphile-function-source

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-function-source"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-function-source%2Fpackage.json"/></a>
</p>

Author PostgreSQL functions from `CREATE FUNCTION` source text in PostGraphile v5.

Adds one mutation, `createFunctionFromSource(input: { databaseId, schemaId, source, apiExposed })`, to schemas that expose an insertable `metaschema_public.function` table. The server parses `source` with [`plpgsql-parser`](https://www.npmjs.com/package/plpgsql-parser), maps it onto the table's columns (`name`, `kind`, `arguments`, `returns`, `volatility`, `is_strict`, `security_invoker`, and the hydrated `body_ast`), and inserts the row on the request's own client — so RLS, triggers and validators decide exactly as they do for `createFunction`.

Parse failures are GraphQL errors with `extensions.code = 'FUNCTION_SOURCE_PARSE_ERROR'` and, when the parser reports one, `extensions.position` (0-based offset into `source`). Constructs the table cannot represent are refused with `FUNCTION_SOURCE_UNSUPPORTED`.

## Usage

```ts
import { FunctionFromSourcePreset } from 'graphile-function-source';

const preset = {
  extends: [FunctionFromSourcePreset]
};
```

`parseFunctionSource(source)` is exported for parsing without GraphQL.
